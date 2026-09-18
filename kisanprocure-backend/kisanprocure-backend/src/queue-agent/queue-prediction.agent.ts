import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { RedisService } from '../common/database/redis.service';
import { TokenStatus } from '@prisma/client';

interface PredictionInput {
  centerId: string;
  date?: Date;
}

interface PredictionResult {
  estimatedWaitMinutes: number;
  confidence: number;
  expectedServiceTime: number;
  queueTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  explanation: string[];
}

@Injectable()
export class QueuePredictionAgent {
  private readonly logger = new Logger(QueuePredictionAgent.name);

  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async predict(input: PredictionInput): Promise<PredictionResult> {
    const { centerId, date = new Date() } = input;

    const cacheKey = `queue:prediction:${centerId}:${date.toISOString().split('T')[0]}`;
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
    const queueLength = await this.prisma.queueEntry.count({ where: { centerId } });
    const avgProcessingTime = await this.getAverageProcessingTime(centerId);
    const currentTokenRate = await this.getCurrentTokenRate(centerId);
    const historicalData = await this.getHistoricalData(centerId, date);

    let estimatedWaitMinutes: number;
    let confidence: number;
    let queueTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
    let expectedServiceTime = avgProcessingTime;
    const explanation: string[] = [];

    if (historicalData.length >= 10) {
      const prediction = this.predictWithHistoricalData(
        queueLength,
        activeCounters,
        avgProcessingTime,
        currentTokenRate,
        historicalData,
      );
      estimatedWaitMinutes = prediction.estimatedWait;
      confidence = prediction.confidence;
      queueTrend = prediction.trend;
      explanation.push(...prediction.explanation);
    } else {
      estimatedWaitMinutes = this.fallbackFormula(queueLength, activeCounters, avgProcessingTime);
      confidence = 0.6;
      queueTrend = currentTokenRate > avgProcessingTime ? 'INCREASING' : 'DECREASING';
      explanation.push(
        `${queueLength} farmers are ahead in queue`,
        `${activeCounters} active counter(s)`,
        `Average processing time is ${avgProcessingTime} minutes`,
        'Using fallback formula (insufficient historical data)',
      );
    }

    const result: PredictionResult = {
      estimatedWaitMinutes: Math.max(0, Math.round(estimatedWaitMinutes)),
      confidence: Math.round(confidence * 100) / 100,
      expectedServiceTime: Math.round(expectedServiceTime),
      queueTrend,
      explanation,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), 300);
    return result;
  }

  private fallbackFormula(queueLength: number, activeCounters: number, avgProcessingTime: number): number {
    if (activeCounters === 0) return queueLength * avgProcessingTime;
    return (queueLength * avgProcessingTime) / activeCounters;
  }

  private async getAverageProcessingTime(centerId: string): Promise<number> {
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

    if (completedTokens.length === 0) return 10;

    const totalMinutes = completedTokens.reduce((sum, t) => {
      if (t.calledAt && t.completedAt) {
        return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    return Math.round(totalMinutes / completedTokens.length);
  }

  private async getCurrentTokenRate(centerId: string): Promise<number> {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const calledTokens = await this.prisma.token.count({
      where: {
        centerId,
        calledAt: { gte: hourAgo, lte: now },
      },
    });

    return calledTokens;
  }

  private async getHistoricalData(centerId: string, date: Date): Promise<any[]> {
    const dayOfWeek = date.getDay();
    const hour = date.getHours();

    return this.prisma.agentPrediction.findMany({
      where: {
        agentType: 'QUEUE_PREDICTION',
        entityType: 'center',
        entityId: centerId,
        createdAt: {
          gte: new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
  }

  private predictWithHistoricalData(
    queueLength: number,
    activeCounters: number,
    avgProcessingTime: number,
    currentTokenRate: number,
    historicalData: any[],
  ): { estimatedWait: number; confidence: number; trend: 'INCREASING' | 'DECREASING' | 'STABLE'; explanation: string[] } {
    const explanation: string[] = [];

    const similarConditions = historicalData.filter(h => {
      const input = h.inputSnapshot as any;
      return Math.abs(input.queueLength - queueLength) <= 3 &&
        Math.abs(input.activeCounters - activeCounters) <= 1;
    });

    if (similarConditions.length >= 5) {
      const avgActualWait = similarConditions.reduce((sum, h) => {
        const pred = h.prediction as any;
        return sum + (pred.actualWait || pred.estimatedWaitMinutes || 0);
      }, 0) / similarConditions.length;

      explanation.push(
        `${queueLength} farmers ahead in queue`,
        `${activeCounters} active counter(s)`,
        `Average processing time: ${avgProcessingTime} min`,
        `Based on ${similarConditions.length} similar historical scenarios`,
      );

      return {
        estimatedWait: avgActualWait,
        confidence: Math.min(0.9, 0.5 + similarConditions.length * 0.05),
        trend: currentTokenRate > avgProcessingTime ? 'INCREASING' : 'DECREASING',
        explanation,
      };
    }

    const recentPredictions = historicalData.slice(0, 10);
    const avgPredictedWait = recentPredictions.reduce((sum, h) => {
      const pred = h.prediction as any;
      return sum + (pred.estimatedWaitMinutes || 0);
    }, 0) / recentPredictions.length;

    explanation.push(
      `${queueLength} farmers ahead in queue`,
      `${activeCounters} active counter(s)`,
      `Average processing time: ${avgProcessingTime} min`,
      `Based on ${recentPredictions.length} recent predictions`,
    );

    return {
      estimatedWait: avgPredictedWait,
      confidence: 0.7,
      trend: currentTokenRate > avgProcessingTime ? 'INCREASING' : 'DECREASING',
      explanation,
    };
  }
}