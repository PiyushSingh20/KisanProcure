import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { Schedule, Slot, Prisma } from '@prisma/client';

interface CreateScheduleDto {
  centerId: string;
  cropId: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxTokens?: number;
  slots?: CreateSlotDto[];
}

interface CreateSlotDto {
  startTime: string;
  endTime: string;
  capacity?: number;
}

interface UpdateScheduleDto {
  startTime?: string;
  endTime?: string;
  maxTokens?: number;
  isActive?: boolean;
}

interface UpdateSlotDto {
  startTime?: string;
  endTime?: string;
  capacity?: number;
  isActive?: boolean;
}

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateScheduleDto): Promise<Schedule> {
    const center = await this.prisma.procurementCenter.findUnique({ where: { id: data.centerId } });
    if (!center) {
      throw new NotFoundException('Center not found');
    }

    const crop = await this.prisma.crop.findUnique({ where: { id: data.cropId } });
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    const scheduleDate = new Date(data.date);
    scheduleDate.setHours(0, 0, 0, 0);

    const existing = await this.prisma.schedule.findUnique({
      where: { centerId_cropId_date: { centerId: data.centerId, cropId: data.cropId, date: scheduleDate } },
    });
    if (existing) {
      throw new ConflictException('Schedule already exists for this center, crop, and date');
    }

    const slots = data.slots || this.generateDefaultSlots(data.startTime, data.endTime);

    return this.prisma.schedule.create({
      data: {
        centerId: data.centerId,
        cropId: data.cropId,
        date: scheduleDate,
        startTime: data.startTime,
        endTime: data.endTime,
        maxTokens: data.maxTokens || 50,
        slots: {
          create: slots.map(s => ({
            cropId: data.cropId,
            startTime: s.startTime,
            endTime: s.endTime,
            capacity: s.capacity || 10,
          })),
        },
      },
      include: { slots: true, center: true, crop: true },
    });
  }

  private generateDefaultSlots(startTime: string, endTime: string): CreateSlotDto[] {
    const slots: CreateSlotDto[] = [];
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);
    const slotDuration = 60; // 1 hour slots

    let current = start;
    while (current + slotDuration <= end) {
      slots.push({
        startTime: this.formatTime(current),
        endTime: this.formatTime(current + slotDuration),
        capacity: 10,
      });
      current += slotDuration;
    }

    return slots;
  }

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  async findById(id: string): Promise<Schedule | null> {
    return this.prisma.schedule.findUnique({
      where: { id },
      include: { center: true, crop: true, slots: true },
    });
  }

  async findAll(params: {
    centerId?: string;
    cropId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Schedule[]; total: number; page: number; limit: number }> {
    const { centerId, cropId, dateFrom, dateTo, isActive, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (centerId) where.centerId = centerId;
    if (cropId) where.cropId = cropId;
    if (isActive !== undefined) where.isActive = isActive;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    const [data, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: { center: true, crop: true, slots: true },
      }),
      this.prisma.schedule.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.prisma.schedule.update({
      where: { id },
      data,
      include: { center: true, crop: true, slots: true },
    });
  }

  async delete(id: string): Promise<void> {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    await this.prisma.schedule.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addSlot(scheduleId: string, data: CreateSlotDto): Promise<Slot> {
    const schedule = await this.prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.prisma.slot.create({
      data: {
        scheduleId,
        cropId: schedule.cropId,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity || 10,
      },
    });
  }

  async updateSlot(scheduleId: string, slotId: string, data: UpdateSlotDto): Promise<Slot> {
    const slot = await this.prisma.slot.findFirst({ where: { id: slotId, scheduleId } });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    return this.prisma.slot.update({
      where: { id: slotId },
      data,
    });
  }

  async deleteSlot(scheduleId: string, slotId: string): Promise<void> {
    const slot = await this.prisma.slot.findFirst({ where: { id: slotId, scheduleId } });
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    const bookings = await this.prisma.booking.count({ where: { slotId } });
    if (bookings > 0) {
      throw new BadRequestException('Cannot delete slot with existing bookings');
    }

    await this.prisma.slot.delete({ where: { id: slotId } });
  }

  async getAvailableSlots(scheduleId: string): Promise<Slot[]> {
    const schedule = await this.prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.prisma.slot.findMany({
      where: {
        scheduleId,
        isActive: true,
        bookedCount: { lt: this.prisma.slot.fields.capacity },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getScheduleWithAvailability(scheduleId: string): Promise<any> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        center: true,
        crop: true,
        slots: {
          orderBy: { startTime: 'asc' },
          include: {
            _count: { select: { bookings: { where: { status: { not: 'CANCELLED' } } } } },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return {
      ...schedule,
      slots: schedule.slots.map(slot => ({
        ...slot,
        availableCapacity: slot.capacity - slot._count.bookings,
        isAvailable: slot._count.bookings < slot.capacity,
      })),
    };
  }
}