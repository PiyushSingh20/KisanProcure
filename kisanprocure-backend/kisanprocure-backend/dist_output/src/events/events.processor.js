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
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
let NotificationProcessor = (() => {
    let _classDecorators = [Processor('notifications')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = WorkerHost;
    let _instanceExtraInitializers = [];
    let _onCompleted_decorators;
    let _onFailed_decorators;
    var NotificationProcessor = _classThis = class extends _classSuper {
        constructor(prisma, notificationsService) {
            super();
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), prisma)
            });
            Object.defineProperty(this, "notificationsService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: notificationsService
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(NotificationProcessor.name)
            });
        }
        async process(job) {
            const { userId, type, channel, title, message, data } = job.data;
            await this.notificationsService.create({
                userId,
                type,
                channel: channel || 'IN_APP',
                title,
                message,
                data,
            });
            this.logger.log(`Notification sent to user ${userId}: ${title}`);
            return { success: true };
        }
        onCompleted(job) {
            this.logger.debug(`Notification job ${job.id} completed`);
        }
        onFailed(job, error) {
            this.logger.error(`Notification job ${job.id} failed: ${error.message}`);
        }
    };
    __setFunctionName(_classThis, "NotificationProcessor");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _onCompleted_decorators = [OnWorkerEvent('completed')];
        _onFailed_decorators = [OnWorkerEvent('failed')];
        __esDecorate(_classThis, null, _onCompleted_decorators, { kind: "method", name: "onCompleted", static: false, private: false, access: { has: obj => "onCompleted" in obj, get: obj => obj.onCompleted }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onFailed_decorators, { kind: "method", name: "onFailed", static: false, private: false, access: { has: obj => "onFailed" in obj, get: obj => obj.onFailed }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationProcessor = _classThis;
})();
export { NotificationProcessor };
let QueuePredictionProcessor = (() => {
    let _classDecorators = [Processor('queue-prediction')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = WorkerHost;
    var QueuePredictionProcessor = _classThis = class extends _classSuper {
        constructor(prisma, queuePredictionAgent) {
            super();
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
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(QueuePredictionProcessor.name)
            });
        }
        async process(job) {
            const { centerId, date } = job.data;
            const prediction = await this.queuePredictionAgent.predict({ centerId, date });
            await this.prisma.agentPrediction.create({
                data: {
                    agentType: 'QUEUE_PREDICTION',
                    entityType: 'center',
                    entityId: centerId,
                    inputSnapshot: { centerId, date },
                    prediction: JSON.parse(JSON.stringify(prediction)),
                    confidence: prediction.confidence,
                    modelVersion: '1.0',
                },
            });
            this.logger.log(`Queue prediction updated for center ${centerId}`);
            return prediction;
        }
    };
    __setFunctionName(_classThis, "QueuePredictionProcessor");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QueuePredictionProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QueuePredictionProcessor = _classThis;
})();
export { QueuePredictionProcessor };
let AnalyticsProcessor = (() => {
    let _classDecorators = [Processor('analytics')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = WorkerHost;
    var AnalyticsProcessor = _classThis = class extends _classSuper {
        constructor(prisma, analyticsService) {
            super();
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
            Object.defineProperty(this, "analyticsService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: analyticsService
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(AnalyticsProcessor.name)
            });
        }
        async process(job) {
            const { centerId, event, quantity, amount } = job.data;
            this.logger.log(`Analytics update for center ${centerId}: ${event}`);
            return { success: true };
        }
    };
    __setFunctionName(_classThis, "AnalyticsProcessor");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnalyticsProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnalyticsProcessor = _classThis;
})();
export { AnalyticsProcessor };
let AuditLogProcessor = (() => {
    let _classDecorators = [Processor('audit-logs')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = WorkerHost;
    var AuditLogProcessor = _classThis = class extends _classSuper {
        constructor(prisma) {
            super();
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(AuditLogProcessor.name)
            });
        }
        async process(job) {
            const { eventType, payload, timestamp } = job.data;
            await this.prisma.auditLog.create({
                data: {
                    actorId: payload.actorId || 'system',
                    actorRole: payload.actorRole || 'SYSTEM',
                    action: eventType,
                    entity: payload.entity || 'unknown',
                    entityId: payload.entityId || 'unknown',
                    before: payload.before,
                    after: payload.after,
                    ipAddress: payload.ipAddress,
                    userAgent: payload.userAgent,
                    createdAt: new Date(timestamp),
                },
            });
            return { success: true };
        }
    };
    __setFunctionName(_classThis, "AuditLogProcessor");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuditLogProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuditLogProcessor = _classThis;
})();
export { AuditLogProcessor };
let AgentTaskProcessor = (() => {
    let _classDecorators = [Processor('agent-tasks')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = WorkerHost;
    let _instanceExtraInitializers = [];
    let _onCompleted_decorators;
    let _onFailed_decorators;
    var AgentTaskProcessor = _classThis = class extends _classSuper {
        constructor(prisma) {
            super();
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), prisma)
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(AgentTaskProcessor.name)
            });
        }
        async process(job) {
            const { agentType, taskType, input, farmerId, centerId } = job.data;
            const task = await this.prisma.agentTask.create({
                data: {
                    agentType: agentType,
                    taskType,
                    input,
                    status: 'PROCESSING',
                    farmerId,
                    centerId,
                },
            });
            this.logger.log(`Agent task ${task.id} started: ${agentType} - ${taskType}`);
            return { taskId: task.id };
        }
        onCompleted(job) {
            this.logger.debug(`Agent task job ${job.id} completed`);
        }
        onFailed(job, error) {
            this.logger.error(`Agent task job ${job.id} failed: ${error.message}`);
        }
    };
    __setFunctionName(_classThis, "AgentTaskProcessor");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _onCompleted_decorators = [OnWorkerEvent('completed')];
        _onFailed_decorators = [OnWorkerEvent('failed')];
        __esDecorate(_classThis, null, _onCompleted_decorators, { kind: "method", name: "onCompleted", static: false, private: false, access: { has: obj => "onCompleted" in obj, get: obj => obj.onCompleted }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onFailed_decorators, { kind: "method", name: "onFailed", static: false, private: false, access: { has: obj => "onFailed" in obj, get: obj => obj.onFailed }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AgentTaskProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AgentTaskProcessor = _classThis;
})();
export { AgentTaskProcessor };
