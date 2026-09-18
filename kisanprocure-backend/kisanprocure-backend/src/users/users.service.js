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
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
let UsersService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var UsersService = _classThis = class {
        constructor(prisma) {
            Object.defineProperty(this, "prisma", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: prisma
            });
        }
        async findById(id) {
            return this.prisma.user.findUnique({
                where: { id },
                include: {
                    farmer: true,
                    officer: true,
                    admin: true,
                },
            });
        }
        async findByMobile(mobileNumber) {
            return this.prisma.user.findUnique({
                where: { mobileNumber },
            });
        }
        async findByEmail(email) {
            return this.prisma.user.findUnique({
                where: { email },
            });
        }
        async findAll(params) {
            const { role, status, page = 1, limit = 20, search } = params;
            const skip = (page - 1) * limit;
            const where = {};
            if (role)
                where.role = role;
            if (status)
                where.status = status;
            if (search) {
                where.OR = [
                    { mobileNumber: { contains: search } },
                    { email: { contains: search } },
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        farmer: true,
                        officer: true,
                        admin: true,
                    },
                }),
                this.prisma.user.count({ where }),
            ]);
            return { data, total, page, limit };
        }
        async update(id, data) {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            if (data.email) {
                const existingEmail = await this.prisma.user.findUnique({
                    where: { email: data.email },
                });
                if (existingEmail && existingEmail.id !== id) {
                    throw new ConflictException('Email already in use');
                }
            }
            return this.prisma.user.update({
                where: { id },
                data,
                include: {
                    farmer: true,
                    officer: true,
                    admin: true,
                },
            });
        }
        async updateStatus(id, status) {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return this.prisma.user.update({
                where: { id },
                data: { status },
            });
        }
        async updateRole(id, role) {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return this.prisma.user.update({
                where: { id },
                data: { role },
            });
        }
        async updatePassword(id, currentPassword, newPassword) {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user || !user.passwordHash) {
                throw new NotFoundException('User not found or no password set');
            }
            const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isValid) {
                throw new ConflictException('Current password is incorrect');
            }
            const passwordHash = await bcrypt.hash(newPassword, 12);
            await this.prisma.user.update({
                where: { id },
                data: { passwordHash },
            });
        }
        async delete(id) {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            await this.prisma.user.update({
                where: { id },
                data: { deletedAt: new Date(), status: UserStatus.INACTIVE },
            });
        }
        async getUserStats() {
            const [totalUsers, totalFarmers, totalOfficers, totalAdmins, activeUsers] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.user.count({ where: { role: Role.FARMER } }),
                this.prisma.user.count({ where: { role: Role.OFFICER } }),
                this.prisma.user.count({ where: { role: Role.ADMIN } }),
                this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
            ]);
            return {
                totalUsers,
                totalFarmers,
                totalOfficers,
                totalAdmins,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
            };
        }
    };
    __setFunctionName(_classThis, "UsersService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        UsersService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return UsersService = _classThis;
})();
export { UsersService };
