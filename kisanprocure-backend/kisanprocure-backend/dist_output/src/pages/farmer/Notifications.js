import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router';
import { ChevronLeftIcon } from '../../components/Icons';
const NOTIFS = [
    {
        group: 'Today',
        items: [
            { emoji: '🎟', title: 'Your token KSN-1042 is approaching.', time: '11:05 AM', unread: true },
            { emoji: '📊', title: 'Only 3 farmers are ahead of you.', time: '11:20 AM', unread: true },
        ],
    },
    {
        group: 'Yesterday',
        items: [
            { emoji: '✅', title: 'Your booking has been confirmed.', time: '9:15 AM', unread: false },
            { emoji: '💰', title: 'Payment of ₹15,600 is being processed.', time: '4:30 PM', unread: false },
        ],
    },
    {
        group: 'Earlier',
        items: [
            { emoji: '📅', title: "Tomorrow's schedule has changed. New slots available.", time: '8 Sep', unread: false },
            { emoji: '🔔', title: 'Your procurement has been completed.', time: '7 Sep', unread: false },
        ],
    },
];
export default function Notifications() {
    const navigate = useNavigate();
    return (_jsxs("div", { className: "min-h-full pb-6", children: [_jsxs("div", { className: "bg-white border-b border-[#dde4d7] px-5 pt-14 pb-5", children: [_jsxs("button", { onClick: () => navigate(-1), className: "flex items-center gap-1 text-[#6b7563] mb-4", children: [_jsx(ChevronLeftIcon, { size: 20 }), _jsx("span", { className: "text-sm font-[500]", children: "Back" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]", children: "Notifications" }), _jsx("button", { className: "text-sm text-[#1e5c33] font-[600]", children: "Mark all read" })] })] }), _jsx("div", { className: "px-5 pt-4 flex flex-col gap-6", children: NOTIFS.map((group) => (_jsxs("div", { children: [_jsx("p", { className: "text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-2", children: group.group }), _jsx("div", { className: "flex flex-col gap-2", children: group.items.map((n, i) => (_jsxs("div", { className: `flex gap-3 p-4 rounded-2xl border ${n.unread ? 'bg-[#e6f3eb] border-[#1e5c33]/20' : 'bg-white border-[#dde4d7]'}`, children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-[#dde4d7] text-lg", children: n.emoji }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: `text-[14px] leading-snug ${n.unread ? 'font-[600] text-[#181d14]' : 'font-[400] text-[#181d14]'}`, children: n.title }), _jsx("p", { className: "text-[12px] text-[#6b7563] mt-1", children: n.time })] }), n.unread && _jsx("div", { className: "w-2 h-2 rounded-full bg-[#1e5c33] mt-1.5 shrink-0" })] }, i))) })] }, group.group))) })] }));
}
