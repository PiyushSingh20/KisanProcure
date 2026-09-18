import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QueuePredictionAgent } from '../queue-agent/queue-prediction.agent';
import { AnalyticsService } from '../analytics/analytics.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { userId, type, channel, title, message, data } = job.data;

    await this.notificationsService.create({
      userId,
      type,
      channel: channel || 'IN_APP',
      title,
      message,
      data,
    });

    this.logger.log(`Notification sent to user ${userId}: ${title}`);
    return { success: true };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Notification job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Notification job ${job.id} failed: ${error.message}`);
  }
}

@Processor('queue-prediction')
export class QueuePredictionProcessor extends WorkerHost {
  private readonly logger = new Logger(QueuePredictionProcessor.name);

  constructor(
    private prisma: PrismaService,
    private queuePredictionAgent: QueuePredictionAgent,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { centerId, date } = job.data;

    const prediction = await this.queuePredictionAgent.predict({ centerId, date });

    await this.prisma.agentPrediction.create({
      data: {
        agentType: 'QUEUE_PREDICTION',
        entityType: 'center',
        entityId: centerId,
        inputSnapshot: { centerId, date },
        prediction: JSON.parse(JSON.stringify(prediction)),
        confidence: prediction.confidence,
        modelVersion: '1.0',
      },
    });

    this.logger.log(`Queue prediction updated for center ${centerId}`);
    return prediction;
  }
}

@Processor('analytics')
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { centerId, event, quantity, amount } = job.data;

    this.logger.log(`Analytics update for center ${centerId}: ${event}`);
    return { success: true };
  }
}

@Processor('audit-logs')
export class AuditLogProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditLogProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { eventType, payload, timestamp } = job.data;

    await this.prisma.auditLog.create({
      data: {
        actorId: payload.actorId || 'system',
        actorRole: payload.actorRole || 'SYSTEM',
        action: eventType,
        entity: payload.entity || 'unknown',
        entityId: payload.entityId || 'unknown',
        before: payload.before,
        after: payload.after,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
        createdAt: new Date(timestamp),
      },
    });

    return { success: true };
  }
}

@Processor('agent-tasks')
export class AgentTaskProcessor extends WorkerHost {
  private readonly logger = new Logger(AgentTaskProcessor.name);

  constructor(
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { agentType, taskType, input, farmerId, centerId } = job.data;

    const task = await this.prisma.agentTask.create({
      data: {
        agentType: agentType as any,
        taskType,
        input,
        status: 'PROCESSING',
        farmerId,
        centerId,
      },
    });

    this.logger.log(`Agent task ${task.id} started: ${agentType} - ${taskType}`);

    return { taskId: task.id };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Agent task job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Agent task job ${job.id} failed: ${error.message}`);
  }
}