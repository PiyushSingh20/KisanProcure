import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

class CreateScheduleDto {
  centerId: string;
  cropId: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxTokens?: number;
  slots?: CreateSlotDto[];
}

class CreateSlotDto {
  startTime: string;
  endTime: string;
  capacity?: number;
}

class UpdateScheduleDto {
  startTime?: string;
  endTime?: string;
  maxTokens?: number;
  isActive?: boolean;
}

class UpdateSlotDto {
  startTime?: string;
  endTime?: string;
  capacity?: number;
  isActive?: boolean;
}

@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new schedule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Schedule created' })
  async create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all schedules' })
  @ApiQuery({ name: 'centerId', required: false, type: String })
  @ApiQuery({ name: 'cropId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Schedules list' })
  async findAll(
    @Query('centerId') centerId?: string,
    @Query('cropId') cropId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('isActive') isActive?: boolean,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.schedulesService.findAll({
      centerId,
      cropId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      isActive,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by ID' })
  @ApiResponse({ status: 200, description: 'Schedule found' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.findById(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get schedule with slot availability' })
  @ApiResponse({ status: 200, description: 'Schedule with availability' })
  async getAvailability(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.getScheduleWithAvailability(id);
  }

  @Get(':id/slots/available')
  @ApiOperation({ summary: 'Get available slots for schedule' })
  @ApiResponse({ status: 200, description: 'Available slots' })
  async getAvailableSlots(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesService.getAvailableSlots(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update schedule (Admin only)' })
  @ApiResponse({ status: 200, description: 'Schedule updated' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate schedule (Admin only)' })
  @ApiResponse({ status: 200, description: 'Schedule deactivated' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.schedulesService.delete(id);
    return { success: true, message: 'Schedule deactivated successfully' };
  }

  @Post(':id/slots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add slot to schedule (Admin only)' })
  @ApiResponse({ status: 201, description: 'Slot added' })
  async addSlot(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateSlotDto) {
    return this.schedulesService.addSlot(id, dto);
  }

  @Put(':id/slots/:slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update slot (Admin only)' })
  @ApiResponse({ status: 200, description: 'Slot updated' })
  async updateSlot(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('slotId', ParseUUIDPipe) slotId: string,
    @Body() dto: UpdateSlotDto,
  ) {
    return this.schedulesService.updateSlot(id, slotId, dto);
  }

  @Delete(':id/slots/:slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete slot (Admin only)' })
  @ApiResponse({ status: 200, description: 'Slot deleted' })
  async deleteSlot(@Param('id', ParseUUIDPipe) id: string, @Param('slotId', ParseUUIDPipe) slotId: string) {
    await this.schedulesService.deleteSlot(id, slotId);
    return { success: true, message: 'Slot deleted successfully' };
  }
}