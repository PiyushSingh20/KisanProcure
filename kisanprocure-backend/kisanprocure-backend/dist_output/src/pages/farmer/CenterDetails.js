import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router';
import { ChevronLeftIcon } from '../../components/Icons';
const SCHEDULE = [
    { time: '9:00 AM', status: 'Available', color: 'green' },
    { time: '11:30 AM', status: 'Available', color: 'green' },
    { time: '2:00 PM', status: 'Limited', color: 'orange' },
    { time: '4:00 PM', status: 'Full', color: 'red' },
];
const STATUS_STYLE = {
    green: 'bg-green-50 text-[#16a34a]',
    orange: 'bg-orange-50 text-[#ea7c0d]',
    red: 'bg-red-50 text-[#dc2626]',
};
export default function CenterDetails() {
    const navigate = useNavigate();
    return (_jsxs("div", { className: "min-h-full pb-32", children: [_jsxs("div", { className: "relative h-44 bg-[#1e5c33] overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 opacity-20", children: _jsx("div", { className: "absolute inset-0", style: { backgroundImage: 'radial-gradient(circle at 30% 50%, #4ade80 0%, transparent 60%)' } }) }), _jsx("button", { onClick: () => navigate(-1), className: "absolute top-14 left-5 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors", children: _jsx(ChevronLeftIcon, { size: 20 }) }), _jsxs("div", { className: "absolute bottom-5 left-5", children: [_jsx("p", { className: "text-[22px] font-[700] text-white tracking-[-0.4px]", children: "Lucknow Grain Center" }), _jsx("p", { className: "text-[13px] text-[#a8d4b8] mt-0.5", children: "Open \u00B7 Closes 6:00 PM" })] })] }), _jsxs("div", { className: "px-5 pt-5 flex flex-col gap-5", children: [_jsx("div", { className: "grid grid-cols-3 gap-3", children: [
                            { label: 'Queue', value: '12' },
                            { label: 'Wait', value: '42 min' },
                            { label: 'Slots', value: '18' },
                        ].map(({ label, value }) => (_jsxs("div", { className: "bg-white rounded-2xl p-4 border border-[#dde4d7] text-center", children: [_jsx("p", { className: "text-[22px] font-[700] text-[#181d14]", children: value }), _jsx("p", { className: "text-[12px] text-[#6b7563] mt-0.5", children: label })] }, label))) }), _jsxs("div", { className: "bg-white rounded-2xl p-5 border border-[#dde4d7]", children: [_jsx("p", { className: "text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-3", children: "Accepted crops" }), _jsx("div", { className: "flex gap-2 flex-wrap", children: ['Wheat 🌾', 'Rice 🌾', 'Maize 🌽'].map((crop) => (_jsx("span", { className: "px-3 py-1.5 bg-[#e6f3eb] text-[#1e5c33] text-[13px] font-[500] rounded-full", children: crop }, crop))) })] }), _jsxs("div", { className: "bg-white rounded-2xl p-5 border border-[#dde4d7]", children: [_jsx("p", { className: "text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-3", children: "Today's schedule" }), _jsx("div", { className: "flex flex-col gap-2", children: SCHEDULE.map(({ time, status, color }) => (_jsxs("div", { className: "flex items-center justify-between py-2.5 border-b border-[#dde4d7] last:border-0", children: [_jsx("p", { className: "text-[15px] font-[600] text-[#181d14]", children: time }), _jsx("span", { className: `text-[12px] font-[600] px-3 py-1 rounded-full ${STATUS_STYLE[color]}`, children: status })] }, time))) })] }), _jsx("div", { className: "rounded-2xl overflow-hidden border border-[#dde4d7] bg-[#e6f3eb] h-36 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-2xl", children: "\uD83D\uDCCD" }), _jsx("p", { className: "text-[12px] text-[#6b7563] mt-1", children: "2.4 km from your location" })] }) })] }), _jsx("div", { className: "fixed bottom-[70px] left-0 right-0 px-5 pb-4 bg-gradient-to-t from-[#f4f6f2] to-transparent pt-6", children: _jsx("div", { className: "max-w-sm mx-auto", children: _jsx("button", { onClick: () => navigate('/farmer/book'), className: "w-full h-[54px] rounded-2xl bg-[#1e5c33] text-white text-[16px] font-[600] hover:bg-[#16432a] transition-colors active:scale-[0.98]", children: "Book a Slot" }) }) })] }));
}
