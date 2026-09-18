import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3000/api/v1';

function getToken() {
  return localStorage.getItem('kp_token');
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      ...options,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface FarmerRow {
  id: string;
  farmerId: string;
  district: string;
  state: string;
  totalLandArea: number | null;
  createdAt: string;
  user?: { firstName: string; lastName: string; mobileNumber: string };
}

const DEMO_FARMERS: FarmerRow[] = [
  { id: '1', farmerId: 'KP-F-001', district: 'Lucknow', state: 'Uttar Pradesh', totalLandArea: 2.5, createdAt: '2026-09-10T10:00:00Z', user: { firstName: 'Ramesh', lastName: 'Yadav', mobileNumber: '9876543210' } },
  { id: '2', farmerId: 'KP-F-002', district: 'Kanpur', state: 'Uttar Pradesh', totalLandArea: 4.0, createdAt: '2026-09-11T11:00:00Z', user: { firstName: 'Sunil', lastName: 'Verma', mobileNumber: '9812345678' } },
  { id: '3', farmerId: 'KP-F-003', district: 'Prayagraj', state: 'Uttar Pradesh', totalLandArea: 1.8, createdAt: '2026-09-12T09:00:00Z', user: { firstName: 'Mohan', lastName: 'Gupta', mobileNumber: '9898765432' } },
  { id: '4', farmerId: 'KP-F-004', district: 'Varanasi', state: 'Uttar Pradesh', totalLandArea: 3.2, createdAt: '2026-09-13T08:00:00Z', user: { firstName: 'Ravi', lastName: 'Sharma', mobileNumber: '9756432198' } },
  { id: '5', farmerId: 'KP-F-005', district: 'Agra', state: 'Uttar Pradesh', totalLandArea: 6.0, createdAt: '2026-09-14T10:30:00Z', user: { firstName: 'Dinesh', lastName: 'Patel', mobileNumber: '9823456789' } },
];

export default function AdminFarmers() {
  const [farmers, setFarmers] = useState<FarmerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FarmerRow | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) q.set('search', search);
    if (district) q.set('district', district);
    const res = await adminFetch<{ data: FarmerRow[]; total: number }>(`/farmers?${q}`);
    if (res && res.data) {
      setFarmers(res.data);
      setTotal(res.total);
      setDemoMode(false);
    } else {
      setFarmers(DEMO_FARMERS);
      setTotal(DEMO_FARMERS.length);
      setDemoMode(true);
    }
    setLoading(false);
  }, [page, search, district]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 flex flex-col gap-5 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Farmers</h1>
          <p className="text-[13px] text-[#6b7563] mt-0.5">
            {total} registered farmers
            {demoMode && <span className="ml-2 text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-[600]">Demo Mode</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search name or mobile..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#dde4d7] bg-white text-[13px] text-[#181d14] placeholder:text-[#a8b4a0] outline-none focus:border-[#1e5c33] transition-colors"
        />
        <input
          type="text"
          placeholder="Filter by district..."
          value={district}
          onChange={e => { setDistrict(e.target.value); setPage(1); }}
          className="w-48 px-4 py-2.5 rounded-xl border border-[#dde4d7] bg-white text-[13px] text-[#181d14] placeholder:text-[#a8b4a0] outline-none focus:border-[#1e5c33] transition-colors"
        />
        <button
          onClick={load}
          className="px-4 py-2.5 rounded-xl bg-[#1e5c33] text-white text-[13px] font-[600] hover:bg-[#16432a] transition-colors"
        >
          🔍 Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#dde4d7] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#6b7563] text-[14px]">Loading farmers...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f4f6f2]">
              <tr>
                {['Farmer ID', 'Name', 'Mobile', 'District', 'Land (acres)', 'Registered', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-[600] text-[#6b7563] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {farmers.map((f, i) => (
                <tr key={f.id} className={`border-t border-[#f4f6f2] hover:bg-[#f9faf8] transition-colors ${i === 0 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 text-[12px] font-[600] text-[#181d14] font-mono">{f.farmerId}</td>
                  <td className="px-4 py-3 text-[13px] text-[#181d14]">
                    {f.user ? `${f.user.firstName} ${f.user.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{f.user?.mobileNumber || '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{f.district || '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{f.totalLandArea ?? '—'}</td>
                  <td className="px-4 py-3 text-[12px] text-[#6b7563]">
                    {new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(f)}
                      className="text-[12px] font-[600] text-[#1e5c33] hover:underline"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
              {farmers.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[#6b7563] text-[13px]">No farmers found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-[#6b7563]">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-[#dde4d7] text-[12px] font-[600] text-[#6b7563] disabled:opacity-40 hover:bg-[#f4f6f2] transition-colors"
            >← Prev</button>
            <span className="px-3 py-1.5 text-[12px] text-[#181d14] font-[600]">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#dde4d7] text-[12px] font-[600] text-[#6b7563] disabled:opacity-40 hover:bg-[#f4f6f2] transition-colors"
            >Next →</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-[700] text-[#181d14]">Farmer Details</h2>
              <button onClick={() => setSelected(null)} className="text-[#6b7563] hover:text-[#181d14] text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                ['Farmer ID', selected.farmerId],
                ['Name', selected.user ? `${selected.user.firstName} ${selected.user.lastName}` : '—'],
                ['Mobile', selected.user?.mobileNumber || '—'],
                ['District', selected.district || '—'],
                ['State', selected.state || '—'],
                ['Land Area', selected.totalLandArea ? `${selected.totalLandArea} acres` : '—'],
                ['Registered', new Date(selected.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-[#f4f6f2] last:border-0">
                  <span className="text-[12px] text-[#6b7563]">{label}</span>
                  <span className="text-[13px] font-[600] text-[#181d14]">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
