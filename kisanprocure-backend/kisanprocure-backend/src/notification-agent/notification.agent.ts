import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { NotificationType, NotificationChannel } from '@prisma/client';

interface NotificationDecisionInput {
  farmerId: string;
  event: string;
  context: any;
}

interface NotificationDecision {
  shouldNotify: boolean;
  channel: NotificationChannel;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  title: string;
  message: string;
  delayMinutes: number;
  reason: string;
}

@Injectable()
export class NotificationAgent {
  private readonly logger = new Logger(NotificationAgent.name);

  constructor(private prisma: PrismaService) {}

  async determineNotifications(input: NotificationDecisionInput): Promise<NotificationDecision[]> {
    const { farmerId, event, context } = input;

    const farmer = await this.prisma.farmer.findUnique({
      where: { id: farmerId },
      include: { user: true },
    });

    if (!farmer) {
      return [];
    }

    const preferences = await this.getNotificationPreferences(farmerId);

    switch (event) {
      case 'SLOT_BOOKED':
        return this.handleSlotBooked(farmer, context, preferences);
      case 'APPOINTMENT_APPROACHING':
        return this.handleAppointmentApproaching(farmer, context, preferences);
      case 'QUEUE_APPROACHING':
        return this.handleQueueApproaching(farmer, context, preferences);
      case 'TOKEN_CALLED':
        return this.handleTokenCalled(farmer, context, preferences);
      case 'SCHEDULE_CHANGED':
        return this.handleScheduleChanged(farmer, context, preferences);
      case 'CENTER_OVERLOADED':
        return this.handleCenterOverloaded(farmer, context, preferences);
      case 'CENTER_CLOSED':
        return this.handleCenterClosed(farmer, context, preferences);
      case 'PROCUREMENT_COMPLETED':
        return this.handleProcurementCompleted(farmer, context, preferences);
      case 'PAYMENT_COMPLETED':
        return this.handlePaymentCompleted(farmer, context, preferences);
      case 'COMPLAINT_RECEIVED':
        return this.handleComplaintReceived(farmer, context, preferences);
      case 'COMPLAINT_RESOLVED':
        return this.handleComplaintResolved(farmer, context, preferences);
      default:
        return [];
    }
  }

  private async getNotificationPreferences(farmerId: string): Promise<any> {
    return {
      inApp: true,
      push: true,
      sms: false,
      whatsapp: false,
      email: false,
      quietHours: { start: '22:00', end: '07:00' },
      minQueuePositionForAlert: 3,
    };
  }

  private isQuietHours(preferences: any): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = preferences.quietHours.start.split(':').map(Number);
    const [endH, endM] = preferences.quietHours.end.split(':').map(Number);
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }
    return currentTime >= startTime && currentTime < endTime;
  }

  private handleSlotBooked(farmer: any, context: any, preferences: any): NotificationDecision[] {
    return [{
      shouldNotify: true,
      channel: NotificationChannel.IN_APP,
      priority: 'NORMAL',
      title: 'Slot Booked Successfully',
      message: `Your slot has been booked for ${context.scheduledDate} at ${context.centerName}. Token will be generated on the day of appointment.`,
      delayMinutes: 0,
      reason: 'Confirmation of successful booking',
    }];
  }

  private handleAppointmentApproaching(farmer: any, context: any, preferences: any): NotificationDecision[] {
    const decisions: NotificationDecision[] = [];

    if (preferences.inApp) {
      decisions.push({
        shouldNotify: true,
        channel: NotificationChannel.IN_APP,
        priority: 'HIGH',
        title: 'Appointment Tomorrow',
        message: `Your appointment is scheduled for tomorrow at ${context.centerName}. Please arrive on time.`,
        delayMinutes: 0,
        reason: 'Reminder for upcoming appointment',
      });
    }

    if (preferences.sms && !this.isQuietHours(preferences)) {
      decisions.push({
        shouldNotify: true,
        channel: NotificationChannel.SMS,
        priority: 'HIGH',
        title: 'Appointment Reminder',
        message: `KisanProcure: Your appointment is tomorrow at ${context.centerName}. Token: ${context.tokenNumber || 'TBD'}`,
        delayMinutes: 0,
        reason: 'SMS reminder for appointment',
      });
    }

    return decisions;
  }

  private handleQueueApproaching(farmer: any, context: any, preferences: any): NotificationDecision[] {
    const position = context.queuePosition;
    const minPosition = preferences.minQueuePositionForAlert || 3;

    if (position > minPosition) {
      return [];
    }

    const decisions: NotificationDecision[] = [];

    decisions.push({
      shouldNotify: true,
      channel: NotificationChannel.IN_APP,
      priority: 'URGENT',
      title: 'Your Token is Approaching',
      message: `Your token ${context.tokenNumber} is approaching. ${position} farmer(s) ahead. Please proceed to ${context.centerName}.`,
      delayMinutes: 0,
      reason: `Queue position ${position} <= threshold ${minPosition}`,
    });

    if (preferences.push && !this.isQuietHours(preferences)) {
      decisions.push({
        shouldNotify: true,
        channel: NotificationChannel.PUSH,
        priority: 'URGENT',
        title: 'Token Approaching',
        message: `${position} farmer(s) ahead. Proceed to center.`,
        delayMinutes: 0,
        reason: 'Push notification for urgent queue update',
      });
    }

    return decisions;
  }

  private handleTokenCalled(farmer: any, context: any, preferences: any): NotificationDecision[] {
    const decisions: NotificationDecision[] = [];

    decisions.push({
      shouldNotify: true,
      channel: NotificationChannel.IN_APP,
      priority: 'URGENT',
      title: 'Token Called!',
      message: `Your token ${context.tokenNumber} has been called at counter ${context.counterNumber}. Please proceed immediately.`,
      delayMinutes: 0,
      reason: 'Token called by officer',
    });

    if (preferences.push) {
      decisions.push({
        shouldNotify: true,
        channel: NotificationChannel.PUSH,
        priority: 'URGENT',
        title: 'Token Called!',
        message: `Proceed to counter ${context.counterNumber} immediately.`,
        delayMinutes: 0,
        reason: 'Push notification for token called',
      });
    }

    if (preferences.sms && !this.isQuietHours(preferences)) {
      decisions.push({
        shouldNotify: true,
        channel: NotificationChannel.SMS,
        priority: 'URGENT',
        title: 'Token Called',
        message: `KisanProcure: Token ${context.tokenNumber} called at counter ${context.counterNumber}. Proceed now.`,
        delayMinutes: 0,
        reason: 'SMS for token called',
      });
    }

    return decisions;
  }

  private handleScheduleChanged(farmer: any, context: any, preferences: any): NotificationDecision[] {
    return [{
      shouldNotify: true,
      channel: NotificationChannel.IN_APP,
      priority: 'HIGH',
      title: 'Schedule Changed',
      message: `Your appointment at ${context.centerName} has been rescheduled to ${context.newDate} at ${context.newTime}.`,
      delayMinutes: 0,
      reason: 'Appointment schedule changed by admin',
    }];
  }

  private handleCenterOverloaded(farmer: any, context: any, preferences: any): NotificationDecision[] {
    return [{
      shouldNotify: true,
      channel: NotificationChannel.IN_APP,
      priority: 'HIGH',
      title: 'Center Overloaded',
      message: `${context.centerName} is experiencing high crowd. Consider rescheduling or choosing an alternative center.`,
      delayMinutes: 0,
      reason: 'Center capacity exceeded threshold',
    }];
  }

  private handleCenterClosed(farmer: any, context: any, preferences: any): NotificationDecision[] {
    return [{
      shouldNotify: true,
      channel: NotificationChannel.IN_APP,
      priority: 'URGENT',
      title: 'Center Closed',
      message: `${context.centerName} is temporarily closed. Your appointment has been rescheduled to ${context.newCenterName} on ${context.newDate}.`,
      delayMinutes: 0,
      reason: 'Procurement center closure',
    }];
  }

  private handleProcurementCompleted(farmer: any, context: any, preferences: any): NotificationDecision[] {
    return [{
      shouldNotify: true,
      channel: NotificationChannel.IN_APP,
      priority: 'NORMAL',
      title: 'Procurement Completed',
      message: `Your procurement of ${context.quantity} ${context.unit} of ${context.cropName} has been completed. Payment will be initiated shortly.`,
      delayMinutes: 0,
      reason: 'Procurement process completed',
    }];
  }

  private handlePaymentCompleted(farmer: any, context: any, preferences: any): NotificationDecision[] {
    const decisions: NotificationDecision[] = [];

    decisions.push({
      shouldNotify: true,
      channel: NotificationChannel.IN_APP,
      priority: 'NORMAL',
      title: 'Payment Completed',
      message: `Payment of ₹${context.amount} has been completed for procurement ${context.recordNumber}. Receipt: ${context.receiptNumber}`,
      delayMinutes: 0,
      reason: 'Payment successfully processed',
    });

    if (preferences.sms && !this.isQuietHours(preferences)) {
      decisions.push({
        shouldNotify: true,
        channel: NotificationChannel.SMS,
        priority: 'NORMAL',
        title: 'Payment Received',
        message: `KisanProcure: ₹${context.amount} credited for procurement ${context.recordNumber}. Receipt: ${context.receiptNumber}`,
        delayMinutes: 0,
        reason: 'SMS for payment confirmation',
      });
    }

    return decisions;
  }

  private handleComplaintReceived(farmer: any, context: any, preferences: any): NotificationDecision[] {
    return [{
      shouldNotify: true,
      channel: NotificationChannel.IN_APP,
      priority: 'NORMAL',
      title: 'Complaint Registered',
      message: `Your complaint ${context.complaintNumber} has been registered: ${context.subject}. We will review and respond soon.`,
      delayMinutes: 0,
      reason: 'Complaint acknowledgment',
    }];
  }

  private handleComplaintResolved(farmer: any, context: any, preferences: any): NotificationDecision[] {
    return [{
      shouldNotify: true,
      channel: NotificationChannel.IN_APP,
      priority: 'NORMAL',
      title: 'Complaint Resolved',
      message: `Your complaint ${context.complaintNumber} has been resolved: ${context.resolution}`,
      delayMinutes: 0,
      reason: 'Complaint resolution notification',
    }];
  }
}