import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { RedisService } from '../common/database/redis.service';
import { QueuePredictionAgent } from '../queue-agent/queue-prediction.agent';
import { Slot, BookingStatus } from '@prisma/client';

interface RecommendationInput {
  farmerId: string;
  cropId: string;
  centerId: string;
  date: Date;
}

interface SlotRecommendation {
  slot: Slot;
  score: number;
  rank: number;
  reason: string;
  estimatedWait: number;
  crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface RecommendationResult {
  recommendations: SlotRecommendation[];
  explanation: string[];
}

@Injectable()
export class SlotRecommendationAgent {
  private readonly logger = new Logger(SlotRecommendationAgent.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queuePredictionAgent: QueuePredictionAgent,
  ) {}

  async recommend(input: RecommendationInput): Promise<RecommendationResult> {
    const { farmerId, cropId, centerId, date } = input;

    const farmer = await this.prisma.farmer.findUnique({
      where: { id: farmerId },
      include: { user: true },
    });

    if (!farmer) {
      throw new Error('Farmer not found');
    }

    const schedule = await this.prisma.schedule.findFirst({
      where: {
        centerId,
        cropId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        isActive: true,
      },
      include: {
        slots: {
          where: { isActive: true },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!schedule || !schedule.slots.length) {
      return { recommendations: [], explanation: ['No available slots for this crop and date'] };
    }

    const queuePrediction = await this.queuePredictionAgent.predict({ centerId, date });
    const crowdPrediction = await this.getCrowdLevel(centerId, date);

    const recommendations: SlotRecommendation[] = [];

    for (let i = 0; i < schedule.slots.length; i++) {
      const slot = schedule.slots[i];
      const availableCapacity = slot.capacity - slot.bookedCount;

      if (availableCapacity <= 0) continue;

      const slotWaitTime = this.estimateSlotWaitTime(slot, queuePrediction, i, schedule.slots.length);
      const score = this.calculateSlotScore(slot, slotWaitTime, crowdPrediction, farmer);

      recommendations.push({
        slot,
        score,
        rank: 0,
        reason: this.generateReason(slot, slotWaitTime, crowdPrediction, availableCapacity),
        estimatedWait: slotWaitTime,
        crowdLevel: crowdPrediction,
      });
    }

    recommendations.sort((a, b) => b.score - a.score);
    recommendations.forEach((r, i) => { r.rank = i + 1; });

    const topRecommendations = recommendations.slice(0, 3);

    return {
      recommendations: topRecommendations,
      explanation: [
        `Found ${recommendations.length} available slots`,
        `Current queue prediction: ${queuePrediction.estimatedWaitMinutes} min wait`,
        `Expected crowd level: ${crowdPrediction}`,
        'Slots ranked by wait time, crowd level, and availability',
      ],
    };
  }

  private estimateSlotWaitTime(slot: Slot, queuePrediction: any, slotIndex: number, totalSlots: number): number {
    const baseWait = queuePrediction.estimatedWaitMinutes;
    const slotPositionFactor = 1 + (slotIndex / totalSlots) * 0.5;
    return Math.round(baseWait * slotPositionFactor);
  }

  private calculateSlotScore(slot: Slot, waitTime: number, crowdLevel: string, farmer: any): number {
    let score = 100;

    score -= waitTime * 0.5;

    switch (crowdLevel) {
      case 'LOW': score += 20; break;
      case 'MEDIUM': score += 10; break;
      case 'HIGH': score -= 10; break;
      case 'CRITICAL': score -= 30; break;
    }

    const availabilityRatio = (slot.capacity - slot.bookedCount) / slot.capacity;
    score += availabilityRatio * 15;

    if (slot.startTime >= '09:00' && slot.startTime <= '11:00') {
      score += 5;
    }

    return Math.max(0, score);
  }

  private generateReason(slot: Slot, waitTime: number, crowdLevel: string, availableCapacity: number): string {
    const reasons: string[] = [];

    if (waitTime <= 15) reasons.push('Low expected wait time');
    else if (waitTime <= 30) reasons.push('Moderate expected wait time');
    else reasons.push('Higher expected wait time');

    if (crowdLevel === 'LOW') reasons.push('Low crowd expected');
    else if (crowdLevel === 'MEDIUM') reasons.push('Moderate crowd expected');
    else reasons.push('High crowd expected');

    reasons.push(`${availableCapacity} of ${slot.capacity} slots available`);

    return reasons.join('. ') + '.';
  }

  private async getCrowdLevel(centerId: string, date: Date): Promise<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> {
    const bookings = await this.prisma.booking.count({
      where: {
        centerId,
        scheduledDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: { not: BookingStatus.CANCELLED },
      },
    });

    const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
    if (!center) return 'MEDIUM';

    const utilization = center.capacityPerDay > 0 ? (bookings / center.capacityPerDay) * 100 : 0;

    if (utilization >= 90) return 'CRITICAL';
    if (utilization >= 70) return 'HIGH';
    if (utilization >= 40) return 'MEDIUM';
    return 'LOW';
  }
}