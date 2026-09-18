import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { EventsModule } from './events/events.module';
import { QueuePredictionAgent } from './queue-agent/queue-prediction.agent';
import { CrowdPredictionAgent } from './crowd-agent/crowd-prediction.agent';
import { DemandForecastAgent } from './demand-agent/demand-forecast.agent';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
      }),
    }),
    EventsModule,
  ],
  providers: [
    QueuePredictionAgent,
    CrowdPredictionAgent,
    DemandForecastAgent,
  ],
})
export class WorkerModule {}