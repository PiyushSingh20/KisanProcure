import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentOrchestratorService } from './orchestrator/agent-orchestrator.service';
import { QueuePredictionAgent } from '../queue-agent/queue-prediction.agent';
import { SlotRecommendationAgent } from '../slot-agent/slot-recommendation.agent';
import { CenterRecommendationAgent } from '../center-agent/center-recommendation.agent';
import { CrowdPredictionAgent } from '../crowd-agent/crowd-prediction.agent';
import { NotificationAgent } from '../notification-agent/notification.agent';
import { KisanSahayakAgent } from '../support-agent/kisan-sahayak.agent';
import { ProcurementOperationsAgent } from '../operations-agent/procurement-operations.agent';
import { DemandForecastAgent } from '../demand-agent/demand-forecast.agent';

@Module({
  controllers: [AgentsController],
  providers: [
    AgentOrchestratorService,
    QueuePredictionAgent,
    SlotRecommendationAgent,
    CenterRecommendationAgent,
    CrowdPredictionAgent,
    NotificationAgent,
    KisanSahayakAgent,
    ProcurementOperationsAgent,
    DemandForecastAgent,
  ],
  exports: [
    AgentOrchestratorService,
    QueuePredictionAgent,
    SlotRecommendationAgent,
    CenterRecommendationAgent,
    CrowdPredictionAgent,
    NotificationAgent,
    KisanSahayakAgent,
    ProcurementOperationsAgent,
    DemandForecastAgent,
  ],
})
export class AgentsModule {}