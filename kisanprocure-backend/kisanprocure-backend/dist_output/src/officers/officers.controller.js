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
import { Controller, Get, Put, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
class UpdateOfficerDto {
    constructor() {
        Object.defineProperty(this, "centerId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "designation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "permissions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let OfficersController = (() => {
    let _classDecorators = [ApiTags('Officers'), Controller('officers'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getMyProfile_decorators;
    let _updateMyProfile_decorators;
    let _getMyStats_decorators;
    let _getMyCenter_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _update_decorators;
    var OfficersController = _classThis = class {
        constructor(officersService) {
            Object.defineProperty(this, "officersService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), officersService)
            });
        }
        async getMyProfile(req) {
            return this.officersService.findByUserId(req.user.sub);
        }
        async updateMyProfile(req, dto) {
            const officer = await this.officersService.findByUserId(req.user.sub);
            if (!officer) {
                return { success: false, message: 'Officer profile not found' };
            }
            return this.officersService.update(officer.id, dto);
        }
        async getMyStats(req) {
            const officer = await this.officersService.findByUserId(req.user.sub);
            if (!officer) {
                return { success: false, message: 'Officer profile not found' };
            }
            return this.officersService.getOfficerStats(officer.id);
        }
        async getMyCenter(req) {
            const officer = await this.officersService.findByUserId(req.user.sub);
            if (!officer) {
                return { success: false, message: 'Officer profile not found' };
            }
            return this.officersService.getAssignedCenter(officer.id);
        }
        async findAll(centerId, page = 1, limit = 20, search) {
            return this.officersService.findAll({ centerId, page: Number(page), limit: Number(limit), search });
        }
        async findById(id) {
            return this.officersService.findById(id);
        }
        async update(id, dto) {
            return this.officersService.update(id, dto);
        }
    };
    __setFunctionName(_classThis, "OfficersController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getMyProfile_decorators = [Get('me'), ApiOperation({ summary: 'Get current officer profile' }), ApiResponse({ status: 200, description: 'Officer profile' })];
        _updateMyProfile_decorators = [Put('me'), ApiOperation({ summary: 'Update current officer profile (Admin only)' }), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiResponse({ status: 200, description: 'Profile updated' })];
        _getMyStats_decorators = [Get('me/stats'), ApiOperation({ summary: 'Get current officer statistics' }), ApiResponse({ status: 200, description: 'Officer statistics' })];
        _getMyCenter_decorators = [Get('me/center'), ApiOperation({ summary: 'Get current officer assigned center' }), ApiResponse({ status: 200, description: 'Assigned center' })];
        _findAll_decorators = [Get(), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'List all officers (Admin only)' }), ApiQuery({ name: 'centerId', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiQuery({ name: 'search', required: false, type: String }), ApiResponse({ status: 200, description: 'Officers list' })];
        _findById_decorators = [Get(':id'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Get officer by ID (Admin only)' }), ApiResponse({ status: 200, description: 'Officer found' }), ApiResponse({ status: 404, description: 'Officer not found' })];
        _update_decorators = [Put(':id'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Update officer (Admin only)' }), ApiResponse({ status: 200, description: 'Officer updated' })];
        __esDecorate(_classThis, null, _getMyProfile_decorators, { kind: "method", name: "getMyProfile", static: false, private: false, access: { has: obj => "getMyProfile" in obj, get: obj => obj.getMyProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateMyProfile_decorators, { kind: "method", name: "updateMyProfile", static: false, private: false, access: { has: obj => "updateMyProfile" in obj, get: obj => obj.updateMyProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyStats_decorators, { kind: "method", name: "getMyStats", static: false, private: false, access: { has: obj => "getMyStats" in obj, get: obj => obj.getMyStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyCenter_decorators, { kind: "method", name: "getMyCenter", static: false, private: false, access: { has: obj => "getMyCenter" in obj, get: obj => obj.getMyCenter }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OfficersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OfficersController = _classThis;
})();
export { OfficersController };
