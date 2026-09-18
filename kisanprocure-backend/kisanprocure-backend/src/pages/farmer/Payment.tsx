import { useNavigate } from 'react-router';
import { ChevronLeftIcon, ArrowRightIcon, DownloadIcon } from '../../components/Icons';

export default function Payment() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full pb-8">
      {/* Top Header */}
      <div className="bg-white border-b border-[#dde4d7] px-5 pt-14 pb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-[#6b7563] mb-4 hover:text-[#181d14] transition-colors"
        >
          <ChevronLeftIcon size={20} />
          <span className="text-sm font-[500]">Back</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Payment Details</h1>
            <p className="text-[13px] text-[#6b7563] mt-1">Token KSN-1042 · 10 Sep 2026</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-[600] text-[#16a34a] bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <div className="w-2 h-2 rounded-full bg-[#16a34a]" />
            Completed
          </span>
        </div>
      </div>

      <div className="px-5 pt-6 flex flex-col gap-5">
        {/* Status Card */}
        <div className="bg-[#1e5c33] rounded-3xl p-6 text-white flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-[600] text-[#a8d4b8] uppercase tracking-widest">
              Direct Benefit Transfer
            </p>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>

          <div>
            <p className="text-[14px] text-[#a8d4b8]">Total Amount Credited</p>
            <p className="text-[42px] font-[700] tracking-[-1.5px] text-white leading-tight mt-1">
              ₹15,600
            </p>
          </div>

          <div className="h-px bg-white/20" />

          <div className="flex justify-between items-center text-[13px] text-[#a8d4b8]">
            <span>Status</span>
            <span className="font-[600] text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
              Transferred to Bank Account
            </span>
          </div>
        </div>

        {/* Procurement Summary */}
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-4">
            Procurement Summary
          </p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Crop Procured', value: 'Wheat (Grade A)' },
              { label: 'Quantity', value: '520 kg' },
              { label: 'MSP Rate', value: '₹30 / kg' },
              { label: 'Gross Value', value: '₹15,600' },
              { label: 'Deductions / Fee', value: '₹0' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-[14px]">
                <span className="text-[#6b7563]">{label}</span>
                <span className="font-[600] text-[#181d14]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bank & Transfer Details */}
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
          <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-4">
            Transaction Details
          </p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Beneficiary', value: 'Piyush Kumar' },
              { label: 'Bank Name', value: 'State Bank of India' },
              { label: 'Account No.', value: '•••• •••• 4289' },
              { label: 'Transaction ID', value: 'TXN-20260910-1042' },
              { label: 'UTR Number', value: 'SBIN00049281903' },
              { label: 'Payment Mode', value: 'PFMS / DBT' },
              { label: 'Date & Time', value: '10 Sep 2026 · 12:45 PM' },
            ].map(({ label, value }, i, arr) => (
              <div key={label}>
                <div className="flex justify-between items-center text-[13px] py-1">
                  <span className="text-[#6b7563]">{label}</span>
                  <span className="font-[500] text-[#181d14] font-mono">{value}</span>
                </div>
                {i < arr.length - 1 && <div className="h-px bg-[#f4f6f2] my-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => navigate('/farmer/receipt')}
            className="w-full h-[54px] rounded-2xl bg-[#1e5c33] text-white text-[16px] font-[600] hover:bg-[#16432a] transition-colors active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
          >
            <span>View Official Receipt</span>
            <ArrowRightIcon size={16} />
          </button>

          <button
            onClick={() => window.print()}
            className="w-full h-[54px] rounded-2xl border border-[#dde4d7] bg-white text-[#181d14] text-[15px] font-[500] hover:bg-[#f4f6f2] transition-colors flex items-center justify-center gap-2"
          >
            <DownloadIcon size={18} />
            <span>Download Payment Statement</span>
          </button>
        </div>
      </div>
    </div>
  );
}
