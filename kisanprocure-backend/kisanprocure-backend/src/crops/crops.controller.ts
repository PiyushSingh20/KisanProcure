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
import { CropsService } from './crops.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

class CreateCropDto {
  code: string;
  name: string;
  scientificName?: string;
  category?: string;
  unit?: string;
  minPrice?: number;
  maxPrice?: number;
  seasonStart?: number;
  seasonEnd?: number;
}

class UpdateCropDto {
  name?: string;
  scientificName?: string;
  category?: string;
  unit?: string;
  minPrice?: number;
  maxPrice?: number;
  seasonStart?: number;
  seasonEnd?: number;
  isActive?: boolean;
}

@ApiTags('Crops')
@Controller('crops')
export class CropsController {
  constructor(private cropsService: CropsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new crop (Admin only)' })
  @ApiResponse({ status: 201, description: 'Crop created' })
  async create(@Body() dto: CreateCropDto) {
    return this.cropsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all crops' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Crops list' })
  async findAll(
    @Query('category') category?: string,
    @Query('isActive') isActive?: boolean,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.cropsService.findAll({ category, isActive, page: Number(page), limit: Number(limit), search });
  }

  @Get('seasonal')
  @ApiOperation({ summary: 'Get seasonal crops for a given month' })
  @ApiQuery({ name: 'month', required: true, type: Number, description: 'Month (1-12)' })
  @ApiResponse({ status: 200, description: 'Seasonal crops' })
  async getSeasonalCrops(@Query('month') month: number) {
    return this.cropsService.getSeasonalCrops(month);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get crop by ID' })
  @ApiResponse({ status: 200, description: 'Crop found' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.cropsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update crop (Admin only)' })
  @ApiResponse({ status: 200, description: 'Crop updated' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCropDto) {
    return this.cropsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate crop (Admin only)' })
  @ApiResponse({ status: 200, description: 'Crop deactivated' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.cropsService.delete(id);
    return { success: true, message: 'Crop deactivated successfully' };
  }
}