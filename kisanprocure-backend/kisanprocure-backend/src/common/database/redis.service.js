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
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
let RedisService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RedisService = _classThis = class {
        constructor(configService) {
            Object.defineProperty(this, "configService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: configService
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(RedisService.name)
            });
            Object.defineProperty(this, "client", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
        }
        onModuleInit() {
            const redisUrl = this.configService.get('REDIS_URL') || 'redis://localhost:6379';
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                lazyConnect: true,
            });
            this.client.on('connect', () => {
                this.logger.log('Redis connected');
            });
            this.client.on('error', (err) => {
                this.logger.error('Redis error', err);
            });
            this.client.on('close', () => {
                this.logger.warn('Redis connection closed');
            });
            this.client.connect().catch((err) => {
                this.logger.error('Failed to connect to Redis', err);
            });
        }
        async onModuleDestroy() {
            await this.client.quit();
            this.logger.log('Redis disconnected');
        }
        getClient() {
            return this.client;
        }
        async set(key, value, ttlSeconds) {
            if (ttlSeconds) {
                return this.client.set(key, value, 'EX', ttlSeconds);
            }
            return this.client.set(key, value);
        }
        async get(key) {
            return this.client.get(key);
        }
        async del(key) {
            return this.client.del(key);
        }
        async exists(key) {
            return this.client.exists(key);
        }
        async expire(key, seconds) {
            return this.client.expire(key, seconds);
        }
        async hset(key, field, value) {
            return this.client.hset(key, field, value);
        }
        async hget(key, field) {
            return this.client.hget(key, field);
        }
        async hgetall(key) {
            return this.client.hgetall(key);
        }
        async hdel(key, ...fields) {
            return this.client.hdel(key, ...fields);
        }
        async sadd(key, ...members) {
            return this.client.sadd(key, ...members);
        }
        async srem(key, ...members) {
            return this.client.srem(key, ...members);
        }
        async smembers(key) {
            return this.client.smembers(key);
        }
        async sismember(key, member) {
            return this.client.sismember(key, member);
        }
        async zadd(key, score, member) {
            return this.client.zadd(key, score, member);
        }
        async zrem(key, member) {
            return this.client.zrem(key, member);
        }
        async zrange(key, start, stop) {
            return this.client.zrange(key, start, stop);
        }
        async zrevrange(key, start, stop) {
            return this.client.zrevrange(key, start, stop);
        }
        async zscore(key, member) {
            return this.client.zscore(key, member);
        }
        async zrank(key, member) {
            return this.client.zrank(key, member);
        }
        async zcard(key) {
            return this.client.zcard(key);
        }
        async incr(key) {
            return this.client.incr(key);
        }
        async decr(key) {
            return this.client.decr(key);
        }
        async publish(channel, message) {
            return this.client.publish(channel, message);
        }
        async subscribe(channel, callback) {
            const subscriber = this.client.duplicate();
            await subscriber.subscribe(channel);
            subscriber.on('message', (ch, msg) => {
                if (ch === channel) {
                    callback(msg);
                }
            });
        }
        async lpush(key, ...values) {
            return this.client.lpush(key, ...values);
        }
        async rpop(key) {
            return this.client.rpop(key);
        }
        async lrange(key, start, stop) {
            return this.client.lrange(key, start, stop);
        }
        async keys(pattern) {
            return this.client.keys(pattern);
        }
        async flushdb() {
            return this.client.flushdb();
        }
        async eval(script, numKeys, ...keys) {
            return this.client.eval(script, numKeys, ...keys);
        }
    };
    __setFunctionName(_classThis, "RedisService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RedisService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RedisService = _classThis;
})();
export { RedisService };
