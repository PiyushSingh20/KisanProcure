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
import { Injectable, NotFoundException } from '@nestjs/common';
let OfficersService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OfficersService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
        }
        async findById(id) {
            return this.prisma.officer.findUnique({
                where: { id },
                include: {
                    user: true,
                    center: true,
                },
            });
        }
        async findByUserId(userId) {
            return this.prisma.officer.findUnique({
                where: { userId },
                include: {
                    center: true,
                },
            });
        }
        async findByEmployeeId(employeeId) {
            return this.prisma.officer.findUnique({
                where: { employeeId },
            });
        }
        async findAll(params) {
            const { centerId, page = 1, limit = 20, search } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (centerId)
                where.centerId = centerId;
            if (search) {
                where.OR = [
                    { employeeId: { contains: search } },
                    { user: { firstName: { contains: search } } },
                    { user: { lastName: { contains: search } } },
                    { user: { mobileNumber: { contains: search } } },
                    { designation: { contains: search } },
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.officer.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { firstName: true, lastName: true, mobileNumber: true } },
                        center: true,
                    },
                }),
                this.prisma.officer.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async update(id, data) {
            const officer = await this.prisma.officer.findUnique({ where: { id } });
            if (!officer) {
                throw new NotFoundException('Officer not found');
            }
            if (data.centerId) {
                const center = await this.prisma.procurementCenter.findUnique({ where: { id: data.centerId } });
                if (!center) {
                    throw new NotFoundException('Center not found');
                }
            }
            return this.prisma.officer.update({
                where: { id },
                data,
                include: {
                    user: true,
                    center: true,
                },
            });
        }
        async getOfficerStats(officerId) {
            const officer = await this.prisma.officer.findUnique({ where: { id: officerId } });
            if (!officer) {
                throw new NotFoundException('Officer not found');
            }
            const centerId = officer.centerId;
            if (!centerId) {
                return { message: 'Officer not assigned to any center' };
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const [todayBookings, todayTokens, activeQueue, todayProcurements, pendingQualityChecks,] = await Promise.all([
                this.prisma.booking.count({
                    where: {
                        centerId,
                        scheduledDate: { gte: today, lt: tomorrow },
                    },
                }),
                this.prisma.token.count({
                    where: {
                        centerId,
                        createdAt: { gte: today, lt: tomorrow },
                    },
                }),
                this.prisma.queueEntry.count({
                    where: {
                        centerId,
                        token: { status: { in: ['WAITING', 'CALLED', 'ARRIVED', 'QUALITY_CHECK', 'WEIGHMENT'] } },
                    },
                }),
                this.prisma.procurementRecord.count({
                    where: {
                        centerId,
                        createdAt: { gte: today, lt: tomorrow },
                    },
                }),
                this.prisma.qualityCheck.count({
                    where: {
                        procurement: { centerId },
                        status: 'PENDING',
                    },
                }),
            ]);
            return {
                centerId,
                todayBookings,
                todayTokens,
                activeQueue,
                todayProcurements,
                pendingQualityChecks,
            };
        }
        async getAssignedCenter(officerId) {
            const officer = await this.prisma.officer.findUnique({ where: { id: officerId } });
            if (!officer || !officer.centerId) {
                return null;
            }
            return this.prisma.procurementCenter.findUnique({
                where: { id: officer.centerId },
                include: {
                    counters: true,
                    schedules: {
                        where: {
                            date: { gte: new Date() },
                            isActive: true,
                        },
                        include: { crop: true, slots: true },
                        take: 10,
                    },
                },
            });
        }
    };
    __setFunctionName(_classThis, "OfficersService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OfficersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OfficersService = _classThis;
})();
export { OfficersService };
