import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { Complaint, ComplaintStatus, Role } from '@prisma/client';

interface CreateComplaintDto {
  farmerId: string;
  centerId?: string;
  cropId?: string;
  tokenId?: string;
  subject: string;
  description: string;
  priority?: number;
}

interface UpdateComplaintDto {
  status?: ComplaintStatus;
  assignedToId?: string;
  resolution?: string;
  priority?: number;
}

@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: CreateComplaintDto): Promise<Complaint> {
    const farmer = await this.prisma.farmer.findUnique({ where: { id: data.farmerId } });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    const complaintNumber = await this.generateComplaintNumber();

    const complaint = await this.prisma.complaint.create({
      data: {
        complaintNumber,
        farmerId: data.farmerId,
        centerId: data.centerId,
        cropId: data.cropId,
        tokenId: data.tokenId,
        subject: data.subject,
        description: data.description,
        priority: data.priority || 1,
        status: ComplaintStatus.OPEN,
      },
      include: { farmer: { include: { user: true } }, center: true, crop: true, token: true, assignedTo: true },
    });

    await this.prisma.notification.create({
      data: {
        userId: farmer.userId,
        type: 'COMPLAINT_RECEIVED',
        channel: 'IN_APP',
        title: 'Complaint Registered',
        message: `Your complaint ${complaintNumber} has been registered: ${data.subject}`,
        data: { complaintId: complaint.id, complaintNumber },
      },
    });

    return complaint;
  }

  private async generateComplaintNumber(): Promise<string> {
    const date = new Date();
    const prefix = `CMP${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const count = await this.prisma.complaint.count({
      where: { complaintNumber: { startsWith: prefix } },
    });
    return `${prefix}${String(count + 1).padStart(4, '0')}`;
  }

  async findById(id: string): Promise<Complaint | null> {
    return this.prisma.complaint.findUnique({
      where: { id },
      include: { farmer: { include: { user: true } }, center: true, crop: true, token: true, assignedTo: { include: { user: true } } },
    });
  }

  async findByComplaintNumber(complaintNumber: string): Promise<Complaint | null> {
    return this.prisma.complaint.findUnique({
      where: { complaintNumber },
      include: { farmer: true, center: true, crop: true, token: true, assignedTo: true },
    });
  }

  async findAll(params: {
    farmerId?: string;
    centerId?: string;
    status?: ComplaintStatus;
    assignedToId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Complaint[]; total: number; page: number; limit: number }> {
    const { farmerId, centerId, status, assignedToId, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (farmerId) where.farmerId = farmerId;
    if (centerId) where.centerId = centerId;
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;

    const [data, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { farmer: { include: { user: true } }, center: true, crop: true, token: true, assignedTo: { include: { user: true } } },
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: UpdateComplaintDto, actorRole: Role): Promise<Complaint> {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: { farmer: { include: { user: true } } },
    });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (actorRole !== Role.ADMIN && data.assignedToId) {
      throw new BadRequestException('Only admins can assign complaints');
    }

    const updateData: any = { ...data };
    if (data.status === ComplaintStatus.RESOLVED || data.status === ComplaintStatus.CLOSED) {
      updateData.resolvedAt = new Date();
    }

    const updated = await this.prisma.complaint.update({
      where: { id },
      data: updateData,
      include: { farmer: { include: { user: true } }, center: true, crop: true, token: true, assignedTo: { include: { user: true } } },
    });

    if (data.status && data.status !== complaint.status) {
      await this.prisma.notification.create({
        data: {
          userId: complaint.farmer.userId,
          type: 'COMPLAINT_RESOLVED',
          channel: 'IN_APP',
          title: 'Complaint Status Updated',
          message: `Your complaint ${complaint.complaintNumber} status changed to ${data.status}`,
          data: { complaintId: complaint.id, status: data.status },
        },
      });
    }

    return updated;
  }

  async getFarmerComplaints(farmerId: string, params: { status?: ComplaintStatus; page?: number; limit?: number } = {}): Promise<any> {
    const { status, page = 1, limit = 20 } = params;
    return this.findAll({ farmerId, status, page, limit });
  }

  async getAssignedComplaints(officerId: string, params: { status?: ComplaintStatus; page?: number; limit?: number } = {}): Promise<any> {
    const { status, page = 1, limit = 20 } = params;
    return this.findAll({ assignedToId: officerId, status, page, limit });
  }
}