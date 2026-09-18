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
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
let CropsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CropsService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
        }
        async create(data) {
            const existingCode = await this.prisma.crop.findUnique({ where: { code: data.code } });
            if (existingCode) {
                throw new ConflictException('Crop code already exists');
            }
            return this.prisma.crop.create({
                data: {
                    code: data.code,
                    name: data.name,
                    scientificName: data.scientificName,
                    category: data.category,
                    unit: data.unit || 'QUINTAL',
                    minPrice: data.minPrice,
                    maxPrice: data.maxPrice,
                    seasonStart: data.seasonStart,
                    seasonEnd: data.seasonEnd,
                },
            });
        }
        async findById(id) {
            return this.prisma.crop.findUnique({
                where: { id },
                include: {
                    schedules: { include: { center: true, slots: true } },
                    farmerProduce: { include: { farmer: { include: { user: true } } } },
                },
            });
        }
        async findByCode(code) {
            return this.prisma.crop.findUnique({ where: { code } });
        }
        async findAll(params) {
            const { category, isActive, page = 1, limit = 20, search } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (category)
                where.category = category;
            if (isActive !== undefined)
                where.isActive = isActive;
            if (search) {
                where.OR = [
                    { code: { contains: search } },
                    { name: { contains: search } },
                    { scientificName: { contains: search } },
                    { category: { contains: search } },
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.crop.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' },
                }),
                this.prisma.crop.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async update(id, data) {
            const crop = await this.prisma.crop.findUnique({ where: { id } });
            if (!crop) {
                throw new NotFoundException('Crop not found');
            }
            return this.prisma.crop.update({
                where: { id },
                data,
            });
        }
        async delete(id) {
            const crop = await this.prisma.crop.findUnique({ where: { id } });
            if (!crop) {
                throw new NotFoundException('Crop not found');
            }
            await this.prisma.crop.update({
                where: { id },
                data: { isActive: false },
            });
        }
        async getSeasonalCrops(month) {
            return this.prisma.crop.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { seasonStart: { lte: month }, seasonEnd: { gte: month } },
                        { seasonStart: null, seasonEnd: null },
                    ],
                },
                orderBy: { name: 'asc' },
            });
        }
    };
    __setFunctionName(_classThis, "CropsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CropsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CropsService = _classThis;
})();
export { CropsService };
