import { useNavigate } from 'react-router';
import { BellIcon, ArrowRightIcon } from '../../components/Icons';

const STEPS = [
  { label: 'Booking Confirmed', done: true, time: '9:12 AM' },
  { label: 'Token Generated', done: true, time: '9:15 AM' },
  { label: 'Waiting', active: true },
  { label: 'Quality Check', done: false },
  { label: 'Weighing', done: false },
  { label: 'Payment', done: false },
];

const QUICK = [
  { label: 'Book Slot', emoji: '📅', path: '/farmer/book' },
  { label: 'My Token', emoji: '🎟', path: '/farmer/queue' },
  { label: 'Centers', emoji: '📍', path: '/farmer/centers' },
  { label: 'History', emoji: '📋', path: '/farmer/history' },
];

export default function FarmerHome() {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-14 pb-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[14px] text-[#6b7563] font-[400]">Good morning</p>
          <h1 className="text-[26px] font-[700] tracking-[-0.6px] text-[#181d14] mt-0.5">Piyush 👋</h1>
        </div>
        <button
          onClick={() => navigate('/farmer/notifications')}
          className="relative p-2.5 rounded-full bg-white border border-[#dde4d7] hover:bg-[#e6f3eb] transition-colors"
        >
          <BellIcon size={20} className="text-[#181d14]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ea7c0d]" />
        </button>
      </div>

      {/* Active token card */}
      <div
        className="rounded-3xl bg-[#1e5c33] p-6 flex flex-col gap-4 cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => navigate('/farmer/queue')}
      >
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-[600] text-[#a8d4b8] uppercase tracking-widest">Your active token</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-xs text-[#a8d4b8] font-[500]">Live</span>
          </div>
        </div>

        <div>
          <p className="text-[48px] font-[700] tracking-[-2px] text-white leading-none">KSN-1042</p>
          <p className="text-[14px] text-[#a8d4b8] mt-2">Today · 11:30 AM</p>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="text-[28px] font-[700] text-white leading-none">8</p>
            <p className="text-xs text-[#a8d4b8] mt-0.5">farmers ahead</p>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <p className="text-[28px] font-[700] text-white leading-none">~35</p>
            <p className="text-xs text-[#a8d4b8] mt-0.5">min estimated</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-1">
          <div className="h-1.5 rounded-full bg-white/20">
            <div className="h-full rounded-full bg-[#4ade80] w-[40%] transition-all duration-1000" />
          </div>
        </div>

        <button className="self-start flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl text-white text-[14px] font-[600] transition-colors">
          Track Queue
          <ArrowRightIcon size={16} />
        </button>
      </div>

      {/* Today's appointment */}
      <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
        <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-3">Today's appointment</p>
        <div className="flex flex-col gap-2.5">
          <div>
            <p className="text-[16px] font-[600] text-[#181d14]">Lucknow Grain Procurement Center</p>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-[#6b7563]">
            <span>10 September 2026</span>
            <span>·</span>
            <span>11:30 AM</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-[600] text-[#16a34a]">
              <div className="w-2 h-2 rounded-full bg-[#16a34a]" />
              Confirmed
            </span>
            <button
              onClick={() => navigate('/farmer/tracking')}
              className="text-[13px] font-[600] text-[#1e5c33] flex items-center gap-1"
            >
              View Details <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-3">Quick actions</p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK.map(({ label, emoji, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-[#dde4d7] hover:bg-[#e6f3eb] hover:border-[#1e5c33]/30 transition-all active:scale-95"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-[11px] font-[500] text-[#6b7563] text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Procurement timeline */}
      <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
        <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-4">Procurement status</p>
        <div className="flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-[700] ${
                    step.done
                      ? 'bg-[#1e5c33] text-white'
                      : step.active
                      ? 'bg-[#ea7c0d] text-white'
                      : 'bg-[#dde4d7] text-[#6b7563]'
                  }`}
                >
                  {step.done ? '✓' : step.active ? '●' : '○'}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-0.5 h-6 ${step.done ? 'bg-[#1e5c33]' : 'bg-[#dde4d7]'}`} />
                )}
              </div>
              <div className="pb-6 flex-1 flex items-center justify-between">
                <span
                  className={`text-[14px] ${
                    step.active ? 'font-[700] text-[#181d14]' : step.done ? 'text-[#6b7563]' : 'text-[#b0bba8]'
                  }`}
                >
                  {step.label}
                </span>
                {step.time && <span className="text-[11px] text-[#6b7563]">{step.time}</span>}
                {step.active && (
                  <span className="text-[11px] font-[600] text-[#ea7c0d] bg-orange-50 px-2 py-0.5 rounded-full">
                    In progress
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
