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
import { Controller, Get, Put, Post, Delete, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
class CreateFarmerProduceDto {
    constructor() {
        Object.defineProperty(this, "cropId", {
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
        Object.defineProperty(this, "expectedPrice", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "harvestDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "qualityGrade", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class UpdateFarmerProduceDto {
    constructor() {
        Object.defineProperty(this, "quantity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "expectedPrice", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "harvestDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "qualityGrade", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class UpdateFarmerDto {
    constructor() {
        Object.defineProperty(this, "aadhaarNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "panNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bankAccount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ifscCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "address", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "village", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "district", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pincode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "latitude", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "longitude", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "totalLandArea", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let FarmersController = (() => {
    let _classDecorators = [ApiTags('Farmers'), Controller('farmers'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getMyProfile_decorators;
    let _updateMyProfile_decorators;
    let _getMyProduce_decorators;
    let _addMyProduce_decorators;
    let _updateMyProduce_decorators;
    let _deleteMyProduce_decorators;
    let _getMyBookings_decorators;
    let _getMyTokens_decorators;
    let _getMyProcurementHistory_decorators;
    let _getMyPayments_decorators;
    let _getMyComplaints_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _update_decorators;
    var FarmersController = _classThis = class {
        constructor(farmersService) {
            Object.defineProperty(this, "farmersService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), farmersService)
            });
        }
        async getMyProfile(req) {
            return this.farmersService.findByUserId(req.user.sub);
        }
        async updateMyProfile(req, dto) {
            const farmer = await this.farmersService.findByUserId(req.user.sub);
            if (!farmer) {
                return { success: false, message: 'Farmer profile not found' };
            }
            return this.farmersService.update(farmer.id, dto);
        }
        async getMyProduce(req) {
            const farmer = await this.farmersService.findByUserId(req.user.sub);
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.farmersService.getFarmerProduce(farmer.id);
        }
        async addMyProduce(req, dto) {
            const farmer = await this.farmersService.findByUserId(req.user.sub);
            if (!farmer) {
                return { success: false, message: 'Farmer profile not found' };
            }
            return this.farmersService.addProduce(farmer.id, dto);
        }
        async updateMyProduce(req, produceId, dto) {
            const farmer = await this.farmersService.findByUserId(req.user.sub);
            if (!farmer) {
                return { success: false, message: 'Farmer profile not found' };
            }
            return this.farmersService.updateProduce(farmer.id, produceId, dto);
        }
        async deleteMyProduce(req, produceId) {
            const farmer = await this.farmersService.findByUserId(req.user.sub);
            if (!farmer) {
                return { success: false, message: 'Farmer profile not found' };
            }
            await this.farmersService.deleteProduce(farmer.id, produceId);
            return { success: true, message: 'Produce deleted successfully' };
        }
        async getMyBookings(req, status, page = 1, limit = 20) {
            const farmer = await this.farmersService.findByUserId(req.user.sub);
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.farmersService.getFarmerBookings(farmer.id, { status, page: Number(page), limit: Number(limit) });
        }
        async getMyTokens(req, status, page = 1, limit = 20) {
            const farmer = await this.farmersService.findByUserId(req.user.sub);
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.farmersService.getFarmerTokens(farmer.id, { status, page: Number(page), limit: Number(limit) });
        }
        async getMyProcurementHistory(req, page = 1, limit = 20) {
            const farmer = await this.farmersService.findByUserId(req.user.sub);
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.farmersService.getFarmerProcurementHistory(farmer.id, { page: Number(page), limit: Number(limit) });
        }
        async getMyPayments(req, status, page = 1, limit = 20) {
            const farmer = await this.farmersService.findByUserId(req.user.sub);
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.farmersService.getFarmerPayments(farmer.id, { status, page: Number(page), limit: Number(limit) });
        }
        async getMyComplaints(req, status, page = 1, limit = 20) {
            const farmer = await this.farmersService.findByUserId(req.user.sub);
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.farmersService.getFarmerComplaints(farmer.id, { status, page: Number(page), limit: Number(limit) });
        }
        async findAll(district, state, page = 1, limit = 20, search) {
            return this.farmersService.findAll({ district, state, page: Number(page), limit: Number(limit), search });
        }
        async findById(id) {
            return this.farmersService.findById(id);
        }
        async update(id, dto) {
            return this.farmersService.update(id, dto);
        }
    };
    __setFunctionName(_classThis, "FarmersController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getMyProfile_decorators = [Get('me'), ApiOperation({ summary: 'Get current farmer profile' }), ApiResponse({ status: 200, description: 'Farmer profile' })];
        _updateMyProfile_decorators = [Put('me'), ApiOperation({ summary: 'Update current farmer profile' }), ApiResponse({ status: 200, description: 'Profile updated' })];
        _getMyProduce_decorators = [Get('me/produce'), ApiOperation({ summary: 'Get current farmer produce' }), ApiResponse({ status: 200, description: 'Farmer produce list' })];
        _addMyProduce_decorators = [Post('me/produce'), ApiOperation({ summary: 'Add/update farmer produce' }), ApiResponse({ status: 201, description: 'Produce added/updated' })];
        _updateMyProduce_decorators = [Put('me/produce/:produceId'), ApiOperation({ summary: 'Update farmer produce' }), ApiResponse({ status: 200, description: 'Produce updated' })];
        _deleteMyProduce_decorators = [Delete('me/produce/:produceId'), ApiOperation({ summary: 'Delete farmer produce' }), ApiResponse({ status: 200, description: 'Produce deleted' })];
        _getMyBookings_decorators = [Get('me/bookings'), ApiOperation({ summary: 'Get current farmer bookings' }), ApiQuery({ name: 'status', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number })];
        _getMyTokens_decorators = [Get('me/tokens'), ApiOperation({ summary: 'Get current farmer tokens' }), ApiQuery({ name: 'status', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number })];
        _getMyProcurementHistory_decorators = [Get('me/procurement'), ApiOperation({ summary: 'Get current farmer procurement history' }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number })];
        _getMyPayments_decorators = [Get('me/payments'), ApiOperation({ summary: 'Get current farmer payments' }), ApiQuery({ name: 'status', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number })];
        _getMyComplaints_decorators = [Get('me/complaints'), ApiOperation({ summary: 'Get current farmer complaints' }), ApiQuery({ name: 'status', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number })];
        _findAll_decorators = [Get(), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'List all farmers (Admin/Officer only)' }), ApiQuery({ name: 'district', required: false, type: String }), ApiQuery({ name: 'state', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiQuery({ name: 'search', required: false, type: String }), ApiResponse({ status: 200, description: 'Farmers list' })];
        _findById_decorators = [Get(':id'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Get farmer by ID (Admin/Officer only)' }), ApiResponse({ status: 200, description: 'Farmer found' }), ApiResponse({ status: 404, description: 'Farmer not found' })];
        _update_decorators = [Put(':id'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Update farmer (Admin only)' }), ApiResponse({ status: 200, description: 'Farmer updated' })];
        __esDecorate(_classThis, null, _getMyProfile_decorators, { kind: "method", name: "getMyProfile", static: false, private: false, access: { has: obj => "getMyProfile" in obj, get: obj => obj.getMyProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateMyProfile_decorators, { kind: "method", name: "updateMyProfile", static: false, private: false, access: { has: obj => "updateMyProfile" in obj, get: obj => obj.updateMyProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyProduce_decorators, { kind: "method", name: "getMyProduce", static: false, private: false, access: { has: obj => "getMyProduce" in obj, get: obj => obj.getMyProduce }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addMyProduce_decorators, { kind: "method", name: "addMyProduce", static: false, private: false, access: { has: obj => "addMyProduce" in obj, get: obj => obj.addMyProduce }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateMyProduce_decorators, { kind: "method", name: "updateMyProduce", static: false, private: false, access: { has: obj => "updateMyProduce" in obj, get: obj => obj.updateMyProduce }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteMyProduce_decorators, { kind: "method", name: "deleteMyProduce", static: false, private: false, access: { has: obj => "deleteMyProduce" in obj, get: obj => obj.deleteMyProduce }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyBookings_decorators, { kind: "method", name: "getMyBookings", static: false, private: false, access: { has: obj => "getMyBookings" in obj, get: obj => obj.getMyBookings }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyTokens_decorators, { kind: "method", name: "getMyTokens", static: false, private: false, access: { has: obj => "getMyTokens" in obj, get: obj => obj.getMyTokens }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyProcurementHistory_decorators, { kind: "method", name: "getMyProcurementHistory", static: false, private: false, access: { has: obj => "getMyProcurementHistory" in obj, get: obj => obj.getMyProcurementHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyPayments_decorators, { kind: "method", name: "getMyPayments", static: false, private: false, access: { has: obj => "getMyPayments" in obj, get: obj => obj.getMyPayments }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyComplaints_decorators, { kind: "method", name: "getMyComplaints", static: false, private: false, access: { has: obj => "getMyComplaints" in obj, get: obj => obj.getMyComplaints }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FarmersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FarmersController = _classThis;
})();
export { FarmersController };
