import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router';
const QUEUE = [
    { token: 'KSN-1034', farmer: 'Ramesh Yadav', crop: 'Wheat', status: 'Processing', statusColor: 'orange' },
    { token: 'KSN-1035', farmer: 'Sunil Verma', crop: 'Rice', status: 'Waiting', statusColor: 'blue' },
    { token: 'KSN-1036', farmer: 'Mohan Gupta', crop: 'Wheat', status: 'Waiting', statusColor: 'blue' },
    { token: 'KSN-1037', farmer: 'Ravi Sharma', crop: 'Maize', status: 'Waiting', statusColor: 'blue' },
    { token: 'KSN-1038', farmer: 'Ajay Mishra', crop: 'Wheat', status: 'Waiting', statusColor: 'blue' },
];
const STATUS_STYLE = {
    orange: 'bg-orange-50 text-[#ea7c0d]',
    blue: 'bg-blue-50 text-[#2563eb]',
    green: 'bg-green-50 text-[#16a34a]',
};
export default function OfficerDashboard() {
    const navigate = useNavigate();
    const [called, setCalled] = useState(0);
    const callNext = () => setCalled((c) => Math.min(c + 1, QUEUE.length - 1));
    return (_jsxs("div", { className: "min-h-full bg-[#f4f6f2] max-w-sm mx-auto", children: [_jsx("div", { className: "bg-[#1e5c33] px-5 pt-14 pb-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[14px] text-[#a8d4b8]", children: "Good morning" }), _jsx("h1", { className: "text-[26px] font-[700] tracking-[-0.5px] text-white mt-0.5", children: "Officer Rajesh" }), _jsx("p", { className: "text-[13px] text-[#a8d4b8] mt-1", children: "Lucknow Grain Procurement Center" })] }), _jsx("button", { onClick: () => navigate('/'), className: "px-3 py-1.5 rounded-xl bg-white/20 text-white text-[13px] font-[500]", children: "Switch" })] }) }), _jsxs("div", { className: "px-5 pt-5 pb-8 flex flex-col gap-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-3", children: "Today's overview" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: [
                                    { label: 'Total Farmers', value: '128', color: '#181d14' },
                                    { label: 'Waiting', value: '42', color: '#ea7c0d' },
                                    { label: 'Completed', value: '86', color: '#16a34a' },
                                    { label: 'Procured', value: '1,420 kg', color: '#2563eb' },
                                ].map(({ label, value, color }) => (_jsxs("div", { className: "bg-white rounded-2xl p-4 border border-[#dde4d7]", children: [_jsx("p", { className: "text-[28px] font-[700] tracking-[-1px]", style: { color }, children: value }), _jsx("p", { className: "text-[12px] text-[#6b7563] mt-0.5", children: label })] }, label))) })] }), _jsxs("button", { onClick: callNext, className: "w-full h-[60px] rounded-2xl bg-[#1e5c33] text-white text-[17px] font-[700] hover:bg-[#16432a] transition-colors active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg", children: [_jsx("span", { className: "text-xl", children: "\uD83D\uDCE3" }), "Call Next Farmer"] }), _jsxs("div", { className: "bg-white rounded-2xl p-5 border border-[#dde4d7]", children: [_jsx("p", { className: "text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-3", children: "Currently serving" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center", children: _jsx("p", { className: "text-[18px] font-[700] text-[#1e5c33]", children: QUEUE[called].token.split('-')[1] }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[17px] font-[700] text-[#181d14]", children: QUEUE[called].token }), _jsx("p", { className: "text-[14px] text-[#6b7563]", children: QUEUE[called].farmer }), _jsx("p", { className: "text-[13px] text-[#6b7563]", children: QUEUE[called].crop })] })] }), _jsx("div", { className: "mt-3 flex gap-2", children: ['Start Processing', 'Complete'].map((action, i) => (_jsx("button", { className: `flex-1 py-2.5 rounded-xl text-[13px] font-[600] transition-colors ${i === 0
                                        ? 'bg-[#ea7c0d] text-white hover:bg-orange-600'
                                        : 'bg-[#1e5c33] text-white hover:bg-[#16432a]'}`, children: action }, action))) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-3", children: "Live queue" }), _jsx("div", { className: "flex flex-col gap-2", children: QUEUE.map((item, i) => (_jsxs("div", { className: `bg-white rounded-2xl p-4 border flex items-center gap-3 ${i === called ? 'border-[#1e5c33]' : 'border-[#dde4d7]'}`, children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-[#f4f6f2] flex items-center justify-center", children: _jsxs("p", { className: "text-[12px] font-[700] text-[#6b7563]", children: ["#", i + 1] }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-[14px] font-[600] text-[#181d14]", children: item.token }), _jsxs("p", { className: "text-[12px] text-[#6b7563]", children: [item.farmer, " \u00B7 ", item.crop] })] }), _jsx("span", { className: `text-[11px] font-[600] px-2.5 py-1 rounded-full ${STATUS_STYLE[i === called ? 'orange' : item.statusColor]}`, children: i === called ? 'Processing' : item.status })] }, item.token))) })] })] })] }));
}
