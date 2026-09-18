import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsService } from './events.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'notifications' },
      { name: 'queue-prediction' },
      { name: 'analytics' },
      { name: 'audit-logs' },
      { name: 'agent-tasks' },
    ),
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}