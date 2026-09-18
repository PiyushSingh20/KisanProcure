import { Outlet, useNavigate, useLocation } from 'react-router';
import { useState } from 'react';

const NAV = [
  { label: 'Dashboard', emoji: '📊', path: '/admin' },
  { label: 'Centers', emoji: '🏢', path: '' },
  { label: 'Farmers', emoji: '👨‍🌾', path: '' },
  { label: 'Officers', emoji: '👮', path: '' },
  { label: 'Schedules', emoji: '📅', path: '' },
  { label: 'Procurement', emoji: '🌾', path: '' },
  { label: 'Payments', emoji: '💰', path: '' },
  { label: 'Complaints', emoji: '📣', path: '' },
  { label: 'Analytics', emoji: '📈', path: '/admin/analytics' },
  { label: 'Settings', emoji: '⚙️', path: '' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-full flex bg-[#f4f6f2]">
      {/* Sidebar */}
      <aside
        className={`shrink-0 bg-white border-r border-[#dde4d7] flex flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-52'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-[#dde4d7] ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-[#1e5c33] flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
              <path d="M22 8C22 8 10 16 10 28a12 12 0 0024 0C34 16 22 8 22 8z" fill="white" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <p className="text-[13px] font-[700] text-[#181d14]">KisanProcure</p>
              <p className="text-[10px] text-[#6b7563]">Admin Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(({ label, emoji, path }) => {
            const active = (path === '/admin' && pathname === '/admin') || (path !== '/admin' && path && pathname.startsWith(path));
            return (
              <button
                key={label}
                onClick={() => path && navigate(path)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  active ? 'bg-[#e6f3eb] text-[#1e5c33]' : 'text-[#6b7563] hover:bg-[#f4f6f2] hover:text-[#181d14]'
                } ${!path ? 'opacity-50 cursor-not-allowed' : ''} ${collapsed ? 'justify-center' : ''}`}
              >
                <span className="text-base shrink-0">{emoji}</span>
                {!collapsed && <span className="text-[13px] font-[500]">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="m-3 py-2 rounded-xl border border-[#dde4d7] text-[12px] text-[#6b7563] hover:bg-[#f4f6f2] transition-colors"
        >
          {collapsed ? '→' : '← Collapse'}
        </button>

        {/* Role switch */}
        <div className={`px-4 pb-4 ${collapsed ? 'hidden' : ''}`}>
          <button
            onClick={() => navigate('/')}
            className="w-full text-[12px] text-[#6b7563] text-center py-2"
          >
            Switch role ↗
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
