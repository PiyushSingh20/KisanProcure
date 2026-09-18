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
import { CentersService } from './centers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, CenterStatus } from '@prisma/client';

class CreateCenterDto {
  code: string;
  name: string;
  address: string;
  village?: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  email?: string;
  capacityPerDay?: number;
  operatingHours?: any;
  facilities?: string[];
  cropIds?: string[];
}

class UpdateCenterDto {
  name?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  email?: string;
  status?: CenterStatus;
  capacityPerDay?: number;
  operatingHours?: any;
  facilities?: string[];
  cropIds?: string[];
}

class CreateCounterDto {
  counterNumber: number;
}

class UpdateCounterDto {
  isActive?: boolean;
}

@ApiTags('Centers')
@Controller('centers')
export class CentersController {
  constructor(private centersService: CentersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new procurement center (Admin only)' })
  @ApiResponse({ status: 201, description: 'Center created' })
  async create(@Body() dto: CreateCenterDto) {
    return this.centersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all procurement centers' })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: CenterStatus })
  @ApiQuery({ name: 'cropId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Centers list' })
  async findAll(
    @Query('district') district?: string,
    @Query('state') state?: string,
    @Query('status') status?: CenterStatus,
    @Query('cropId') cropId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.centersService.findAll({ district, state, status, page: Number(page), limit: Number(limit), search, cropId });
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby centers' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiQuery({ name: 'radiusKm', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Nearby centers' })
  async findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusKm') radiusKm = 50,
  ) {
    return this.centersService.getNearbyCenters(latitude, longitude, radiusKm);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get center by ID' })
  @ApiResponse({ status: 200, description: 'Center found' })
  @ApiResponse({ status: 404, description: 'Center not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.centersService.findById(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get center statistics (Admin/Officer only)' })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Center statistics' })
  async getStats(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date?: string,
  ) {
    return this.centersService.getCenterStats(id, date ? new Date(date) : undefined);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update center (Admin only)' })
  @ApiResponse({ status: 200, description: 'Center updated' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCenterDto) {
    return this.centersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete center (Admin only)' })
  @ApiResponse({ status: 200, description: 'Center deleted' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.centersService.delete(id);
    return { success: true, message: 'Center deleted successfully' };
  }

  @Post(':id/counters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add counter to center (Admin only)' })
  @ApiResponse({ status: 201, description: 'Counter added' })
  async addCounter(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateCounterDto) {
    return this.centersService.addCounter(id, dto);
  }

  @Put(':id/counters/:counterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update counter (Admin only)' })
  @ApiResponse({ status: 200, description: 'Counter updated' })
  async updateCounter(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('counterId', ParseUUIDPipe) counterId: string,
    @Body() dto: UpdateCounterDto,
  ) {
    return this.centersService.updateCounter(id, counterId, dto);
  }

  @Delete(':id/counters/:counterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete counter (Admin only)' })
  @ApiResponse({ status: 200, description: 'Counter deleted' })
  async deleteCounter(@Param('id', ParseUUIDPipe) id: string, @Param('counterId', ParseUUIDPipe) counterId: string) {
    await this.centersService.deleteCounter(id, counterId);
    return { success: true, message: 'Counter deleted successfully' };
  }
}