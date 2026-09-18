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
let DemandForecastAgent = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DemandForecastAgent = _classThis = class {
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
                value: new Logger(DemandForecastAgent.name)
            });
        }
        async forecast(input) {
            const { centerId, cropId, date } = input;
            const historicalData = await this.getHistoricalData(centerId, cropId, date);
            const currentBookings = await this.getCurrentBookings(centerId, cropId, date);
            const cropSeasonality = await this.getCropSeasonality(cropId, date);
            const centerCapacity = await this.getCenterCapacity(centerId);
            const weatherFactor = await this.getWeatherFactor(date);
            const expectedFarmers = this.calculateExpectedFarmers(historicalData, currentBookings, cropSeasonality, weatherFactor);
            const expectedQuantity = this.calculateExpectedQuantity(expectedFarmers, cropId, historicalData);
            const expectedRevenue = this.calculateExpectedRevenue(expectedQuantity, cropId);
            const confidence = this.calculateConfidence(historicalData.count, currentBookings, cropSeasonality);
            const peakDays = this.predictPeakDays(historicalData, date);
            const recommendedSlots = Math.ceil(expectedFarmers / 8);
            const recommendedStaff = Math.ceil(expectedFarmers / 40);
            const factors = [
                `Historical avg (last 30 days): ${historicalData.avgFarmers.toFixed(1)} farmers`,
                `Current bookings: ${currentBookings}`,
                `Crop seasonality factor: ${cropSeasonality.toFixed(2)}`,
                `Weather factor: ${weatherFactor.toFixed(2)}`,
                `Center capacity: ${centerCapacity} farmers/day`,
                `Data points: ${historicalData.count}`,
            ];
            const result = {
                forecastType: 'DAILY_DEMAND',
                centerId,
                cropId,
                date,
                expectedFarmers: Math.round(expectedFarmers),
                expectedQuantity: Math.round(expectedQuantity * 10) / 10,
                expectedRevenue: Math.round(expectedRevenue),
                confidence: Math.round(confidence * 100) / 100,
                factors,
                peakDays,
                recommendedSlots,
                recommendedStaff: Math.max(1, recommendedStaff),
            };
            await this.storeForecast(result);
            return result;
        }
        async getHistoricalData(centerId, cropId, date) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const where = {
                createdAt: { gte: thirtyDaysAgo },
            };
            if (centerId)
                where.centerId = centerId;
            if (cropId)
                where.cropId = cropId;
            const procurements = await this.prisma.procurementRecord.findMany({
                where,
                select: { quantity: true, totalAmount: true, farmerId: true, createdAt: true },
            });
            if (procurements.length === 0) {
                return { avgFarmers: 20, avgQuantity: 100, avgRevenue: 20000, count: 0 };
            }
            const uniqueFarmers = new Set(procurements.map(p => p.farmerId)).size;
            const avgFarmers = uniqueFarmers / 30;
            const avgQuantity = procurements.reduce((sum, p) => sum + (p.quantity || 0), 0) / procurements.length;
            const avgRevenue = procurements.reduce((sum, p) => sum + (p.totalAmount || 0), 0) / procurements.length;
            return { avgFarmers, avgQuantity, avgRevenue, count: procurements.length };
        }
        async getCurrentBookings(centerId, cropId, date) {
            const where = {
                scheduledDate: {
                    gte: new Date(date.setHours(0, 0, 0, 0)),
                    lt: new Date(date.setHours(23, 59, 59, 999)),
                },
                status: { not: BookingStatus.CANCELLED },
            };
            if (centerId)
                where.centerId = centerId;
            if (cropId)
                where.cropId = cropId;
            return this.prisma.booking.count({ where });
        }
        async getCropSeasonality(cropId, date) {
            if (!cropId)
                return 1.0;
            const month = date.getMonth() + 1;
            const crop = await this.prisma.crop.findUnique({ where: { id: cropId } });
            if (!crop || !crop.seasonStart || !crop.seasonEnd)
                return 1.0;
            if (month >= crop.seasonStart && month <= crop.seasonEnd) {
                return 1.5;
            }
            if (month === crop.seasonStart - 1 || month === crop.seasonEnd + 1) {
                return 1.2;
            }
            return 0.5;
        }
        async getCenterCapacity(centerId) {
            if (!centerId)
                return 100;
            const center = await this.prisma.procurementCenter.findUnique({
                where: { id: centerId },
                select: { capacityPerDay: true },
            });
            return center?.capacityPerDay || 100;
        }
        async getWeatherFactor(date) {
            return 1.0;
        }
        calculateExpectedFarmers(historicalData, currentBookings, cropSeasonality, weatherFactor) {
            let expected = historicalData.avgFarmers * 0.3 + currentBookings * 0.7;
            expected *= cropSeasonality;
            expected *= weatherFactor;
            return Math.max(0, expected);
        }
        calculateExpectedQuantity(expectedFarmers, cropId, historicalData) {
            if (!historicalData || historicalData.count === 0) {
                return expectedFarmers * 5;
            }
            return expectedFarmers * historicalData.avgQuantity;
        }
        calculateExpectedRevenue(expectedQuantity, cropId) {
            const basePrice = 2000;
            return expectedQuantity * basePrice;
        }
        calculateConfidence(historicalCount, currentBookings, cropSeasonality) {
            let confidence = 0.4;
            if (historicalCount >= 100)
                confidence += 0.3;
            else if (historicalCount >= 50)
                confidence += 0.2;
            else if (historicalCount >= 10)
                confidence += 0.1;
            if (currentBookings >= 20)
                confidence += 0.2;
            else if (currentBookings >= 10)
                confidence += 0.1;
            if (cropSeasonality > 1.0)
                confidence += 0.1;
            return Math.min(confidence, 0.95);
        }
        predictPeakDays(historicalData, date) {
            const peakDays = [];
            const dayOfWeek = date.getDay();
            for (let i = 0; i < 7; i++) {
                const d = new Date(date);
                d.setDate(d.getDate() + i);
                if (d.getDay() === 0 || d.getDay() === 6) {
                    peakDays.push(d);
                }
            }
            return peakDays;
        }
        async storeForecast(result) {
            await this.prisma.forecastResult.create({
                data: {
                    forecastType: result.forecastType,
                    centerId: result.centerId,
                    cropId: result.cropId,
                    date: result.date,
                    forecast: {
                        expectedFarmers: result.expectedFarmers,
                        expectedQuantity: result.expectedQuantity,
                        expectedRevenue: result.expectedRevenue,
                        recommendedSlots: result.recommendedSlots,
                        recommendedStaff: result.recommendedStaff,
                    },
                    confidence: result.confidence,
                    factors: result.factors,
                    modelVersion: '1.0',
                },
            });
        }
        async getForecastHistory(centerId, cropId, days = 30) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const where = { date: { gte: startDate } };
            if (centerId)
                where.centerId = centerId;
            if (cropId)
                where.cropId = cropId;
            return this.prisma.forecastResult.findMany({
                where,
                orderBy: { date: 'desc' },
                take: 100,
            });
        }
    };
    __setFunctionName(_classThis, "DemandForecastAgent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DemandForecastAgent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DemandForecastAgent = _classThis;
})();
export { DemandForecastAgent };
