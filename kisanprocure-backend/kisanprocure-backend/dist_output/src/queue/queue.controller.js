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
import { Controller, Get, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
let QueueController = (() => {
    let _classDecorators = [ApiTags('Queue'), Controller('queue')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getQueueStatus_decorators;
    let _getFarmerQueue_decorators;
    let _getCenterQueue_decorators;
    let _getCenterStats_decorators;
    var QueueController = _classThis = class {
        constructor(queueService) {
            Object.defineProperty(this, "queueService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), queueService)
            });
        }
        async getQueueStatus(centerId) {
            return this.queueService.getQueueStatus(centerId);
        }
        async getFarmerQueue(centerId, req) {
            const farmer = await this.queueService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (!farmer) {
                return { inQueue: false };
            }
            return this.queueService.getQueueForFarmer(centerId, farmer.id);
        }
        async getCenterQueue(centerId, limit = 100, offset = 0) {
            return this.queueService.getCenterQueue(centerId, { limit: Number(limit), offset: Number(offset) });
        }
        async getCenterStats(centerId) {
            return this.queueService.getCenterStats(centerId);
        }
    };
    __setFunctionName(_classThis, "QueueController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getQueueStatus_decorators = [Get('center/:centerId'), ApiOperation({ summary: 'Get queue status for a center' }), ApiResponse({ status: 200, description: 'Queue status' })];
        _getFarmerQueue_decorators = [Get('center/:centerId/farmer'), UseGuards(JwtAuthGuard), ApiBearerAuth(), ApiOperation({ summary: 'Get queue status for current farmer at a center' }), ApiResponse({ status: 200, description: 'Farmer queue status' })];
        _getCenterQueue_decorators = [Get('center/:centerId/list'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiBearerAuth(), ApiOperation({ summary: 'Get full queue list for center (Admin/Officer only)' }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiQuery({ name: 'offset', required: false, type: Number }), ApiResponse({ status: 200, description: 'Queue list' })];
        _getCenterStats_decorators = [Get('center/:centerId/stats'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiBearerAuth(), ApiOperation({ summary: 'Get center queue statistics (Admin/Officer only)' }), ApiResponse({ status: 200, description: 'Center statistics' })];
        __esDecorate(_classThis, null, _getQueueStatus_decorators, { kind: "method", name: "getQueueStatus", static: false, private: false, access: { has: obj => "getQueueStatus" in obj, get: obj => obj.getQueueStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFarmerQueue_decorators, { kind: "method", name: "getFarmerQueue", static: false, private: false, access: { has: obj => "getFarmerQueue" in obj, get: obj => obj.getFarmerQueue }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCenterQueue_decorators, { kind: "method", name: "getCenterQueue", static: false, private: false, access: { has: obj => "getCenterQueue" in obj, get: obj => obj.getCenterQueue }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCenterStats_decorators, { kind: "method", name: "getCenterStats", static: false, private: false, access: { has: obj => "getCenterStats" in obj, get: obj => obj.getCenterStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QueueController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QueueController = _classThis;
})();
export { QueueController };
