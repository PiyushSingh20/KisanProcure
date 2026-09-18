import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { ProcurementCenter, CenterStatus, CenterCounter } from '@prisma/client';

interface CreateCenterDto {
  code: string;
  name: string;
  address: string;
  village?: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  email?: string;
  capacityPerDay?: number;
  operatingHours?: any;
  facilities?: string[];
  cropIds?: string[];
}

interface UpdateCenterDto {
  name?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  email?: string;
  status?: CenterStatus;
  capacityPerDay?: number;
  operatingHours?: any;
  facilities?: string[];
  cropIds?: string[];
}

interface CreateCounterDto {
  counterNumber: number;
}

@Injectable()
export class CentersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCenterDto): Promise<ProcurementCenter> {
    const existingCode = await this.prisma.procurementCenter.findUnique({
      where: { code: data.code },
    });
    if (existingCode) {
      throw new ConflictException('Center code already exists');
    }

    return this.prisma.procurementCenter.create({
      data: {
        code: data.code,
        name: data.name,
        address: data.address,
        village: data.village,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude,
        longitude: data.longitude,
        contactNumber: data.contactNumber,
        email: data.email,
        capacityPerDay: data.capacityPerDay || 100,
        operatingHours: data.operatingHours,
        facilities: data.facilities || [],
        centerCrops: data.cropIds ? { connect: data.cropIds.map(id => ({ id })) } : undefined,
      },
      include: { centerCrops: true, counters: true },
    });
  }

  async findById(id: string): Promise<ProcurementCenter | null> {
    return this.prisma.procurementCenter.findUnique({
      where: { id },
      include: {
        centerCrops: true,
        counters: true,
        schedules: {
          where: { isActive: true },
          include: { crop: true, slots: true },
        },
        officers: { include: { user: true } },
      },
    });
  }

  async findByCode(code: string): Promise<ProcurementCenter | null> {
    return this.prisma.procurementCenter.findUnique({
      where: { code },
      include: { centerCrops: true, counters: true },
    });
  }

  async findAll(params: {
    district?: string;
    state?: string;
    status?: CenterStatus;
    page?: number;
    limit?: number;
    search?: string;
    cropId?: string;
  }): Promise<{ data: ProcurementCenter[]; total: number; page: number; limit: number }> {
    const { district, state, status, page = 1, limit = 20, search, cropId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (district) where.district = district;
    if (state) where.state = state;
    if (status) where.status = status;
    if (cropId) where.centerCrops = { some: { id: cropId } };
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { address: { contains: search } },
        { district: { contains: search } },
        { village: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.procurementCenter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { centerCrops: true, counters: true },
      }),
      this.prisma.procurementCenter.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: UpdateCenterDto): Promise<ProcurementCenter> {
    const center = await this.prisma.procurementCenter.findUnique({ where: { id } });
    if (!center) {
      throw new NotFoundException('Center not found');
    }

    const { cropIds, ...updateData } = data;

    return this.prisma.procurementCenter.update({
      where: { id },
      data: {
        ...updateData,
        centerCrops: cropIds ? { set: cropIds.map(id => ({ id })) } : undefined,
      },
      include: { centerCrops: true, counters: true },
    });
  }

  async delete(id: string): Promise<void> {
    const center = await this.prisma.procurementCenter.findUnique({ where: { id } });
    if (!center) {
      throw new NotFoundException('Center not found');
    }

    await this.prisma.procurementCenter.update({
      where: { id },
      data: { deletedAt: new Date(), status: CenterStatus.INACTIVE },
    });
  }

  async addCounter(centerId: string, data: CreateCounterDto): Promise<CenterCounter> {
    const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
    if (!center) {
      throw new NotFoundException('Center not found');
    }

    const existing = await this.prisma.centerCounter.findUnique({
      where: { centerId_counterNumber: { centerId, counterNumber: data.counterNumber } },
    });
    if (existing) {
      throw new ConflictException('Counter number already exists for this center');
    }

    return this.prisma.centerCounter.create({
      data: {
        centerId,
        counterNumber: data.counterNumber,
      },
    });
  }

  async updateCounter(centerId: string, counterId: string, data: { isActive?: boolean }): Promise<CenterCounter> {
    const counter = await this.prisma.centerCounter.findFirst({
      where: { id: counterId, centerId },
    });
    if (!counter) {
      throw new NotFoundException('Counter not found');
    }

    return this.prisma.centerCounter.update({
      where: { id: counterId },
      data,
    });
  }

  async deleteCounter(centerId: string, counterId: string): Promise<void> {
    const counter = await this.prisma.centerCounter.findFirst({
      where: { id: counterId, centerId },
    });
    if (!counter) {
      throw new NotFoundException('Counter not found');
    }

    await this.prisma.centerCounter.delete({ where: { id: counterId } });
  }

  async getCenterStats(centerId: string, date?: Date): Promise<any> {
    const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
    if (!center) {
      throw new NotFoundException('Center not found');
    }

    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const [
      totalBookings,
      totalTokens,
      totalProcured,
      avgWaitTime,
      activeQueue,
      noShowCount,
    ] = await Promise.all([
      this.prisma.booking.count({
        where: { centerId, scheduledDate: { gte: targetDate, lt: nextDate } },
      }),
      this.prisma.token.count({
        where: { centerId, createdAt: { gte: targetDate, lt: nextDate } },
      }),
      this.prisma.procurementRecord.aggregate({
        where: { centerId, createdAt: { gte: targetDate, lt: nextDate } },
        _sum: { quantity: true, totalAmount: true },
      }),
      this.prisma.token.aggregate({
        where: {
          centerId,
          status: { in: ['PROCUREMENT_COMPLETED', 'PAYMENT_COMPLETED'] },
          calledAt: { not: null },
          arrivedAt: { not: null },
        },
        _avg: { estimatedWait: true },
      }),
      this.prisma.queueEntry.count({
        where: {
          centerId,
          token: { status: { in: ['WAITING', 'CALLED', 'ARRIVED', 'QUALITY_CHECK', 'WEIGHMENT'] } },
        },
      }),
      this.prisma.token.count({
        where: {
          centerId,
          status: 'NO_SHOW',
          createdAt: { gte: targetDate, lt: nextDate },
        },
      }),
    ]);

    const utilization = totalBookings > 0
      ? (totalBookings / center.capacityPerDay) * 100
      : 0;

    return {
      centerId,
      date: targetDate,
      totalBookings,
      totalTokens,
      totalProcured: totalProcured._sum.quantity || 0,
      totalAmount: totalProcured._sum.totalAmount || 0,
      avgWaitTime: avgWaitTime._avg.estimatedWait || 0,
      activeQueue,
      noShowCount,
      utilization: Math.min(utilization, 100),
    };
  }

  async getNearbyCenters(latitude: number, longitude: number, radiusKm: number = 50): Promise<ProcurementCenter[]> {
    // Simple bounding box approximation for nearby centers
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

    return this.prisma.procurementCenter.findMany({
      where: {
        latitude: { gte: latitude - latDelta, lte: latitude + latDelta },
        longitude: { gte: longitude - lngDelta, lte: longitude + lngDelta },
        status: CenterStatus.ACTIVE,
        deletedAt: null,
      },
      include: { centerCrops: true, counters: true },
    });
  }
}