import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRightIcon } from '../../components/Icons';

const FILTERS = ['All', 'Completed', 'Pending', 'Cancelled'];

const BOOKINGS = [
  { id: 1, crop: 'Wheat', qty: '520 kg', date: '10 Sep 2026', center: 'Lucknow Grain Center', status: 'Completed', amount: '₹15,600' },
  { id: 2, crop: 'Rice', qty: '320 kg', date: '24 Aug 2026', center: 'Kanpur Wheat Center', status: 'Completed', amount: '₹9,600' },
  { id: 3, crop: 'Maize', qty: '200 kg', date: '10 Aug 2026', center: 'Unnao Procurement Hub', status: 'Cancelled', amount: '—' },
  { id: 4, crop: 'Wheat', qty: '480 kg', date: '15 Jul 2026', center: 'Lucknow Grain Center', status: 'Completed', amount: '₹14,400' },
];

const STATUS_STYLE: Record<string, string> = {
  Completed: 'text-[#16a34a] bg-green-50',
  Pending: 'text-[#ea7c0d] bg-orange-50',
  Cancelled: 'text-[#dc2626] bg-red-50',
};

export default function History() {
  const navigate = useNavigate();
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? BOOKINGS : BOOKINGS.filter((b) => b.status === active);

  return (
    <div className="min-h-full pb-6">
      <div className="bg-white border-b border-[#dde4d7] px-5 pt-14 pb-4">
        <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14] mb-4">Booking history</h1>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-[500] transition-colors ${
                active === f ? 'bg-[#1e5c33] text-white' : 'bg-[#f4f6f2] text-[#6b7563] border border-[#dde4d7]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-[16px] font-[600] text-[#181d14]">No {active.toLowerCase()} bookings</p>
            <p className="text-[14px] text-[#6b7563] mt-1">Your booking history will appear here</p>
          </div>
        ) : (
          filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[16px] font-[600] text-[#181d14]">{b.crop}</p>
                    <span className="text-[12px] text-[#6b7563]">· {b.qty}</span>
                  </div>
                  <p className="text-[13px] text-[#6b7563]">{b.center}</p>
                  <p className="text-[12px] text-[#6b7563] mt-0.5">{b.date}</p>
                </div>
                <span className={`text-[12px] font-[600] px-2.5 py-1 rounded-full ${STATUS_STYLE[b.status]}`}>
                  {b.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[20px] font-[700] text-[#181d14]">{b.amount}</p>
                {b.status === 'Completed' && (
                  <button
                    onClick={() => navigate('/farmer/receipt')}
                    className="flex items-center gap-1 text-[#1e5c33] text-[13px] font-[600]"
                  >
                    Receipt <ArrowRightIcon size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
