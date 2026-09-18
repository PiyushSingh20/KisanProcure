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
import { OfficersService } from './officers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

class UpdateOfficerDto {
  centerId?: string;
  designation?: string;
  permissions?: string[];
}

@ApiTags('Officers')
@Controller('officers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OfficersController {
  constructor(private officersService: OfficersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current officer profile' })
  @ApiResponse({ status: 200, description: 'Officer profile' })
  async getMyProfile(@Request() req: any) {
    return this.officersService.findByUserId(req.user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current officer profile (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMyProfile(@Request() req: any, @Body() dto: UpdateOfficerDto) {
    const officer = await this.officersService.findByUserId(req.user.sub);
    if (!officer) {
      return { success: false, message: 'Officer profile not found' };
    }
    return this.officersService.update(officer.id, dto);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get current officer statistics' })
  @ApiResponse({ status: 200, description: 'Officer statistics' })
  async getMyStats(@Request() req: any) {
    const officer = await this.officersService.findByUserId(req.user.sub);
    if (!officer) {
      return { success: false, message: 'Officer profile not found' };
    }
    return this.officersService.getOfficerStats(officer.id);
  }

  @Get('me/center')
  @ApiOperation({ summary: 'Get current officer assigned center' })
  @ApiResponse({ status: 200, description: 'Assigned center' })
  async getMyCenter(@Request() req: any) {
    const officer = await this.officersService.findByUserId(req.user.sub);
    if (!officer) {
      return { success: false, message: 'Officer profile not found' };
    }
    return this.officersService.getAssignedCenter(officer.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all officers (Admin only)' })
  @ApiQuery({ name: 'centerId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Officers list' })
  async findAll(
    @Query('centerId') centerId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.officersService.findAll({ centerId, page: Number(page), limit: Number(limit), search });
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get officer by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Officer found' })
  @ApiResponse({ status: 404, description: 'Officer not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.officersService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update officer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Officer updated' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOfficerDto) {
    return this.officersService.update(id, dto);
  }
}