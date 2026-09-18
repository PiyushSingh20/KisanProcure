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
    if (idx < slides.length - 1) setIdx(idx + 1);
    else navigate('/login');
  };

  const slide = slides[idx];

  return (
    <div className="h-full flex flex-col bg-white max-w-sm mx-auto">
      {/* Skip */}
      <div className="flex justify-end p-6">
        <button
          onClick={() => navigate('/login')}
          className="text-sm text-[#6b7563] font-[500] hover:text-[#1e5c33] transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          key={idx}
          className="flex flex-col items-center gap-8"
          style={{ animation: 'fadeSlide 0.4s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {/* Illustration */}
          <div className="w-40 h-40 rounded-3xl bg-[#e6f3eb] flex items-center justify-center">
            <span className="text-6xl">{slide.emoji}</span>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-[28px] font-[700] tracking-[-0.5px] text-[#181d14] leading-tight">
              {slide.title}
            </h2>
            <p className="text-[16px] text-[#6b7563] leading-relaxed">{slide.body}</p>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 pb-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="transition-all duration-300"
          >
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                i === idx
                  ? 'w-6 bg-[#1e5c33]'
                  : 'w-2 bg-[#dde4d7]'
              }`}
            />
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 flex flex-col gap-3">
        <button
          onClick={goNext}
          className="w-full h-[54px] rounded-2xl bg-[#1e5c33] text-white text-[16px] font-[600] tracking-[-0.2px] hover:bg-[#16432a] transition-colors active:scale-[0.98]"
        >
          {idx < slides.length - 1 ? 'Next' : 'Get Started'}
        </button>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
