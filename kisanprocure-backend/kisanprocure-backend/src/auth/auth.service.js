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
import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role, UserStatus } from '@prisma/client';
let AuthService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
        constructor(prisma, redis, jwtService, configService) {
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
            Object.defineProperty(this, "jwtService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: jwtService
            });
            Object.defineProperty(this, "configService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: configService
            });
            Object.defineProperty(this, "logger", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: new Logger(AuthService.name)
            });
            Object.defineProperty(this, "otpTtl", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 300
            });
        }
        async sendOtp(mobileNumber) {
            const normalizedMobile = this.normalizeMobile(mobileNumber);
            const existingUser = await this.prisma.user.findUnique({
                where: { mobileNumber: normalizedMobile },
            });
            if (existingUser && existingUser.status === UserStatus.SUSPENDED) {
                throw new UnauthorizedException('Account suspended. Contact support.');
            }
            const otp = this.generateOtp();
            const otpKey = `otp:${normalizedMobile}`;
            await this.redis.set(otpKey, otp, this.otpTtl);
            this.logger.log(`OTP sent to ${normalizedMobile}: ${otp}`);
            return {
                success: true,
                message: 'OTP sent successfully',
            };
        }
        async verifyOtp(mobileNumber, otp) {
            const normalizedMobile = this.normalizeMobile(mobileNumber);
            const otpKey = `otp:${normalizedMobile}`;
            const storedOtp = await this.redis.get(otpKey);
            if (!storedOtp || storedOtp !== otp) {
                throw new UnauthorizedException('Invalid or expired OTP');
            }
            await this.redis.del(otpKey);
            let user = await this.prisma.user.findUnique({
                where: { mobileNumber: normalizedMobile },
            });
            if (!user) {
                user = await this.prisma.user.create({
                    data: {
                        mobileNumber: normalizedMobile,
                        role: Role.FARMER,
                        status: UserStatus.ACTIVE,
                    },
                });
            }
            if (user.status === UserStatus.SUSPENDED) {
                throw new UnauthorizedException('Account suspended. Contact support.');
            }
            if (user.status === UserStatus.PENDING_VERIFICATION) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { status: UserStatus.ACTIVE },
                });
            }
            const tokens = await this.generateTokens(user);
            await this.storeRefreshToken(user.id, tokens.refreshToken);
            await this.updateLastLogin(user.id);
            return tokens;
        }
        async registerFarmer(mobileNumber, data) {
            const normalizedMobile = this.normalizeMobile(mobileNumber);
            const existingUser = await this.prisma.user.findUnique({
                where: { mobileNumber: normalizedMobile },
            });
            if (existingUser) {
                throw new ConflictException('Mobile number already registered');
            }
            if (data.aadhaarNumber) {
                const existingAadhaar = await this.prisma.farmer.findUnique({
                    where: { aadhaarNumber: data.aadhaarNumber },
                });
                if (existingAadhaar) {
                    throw new ConflictException('Aadhaar number already registered');
                }
            }
            const farmerCode = await this.generateFarmerCode(data.district);
            const user = await this.prisma.user.create({
                data: {
                    mobileNumber: normalizedMobile,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: Role.FARMER,
                    status: UserStatus.ACTIVE,
                    farmer: {
                        create: {
                            farmerCode,
                            aadhaarNumber: data.aadhaarNumber,
                            panNumber: data.panNumber,
                            bankAccount: data.bankAccount,
                            ifscCode: data.ifscCode,
                            address: data.address,
                            village: data.village,
                            district: data.district,
                            state: data.state,
                            pincode: data.pincode,
                            latitude: data.latitude,
                            longitude: data.longitude,
                            totalLandArea: data.totalLandArea,
                        },
                    },
                },
                include: { farmer: true },
            });
            const tokens = await this.generateTokens(user);
            await this.storeRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        }
        async registerOfficer(mobileNumber, data) {
            const normalizedMobile = this.normalizeMobile(mobileNumber);
            const existingUser = await this.prisma.user.findUnique({
                where: { mobileNumber: normalizedMobile },
            });
            if (existingUser) {
                throw new ConflictException('Mobile number already registered');
            }
            const existingEmployee = await this.prisma.officer.findUnique({
                where: { employeeId: data.employeeId },
            });
            if (existingEmployee) {
                throw new ConflictException('Employee ID already exists');
            }
            const user = await this.prisma.user.create({
                data: {
                    mobileNumber: normalizedMobile,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: Role.OFFICER,
                    status: UserStatus.ACTIVE,
                    officer: {
                        create: {
                            employeeId: data.employeeId,
                            centerId: data.centerId,
                            designation: data.designation,
                            permissions: data.permissions || [],
                        },
                    },
                },
                include: { officer: true },
            });
            const tokens = await this.generateTokens(user);
            await this.storeRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        }
        async login(mobileNumber, password) {
            const normalizedMobile = this.normalizeMobile(mobileNumber);
            const user = await this.prisma.user.findUnique({
                where: { mobileNumber: normalizedMobile },
            });
            if (!user || !user.passwordHash) {
                throw new UnauthorizedException('Invalid credentials');
            }
            if (user.status === UserStatus.SUSPENDED) {
                throw new UnauthorizedException('Account suspended. Contact support.');
            }
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }
            const tokens = await this.generateTokens(user);
            await this.storeRefreshToken(user.id, tokens.refreshToken);
            await this.updateLastLogin(user.id);
            return tokens;
        }
        async setPassword(userId, password) {
            const passwordHash = await bcrypt.hash(password, 12);
            await this.prisma.user.update({
                where: { id: userId },
                data: { passwordHash },
            });
        }
        async refreshTokens(refreshToken) {
            const session = await this.prisma.session.findUnique({
                where: { refreshToken },
                include: { user: true },
            });
            if (!session || session.revokedAt || session.expiresAt < new Date()) {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }
            if (session.user.status === UserStatus.SUSPENDED) {
                throw new UnauthorizedException('Account suspended');
            }
            await this.prisma.session.update({
                where: { id: session.id },
                data: { revokedAt: new Date() },
            });
            const tokens = await this.generateTokens(session.user);
            await this.storeRefreshToken(session.user.id, tokens.refreshToken);
            return tokens;
        }
        async logout(userId, refreshToken) {
            if (refreshToken) {
                await this.prisma.session.updateMany({
                    where: { userId, refreshToken, revokedAt: null },
                    data: { revokedAt: new Date() },
                });
            }
            else {
                await this.prisma.session.updateMany({
                    where: { userId, revokedAt: null },
                    data: { revokedAt: new Date() },
                });
            }
        }
        async logoutAllDevices(userId) {
            await this.prisma.session.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        async validateUser(userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user || user.status !== UserStatus.ACTIVE) {
                return null;
            }
            return {
                sub: user.id,
                mobileNumber: user.mobileNumber,
                role: user.role,
            };
        }
        async generateTokens(user) {
            const payload = {
                sub: user.id,
                mobileNumber: user.mobileNumber,
                role: user.role,
            };
            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
            });
            return { accessToken, refreshToken };
        }
        async storeRefreshToken(userId, refreshToken) {
            const expiresIn = this.configService.get('JWT_REFRESH_EXPIRATION') || '7d';
            const expiresAt = new Date(Date.now() + this.parseDuration(expiresIn));
            await this.prisma.session.create({
                data: {
                    userId,
                    refreshToken,
                    expiresAt,
                    userAgent: 'unknown',
                    ipAddress: 'unknown',
                },
            });
        }
        async updateLastLogin(userId) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { lastLoginAt: new Date() },
            });
        }
        generateOtp() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }
        normalizeMobile(mobile) {
            return mobile.replace(/\D/g, '').replace(/^(\+91|91|0)/, '');
        }
        async generateFarmerCode(district) {
            const prefix = district ? district.substring(0, 3).toUpperCase() : 'KSN';
            const count = await this.prisma.farmer.count();
            return `${prefix}-${String(count + 1).padStart(6, '0')}`;
        }
        parseDuration(duration) {
            const match = duration.match(/^(\d+)([smhd])$/);
            if (!match)
                return 7 * 24 * 60 * 60 * 1000;
            const value = parseInt(match[1], 10);
            const unit = match[2];
            switch (unit) {
                case 's': return value * 1000;
                case 'm': return value * 60 * 1000;
                case 'h': return value * 60 * 60 * 1000;
                case 'd': return value * 24 * 60 * 60 * 1000;
                default: return 7 * 24 * 60 * 60 * 1000;
            }
        }
    };
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
export { AuthService };
