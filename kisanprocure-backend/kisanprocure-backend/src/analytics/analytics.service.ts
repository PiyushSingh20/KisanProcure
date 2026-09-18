import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { TokenStatus, ProcurementState, PaymentStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async getSystemOverview(): Promise<any> {
    const [
      totalFarmers,
      totalCenters,
      totalCrops,
      totalBookings,
      totalTokens,
      totalProcurements,
      totalPayments,
      completedPayments,
      pendingPayments,
      totalComplaints,
      openComplaints,
    ] = await Promise.all([
      this.prisma.farmer.count(),
      this.prisma.procurementCenter.count({ where: { status: 'ACTIVE' } }),
      this.prisma.crop.count({ where: { isActive: true } }),
      this.prisma.booking.count(),
      this.prisma.token.count(),
      this.prisma.procurementRecord.count(),
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.COMPLETED } }),
      this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      this.prisma.complaint.count(),
      this.prisma.complaint.count({ where: { status: 'OPEN' } }),
    ]);

    return {
      farmers: totalFarmers,
      centers: totalCenters,
      crops: totalCrops,
      bookings: totalBookings,
      tokens: totalTokens,
      procurements: totalProcurements,
      payments: {
        total: totalPayments,
        completed: completedPayments,
        pending: pendingPayments,
        completionRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
      },
      complaints: {
        total: totalComplaints,
        open: openComplaints,
      },
    };
  }

  async getCenterAnalytics(centerId: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
    const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
    if (!center) {
      throw new Error('Center not found');
    }

    const where: any = { centerId };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [
      bookings,
      tokens,
      procurements,
      payments,
      avgWaitTime,
      noShows,
    ] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.token.count({ where }),
      this.prisma.procurementRecord.findMany({ where, select: { quantity: true, totalAmount: true } }),
      this.prisma.payment.findMany({ where, select: { amount: true, status: true } }),
      this.getAverageWaitTime(centerId, dateFrom, dateTo),
      this.prisma.token.count({ where: { ...where, status: TokenStatus.NO_SHOW } }),
    ]);

    const totalProcured = procurements.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalAmount = procurements.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const completedPayments = payments.filter(p => p.status === PaymentStatus.COMPLETED);
    const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await this.prisma.booking.count({
      where: { centerId, scheduledDate: { gte: today, lt: tomorrow } },
    });

    const activeQueue = await this.prisma.queueEntry.count({ where: { centerId } });

    return {
      centerId,
      centerName: center.name,
      bookings: { total: bookings, today: todayBookings },
      tokens: { total: tokens, noShows },
      procurements: { count: procurements.length, totalQuantity: totalProcured, totalAmount },
      payments: { total: totalPaid, completionRate: tokens > 0 ? (completedPayments.length / tokens) * 100 : 0 },
      avgWaitTime,
      activeQueue,
      utilization: center.capacityPerDay > 0 ? (bookings / center.capacityPerDay) * 100 : 0,
    };
  }

  async getAllCentersAnalytics(dateFrom?: Date, dateTo?: Date): Promise<any[]> {
    const centers = await this.prisma.procurementCenter.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true },
    });

    const analytics = await Promise.all(
      centers.map(c => this.getCenterAnalytics(c.id, dateFrom, dateTo))
    );

    return analytics;
  }

  private async getAverageWaitTime(centerId: string, dateFrom?: Date, dateTo?: Date): Promise<number> {
    const where: any = {
      centerId,
      status: { in: [TokenStatus.PROCUREMENT_COMPLETED, TokenStatus.PAYMENT_COMPLETED] },
      calledAt: { not: null },
      completedAt: { not: null },
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const tokens = await this.prisma.token.findMany({ where, take: 1000 });

    if (tokens.length === 0) return 0;

    const totalMinutes = tokens.reduce((sum, t) => {
      if (t.calledAt && t.completedAt) {
        return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    return Math.round(totalMinutes / tokens.length);
  }

  async getQueueAnalytics(centerId: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
    const where: any = { centerId };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const tokens = await this.prisma.token.findMany({
      where,
      select: { status: true, queuePosition: true, estimatedWait: true, calledAt: true, arrivedAt: true, completedAt: true },
    });

    const statusDistribution = tokens.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgQueuePosition = tokens.length > 0
      ? tokens.reduce((sum, t) => sum + (t.queuePosition || 0), 0) / tokens.length
      : 0;

    const avgEstimatedWait = tokens.length > 0
      ? tokens.reduce((sum, t) => sum + (t.estimatedWait || 0), 0) / tokens.length
      : 0;

    return {
      centerId,
      totalTokens: tokens.length,
      statusDistribution,
      avgQueuePosition: Math.round(avgQueuePosition),
      avgEstimatedWait: Math.round(avgEstimatedWait),
    };
  }

  async getBookingAnalytics(dateFrom?: Date, dateTo?: Date): Promise<any> {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate.gte = dateFrom;
      if (dateTo) where.scheduledDate.lte = dateTo;
    }

    const [bookings, statusDist, cropDist, centerDist] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.groupBy({ by: ['status'], where, _count: true }),
      this.prisma.booking.groupBy({ by: ['cropId'], where, _count: true }),
      this.prisma.booking.groupBy({ by: ['centerId'], where, _count: true }),
    ]);

    return {
      totalBookings: bookings,
      statusDistribution: statusDist.map(s => ({ status: s.status, count: s._count })),
      cropDistribution: cropDist.map(c => ({ cropId: c.cropId, count: c._count })),
      centerDistribution: centerDist.map(c => ({ centerId: c.centerId, count: c._count })),
    };
  }

  async getProcurementAnalytics(dateFrom?: Date, dateTo?: Date): Promise<any> {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [procurements, stateDist, cropDist, centerDist] = await Promise.all([
      this.prisma.procurementRecord.findMany({ where, select: { quantity: true, totalAmount: true, state: true } }),
      this.prisma.procurementRecord.groupBy({ by: ['state'], where, _count: true }),
      this.prisma.procurementRecord.groupBy({ by: ['cropId'], where, _count: true, _sum: { quantity: true, totalAmount: true } }),
      this.prisma.procurementRecord.groupBy({ by: ['centerId'], where, _count: true, _sum: { quantity: true, totalAmount: true } }),
    ]);

    const totalQuantity = procurements.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalAmount = procurements.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    return {
      totalProcurements: procurements.length,
      totalQuantity,
      totalAmount,
      stateDistribution: stateDist.map(s => ({ state: s.state, count: s._count })),
      cropDistribution: cropDist.map(c => ({ cropId: c.cropId, count: c._count, totalQuantity: c._sum.quantity || 0, totalAmount: c._sum.totalAmount || 0 })),
      centerDistribution: centerDist.map(c => ({ centerId: c.centerId, count: c._count, totalQuantity: c._sum.quantity || 0, totalAmount: c._sum.totalAmount || 0 })),
    };
  }

  async getPaymentAnalytics(dateFrom?: Date, dateTo?: Date): Promise<any> {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [payments, statusDist, centerDist] = await Promise.all([
      this.prisma.payment.findMany({ where, select: { amount: true, status: true } }),
      this.prisma.payment.groupBy({ by: ['status'], where, _count: true, _sum: { amount: true } }),
      this.prisma.payment.groupBy({ by: ['procurementId'], where, _count: true, _sum: { amount: true } }),
    ]);

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = payments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPayments: payments.length,
      totalAmount,
      completedAmount,
      completionRate: totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0,
      statusDistribution: statusDist.map(s => ({ status: s.status, count: s._count, totalAmount: s._sum.amount || 0 })),
    };
  }

  async getFarmerAnalytics(farmerId: string): Promise<any> {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) {
      throw new Error('Farmer not found');
    }

    const [bookings, tokens, procurements, payments, produce] = await Promise.all([
      this.prisma.booking.count({ where: { farmerId } }),
      this.prisma.token.count({ where: { farmerId } }),
      this.prisma.procurementRecord.findMany({ where: { farmerId }, select: { quantity: true, totalAmount: true } }),
      this.prisma.payment.findMany({ where: { farmerId }, select: { amount: true, status: true } }),
      this.prisma.farmerProduce.findMany({ where: { farmerId }, include: { crop: true } }),
    ]);

    const totalProcured = procurements.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalAmount = procurements.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalPaid = payments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((sum, p) => sum + p.amount, 0);

    return {
      farmerId,
      farmerCode: farmer.farmerCode,
      bookings,
      tokens,
      procurements: { count: procurements.length, totalQuantity: totalProcured, totalAmount },
      payments: { totalPaid, pending: payments.filter(p => p.status === PaymentStatus.PENDING).length },
      produce: produce.map(p => ({ crop: p.crop.name, quantity: p.quantity, expectedPrice: p.expectedPrice })),
    };
  }
}