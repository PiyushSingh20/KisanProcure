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
let CrowdPredictionAgent = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CrowdPredictionAgent = _classThis = class {
        constructor(prisma) {
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
                value: new Logger(CrowdPredictionAgent.name)
            });
        }
        async predict(input) {
            const { centerId, date } = input;
            const center = await this.prisma.procurementCenter.findUnique({
                where: { id: centerId },
                include: { counters: true },
            });
            if (!center) {
                throw new Error('Center not found');
            }
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const month = date.getMonth() + 1;
            const historicalBookings = await this.getHistoricalBookings(centerId, dayOfWeek, month);
            const currentBookings = await this.getCurrentBookings(centerId, date);
            const cropSeasonality = await this.getCropSeasonality(centerId, month);
            const previousAttendance = await this.getPreviousAttendance(centerId, date);
            const expectedFarmers = this.calculateExpectedFarmers(historicalBookings, currentBookings, cropSeasonality, previousAttendance, isWeekend);
            const activeCounters = center.counters.filter(c => c.isActive).length;
            const avgProcessingTime = await this.getAverageProcessingTime(centerId);
            const expectedQueueLength = Math.max(0, expectedFarmers - activeCounters * 8);
            const expectedWaitTime = activeCounters > 0 ? (expectedQueueLength * avgProcessingTime) / activeCounters : expectedQueueLength * avgProcessingTime;
            const utilization = center.capacityPerDay > 0 ? (expectedFarmers / center.capacityPerDay) * 100 : 0;
            let crowdLevel;
            if (utilization >= 90)
                crowdLevel = 'CRITICAL';
            else if (utilization >= 70)
                crowdLevel = 'HIGH';
            else if (utilization >= 40)
                crowdLevel = 'MEDIUM';
            else
                crowdLevel = 'LOW';
            const recommendedStaffing = Math.ceil(expectedFarmers / 40);
            const factors = [
                `Day of week: ${this.getDayName(dayOfWeek)} (${isWeekend ? 'weekend' : 'weekday'})`,
                `Historical avg bookings: ${historicalBookings.toFixed(1)}`,
                `Current bookings: ${currentBookings}`,
                `Crop seasonality factor: ${cropSeasonality.toFixed(2)}`,
                `Previous attendance rate: ${(previousAttendance * 100).toFixed(1)}%`,
                `Active counters: ${activeCounters}`,
                `Avg processing time: ${avgProcessingTime} min`,
                `Capacity utilization: ${utilization.toFixed(1)}%`,
            ];
            const confidence = this.calculateConfidence(historicalBookings, currentBookings, cropSeasonality);
            return {
                crowdLevel,
                expectedQueueLength: Math.round(expectedQueueLength),
                expectedWaitTime: Math.round(expectedWaitTime),
                recommendedStaffing: Math.max(1, recommendedStaffing),
                confidence: Math.round(confidence * 100) / 100,
                factors,
            };
        }
        async getHistoricalBookings(centerId, dayOfWeek, month) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const bookings = await this.prisma.booking.groupBy({
                by: ['scheduledDate'],
                where: {
                    centerId,
                    scheduledDate: { gte: thirtyDaysAgo },
                    status: { not: BookingStatus.CANCELLED },
                },
                _count: true,
            });
            const sameDayBookings = bookings.filter(b => {
                const d = new Date(b.scheduledDate);
                return d.getDay() === dayOfWeek && d.getMonth() + 1 === month;
            });
            if (sameDayBookings.length === 0)
                return centerId ? 20 : 0;
            return sameDayBookings.reduce((sum, b) => sum + b._count, 0) / sameDayBookings.length;
        }
        async getCurrentBookings(centerId, date) {
            return this.prisma.booking.count({
                where: {
                    centerId,
                    scheduledDate: {
                        gte: new Date(date.setHours(0, 0, 0, 0)),
                        lt: new Date(date.setHours(23, 59, 59, 999)),
                    },
                    status: { not: BookingStatus.CANCELLED },
                },
            });
        }
        async getCropSeasonality(centerId, month) {
            const schedules = await this.prisma.schedule.findMany({
                where: {
                    centerId,
                    date: {
                        gte: new Date(new Date().getFullYear(), month - 1, 1),
                        lt: new Date(new Date().getFullYear(), month, 1),
                    },
                    isActive: true,
                },
            });
            if (schedules.length === 0)
                return 1.0;
            const totalSlots = schedules.reduce((sum, s) => sum + s.maxTokens, 0);
            const activeSlots = schedules.filter(s => s.isActive).reduce((sum, s) => sum + s.maxTokens, 0);
            return activeSlots / Math.max(totalSlots, 1);
        }
        async getPreviousAttendance(centerId, date) {
            const pastDates = [];
            for (let i = 1; i <= 4; i++) {
                const d = new Date(date);
                d.setDate(d.getDate() - i * 7);
                pastDates.push(d);
            }
            let totalBooked = 0;
            let totalAttended = 0;
            for (const d of pastDates) {
                const bookings = await this.prisma.booking.count({
                    where: {
                        centerId,
                        scheduledDate: {
                            gte: new Date(d.setHours(0, 0, 0, 0)),
                            lt: new Date(d.setHours(23, 59, 59, 999)),
                        },
                        status: { not: BookingStatus.CANCELLED },
                    },
                });
                const tokens = await this.prisma.token.count({
                    where: {
                        centerId,
                        createdAt: {
                            gte: new Date(d.setHours(0, 0, 0, 0)),
                            lt: new Date(d.setHours(23, 59, 59, 999)),
                        },
                        status: { in: ['ARRIVED', 'QUALITY_CHECK', 'WEIGHMENT', 'PROCUREMENT_COMPLETED', 'PAYMENT_COMPLETED'] },
                    },
                });
                totalBooked += bookings;
                totalAttended += tokens;
            }
            return totalBooked > 0 ? totalAttended / totalBooked : 0.8;
        }
        calculateExpectedFarmers(historicalAvg, currentBookings, cropSeasonality, attendanceRate, isWeekend) {
            let expected = historicalAvg * 0.4 + currentBookings * 0.6;
            expected *= cropSeasonality;
            expected *= attendanceRate;
            if (isWeekend) {
                expected *= 1.2;
            }
            return expected;
        }
        async getAverageProcessingTime(centerId) {
            const completedTokens = await this.prisma.token.findMany({
                where: {
                    centerId,
                    status: { in: ['PROCUREMENT_COMPLETED', 'PAYMENT_COMPLETED'] },
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
        calculateConfidence(historicalAvg, currentBookings, cropSeasonality) {
            let confidence = 0.5;
            if (historicalAvg > 10)
                confidence += 0.2;
            if (currentBookings > 5)
                confidence += 0.2;
            if (cropSeasonality > 0.5)
                confidence += 0.1;
            return Math.min(confidence, 0.95);
        }
        getDayName(dayOfWeek) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[dayOfWeek];
        }
    };
    __setFunctionName(_classThis, "CrowdPredictionAgent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CrowdPredictionAgent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CrowdPredictionAgent = _classThis;
})();
export { CrowdPredictionAgent };
