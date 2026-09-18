import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BellIcon, ArrowRightIcon, WheatIcon, TrendingUpIcon } from '../../components/Icons';
import { DEMO_CROPS } from '../../lib/demoData';

const STEPS = [
  { label: 'Booking Confirmed', done: true, time: '9:12 AM' },
  { label: 'Token Generated', done: true, time: '9:15 AM' },
  { label: 'Waiting in Queue', active: true },
  { label: 'Moisture & Quality Check', done: false },
  { label: 'Electronic Weighing', done: false },
  { label: 'DBT Direct Payment', done: false },
];

const QUICK_ACTIONS = [
  { label: 'Book Slot', emoji: '📅', path: '/farmer/book', desc: 'Reserve mandi slot' },
  { label: 'Center Map', emoji: '🗺️', path: '/farmer/map', desc: 'Interactive UP map' },
  { label: 'MSP Prices', emoji: '💰', path: '/farmer/crop-prices', desc: 'CACP verified rates' },
  { label: 'My Crops', emoji: '🌾', path: '/farmer/crop-registration', desc: 'Acreage & yields' },
  { label: 'Centres', emoji: '📍', path: '/farmer/centers', desc: 'List of UP centres' },
  { label: 'Live Queue', emoji: '🎟️', path: '/farmer/queue', desc: 'Track token #1042' },
  { label: 'Register', emoji: '📝', path: '/register', desc: 'New farmer ID' },
  { label: 'History', emoji: '📋', path: '/farmer/history', desc: 'Past receipts' },
];

export default function FarmerHome() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good morning (सुप्रभात)');
    else if (hr < 17) setGreeting('Good afternoon (शुभ दोपहर)');
    else setGreeting('Good evening (शुभ संध्या)');
  }, []);

  return (
    <div className="px-5 pt-8 pb-16 flex flex-col gap-5 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#e6f3eb] text-[#1e5c33] border border-[#a8d4b8]">
              SIH26032 Verified Portal
            </span>
          </div>
          <p className="text-[13px] text-[#6b7563] font-medium">{greeting}</p>
          <h1 className="text-[24px] font-bold tracking-tight text-[#181d14] mt-0.5">Ramesh Kumar 👋</h1>
          <p className="text-[11px] text-[#6b7563]">Farmer ID: <span className="font-mono font-bold text-[#1e5c33]">UP-FMR-2024-88421</span></p>
        </div>
        <button
          onClick={() => navigate('/farmer/notifications')}
          className="relative p-2.5 rounded-full bg-white border border-[#dde4d7] hover:bg-[#e6f3eb] transition-colors shadow-2xs"
        >
          <BellIcon size={20} className="text-[#181d14]" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#ea7c0d] border-2 border-white" />
        </button>
      </div>

      {/* Verified MSP Ticker Widget */}
      <div className="bg-white rounded-2xl p-4 border border-[#dde4d7] shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#f4f6f2]">
          <div className="flex items-center gap-1.5">
            <TrendingUpIcon size={14} className="text-[#1e5c33]" />
            <span className="text-xs font-bold text-[#181d14]">Government MSP 2024-25</span>
          </div>
          <button
            onClick={() => navigate('/farmer/crop-prices')}
            className="text-[11px] font-bold text-[#1e5c33] hover:underline flex items-center gap-0.5"
          >
            All Rates →
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
          {DEMO_CROPS.slice(0, 5).map(crop => (
            <div
              key={crop.id}
              onClick={() => navigate('/farmer/crop-prices')}
              className="shrink-0 p-2.5 rounded-xl bg-[#f8faf7] border border-[#dde4d7] hover:border-[#1e5c33]/40 cursor-pointer transition-all min-w-[110px]"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#181d14]">{crop.name}</span>
                <span className="text-[10px] text-[#1e5c33] font-semibold">{crop.hindiName}</span>
              </div>
              <p className="text-sm font-bold text-[#1e5c33] mt-1">₹{crop.msp || '—'}</p>
              <span className="text-[9px] text-[#6b7563]">/Quintal</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Token Live Card */}
      <div
        className="rounded-3xl bg-[#1e5c33] p-6 flex flex-col gap-4 cursor-pointer active:scale-[0.98] transition-all shadow-md text-white"
        onClick={() => navigate('/farmer/queue')}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-[#a8d4b8] uppercase tracking-widest">
            Live Mandi Token
          </p>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10">
            <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-xs text-[#a8d4b8] font-semibold">Active Turn</span>
          </div>
        </div>

        <div>
          <p className="text-[44px] font-bold tracking-tight text-white leading-none font-mono">KSN-1042</p>
          <p className="text-xs text-[#a8d4b8] mt-1.5">Center: <strong>Prayagraj Mandi Samiti</strong></p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/15">
          <div>
            <p className="text-[26px] font-bold text-white leading-none">8</p>
            <p className="text-xs text-[#a8d4b8] mt-0.5">farmers ahead</p>
          </div>
          <div>
            <p className="text-[26px] font-bold text-white leading-none">~35 <span className="text-sm font-normal">min</span></p>
            <p className="text-xs text-[#a8d4b8] mt-0.5">estimated wait</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[#d1e7d8]">Slot: Today · 11:30 AM</span>
          <button className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-colors">
            Track Live Queue <ArrowRightIcon size={14} />
          </button>
        </div>
      </div>

      {/* Quick Actions Grid (8 items) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[#6b7563] font-bold uppercase tracking-wider">Services & Tools</p>
          <span className="text-[10px] text-[#1e5c33] font-semibold">Self-Service Portal</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({ label, emoji, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1.5 p-2.5 bg-white rounded-2xl border border-[#dde4d7] hover:bg-[#e6f3eb] hover:border-[#1e5c33]/40 transition-all active:scale-95 shadow-2xs"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-[11px] font-bold text-[#181d14] text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Procurement Step Progress */}
      <div className="bg-white rounded-2xl p-5 border border-[#dde4d7] shadow-xs">
        <p className="text-xs text-[#6b7563] font-bold uppercase tracking-wider mb-4">Current Delivery Progress</p>
        <div className="flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step.done
                      ? 'bg-[#1e5c33] text-white'
                      : step.active
                      ? 'bg-[#ea7c0d] text-white animate-pulse'
                      : 'bg-[#dde4d7] text-[#6b7563]'
                  }`}
                >
                  {step.done ? '✓' : step.active ? '●' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-0.5 h-6 ${step.done ? 'bg-[#1e5c33]' : 'bg-[#dde4d7]'}`} />
                )}
              </div>
              <div className="pb-5 flex-1 flex items-center justify-between">
                <span
                  className={`text-xs ${
                    step.active ? 'font-bold text-[#181d14]' : step.done ? 'text-[#6b7563] font-medium' : 'text-[#9ca3af]'
                  }`}
                >
                  {step.label}
                </span>
                {step.time && <span className="text-[10px] text-[#6b7563]">{step.time}</span>}
                {step.active && (
                  <span className="text-[10px] font-bold text-[#ea7c0d] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    Now Active
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
