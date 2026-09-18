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
import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { BookingStatus, TokenStatus } from '@prisma/client';
let BookingsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var BookingsService = _classThis = class {
        constructor(prisma, redis) {
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
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(BookingsService.name)
            });
        }
        async create(data) {
            const farmer = await this.prisma.farmer.findUnique({ where: { id: data.farmerId } });
            if (!farmer) {
                throw new NotFoundException('Farmer not found');
            }
            const center = await this.prisma.procurementCenter.findUnique({ where: { id: data.centerId } });
            if (!center) {
                throw new NotFoundException('Center not found');
            }
            const crop = await this.prisma.crop.findUnique({ where: { id: data.cropId } });
            if (!crop) {
                throw new NotFoundException('Crop not found');
            }
            const slot = await this.prisma.slot.findUnique({
                where: { id: data.slotId },
                include: { schedule: true },
            });
            if (!slot) {
                throw new NotFoundException('Slot not found');
            }
            if (!slot.isActive) {
                throw new BadRequestException('Slot is not active');
            }
            if (slot.bookedCount >= slot.capacity) {
                throw new ConflictException('Slot is fully booked');
            }
            if (slot.scheduleId) {
                const schedule = await this.prisma.schedule.findUnique({ where: { id: slot.scheduleId } });
                if (schedule) {
                    const totalBookings = await this.prisma.booking.count({
                        where: { slot: { scheduleId: schedule.id }, status: { not: BookingStatus.CANCELLED } },
                    });
                    if (totalBookings >= schedule.maxTokens) {
                        throw new ConflictException('Schedule has reached maximum token limit');
                    }
                }
            }
            const existingBooking = await this.prisma.booking.findFirst({
                where: {
                    farmerId: data.farmerId,
                    slotId: data.slotId,
                    status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
                },
            });
            if (existingBooking) {
                throw new ConflictException('Farmer already has a booking for this slot');
            }
            const produce = await this.prisma.farmerProduce.findFirst({
                where: { farmerId: data.farmerId, cropId: data.cropId },
            });
            if (!produce || produce.quantity < data.quantity) {
                throw new BadRequestException('Insufficient produce quantity for booking');
            }
            const bookingNumber = await this.generateBookingNumber();
            const booking = await this.prisma.$transaction(async (tx) => {
                const newBooking = await tx.booking.create({
                    data: {
                        bookingNumber,
                        farmerId: data.farmerId,
                        centerId: data.centerId,
                        cropId: data.cropId,
                        slotId: data.slotId,
                        scheduledDate: slot.schedule.date,
                        status: BookingStatus.CONFIRMED,
                        quantity: data.quantity,
                        expectedPrice: data.expectedPrice,
                        notes: data.notes,
                    },
                    include: { center: true, crop: true, slot: true, token: true },
                });
                await tx.slot.update({
                    where: { id: data.slotId },
                    data: { bookedCount: { increment: 1 } },
                });
                await tx.farmerProduce.update({
                    where: { id: produce.id },
                    data: { quantity: { decrement: data.quantity } },
                });
                return newBooking;
            });
            await this.invalidateCache(data.centerId, data.cropId, slot.schedule.date);
            return booking;
        }
        async generateBookingNumber() {
            const date = new Date();
            const prefix = `BK${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
            const count = await this.prisma.booking.count({
                where: { bookingNumber: { startsWith: prefix } },
            });
            return `${prefix}${String(count + 1).padStart(4, '0')}`;
        }
        async findById(id) {
            return this.prisma.booking.findUnique({
                where: { id },
                include: {
                    farmer: { include: { user: true } },
                    center: true,
                    crop: true,
                    slot: { include: { schedule: true } },
                    token: true,
                },
            });
        }
        async findByBookingNumber(bookingNumber) {
            return this.prisma.booking.findUnique({
                where: { bookingNumber },
                include: { farmer: true, center: true, crop: true, slot: true, token: true },
            });
        }
        async findAll(params) {
            const { farmerId, centerId, cropId, status, dateFrom, dateTo, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (farmerId)
                where.farmerId = farmerId;
            if (centerId)
                where.centerId = centerId;
            if (cropId)
                where.cropId = cropId;
            if (status)
                where.status = status;
            if (dateFrom || dateTo) {
                where.scheduledDate = {};
                if (dateFrom)
                    where.scheduledDate.gte = dateFrom;
                if (dateTo)
                    where.scheduledDate.lte = dateTo;
            }
            const [data, total] = await Promise.all([
                this.prisma.booking.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { farmer: { include: { user: true } }, center: true, crop: true, slot: true, token: true },
                }),
                this.prisma.booking.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async update(id, data) {
            const booking = await this.prisma.booking.findUnique({ where: { id } });
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }
            return this.prisma.booking.update({
                where: { id },
                data,
                include: { center: true, crop: true, slot: true, token: true },
            });
        }
        async cancel(id, farmerId, reason) {
            const booking = await this.prisma.booking.findUnique({ where: { id } });
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }
            if (booking.farmerId !== farmerId) {
                throw new BadRequestException('Unauthorized to cancel this booking');
            }
            if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
                throw new BadRequestException('Cannot cancel this booking');
            }
            const slot = await this.prisma.slot.findUnique({ where: { id: booking.slotId } });
            if (!slot) {
                throw new NotFoundException('Slot not found');
            }
            const produce = await this.prisma.farmerProduce.findFirst({
                where: { farmerId: booking.farmerId, cropId: booking.cropId },
            });
            return this.prisma.$transaction(async (tx) => {
                const updated = await tx.booking.update({
                    where: { id },
                    data: { status: BookingStatus.CANCELLED, notes: reason ? `${booking.notes || ''}\nCancellation: ${reason}` : booking.notes },
                });
                await tx.slot.update({
                    where: { id: booking.slotId },
                    data: { bookedCount: { decrement: 1 } },
                });
                if (produce) {
                    await tx.farmerProduce.update({
                        where: { id: produce.id },
                        data: { quantity: { increment: booking.quantity } },
                    });
                }
                const existingToken = await tx.token.findFirst({ where: { bookingId: id } });
                if (existingToken) {
                    await tx.token.update({
                        where: { id: existingToken.id },
                        data: { status: TokenStatus.CANCELLED, cancellationReason: reason || 'Booking cancelled' },
                    });
                }
                return updated;
            });
        }
        async getFarmerBookings(farmerId, params = {}) {
            const { status, page = 1, limit = 20 } = params;
            return this.findAll({ farmerId, status, page, limit });
        }
        async getCenterBookings(centerId, date, params = {}) {
            const { status, page = 1, limit = 50 } = params;
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            return this.findAll({
                centerId,
                status,
                dateFrom: startOfDay,
                dateTo: endOfDay,
                page,
                limit,
            });
        }
        async invalidateCache(centerId, cropId, date) {
            const dateStr = date.toISOString().split('T')[0];
            await Promise.all([
                this.redis.del(`schedule:availability:${centerId}:${cropId}:${dateStr}`),
                this.redis.del(`center:slots:${centerId}:${dateStr}`),
            ]);
        }
    };
    __setFunctionName(_classThis, "BookingsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BookingsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BookingsService = _classThis;
})();
export { BookingsService };
