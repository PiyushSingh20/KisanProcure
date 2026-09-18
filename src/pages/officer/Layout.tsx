import { Outlet, useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';

const NAV = [
  { label: 'Dashboard', emoji: '📊', path: '/officer' },
  { label: 'Live Queue', emoji: '🎫', path: '/officer/queue' },
  { label: 'Procurement Requests', emoji: '🌾', path: '/officer/requests' },
  { label: 'Farmers Directory', emoji: '👨‍🌾', path: '/officer/farmers' },
  { label: 'Schedules & Slots', emoji: '📅', path: '/officer/schedules' },
];

export default function OfficerLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [officerInfo, setOfficerInfo] = useState<{ name: string; center: string } | null>(null);

  useEffect(() => {
    // Check if profile stored or fetch preview
    try {
      const stored = localStorage.getItem('kp_user');
      if (stored) {
        const u = JSON.parse(stored);
        setOfficerInfo({
          name: `${u.firstName || 'Officer'} ${u.lastName || ''}`.trim(),
          center: u.centerName || 'Kisan Procurement Center',
        });
      }
    } catch {
      // fallback
    }
  }, []);

  return (
    <div className="h-screen flex bg-[#f4f6f2] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`shrink-0 bg-white border-r border-[#dde4d7] flex flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Header / Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-[#dde4d7] ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-[#1e5c33] flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-lg">🌾</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[14px] font-[700] text-[#181d14] tracking-tight truncate">KisanProcure</p>
              <p className="text-[11px] text-[#1e5c33] font-[600]">Officer Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
          {NAV.map(({ label, emoji, path }) => {
            const active =
              path === '/officer'
                ? pathname === '/officer'
                : pathname === path || (path !== '/officer' && pathname.startsWith(path));

            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  active
                    ? 'bg-[#e6f3eb] text-[#1e5c33] font-[600] shadow-xs'
                    : 'text-[#566050] hover:bg-[#f8faf7] hover:text-[#181d14] font-[500]'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <span className="text-lg shrink-0">{emoji}</span>
                {!collapsed && <span className="text-[13px] truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Card & Collapse */}
        <div className="p-3 border-t border-[#dde4d7] space-y-2">
          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-[#f8faf7] border border-[#e5ebe0]">
              <p className="text-[11px] font-[600] text-[#788572] uppercase tracking-wider">Active Officer</p>
              <p className="text-[13px] font-[700] text-[#181d14] truncate mt-0.5">
                {officerInfo?.name || 'Officer Rajesh Kumar'}
              </p>
              <p className="text-[11px] text-[#1e5c33] truncate font-[500]">
                {officerInfo?.center || 'Karnal Procurement Center'}
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex-1 py-2 px-2 rounded-xl border border-[#dde4d7] text-[12px] text-[#6b7563] hover:bg-[#f4f6f2] transition-colors flex items-center justify-center gap-1.5"
              title="Toggle sidebar"
            >
              <span>{collapsed ? '→' : '←'}</span>
              {!collapsed && <span>Collapse</span>}
            </button>
            <button
              onClick={() => navigate('/')}
              className="py-2 px-2.5 rounded-xl border border-[#dde4d7] text-[12px] text-[#b91c1c] hover:bg-red-50 hover:border-red-200 transition-colors shrink-0"
              title="Switch portal / Exit"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
