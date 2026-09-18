var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Post, Get, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
class AgentTaskDto {
    constructor() {
        Object.defineProperty(this, "agentType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "taskType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "input", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let AgentsController = (() => {
    let _classDecorators = [ApiTags('Agents'), Controller('agents'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _executeTask_decorators;
    let _getQueuePrediction_decorators;
    let _getSlotRecommendation_decorators;
    let _getCenterRecommendation_decorators;
    let _getCrowdPrediction_decorators;
    let _askSupport_decorators;
    let _getOperationsRecommendations_decorators;
    let _getDemandForecast_decorators;
    let _getAgentTasks_decorators;
    var AgentsController = _classThis = class {
        constructor(orchestrator) {
            Object.defineProperty(this, "orchestrator", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), orchestrator)
            });
        }
        async executeTask(req, dto) {
            const farmer = await this.orchestrator['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            return this.orchestrator.executeTask({
                ...dto,
                farmerId: farmer?.id,
                userRole: req.user.role,
            });
        }
        async getQueuePrediction(centerId, date) {
            return this.orchestrator.executeTask({
                agentType: 'QUEUE_PREDICTION',
                taskType: 'predict',
                input: { centerId, date: date ? new Date(date) : new Date() },
            });
        }
        async getSlotRecommendation(req, cropId, centerId, date) {
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
        async getCenterRecommendation(req, cropId, date, latitude, longitude) {
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
        async getCrowdPrediction(centerId, date) {
            return this.orchestrator.executeTask({
                agentType: 'CROWD_PREDICTION',
                taskType: 'predict',
                input: { centerId, date: new Date(date) },
            });
        }
        async askSupport(req, dto) {
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
        async getOperationsRecommendations(centerId) {
            return this.orchestrator.executeTask({
                agentType: 'PROCUREMENT_OPERATIONS',
                taskType: 'analyze',
                input: { centerId },
            });
        }
        async getDemandForecast(centerId, cropId, date) {
            return this.orchestrator.executeTask({
                agentType: 'DEMAND_FORECAST',
                taskType: 'forecast',
                input: { centerId, cropId, date: date ? new Date(date) : new Date() },
            });
        }
        async getAgentTasks(agentType, status, page = 1, limit = 20) {
            return this.orchestrator.getTaskHistory({ agentType, status, page: Number(page), limit: Number(limit) });
        }
    };
    __setFunctionName(_classThis, "AgentsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _executeTask_decorators = [Post('execute'), ApiOperation({ summary: 'Execute an agent task' }), ApiResponse({ status: 200, description: 'Agent task executed' })];
        _getQueuePrediction_decorators = [Get('queue-prediction'), ApiOperation({ summary: 'Get queue prediction for a center' }), ApiQuery({ name: 'centerId', required: true, type: String }), ApiQuery({ name: 'date', required: false, type: String }), ApiResponse({ status: 200, description: 'Queue prediction' })];
        _getSlotRecommendation_decorators = [Get('slot-recommendation'), ApiOperation({ summary: 'Get slot recommendations for a farmer' }), ApiQuery({ name: 'cropId', required: true, type: String }), ApiQuery({ name: 'centerId', required: true, type: String }), ApiQuery({ name: 'date', required: true, type: String }), ApiResponse({ status: 200, description: 'Slot recommendations' })];
        _getCenterRecommendation_decorators = [Get('center-recommendation'), ApiOperation({ summary: 'Get center recommendations for a farmer' }), ApiQuery({ name: 'cropId', required: true, type: String }), ApiQuery({ name: 'date', required: true, type: String }), ApiQuery({ name: 'latitude', required: false, type: Number }), ApiQuery({ name: 'longitude', required: false, type: Number }), ApiResponse({ status: 200, description: 'Center recommendations' })];
        _getCrowdPrediction_decorators = [Get('crowd-prediction'), ApiOperation({ summary: 'Get crowd prediction for a center' }), ApiQuery({ name: 'centerId', required: true, type: String }), ApiQuery({ name: 'date', required: true, type: String }), ApiResponse({ status: 200, description: 'Crowd prediction' })];
        _askSupport_decorators = [Post('support'), ApiOperation({ summary: 'Ask KisanSahayak agent a question' }), ApiResponse({ status: 200, description: 'Agent response' })];
        _getOperationsRecommendations_decorators = [Get('operations-recommendations'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Get operational recommendations (Admin/Officer only)' }), ApiQuery({ name: 'centerId', required: true, type: String }), ApiResponse({ status: 200, description: 'Operational recommendations' })];
        _getDemandForecast_decorators = [Get('demand-forecast'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Get demand forecast (Admin only)' }), ApiQuery({ name: 'centerId', required: false, type: String }), ApiQuery({ name: 'cropId', required: false, type: String }), ApiQuery({ name: 'date', required: true, type: String }), ApiResponse({ status: 200, description: 'Demand forecast' })];
        _getAgentTasks_decorators = [Get('tasks'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Get agent task history (Admin only)' }), ApiQuery({ name: 'agentType', required: false, type: String }), ApiQuery({ name: 'status', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Agent tasks' })];
        __esDecorate(_classThis, null, _executeTask_decorators, { kind: "method", name: "executeTask", static: false, private: false, access: { has: obj => "executeTask" in obj, get: obj => obj.executeTask }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getQueuePrediction_decorators, { kind: "method", name: "getQueuePrediction", static: false, private: false, access: { has: obj => "getQueuePrediction" in obj, get: obj => obj.getQueuePrediction }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSlotRecommendation_decorators, { kind: "method", name: "getSlotRecommendation", static: false, private: false, access: { has: obj => "getSlotRecommendation" in obj, get: obj => obj.getSlotRecommendation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCenterRecommendation_decorators, { kind: "method", name: "getCenterRecommendation", static: false, private: false, access: { has: obj => "getCenterRecommendation" in obj, get: obj => obj.getCenterRecommendation }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCrowdPrediction_decorators, { kind: "method", name: "getCrowdPrediction", static: false, private: false, access: { has: obj => "getCrowdPrediction" in obj, get: obj => obj.getCrowdPrediction }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _askSupport_decorators, { kind: "method", name: "askSupport", static: false, private: false, access: { has: obj => "askSupport" in obj, get: obj => obj.askSupport }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getOperationsRecommendations_decorators, { kind: "method", name: "getOperationsRecommendations", static: false, private: false, access: { has: obj => "getOperationsRecommendations" in obj, get: obj => obj.getOperationsRecommendations }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDemandForecast_decorators, { kind: "method", name: "getDemandForecast", static: false, private: false, access: { has: obj => "getDemandForecast" in obj, get: obj => obj.getDemandForecast }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAgentTasks_decorators, { kind: "method", name: "getAgentTasks", static: false, private: false, access: { has: obj => "getAgentTasks" in obj, get: obj => obj.getAgentTasks }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AgentsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AgentsController = _classThis;
})();
export { AgentsController };
