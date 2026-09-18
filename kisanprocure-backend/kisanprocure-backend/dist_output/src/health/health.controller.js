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
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';
let HealthController = (() => {
    let _classDecorators = [ApiTags('Health'), Controller('health')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _check_decorators;
    let _ready_decorators;
    let _live_decorators;
    var HealthController = _classThis = class {
        constructor(health, prisma, redis) {
            Object.defineProperty(this, "health", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), health)
            });
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
            Object.defineProperty(this, "redis", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: redis
            });
        }
        async check() {
            return this.health.check([
                () => this.checkDatabase(),
                () => this.checkRedis(),
            ]);
        }
        async ready() {
            try {
                await this.prisma.$queryRaw `SELECT 1`;
                await this.redis.getClient().ping();
                return { status: 'ready', timestamp: new Date().toISOString() };
            }
            catch (error) {
                return { status: 'not ready', timestamp: new Date().toISOString() };
            }
        }
        async live() {
            return { status: 'alive', timestamp: new Date().toISOString() };
        }
        async checkDatabase() {
            try {
                await this.prisma.$queryRaw `SELECT 1`;
                return { database: { status: 'up' } };
            }
            catch (error) {
                return { database: { status: 'down' } };
            }
        }
        async checkRedis() {
            try {
                await this.redis.getClient().ping();
                return { redis: { status: 'up' } };
            }
            catch (error) {
                return { redis: { status: 'down' } };
            }
        }
    };
    __setFunctionName(_classThis, "HealthController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _check_decorators = [Get(), ApiOperation({ summary: 'Health check endpoint' }), ApiResponse({ status: 200, description: 'Service is healthy' }), HealthCheck()];
        _ready_decorators = [Get('ready'), ApiOperation({ summary: 'Readiness check' })];
        _live_decorators = [Get('live'), ApiOperation({ summary: 'Liveness check' })];
        __esDecorate(_classThis, null, _check_decorators, { kind: "method", name: "check", static: false, private: false, access: { has: obj => "check" in obj, get: obj => obj.check }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _ready_decorators, { kind: "method", name: "ready", static: false, private: false, access: { has: obj => "ready" in obj, get: obj => obj.ready }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _live_decorators, { kind: "method", name: "live", static: false, private: false, access: { has: obj => "live" in obj, get: obj => obj.live }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        HealthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return HealthController = _classThis;
})();
export { HealthController };
