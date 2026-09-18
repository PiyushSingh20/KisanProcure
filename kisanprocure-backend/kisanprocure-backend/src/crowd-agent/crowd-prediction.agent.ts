import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { BookingStatus } from '@prisma/client';

interface PredictionInput {
  centerId: string;
  date: Date;
}

interface PredictionResult {
  crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedQueueLength: number;
  expectedWaitTime: number;
  recommendedStaffing: number;
  confidence: number;
  factors: string[];
}

@Injectable()
export class CrowdPredictionAgent {
  private readonly logger = new Logger(CrowdPredictionAgent.name);

  constructor(private prisma: PrismaService) {}

  async predict(input: PredictionInput): Promise<PredictionResult> {
    const { centerId, date } = input;

    const center = await this.prisma.procurementCenter.findUnique({
      where: { id: centerId },
      include: { counters: true },
    });

    if (!center) {
      throw new Error('Center not found');
    }

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const month = date.getMonth() + 1;

    const historicalBookings = await this.getHistoricalBookings(centerId, dayOfWeek, month);
    const currentBookings = await this.getCurrentBookings(centerId, date);
    const cropSeasonality = await this.getCropSeasonality(centerId, month);
    const previousAttendance = await this.getPreviousAttendance(centerId, date);

    const expectedFarmers = this.calculateExpectedFarmers(
      historicalBookings,
      currentBookings,
      cropSeasonality,
      previousAttendance,
      isWeekend,
    );

    const activeCounters = center.counters.filter(c => c.isActive).length;
    const avgProcessingTime = await this.getAverageProcessingTime(centerId);

    const expectedQueueLength = Math.max(0, expectedFarmers - activeCounters * 8);
    const expectedWaitTime = activeCounters > 0 ? (expectedQueueLength * avgProcessingTime) / activeCounters : expectedQueueLength * avgProcessingTime;
    const utilization = center.capacityPerDay > 0 ? (expectedFarmers / center.capacityPerDay) * 100 : 0;

    let crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (utilization >= 90) crowdLevel = 'CRITICAL';
    else if (utilization >= 70) crowdLevel = 'HIGH';
    else if (utilization >= 40) crowdLevel = 'MEDIUM';
    else crowdLevel = 'LOW';

    const recommendedStaffing = Math.ceil(expectedFarmers / 40);

    const factors: string[] = [
      `Day of week: ${this.getDayName(dayOfWeek)} (${isWeekend ? 'weekend' : 'weekday'})`,
      `Historical avg bookings: ${historicalBookings.toFixed(1)}`,
      `Current bookings: ${currentBookings}`,
      `Crop seasonality factor: ${cropSeasonality.toFixed(2)}`,
      `Previous attendance rate: ${(previousAttendance * 100).toFixed(1)}%`,
      `Active counters: ${activeCounters}`,
      `Avg processing time: ${avgProcessingTime} min`,
      `Capacity utilization: ${utilization.toFixed(1)}%`,
    ];

    const confidence = this.calculateConfidence(historicalBookings, currentBookings, cropSeasonality);

    return {
      crowdLevel,
      expectedQueueLength: Math.round(expectedQueueLength),
      expectedWaitTime: Math.round(expectedWaitTime),
      recommendedStaffing: Math.max(1, recommendedStaffing),
      confidence: Math.round(confidence * 100) / 100,
      factors,
    };
  }

  private async getHistoricalBookings(centerId: string, dayOfWeek: number, month: number): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookings = await this.prisma.booking.groupBy({
      by: ['scheduledDate'],
      where: {
        centerId,
        scheduledDate: { gte: thirtyDaysAgo },
        status: { not: BookingStatus.CANCELLED },
      },
      _count: true,
    });

    const sameDayBookings = bookings.filter(b => {
      const d = new Date(b.scheduledDate);
      return d.getDay() === dayOfWeek && d.getMonth() + 1 === month;
    });

    if (sameDayBookings.length === 0) return centerId ? 20 : 0;

    return sameDayBookings.reduce((sum, b) => sum + b._count, 0) / sameDayBookings.length;
  }

  private async getCurrentBookings(centerId: string, date: Date): Promise<number> {
    return this.prisma.booking.count({
      where: {
        centerId,
        scheduledDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: { not: BookingStatus.CANCELLED },
      },
    });
  }

  private async getCropSeasonality(centerId: string, month: number): Promise<number> {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        centerId,
        date: {
          gte: new Date(new Date().getFullYear(), month - 1, 1),
          lt: new Date(new Date().getFullYear(), month, 1),
        },
        isActive: true,
      },
    });

    if (schedules.length === 0) return 1.0;

    const totalSlots = schedules.reduce((sum, s) => sum + s.maxTokens, 0);
    const activeSlots = schedules.filter(s => s.isActive).reduce((sum, s) => sum + s.maxTokens, 0);

    return activeSlots / Math.max(totalSlots, 1);
  }

  private async getPreviousAttendance(centerId: string, date: Date): Promise<number> {
    const pastDates: Date[] = [];
    for (let i = 1; i <= 4; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() - i * 7);
      pastDates.push(d);
    }

    let totalBooked = 0;
    let totalAttended = 0;

    for (const d of pastDates) {
      const bookings = await this.prisma.booking.count({
        where: {
          centerId,
          scheduledDate: {
            gte: new Date(d.setHours(0, 0, 0, 0)),
            lt: new Date(d.setHours(23, 59, 59, 999)),
          },
          status: { not: BookingStatus.CANCELLED },
        },
      });

      const tokens = await this.prisma.token.count({
        where: {
          centerId,
          createdAt: {
            gte: new Date(d.setHours(0, 0, 0, 0)),
            lt: new Date(d.setHours(23, 59, 59, 999)),
          },
          status: { in: ['ARRIVED', 'QUALITY_CHECK', 'WEIGHMENT', 'PROCUREMENT_COMPLETED', 'PAYMENT_COMPLETED'] },
        },
      });

      totalBooked += bookings;
      totalAttended += tokens;
    }

    return totalBooked > 0 ? totalAttended / totalBooked : 0.8;
  }

  private calculateExpectedFarmers(
    historicalAvg: number,
    currentBookings: number,
    cropSeasonality: number,
    attendanceRate: number,
    isWeekend: boolean,
  ): number {
    let expected = historicalAvg * 0.4 + currentBookings * 0.6;
    expected *= cropSeasonality;
    expected *= attendanceRate;

    if (isWeekend) {
      expected *= 1.2;
    }

    return expected;
  }

  private async getAverageProcessingTime(centerId: string): Promise<number> {
    const completedTokens = await this.prisma.token.findMany({
      where: {
        centerId,
        status: { in: ['PROCUREMENT_COMPLETED', 'PAYMENT_COMPLETED'] },
        calledAt: { not: null },
        completedAt: { not: null },
      },
      take: 100,
      orderBy: { completedAt: 'desc' },
    });

    if (completedTokens.length === 0) return 10;

    const totalMinutes = completedTokens.reduce((sum, t) => {
      if (t.calledAt && t.completedAt) {
        return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    return Math.round(totalMinutes / completedTokens.length);
  }

  private calculateConfidence(historicalAvg: number, currentBookings: number, cropSeasonality: number): number {
    let confidence = 0.5;

    if (historicalAvg > 10) confidence += 0.2;
    if (currentBookings > 5) confidence += 0.2;
    if (cropSeasonality > 0.5) confidence += 0.1;

    return Math.min(confidence, 0.95);
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }
}