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
import { Controller, Post, Get, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
class SendOtpDto {
    constructor() {
        Object.defineProperty(this, "mobileNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class VerifyOtpDto {
    constructor() {
        Object.defineProperty(this, "mobileNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "otp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class RegisterFarmerDto {
    constructor() {
        Object.defineProperty(this, "mobileNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "firstName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "aadhaarNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "panNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bankAccount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ifscCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "address", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "village", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "district", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pincode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "latitude", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "longitude", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "totalLandArea", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class RegisterOfficerDto {
    constructor() {
        Object.defineProperty(this, "mobileNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "firstName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "employeeId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "centerId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "designation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "permissions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class LoginDto {
    constructor() {
        Object.defineProperty(this, "mobileNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "password", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class SetPasswordDto {
    constructor() {
        Object.defineProperty(this, "password", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
class RefreshTokenDto {
    constructor() {
        Object.defineProperty(this, "refreshToken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
let AuthController = (() => {
    let _classDecorators = [ApiTags('Auth'), Controller('auth')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _sendOtp_decorators;
    let _verifyOtp_decorators;
    let _registerFarmer_decorators;
    let _registerOfficer_decorators;
    let _login_decorators;
    let _setPassword_decorators;
    let _refreshTokens_decorators;
    let _logout_decorators;
    let _logoutAll_decorators;
    let _getProfile_decorators;
    var AuthController = _classThis = class {
        constructor(authService) {
            Object.defineProperty(this, "authService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), authService)
            });
        }
        async sendOtp(dto) {
            return this.authService.sendOtp(dto.mobileNumber);
        }
        async verifyOtp(dto) {
            return this.authService.verifyOtp(dto.mobileNumber, dto.otp);
        }
        async registerFarmer(dto) {
            return this.authService.registerFarmer(dto.mobileNumber, dto);
        }
        async registerOfficer(dto) {
            return this.authService.registerOfficer(dto.mobileNumber, dto);
        }
        async login(dto) {
            return this.authService.login(dto.mobileNumber, dto.password);
        }
        async setPassword(req, dto) {
            await this.authService.setPassword(req.user.sub, dto.password);
            return { success: true, message: 'Password set successfully' };
        }
        async refreshTokens(dto) {
            return this.authService.refreshTokens(dto.refreshToken);
        }
        async logout(req, body) {
            await this.authService.logout(req.user.sub, body.refreshToken);
            return { success: true, message: 'Logged out successfully' };
        }
        async logoutAll(req) {
            await this.authService.logoutAllDevices(req.user.sub);
            return { success: true, message: 'Logged out from all devices' };
        }
        async getProfile(req) {
            const user = await this.authService.validateUser(req.user.sub);
            return user;
        }
    };
    __setFunctionName(_classThis, "AuthController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _sendOtp_decorators = [Post('send-otp'), ApiOperation({ summary: 'Send OTP to mobile number' }), ApiResponse({ status: 200, description: 'OTP sent successfully' })];
        _verifyOtp_decorators = [Post('verify-otp'), ApiOperation({ summary: 'Verify OTP and get tokens' }), ApiResponse({ status: 200, description: 'OTP verified, tokens returned' }), ApiResponse({ status: 401, description: 'Invalid or expired OTP' })];
        _registerFarmer_decorators = [Post('register/farmer'), ApiOperation({ summary: 'Register a new farmer' }), ApiResponse({ status: 201, description: 'Farmer registered successfully' }), ApiResponse({ status: 409, description: 'Mobile or Aadhaar already registered' })];
        _registerOfficer_decorators = [Post('register/officer'), ApiOperation({ summary: 'Register a new officer (Admin only)' }), ApiResponse({ status: 201, description: 'Officer registered successfully' }), UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN), ApiBearerAuth()];
        _login_decorators = [Post('login'), ApiOperation({ summary: 'Login with mobile and password' }), ApiResponse({ status: 200, description: 'Login successful' }), ApiResponse({ status: 401, description: 'Invalid credentials' })];
        _setPassword_decorators = [Post('set-password'), ApiOperation({ summary: 'Set password for OTP-based user' }), UseGuards(JwtAuthGuard), ApiBearerAuth()];
        _refreshTokens_decorators = [Post('refresh'), HttpCode(HttpStatus.OK), ApiOperation({ summary: 'Refresh access token using refresh token' }), ApiResponse({ status: 200, description: 'New tokens generated' }), ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })];
        _logout_decorators = [Post('logout'), UseGuards(JwtAuthGuard), ApiBearerAuth(), ApiOperation({ summary: 'Logout current session' })];
        _logoutAll_decorators = [Post('logout-all'), UseGuards(JwtAuthGuard), ApiBearerAuth(), ApiOperation({ summary: 'Logout from all devices' })];
        _getProfile_decorators = [Get('me'), UseGuards(JwtAuthGuard), ApiBearerAuth(), ApiOperation({ summary: 'Get current user profile' })];
        __esDecorate(_classThis, null, _sendOtp_decorators, { kind: "method", name: "sendOtp", static: false, private: false, access: { has: obj => "sendOtp" in obj, get: obj => obj.sendOtp }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _verifyOtp_decorators, { kind: "method", name: "verifyOtp", static: false, private: false, access: { has: obj => "verifyOtp" in obj, get: obj => obj.verifyOtp }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _registerFarmer_decorators, { kind: "method", name: "registerFarmer", static: false, private: false, access: { has: obj => "registerFarmer" in obj, get: obj => obj.registerFarmer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _registerOfficer_decorators, { kind: "method", name: "registerOfficer", static: false, private: false, access: { has: obj => "registerOfficer" in obj, get: obj => obj.registerOfficer }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setPassword_decorators, { kind: "method", name: "setPassword", static: false, private: false, access: { has: obj => "setPassword" in obj, get: obj => obj.setPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _refreshTokens_decorators, { kind: "method", name: "refreshTokens", static: false, private: false, access: { has: obj => "refreshTokens" in obj, get: obj => obj.refreshTokens }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _logout_decorators, { kind: "method", name: "logout", static: false, private: false, access: { has: obj => "logout" in obj, get: obj => obj.logout }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _logoutAll_decorators, { kind: "method", name: "logoutAll", static: false, private: false, access: { has: obj => "logoutAll" in obj, get: obj => obj.logoutAll }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthController = _classThis;
})();
export { AuthController };
