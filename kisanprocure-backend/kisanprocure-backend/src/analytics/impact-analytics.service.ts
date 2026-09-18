import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class ImpactAnalyticsService {
  private readonly logger = new Logger(ImpactAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async calculateImpactMetrics(): Promise<any> {
    const [
      totalFarmers,
      totalTokens,
      completedTokens,
      avgWaitTimeBefore,
      avgWaitTimeAfter,
      totalProcured,
      totalAmount,
      noShowRate,
      centerUtilization,
      slotUtilization,
    ] = await Promise.all([
      this.prisma.farmer.count(),
      this.prisma.token.count(),
      this.prisma.token.count({ where: { status: { in: ['PROCUREMENT_COMPLETED', 'PAYMENT_COMPLETED'] } } }),
      this.getEstimatedWaitTimeBefore(),
      this.getAverageWaitTimeAfter(),
      this.prisma.procurementRecord.aggregate({ _sum: { quantity: true, totalAmount: true } }),
      this.prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      this.getNoShowRate(),
      this.getCenterUtilization(),
      this.getSlotUtilization(),
    ]);

    const waitTimeReduction = avgWaitTimeBefore - avgWaitTimeAfter;
    const waitTimeReductionPercent = avgWaitTimeBefore > 0 ? (waitTimeReduction / avgWaitTimeBefore) * 100 : 0;

    const estimatedVisitsAvoided = this.estimateVisitsAvoided(totalFarmers, waitTimeReduction);

    return {
      farmersServed: totalFarmers,
      tokensProcessed: totalTokens,
      completedProcurements: completedTokens,
      estimatedWaitTimeReduction: {
        beforeMinutes: Math.round(avgWaitTimeBefore),
        afterMinutes: Math.round(avgWaitTimeAfter),
        reductionMinutes: Math.round(waitTimeReduction),
        reductionPercent: Math.round(waitTimeReductionPercent * 100) / 100,
        note: 'Estimated based on system data. Actual field validation required.',
      },
      estimatedUnnecessaryVisitsAvoided: {
        count: estimatedVisitsAvoided,
        note: 'Estimated based on wait time reduction. Actual field validation required.',
      },
      procurement: {
        totalQuantity: totalProcured._sum.quantity || 0,
        totalValue: totalProcured._sum.totalAmount || 0,
        totalPaid: totalAmount._sum.amount || 0,
      },
      operationalMetrics: {
        noShowRate: Math.round(noShowRate * 100) / 100,
        centerUtilization: Math.round(centerUtilization * 100) / 100,
        slotUtilization: Math.round(slotUtilization * 100) / 100,
      },
      disclaimer: 'All impact metrics are estimates based on system data. Real-world impact requires field validation with actual farmer surveys and operational data.',
    };
  }

  private async getEstimatedWaitTimeBefore(): Promise<number> {
    const completedTokens = await this.prisma.token.findMany({
      where: {
        status: { in: ['PROCUREMENT_COMPLETED', 'PAYMENT_COMPLETED'] },
        calledAt: { not: null },
        completedAt: { not: null },
      },
      take: 1000,
      orderBy: { completedAt: 'desc' },
    });

    if (completedTokens.length === 0) {
      return 120;
    }

    const totalMinutes = completedTokens.reduce((sum, t) => {
      if (t.calledAt && t.completedAt) {
        return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    return totalMinutes / completedTokens.length;
  }

  private async getAverageWaitTimeAfter(): Promise<number> {
    const recentTokens = await this.prisma.token.findMany({
      where: {
        status: { in: ['PROCUREMENT_COMPLETED', 'PAYMENT_COMPLETED'] },
        calledAt: { not: null },
        completedAt: { not: null, gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      take: 500,
      orderBy: { completedAt: 'desc' },
    });

    if (recentTokens.length === 0) {
      return 35;
    }

    const totalMinutes = recentTokens.reduce((sum, t) => {
      if (t.calledAt && t.completedAt) {
        return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    return totalMinutes / recentTokens.length;
  }

  private estimateVisitsAvoided(totalFarmers: number, waitTimeReduction: number): number {
    if (waitTimeReduction <= 0) return 0;
    const visitsPerFarmerPerSeason = 2;
    const avoidanceFactor = Math.min(waitTimeReduction / 60, 0.5);
    return Math.round(totalFarmers * visitsPerFarmerPerSeason * avoidanceFactor);
  }

  private async getNoShowRate(): Promise<number> {
    const totalTokens = await this.prisma.token.count();
    const noShows = await this.prisma.token.count({ where: { status: 'NO_SHOW' } });
    return totalTokens > 0 ? (noShows / totalTokens) * 100 : 0;
  }

  private async getCenterUtilization(): Promise<number> {
    const centers = await this.prisma.procurementCenter.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, capacityPerDay: true },
    });

    if (centers.length === 0) return 0;

    let totalUtilization = 0;
    for (const center of centers) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const bookings = await this.prisma.booking.count({
        where: { centerId: center.id, scheduledDate: { gte: today, lt: tomorrow } },
      });

      totalUtilization += center.capacityPerDay > 0 ? (bookings / center.capacityPerDay) * 100 : 0;
    }

    return totalUtilization / centers.length;
  }

  private async getSlotUtilization(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const slots = await this.prisma.slot.findMany({
      where: { schedule: { date: { gte: today, lt: tomorrow }, isActive: true } },
      select: { capacity: true, bookedCount: true },
    });

    if (slots.length === 0) return 0;

    const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);
    const totalBooked = slots.reduce((sum, s) => sum + s.bookedCount, 0);

    return totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;
  }

  async getFarmerImpact(farmerId: string): Promise<any> {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) {
      throw new Error('Farmer not found');
    }

    const [tokens, procurements, payments] = await Promise.all([
      this.prisma.token.findMany({ where: { farmerId }, select: { status: true, estimatedWait: true, calledAt: true, completedAt: true } }),
      this.prisma.procurementRecord.findMany({ where: { farmerId }, select: { quantity: true, totalAmount: true } }),
      this.prisma.payment.findMany({ where: { farmerId }, select: { amount: true, status: true } }),
    ]);

    const completedTokens = tokens.filter(t => t.status === 'PAYMENT_COMPLETED' && t.calledAt && t.completedAt);
    const avgWaitTime = completedTokens.length > 0
      ? completedTokens.reduce((sum, t) => sum + (t.completedAt!.getTime() - t.calledAt!.getTime()) / (1000 * 60), 0) / completedTokens.length
      : 0;

    const totalProcured = procurements.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalAmount = procurements.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);

    return {
      farmerId,
      farmerCode: farmer.farmerCode,
      tokensGenerated: tokens.length,
      completedProcurements: completedTokens.length,
      avgWaitTime: Math.round(avgWaitTime),
      totalProcuredQuantity: totalProcured,
      totalProcurementValue: totalAmount,
      totalPaid,
      estimatedTimeSaved: tokens.length > 0 ? Math.round((120 - avgWaitTime) * tokens.length) : 0,
      disclaimer: 'Individual impact metrics are estimates based on system data.',
    };
  }
}