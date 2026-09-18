import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { Farmer, FarmerProduce, Prisma } from '@prisma/client';

interface CreateFarmerProduceDto {
  cropId: string;
  quantity: number;
  expectedPrice?: number;
  harvestDate?: Date;
  qualityGrade?: string;
}

interface UpdateFarmerDto {
  aadhaarNumber?: string;
  panNumber?: string;
  bankAccount?: string;
  ifscCode?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  totalLandArea?: number;
}

@Injectable()
export class FarmersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Farmer | null> {
    return this.prisma.farmer.findUnique({
      where: { id },
      include: {
        user: true,
        produce: { include: { crop: true } },
        bookings: { include: { center: true, crop: true, slot: true } },
        tokens: { include: { center: true, crop: true } },
      },
    });
  }

  async findByUserId(userId: string): Promise<Farmer | null> {
    return this.prisma.farmer.findUnique({
      where: { userId },
      include: {
        produce: { include: { crop: true } },
      },
    });
  }

  async findByFarmerCode(farmerCode: string): Promise<Farmer | null> {
    return this.prisma.farmer.findUnique({
      where: { farmerCode },
    });
  }

  async findAll(params: {
    district?: string;
    state?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Farmer[]; total: number; page: number; limit: number }> {
    const { district, state, page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (district) where.district = district;
    if (state) where.state = state;
    if (search) {
      where.OR = [
        { farmerCode: { contains: search } },
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
        { user: { mobileNumber: { contains: search } } },
        { aadhaarNumber: { contains: search } },
        { village: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.farmer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, mobileNumber: true } },
          produce: { include: { crop: true } },
        },
      }),
      this.prisma.farmer.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: UpdateFarmerDto): Promise<Farmer> {
    const farmer = await this.prisma.farmer.findUnique({ where: { id } });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    if (data.aadhaarNumber && data.aadhaarNumber !== farmer.aadhaarNumber) {
      const existing = await this.prisma.farmer.findUnique({
        where: { aadhaarNumber: data.aadhaarNumber },
      });
      if (existing) {
        throw new ConflictException('Aadhaar number already registered');
      }
    }

    return this.prisma.farmer.update({
      where: { id },
      data,
      include: {
        user: true,
        produce: { include: { crop: true } },
      },
    });
  }

  async addProduce(farmerId: string, data: CreateFarmerProduceDto): Promise<FarmerProduce> {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    const crop = await this.prisma.crop.findUnique({ where: { id: data.cropId } });
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    const existingProduce = await this.prisma.farmerProduce.findFirst({
      where: { farmerId, cropId: data.cropId },
    });

    if (existingProduce) {
      return this.prisma.farmerProduce.update({
        where: { id: existingProduce.id },
        data: {
          quantity: data.quantity,
          expectedPrice: data.expectedPrice,
          harvestDate: data.harvestDate,
          qualityGrade: data.qualityGrade,
        },
        include: { crop: true },
      });
    }

    return this.prisma.farmerProduce.create({
      data: {
        farmerId,
        cropId: data.cropId,
        quantity: data.quantity,
        expectedPrice: data.expectedPrice,
        harvestDate: data.harvestDate,
        qualityGrade: data.qualityGrade,
      },
      include: { crop: true },
    });
  }

  async updateProduce(farmerId: string, produceId: string, data: Partial<CreateFarmerProduceDto>): Promise<FarmerProduce> {
    const produce = await this.prisma.farmerProduce.findFirst({
      where: { id: produceId, farmerId },
    });
    if (!produce) {
      throw new NotFoundException('Produce not found');
    }

    return this.prisma.farmerProduce.update({
      where: { id: produceId },
      data,
      include: { crop: true },
    });
  }

  async deleteProduce(farmerId: string, produceId: string): Promise<void> {
    const produce = await this.prisma.farmerProduce.findFirst({
      where: { id: produceId, farmerId },
    });
    if (!produce) {
      throw new NotFoundException('Produce not found');
    }

    await this.prisma.farmerProduce.delete({ where: { id: produceId } });
  }

  async getFarmerProduce(farmerId: string): Promise<FarmerProduce[]> {
    return this.prisma.farmerProduce.findMany({
      where: { farmerId },
      include: { crop: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFarmerBookings(farmerId: string, params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const { status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = { farmerId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { center: true, crop: true, slot: true, token: true },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getFarmerTokens(farmerId: string, params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const { status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = { farmerId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.token.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { center: true, crop: true, booking: true },
      }),
      this.prisma.token.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getFarmerProcurementHistory(farmerId: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.procurementRecord.findMany({
        where: { farmerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { center: true, crop: true, qualityCheck: true, weighment: true, payment: true, receipt: true },
      }),
      this.prisma.procurementRecord.count({ where: { farmerId } }),
    ]);

    return { data, total, page, limit };
  }

  async getFarmerPayments(farmerId: string, params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const { status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = { farmerId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { procurement: { include: { center: true, crop: true } }, receipt: true },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getFarmerComplaints(farmerId: string, params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const { status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = { farmerId };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { center: true, crop: true, token: true, assignedTo: true },
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}