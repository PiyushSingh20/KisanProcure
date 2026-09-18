import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AgentOrchestratorService } from './orchestrator/agent-orchestrator.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

class AgentTaskDto {
  agentType: string;
  taskType: string;
  input: any;
}

@ApiTags('Agents')
@Controller('agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentsController {
  constructor(private orchestrator: AgentOrchestratorService) {}

  @Post('execute')
  @ApiOperation({ summary: 'Execute an agent task' })
  @ApiResponse({ status: 200, description: 'Agent task executed' })
  async executeTask(@Request() req: any, @Body() dto: AgentTaskDto) {
    const farmer = await this.orchestrator['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    return this.orchestrator.executeTask({
      ...dto,
      farmerId: farmer?.id,
      userRole: req.user.role,
    });
  }

  @Get('queue-prediction')
  @ApiOperation({ summary: 'Get queue prediction for a center' })
  @ApiQuery({ name: 'centerId', required: true, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Queue prediction' })
  async getQueuePrediction(
    @Query('centerId') centerId: string,
    @Query('date') date?: string,
  ) {
    return this.orchestrator.executeTask({
      agentType: 'QUEUE_PREDICTION',
      taskType: 'predict',
      input: { centerId, date: date ? new Date(date) : new Date() },
    });
  }

  @Get('slot-recommendation')
  @ApiOperation({ summary: 'Get slot recommendations for a farmer' })
  @ApiQuery({ name: 'cropId', required: true, type: String })
  @ApiQuery({ name: 'centerId', required: true, type: String })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Slot recommendations' })
  async getSlotRecommendation(
    @Request() req: any,
    @Query('cropId') cropId: string,
    @Query('centerId') centerId: string,
    @Query('date') date: string,
  ) {
    const farmer = await this.orchestrator['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    return this.orchestrator.executeTask({
      agentType: 'SLOT_RECOMMENDATION',
      taskType: 'recommend',
      input: { farmerId: farmer.id, cropId, centerId, date: new Date(date) },
      farmerId: farmer.id,
    });
  }

  @Get('center-recommendation')
  @ApiOperation({ summary: 'Get center recommendations for a farmer' })
  @ApiQuery({ name: 'cropId', required: true, type: String })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiQuery({ name: 'latitude', required: false, type: Number })
  @ApiQuery({ name: 'longitude', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Center recommendations' })
  async getCenterRecommendation(
    @Request() req: any,
    @Query('cropId') cropId: string,
    @Query('date') date: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
  ) {
    const farmer = await this.orchestrator['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    return this.orchestrator.executeTask({
      agentType: 'CENTER_RECOMMENDATION',
      taskType: 'recommend',
      input: { farmerId: farmer.id, cropId, date: new Date(date), latitude, longitude },
      farmerId: farmer.id,
    });
  }

  @Get('crowd-prediction')
  @ApiOperation({ summary: 'Get crowd prediction for a center' })
  @ApiQuery({ name: 'centerId', required: true, type: String })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Crowd prediction' })
  async getCrowdPrediction(
    @Query('centerId') centerId: string,
    @Query('date') date: string,
  ) {
    return this.orchestrator.executeTask({
      agentType: 'CROWD_PREDICTION',
      taskType: 'predict',
      input: { centerId, date: new Date(date) },
    });
  }

  @Post('support')
  @ApiOperation({ summary: 'Ask KisanSahayak agent a question' })
  @ApiResponse({ status: 200, description: 'Agent response' })
  async askSupport(@Request() req: any, @Body() dto: { question: string; context?: any }) {
    const farmer = await this.orchestrator['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
    if (!farmer) {
      return { success: false, message: 'Farmer profile not found' };
    }
    return this.orchestrator.executeTask({
      agentType: 'FARMER_SUPPORT',
      taskType: 'answer',
      input: { question: dto.question, context: dto.context },
      farmerId: farmer.id,
    });
  }

  @Get('operations-recommendations')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.OFFICER)
  @ApiOperation({ summary: 'Get operational recommendations (Admin/Officer only)' })
  @ApiQuery({ name: 'centerId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Operational recommendations' })
  async getOperationsRecommendations(
    @Query('centerId') centerId: string,
  ) {
    return this.orchestrator.executeTask({
      agentType: 'PROCUREMENT_OPERATIONS',
      taskType: 'analyze',
      input: { centerId },
    });
  }

  @Get('demand-forecast')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get demand forecast (Admin only)' })
  @ApiQuery({ name: 'centerId', required: false, type: String })
  @ApiQuery({ name: 'cropId', required: false, type: String })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Demand forecast' })
  async getDemandForecast(
    @Query('centerId') centerId?: string,
    @Query('cropId') cropId?: string,
    @Query('date') date?: string,
  ) {
    return this.orchestrator.executeTask({
      agentType: 'DEMAND_FORECAST',
      taskType: 'forecast',
      input: { centerId, cropId, date: date ? new Date(date) : new Date() },
    });
  }

  @Get('tasks')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get agent task history (Admin only)' })
  @ApiQuery({ name: 'agentType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Agent tasks' })
  async getAgentTasks(
    @Query('agentType') agentType?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.orchestrator.getTaskHistory({ agentType, status, page: Number(page), limit: Number(limit) });
  }
}