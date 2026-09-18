import { useState, useEffect } from 'react';
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

  // Desktop view mode: 'phone' (Android preview frame) or 'web' (Responsive website view)
  const [viewMode, setViewMode] = useState<'phone' | 'web'>('phone');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  // Listen for PWA beforeinstallprompt on Android/Chrome
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setInstallPrompt(null);
    });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert('To install on Android: Tap the 3 dots in your Chrome browser menu and select "Install app" or "Add to Home screen".');
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setInstallPrompt(null);
  };

  const isActive = (path: string) => pathname === path || (path === '/farmer/home' && pathname === '/farmer');

  return (
    <div className="h-full flex flex-col bg-[#e9eee6] md:p-4 overflow-x-hidden">
      {/* Desktop Top Control Bar (Visible only on medium/large desktop screens) */}
      <header className="hidden md:flex items-center justify-between max-w-5xl w-full mx-auto mb-3 px-4 py-2.5 bg-white/90 backdrop-blur rounded-2xl border border-[#dde4d7] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1e5c33] flex items-center justify-center text-white font-bold text-sm">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-[700] text-[15px] text-[#181d14]">KisanProcure</span>
              <span className="text-[10px] uppercase font-[700] bg-[#e6f3eb] text-[#1e5c33] px-2 py-0.5 rounded-full">
                Web & Android
              </span>
            </div>
            <p className="text-[11px] text-[#6b7563]">Smart Agricultural Mandi Procurement Portal</p>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Android PWA Install button */}
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e5c33] text-white text-xs font-[600] hover:bg-[#16432a] transition-all"
            title="Install KisanProcure on Android"
          >
            <span>📱 Install Android App</span>
          </button>

          {/* View Mode Toggle: Phone Frame vs Full Web */}
          <div className="flex bg-[#f4f6f2] rounded-xl p-1 border border-[#dde4d7]">
            <button
              onClick={() => setViewMode('phone')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-[600] transition-all ${
                viewMode === 'phone' ? 'bg-white text-[#1e5c33] shadow-sm' : 'text-[#6b7563]'
              }`}
            >
              <span>📱 Android Frame</span>
            </button>
            <button
              onClick={() => setViewMode('web')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-[600] transition-all ${
                viewMode === 'web' ? 'bg-white text-[#1e5c33] shadow-sm' : 'text-[#6b7563]'
              }`}
            >
              <span>💻 Website View</span>
            </button>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center gap-1 border-l border-[#dde4d7] pl-2.5">
            <button
              onClick={() => navigate('/officer')}
              className="px-2.5 py-1 text-xs font-[500] text-[#6b7563] hover:text-[#181d14] hover:bg-[#f4f6f2] rounded-lg transition-colors"
            >
              Officer ↗
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="px-2.5 py-1 text-xs font-[500] text-[#6b7563] hover:text-[#181d14] hover:bg-[#f4f6f2] rounded-lg transition-colors"
            >
              Admin ↗
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex justify-center items-center overflow-hidden w-full">
        <div
          className={`h-full flex flex-col bg-[#f4f6f2] transition-all duration-300 w-full ${
            viewMode === 'phone'
              ? 'md:w-[390px] md:h-[844px] md:rounded-[44px] md:border-[10px] md:border-[#1e231b] md:shadow-2xl md:relative md:overflow-hidden'
              : 'max-w-3xl md:rounded-3xl md:border md:border-[#dde4d7] md:shadow-lg md:overflow-hidden'
          }`}
        >
          {/* Android Phone Status Bar Mock (Visible only in Phone Mode on Desktop) */}
          {viewMode === 'phone' && (
            <div className="hidden md:flex items-center justify-between px-7 pt-2.5 pb-1 bg-white border-b border-[#dde4d7]/40 text-[11px] font-[600] text-[#181d14] select-none shrink-0">
              <span>11:30</span>
              {/* Android Punch Hole Camera */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#181d14]" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>📶</span>
                <span>94%</span>
              </div>
            </div>
          )}

          {/* Mobile Install App Announcement Banner */}
          {installPrompt && !installed && (
            <div className="bg-[#1e5c33] text-white px-4 py-2 flex items-center justify-between text-xs shrink-0 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span>🌾</span>
                <span className="font-[500]">Get the Android App for live queue notifications!</span>
              </div>
              <button
                onClick={handleInstallClick}
                className="bg-white text-[#1e5c33] px-2.5 py-1 rounded-full font-[700] text-[11px] shadow-sm active:scale-95"
              >
                Install
              </button>
            </div>
          )}

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto overscroll-contain">
            <div className="min-h-full">
              <Outlet />
            </div>
          </main>

          {/* Bottom navigation bar */}
          <nav
            aria-label="Mobile Navigation"
            className="shrink-0 bg-white/95 backdrop-blur border-t border-[#dde4d7] pb-[env(safe-area-inset-bottom)]"
          >
            <div className="flex max-w-md mx-auto">
              {NAV.map(({ label, path, Icon }) => {
                const active = isActive(path);
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all active:scale-95"
                  >
                    <Icon
                      size={22}
                      className={`transition-colors duration-200 ${
                        active ? 'text-[#1e5c33] stroke-[2.2]' : 'text-[#6b7563]'
                      }`}
                    />
                    <span
                      className={`text-[11px] capitalize transition-colors duration-200 ${
                        active ? 'font-[700] text-[#1e5c33]' : 'font-[500] text-[#6b7563]'
                      }`}
                    >
                      {t[label as keyof typeof t] as string}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <AIAssistant />
        </div>
      </div>
    </div>
  );
}
