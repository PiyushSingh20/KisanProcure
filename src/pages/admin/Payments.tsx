import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3000/api/v1';
function getToken() { return localStorage.getItem('kp_token'); }
async function adminFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      ...options,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch { return null; }
}

interface Payment {
  id: string;
  transactionId: string | null;
  amount: number;
  status: string;
  paymentMethod: string | null;
  utrNumber: string | null;
  createdAt: string;
  farmer?: { farmerId: string; user?: { firstName: string; lastName: string } };
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-[#16a34a]',
  FAILED: 'bg-red-50 text-[#dc2626]',
  REVERSED: 'bg-gray-100 text-gray-600',
};

const DEMO: Payment[] = [
  { id: '1', transactionId: 'TXN-20260917-001', amount: 864500, status: 'COMPLETED', paymentMethod: 'PFMS', utrNumber: 'UTR001234567', createdAt: '2026-09-17T12:00:00Z', farmer: { farmerId: 'KP-F-001', user: { firstName: 'Ramesh', lastName: 'Yadav' } } },
  { id: '2', transactionId: 'TXN-20260917-002', amount: 667000, status: 'PROCESSING', paymentMethod: 'DBT', utrNumber: null, createdAt: '2026-09-17T13:00:00Z', farmer: { farmerId: 'KP-F-002', user: { firstName: 'Sunil', lastName: 'Verma' } } },
  { id: '3', transactionId: null, amount: 418000, status: 'PENDING', paymentMethod: 'DBT', utrNumber: null, createdAt: '2026-09-17T14:00:00Z', farmer: { farmerId: 'KP-F-004', user: { firstName: 'Ravi', lastName: 'Sharma' } } },
  { id: '4', transactionId: 'TXN-20260916-011', amount: 1183000, status: 'COMPLETED', paymentMethod: 'PFMS', utrNumber: 'UTR009876543', createdAt: '2026-09-16T10:00:00Z', farmer: { farmerId: 'KP-F-003', user: { firstName: 'Mohan', lastName: 'Gupta' } } },
];

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (statusFilter) q.set('status', statusFilter);
    const res = await adminFetch<{ data: Payment[]; total: number }>(`/payments?${q}`);
    if (res && res.data) {
      setPayments(res.data);
      setTotal(res.total);
      setDemoMode(false);
    } else {
      const filtered = statusFilter ? DEMO.filter(p => p.status === statusFilter) : DEMO;
      setPayments(filtered);
      setTotal(filtered.length);
      setDemoMode(true);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);
  const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 flex flex-col gap-5 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Payments</h1>
          <p className="text-[13px] text-[#6b7563] mt-0.5">
            {total} transactions
            {demoMode && <span className="ml-2 text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-[600]">Demo Mode</span>}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <p className="text-[12px] text-[#6b7563] uppercase tracking-wider font-[600] mb-2">Completed (shown)</p>
          <p className="text-[24px] font-[700] text-[#16a34a] tracking-[-0.5px]">₹{(totalPaid / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <p className="text-[12px] text-[#6b7563] uppercase tracking-wider font-[600] mb-2">Pending (shown)</p>
          <p className="text-[24px] font-[700] text-amber-600 tracking-[-0.5px]">₹{(totalPending / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <p className="text-[12px] text-[#6b7563] uppercase tracking-wider font-[600] mb-2">Records (shown)</p>
          <p className="text-[24px] font-[700] text-[#181d14] tracking-[-0.5px]">{payments.length}</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-[12px] font-[600] transition-colors ${
              statusFilter === s ? 'bg-[#1e5c33] text-white' : 'bg-white text-[#6b7563] border border-[#dde4d7] hover:bg-[#f4f6f2]'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#dde4d7] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#6b7563] text-[14px]">Loading payments...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f4f6f2]">
              <tr>
                {['Transaction ID', 'Farmer', 'Amount (₹)', 'Method', 'UTR Number', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-[600] text-[#6b7563] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} className={`border-t border-[#f4f6f2] hover:bg-[#f9faf8] transition-colors ${i===0?'border-0':''}`}>
                  <td className="px-4 py-3 text-[12px] font-[600] text-[#181d14] font-mono">{p.transactionId || '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-[#181d14]">
                    {p.farmer?.user ? `${p.farmer.user.firstName} ${p.farmer.user.lastName}` : p.farmer?.farmerId || '—'}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-[600] text-[#181d14]">₹{(p.amount / 100).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{p.paymentMethod || '—'}</td>
                  <td className="px-4 py-3 text-[12px] font-mono text-[#6b7563]">{p.utrNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-[600] px-2 py-1 rounded-full ${STATUS_COLOR[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#6b7563]">
                    {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[#6b7563] text-[13px]">No payment records found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-[#6b7563]">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg border border-[#dde4d7] text-[12px] font-[600] text-[#6b7563] disabled:opacity-40 hover:bg-[#f4f6f2]">← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1.5 rounded-lg border border-[#dde4d7] text-[12px] font-[600] text-[#6b7563] disabled:opacity-40 hover:bg-[#f4f6f2]">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
