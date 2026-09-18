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
class UpdateAdminDto {
    constructor() {
        Object.defineProperty(this, "permissions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let AdminsController = (() => {
    let _classDecorators = [ApiTags('Admins'), Controller('admins'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getMyProfile_decorators;
    let _updateMyProfile_decorators;
    let _getStats_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _update_decorators;
    var AdminsController = _classThis = class {
        constructor(adminsService) {
            Object.defineProperty(this, "adminsService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), adminsService)
            });
        }
        async getMyProfile(req) {
            return this.adminsService.findByUserId(req.user.sub);
        }
        async updateMyProfile(req, dto) {
            const admin = await this.adminsService.findByUserId(req.user.sub);
            if (!admin) {
                return { success: false, message: 'Admin profile not found' };
            }
            return this.adminsService.update(admin.id, dto);
        }
        async getStats() {
            return this.adminsService.getSystemStats();
        }
        async findAll(page = 1, limit = 20, search) {
            return this.adminsService.findAll({ page: Number(page), limit: Number(limit), search });
        }
        async findById(id) {
            return this.adminsService.findById(id);
        }
        async update(id, dto) {
            return this.adminsService.update(id, dto);
        }
    };
    __setFunctionName(_classThis, "AdminsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getMyProfile_decorators = [Get('me'), ApiOperation({ summary: 'Get current admin profile' }), ApiResponse({ status: 200, description: 'Admin profile' })];
        _updateMyProfile_decorators = [Put('me'), ApiOperation({ summary: 'Update current admin profile' }), ApiResponse({ status: 200, description: 'Profile updated' })];
        _getStats_decorators = [Get('stats'), ApiOperation({ summary: 'Get system statistics' }), ApiResponse({ status: 200, description: 'System statistics' })];
        _findAll_decorators = [Get(), ApiOperation({ summary: 'List all admins' }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiQuery({ name: 'search', required: false, type: String }), ApiResponse({ status: 200, description: 'Admins list' })];
        _findById_decorators = [Get(':id'), ApiOperation({ summary: 'Get admin by ID' }), ApiResponse({ status: 200, description: 'Admin found' }), ApiResponse({ status: 404, description: 'Admin not found' })];
        _update_decorators = [Put(':id'), ApiOperation({ summary: 'Update admin' }), ApiResponse({ status: 200, description: 'Admin updated' })];
        __esDecorate(_classThis, null, _getMyProfile_decorators, { kind: "method", name: "getMyProfile", static: false, private: false, access: { has: obj => "getMyProfile" in obj, get: obj => obj.getMyProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateMyProfile_decorators, { kind: "method", name: "updateMyProfile", static: false, private: false, access: { has: obj => "updateMyProfile" in obj, get: obj => obj.updateMyProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AdminsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AdminsController = _classThis;
})();
export { AdminsController };
