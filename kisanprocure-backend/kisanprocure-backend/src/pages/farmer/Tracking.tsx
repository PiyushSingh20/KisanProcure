import { useNavigate } from 'react-router';
import { ChevronLeftIcon } from '../../components/Icons';

const STAGES = [
  { label: 'Booking', done: true, time: '9:12 AM' },
  { label: 'Token', done: true, time: '9:15 AM' },
  { label: 'Waiting', done: true, time: '11:00 AM' },
  { label: 'Quality Check', active: true },
  { label: 'Weighing', done: false },
  { label: 'Completed', done: false },
  { label: 'Payment', done: false },
];

export default function Tracking() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full pb-8">
      <div className="bg-white border-b border-[#dde4d7] px-5 pt-14 pb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[#6b7563] mb-4">
          <ChevronLeftIcon size={20} />
          <span className="text-sm font-[500]">Back</span>
        </button>
        <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Procurement status</h1>
        <p className="text-[13px] text-[#6b7563] mt-1">Token KSN-1042 · 10 Sep 2026</p>
      </div>

      <div className="px-5 pt-6 flex flex-col gap-5">
        {/* Current status banner */}
        <div className="bg-[#ea7c0d] rounded-2xl p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔬</span>
          </div>
          <p className="text-[20px] font-[700] text-white">Quality verification</p>
          <p className="text-[14px] text-white/80 mt-1.5">Your produce is currently being checked.</p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-5">Progress</p>
          <div className="flex flex-col">
            {STAGES.map((stage, i) => (
              <div key={stage.label} className="flex items-start gap-4">
                {/* Line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-[700] shrink-0 ${
                      stage.done
                        ? 'bg-[#1e5c33] text-white'
                        : (stage as any).active
                        ? 'bg-[#ea7c0d] text-white ring-4 ring-orange-100'
                        : 'bg-[#f4f6f2] text-[#b0bba8] border border-[#dde4d7]'
                    }`}
                  >
                    {stage.done ? '✓' : (stage as any).active ? '●' : i + 1}
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 ${stage.done ? 'bg-[#1e5c33]' : 'bg-[#dde4d7]'}`} />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-8 flex-1 flex items-center justify-between ${i === STAGES.length - 1 ? 'pb-0' : ''}`}>
                  <p className={`text-[14px] ${(stage as any).active ? 'font-[700] text-[#181d14]' : stage.done ? 'font-[500] text-[#6b7563]' : 'font-[400] text-[#b0bba8]'}`}>
                    {stage.label}
                  </p>
                  {stage.time && <p className="text-[11px] text-[#6b7563]">{stage.time}</p>}
                  {(stage as any).active && (
                    <span className="text-[11px] font-[600] text-[#ea7c0d]">In progress</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div className="bg-[#e6f3eb] rounded-2xl p-4 flex gap-3">
          <span className="text-xl">ℹ️</span>
          <p className="text-[13px] text-[#1e5c33] leading-relaxed">
            Quality verification typically takes 15–20 minutes. You will be notified when weighing begins.
          </p>
        </div>

        <button
          onClick={() => navigate('/farmer/payment')}
          className="w-full h-[54px] rounded-2xl bg-[#1e5c33] text-white text-[16px] font-[600] hover:bg-[#16432a] transition-colors"
        >
          View Payment Details
        </button>
      </div>
    </div>
  );
}
