import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  @Get('center/:centerId')
  @ApiOperation({ summary: 'Get queue status for a center' })
  @ApiResponse({ status: 200, description: 'Queue status' })
  async getQueueStatus(@Param('centerId', ParseUUIDPipe) centerId: string) {
    return this.queueService.getQueueStatus(centerId);
  }

  @Get('center/:centerId/farmer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get queue status for current farmer at a center' })
  @ApiResponse({ status: 200, description: 'Farmer queue status' })
  async getFarmerQueue(@Param('centerId', ParseUUIDPipe) centerId: string, @Request() req: any) {
    const farmer = await this.queueService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { inQueue: false };
    }
    return this.queueService.getQueueForFarmer(centerId, farmer.id);
  }

  @Get('center/:centerId/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full queue list for center (Admin/Officer only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Queue list' })
  async getCenterQueue(
    @Param('centerId', ParseUUIDPipe) centerId: string,
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ) {
    return this.queueService.getCenterQueue(centerId, { limit: Number(limit), offset: Number(offset) });
  }

  @Get('center/:centerId/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get center queue statistics (Admin/Officer only)' })
  @ApiResponse({ status: 200, description: 'Center statistics' })
  async getCenterStats(@Param('centerId', ParseUUIDPipe) centerId: string) {
    return this.queueService.getCenterStats(centerId);
  }
}