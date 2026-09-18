import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PricesService } from './prices.service';

@ApiTags('Prices')
@Controller('prices')
export class PricesController {
  constructor(private pricesService: PricesService) {}

  @Get()
  @ApiOperation({ summary: 'Get verified crop prices with source transparency (SIH26032)' })
  @ApiQuery({ name: 'cropCode', required: false })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'season', required: false })
  async getPrices(
    @Query('cropCode') cropCode?: string,
    @Query('district') district?: string,
    @Query('season') season?: string,
  ) {
    return this.pricesService.getAllPrices({ cropCode, district, season });
  }

  @Get('msp')
  @ApiOperation({ summary: 'Get official CACP Minimum Support Price (MSP) schedule 2024-25' })
  async getMspSchedule() {
    return this.pricesService.getMspSchedule();
  }

  @Get('latest/:cropCode')
  @ApiOperation({ summary: 'Get latest verified market price for a specific crop' })
  async getLatestPrice(@Param('cropCode') cropCode: string) {
    return this.pricesService.getLatestPriceByCrop(cropCode);
  }
}
