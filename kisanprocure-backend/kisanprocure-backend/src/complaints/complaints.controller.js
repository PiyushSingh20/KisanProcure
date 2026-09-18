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
import { Role, ComplaintStatus } from '@prisma/client';
class CreateComplaintDto {
    constructor() {
        Object.defineProperty(this, "centerId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cropId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tokenId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "subject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "priority", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class UpdateComplaintDto {
    constructor() {
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "assignedToId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resolution", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "priority", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let ComplaintsController = (() => {
    let _classDecorators = [ApiTags('Complaints'), Controller('complaints'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _getMyComplaints_decorators;
    let _getAssignedComplaints_decorators;
    let _findById_decorators;
    let _findByComplaintNumber_decorators;
    let _update_decorators;
    let _findAll_decorators;
    var ComplaintsController = _classThis = class {
        constructor(complaintsService) {
            Object.defineProperty(this, "complaintsService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), complaintsService)
            });
        }
        async create(req, dto) {
            const farmer = await this.complaintsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (!farmer) {
                return { success: false, message: 'Farmer profile not found' };
            }
            return this.complaintsService.create({ ...dto, farmerId: farmer.id });
        }
        async getMyComplaints(req, status, page = 1, limit = 20) {
            const farmer = await this.complaintsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.complaintsService.getFarmerComplaints(farmer.id, { status, page: Number(page), limit: Number(limit) });
        }
        async getAssignedComplaints(req, status, page = 1, limit = 20) {
            const officer = await this.complaintsService['prisma'].officer.findUnique({ where: { userId: req.user.sub } });
            if (!officer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.complaintsService.getAssignedComplaints(officer.id, { status, page: Number(page), limit: Number(limit) });
        }
        async findById(id, req) {
            const complaint = await this.complaintsService.findById(id);
            if (!complaint) {
                return { success: false, message: 'Complaint not found' };
            }
            const farmer = await this.complaintsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (farmer && complaint.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
                return { success: false, message: 'Unauthorized' };
            }
            return complaint;
        }
        async findByComplaintNumber(complaintNumber) {
            return this.complaintsService.findByComplaintNumber(complaintNumber);
        }
        async update(id, req, dto) {
            return this.complaintsService.update(id, dto, req.user.role);
        }
        async findAll(farmerId, centerId, status, assignedToId, page = 1, limit = 20) {
            return this.complaintsService.findAll({ farmerId, centerId, status, assignedToId, page: Number(page), limit: Number(limit) });
        }
    };
    __setFunctionName(_classThis, "ComplaintsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post(), ApiOperation({ summary: 'Create a new complaint' }), ApiResponse({ status: 201, description: 'Complaint created' })];
        _getMyComplaints_decorators = [Get('me'), ApiOperation({ summary: 'Get current farmer complaints' }), ApiQuery({ name: 'status', required: false, enum: ComplaintStatus }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Complaints list' })];
        _getAssignedComplaints_decorators = [Get('assigned/me'), UseGuards(RolesGuard), Roles(Role.OFFICER, Role.ADMIN), ApiOperation({ summary: 'Get complaints assigned to current officer' }), ApiQuery({ name: 'status', required: false, enum: ComplaintStatus }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Assigned complaints' })];
        _findById_decorators = [Get(':id'), ApiOperation({ summary: 'Get complaint by ID' }), ApiResponse({ status: 200, description: 'Complaint found' }), ApiResponse({ status: 404, description: 'Complaint not found' })];
        _findByComplaintNumber_decorators = [Get('number/:complaintNumber'), ApiOperation({ summary: 'Get complaint by complaint number' }), ApiResponse({ status: 200, description: 'Complaint found' })];
        _update_decorators = [Put(':id'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Update complaint (Admin/Officer only)' }), ApiResponse({ status: 200, description: 'Complaint updated' })];
        _findAll_decorators = [Get(), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'List all complaints (Admin/Officer only)' }), ApiQuery({ name: 'farmerId', required: false, type: String }), ApiQuery({ name: 'centerId', required: false, type: String }), ApiQuery({ name: 'status', required: false, enum: ComplaintStatus }), ApiQuery({ name: 'assignedToId', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Complaints list' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyComplaints_decorators, { kind: "method", name: "getMyComplaints", static: false, private: false, access: { has: obj => "getMyComplaints" in obj, get: obj => obj.getMyComplaints }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAssignedComplaints_decorators, { kind: "method", name: "getAssignedComplaints", static: false, private: false, access: { has: obj => "getAssignedComplaints" in obj, get: obj => obj.getAssignedComplaints }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByComplaintNumber_decorators, { kind: "method", name: "findByComplaintNumber", static: false, private: false, access: { has: obj => "findByComplaintNumber" in obj, get: obj => obj.findByComplaintNumber }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ComplaintsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ComplaintsController = _classThis;
})();
export { ComplaintsController };
