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
import { Controller, Post, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
class SimulateDto {
    constructor() {
        Object.defineProperty(this, "action", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let DemoController = (() => {
    let _classDecorators = [ApiTags('Demo'), Controller('demo'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _simulate_decorators;
    let _resetDemoData_decorators;
    let _getDemoStatus_decorators;
    var DemoController = _classThis = class {
        constructor(demoService) {
            Object.defineProperty(this, "demoService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), demoService)
            });
        }
        async simulate(dto) {
            return this.demoService.simulate(dto.action, dto.params);
        }
        async resetDemoData() {
            return this.demoService.resetDemoData();
        }
        async getDemoStatus() {
            return { demoModeEnabled: this.demoService['configService'].get('DEMO_MODE_ENABLED') === 'true' };
        }
    };
    __setFunctionName(_classThis, "DemoController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _simulate_decorators = [Post('simulate'), ApiOperation({ summary: 'Simulate demo actions (Admin only - Demo mode only)' }), ApiResponse({ status: 200, description: 'Simulation completed' })];
        _resetDemoData_decorators = [Post('reset'), ApiOperation({ summary: 'Reset demo data (Admin only - Demo mode only)' }), ApiResponse({ status: 200, description: 'Demo data reset' })];
        _getDemoStatus_decorators = [Get('status'), ApiOperation({ summary: 'Check demo mode status' }), ApiResponse({ status: 200, description: 'Demo mode status' })];
        __esDecorate(_classThis, null, _simulate_decorators, { kind: "method", name: "simulate", static: false, private: false, access: { has: obj => "simulate" in obj, get: obj => obj.simulate }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _resetDemoData_decorators, { kind: "method", name: "resetDemoData", static: false, private: false, access: { has: obj => "resetDemoData" in obj, get: obj => obj.resetDemoData }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDemoStatus_decorators, { kind: "method", name: "getDemoStatus", static: false, private: false, access: { has: obj => "getDemoStatus" in obj, get: obj => obj.getDemoStatus }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DemoController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DemoController = _classThis;
})();
export { DemoController };
