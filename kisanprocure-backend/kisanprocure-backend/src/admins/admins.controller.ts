import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

class UpdateAdminDto {
  permissions?: string[];
}

@ApiTags('Admins')
@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile' })
  async getMyProfile(@Request() req: any) {
    return this.adminsService.findByUserId(req.user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current admin profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMyProfile(@Request() req: any, @Body() dto: UpdateAdminDto) {
    const admin = await this.adminsService.findByUserId(req.user.sub);
    if (!admin) {
      return { success: false, message: 'Admin profile not found' };
    }
    return this.adminsService.update(admin.id, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200, description: 'System statistics' })
  async getStats() {
    return this.adminsService.getSystemStats();
  }

  @Get()
  @ApiOperation({ summary: 'List all admins' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Admins list' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.adminsService.findAll({ page: Number(page), limit: Number(limit), search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiResponse({ status: 200, description: 'Admin found' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update admin' })
  @ApiResponse({ status: 200, description: 'Admin updated' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminDto) {
    return this.adminsService.update(id, dto);
  }
}