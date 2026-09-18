import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router';
import { ChevronLeftIcon } from '../../components/Icons';
const STAGES = [
    { label: 'Booking', done: true, time: '9:12 AM' },
    { label: 'Token', done: true, time: '9:15 AM' },
    { label: 'Waiting', done: true, time: '11:00 AM' },
    { label: 'Quality Check', active: true },
    { label: 'Weighing', done: false },
    { label: 'Completed', done: false },
    { label: 'Payment', done: false },
];
export default function Tracking() {
    const navigate = useNavigate();
    return (_jsxs("div", { className: "min-h-full pb-8", children: [_jsxs("div", { className: "bg-white border-b border-[#dde4d7] px-5 pt-14 pb-5", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center gap-1 text-[#6b7563] mb-4", children: [_jsx(ChevronLeftIcon, { size: 20 }), _jsx("span", { className: "text-sm font-[500]", children: "Back" })] }), _jsx("h1", { className: "text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]", children: "Procurement status" }), _jsx("p", { className: "text-[13px] text-[#6b7563] mt-1", children: "Token KSN-1042 \u00B7 10 Sep 2026" })] }), _jsxs("div", { className: "px-5 pt-6 flex flex-col gap-5", children: [_jsxs("div", { className: "bg-[#ea7c0d] rounded-2xl p-5 text-center", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-2xl", children: "\uD83D\uDD2C" }) }), _jsx("p", { className: "text-[20px] font-[700] text-white", children: "Quality verification" }), _jsx("p", { className: "text-[14px] text-white/80 mt-1.5", children: "Your produce is currently being checked." })] }), _jsxs("div", { className: "bg-white rounded-2xl p-5 border border-[#dde4d7]", children: [_jsx("p", { className: "text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-5", children: "Progress" }), _jsx("div", { className: "flex flex-col", children: STAGES.map((stage, i) => (_jsxs("div", { className: "flex items-start gap-4", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-[700] shrink-0 ${stage.done
                                                        ? 'bg-[#1e5c33] text-white'
                                                        : stage.active
                                                            ? 'bg-[#ea7c0d] text-white ring-4 ring-orange-100'
                                                            : 'bg-[#f4f6f2] text-[#b0bba8] border border-[#dde4d7]'}`, children: stage.done ? '✓' : stage.active ? '●' : i + 1 }), i < STAGES.length - 1 && (_jsx("div", { className: `w-0.5 h-8 mt-1 ${stage.done ? 'bg-[#1e5c33]' : 'bg-[#dde4d7]'}` }))] }), _jsxs("div", { className: `pb-8 flex-1 flex items-center justify-between ${i === STAGES.length - 1 ? 'pb-0' : ''}`, children: [_jsx("p", { className: `text-[14px] ${stage.active ? 'font-[700] text-[#181d14]' : stage.done ? 'font-[500] text-[#6b7563]' : 'font-[400] text-[#b0bba8]'}`, children: stage.label }), stage.time && _jsx("p", { className: "text-[11px] text-[#6b7563]", children: stage.time }), stage.active && (_jsx("span", { className: "text-[11px] font-[600] text-[#ea7c0d]", children: "In progress" }))] })] }, stage.label))) })] }), _jsxs("div", { className: "bg-[#e6f3eb] rounded-2xl p-4 flex gap-3", children: [_jsx("span", { className: "text-xl", children: "\u2139\uFE0F" }), _jsx("p", { className: "text-[13px] text-[#1e5c33] leading-relaxed", children: "Quality verification typically takes 15\u201320 minutes. You will be notified when weighing begins." })] }), _jsx("button", { onClick: () => navigate('/farmer/payment'), className: "w-full h-[54px] rounded-2xl bg-[#1e5c33] text-white text-[16px] font-[600] hover:bg-[#16432a] transition-colors", children: "View Payment Details" })] })] }));
}
