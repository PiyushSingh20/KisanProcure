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
import { TokensService } from './tokens.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, TokenStatus } from '@prisma/client';

@ApiTags('Tokens')
@Controller('tokens')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TokensController {
  constructor(private tokensService: TokensService) {}

  @Post('generate/:bookingId')
  @ApiOperation({ summary: 'Generate token from booking' })
  @ApiResponse({ status: 201, description: 'Token generated' })
  async generateFromBooking(@Param('bookingId', ParseUUIDPipe) bookingId: string, @Request() req: any) {
    const booking = await this.tokensService['prisma'].booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }
    const farmer = await this.tokensService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (farmer && booking.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
      return { success: false, message: 'Unauthorized' };
    }
    return this.tokensService.generateFromBooking(bookingId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current farmer tokens' })
  @ApiQuery({ name: 'status', required: false, enum: TokenStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tokens list' })
  async getMyTokens(
    @Request() req: any,
    @Query('status') status?: TokenStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const farmer = await this.tokensService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.tokensService.getFarmerTokens(farmer.id, { status, page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get token by ID' })
  @ApiResponse({ status: 200, description: 'Token found' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = await this.tokensService.findById(id);
    if (!token) {
      return { success: false, message: 'Token not found' };
    }
    const farmer = await this.tokensService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (farmer && token.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
      return { success: false, message: 'Unauthorized' };
    }
    return token;
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get token status with queue position' })
  @ApiResponse({ status: 200, description: 'Token status' })
  async getTokenStatus(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const token = await this.tokensService.findById(id);
    if (!token) {
      return { success: false, message: 'Token not found' };
    }
    const farmer = await this.tokensService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (farmer && token.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
      return { success: false, message: 'Unauthorized' };
    }
    return this.tokensService.getTokenStatus(id);
  }

  @Get('number/:tokenNumber')
  @ApiOperation({ summary: 'Get token by token number' })
  @ApiResponse({ status: 200, description: 'Token found' })
  async findByTokenNumber(@Param('tokenNumber') tokenNumber: string) {
    return this.tokensService.findByTokenNumber(tokenNumber);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Update token status (Admin/Officer only)' })
  @ApiResponse({ status: 200, description: 'Token status updated' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: TokenStatus },
  ) {
    return this.tokensService.updateStatus(id, dto.status);
  }

  @Post('call-next')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Call next token in queue (Officer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Next token called' })
  async callNextToken(
    @Request() req: any,
    @Body() dto: { centerId: string; counterId: string },
  ) {
    const officer = await this.tokensService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
    if (!officer) {
      return { success: false, message: 'Officer profile not found' };
    }
    return this.tokensService.callNextToken(dto.centerId, dto.counterId, officer.id);
  }

  @Post('complete-counter/:counterId')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Complete current token at counter (Officer/Admin only)' })
  @ApiResponse({ status: 200, description: 'Token completed at counter' })
  async completeAtCounter(
    @Request() req: any,
    @Param('counterId', ParseUUIDPipe) counterId: string,
  ) {
    const officer = await this.tokensService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
    if (!officer) {
      return { success: false, message: 'Officer profile not found' };
    }
    return this.tokensService.completeTokenAtCounter(counterId, officer.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'List all tokens (Admin/Officer only)' })
  @ApiQuery({ name: 'farmerId', required: false, type: String })
  @ApiQuery({ name: 'centerId', required: false, type: String })
  @ApiQuery({ name: 'cropId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: TokenStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tokens list' })
  async findAll(
    @Query('farmerId') farmerId?: string,
    @Query('centerId') centerId?: string,
    @Query('cropId') cropId?: string,
    @Query('status') status?: TokenStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.tokensService.findAll({ farmerId, centerId, cropId, status, page: Number(page), limit: Number(limit) });
  }
}