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
import { Role, NotificationType } from '@prisma/client';
class CreateNotificationDto {
    constructor() {
        Object.defineProperty(this, "userId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "channel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "title", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "message", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class BulkNotificationDto {
    constructor() {
        Object.defineProperty(this, "userIds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "channel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "title", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "message", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let NotificationsController = (() => {
    let _classDecorators = [ApiTags('Notifications'), Controller('notifications'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getMyNotifications_decorators;
    let _getUnreadCount_decorators;
    let _markAsRead_decorators;
    let _markAllAsRead_decorators;
    let _delete_decorators;
    let _create_decorators;
    let _sendBulk_decorators;
    let _sendByRole_decorators;
    let _findAll_decorators;
    var NotificationsController = _classThis = class {
        constructor(notificationsService) {
            Object.defineProperty(this, "notificationsService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), notificationsService)
            });
        }
        async getMyNotifications(req, isRead, page = 1, limit = 20) {
            return this.notificationsService.getUserNotifications(req.user.sub, { isRead, page: Number(page), limit: Number(limit) });
        }
        async getUnreadCount(req) {
            const count = await this.notificationsService.getUnreadCount(req.user.sub);
            return { count };
        }
        async markAsRead(id, req) {
            return this.notificationsService.markAsRead(id, req.user.sub);
        }
        async markAllAsRead(req) {
            const count = await this.notificationsService.markAllAsRead(req.user.sub);
            return { success: true, count };
        }
        async delete(id, req) {
            await this.notificationsService.delete(id, req.user.sub);
            return { success: true, message: 'Notification deleted' };
        }
        async create(dto) {
            return this.notificationsService.create(dto);
        }
        async sendBulk(dto) {
            return this.notificationsService.sendBulkNotification(dto.userIds, dto);
        }
        async sendByRole(dto) {
            const { role, ...data } = dto;
            return this.notificationsService.sendNotificationByRole(role, data);
        }
        async findAll(userId, type, isRead, page = 1, limit = 20) {
            return this.notificationsService.findAll({ userId, type, isRead, page: Number(page), limit: Number(limit) });
        }
    };
    __setFunctionName(_classThis, "NotificationsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getMyNotifications_decorators = [Get('me'), ApiOperation({ summary: 'Get current user notifications' }), ApiQuery({ name: 'isRead', required: false, type: Boolean }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Notifications list' })];
        _getUnreadCount_decorators = [Get('me/unread-count'), ApiOperation({ summary: 'Get unread notifications count' }), ApiResponse({ status: 200, description: 'Unread count' })];
        _markAsRead_decorators = [Put('me/:id/read'), ApiOperation({ summary: 'Mark notification as read' }), ApiResponse({ status: 200, description: 'Notification marked as read' })];
        _markAllAsRead_decorators = [Put('me/read-all'), ApiOperation({ summary: 'Mark all notifications as read' }), ApiResponse({ status: 200, description: 'All notifications marked as read' })];
        _delete_decorators = [Delete('me/:id'), ApiOperation({ summary: 'Delete notification' }), ApiResponse({ status: 200, description: 'Notification deleted' })];
        _create_decorators = [Post(), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Create notification (Admin only)' }), ApiResponse({ status: 201, description: 'Notification created' })];
        _sendBulk_decorators = [Post('bulk'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Send bulk notification (Admin only)' }), ApiResponse({ status: 201, description: 'Bulk notification sent' })];
        _sendByRole_decorators = [Post('by-role'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Send notification to all users with a role (Admin only)' }), ApiResponse({ status: 201, description: 'Notifications sent' })];
        _findAll_decorators = [Get(), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'List all notifications (Admin only)' }), ApiQuery({ name: 'userId', required: false, type: String }), ApiQuery({ name: 'type', required: false, enum: NotificationType }), ApiQuery({ name: 'isRead', required: false, type: Boolean }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Notifications list' })];
        __esDecorate(_classThis, null, _getMyNotifications_decorators, { kind: "method", name: "getMyNotifications", static: false, private: false, access: { has: obj => "getMyNotifications" in obj, get: obj => obj.getMyNotifications }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUnreadCount_decorators, { kind: "method", name: "getUnreadCount", static: false, private: false, access: { has: obj => "getUnreadCount" in obj, get: obj => obj.getUnreadCount }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _markAsRead_decorators, { kind: "method", name: "markAsRead", static: false, private: false, access: { has: obj => "markAsRead" in obj, get: obj => obj.markAsRead }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _markAllAsRead_decorators, { kind: "method", name: "markAllAsRead", static: false, private: false, access: { has: obj => "markAllAsRead" in obj, get: obj => obj.markAllAsRead }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendBulk_decorators, { kind: "method", name: "sendBulk", static: false, private: false, access: { has: obj => "sendBulk" in obj, get: obj => obj.sendBulk }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendByRole_decorators, { kind: "method", name: "sendByRole", static: false, private: false, access: { has: obj => "sendByRole" in obj, get: obj => obj.sendByRole }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationsController = _classThis;
})();
export { NotificationsController };
