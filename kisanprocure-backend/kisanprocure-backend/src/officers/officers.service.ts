import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { Officer, Role } from '@prisma/client';

interface UpdateOfficerDto {
  centerId?: string;
  designation?: string;
  permissions?: string[];
}

@Injectable()
export class OfficersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Officer | null> {
    return this.prisma.officer.findUnique({
      where: { id },
      include: {
        user: true,
        center: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Officer | null> {
    return this.prisma.officer.findUnique({
      where: { userId },
      include: {
        center: true,
      },
    });
  }

  async findByEmployeeId(employeeId: string): Promise<Officer | null> {
    return this.prisma.officer.findUnique({
      where: { employeeId },
    });
  }

  async findAll(params: {
    centerId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Officer[]; total: number; page: number; limit: number }> {
    const { centerId, page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (centerId) where.centerId = centerId;
    if (search) {
      where.OR = [
        { employeeId: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
        { user: { mobileNumber: { contains: search } } },
        { designation: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.officer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, mobileNumber: true } },
          center: true,
        },
      }),
      this.prisma.officer.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: UpdateOfficerDto): Promise<Officer> {
    const officer = await this.prisma.officer.findUnique({ where: { id } });
    if (!officer) {
      throw new NotFoundException('Officer not found');
    }

    if (data.centerId) {
      const center = await this.prisma.procurementCenter.findUnique({ where: { id: data.centerId } });
      if (!center) {
        throw new NotFoundException('Center not found');
      }
    }

    return this.prisma.officer.update({
      where: { id },
      data,
      include: {
        user: true,
        center: true,
      },
    });
  }

  async getOfficerStats(officerId: string): Promise<any> {
    const officer = await this.prisma.officer.findUnique({ where: { id: officerId } });
    if (!officer) {
      throw new NotFoundException('Officer not found');
    }

    const centerId = officer.centerId;
    if (!centerId) {
      return { message: 'Officer not assigned to any center' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todayBookings,
      todayTokens,
      activeQueue,
      todayProcurements,
      pendingQualityChecks,
    ] = await Promise.all([
      this.prisma.booking.count({
        where: {
          centerId,
          scheduledDate: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.token.count({
        where: {
          centerId,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.queueEntry.count({
        where: {
          centerId,
          token: { status: { in: ['WAITING', 'CALLED', 'ARRIVED', 'QUALITY_CHECK', 'WEIGHMENT'] } },
        },
      }),
      this.prisma.procurementRecord.count({
        where: {
          centerId,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.qualityCheck.count({
        where: {
          procurement: { centerId },
          status: 'PENDING',
        },
      }),
    ]);

    return {
      centerId,
      todayBookings,
      todayTokens,
      activeQueue,
      todayProcurements,
      pendingQualityChecks,
    };
  }

  async getAssignedCenter(officerId: string): Promise<any> {
    const officer = await this.prisma.officer.findUnique({ where: { id: officerId } });
    if (!officer || !officer.centerId) {
      return null;
    }
    return this.prisma.procurementCenter.findUnique({
      where: { id: officer.centerId },
      include: {
        counters: true,
        schedules: {
          where: {
            date: { gte: new Date() },
            isActive: true,
          },
          include: { crop: true, slots: true },
          take: 10,
        },
      },
    });
  }
}