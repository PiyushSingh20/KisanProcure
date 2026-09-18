import { useNavigate } from 'react-router';

const CENTERS = [
  { name: 'Lucknow Grain Center', queue: 12, status: 'Active', utilization: 72 },
  { name: 'Kanpur Wheat Center', queue: 34, status: 'Busy', utilization: 95 },
  { name: 'Unnao Hub', queue: 6, status: 'Active', utilization: 40 },
  { name: 'Sitapur Mandi', queue: 0, status: 'Closed', utilization: 0 },
];

const RECENT = [
  { token: 'KSN-1034', farmer: 'Ramesh Yadav', crop: 'Wheat', qty: '380 kg', amount: '₹11,400', status: 'Completed' },
  { token: 'KSN-1033', farmer: 'Sunil Verma', crop: 'Rice', qty: '290 kg', amount: '₹8,700', status: 'Completed' },
  { token: 'KSN-1032', farmer: 'Mohan Gupta', crop: 'Wheat', qty: '520 kg', amount: '₹15,600', status: 'Processing' },
  { token: 'KSN-1031', farmer: 'Ravi Sharma', crop: 'Maize', qty: '200 kg', amount: '₹4,200', status: 'Waiting' },
];

const STATUS_STYLE: Record<string, string> = {
  Completed: 'bg-green-50 text-[#16a34a]',
  Processing: 'bg-orange-50 text-[#ea7c0d]',
  Waiting: 'bg-blue-50 text-[#2563eb]',
  Active: 'bg-green-50 text-[#16a34a]',
  Busy: 'bg-orange-50 text-[#ea7c0d]',
  Closed: 'bg-red-50 text-[#dc2626]',
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 flex flex-col gap-6 min-h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-[#6b7563]">Good morning</p>
          <h1 className="text-[28px] font-[700] tracking-[-0.6px] text-[#181d14]">Admin Dashboard</h1>
          <p className="text-[13px] text-[#6b7563] mt-0.5">10 September 2026</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/analytics')}
            className="px-4 py-2 rounded-xl bg-[#1e5c33] text-white text-[13px] font-[600] hover:bg-[#16432a] transition-colors"
          >
            📈 Analytics
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Farmers Today', value: '128', delta: '+12%', color: '#181d14', emoji: '👨‍🌾' },
          { label: 'Avg. Wait Time', value: '38 min', delta: '-8%', color: '#16a34a', emoji: '⏱' },
          { label: 'Completed', value: '86', delta: '+6%', color: '#1e5c33', emoji: '✅' },
          { label: 'Total Quantity', value: '1,420 kg', delta: '+18%', color: '#2563eb', emoji: '🌾' },
        ].map(({ label, value, delta, color, emoji }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{emoji}</span>
              <span className={`text-[11px] font-[600] px-2 py-0.5 rounded-full ${delta.startsWith('+') ? 'bg-green-50 text-[#16a34a]' : 'bg-red-50 text-[#dc2626]'}`}>
                {delta}
              </span>
            </div>
            <p className="text-[28px] font-[700] tracking-[-1px]" style={{ color }}>{value}</p>
            <p className="text-[12px] text-[#6b7563] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Centers */}
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-[700] text-[#181d14]">Procurement Centers</p>
            <button className="text-[12px] text-[#1e5c33] font-[600]">View all →</button>
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
            <p className="text-[12px] text-[#a8d4b8] font-[600] uppercase tracking-widest mb-2">Active centers</p>
            <p className="text-[48px] font-[700] text-white tracking-[-2px] leading-none">3</p>
            <p className="text-[12px] text-[#a8d4b8] mt-1">of 4 total</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
            <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-2">Officers on duty</p>
            <p className="text-[36px] font-[700] text-[#181d14] tracking-[-1px] leading-none">8</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
            <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-2">Open complaints</p>
            <p className="text-[36px] font-[700] text-[#dc2626] tracking-[-1px] leading-none">3</p>
          </div>
        </div>
      </div>

      {/* Recent procurements */}
      <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[15px] font-[700] text-[#181d14]">Recent procurements</p>
          <button className="text-[12px] text-[#1e5c33] font-[600]">View all →</button>
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
