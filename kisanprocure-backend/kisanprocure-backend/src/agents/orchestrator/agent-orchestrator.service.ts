import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { QueuePredictionAgent } from '../../queue-agent/queue-prediction.agent';
import { SlotRecommendationAgent } from '../../slot-agent/slot-recommendation.agent';
import { CenterRecommendationAgent } from '../../center-agent/center-recommendation.agent';
import { CrowdPredictionAgent } from '../../crowd-agent/crowd-prediction.agent';
import { NotificationAgent } from '../../notification-agent/notification.agent';
import { KisanSahayakAgent } from '../../support-agent/kisan-sahayak.agent';
import { ProcurementOperationsAgent } from '../../operations-agent/procurement-operations.agent';
import { DemandForecastAgent } from '../../demand-agent/demand-forecast.agent';
import { AgentType, AgentTask, AgentPrediction, Role } from '@prisma/client';

interface TaskInput {
  agentType: string;
  taskType: string;
  input: any;
  farmerId?: string;
  centerId?: string;
  userRole?: Role;
}

interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);
  private agents: Map<string, any> = new Map();

  constructor(
    private prisma: PrismaService,
    private queuePredictionAgent: QueuePredictionAgent,
    private slotRecommendationAgent: SlotRecommendationAgent,
    private centerRecommendationAgent: CenterRecommendationAgent,
    private crowdPredictionAgent: CrowdPredictionAgent,
    private notificationAgent: NotificationAgent,
    private kisanSahayakAgent: KisanSahayakAgent,
    private procurementOperationsAgent: ProcurementOperationsAgent,
    private demandForecastAgent: DemandForecastAgent,
  ) {
    this.agents.set('QUEUE_PREDICTION', this.queuePredictionAgent);
    this.agents.set('SLOT_RECOMMENDATION', this.slotRecommendationAgent);
    this.agents.set('CENTER_RECOMMENDATION', this.centerRecommendationAgent);
    this.agents.set('CROWD_PREDICTION', this.crowdPredictionAgent);
    this.agents.set('NOTIFICATION', this.notificationAgent);
    this.agents.set('FARMER_SUPPORT', this.kisanSahayakAgent);
    this.agents.set('PROCUREMENT_OPERATIONS', this.procurementOperationsAgent);
    this.agents.set('DEMAND_FORECAST', this.demandForecastAgent);
  }

  async executeTask(input: TaskInput): Promise<any> {
    const { agentType, taskType, input: taskInput, farmerId, centerId, userRole } = input;

    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new BadRequestException(`Unknown agent type: ${agentType}`);
    }

    const task = await this.prisma.agentTask.create({
      data: {
        agentType: agentType as AgentType,
        taskType,
        input: taskInput,
        status: 'PROCESSING',
        farmerId,
        centerId,
      },
    });

    const startTime = Date.now();

    try {
      this.validatePermissions(agentType, taskType, userRole || 'FARMER');

      let result: any;
      switch (agentType) {
        case 'QUEUE_PREDICTION':
          result = await agent.predict(taskInput);
          break;
        case 'SLOT_RECOMMENDATION':
          result = await agent.recommend(taskInput);
          break;
        case 'CENTER_RECOMMENDATION':
          result = await agent.recommend(taskInput);
          break;
        case 'CROWD_PREDICTION':
          result = await agent.predict(taskInput);
          break;
        case 'NOTIFICATION':
          result = await agent.determineNotifications(taskInput);
          break;
        case 'FARMER_SUPPORT':
          result = await agent.answer(taskInput);
          break;
        case 'PROCUREMENT_OPERATIONS':
          result = await agent.analyze(taskInput);
          break;
        case 'DEMAND_FORECAST':
          result = await agent.forecast(taskInput);
          break;
        default:
          throw new BadRequestException(`Unsupported agent type: ${agentType}`);
      }

      const executionTime = Date.now() - startTime;

      await this.prisma.agentTask.update({
        where: { id: task.id },
        data: {
          output: result,
          status: 'COMPLETED',
          executionTimeMs: executionTime,
          confidence: result.confidence,
          completedAt: new Date(),
        },
      });

      if (result.prediction) {
        await this.prisma.agentPrediction.create({
          data: {
            agentType: agentType as AgentType,
            entityType: taskInput.centerId ? 'center' : 'farmer',
            entityId: taskInput.centerId || farmerId || 'unknown',
            inputSnapshot: taskInput,
            prediction: result.prediction || result,
            confidence: result.confidence || 0.5,
            modelVersion: '1.0',
          },
        });
      }

      return {
        agent: agentType,
        version: '1.0',
        result,
        executionTimeMs: executionTime,
      };
    } catch (error) {
      await this.prisma.agentTask.update({
        where: { id: task.id },
        data: {
          status: 'FAILED',
          error: error.message,
          executionTimeMs: Date.now() - startTime,
          completedAt: new Date(),
        },
      });

      this.logger.error(`Agent task ${task.id} failed: ${error.message}`);
      throw error;
    }
  }

  private validatePermissions(agentType: string, taskType: string, userRole: Role): void {
    const adminOnlyAgents = ['PROCUREMENT_OPERATIONS', 'DEMAND_FORECAST'];
    const officerAgents = ['PROCUREMENT_OPERATIONS'];

    if (adminOnlyAgents.includes(agentType) && userRole !== Role.ADMIN) {
      throw new BadRequestException(`Agent ${agentType} requires ADMIN role`);
    }

    if (officerAgents.includes(agentType) && userRole !== Role.ADMIN && userRole !== Role.OFFICER) {
      throw new BadRequestException(`Agent ${agentType} requires OFFICER or ADMIN role`);
    }
  }

  async getTaskHistory(params: {
    agentType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const { agentType, status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (agentType) where.agentType = agentType;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.agentTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agentTask.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getAgentHealth(): Promise<any> {
    const agentTypes = [
      'QUEUE_PREDICTION',
      'SLOT_RECOMMENDATION',
      'CENTER_RECOMMENDATION',
      'CROWD_PREDICTION',
      'NOTIFICATION',
      'FARMER_SUPPORT',
      'PROCUREMENT_OPERATIONS',
      'DEMAND_FORECAST',
    ];

    return Promise.all(agentTypes.map(async (type) => {
      const recentTasks = await this.prisma.agentTask.findMany({
        where: { agentType: type as AgentType, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        orderBy: { createdAt: 'desc' },
      });

      const total = recentTasks.length;
      const completed = recentTasks.filter(t => t.status === 'COMPLETED').length;
      const failed = recentTasks.filter(t => t.status === 'FAILED').length;
      const avgExecutionTime = total > 0
        ? recentTasks.filter(t => t.executionTimeMs).reduce((sum, t) => sum + (t.executionTimeMs || 0), 0) / total
        : 0;
      const avgConfidence = total > 0
        ? recentTasks.filter(t => t.confidence).reduce((sum, t) => sum + (t.confidence || 0), 0) / total
        : 0;

      return {
        agentType: type,
        totalTasks24h: total,
        successRate: total > 0 ? (completed / total) * 100 : 0,
        failureRate: total > 0 ? (failed / total) * 100 : 0,
        avgExecutionTimeMs: Math.round(avgExecutionTime),
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        status: failed / Math.max(total, 1) > 0.1 ? 'DEGRADED' : 'HEALTHY',
      };
    }));
  }
}