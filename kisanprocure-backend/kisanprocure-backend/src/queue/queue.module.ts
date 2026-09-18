import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { QueueGateway } from './queue.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [QueueController],
  imports: [AuthModule, JwtModule.register({
    secret: process.env.JWT_SECRET || 'kisanprocure-dev-secret',
    signOptions: { expiresIn: '15m' },
  })],
  providers: [QueueService, QueueGateway, JwtService],
  exports: [QueueService, QueueGateway, JwtService],
})
export class QueueModule {}