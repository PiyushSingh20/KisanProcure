import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DemoService } from './demo.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

class SimulateDto {
  action: string;
  params: any;
}

@ApiTags('Demo')
@Controller('demo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class DemoController {
  constructor(private demoService: DemoService) {}

  @Post('simulate')
  @ApiOperation({ summary: 'Simulate demo actions (Admin only - Demo mode only)' })
  @ApiResponse({ status: 200, description: 'Simulation completed' })
  async simulate(@Body() dto: SimulateDto) {
    return this.demoService.simulate(dto.action, dto.params);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset demo data (Admin only - Demo mode only)' })
  @ApiResponse({ status: 200, description: 'Demo data reset' })
  async resetDemoData() {
    return this.demoService.resetDemoData();
  }

  @Get('status')
  @ApiOperation({ summary: 'Check demo mode status' })
  @ApiResponse({ status: 200, description: 'Demo mode status' })
  async getDemoStatus() {
    return { demoModeEnabled: this.demoService['configService'].get<string>('DEMO_MODE_ENABLED') === 'true' };
  }
}