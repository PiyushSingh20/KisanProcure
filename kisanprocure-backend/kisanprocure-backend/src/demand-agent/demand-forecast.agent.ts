import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { BookingStatus } from '@prisma/client';

interface ForecastInput {
  centerId?: string;
  cropId?: string;
  date: Date;
}

interface ForecastResult {
  forecastType: string;
  centerId?: string;
  cropId?: string;
  date: Date;
  expectedFarmers: number;
  expectedQuantity: number;
  expectedRevenue: number;
  confidence: number;
  factors: string[];
  peakDays: Date[];
  recommendedSlots: number;
  recommendedStaff: number;
}

@Injectable()
export class DemandForecastAgent {
  private readonly logger = new Logger(DemandForecastAgent.name);

  constructor(private prisma: PrismaService) {}

  async forecast(input: ForecastInput): Promise<ForecastResult> {
    const { centerId, cropId, date } = input;

    const historicalData = await this.getHistoricalData(centerId, cropId, date);
    const currentBookings = await this.getCurrentBookings(centerId, cropId, date);
    const cropSeasonality = await this.getCropSeasonality(cropId, date);
    const centerCapacity = await this.getCenterCapacity(centerId);
    const weatherFactor = await this.getWeatherFactor(date);

    const expectedFarmers = this.calculateExpectedFarmers(
      historicalData,
      currentBookings,
      cropSeasonality,
      weatherFactor,
    );

    const expectedQuantity = this.calculateExpectedQuantity(expectedFarmers, cropId, historicalData);
    const expectedRevenue = this.calculateExpectedRevenue(expectedQuantity, cropId);

    const confidence = this.calculateConfidence(historicalData.count, currentBookings, cropSeasonality);

    const peakDays = this.predictPeakDays(historicalData, date);
    const recommendedSlots = Math.ceil(expectedFarmers / 8);
    const recommendedStaff = Math.ceil(expectedFarmers / 40);

    const factors: string[] = [
      `Historical avg (last 30 days): ${historicalData.avgFarmers.toFixed(1)} farmers`,
      `Current bookings: ${currentBookings}`,
      `Crop seasonality factor: ${cropSeasonality.toFixed(2)}`,
      `Weather factor: ${weatherFactor.toFixed(2)}`,
      `Center capacity: ${centerCapacity} farmers/day`,
      `Data points: ${historicalData.count}`,
    ];

    const result: ForecastResult = {
      forecastType: 'DAILY_DEMAND',
      centerId,
      cropId,
      date,
      expectedFarmers: Math.round(expectedFarmers),
      expectedQuantity: Math.round(expectedQuantity * 10) / 10,
      expectedRevenue: Math.round(expectedRevenue),
      confidence: Math.round(confidence * 100) / 100,
      factors,
      peakDays,
      recommendedSlots,
      recommendedStaff: Math.max(1, recommendedStaff),
    };

    await this.storeForecast(result);

    return result;
  }

  private async getHistoricalData(centerId?: string, cropId?: string, date?: Date): Promise<{
    avgFarmers: number;
    avgQuantity: number;
    avgRevenue: number;
    count: number;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const where: any = {
      createdAt: { gte: thirtyDaysAgo },
    };
    if (centerId) where.centerId = centerId;
    if (cropId) where.cropId = cropId;

    const procurements = await this.prisma.procurementRecord.findMany({
      where,
      select: { quantity: true, totalAmount: true, farmerId: true, createdAt: true },
    });

    if (procurements.length === 0) {
      return { avgFarmers: 20, avgQuantity: 100, avgRevenue: 20000, count: 0 };
    }

    const uniqueFarmers = new Set(procurements.map(p => p.farmerId)).size;
    const avgFarmers = uniqueFarmers / 30;
    const avgQuantity = procurements.reduce((sum, p) => sum + (p.quantity || 0), 0) / procurements.length;
    const avgRevenue = procurements.reduce((sum, p) => sum + (p.totalAmount || 0), 0) / procurements.length;

    return { avgFarmers, avgQuantity, avgRevenue, count: procurements.length };
  }

  private async getCurrentBookings(centerId?: string, cropId?: string, date?: Date): Promise<number> {
    const where: any = {
      scheduledDate: {
        gte: new Date(date!.setHours(0, 0, 0, 0)),
        lt: new Date(date!.setHours(23, 59, 59, 999)),
      },
      status: { not: BookingStatus.CANCELLED },
    };
    if (centerId) where.centerId = centerId;
    if (cropId) where.cropId = cropId;

    return this.prisma.booking.count({ where });
  }

  private async getCropSeasonality(cropId?: string, date?: Date): Promise<number> {
    if (!cropId) return 1.0;

    const month = date!.getMonth() + 1;
    const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });

    if (!crop || !crop.seasonStart || !crop.seasonEnd) return 1.0;

    if (month >= crop.seasonStart && month <= crop.seasonEnd) {
      return 1.5;
    }

    if (month === crop.seasonStart - 1 || month === crop.seasonEnd + 1) {
      return 1.2;
    }

    return 0.5;
  }

  private async getCenterCapacity(centerId?: string): Promise<number> {
    if (!centerId) return 100;

    const center = await this.prisma.procurementCenter.findUnique({
      where: { id: centerId },
      select: { capacityPerDay: true },
    });

    return center?.capacityPerDay || 100;
  }

  private async getWeatherFactor(date: Date): Promise<number> {
    return 1.0;
  }

  private calculateExpectedFarmers(
    historicalData: { avgFarmers: number; count: number },
    currentBookings: number,
    cropSeasonality: number,
    weatherFactor: number,
  ): number {
    let expected = historicalData.avgFarmers * 0.3 + currentBookings * 0.7;
    expected *= cropSeasonality;
    expected *= weatherFactor;
    return Math.max(0, expected);
  }

  private calculateExpectedQuantity(expectedFarmers: number, cropId?: string, historicalData?: any): number {
    if (!historicalData || historicalData.count === 0) {
      return expectedFarmers * 5;
    }
    return expectedFarmers * historicalData.avgQuantity;
  }

  private calculateExpectedRevenue(expectedQuantity: number, cropId?: string): number {
    const basePrice = 2000;
    return expectedQuantity * basePrice;
  }

  private calculateConfidence(historicalCount: number, currentBookings: number, cropSeasonality: number): number {
    let confidence = 0.4;

    if (historicalCount >= 100) confidence += 0.3;
    else if (historicalCount >= 50) confidence += 0.2;
    else if (historicalCount >= 10) confidence += 0.1;

    if (currentBookings >= 20) confidence += 0.2;
    else if (currentBookings >= 10) confidence += 0.1;

    if (cropSeasonality > 1.0) confidence += 0.1;

    return Math.min(confidence, 0.95);
  }

  private predictPeakDays(historicalData: any, date: Date): Date[] {
    const peakDays: Date[] = [];
    const dayOfWeek = date.getDay();

    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      if (d.getDay() === 0 || d.getDay() === 6) {
        peakDays.push(d);
      }
    }

    return peakDays;
  }

  private async storeForecast(result: ForecastResult): Promise<void> {
    await this.prisma.forecastResult.create({
      data: {
        forecastType: result.forecastType,
        centerId: result.centerId,
        cropId: result.cropId,
        date: result.date,
        forecast: {
          expectedFarmers: result.expectedFarmers,
          expectedQuantity: result.expectedQuantity,
          expectedRevenue: result.expectedRevenue,
          recommendedSlots: result.recommendedSlots,
          recommendedStaff: result.recommendedStaff,
        },
        confidence: result.confidence,
        factors: result.factors,
        modelVersion: '1.0',
      },
    });
  }

  async getForecastHistory(centerId?: string, cropId?: string, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = { date: { gte: startDate } };
    if (centerId) where.centerId = centerId;
    if (cropId) where.cropId = cropId;

    return this.prisma.forecastResult.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 100,
    });
  }
}