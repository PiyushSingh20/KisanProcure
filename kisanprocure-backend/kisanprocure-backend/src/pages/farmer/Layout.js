import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, useNavigate, useLocation } from 'react-router';
import AIAssistant from '../../components/AIAssistant';
import { HomeIcon, MapPinIcon, CalendarIcon, UserIcon } from '../../components/Icons';
import { useLanguage } from '../../context/LanguageContext';
const NAV = [
    { label: 'home', path: '/farmer/home', Icon: HomeIcon },
    { label: 'centers', path: '/farmer/centers', Icon: MapPinIcon },
    { label: 'bookings', path: '/farmer/history', Icon: CalendarIcon },
    { label: 'profile', path: '/farmer/profile', Icon: UserIcon },
];
export default function FarmerLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t } = useLanguage();
    const isActive = (path) => pathname === path || (path === '/farmer/home' && pathname === '/farmer');
    return (_jsxs("div", { className: "h-full flex flex-col bg-[#f4f6f2]", children: [_jsx("div", { className: "flex-1 overflow-y-auto", children: _jsx("div", { className: "max-w-sm mx-auto min-h-full", children: _jsx(Outlet, {}) }) }), _jsx("div", { className: "shrink-0 bg-white border-t border-[#dde4d7]", children: _jsx("div", { className: "max-w-sm mx-auto flex", children: NAV.map(({ label, path, Icon }) => {
                        const active = isActive(path);
                        return (_jsxs("button", { onClick: () => navigate(path), className: "flex-1 flex flex-col items-center gap-1 py-3 transition-colors", children: [_jsx(Icon, { size: 22, className: `transition-colors ${active ? 'text-[#1e5c33]' : 'text-[#6b7563]'}` }), _jsx("span", { className: `text-[11px] font-[500] capitalize transition-colors ${active ? 'text-[#1e5c33]' : 'text-[#6b7563]'}`, children: t[label] })] }, path));
                    }) }) }), _jsx(AIAssistant, {})] }));
}
