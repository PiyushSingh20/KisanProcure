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
import { AnalyticsService } from './analytics.service';
import { ImpactAnalyticsService } from './impact-analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
    private impactAnalyticsService: ImpactAnalyticsService,
  ) {}

  @Get('overview')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get system overview (Admin only)' })
  @ApiResponse({ status: 200, description: 'System overview' })
  async getSystemOverview() {
    return this.analyticsService.getSystemOverview();
  }

  @Get('impact')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get impact metrics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Impact metrics' })
  async getImpactMetrics() {
    return this.impactAnalyticsService.calculateImpactMetrics();
  }

  @Get('center/:centerId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Get center analytics (Admin/Officer only)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Center analytics' })
  async getCenterAnalytics(
    @Param('centerId', ParseUUIDPipe) centerId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getCenterAnalytics(centerId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
  }

  @Get('centers')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all centers analytics (Admin only)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'All centers analytics' })
  async getAllCentersAnalytics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getAllCentersAnalytics(dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
  }

  @Get('queue/:centerId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Get queue analytics for center (Admin/Officer only)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Queue analytics' })
  async getQueueAnalytics(
    @Param('centerId', ParseUUIDPipe) centerId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getQueueAnalytics(centerId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
  }

  @Get('bookings')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Get booking analytics (Admin/Officer only)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Booking analytics' })
  async getBookingAnalytics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getBookingAnalytics(dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
  }

  @Get('procurement')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Get procurement analytics (Admin/Officer only)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Procurement analytics' })
  async getProcurementAnalytics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getProcurementAnalytics(dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
  }

  @Get('payments')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Get payment analytics (Admin/Officer only)' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Payment analytics' })
  async getPaymentAnalytics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getPaymentAnalytics(dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
  }

  @Get('farmer/me')
  @ApiOperation({ summary: 'Get current farmer analytics' })
  @ApiResponse({ status: 200, description: 'Farmer analytics' })
  async getMyAnalytics(@Request() req: any) {
    const farmer = await this.analyticsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    return this.analyticsService.getFarmerAnalytics(farmer.id);
  }

  @Get('farmer/:farmerId/impact')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Get farmer impact metrics (Admin/Officer only)' })
  @ApiResponse({ status: 200, description: 'Farmer impact metrics' })
  async getFarmerImpact(@Param('farmerId', ParseUUIDPipe) farmerId: string) {
    return this.impactAnalyticsService.getFarmerImpact(farmerId);
  }
}