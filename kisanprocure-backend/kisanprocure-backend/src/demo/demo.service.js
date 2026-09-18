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
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BookingStatus, TokenStatus, ProcurementState, QualityCheckStatus, PaymentStatus } from '@prisma/client';
let DemoService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var DemoService = _classThis = class {
        constructor(prisma, configService) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
            Object.defineProperty(this, "configService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: configService
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(DemoService.name)
            });
        }
        get demoModeEnabled() {
            return this.configService.get('DEMO_MODE_ENABLED') === 'true';
        }
        async simulate(action, params) {
            if (!this.demoModeEnabled) {
                throw new BadRequestException('Demo mode is disabled');
            }
            switch (action) {
                case 'new_booking':
                    return this.simulateNewBooking(params);
                case 'queue_movement':
                    return this.simulateQueueMovement(params);
                case 'officer_processing':
                    return this.simulateOfficerProcessing(params);
                case 'center_congestion':
                    return this.simulateCenterCongestion(params);
                case 'procurement_completion':
                    return this.simulateProcurementCompletion(params);
                case 'payment_completion':
                    return this.simulatePaymentCompletion(params);
                case 'full_flow':
                    return this.simulateFullFlow(params);
                default:
                    throw new BadRequestException(`Unknown demo action: ${action}`);
            }
        }
        async simulateNewBooking(params) {
            const { farmerId, centerId, cropId, quantity } = params;
            const farmer = await this.prisma.farmer.findUnique({ where: { id: farmerId } });
            if (!farmer)
                throw new BadRequestException('Farmer not found');
            const center = await this.prisma.procurementCenter.findUnique({
                where: { id: centerId },
                include: { centerCrops: true, schedules: { where: { isActive: true, cropId }, include: { slots: { where: { isActive: true } } } } },
            });
            if (!center)
                throw new BadRequestException('Center not found');
            const schedule = center.schedules[0];
            if (!schedule)
                throw new BadRequestException('No active schedule');
            const slot = schedule.slots.find(s => s.bookedCount < s.capacity);
            if (!slot)
                throw new BadRequestException('No available slots');
            const produce = await this.prisma.farmerProduce.findFirst({
                where: { farmerId, cropId },
            });
            if (!produce || produce.quantity < quantity) {
                throw new BadRequestException('Insufficient produce');
            }
            const booking = await this.prisma.booking.create({
                data: {
                    bookingNumber: `DEMO-BK-${Date.now()}`,
                    farmerId,
                    centerId,
                    cropId,
                    slotId: slot.id,
                    scheduledDate: schedule.date,
                    status: BookingStatus.CONFIRMED,
                    quantity,
                },
            });
            await this.prisma.slot.update({
                where: { id: slot.id },
                data: { bookedCount: { increment: 1 } },
            });
            return { success: true, booking };
        }
        async simulateQueueMovement(params) {
            const { centerId } = params;
            const tokens = await this.prisma.token.findMany({
                where: { centerId, status: TokenStatus.WAITING },
                orderBy: { queuePosition: 'asc' },
                take: 5,
                include: { farmer: { include: { user: true } } },
            });
            const results = [];
            for (const token of tokens) {
                const newStatus = [TokenStatus.CALLED, TokenStatus.ARRIVED][Math.floor(Math.random() * 2)];
                await this.prisma.token.update({
                    where: { id: token.id },
                    data: { status: newStatus, ...(newStatus === TokenStatus.CALLED && { calledAt: new Date() }), ...(newStatus === TokenStatus.ARRIVED && { arrivedAt: new Date() }) },
                });
                results.push({ tokenId: token.id, tokenNumber: token.tokenNumber, newStatus });
            }
            await this.prisma.$executeRaw `UPDATE "QueueEntry" SET position = position - 1 WHERE "centerId" = ${centerId} AND "tokenId" IN (${tokens.map(t => t.id).join(',')})`;
            return { success: true, movements: results };
        }
        async simulateOfficerProcessing(params) {
            const { centerId, counterId } = params;
            const counter = await this.prisma.centerCounter.findUnique({ where: { id: counterId } });
            if (!counter || counter.centerId !== centerId) {
                throw new BadRequestException('Invalid counter');
            }
            const nextToken = await this.prisma.queueEntry.findFirst({
                where: { centerId },
                orderBy: { position: 'asc' },
                include: { token: true },
            });
            if (!nextToken) {
                return { success: false, message: 'No tokens in queue' };
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.token.update({
                    where: { id: nextToken.tokenId },
                    data: { status: TokenStatus.CALLED, calledAt: new Date() },
                });
                await tx.centerCounter.update({
                    where: { id: counterId },
                    data: { currentTokenId: nextToken.tokenId },
                });
                await tx.queueEntry.delete({ where: { tokenId: nextToken.tokenId } });
                await tx.queueEntry.updateMany({
                    where: { centerId, position: { gt: nextToken.position } },
                    data: { position: { decrement: 1 } },
                });
            });
            return { success: true, tokenCalled: nextToken.token.tokenNumber };
        }
        async simulateCenterCongestion(params) {
            const { centerId, congestionLevel } = params;
            const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
            if (!center)
                throw new BadRequestException('Center not found');
            await this.prisma.procurementCenter.update({
                where: { id: centerId },
                data: { status: congestionLevel >= 90 ? 'FULL' : 'ACTIVE' },
            });
            const bookings = await this.prisma.booking.findMany({
                where: { centerId, status: BookingStatus.CONFIRMED },
                take: Math.floor(center.capacityPerDay * (congestionLevel / 100)),
            });
            return { success: true, centerStatus: congestionLevel >= 90 ? 'FULL' : 'ACTIVE', activeBookings: bookings.length };
        }
        async simulateProcurementCompletion(params) {
            const { tokenId, officerId, quantity, unitPrice } = params;
            const token = await this.prisma.token.findUnique({
                where: { id: tokenId },
                include: { farmer: true, center: true, crop: true },
            });
            if (!token)
                throw new BadRequestException('Token not found');
            const record = await this.prisma.procurementRecord.create({
                data: {
                    recordNumber: `DEMO-PRC-${Date.now()}`,
                    tokenId,
                    farmerId: token.farmerId,
                    centerId: token.centerId,
                    cropId: token.cropId,
                    state: ProcurementState.PROCUREMENT_COMPLETED,
                    quantity,
                    unitPrice,
                    totalAmount: quantity * unitPrice,
                    processedById: officerId,
                    completedAt: new Date(),
                },
            });
            await this.prisma.qualityCheck.create({
                data: {
                    procurementId: record.id,
                    moistureContent: 12.5,
                    foreignMatter: 0.5,
                    damagedGrains: 1.0,
                    testWeight: 78,
                    status: QualityCheckStatus.PASSED,
                    checkedById: officerId,
                    checkedAt: new Date(),
                },
            });
            await this.prisma.weighment.create({
                data: {
                    procurementId: record.id,
                    grossWeight: quantity * 1.02,
                    tareWeight: quantity * 0.02,
                    netWeight: quantity,
                    weighedById: officerId,
                },
            });
            await this.prisma.token.update({
                where: { id: tokenId },
                data: { status: TokenStatus.PROCUREMENT_COMPLETED, completedAt: new Date() },
            });
            return { success: true, procurementRecord: record };
        }
        async simulatePaymentCompletion(params) {
            const { procurementId, amount } = params;
            const procurement = await this.prisma.procurementRecord.findUnique({
                where: { id: procurementId },
                include: { farmer: true },
            });
            if (!procurement)
                throw new BadRequestException('Procurement not found');
            const payment = await this.prisma.payment.create({
                data: {
                    paymentNumber: `DEMO-PAY-${Date.now()}`,
                    procurementId,
                    farmerId: procurement.farmerId,
                    amount,
                    status: PaymentStatus.COMPLETED,
                    provider: 'MOCK',
                    providerRef: `MOCK-${Date.now()}`,
                    paidAt: new Date(),
                },
            });
            await this.prisma.receipt.create({
                data: {
                    receiptNumber: `DEMO-RCP-${Date.now()}`,
                    paymentId: payment.id,
                    procurementId,
                    farmerId: procurement.farmerId,
                    amount,
                },
            });
            await this.prisma.procurementRecord.update({
                where: { id: procurementId },
                data: { state: ProcurementState.PAYMENT_COMPLETED },
            });
            await this.prisma.token.update({
                where: { id: procurement.tokenId },
                data: { status: TokenStatus.PAYMENT_COMPLETED },
            });
            return { success: true, payment };
        }
        async simulateFullFlow(params) {
            const steps = [
                { action: 'new_booking', params: { farmerId: params.farmerId, centerId: params.centerId, cropId: params.cropId, quantity: params.quantity || 10 } },
                { action: 'queue_movement', params: { centerId: params.centerId } },
                { action: 'officer_processing', params: { centerId: params.centerId, counterId: params.counterId } },
                { action: 'procurement_completion', params: { tokenId: '', officerId: params.officerId, quantity: params.quantity || 10, unitPrice: 2125 } },
                { action: 'payment_completion', params: { procurementId: '', amount: (params.quantity || 10) * 2125 } },
            ];
            const results = [];
            let bookingId;
            let tokenId;
            let procurementId;
            for (const step of steps) {
                if (step.action === 'new_booking') {
                    const result = await this.simulateNewBooking(step.params);
                    bookingId = result.booking.id;
                    const token = await this.prisma.token.findUnique({ where: { bookingId } });
                    tokenId = token.id;
                    results.push({ step: 'booking', result });
                }
                else if (step.action === 'queue_movement') {
                    const result = await this.simulateQueueMovement(step.params);
                    results.push({ step: 'queue_movement', result });
                }
                else if (step.action === 'officer_processing') {
                    const result = await this.simulateOfficerProcessing(step.params);
                    results.push({ step: 'officer_processing', result });
                }
                else if (step.action === 'procurement_completion') {
                    step.params.tokenId = tokenId;
                    const result = await this.simulateProcurementCompletion(step.params);
                    procurementId = result.procurementRecord.id;
                    results.push({ step: 'procurement_completion', result });
                }
                else if (step.action === 'payment_completion') {
                    step.params.procurementId = procurementId;
                    const result = await this.simulatePaymentCompletion(step.params);
                    results.push({ step: 'payment_completion', result });
                }
            }
            return { success: true, flow: results };
        }
        async resetDemoData() {
            if (!this.demoModeEnabled) {
                throw new BadRequestException('Demo mode is disabled');
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.notification.deleteMany();
                await tx.complaint.deleteMany();
                await tx.receipt.deleteMany();
                await tx.payment.deleteMany();
                await tx.weighment.deleteMany();
                await tx.qualityCheck.deleteMany();
                await tx.procurementRecord.deleteMany();
                await tx.queueEntry.deleteMany();
                await tx.token.deleteMany();
                await tx.booking.deleteMany();
                await tx.slot.updateMany({ data: { bookedCount: 0 } });
            });
            return { success: true, message: 'Demo data reset completed' };
        }
    };
    __setFunctionName(_classThis, "DemoService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DemoService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DemoService = _classThis;
})();
export { DemoService };
