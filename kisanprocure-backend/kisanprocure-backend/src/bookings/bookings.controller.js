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
import { Role, BookingStatus } from '@prisma/client';
class CreateBookingDto {
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
        Object.defineProperty(this, "slotId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "quantity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "expectedPrice", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "notes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let BookingsController = (() => {
    let _classDecorators = [ApiTags('Bookings'), Controller('bookings'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _create_decorators;
    let _getMyBookings_decorators;
    let _findById_decorators;
    let _findByBookingNumber_decorators;
    let _update_decorators;
    let _cancel_decorators;
    let _findAll_decorators;
    var BookingsController = _classThis = class {
        constructor(bookingsService) {
            Object.defineProperty(this, "bookingsService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), bookingsService)
            });
        }
        async create(req, dto) {
            const farmer = await this.bookingsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (!farmer) {
                return { success: false, message: 'Farmer profile not found' };
            }
            return this.bookingsService.create({ ...dto, farmerId: farmer.id });
        }
        async getMyBookings(req, status, page = 1, limit = 20) {
            const farmer = await this.bookingsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (!farmer) {
                return { data: [], total: 0, page: 1, limit: 20 };
            }
            return this.bookingsService.getFarmerBookings(farmer.id, { status, page: Number(page), limit: Number(limit) });
        }
        async findById(id, req) {
            const booking = await this.bookingsService.findById(id);
            if (!booking) {
                return { success: false, message: 'Booking not found' };
            }
            const farmer = await this.bookingsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (farmer && booking.farmerId !== farmer.id && req.user.role !== Role.ADMIN && req.user.role !== Role.OFFICER) {
                return { success: false, message: 'Unauthorized' };
            }
            return booking;
        }
        async findByBookingNumber(bookingNumber) {
            return this.bookingsService.findByBookingNumber(bookingNumber);
        }
        async update(id, dto) {
            return this.bookingsService.update(id, dto);
        }
        async cancel(id, req, reason) {
            const farmer = await this.bookingsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (!farmer) {
                return { success: false, message: 'Farmer profile not found' };
            }
            return this.bookingsService.cancel(id, farmer.id, reason);
        }
        async findAll(farmerId, centerId, cropId, status, dateFrom, dateTo, page = 1, limit = 20) {
            return this.bookingsService.findAll({
                farmerId,
                centerId,
                cropId,
                status,
                dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                dateTo: dateTo ? new Date(dateTo) : undefined,
                page: Number(page),
                limit: Number(limit),
            });
        }
    };
    __setFunctionName(_classThis, "BookingsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [Post(), ApiOperation({ summary: 'Create a new booking' }), ApiResponse({ status: 201, description: 'Booking created' }), ApiResponse({ status: 409, description: 'Slot fully booked or already booked' })];
        _getMyBookings_decorators = [Get('me'), ApiOperation({ summary: 'Get current farmer bookings' }), ApiQuery({ name: 'status', required: false, enum: BookingStatus }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Bookings list' })];
        _findById_decorators = [Get(':id'), ApiOperation({ summary: 'Get booking by ID' }), ApiResponse({ status: 200, description: 'Booking found' }), ApiResponse({ status: 404, description: 'Booking not found' })];
        _findByBookingNumber_decorators = [Get(':id/booking-number/:bookingNumber'), ApiOperation({ summary: 'Get booking by booking number' }), ApiResponse({ status: 200, description: 'Booking found' })];
        _update_decorators = [Put(':id'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Update booking (Admin/Officer only)' }), ApiResponse({ status: 200, description: 'Booking updated' })];
        _cancel_decorators = [Delete(':id'), ApiOperation({ summary: 'Cancel booking' }), ApiResponse({ status: 200, description: 'Booking cancelled' }), ApiResponse({ status: 400, description: 'Cannot cancel this booking' })];
        _findAll_decorators = [Get(), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'List all bookings (Admin/Officer only)' }), ApiQuery({ name: 'farmerId', required: false, type: String }), ApiQuery({ name: 'centerId', required: false, type: String }), ApiQuery({ name: 'cropId', required: false, type: String }), ApiQuery({ name: 'status', required: false, enum: BookingStatus }), ApiQuery({ name: 'dateFrom', required: false, type: String }), ApiQuery({ name: 'dateTo', required: false, type: String }), ApiQuery({ name: 'page', required: false, type: Number }), ApiQuery({ name: 'limit', required: false, type: Number }), ApiResponse({ status: 200, description: 'Bookings list' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyBookings_decorators, { kind: "method", name: "getMyBookings", static: false, private: false, access: { has: obj => "getMyBookings" in obj, get: obj => obj.getMyBookings }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findById_decorators, { kind: "method", name: "findById", static: false, private: false, access: { has: obj => "findById" in obj, get: obj => obj.findById }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findByBookingNumber_decorators, { kind: "method", name: "findByBookingNumber", static: false, private: false, access: { has: obj => "findByBookingNumber" in obj, get: obj => obj.findByBookingNumber }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancel_decorators, { kind: "method", name: "cancel", static: false, private: false, access: { has: obj => "cancel" in obj, get: obj => obj.cancel }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: obj => "findAll" in obj, get: obj => obj.findAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BookingsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BookingsController = _classThis;
})();
export { BookingsController };
