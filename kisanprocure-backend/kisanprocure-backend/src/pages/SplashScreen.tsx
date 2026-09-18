import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/onboarding'), 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#f4f6f2]">
      <div
        className="flex flex-col items-center gap-5 animate-[fadeUp_0.8s_ease_both]"
        style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        {/* Logo mark */}
        <div className="w-20 h-20 rounded-[22px] bg-[#1e5c33] flex items-center justify-center shadow-lg">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
              d="M22 8C22 8 10 16 10 28a12 12 0 0024 0C34 16 22 8 22 8z"
              fill="white"
              opacity="0.9"
            />
            <path
              d="M22 14v18M16 20c2-1 4-1 6 2M28 20c-2-1-4-1-6 2"
              stroke="#1e5c33"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-[28px] font-[700] tracking-[-0.5px] text-[#181d14]">
            KisanProcure
          </h1>
          <p className="mt-1.5 text-[15px] text-[#6b7563] font-[400]">
            Smart procurement. Less waiting.
          </p>
        </div>
      </div>

      {/* Bottom: role switcher for demo */}
      <div className="absolute bottom-12 flex flex-col items-center gap-3 w-full px-8">
        <p className="text-xs text-[#6b7563] uppercase tracking-widest font-[500]">Demo mode</p>
        <div className="flex gap-2">
          {[
            { label: 'Farmer', path: '/farmer' },
            { label: 'Officer', path: '/officer' },
            { label: 'Admin', path: '/admin' },
          ].map(({ label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="px-4 py-2 rounded-full border border-[#dde4d7] text-sm font-[500] text-[#1e5c33] bg-white hover:bg-[#e6f3eb] transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
