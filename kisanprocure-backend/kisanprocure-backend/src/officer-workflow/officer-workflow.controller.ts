import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OfficerWorkflowService } from './officer-workflow.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, QualityCheckStatus } from '@prisma/client';

class CallNextDto {
  counterId?: string;
}

class VerifyRequestDto {
  remarks?: string;
}

class RejectRequestDto {
  reason: string;
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

@ApiTags('Officer Workflow')
@Controller('officer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OFFICER, Role.ADMIN)
@ApiBearerAuth()
export class OfficerWorkflowController {
  constructor(private workflowService: OfficerWorkflowService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get officer center dashboard with statistics and recent records' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  async getDashboard(@Request() req: any) {
    return this.workflowService.getDashboard(req.user.sub, req.user.role);
  }

  @Get('queue')
  @ApiOperation({ summary: 'Get live token queue and counters for officer center' })
  @ApiResponse({ status: 200, description: 'Queue retrieved' })
  async getLiveQueue(@Request() req: any) {
    return this.workflowService.getLiveQueue(req.user.sub, req.user.role);
  }

  @Post('queue/call-next')
  @ApiOperation({ summary: 'Call next waiting token in queue' })
  @ApiResponse({ status: 200, description: 'Next token called' })
  async callNextToken(@Request() req: any, @Body() dto: CallNextDto) {
    return this.workflowService.callNextToken(req.user.sub, dto?.counterId, req.user.role);
  }

  @Post('tokens/:tokenId/mark-arrived')
  @ApiOperation({ summary: 'Mark token as arrived and prepare procurement record' })
  @ApiResponse({ status: 200, description: 'Token marked arrived' })
  async markArrived(
    @Request() req: any,
    @Param('tokenId', ParseUUIDPipe) tokenId: string,
  ) {
    return this.workflowService.markArrived(req.user.sub, tokenId, req.user.role);
  }

  @Get('procurement-requests')
  @ApiOperation({ summary: 'List procurement requests for officer center' })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'cropId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Procurement requests list' })
  async getProcurementRequests(
    @Request() req: any,
    @Query('state') state?: string,
    @Query('search') search?: string,
    @Query('cropId') cropId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.workflowService.getProcurementRequests(
      req.user.sub,
      { state, search, cropId, page: Number(page), limit: Number(limit) },
      req.user.role,
    );
  }

  @Get('procurement-requests/:id')
  @ApiOperation({ summary: 'Get single procurement request details with masked PII' })
  @ApiResponse({ status: 200, description: 'Request details' })
  async getProcurementRequestById(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.workflowService.getProcurementRequestById(req.user.sub, id, req.user.role);
  }

  @Post('procurement-requests/:id/verify')
  @ApiOperation({ summary: 'Verify booked procurement request (BOOKED -> SCHEDULED)' })
  @ApiResponse({ status: 200, description: 'Request verified' })
  async verifyRequest(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyRequestDto,
  ) {
    return this.workflowService.verifyRequest(req.user.sub, id, dto?.remarks, req.user.role);
  }

  @Post('procurement-requests/:id/reject')
  @ApiOperation({ summary: 'Reject procurement request' })
  @ApiResponse({ status: 200, description: 'Request rejected' })
  async rejectRequest(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectRequestDto,
  ) {
    return this.workflowService.rejectRequest(req.user.sub, id, dto.reason, req.user.role);
  }

  @Post('procurement-requests/:id/quality-check')
  @ApiOperation({ summary: 'Perform quality inspection and record parameters' })
  @ApiResponse({ status: 200, description: 'Quality check saved' })
  async performQualityCheck(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: QualityCheckDto,
  ) {
    return this.workflowService.performQualityCheck(req.user.sub, id, dto, req.user.role);
  }

  @Post('procurement-requests/:id/weigh')
  @ApiOperation({ summary: 'Perform gross and tare weighment' })
  @ApiResponse({ status: 200, description: 'Weighment recorded' })
  async performWeighment(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WeighmentDto,
  ) {
    return this.workflowService.performWeighment(req.user.sub, id, dto, req.user.role);
  }

  @Post('procurement-requests/:id/complete')
  @ApiOperation({ summary: 'Complete procurement with unit price & generate payment invoice' })
  @ApiResponse({ status: 200, description: 'Procurement finalized' })
  async completeProcurement(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteProcurementDto,
  ) {
    return this.workflowService.completeProcurement(req.user.sub, id, dto, req.user.role);
  }

  @Get('farmers')
  @ApiOperation({ summary: 'List farmers in officer district/center' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Farmers list' })
  async getFarmers(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.workflowService.getFarmers(
      req.user.sub,
      { search, page: Number(page), limit: Number(limit) },
      req.user.role,
    );
  }

  @Get('schedules')
  @ApiOperation({ summary: 'Get active procurement schedules for center' })
  @ApiResponse({ status: 200, description: 'Schedules retrieved' })
  async getSchedules(@Request() req: any) {
    return this.workflowService.getSchedules(req.user.sub, req.user.role);
  }
}
