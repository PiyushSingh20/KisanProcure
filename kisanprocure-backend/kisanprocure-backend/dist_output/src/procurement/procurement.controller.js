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
import { Role, ProcurementState } from '@prisma/client';
class StartProcurementDto {
    constructor() {
        Object.defineProperty(this, "tokenId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "quantity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class QualityCheckDto {
    constructor() {
        Object.defineProperty(this, "moistureContent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "foreignMatter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "damagedGrains", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "testWeight", {
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
        Object.defineProperty(this, "notes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class WeighmentDto {
    constructor() {
        Object.defineProperty(this, "grossWeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tareWeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class CompleteProcurementDto {
    constructor() {
        Object.defineProperty(this, "unitPrice", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let ProcurementController = (() => {
    let _classDecorators = [ApiTags('Procurement'), Controller('procurement'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _startProcurement_decorators;
    let _getMyProcurementHistory_decorators;
    let _findById_decorators;
    let _findByRecordNumber_decorators;
    let _updateState_decorators;
    let _qualityCheck_decorators;
    let _weighment_decorators;
    let _completeProcurement_decorators;
    let _findAll_decorators;
    var ProcurementController = _classThis = class {
        constructor(procurementService) {
            Object.defineProperty(this, "procurementService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), procurementService)
            });
        }
        async startProcurement(req, dto) {
            const officer = await this.procurementService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
            if (!officer) {
                return { success: false, message: 'Officer profile not found' };
            }
            return this.procurementService.startProcurement({ ...dto, officerId: officer.id });
        }
        async getMyProcurementHistory(req, page = 1, limit = 20) {
            const farmer = await this.procurementService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.procurementService.getFarmerProcurementHistory(farmer.id, { page: Number(page), limit: Number(limit) });
        }
        async findById(id, req) {
            const record = await this.procurementService.findById(id);
            if (!record) {
                return { success: false, message: 'Procurement record not found' };
            }
            const farmer = await this.procurementService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (farmer && record.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
                return { success: false, message: 'Unauthorized' };
            }
            return record;
        }
        async findByRecordNumber(recordNumber) {
            return this.procurementService.findByRecordNumber(recordNumber);
        }
        async updateState(id, req, dto) {
            const officer = await this.procurementService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
            return this.procurementService.updateState(id, dto.state, officer?.id);
        }
        async qualityCheck(id, req, dto) {
            const officer = await this.procurementService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
            if (!officer) {
                return { success: false, message: 'Officer profile not found' };
            }
            return this.procurementService.performQualityCheck({ ...dto, procurementId: id, officerId: officer.id });
        }
        async weighment(id, req, dto) {
            const officer = await this.procurementService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
            if (!officer) {
                return { success: false, message: 'Officer profile not found' };
            }
            return this.procurementService.performWeighment({ ...dto, procurementId: id, officerId: officer.id });
        }
        async completeProcurement(id, req, dto) {
            const officer = await this.procurementService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
            if (!officer) {
                return { success: false, message: 'Officer profile not found' };
            }
            return this.procurementService.completeProcurement(id, officer.id, dto.unitPrice);
        }
        async findAll(farmerId, centerId, cropId, state, dateFrom, dateTo, page = 1, limit = 20) {
            return this.procurementService.findAll({
                farmerId,
                centerId,
                cropId,
                state,
                dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                dateTo: dateTo ? new Date(dateTo) : undefined,
                page: Number(page),
                limit: Number(limit),
            });
        }
    };
    __setFunctionName(_classThis, "ProcurementController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _startProcurement_decorators = [Post('start'), UseGuards(RolesGuard), Roles(Role.OFFICER, Role.ADMIN), ApiOperation({ summary: 'Start procurement process (Officer/Admin only)' }), ApiResponse({ status: 201, description: 'Procurement started' })];
        _getMyProcurementHistory_decorators = [Get('me'), ApiOperation({ summary: 'Get current farmer procurement history' }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Procurement history' })];
        _findById_decorators = [Get(':id'), ApiOperation({ summary: 'Get procurement record by ID' }), ApiResponse({ status: 200, description: 'Procurement record found' }), ApiResponse({ status: 404, description: 'Procurement record not found' })];
        _findByRecordNumber_decorators = [Get('number/:recordNumber'), ApiOperation({ summary: 'Get procurement record by record number' }), ApiResponse({ status: 200, description: 'Procurement record found' })];
        _updateState_decorators = [Put(':id/state'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Update procurement state (Admin/Officer only)' }), ApiResponse({ status: 200, description: 'State updated' })];
        _qualityCheck_decorators = [Post(':id/quality-check'), UseGuards(RolesGuard), Roles(Role.OFFICER, Role.ADMIN), ApiOperation({ summary: 'Perform quality check (Officer/Admin only)' }), ApiResponse({ status: 200, description: 'Quality check recorded' })];
        _weighment_decorators = [Post(':id/weighment'), UseGuards(RolesGuard), Roles(Role.OFFICER, Role.ADMIN), ApiOperation({ summary: 'Perform weighment (Officer/Admin only)' }), ApiResponse({ status: 200, description: 'Weighment recorded' })];
        _completeProcurement_decorators = [Post(':id/complete'), UseGuards(RolesGuard), Roles(Role.OFFICER, Role.ADMIN), ApiOperation({ summary: 'Complete procurement with pricing (Officer/Admin only)' }), ApiResponse({ status: 200, description: 'Procurement completed' })];
        _findAll_decorators = [Get(), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'List all procurement records (Admin/Officer only)' }), ApiQuery({ name: 'farmerId', required: false, type: String }), ApiQuery({ name: 'centerId', required: false, type: String }), ApiQuery({ name: 'cropId', required: false, type: String }), ApiQuery({ name: 'state', required: false, enum: ProcurementState }), ApiQuery({ name: 'dateFrom', required: false, type: String }), ApiQuery({ name: 'dateTo', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Procurement records list' })];
        __esDecorate(_classThis, null, _startProcurement_decorators, { kind: "method", name: "startProcurement", static: false, private: false, access: { has: obj => "startProcurement" in obj, get: obj => obj.startProcurement }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyProcurementHistory_decorators, { kind: "method", name: "getMyProcurementHistory", static: false, private: false, access: { has: obj => "getMyProcurementHistory" in obj, get: obj => obj.getMyProcurementHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByRecordNumber_decorators, { kind: "method", name: "findByRecordNumber", static: false, private: false, access: { has: obj => "findByRecordNumber" in obj, get: obj => obj.findByRecordNumber }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateState_decorators, { kind: "method", name: "updateState", static: false, private: false, access: { has: obj => "updateState" in obj, get: obj => obj.updateState }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _qualityCheck_decorators, { kind: "method", name: "qualityCheck", static: false, private: false, access: { has: obj => "qualityCheck" in obj, get: obj => obj.qualityCheck }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _weighment_decorators, { kind: "method", name: "weighment", static: false, private: false, access: { has: obj => "weighment" in obj, get: obj => obj.weighment }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _completeProcurement_decorators, { kind: "method", name: "completeProcurement", static: false, private: false, access: { has: obj => "completeProcurement" in obj, get: obj => obj.completeProcurement }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProcurementController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProcurementController = _classThis;
})();
export { ProcurementController };
