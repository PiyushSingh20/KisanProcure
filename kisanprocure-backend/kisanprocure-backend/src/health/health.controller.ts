import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../common/database/prisma.service';
import { RedisService } from '../common/database/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.checkRedis(),
    ]);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async ready(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      await this.redis.getClient().ping();
      return { status: 'ready', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'not ready', timestamp: new Date().toISOString() };
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  async live(): Promise<{ status: string; timestamp: string }> {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: { status: 'up' } };
    } catch (error) {
      return { database: { status: 'down' } };
    }
  }

  private async checkRedis(): Promise<HealthIndicatorResult> {
    try {
      await this.redis.getClient().ping();
      return { redis: { status: 'up' } };
    } catch (error) {
      return { redis: { status: 'down' } };
    }
  }
}