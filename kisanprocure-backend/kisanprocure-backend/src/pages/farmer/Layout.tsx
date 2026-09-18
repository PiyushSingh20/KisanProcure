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

  const isActive = (path: string) => pathname === path || (path === '/farmer/home' && pathname === '/farmer');

  return (
    <div className="h-full flex flex-col bg-[#f4f6f2]">
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-sm mx-auto min-h-full">
          <Outlet />
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 bg-white border-t border-[#dde4d7]">
        <div className="max-w-sm mx-auto flex">
          {NAV.map(({ label, path, Icon }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
              >
                <Icon
                  size={22}
                  className={`transition-colors ${active ? 'text-[#1e5c33]' : 'text-[#6b7563]'}`}
                />
                <span
                  className={`text-[11px] font-[500] capitalize transition-colors ${
                    active ? 'text-[#1e5c33]' : 'text-[#6b7563]'
                  }`}
                >
                  {t[label as keyof typeof t] as string}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}
