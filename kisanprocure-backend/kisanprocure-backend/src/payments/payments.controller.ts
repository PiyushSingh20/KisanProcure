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
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, PaymentStatus, ProcurementState } from '@prisma/client';

class CreatePaymentDto {
  procurementId: string;
  amount: number;
  provider?: string;
}

class VerifyPaymentDto {
  providerRef: string;
  status: PaymentStatus;
}

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.ADMIN)
  @ApiOperation({ summary: 'Create payment for procurement (Officer/Admin only)' })
  @ApiResponse({ status: 201, description: 'Payment created' })
  async createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current farmer payments' })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Payments list' })
  async getMyPayments(
    @Request() req: any,
    @Query('status') status?: PaymentStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const farmer = await this.paymentsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.paymentsService.getFarmerPayments(farmer.id, { status, page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const payment = await this.paymentsService.findById(id);
    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }
    const farmer = await this.paymentsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (farmer && payment.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
      return { success: false, message: 'Unauthorized' };
    }
    return payment;
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get payment status' })
  @ApiResponse({ status: 200, description: 'Payment status' })
  async getPaymentStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.getPaymentStatus(id);
  }

  @Get('number/:paymentNumber')
  @ApiOperation({ summary: 'Get payment by payment number' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  async findByPaymentNumber(@Param('paymentNumber') paymentNumber: string) {
    return this.paymentsService.findByPaymentNumber(paymentNumber);
  }

  @Post(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Verify payment (Admin/Officer only)' })
  @ApiResponse({ status: 200, description: 'Payment verified' })
  async verifyPayment(@Param('id', ParseUUIDPipe) id: string, @Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment({ paymentId: id, ...dto });
  }

  @Post(':id/mock-success')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mock payment success (Admin only - for demo)' })
  @ApiResponse({ status: 200, description: 'Payment marked as successful' })
  async mockSuccess(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.mockPaymentSuccess(id);
  }

  @Post(':id/mock-failure')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mock payment failure (Admin only - for demo)' })
  @ApiResponse({ status: 200, description: 'Payment marked as failed' })
  async mockFailure(@Param('id', ParseUUIDPipe) id: string, @Body('reason') reason: string) {
    return this.paymentsService.mockPaymentFailure(id, reason);
  }

  @Get('receipt/:receiptId')
  @ApiOperation({ summary: 'Get receipt by ID' })
  @ApiResponse({ status: 200, description: 'Receipt found' })
  async getReceipt(@Param('receiptId', ParseUUIDPipe) receiptId: string) {
    return this.paymentsService.getReceipt(receiptId);
  }

  @Get('receipt/number/:receiptNumber')
  @ApiOperation({ summary: 'Get receipt by receipt number' })
  @ApiResponse({ status: 200, description: 'Receipt found' })
  async getReceiptByNumber(@Param('receiptNumber') receiptNumber: string) {
    return this.paymentsService.getReceiptByNumber(receiptNumber);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'List all payments (Admin/Officer only)' })
  @ApiQuery({ name: 'farmerId', required: false, type: String })
  @ApiQuery({ name: 'procurementId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Payments list' })
  async findAll(
    @Query('farmerId') farmerId?: string,
    @Query('procurementId') procurementId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.paymentsService.findAll({ farmerId, procurementId, status, page: Number(page), limit: Number(limit) });
  }
}