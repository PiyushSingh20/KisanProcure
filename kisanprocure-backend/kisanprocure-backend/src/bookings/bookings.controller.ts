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
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, BookingStatus } from '@prisma/client';

class CreateBookingDto {
  centerId: string;
  cropId: string;
  slotId: string;
  quantity: number;
  expectedPrice?: number;
  notes?: string;
}

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiResponse({ status: 409, description: 'Slot fully booked or already booked' })
  async create(@Request() req: any, @Body() dto: CreateBookingDto) {
    const farmer = await this.bookingsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    return this.bookingsService.create({ ...dto, farmerId: farmer.id });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current farmer bookings' })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Bookings list' })
  async getMyBookings(
    @Request() req: any,
    @Query('status') status?: BookingStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const farmer = await this.bookingsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { data: [], total: 0, page: 1, limit: 20 };
    }
    return this.bookingsService.getFarmerBookings(farmer.id, { status, page: Number(page), limit: Number(limit) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking found' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const booking = await this.bookingsService.findById(id);
    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }
    const farmer = await this.bookingsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (farmer && booking.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
      return { success: false, message: 'Unauthorized' };
    }
    return booking;
  }

  @Get(':id/booking-number/:bookingNumber')
  @ApiOperation({ summary: 'Get booking by booking number' })
  @ApiResponse({ status: 200, description: 'Booking found' })
  async findByBookingNumber(@Param('bookingNumber') bookingNumber: string) {
    return this.bookingsService.findByBookingNumber(bookingNumber);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Update booking (Admin/Officer only)' })
  @ApiResponse({ status: 200, description: 'Booking updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status?: BookingStatus; notes?: string },
  ) {
    return this.bookingsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 400, description: 'Cannot cancel this booking' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
    @Body('reason') reason?: string,
  ) {
    const farmer = await this.bookingsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    return this.bookingsService.cancel(id, farmer.id, reason);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'List all bookings (Admin/Officer only)' })
  @ApiQuery({ name: 'farmerId', required: false, type: String })
  @ApiQuery({ name: 'centerId', required: false, type: String })
  @ApiQuery({ name: 'cropId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Bookings list' })
  async findAll(
    @Query('farmerId') farmerId?: string,
    @Query('centerId') centerId?: string,
    @Query('cropId') cropId?: string,
    @Query('status') status?: BookingStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.bookingsService.findAll({
      farmerId,
      centerId,
      cropId,
      status,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      page: Number(page),
      limit: Number(limit),
    });
  }
}