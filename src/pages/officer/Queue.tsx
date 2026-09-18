import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

interface QueueToken {
  id: string;
  tokenNumber: string;
  status: string;
  queuePosition?: number;
  calledAt?: string;
  arrivedAt?: string;
  farmer?: {
    farmerCode: string;
    user?: { firstName: string; lastName: string; mobileNumber?: string };
  };
  crop?: { name: string; category?: string };
  booking?: { bookingNumber: string; quantity: number };
  procurementRecord?: { id: string; recordNumber: string; state: string };
  counter?: { counterNumber: number };
}

interface Counter {
  id: string;
  counterNumber: number;
  isActive: boolean;
  currentToken?: { tokenNumber: string };
}

const FALLBACK_COUNTERS: Counter[] = [
  { id: 'c-1', counterNumber: 1, isActive: true, currentToken: { tokenNumber: 'TK-1034' } },
  { id: 'c-2', counterNumber: 2, isActive: true, currentToken: { tokenNumber: 'TK-1035' } },
  { id: 'c-3', counterNumber: 3, isActive: true },
];

const FALLBACK_TOKENS: QueueToken[] = [
  {
    id: 'tok-1',
    tokenNumber: 'TK-1034',
    status: 'CALLED',
    queuePosition: 1,
    calledAt: new Date(Date.now() - 4 * 60000).toISOString(),
    farmer: {
      farmerCode: 'KSN-000104',
      user: { firstName: 'Ramesh', lastName: 'Yadav', mobileNumber: '987****123' },
    },
    crop: { name: 'Wheat (Sharbati)' },
    booking: { bookingNumber: 'BK-2026-001', quantity: 50 },
    counter: { counterNumber: 1 },
    procurementRecord: { id: 'rec-1', recordNumber: 'PRC-20260918-0042', state: 'CALLED' },
  },
  {
    id: 'tok-2',
    tokenNumber: 'TK-1035',
    status: 'CALLED',
    queuePosition: 2,
    calledAt: new Date(Date.now() - 2 * 60000).toISOString(),
    farmer: {
      farmerCode: 'KSN-000105',
      user: { firstName: 'Sunil', lastName: 'Verma', mobileNumber: '981****456' },
    },
    crop: { name: 'Rice (Basmati)' },
    booking: { bookingNumber: 'BK-2026-002', quantity: 40 },
    counter: { counterNumber: 2 },
    procurementRecord: { id: 'rec-2', recordNumber: 'PRC-20260918-0041', state: 'CALLED' },
  },
  {
    id: 'tok-3',
    tokenNumber: 'TK-1036',
    status: 'ARRIVED',
    queuePosition: 3,
    arrivedAt: new Date().toISOString(),
    farmer: {
      farmerCode: 'KSN-000106',
      user: { firstName: 'Mohan', lastName: 'Gupta', mobileNumber: '972****890' },
    },
    crop: { name: 'Wheat (Lokwan)' },
    booking: { bookingNumber: 'BK-2026-003', quantity: 60 },
    procurementRecord: { id: 'rec-3', recordNumber: 'PRC-20260918-0040', state: 'ARRIVED' },
  },
  {
    id: 'tok-4',
    tokenNumber: 'TK-1037',
    status: 'WAITING',
    queuePosition: 4,
    farmer: {
      farmerCode: 'KSN-000107',
      user: { firstName: 'Ravi', lastName: 'Sharma', mobileNumber: '998****234' },
    },
    crop: { name: 'Maize' },
    booking: { bookingNumber: 'BK-2026-004', quantity: 35 },
  },
  {
    id: 'tok-5',
    tokenNumber: 'TK-1038',
    status: 'WAITING',
    queuePosition: 5,
    farmer: {
      farmerCode: 'KSN-000108',
      user: { firstName: 'Ajay', lastName: 'Mishra', mobileNumber: '983****789' },
    },
    crop: { name: 'Wheat' },
    booking: { bookingNumber: 'BK-2026-005', quantity: 45 },
  },
];

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  CALLED: { label: 'Called to Desk', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  ARRIVED: { label: 'Arrived at Mandi', bg: 'bg-teal-100', text: 'text-teal-800' },
  WAITING: { label: 'Waiting in Line', bg: 'bg-amber-100', text: 'text-amber-800' },
  QUALITY_CHECK: { label: 'At Quality Station', bg: 'bg-orange-100', text: 'text-orange-800' },
  WEIGHMENT: { label: 'At Weighbridge', bg: 'bg-purple-100', text: 'text-purple-800' },
};

export default function OfficerQueue() {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<QueueToken[]>(FALLBACK_TOKENS);
  const [counters, setCounters] = useState<Counter[]>(FALLBACK_COUNTERS);
  const [selectedCounter, setSelectedCounter] = useState<string>('');
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch('http://localhost:3000/api/v1/officer/queue', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (json && json.tokens) {
        setTokens(json.tokens);
        if (json.counters && json.counters.length > 0) {
          setCounters(json.counters);
          setSelectedCounter(json.counters[0].id);
        }
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }
    } catch {
      setIsDemo(true);
      setTokens(FALLBACK_TOKENS);
      setCounters(FALLBACK_COUNTERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleCallNext = async () => {
    setActionLoading('call-next');
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch('http://localhost:3000/api/v1/officer/queue/call-next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ counterId: selectedCounter || undefined }),
      });

      if (res.ok) {
        const calledToken = await res.json();
        setToast(`📢 Token #${calledToken.tokenNumber} successfully called to counter!`);
        fetchQueue();
      } else {
        // demo simulation
        const firstWaiting = tokens.find((t) => t.status === 'WAITING');
        if (firstWaiting) {
          setTokens((prev) =>
            prev.map((t) =>
              t.id === firstWaiting.id ? { ...t, status: 'CALLED', calledAt: new Date().toISOString() } : t
            )
          );
          setToast(`📢 Token #${firstWaiting.tokenNumber} called to desk!`);
        } else {
          setToast('ℹ️ No waiting tokens in queue.');
        }
      }
    } catch {
      const firstWaiting = tokens.find((t) => t.status === 'WAITING');
      if (firstWaiting) {
        setTokens((prev) =>
          prev.map((t) =>
            t.id === firstWaiting.id ? { ...t, status: 'CALLED', calledAt: new Date().toISOString() } : t
          )
        );
        setToast(`📢 Token #${firstWaiting.tokenNumber} called to desk (Demo Mode)!`);
      }
    } finally {
      setActionLoading(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleMarkArrived = async (tokenId: string, tokenNum: string) => {
    setActionLoading(tokenId);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch(`http://localhost:3000/api/v1/officer/tokens/${tokenId}/mark-arrived`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const result = await res.json();
        setToast(`✅ Arrival registered for Token #${tokenNum}. Record generated.`);
        fetchQueue();
      } else {
        // demo simulation
        setTokens((prev) =>
          prev.map((t) => (t.id === tokenId ? { ...t, status: 'ARRIVED', arrivedAt: new Date().toISOString() } : t))
        );
        setToast(`✅ Arrival registered for Token #${tokenNum} (Demo Mode).`);
      }
    } catch {
      setTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, status: 'ARRIVED', arrivedAt: new Date().toISOString() } : t))
      );
      setToast(`✅ Arrival registered for Token #${tokenNum} (Demo Mode).`);
    } finally {
      setActionLoading(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[24px] font-[800] text-[#181d14] tracking-tight">Live Token Queue Desk</h1>
            {isDemo && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-[600] bg-amber-100 text-amber-800 border border-amber-200">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#6b7563] mt-1">
            Real-time physical token queue at the center. Call next farmer and record arrival.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-[600] text-[#556050]">Counter:</label>
            <select
              value={selectedCounter}
              onChange={(e) => setSelectedCounter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#dde4d7] text-[13px] font-[600] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33]"
            >
              {counters.map((c) => (
                <option key={c.id} value={c.id}>
                  Counter {c.counterNumber}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-[#dde4d7] text-[13px] font-[600] text-[#556050] hover:bg-[#f8faf7] transition-colors"
          >
            🔄
          </button>

          <button
            onClick={handleCallNext}
            disabled={actionLoading === 'call-next'}
            className="px-5 py-2.5 rounded-xl bg-[#1e5c33] hover:bg-[#16432a] text-white text-[13px] font-[700] shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <span>📣</span>
            <span>{actionLoading === 'call-next' ? 'Calling...' : 'Call Next Token'}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[14px] font-[600] animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Counters Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {counters.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-2xl border border-[#dde4d7] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e6f3eb] text-[#1e5c33] flex items-center justify-center font-[800] text-[16px]">
                {c.counterNumber}
              </div>
              <div>
                <p className="text-[13px] font-[700] text-[#181d14]">Counter #{c.counterNumber}</p>
                <p className="text-[12px] text-[#6b7563]">
                  Serving: <strong className="text-[#1e5c33]">{c.currentToken?.tokenNumber || 'Available'}</strong>
                </p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Counter Operational" />
          </div>
        ))}
      </div>

      {/* Live Queue Table */}
      <div className="bg-white rounded-2xl border border-[#dde4d7] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#dde4d7] flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-[700] text-[#181d14]">Queue Sequence</h2>
            <p className="text-[12px] text-[#6b7563]">
              Ordered by caller priority and arrival readiness ({tokens.length} active tokens)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8faf7] text-[#566050] font-[600] border-b border-[#dde4d7]">
              <tr>
                <th className="py-3 px-4">Pos #</th>
                <th className="py-3 px-4">Token Number</th>
                <th className="py-3 px-4">Farmer Details</th>
                <th className="py-3 px-4">Crop & Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Desk Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4d7]">
              {tokens.map((t, idx) => {
                const badge = STATUS_BADGES[t.status] || { label: t.status, bg: 'bg-gray-100', text: 'text-gray-700' };
                const isArrived = t.status === 'ARRIVED';
                const isCalled = t.status === 'CALLED';

                return (
                  <tr key={t.id} className="hover:bg-[#fafcf9] transition-colors">
                    <td className="py-3.5 px-4 font-[700] text-[#788572]">{t.queuePosition || idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-[800] text-[15px] text-[#181d14] tracking-tight">{t.tokenNumber}</p>
                      {t.counter && (
                        <span className="text-[11px] font-[600] text-indigo-700">Counter {t.counter.counterNumber}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-[600] text-[#181d14]">
                        {t.farmer?.user?.firstName} {t.farmer?.user?.lastName}
                      </p>
                      <p className="text-[11px] text-[#6b7563] font-mono">
                        {t.farmer?.farmerCode} • {t.farmer?.user?.mobileNumber || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-[600] text-[#181d14]">{t.crop?.name || 'Crop'}</p>
                      <p className="text-[11px] text-[#6b7563]">Booking: {t.booking?.quantity || 10} Qtl</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-[700] ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isCalled && (
                        <button
                          onClick={() => handleMarkArrived(t.id, t.tokenNumber)}
                          disabled={actionLoading === t.id}
                          className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-[600] text-[12px] transition-colors shadow-xs"
                        >
                          {actionLoading === t.id ? 'Marking...' : '📍 Mark Arrived'}
                        </button>
                      )}

                      {isArrived && (
                        <button
                          onClick={() => {
                            if (t.procurementRecord?.id) {
                              navigate(`/officer/requests/${t.procurementRecord.id}`);
                            } else {
                              navigate('/officer/requests');
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1e5c33] hover:bg-[#16432a] text-white font-[600] text-[12px] transition-colors shadow-xs"
                        >
                          🔬 Inspect Quality →
                        </button>
                      )}

                      {!isCalled && !isArrived && (
                        <button
                          onClick={() => handleMarkArrived(t.id, t.tokenNumber)}
                          disabled={actionLoading === t.id}
                          className="px-3 py-1.5 rounded-lg border border-[#dde4d7] hover:bg-[#f8faf7] text-[#556050] font-[600] text-[12px] transition-colors"
                        >
                          Direct Arrive
                        </button>
                      )}
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
