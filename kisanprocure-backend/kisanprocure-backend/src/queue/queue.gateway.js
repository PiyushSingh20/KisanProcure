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
import { WebSocketGateway, WebSocketServer, SubscribeMessage, } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
let QueueGateway = (() => {
    let _classDecorators = [WebSocketGateway({
            cors: { origin: '*' },
            namespace: '/queue',
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _server_decorators;
    let _server_initializers = [];
    let _server_extraInitializers = [];
    let _handleSubscribeCenter_decorators;
    let _handleUnsubscribeCenter_decorators;
    let _handleGetQueueStatus_decorators;
    var QueueGateway = _classThis = class {
        constructor(jwtService, configService, queueService) {
            Object.defineProperty(this, "jwtService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), jwtService)
            });
            Object.defineProperty(this, "configService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: configService
            });
            Object.defineProperty(this, "queueService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: queueService
            });
            Object.defineProperty(this, "server", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: __runInitializers(this, _server_initializers, void 0)
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _server_extraInitializers), new Logger(QueueGateway.name))
            });
            Object.defineProperty(this, "connectedClients", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Map()
            });
        }
        async handleConnection(client) {
            try {
                const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
                if (!token) {
                    this.logger.warn(`Client ${client.id} connected without token`);
                    client.disconnect();
                    return;
                }
                const secret = this.configService.get('JWT_SECRET');
                const payload = await this.jwtService.verifyAsync(token, { secret });
                this.connectedClients.set(client.id, {
                    userId: payload.sub,
                    role: payload.role,
                });
                this.logger.log(`Client connected: ${client.id} (User: ${payload.sub}, Role: ${payload.role})`);
                client.emit('connected', { success: true, message: 'Connected to queue service' });
            }
            catch (error) {
                this.logger.warn(`Invalid token for client ${client.id}: ${error.message}`);
                client.disconnect();
            }
        }
        handleDisconnect(client) {
            this.connectedClients.delete(client.id);
            this.logger.log(`Client disconnected: ${client.id}`);
        }
        async handleSubscribeCenter(client, data) {
            const clientInfo = this.connectedClients.get(client.id);
            if (!clientInfo) {
                return { success: false, message: 'Not authenticated' };
            }
            const center = await this.queueService['prisma'].procurementCenter.findUnique({
                where: { id: data.centerId },
            });
            if (!center) {
                return { success: false, message: 'Center not found' };
            }
            client.join(`center:${data.centerId}`);
            this.connectedClients.set(client.id, { ...clientInfo, centerId: data.centerId });
            const queueStatus = await this.queueService.getQueueStatus(data.centerId);
            client.emit('queue:status', queueStatus);
            this.logger.log(`Client ${client.id} subscribed to center ${data.centerId}`);
            return { success: true, message: `Subscribed to center ${data.centerId}` };
        }
        async handleUnsubscribeCenter(client, data) {
            client.leave(`center:${data.centerId}`);
            const clientInfo = this.connectedClients.get(client.id);
            if (clientInfo?.centerId === data.centerId) {
                this.connectedClients.set(client.id, { ...clientInfo, centerId: undefined });
            }
            return { success: true, message: `Unsubscribed from center ${data.centerId}` };
        }
        async handleGetQueueStatus(client, data) {
            const queueStatus = await this.queueService.getQueueStatus(data.centerId);
            return { success: true, data: queueStatus };
        }
        async broadcastQueueUpdate(centerId) {
            const queueStatus = await this.queueService.getQueueStatus(centerId);
            this.server.to(`center:${centerId}`).emit('queue:updated', queueStatus);
            this.logger.debug(`Broadcasted queue update for center ${centerId}`);
        }
        async broadcastTokenCalled(centerId, token) {
            this.server.to(`center:${centerId}`).emit('token:called', { token, timestamp: new Date().toISOString() });
            this.logger.debug(`Broadcasted token called for center ${centerId}: ${token.tokenNumber}`);
        }
        async broadcastTokenCompleted(centerId, token) {
            this.server.to(`center:${centerId}`).emit('token:completed', { token, timestamp: new Date().toISOString() });
        }
        async sendToFarmer(farmerUserId, event, data) {
            for (const [clientId, info] of this.connectedClients.entries()) {
                if (info.userId === farmerUserId) {
                    this.server.to(clientId).emit(event, data);
                }
            }
        }
        getConnectedClientsCount() {
            return this.connectedClients.size;
        }
        getCenterSubscribers(centerId) {
            const room = this.server.sockets.adapter.rooms.get(`center:${centerId}`);
            return room ? room.size : 0;
        }
    };
    __setFunctionName(_classThis, "QueueGateway");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _server_decorators = [WebSocketServer()];
        _handleSubscribeCenter_decorators = [SubscribeMessage('subscribe:center')];
        _handleUnsubscribeCenter_decorators = [SubscribeMessage('unsubscribe:center')];
        _handleGetQueueStatus_decorators = [SubscribeMessage('get:queue:status')];
        __esDecorate(_classThis, null, _handleSubscribeCenter_decorators, { kind: "method", name: "handleSubscribeCenter", static: false, private: false, access: { has: obj => "handleSubscribeCenter" in obj, get: obj => obj.handleSubscribeCenter }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleUnsubscribeCenter_decorators, { kind: "method", name: "handleUnsubscribeCenter", static: false, private: false, access: { has: obj => "handleUnsubscribeCenter" in obj, get: obj => obj.handleUnsubscribeCenter }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleGetQueueStatus_decorators, { kind: "method", name: "handleGetQueueStatus", static: false, private: false, access: { has: obj => "handleGetQueueStatus" in obj, get: obj => obj.handleGetQueueStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _server_decorators, { kind: "field", name: "server", static: false, private: false, access: { has: obj => "server" in obj, get: obj => obj.server, set: (obj, value) => { obj.server = value; } }, metadata: _metadata }, _server_initializers, _server_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QueueGateway = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QueueGateway = _classThis;
})();
export { QueueGateway };
