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
import { CenterStatus } from '@prisma/client';
const DISTANCE_WEIGHT = 0.3;
const QUEUE_WEIGHT = 0.25;
const AVAILABILITY_WEIGHT = 0.25;
const WAIT_TIME_WEIGHT = 0.2;
let CenterRecommendationAgent = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CenterRecommendationAgent = _classThis = class {
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
                value: new Logger(CenterRecommendationAgent.name)
            });
        }
        async recommend(input) {
            const { farmerId, cropId, date, latitude, longitude } = input;
            const centers = await this.prisma.procurementCenter.findMany({
                where: {
                    status: CenterStatus.ACTIVE,
                    centerCrops: { some: { id: cropId } },
                    deletedAt: null,
                },
                include: {
                    counters: true,
                    schedules: {
                        where: {
                            cropId,
                            date: {
                                gte: new Date(date.setHours(0, 0, 0, 0)),
                                lt: new Date(date.setHours(23, 59, 59, 999)),
                            },
                            isActive: true,
                        },
                        include: { slots: { where: { isActive: true } } },
                    },
                },
            });
            if (!centers.length) {
                return { recommendations: [], explanation: ['No centers available for this crop on this date'] };
            }
            const recommendations = [];
            for (const center of centers) {
                const distance = this.calculateDistance(latitude ?? 0, longitude ?? 0, center.latitude ?? 0, center.longitude ?? 0);
                const queuePrediction = await this.queuePredictionAgent.predict({ centerId: center.id, date });
                const availableSlots = this.getTotalAvailableSlots(center.schedules || []);
                const crowdLevel = await this.getCrowdLevel(center.id, date);
                const score = this.calculateCenterScore(distance, queuePrediction.estimatedWaitMinutes, availableSlots, crowdLevel);
                recommendations.push({
                    center,
                    score,
                    rank: 0,
                    distance: Math.round(distance * 10) / 10,
                    estimatedWait: queuePrediction.estimatedWaitMinutes,
                    availableSlots,
                    crowdLevel,
                    reason: this.generateCenterReason(center, distance, queuePrediction.estimatedWaitMinutes, availableSlots, crowdLevel),
                });
            }
            recommendations.sort((a, b) => b.score - a.score);
            recommendations.forEach((r, i) => { r.rank = i + 1; });
            return {
                recommendations: recommendations.slice(0, 5),
                explanation: [
                    `Found ${centers.length} centers for this crop`,
                    `Ranked by distance (${DISTANCE_WEIGHT * 100}%), queue (${QUEUE_WEIGHT * 100}%), availability (${AVAILABILITY_WEIGHT * 100}%), wait time (${WAIT_TIME_WEIGHT * 100}%)`,
                    'Weights are configurable',
                    'Farmer location is not stored or shared',
                ],
            };
        }
        calculateDistance(lat1, lng1, lat2, lng2) {
            if (!lat1 || !lng1 || !lat2 || !lng2)
                return 50;
            const R = 6371;
            const dLat = this.toRad(lat2 - lat1);
            const dLng = this.toRad(lng2 - lng1);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }
        toRad(deg) {
            return deg * (Math.PI / 180);
        }
        getTotalAvailableSlots(schedules) {
            let total = 0;
            for (const schedule of schedules) {
                for (const slot of schedule.slots) {
                    total += slot.capacity - slot.bookedCount;
                }
            }
            return total;
        }
        async getCrowdLevel(centerId, date) {
            const bookings = await this.prisma.booking.count({
                where: {
                    centerId,
                    scheduledDate: {
                        gte: new Date(date.setHours(0, 0, 0, 0)),
                        lt: new Date(date.setHours(23, 59, 59, 999)),
                    },
                    status: { not: 'CANCELLED' },
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
        calculateCenterScore(distance, estimatedWait, availableSlots, crowdLevel) {
            let score = 100;
            if (distance <= 10)
                score -= distance * 0.5;
            else if (distance <= 30)
                score -= 5 + (distance - 10) * 0.3;
            else
                score -= 11 + (distance - 30) * 0.2;
            score -= estimatedWait * QUEUE_WEIGHT * 2;
            score += Math.min(availableSlots * 2, 30) * AVAILABILITY_WEIGHT;
            switch (crowdLevel) {
                case 'LOW':
                    score += 15 * WAIT_TIME_WEIGHT;
                    break;
                case 'MEDIUM':
                    score += 5 * WAIT_TIME_WEIGHT;
                    break;
                case 'HIGH':
                    score -= 10 * WAIT_TIME_WEIGHT;
                    break;
                case 'CRITICAL':
                    score -= 25 * WAIT_TIME_WEIGHT;
                    break;
            }
            return Math.max(0, score);
        }
        generateCenterReason(center, distance, waitTime, availableSlots, crowdLevel) {
            const reasons = [];
            if (distance <= 10)
                reasons.push(`${distance.toFixed(1)} km away (very close)`);
            else if (distance <= 30)
                reasons.push(`${distance.toFixed(1)} km away`);
            else
                reasons.push(`${distance.toFixed(1)} km away (far)`);
            reasons.push(`${waitTime} min estimated wait`);
            reasons.push(`${availableSlots} slots available`);
            reasons.push(`${crowdLevel} crowd level`);
            return reasons.join('. ') + '.';
        }
    };
    __setFunctionName(_classThis, "CenterRecommendationAgent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CenterRecommendationAgent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CenterRecommendationAgent = _classThis;
})();
export { CenterRecommendationAgent };
