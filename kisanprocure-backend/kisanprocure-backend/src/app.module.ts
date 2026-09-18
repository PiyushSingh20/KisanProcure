import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/database/prisma.module';
import { RedisModule } from './common/database/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FarmersModule } from './farmers/farmers.module';
import { OfficersModule } from './officers/officers.module';
import { AdminsModule } from './admins/admins.module';
import { CentersModule } from './centers/centers.module';
import { CropsModule } from './crops/crops.module';
import { SchedulesModule } from './schedules/schedules.module';
import { BookingsModule } from './bookings/bookings.module';
import { TokensModule } from './tokens/tokens.module';
import { QueueModule } from './queue/queue.module';
import { ProcurementModule } from './procurement/procurement.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EventsModule } from './events/events.module';
import { AgentsModule } from './agents/agents.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { HealthModule } from './health/health.module';
import { DemoModule } from './demo/demo.module';
import { PricesModule } from './prices/prices.module';
import { AIServiceModule } from './ai/ai.module';
import { OfficerWorkflowModule } from './officer-workflow/officer-workflow.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'kisanprocure-dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
    UsersModule,
    FarmersModule,
    OfficersModule,
    OfficerWorkflowModule,
    AdminsModule,
    CentersModule,
    CropsModule,
    PricesModule,
    AIServiceModule,
    SchedulesModule,
    BookingsModule,
    TokensModule,
    QueueModule,
    ProcurementModule,
    PaymentsModule,
    NotificationsModule,
    ComplaintsModule,
    AnalyticsModule,
    EventsModule,
    AgentsModule,
    OrchestratorModule,
    HealthModule,
    DemoModule,
  ],
})
export class AppModule {}