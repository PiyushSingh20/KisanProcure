var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
let AgentOrchestratorService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AgentOrchestratorService = _classThis = class {
        constructor(prisma, queuePredictionAgent, slotRecommendationAgent, centerRecommendationAgent, crowdPredictionAgent, notificationAgent, kisanSahayakAgent, procurementOperationsAgent, demandForecastAgent) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
            Object.defineProperty(this, "queuePredictionAgent", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: queuePredictionAgent
            });
            Object.defineProperty(this, "slotRecommendationAgent", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: slotRecommendationAgent
            });
            Object.defineProperty(this, "centerRecommendationAgent", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: centerRecommendationAgent
            });
            Object.defineProperty(this, "crowdPredictionAgent", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: crowdPredictionAgent
            });
            Object.defineProperty(this, "notificationAgent", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: notificationAgent
            });
            Object.defineProperty(this, "kisanSahayakAgent", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: kisanSahayakAgent
            });
            Object.defineProperty(this, "procurementOperationsAgent", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: procurementOperationsAgent
            });
            Object.defineProperty(this, "demandForecastAgent", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: demandForecastAgent
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(AgentOrchestratorService.name)
            });
            Object.defineProperty(this, "agents", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Map()
            });
            this.agents.set('QUEUE_PREDICTION', this.queuePredictionAgent);
            this.agents.set('SLOT_RECOMMENDATION', this.slotRecommendationAgent);
            this.agents.set('CENTER_RECOMMENDATION', this.centerRecommendationAgent);
            this.agents.set('CROWD_PREDICTION', this.crowdPredictionAgent);
            this.agents.set('NOTIFICATION', this.notificationAgent);
            this.agents.set('FARMER_SUPPORT', this.kisanSahayakAgent);
            this.agents.set('PROCUREMENT_OPERATIONS', this.procurementOperationsAgent);
            this.agents.set('DEMAND_FORECAST', this.demandForecastAgent);
        }
        async executeTask(input) {
            const { agentType, taskType, input: taskInput, farmerId, centerId, userRole } = input;
            const agent = this.agents.get(agentType);
            if (!agent) {
                throw new BadRequestException(`Unknown agent type: ${agentType}`);
            }
            const task = await this.prisma.agentTask.create({
                data: {
                    agentType: agentType,
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
                let result;
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
                            agentType: agentType,
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
            }
            catch (error) {
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
        validatePermissions(agentType, taskType, userRole) {
            const adminOnlyAgents = ['PROCUREMENT_OPERATIONS', 'DEMAND_FORECAST'];
            const officerAgents = ['PROCUREMENT_OPERATIONS'];
            if (adminOnlyAgents.includes(agentType) && userRole !== Role.ADMIN) {
                throw new BadRequestException(`Agent ${agentType} requires ADMIN role`);
            }
            if (officerAgents.includes(agentType) && userRole !== Role.ADMIN && userRole !== Role.OFFICER) {
                throw new BadRequestException(`Agent ${agentType} requires OFFICER or ADMIN role`);
            }
        }
        async getTaskHistory(params) {
            const { agentType, status, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (agentType)
                where.agentType = agentType;
            if (status)
                where.status = status;
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
        async getAgentHealth() {
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
                    where: { agentType: type, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
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
    };
    __setFunctionName(_classThis, "AgentOrchestratorService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AgentOrchestratorService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AgentOrchestratorService = _classThis;
})();
export { AgentOrchestratorService };
