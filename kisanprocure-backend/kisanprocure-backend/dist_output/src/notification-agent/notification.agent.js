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
import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
let NotificationAgent = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NotificationAgent = _classThis = class {
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
                value: new Logger(NotificationAgent.name)
            });
        }
        async determineNotifications(input) {
            const { farmerId, event, context } = input;
            const farmer = await this.prisma.farmer.findUnique({
                where: { id: farmerId },
                include: { user: true },
            });
            if (!farmer) {
                return [];
            }
            const preferences = await this.getNotificationPreferences(farmerId);
            switch (event) {
                case 'SLOT_BOOKED':
                    return this.handleSlotBooked(farmer, context, preferences);
                case 'APPOINTMENT_APPROACHING':
                    return this.handleAppointmentApproaching(farmer, context, preferences);
                case 'QUEUE_APPROACHING':
                    return this.handleQueueApproaching(farmer, context, preferences);
                case 'TOKEN_CALLED':
                    return this.handleTokenCalled(farmer, context, preferences);
                case 'SCHEDULE_CHANGED':
                    return this.handleScheduleChanged(farmer, context, preferences);
                case 'CENTER_OVERLOADED':
                    return this.handleCenterOverloaded(farmer, context, preferences);
                case 'CENTER_CLOSED':
                    return this.handleCenterClosed(farmer, context, preferences);
                case 'PROCUREMENT_COMPLETED':
                    return this.handleProcurementCompleted(farmer, context, preferences);
                case 'PAYMENT_COMPLETED':
                    return this.handlePaymentCompleted(farmer, context, preferences);
                case 'COMPLAINT_RECEIVED':
                    return this.handleComplaintReceived(farmer, context, preferences);
                case 'COMPLAINT_RESOLVED':
                    return this.handleComplaintResolved(farmer, context, preferences);
                default:
                    return [];
            }
        }
        async getNotificationPreferences(farmerId) {
            return {
                inApp: true,
                push: true,
                sms: false,
                whatsapp: false,
                email: false,
                quietHours: { start: '22:00', end: '07:00' },
                minQueuePositionForAlert: 3,
            };
        }
        isQuietHours(preferences) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [startH, startM] = preferences.quietHours.start.split(':').map(Number);
            const [endH, endM] = preferences.quietHours.end.split(':').map(Number);
            const startTime = startH * 60 + startM;
            const endTime = endH * 60 + endM;
            if (startTime > endTime) {
                return currentTime >= startTime || currentTime < endTime;
            }
            return currentTime >= startTime && currentTime < endTime;
        }
        handleSlotBooked(farmer, context, preferences) {
            return [{
                    shouldNotify: true,
                    channel: NotificationChannel.IN_APP,
                    priority: 'NORMAL',
                    title: 'Slot Booked Successfully',
                    message: `Your slot has been booked for ${context.scheduledDate} at ${context.centerName}. Token will be generated on the day of appointment.`,
                    delayMinutes: 0,
                    reason: 'Confirmation of successful booking',
                }];
        }
        handleAppointmentApproaching(farmer, context, preferences) {
            const decisions = [];
            if (preferences.inApp) {
                decisions.push({
                    shouldNotify: true,
                    channel: NotificationChannel.IN_APP,
                    priority: 'HIGH',
                    title: 'Appointment Tomorrow',
                    message: `Your appointment is scheduled for tomorrow at ${context.centerName}. Please arrive on time.`,
                    delayMinutes: 0,
                    reason: 'Reminder for upcoming appointment',
                });
            }
            if (preferences.sms && !this.isQuietHours(preferences)) {
                decisions.push({
                    shouldNotify: true,
                    channel: NotificationChannel.SMS,
                    priority: 'HIGH',
                    title: 'Appointment Reminder',
                    message: `KisanProcure: Your appointment is tomorrow at ${context.centerName}. Token: ${context.tokenNumber || 'TBD'}`,
                    delayMinutes: 0,
                    reason: 'SMS reminder for appointment',
                });
            }
            return decisions;
        }
        handleQueueApproaching(farmer, context, preferences) {
            const position = context.queuePosition;
            const minPosition = preferences.minQueuePositionForAlert || 3;
            if (position > minPosition) {
                return [];
            }
            const decisions = [];
            decisions.push({
                shouldNotify: true,
                channel: NotificationChannel.IN_APP,
                priority: 'URGENT',
                title: 'Your Token is Approaching',
                message: `Your token ${context.tokenNumber} is approaching. ${position} farmer(s) ahead. Please proceed to ${context.centerName}.`,
                delayMinutes: 0,
                reason: `Queue position ${position} <= threshold ${minPosition}`,
            });
            if (preferences.push && !this.isQuietHours(preferences)) {
                decisions.push({
                    shouldNotify: true,
                    channel: NotificationChannel.PUSH,
                    priority: 'URGENT',
                    title: 'Token Approaching',
                    message: `${position} farmer(s) ahead. Proceed to center.`,
                    delayMinutes: 0,
                    reason: 'Push notification for urgent queue update',
                });
            }
            return decisions;
        }
        handleTokenCalled(farmer, context, preferences) {
            const decisions = [];
            decisions.push({
                shouldNotify: true,
                channel: NotificationChannel.IN_APP,
                priority: 'URGENT',
                title: 'Token Called!',
                message: `Your token ${context.tokenNumber} has been called at counter ${context.counterNumber}. Please proceed immediately.`,
                delayMinutes: 0,
                reason: 'Token called by officer',
            });
            if (preferences.push) {
                decisions.push({
                    shouldNotify: true,
                    channel: NotificationChannel.PUSH,
                    priority: 'URGENT',
                    title: 'Token Called!',
                    message: `Proceed to counter ${context.counterNumber} immediately.`,
                    delayMinutes: 0,
                    reason: 'Push notification for token called',
                });
            }
            if (preferences.sms && !this.isQuietHours(preferences)) {
                decisions.push({
                    shouldNotify: true,
                    channel: NotificationChannel.SMS,
                    priority: 'URGENT',
                    title: 'Token Called',
                    message: `KisanProcure: Token ${context.tokenNumber} called at counter ${context.counterNumber}. Proceed now.`,
                    delayMinutes: 0,
                    reason: 'SMS for token called',
                });
            }
            return decisions;
        }
        handleScheduleChanged(farmer, context, preferences) {
            return [{
                    shouldNotify: true,
                    channel: NotificationChannel.IN_APP,
                    priority: 'HIGH',
                    title: 'Schedule Changed',
                    message: `Your appointment at ${context.centerName} has been rescheduled to ${context.newDate} at ${context.newTime}.`,
                    delayMinutes: 0,
                    reason: 'Appointment schedule changed by admin',
                }];
        }
        handleCenterOverloaded(farmer, context, preferences) {
            return [{
                    shouldNotify: true,
                    channel: NotificationChannel.IN_APP,
                    priority: 'HIGH',
                    title: 'Center Overloaded',
                    message: `${context.centerName} is experiencing high crowd. Consider rescheduling or choosing an alternative center.`,
                    delayMinutes: 0,
                    reason: 'Center capacity exceeded threshold',
                }];
        }
        handleCenterClosed(farmer, context, preferences) {
            return [{
                    shouldNotify: true,
                    channel: NotificationChannel.IN_APP,
                    priority: 'URGENT',
                    title: 'Center Closed',
                    message: `${context.centerName} is temporarily closed. Your appointment has been rescheduled to ${context.newCenterName} on ${context.newDate}.`,
                    delayMinutes: 0,
                    reason: 'Procurement center closure',
                }];
        }
        handleProcurementCompleted(farmer, context, preferences) {
            return [{
                    shouldNotify: true,
                    channel: NotificationChannel.IN_APP,
                    priority: 'NORMAL',
                    title: 'Procurement Completed',
                    message: `Your procurement of ${context.quantity} ${context.unit} of ${context.cropName} has been completed. Payment will be initiated shortly.`,
                    delayMinutes: 0,
                    reason: 'Procurement process completed',
                }];
        }
        handlePaymentCompleted(farmer, context, preferences) {
            const decisions = [];
            decisions.push({
                shouldNotify: true,
                channel: NotificationChannel.IN_APP,
                priority: 'NORMAL',
                title: 'Payment Completed',
                message: `Payment of ₹${context.amount} has been completed for procurement ${context.recordNumber}. Receipt: ${context.receiptNumber}`,
                delayMinutes: 0,
                reason: 'Payment successfully processed',
            });
            if (preferences.sms && !this.isQuietHours(preferences)) {
                decisions.push({
                    shouldNotify: true,
                    channel: NotificationChannel.SMS,
                    priority: 'NORMAL',
                    title: 'Payment Received',
                    message: `KisanProcure: ₹${context.amount} credited for procurement ${context.recordNumber}. Receipt: ${context.receiptNumber}`,
                    delayMinutes: 0,
                    reason: 'SMS for payment confirmation',
                });
            }
            return decisions;
        }
        handleComplaintReceived(farmer, context, preferences) {
            return [{
                    shouldNotify: true,
                    channel: NotificationChannel.IN_APP,
                    priority: 'NORMAL',
                    title: 'Complaint Registered',
                    message: `Your complaint ${context.complaintNumber} has been registered: ${context.subject}. We will review and respond soon.`,
                    delayMinutes: 0,
                    reason: 'Complaint acknowledgment',
                }];
        }
        handleComplaintResolved(farmer, context, preferences) {
            return [{
                    shouldNotify: true,
                    channel: NotificationChannel.IN_APP,
                    priority: 'NORMAL',
                    title: 'Complaint Resolved',
                    message: `Your complaint ${context.complaintNumber} has been resolved: ${context.resolution}`,
                    delayMinutes: 0,
                    reason: 'Complaint resolution notification',
                }];
        }
    };
    __setFunctionName(_classThis, "NotificationAgent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationAgent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationAgent = _classThis;
})();
export { NotificationAgent };
