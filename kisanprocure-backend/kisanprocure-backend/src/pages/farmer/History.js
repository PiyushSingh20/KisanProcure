import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRightIcon } from '../../components/Icons';
const FILTERS = ['All', 'Completed', 'Pending', 'Cancelled'];
const BOOKINGS = [
    { id: 1, crop: 'Wheat', qty: '520 kg', date: '10 Sep 2026', center: 'Lucknow Grain Center', status: 'Completed', amount: '₹15,600' },
    { id: 2, crop: 'Rice', qty: '320 kg', date: '24 Aug 2026', center: 'Kanpur Wheat Center', status: 'Completed', amount: '₹9,600' },
    { id: 3, crop: 'Maize', qty: '200 kg', date: '10 Aug 2026', center: 'Unnao Procurement Hub', status: 'Cancelled', amount: '—' },
    { id: 4, crop: 'Wheat', qty: '480 kg', date: '15 Jul 2026', center: 'Lucknow Grain Center', status: 'Completed', amount: '₹14,400' },
];
const STATUS_STYLE = {
    Completed: 'text-[#16a34a] bg-green-50',
    Pending: 'text-[#ea7c0d] bg-orange-50',
    Cancelled: 'text-[#dc2626] bg-red-50',
};
export default function History() {
    const navigate = useNavigate();
    const [active, setActive] = useState('All');
    const filtered = active === 'All' ? BOOKINGS : BOOKINGS.filter((b) => b.status === active);
    return (_jsxs("div", { className: "min-h-full pb-6", children: [_jsxs("div", { className: "bg-white border-b border-[#dde4d7] px-5 pt-14 pb-4", children: [_jsx("h1", { className: "text-[24px] font-[700] tracking-[-0.5px] text-[#181d14] mb-4", children: "Booking history" }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-1", children: FILTERS.map((f) => (_jsx("button", { onClick: () => setActive(f), className: `shrink-0 px-4 py-1.5 rounded-full text-[13px] font-[500] transition-colors ${active === f ? 'bg-[#1e5c33] text-white' : 'bg-[#f4f6f2] text-[#6b7563] border border-[#dde4d7]'}`, children: f }, f))) })] }), _jsx("div", { className: "px-5 pt-4 flex flex-col gap-3", children: filtered.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center", children: [_jsx("p", { className: "text-4xl mb-3", children: "\uD83D\uDCCB" }), _jsxs("p", { className: "text-[16px] font-[600] text-[#181d14]", children: ["No ", active.toLowerCase(), " bookings"] }), _jsx("p", { className: "text-[14px] text-[#6b7563] mt-1", children: "Your booking history will appear here" })] })) : (filtered.map((b) => (_jsxs("div", { className: "bg-white rounded-2xl p-5 border border-[#dde4d7]", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [_jsx("p", { className: "text-[16px] font-[600] text-[#181d14]", children: b.crop }), _jsxs("span", { className: "text-[12px] text-[#6b7563]", children: ["\u00B7 ", b.qty] })] }), _jsx("p", { className: "text-[13px] text-[#6b7563]", children: b.center }), _jsx("p", { className: "text-[12px] text-[#6b7563] mt-0.5", children: b.date })] }), _jsx("span", { className: `text-[12px] font-[600] px-2.5 py-1 rounded-full ${STATUS_STYLE[b.status]}`, children: b.status })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-[20px] font-[700] text-[#181d14]", children: b.amount }), b.status === 'Completed' && (_jsxs("button", { onClick: () => navigate('/farmer/receipt'), className: "flex items-center gap-1 text-[#1e5c33] text-[13px] font-[600]", children: ["Receipt ", _jsx(ArrowRightIcon, { size: 14 })] }))] })] }, b.id)))) })] }));
}
