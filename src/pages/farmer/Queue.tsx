import { useNavigate } from 'react-router';
import { ChevronLeftIcon } from '../../components/Icons';

export default function Queue() {
  const navigate = useNavigate();
  const ahead = 8;
  const total = 20;
  const progress = ((total - ahead) / total) * 100;

  return (
    <div className="min-h-full bg-[#f4f6f2] pb-8">
      {/* Header */}
      <div className="bg-white border-b border-[#dde4d7] px-5 pt-14 pb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[#6b7563] mb-4">
          <ChevronLeftIcon size={20} />
          <span className="text-sm font-[500]">Back</span>
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Your queue</h1>
          <div className="flex items-center gap-1.5 bg-[#e6f3eb] px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span className="text-[12px] font-[600] text-[#1e5c33]">Live</span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 flex flex-col gap-5">
        {/* Position card */}
        <div className="bg-white rounded-3xl p-6 border border-[#dde4d7] text-center">
          <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-3">Your position</p>
          <p className="text-[80px] font-[700] tracking-[-4px] text-[#1e5c33] leading-none">#8</p>
          <p className="text-[16px] text-[#6b7563] mt-2">8 farmers ahead of you</p>
        </div>

        {/* Wait time */}
        <div className="bg-[#1e5c33] rounded-3xl p-6 text-center">
          <p className="text-[12px] font-[600] text-[#a8d4b8] uppercase tracking-widest mb-3">Estimated waiting</p>
          <p className="text-[64px] font-[700] tracking-[-3px] text-white leading-none">35</p>
          <p className="text-[16px] text-[#a8d4b8] mt-1">minutes</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest">Queue progress</p>
              <p className="text-[14px] text-[#181d14] font-[500] mt-1">{total - ahead} of {total} processed</p>
            </div>
            <p className="text-[24px] font-[700] text-[#1e5c33]">{Math.round(progress)}%</p>
          </div>
          <div className="h-2 bg-[#e6f3eb] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1e5c33] rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tokens */}
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <p className="text-[12px] text-[#6b7563] font-[500]">Currently serving</p>
              <p className="text-[20px] font-[700] text-[#181d14] font-mono tracking-wider">KSN-1034</p>
            </div>
            <div className="text-right flex flex-col gap-0.5">
              <p className="text-[12px] text-[#6b7563] font-[500]">Your token</p>
              <p className="text-[20px] font-[700] text-[#1e5c33] font-mono tracking-wider">KSN-1042</p>
            </div>
          </div>
          <div className="h-px bg-[#dde4d7]" />
          <p className="text-[13px] text-[#6b7563] text-center leading-relaxed">
            Please arrive at the center before your token is called.
          </p>
        </div>

        {/* Notify me */}
        <button className="w-full h-[54px] rounded-2xl border-2 border-[#1e5c33] text-[#1e5c33] text-[15px] font-[600] hover:bg-[#e6f3eb] transition-colors">
          Notify me when 3 ahead
        </button>
      </div>
    </div>
  );
}
