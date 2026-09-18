import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '../common/database/prisma.service';
import { RedisService } from '../common/database/redis.service';

export type DomainEvent =
  | { type: 'FarmerRegistered'; payload: any }
  | { type: 'SlotBooked'; payload: any }
  | { type: 'TokenGenerated'; payload: any }
  | { type: 'TokenCalled'; payload: any }
  | { type: 'QueueUpdated'; payload: any }
  | { type: 'FarmerArrived'; payload: any }
  | { type: 'QualityCheckStarted'; payload: any }
  | { type: 'QualityCheckCompleted'; payload: any }
  | { type: 'WeighmentCompleted'; payload: any }
  | { type: 'ProcurementCompleted'; payload: any }
  | { type: 'PaymentInitiated'; payload: any }
  | { type: 'PaymentCompleted'; payload: any }
  | { type: 'ScheduleChanged'; payload: any }
  | { type: 'CenterCapacityChanged'; payload: any }
  | { type: 'ComplaintCreated'; payload: any };

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);
  private queueEvents: QueueEvents;

  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
    @InjectQueue('queue-prediction') private queuePredictionQueue: Queue,
    @InjectQueue('analytics') private analyticsQueue: Queue,
    @InjectQueue('audit-logs') private auditLogsQueue: Queue,
    @InjectQueue('agent-tasks') private agentTasksQueue: Queue,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  onModuleInit() {
    this.queueEvents = new QueueEvents('notifications', {
      connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
    });

    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      this.logger.debug(`Job ${jobId} completed`);
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error(`Job ${jobId} failed: ${failedReason}`);
    });
  }

  async publish(event: DomainEvent): Promise<void> {
    this.logger.log(`Publishing event: ${event.type}`);

    switch (event.type) {
      case 'SlotBooked':
        await this.handleSlotBooked(event.payload);
        break;
      case 'TokenGenerated':
        await this.handleTokenGenerated(event.payload);
        break;
      case 'TokenCalled':
        await this.handleTokenCalled(event.payload);
        break;
      case 'QueueUpdated':
        await this.handleQueueUpdated(event.payload);
        break;
      case 'ProcurementCompleted':
        await this.handleProcurementCompleted(event.payload);
        break;
      case 'PaymentCompleted':
        await this.handlePaymentCompleted(event.payload);
        break;
      case 'ComplaintCreated':
        await this.handleComplaintCreated(event.payload);
        break;
      default:
        this.logger.debug(`No specific handler for event: ${event.type}`);
    }

    await this.queueAuditLog(event);
  }

  private async handleSlotBooked(payload: any): Promise<void> {
    await this.notificationsQueue.add('send-notification', {
      userId: payload.farmerUserId,
      type: 'SLOT_BOOKED',
      title: 'Slot Booked Successfully',
      message: `Your slot has been booked for ${payload.scheduledDate} at ${payload.centerName}`,
      data: { bookingId: payload.bookingId, slotId: payload.slotId },
    });

    await this.queuePredictionQueue.add('update-predictions', {
      centerId: payload.centerId,
      date: payload.scheduledDate,
    });
  }

  private async handleTokenGenerated(payload: any): Promise<void> {
    await this.notificationsQueue.add('send-notification', {
      userId: payload.farmerUserId,
      type: 'SLOT_BOOKED',
      title: 'Token Generated',
      message: `Your token ${payload.tokenNumber} has been generated. Queue position: ${payload.queuePosition}`,
      data: { tokenId: payload.tokenId, tokenNumber: payload.tokenNumber, queuePosition: payload.queuePosition },
    });
  }

  private async handleTokenCalled(payload: any): Promise<void> {
    await this.notificationsQueue.add('send-notification', {
      userId: payload.farmerUserId,
      type: 'TOKEN_CALLED',
      title: 'Token Called',
      message: `Your token ${payload.tokenNumber} has been called. Please proceed to the counter.`,
      data: { tokenId: payload.tokenId, tokenNumber: payload.tokenNumber, counterNumber: payload.counterNumber },
    });

    await this.queuePredictionQueue.add('update-predictions', {
      centerId: payload.centerId,
    });

    await this.analyticsQueue.add('update-metrics', {
      centerId: payload.centerId,
      event: 'token_called',
    });
  }

  private async handleQueueUpdated(payload: any): Promise<void> {
    await this.queuePredictionQueue.add('update-predictions', {
      centerId: payload.centerId,
    });
  }

  private async handleProcurementCompleted(payload: any): Promise<void> {
    await this.notificationsQueue.add('send-notification', {
      userId: payload.farmerUserId,
      type: 'PROCUREMENT_COMPLETED',
      title: 'Procurement Completed',
      message: `Your procurement of ${payload.quantity} ${payload.unit} of ${payload.cropName} has been completed.`,
      data: { procurementId: payload.procurementId, quantity: payload.quantity, cropName: payload.cropName },
    });

    await this.analyticsQueue.add('update-metrics', {
      centerId: payload.centerId,
      event: 'procurement_completed',
      quantity: payload.quantity,
      amount: payload.totalAmount,
    });
  }

  private async handlePaymentCompleted(payload: any): Promise<void> {
    await this.notificationsQueue.add('send-notification', {
      userId: payload.farmerUserId,
      type: 'PAYMENT_COMPLETED',
      title: 'Payment Completed',
      message: `Payment of ₹${payload.amount} has been completed for procurement ${payload.recordNumber}. Receipt: ${payload.receiptNumber}`,
      data: { paymentId: payload.paymentId, receiptId: payload.receiptId, amount: payload.amount },
    });
  }

  private async handleComplaintCreated(payload: any): Promise<void> {
    await this.notificationsQueue.add('send-notification', {
      userId: payload.farmerUserId,
      type: 'COMPLAINT_RECEIVED',
      title: 'Complaint Registered',
      message: `Your complaint ${payload.complaintNumber} has been registered: ${payload.subject}`,
      data: { complaintId: payload.complaintId, complaintNumber: payload.complaintNumber },
    });
  }

  private async queueAuditLog(event: DomainEvent): Promise<void> {
    await this.auditLogsQueue.add('audit-log', {
      eventType: event.type,
      payload: event.payload,
      timestamp: new Date().toISOString(),
    });
  }

  async scheduleNotification(userId: string, data: any, delayMs: number): Promise<void> {
    await this.notificationsQueue.add('send-notification', data, { delay: delayMs });
  }

  async triggerAgentTask(agentType: string, taskType: string, input: any, farmerId?: string, centerId?: string): Promise<void> {
    await this.agentTasksQueue.add('execute-agent-task', {
      agentType,
      taskType,
      input,
      farmerId,
      centerId,
    });
  }

  async getQueueStats(): Promise<any> {
    const queues = [
      this.notificationsQueue,
      this.queuePredictionQueue,
      this.analyticsQueue,
      this.auditLogsQueue,
      this.agentTasksQueue,
    ];

    return Promise.all(queues.map(async (queue) => {
      const counts = await queue.getJobCounts();
      return { name: queue.name, ...counts };
    }));
  }
}