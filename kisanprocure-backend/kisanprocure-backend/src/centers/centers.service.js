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
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CenterStatus } from '@prisma/client';
let CentersService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CentersService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
        }
        async create(data) {
            const existingCode = await this.prisma.procurementCenter.findUnique({
                where: { code: data.code },
            });
            if (existingCode) {
                throw new ConflictException('Center code already exists');
            }
            return this.prisma.procurementCenter.create({
                data: {
                    code: data.code,
                    name: data.name,
                    address: data.address,
                    village: data.village,
                    district: data.district,
                    state: data.state,
                    pincode: data.pincode,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    contactNumber: data.contactNumber,
                    email: data.email,
                    capacityPerDay: data.capacityPerDay || 100,
                    operatingHours: data.operatingHours,
                    facilities: data.facilities || [],
                    centerCrops: data.cropIds ? { connect: data.cropIds.map(id => ({ id })) } : undefined,
                },
                include: { centerCrops: true, counters: true },
            });
        }
        async findById(id) {
            return this.prisma.procurementCenter.findUnique({
                where: { id },
                include: {
                    centerCrops: true,
                    counters: true,
                    schedules: {
                        where: { isActive: true },
                        include: { crop: true, slots: true },
                    },
                    officers: { include: { user: true } },
                },
            });
        }
        async findByCode(code) {
            return this.prisma.procurementCenter.findUnique({
                where: { code },
                include: { centerCrops: true, counters: true },
            });
        }
        async findAll(params) {
            const { district, state, status, page = 1, limit = 20, search, cropId } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (district)
                where.district = district;
            if (state)
                where.state = state;
            if (status)
                where.status = status;
            if (cropId)
                where.centerCrops = { some: { id: cropId } };
            if (search) {
                where.OR = [
                    { code: { contains: search } },
                    { name: { contains: search } },
                    { address: { contains: search } },
                    { district: { contains: search } },
                    { village: { contains: search } },
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.procurementCenter.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' },
                    include: { centerCrops: true, counters: true },
                }),
                this.prisma.procurementCenter.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async update(id, data) {
            const center = await this.prisma.procurementCenter.findUnique({ where: { id } });
            if (!center) {
                throw new NotFoundException('Center not found');
            }
            const { cropIds, ...updateData } = data;
            return this.prisma.procurementCenter.update({
                where: { id },
                data: {
                    ...updateData,
                    centerCrops: cropIds ? { set: cropIds.map(id => ({ id })) } : undefined,
                },
                include: { centerCrops: true, counters: true },
            });
        }
        async delete(id) {
            const center = await this.prisma.procurementCenter.findUnique({ where: { id } });
            if (!center) {
                throw new NotFoundException('Center not found');
            }
            await this.prisma.procurementCenter.update({
                where: { id },
                data: { deletedAt: new Date(), status: CenterStatus.INACTIVE },
            });
        }
        async addCounter(centerId, data) {
            const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
            if (!center) {
                throw new NotFoundException('Center not found');
            }
            const existing = await this.prisma.centerCounter.findUnique({
                where: { centerId_counterNumber: { centerId, counterNumber: data.counterNumber } },
            });
            if (existing) {
                throw new ConflictException('Counter number already exists for this center');
            }
            return this.prisma.centerCounter.create({
                data: {
                    centerId,
                    counterNumber: data.counterNumber,
                },
            });
        }
        async updateCounter(centerId, counterId, data) {
            const counter = await this.prisma.centerCounter.findFirst({
                where: { id: counterId, centerId },
            });
            if (!counter) {
                throw new NotFoundException('Counter not found');
            }
            return this.prisma.centerCounter.update({
                where: { id: counterId },
                data,
            });
        }
        async deleteCounter(centerId, counterId) {
            const counter = await this.prisma.centerCounter.findFirst({
                where: { id: counterId, centerId },
            });
            if (!counter) {
                throw new NotFoundException('Counter not found');
            }
            await this.prisma.centerCounter.delete({ where: { id: counterId } });
        }
        async getCenterStats(centerId, date) {
            const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
            if (!center) {
                throw new NotFoundException('Center not found');
            }
            const targetDate = date || new Date();
            targetDate.setHours(0, 0, 0, 0);
            const nextDate = new Date(targetDate);
            nextDate.setDate(nextDate.getDate() + 1);
            const [totalBookings, totalTokens, totalProcured, avgWaitTime, activeQueue, noShowCount,] = await Promise.all([
                this.prisma.booking.count({
                    where: { centerId, scheduledDate: { gte: targetDate, lt: nextDate } },
                }),
                this.prisma.token.count({
                    where: { centerId, createdAt: { gte: targetDate, lt: nextDate } },
                }),
                this.prisma.procurementRecord.aggregate({
                    where: { centerId, createdAt: { gte: targetDate, lt: nextDate } },
                    _sum: { quantity: true, totalAmount: true },
                }),
                this.prisma.token.aggregate({
                    where: {
                        centerId,
                        status: { in: ['PROCUREMENT_COMPLETED', 'PAYMENT_COMPLETED'] },
                        calledAt: { not: null },
                        arrivedAt: { not: null },
                    },
                    _avg: { estimatedWait: true },
                }),
                this.prisma.queueEntry.count({
                    where: {
                        centerId,
                        token: { status: { in: ['WAITING', 'CALLED', 'ARRIVED', 'QUALITY_CHECK', 'WEIGHMENT'] } },
                    },
                }),
                this.prisma.token.count({
                    where: {
                        centerId,
                        status: 'NO_SHOW',
                        createdAt: { gte: targetDate, lt: nextDate },
                    },
                }),
            ]);
            const utilization = totalBookings > 0
                ? (totalBookings / center.capacityPerDay) * 100
                : 0;
            return {
                centerId,
                date: targetDate,
                totalBookings,
                totalTokens,
                totalProcured: totalProcured._sum.quantity || 0,
                totalAmount: totalProcured._sum.totalAmount || 0,
                avgWaitTime: avgWaitTime._avg.estimatedWait || 0,
                activeQueue,
                noShowCount,
                utilization: Math.min(utilization, 100),
            };
        }
        async getNearbyCenters(latitude, longitude, radiusKm = 50) {
            // Simple bounding box approximation for nearby centers
            const latDelta = radiusKm / 111;
            const lngDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
            return this.prisma.procurementCenter.findMany({
                where: {
                    latitude: { gte: latitude - latDelta, lte: latitude + latDelta },
                    longitude: { gte: longitude - lngDelta, lte: longitude + lngDelta },
                    status: CenterStatus.ACTIVE,
                    deletedAt: null,
                },
                include: { centerCrops: true, counters: true },
            });
        }
    };
    __setFunctionName(_classThis, "CentersService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CentersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CentersService = _classThis;
})();
export { CentersService };
