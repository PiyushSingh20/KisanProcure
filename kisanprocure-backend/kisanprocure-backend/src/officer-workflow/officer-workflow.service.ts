import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import {
  ProcurementRecord,
  ProcurementState,
  QualityCheckStatus,
  TokenStatus,
  Role,
  PaymentStatus,
  NotificationType,
  NotificationChannel,
} from '@prisma/client';

export interface QualityCheckInputDto {
  moistureContent?: number;
  foreignMatter?: number;
  damagedGrains?: number;
  testWeight?: number;
  status: QualityCheckStatus;
  notes?: string;
}

export interface WeighmentInputDto {
  grossWeight: number;
  tareWeight: number;
}

export interface CompleteProcurementInputDto {
  unitPrice: number;
}

@Injectable()
export class OfficerWorkflowService {
  private readonly logger = new Logger(OfficerWorkflowService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Resolve officer profile from user ID or fallback for admin
   */
  async getOfficerProfile(userId: string, userRole?: string) {
    let officer = await this.prisma.officer.findUnique({
      where: { userId },
      include: {
        center: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobileNumber: true,
            role: true,
          },
        },
      },
    });

    if (!officer && (userRole === Role.ADMIN || userRole === 'ADMIN')) {
      officer = await this.prisma.officer.findFirst({
        include: {
          center: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              mobileNumber: true,
              role: true,
            },
          },
        },
      });
    }

    if (!officer) {
      throw new NotFoundException('Officer profile not found');
    }

    return officer;
  }

  /**
   * Officer center dashboard statistics
   */
  async getDashboard(userId: string, userRole?: string) {
    const officer = await this.getOfficerProfile(userId, userRole);
    const centerId = officer.centerId;

    if (!centerId) {
      return {
        officer: {
          id: officer.id,
          employeeId: officer.employeeId,
          designation: officer.designation,
          name: `${officer.user?.firstName || ''} ${officer.user?.lastName || ''}`.trim(),
        },
        center: null,
        stats: {
          todayBookings: 0,
          todayTokens: 0,
          activeQueue: 0,
          arrivedCount: 0,
          pendingQualityChecks: 0,
          pendingWeighments: 0,
          completedToday: 0,
          totalProcuredWeightToday: 0,
          totalDisbursedToday: 0,
        },
        recentRecords: [],
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      center,
      todayBookings,
      todayTokens,
      activeQueue,
      arrivedCount,
      pendingQualityChecks,
      pendingWeighments,
      completedTodayRecords,
      recentRecords,
    ] = await Promise.all([
      this.prisma.procurementCenter.findUnique({
        where: { id: centerId },
        include: { counters: true },
      }),
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
      this.prisma.token.count({
        where: {
          centerId,
          status: { in: [TokenStatus.WAITING, TokenStatus.CALLED] },
        },
      }),
      this.prisma.token.count({
        where: {
          centerId,
          status: TokenStatus.ARRIVED,
        },
      }),
      this.prisma.procurementRecord.count({
        where: {
          centerId,
          state: ProcurementState.QUALITY_CHECK,
        },
      }),
      this.prisma.procurementRecord.count({
        where: {
          centerId,
          state: ProcurementState.WEIGHMENT,
        },
      }),
      this.prisma.procurementRecord.findMany({
        where: {
          centerId,
          state: {
            in: [
              ProcurementState.PROCUREMENT_COMPLETED,
              ProcurementState.PAYMENT_PENDING,
              ProcurementState.PAYMENT_COMPLETED,
            ],
          },
          updatedAt: { gte: today, lt: tomorrow },
        },
        select: {
          weighedQuantity: true,
          quantity: true,
          totalAmount: true,
        },
      }),
      this.prisma.procurementRecord.findMany({
        where: { centerId },
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          farmer: { include: { user: { select: { firstName: true, lastName: true, mobileNumber: true } } } },
          crop: true,
          token: true,
          qualityCheck: true,
          weighment: true,
          payment: true,
        },
      }),
    ]);

    const completedToday = completedTodayRecords.length;
    const totalProcuredWeightToday = completedTodayRecords.reduce(
      (sum, r) => sum + (r.weighedQuantity || r.quantity || 0),
      0,
    );
    const totalDisbursedToday = completedTodayRecords.reduce(
      (sum, r) => sum + (r.totalAmount || 0),
      0,
    );

    return {
      officer: {
        id: officer.id,
        employeeId: officer.employeeId,
        designation: officer.designation,
        name: `${officer.user?.firstName || ''} ${officer.user?.lastName || ''}`.trim(),
      },
      center,
      stats: {
        todayBookings,
        todayTokens,
        activeQueue,
        arrivedCount,
        pendingQualityChecks,
        pendingWeighments,
        completedToday,
        totalProcuredWeightToday,
        totalDisbursedToday,
      },
      recentRecords: recentRecords.map((r) => this.maskRecord(r)),
    };
  }

  /**
   * Get live queue of tokens for officer's center
   */
  async getLiveQueue(userId: string, userRole?: string) {
    const officer = await this.getOfficerProfile(userId, userRole);
    const centerId = officer.centerId;

    if (!centerId) {
      return { tokens: [], counters: [] };
    }

    const [tokens, counters] = await Promise.all([
      this.prisma.token.findMany({
        where: {
          centerId,
          status: {
            in: [
              TokenStatus.CALLED,
              TokenStatus.WAITING,
              TokenStatus.ARRIVED,
              TokenStatus.QUALITY_CHECK,
              TokenStatus.WEIGHMENT,
            ],
          },
        },
        orderBy: [
          { queuePosition: 'asc' },
          { createdAt: 'asc' },
        ],
        include: {
          farmer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  mobileNumber: true,
                },
              },
            },
          },
          crop: true,
          booking: true,
          procurementRecord: {
            select: {
              id: true,
              recordNumber: true,
              state: true,
              quantity: true,
            },
          },
          counter: true,
        },
      }),
      this.prisma.centerCounter.findMany({
        where: { centerId },
        include: { currentToken: true },
      }),
    ]);

    const orderPriority: Record<string, number> = {
      CALLED: 1,
      WAITING: 2,
      ARRIVED: 3,
      QUALITY_CHECK: 4,
      WEIGHMENT: 5,
    };

    tokens.sort((a, b) => {
      const pA = orderPriority[a.status] || 99;
      const pB = orderPriority[b.status] || 99;
      if (pA !== pB) return pA - pB;
      return (a.queuePosition || 999) - (b.queuePosition || 999);
    });

    return {
      tokens: tokens.map((t) => ({
        ...t,
        farmer: {
          ...t.farmer,
          user: {
            ...t.farmer?.user,
            mobileNumber: t.farmer?.user?.mobileNumber
              ? `${t.farmer.user.mobileNumber.slice(0, 3)}****${t.farmer.user.mobileNumber.slice(-3)}`
              : 'N/A',
          },
        },
      })),
      counters,
    };
  }

  /**
   * Call next token in queue
   */
  async callNextToken(userId: string, counterId?: string, userRole?: string) {
    const officer = await this.getOfficerProfile(userId, userRole);
    const centerId = officer.centerId;
    if (!centerId) {
      throw new BadRequestException('Officer is not assigned to a procurement center');
    }

    const nextToken = await this.prisma.token.findFirst({
      where: {
        centerId,
        status: TokenStatus.WAITING,
      },
      orderBy: [
        { queuePosition: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        farmer: { include: { user: true } },
        center: true,
        crop: true,
      },
    });

    if (!nextToken) {
      throw new NotFoundException('No waiting tokens in the queue');
    }

    const updatedToken = await this.prisma.$transaction(async (tx) => {
      const token = await tx.token.update({
        where: { id: nextToken.id },
        data: {
          status: TokenStatus.CALLED,
          calledAt: new Date(),
        },
        include: { farmer: { include: { user: true } }, center: true, crop: true },
      });

      if (counterId) {
        await tx.centerCounter.update({
          where: { id: counterId },
          data: { currentTokenId: token.id, isActive: true },
        });
      }

      return token;
    });

    await this.logAudit(
      officer.id,
      'CALL_TOKEN',
      'Token',
      updatedToken.id,
      { status: TokenStatus.WAITING },
      { status: TokenStatus.CALLED, counterId },
    );

    await this.notifyFarmer(
      updatedToken.farmerId,
      NotificationType.TOKEN_CALLED,
      'Your Token Has Been Called!',
      `Token #${updatedToken.tokenNumber} has been called. Please proceed to the procurement desk.`,
      { tokenId: updatedToken.id, tokenNumber: updatedToken.tokenNumber },
    );

    return updatedToken;
  }

  /**
   * Mark token as ARRIVED & create ProcurementRecord if missing
   */
  async markArrived(userId: string, tokenId: string, userRole?: string) {
    const officer = await this.getOfficerProfile(userId, userRole);

    const token = await this.prisma.token.findUnique({
      where: { id: tokenId },
      include: {
        booking: true,
        farmer: { include: { user: true } },
        center: true,
        crop: true,
      },
    });

    if (!token) {
      throw new NotFoundException('Token not found');
    }

    if (officer.centerId && token.centerId !== officer.centerId) {
      throw new BadRequestException('Officer not authorized for this center');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedToken = await tx.token.update({
        where: { id: tokenId },
        data: {
          status: TokenStatus.ARRIVED,
          arrivedAt: new Date(),
        },
      });

      let record = await tx.procurementRecord.findUnique({
        where: { tokenId },
      });

      if (!record) {
        const recordNumber = await this.generateRecordNumber(token.centerId);
        record = await tx.procurementRecord.create({
          data: {
            recordNumber,
            tokenId: token.id,
            farmerId: token.farmerId,
            centerId: token.centerId,
            cropId: token.cropId,
            state: ProcurementState.ARRIVED,
            quantity: token.booking?.quantity || 10,
            processedById: officer.id,
            startedAt: new Date(),
          },
        });
      } else if (record.state === ProcurementState.BOOKED || record.state === ProcurementState.SCHEDULED) {
        record = await tx.procurementRecord.update({
          where: { id: record.id },
          data: {
            state: ProcurementState.ARRIVED,
            processedById: officer.id,
          },
        });
      }

      return { token: updatedToken, record };
    });

    await this.logAudit(
      officer.id,
      'MARK_ARRIVED',
      'Token',
      token.id,
      { status: token.status },
      { status: TokenStatus.ARRIVED, recordId: result.record.id },
    );

    await this.notifyFarmer(
      token.farmerId,
      NotificationType.SCHEDULE_CHANGED,
      'Arrival Confirmed',
      `Welcome to ${token.center.name}. Your arrival has been recorded for token #${token.tokenNumber}.`,
      { tokenId: token.id, recordId: result.record.id },
    );

    return result;
  }

  /**
   * Get procurement requests scoped to officer center
   */
  async getProcurementRequests(
    userId: string,
    params: {
      state?: string;
      search?: string;
      cropId?: string;
      page?: number;
      limit?: number;
    },
    userRole?: string,
  ) {
    const officer = await this.getOfficerProfile(userId, userRole);
    const centerId = officer.centerId;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (centerId) {
      where.centerId = centerId;
    }

    if (params.state && params.state !== 'ALL') {
      where.state = params.state as ProcurementState;
    }

    if (params.cropId) {
      where.cropId = params.cropId;
    }

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { recordNumber: { contains: s, mode: 'insensitive' } },
        { token: { tokenNumber: { contains: s, mode: 'insensitive' } } },
        { farmer: { farmerCode: { contains: s, mode: 'insensitive' } } },
        { farmer: { user: { firstName: { contains: s, mode: 'insensitive' } } } },
        { farmer: { user: { lastName: { contains: s, mode: 'insensitive' } } } },
        { crop: { name: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [records, total] = await Promise.all([
      this.prisma.procurementRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          farmer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  mobileNumber: true,
                },
              },
            },
          },
          crop: true,
          center: true,
          token: true,
          qualityCheck: true,
          weighment: true,
          payment: true,
        },
      }),
      this.prisma.procurementRecord.count({ where }),
    ]);

    return {
      data: records.map((r) => this.maskRecord(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single procurement request by ID with masked PII
   */
  async getProcurementRequestById(userId: string, id: string, userRole?: string) {
    const officer = await this.getOfficerProfile(userId, userRole);

    const record = await this.prisma.procurementRecord.findUnique({
      where: { id },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                mobileNumber: true,
                email: true,
              },
            },
            produce: { include: { crop: true } },
          },
        },
        center: true,
        crop: true,
        token: {
          include: {
            booking: {
              include: { slot: true },
            },
          },
        },
        qualityCheck: {
          include: {
            checkedBy: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        weighment: {
          include: {
            weighedBy: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        payment: {
          include: { receipt: true },
        },
        processedBy: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Procurement record not found');
    }

    if (officer.centerId && record.centerId !== officer.centerId && userRole !== Role.ADMIN) {
      throw new BadRequestException('Officer not authorized for this center');
    }

    // Fetch audit trail for this record
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        entityId: id,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        officer: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    }).catch(() => []);

    const masked = this.maskRecord(record);
    return {
      ...masked,
      auditLogs,
    };
  }

  /**
   * Verify a booked request -> SCHEDULED
   */
  async verifyRequest(userId: string, id: string, remarks?: string, userRole?: string) {
    const officer = await this.getOfficerProfile(userId, userRole);

    const record = await this.prisma.procurementRecord.findUnique({
      where: { id },
      include: { token: true, farmer: true },
    });

    if (!record) {
      throw new NotFoundException('Procurement record not found');
    }

    if (record.state !== ProcurementState.BOOKED) {
      throw new BadRequestException(`Cannot verify request in state ${record.state}. Must be BOOKED.`);
    }

    const updated = await this.prisma.procurementRecord.update({
      where: { id },
      data: {
        state: ProcurementState.SCHEDULED,
        processedById: officer.id,
      },
      include: { crop: true, center: true, farmer: { include: { user: true } } },
    });

    await this.logAudit(
      officer.id,
      'VERIFY_REQUEST',
      'ProcurementRecord',
      id,
      { state: record.state },
      { state: ProcurementState.SCHEDULED, remarks },
    );

    await this.notifyFarmer(
      record.farmerId,
      NotificationType.SCHEDULE_CHANGED,
      'Procurement Request Verified',
      `Your procurement request #${record.recordNumber} has been verified and scheduled.`,
      { recordId: id, remarks },
    );

    return this.maskRecord(updated);
  }

  /**
   * Reject a request -> CANCELLED
   */
  async rejectRequest(userId: string, id: string, reason: string, userRole?: string) {
    const officer = await this.getOfficerProfile(userId, userRole);

    const record = await this.prisma.procurementRecord.findUnique({
      where: { id },
      include: { token: true, farmer: true },
    });

    if (!record) {
      throw new NotFoundException('Procurement record not found');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const r = await tx.procurementRecord.update({
        where: { id },
        data: {
          state: ProcurementState.CANCELLED,
          processedById: officer.id,
        },
        include: { crop: true, center: true, farmer: { include: { user: true } } },
      });

      if (record.tokenId) {
        await tx.token.update({
          where: { id: record.tokenId },
          data: {
            status: TokenStatus.CANCELLED,
            cancellationReason: reason,
            cancelledAt: new Date(),
          },
        });
      }

      return r;
    });

    await this.logAudit(
      officer.id,
      'REJECT_REQUEST',
      'ProcurementRecord',
      id,
      { state: record.state },
      { state: ProcurementState.CANCELLED, reason },
    );

    await this.notifyFarmer(
      record.farmerId,
      NotificationType.SCHEDULE_CHANGED,
      'Procurement Request Cancelled',
      `Your procurement request #${record.recordNumber} was cancelled. Reason: ${reason}`,
      { recordId: id, reason },
    );

    return this.maskRecord(updated);
  }

  /**
   * Perform Quality Check -> WEIGHMENT (if passed) or CANCELLED (if failed)
   */
  async performQualityCheck(
    userId: string,
    id: string,
    dto: QualityCheckInputDto,
    userRole?: string,
  ) {
    const officer = await this.getOfficerProfile(userId, userRole);

    const record = await this.prisma.procurementRecord.findUnique({
      where: { id },
      include: { token: true, farmer: true },
    });

    if (!record) {
      throw new NotFoundException('Procurement record not found');
    }

    if (
      record.state !== ProcurementState.ARRIVED &&
      record.state !== ProcurementState.QUALITY_CHECK
    ) {
      throw new BadRequestException(
        `Procurement must be in ARRIVED or QUALITY_CHECK state. Current state: ${record.state}`,
      );
    }

    const nextState =
      dto.status === QualityCheckStatus.PASSED
        ? ProcurementState.WEIGHMENT
        : ProcurementState.CANCELLED;

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.qualityCheck.upsert({
        where: { procurementId: id },
        create: {
          procurementId: id,
          moistureContent: dto.moistureContent ? Number(dto.moistureContent) : null,
          foreignMatter: dto.foreignMatter ? Number(dto.foreignMatter) : null,
          damagedGrains: dto.damagedGrains ? Number(dto.damagedGrains) : null,
          testWeight: dto.testWeight ? Number(dto.testWeight) : null,
          status: dto.status,
          notes: dto.notes,
          checkedById: officer.id,
          checkedAt: new Date(),
        },
        update: {
          moistureContent: dto.moistureContent ? Number(dto.moistureContent) : null,
          foreignMatter: dto.foreignMatter ? Number(dto.foreignMatter) : null,
          damagedGrains: dto.damagedGrains ? Number(dto.damagedGrains) : null,
          testWeight: dto.testWeight ? Number(dto.testWeight) : null,
          status: dto.status,
          notes: dto.notes,
          checkedById: officer.id,
          checkedAt: new Date(),
        },
      });

      const updatedRecord = await tx.procurementRecord.update({
        where: { id },
        data: {
          state: nextState,
          qualityStatus: dto.status,
          qualityNotes: dto.notes,
          processedById: officer.id,
        },
        include: {
          qualityCheck: true,
          crop: true,
          token: true,
          center: true,
          farmer: { include: { user: true } },
        },
      });

      if (record.tokenId) {
        await tx.token.update({
          where: { id: record.tokenId },
          data: {
            status:
              nextState === ProcurementState.WEIGHMENT
                ? TokenStatus.WEIGHMENT
                : TokenStatus.CANCELLED,
          },
        });
      }

      return updatedRecord;
    });

    await this.logAudit(
      officer.id,
      'QUALITY_CHECK',
      'ProcurementRecord',
      id,
      { qualityStatus: record.qualityStatus, state: record.state },
      { qualityStatus: dto.status, state: nextState, dto },
    );

    const message =
      dto.status === QualityCheckStatus.PASSED
        ? `Quality check PASSED for record #${record.recordNumber}. Moisture: ${dto.moistureContent ?? 'N/A'}%. Moving to weighment.`
        : `Quality check FAILED for record #${record.recordNumber}. Reason: ${dto.notes || 'Standards not met'}.`;

    await this.notifyFarmer(
      record.farmerId,
      NotificationType.PROCUREMENT_COMPLETED,
      `Quality Check ${dto.status}`,
      message,
      { recordId: id, status: dto.status },
    );

    return this.maskRecord(result);
  }

  /**
   * Perform Weighment -> PROCUREMENT_COMPLETED
   */
  async performWeighment(
    userId: string,
    id: string,
    dto: WeighmentInputDto,
    userRole?: string,
  ) {
    const officer = await this.getOfficerProfile(userId, userRole);

    const record = await this.prisma.procurementRecord.findUnique({
      where: { id },
      include: { token: true, farmer: true },
    });

    if (!record) {
      throw new NotFoundException('Procurement record not found');
    }

    if (record.state !== ProcurementState.WEIGHMENT) {
      throw new BadRequestException(
        `Procurement must be in WEIGHMENT state. Current state: ${record.state}`,
      );
    }

    const gross = Number(dto.grossWeight);
    const tare = Number(dto.tareWeight);
    const netWeight = gross - tare;

    if (netWeight <= 0) {
      throw new BadRequestException('Net weight must be greater than zero (Gross > Tare)');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.weighment.upsert({
        where: { procurementId: id },
        create: {
          procurementId: id,
          grossWeight: gross,
          tareWeight: tare,
          netWeight,
          weighedById: officer.id,
          weighedAt: new Date(),
        },
        update: {
          grossWeight: gross,
          tareWeight: tare,
          netWeight,
          weighedById: officer.id,
          weighedAt: new Date(),
        },
      });

      const updatedRecord = await tx.procurementRecord.update({
        where: { id },
        data: {
          state: ProcurementState.PROCUREMENT_COMPLETED,
          weighedQuantity: netWeight,
          processedById: officer.id,
          completedAt: new Date(),
        },
        include: {
          weighment: true,
          qualityCheck: true,
          crop: true,
          token: true,
          center: true,
          farmer: { include: { user: true } },
        },
      });

      if (record.tokenId) {
        await tx.token.update({
          where: { id: record.tokenId },
          data: {
            status: TokenStatus.PROCUREMENT_COMPLETED,
          },
        });
      }

      return updatedRecord;
    });

    await this.logAudit(
      officer.id,
      'PERFORM_WEIGHMENT',
      'ProcurementRecord',
      id,
      { state: record.state },
      { gross, tare, netWeight, state: ProcurementState.PROCUREMENT_COMPLETED },
    );

    await this.notifyFarmer(
      record.farmerId,
      NotificationType.PROCUREMENT_COMPLETED,
      'Weighment Completed',
      `Net weight recorded: ${netWeight} Qtl for record #${record.recordNumber}. Officer is preparing payment invoice.`,
      { recordId: id, netWeight },
    );

    return this.maskRecord(result);
  }

  /**
   * Complete Procurement with unit price & generate Payment record
   */
  async completeProcurement(
    userId: string,
    id: string,
    dto: CompleteProcurementInputDto,
    userRole?: string,
  ) {
    const officer = await this.getOfficerProfile(userId, userRole);

    const record = await this.prisma.procurementRecord.findUnique({
      where: { id },
      include: { token: true, farmer: true, weighment: true },
    });

    if (!record) {
      throw new NotFoundException('Procurement record not found');
    }

    if (
      record.state !== ProcurementState.PROCUREMENT_COMPLETED &&
      record.state !== ProcurementState.WEIGHMENT
    ) {
      throw new BadRequestException(
        `Procurement must be completed/weighed first. Current state: ${record.state}`,
      );
    }

    const unitPrice = Number(dto.unitPrice);
    if (unitPrice <= 0) {
      throw new BadRequestException('Unit price must be greater than zero');
    }

    const finalQuantity = record.weighedQuantity || record.weighment?.netWeight || record.quantity;
    const totalAmount = finalQuantity * unitPrice;
    const paymentNumber = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.procurementRecord.update({
        where: { id },
        data: {
          quantity: finalQuantity,
          weighedQuantity: finalQuantity,
          unitPrice,
          totalAmount,
          state: ProcurementState.PAYMENT_PENDING,
          paymentStatus: PaymentStatus.PENDING,
          processedById: officer.id,
          completedAt: new Date(),
        },
        include: {
          qualityCheck: true,
          weighment: true,
          crop: true,
          token: true,
          center: true,
          farmer: { include: { user: true } },
        },
      });

      // Upsert Payment Record
      const payment = await tx.payment.upsert({
        where: { procurementId: id },
        create: {
          paymentNumber,
          procurementId: id,
          farmerId: record.farmerId,
          amount: totalAmount,
          status: PaymentStatus.PENDING,
        },
        update: {
          amount: totalAmount,
          status: PaymentStatus.PENDING,
        },
      });

      if (record.tokenId) {
        await tx.token.update({
          where: { id: record.tokenId },
          data: {
            status: TokenStatus.PAYMENT_PENDING,
            completedAt: new Date(),
          },
        });
      }

      return { record: updatedRecord, payment };
    });

    await this.logAudit(
      officer.id,
      'FINALIZE_PROCUREMENT',
      'ProcurementRecord',
      id,
      { state: record.state },
      {
        unitPrice,
        totalAmount,
        state: ProcurementState.PAYMENT_PENDING,
        paymentId: result.payment.id,
      },
    );

    await this.notifyFarmer(
      record.farmerId,
      NotificationType.PROCUREMENT_COMPLETED,
      'Procurement Finalized - Payment Initiated',
      `Procurement #${record.recordNumber} finalized. Total amount: ₹${totalAmount.toLocaleString('en-IN')}. Payment invoice #${result.payment.paymentNumber} has been generated.`,
      { recordId: id, totalAmount, paymentNumber: result.payment.paymentNumber },
    );

    return {
      record: this.maskRecord(result.record),
      payment: result.payment,
    };
  }

  /**
   * Get Farmers associated with this officer's center/district
   */
  async getFarmers(
    userId: string,
    params: { search?: string; page?: number; limit?: number },
    userRole?: string,
  ) {
    const officer = await this.getOfficerProfile(userId, userRole);
    const center = officer.center;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (center?.district) {
      where.district = { contains: center.district, mode: 'insensitive' };
    }

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { farmerCode: { contains: s, mode: 'insensitive' } },
        { user: { firstName: { contains: s, mode: 'insensitive' } } },
        { user: { lastName: { contains: s, mode: 'insensitive' } } },
        { user: { mobileNumber: { contains: s, mode: 'insensitive' } } },
        { village: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [farmers, total] = await Promise.all([
      this.prisma.farmer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              mobileNumber: true,
              email: true,
            },
          },
          produce: { include: { crop: true } },
          _count: {
            select: {
              bookings: true,
              procurementRecords: true,
            },
          },
        },
      }),
      this.prisma.farmer.count({ where }),
    ]);

    return {
      data: farmers.map((f) => ({
        ...f,
        aadhaarNumber: f.aadhaarNumber ? `•••• •••• ${f.aadhaarNumber.slice(-4)}` : null,
        bankAccount: f.bankAccount ? `••••••••${f.bankAccount.slice(-4)}` : null,
        user: {
          ...f.user,
          mobileNumber: f.user?.mobileNumber
            ? `${f.user.mobileNumber.slice(0, 3)}****${f.user.mobileNumber.slice(-3)}`
            : 'N/A',
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get schedules for officer center
   */
  async getSchedules(userId: string, userRole?: string) {
    const officer = await this.getOfficerProfile(userId, userRole);
    const centerId = officer.centerId;
    if (!centerId) {
      return [];
    }

    return this.prisma.schedule.findMany({
      where: {
        centerId,
        isActive: true,
      },
      include: {
        crop: true,
        slots: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  // --- Helper Methods ---

  private async generateRecordNumber(centerId: string): Promise<string> {
    const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
    const prefix = center?.code || 'PRC';
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const count = await this.prisma.procurementRecord.count({
      where: { recordNumber: { startsWith: `${prefix}-${dateStr}` } },
    });
    return `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }

  private async logAudit(
    officerId: string,
    action: string,
    entity: string,
    entityId: string,
    before: any,
    after: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: officerId,
          actorRole: Role.OFFICER,
          action,
          entity,
          entityId,
          before: before ? JSON.parse(JSON.stringify(before)) : null,
          after: after ? JSON.parse(JSON.stringify(after)) : null,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to create audit log for ${action}: ${err?.message || err}`);
    }
  }

  private async notifyFarmer(
    farmerId: string,
    type: NotificationType,
    title: string,
    message: string,
    data: any = {},
  ) {
    try {
      await this.prisma.notification.create({
        data: {
          userId: farmerId,
          type,
          channel: NotificationChannel.IN_APP,
          title,
          message,
          data: data ? JSON.parse(JSON.stringify(data)) : null,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to create notification: ${err?.message || err}`);
    }
  }

  private maskRecord(record: any) {
    if (!record) return record;
    const copy = { ...record };
    if (copy.farmer) {
      copy.farmer = {
        ...copy.farmer,
        aadhaarNumber: copy.farmer.aadhaarNumber
          ? `•••• •••• ${copy.farmer.aadhaarNumber.slice(-4)}`
          : null,
        bankAccount: copy.farmer.bankAccount
          ? `••••••••${copy.farmer.bankAccount.slice(-4)}`
          : null,
      };
      if (copy.farmer.user?.mobileNumber) {
        copy.farmer.user = {
          ...copy.farmer.user,
          mobileNumber: `${copy.farmer.user.mobileNumber.slice(0, 3)}****${copy.farmer.user.mobileNumber.slice(-3)}`,
        };
      }
    }
    return copy;
  }
}
