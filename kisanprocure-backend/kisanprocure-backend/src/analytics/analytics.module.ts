import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ImpactAnalyticsService } from './impact-analytics.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ImpactAnalyticsService],
  exports: [AnalyticsService, ImpactAnalyticsService],
})
export class AnalyticsModule {}