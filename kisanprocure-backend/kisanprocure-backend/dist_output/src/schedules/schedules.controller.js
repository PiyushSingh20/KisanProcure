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
import { Role } from '@prisma/client';
class CreateScheduleDto {
    constructor() {
        Object.defineProperty(this, "centerId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cropId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "date", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "slots", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class CreateSlotDto {
    constructor() {
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "capacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class UpdateScheduleDto {
    constructor() {
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isActive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class UpdateSlotDto {
    constructor() {
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "capacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isActive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let SchedulesController = (() => {
    let _classDecorators = [ApiTags('Schedules'), Controller('schedules')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _findAll_decorators;
    let _findById_decorators;
    let _getAvailability_decorators;
    let _getAvailableSlots_decorators;
    let _update_decorators;
    let _delete_decorators;
    let _addSlot_decorators;
    let _updateSlot_decorators;
    let _deleteSlot_decorators;
    var SchedulesController = _classThis = class {
        constructor(schedulesService) {
            Object.defineProperty(this, "schedulesService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), schedulesService)
            });
        }
        async create(dto) {
            return this.schedulesService.create(dto);
        }
        async findAll(centerId, cropId, dateFrom, dateTo, isActive, page = 1, limit = 20) {
            return this.schedulesService.findAll({
                centerId,
                cropId,
                dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                dateTo: dateTo ? new Date(dateTo) : undefined,
                isActive,
                page: Number(page),
                limit: Number(limit),
            });
        }
        async findById(id) {
            return this.schedulesService.findById(id);
        }
        async getAvailability(id) {
            return this.schedulesService.getScheduleWithAvailability(id);
        }
        async getAvailableSlots(id) {
            return this.schedulesService.getAvailableSlots(id);
        }
        async update(id, dto) {
            return this.schedulesService.update(id, dto);
        }
        async delete(id) {
            await this.schedulesService.delete(id);
            return { success: true, message: 'Schedule deactivated successfully' };
        }
        async addSlot(id, dto) {
            return this.schedulesService.addSlot(id, dto);
        }
        async updateSlot(id, slotId, dto) {
            return this.schedulesService.updateSlot(id, slotId, dto);
        }
        async deleteSlot(id, slotId) {
            await this.schedulesService.deleteSlot(id, slotId);
            return { success: true, message: 'Slot deleted successfully' };
        }
    };
    __setFunctionName(_classThis, "SchedulesController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post(), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Create a new schedule (Admin only)' }), ApiResponse({ status: 201, description: 'Schedule created' })];
        _findAll_decorators = [Get(), ApiOperation({ summary: 'List all schedules' }), ApiQuery({ name: 'centerId', required: false, type: String }), ApiQuery({ name: 'cropId', required: false, type: String }), ApiQuery({ name: 'dateFrom', required: false, type: String }), ApiQuery({ name: 'dateTo', required: false, type: String }), ApiQuery({ name: 'isActive', required: false, type: Boolean }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Schedules list' })];
        _findById_decorators = [Get(':id'), ApiOperation({ summary: 'Get schedule by ID' }), ApiResponse({ status: 200, description: 'Schedule found' }), ApiResponse({ status: 404, description: 'Schedule not found' })];
        _getAvailability_decorators = [Get(':id/availability'), ApiOperation({ summary: 'Get schedule with slot availability' }), ApiResponse({ status: 200, description: 'Schedule with availability' })];
        _getAvailableSlots_decorators = [Get(':id/slots/available'), ApiOperation({ summary: 'Get available slots for schedule' }), ApiResponse({ status: 200, description: 'Available slots' })];
        _update_decorators = [Put(':id'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Update schedule (Admin only)' }), ApiResponse({ status: 200, description: 'Schedule updated' })];
        _delete_decorators = [Delete(':id'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Deactivate schedule (Admin only)' }), ApiResponse({ status: 200, description: 'Schedule deactivated' })];
        _addSlot_decorators = [Post(':id/slots'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Add slot to schedule (Admin only)' }), ApiResponse({ status: 201, description: 'Slot added' })];
        _updateSlot_decorators = [Put(':id/slots/:slotId'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Update slot (Admin only)' }), ApiResponse({ status: 200, description: 'Slot updated' })];
        _deleteSlot_decorators = [Delete(':id/slots/:slotId'), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth(), ApiOperation({ summary: 'Delete slot (Admin only)' }), ApiResponse({ status: 200, description: 'Slot deleted' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAvailability_decorators, { kind: "method", name: "getAvailability", static: false, private: false, access: { has: obj => "getAvailability" in obj, get: obj => obj.getAvailability }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAvailableSlots_decorators, { kind: "method", name: "getAvailableSlots", static: false, private: false, access: { has: obj => "getAvailableSlots" in obj, get: obj => obj.getAvailableSlots }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addSlot_decorators, { kind: "method", name: "addSlot", static: false, private: false, access: { has: obj => "addSlot" in obj, get: obj => obj.addSlot }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateSlot_decorators, { kind: "method", name: "updateSlot", static: false, private: false, access: { has: obj => "updateSlot" in obj, get: obj => obj.updateSlot }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteSlot_decorators, { kind: "method", name: "deleteSlot", static: false, private: false, access: { has: obj => "deleteSlot" in obj, get: obj => obj.deleteSlot }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SchedulesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SchedulesController = _classThis;
})();
export { SchedulesController };
