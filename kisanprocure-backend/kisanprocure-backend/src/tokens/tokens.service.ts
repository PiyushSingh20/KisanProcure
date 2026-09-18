import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { RedisService } from '../common/database/redis.service';
import { Token, TokenStatus, BookingStatus, ProcurementState } from '@prisma/client';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async generateFromBooking(bookingId: string): Promise<Token> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { center: true, crop: true, farmer: true, token: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking must be confirmed to generate token');
    }

    if (booking.token) {
      throw new BadRequestException('Token already generated for this booking');
    }

    const tokenNumber = await this.generateTokenNumber(booking.centerId);

    const token = await this.prisma.$transaction(async (tx) => {
      const newToken = await tx.token.create({
        data: {
          tokenNumber,
          bookingId,
          farmerId: booking.farmerId,
          centerId: booking.centerId,
          cropId: booking.cropId,
          status: TokenStatus.GENERATED,
        },
        include: { booking: true, farmer: { include: { user: true } }, center: true, crop: true },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { token: { connect: { id: newToken.id } } },
      });

      await this.addToQueue(tx, newToken.id, booking.centerId);

      return newToken;
    });

    await this.updateQueueCache(booking.centerId);
    await this.notifyTokenGenerated(token);

    return token;
  }

  private async generateTokenNumber(centerId: string): Promise<string> {
    const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
    const prefix = center?.code || 'KSN';
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const count = await this.prisma.token.count({
      where: { tokenNumber: { startsWith: `${prefix}-${dateStr}` } },
    });
    return `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }

  private async addToQueue(tx: any, tokenId: string, centerId: string): Promise<void> {
    const lastEntry = await tx.queueEntry.findFirst({
      where: { centerId },
      orderBy: { position: 'desc' },
    });

    const position = (lastEntry?.position || 0) + 1;

    await tx.queueEntry.create({
      data: {
        tokenId,
        centerId,
        position,
      },
    });

    await tx.token.update({
      where: { id: tokenId },
      data: { queuePosition: position, status: TokenStatus.WAITING },
    });
  }

  async findById(id: string): Promise<Token | null> {
    return this.prisma.token.findUnique({
      where: { id },
      include: {
        booking: { include: { slot: true } },
        farmer: { include: { user: true } },
        center: true,
        crop: true,
        queueEntry: true,
        procurementRecord: true,
      },
    });
  }

  async findByTokenNumber(tokenNumber: string): Promise<Token | null> {
    return this.prisma.token.findUnique({
      where: { tokenNumber },
      include: { booking: true, farmer: { include: { user: true } }, center: true, crop: true, queueEntry: true },
    });
  }

  async findAll(params: {
    farmerId?: string;
    centerId?: string;
    cropId?: string;
    status?: TokenStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: Token[]; total: number; page: number; limit: number }> {
    const { farmerId, centerId, cropId, status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (farmerId) where.farmerId = farmerId;
    if (centerId) where.centerId = centerId;
    if (cropId) where.cropId = cropId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.token.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { booking: true, farmer: { include: { user: true } }, center: true, crop: true, queueEntry: true },
      }),
      this.prisma.token.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getFarmerTokens(farmerId: string, params: {
    status?: TokenStatus;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const { status, page = 1, limit = 20 } = params;
    return this.findAll({ farmerId, status, page, limit });
  }

  async getTokenStatus(tokenId: string): Promise<any> {
    const token = await this.findById(tokenId);
    if (!token) {
      throw new NotFoundException('Token not found');
    }

    let queuePosition = token.queuePosition;
    let estimatedWait = token.estimatedWait;

    if (token.status === TokenStatus.WAITING || token.status === TokenStatus.CALLED) {
      const queueInfo = await this.getQueuePosition(token.centerId, token.id);
      queuePosition = queueInfo.position;
      estimatedWait = queueInfo.estimatedWait;
    }

    return {
      token,
      queuePosition,
      estimatedWait,
      currentToken: await this.getCurrentToken(token.centerId),
    };
  }

  async getQueuePosition(centerId: string, tokenId: string): Promise<{ position: number; estimatedWait: number }> {
    const entry = await this.prisma.queueEntry.findUnique({ where: { tokenId } });
    if (!entry) {
      return { position: 0, estimatedWait: 0 };
    }

    const avgProcessingTime = await this.getAverageProcessingTime(centerId);
    const estimatedWait = entry.position * avgProcessingTime;

    return { position: entry.position, estimatedWait };
  }

  async getCurrentToken(centerId: string): Promise<Token | null> {
    const counter = await this.prisma.centerCounter.findFirst({
      where: { centerId, currentTokenId: { not: null } },
      include: { currentToken: true },
    });
    return counter?.currentToken || null;
  }

  private async getAverageProcessingTime(centerId: string): Promise<number> {
    const completedTokens = await this.prisma.token.findMany({
      where: {
        centerId,
        status: { in: [TokenStatus.PROCUREMENT_COMPLETED, TokenStatus.PAYMENT_COMPLETED] },
        calledAt: { not: null },
        completedAt: { not: null },
      },
      take: 50,
      orderBy: { completedAt: 'desc' },
    });

    if (completedTokens.length === 0) {
      return 10; // Default 10 minutes
    }

    const totalMinutes = completedTokens.reduce((sum, t) => {
      if (t.calledAt && t.completedAt) {
        return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);

    return Math.round(totalMinutes / completedTokens.length);
  }

  async updateStatus(tokenId: string, status: TokenStatus, data?: { calledAt?: Date; arrivedAt?: Date }): Promise<Token> {
    const token = await this.prisma.token.findUnique({ where: { id: tokenId } });
    if (!token) {
      throw new NotFoundException('Token not found');
    }

    const validTransitions: Record<TokenStatus, TokenStatus[]> = {
      [TokenStatus.GENERATED]: [TokenStatus.WAITING, TokenStatus.CANCELLED],
      [TokenStatus.WAITING]: [TokenStatus.CALLED, TokenStatus.CANCELLED, TokenStatus.NO_SHOW],
      [TokenStatus.CALLED]: [TokenStatus.ARRIVED, TokenStatus.CANCELLED, TokenStatus.NO_SHOW],
      [TokenStatus.ARRIVED]: [TokenStatus.QUALITY_CHECK, TokenStatus.CANCELLED],
      [TokenStatus.QUALITY_CHECK]: [TokenStatus.WEIGHMENT, TokenStatus.CANCELLED],
      [TokenStatus.WEIGHMENT]: [TokenStatus.PROCUREMENT_COMPLETED, TokenStatus.CANCELLED],
      [TokenStatus.PROCUREMENT_COMPLETED]: [TokenStatus.PAYMENT_PENDING, TokenStatus.CANCELLED],
      [TokenStatus.PAYMENT_PENDING]: [TokenStatus.PAYMENT_COMPLETED, TokenStatus.CANCELLED],
      [TokenStatus.PAYMENT_COMPLETED]: [],
      [TokenStatus.CANCELLED]: [],
      [TokenStatus.NO_SHOW]: [],
    };

    if (!validTransitions[token.status]?.includes(status)) {
      throw new BadRequestException(`Invalid status transition from ${token.status} to ${status}`);
    }

    const updatedToken = await this.prisma.token.update({
      where: { id: tokenId },
      data: {
        status,
        ...(status === TokenStatus.CALLED && { calledAt: new Date() }),
        ...(status === TokenStatus.ARRIVED && { arrivedAt: new Date() }),
        ...(status === TokenStatus.PROCUREMENT_COMPLETED && { completedAt: new Date() }),
        ...(status === TokenStatus.CANCELLED && { cancelledAt: new Date() }),
      },
    });

    if (status === TokenStatus.CALLED || status === TokenStatus.CANCELLED || status === TokenStatus.NO_SHOW) {
      await this.removeFromQueue(token.centerId, tokenId);
    }

    await this.updateQueueCache(token.centerId);

    return updatedToken;
  }

  private async removeFromQueue(centerId: string, tokenId: string): Promise<void> {
    const entry = await this.prisma.queueEntry.findUnique({ where: { tokenId } });
    if (!entry) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.queueEntry.delete({ where: { tokenId } });

      await tx.queueEntry.updateMany({
        where: { centerId, position: { gt: entry.position } },
        data: { position: { decrement: 1 } },
      });

      const tokensToUpdate = await tx.token.findMany({
        where: { centerId, queuePosition: { gt: entry.position } },
        select: { id: true },
      });

      for (const t of tokensToUpdate) {
        await tx.token.update({
          where: { id: t.id },
          data: { queuePosition: { decrement: 1 } },
        });
      }
    });
  }

  async callNextToken(centerId: string, counterId: string, officerId: string): Promise<Token | null> {
    const counter = await this.prisma.centerCounter.findUnique({ where: { id: counterId } });
    if (!counter || counter.centerId !== centerId) {
      throw new BadRequestException('Invalid counter');
    }

    if (counter.currentTokenId) {
      throw new BadRequestException('Counter already has a token');
    }

    const nextEntry = await this.prisma.queueEntry.findFirst({
      where: { centerId },
      orderBy: { position: 'asc' },
      include: { token: true },
    });

    if (!nextEntry) {
      return null;
    }

    const token = nextEntry.token;

    await this.prisma.$transaction(async (tx) => {
      await tx.token.update({
        where: { id: token.id },
        data: { status: TokenStatus.CALLED, calledAt: new Date() },
      });

      await tx.centerCounter.update({
        where: { id: counterId },
        data: { currentTokenId: token.id },
      });

      await this.removeFromQueue(centerId, token.id);
    });

    await this.updateQueueCache(centerId);
    await this.notifyTokenCalled(token as Token & { farmer: { userId: string }; center: { name: string } });

    return token;
  }

  async completeTokenAtCounter(counterId: string, officerId: string): Promise<Token | null> {
    const counter = await this.prisma.centerCounter.findUnique({ where: { id: counterId } });
    if (!counter || !counter.currentTokenId) {
      return null;
    }

    await this.prisma.centerCounter.update({
      where: { id: counterId },
      data: { currentTokenId: null },
    });

    return this.prisma.token.findUnique({ where: { id: counter.currentTokenId } });
  }

  private async updateQueueCache(centerId: string): Promise<void> {
    const queue = await this.prisma.queueEntry.findMany({
      where: { centerId },
      orderBy: { position: 'asc' },
      include: { token: { include: { farmer: { include: { user: true } }, crop: true } } },
    });

    await this.redis.set(`queue:${centerId}`, JSON.stringify(queue), 60);
  }

  async getQueueFromCache(centerId: string): Promise<any[]> {
    const cached = await this.redis.get(`queue:${centerId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    return this.updateQueueCache(centerId).then(() => this.redis.get(`queue:${centerId}`).then(c => c ? JSON.parse(c) : []));
  }

  private async notifyTokenGenerated(token: Token & { farmer: { userId: string }; center: { name: string } }): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: token.farmer.userId,
        type: 'SLOT_BOOKED',
        channel: 'IN_APP',
        title: 'Token Generated',
        message: `Your token ${token.tokenNumber} has been generated for ${token.center.name}`,
        data: { tokenId: token.id, tokenNumber: token.tokenNumber },
      },
    });
  }

  private async notifyTokenCalled(token: Token & { farmer: { userId: string }; center: { name: string } }): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: token.farmer.userId,
        type: 'TOKEN_CALLED',
        channel: 'IN_APP',
        title: 'Token Called',
        message: `Your token ${token.tokenNumber} has been called. Please proceed to the counter.`,
        data: { tokenId: token.id, tokenNumber: token.tokenNumber },
      },
    });
  }
}