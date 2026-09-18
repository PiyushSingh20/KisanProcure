import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
        { emit: 'stdout', level: 'info' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (err) {
      this.logger.warn('⚠️ PostgreSQL offline (localhost:5432) - running in In-Memory / Demo Mode');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected');
    } catch (err) {
      // ignore
    }
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    const models = ['notification', 'announcement', 'complaint', 'payment', 'receipt',
      'weighment', 'qualityCheck', 'procurementRecord', 'queueEntry',
      'token', 'booking', 'slot', 'schedule', 'farmerProduce',
      'farmer', 'officer', 'admin', 'centerCounter', 'procurementCenter',
      'crop', 'auditLog', 'agentTask', 'agentPrediction', 'agentRecommendation',
      'forecastResult', 'session', 'user',
    ];
    for (const model of models) {
      if (typeof (this as any)[model]?.deleteMany === 'function') {
        await (this as any)[model].deleteMany();
      }
    }
  }
}