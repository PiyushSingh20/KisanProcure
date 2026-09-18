import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { Crop } from '@prisma/client';

interface CreateCropDto {
  code: string;
  name: string;
  scientificName?: string;
  category?: string;
  unit?: string;
  minPrice?: number;
  maxPrice?: number;
  seasonStart?: number;
  seasonEnd?: number;
}

interface UpdateCropDto {
  name?: string;
  scientificName?: string;
  category?: string;
  unit?: string;
  minPrice?: number;
  maxPrice?: number;
  seasonStart?: number;
  seasonEnd?: number;
  isActive?: boolean;
}

@Injectable()
export class CropsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCropDto): Promise<Crop> {
    const existingCode = await this.prisma.crop.findUnique({ where: { code: data.code } });
    if (existingCode) {
      throw new ConflictException('Crop code already exists');
    }

    return this.prisma.crop.create({
      data: {
        code: data.code,
        name: data.name,
        scientificName: data.scientificName,
        category: data.category,
        unit: data.unit || 'QUINTAL',
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        seasonStart: data.seasonStart,
        seasonEnd: data.seasonEnd,
      },
    });
  }

  async findById(id: string): Promise<Crop | null> {
    return this.prisma.crop.findUnique({
      where: { id },
      include: {
        schedules: { include: { center: true, slots: true } },
        farmerProduce: { include: { farmer: { include: { user: true } } } },
      },
    });
  }

  async findByCode(code: string): Promise<Crop | null> {
    return this.prisma.crop.findUnique({ where: { code } });
  }

  async findAll(params: {
    category?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: Crop[]; total: number; page: number; limit: number }> {
    const { category, isActive, page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { scientificName: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.crop.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.crop.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: UpdateCropDto): Promise<Crop> {
    const crop = await this.prisma.crop.findUnique({ where: { id } });
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    return this.prisma.crop.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    const crop = await this.prisma.crop.findUnique({ where: { id } });
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    await this.prisma.crop.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getSeasonalCrops(month: number): Promise<Crop[]> {
    return this.prisma.crop.findMany({
      where: {
        isActive: true,
        OR: [
          { seasonStart: { lte: month }, seasonEnd: { gte: month } },
          { seasonStart: null, seasonEnd: null },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }
}