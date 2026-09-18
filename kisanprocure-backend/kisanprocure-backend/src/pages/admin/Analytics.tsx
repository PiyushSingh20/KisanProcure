import { useNavigate } from 'react-router';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const waitData = [
  { day: 'Mon', avg: 45 }, { day: 'Tue', avg: 38 }, { day: 'Wed', avg: 52 },
  { day: 'Thu', avg: 29 }, { day: 'Fri', avg: 41 }, { day: 'Sat', avg: 35 }, { day: 'Sun', avg: 22 },
];

const dailyProcurement = [
  { date: '4 Sep', qty: 1200 }, { date: '5 Sep', qty: 980 }, { date: '6 Sep', qty: 1450 },
  { date: '7 Sep', qty: 1100 }, { date: '8 Sep', qty: 1600 }, { date: '9 Sep', qty: 1320 }, { date: '10 Sep', qty: 1420 },
];

const cropData = [
  { name: 'Wheat', value: 52, color: '#1e5c33' },
  { name: 'Rice', value: 28, color: '#4a9465' },
  { name: 'Maize', value: 14, color: '#a8d4b8' },
  { name: 'Other', value: 6, color: '#dde4d7' },
];

const peakHours = [
  { hour: '8AM', farmers: 12 }, { hour: '9AM', farmers: 34 }, { hour: '10AM', farmers: 45 },
  { hour: '11AM', farmers: 52 }, { hour: '12PM', farmers: 38 }, { hour: '1PM', farmers: 22 },
  { hour: '2PM', farmers: 41 }, { hour: '3PM', farmers: 29 }, { hour: '4PM', farmers: 18 }, { hour: '5PM', farmers: 8 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#dde4d7] rounded-xl p-3 shadow-lg">
      <p className="text-[12px] text-[#6b7563] mb-1">{label}</p>
      <p className="text-[14px] font-[700] text-[#181d14]">{payload[0].value}{payload[0].name === 'avg' ? ' min' : ''}</p>
    </div>
  );
};

export default function Analytics() {
  const navigate = useNavigate();

  return (
    <div className="p-6 flex flex-col gap-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-[700] tracking-[-0.6px] text-[#181d14]">Analytics</h1>
          <p className="text-[13px] text-[#6b7563] mt-0.5">Last 7 days · 10 September 2026</p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 rounded-xl border border-[#dde4d7] text-[13px] font-[600] text-[#6b7563] hover:bg-[#f4f6f2] transition-colors"
        >
          ← Dashboard
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Farmers', value: '847', trend: '↑ 14%' },
          { label: 'Avg Wait Time', value: '37 min', trend: '↓ 8%' },
          { label: 'Tons Procured', value: '9.4 tons', trend: '↑ 22%' },
          { label: 'Center Utilization', value: '74%', trend: '↑ 5%' },
        ].map(({ label, value, trend }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
            <p className="text-[28px] font-[700] text-[#181d14] tracking-[-1px]">{value}</p>
            <p className="text-[12px] text-[#6b7563] mt-1">{label}</p>
            <p className={`text-[12px] font-[600] mt-1 ${trend.startsWith('↑') ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>{trend} vs last week</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-5">
        {/* Avg wait time */}
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <p className="text-[14px] font-[700] text-[#181d14] mb-4">Average waiting time (min)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={waitData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f6f2" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7563' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7563' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avg" stroke="#1e5c33" strokeWidth={2.5} dot={{ r: 4, fill: '#1e5c33' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily procurement */}
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <p className="text-[14px] font-[700] text-[#181d14] mb-4">Daily procurement (kg)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyProcurement} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f6f2" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7563' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7563' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="qty" fill="#1e5c33" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-3 gap-5">
        {/* Crop-wise */}
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <p className="text-[14px] font-[700] text-[#181d14] mb-4">Crop-wise procurement</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={cropData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {cropData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => <span style={{ fontSize: 11, color: '#6b7563' }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Peak hours */}
        <div className="col-span-2 bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <p className="text-[14px] font-[700] text-[#181d14] mb-4">Peak hours — farmer arrivals</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={peakHours} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f6f2" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6b7563' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7563' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="farmers" radius={[4, 4, 0, 0]}>
                {peakHours.map((entry, i) => (
                  <Cell key={i} fill={entry.farmers >= 50 ? '#ea7c0d' : entry.farmers >= 35 ? '#4a9465' : '#a8d4b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completed vs Pending */}
      <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
        <p className="text-[14px] font-[700] text-[#181d14] mb-4">Completed vs Pending — this week</p>
        <div className="flex flex-col gap-4">
          {[
            { label: 'Completed', value: 86, total: 128, color: '#1e5c33' },
            { label: 'Waiting', value: 28, total: 128, color: '#ea7c0d' },
            { label: 'Processing', value: 14, total: 128, color: '#2563eb' },
          ].map(({ label, value, total, color }) => (
            <div key={label} className="flex items-center gap-4">
              <p className="text-[13px] text-[#6b7563] w-20 shrink-0">{label}</p>
              <div className="flex-1 h-2 bg-[#f4f6f2] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(value / total) * 100}%`, background: color }} />
              </div>
              <p className="text-[13px] font-[600] text-[#181d14] w-8 text-right shrink-0">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
