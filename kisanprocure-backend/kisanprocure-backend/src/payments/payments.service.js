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
import { PaymentStatus, ProcurementState, TokenStatus } from '@prisma/client';
let PaymentsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PaymentsService = _classThis = class {
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
                value: new Logger(PaymentsService.name)
            });
        }
        async createPayment(data) {
            const procurement = await this.prisma.procurementRecord.findUnique({
                where: { id: data.procurementId },
                include: { farmer: true, token: true },
            });
            if (!procurement) {
                throw new NotFoundException('Procurement record not found');
            }
            if (procurement.state !== ProcurementState.PAYMENT_PENDING) {
                throw new BadRequestException('Procurement not ready for payment');
            }
            const existingPayment = await this.prisma.payment.findUnique({
                where: { procurementId: data.procurementId },
            });
            if (existingPayment) {
                throw new BadRequestException('Payment already exists for this procurement');
            }
            const paymentNumber = await this.generatePaymentNumber();
            const payment = await this.prisma.payment.create({
                data: {
                    paymentNumber,
                    procurementId: data.procurementId,
                    farmerId: procurement.farmerId,
                    amount: data.amount,
                    status: PaymentStatus.PENDING,
                    provider: data.provider || 'MOCK',
                },
                include: { procurement: { include: { farmer: { include: { user: true } }, center: true, crop: true } }, farmer: { include: { user: true } } },
            });
            return payment;
        }
        async generatePaymentNumber() {
            const date = new Date();
            const prefix = `PAY${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
            const count = await this.prisma.payment.count({
                where: { paymentNumber: { startsWith: prefix } },
            });
            return `${prefix}${String(count + 1).padStart(4, '0')}`;
        }
        async findById(id) {
            return this.prisma.payment.findUnique({
                where: { id },
                include: {
                    procurement: { include: { farmer: { include: { user: true } }, center: true, crop: true } },
                    farmer: { include: { user: true } },
                    receipt: true,
                },
            });
        }
        async findByPaymentNumber(paymentNumber) {
            return this.prisma.payment.findUnique({
                where: { paymentNumber },
                include: { procurement: true, farmer: true, receipt: true },
            });
        }
        async findAll(params) {
            const { farmerId, procurementId, status, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (farmerId)
                where.farmerId = farmerId;
            if (procurementId)
                where.procurementId = procurementId;
            if (status)
                where.status = status;
            const [data, total] = await Promise.all([
                this.prisma.payment.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { procurement: { include: { center: true, crop: true } }, farmer: { include: { user: true } }, receipt: true },
                }),
                this.prisma.payment.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async getPaymentStatus(paymentId) {
            return this.findById(paymentId);
        }
        async verifyPayment(data) {
            const payment = await this.prisma.payment.findUnique({ where: { id: data.paymentId } });
            if (!payment) {
                throw new NotFoundException('Payment not found');
            }
            if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.PROCESSING) {
                throw new BadRequestException('Payment already processed');
            }
            const updated = await this.prisma.$transaction(async (tx) => {
                const updatedPayment = await tx.payment.update({
                    where: { id: data.paymentId },
                    data: {
                        status: data.status,
                        providerRef: data.providerRef,
                        ...(data.status === PaymentStatus.COMPLETED && { paidAt: new Date() }),
                        ...(data.status === PaymentStatus.FAILED && { failedAt: new Date() }),
                    },
                });
                if (data.status === PaymentStatus.COMPLETED) {
                    await tx.procurementRecord.update({
                        where: { id: payment.procurementId },
                        data: { state: ProcurementState.PAYMENT_COMPLETED },
                    });
                    const token = await tx.token.findFirst({ where: { procurementId: payment.procurementId } });
                    if (token) {
                        await tx.token.update({
                            where: { id: token.id },
                            data: { status: TokenStatus.PAYMENT_COMPLETED },
                        });
                    }
                    await this.generateReceipt(tx, payment.id);
                }
                return updatedPayment;
            });
            return updated;
        }
        async generateReceipt(tx, paymentId) {
            const payment = await tx.payment.findUnique({
                where: { id: paymentId },
                include: { procurement: { include: { farmer: true, center: true, crop: true } }, farmer: true },
            });
            if (!payment)
                return;
            const receiptNumber = await this.generateReceiptNumber();
            await tx.receipt.create({
                data: {
                    receiptNumber,
                    paymentId,
                    procurementId: payment.procurementId,
                    farmerId: payment.farmerId,
                    amount: payment.amount,
                },
            });
            await tx.notification.create({
                data: {
                    userId: payment.farmer.userId,
                    type: 'PAYMENT_COMPLETED',
                    channel: 'IN_APP',
                    title: 'Payment Completed',
                    message: `Payment of ₹${payment.amount} completed for procurement ${payment.procurement.recordNumber}`,
                    data: { paymentId: payment.id, receiptNumber },
                },
            });
        }
        async generateReceiptNumber() {
            const date = new Date();
            const prefix = `RCP${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
            const count = await this.prisma.receipt.count({
                where: { receiptNumber: { startsWith: prefix } },
            });
            return `${prefix}${String(count + 1).padStart(4, '0')}`;
        }
        async getFarmerPayments(farmerId, params = {}) {
            const { status, page = 1, limit = 20 } = params;
            return this.findAll({ farmerId, status, page, limit });
        }
        async getReceipt(receiptId) {
            return this.prisma.receipt.findUnique({
                where: { id: receiptId },
                include: { payment: true, procurement: { include: { center: true, crop: true } }, farmer: { include: { user: true } } },
            });
        }
        async getReceiptByNumber(receiptNumber) {
            return this.prisma.receipt.findUnique({
                where: { receiptNumber },
                include: { payment: true, procurement: { include: { center: true, crop: true } }, farmer: { include: { user: true } } },
            });
        }
        async mockPaymentSuccess(paymentId) {
            return this.verifyPayment({ paymentId, providerRef: `MOCK-${Date.now()}`, status: PaymentStatus.COMPLETED });
        }
        async mockPaymentFailure(paymentId, reason) {
            const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
            if (!payment) {
                throw new NotFoundException('Payment not found');
            }
            return this.prisma.payment.update({
                where: { id: paymentId },
                data: { status: PaymentStatus.FAILED, failedAt: new Date(), failureReason: reason },
            });
        }
    };
    __setFunctionName(_classThis, "PaymentsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentsService = _classThis;
})();
export { PaymentsService };
