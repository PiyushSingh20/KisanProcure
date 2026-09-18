import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { RedisService } from '../common/database/redis.service';
import { QueuePredictionAgent } from '../queue-agent/queue-prediction.agent';
import { ProcurementCenter, CenterStatus } from '@prisma/client';

interface RecommendationInput {
  farmerId: string;
  cropId: string;
  date: Date;
  latitude?: number;
  longitude?: number;
}

interface CenterRecommendation {
  center: ProcurementCenter;
  score: number;
  rank: number;
  distance: number;
  estimatedWait: number;
  availableSlots: number;
  crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
}

interface RecommendationResult {
  recommendations: CenterRecommendation[];
  explanation: string[];
}

const DISTANCE_WEIGHT = 0.3;
const QUEUE_WEIGHT = 0.25;
const AVAILABILITY_WEIGHT = 0.25;
const WAIT_TIME_WEIGHT = 0.2;

@Injectable()
export class CenterRecommendationAgent {
  private readonly logger = new Logger(CenterRecommendationAgent.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queuePredictionAgent: QueuePredictionAgent,
  ) {}

  async recommend(input: RecommendationInput): Promise<RecommendationResult> {
    const { farmerId, cropId, date, latitude, longitude } = input;

    const centers = await this.prisma.procurementCenter.findMany({
      where: {
        status: CenterStatus.ACTIVE,
        centerCrops: { some: { id: cropId } },
        deletedAt: null,
      },
      include: {
        counters: true,
        schedules: {
          where: {
            cropId,
            date: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
            isActive: true,
          },
          include: { slots: { where: { isActive: true } } },
        },
      },
    });

    if (!centers.length) {
      return { recommendations: [], explanation: ['No centers available for this crop on this date'] };
    }

    const recommendations: CenterRecommendation[] = [];

    for (const center of centers) {
      const distance = this.calculateDistance(latitude ?? 0, longitude ?? 0, center.latitude ?? 0, center.longitude ?? 0);
      const queuePrediction = await this.queuePredictionAgent.predict({ centerId: center.id, date });
      const availableSlots = this.getTotalAvailableSlots(center.schedules || []);
      const crowdLevel = await this.getCrowdLevel(center.id, date);

      const score = this.calculateCenterScore(
        distance,
        queuePrediction.estimatedWaitMinutes,
        availableSlots,
        crowdLevel,
      );

      recommendations.push({
        center,
        score,
        rank: 0,
        distance: Math.round(distance * 10) / 10,
        estimatedWait: queuePrediction.estimatedWaitMinutes,
        availableSlots,
        crowdLevel,
        reason: this.generateCenterReason(center, distance, queuePrediction.estimatedWaitMinutes, availableSlots, crowdLevel),
      });
    }

    recommendations.sort((a, b) => b.score - a.score);
    recommendations.forEach((r, i) => { r.rank = i + 1; });

    return {
      recommendations: recommendations.slice(0, 5),
      explanation: [
        `Found ${centers.length} centers for this crop`,
        `Ranked by distance (${DISTANCE_WEIGHT * 100}%), queue (${QUEUE_WEIGHT * 100}%), availability (${AVAILABILITY_WEIGHT * 100}%), wait time (${WAIT_TIME_WEIGHT * 100}%)`,
        'Weights are configurable',
        'Farmer location is not stored or shared',
      ],
    };
  }

  private calculateDistance(lat1?: number, lng1?: number, lat2?: number, lng2?: number): number {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 50;

    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getTotalAvailableSlots(schedules: any[]): number {
    let total = 0;
    for (const schedule of schedules) {
      for (const slot of schedule.slots) {
        total += slot.capacity - slot.bookedCount;
      }
    }
    return total;
  }

  private async getCrowdLevel(centerId: string, date: Date): Promise<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> {
    const bookings = await this.prisma.booking.count({
      where: {
        centerId,
        scheduledDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: { not: 'CANCELLED' },
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

  private calculateCenterScore(
    distance: number,
    estimatedWait: number,
    availableSlots: number,
    crowdLevel: string,
  ): number {
    let score = 100;

    if (distance <= 10) score -= distance * 0.5;
    else if (distance <= 30) score -= 5 + (distance - 10) * 0.3;
    else score -= 11 + (distance - 30) * 0.2;

    score -= estimatedWait * QUEUE_WEIGHT * 2;

    score += Math.min(availableSlots * 2, 30) * AVAILABILITY_WEIGHT;

    switch (crowdLevel) {
      case 'LOW': score += 15 * WAIT_TIME_WEIGHT; break;
      case 'MEDIUM': score += 5 * WAIT_TIME_WEIGHT; break;
      case 'HIGH': score -= 10 * WAIT_TIME_WEIGHT; break;
      case 'CRITICAL': score -= 25 * WAIT_TIME_WEIGHT; break;
    }

    return Math.max(0, score);
  }

  private generateCenterReason(
    center: ProcurementCenter,
    distance: number,
    waitTime: number,
    availableSlots: number,
    crowdLevel: string,
  ): string {
    const reasons: string[] = [];

    if (distance <= 10) reasons.push(`${distance.toFixed(1)} km away (very close)`);
    else if (distance <= 30) reasons.push(`${distance.toFixed(1)} km away`);
    else reasons.push(`${distance.toFixed(1)} km away (far)`);

    reasons.push(`${waitTime} min estimated wait`);
    reasons.push(`${availableSlots} slots available`);
    reasons.push(`${crowdLevel} crowd level`);

    return reasons.join('. ') + '.';
  }
}