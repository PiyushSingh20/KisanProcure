import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, ComplaintStatus } from '@prisma/client';

class CreateComplaintDto {
  centerId?: string;
  cropId?: string;
  tokenId?: string;
  subject: string;
  description: string;
  priority?: number;
}

class UpdateComplaintDto {
  status?: ComplaintStatus;
  assignedToId?: string;
  resolution?: string;
  priority?: number;
}

@ApiTags('Complaints')
@Controller('complaints')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new complaint' })
  @ApiResponse({ status: 201, description: 'Complaint created' })
  async create(@Request() req: any, @Body() dto: CreateComplaintDto) {
    const farmer = await this.complaintsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    return this.complaintsService.create({ ...dto, farmerId: farmer.id });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current farmer complaints' })
  @ApiQuery({ name: 'status', required: false, enum: ComplaintStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Complaints list' })
  async getMyComplaints(
    @Request() req: any,
    @Query('status') status?: ComplaintStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const farmer = await this.complaintsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.complaintsService.getFarmerComplaints(farmer.id, { status, page: Number(page), limit: Number(limit) });
  }

  @Get('assigned/me')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Get complaints assigned to current officer' })
  @ApiQuery({ name: 'status', required: false, enum: ComplaintStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Assigned complaints' })
  async getAssignedComplaints(
    @Request() req: any,
    @Query('status') status?: ComplaintStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const officer = await this.complaintsService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
    if (!officer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.complaintsService.getAssignedComplaints(officer.id, { status, page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by ID' })
  @ApiResponse({ status: 200, description: 'Complaint found' })
  @ApiResponse({ status: 404, description: 'Complaint not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const complaint = await this.complaintsService.findById(id);
    if (!complaint) {
      return { success: false, message: 'Complaint not found' };
    }
    const farmer = await this.complaintsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (farmer && complaint.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
      return { success: false, message: 'Unauthorized' };
    }
    return complaint;
  }

  @Get('number/:complaintNumber')
  @ApiOperation({ summary: 'Get complaint by complaint number' })
  @ApiResponse({ status: 200, description: 'Complaint found' })
  async findByComplaintNumber(@Param('complaintNumber') complaintNumber: string) {
    return this.complaintsService.findByComplaintNumber(complaintNumber);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Update complaint (Admin/Officer only)' })
  @ApiResponse({ status: 200, description: 'Complaint updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: UpdateComplaintDto,
  ) {
    return this.complaintsService.update(id, dto, req.user.role);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'List all complaints (Admin/Officer only)' })
  @ApiQuery({ name: 'farmerId', required: false, type: String })
  @ApiQuery({ name: 'centerId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ComplaintStatus })
  @ApiQuery({ name: 'assignedToId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Complaints list' })
  async findAll(
    @Query('farmerId') farmerId?: string,
    @Query('centerId') centerId?: string,
    @Query('status') status?: ComplaintStatus,
    @Query('assignedToId') assignedToId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.complaintsService.findAll({ farmerId, centerId, status, assignedToId, page: Number(page), limit: Number(limit) });
  }
}