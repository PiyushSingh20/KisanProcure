import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

interface ProcurementItem {
  id: string;
  recordNumber: string;
  state: string;
  quantity: number;
  weighedQuantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
  crop?: { name: string; category?: string };
  farmer?: {
    farmerCode: string;
    user?: { firstName: string; lastName: string; mobileNumber?: string };
  };
  token?: { tokenNumber: string };
  qualityCheck?: { status: string; moistureContent?: number };
  weighment?: { netWeight: number };
  payment?: { paymentNumber: string; status: string };
}

const TABS = [
  { id: 'ALL', label: 'All Requests' },
  { id: 'BOOKED', label: 'Pending Verification (Booked)' },
  { id: 'SCHEDULED', label: 'Scheduled' },
  { id: 'ARRIVED', label: 'Arrived at Mandi' },
  { id: 'QUALITY_CHECK', label: 'Quality Check' },
  { id: 'WEIGHMENT', label: 'Weighment' },
  { id: 'PROCUREMENT_COMPLETED', label: 'Completed' },
  { id: 'PAYMENT_PENDING', label: 'Payment Pending' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

const FALLBACK_REQUESTS: ProcurementItem[] = [
  {
    id: 'req-1',
    recordNumber: 'PRC-20260918-0042',
    state: 'BOOKED',
    quantity: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    crop: { name: 'Wheat (Sharbati)', category: 'CEREAL' },
    farmer: {
      farmerCode: 'KSN-000104',
      user: { firstName: 'Harpreet', lastName: 'Singh', mobileNumber: '987****123' },
    },
    token: { tokenNumber: 'TK-1034' },
  },
  {
    id: 'req-2',
    recordNumber: 'PRC-20260918-0041',
    state: 'SCHEDULED',
    quantity: 35,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    crop: { name: 'Rice (Paddy)', category: 'CEREAL' },
    farmer: {
      farmerCode: 'KSN-000105',
      user: { firstName: 'Sunil', lastName: 'Verma', mobileNumber: '981****456' },
    },
    token: { tokenNumber: 'TK-1035' },
  },
  {
    id: 'req-3',
    recordNumber: 'PRC-20260918-0040',
    state: 'ARRIVED',
    quantity: 60,
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    crop: { name: 'Wheat (Lokwan)', category: 'CEREAL' },
    farmer: {
      farmerCode: 'KSN-000106',
      user: { firstName: 'Mohan', lastName: 'Gupta', mobileNumber: '972****890' },
    },
    token: { tokenNumber: 'TK-1036' },
  },
  {
    id: 'req-4',
    recordNumber: 'PRC-20260918-0039',
    state: 'QUALITY_CHECK',
    quantity: 50,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    crop: { name: 'Mustard', category: 'OILSEED' },
    farmer: {
      farmerCode: 'KSN-000107',
      user: { firstName: 'Baljit', lastName: 'Kaur', mobileNumber: '998****234' },
    },
    token: { tokenNumber: 'TK-1037' },
    qualityCheck: { status: 'PENDING', moistureContent: 11.2 },
  },
  {
    id: 'req-5',
    recordNumber: 'PRC-20260918-0038',
    state: 'WEIGHMENT',
    quantity: 40,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    crop: { name: 'Wheat (Kalyan Sona)', category: 'CEREAL' },
    farmer: {
      farmerCode: 'KSN-000108',
      user: { firstName: 'Ajay', lastName: 'Mishra', mobileNumber: '983****789' },
    },
    token: { tokenNumber: 'TK-1038' },
    qualityCheck: { status: 'PASSED', moistureContent: 10.5 },
  },
  {
    id: 'req-6',
    recordNumber: 'PRC-20260918-0037',
    state: 'PAYMENT_PENDING',
    quantity: 55,
    weighedQuantity: 54.5,
    unitPrice: 2275,
    totalAmount: 123987.5,
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    crop: { name: 'Wheat (Sharbati)', category: 'CEREAL' },
    farmer: {
      farmerCode: 'KSN-000109',
      user: { firstName: 'Karamjit', lastName: 'Gill', mobileNumber: '984****321' },
    },
    token: { tokenNumber: 'TK-1031' },
    qualityCheck: { status: 'PASSED' },
    weighment: { netWeight: 54.5 },
    payment: { paymentNumber: 'PAY-2026-0045', status: 'PENDING' },
  },
  {
    id: 'req-7',
    recordNumber: 'PRC-20260918-0036',
    state: 'CANCELLED',
    quantity: 30,
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    crop: { name: 'Moong (Green Gram)', category: 'PULSE' },
    farmer: {
      farmerCode: 'KSN-000110',
      user: { firstName: 'Virendra', lastName: 'Chauhan', mobileNumber: '976****654' },
    },
    token: { tokenNumber: 'TK-1029' },
  },
];

const STATE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  BOOKED: { label: 'Booked (Needs Verify)', bg: 'bg-amber-100', text: 'text-amber-800' },
  SCHEDULED: { label: 'Scheduled', bg: 'bg-sky-100', text: 'text-sky-800' },
  WAITING: { label: 'Waiting', bg: 'bg-blue-100', text: 'text-blue-800' },
  CALLED: { label: 'Called', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  ARRIVED: { label: 'Arrived', bg: 'bg-teal-100', text: 'text-teal-800' },
  QUALITY_CHECK: { label: 'Quality Check', bg: 'bg-orange-100', text: 'text-orange-800' },
  WEIGHMENT: { label: 'Weighment', bg: 'bg-purple-100', text: 'text-purple-800' },
  PROCUREMENT_COMPLETED: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  PAYMENT_PENDING: { label: 'Payment Pending', bg: 'bg-emerald-100', text: 'text-emerald-900' },
  PAYMENT_COMPLETED: { label: 'Paid & Disbursed', bg: 'bg-green-100', text: 'text-green-800' },
  CANCELLED: { label: 'Cancelled / Rejected', bg: 'bg-rose-100', text: 'text-rose-800' },
};

export default function OfficerRequests() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState<ProcurementItem[]>(FALLBACK_REQUESTS);
  const [total, setTotal] = useState(FALLBACK_REQUESTS.length);
  const [page, setPage] = useState(1);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem('kp_token');
    const query = new URLSearchParams({
      page: String(page),
      limit: '20',
      ...(activeTab !== 'ALL' ? { state: activeTab } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    });

    try {
      const res = await fetch(`http://localhost:3000/api/v1/officer/procurement-requests?${query.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && json.data) {
        setRequests(json.data);
        setTotal(json.total);
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }
    } catch {
      setIsDemo(true);
      // filter locally in fallback
      let filtered = FALLBACK_REQUESTS;
      if (activeTab !== 'ALL') {
        filtered = filtered.filter((r) => r.state === activeTab);
      }
      if (search.trim()) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.recordNumber.toLowerCase().includes(s) ||
            r.token?.tokenNumber.toLowerCase().includes(s) ||
            r.farmer?.user?.firstName.toLowerCase().includes(s) ||
            r.farmer?.user?.lastName.toLowerCase().includes(s) ||
            r.crop?.name.toLowerCase().includes(s)
        );
      }
      setRequests(filtered);
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[24px] font-[800] text-[#181d14] tracking-tight">Procurement Requests</h1>
            {isDemo && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-[600] bg-amber-100 text-amber-800 border border-amber-200">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#6b7563] mt-1">
            Review, verify, inspect quality, weigh batches, and finalize payments for center requests.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Search record#, token#, farmer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[13px] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33] w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#1e5c33] hover:bg-[#16432a] text-white text-[13px] font-[600] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-[12.5px] font-[600] whitespace-nowrap transition-all ${
                active
                  ? 'bg-[#1e5c33] text-white shadow-xs'
                  : 'bg-white border border-[#dde4d7] text-[#556050] hover:bg-[#f8faf7]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#dde4d7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8faf7] text-[#566050] font-[600] border-b border-[#dde4d7]">
              <tr>
                <th className="py-3 px-4">Record / Token</th>
                <th className="py-3 px-4">Farmer Details</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">Quantity (Qtl)</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4d7]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#788572]">
                    Loading procurement requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#788572]">
                    No requests found matching the criteria.
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const badge = STATE_BADGES[r.state] || {
                    label: r.state,
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                  };

                  return (
                    <tr key={r.id} className="hover:bg-[#fafcf9] transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-[800] text-[#181d14]">{r.recordNumber}</p>
                        <p className="text-[11px] text-[#6b7563] font-mono">
                          {r.token?.tokenNumber ? `Token: ${r.token.tokenNumber}` : 'Booking Only'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-[600] text-[#181d14]">
                          {r.farmer?.user?.firstName} {r.farmer?.user?.lastName}
                        </p>
                        <p className="text-[11px] text-[#6b7563] font-mono">
                          {r.farmer?.farmerCode} • {r.farmer?.user?.mobileNumber || 'N/A'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-[500] text-[#181d14]">{r.crop?.name || 'Crop'}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-[700] text-[#181d14]">
                          {r.weighedQuantity ? `${r.weighedQuantity} (Net)` : `${r.quantity} (Est)`}
                        </p>
                        {r.totalAmount && (
                          <p className="text-[11px] text-emerald-700 font-[700]">
                            ₹{r.totalAmount.toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-[700] ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#788572] text-[12px]">
                        {new Date(r.updatedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/officer/requests/${r.id}`)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#e6f3eb] hover:bg-[#d5eadc] text-[#1e5c33] font-[700] text-[12px] transition-colors"
                        >
                          Process & Details →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 bg-[#f8faf7] border-t border-[#dde4d7] flex items-center justify-between text-[12px] text-[#6b7563]">
          <span>Showing {requests.length} of {total} records</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-[#dde4d7] disabled:opacity-50 hover:bg-white"
            >
              Previous
            </button>
            <button
              disabled={requests.length < 20}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-[#dde4d7] disabled:opacity-50 hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
