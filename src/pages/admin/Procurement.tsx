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

interface Procurement {
  id: string;
  tokenNumber: string;
  farmerName?: string;
  cropName?: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  status: string;
  centerName?: string;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-green-50 text-[#16a34a]',
  REJECTED: 'bg-red-50 text-[#dc2626]',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const DEMO: Procurement[] = [
  { id: '1', tokenNumber: 'KSN-1041', farmerName: 'Ramesh Yadav', cropName: 'Wheat', quantityKg: 380, pricePerKg: 2275, totalAmount: 864500, status: 'COMPLETED', centerName: 'Lucknow Grain Center', createdAt: '2026-09-17T08:30:00Z' },
  { id: '2', tokenNumber: 'KSN-1042', farmerName: 'Sunil Verma', cropName: 'Rice', quantityKg: 290, pricePerKg: 2300, totalAmount: 667000, status: 'IN_PROGRESS', centerName: 'Kanpur Wheat Center', createdAt: '2026-09-17T09:00:00Z' },
  { id: '3', tokenNumber: 'KSN-1043', farmerName: 'Mohan Gupta', cropName: 'Wheat', quantityKg: 520, pricePerKg: 2275, totalAmount: 1183000, status: 'PENDING', centerName: 'Prayagraj Hub', createdAt: '2026-09-17T09:30:00Z' },
  { id: '4', tokenNumber: 'KSN-1040', farmerName: 'Ravi Sharma', cropName: 'Maize', quantityKg: 200, pricePerKg: 2090, totalAmount: 418000, status: 'COMPLETED', centerName: 'Lucknow Grain Center', createdAt: '2026-09-17T07:00:00Z' },
  { id: '5', tokenNumber: 'KSN-1039', farmerName: 'Dinesh Patel', cropName: 'Mustard', quantityKg: 150, pricePerKg: 5950, totalAmount: 892500, status: 'REJECTED', centerName: 'Varanasi Mandi', createdAt: '2026-09-16T14:00:00Z' },
];

export default function AdminProcurement() {
  const [records, setRecords] = useState<Procurement[]>([]);
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
    // Try procurement records endpoint
    const res = await adminFetch<{ data: Procurement[]; total: number }>(`/procurement?${q}`);
    if (res && res.data) {
      setRecords(res.data);
      setTotal(res.total);
      setDemoMode(false);
    } else {
      const filtered = statusFilter ? DEMO.filter(r => r.status === statusFilter) : DEMO;
      setRecords(filtered);
      setTotal(filtered.length);
      setDemoMode(true);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);
  const totalValue = records.reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="p-6 flex flex-col gap-5 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Procurement Records</h1>
          <p className="text-[13px] text-[#6b7563] mt-0.5">
            {total} records · Total value ₹{(totalValue / 100000).toFixed(1)}L
            {demoMode && <span className="ml-2 text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-[600]">Demo Mode</span>}
          </p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'].map(s => (
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
          <div className="flex items-center justify-center h-48 text-[#6b7563] text-[14px]">Loading records...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f4f6f2]">
              <tr>
                {['Token', 'Farmer', 'Crop', 'Qty (kg)', 'Price/kg', 'Total (₹)', 'Center', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-[600] text-[#6b7563] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} className={`border-t border-[#f4f6f2] hover:bg-[#f9faf8] transition-colors ${i===0?'border-0':''}`}>
                  <td className="px-4 py-3 text-[12px] font-[600] text-[#181d14] font-mono">{r.tokenNumber}</td>
                  <td className="px-4 py-3 text-[13px] text-[#181d14]">{r.farmerName || '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{r.cropName || '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{r.quantityKg.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">₹{r.pricePerKg.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[13px] font-[600] text-[#181d14]">₹{(r.totalAmount / 100).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[12px] text-[#6b7563]">{r.centerName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-[600] px-2 py-1 rounded-full ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#6b7563]">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-[#6b7563] text-[13px]">No procurement records found</td></tr>
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
