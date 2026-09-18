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
let AdminsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AdminsService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
        }
        async findById(id) {
            return this.prisma.admin.findUnique({
                where: { id },
                include: { user: true },
            });
        }
        async findByUserId(userId) {
            return this.prisma.admin.findUnique({
                where: { userId },
            });
        }
        async findAll(params) {
            const { page = 1, limit = 20, search } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { user: { firstName: { contains: search } } },
                    { user: { lastName: { contains: search } } },
                    { user: { mobileNumber: { contains: search } } },
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.admin.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { firstName: true, lastName: true, mobileNumber: true } },
                    },
                }),
                this.prisma.admin.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async update(id, data) {
            const admin = await this.prisma.admin.findUnique({ where: { id } });
            if (!admin) {
                throw new NotFoundException('Admin not found');
            }
            return this.prisma.admin.update({
                where: { id },
                data,
                include: { user: true },
            });
        }
        async getSystemStats() {
            const [totalUsers, totalFarmers, totalOfficers, totalAdmins, totalCenters, totalCrops, totalBookings, totalTokens, totalProcurements, totalPayments, totalComplaints,] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.farmer.count(),
                this.prisma.officer.count(),
                this.prisma.admin.count(),
                this.prisma.procurementCenter.count(),
                this.prisma.crop.count(),
                this.prisma.booking.count(),
                this.prisma.token.count(),
                this.prisma.procurementRecord.count(),
                this.prisma.payment.count(),
                this.prisma.complaint.count(),
            ]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const [todayBookings, todayTokens, todayProcurements, todayPayments] = await Promise.all([
                this.prisma.booking.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
                this.prisma.token.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
                this.prisma.procurementRecord.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
                this.prisma.payment.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
            ]);
            return {
                totals: {
                    users: totalUsers,
                    farmers: totalFarmers,
                    officers: totalOfficers,
                    admins: totalAdmins,
                    centers: totalCenters,
                    crops: totalCrops,
                    bookings: totalBookings,
                    tokens: totalTokens,
                    procurements: totalProcurements,
                    payments: totalPayments,
                    complaints: totalComplaints,
                },
                today: {
                    bookings: todayBookings,
                    tokens: todayTokens,
                    procurements: todayProcurements,
                    payments: todayPayments,
                },
            };
        }
    };
    __setFunctionName(_classThis, "AdminsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdminsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdminsService = _classThis;
})();
export { AdminsService };
