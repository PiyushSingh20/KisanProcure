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
import { TokenStatus, PaymentStatus } from '@prisma/client';
let AnalyticsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AnalyticsService = _classThis = class {
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
                value: new Logger(AnalyticsService.name)
            });
        }
        async getSystemOverview() {
            const [totalFarmers, totalCenters, totalCrops, totalBookings, totalTokens, totalProcurements, totalPayments, completedPayments, pendingPayments, totalComplaints, openComplaints,] = await Promise.all([
                this.prisma.farmer.count(),
                this.prisma.procurementCenter.count({ where: { status: 'ACTIVE' } }),
                this.prisma.crop.count({ where: { isActive: true } }),
                this.prisma.booking.count(),
                this.prisma.token.count(),
                this.prisma.procurementRecord.count(),
                this.prisma.payment.count(),
                this.prisma.payment.count({ where: { status: PaymentStatus.COMPLETED } }),
                this.prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
                this.prisma.complaint.count(),
                this.prisma.complaint.count({ where: { status: 'OPEN' } }),
            ]);
            return {
                farmers: totalFarmers,
                centers: totalCenters,
                crops: totalCrops,
                bookings: totalBookings,
                tokens: totalTokens,
                procurements: totalProcurements,
                payments: {
                    total: totalPayments,
                    completed: completedPayments,
                    pending: pendingPayments,
                    completionRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
                },
                complaints: {
                    total: totalComplaints,
                    open: openComplaints,
                },
            };
        }
        async getCenterAnalytics(centerId, dateFrom, dateTo) {
            const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
            if (!center) {
                throw new Error('Center not found');
            }
            const where = { centerId };
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = dateFrom;
                if (dateTo)
                    where.createdAt.lte = dateTo;
            }
            const [bookings, tokens, procurements, payments, avgWaitTime, noShows,] = await Promise.all([
                this.prisma.booking.count({ where }),
                this.prisma.token.count({ where }),
                this.prisma.procurementRecord.findMany({ where, select: { quantity: true, totalAmount: true } }),
                this.prisma.payment.findMany({ where, select: { amount: true, status: true } }),
                this.getAverageWaitTime(centerId, dateFrom, dateTo),
                this.prisma.token.count({ where: { ...where, status: TokenStatus.NO_SHOW } }),
            ]);
            const totalProcured = procurements.reduce((sum, p) => sum + (p.quantity || 0), 0);
            const totalAmount = procurements.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
            const completedPayments = payments.filter(p => p.status === PaymentStatus.COMPLETED);
            const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const todayBookings = await this.prisma.booking.count({
                where: { centerId, scheduledDate: { gte: today, lt: tomorrow } },
            });
            const activeQueue = await this.prisma.queueEntry.count({ where: { centerId } });
            return {
                centerId,
                centerName: center.name,
                bookings: { total: bookings, today: todayBookings },
                tokens: { total: tokens, noShows },
                procurements: { count: procurements.length, totalQuantity: totalProcured, totalAmount },
                payments: { total: totalPaid, completionRate: tokens > 0 ? (completedPayments.length / tokens) * 100 : 0 },
                avgWaitTime,
                activeQueue,
                utilization: center.capacityPerDay > 0 ? (bookings / center.capacityPerDay) * 100 : 0,
            };
        }
        async getAllCentersAnalytics(dateFrom, dateTo) {
            const centers = await this.prisma.procurementCenter.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true, name: true },
            });
            const analytics = await Promise.all(centers.map(c => this.getCenterAnalytics(c.id, dateFrom, dateTo)));
            return analytics;
        }
        async getAverageWaitTime(centerId, dateFrom, dateTo) {
            const where = {
                centerId,
                status: { in: [TokenStatus.PROCUREMENT_COMPLETED, TokenStatus.PAYMENT_COMPLETED] },
                calledAt: { not: null },
                completedAt: { not: null },
            };
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = dateFrom;
                if (dateTo)
                    where.createdAt.lte = dateTo;
            }
            const tokens = await this.prisma.token.findMany({ where, take: 1000 });
            if (tokens.length === 0)
                return 0;
            const totalMinutes = tokens.reduce((sum, t) => {
                if (t.calledAt && t.completedAt) {
                    return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
                }
                return sum;
            }, 0);
            return Math.round(totalMinutes / tokens.length);
        }
        async getQueueAnalytics(centerId, dateFrom, dateTo) {
            const where = { centerId };
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = dateFrom;
                if (dateTo)
                    where.createdAt.lte = dateTo;
            }
            const tokens = await this.prisma.token.findMany({
                where,
                select: { status: true, queuePosition: true, estimatedWait: true, calledAt: true, arrivedAt: true, completedAt: true },
            });
            const statusDistribution = tokens.reduce((acc, t) => {
                acc[t.status] = (acc[t.status] || 0) + 1;
                return acc;
            }, {});
            const avgQueuePosition = tokens.length > 0
                ? tokens.reduce((sum, t) => sum + (t.queuePosition || 0), 0) / tokens.length
                : 0;
            const avgEstimatedWait = tokens.length > 0
                ? tokens.reduce((sum, t) => sum + (t.estimatedWait || 0), 0) / tokens.length
                : 0;
            return {
                centerId,
                totalTokens: tokens.length,
                statusDistribution,
                avgQueuePosition: Math.round(avgQueuePosition),
                avgEstimatedWait: Math.round(avgEstimatedWait),
            };
        }
        async getBookingAnalytics(dateFrom, dateTo) {
            const where = {};
            if (dateFrom || dateTo) {
                where.scheduledDate = {};
                if (dateFrom)
                    where.scheduledDate.gte = dateFrom;
                if (dateTo)
                    where.scheduledDate.lte = dateTo;
            }
            const [bookings, statusDist, cropDist, centerDist] = await Promise.all([
                this.prisma.booking.count({ where }),
                this.prisma.booking.groupBy({ by: ['status'], where, _count: true }),
                this.prisma.booking.groupBy({ by: ['cropId'], where, _count: true }),
                this.prisma.booking.groupBy({ by: ['centerId'], where, _count: true }),
            ]);
            return {
                totalBookings: bookings,
                statusDistribution: statusDist.map(s => ({ status: s.status, count: s._count })),
                cropDistribution: cropDist.map(c => ({ cropId: c.cropId, count: c._count })),
                centerDistribution: centerDist.map(c => ({ centerId: c.centerId, count: c._count })),
            };
        }
        async getProcurementAnalytics(dateFrom, dateTo) {
            const where = {};
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = dateFrom;
                if (dateTo)
                    where.createdAt.lte = dateTo;
            }
            const [procurements, stateDist, cropDist, centerDist] = await Promise.all([
                this.prisma.procurementRecord.findMany({ where, select: { quantity: true, totalAmount: true, state: true } }),
                this.prisma.procurementRecord.groupBy({ by: ['state'], where, _count: true }),
                this.prisma.procurementRecord.groupBy({ by: ['cropId'], where, _count: true, _sum: { quantity: true, totalAmount: true } }),
                this.prisma.procurementRecord.groupBy({ by: ['centerId'], where, _count: true, _sum: { quantity: true, totalAmount: true } }),
            ]);
            const totalQuantity = procurements.reduce((sum, p) => sum + (p.quantity || 0), 0);
            const totalAmount = procurements.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
            return {
                totalProcurements: procurements.length,
                totalQuantity,
                totalAmount,
                stateDistribution: stateDist.map(s => ({ state: s.state, count: s._count })),
                cropDistribution: cropDist.map(c => ({ cropId: c.cropId, count: c._count, totalQuantity: c._sum.quantity || 0, totalAmount: c._sum.totalAmount || 0 })),
                centerDistribution: centerDist.map(c => ({ centerId: c.centerId, count: c._count, totalQuantity: c._sum.quantity || 0, totalAmount: c._sum.totalAmount || 0 })),
            };
        }
        async getPaymentAnalytics(dateFrom, dateTo) {
            const where = {};
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = dateFrom;
                if (dateTo)
                    where.createdAt.lte = dateTo;
            }
            const [payments, statusDist, centerDist] = await Promise.all([
                this.prisma.payment.findMany({ where, select: { amount: true, status: true } }),
                this.prisma.payment.groupBy({ by: ['status'], where, _count: true, _sum: { amount: true } }),
                this.prisma.payment.groupBy({ by: ['procurementId'], where, _count: true, _sum: { amount: true } }),
            ]);
            const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
            const completedAmount = payments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((sum, p) => sum + p.amount, 0);
            return {
                totalPayments: payments.length,
                totalAmount,
                completedAmount,
                completionRate: totalAmount > 0 ? (completedAmount / totalAmount) * 100 : 0,
                statusDistribution: statusDist.map(s => ({ status: s.status, count: s._count, totalAmount: s._sum.amount || 0 })),
            };
        }
        async getFarmerAnalytics(farmerId) {
            const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
            if (!farmer) {
                throw new Error('Farmer not found');
            }
            const [bookings, tokens, procurements, payments, produce] = await Promise.all([
                this.prisma.booking.count({ where: { farmerId } }),
                this.prisma.token.count({ where: { farmerId } }),
                this.prisma.procurementRecord.findMany({ where: { farmerId }, select: { quantity: true, totalAmount: true } }),
                this.prisma.payment.findMany({ where: { farmerId }, select: { amount: true, status: true } }),
                this.prisma.farmerProduce.findMany({ where: { farmerId }, include: { crop: true } }),
            ]);
            const totalProcured = procurements.reduce((sum, p) => sum + (p.quantity || 0), 0);
            const totalAmount = procurements.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
            const totalPaid = payments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((sum, p) => sum + p.amount, 0);
            return {
                farmerId,
                farmerCode: farmer.farmerCode,
                bookings,
                tokens,
                procurements: { count: procurements.length, totalQuantity: totalProcured, totalAmount },
                payments: { totalPaid, pending: payments.filter(p => p.status === PaymentStatus.PENDING).length },
                produce: produce.map(p => ({ crop: p.crop.name, quantity: p.quantity, expectedPrice: p.expectedPrice })),
            };
        }
    };
    __setFunctionName(_classThis, "AnalyticsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnalyticsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnalyticsService = _classThis;
})();
export { AnalyticsService };
