import { useState, useEffect } from 'react';

interface ScheduleItem {
  id: string;
  date: string;
  maxTokens: number;
  isActive: boolean;
  crop?: { name: string; category?: string };
  slots?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    capacity: number;
    bookedCount: number;
    isActive: boolean;
  }>;
}

const FALLBACK_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch-1',
    date: new Date().toISOString(),
    maxTokens: 150,
    isActive: true,
    crop: { name: 'Wheat (Sharbati & FAQ Grade A)', category: 'CEREAL' },
    slots: [
      { id: 'sl-1', startTime: '09:00', endTime: '11:00', capacity: 40, bookedCount: 38, isActive: true },
      { id: 'sl-2', startTime: '11:00', endTime: '13:00', capacity: 40, bookedCount: 35, isActive: true },
      { id: 'sl-3', startTime: '14:00', endTime: '16:00', capacity: 40, bookedCount: 28, isActive: true },
      { id: 'sl-4', startTime: '16:00', endTime: '18:00', capacity: 30, bookedCount: 15, isActive: true },
    ],
  },
  {
    id: 'sch-2',
    date: new Date(Date.now() + 86400000).toISOString(),
    maxTokens: 120,
    isActive: true,
    crop: { name: 'Mustard', category: 'OILSEED' },
    slots: [
      { id: 'sl-5', startTime: '09:00', endTime: '11:00', capacity: 30, bookedCount: 22, isActive: true },
      { id: 'sl-6', startTime: '11:00', endTime: '13:00', capacity: 30, bookedCount: 18, isActive: true },
      { id: 'sl-7', startTime: '14:00', endTime: '16:00', capacity: 30, bookedCount: 10, isActive: true },
      { id: 'sl-8', startTime: '16:00', endTime: '18:00', capacity: 30, bookedCount: 5, isActive: true },
    ],
  },
  {
    id: 'sch-3',
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    maxTokens: 150,
    isActive: true,
    crop: { name: 'Rice (Basmati & Non-Basmati)', category: 'CEREAL' },
    slots: [
      { id: 'sl-9', startTime: '09:00', endTime: '12:00', capacity: 75, bookedCount: 42, isActive: true },
      { id: 'sl-10', startTime: '13:00', endTime: '17:00', capacity: 75, bookedCount: 25, isActive: true },
    ],
  },
];

export default function OfficerSchedules() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(FALLBACK_SCHEDULES);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    setLoading(true);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch('http://localhost:3000/api/v1/officer/schedules', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        setSchedules(json);
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }
    } catch {
      setIsDemo(true);
      setSchedules(FALLBACK_SCHEDULES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[24px] font-[800] text-[#181d14] tracking-tight">Center Procurement Schedules</h1>
            {isDemo && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-[600] bg-amber-100 text-amber-800 border border-amber-200">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#6b7563] mt-1">
            Active crop procurement dates, time windows, and token capacity utilization.
          </p>
        </div>

        <button
          onClick={fetchSchedules}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[13px] font-[600] text-[#556050] hover:bg-[#f8faf7] transition-colors self-start md:self-auto"
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Schedules Cards */}
      <div className="space-y-4">
        {schedules.map((sch) => {
          const totalBooked = sch.slots?.reduce((sum, s) => sum + s.bookedCount, 0) || 0;
          const totalCap = sch.slots?.reduce((sum, s) => sum + s.capacity, 0) || sch.maxTokens || 100;
          const percent = Math.min(100, Math.round((totalBooked / totalCap) * 100));

          return (
            <div key={sch.id} className="bg-white rounded-2xl border border-[#dde4d7] shadow-xs p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#dde4d7] pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-[18px] font-[800] text-[#181d14]">
                      {new Date(sch.date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-[700] bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                  <p className="text-[13px] font-[600] text-[#1e5c33] mt-1">
                    Procuring: {sch.crop?.name || 'All Crops'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[12px] text-[#6b7563]">Overall Day Capacity</p>
                  <p className="text-[15px] font-[800] text-[#181d14]">
                    {totalBooked} / {totalCap} Slots Booked ({percent}%)
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#f0f4ee] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percent > 85 ? 'bg-rose-500' : percent > 60 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Slots Grid */}
              <div>
                <p className="text-[12px] font-[700] uppercase text-[#788572] tracking-wider mb-2">
                  Operating Time Slots
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {sch.slots?.map((slot) => {
                    const slotFull = slot.bookedCount >= slot.capacity;
                    return (
                      <div
                        key={slot.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                          slotFull
                            ? 'bg-gray-50 border-gray-200 opacity-75'
                            : 'bg-[#f8faf7] border-[#dde4d7]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-[700] text-[#181d14]">
                            {slot.startTime} – {slot.endTime}
                          </span>
                          {slotFull && (
                            <span className="text-[10px] font-[700] uppercase text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                              Full
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-baseline justify-between text-[12px]">
                          <span className="text-[#6b7563]">Booked Tokens:</span>
                          <span className="font-[700] text-[#181d14]">
                            {slot.bookedCount} / {slot.capacity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
