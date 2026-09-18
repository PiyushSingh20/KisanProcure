import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router';
const slides = [
    {
        emoji: '📅',
        title: 'Know before you go.',
        body: 'Check procurement schedules, waiting times, and slot availability at any center — before you leave home.',
        accent: '#1e5c33',
    },
    {
        emoji: '🎟',
        title: 'Skip unnecessary waiting.',
        body: 'Book a digital slot and get a token. Arrive only when your turn is near — no more hours of standing in queues.',
        accent: '#2a7a47',
    },
    {
        emoji: '📊',
        title: 'Track everything.',
        body: 'Follow your produce from arrival to payment in real time. Know exactly when your money will be credited.',
        accent: '#16532d',
    },
];
export default function Onboarding() {
    const [idx, setIdx] = useState(0);
    const navigate = useNavigate();
    const goNext = () => {
        if (idx < slides.length - 1)
            setIdx(idx + 1);
        else
            navigate('/login');
    };
    const slide = slides[idx];
    return (_jsxs("div", { className: "h-full flex flex-col bg-white max-w-sm mx-auto", children: [_jsx("div", { className: "flex justify-end p-6", children: _jsx("button", { onClick: () => navigate('/login'), className: "text-sm text-[#6b7563] font-[500] hover:text-[#1e5c33] transition-colors", children: "Skip" }) }), _jsx("div", { className: "flex-1 flex flex-col items-center justify-center px-8 text-center", children: _jsxs("div", { className: "flex flex-col items-center gap-8", style: { animation: 'fadeSlide 0.4s cubic-bezier(0.16,1,0.3,1) both' }, children: [_jsx("div", { className: "w-40 h-40 rounded-3xl bg-[#e6f3eb] flex items-center justify-center", children: _jsx("span", { className: "text-6xl", children: slide.emoji }) }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("h2", { className: "text-[28px] font-[700] tracking-[-0.5px] text-[#181d14] leading-tight", children: slide.title }), _jsx("p", { className: "text-[16px] text-[#6b7563] leading-relaxed", children: slide.body })] })] }, idx) }), _jsx("div", { className: "flex justify-center gap-2 pb-6", children: slides.map((_, i) => (_jsx("button", { onClick: () => setIdx(i), className: "transition-all duration-300", children: _jsx("div", { className: `h-2 rounded-full transition-all duration-300 ${i === idx
                            ? 'w-6 bg-[#1e5c33]'
                            : 'w-2 bg-[#dde4d7]'}` }) }, i))) }), _jsx("div", { className: "px-6 pb-10 flex flex-col gap-3", children: _jsx("button", { onClick: goNext, className: "w-full h-[54px] rounded-2xl bg-[#1e5c33] text-white text-[16px] font-[600] tracking-[-0.2px] hover:bg-[#16432a] transition-colors active:scale-[0.98]", children: idx < slides.length - 1 ? 'Next' : 'Get Started' }) }), _jsx("style", { children: `
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` })] }));
}
