import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { Payment, PaymentStatus, ProcurementState, TokenStatus } from '@prisma/client';

interface CreatePaymentDto {
  procurementId: string;
  amount: number;
  provider?: string;
}

interface VerifyPaymentDto {
  paymentId: string;
  providerRef: string;
  status: PaymentStatus;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    const procurement = await this.prisma.procurementRecord.findUnique({
      where: { id: data.procurementId },
      include: { farmer: true, token: true },
    });

    if (!procurement) {
      throw new NotFoundException('Procurement record not found');
    }

    if (procurement.state !== ProcurementState.PAYMENT_PENDING) {
      throw new BadRequestException('Procurement not ready for payment');
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { procurementId: data.procurementId },
    });

    if (existingPayment) {
      throw new BadRequestException('Payment already exists for this procurement');
    }

    const paymentNumber = await this.generatePaymentNumber();

    const payment = await this.prisma.payment.create({
      data: {
        paymentNumber,
        procurementId: data.procurementId,
        farmerId: procurement.farmerId,
        amount: data.amount,
        status: PaymentStatus.PENDING,
        provider: data.provider || 'MOCK',
      },
      include: { procurement: { include: { farmer: { include: { user: true } }, center: true, crop: true } }, farmer: { include: { user: true } } },
    });

    return payment;
  }

  private async generatePaymentNumber(): Promise<string> {
    const date = new Date();
    const prefix = `PAY${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const count = await this.prisma.payment.count({
      where: { paymentNumber: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        procurement: { include: { farmer: { include: { user: true } }, center: true, crop: true } },
        farmer: { include: { user: true } },
        receipt: true,
      },
    });
  }

  async findByPaymentNumber(paymentNumber: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { paymentNumber },
      include: { procurement: true, farmer: true, receipt: true },
    });
  }

  async findAll(params: {
    farmerId?: string;
    procurementId?: string;
    status?: PaymentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: Payment[]; total: number; page: number; limit: number }> {
    const { farmerId, procurementId, status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (farmerId) where.farmerId = farmerId;
    if (procurementId) where.procurementId = procurementId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { procurement: { include: { center: true, crop: true } }, farmer: { include: { user: true } }, receipt: true },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getPaymentStatus(paymentId: string): Promise<Payment | null> {
    return this.findById(paymentId);
  }

  async verifyPayment(data: VerifyPaymentDto): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({ where: { id: data.paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.PROCESSING) {
      throw new BadRequestException('Payment already processed');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: data.paymentId },
        data: {
          status: data.status,
          providerRef: data.providerRef,
          ...(data.status === PaymentStatus.COMPLETED && { paidAt: new Date() }),
          ...(data.status === PaymentStatus.FAILED && { failedAt: new Date() }),
        },
      });

      if (data.status === PaymentStatus.COMPLETED) {
        await tx.procurementRecord.update({
          where: { id: payment.procurementId },
          data: { state: ProcurementState.PAYMENT_COMPLETED },
        });

        const token = await tx.token.findFirst({ where: { procurementId: payment.procurementId } as any });
        if (token) {
          await tx.token.update({
            where: { id: token.id },
            data: { status: TokenStatus.PAYMENT_COMPLETED },
          });
        }

        await this.generateReceipt(tx, payment.id);
      }

      return updatedPayment;
    });

    return updated;
  }

  private async generateReceipt(tx: any, paymentId: string): Promise<void> {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { procurement: { include: { farmer: true, center: true, crop: true } }, farmer: true },
    });

    if (!payment) return;

    const receiptNumber = await this.generateReceiptNumber();

    await tx.receipt.create({
      data: {
        receiptNumber,
        paymentId,
        procurementId: payment.procurementId,
        farmerId: payment.farmerId,
        amount: payment.amount,
      },
    });

    await tx.notification.create({
      data: {
        userId: payment.farmer.userId,
        type: 'PAYMENT_COMPLETED',
        channel: 'IN_APP',
        title: 'Payment Completed',
        message: `Payment of ₹${payment.amount} completed for procurement ${payment.procurement.recordNumber}`,
        data: { paymentId: payment.id, receiptNumber },
      },
    });
  }

  private async generateReceiptNumber(): Promise<string> {
    const date = new Date();
    const prefix = `RCP${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const count = await this.prisma.receipt.count({
      where: { receiptNumber: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  async getFarmerPayments(farmerId: string, params: { status?: PaymentStatus; page?: number; limit?: number } = {}): Promise<any> {
    const { status, page = 1, limit = 20 } = params;
    return this.findAll({ farmerId, status, page, limit });
  }

  async getReceipt(receiptId: string): Promise<any> {
    return this.prisma.receipt.findUnique({
      where: { id: receiptId },
      include: { payment: true, procurement: { include: { center: true, crop: true } }, farmer: { include: { user: true } } },
    });
  }

  async getReceiptByNumber(receiptNumber: string): Promise<any> {
    return this.prisma.receipt.findUnique({
      where: { receiptNumber },
      include: { payment: true, procurement: { include: { center: true, crop: true } }, farmer: { include: { user: true } } },
    });
  }

  async mockPaymentSuccess(paymentId: string): Promise<Payment> {
    return this.verifyPayment({ paymentId, providerRef: `MOCK-${Date.now()}`, status: PaymentStatus.COMPLETED });
  }

  async mockPaymentFailure(paymentId: string, reason: string): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED, failedAt: new Date(), failureReason: reason },
    });
  }
}