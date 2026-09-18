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
import { Controller, Get, UseGuards, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
let AnalyticsController = (() => {
    let _classDecorators = [ApiTags('Analytics'), Controller('analytics'), UseGuards(JwtAuthGuard), ApiBearerAuth()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getSystemOverview_decorators;
    let _getImpactMetrics_decorators;
    let _getCenterAnalytics_decorators;
    let _getAllCentersAnalytics_decorators;
    let _getQueueAnalytics_decorators;
    let _getBookingAnalytics_decorators;
    let _getProcurementAnalytics_decorators;
    let _getPaymentAnalytics_decorators;
    let _getMyAnalytics_decorators;
    let _getFarmerImpact_decorators;
    var AnalyticsController = _classThis = class {
        constructor(analyticsService, impactAnalyticsService) {
            Object.defineProperty(this, "analyticsService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: (__runInitializers(this, _instanceExtraInitializers), analyticsService)
            });
            Object.defineProperty(this, "impactAnalyticsService", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: impactAnalyticsService
            });
        }
        async getSystemOverview() {
            return this.analyticsService.getSystemOverview();
        }
        async getImpactMetrics() {
            return this.impactAnalyticsService.calculateImpactMetrics();
        }
        async getCenterAnalytics(centerId, dateFrom, dateTo) {
            return this.analyticsService.getCenterAnalytics(centerId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
        }
        async getAllCentersAnalytics(dateFrom, dateTo) {
            return this.analyticsService.getAllCentersAnalytics(dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
        }
        async getQueueAnalytics(centerId, dateFrom, dateTo) {
            return this.analyticsService.getQueueAnalytics(centerId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
        }
        async getBookingAnalytics(dateFrom, dateTo) {
            return this.analyticsService.getBookingAnalytics(dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
        }
        async getProcurementAnalytics(dateFrom, dateTo) {
            return this.analyticsService.getProcurementAnalytics(dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
        }
        async getPaymentAnalytics(dateFrom, dateTo) {
            return this.analyticsService.getPaymentAnalytics(dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
        }
        async getMyAnalytics(req) {
            const farmer = await this.analyticsService['prisma'].farmer.findUnique({ where: { userId: req.user.sub } });
            if (!farmer) {
                return { success: false, message: 'Farmer profile not found' };
            }
            return this.analyticsService.getFarmerAnalytics(farmer.id);
        }
        async getFarmerImpact(farmerId) {
            return this.impactAnalyticsService.getFarmerImpact(farmerId);
        }
    };
    __setFunctionName(_classThis, "AnalyticsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getSystemOverview_decorators = [Get('overview'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Get system overview (Admin only)' }), ApiResponse({ status: 200, description: 'System overview' })];
        _getImpactMetrics_decorators = [Get('impact'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Get impact metrics (Admin only)' }), ApiResponse({ status: 200, description: 'Impact metrics' })];
        _getCenterAnalytics_decorators = [Get('center/:centerId'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Get center analytics (Admin/Officer only)' }), ApiQuery({ name: 'dateFrom', required: false, type: String }), ApiQuery({ name: 'dateTo', required: false, type: String }), ApiResponse({ status: 200, description: 'Center analytics' })];
        _getAllCentersAnalytics_decorators = [Get('centers'), UseGuards(RolesGuard), Roles(Role.ADMIN), ApiOperation({ summary: 'Get all centers analytics (Admin only)' }), ApiQuery({ name: 'dateFrom', required: false, type: String }), ApiQuery({ name: 'dateTo', required: false, type: String }), ApiResponse({ status: 200, description: 'All centers analytics' })];
        _getQueueAnalytics_decorators = [Get('queue/:centerId'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Get queue analytics for center (Admin/Officer only)' }), ApiQuery({ name: 'dateFrom', required: false, type: String }), ApiQuery({ name: 'dateTo', required: false, type: String }), ApiResponse({ status: 200, description: 'Queue analytics' })];
        _getBookingAnalytics_decorators = [Get('bookings'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Get booking analytics (Admin/Officer only)' }), ApiQuery({ name: 'dateFrom', required: false, type: String }), ApiQuery({ name: 'dateTo', required: false, type: String }), ApiResponse({ status: 200, description: 'Booking analytics' })];
        _getProcurementAnalytics_decorators = [Get('procurement'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Get procurement analytics (Admin/Officer only)' }), ApiQuery({ name: 'dateFrom', required: false, type: String }), ApiQuery({ name: 'dateTo', required: false, type: String }), ApiResponse({ status: 200, description: 'Procurement analytics' })];
        _getPaymentAnalytics_decorators = [Get('payments'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Get payment analytics (Admin/Officer only)' }), ApiQuery({ name: 'dateFrom', required: false, type: String }), ApiQuery({ name: 'dateTo', required: false, type: String }), ApiResponse({ status: 200, description: 'Payment analytics' })];
        _getMyAnalytics_decorators = [Get('farmer/me'), ApiOperation({ summary: 'Get current farmer analytics' }), ApiResponse({ status: 200, description: 'Farmer analytics' })];
        _getFarmerImpact_decorators = [Get('farmer/:farmerId/impact'), UseGuards(RolesGuard), Roles(Role.ADMIN, Role.OFFICER), ApiOperation({ summary: 'Get farmer impact metrics (Admin/Officer only)' }), ApiResponse({ status: 200, description: 'Farmer impact metrics' })];
        __esDecorate(_classThis, null, _getSystemOverview_decorators, { kind: "method", name: "getSystemOverview", static: false, private: false, access: { has: obj => "getSystemOverview" in obj, get: obj => obj.getSystemOverview }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getImpactMetrics_decorators, { kind: "method", name: "getImpactMetrics", static: false, private: false, access: { has: obj => "getImpactMetrics" in obj, get: obj => obj.getImpactMetrics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCenterAnalytics_decorators, { kind: "method", name: "getCenterAnalytics", static: false, private: false, access: { has: obj => "getCenterAnalytics" in obj, get: obj => obj.getCenterAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAllCentersAnalytics_decorators, { kind: "method", name: "getAllCentersAnalytics", static: false, private: false, access: { has: obj => "getAllCentersAnalytics" in obj, get: obj => obj.getAllCentersAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getQueueAnalytics_decorators, { kind: "method", name: "getQueueAnalytics", static: false, private: false, access: { has: obj => "getQueueAnalytics" in obj, get: obj => obj.getQueueAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBookingAnalytics_decorators, { kind: "method", name: "getBookingAnalytics", static: false, private: false, access: { has: obj => "getBookingAnalytics" in obj, get: obj => obj.getBookingAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getProcurementAnalytics_decorators, { kind: "method", name: "getProcurementAnalytics", static: false, private: false, access: { has: obj => "getProcurementAnalytics" in obj, get: obj => obj.getProcurementAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPaymentAnalytics_decorators, { kind: "method", name: "getPaymentAnalytics", static: false, private: false, access: { has: obj => "getPaymentAnalytics" in obj, get: obj => obj.getPaymentAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyAnalytics_decorators, { kind: "method", name: "getMyAnalytics", static: false, private: false, access: { has: obj => "getMyAnalytics" in obj, get: obj => obj.getMyAnalytics }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFarmerImpact_decorators, { kind: "method", name: "getFarmerImpact", static: false, private: false, access: { has: obj => "getFarmerImpact" in obj, get: obj => obj.getFarmerImpact }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AnalyticsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AnalyticsController = _classThis;
})();
export { AnalyticsController };
