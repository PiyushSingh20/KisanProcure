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

interface Center {
  id: string;
  code: string;
  name: string;
  district: string;
  state: string;
  status: string;
  capacityPerDay: number | null;
  contactNumber: string | null;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-[#16a34a]',
  INACTIVE: 'bg-red-50 text-[#dc2626]',
  MAINTENANCE: 'bg-amber-50 text-amber-700',
  SEASONAL: 'bg-blue-50 text-blue-700',
};

const DEMO: Center[] = [
  { id: '1', code: 'LKO-001', name: 'Lucknow Grain Center', district: 'Lucknow', state: 'Uttar Pradesh', status: 'ACTIVE', capacityPerDay: 500, contactNumber: '0522-2345678', createdAt: '2026-07-01T00:00:00Z' },
  { id: '2', code: 'KNP-001', name: 'Kanpur Wheat Center', district: 'Kanpur', state: 'Uttar Pradesh', status: 'ACTIVE', capacityPerDay: 800, contactNumber: '0512-2345678', createdAt: '2026-07-02T00:00:00Z' },
  { id: '3', code: 'PYG-001', name: 'Prayagraj Hub', district: 'Prayagraj', state: 'Uttar Pradesh', status: 'ACTIVE', capacityPerDay: 600, contactNumber: '0532-2345678', createdAt: '2026-07-03T00:00:00Z' },
  { id: '4', code: 'VNS-001', name: 'Varanasi Mandi', district: 'Varanasi', state: 'Uttar Pradesh', status: 'MAINTENANCE', capacityPerDay: 400, contactNumber: '0542-2345678', createdAt: '2026-07-04T00:00:00Z' },
];

export default function AdminCenters() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [selected, setSelected] = useState<Center | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', district: '', state: 'Uttar Pradesh', address: '', pincode: '', capacityPerDay: 500 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ limit: '50' });
    if (search) q.set('search', search);
    const res = await adminFetch<{ data: Center[]; total: number }>(`/centers?${q}`);
    if (res && res.data) {
      setCenters(res.data);
      setTotal(res.total);
      setDemoMode(false);
    } else {
      setCenters(DEMO);
      setTotal(DEMO.length);
      setDemoMode(true);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const createCenter = async () => {
    if (!form.code || !form.name || !form.district) return;
    setSaving(true);
    await adminFetch('/centers', { method: 'POST', body: JSON.stringify(form) });
    setSaving(false);
    setShowCreate(false);
    setForm({ code: '', name: '', district: '', state: 'Uttar Pradesh', address: '', pincode: '', capacityPerDay: 500 });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await adminFetch(`/centers/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    load();
  };

  return (
    <div className="p-6 flex flex-col gap-5 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Procurement Centers</h1>
          <p className="text-[13px] text-[#6b7563] mt-0.5">
            {total} centers
            {demoMode && <span className="ml-2 text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-[600]">Demo Mode</span>}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-[#1e5c33] text-white text-[13px] font-[600] hover:bg-[#16432a] transition-colors"
        >
          + Add Center
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search centers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#dde4d7] bg-white text-[13px] text-[#181d14] placeholder:text-[#a8b4a0] outline-none focus:border-[#1e5c33] transition-colors"
        />
        <button onClick={load} className="px-4 py-2.5 rounded-xl bg-[#1e5c33] text-white text-[13px] font-[600] hover:bg-[#16432a] transition-colors">🔍</button>
      </div>

      <div className="bg-white rounded-2xl border border-[#dde4d7] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#6b7563] text-[14px]">Loading centers...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f4f6f2]">
              <tr>
                {['Code', 'Center Name', 'District', 'Capacity/Day', 'Contact', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-[600] text-[#6b7563] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {centers.map((c, i) => (
                <tr key={c.id} className={`border-t border-[#f4f6f2] hover:bg-[#f9faf8] transition-colors ${i===0?'border-0':''}`}>
                  <td className="px-4 py-3 text-[12px] font-[600] text-[#181d14] font-mono">{c.code}</td>
                  <td className="px-4 py-3 text-[13px] font-[600] text-[#181d14]">{c.name}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{c.district}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{c.capacityPerDay ? `${c.capacityPerDay} farmers` : '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7563]">{c.contactNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-[600] px-2.5 py-1 rounded-full ${STATUS_COLOR[c.status] || 'bg-gray-50 text-gray-600'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2 flex-wrap">
                    <button onClick={() => setSelected(c)} className="text-[12px] font-[600] text-[#1e5c33] hover:underline">View</button>
                    {c.status !== 'ACTIVE' && (
                      <button onClick={() => updateStatus(c.id, 'ACTIVE')} className="text-[12px] font-[600] text-green-700 hover:underline">Activate</button>
                    )}
                    {c.status === 'ACTIVE' && (
                      <button onClick={() => updateStatus(c.id, 'MAINTENANCE')} className="text-[12px] font-[600] text-amber-600 hover:underline">Maintenance</button>
                    )}
                  </td>
                </tr>
              ))}
              {centers.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[#6b7563] text-[13px]">No centers found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-[440px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-[700] text-[#181d14]">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-[#6b7563] hover:text-[#181d14] text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-2">
              {[
                ['Code', selected.code],
                ['District', selected.district],
                ['State', selected.state],
                ['Capacity/Day', selected.capacityPerDay ? `${selected.capacityPerDay} farmers` : '—'],
                ['Contact', selected.contactNumber || '—'],
                ['Status', selected.status],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-[#f4f6f2] last:border-0">
                  <span className="text-[12px] text-[#6b7563]">{l}</span>
                  <span className="text-[13px] font-[600] text-[#181d14]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-[700] text-[#181d14]">Add New Center</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#6b7563] hover:text-[#181d14] text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Center Code', key: 'code', placeholder: 'e.g. LKO-002' },
                { label: 'Center Name', key: 'name', placeholder: 'e.g. Lucknow North Center' },
                { label: 'District', key: 'district', placeholder: 'e.g. Lucknow' },
                { label: 'Address', key: 'address', placeholder: 'Full address' },
                { label: 'Pincode', key: 'pincode', placeholder: '226001' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[12px] text-[#6b7563] mb-1 block">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-[#dde4d7] text-[13px] text-[#181d14] outline-none focus:border-[#1e5c33] transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-[12px] text-[#6b7563] mb-1 block">Capacity per Day</label>
                <input
                  type="number"
                  value={form.capacityPerDay}
                  onChange={e => setForm(f => ({ ...f, capacityPerDay: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#dde4d7] text-[13px] text-[#181d14] outline-none focus:border-[#1e5c33] transition-colors"
                />
              </div>
              <button
                onClick={createCenter}
                disabled={saving}
                className="mt-2 w-full py-3 rounded-xl bg-[#1e5c33] text-white text-[14px] font-[600] hover:bg-[#16432a] disabled:opacity-60 transition-colors"
              >
                {saving ? 'Creating...' : 'Create Center'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
