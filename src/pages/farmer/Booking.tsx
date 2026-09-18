import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeftIcon } from '../../components/Icons';

const CROPS = ['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton'];
const DATES = ['10 Sep', '11 Sep', '12 Sep', '13 Sep', '14 Sep'];
const SLOTS = [
  { time: '9:00 AM', available: 12, full: false },
  { time: '11:30 AM', available: 8, full: false },
  { time: '2:00 PM', available: 3, full: false },
  { time: '4:00 PM', available: 0, full: true },
];

const STEPS = ['Crop', 'Quantity', 'Date', 'Time'];

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState('');
  const [qty, setQty] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  const canNext = [
    crop !== '',
    qty !== '' && Number(qty) > 0,
    date !== '',
    slot !== '',
  ][step];

  const next = () => {
    if (step < 3) setStep(step + 1);
    else navigate('/farmer/book/confirmed');
  };

  return (
    <div className="min-h-full pb-32 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#dde4d7] px-5 pt-14 pb-5">
        <button onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))} className="flex items-center gap-1 text-[#6b7563] mb-4">
          <ChevronLeftIcon size={20} />
          <span className="text-sm font-[500]">Back</span>
        </button>
        <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Book a Slot</h1>
        <p className="text-[14px] text-[#6b7563] mt-1">Lucknow Grain Procurement Center</p>

        {/* Step indicators */}
        <div className="flex gap-1 mt-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col gap-1.5">
              <div className={`h-1 rounded-full transition-colors ${i <= step ? 'bg-[#1e5c33]' : 'bg-[#dde4d7]'}`} />
              <p className={`text-[11px] font-[500] ${i === step ? 'text-[#1e5c33]' : 'text-[#6b7563]'}`}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pt-6">
        {/* Step 0: Crop */}
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[16px] font-[600] text-[#181d14]">Select your crop</p>
            {CROPS.map((c) => (
              <button
                key={c}
                onClick={() => setCrop(c)}
                className={`w-full py-4 px-5 rounded-2xl border text-left text-[15px] font-[500] transition-all ${
                  crop === c
                    ? 'border-[#1e5c33] bg-[#e6f3eb] text-[#1e5c33]'
                    : 'border-[#dde4d7] bg-white text-[#181d14]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Quantity */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-[16px] font-[600] text-[#181d14]">Enter quantity</p>
            <div className="bg-white rounded-2xl p-5 border border-[#dde4d7]">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="flex-1 text-[48px] font-[700] text-[#1e5c33] tracking-[-2px] outline-none bg-transparent"
                  autoFocus
                />
                <span className="text-[18px] text-[#6b7563] font-[500]">kg</span>
              </div>
              <p className="text-[13px] text-[#6b7563] mt-2">Crop: {crop}</p>
            </div>
            <p className="text-[12px] text-[#6b7563]">Maximum limit: 2,000 kg per booking</p>
          </div>
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-[16px] font-[600] text-[#181d14]">Select date</p>
            {DATES.map((d) => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`w-full py-4 px-5 rounded-2xl border text-left text-[15px] font-[500] transition-all ${
                  date === d
                    ? 'border-[#1e5c33] bg-[#e6f3eb] text-[#1e5c33]'
                    : 'border-[#dde4d7] bg-white text-[#181d14]'
                }`}
              >
                {d}, 2026
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div className="flex flex-col gap-3">
            <p className="text-[16px] font-[600] text-[#181d14]">Select time slot</p>
            {SLOTS.map((s) => (
              <button
                key={s.time}
                onClick={() => !s.full && setSlot(s.time)}
                disabled={s.full}
                className={`w-full py-4 px-5 rounded-2xl border text-left transition-all ${
                  s.full
                    ? 'border-[#dde4d7] bg-[#f4f6f2] opacity-50 cursor-not-allowed'
                    : slot === s.time
                    ? 'border-[#1e5c33] bg-[#e6f3eb]'
                    : 'border-[#dde4d7] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-[16px] font-[600] ${slot === s.time ? 'text-[#1e5c33]' : 'text-[#181d14]'}`}>{s.time}</p>
                  <span className={`text-[13px] font-[500] ${s.full ? 'text-[#dc2626]' : 'text-[#6b7563]'}`}>
                    {s.full ? 'Full' : `${s.available} slots`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-[70px] left-0 right-0 px-5 pb-4 bg-gradient-to-t from-[#f4f6f2] to-transparent pt-6">
        <div className="max-w-sm mx-auto">
          <button
            onClick={next}
            disabled={!canNext}
            className="w-full h-[54px] rounded-2xl bg-[#1e5c33] text-white text-[16px] font-[600] hover:bg-[#16432a] transition-colors active:scale-[0.98] disabled:opacity-40"
          >
            {step < 3 ? 'Continue' : 'Confirm Slot'}
          </button>
        </div>
      </div>
    </div>
  );
}
