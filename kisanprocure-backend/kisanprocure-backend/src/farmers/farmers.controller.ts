import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FarmersService } from './farmers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

class CreateFarmerProduceDto {
  cropId: string;
  quantity: number;
  expectedPrice?: number;
  harvestDate?: Date;
  qualityGrade?: string;
}

class UpdateFarmerProduceDto {
  quantity?: number;
  expectedPrice?: number;
  harvestDate?: Date;
  qualityGrade?: string;
}

class UpdateFarmerDto {
  aadhaarNumber?: string;
  panNumber?: string;
  bankAccount?: string;
  ifscCode?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  totalLandArea?: number;
}

@ApiTags('Farmers')
@Controller('farmers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FarmersController {
  constructor(private farmersService: FarmersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current farmer profile' })
  @ApiResponse({ status: 200, description: 'Farmer profile' })
  async getMyProfile(@Request() req: any) {
    return this.farmersService.findByUserId(req.user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current farmer profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMyProfile(@Request() req: any, @Body() dto: UpdateFarmerDto) {
    const farmer = await this.farmersService.findByUserId(req.user.sub);
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    return this.farmersService.update(farmer.id, dto);
  }

  @Get('me/produce')
  @ApiOperation({ summary: 'Get current farmer produce' })
  @ApiResponse({ status: 200, description: 'Farmer produce list' })
  async getMyProduce(@Request() req: any) {
    const farmer = await this.farmersService.findByUserId(req.user.sub);
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.farmersService.getFarmerProduce(farmer.id);
  }

  @Post('me/produce')
  @ApiOperation({ summary: 'Add/update farmer produce' })
  @ApiResponse({ status: 201, description: 'Produce added/updated' })
  async addMyProduce(@Request() req: any, @Body() dto: CreateFarmerProduceDto) {
    const farmer = await this.farmersService.findByUserId(req.user.sub);
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    return this.farmersService.addProduce(farmer.id, dto);
  }

  @Put('me/produce/:produceId')
  @ApiOperation({ summary: 'Update farmer produce' })
  @ApiResponse({ status: 200, description: 'Produce updated' })
  async updateMyProduce(
    @Request() req: any,
    @Param('produceId', ParseUUIDPipe) produceId: string,
    @Body() dto: UpdateFarmerProduceDto,
  ) {
    const farmer = await this.farmersService.findByUserId(req.user.sub);
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    return this.farmersService.updateProduce(farmer.id, produceId, dto);
  }

  @Delete('me/produce/:produceId')
  @ApiOperation({ summary: 'Delete farmer produce' })
  @ApiResponse({ status: 200, description: 'Produce deleted' })
  async deleteMyProduce(@Request() req: any, @Param('produceId', ParseUUIDPipe) produceId: string) {
    const farmer = await this.farmersService.findByUserId(req.user.sub);
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    await this.farmersService.deleteProduce(farmer.id, produceId);
    return { success: true, message: 'Produce deleted successfully' };
  }

  @Get('me/bookings')
  @ApiOperation({ summary: 'Get current farmer bookings' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyBookings(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const farmer = await this.farmersService.findByUserId(req.user.sub);
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.farmersService.getFarmerBookings(farmer.id, { status, page: Number(page), limit: Number(limit) });
  }

  @Get('me/tokens')
  @ApiOperation({ summary: 'Get current farmer tokens' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyTokens(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const farmer = await this.farmersService.findByUserId(req.user.sub);
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.farmersService.getFarmerTokens(farmer.id, { status, page: Number(page), limit: Number(limit) });
  }

  @Get('me/procurement')
  @ApiOperation({ summary: 'Get current farmer procurement history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyProcurementHistory(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const farmer = await this.farmersService.findByUserId(req.user.sub);
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.farmersService.getFarmerProcurementHistory(farmer.id, { page: Number(page), limit: Number(limit) });
  }

  @Get('me/payments')
  @ApiOperation({ summary: 'Get current farmer payments' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyPayments(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const farmer = await this.farmersService.findByUserId(req.user.sub);
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.farmersService.getFarmerPayments(farmer.id, { status, page: Number(page), limit: Number(limit) });
  }

  @Get('me/complaints')
  @ApiOperation({ summary: 'Get current farmer complaints' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyComplaints(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const farmer = await this.farmersService.findByUserId(req.user.sub);
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.farmersService.getFarmerComplaints(farmer.id, { status, page: Number(page), limit: Number(limit) });
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'List all farmers (Admin/Officer only)' })
  @ApiQuery({ name: 'district', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Farmers list' })
  async findAll(
    @Query('district') district?: string,
    @Query('state') state?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.farmersService.findAll({ district, state, page: Number(page), limit: Number(limit), search });
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Get farmer by ID (Admin/Officer only)' })
  @ApiResponse({ status: 200, description: 'Farmer found' })
  @ApiResponse({ status: 404, description: 'Farmer not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.farmersService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update farmer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Farmer updated' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFarmerDto) {
    return this.farmersService.update(id, dto);
  }
}