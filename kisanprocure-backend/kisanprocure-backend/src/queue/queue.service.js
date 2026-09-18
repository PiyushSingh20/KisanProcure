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
let QueueService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var QueueService = _classThis = class {
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
                value: new Logger(QueueService.name)
            });
        }
        async getQueueStatus(centerId) {
            const cacheKey = `queue:status:${centerId}`;
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
            const currentTokens = await this.prisma.centerCounter.findMany({
                where: { centerId, currentTokenId: { not: null } },
                include: { currentToken: { include: { farmer: { include: { user: true } }, crop: true } } },
            });
            const queueEntries = await this.prisma.queueEntry.findMany({
                where: { centerId },
                orderBy: { position: 'asc' },
                take: 50,
                include: { token: { include: { farmer: { include: { user: true } }, crop: true } } },
            });
            const waitingCount = queueEntries.length;
            const avgProcessingTime = await this.getAverageProcessingTime(centerId);
            const queue = queueEntries.map((entry, index) => ({
                position: entry.position,
                token: entry.token,
                estimatedWait: (index + 1) * avgProcessingTime,
            }));
            const status = {
                centerId,
                centerName: center.name,
                activeCounters,
                totalCounters: center.counters.length,
                currentTokens: currentTokens.map(c => c.currentToken),
                queue,
                waitingCount,
                avgProcessingTime,
                estimatedTotalWait: waitingCount * avgProcessingTime,
                lastUpdated: new Date().toISOString(),
            };
            await this.redis.set(cacheKey, JSON.stringify(status), 30);
            return status;
        }
        async getQueueForFarmer(centerId, farmerId) {
            const token = await this.prisma.token.findFirst({
                where: {
                    farmerId,
                    centerId,
                    status: { in: [TokenStatus.WAITING, TokenStatus.CALLED, TokenStatus.ARRIVED, TokenStatus.QUALITY_CHECK, TokenStatus.WEIGHMENT] },
                },
                orderBy: { createdAt: 'desc' },
            });
            if (!token) {
                return { inQueue: false };
            }
            const queueStatus = await this.getQueueStatus(centerId);
            const farmerQueueEntry = queueStatus.queue.find((q) => q.token.id === token.id);
            return {
                inQueue: true,
                token,
                position: farmerQueueEntry?.position || token.queuePosition,
                estimatedWait: farmerQueueEntry?.estimatedWait || token.estimatedWait,
                currentToken: queueStatus.currentTokens[0] || null,
            };
        }
        async getCenterQueue(centerId, params = {}) {
            const { limit = 100, offset = 0 } = params;
            const entries = await this.prisma.queueEntry.findMany({
                where: { centerId },
                orderBy: { position: 'asc' },
                skip: offset,
                take: limit,
                include: { token: { include: { farmer: { include: { user: true } }, crop: true } } },
            });
            const total = await this.prisma.queueEntry.count({ where: { centerId } });
            const avgProcessingTime = await this.getAverageProcessingTime(centerId);
            return {
                entries: entries.map((entry, index) => ({
                    position: entry.position,
                    token: entry.token,
                    estimatedWait: (offset + index + 1) * avgProcessingTime,
                })),
                total,
                avgProcessingTime,
            };
        }
        async getAverageProcessingTime(centerId) {
            const cacheKey = `queue:avg-processing:${centerId}`;
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return parseInt(cached, 10);
            }
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
            if (completedTokens.length === 0) {
                await this.redis.set(cacheKey, '10', 300);
                return 10;
            }
            const totalMinutes = completedTokens.reduce((sum, t) => {
                if (t.calledAt && t.completedAt) {
                    return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
                }
                return sum;
            }, 0);
            const avg = Math.round(totalMinutes / completedTokens.length);
            await this.redis.set(cacheKey, avg.toString(), 300);
            return avg;
        }
        async getCenterStats(centerId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const [todayBookings, todayTokens, todayCompleted, activeQueue, avgWaitTime,] = await Promise.all([
                this.prisma.booking.count({ where: { centerId, scheduledDate: { gte: today, lt: tomorrow } } }),
                this.prisma.token.count({ where: { centerId, createdAt: { gte: today, lt: tomorrow } } }),
                this.prisma.token.count({ where: { centerId, status: TokenStatus.PAYMENT_COMPLETED, completedAt: { gte: today, lt: tomorrow } } }),
                this.prisma.queueEntry.count({ where: { centerId } }),
                this.getAverageProcessingTime(centerId),
            ]);
            return {
                centerId,
                todayBookings,
                todayTokens,
                todayCompleted,
                activeQueue,
                avgWaitTime,
                completionRate: todayTokens > 0 ? (todayCompleted / todayTokens) * 100 : 0,
            };
        }
        async invalidateCache(centerId) {
            await Promise.all([
                this.redis.del(`queue:status:${centerId}`),
                this.redis.del(`queue:avg-processing:${centerId}`),
            ]);
        }
    };
    __setFunctionName(_classThis, "QueueService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QueueService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QueueService = _classThis;
})();
export { QueueService };
