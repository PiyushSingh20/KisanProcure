import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { TokenStatus, BookingStatus } from '@prisma/client';

interface AnalysisInput {
  centerId: string;
  date?: Date;
}

interface OperationalRecommendation {
  type: 'QUEUE_BUILDUP' | 'CAPACITY_EXCEEDED' | 'LOW_PROCESSING_SPEED' | 'HIGH_NO_SHOW' | 'PEAK_HOURS' | 'COUNTER_UTILIZATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  recommendedAction: string;
  estimatedImpact: string;
}

interface AnalysisResult {
  centerId: string;
  date: Date;
  recommendations: OperationalRecommendation[];
  metrics: {
    currentQueue: number;
    expectedArrivals: number;
    processingSpeed: number;
    noShowRate: number;
    counterUtilization: number;
    peakHours: number[];
  };
  summary: string;
}

@Injectable()
export class ProcurementOperationsAgent {
  private readonly logger = new Logger(ProcurementOperationsAgent.name);

  constructor(private prisma: PrismaService) {}

  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    const { centerId, date = new Date() } = input;

    const center = await this.prisma.procurementCenter.findUnique({
      where: { id: centerId },
      include: { counters: true },
    });

    if (!center) {
      throw new Error('Center not found');
    }

    const activeCounters = center.counters.filter(c => c.isActive).length;
    const currentQueue = await this.prisma.queueEntry.count({ where: { centerId } });
    const expectedArrivals = await this.getExpectedArrivals(centerId, date);
    const processingSpeed = await this.getProcessingSpeed(centerId);
    const noShowRate = await this.getNoShowRate(centerId, date);
    const counterUtilization = await this.getCounterUtilization(centerId);
    const peakHours = await this.getPeakHours(centerId, date);

    const recommendations: OperationalRecommendation[] = [];

    if (currentQueue > activeCounters * 10) {
      recommendations.push({
        type: 'QUEUE_BUILDUP',
        severity: currentQueue > activeCounters * 20 ? 'CRITICAL' : 'HIGH',
        title: 'Queue Buildup Detected',
        description: `Current queue has ${currentQueue} farmers with only ${activeCounters} active counters.`,
        recommendedAction: 'Consider opening additional counters or extending operating hours.',
        estimatedImpact: `Could reduce wait time by ${Math.round(currentQueue / activeCounters * 0.5)} minutes per farmer.`,
      });
    }

    const expectedUtilization = (expectedArrivals / center.capacityPerDay) * 100;
    if (expectedUtilization > 90) {
      recommendations.push({
        type: 'CAPACITY_EXCEEDED',
        severity: 'CRITICAL',
        title: 'Center Capacity Near Limit',
        description: `Expected ${expectedArrivals} farmers today vs capacity of ${center.capacityPerDay} (${expectedUtilization.toFixed(1)}%).`,
        recommendedAction: 'Open additional counters, consider overflow center, or redirect to nearby centers.',
        estimatedImpact: 'Prevents overcrowding and excessive wait times.',
      });
    } else if (expectedUtilization > 70) {
      recommendations.push({
        type: 'CAPACITY_EXCEEDED',
        severity: 'HIGH',
        title: 'High Capacity Utilization Expected',
        description: `Expected ${expectedArrivals} farmers today (${expectedUtilization.toFixed(1)}% of capacity).`,
        recommendedAction: 'Prepare additional staff and consider opening reserve counters.',
        estimatedImpact: 'Maintains manageable wait times.',
      });
    }

    if (processingSpeed > 15) {
      recommendations.push({
        type: 'LOW_PROCESSING_SPEED',
        severity: processingSpeed > 25 ? 'HIGH' : 'MEDIUM',
        title: 'Slow Processing Speed',
        description: `Average processing time is ${processingSpeed} minutes per farmer.`,
        recommendedAction: 'Review quality check and weighment procedures. Consider additional training or equipment.',
        estimatedImpact: `Reducing to 10 min could serve ${Math.round(activeCounters * 60 / 10 * 8)} more farmers per day.`,
      });
    }

    if (noShowRate > 20) {
      recommendations.push({
        type: 'HIGH_NO_SHOW',
        severity: noShowRate > 30 ? 'HIGH' : 'MEDIUM',
        title: 'High No-Show Rate',
        description: `${noShowRate.toFixed(1)}% of booked farmers did not show up.`,
        recommendedAction: 'Send appointment reminders 24h and 2h before. Consider overbooking by 10-15%.',
        estimatedImpact: `Could recover ${Math.round(noShowRate / 100 * expectedArrivals)} slots per day.`,
      });
    }

    if (peakHours.length > 0) {
      recommendations.push({
        type: 'PEAK_HOURS',
        severity: 'MEDIUM',
        title: 'Peak Hours Identified',
        description: `Peak arrival hours: ${peakHours.join(', ')}:00.`,
        recommendedAction: 'Schedule additional counters during peak hours. Stagger slot times.',
        estimatedImpact: 'Better distributes farmer arrivals throughout the day.',
      });
    }

    const avgCounterUtilization = counterUtilization.reduce((sum, c) => sum + c.utilization, 0) / counterUtilization.length;
    if (avgCounterUtilization < 50 && activeCounters > 2) {
      recommendations.push({
        type: 'COUNTER_UTILIZATION',
        severity: 'LOW',
        title: 'Low Counter Utilization',
        description: `Average counter utilization is ${avgCounterUtilization.toFixed(1)}%.`,
        recommendedAction: 'Consider closing underutilized counters to save resources.',
        estimatedImpact: 'Reduces operational costs without affecting service.',
      });
    }

    const summary = this.generateSummary(recommendations, currentQueue, expectedArrivals, processingSpeed);

    return {
      centerId,
      date,
      recommendations,
      metrics: {
        currentQueue,
        expectedArrivals,
        processingSpeed,
        noShowRate,
        counterUtilization: avgCounterUtilization,
        peakHours,
      },
      summary,
    };
  }

  private async getExpectedArrivals(centerId: string, date: Date): Promise<number> {
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

    const attendanceRate = await this.getAttendanceRate(centerId);
    return Math.round(bookings * attendanceRate);
  }

  private async getAttendanceRate(centerId: string): Promise<number> {
    const pastDates: Date[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
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

  private async getProcessingSpeed(centerId: string): Promise<number> {
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

  private async getNoShowRate(centerId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const noShows = await this.prisma.token.count({
      where: {
        centerId,
        status: 'NO_SHOW',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const totalExpected = await this.prisma.booking.count({
      where: {
        centerId,
        scheduledDate: { gte: startOfDay, lte: endOfDay },
        status: { not: BookingStatus.CANCELLED },
      },
    });

    return totalExpected > 0 ? (noShows / totalExpected) * 100 : 0;
  }

  private async getCounterUtilization(centerId: string): Promise<{ counterId: string; utilization: number }[]> {
    const counters = await this.prisma.centerCounter.findMany({
      where: { centerId, isActive: true },
      include: { currentToken: true },
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const now = new Date();

    return counters.map(counter => {
      const processedCount = counter.currentToken ? 1 : 0;
      const hoursElapsed = (now.getTime() - startOfDay.getTime()) / (1000 * 60 * 60);
      const maxCapacity = Math.max(1, hoursElapsed * 4);
      return {
        counterId: counter.id,
        utilization: Math.min(100, (processedCount / maxCapacity) * 100),
      };
    });
  }

  private async getPeakHours(centerId: string, date: Date): Promise<number[]> {
    const tokens = await this.prisma.token.findMany({
      where: {
        centerId,
        createdAt: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        arrivedAt: { not: null },
      },
      select: { arrivedAt: true },
    });

    const hourCounts: Record<number, number> = {};
    for (const token of tokens) {
      if (token.arrivedAt) {
        const hour = token.arrivedAt.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    }

    const sortedHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    return sortedHours;
  }

  private generateSummary(
    recommendations: OperationalRecommendation[],
    currentQueue: number,
    expectedArrivals: number,
    processingSpeed: number,
  ): string {
    if (recommendations.length === 0) {
      return `Center operating normally. ${currentQueue} farmers in queue, ${expectedArrivals} expected today. Avg processing: ${processingSpeed} min.`;
    }

    const critical = recommendations.filter(r => r.severity === 'CRITICAL').length;
    const high = recommendations.filter(r => r.severity === 'HIGH').length;

    if (critical > 0) {
      return `⚠️ CRITICAL: ${critical} critical issue(s) detected. Immediate action required.`;
    }
    if (high > 0) {
      return `⚠️ HIGH: ${high} high-priority issue(s) detected. Action recommended today.`;
    }
    return `${recommendations.length} operational recommendation(s) for review.`;
  }
}