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
import { TokenStatus, BookingStatus } from '@prisma/client';
let TokensService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var TokensService = _classThis = class {
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
                value: new Logger(TokensService.name)
            });
        }
        async generateFromBooking(bookingId) {
            const booking = await this.prisma.booking.findUnique({
                where: { id: bookingId },
                include: { center: true, crop: true, farmer: true, token: true },
            });
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }
            if (booking.status !== BookingStatus.CONFIRMED) {
                throw new BadRequestException('Booking must be confirmed to generate token');
            }
            if (booking.token) {
                throw new BadRequestException('Token already generated for this booking');
            }
            const tokenNumber = await this.generateTokenNumber(booking.centerId);
            const token = await this.prisma.$transaction(async (tx) => {
                const newToken = await tx.token.create({
                    data: {
                        tokenNumber,
                        bookingId,
                        farmerId: booking.farmerId,
                        centerId: booking.centerId,
                        cropId: booking.cropId,
                        status: TokenStatus.GENERATED,
                    },
                    include: { booking: true, farmer: { include: { user: true } }, center: true, crop: true },
                });
                await tx.booking.update({
                    where: { id: bookingId },
                    data: { token: { connect: { id: newToken.id } } },
                });
                await this.addToQueue(tx, newToken.id, booking.centerId);
                return newToken;
            });
            await this.updateQueueCache(booking.centerId);
            await this.notifyTokenGenerated(token);
            return token;
        }
        async generateTokenNumber(centerId) {
            const center = await this.prisma.procurementCenter.findUnique({ where: { id: centerId } });
            const prefix = center?.code || 'KSN';
            const date = new Date();
            const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
            const count = await this.prisma.token.count({
                where: { tokenNumber: { startsWith: `${prefix}-${dateStr}` } },
            });
            return `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`;
        }
        async addToQueue(tx, tokenId, centerId) {
            const lastEntry = await tx.queueEntry.findFirst({
                where: { centerId },
                orderBy: { position: 'desc' },
            });
            const position = (lastEntry?.position || 0) + 1;
            await tx.queueEntry.create({
                data: {
                    tokenId,
                    centerId,
                    position,
                },
            });
            await tx.token.update({
                where: { id: tokenId },
                data: { queuePosition: position, status: TokenStatus.WAITING },
            });
        }
        async findById(id) {
            return this.prisma.token.findUnique({
                where: { id },
                include: {
                    booking: { include: { slot: true } },
                    farmer: { include: { user: true } },
                    center: true,
                    crop: true,
                    queueEntry: true,
                    procurementRecord: true,
                },
            });
        }
        async findByTokenNumber(tokenNumber) {
            return this.prisma.token.findUnique({
                where: { tokenNumber },
                include: { booking: true, farmer: { include: { user: true } }, center: true, crop: true, queueEntry: true },
            });
        }
        async findAll(params) {
            const { farmerId, centerId, cropId, status, page = 1, limit = 20 } = params;
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
            const [data, total] = await Promise.all([
                this.prisma.token.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { booking: true, farmer: { include: { user: true } }, center: true, crop: true, queueEntry: true },
                }),
                this.prisma.token.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async getFarmerTokens(farmerId, params = {}) {
            const { status, page = 1, limit = 20 } = params;
            return this.findAll({ farmerId, status, page, limit });
        }
        async getTokenStatus(tokenId) {
            const token = await this.findById(tokenId);
            if (!token) {
                throw new NotFoundException('Token not found');
            }
            let queuePosition = token.queuePosition;
            let estimatedWait = token.estimatedWait;
            if (token.status === TokenStatus.WAITING || token.status === TokenStatus.CALLED) {
                const queueInfo = await this.getQueuePosition(token.centerId, token.id);
                queuePosition = queueInfo.position;
                estimatedWait = queueInfo.estimatedWait;
            }
            return {
                token,
                queuePosition,
                estimatedWait,
                currentToken: await this.getCurrentToken(token.centerId),
            };
        }
        async getQueuePosition(centerId, tokenId) {
            const entry = await this.prisma.queueEntry.findUnique({ where: { tokenId } });
            if (!entry) {
                return { position: 0, estimatedWait: 0 };
            }
            const avgProcessingTime = await this.getAverageProcessingTime(centerId);
            const estimatedWait = entry.position * avgProcessingTime;
            return { position: entry.position, estimatedWait };
        }
        async getCurrentToken(centerId) {
            const counter = await this.prisma.centerCounter.findFirst({
                where: { centerId, currentTokenId: { not: null } },
                include: { currentToken: true },
            });
            return counter?.currentToken || null;
        }
        async getAverageProcessingTime(centerId) {
            const completedTokens = await this.prisma.token.findMany({
                where: {
                    centerId,
                    status: { in: [TokenStatus.PROCUREMENT_COMPLETED, TokenStatus.PAYMENT_COMPLETED] },
                    calledAt: { not: null },
                    completedAt: { not: null },
                },
                take: 50,
                orderBy: { completedAt: 'desc' },
            });
            if (completedTokens.length === 0) {
                return 10; // Default 10 minutes
            }
            const totalMinutes = completedTokens.reduce((sum, t) => {
                if (t.calledAt && t.completedAt) {
                    return sum + (t.completedAt.getTime() - t.calledAt.getTime()) / (1000 * 60);
                }
                return sum;
            }, 0);
            return Math.round(totalMinutes / completedTokens.length);
        }
        async updateStatus(tokenId, status, data) {
            const token = await this.prisma.token.findUnique({ where: { id: tokenId } });
            if (!token) {
                throw new NotFoundException('Token not found');
            }
            const validTransitions = {
                [TokenStatus.GENERATED]: [TokenStatus.WAITING, TokenStatus.CANCELLED],
                [TokenStatus.WAITING]: [TokenStatus.CALLED, TokenStatus.CANCELLED, TokenStatus.NO_SHOW],
                [TokenStatus.CALLED]: [TokenStatus.ARRIVED, TokenStatus.CANCELLED, TokenStatus.NO_SHOW],
                [TokenStatus.ARRIVED]: [TokenStatus.QUALITY_CHECK, TokenStatus.CANCELLED],
                [TokenStatus.QUALITY_CHECK]: [TokenStatus.WEIGHMENT, TokenStatus.CANCELLED],
                [TokenStatus.WEIGHMENT]: [TokenStatus.PROCUREMENT_COMPLETED, TokenStatus.CANCELLED],
                [TokenStatus.PROCUREMENT_COMPLETED]: [TokenStatus.PAYMENT_PENDING, TokenStatus.CANCELLED],
                [TokenStatus.PAYMENT_PENDING]: [TokenStatus.PAYMENT_COMPLETED, TokenStatus.CANCELLED],
                [TokenStatus.PAYMENT_COMPLETED]: [],
                [TokenStatus.CANCELLED]: [],
                [TokenStatus.NO_SHOW]: [],
            };
            if (!validTransitions[token.status]?.includes(status)) {
                throw new BadRequestException(`Invalid status transition from ${token.status} to ${status}`);
            }
            const updatedToken = await this.prisma.token.update({
                where: { id: tokenId },
                data: {
                    status,
                    ...(status === TokenStatus.CALLED && { calledAt: new Date() }),
                    ...(status === TokenStatus.ARRIVED && { arrivedAt: new Date() }),
                    ...(status === TokenStatus.PROCUREMENT_COMPLETED && { completedAt: new Date() }),
                    ...(status === TokenStatus.CANCELLED && { cancelledAt: new Date() }),
                },
            });
            if (status === TokenStatus.CALLED || status === TokenStatus.CANCELLED || status === TokenStatus.NO_SHOW) {
                await this.removeFromQueue(token.centerId, tokenId);
            }
            await this.updateQueueCache(token.centerId);
            return updatedToken;
        }
        async removeFromQueue(centerId, tokenId) {
            const entry = await this.prisma.queueEntry.findUnique({ where: { tokenId } });
            if (!entry)
                return;
            await this.prisma.$transaction(async (tx) => {
                await tx.queueEntry.delete({ where: { tokenId } });
                await tx.queueEntry.updateMany({
                    where: { centerId, position: { gt: entry.position } },
                    data: { position: { decrement: 1 } },
                });
                const tokensToUpdate = await tx.token.findMany({
                    where: { centerId, queuePosition: { gt: entry.position } },
                    select: { id: true },
                });
                for (const t of tokensToUpdate) {
                    await tx.token.update({
                        where: { id: t.id },
                        data: { queuePosition: { decrement: 1 } },
                    });
                }
            });
        }
        async callNextToken(centerId, counterId, officerId) {
            const counter = await this.prisma.centerCounter.findUnique({ where: { id: counterId } });
            if (!counter || counter.centerId !== centerId) {
                throw new BadRequestException('Invalid counter');
            }
            if (counter.currentTokenId) {
                throw new BadRequestException('Counter already has a token');
            }
            const nextEntry = await this.prisma.queueEntry.findFirst({
                where: { centerId },
                orderBy: { position: 'asc' },
                include: { token: true },
            });
            if (!nextEntry) {
                return null;
            }
            const token = nextEntry.token;
            await this.prisma.$transaction(async (tx) => {
                await tx.token.update({
                    where: { id: token.id },
                    data: { status: TokenStatus.CALLED, calledAt: new Date() },
                });
                await tx.centerCounter.update({
                    where: { id: counterId },
                    data: { currentTokenId: token.id },
                });
                await this.removeFromQueue(centerId, token.id);
            });
            await this.updateQueueCache(centerId);
            await this.notifyTokenCalled(token);
            return token;
        }
        async completeTokenAtCounter(counterId, officerId) {
            const counter = await this.prisma.centerCounter.findUnique({ where: { id: counterId } });
            if (!counter || !counter.currentTokenId) {
                return null;
            }
            await this.prisma.centerCounter.update({
                where: { id: counterId },
                data: { currentTokenId: null },
            });
            return this.prisma.token.findUnique({ where: { id: counter.currentTokenId } });
        }
        async updateQueueCache(centerId) {
            const queue = await this.prisma.queueEntry.findMany({
                where: { centerId },
                orderBy: { position: 'asc' },
                include: { token: { include: { farmer: { include: { user: true } }, crop: true } } },
            });
            await this.redis.set(`queue:${centerId}`, JSON.stringify(queue), 60);
        }
        async getQueueFromCache(centerId) {
            const cached = await this.redis.get(`queue:${centerId}`);
            if (cached) {
                return JSON.parse(cached);
            }
            return this.updateQueueCache(centerId).then(() => this.redis.get(`queue:${centerId}`).then(c => c ? JSON.parse(c) : []));
        }
        async notifyTokenGenerated(token) {
            await this.prisma.notification.create({
                data: {
                    userId: token.farmer.userId,
                    type: 'SLOT_BOOKED',
                    channel: 'IN_APP',
                    title: 'Token Generated',
                    message: `Your token ${token.tokenNumber} has been generated for ${token.center.name}`,
                    data: { tokenId: token.id, tokenNumber: token.tokenNumber },
                },
            });
        }
        async notifyTokenCalled(token) {
            await this.prisma.notification.create({
                data: {
                    userId: token.farmer.userId,
                    type: 'TOKEN_CALLED',
                    channel: 'IN_APP',
                    title: 'Token Called',
                    message: `Your token ${token.tokenNumber} has been called. Please proceed to the counter.`,
                    data: { tokenId: token.id, tokenNumber: token.tokenNumber },
                },
            });
        }
    };
    __setFunctionName(_classThis, "TokensService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TokensService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TokensService = _classThis;
})();
export { TokensService };
