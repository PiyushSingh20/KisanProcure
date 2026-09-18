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
import { Controller, Get, Post, Put, Delete, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, CenterStatus } from '@prisma/client';
class CreateCenterDto {
    constructor() {
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
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
        Object.defineProperty(this, "contactNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "email", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "capacityPerDay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "operatingHours", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "facilities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cropIds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class UpdateCenterDto {
    constructor() {
        Object.defineProperty(this, "name", {
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
        Object.defineProperty(this, "contactNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "email", {
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
        Object.defineProperty(this, "capacityPerDay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "operatingHours", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "facilities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cropIds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class CreateCounterDto {
    constructor() {
        Object.defineProperty(this, "counterNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class UpdateCounterDto {
    constructor() {
        Object.defineProperty(this, "isActive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let CentersController = (() => {
    let _classDecorators = [ApiTags('Centers'), Controller('centers')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findNearby_decorators;
    let _findById_decorators;
    let _getStats_decorators;
    let _update_decorators;
    let _delete_decorators;
    let _addCounter_decorators;
    let _updateCounter_decorators;
    let _deleteCounter_decorators;
    var CentersController = _classThis = class {
        constructor(centersService) {
            Object.defineProperty(this, "centersService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), centersService)
            });
        }
        async create(dto) {
            return this.centersService.create(dto);
        }
        async findAll(district, state, status, cropId, page = 1, limit = 20, search) {
            return this.centersService.findAll({ district, state, status, page: Number(page), limit: Number(limit), search, cropId });
        }
        async findNearby(latitude, longitude, radiusKm = 50) {
            return this.centersService.getNearbyCenters(latitude, longitude, radiusKm);
        }
        async findById(id) {
            return this.centersService.findById(id);
        }
        async getStats(id, date) {
            return this.centersService.getCenterStats(id, date ? new Date(date) : undefined);
        }
        async update(id, dto) {
            return this.centersService.update(id, dto);
        }
        async delete(id) {
            await this.centersService.delete(id);
            return { success: true, message: 'Center deleted successfully' };
        }
        async addCounter(id, dto) {
            return this.centersService.addCounter(id, dto);
        }
        async updateCounter(id, counterId, dto) {
            return this.centersService.updateCounter(id, counterId, dto);
        }
        async deleteCounter(id, counterId) {
            await this.centersService.deleteCounter(id, counterId);
            return { success: true, message: 'Counter deleted successfully' };
        }
    };
    __setFunctionName(_classThis, "CentersController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post(), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Create a new procurement center (Admin only)' }), ApiResponse({ status: 201, description: 'Center created' })];
        _findAll_decorators = [Get(), ApiOperation({ summary: 'List all procurement centers' }), ApiQuery({ name: 'district', required: false, type: String }), ApiQuery({ name: 'state', required: false, type: String }), ApiQuery({ name: 'status', required: false, enum: CenterStatus }), ApiQuery({ name: 'cropId', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiQuery({ name: 'search', required: false, type: String }), ApiResponse({ status: 200, description: 'Centers list' })];
        _findNearby_decorators = [Get('nearby'), ApiOperation({ summary: 'Find nearby centers' }), ApiQuery({ name: 'latitude', required: true, type: Number }), ApiQuery({ name: 'longitude', required: true, type: Number }), ApiQuery({ name: 'radiusKm', required: false, type: Number }), ApiResponse({ status: 200, description: 'Nearby centers' })];
        _findById_decorators = [Get(':id'), ApiOperation({ summary: 'Get center by ID' }), ApiResponse({ status: 200, description: 'Center found' }), ApiResponse({ status: 404, description: 'Center not found' })];
        _getStats_decorators = [Get(':id/stats'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiBearerAuth(), ApiOperation({ summary: 'Get center statistics (Admin/Officer only)' }), ApiQuery({ name: 'date', required: false, type: String }), ApiResponse({ status: 200, description: 'Center statistics' })];
        _update_decorators = [Put(':id'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Update center (Admin only)' }), ApiResponse({ status: 200, description: 'Center updated' })];
        _delete_decorators = [Delete(':id'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Delete center (Admin only)' }), ApiResponse({ status: 200, description: 'Center deleted' })];
        _addCounter_decorators = [Post(':id/counters'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Add counter to center (Admin only)' }), ApiResponse({ status: 201, description: 'Counter added' })];
        _updateCounter_decorators = [Put(':id/counters/:counterId'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Update counter (Admin only)' }), ApiResponse({ status: 200, description: 'Counter updated' })];
        _deleteCounter_decorators = [Delete(':id/counters/:counterId'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Delete counter (Admin only)' }), ApiResponse({ status: 200, description: 'Counter deleted' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findNearby_decorators, { kind: "method", name: "findNearby", static: false, private: false, access: { has: obj => "findNearby" in obj, get: obj => obj.findNearby }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addCounter_decorators, { kind: "method", name: "addCounter", static: false, private: false, access: { has: obj => "addCounter" in obj, get: obj => obj.addCounter }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateCounter_decorators, { kind: "method", name: "updateCounter", static: false, private: false, access: { has: obj => "updateCounter" in obj, get: obj => obj.updateCounter }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteCounter_decorators, { kind: "method", name: "deleteCounter", static: false, private: false, access: { has: obj => "deleteCounter" in obj, get: obj => obj.deleteCounter }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CentersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CentersController = _classThis;
})();
export { CentersController };
