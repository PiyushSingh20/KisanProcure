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
import { Controller, Get, Post, Put, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, TokenStatus } from '@prisma/client';
let TokensController = (() => {
    let _classDecorators = [ApiTags('Tokens'), Controller('tokens'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _generateFromBooking_decorators;
    let _getMyTokens_decorators;
    let _findById_decorators;
    let _getTokenStatus_decorators;
    let _findByTokenNumber_decorators;
    let _updateStatus_decorators;
    let _callNextToken_decorators;
    let _completeAtCounter_decorators;
    let _findAll_decorators;
    var TokensController = _classThis = class {
        constructor(tokensService) {
            Object.defineProperty(this, "tokensService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), tokensService)
            });
        }
        async generateFromBooking(bookingId, req) {
            const booking = await this.tokensService['prisma'].booking.findUnique({ where: { id: bookingId } });
            if (!booking) {
                return { success: false, message: 'Booking not found' };
            }
            const farmer = await this.tokensService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (farmer && booking.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
                return { success: false, message: 'Unauthorized' };
            }
            return this.tokensService.generateFromBooking(bookingId);
        }
        async getMyTokens(req, status, page = 1, limit = 20) {
            const farmer = await this.tokensService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.tokensService.getFarmerTokens(farmer.id, { status, page: Number(page), limit: Number(limit) });
        }
        async findById(id, req) {
            const token = await this.tokensService.findById(id);
            if (!token) {
                return { success: false, message: 'Token not found' };
            }
            const farmer = await this.tokensService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (farmer && token.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
                return { success: false, message: 'Unauthorized' };
            }
            return token;
        }
        async getTokenStatus(id, req) {
            const token = await this.tokensService.findById(id);
            if (!token) {
                return { success: false, message: 'Token not found' };
            }
            const farmer = await this.tokensService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (farmer && token.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
                return { success: false, message: 'Unauthorized' };
            }
            return this.tokensService.getTokenStatus(id);
        }
        async findByTokenNumber(tokenNumber) {
            return this.tokensService.findByTokenNumber(tokenNumber);
        }
        async updateStatus(id, dto) {
            return this.tokensService.updateStatus(id, dto.status);
        }
        async callNextToken(req, dto) {
            const officer = await this.tokensService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
            if (!officer) {
                return { success: false, message: 'Officer profile not found' };
            }
            return this.tokensService.callNextToken(dto.centerId, dto.counterId, officer.id);
        }
        async completeAtCounter(req, counterId) {
            const officer = await this.tokensService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
            if (!officer) {
                return { success: false, message: 'Officer profile not found' };
            }
            return this.tokensService.completeTokenAtCounter(counterId, officer.id);
        }
        async findAll(farmerId, centerId, cropId, status, page = 1, limit = 20) {
            return this.tokensService.findAll({ farmerId, centerId, cropId, status, page: Number(page), limit: Number(limit) });
        }
    };
    __setFunctionName(_classThis, "TokensController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _generateFromBooking_decorators = [Post('generate/:bookingId'), ApiOperation({ summary: 'Generate token from booking' }), ApiResponse({ status: 201, description: 'Token generated' })];
        _getMyTokens_decorators = [Get('me'), ApiOperation({ summary: 'Get current farmer tokens' }), ApiQuery({ name: 'status', required: false, enum: TokenStatus }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Tokens list' })];
        _findById_decorators = [Get(':id'), ApiOperation({ summary: 'Get token by ID' }), ApiResponse({ status: 200, description: 'Token found' }), ApiResponse({ status: 404, description: 'Token not found' })];
        _getTokenStatus_decorators = [Get(':id/status'), ApiOperation({ summary: 'Get token status with queue position' }), ApiResponse({ status: 200, description: 'Token status' })];
        _findByTokenNumber_decorators = [Get('number/:tokenNumber'), ApiOperation({ summary: 'Get token by token number' }), ApiResponse({ status: 200, description: 'Token found' })];
        _updateStatus_decorators = [Put(':id/status'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Update token status (Admin/Officer only)' }), ApiResponse({ status: 200, description: 'Token status updated' })];
        _callNextToken_decorators = [Post('call-next'), UseGuards(RolesGuard), Roles(Role.OFFICER, Role.ADMIN), ApiOperation({ summary: 'Call next token in queue (Officer/Admin only)' }), ApiResponse({ status: 200, description: 'Next token called' })];
        _completeAtCounter_decorators = [Post('complete-counter/:counterId'), UseGuards(RolesGuard), Roles(Role.OFFICER, Role.ADMIN), ApiOperation({ summary: 'Complete current token at counter (Officer/Admin only)' }), ApiResponse({ status: 200, description: 'Token completed at counter' })];
        _findAll_decorators = [Get(), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'List all tokens (Admin/Officer only)' }), ApiQuery({ name: 'farmerId', required: false, type: String }), ApiQuery({ name: 'centerId', required: false, type: String }), ApiQuery({ name: 'cropId', required: false, type: String }), ApiQuery({ name: 'status', required: false, enum: TokenStatus }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Tokens list' })];
        __esDecorate(_classThis, null, _generateFromBooking_decorators, { kind: "method", name: "generateFromBooking", static: false, private: false, access: { has: obj => "generateFromBooking" in obj, get: obj => obj.generateFromBooking }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyTokens_decorators, { kind: "method", name: "getMyTokens", static: false, private: false, access: { has: obj => "getMyTokens" in obj, get: obj => obj.getMyTokens }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getTokenStatus_decorators, { kind: "method", name: "getTokenStatus", static: false, private: false, access: { has: obj => "getTokenStatus" in obj, get: obj => obj.getTokenStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByTokenNumber_decorators, { kind: "method", name: "findByTokenNumber", static: false, private: false, access: { has: obj => "findByTokenNumber" in obj, get: obj => obj.findByTokenNumber }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: obj => "updateStatus" in obj, get: obj => obj.updateStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _callNextToken_decorators, { kind: "method", name: "callNextToken", static: false, private: false, access: { has: obj => "callNextToken" in obj, get: obj => obj.callNextToken }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _completeAtCounter_decorators, { kind: "method", name: "completeAtCounter", static: false, private: false, access: { has: obj => "completeAtCounter" in obj, get: obj => obj.completeAtCounter }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TokensController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TokensController = _classThis;
})();
export { TokensController };
