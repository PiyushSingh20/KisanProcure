import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { Notification, NotificationType, NotificationChannel } from '@prisma/client';

interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: CreateNotificationDto): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        channel: data.channel || NotificationChannel.IN_APP,
        title: data.title,
        message: data.message,
        data: data.data,
      },
    });

    return notification;
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async findAll(params: {
    userId?: string;
    type?: NotificationType;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Notification[]; total: number; page: number; limit: number }> {
    const { userId, type, isRead, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getUserNotifications(userId: string, params: { isRead?: boolean; page?: number; limit?: number } = {}): Promise<any> {
    const { isRead, page = 1, limit = 20 } = params;
    return this.findAll({ userId, isRead, page, limit });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({ where: { id } });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async sendBulkNotification(userIds: string[], data: Omit<CreateNotificationDto, 'userId'>): Promise<Notification[]> {
    const notifications = await this.prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type: data.type,
        channel: data.channel || NotificationChannel.IN_APP,
        title: data.title,
        message: data.message,
        data: data.data,
      })),
    });

    return this.prisma.notification.findMany({
      where: { userId: { in: userIds }, title: data.title },
      orderBy: { createdAt: 'desc' },
      take: userIds.length,
    });
  }

  async sendNotificationByRole(role: string, data: Omit<CreateNotificationDto, 'userId'>): Promise<Notification[]> {
    const users = await this.prisma.user.findMany({
      where: { role: role as any, status: 'ACTIVE' },
      select: { id: true },
    });

    return this.sendBulkNotification(users.map(u => u.id), data);
  }
}