import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { Admin } from '@prisma/client';

interface UpdateAdminDto {
  permissions?: string[];
}

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByUserId(userId: string): Promise<Admin | null> {
    return this.prisma.admin.findUnique({
      where: { userId },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Admin[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
        { user: { mobileNumber: { contains: search } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.admin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, mobileNumber: true } },
        },
      }),
      this.prisma.admin.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: UpdateAdminDto): Promise<Admin> {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return this.prisma.admin.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  async getSystemStats(): Promise<any> {
    const [
      totalUsers,
      totalFarmers,
      totalOfficers,
      totalAdmins,
      totalCenters,
      totalCrops,
      totalBookings,
      totalTokens,
      totalProcurements,
      totalPayments,
      totalComplaints,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.farmer.count(),
      this.prisma.officer.count(),
      this.prisma.admin.count(),
      this.prisma.procurementCenter.count(),
      this.prisma.crop.count(),
      this.prisma.booking.count(),
      this.prisma.token.count(),
      this.prisma.procurementRecord.count(),
      this.prisma.payment.count(),
      this.prisma.complaint.count(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayBookings, todayTokens, todayProcurements, todayPayments] = await Promise.all([
      this.prisma.booking.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.token.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.procurementRecord.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.payment.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    ]);

    return {
      totals: {
        users: totalUsers,
        farmers: totalFarmers,
        officers: totalOfficers,
        admins: totalAdmins,
        centers: totalCenters,
        crops: totalCrops,
        bookings: totalBookings,
        tokens: totalTokens,
        procurements: totalProcurements,
        payments: totalPayments,
        complaints: totalComplaints,
      },
      today: {
        bookings: todayBookings,
        tokens: todayTokens,
        procurements: todayProcurements,
        payments: todayPayments,
      },
    };
  }
}