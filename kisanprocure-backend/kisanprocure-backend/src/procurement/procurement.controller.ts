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
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, ProcurementState, QualityCheckStatus, TokenStatus } from '@prisma/client';

class StartProcurementDto {
  tokenId: string;
  quantity: number;
}

class QualityCheckDto {
  moistureContent?: number;
  foreignMatter?: number;
  damagedGrains?: number;
  testWeight?: number;
  status: QualityCheckStatus;
  notes?: string;
}

class WeighmentDto {
  grossWeight: number;
  tareWeight: number;
}

class CompleteProcurementDto {
  unitPrice: number;
}

@ApiTags('Procurement')
@Controller('procurement')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProcurementController {
  constructor(private procurementService: ProcurementService) {}

  @Post('start')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Start procurement process (Officer/Admin only)' })
  @ApiResponse({ status: 201, description: 'Procurement started' })
  async startProcurement(@Request() req: any, @Body() dto: StartProcurementDto) {
    const officer = await this.procurementService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
    if (!officer) {
      return { success: false, message: 'Officer profile not found' };
    }
    return this.procurementService.startProcurement({ ...dto, officerId: officer.id });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current farmer procurement history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Procurement history' })
  async getMyProcurementHistory(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const farmer = await this.procurementService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.procurementService.getFarmerProcurementHistory(farmer.id, { page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get procurement record by ID' })
  @ApiResponse({ status: 200, description: 'Procurement record found' })
  @ApiResponse({ status: 404, description: 'Procurement record not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const record = await this.procurementService.findById(id);
    if (!record) {
      return { success: false, message: 'Procurement record not found' };
    }
    const farmer = await this.procurementService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (farmer && record.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
      return { success: false, message: 'Unauthorized' };
    }
    return record;
  }

  @Get('number/:recordNumber')
  @ApiOperation({ summary: 'Get procurement record by record number' })
  @ApiResponse({ status: 200, description: 'Procurement record found' })
  async findByRecordNumber(@Param('recordNumber') recordNumber: string) {
    return this.procurementService.findByRecordNumber(recordNumber);
  }

  @Put(':id/state')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Update procurement state (Admin/Officer only)' })
  @ApiResponse({ status: 200, description: 'State updated' })
  async updateState(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: { state: ProcurementState },
  ) {
    const officer = await this.procurementService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
    return this.procurementService.updateState(id, dto.state, officer?.id);
  }

  @Post(':id/quality-check')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Perform quality check (Officer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Quality check recorded' })
  async qualityCheck(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: QualityCheckDto,
  ) {
    const officer = await this.procurementService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
    if (!officer) {
      return { success: false, message: 'Officer profile not found' };
    }
    return this.procurementService.performQualityCheck({ ...dto, procurementId: id, officerId: officer.id });
  }

  @Post(':id/weighment')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Perform weighment (Officer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Weighment recorded' })
  async weighment(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: WeighmentDto,
  ) {
    const officer = await this.procurementService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
    if (!officer) {
      return { success: false, message: 'Officer profile not found' };
    }
    return this.procurementService.performWeighment({ ...dto, procurementId: id, officerId: officer.id });
  }

  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Complete procurement with pricing (Officer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Procurement completed' })
  async completeProcurement(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body() dto: CompleteProcurementDto,
  ) {
    const officer = await this.procurementService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
    if (!officer) {
      return { success: false, message: 'Officer profile not found' };
    }
    return this.procurementService.completeProcurement(id, officer.id, dto.unitPrice);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'List all procurement records (Admin/Officer only)' })
  @ApiQuery({ name: 'farmerId', required: false, type: String })
  @ApiQuery({ name: 'centerId', required: false, type: String })
  @ApiQuery({ name: 'cropId', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, enum: ProcurementState })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Procurement records list' })
  async findAll(
    @Query('farmerId') farmerId?: string,
    @Query('centerId') centerId?: string,
    @Query('cropId') cropId?: string,
    @Query('state') state?: ProcurementState,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.procurementService.findAll({
      farmerId,
      centerId,
      cropId,
      state,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      page: Number(page),
      limit: Number(limit),
    });
  }
}