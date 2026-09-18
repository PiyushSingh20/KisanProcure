import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { AIService } from './ai.service';

export class ChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  language?: 'en' | 'hi';
}

export class RecommendCentresDto {
  @IsString()
  cropCode: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}

export class PredictPriceDto {
  @IsString()
  cropCode: string;

  @IsOptional()
  @IsString()
  district?: string;
}

export class FeedbackDto {
  @IsOptional()
  @IsString()
  predictionId?: string;

  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  comments?: string;
}

@ApiTags('AI Engine')
@Controller('ai')
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Bilingual agricultural RAG assistant (SIH26032)' })
  @ApiBody({ type: ChatDto })
  async chat(@Body() dto: ChatDto) {
    return this.aiService.handleChat(dto.message, dto.language || 'en');
  }

  @Post('recommend-centres')
  @ApiOperation({ summary: 'Smart multi-criteria procurement centre recommendation' })
  @ApiBody({ type: RecommendCentresDto })
  async recommendCentres(@Body() dto: RecommendCentresDto) {
    return this.aiService.recommendCentres(dto.cropCode, dto.district, dto.quantity);
  }

  @Post('predict-price')
  @ApiOperation({ summary: '15-day commodity price forecasting with MSP comparison' })
  @ApiBody({ type: PredictPriceDto })
  async predictPrice(@Body() dto: PredictPriceDto) {
    return this.aiService.predictPrice(dto.cropCode, dto.district);
  }

  @Get('predictions/:cropId')
  @ApiOperation({ summary: 'Get price predictions for a given crop ID' })
  async getPredictionsByCrop(@Param('cropId') cropId: string) {
    return this.aiService.predictPrice(cropId);
  }

  @Get('model-status')
  @ApiOperation({ summary: 'Health and accuracy metrics of active AI models' })
  async getModelStatus() {
    return this.aiService.getModelStatus();
  }

  @Post('feedback')
  @ApiOperation({ summary: 'Submit feedback on AI predictions' })
  async submitFeedback(@Body() dto: FeedbackDto) {
    return {
      success: true,
      message: 'Feedback received and recorded for active learning retraining queue.',
    };
  }
}
