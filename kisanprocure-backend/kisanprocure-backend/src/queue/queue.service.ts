import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { RedisService } from '../common/database/redis.service';
import { TokenStatus } from '@prisma/client';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async getQueueStatus(centerId: string): Promise<any> {
    const cacheKey = `queue:status:${centerId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const center = await this.prisma.procurementCenter.findUnique({
      where: { id: centerId },
      include: { counters: true },
    });

    if (!center) {
      throw new Error('Center not found');
    }

    const activeCounters = center.counters.filter(c => c.isActive).length;
    const currentTokens = await this.prisma.centerCounter.findMany({
      where: { centerId, currentTokenId: { not: null } },
      include: { currentToken: { include: { farmer: { include: { user: true } }, crop: true } } },
    });

    const queueEntries = await this.prisma.queueEntry.findMany({
      where: { centerId },
      orderBy: { position: 'asc' },
      take: 50,
      include: { token: { include: { farmer: { include: { user: true } }, crop: true } } },
    });

    const waitingCount = queueEntries.length;
    const avgProcessingTime = await this.getAverageProcessingTime(centerId);

    const queue = queueEntries.map((entry, index) => ({
      position: entry.position,
      token: entry.token,
      estimatedWait: (index + 1) * avgProcessingTime,
    }));

    const status = {
      centerId,
      centerName: center.name,
      activeCounters,
      totalCounters: center.counters.length,
      currentTokens: currentTokens.map(c => c.currentToken),
      queue,
      waitingCount,
      avgProcessingTime,
      estimatedTotalWait: waitingCount * avgProcessingTime,
      lastUpdated: new Date().toISOString(),
    };

    await this.redis.set(cacheKey, JSON.stringify(status), 30);
    return status;
  }

  async getQueueForFarmer(centerId: string, farmerId: string): Promise<any> {
    const token = await this.prisma.token.findFirst({
      where: {
        farmerId,
        centerId,
        status: { in: [TokenStatus.WAITING, TokenStatus.CALLED, TokenStatus.ARRIVED, TokenStatus.QUALITY_CHECK, TokenStatus.WEIGHMENT] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      return { inQueue: false };
    }

    const queueStatus = await this.getQueueStatus(centerId);
    const farmerQueueEntry = queueStatus.queue.find((q: any) => q.token.id === token.id);

    return {
      inQueue: true,
      token,
      position: farmerQueueEntry?.position || token.queuePosition,
      estimatedWait: farmerQueueEntry?.estimatedWait || token.estimatedWait,
      currentToken: queueStatus.currentTokens[0] || null,
    };
  }

  async getCenterQueue(centerId: string, params: { limit?: number; offset?: number } = {}): Promise<any> {
    const { limit = 100, offset = 0 } = params;

    const entries = await this.prisma.queueEntry.findMany({
      where: { centerId },
      orderBy: { position: 'asc' },
      skip: offset,
      take: limit,
      include: { token: { include: { farmer: { include: { user: true } }, crop: true } } },
    });

    const total = await this.prisma.queueEntry.count({ where: { centerId } });
    const avgProcessingTime = await this.getAverageProcessingTime(centerId);

    return {
      entries: entries.map((entry, index) => ({
        position: entry.position,
        token: entry.token,
        estimatedWait: (offset + index + 1) * avgProcessingTime,
      })),
      total,
      avgProcessingTime,
    };
  }

  async getAverageProcessingTime(centerId: string): Promise<number> {
    const cacheKey = `queue:avg-processing:${centerId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return parseInt(cached, 10);
    }

    const completedTokens = await this.prisma.token.findMany({
      where: {
        centerId,
        status: { in: [TokenStatus.PROCUREMENT_COMPLETED, TokenStatus.PAYMENT_COMPLETED] },
        calledAt: { not: null },
        completedAt: { not: null },
      },
      take: 100,
      orderBy: { completedAt: 'desc' },
    });

    if (completedTokens.length === 0) {
      await this.redis.set(cacheKey, '10', 300);
      return 10;
    }

    const totalMinutes = completedTokens.reduce((sum, t) => {
      if (t.calledAt && t.completedAt) {
        return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    const avg = Math.round(totalMinutes / completedTokens.length);
    await this.redis.set(cacheKey, avg.toString(), 300);
    return avg;
  }

  async getCenterStats(centerId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayBookings,
      todayTokens,
      todayCompleted,
      activeQueue,
      avgWaitTime,
    ] = await Promise.all([
      this.prisma.booking.count({ where: { centerId, scheduledDate: { gte: today, lt: tomorrow } } }),
      this.prisma.token.count({ where: { centerId, createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.token.count({ where: { centerId, status: TokenStatus.PAYMENT_COMPLETED, completedAt: { gte: today, lt: tomorrow } } }),
      this.prisma.queueEntry.count({ where: { centerId } }),
      this.getAverageProcessingTime(centerId),
    ]);

    return {
      centerId,
      todayBookings,
      todayTokens,
      todayCompleted,
      activeQueue,
      avgWaitTime,
      completionRate: todayTokens > 0 ? (todayCompleted / todayTokens) * 100 : 0,
    };
  }

  async invalidateCache(centerId: string): Promise<void> {
    await Promise.all([
      this.redis.del(`queue:status:${centerId}`),
      this.redis.del(`queue:avg-processing:${centerId}`),
    ]);
  }
}