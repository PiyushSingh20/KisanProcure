import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router';
import { ChevronRightIcon } from '../../components/Icons';
import { useLanguage } from '../../context/LanguageContext';
const MENU = [
    { emoji: '🌾', label: 'My Produce', path: '' },
    { emoji: '📋', label: 'My History', path: '/farmer/history' },
    { emoji: '📄', label: 'Documents', path: '' },
    { emoji: '🌐', label: 'Language', path: '', action: 'lang' },
    { emoji: '🔔', label: 'Notifications', path: '/farmer/notifications' },
    { emoji: '❓', label: 'Help & Support', path: '' },
    { emoji: '⚙️', label: 'Settings', path: '' },
];
export default function FarmerProfile() {
    const navigate = useNavigate();
    const { lang, setLang, t } = useLanguage();
    return (_jsxs("div", { className: "min-h-full pb-6", children: [_jsx("div", { className: "bg-white border-b border-[#dde4d7] px-5 pt-14 pb-5", children: _jsx("h1", { className: "text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]", children: t.profile }) }), _jsxs("div", { className: "px-5 pt-5 flex flex-col gap-5", children: [_jsxs("div", { className: "bg-white rounded-2xl p-5 border border-[#dde4d7] flex items-center gap-4", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-[#1e5c33] flex items-center justify-center text-white text-[24px] font-[700] shrink-0", children: "P" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-[18px] font-[700] text-[#181d14]", children: "Piyush Kumar" }), _jsx("p", { className: "text-[14px] text-[#6b7563] mt-0.5", children: "+91 98765 43210" }), _jsx("p", { className: "text-[13px] text-[#6b7563]", children: "ID: KP-UP-240891" })] }), _jsx("button", { className: "px-3 py-1.5 rounded-xl border border-[#dde4d7] text-[13px] font-[500] text-[#6b7563]", children: "Edit" })] }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: [
                            { label: 'Bookings', value: '12' },
                            { label: 'Completed', value: '11' },
                            { label: 'Total', value: '₹1.2L' },
                        ].map(({ label, value }) => (_jsxs("div", { className: "bg-white rounded-2xl p-4 border border-[#dde4d7] text-center", children: [_jsx("p", { className: "text-[20px] font-[700] text-[#1e5c33]", children: value }), _jsx("p", { className: "text-[11px] text-[#6b7563] mt-0.5", children: label })] }, label))) }), _jsxs("div", { className: "bg-white rounded-2xl p-4 border border-[#dde4d7]", children: [_jsx("p", { className: "text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-3", children: t.language }), _jsx("div", { className: "flex gap-2", children: ['en', 'hi'].map((l) => (_jsx("button", { onClick: () => setLang(l), className: `flex-1 py-2.5 rounded-xl text-[14px] font-[600] transition-colors ${lang === l ? 'bg-[#1e5c33] text-white' : 'bg-[#f4f6f2] text-[#6b7563]'}`, children: l === 'en' ? 'English' : 'हिन्दी' }, l))) })] }), _jsx("div", { className: "bg-white rounded-2xl border border-[#dde4d7] overflow-hidden", children: MENU.filter((m) => m.action !== 'lang').map((item, i) => (_jsxs("button", { onClick: () => item.path && navigate(item.path), className: `w-full flex items-center gap-4 px-5 py-4 hover:bg-[#f4f6f2] transition-colors text-left ${i < MENU.filter((m) => m.action !== 'lang').length - 1 ? 'border-b border-[#dde4d7]' : ''}`, children: [_jsx("span", { className: "text-xl w-7 text-center", children: item.emoji }), _jsx("p", { className: "flex-1 text-[15px] font-[500] text-[#181d14]", children: item.label }), _jsx(ChevronRightIcon, { size: 18, className: "text-[#b0bba8]" })] }, item.label))) }), _jsx("button", { onClick: () => navigate('/login'), className: "w-full h-[50px] rounded-2xl border border-[#dc2626]/30 text-[#dc2626] text-[15px] font-[600] hover:bg-red-50 transition-colors", children: "Sign out" })] })] }));
}
