import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
export default function SplashScreen() {
    const navigate = useNavigate();
    useEffect(() => {
        const t = setTimeout(() => navigate('/onboarding'), 2200);
        return () => clearTimeout(t);
    }, [navigate]);
    return (_jsxs("div", { className: "h-full flex flex-col items-center justify-center bg-[#f4f6f2]", children: [_jsxs("div", { className: "flex flex-col items-center gap-5 animate-[fadeUp_0.8s_ease_both]", style: { animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both' }, children: [_jsx("div", { className: "w-20 h-20 rounded-[22px] bg-[#1e5c33] flex items-center justify-center shadow-lg", children: _jsxs("svg", { width: "44", height: "44", viewBox: "0 0 44 44", fill: "none", children: [_jsx("path", { d: "M22 8C22 8 10 16 10 28a12 12 0 0024 0C34 16 22 8 22 8z", fill: "white", opacity: "0.9" }), _jsx("path", { d: "M22 14v18M16 20c2-1 4-1 6 2M28 20c-2-1-4-1-6 2", stroke: "#1e5c33", strokeWidth: "1.5", strokeLinecap: "round" })] }) }), _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-[28px] font-[700] tracking-[-0.5px] text-[#181d14]", children: "KisanProcure" }), _jsx("p", { className: "mt-1.5 text-[15px] text-[#6b7563] font-[400]", children: "Smart procurement. Less waiting." })] })] }), _jsxs("div", { className: "absolute bottom-12 flex flex-col items-center gap-3 w-full px-8", children: [_jsx("p", { className: "text-xs text-[#6b7563] uppercase tracking-widest font-[500]", children: "Demo mode" }), _jsx("div", { className: "flex gap-2", children: [
                            { label: 'Farmer', path: '/farmer' },
                            { label: 'Officer', path: '/officer' },
                            { label: 'Admin', path: '/admin' },
                        ].map(({ label, path }) => (_jsx("button", { onClick: () => navigate(path), className: "px-4 py-2 rounded-full border border-[#dde4d7] text-sm font-[500] text-[#1e5c33] bg-white hover:bg-[#e6f3eb] transition-colors", children: label }, label))) })] }), _jsx("style", { children: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` })] }));
}
