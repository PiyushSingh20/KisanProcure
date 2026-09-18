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
let FarmersService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var FarmersService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
        }
        async findById(id) {
            return this.prisma.farmer.findUnique({
                where: { id },
                include: {
                    user: true,
                    produce: { include: { crop: true } },
                    bookings: { include: { center: true, crop: true, slot: true } },
                    tokens: { include: { center: true, crop: true } },
                },
            });
        }
        async findByUserId(userId) {
            return this.prisma.farmer.findUnique({
                where: { userId },
                include: {
                    produce: { include: { crop: true } },
                },
            });
        }
        async findByFarmerCode(farmerCode) {
            return this.prisma.farmer.findUnique({
                where: { farmerCode },
            });
        }
        async findAll(params) {
            const { district, state, page = 1, limit = 20, search } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (district)
                where.district = district;
            if (state)
                where.state = state;
            if (search) {
                where.OR = [
                    { farmerCode: { contains: search } },
                    { user: { firstName: { contains: search } } },
                    { user: { lastName: { contains: search } } },
                    { user: { mobileNumber: { contains: search } } },
                    { aadhaarNumber: { contains: search } },
                    { village: { contains: search } },
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.farmer.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { firstName: true, lastName: true, mobileNumber: true } },
                        produce: { include: { crop: true } },
                    },
                }),
                this.prisma.farmer.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async update(id, data) {
            const farmer = await this.prisma.farmer.findUnique({ where: { id } });
            if (!farmer) {
                throw new NotFoundException('Farmer not found');
            }
            if (data.aadhaarNumber && data.aadhaarNumber !== farmer.aadhaarNumber) {
                const existing = await this.prisma.farmer.findUnique({
                    where: { aadhaarNumber: data.aadhaarNumber },
                });
                if (existing) {
                    throw new ConflictException('Aadhaar number already registered');
                }
            }
            return this.prisma.farmer.update({
                where: { id },
                data,
                include: {
                    user: true,
                    produce: { include: { crop: true } },
                },
            });
        }
        async addProduce(farmerId, data) {
            const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
            if (!farmer) {
                throw new NotFoundException('Farmer not found');
            }
            const crop = await this.prisma.crop.findUnique({ where: { id: data.cropId } });
            if (!crop) {
                throw new NotFoundException('Crop not found');
            }
            const existingProduce = await this.prisma.farmerProduce.findFirst({
                where: { farmerId, cropId: data.cropId },
            });
            if (existingProduce) {
                return this.prisma.farmerProduce.update({
                    where: { id: existingProduce.id },
                    data: {
                        quantity: data.quantity,
                        expectedPrice: data.expectedPrice,
                        harvestDate: data.harvestDate,
                        qualityGrade: data.qualityGrade,
                    },
                    include: { crop: true },
                });
            }
            return this.prisma.farmerProduce.create({
                data: {
                    farmerId,
                    cropId: data.cropId,
                    quantity: data.quantity,
                    expectedPrice: data.expectedPrice,
                    harvestDate: data.harvestDate,
                    qualityGrade: data.qualityGrade,
                },
                include: { crop: true },
            });
        }
        async updateProduce(farmerId, produceId, data) {
            const produce = await this.prisma.farmerProduce.findFirst({
                where: { id: produceId, farmerId },
            });
            if (!produce) {
                throw new NotFoundException('Produce not found');
            }
            return this.prisma.farmerProduce.update({
                where: { id: produceId },
                data,
                include: { crop: true },
            });
        }
        async deleteProduce(farmerId, produceId) {
            const produce = await this.prisma.farmerProduce.findFirst({
                where: { id: produceId, farmerId },
            });
            if (!produce) {
                throw new NotFoundException('Produce not found');
            }
            await this.prisma.farmerProduce.delete({ where: { id: produceId } });
        }
        async getFarmerProduce(farmerId) {
            return this.prisma.farmerProduce.findMany({
                where: { farmerId },
                include: { crop: true },
                orderBy: { createdAt: 'desc' },
            });
        }
        async getFarmerBookings(farmerId, params = {}) {
            const { status, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = { farmerId };
            if (status)
                where.status = status;
            const [data, total] = await Promise.all([
                this.prisma.booking.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { center: true, crop: true, slot: true, token: true },
                }),
                this.prisma.booking.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async getFarmerTokens(farmerId, params = {}) {
            const { status, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = { farmerId };
            if (status)
                where.status = status;
            const [data, total] = await Promise.all([
                this.prisma.token.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { center: true, crop: true, booking: true },
                }),
                this.prisma.token.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async getFarmerProcurementHistory(farmerId, params = {}) {
            const { page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.prisma.procurementRecord.findMany({
                    where: { farmerId },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { center: true, crop: true, qualityCheck: true, weighment: true, payment: true, receipt: true },
                }),
                this.prisma.procurementRecord.count({ where: { farmerId } }),
            ]);
            return { data, total, page, limit };
        }
        async getFarmerPayments(farmerId, params = {}) {
            const { status, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = { farmerId };
            if (status)
                where.status = status;
            const [data, total] = await Promise.all([
                this.prisma.payment.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { procurement: { include: { center: true, crop: true } }, receipt: true },
                }),
                this.prisma.payment.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async getFarmerComplaints(farmerId, params = {}) {
            const { status, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = { farmerId };
            if (status)
                where.status = status;
            const [data, total] = await Promise.all([
                this.prisma.complaint.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { center: true, crop: true, token: true, assignedTo: true },
                }),
                this.prisma.complaint.count({ where }),
            ]);
            return { data, total, page, limit };
        }
    };
    __setFunctionName(_classThis, "FarmersService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FarmersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FarmersService = _classThis;
})();
export { FarmersService };
