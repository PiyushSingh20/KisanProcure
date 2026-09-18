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
import { Injectable, Logger } from '@nestjs/common';
import { QueueEvents } from 'bullmq';
let EventsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EventsService = _classThis = class {
        constructor(notificationsQueue, queuePredictionQueue, analyticsQueue, auditLogsQueue, agentTasksQueue, prisma, redis) {
            Object.defineProperty(this, "notificationsQueue", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: notificationsQueue
            });
            Object.defineProperty(this, "queuePredictionQueue", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: queuePredictionQueue
            });
            Object.defineProperty(this, "analyticsQueue", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: analyticsQueue
            });
            Object.defineProperty(this, "auditLogsQueue", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: auditLogsQueue
            });
            Object.defineProperty(this, "agentTasksQueue", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: agentTasksQueue
            });
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
            Object.defineProperty(this, "redis", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: redis
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(EventsService.name)
            });
            Object.defineProperty(this, "queueEvents", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
        }
        onModuleInit() {
            this.queueEvents = new QueueEvents('notifications', {
                connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
            });
            this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
                this.logger.debug(`Job ${jobId} completed`);
            });
            this.queueEvents.on('failed', ({ jobId, failedReason }) => {
                this.logger.error(`Job ${jobId} failed: ${failedReason}`);
            });
        }
        async publish(event) {
            this.logger.log(`Publishing event: ${event.type}`);
            switch (event.type) {
                case 'SlotBooked':
                    await this.handleSlotBooked(event.payload);
                    break;
                case 'TokenGenerated':
                    await this.handleTokenGenerated(event.payload);
                    break;
                case 'TokenCalled':
                    await this.handleTokenCalled(event.payload);
                    break;
                case 'QueueUpdated':
                    await this.handleQueueUpdated(event.payload);
                    break;
                case 'ProcurementCompleted':
                    await this.handleProcurementCompleted(event.payload);
                    break;
                case 'PaymentCompleted':
                    await this.handlePaymentCompleted(event.payload);
                    break;
                case 'ComplaintCreated':
                    await this.handleComplaintCreated(event.payload);
                    break;
                default:
                    this.logger.debug(`No specific handler for event: ${event.type}`);
            }
            await this.queueAuditLog(event);
        }
        async handleSlotBooked(payload) {
            await this.notificationsQueue.add('send-notification', {
                userId: payload.farmerUserId,
                type: 'SLOT_BOOKED',
                title: 'Slot Booked Successfully',
                message: `Your slot has been booked for ${payload.scheduledDate} at ${payload.centerName}`,
                data: { bookingId: payload.bookingId, slotId: payload.slotId },
            });
            await this.queuePredictionQueue.add('update-predictions', {
                centerId: payload.centerId,
                date: payload.scheduledDate,
            });
        }
        async handleTokenGenerated(payload) {
            await this.notificationsQueue.add('send-notification', {
                userId: payload.farmerUserId,
                type: 'SLOT_BOOKED',
                title: 'Token Generated',
                message: `Your token ${payload.tokenNumber} has been generated. Queue position: ${payload.queuePosition}`,
                data: { tokenId: payload.tokenId, tokenNumber: payload.tokenNumber, queuePosition: payload.queuePosition },
            });
        }
        async handleTokenCalled(payload) {
            await this.notificationsQueue.add('send-notification', {
                userId: payload.farmerUserId,
                type: 'TOKEN_CALLED',
                title: 'Token Called',
                message: `Your token ${payload.tokenNumber} has been called. Please proceed to the counter.`,
                data: { tokenId: payload.tokenId, tokenNumber: payload.tokenNumber, counterNumber: payload.counterNumber },
            });
            await this.queuePredictionQueue.add('update-predictions', {
                centerId: payload.centerId,
            });
            await this.analyticsQueue.add('update-metrics', {
                centerId: payload.centerId,
                event: 'token_called',
            });
        }
        async handleQueueUpdated(payload) {
            await this.queuePredictionQueue.add('update-predictions', {
                centerId: payload.centerId,
            });
        }
        async handleProcurementCompleted(payload) {
            await this.notificationsQueue.add('send-notification', {
                userId: payload.farmerUserId,
                type: 'PROCUREMENT_COMPLETED',
                title: 'Procurement Completed',
                message: `Your procurement of ${payload.quantity} ${payload.unit} of ${payload.cropName} has been completed.`,
                data: { procurementId: payload.procurementId, quantity: payload.quantity, cropName: payload.cropName },
            });
            await this.analyticsQueue.add('update-metrics', {
                centerId: payload.centerId,
                event: 'procurement_completed',
                quantity: payload.quantity,
                amount: payload.totalAmount,
            });
        }
        async handlePaymentCompleted(payload) {
            await this.notificationsQueue.add('send-notification', {
                userId: payload.farmerUserId,
                type: 'PAYMENT_COMPLETED',
                title: 'Payment Completed',
                message: `Payment of ₹${payload.amount} has been completed for procurement ${payload.recordNumber}. Receipt: ${payload.receiptNumber}`,
                data: { paymentId: payload.paymentId, receiptId: payload.receiptId, amount: payload.amount },
            });
        }
        async handleComplaintCreated(payload) {
            await this.notificationsQueue.add('send-notification', {
                userId: payload.farmerUserId,
                type: 'COMPLAINT_RECEIVED',
                title: 'Complaint Registered',
                message: `Your complaint ${payload.complaintNumber} has been registered: ${payload.subject}`,
                data: { complaintId: payload.complaintId, complaintNumber: payload.complaintNumber },
            });
        }
        async queueAuditLog(event) {
            await this.auditLogsQueue.add('audit-log', {
                eventType: event.type,
                payload: event.payload,
                timestamp: new Date().toISOString(),
            });
        }
        async scheduleNotification(userId, data, delayMs) {
            await this.notificationsQueue.add('send-notification', data, { delay: delayMs });
        }
        async triggerAgentTask(agentType, taskType, input, farmerId, centerId) {
            await this.agentTasksQueue.add('execute-agent-task', {
                agentType,
                taskType,
                input,
                farmerId,
                centerId,
            });
        }
        async getQueueStats() {
            const queues = [
                this.notificationsQueue,
                this.queuePredictionQueue,
                this.analyticsQueue,
                this.auditLogsQueue,
                this.agentTasksQueue,
            ];
            return Promise.all(queues.map(async (queue) => {
                const counts = await queue.getJobCounts();
                return { name: queue.name, ...counts };
            }));
        }
    };
    __setFunctionName(_classThis, "EventsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        EventsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return EventsService = _classThis;
})();
export { EventsService };
