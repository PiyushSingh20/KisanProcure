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

interface Complaint {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  farmer?: { user?: { firstName: string; lastName: string } };
}

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-amber-50 text-amber-700',
  URGENT: 'bg-red-50 text-[#dc2626]',
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  RESOLVED: 'bg-green-50 text-[#16a34a]',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const DEMO: Complaint[] = [
  { id: '1', ticketNumber: 'TKT-001', subject: 'Payment not received', description: 'My wheat payment was supposed to arrive 3 days ago but has not been credited.', category: 'PAYMENT', priority: 'HIGH', status: 'OPEN', resolution: null, createdAt: '2026-09-17T10:00:00Z', farmer: { user: { firstName: 'Ramesh', lastName: 'Yadav' } } },
  { id: '2', ticketNumber: 'TKT-002', subject: 'Wrong quality grade assigned', description: 'My wheat was assigned Grade B but it is Grade A quality.', category: 'QUALITY', priority: 'MEDIUM', status: 'IN_PROGRESS', resolution: null, createdAt: '2026-09-16T14:00:00Z', farmer: { user: { firstName: 'Sunil', lastName: 'Verma' } } },
  { id: '3', ticketNumber: 'TKT-003', subject: 'Long waiting time at center', description: 'Waited for 6 hours at Kanpur center without any update.', category: 'OPERATIONS', priority: 'LOW', status: 'RESOLVED', resolution: 'Apologized and scheduled priority slot for next visit.', createdAt: '2026-09-15T08:00:00Z', farmer: { user: { firstName: 'Mohan', lastName: 'Gupta' } } },
];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ limit: '50' });
    if (statusFilter) q.set('status', statusFilter);
    const res = await adminFetch<{ data: Complaint[]; total: number }>(`/complaints?${q}`);
    if (res && res.data) {
      setComplaints(res.data);
      setTotal(res.total);
      setDemoMode(false);
    } else {
      const filtered = statusFilter ? DEMO.filter(c => c.status === statusFilter) : DEMO;
      setComplaints(filtered);
      setTotal(filtered.length);
      setDemoMode(true);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const resolveComplaint = async () => {
    if (!selected || !resolution.trim()) return;
    setResolving(true);
    await adminFetch(`/complaints/${selected.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'RESOLVED', resolution }),
    });
    setResolving(false);
    setSelected(null);
    setResolution('');
    load();
  };

  const openCount = complaints.filter(c => c.status === 'OPEN').length;
  const inProgressCount = complaints.filter(c => c.status === 'IN_PROGRESS').length;

  return (
    <div className="p-6 flex flex-col gap-5 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Complaints & Support</h1>
          <p className="text-[13px] text-[#6b7563] mt-0.5">
            {openCount} open · {inProgressCount} in progress
            {demoMode && <span className="ml-2 text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-[600]">Demo Mode</span>}
          </p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-[600] transition-colors ${
              statusFilter === s ? 'bg-[#1e5c33] text-white' : 'bg-white text-[#6b7563] border border-[#dde4d7] hover:bg-[#f4f6f2]'
            }`}
          >
            {s || 'All'} {s === '' && `(${total})`}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#dde4d7] flex items-center justify-center h-48 text-[#6b7563] text-[14px]">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#dde4d7] flex items-center justify-center h-48 text-[#6b7563] text-[14px]">No complaints found</div>
        ) : (
          complaints.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-[#dde4d7] p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-[600] text-[#181d14] font-mono">{c.ticketNumber}</span>
                    <span className={`text-[11px] font-[600] px-2 py-0.5 rounded-full ${PRIORITY_COLOR[c.priority]}`}>{c.priority}</span>
                    <span className={`text-[11px] font-[600] px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status]}`}>{c.status.replace('_', ' ')}</span>
                    <span className="text-[11px] text-[#6b7563] bg-[#f4f6f2] px-2 py-0.5 rounded-full">{c.category}</span>
                  </div>
                  <p className="text-[14px] font-[600] text-[#181d14] mb-1">{c.subject}</p>
                  <p className="text-[12px] text-[#6b7563] line-clamp-2">{c.description}</p>
                  {c.resolution && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                      <p className="text-[11px] font-[600] text-[#16a34a] mb-0.5">Resolution</p>
                      <p className="text-[12px] text-[#16a34a]">{c.resolution}</p>
                    </div>
                  )}
                  <p className="text-[11px] text-[#a8b4a0] mt-2">
                    By {c.farmer?.user ? `${c.farmer.user.firstName} ${c.farmer.user.lastName}` : 'Unknown'} · {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {(c.status === 'OPEN' || c.status === 'IN_PROGRESS') && (
                  <button
                    onClick={() => { setSelected(c); setResolution(''); }}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-[#1e5c33] text-white text-[12px] font-[600] hover:bg-[#16432a] transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolve Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-[700] text-[#181d14]">Resolve Complaint</h2>
              <button onClick={() => setSelected(null)} className="text-[#6b7563] hover:text-[#181d14] text-xl">✕</button>
            </div>
            <p className="text-[13px] font-[600] text-[#181d14] mb-1">{selected.subject}</p>
            <p className="text-[12px] text-[#6b7563] mb-4">{selected.description}</p>
            <label className="text-[12px] text-[#6b7563] mb-2 block font-[600]">Resolution Note</label>
            <textarea
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              placeholder="Describe how this complaint was resolved..."
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-[#dde4d7] text-[13px] text-[#181d14] outline-none focus:border-[#1e5c33] resize-none transition-colors"
            />
            <button
              onClick={resolveComplaint}
              disabled={resolving || !resolution.trim()}
              className="mt-3 w-full py-3 rounded-xl bg-[#1e5c33] text-white text-[14px] font-[600] hover:bg-[#16432a] disabled:opacity-60 transition-colors"
            >
              {resolving ? 'Saving...' : 'Mark as Resolved'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
