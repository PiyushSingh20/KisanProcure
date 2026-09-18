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
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ComplaintStatus, Role } from '@prisma/client';
let ComplaintsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ComplaintsService = _classThis = class {
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
                value: new Logger(ComplaintsService.name)
            });
        }
        async create(data) {
            const farmer = await this.prisma.farmer.findUnique({ where: { id: data.farmerId } });
            if (!farmer) {
                throw new NotFoundException('Farmer not found');
            }
            const complaintNumber = await this.generateComplaintNumber();
            const complaint = await this.prisma.complaint.create({
                data: {
                    complaintNumber,
                    farmerId: data.farmerId,
                    centerId: data.centerId,
                    cropId: data.cropId,
                    tokenId: data.tokenId,
                    subject: data.subject,
                    description: data.description,
                    priority: data.priority || 1,
                    status: ComplaintStatus.OPEN,
                },
                include: { farmer: { include: { user: true } }, center: true, crop: true, token: true, assignedTo: true },
            });
            await this.prisma.notification.create({
                data: {
                    userId: farmer.userId,
                    type: 'COMPLAINT_RECEIVED',
                    channel: 'IN_APP',
                    title: 'Complaint Registered',
                    message: `Your complaint ${complaintNumber} has been registered: ${data.subject}`,
                    data: { complaintId: complaint.id, complaintNumber },
                },
            });
            return complaint;
        }
        async generateComplaintNumber() {
            const date = new Date();
            const prefix = `CMP${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
            const count = await this.prisma.complaint.count({
                where: { complaintNumber: { startsWith: prefix } },
            });
            return `${prefix}${String(count + 1).padStart(4, '0')}`;
        }
        async findById(id) {
            return this.prisma.complaint.findUnique({
                where: { id },
                include: { farmer: { include: { user: true } }, center: true, crop: true, token: true, assignedTo: { include: { user: true } } },
            });
        }
        async findByComplaintNumber(complaintNumber) {
            return this.prisma.complaint.findUnique({
                where: { complaintNumber },
                include: { farmer: true, center: true, crop: true, token: true, assignedTo: true },
            });
        }
        async findAll(params) {
            const { farmerId, centerId, status, assignedToId, page = 1, limit = 20 } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (farmerId)
                where.farmerId = farmerId;
            if (centerId)
                where.centerId = centerId;
            if (status)
                where.status = status;
            if (assignedToId)
                where.assignedToId = assignedToId;
            const [data, total] = await Promise.all([
                this.prisma.complaint.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { farmer: { include: { user: true } }, center: true, crop: true, token: true, assignedTo: { include: { user: true } } },
                }),
                this.prisma.complaint.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async update(id, data, actorRole) {
            const complaint = await this.prisma.complaint.findUnique({
                where: { id },
                include: { farmer: { include: { user: true } } },
            });
            if (!complaint) {
                throw new NotFoundException('Complaint not found');
            }
            if (actorRole !== Role.ADMIN && data.assignedToId) {
                throw new BadRequestException('Only admins can assign complaints');
            }
            const updateData = { ...data };
            if (data.status === ComplaintStatus.RESOLVED || data.status === ComplaintStatus.CLOSED) {
                updateData.resolvedAt = new Date();
            }
            const updated = await this.prisma.complaint.update({
                where: { id },
                data: updateData,
                include: { farmer: { include: { user: true } }, center: true, crop: true, token: true, assignedTo: { include: { user: true } } },
            });
            if (data.status && data.status !== complaint.status) {
                await this.prisma.notification.create({
                    data: {
                        userId: complaint.farmer.userId,
                        type: 'COMPLAINT_RESOLVED',
                        channel: 'IN_APP',
                        title: 'Complaint Status Updated',
                        message: `Your complaint ${complaint.complaintNumber} status changed to ${data.status}`,
                        data: { complaintId: complaint.id, status: data.status },
                    },
                });
            }
            return updated;
        }
        async getFarmerComplaints(farmerId, params = {}) {
            const { status, page = 1, limit = 20 } = params;
            return this.findAll({ farmerId, status, page, limit });
        }
        async getAssignedComplaints(officerId, params = {}) {
            const { status, page = 1, limit = 20 } = params;
            return this.findAll({ assignedToId: officerId, status, page, limit });
        }
    };
    __setFunctionName(_classThis, "ComplaintsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ComplaintsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ComplaintsService = _classThis;
})();
export { ComplaintsService };
