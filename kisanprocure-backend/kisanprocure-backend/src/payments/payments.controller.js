var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Get, Post, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, PaymentStatus } from '@prisma/client';
class CreatePaymentDto {
    constructor() {
        Object.defineProperty(this, "procurementId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "amount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "provider", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class VerifyPaymentDto {
    constructor() {
        Object.defineProperty(this, "providerRef", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let PaymentsController = (() => {
    let _classDecorators = [ApiTags('Payments'), Controller('payments'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _createPayment_decorators;
    let _getMyPayments_decorators;
    let _findById_decorators;
    let _getPaymentStatus_decorators;
    let _findByPaymentNumber_decorators;
    let _verifyPayment_decorators;
    let _mockSuccess_decorators;
    let _mockFailure_decorators;
    let _getReceipt_decorators;
    let _getReceiptByNumber_decorators;
    let _findAll_decorators;
    var PaymentsController = _classThis = class {
        constructor(paymentsService) {
            Object.defineProperty(this, "paymentsService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), paymentsService)
            });
        }
        async createPayment(dto) {
            return this.paymentsService.createPayment(dto);
        }
        async getMyPayments(req, status, page = 1, limit = 20) {
            const farmer = await this.paymentsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.paymentsService.getFarmerPayments(farmer.id, { status, page: Number(page), limit: Number(limit) });
        }
        async findById(id, req) {
            const payment = await this.paymentsService.findById(id);
            if (!payment) {
                return { success: false, message: 'Payment not found' };
            }
            const farmer = await this.paymentsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (farmer && payment.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
                return { success: false, message: 'Unauthorized' };
            }
            return payment;
        }
        async getPaymentStatus(id) {
            return this.paymentsService.getPaymentStatus(id);
        }
        async findByPaymentNumber(paymentNumber) {
            return this.paymentsService.findByPaymentNumber(paymentNumber);
        }
        async verifyPayment(id, dto) {
            return this.paymentsService.verifyPayment({ paymentId: id, ...dto });
        }
        async mockSuccess(id) {
            return this.paymentsService.mockPaymentSuccess(id);
        }
        async mockFailure(id, reason) {
            return this.paymentsService.mockPaymentFailure(id, reason);
        }
        async getReceipt(receiptId) {
            return this.paymentsService.getReceipt(receiptId);
        }
        async getReceiptByNumber(receiptNumber) {
            return this.paymentsService.getReceiptByNumber(receiptNumber);
        }
        async findAll(farmerId, procurementId, status, page = 1, limit = 20) {
            return this.paymentsService.findAll({ farmerId, procurementId, status, page: Number(page), limit: Number(limit) });
        }
    };
    __setFunctionName(_classThis, "PaymentsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createPayment_decorators = [Post(), UseGuards(RolesGuard), Roles(Role.OFFICER, Role.ADMIN), ApiOperation({ summary: 'Create payment for procurement (Officer/Admin only)' }), ApiResponse({ status: 201, description: 'Payment created' })];
        _getMyPayments_decorators = [Get('me'), ApiOperation({ summary: 'Get current farmer payments' }), ApiQuery({ name: 'status', required: false, enum: PaymentStatus }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Payments list' })];
        _findById_decorators = [Get(':id'), ApiOperation({ summary: 'Get payment by ID' }), ApiResponse({ status: 200, description: 'Payment found' }), ApiResponse({ status: 404, description: 'Payment not found' })];
        _getPaymentStatus_decorators = [Get(':id/status'), ApiOperation({ summary: 'Get payment status' }), ApiResponse({ status: 200, description: 'Payment status' })];
        _findByPaymentNumber_decorators = [Get('number/:paymentNumber'), ApiOperation({ summary: 'Get payment by payment number' }), ApiResponse({ status: 200, description: 'Payment found' })];
        _verifyPayment_decorators = [Post(':id/verify'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Verify payment (Admin/Officer only)' }), ApiResponse({ status: 200, description: 'Payment verified' })];
        _mockSuccess_decorators = [Post(':id/mock-success'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Mock payment success (Admin only - for demo)' }), ApiResponse({ status: 200, description: 'Payment marked as successful' })];
        _mockFailure_decorators = [Post(':id/mock-failure'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Mock payment failure (Admin only - for demo)' }), ApiResponse({ status: 200, description: 'Payment marked as failed' })];
        _getReceipt_decorators = [Get('receipt/:receiptId'), ApiOperation({ summary: 'Get receipt by ID' }), ApiResponse({ status: 200, description: 'Receipt found' })];
        _getReceiptByNumber_decorators = [Get('receipt/number/:receiptNumber'), ApiOperation({ summary: 'Get receipt by receipt number' }), ApiResponse({ status: 200, description: 'Receipt found' })];
        _findAll_decorators = [Get(), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'List all payments (Admin/Officer only)' }), ApiQuery({ name: 'farmerId', required: false, type: String }), ApiQuery({ name: 'procurementId', required: false, type: String }), ApiQuery({ name: 'status', required: false, enum: PaymentStatus }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Payments list' })];
        __esDecorate(_classThis, null, _createPayment_decorators, { kind: "method", name: "createPayment", static: false, private: false, access: { has: obj => "createPayment" in obj, get: obj => obj.createPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyPayments_decorators, { kind: "method", name: "getMyPayments", static: false, private: false, access: { has: obj => "getMyPayments" in obj, get: obj => obj.getMyPayments }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPaymentStatus_decorators, { kind: "method", name: "getPaymentStatus", static: false, private: false, access: { has: obj => "getPaymentStatus" in obj, get: obj => obj.getPaymentStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByPaymentNumber_decorators, { kind: "method", name: "findByPaymentNumber", static: false, private: false, access: { has: obj => "findByPaymentNumber" in obj, get: obj => obj.findByPaymentNumber }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verifyPayment_decorators, { kind: "method", name: "verifyPayment", static: false, private: false, access: { has: obj => "verifyPayment" in obj, get: obj => obj.verifyPayment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _mockSuccess_decorators, { kind: "method", name: "mockSuccess", static: false, private: false, access: { has: obj => "mockSuccess" in obj, get: obj => obj.mockSuccess }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _mockFailure_decorators, { kind: "method", name: "mockFailure", static: false, private: false, access: { has: obj => "mockFailure" in obj, get: obj => obj.mockFailure }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getReceipt_decorators, { kind: "method", name: "getReceipt", static: false, private: false, access: { has: obj => "getReceipt" in obj, get: obj => obj.getReceipt }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getReceiptByNumber_decorators, { kind: "method", name: "getReceiptByNumber", static: false, private: false, access: { has: obj => "getReceiptByNumber" in obj, get: obj => obj.getReceiptByNumber }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentsController = _classThis;
})();
export { PaymentsController };
