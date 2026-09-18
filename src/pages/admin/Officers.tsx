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

interface OfficerRow {
  id: string;
  employeeId: string;
  designation: string | null;
  isActive: boolean;
  createdAt: string;
  user?: { firstName: string; lastName: string; mobileNumber: string };
  center?: { name: string; district: string } | null;
}

const DEMO_OFFICERS: OfficerRow[] = [
  { id: '1', employeeId: 'KP-O-001', designation: 'Center Incharge', isActive: true, createdAt: '2026-08-01T09:00:00Z', user: { firstName: 'Anil', lastName: 'Kumar', mobileNumber: '9876501234' }, center: { name: 'Lucknow Grain Center', district: 'Lucknow' } },
  { id: '2', employeeId: 'KP-O-002', designation: 'Quality Inspector', isActive: true, createdAt: '2026-08-05T10:00:00Z', user: { firstName: 'Priya', lastName: 'Singh', mobileNumber: '9812300001' }, center: { name: 'Kanpur Wheat Center', district: 'Kanpur' } },
  { id: '3', employeeId: 'KP-O-003', designation: 'Weighbridge Operator', isActive: false, createdAt: '2026-08-10T08:00:00Z', user: { firstName: 'Vikas', lastName: 'Tiwari', mobileNumber: '9898700001' }, center: null },
];

export default function AdminOfficers() {
  const [officers, setOfficers] = useState<OfficerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<OfficerRow | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) q.set('search', search);
    const res = await adminFetch<{ data: OfficerRow[]; total: number }>(`/officers?${q}`);
    if (res && res.data) {
      setOfficers(res.data);
      setTotal(res.total);
      setDemoMode(false);
    } else {
      setOfficers(DEMO_OFFICERS);
      setTotal(DEMO_OFFICERS.length);
      setDemoMode(true);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  const toggleActive = async (id: string, current: boolean) => {
    await adminFetch(`/officers/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !current }) });
    load();
  };

  return (
    <div className="p-6 flex flex-col gap-5 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Officers</h1>
          <p className="text-[13px] text-[#6b7563] mt-0.5">
            {total} procurement officers
            {demoMode && <span className="ml-2 text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-[600]">Demo Mode</span>}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search name or mobile..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#dde4d7] bg-white text-[13px] text-[#181d14] placeholder:text-[#a8b4a0] outline-none focus:border-[#1e5c33] transition-colors"
        />
        <button onClick={load} className="px-4 py-2.5 rounded-xl bg-[#1e5c33] text-white text-[13px] font-[600] hover:bg-[#16432a] transition-colors">
          🔍 Search
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#dde4d7] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#6b7563] text-[14px]">Loading officers...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f4f6f2]">
              <tr>
                {['Employee ID', 'Name', 'Mobile', 'Designation', 'Assigned Center', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-[600] text-[#6b7563] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {officers.map((o, i) => (
                <tr key={o.id} className={`border-t border-[#f4f6f2] hover:bg-[#f9faf8] transition-colors ${i === 0 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 text-[12px] font-[600] text-[#181d14] font-mono">{o.employeeId}</td>
                  <td className="px-4 py-3 text-[13px] text-[#181d14]">
                    {o.user ? `${o.user.firstName} ${o.user.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{o.user?.mobileNumber || '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{o.designation || 'Officer'}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">
                    {o.center ? `${o.center.name}` : <span className="text-amber-600">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-[600] px-2.5 py-1 rounded-full ${o.isActive ? 'bg-green-50 text-[#16a34a]' : 'bg-red-50 text-[#dc2626]'}`}>
                      {o.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => setSelected(o)} className="text-[12px] font-[600] text-[#1e5c33] hover:underline">View</button>
                    <button onClick={() => toggleActive(o.id, o.isActive)} className="text-[12px] font-[600] text-[#6b7563] hover:text-[#181d14]">
                      {o.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {officers.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[#6b7563] text-[13px]">No officers found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-[#6b7563]">Showing {(page-1)*limit+1}–{Math.min(page*limit, total)} of {total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg border border-[#dde4d7] text-[12px] font-[600] text-[#6b7563] disabled:opacity-40 hover:bg-[#f4f6f2] transition-colors">← Prev</button>
            <span className="px-3 py-1.5 text-[12px] text-[#181d14] font-[600]">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1.5 rounded-lg border border-[#dde4d7] text-[12px] font-[600] text-[#6b7563] disabled:opacity-40 hover:bg-[#f4f6f2] transition-colors">Next →</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-[700] text-[#181d14]">Officer Details</h2>
              <button onClick={() => setSelected(null)} className="text-[#6b7563] hover:text-[#181d14] text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                ['Employee ID', selected.employeeId],
                ['Name', selected.user ? `${selected.user.firstName} ${selected.user.lastName}` : '—'],
                ['Mobile', selected.user?.mobileNumber || '—'],
                ['Designation', selected.designation || 'Officer'],
                ['Assigned Center', selected.center?.name || 'Not Assigned'],
                ['Status', selected.isActive ? 'Active' : 'Inactive'],
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
