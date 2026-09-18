import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { RedisService } from '../common/database/redis.service';
import { Booking, BookingStatus, TokenStatus, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface CreateBookingDto {
  farmerId: string;
  centerId: string;
  cropId: string;
  slotId: string;
  quantity: number;
  expectedPrice?: number;
  notes?: string;
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async create(data: CreateBookingDto): Promise<Booking> {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: data.farmerId } });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    const center = await this.prisma.procurementCenter.findUnique({ where: { id: data.centerId } });
    if (!center) {
      throw new NotFoundException('Center not found');
    }

    const crop = await this.prisma.crop.findUnique({ where: { id: data.cropId } });
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    const slot = await this.prisma.slot.findUnique({
      where: { id: data.slotId },
      include: { schedule: true },
    });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (!slot.isActive) {
      throw new BadRequestException('Slot is not active');
    }

    if (slot.bookedCount >= slot.capacity) {
      throw new ConflictException('Slot is fully booked');
    }

    if (slot.scheduleId) {
      const schedule = await this.prisma.schedule.findUnique({ where: { id: slot.scheduleId } });
      if (schedule) {
        const totalBookings = await this.prisma.booking.count({
          where: { slot: { scheduleId: schedule.id }, status: { not: BookingStatus.CANCELLED } },
        });
        if (totalBookings >= schedule.maxTokens) {
          throw new ConflictException('Schedule has reached maximum token limit');
        }
      }
    }

    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        farmerId: data.farmerId,
        slotId: data.slotId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
    });
    if (existingBooking) {
      throw new ConflictException('Farmer already has a booking for this slot');
    }

const produce = await this.prisma.farmerProduce.findFirst({
      where: { farmerId: data.farmerId, cropId: data.cropId },
    });
    if (!produce || produce.quantity < data.quantity) {
      throw new BadRequestException('Insufficient produce quantity for booking');
    }

    const bookingNumber = await this.generateBookingNumber();

    const booking = await this.prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingNumber,
          farmerId: data.farmerId,
          centerId: data.centerId,
          cropId: data.cropId,
          slotId: data.slotId,
          scheduledDate: slot.schedule.date,
          status: BookingStatus.CONFIRMED,
          quantity: data.quantity,
          expectedPrice: data.expectedPrice,
          notes: data.notes,
        },
        include: { center: true, crop: true, slot: true, token: true },
      });

      await tx.slot.update({
        where: { id: data.slotId },
        data: { bookedCount: { increment: 1 } },
      });

      await tx.farmerProduce.update({
        where: { id: produce.id },
        data: { quantity: { decrement: data.quantity } },
      });

      return newBooking;
    });

    await this.invalidateCache(data.centerId, data.cropId, slot.schedule.date);

    return booking;
  }

  private async generateBookingNumber(): Promise<string> {
    const date = new Date();
    const prefix = `BK${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const count = await this.prisma.booking.count({
      where: { bookingNumber: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  async findById(id: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        farmer: { include: { user: true } },
        center: true,
        crop: true,
        slot: { include: { schedule: true } },
        token: true,
        
      },
    });
  }

  async findByBookingNumber(bookingNumber: string): Promise<Booking | null> {
    return this.prisma.booking.findUnique({
      where: { bookingNumber },
      include: { farmer: true, center: true, crop: true, slot: true, token: true },
    });
  }

  async findAll(params: {
    farmerId?: string;
    centerId?: string;
    cropId?: string;
    status?: BookingStatus;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ data: Booking[]; total: number; page: number; limit: number }> {
    const { farmerId, centerId, cropId, status, dateFrom, dateTo, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (farmerId) where.farmerId = farmerId;
    if (centerId) where.centerId = centerId;
    if (cropId) where.cropId = cropId;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate.gte = dateFrom;
      if (dateTo) where.scheduledDate.lte = dateTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { farmer: { include: { user: true } }, center: true, crop: true, slot: true, token: true },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: { status?: BookingStatus; notes?: string }): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.update({
      where: { id },
      data,
      include: { center: true, crop: true, slot: true, token: true },
    });
  }

  async cancel(id: string, farmerId: string, reason?: string): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.farmerId !== farmerId) {
      throw new BadRequestException('Unauthorized to cancel this booking');
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel this booking');
    }

    const slot = await this.prisma.slot.findUnique({ where: { id: booking.slotId } });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

const produce = await this.prisma.farmerProduce.findFirst({
      where: { farmerId: booking.farmerId, cropId: booking.cropId },
    });

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED, notes: reason ? `${booking.notes || ''}\nCancellation: ${reason}` : booking.notes },
      });

      await tx.slot.update({
        where: { id: booking.slotId },
        data: { bookedCount: { decrement: 1 } },
      });

      if (produce) {
        await tx.farmerProduce.update({
          where: { id: produce.id },
          data: { quantity: { increment: booking.quantity } },
        });
      }

const existingToken = await tx.token.findFirst({ where: { bookingId: id } });

    if (existingToken) {
      await tx.token.update({
        where: { id: existingToken.id },
        data: { status: TokenStatus.CANCELLED, cancellationReason: reason || 'Booking cancelled' },
      });
    }

      return updated;
    });
  }

  async getFarmerBookings(farmerId: string, params: {
    status?: BookingStatus;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const { status, page = 1, limit = 20 } = params;
    return this.findAll({ farmerId, status, page, limit });
  }

  async getCenterBookings(centerId: string, date: Date, params: {
    status?: BookingStatus;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const { status, page = 1, limit = 50 } = params;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.findAll({
      centerId,
      status,
      dateFrom: startOfDay,
      dateTo: endOfDay,
      page,
      limit,
    });
  }

  private async invalidateCache(centerId: string, cropId: string, date: Date): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];
    await Promise.all([
      this.redis.del(`schedule:availability:${centerId}:${cropId}:${dateStr}`),
      this.redis.del(`center:slots:${centerId}:${dateStr}`),
    ]);
  }
}