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
import { TokenStatus, ProcurementState, PaymentStatus, BookingStatus } from '@prisma/client';
let KisanSahayakAgent = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var KisanSahayakAgent = _classThis = class {
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
                value: new Logger(KisanSahayakAgent.name)
            });
        }
        async answer(input) {
            const { farmerId, question, context } = input;
            const intent = this.classifyIntent(question);
            switch (intent) {
                case 'TOKEN_STATUS':
                    return this.getTokenStatus(farmerId, context);
                case 'APPOINTMENT_STATUS':
                    return this.getAppointmentStatus(farmerId, context);
                case 'CENTER_LOCATION':
                    return this.getCenterLocation(farmerId, context);
                case 'QUEUE_STATUS':
                    return this.getQueueStatus(farmerId, context);
                case 'PROCUREMENT_STATUS':
                    return this.getProcurementStatus(farmerId, context);
                case 'PAYMENT_STATUS':
                    return this.getPaymentStatus(farmerId, context);
                case 'BOOKING_HELP':
                    return this.getBookingHelp(farmerId, context);
                case 'SCHEDULE_INFO':
                    return this.getScheduleInfo(farmerId, context);
                case 'COMPLAINT_CREATION':
                    return this.helpComplaintCreation(farmerId, context);
                default:
                    return this.getDefaultResponse(question);
            }
        }
        classifyIntent(question) {
            const lowerQuestion = question.toLowerCase();
            if (lowerQuestion.includes('token') || lowerQuestion.includes('टोकन')) {
                return 'TOKEN_STATUS';
            }
            if (lowerQuestion.includes('appointment') || lowerQuestion.includes('booking') || lowerQuestion.includes('अपॉइंटमेंट') || lowerQuestion.includes('बुकिंग')) {
                return 'APPOINTMENT_STATUS';
            }
            if (lowerQuestion.includes('center') || lowerQuestion.includes('location') || lowerQuestion.includes('कहाँ') || lowerQuestion.includes('केंद्र')) {
                return 'CENTER_LOCATION';
            }
            if (lowerQuestion.includes('queue') || lowerQuestion.includes('wait') || lowerQuestion.includes('कतार') || lowerQuestion.includes('इंतजार')) {
                return 'QUEUE_STATUS';
            }
            if (lowerQuestion.includes('procurement') || lowerQuestion.includes('खरीद') || lowerQuestion.includes('प्रोक्योरमेंट')) {
                return 'PROCUREMENT_STATUS';
            }
            if (lowerQuestion.includes('payment') || lowerQuestion.includes('पेमेंट') || lowerQuestion.includes('भुगतान')) {
                return 'PAYMENT_STATUS';
            }
            if (lowerQuestion.includes('book') || lowerQuestion.includes('schedule') || lowerQuestion.includes('कैसे') || lowerQuestion.includes('बुक')) {
                return 'BOOKING_HELP';
            }
            if (lowerQuestion.includes('schedule') || lowerQuestion.includes('time') || lowerQuestion.includes('समय') || lowerQuestion.includes('शेड्यूल')) {
                return 'SCHEDULE_INFO';
            }
            if (lowerQuestion.includes('complaint') || lowerQuestion.includes('problem') || lowerQuestion.includes('शिकायत') || lowerQuestion.includes('समस्या')) {
                return 'COMPLAINT_CREATION';
            }
            return 'GENERAL';
        }
        async getTokenStatus(farmerId, context) {
            const tokens = await this.prisma.token.findMany({
                where: { farmerId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { center: true, crop: true, booking: { include: { slot: true } } },
            });
            if (!tokens.length) {
                return {
                    answer: 'You have no active tokens. Please book a slot first.',
                    confidence: 0.9,
                    needsHumanSupport: false,
                    suggestedActions: ['Book a slot', 'View available centers'],
                };
            }
            const latestToken = tokens[0];
            let statusMessage = '';
            switch (latestToken.status) {
                case TokenStatus.GENERATED:
                    statusMessage = `Your token ${latestToken.tokenNumber} has been generated.`;
                    break;
                case TokenStatus.WAITING:
                    statusMessage = `Your token ${latestToken.tokenNumber} is waiting. Position: ${latestToken.queuePosition || 'N/A'}. Estimated wait: ${latestToken.estimatedWait || 'N/A'} minutes.`;
                    break;
                case TokenStatus.CALLED:
                    statusMessage = `Your token ${latestToken.tokenNumber} has been called! Please proceed to the counter.`;
                    break;
                case TokenStatus.ARRIVED:
                    statusMessage = `You have arrived for token ${latestToken.tokenNumber}.`;
                    break;
                case TokenStatus.QUALITY_CHECK:
                    statusMessage = `Quality check in progress for token ${latestToken.tokenNumber}.`;
                    break;
                case TokenStatus.WEIGHMENT:
                    statusMessage = `Weighment in progress for token ${latestToken.tokenNumber}.`;
                    break;
                case TokenStatus.PROCUREMENT_COMPLETED:
                    statusMessage = `Procurement completed for token ${latestToken.tokenNumber}. Payment pending.`;
                    break;
                case TokenStatus.PAYMENT_COMPLETED:
                    statusMessage = `Payment completed for token ${latestToken.tokenNumber}. Receipt generated.`;
                    break;
                case TokenStatus.CANCELLED:
                    statusMessage = `Token ${latestToken.tokenNumber} was cancelled. Reason: ${latestToken.cancellationReason || 'Not specified'}.`;
                    break;
                case TokenStatus.NO_SHOW:
                    statusMessage = `Token ${latestToken.tokenNumber} marked as no-show.`;
                    break;
                default:
                    statusMessage = `Token ${latestToken.tokenNumber} status: ${latestToken.status}.`;
            }
            return {
                answer: `${statusMessage} Center: ${latestToken.center.name}. Crop: ${latestToken.crop.name}. Scheduled: ${latestToken.booking?.slot?.startTime || 'N/A'} - ${latestToken.booking?.slot?.endTime || 'N/A'} on ${latestToken.booking?.scheduledDate?.toDateString() || 'N/A'}.`,
                data: { tokens: tokens.map(t => ({ tokenNumber: t.tokenNumber, status: t.status, center: t.center.name, crop: t.crop.name })) },
                confidence: 0.95,
                needsHumanSupport: false,
                suggestedActions: ['View token details', 'Check queue status'],
            };
        }
        async getAppointmentStatus(farmerId, context) {
            const bookings = await this.prisma.booking.findMany({
                where: { farmerId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { center: true, crop: true, slot: true, token: true },
            });
            if (!bookings.length) {
                return {
                    answer: 'You have no bookings. Please book a slot to schedule an appointment.',
                    confidence: 0.9,
                    needsHumanSupport: false,
                    suggestedActions: ['Book a slot', 'View available centers'],
                };
            }
            const latestBooking = bookings[0];
            let statusMessage = '';
            switch (latestBooking.status) {
                case BookingStatus.PENDING:
                    statusMessage = 'Your booking is pending confirmation.';
                    break;
                case BookingStatus.CONFIRMED:
                    statusMessage = 'Your booking is confirmed.';
                    break;
                case BookingStatus.CANCELLED:
                    statusMessage = 'Your booking was cancelled.';
                    break;
                case BookingStatus.EXPIRED:
                    statusMessage = 'Your booking has expired.';
                    break;
                case BookingStatus.COMPLETED:
                    statusMessage = 'Your booking is completed.';
                    break;
            }
            return {
                answer: `${statusMessage} Booking: ${latestBooking.bookingNumber}. Center: ${latestBooking.center.name}. Crop: ${latestBooking.crop.name}. Date: ${latestBooking.scheduledDate.toDateString()}. Slot: ${latestBooking.slot?.startTime || 'N/A'} - ${latestBooking.slot?.endTime || 'N/A'}. Token: ${latestBooking.token?.tokenNumber || 'Not generated yet'}.`,
                data: { bookings: bookings.map(b => ({ bookingNumber: b.bookingNumber, status: b.status, center: b.center.name, crop: b.crop.name, date: b.scheduledDate })) },
                confidence: 0.95,
                needsHumanSupport: false,
                suggestedActions: ['View booking details', 'Check token status'],
            };
        }
        async getCenterLocation(farmerId, context) {
            const centers = await this.prisma.procurementCenter.findMany({
                where: { status: 'ACTIVE', deletedAt: null },
                take: 10,
                include: { centerCrops: true },
            });
            if (!centers.length) {
                return {
                    answer: 'No active procurement centers found.',
                    confidence: 0.9,
                    needsHumanSupport: false,
                };
            }
            const centerList = centers.map(c => `${c.name} (${c.village}, ${c.district}, ${c.state}) - Crops: ${c.centerCrops.map(cr => cr.name).join(', ')}`).join('\n');
            return {
                answer: `Here are the active procurement centers:\n${centerList}\n\nYou can book a slot at any of these centers for available crops.`,
                data: { centers: centers.map(c => ({ id: c.id, name: c.name, address: c.address, village: c.village, district: c.district, state: c.state, crops: c.centerCrops.map(cr => cr.name) })) },
                confidence: 0.9,
                needsHumanSupport: false,
                suggestedActions: ['Book a slot', 'Get directions'],
            };
        }
        async getQueueStatus(farmerId, context) {
            const tokens = await this.prisma.token.findMany({
                where: {
                    farmerId,
                    status: { in: [TokenStatus.WAITING, TokenStatus.CALLED, TokenStatus.ARRIVED, TokenStatus.QUALITY_CHECK, TokenStatus.WEIGHMENT] },
                },
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: { center: true, crop: true, queueEntry: true },
            });
            if (!tokens.length) {
                return {
                    answer: 'You are not currently in any queue. Your token will be in queue on the day of your appointment.',
                    confidence: 0.9,
                    needsHumanSupport: false,
                };
            }
            const token = tokens[0];
            const position = token.queueEntry?.position || token.queuePosition || 'Unknown';
            const estimatedWait = token.estimatedWait || 'Unknown';
            return {
                answer: `Your token ${token.tokenNumber} is at position ${position} in the queue at ${token.center.name}. Estimated wait time: ${estimatedWait} minutes. Current status: ${token.status}.`,
                data: { tokenNumber: token.tokenNumber, position, estimatedWait, center: token.center.name, status: token.status },
                confidence: 0.9,
                needsHumanSupport: false,
                suggestedActions: ['Refresh queue status', 'Get notified when approaching'],
            };
        }
        async getProcurementStatus(farmerId, context) {
            const procurements = await this.prisma.procurementRecord.findMany({
                where: { farmerId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { center: true, crop: true, qualityCheck: true, weighment: true, payment: true },
            });
            if (!procurements.length) {
                return {
                    answer: 'No procurement records found. Complete a procurement to see status.',
                    confidence: 0.9,
                    needsHumanSupport: false,
                };
            }
            const latest = procurements[0];
            let statusMessage = '';
            switch (latest.state) {
                case ProcurementState.BOOKED:
                    statusMessage = 'Procurement is booked.';
                    break;
                case ProcurementState.SCHEDULED:
                    statusMessage = 'Procurement is scheduled.';
                    break;
                case ProcurementState.WAITING:
                    statusMessage = 'Waiting for your turn.';
                    break;
                case ProcurementState.CALLED:
                    statusMessage = 'Your token has been called.';
                    break;
                case ProcurementState.ARRIVED:
                    statusMessage = 'You have arrived at the center.';
                    break;
                case ProcurementState.QUALITY_CHECK:
                    statusMessage = 'Quality check in progress.';
                    break;
                case ProcurementState.WEIGHMENT:
                    statusMessage = 'Weighment in progress.';
                    break;
                case ProcurementState.PROCUREMENT_COMPLETED:
                    statusMessage = 'Procurement completed. Payment pending.';
                    break;
                case ProcurementState.PAYMENT_PENDING:
                    statusMessage = 'Payment is being processed.';
                    break;
                case ProcurementState.PAYMENT_COMPLETED:
                    statusMessage = 'Payment completed. Receipt available.';
                    break;
                case ProcurementState.CANCELLED:
                    statusMessage = 'Procurement was cancelled.';
                    break;
            }
            return {
                answer: `${statusMessage} Record: ${latest.recordNumber}. Center: ${latest.center.name}. Crop: ${latest.crop.name}. Quantity: ${latest.quantity} ${latest.crop.unit || 'Quintal'}. Amount: ₹${latest.totalAmount || 'N/A'}. Payment: ${latest.payment?.status || 'Pending'}.`,
                data: { procurements: procurements.map(p => ({ recordNumber: p.recordNumber, state: p.state, center: p.center.name, crop: p.crop.name, quantity: p.quantity, amount: p.totalAmount, paymentStatus: p.payment?.status })) },
                confidence: 0.95,
                needsHumanSupport: false,
                suggestedActions: ['View procurement details', 'Check payment status'],
            };
        }
        async getPaymentStatus(farmerId, context) {
            const payments = await this.prisma.payment.findMany({
                where: { farmerId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { procurement: { include: { center: true, crop: true } }, receipt: true },
            });
            if (!payments.length) {
                return {
                    answer: 'No payment records found. Payments are initiated after procurement completion.',
                    confidence: 0.9,
                    needsHumanSupport: false,
                };
            }
            const latest = payments[0];
            let statusMessage = '';
            switch (latest.status) {
                case PaymentStatus.PENDING:
                    statusMessage = 'Payment is pending.';
                    break;
                case PaymentStatus.PROCESSING:
                    statusMessage = 'Payment is being processed.';
                    break;
                case PaymentStatus.COMPLETED:
                    statusMessage = 'Payment completed successfully.';
                    break;
                case PaymentStatus.FAILED:
                    statusMessage = `Payment failed: ${latest.failureReason || 'Unknown reason'}.`;
                    break;
                case PaymentStatus.REFUNDED:
                    statusMessage = 'Payment was refunded.';
                    break;
                case PaymentStatus.CANCELLED:
                    statusMessage = 'Payment was cancelled.';
                    break;
            }
            return {
                answer: `${statusMessage} Payment: ${latest.paymentNumber}. Procurement: ${latest.procurement.recordNumber}. Amount: ₹${latest.amount}. Receipt: ${latest.receipt?.receiptNumber || 'Not generated'}.`,
                data: { payments: payments.map(p => ({ paymentNumber: p.paymentNumber, status: p.status, amount: p.amount, procurement: p.procurement.recordNumber, receipt: p.receipt?.receiptNumber })) },
                confidence: 0.95,
                needsHumanSupport: false,
                suggestedActions: ['View payment details', 'Download receipt'],
            };
        }
        getBookingHelp(farmerId, context) {
            return {
                answer: `To book a slot:\n1. Add your crop produce in "My Produce"\n2. Go to "Centers" and select a center\n3. Choose a date and available slot\n4. Confirm booking - you'll get a booking number\n5. On the appointment day, your token will be generated\n\nNeed help with a specific step?`,
                confidence: 0.8,
                needsHumanSupport: false,
                suggestedActions: ['View centers', 'Add produce', 'Check available slots'],
            };
        }
        async getScheduleInfo(farmerId, context) {
            const schedules = await this.prisma.schedule.findMany({
                where: { date: { gte: new Date() }, isActive: true },
                take: 10,
                include: { center: true, crop: true, slots: { where: { isActive: true } } },
                orderBy: { date: 'asc' },
            });
            if (!schedules.length) {
                return {
                    answer: 'No upcoming schedules available.',
                    confidence: 0.9,
                    needsHumanSupport: false,
                };
            }
            const scheduleList = schedules.map(s => `${s.center.name} - ${s.crop.name} on ${s.date.toDateString()} (${s.startTime}-${s.endTime}) - ${s.slots.filter(sl => sl.bookedCount < sl.capacity).length} slots available`).join('\n');
            return {
                answer: `Upcoming schedules:\n${scheduleList}\n\nSelect a center and date to book a slot.`,
                data: { schedules: schedules.map(s => ({ center: s.center.name, crop: s.crop.name, date: s.date, time: `${s.startTime}-${s.endTime}`, availableSlots: s.slots.filter(sl => sl.bookedCount < sl.capacity).length })) },
                confidence: 0.9,
                needsHumanSupport: false,
                suggestedActions: ['Book a slot', 'Filter by crop'],
            };
        }
        helpComplaintCreation(farmerId, context) {
            return {
                answer: `To create a complaint:\n1. Go to "Complaints" section\n2. Click "New Complaint"\n3. Select center (optional), crop (optional), token (optional)\n4. Enter subject and description\n5. Submit - you'll get a complaint number\n\nWe'll review and respond within 48 hours.`,
                confidence: 0.8,
                needsHumanSupport: false,
                suggestedActions: ['Create complaint', 'View my complaints'],
            };
        }
        getDefaultResponse(question) {
            return {
                answer: `I couldn't understand your question: "${question}". Please ask about:\n- Token status\n- Appointment/booking status\n- Center locations\n- Queue status\n- Procurement status\n- Payment status\n- How to book\n- Schedule information\n- Creating a complaint\n\nIf you need further assistance, I can connect you with a human support agent.`,
                confidence: 0.3,
                needsHumanSupport: true,
                suggestedActions: ['Contact support', 'View FAQ'],
            };
        }
    };
    __setFunctionName(_classThis, "KisanSahayakAgent");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        KisanSahayakAgent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return KisanSahayakAgent = _classThis;
})();
export { KisanSahayakAgent };
