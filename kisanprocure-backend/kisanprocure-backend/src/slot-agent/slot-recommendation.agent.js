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
import { BookingStatus } from '@prisma/client';
let SlotRecommendationAgent = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SlotRecommendationAgent = _classThis = class {
        constructor(prisma, redis, queuePredictionAgent) {
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
                value: new Logger(SlotRecommendationAgent.name)
            });
        }
        async recommend(input) {
            const { farmerId, cropId, centerId, date } = input;
            const farmer = await this.prisma.farmer.findUnique({
                where: { id: farmerId },
                include: { user: true },
            });
            if (!farmer) {
                throw new Error('Farmer not found');
            }
            const schedule = await this.prisma.schedule.findFirst({
                where: {
                    centerId,
                    cropId,
                    date: {
                        gte: new Date(date.setHours(0, 0, 0, 0)),
                        lt: new Date(date.setHours(23, 59, 59, 999)),
                    },
                    isActive: true,
                },
                include: {
                    slots: {
                        where: { isActive: true },
                        orderBy: { startTime: 'asc' },
                    },
                },
            });
            if (!schedule || !schedule.slots.length) {
                return { recommendations: [], explanation: ['No available slots for this crop and date'] };
            }
            const queuePrediction = await this.queuePredictionAgent.predict({ centerId, date });
            const crowdPrediction = await this.getCrowdLevel(centerId, date);
            const recommendations = [];
            for (let i = 0; i < schedule.slots.length; i++) {
                const slot = schedule.slots[i];
                const availableCapacity = slot.capacity - slot.bookedCount;
                if (availableCapacity <= 0)
                    continue;
                const slotWaitTime = this.estimateSlotWaitTime(slot, queuePrediction, i, schedule.slots.length);
                const score = this.calculateSlotScore(slot, slotWaitTime, crowdPrediction, farmer);
                recommendations.push({
                    slot,
                    score,
                    rank: 0,
                    reason: this.generateReason(slot, slotWaitTime, crowdPrediction, availableCapacity),
                    estimatedWait: slotWaitTime,
                    crowdLevel: crowdPrediction,
                });
            }
            recommendations.sort((a, b) => b.score - a.score);
            recommendations.forEach((r, i) => { r.rank = i + 1; });
            const topRecommendations = recommendations.slice(0, 3);
            return {
                recommendations: topRecommendations,
                explanation: [
                    `Found ${recommendations.length} available slots`,
                    `Current queue prediction: ${queuePrediction.estimatedWaitMinutes} min wait`,
                    `Expected crowd level: ${crowdPrediction}`,
                    'Slots ranked by wait time, crowd level, and availability',
                ],
            };
        }
        estimateSlotWaitTime(slot, queuePrediction, slotIndex, totalSlots) {
            const baseWait = queuePrediction.estimatedWaitMinutes;
            const slotPositionFactor = 1 + (slotIndex / totalSlots) * 0.5;
            return Math.round(baseWait * slotPositionFactor);
        }
        calculateSlotScore(slot, waitTime, crowdLevel, farmer) {
            let score = 100;
            score -= waitTime * 0.5;
            switch (crowdLevel) {
                case 'LOW':
                    score += 20;
                    break;
                case 'MEDIUM':
                    score += 10;
                    break;
                case 'HIGH':
                    score -= 10;
                    break;
                case 'CRITICAL':
                    score -= 30;
                    break;
            }
            const availabilityRatio = (slot.capacity - slot.bookedCount) / slot.capacity;
            score += availabilityRatio * 15;
            if (slot.startTime >= '09:00' && slot.startTime <= '11:00') {
                score += 5;
            }
            return Math.max(0, score);
        }
        generateReason(slot, waitTime, crowdLevel, availableCapacity) {
            const reasons = [];
            if (waitTime <= 15)
                reasons.push('Low expected wait time');
            else if (waitTime <= 30)
                reasons.push('Moderate expected wait time');
            else
                reasons.push('Higher expected wait time');
            if (crowdLevel === 'LOW')
                reasons.push('Low crowd expected');
            else if (crowdLevel === 'MEDIUM')
                reasons.push('Moderate crowd expected');
            else
                reasons.push('High crowd expected');
            reasons.push(`${availableCapacity} of ${slot.capacity} slots available`);
            return reasons.join('. ') + '.';
        }
        async getCrowdLevel(centerId, date) {
            const bookings = await this.prisma.booking.count({
                where: {
                    centerId,
                    scheduledDate: {
                        gte: new Date(date.setHours(0, 0, 0, 0)),
                        lt: new Date(date.setHours(23, 59, 59, 999)),
                    },
                    status: { not: BookingStatus.CANCELLED },
                },
            });
            const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
            if (!center)
                return 'MEDIUM';
            const utilization = center.capacityPerDay > 0 ? (bookings / center.capacityPerDay) * 100 : 0;
            if (utilization >= 90)
                return 'CRITICAL';
            if (utilization >= 70)
                return 'HIGH';
            if (utilization >= 40)
                return 'MEDIUM';
            return 'LOW';
        }
    };
    __setFunctionName(_classThis, "SlotRecommendationAgent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SlotRecommendationAgent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SlotRecommendationAgent = _classThis;
})();
export { SlotRecommendationAgent };
