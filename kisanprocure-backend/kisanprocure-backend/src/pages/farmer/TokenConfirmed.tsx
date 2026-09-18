import { useNavigate } from 'react-router';
import { CalendarIcon, DownloadIcon } from '../../components/Icons';

export default function TokenConfirmed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-white flex flex-col items-center px-6 pt-16 pb-10">
      {/* Success icon */}
      <div
        className="w-24 h-24 rounded-full bg-[#e6f3eb] flex items-center justify-center mb-6"
        style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="w-16 h-16 rounded-full bg-[#1e5c33] flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>

      <h1 className="text-[28px] font-[700] tracking-[-0.5px] text-[#181d14] text-center">Slot Confirmed</h1>
      <p className="text-[15px] text-[#6b7563] mt-2 text-center">Your booking is confirmed. See you soon!</p>

      {/* Token card */}
      <div className="w-full mt-8 bg-[#1e5c33] rounded-3xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-[600] text-[#a8d4b8] uppercase tracking-widest">Your token</p>
            <p className="text-[52px] font-[700] tracking-[-2px] text-white leading-none mt-1">KSN-1042</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              {/* QR placeholder */}
              <rect x="4" y="4" width="12" height="12" rx="2" fill="white" opacity="0.8" />
              <rect x="20" y="4" width="12" height="12" rx="2" fill="white" opacity="0.8" />
              <rect x="4" y="20" width="12" height="12" rx="2" fill="white" opacity="0.8" />
              <rect x="20" y="20" width="5" height="5" rx="1" fill="white" opacity="0.8" />
              <rect x="27" y="20" width="5" height="5" rx="1" fill="white" opacity="0.8" />
              <rect x="20" y="27" width="12" height="5" rx="1" fill="white" opacity="0.8" />
            </svg>
          </div>
        </div>

        <div className="h-px bg-white/20" />

        <div className="flex flex-col gap-2.5">
          {[
            { label: 'Center', value: 'Lucknow Grain Procurement Center' },
            { label: 'Date', value: '10 September 2026' },
            { label: 'Time', value: '11:30 AM' },
            { label: 'Estimated wait', value: '~35 minutes' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <p className="text-[12px] text-[#a8d4b8] shrink-0">{label}</p>
              <p className="text-[13px] text-white font-[500] text-right">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="w-full mt-6 flex flex-col gap-3">
        <button
          onClick={() => navigate('/farmer/queue')}
          className="w-full h-[54px] rounded-2xl bg-[#1e5c33] text-white text-[16px] font-[600] hover:bg-[#16432a] transition-colors"
        >
          Track My Queue
        </button>
        <button className="w-full h-[54px] rounded-2xl border border-[#dde4d7] text-[#181d14] text-[15px] font-[500] flex items-center justify-center gap-2 hover:bg-[#f4f6f2] transition-colors">
          <CalendarIcon size={18} />
          Add to Calendar
        </button>
        <button className="w-full h-[54px] rounded-2xl border border-[#dde4d7] text-[#181d14] text-[15px] font-[500] flex items-center justify-center gap-2 hover:bg-[#f4f6f2] transition-colors">
          <DownloadIcon size={18} />
          Download Token
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
