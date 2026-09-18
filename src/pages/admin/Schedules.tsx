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

interface Schedule {
  id: string;
  centerId: string;
  centerName?: string;
  cropId: string;
  cropName?: string;
  startDate: string;
  endDate: string;
  openingTime: string;
  closingTime: string;
  capacityPerSlot: number;
  status: string;
}

const DEMO: Schedule[] = [
  { id: '1', centerId: 'c1', centerName: 'Lucknow Grain Center', cropId: 'cr1', cropName: 'Wheat', startDate: '2026-10-01', endDate: '2026-11-30', openingTime: '08:00', closingTime: '16:00', capacityPerSlot: 50, status: 'SCHEDULED' },
  { id: '2', centerId: 'c2', centerName: 'Kanpur Wheat Center', cropId: 'cr1', cropName: 'Wheat', startDate: '2026-10-05', endDate: '2026-11-25', openingTime: '07:30', closingTime: '15:00', capacityPerSlot: 80, status: 'SCHEDULED' },
  { id: '3', centerId: 'c3', centerName: 'Prayagraj Hub', cropId: 'cr2', cropName: 'Rice', startDate: '2026-11-01', endDate: '2026-12-15', openingTime: '08:00', closingTime: '17:00', capacityPerSlot: 60, status: 'DRAFT' },
];

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SCHEDULED: 'bg-blue-50 text-blue-700',
  ACTIVE: 'bg-green-50 text-[#16a34a]',
  CLOSED: 'bg-red-50 text-[#dc2626]',
};

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    centerName: '',
    cropName: '',
    startDate: '',
    endDate: '',
    openingTime: '08:00',
    closingTime: '16:00',
    capacityPerSlot: 50,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch<{ data: Schedule[]; total: number }>('/schedules?limit=50');
    if (res && res.data) {
      setSchedules(res.data);
      setDemoMode(false);
    } else {
      setSchedules(DEMO);
      setDemoMode(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createSchedule = async () => {
    if (!form.centerName || !form.startDate || !form.endDate) return;
    await adminFetch('/schedules', { method: 'POST', body: JSON.stringify(form) });
    setShowCreate(false);
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await adminFetch(`/schedules/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    load();
  };

  return (
    <div className="p-6 flex flex-col gap-5 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Procurement Schedules</h1>
          <p className="text-[13px] text-[#6b7563] mt-0.5">
            {schedules.length} schedules configured
            {demoMode && <span className="ml-2 text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-[600]">Demo Mode</span>}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-[#1e5c33] text-white text-[13px] font-[600] hover:bg-[#16432a] transition-colors"
        >
          + New Schedule
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-[#dde4d7] flex items-center justify-center h-48 text-[#6b7563] text-[14px]">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#dde4d7] flex items-center justify-center h-48 text-[#6b7563] text-[14px]">No schedules found</div>
        ) : (
          schedules.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-[#dde4d7] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-[600] px-2.5 py-1 rounded-full ${STATUS_COLOR[s.status] || 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                    <span className="text-[11px] text-[#6b7563] bg-[#f4f6f2] px-2 py-0.5 rounded-full">{s.cropName || 'All Crops'}</span>
                  </div>
                  <p className="text-[15px] font-[700] text-[#181d14]">{s.centerName || 'Center'}</p>
                  <div className="flex items-center gap-4 mt-2 text-[12px] text-[#6b7563]">
                    <span>📅 {new Date(s.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {new Date(s.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span>⏰ {s.openingTime} – {s.closingTime}</span>
                    <span>👥 {s.capacityPerSlot} farmers/slot</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {s.status === 'DRAFT' && (
                    <button onClick={() => updateStatus(s.id, 'SCHEDULED')} className="px-3 py-1.5 rounded-xl text-[12px] font-[600] bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">Publish</button>
                  )}
                  {s.status === 'SCHEDULED' && (
                    <button onClick={() => updateStatus(s.id, 'ACTIVE')} className="px-3 py-1.5 rounded-xl text-[12px] font-[600] bg-green-50 text-[#16a34a] hover:bg-green-100 transition-colors">Activate</button>
                  )}
                  {(s.status === 'ACTIVE' || s.status === 'SCHEDULED') && (
                    <button onClick={() => updateStatus(s.id, 'CLOSED')} className="px-3 py-1.5 rounded-xl text-[12px] font-[600] bg-red-50 text-[#dc2626] hover:bg-red-100 transition-colors">Close</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-[700] text-[#181d14]">Create Schedule</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#6b7563] hover:text-[#181d14] text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Center Name', key: 'centerName', type: 'text', placeholder: 'e.g. Lucknow Grain Center' },
                { label: 'Crop', key: 'cropName', type: 'text', placeholder: 'e.g. Wheat' },
                { label: 'Start Date', key: 'startDate', type: 'date', placeholder: '' },
                { label: 'End Date', key: 'endDate', type: 'date', placeholder: '' },
                { label: 'Opening Time', key: 'openingTime', type: 'time', placeholder: '' },
                { label: 'Closing Time', key: 'closingTime', type: 'time', placeholder: '' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-[12px] text-[#6b7563] mb-1 block">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-[#dde4d7] text-[13px] text-[#181d14] outline-none focus:border-[#1e5c33] transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-[12px] text-[#6b7563] mb-1 block">Capacity per Slot</label>
                <input
                  type="number"
                  value={form.capacityPerSlot}
                  onChange={e => setForm(f => ({ ...f, capacityPerSlot: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#dde4d7] text-[13px] text-[#181d14] outline-none focus:border-[#1e5c33] transition-colors"
                />
              </div>
              <button
                onClick={createSchedule}
                className="mt-2 w-full py-3 rounded-xl bg-[#1e5c33] text-white text-[14px] font-[600] hover:bg-[#16432a] transition-colors"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
