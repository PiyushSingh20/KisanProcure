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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
let NotificationsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NotificationsService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(NotificationsService.name)
            });
        }
        async create(data) {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    channel: data.channel || NotificationChannel.IN_APP,
                    title: data.title,
                    message: data.message,
                    data: data.data,
                },
            });
            return notification;
        }
        async findById(id) {
            return this.prisma.notification.findUnique({ where: { id } });
        }
        async findAll(params) {
            const { userId, type, isRead, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (userId)
                where.userId = userId;
            if (type)
                where.type = type;
            if (isRead !== undefined)
                where.isRead = isRead;
            const [data, total] = await Promise.all([
                this.prisma.notification.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.notification.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async getUserNotifications(userId, params = {}) {
            const { isRead, page = 1, limit = 20 } = params;
            return this.findAll({ userId, isRead, page, limit });
        }
        async markAsRead(id, userId) {
            const notification = await this.prisma.notification.findUnique({ where: { id } });
            if (!notification) {
                throw new NotFoundException('Notification not found');
            }
            if (notification.userId !== userId) {
                throw new NotFoundException('Notification not found');
            }
            return this.prisma.notification.update({
                where: { id },
                data: { isRead: true, readAt: new Date() },
            });
        }
        async markAllAsRead(userId) {
            const result = await this.prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true, readAt: new Date() },
            });
            return result.count;
        }
        async delete(id, userId) {
            const notification = await this.prisma.notification.findUnique({ where: { id } });
            if (!notification) {
                throw new NotFoundException('Notification not found');
            }
            if (notification.userId !== userId) {
                throw new NotFoundException('Notification not found');
            }
            await this.prisma.notification.delete({ where: { id } });
        }
        async getUnreadCount(userId) {
            return this.prisma.notification.count({ where: { userId, isRead: false } });
        }
        async sendBulkNotification(userIds, data) {
            const notifications = await this.prisma.notification.createMany({
                data: userIds.map(userId => ({
                    userId,
                    type: data.type,
                    channel: data.channel || NotificationChannel.IN_APP,
                    title: data.title,
                    message: data.message,
                    data: data.data,
                })),
            });
            return this.prisma.notification.findMany({
                where: { userId: { in: userIds }, title: data.title },
                orderBy: { createdAt: 'desc' },
                take: userIds.length,
            });
        }
        async sendNotificationByRole(role, data) {
            const users = await this.prisma.user.findMany({
                where: { role: role, status: 'ACTIVE' },
                select: { id: true },
            });
            return this.sendBulkNotification(users.map(u => u.id), data);
        }
    };
    __setFunctionName(_classThis, "NotificationsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationsService = _classThis;
})();
export { NotificationsService };
