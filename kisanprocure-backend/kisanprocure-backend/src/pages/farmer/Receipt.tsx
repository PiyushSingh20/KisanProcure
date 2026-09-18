import { useNavigate } from 'react-router';
import { ChevronLeftIcon, DownloadIcon, ShareIcon } from '../../components/Icons';

export default function Receipt() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full pb-8">
      <div className="bg-white border-b border-[#dde4d7] px-5 pt-14 pb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[#6b7563] mb-4">
          <ChevronLeftIcon size={20} />
          <span className="text-sm font-[500]">Back</span>
        </button>
        <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Receipt</h1>
      </div>

      <div className="px-5 pt-6 pb-10 flex flex-col gap-4">
        {/* Receipt card */}
        <div className="bg-white rounded-3xl border border-[#dde4d7] overflow-hidden">
          {/* Header stripe */}
          <div className="bg-[#1e5c33] px-6 py-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg width="18" height="18" viewBox="0 0 44 44" fill="none">
                <path d="M22 8C22 8 10 16 10 28a12 12 0 0024 0C34 16 22 8 22 8z" fill="white" opacity="0.9" />
              </svg>
              <p className="text-white font-[700] text-[16px]">KisanProcure</p>
            </div>
            <p className="text-[#a8d4b8] text-[13px]">Procurement Receipt</p>
          </div>

          {/* Details */}
          <div className="px-6 py-5 flex flex-col gap-0">
            {[
              { label: 'Farmer', value: 'Piyush Kumar' },
              { label: 'Farmer ID', value: 'KP-UP-240891' },
              { label: 'Crop', value: 'Wheat' },
              { label: 'Quantity', value: '520 kg' },
              { label: 'Rate', value: '₹30/kg (MSP 2026)' },
              { label: 'Center', value: 'Lucknow Grain Procurement Center' },
              { label: 'Date', value: '10 September 2026' },
              { label: 'Transaction ID', value: 'TXN-20260910-1042' },
            ].map(({ label, value }, i) => (
              <div key={label}>
                <div className="flex justify-between py-3.5 gap-4">
                  <p className="text-[13px] text-[#6b7563] shrink-0">{label}</p>
                  <p className="text-[13px] font-[500] text-[#181d14] text-right">{value}</p>
                </div>
                {i < 7 && <div className="h-px bg-[#dde4d7]" />}
              </div>
            ))}
          </div>

          {/* Amount */}
          <div className="bg-[#f4f6f2] mx-5 mb-5 rounded-2xl p-4 flex justify-between items-center">
            <p className="text-[15px] font-[600] text-[#181d14]">Total Amount</p>
            <p className="text-[24px] font-[700] text-[#1e5c33] tracking-[-1px]">₹15,600</p>
          </div>

          {/* Status */}
          <div className="pb-5 px-6 flex justify-center">
            <span className="inline-flex items-center gap-2 text-[13px] font-[600] text-[#16a34a] bg-green-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#16a34a]" />
              Payment Completed
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 h-[50px] rounded-2xl bg-[#1e5c33] text-white text-[14px] font-[600] flex items-center justify-center gap-2">
            <DownloadIcon size={17} /> Download
          </button>
          <button className="flex-1 h-[50px] rounded-2xl border border-[#dde4d7] bg-white text-[#181d14] text-[14px] font-[600] flex items-center justify-center gap-2">
            <ShareIcon size={17} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
