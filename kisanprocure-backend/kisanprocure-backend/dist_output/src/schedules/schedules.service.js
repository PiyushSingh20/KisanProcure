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
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
let SchedulesService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SchedulesService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
        }
        async create(data) {
            const center = await this.prisma.procurementCenter.findUnique({ where: { id: data.centerId } });
            if (!center) {
                throw new NotFoundException('Center not found');
            }
            const crop = await this.prisma.crop.findUnique({ where: { id: data.cropId } });
            if (!crop) {
                throw new NotFoundException('Crop not found');
            }
            const scheduleDate = new Date(data.date);
            scheduleDate.setHours(0, 0, 0, 0);
            const existing = await this.prisma.schedule.findUnique({
                where: { centerId_cropId_date: { centerId: data.centerId, cropId: data.cropId, date: scheduleDate } },
            });
            if (existing) {
                throw new ConflictException('Schedule already exists for this center, crop, and date');
            }
            const slots = data.slots || this.generateDefaultSlots(data.startTime, data.endTime);
            return this.prisma.schedule.create({
                data: {
                    centerId: data.centerId,
                    cropId: data.cropId,
                    date: scheduleDate,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    maxTokens: data.maxTokens || 50,
                    slots: {
                        create: slots.map(s => ({
                            cropId: data.cropId,
                            startTime: s.startTime,
                            endTime: s.endTime,
                            capacity: s.capacity || 10,
                        })),
                    },
                },
                include: { slots: true, center: true, crop: true },
            });
        }
        generateDefaultSlots(startTime, endTime) {
            const slots = [];
            const start = this.parseTime(startTime);
            const end = this.parseTime(endTime);
            const slotDuration = 60; // 1 hour slots
            let current = start;
            while (current + slotDuration <= end) {
                slots.push({
                    startTime: this.formatTime(current),
                    endTime: this.formatTime(current + slotDuration),
                    capacity: 10,
                });
                current += slotDuration;
            }
            return slots;
        }
        parseTime(time) {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        }
        formatTime(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        }
        async findById(id) {
            return this.prisma.schedule.findUnique({
                where: { id },
                include: { center: true, crop: true, slots: true },
            });
        }
        async findAll(params) {
            const { centerId, cropId, dateFrom, dateTo, isActive, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (centerId)
                where.centerId = centerId;
            if (cropId)
                where.cropId = cropId;
            if (isActive !== undefined)
                where.isActive = isActive;
            if (dateFrom || dateTo) {
                where.date = {};
                if (dateFrom)
                    where.date.gte = dateFrom;
                if (dateTo)
                    where.date.lte = dateTo;
            }
            const [data, total] = await Promise.all([
                this.prisma.schedule.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { date: 'asc' },
                    include: { center: true, crop: true, slots: true },
                }),
                this.prisma.schedule.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async update(id, data) {
            const schedule = await this.prisma.schedule.findUnique({ where: { id } });
            if (!schedule) {
                throw new NotFoundException('Schedule not found');
            }
            return this.prisma.schedule.update({
                where: { id },
                data,
                include: { center: true, crop: true, slots: true },
            });
        }
        async delete(id) {
            const schedule = await this.prisma.schedule.findUnique({ where: { id } });
            if (!schedule) {
                throw new NotFoundException('Schedule not found');
            }
            await this.prisma.schedule.update({
                where: { id },
                data: { isActive: false },
            });
        }
        async addSlot(scheduleId, data) {
            const schedule = await this.prisma.schedule.findUnique({ where: { id: scheduleId } });
            if (!schedule) {
                throw new NotFoundException('Schedule not found');
            }
            return this.prisma.slot.create({
                data: {
                    scheduleId,
                    cropId: schedule.cropId,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    capacity: data.capacity || 10,
                },
            });
        }
        async updateSlot(scheduleId, slotId, data) {
            const slot = await this.prisma.slot.findFirst({ where: { id: slotId, scheduleId } });
            if (!slot) {
                throw new NotFoundException('Slot not found');
            }
            return this.prisma.slot.update({
                where: { id: slotId },
                data,
            });
        }
        async deleteSlot(scheduleId, slotId) {
            const slot = await this.prisma.slot.findFirst({ where: { id: slotId, scheduleId } });
            if (!slot) {
                throw new NotFoundException('Slot not found');
            }
            const bookings = await this.prisma.booking.count({ where: { slotId } });
            if (bookings > 0) {
                throw new BadRequestException('Cannot delete slot with existing bookings');
            }
            await this.prisma.slot.delete({ where: { id: slotId } });
        }
        async getAvailableSlots(scheduleId) {
            const schedule = await this.prisma.schedule.findUnique({ where: { id: scheduleId } });
            if (!schedule) {
                throw new NotFoundException('Schedule not found');
            }
            return this.prisma.slot.findMany({
                where: {
                    scheduleId,
                    isActive: true,
                    bookedCount: { lt: this.prisma.slot.fields.capacity },
                },
                orderBy: { startTime: 'asc' },
            });
        }
        async getScheduleWithAvailability(scheduleId) {
            const schedule = await this.prisma.schedule.findUnique({
                where: { id: scheduleId },
                include: {
                    center: true,
                    crop: true,
                    slots: {
                        orderBy: { startTime: 'asc' },
                        include: {
                            _count: { select: { bookings: { where: { status: { not: 'CANCELLED' } } } } },
                        },
                    },
                },
            });
            if (!schedule) {
                throw new NotFoundException('Schedule not found');
            }
            return {
                ...schedule,
                slots: schedule.slots.map(slot => ({
                    ...slot,
                    availableCapacity: slot.capacity - slot._count.bookings,
                    isAvailable: slot._count.bookings < slot.capacity,
                })),
            };
        }
    };
    __setFunctionName(_classThis, "SchedulesService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SchedulesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SchedulesService = _classThis;
})();
export { SchedulesService };
