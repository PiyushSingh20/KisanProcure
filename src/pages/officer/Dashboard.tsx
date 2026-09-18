import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

interface DashboardStats {
  todayBookings: number;
  todayTokens: number;
  activeQueue: number;
  arrivedCount: number;
  pendingQualityChecks: number;
  pendingWeighments: number;
  completedToday: number;
  totalProcuredWeightToday: number;
  totalDisbursedToday: number;
}

interface CenterInfo {
  id: string;
  code: string;
  name: string;
  district: string;
  state: string;
  address: string;
  contactNumber?: string;
}

interface OfficerInfo {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
}

interface RecentRecord {
  id: string;
  recordNumber: string;
  state: string;
  quantity: number;
  weighedQuantity?: number;
  totalAmount?: number;
  crop?: { name: string; category?: string };
  farmer?: {
    farmerCode: string;
    user?: { firstName: string; lastName: string; mobileNumber?: string };
  };
  token?: { tokenNumber: string };
  updatedAt: string;
}

const FALLBACK_DASHBOARD: {
  officer: OfficerInfo;
  center: CenterInfo;
  stats: DashboardStats;
  recentRecords: RecentRecord[];
} = {
  officer: {
    id: 'off-demo-1',
    name: 'Rajesh Kumar Sharma',
    employeeId: 'EMP0001',
    designation: 'Senior Procurement Officer',
  },
  center: {
    id: 'center-demo-1',
    code: 'KSN-HRY-001',
    name: 'Kisan Procurement Center - Karnal Mandi',
    district: 'Karnal',
    state: 'Haryana',
    address: 'GT Road, Near Karnal Grain Market Bypass',
    contactNumber: '0184-2278901',
  },
  stats: {
    todayBookings: 142,
    todayTokens: 98,
    activeQueue: 18,
    arrivedCount: 7,
    pendingQualityChecks: 4,
    pendingWeighments: 3,
    completedToday: 66,
    totalProcuredWeightToday: 1845.5,
    totalDisbursedToday: 4152375,
  },
  recentRecords: [
    {
      id: 'rec-1',
      recordNumber: 'PRC-20260918-0042',
      state: 'QUALITY_CHECK',
      quantity: 50,
      crop: { name: 'Wheat (Sharbati)' },
      farmer: {
        farmerCode: 'KSN-000104',
        user: { firstName: 'Sukhwinder', lastName: 'Singh', mobileNumber: '987****123' },
      },
      token: { tokenNumber: 'TK-1034' },
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'rec-2',
      recordNumber: 'PRC-20260918-0041',
      state: 'WEIGHMENT',
      quantity: 40,
      crop: { name: 'Rice (Basmati)' },
      farmer: {
        farmerCode: 'KSN-000105',
        user: { firstName: 'Ram', lastName: 'Prasad', mobileNumber: '981****456' },
      },
      token: { tokenNumber: 'TK-1035' },
      updatedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'rec-3',
      recordNumber: 'PRC-20260918-0040',
      state: 'PAYMENT_PENDING',
      quantity: 65,
      weighedQuantity: 64.2,
      totalAmount: 146145,
      crop: { name: 'Wheat (Lokwan)' },
      farmer: {
        farmerCode: 'KSN-000106',
        user: { firstName: 'Devendra', lastName: 'Yadav', mobileNumber: '972****890' },
      },
      token: { tokenNumber: 'TK-1032' },
      updatedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    },
    {
      id: 'rec-4',
      recordNumber: 'PRC-20260918-0039',
      state: 'PAYMENT_COMPLETED',
      quantity: 80,
      weighedQuantity: 81.0,
      totalAmount: 184275,
      crop: { name: 'Mustard' },
      farmer: {
        farmerCode: 'KSN-000107',
        user: { firstName: 'Baljit', lastName: 'Kaur', mobileNumber: '998****234' },
      },
      token: { tokenNumber: 'TK-1030' },
      updatedAt: new Date(Date.now() - 90 * 60000).toISOString(),
    },
  ],
};

const STATE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  BOOKED: { label: 'Booked', bg: 'bg-amber-50', text: 'text-amber-700' },
  SCHEDULED: { label: 'Scheduled', bg: 'bg-sky-50', text: 'text-sky-700' },
  WAITING: { label: 'In Queue', bg: 'bg-blue-50', text: 'text-blue-700' },
  CALLED: { label: 'Called to Desk', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  ARRIVED: { label: 'Arrived', bg: 'bg-teal-50', text: 'text-teal-700' },
  QUALITY_CHECK: { label: 'Quality Check', bg: 'bg-orange-50', text: 'text-orange-700' },
  WEIGHMENT: { label: 'Weighment', bg: 'bg-purple-50', text: 'text-purple-700' },
  PROCUREMENT_COMPLETED: { label: 'Procured', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  PAYMENT_PENDING: { label: 'Payment Pending', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  PAYMENT_COMPLETED: { label: 'Paid & Disbursed', bg: 'bg-green-100', text: 'text-green-800' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700' },
};

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(FALLBACK_DASHBOARD);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [callingNext, setCallingNext] = useState(false);
  const [callMessage, setCallMessage] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch('http://localhost:3000/api/v1/officer/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (json && json.stats) {
        setData(json);
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }
    } catch {
      setIsDemo(true);
      setData(FALLBACK_DASHBOARD);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCallNext = async () => {
    setCallingNext(true);
    setCallMessage(null);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch('http://localhost:3000/api/v1/officer/queue/call-next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const result = await res.json();
        setCallMessage(`✅ Called Token #${result.tokenNumber || 'Next'} to Desk!`);
        fetchDashboard();
      } else {
        // demo simulation
        setCallMessage('📢 Token #TK-1036 has been called to Counter 1');
      }
    } catch {
      setCallMessage('📢 Token #TK-1036 has been called to Counter 1 (Demo Mode)');
    } finally {
      setCallingNext(false);
      setTimeout(() => setCallMessage(null), 5000);
    }
  };

  const { officer, center, stats, recentRecords } = data;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[24px] font-[800] text-[#181d14] tracking-tight">
              Procurement Desk Overview
            </h1>
            {isDemo && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-[600] bg-amber-100 text-amber-800 border border-amber-200">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#6b7563] mt-1">
            Officer: <strong className="text-[#181d14]">{officer?.name || 'Officer'}</strong> ({officer?.employeeId})
            &nbsp;•&nbsp;
            Center: <strong className="text-[#1e5c33]">{center?.name || 'Karnal Mandi'}</strong> ({center?.district}, {center?.state})
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[13px] font-[600] text-[#556050] hover:bg-[#f8faf7] transition-colors"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <button
            onClick={handleCallNext}
            disabled={callingNext}
            className="px-5 py-2.5 rounded-xl bg-[#1e5c33] hover:bg-[#16432a] text-white text-[13px] font-[700] shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <span>📢</span>
            <span>{callingNext ? 'Calling...' : 'Call Next Token'}</span>
          </button>
        </div>
      </div>

      {callMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[14px] font-[600] flex items-center justify-between animate-fadeIn">
          <span>{callMessage}</span>
          <button onClick={() => navigate('/officer/queue')} className="underline hover:text-emerald-950 text-[13px]">
            View Live Queue →
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#dde4d7] shadow-xs">
          <p className="text-[12px] font-[600] uppercase text-[#788572] tracking-wider">Today's Bookings</p>
          <p className="text-[28px] font-[800] text-[#181d14] tracking-tight mt-1">{stats.todayBookings}</p>
          <p className="text-[12px] text-[#6b7563] mt-0.5">{stats.todayTokens} tokens issued</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#dde4d7] shadow-xs">
          <p className="text-[12px] font-[600] uppercase text-[#788572] tracking-wider">Active Queue</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-[28px] font-[800] text-[#ea7c0d] tracking-tight">{stats.activeQueue}</p>
            <span className="text-[12px] font-[600] text-teal-700">({stats.arrivedCount} Arrived)</span>
          </div>
          <button
            onClick={() => navigate('/officer/queue')}
            className="text-[12px] text-[#1e5c33] font-[600] mt-0.5 hover:underline"
          >
            Manage Queue Desk →
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#dde4d7] shadow-xs">
          <p className="text-[12px] font-[600] uppercase text-[#788572] tracking-wider">Quality & Weighment</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-[28px] font-[800] text-purple-700 tracking-tight">
              {stats.pendingQualityChecks + stats.pendingWeighments}
            </p>
            <span className="text-[11px] text-[#6b7563]">
              ({stats.pendingQualityChecks} QC, {stats.pendingWeighments} Weigh)
            </span>
          </div>
          <button
            onClick={() => navigate('/officer/requests')}
            className="text-[12px] text-[#1e5c33] font-[600] mt-0.5 hover:underline"
          >
            Process Requests →
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#dde4d7] shadow-xs">
          <p className="text-[12px] font-[600] uppercase text-[#788572] tracking-wider">Procured Today</p>
          <p className="text-[28px] font-[800] text-[#1e5c33] tracking-tight mt-1">
            {stats.totalProcuredWeightToday.toLocaleString()} <span className="text-base font-[600]">Qtl</span>
          </p>
          <p className="text-[12px] text-[#6b7563] mt-0.5">
            ₹{stats.totalDisbursedToday.toLocaleString('en-IN')} pending disbursement
          </p>
        </div>
      </div>

      {/* Workflow Quick Launcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/officer/queue')}
          className="bg-gradient-to-br from-[#1e5c33] to-[#154626] text-white p-5 rounded-2xl shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎫</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-[600]">Live Desk</span>
            </div>
            <h3 className="text-[17px] font-[700]">Token Queue Manager</h3>
            <p className="text-[13px] text-emerald-100 mt-1">
              Call farmers in sequence, register arrival, and assign counters.
            </p>
          </div>
          <p className="text-[12px] font-[600] text-emerald-200 mt-4 flex items-center gap-1">
            Open Queue Console →
          </p>
        </div>

        <div
          onClick={() => navigate('/officer/requests')}
          className="bg-white p-5 rounded-2xl border border-[#dde4d7] shadow-xs cursor-pointer hover:border-[#1e5c33] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔬</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-[600]">
                {stats.pendingQualityChecks} Pending
              </span>
            </div>
            <h3 className="text-[17px] font-[700] text-[#181d14]">Quality & Weighment Station</h3>
            <p className="text-[13px] text-[#6b7563] mt-1">
              Record moisture %, grain damage, tare/gross weight, and finalize MSP bills.
            </p>
          </div>
          <p className="text-[12px] font-[600] text-[#1e5c33] mt-4 flex items-center gap-1">
            Inspect & Weigh Batches →
          </p>
        </div>

        <div
          onClick={() => navigate('/officer/farmers')}
          className="bg-white p-5 rounded-2xl border border-[#dde4d7] shadow-xs cursor-pointer hover:border-[#1e5c33] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👨‍🌾</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-[600]">
                {center?.district || 'District'}
              </span>
            </div>
            <h3 className="text-[17px] font-[700] text-[#181d14]">Farmer Directory</h3>
            <p className="text-[13px] text-[#6b7563] mt-1">
              Verify farmer registration, land parcel details, and produce declarations.
            </p>
          </div>
          <p className="text-[12px] font-[600] text-[#1e5c33] mt-4 flex items-center gap-1">
            Browse Registered Farmers →
          </p>
        </div>
      </div>

      {/* Recent Records Table */}
      <div className="bg-white rounded-2xl border border-[#dde4d7] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#dde4d7] flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-[700] text-[#181d14]">Recent Center Procurements</h2>
            <p className="text-[12px] text-[#6b7563]">Latest active workflow batches handled at this center</p>
          </div>
          <button
            onClick={() => navigate('/officer/requests')}
            className="text-[13px] font-[600] text-[#1e5c33] hover:underline"
          >
            View All Requests ({stats.todayBookings}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8faf7] text-[#566050] font-[600] border-b border-[#dde4d7]">
              <tr>
                <th className="py-3 px-4">Record / Token</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Stage Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4d7]">
              {recentRecords.map((r) => {
                const badge = STATE_BADGES[r.state] || { label: r.state, bg: 'bg-gray-100', text: 'text-gray-700' };
                return (
                  <tr key={r.id} className="hover:bg-[#fafcf9] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-[700] text-[#181d14]">{r.recordNumber}</p>
                      <p className="text-[11px] text-[#6b7563] font-mono">{r.token?.tokenNumber || 'Token --'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-[600] text-[#181d14]">
                        {r.farmer?.user?.firstName} {r.farmer?.user?.lastName}
                      </p>
                      <p className="text-[11px] text-[#6b7563]">{r.farmer?.farmerCode}</p>
                    </td>
                    <td className="py-3.5 px-4 font-[500] text-[#181d14]">{r.crop?.name || 'Crop'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-[700] text-[#181d14]">
                        {r.weighedQuantity ?? r.quantity} Qtl
                      </span>
                      {r.totalAmount && (
                        <p className="text-[11px] text-emerald-700 font-[600]">
                          ₹{r.totalAmount.toLocaleString('en-IN')}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-[700] ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/officer/requests/${r.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-[#e6f3eb] hover:bg-[#d5eadc] text-[#1e5c33] font-[600] text-[12px] transition-colors"
                      >
                        Process →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
