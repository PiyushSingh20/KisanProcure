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
import { TokenStatus } from '@prisma/client';
let QueuePredictionAgent = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var QueuePredictionAgent = _classThis = class {
        constructor(prisma, redis) {
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
                value: new Logger(QueuePredictionAgent.name)
            });
        }
        async predict(input) {
            const { centerId, date = new Date() } = input;
            const cacheKey = `queue:prediction:${centerId}:${date.toISOString().split('T')[0]}`;
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            const center = await this.prisma.procurementCenter.findUnique({
                where: { id: centerId },
                include: { counters: true },
            });
            if (!center) {
                throw new Error('Center not found');
            }
            const activeCounters = center.counters.filter(c => c.isActive).length;
            const queueLength = await this.prisma.queueEntry.count({ where: { centerId } });
            const avgProcessingTime = await this.getAverageProcessingTime(centerId);
            const currentTokenRate = await this.getCurrentTokenRate(centerId);
            const historicalData = await this.getHistoricalData(centerId, date);
            let estimatedWaitMinutes;
            let confidence;
            let queueTrend;
            let expectedServiceTime = avgProcessingTime;
            const explanation = [];
            if (historicalData.length >= 10) {
                const prediction = this.predictWithHistoricalData(queueLength, activeCounters, avgProcessingTime, currentTokenRate, historicalData);
                estimatedWaitMinutes = prediction.estimatedWait;
                confidence = prediction.confidence;
                queueTrend = prediction.trend;
                explanation.push(...prediction.explanation);
            }
            else {
                estimatedWaitMinutes = this.fallbackFormula(queueLength, activeCounters, avgProcessingTime);
                confidence = 0.6;
                queueTrend = currentTokenRate > avgProcessingTime ? 'INCREASING' : 'DECREASING';
                explanation.push(`${queueLength} farmers are ahead in queue`, `${activeCounters} active counter(s)`, `Average processing time is ${avgProcessingTime} minutes`, 'Using fallback formula (insufficient historical data)');
            }
            const result = {
                estimatedWaitMinutes: Math.max(0, Math.round(estimatedWaitMinutes)),
                confidence: Math.round(confidence * 100) / 100,
                expectedServiceTime: Math.round(expectedServiceTime),
                queueTrend,
                explanation,
            };
            await this.redis.set(cacheKey, JSON.stringify(result), 300);
            return result;
        }
        fallbackFormula(queueLength, activeCounters, avgProcessingTime) {
            if (activeCounters === 0)
                return queueLength * avgProcessingTime;
            return (queueLength * avgProcessingTime) / activeCounters;
        }
        async getAverageProcessingTime(centerId) {
            const completedTokens = await this.prisma.token.findMany({
                where: {
                    centerId,
                    status: { in: [TokenStatus.PROCUREMENT_COMPLETED, TokenStatus.PAYMENT_COMPLETED] },
                    calledAt: { not: null },
                    completedAt: { not: null },
                },
                take: 100,
                orderBy: { completedAt: 'desc' },
            });
            if (completedTokens.length === 0)
                return 10;
            const totalMinutes = completedTokens.reduce((sum, t) => {
                if (t.calledAt && t.completedAt) {
                    return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
                }
                return sum;
            }, 0);
            return Math.round(totalMinutes / completedTokens.length);
        }
        async getCurrentTokenRate(centerId) {
            const now = new Date();
            const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const calledTokens = await this.prisma.token.count({
                where: {
                    centerId,
                    calledAt: { gte: hourAgo, lte: now },
                },
            });
            return calledTokens;
        }
        async getHistoricalData(centerId, date) {
            const dayOfWeek = date.getDay();
            const hour = date.getHours();
            return this.prisma.agentPrediction.findMany({
                where: {
                    agentType: 'QUEUE_PREDICTION',
                    entityType: 'center',
                    entityId: centerId,
                    createdAt: {
                        gte: new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
                take: 100,
                orderBy: { createdAt: 'desc' },
            });
        }
        predictWithHistoricalData(queueLength, activeCounters, avgProcessingTime, currentTokenRate, historicalData) {
            const explanation = [];
            const similarConditions = historicalData.filter(h => {
                const input = h.inputSnapshot;
                return Math.abs(input.queueLength - queueLength) <= 3 &&
                    Math.abs(input.activeCounters - activeCounters) <= 1;
            });
            if (similarConditions.length >= 5) {
                const avgActualWait = similarConditions.reduce((sum, h) => {
                    const pred = h.prediction;
                    return sum + (pred.actualWait || pred.estimatedWaitMinutes || 0);
                }, 0) / similarConditions.length;
                explanation.push(`${queueLength} farmers ahead in queue`, `${activeCounters} active counter(s)`, `Average processing time: ${avgProcessingTime} min`, `Based on ${similarConditions.length} similar historical scenarios`);
                return {
                    estimatedWait: avgActualWait,
                    confidence: Math.min(0.9, 0.5 + similarConditions.length * 0.05),
                    trend: currentTokenRate > avgProcessingTime ? 'INCREASING' : 'DECREASING',
                    explanation,
                };
            }
            const recentPredictions = historicalData.slice(0, 10);
            const avgPredictedWait = recentPredictions.reduce((sum, h) => {
                const pred = h.prediction;
                return sum + (pred.estimatedWaitMinutes || 0);
            }, 0) / recentPredictions.length;
            explanation.push(`${queueLength} farmers ahead in queue`, `${activeCounters} active counter(s)`, `Average processing time: ${avgProcessingTime} min`, `Based on ${recentPredictions.length} recent predictions`);
            return {
                estimatedWait: avgPredictedWait,
                confidence: 0.7,
                trend: currentTokenRate > avgProcessingTime ? 'INCREASING' : 'DECREASING',
                explanation,
            };
        }
    };
    __setFunctionName(_classThis, "QueuePredictionAgent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QueuePredictionAgent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QueuePredictionAgent = _classThis;
})();
export { QueuePredictionAgent };
