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
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ProcurementState, QualityCheckStatus, TokenStatus } from '@prisma/client';
let ProcurementService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProcurementService = _classThis = class {
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
                value: new Logger(ProcurementService.name)
            });
        }
        async startProcurement(data) {
            const token = await this.prisma.token.findUnique({
                where: { id: data.tokenId },
                include: { booking: true, farmer: true, center: true, crop: true },
            });
            if (!token) {
                throw new NotFoundException('Token not found');
            }
            if (token.status !== TokenStatus.ARRIVED && token.status !== TokenStatus.QUALITY_CHECK) {
                throw new BadRequestException('Token must be in ARRIVED or QUALITY_CHECK state to start procurement');
            }
            const officer = await this.prisma.officer.findUnique({ where: { id: data.officerId } });
            if (!officer) {
                throw new NotFoundException('Officer not found');
            }
            if (officer.centerId && officer.centerId !== token.centerId) {
                throw new BadRequestException('Officer not authorized for this center');
            }
            const existingRecord = await this.prisma.procurementRecord.findUnique({
                where: { tokenId: data.tokenId },
            });
            if (existingRecord) {
                throw new BadRequestException('Procurement already started for this token');
            }
            const recordNumber = await this.generateRecordNumber(token.centerId);
            const record = await this.prisma.$transaction(async (tx) => {
                const newRecord = await tx.procurementRecord.create({
                    data: {
                        recordNumber,
                        tokenId: data.tokenId,
                        farmerId: token.farmerId,
                        centerId: token.centerId,
                        cropId: token.cropId,
                        state: ProcurementState.QUALITY_CHECK,
                        quantity: data.quantity,
                        processedById: data.officerId,
                        startedAt: new Date(),
                    },
                    include: { token: true, farmer: { include: { user: true } }, center: true, crop: true, processedBy: true },
                });
                await tx.token.update({
                    where: { id: data.tokenId },
                    data: { status: TokenStatus.QUALITY_CHECK },
                });
                await tx.booking.update({
                    where: { id: token.bookingId },
                    data: { status: 'COMPLETED' },
                });
                return newRecord;
            });
            return record;
        }
        async generateRecordNumber(centerId) {
            const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
            const prefix = center?.code || 'PRC';
            const date = new Date();
            const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
            const count = await this.prisma.procurementRecord.count({
                where: { recordNumber: { startsWith: `${prefix}-${dateStr}` } },
            });
            return `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`;
        }
        async findById(id) {
            return this.prisma.procurementRecord.findUnique({
                where: { id },
                include: {
                    token: { include: { booking: true, farmer: { include: { user: true } }, center: true, crop: true } },
                    farmer: { include: { user: true } },
                    center: true,
                    crop: true,
                    processedBy: { include: { user: true } },
                    qualityCheck: true,
                    weighment: true,
                    payment: { include: { receipt: true } },
                    receipt: true,
                },
            });
        }
        async findByRecordNumber(recordNumber) {
            return this.prisma.procurementRecord.findUnique({
                where: { recordNumber },
                include: { token: true, farmer: true, center: true, crop: true },
            });
        }
        async findAll(params) {
            const { farmerId, centerId, cropId, state, dateFrom, dateTo, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (farmerId)
                where.farmerId = farmerId;
            if (centerId)
                where.centerId = centerId;
            if (cropId)
                where.cropId = cropId;
            if (state)
                where.state = state;
            if (dateFrom || dateTo) {
                where.createdAt = {};
                if (dateFrom)
                    where.createdAt.gte = dateFrom;
                if (dateTo)
                    where.createdAt.lte = dateTo;
            }
            const [data, total] = await Promise.all([
                this.prisma.procurementRecord.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { token: true, farmer: { include: { user: true } }, center: true, crop: true, qualityCheck: true, weighment: true, payment: true },
                }),
                this.prisma.procurementRecord.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async updateState(id, state, officerId) {
            const record = await this.prisma.procurementRecord.findUnique({ where: { id } });
            if (!record) {
                throw new NotFoundException('Procurement record not found');
            }
            const validTransitions = {
                [ProcurementState.BOOKED]: [ProcurementState.SCHEDULED],
                [ProcurementState.SCHEDULED]: [ProcurementState.WAITING],
                [ProcurementState.WAITING]: [ProcurementState.CALLED],
                [ProcurementState.CALLED]: [ProcurementState.ARRIVED],
                [ProcurementState.ARRIVED]: [ProcurementState.QUALITY_CHECK],
                [ProcurementState.QUALITY_CHECK]: [ProcurementState.WEIGHMENT, ProcurementState.CANCELLED],
                [ProcurementState.WEIGHMENT]: [ProcurementState.PROCUREMENT_COMPLETED, ProcurementState.CANCELLED],
                [ProcurementState.PROCUREMENT_COMPLETED]: [ProcurementState.PAYMENT_PENDING],
                [ProcurementState.PAYMENT_PENDING]: [ProcurementState.PAYMENT_COMPLETED, ProcurementState.CANCELLED],
                [ProcurementState.PAYMENT_COMPLETED]: [],
                [ProcurementState.CANCELLED]: [],
            };
            if (!validTransitions[record.state]?.includes(state)) {
                throw new BadRequestException(`Invalid state transition from ${record.state} to ${state}`);
            }
            const updateData = { state };
            if (state === ProcurementState.PROCUREMENT_COMPLETED) {
                updateData.completedAt = new Date();
            }
            if (officerId) {
                updateData.processedById = officerId;
            }
            return this.prisma.procurementRecord.update({
                where: { id },
                data: updateData,
                include: { token: true, farmer: { include: { user: true } }, center: true, crop: true },
            });
        }
        async performQualityCheck(data) {
            const record = await this.prisma.procurementRecord.findUnique({ where: { id: data.procurementId } });
            if (!record) {
                throw new NotFoundException('Procurement record not found');
            }
            if (record.state !== ProcurementState.QUALITY_CHECK) {
                throw new BadRequestException('Procurement must be in QUALITY_CHECK state');
            }
            const officer = await this.prisma.officer.findUnique({ where: { id: data.officerId } });
            if (!officer) {
                throw new NotFoundException('Officer not found');
            }
            const qualityCheck = await this.prisma.qualityCheck.upsert({
                where: { procurementId: data.procurementId },
                create: {
                    procurementId: data.procurementId,
                    moistureContent: data.moistureContent,
                    foreignMatter: data.foreignMatter,
                    damagedGrains: data.damagedGrains,
                    testWeight: data.testWeight,
                    status: data.status,
                    notes: data.notes,
                    checkedById: data.officerId,
                    checkedAt: new Date(),
                },
                update: {
                    moistureContent: data.moistureContent,
                    foreignMatter: data.foreignMatter,
                    damagedGrains: data.damagedGrains,
                    testWeight: data.testWeight,
                    status: data.status,
                    notes: data.notes,
                    checkedById: data.officerId,
                    checkedAt: new Date(),
                },
            });
            const nextState = data.status === QualityCheckStatus.PASSED ? ProcurementState.WEIGHMENT : ProcurementState.CANCELLED;
            return this.updateState(data.procurementId, nextState, data.officerId);
        }
        async performWeighment(data) {
            const record = await this.prisma.procurementRecord.findUnique({ where: { id: data.procurementId } });
            if (!record) {
                throw new NotFoundException('Procurement record not found');
            }
            if (record.state !== ProcurementState.WEIGHMENT) {
                throw new BadRequestException('Procurement must be in WEIGHMENT state');
            }
            const officer = await this.prisma.officer.findUnique({ where: { id: data.officerId } });
            if (!officer) {
                throw new NotFoundException('Officer not found');
            }
            const netWeight = data.grossWeight - data.tareWeight;
            if (netWeight <= 0) {
                throw new BadRequestException('Net weight must be positive');
            }
            await this.prisma.weighment.upsert({
                where: { procurementId: data.procurementId },
                create: {
                    procurementId: data.procurementId,
                    grossWeight: data.grossWeight,
                    tareWeight: data.tareWeight,
                    netWeight,
                    weighedById: data.officerId,
                },
                update: {
                    grossWeight: data.grossWeight,
                    tareWeight: data.tareWeight,
                    netWeight,
                    weighedById: data.officerId,
                },
            });
            return this.updateState(data.procurementId, ProcurementState.PROCUREMENT_COMPLETED, data.officerId);
        }
        async completeProcurement(procurementId, officerId, unitPrice) {
            const record = await this.prisma.procurementRecord.findUnique({ where: { id: procurementId } });
            if (!record) {
                throw new NotFoundException('Procurement record not found');
            }
            if (record.state !== ProcurementState.PROCUREMENT_COMPLETED) {
                throw new BadRequestException('Procurement must be completed first');
            }
            const officer = await this.prisma.officer.findUnique({ where: { id: officerId } });
            if (!officer) {
                throw new NotFoundException('Officer not found');
            }
            const weighment = await this.prisma.weighment.findUnique({ where: { procurementId } });
            const finalQuantity = weighment?.netWeight || record.quantity;
            const totalAmount = finalQuantity * unitPrice;
            const updated = await this.prisma.procurementRecord.update({
                where: { id: procurementId },
                data: {
                    quantity: finalQuantity,
                    unitPrice,
                    totalAmount,
                    state: ProcurementState.PAYMENT_PENDING,
                    processedById: officerId,
                },
            });
            await this.prisma.token.update({
                where: { id: record.tokenId },
                data: { status: TokenStatus.PROCUREMENT_COMPLETED, completedAt: new Date() },
            });
            return updated;
        }
        async getFarmerProcurementHistory(farmerId, params = {}) {
            const { page = 1, limit = 20 } = params;
            return this.findAll({ farmerId, page, limit });
        }
        async getCenterProcurements(centerId, params = {}) {
            const { dateFrom, dateTo, page = 1, limit = 50 } = params;
            return this.findAll({ centerId, dateFrom, dateTo, page, limit });
        }
    };
    __setFunctionName(_classThis, "ProcurementService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProcurementService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProcurementService = _classThis;
})();
export { ProcurementService };
