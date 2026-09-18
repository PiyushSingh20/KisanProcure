import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, NotificationType, NotificationChannel } from '@prisma/client';

class CreateNotificationDto {
  userId: string;
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  message: string;
  data?: any;
}

class BulkNotificationDto {
  userIds: string[];
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  message: string;
  data?: any;
}

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notifications list' })
  async getMyNotifications(
    @Request() req: any,
    @Query('isRead') isRead?: boolean,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationsService.getUserNotifications(req.user.sub, { isRead, page: Number(page), limit: Number(limit) });
  }

  @Get('me/unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Put('me/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  @Put('me/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req: any) {
    const count = await this.notificationsService.markAllAsRead(req.user.sub);
    return { success: true, count };
  }

  @Delete('me/:id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    await this.notificationsService.delete(id, req.user.sub);
    return { success: true, message: 'Notification deleted' };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create notification (Admin only)' })
  @ApiResponse({ status: 201, description: 'Notification created' })
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Send bulk notification (Admin only)' })
  @ApiResponse({ status: 201, description: 'Bulk notification sent' })
  async sendBulk(@Body() dto: BulkNotificationDto) {
    return this.notificationsService.sendBulkNotification(dto.userIds, dto);
  }

  @Post('by-role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Send notification to all users with a role (Admin only)' })
  @ApiResponse({ status: 201, description: 'Notifications sent' })
  async sendByRole(@Body() dto: { role: string } & Omit<CreateNotificationDto, 'userId'>) {
    const { role, ...data } = dto;
    return this.notificationsService.sendNotificationByRole(role, data);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all notifications (Admin only)' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notifications list' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('type') type?: NotificationType,
    @Query('isRead') isRead?: boolean,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationsService.findAll({ userId, type, isRead, page: Number(page), limit: Number(limit) });
  }
}