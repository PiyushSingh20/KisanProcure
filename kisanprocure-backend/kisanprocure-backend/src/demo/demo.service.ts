import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/database/prisma.service';
import { BookingStatus, TokenStatus, ProcurementState, QualityCheckStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private get demoModeEnabled(): boolean {
    return this.configService.get<string>('DEMO_MODE_ENABLED') === 'true';
  }

  async simulate(action: string, params: any): Promise<any> {
    if (!this.demoModeEnabled) {
      throw new BadRequestException('Demo mode is disabled');
    }

    switch (action) {
      case 'new_booking':
        return this.simulateNewBooking(params);
      case 'queue_movement':
        return this.simulateQueueMovement(params);
      case 'officer_processing':
        return this.simulateOfficerProcessing(params);
      case 'center_congestion':
        return this.simulateCenterCongestion(params);
      case 'procurement_completion':
        return this.simulateProcurementCompletion(params);
      case 'payment_completion':
        return this.simulatePaymentCompletion(params);
      case 'full_flow':
        return this.simulateFullFlow(params);
      default:
        throw new BadRequestException(`Unknown demo action: ${action}`);
    }
  }

  private async simulateNewBooking(params: any): Promise<any> {
    const { farmerId, centerId, cropId, quantity } = params;

    const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) throw new BadRequestException('Farmer not found');

    const center = await this.prisma.procurementCenter.findUnique({
      where: { id: centerId },
      include: { centerCrops: true, schedules: { where: { isActive: true, cropId }, include: { slots: { where: { isActive: true } } } } },
    });
    if (!center) throw new BadRequestException('Center not found');

    const schedule = center.schedules[0];
    if (!schedule) throw new BadRequestException('No active schedule');

    const slot = schedule.slots.find(s => s.bookedCount < s.capacity);
    if (!slot) throw new BadRequestException('No available slots');

    const produce = await this.prisma.farmerProduce.findFirst({
      where: { farmerId, cropId },
    });
    if (!produce || produce.quantity < quantity) {
      throw new BadRequestException('Insufficient produce');
    }

    const booking = await this.prisma.booking.create({
      data: {
        bookingNumber: `DEMO-BK-${Date.now()}`,
        farmerId,
        centerId,
        cropId,
        slotId: slot.id,
        scheduledDate: schedule.date,
        status: BookingStatus.CONFIRMED,
        quantity,
      },
    });

    await this.prisma.slot.update({
      where: { id: slot.id },
      data: { bookedCount: { increment: 1 } },
    });

    return { success: true, booking };
  }

  private async simulateQueueMovement(params: any): Promise<any> {
    const { centerId } = params;

    const tokens = await this.prisma.token.findMany({
      where: { centerId, status: TokenStatus.WAITING },
      orderBy: { queuePosition: 'asc' },
      take: 5,
      include: { farmer: { include: { user: true } } },
    });

    const results: { tokenId: string; tokenNumber: string; newStatus: string }[] = [];
    for (const token of tokens) {
      const newStatus = [TokenStatus.CALLED, TokenStatus.ARRIVED][Math.floor(Math.random() * 2)];
      await this.prisma.token.update({
        where: { id: token.id },
        data: { status: newStatus, ...(newStatus === TokenStatus.CALLED && { calledAt: new Date() }), ...(newStatus === TokenStatus.ARRIVED && { arrivedAt: new Date() }) },
      });
      results.push({ tokenId: token.id, tokenNumber: token.tokenNumber, newStatus });
    }

    await this.prisma.$executeRaw`UPDATE "QueueEntry" SET position = position - 1 WHERE "centerId" = ${centerId} AND "tokenId" IN (${tokens.map(t => t.id).join(',')})`;

    return { success: true, movements: results };
  }

  private async simulateOfficerProcessing(params: any): Promise<any> {
    const { centerId, counterId } = params;

    const counter = await this.prisma.centerCounter.findUnique({ where: { id: counterId } });
    if (!counter || counter.centerId !== centerId) {
      throw new BadRequestException('Invalid counter');
    }

    const nextToken = await this.prisma.queueEntry.findFirst({
      where: { centerId },
      orderBy: { position: 'asc' },
      include: { token: true },
    });

    if (!nextToken) {
      return { success: false, message: 'No tokens in queue' };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.token.update({
        where: { id: nextToken.tokenId },
        data: { status: TokenStatus.CALLED, calledAt: new Date() },
      });

      await tx.centerCounter.update({
        where: { id: counterId },
        data: { currentTokenId: nextToken.tokenId },
      });

      await tx.queueEntry.delete({ where: { tokenId: nextToken.tokenId } });

      await tx.queueEntry.updateMany({
        where: { centerId, position: { gt: nextToken.position } },
        data: { position: { decrement: 1 } },
      });
    });

    return { success: true, tokenCalled: nextToken.token.tokenNumber };
  }

  private async simulateCenterCongestion(params: any): Promise<any> {
    const { centerId, congestionLevel } = params;

    const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
    if (!center) throw new BadRequestException('Center not found');

    await this.prisma.procurementCenter.update({
      where: { id: centerId },
      data: { status: congestionLevel >= 90 ? 'FULL' : 'ACTIVE' },
    });

    const bookings = await this.prisma.booking.findMany({
      where: { centerId, status: BookingStatus.CONFIRMED },
      take: Math.floor(center.capacityPerDay * (congestionLevel / 100)),
    });

    return { success: true, centerStatus: congestionLevel >= 90 ? 'FULL' : 'ACTIVE', activeBookings: bookings.length };
  }

  private async simulateProcurementCompletion(params: any): Promise<any> {
    const { tokenId, officerId, quantity, unitPrice } = params;

    const token = await this.prisma.token.findUnique({
      where: { id: tokenId },
      include: { farmer: true, center: true, crop: true },
    });
    if (!token) throw new BadRequestException('Token not found');

    const record = await this.prisma.procurementRecord.create({
      data: {
        recordNumber: `DEMO-PRC-${Date.now()}`,
        tokenId,
        farmerId: token.farmerId,
        centerId: token.centerId,
        cropId: token.cropId,
        state: ProcurementState.PROCUREMENT_COMPLETED,
        quantity,
        unitPrice,
        totalAmount: quantity * unitPrice,
        processedById: officerId,
        completedAt: new Date(),
      },
    });

    await this.prisma.qualityCheck.create({
      data: {
        procurementId: record.id,
        moistureContent: 12.5,
        foreignMatter: 0.5,
        damagedGrains: 1.0,
        testWeight: 78,
        status: QualityCheckStatus.PASSED,
        checkedById: officerId,
        checkedAt: new Date(),
      },
    });

    await this.prisma.weighment.create({
      data: {
        procurementId: record.id,
        grossWeight: quantity * 1.02,
        tareWeight: quantity * 0.02,
        netWeight: quantity,
        weighedById: officerId,
      },
    });

    await this.prisma.token.update({
      where: { id: tokenId },
      data: { status: TokenStatus.PROCUREMENT_COMPLETED, completedAt: new Date() },
    });

    return { success: true, procurementRecord: record };
  }

  private async simulatePaymentCompletion(params: any): Promise<any> {
    const { procurementId, amount } = params;

    const procurement = await this.prisma.procurementRecord.findUnique({
      where: { id: procurementId },
      include: { farmer: true },
    });
    if (!procurement) throw new BadRequestException('Procurement not found');

    const payment = await this.prisma.payment.create({
      data: {
        paymentNumber: `DEMO-PAY-${Date.now()}`,
        procurementId,
        farmerId: procurement.farmerId,
        amount,
        status: PaymentStatus.COMPLETED,
        provider: 'MOCK',
        providerRef: `MOCK-${Date.now()}`,
        paidAt: new Date(),
      },
    });

    await this.prisma.receipt.create({
      data: {
        receiptNumber: `DEMO-RCP-${Date.now()}`,
        paymentId: payment.id,
        procurementId,
        farmerId: procurement.farmerId,
        amount,
      },
    });

    await this.prisma.procurementRecord.update({
      where: { id: procurementId },
      data: { state: ProcurementState.PAYMENT_COMPLETED },
    });

    await this.prisma.token.update({
      where: { id: procurement.tokenId },
      data: { status: TokenStatus.PAYMENT_COMPLETED },
    });

    return { success: true, payment };
  }

  private async simulateFullFlow(params: any): Promise<any> {
    const steps = [
      { action: 'new_booking', params: { farmerId: params.farmerId, centerId: params.centerId, cropId: params.cropId, quantity: params.quantity || 10 } },
      { action: 'queue_movement', params: { centerId: params.centerId } },
      { action: 'officer_processing', params: { centerId: params.centerId, counterId: params.counterId } },
      { action: 'procurement_completion', params: { tokenId: '', officerId: params.officerId, quantity: params.quantity || 10, unitPrice: 2125 } },
      { action: 'payment_completion', params: { procurementId: '', amount: (params.quantity || 10) * 2125 } },
    ];

    const results: { step: string; result: any }[] = [];
    let bookingId: string;
    let tokenId: string;
    let procurementId: string;

    for (const step of steps) {
      if (step.action === 'new_booking') {
        const result = await this.simulateNewBooking(step.params);
        bookingId = result.booking.id;
        const token = await this.prisma.token.findUnique({ where: { bookingId } });
        tokenId = token!.id;
        results.push({ step: 'booking', result });
      } else if (step.action === 'queue_movement') {
        const result = await this.simulateQueueMovement(step.params);
        results.push({ step: 'queue_movement', result });
      } else if (step.action === 'officer_processing') {
        const result = await this.simulateOfficerProcessing(step.params);
        results.push({ step: 'officer_processing', result });
      } else if (step.action === 'procurement_completion') {
        step.params.tokenId = tokenId!;
        const result = await this.simulateProcurementCompletion(step.params);
        procurementId = result.procurementRecord.id;
        results.push({ step: 'procurement_completion', result });
      } else if (step.action === 'payment_completion') {
        step.params.procurementId = procurementId!;
        const result = await this.simulatePaymentCompletion(step.params);
        results.push({ step: 'payment_completion', result });
      }
    }

    return { success: true, flow: results };
  }

  async resetDemoData(): Promise<any> {
    if (!this.demoModeEnabled) {
      throw new BadRequestException('Demo mode is disabled');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany();
      await tx.complaint.deleteMany();
      await tx.receipt.deleteMany();
      await tx.payment.deleteMany();
      await tx.weighment.deleteMany();
      await tx.qualityCheck.deleteMany();
      await tx.procurementRecord.deleteMany();
      await tx.queueEntry.deleteMany();
      await tx.token.deleteMany();
      await tx.booking.deleteMany();
      await tx.slot.updateMany({ data: { bookedCount: 0 } });
    });

    return { success: true, message: 'Demo data reset completed' };
  }
}