import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router';
export default function Login() {
    const navigate = useNavigate();
    const [step, setStep] = useState('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const handleOtpChange = (i, v) => {
        if (!/^\d?$/.test(v))
            return;
        const next = [...otp];
        next[i] = v;
        setOtp(next);
        if (v && i < 5) {
            const el = document.getElementById(`otp-${i + 1}`);
            el?.focus();
        }
    };
    const handleContinue = () => {
        if (step === 'phone' && phone.length >= 10) {
            setStep('otp');
        }
        else if (step === 'otp' && otp.every((d) => d !== '')) {
            navigate('/farmer');
        }
    };
    return (_jsxs("div", { className: "h-full bg-white flex flex-col max-w-sm mx-auto", children: [step === 'otp' && (_jsxs("button", { onClick: () => setStep('phone'), className: "m-6 self-start flex items-center gap-1.5 text-[#6b7563] text-sm font-[500]", children: [_jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { d: "M15 18l-6-6 6-6" }) }), "Back"] })), _jsxs("div", { className: "flex-1 flex flex-col justify-center px-6", children: [_jsxs("div", { className: "mb-10", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-[#1e5c33] flex items-center justify-center mb-6", children: _jsxs("svg", { width: "26", height: "26", viewBox: "0 0 44 44", fill: "none", children: [_jsx("path", { d: "M22 8C22 8 10 16 10 28a12 12 0 0024 0C34 16 22 8 22 8z", fill: "white", opacity: "0.9" }), _jsx("path", { d: "M22 14v18M16 20c2-1 4-1 6 2M28 20c-2-1-4-1-6 2", stroke: "#1e5c33", strokeWidth: "1.5", strokeLinecap: "round" })] }) }), step === 'phone' ? (_jsxs(_Fragment, { children: [_jsx("h1", { className: "text-[32px] font-[700] tracking-[-0.8px] text-[#181d14]", children: "Welcome back" }), _jsx("p", { className: "mt-2 text-[15px] text-[#6b7563]", children: "Enter your mobile number to continue" })] })) : (_jsxs(_Fragment, { children: [_jsx("h1", { className: "text-[32px] font-[700] tracking-[-0.8px] text-[#181d14]", children: "Verify OTP" }), _jsxs("p", { className: "mt-2 text-[15px] text-[#6b7563]", children: ["Code sent to ", _jsxs("span", { className: "text-[#181d14] font-[500]", children: ["+91 ", phone] })] })] }))] }), step === 'phone' ? (_jsx("div", { className: "flex flex-col gap-4", children: _jsxs("div", { className: "flex items-center gap-3 border border-[#dde4d7] rounded-2xl px-4 h-[56px] focus-within:border-[#1e5c33] transition-colors bg-[#f4f6f2]", children: [_jsx("span", { className: "text-[15px] text-[#6b7563] font-[500] shrink-0", children: "+91" }), _jsx("div", { className: "w-px h-5 bg-[#dde4d7]" }), _jsx("input", { type: "tel", placeholder: "Mobile number", value: phone, onChange: (e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)), className: "flex-1 bg-transparent text-[16px] text-[#181d14] placeholder:text-[#6b7563] outline-none font-[400]", autoFocus: true })] }) })) : (_jsx("div", { className: "flex gap-2 justify-between", children: otp.map((d, i) => (_jsx("input", { id: `otp-${i}`, type: "tel", maxLength: 1, value: d, onChange: (e) => handleOtpChange(i, e.target.value), onKeyDown: (e) => {
                                if (e.key === 'Backspace' && !otp[i] && i > 0) {
                                    document.getElementById(`otp-${i - 1}`)?.focus();
                                }
                            }, className: "w-12 h-14 rounded-xl border border-[#dde4d7] text-center text-xl font-[600] text-[#181d14] bg-[#f4f6f2] outline-none focus:border-[#1e5c33] transition-colors", autoFocus: i === 0 }, i))) })), _jsx("button", { onClick: handleContinue, className: "mt-6 w-full h-[54px] rounded-2xl bg-[#1e5c33] text-white text-[16px] font-[600] hover:bg-[#16432a] transition-colors active:scale-[0.98] disabled:opacity-40", disabled: step === 'phone' ? phone.length < 10 : otp.some((d) => d === ''), children: "Continue" }), _jsx("button", { onClick: () => navigate('/farmer'), className: "mt-3 text-sm text-[#6b7563] underline underline-offset-2", children: "Skip login (demo)" })] }), _jsx("div", { className: "pb-10 px-6 text-center", children: _jsxs("p", { className: "text-[14px] text-[#6b7563]", children: ["New farmer?", ' ', _jsx("button", { className: "text-[#1e5c33] font-[600]", children: "Register" })] }) })] }));
}
