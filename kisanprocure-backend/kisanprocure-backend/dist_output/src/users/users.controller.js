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
import { Controller, Get, Put, Delete, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, UserStatus } from '@prisma/client';
class UpdateUserDto {
    constructor() {
        Object.defineProperty(this, "firstName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastName", {
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
        Object.defineProperty(this, "avatar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class UpdatePasswordDto {
    constructor() {
        Object.defineProperty(this, "currentPassword", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "newPassword", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let UsersController = (() => {
    let _classDecorators = [ApiTags('Users'), Controller('users'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getProfile_decorators;
    let _updateProfile_decorators;
    let _changePassword_decorators;
    let _findAll_decorators;
    let _getStats_decorators;
    let _findById_decorators;
    let _update_decorators;
    let _updateStatus_decorators;
    let _updateRole_decorators;
    let _delete_decorators;
    var UsersController = _classThis = class {
        constructor(usersService) {
            Object.defineProperty(this, "usersService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), usersService)
            });
        }
        async getProfile(req) {
            return this.usersService.findById(req.user.sub);
        }
        async updateProfile(req, dto) {
            return this.usersService.update(req.user.sub, dto);
        }
        async changePassword(req, dto) {
            await this.usersService.updatePassword(req.user.sub, dto.currentPassword, dto.newPassword);
            return { success: true, message: 'Password changed successfully' };
        }
        async findAll(role, status, page = 1, limit = 20, search) {
            return this.usersService.findAll({ role, status, page: Number(page), limit: Number(limit), search });
        }
        async getStats() {
            return this.usersService.getUserStats();
        }
        async findById(id) {
            return this.usersService.findById(id);
        }
        async update(id, dto) {
            return this.usersService.update(id, dto);
        }
        async updateStatus(id, status) {
            return this.usersService.updateStatus(id, status);
        }
        async updateRole(id, role) {
            return this.usersService.updateRole(id, role);
        }
        async delete(id) {
            await this.usersService.delete(id);
            return { success: true, message: 'User deleted successfully' };
        }
    };
    __setFunctionName(_classThis, "UsersController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getProfile_decorators = [Get('me'), ApiOperation({ summary: 'Get current user profile' }), ApiResponse({ status: 200, description: 'User profile' })];
        _updateProfile_decorators = [Put('me'), ApiOperation({ summary: 'Update current user profile' }), ApiResponse({ status: 200, description: 'Profile updated' })];
        _changePassword_decorators = [Put('me/password'), ApiOperation({ summary: 'Change password' }), ApiResponse({ status: 200, description: 'Password changed' })];
        _findAll_decorators = [Get(), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'List all users (Admin only)' }), ApiQuery({ name: 'role', required: false, enum: Role }), ApiQuery({ name: 'status', required: false, enum: UserStatus }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiQuery({ name: 'search', required: false, type: String }), ApiResponse({ status: 200, description: 'Users list' })];
        _getStats_decorators = [Get('stats'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Get user statistics (Admin only)' }), ApiResponse({ status: 200, description: 'User statistics' })];
        _findById_decorators = [Get(':id'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Get user by ID (Admin only)' }), ApiResponse({ status: 200, description: 'User found' }), ApiResponse({ status: 404, description: 'User not found' })];
        _update_decorators = [Put(':id'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Update user (Admin only)' }), ApiResponse({ status: 200, description: 'User updated' })];
        _updateStatus_decorators = [Put(':id/status'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Update user status (Admin only)' }), ApiResponse({ status: 200, description: 'Status updated' })];
        _updateRole_decorators = [Put(':id/role'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Update user role (Admin only)' }), ApiResponse({ status: 200, description: 'Role updated' })];
        _delete_decorators = [Delete(':id'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Delete user (Admin only)' }), ApiResponse({ status: 200, description: 'User deleted' })];
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProfile_decorators, { kind: "method", name: "updateProfile", static: false, private: false, access: { has: obj => "updateProfile" in obj, get: obj => obj.updateProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _changePassword_decorators, { kind: "method", name: "changePassword", static: false, private: false, access: { has: obj => "changePassword" in obj, get: obj => obj.changePassword }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getStats_decorators, { kind: "method", name: "getStats", static: false, private: false, access: { has: obj => "getStats" in obj, get: obj => obj.getStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateStatus_decorators, { kind: "method", name: "updateStatus", static: false, private: false, access: { has: obj => "updateStatus" in obj, get: obj => obj.updateStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateRole_decorators, { kind: "method", name: "updateRole", static: false, private: false, access: { has: obj => "updateRole" in obj, get: obj => obj.updateRole }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersController = _classThis;
})();
export { UsersController };
