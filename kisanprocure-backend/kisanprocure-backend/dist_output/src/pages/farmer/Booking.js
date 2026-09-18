import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        if (step < 3)
            setStep(step + 1);
        else
            navigate('/farmer/book/confirmed');
    };
    return (_jsxs("div", { className: "min-h-full pb-32 flex flex-col", children: [_jsxs("div", { className: "bg-white border-b border-[#dde4d7] px-5 pt-14 pb-5", children: [_jsxs("button", { onClick: () => (step > 0 ? setStep(step - 1) : navigate(-1)), className: "flex items-center gap-1 text-[#6b7563] mb-4", children: [_jsx(ChevronLeftIcon, { size: 20 }), _jsx("span", { className: "text-sm font-[500]", children: "Back" })] }), _jsx("h1", { className: "text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]", children: "Book a Slot" }), _jsx("p", { className: "text-[14px] text-[#6b7563] mt-1", children: "Lucknow Grain Procurement Center" }), _jsx("div", { className: "flex gap-1 mt-4", children: STEPS.map((s, i) => (_jsxs("div", { className: "flex-1 flex flex-col gap-1.5", children: [_jsx("div", { className: `h-1 rounded-full transition-colors ${i <= step ? 'bg-[#1e5c33]' : 'bg-[#dde4d7]'}` }), _jsx("p", { className: `text-[11px] font-[500] ${i === step ? 'text-[#1e5c33]' : 'text-[#6b7563]'}`, children: s })] }, s))) })] }), _jsxs("div", { className: "flex-1 px-5 pt-6", children: [step === 0 && (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("p", { className: "text-[16px] font-[600] text-[#181d14]", children: "Select your crop" }), CROPS.map((c) => (_jsx("button", { onClick: () => setCrop(c), className: `w-full py-4 px-5 rounded-2xl border text-left text-[15px] font-[500] transition-all ${crop === c
                                    ? 'border-[#1e5c33] bg-[#e6f3eb] text-[#1e5c33]'
                                    : 'border-[#dde4d7] bg-white text-[#181d14]'}`, children: c }, c)))] })), step === 1 && (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("p", { className: "text-[16px] font-[600] text-[#181d14]", children: "Enter quantity" }), _jsxs("div", { className: "bg-white rounded-2xl p-5 border border-[#dde4d7]", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "number", placeholder: "0", value: qty, onChange: (e) => setQty(e.target.value), className: "flex-1 text-[48px] font-[700] text-[#1e5c33] tracking-[-2px] outline-none bg-transparent", autoFocus: true }), _jsx("span", { className: "text-[18px] text-[#6b7563] font-[500]", children: "kg" })] }), _jsxs("p", { className: "text-[13px] text-[#6b7563] mt-2", children: ["Crop: ", crop] })] }), _jsx("p", { className: "text-[12px] text-[#6b7563]", children: "Maximum limit: 2,000 kg per booking" })] })), step === 2 && (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("p", { className: "text-[16px] font-[600] text-[#181d14]", children: "Select date" }), DATES.map((d) => (_jsxs("button", { onClick: () => setDate(d), className: `w-full py-4 px-5 rounded-2xl border text-left text-[15px] font-[500] transition-all ${date === d
                                    ? 'border-[#1e5c33] bg-[#e6f3eb] text-[#1e5c33]'
                                    : 'border-[#dde4d7] bg-white text-[#181d14]'}`, children: [d, ", 2026"] }, d)))] })), step === 3 && (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("p", { className: "text-[16px] font-[600] text-[#181d14]", children: "Select time slot" }), SLOTS.map((s) => (_jsx("button", { onClick: () => !s.full && setSlot(s.time), disabled: s.full, className: `w-full py-4 px-5 rounded-2xl border text-left transition-all ${s.full
                                    ? 'border-[#dde4d7] bg-[#f4f6f2] opacity-50 cursor-not-allowed'
                                    : slot === s.time
                                        ? 'border-[#1e5c33] bg-[#e6f3eb]'
                                        : 'border-[#dde4d7] bg-white'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: `text-[16px] font-[600] ${slot === s.time ? 'text-[#1e5c33]' : 'text-[#181d14]'}`, children: s.time }), _jsx("span", { className: `text-[13px] font-[500] ${s.full ? 'text-[#dc2626]' : 'text-[#6b7563]'}`, children: s.full ? 'Full' : `${s.available} slots` })] }) }, s.time)))] }))] }), _jsx("div", { className: "fixed bottom-[70px] left-0 right-0 px-5 pb-4 bg-gradient-to-t from-[#f4f6f2] to-transparent pt-6", children: _jsx("div", { className: "max-w-sm mx-auto", children: _jsx("button", { onClick: next, disabled: !canNext, className: "w-full h-[54px] rounded-2xl bg-[#1e5c33] text-white text-[16px] font-[600] hover:bg-[#16432a] transition-colors active:scale-[0.98] disabled:opacity-40", children: step < 3 ? 'Continue' : 'Confirm Slot' }) }) })] }));
}
