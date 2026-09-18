import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SearchIcon } from '../../components/Icons';
const FILTERS = ['Nearby', 'Available', 'Less Waiting', 'Open Now'];
const CENTERS = [
    {
        id: '1',
        name: 'Lucknow Grain Procurement Center',
        dist: '2.4 km',
        status: 'Available',
        queue: 12,
        wait: '42 min',
        slots: 18,
        statusColor: 'green',
    },
    {
        id: '2',
        name: 'Kanpur Wheat Center',
        dist: '5.1 km',
        status: 'Busy',
        queue: 34,
        wait: '1h 20 min',
        slots: 4,
        statusColor: 'orange',
    },
    {
        id: '3',
        name: 'Unnao Procurement Hub',
        dist: '8.7 km',
        status: 'Available',
        queue: 6,
        wait: '18 min',
        slots: 22,
        statusColor: 'green',
    },
    {
        id: '4',
        name: 'Sitapur Mandi Center',
        dist: '14.2 km',
        status: 'Closed',
        queue: 0,
        wait: '—',
        slots: 0,
        statusColor: 'red',
    },
];
const statusColors = {
    green: { dot: 'bg-[#16a34a]', text: 'text-[#16a34a]', bg: 'bg-green-50' },
    orange: { dot: 'bg-[#ea7c0d]', text: 'text-[#ea7c0d]', bg: 'bg-orange-50' },
    red: { dot: 'bg-[#dc2626]', text: 'text-[#dc2626]', bg: 'bg-red-50' },
};
export default function Centers() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Nearby');
    const [view, setView] = useState('list');
    const filtered = CENTERS.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    return (_jsxs("div", { className: "min-h-full pb-6", children: [_jsxs("div", { className: "bg-white border-b border-[#dde4d7] px-5 pt-14 pb-4", children: [_jsx("h1", { className: "text-[24px] font-[700] tracking-[-0.5px] text-[#181d14] mb-4", children: "Find a center" }), _jsxs("div", { className: "flex items-center gap-3 bg-[#f4f6f2] rounded-2xl px-4 h-12 border border-[#dde4d7]", children: [_jsx(SearchIcon, { size: 18, className: "text-[#6b7563] shrink-0" }), _jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search procurement centers", className: "flex-1 bg-transparent text-[14px] text-[#181d14] placeholder:text-[#6b7563] outline-none" })] }), _jsx("div", { className: "flex gap-2 mt-3 overflow-x-auto pb-1", children: FILTERS.map((f) => (_jsx("button", { onClick: () => setActiveFilter(f), className: `shrink-0 px-4 py-1.5 rounded-full text-[13px] font-[500] transition-colors ${activeFilter === f
                                ? 'bg-[#1e5c33] text-white'
                                : 'bg-[#f4f6f2] text-[#6b7563] border border-[#dde4d7]'}`, children: f }, f))) }), _jsx("div", { className: "flex mt-3 bg-[#f4f6f2] rounded-xl p-1", children: ['list', 'map'].map((v) => (_jsx("button", { onClick: () => setView(v), className: `flex-1 py-1.5 rounded-lg text-[13px] font-[600] capitalize transition-colors ${view === v ? 'bg-white text-[#181d14] shadow-sm' : 'text-[#6b7563]'}`, children: v }, v))) })] }), _jsx("div", { className: "px-5 pt-4", children: view === 'map' ? (_jsx("div", { className: "rounded-2xl overflow-hidden border border-[#dde4d7] bg-[#e6f3eb] h-64 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-4xl mb-2", children: "\uD83D\uDDFA" }), _jsx("p", { className: "text-[14px] text-[#6b7563] font-[500]", children: "Map view" }), _jsx("p", { className: "text-[12px] text-[#6b7563]", children: "4 centers nearby" })] }) })) : (_jsx("div", { className: "flex flex-col gap-3", children: filtered.map((center) => {
                        const sc = statusColors[center.statusColor];
                        return (_jsxs("div", { className: "bg-white rounded-2xl p-5 border border-[#dde4d7]", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-[15px] font-[600] text-[#181d14] leading-tight", children: center.name }), _jsx("p", { className: "text-[13px] text-[#6b7563] mt-0.5", children: center.dist })] }), _jsxs("span", { className: `inline-flex items-center gap-1.5 text-[12px] font-[600] px-2.5 py-1 rounded-full ml-3 ${sc.text} ${sc.bg}`, children: [_jsx("div", { className: `w-1.5 h-1.5 rounded-full ${sc.dot}` }), center.status] })] }), _jsx("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [
                                        { label: 'Queue', value: `${center.queue}` },
                                        { label: 'Wait', value: center.wait },
                                        { label: 'Slots', value: `${center.slots}` },
                                    ].map(({ label, value }) => (_jsxs("div", { className: "bg-[#f4f6f2] rounded-xl p-2.5 text-center", children: [_jsx("p", { className: "text-[18px] font-[700] text-[#181d14]", children: value }), _jsx("p", { className: "text-[11px] text-[#6b7563]", children: label })] }, label))) }), _jsx("button", { onClick: () => navigate(`/farmer/centers/${center.id}`), disabled: center.statusColor === 'red', className: "w-full h-[42px] rounded-xl border border-[#1e5c33] text-[#1e5c33] text-[14px] font-[600] hover:bg-[#e6f3eb] transition-colors disabled:opacity-40 disabled:cursor-not-allowed", children: "View Center" })] }, center.id));
                    }) })) })] }));
}
