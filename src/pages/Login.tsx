import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { sendOtpApi, verifyOtpApi, loginWithPasswordApi } from "../lib/api";
import { saveAuth, roleHome } from "../lib/auth";

// ─── i18n strings ─────────────────────────────────────────────────────────────
const T = {
  en: {
    welcome: "Welcome back",
    subtitle: "Enter your mobile number to continue",
    mobile: "Mobile number",
    continue: "Continue",
    otpSent: "OTP sent to",
    verify: "Verify & Login",
    resend: "Resend OTP",
    resendIn: "Resend in",
    seconds: "s",
    noAccount: "New farmer?",
    register: "Register now",
    backToPhone: "Change number",
    officerLogin: "Officer / Admin Login",
    farmerLogin: "Farmer Login",
    password: "Password",
    loginBtn: "Login",
    invalidMobile: "Enter a valid 10-digit mobile number",
    invalidOtp: "Enter all 6 OTP digits",
    sendingOtp: "Sending OTP…",
    verifying: "Verifying…",
    skipDemo: "Skip to demo",
    hindiSwitch: "हिन्दी",
    engSwitch: "English",
    otpPlaceholder: "Enter 6-digit OTP",
    passwordPlaceholder: "Enter your password",
    hint: "OTP will appear in server logs (dev mode)",
    wrongOtp: "Invalid or expired OTP. Try again.",
    wrongPass: "Invalid credentials. Check mobile & password.",
    networkErr: "Could not connect. Check if the server is running.",
  },
  hi: {
    welcome: "वापस स्वागत है",
    subtitle: "जारी रखने के लिए मोबाइल नंबर दर्ज करें",
    mobile: "मोबाइल नंबर",
    continue: "जारी रखें",
    otpSent: "OTP भेजा गया",
    verify: "सत्यापित करें और लॉगिन करें",
    resend: "OTP दोबारा भेजें",
    resendIn: "पुनः भेजें",
    seconds: "सेकंड में",
    noAccount: "नए किसान हैं?",
    register: "अभी पंजीकरण करें",
    backToPhone: "नंबर बदलें",
    officerLogin: "अधिकारी / प्रशासक लॉगिन",
    farmerLogin: "किसान लॉगिन",
    password: "पासवर्ड",
    loginBtn: "लॉगिन करें",
    invalidMobile: "10 अंकों का वैध मोबाइल नंबर दर्ज करें",
    invalidOtp: "6 अंकों का OTP दर्ज करें",
    sendingOtp: "OTP भेजा जा रहा है…",
    verifying: "सत्यापित हो रहा है…",
    skipDemo: "डेमो मोड में जाएं",
    hindiSwitch: "हिन्दी",
    engSwitch: "English",
    otpPlaceholder: "6 अंकों का OTP दर्ज करें",
    passwordPlaceholder: "पासवर्ड दर्ज करें",
    hint: "OTP सर्वर लॉग में दिखेगा (dev mode)",
    wrongOtp: "गलत या समय सीमा समाप्त OTP। दोबारा कोशिश करें।",
    wrongPass: "गलत पहचान। मोबाइल और पासवर्ड जांचें।",
    networkErr: "कनेक्ट नहीं हो सका। सर्वर चल रहा है?",
  },
} as const;

type Lang = "en" | "hi";
type Mode = "farmer" | "officer";
type Step = "phone" | "otp" | "password";

export default function Login() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("en");
  const [mode, setMode] = useState<Mode>("farmer");
  const [step, setStep] = useState<Step>("phone");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = T[lang];

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError(t.invalidMobile);
      return;
    }
    setError("");
    setLoading(true);
    const res = await sendOtpApi(phone);
    setLoading(false);
    if (res.error) {
      setError(res.status === 0 ? t.networkErr : res.error);
      return;
    }
    setStep("otp");
    setCountdown(30);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleVerifyOtp = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      setError(t.invalidOtp);
      return;
    }
    setError("");
    setLoading(true);
    const res = await verifyOtpApi(phone, otpStr);
    setLoading(false);
    if (res.error) {
      setError(res.status === 0 ? t.networkErr : t.wrongOtp);
      return;
    }
    const auth = saveAuth(res.data!);
    if (auth) {
      navigate(roleHome(auth.role), { replace: true });
    } else {
      navigate("/farmer", { replace: true });
    }
  };

  const handlePasswordLogin = async () => {
    if (phone.length < 10) {
      setError(t.invalidMobile);
      return;
    }
    if (!password) {
      setError(t.wrongPass);
      return;
    }
    setError("");
    setLoading(true);
    const res = await loginWithPasswordApi(phone, password);
    setLoading(false);
    if (res.error) {
      setError(res.status === 0 ? t.networkErr : t.wrongPass);
      return;
    }
    const auth = saveAuth(res.data!);
    if (auth) {
      navigate(roleHome(auth.role), { replace: true });
    } else {
      navigate("/officer", { replace: true });
    }
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      e.preventDefault();
    }
  };

  const resetToPhone = () => {
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setCountdown(0);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
    setPassword("");
    setError("");
    setCountdown(0);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f3] flex flex-col">
      {/* Language toggle */}
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-[#dde4d7] text-[#1e5c33] shadow-xs hover:bg-[#e6f3eb] transition-colors"
        >
          {lang === "en" ? t.hindiSwitch : t.engSwitch}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 max-w-sm mx-auto w-full pb-10">
        {/* Logo + Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-[60px] h-[60px] rounded-[18px] bg-[#1e5c33] shadow-lg mb-4">
            <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
              <path d="M22 6C22 6 8 16 8 28a14 14 0 0028 0C36 16 22 6 22 6z" fill="white" opacity="0.9" />
              <path d="M22 12v18M15 21c2-1.5 4.5-1.5 7 2M29 21c-2-1.5-4.5-1.5-7 2" stroke="#1e5c33" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-[26px] font-[800] tracking-tight text-[#181d14]">
            Kisan<span className="text-[#1e5c33]">Procure</span>
          </h1>
          <p className="text-[13px] text-[#6b7563] mt-1 font-medium">
            {lang === "en" ? "Smart procurement · Less waiting" : "स्मार्ट खरीद · कम प्रतीक्षा"}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-white rounded-xl p-1 mb-6 border border-[#dde4d7] shadow-xs gap-1">
          <button
            onClick={() => switchMode("farmer")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === "farmer"
                ? "bg-[#1e5c33] text-white shadow-sm"
                : "text-[#6b7563] hover:bg-[#f4f6f2]"
            }`}
          >
            {lang === "en" ? "🌾 Farmer" : "🌾 किसान"}
          </button>
          <button
            onClick={() => switchMode("officer")}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === "officer"
                ? "bg-[#1e5c33] text-white shadow-sm"
                : "text-[#6b7563] hover:bg-[#f4f6f2]"
            }`}
          >
            {lang === "en" ? "🏛️ Officer / Admin" : "🏛️ अधिकारी"}
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#dde4d7] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#f0f2ee]">
            {step !== "phone" && (
              <button
                onClick={resetToPhone}
                className="flex items-center gap-1 text-xs font-semibold text-[#6b7563] mb-3 hover:text-[#181d14] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                {t.backToPhone}
              </button>
            )}
            <h2 className="text-[20px] font-[800] text-[#181d14] tracking-tight">
              {step === "phone"
                ? t.welcome
                : step === "otp"
                ? (lang === "en" ? "Verify your number" : "नंबर सत्यापित करें")
                : (lang === "en" ? "Welcome back" : "वापस स्वागत है")}
            </h2>
            <p className="text-[13px] text-[#6b7563] mt-0.5">
              {step === "phone"
                ? t.subtitle
                : step === "otp"
                ? `${t.otpSent} +91 ${phone}`
                : (lang === "en" ? "Enter your password to continue" : "जारी रखने के लिए पासवर्ड दर्ज करें")}
            </p>
          </div>

          <div className="px-5 py-5 space-y-4">
            {/* ── FARMER: PHONE step ── */}
            {mode === "farmer" && step === "phone" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#181d14] mb-1.5">
                    {t.mobile}
                  </label>
                  <div className="flex items-center gap-0 border border-[#dde4d7] rounded-xl overflow-hidden focus-within:border-[#1e5c33] focus-within:ring-1 focus-within:ring-[#1e5c33] transition-all bg-[#f8faf7]">
                    <span className="px-3.5 text-[14px] font-bold text-[#6b7563] bg-[#eef1eb] border-r border-[#dde4d7] h-[50px] flex items-center shrink-0">
                      +91
                    </span>
                    <input
                      id="farmer-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      autoFocus
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      placeholder="9876543210"
                      className="flex-1 px-3 h-[50px] text-[16px] text-[#181d14] placeholder:text-[#aab8a4] outline-none bg-transparent"
                    />
                    {phone.length === 10 && (
                      <span className="pr-3 text-[#1e5c33]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>

                {error && <ErrorBanner msg={error} />}

                <button
                  id="send-otp-btn"
                  onClick={handleSendOtp}
                  disabled={loading || phone.length < 10}
                  className="w-full h-[50px] rounded-xl bg-[#1e5c33] text-white font-bold text-[15px] hover:bg-[#16432a] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Spinner />{t.sendingOtp}</>
                  ) : (
                    t.continue
                  )}
                </button>

                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3.5 py-2.5 flex items-start gap-2">
                  <span className="text-sm mt-0.5">💡</span>
                  <p className="text-[11.5px] text-[#166534] leading-relaxed">{t.hint}</p>
                </div>
              </>
            )}

            {/* ── FARMER: OTP step ── */}
            {mode === "farmer" && step === "otp" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#181d14] mb-3">
                    {lang === "en" ? "Enter 6-digit OTP" : "6 अंकों का OTP दर्ज करें"}
                  </label>
                  <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        id={`otp-${i}`}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKey(i, e)}
                        className="w-[48px] h-[54px] rounded-xl border border-[#dde4d7] text-center text-[20px] font-[700] text-[#181d14] bg-[#f8faf7] outline-none focus:border-[#1e5c33] focus:ring-2 focus:ring-[#1e5c33]/20 focus:bg-white transition-all"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                {error && <ErrorBanner msg={error} />}

                <button
                  id="verify-otp-btn"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.some((d) => d === "")}
                  className="w-full h-[50px] rounded-xl bg-[#1e5c33] text-white font-bold text-[15px] hover:bg-[#16432a] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? <><Spinner />{t.verifying}</> : t.verify}
                </button>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-[13px] text-[#6b7563]">
                      {t.resendIn} {countdown}{t.seconds}
                    </p>
                  ) : (
                    <button
                      onClick={() => { setOtp(["", "", "", "", "", ""]); handleSendOtp(); }}
                      className="text-[13px] font-semibold text-[#1e5c33] hover:underline"
                    >
                      {t.resend}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ── OFFICER / ADMIN: Phone + Password ── */}
            {mode === "officer" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#181d14] mb-1.5">
                    {t.mobile}
                  </label>
                  <div className="flex items-center border border-[#dde4d7] rounded-xl overflow-hidden focus-within:border-[#1e5c33] focus-within:ring-1 focus-within:ring-[#1e5c33] transition-all bg-[#f8faf7]">
                    <span className="px-3.5 text-[14px] font-bold text-[#6b7563] bg-[#eef1eb] border-r border-[#dde4d7] h-[50px] flex items-center shrink-0">
                      +91
                    </span>
                    <input
                      id="officer-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      autoFocus
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && document.getElementById("officer-pass-input")?.focus()}
                      placeholder="9876543210"
                      className="flex-1 px-3 h-[50px] text-[16px] text-[#181d14] placeholder:text-[#aab8a4] outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181d14] mb-1.5">
                    {t.password}
                  </label>
                  <div className="flex items-center border border-[#dde4d7] rounded-xl overflow-hidden focus-within:border-[#1e5c33] focus-within:ring-1 focus-within:ring-[#1e5c33] transition-all bg-[#f8faf7]">
                    <input
                      id="officer-pass-input"
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                      placeholder={t.passwordPlaceholder}
                      className="flex-1 px-3.5 h-[50px] text-[16px] text-[#181d14] placeholder:text-[#aab8a4] outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="px-3.5 text-[#6b7563] hover:text-[#181d14] transition-colors"
                    >
                      {showPass ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && <ErrorBanner msg={error} />}

                <button
                  id="officer-login-btn"
                  onClick={handlePasswordLogin}
                  disabled={loading || phone.length < 10 || !password}
                  className="w-full h-[50px] rounded-xl bg-[#1e5c33] text-white font-bold text-[15px] hover:bg-[#16432a] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? <><Spinner />{t.verifying}</> : t.loginBtn}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-[13px] text-[#6b7563] mt-5">
          {t.noAccount}{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-bold text-[#1e5c33] hover:underline"
          >
            {t.register}
          </button>
        </p>

        {/* Dev skip */}
        <button
          onClick={() => navigate("/farmer")}
          className="mt-2 text-center text-[12px] text-[#9ca3af] hover:text-[#6b7563] transition-colors underline underline-offset-2"
        >
          {t.skipDemo}
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ErrorBanner({ msg }: { msg: any }) {
  const text = typeof msg === "object" ? (msg?.message || JSON.stringify(msg)) : String(msg || "");
  return (
    <div className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3.5 py-2.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-[12.5px] text-[#dc2626] font-medium">{text}</p>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
    </svg>
  );
}
