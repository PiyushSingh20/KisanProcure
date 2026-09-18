import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000/api/v1';
function getToken() { return localStorage.getItem('kp_token'); }

async function adminFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch { return null; }
}

interface SystemStats {
  totals: {
    users: number;
    farmers: number;
    officers: number;
    admins: number;
    centers: number;
    crops: number;
    bookings: number;
    tokens: number;
    procurements: number;
    payments: number;
    complaints: number;
  };
  today: {
    bookings: number;
    tokens: number;
    procurements: number;
    payments: number;
  };
}

const DEMO_STATS: SystemStats = {
  totals: { users: 892, farmers: 847, officers: 24, admins: 3, centers: 25, crops: 20, bookings: 1240, tokens: 1190, procurements: 983, payments: 910, complaints: 12 },
  today: { bookings: 42, tokens: 38, procurements: 29, payments: 24 },
};

const CENTERS = [
  { name: 'Lucknow Grain Center', queue: 12, status: 'Active', utilization: 72 },
  { name: 'Kanpur Wheat Center', queue: 34, status: 'Busy', utilization: 95 },
  { name: 'Unnao Hub', queue: 6, status: 'Active', utilization: 40 },
  { name: 'Sitapur Mandi', queue: 0, status: 'Closed', utilization: 0 },
];

const RECENT = [
  { token: 'KSN-1042', farmer: 'Ramesh Yadav', crop: 'Wheat', qty: '380 kg', amount: '₹8,645', status: 'Completed' },
  { token: 'KSN-1041', farmer: 'Sunil Verma', crop: 'Rice', qty: '290 kg', amount: '₹6,670', status: 'Completed' },
  { token: 'KSN-1040', farmer: 'Mohan Gupta', crop: 'Wheat', qty: '520 kg', amount: '₹11,830', status: 'Processing' },
  { token: 'KSN-1039', farmer: 'Ravi Sharma', crop: 'Maize', qty: '200 kg', amount: '₹4,180', status: 'Waiting' },
];

const STATUS_STYLE: Record<string, string> = {
  Completed: 'bg-green-50 text-[#16a34a]',
  Processing: 'bg-orange-50 text-[#ea7c0d]',
  Waiting: 'bg-blue-50 text-[#2563eb]',
  Active: 'bg-green-50 text-[#16a34a]',
  Busy: 'bg-orange-50 text-[#ea7c0d]',
  Closed: 'bg-red-50 text-[#dc2626]',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    adminFetch<SystemStats>('/admins/stats').then(res => {
      if (res) {
        setStats(res);
        setDemoMode(false);
      } else {
        setStats(DEMO_STATS);
        setDemoMode(true);
      }
      setLoading(false);
    });
  }, []);

  const s = stats?.totals;
  const today = stats?.today;

  const KPI_CARDS = [
    { label: 'Registered Farmers', value: loading ? '…' : String(s?.farmers ?? 0), delta: `+${today?.bookings ?? 0} today`, color: '#181d14', emoji: '👨‍🌾' },
    { label: 'Procurement Centers', value: loading ? '…' : String(s?.centers ?? 0), delta: 'total active', color: '#1e5c33', emoji: '🏢' },
    { label: "Today's Procurements", value: loading ? '…' : String(today?.procurements ?? 0), delta: `${s?.procurements ?? 0} all-time`, color: '#16a34a', emoji: '🌾' },
    { label: 'Open Complaints', value: loading ? '…' : String(s?.complaints ?? 0), delta: 'needs attention', color: s?.complaints && s.complaints > 5 ? '#dc2626' : '#181d14', emoji: '📣' },
  ];

  return (
    <div className="p-6 flex flex-col gap-6 min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-[#6b7563]">{greeting()}</p>
          <h1 className="text-[28px] font-[700] tracking-[-0.6px] text-[#181d14]">Admin Dashboard</h1>
          <p className="text-[13px] text-[#6b7563] mt-0.5 flex items-center gap-2">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            {demoMode && <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-[600]">Demo Mode</span>}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/analytics')}
          className="px-4 py-2 rounded-xl bg-[#1e5c33] text-white text-[13px] font-[600] hover:bg-[#16432a] transition-colors"
        >
          📈 Analytics
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, delta, color, emoji }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{emoji}</span>
              <span className="text-[11px] font-[600] px-2 py-0.5 rounded-full bg-[#f4f6f2] text-[#6b7563]">{delta}</span>
            </div>
            <p className="text-[28px] font-[700] tracking-[-1px]" style={{ color }}>{value}</p>
            <p className="text-[12px] text-[#6b7563] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Officers', value: loading ? '…' : String(s?.officers ?? 0), color: '#181d14' },
          { label: 'Total Crops', value: loading ? '…' : String(s?.crops ?? 0), color: '#181d14' },
          { label: "Today's Tokens", value: loading ? '…' : String(today?.tokens ?? 0), color: '#1e5c33' },
          { label: "Today's Payments", value: loading ? '…' : String(today?.payments ?? 0), color: '#1e5c33' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-[#dde4d7]">
            <p className="text-[22px] font-[700] tracking-[-0.5px]" style={{ color }}>{value}</p>
            <p className="text-[11px] text-[#6b7563] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Centers */}
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-[700] text-[#181d14]">Procurement Centers</p>
            <button
              onClick={() => navigate('/admin/centers')}
              className="text-[12px] text-[#1e5c33] font-[600] hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {CENTERS.map((c) => (
              <div key={c.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[13px] font-[600] text-[#181d14]">{c.name}</p>
                    <span className={`text-[11px] font-[600] px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#f4f6f2] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.utilization > 90 ? 'bg-[#ea7c0d]' : 'bg-[#1e5c33]'}`}
                        style={{ width: `${c.utilization}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#6b7563] shrink-0">{c.utilization}%</p>
                    <p className="text-[11px] text-[#6b7563] shrink-0">{c.queue} in queue</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#1e5c33] rounded-2xl p-5 text-center">
            <p className="text-[12px] text-[#a8d4b8] font-[600] uppercase tracking-widest mb-2">Total Farmers</p>
            <p className="text-[48px] font-[700] text-white tracking-[-2px] leading-none">
              {loading ? '…' : s?.farmers ?? 0}
            </p>
            <p className="text-[12px] text-[#a8d4b8] mt-1">registered on platform</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
            <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-2">All-time procurements</p>
            <p className="text-[36px] font-[700] text-[#181d14] tracking-[-1px] leading-none">
              {loading ? '…' : s?.procurements ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
            <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-2">Payments processed</p>
            <p className="text-[36px] font-[700] text-[#181d14] tracking-[-1px] leading-none">
              {loading ? '…' : s?.payments ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Manage Farmers', emoji: '👨‍🌾', path: '/admin/farmers', desc: `${s?.farmers ?? '—'} registered` },
          { label: 'Manage Officers', emoji: '👮', path: '/admin/officers', desc: `${s?.officers ?? '—'} officers` },
          { label: 'View Payments', emoji: '💰', path: '/admin/payments', desc: `${s?.payments ?? '—'} processed` },
          { label: 'Open Complaints', emoji: '📣', path: '/admin/complaints', desc: `${s?.complaints ?? '—'} total` },
        ].map(({ label, emoji, path, desc }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="bg-white rounded-2xl p-5 border border-[#dde4d7] text-left hover:border-[#1e5c33] hover:shadow-sm transition-all group"
          >
            <span className="text-2xl mb-2 block">{emoji}</span>
            <p className="text-[13px] font-[700] text-[#181d14] group-hover:text-[#1e5c33] transition-colors">{label}</p>
            <p className="text-[11px] text-[#6b7563] mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {/* Recent procurements */}
      <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[15px] font-[700] text-[#181d14]">Recent Procurements</p>
          <button
            onClick={() => navigate('/admin/procurement')}
            className="text-[12px] text-[#1e5c33] font-[600] hover:underline"
          >
            View all →
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left">
              {['Token', 'Farmer', 'Crop', 'Quantity', 'Amount', 'Status'].map((h) => (
                <th key={h} className="pb-3 text-[11px] font-[600] text-[#6b7563] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT.map((r, i) => (
              <tr key={r.token} className={i < RECENT.length - 1 ? 'border-b border-[#dde4d7]' : ''}>
                <td className="py-3 text-[13px] font-[600] text-[#181d14] font-mono">{r.token}</td>
                <td className="py-3 text-[13px] text-[#181d14]">{r.farmer}</td>
                <td className="py-3 text-[13px] text-[#6b7563]">{r.crop}</td>
                <td className="py-3 text-[13px] text-[#6b7563]">{r.qty}</td>
                <td className="py-3 text-[13px] font-[600] text-[#181d14]">{r.amount}</td>
                <td className="py-3">
                  <span className={`text-[11px] font-[600] px-2.5 py-1 rounded-full ${STATUS_STYLE[r.status]}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
