import { useState } from "react";
import { useNavigate } from "react-router";
import { UP_DISTRICTS, type RegistrationData, type Gender } from "../lib/types";
import { DEMO_CROPS } from "../lib/demoData";
import { registerFarmerApi } from "../lib/api";
import { saveAuth } from "../lib/auth";

// ─── Language strings ─────────────────────────────────────────────────────────
const T = {
  en: {
    title: "Farmer Registration",
    subtitle: "Official Procurement Portal · SIH26032",
    prefill: "⚡ Fill Demo",
    steps: ["Personal", "Location", "Land", "Crops", "Bank & DBT"],
    stepTitles: [
      "Personal Information",
      "Farm Location",
      "Landholding Details",
      "Crops for Procurement",
      "Bank & DBT Verification",
    ],
    stepSubtitles: [
      "Enter your legal identity details matching Aadhaar / land records.",
      "Used to route you to the nearest verified mandi or procurement centre.",
      "Required to validate your maximum procurement quota under MSP rules.",
      "Select crops you plan to bring to procurement centres this season.",
      "Government MSP payouts are wired directly to this account via PFMS.",
    ],
    fullName: "Full Name (as per Aadhaar / Land Record)",
    fullNamePh: "e.g. Ramesh Kumar Verma",
    mobile: "Mobile Number (Aadhaar-linked for OTP)",
    mobilePh: "9876543210",
    dob: "Date of Birth",
    gender: "Gender",
    genderM: "Male (पुरुष)",
    genderF: "Female (महिला)",
    genderO: "Other",
    email: "Email Address (Optional)",
    emailPh: "farmer@example.com",
    state: "State",
    district: "District (जिला)",
    tehsil: "Tehsil (तहसील)",
    tehsilPh: "e.g. Soraon",
    village: "Village (गाँव)",
    villagePh: "e.g. Shivgarh",
    pincode: "Postal Pincode",
    pincodePh: "212502",
    totalLand: "Total Cultivated Area",
    irrigatedLand: "Irrigated Land (सिंचित भूमि)",
    landUnit: "Land Measurement Unit",
    acres: "Acres (एकड़)",
    hectares: "Hectares (हेक्टेयर)",
    bigha: "Bigha (बीघा)",
    landNote: "Cannot exceed total cultivated land",
    landRule: "📐 Max marketable surplus: ~20–25 Q/Acre (Wheat), ~25–30 Q/Acre (Paddy).",
    cropsTitle: "Primary Crops",
    cropsMsp: "MSP: ₹",
    cropsQtyLabel: "Expected Produce (Quintals)",
    bankName: "Bank Name",
    bankNamePh: "e.g. State Bank of India",
    accountNo: "Account Number",
    accountPh: "918273645019",
    ifsc: "IFSC Code",
    ifscPh: "SBIN0001234",
    aadhaarTitle: "Aadhaar-Linked DBT Consent",
    aadhaarNote: "KisanProcure never stores raw 12-digit Aadhaar. We only link your verified VID / token.",
    aadhaarLast4: "Last 4 digits of Aadhaar",
    dbtConsent: "I consent to linking DBT subsidy for MSP payments",
    langPref: "Preferred Notification Language",
    next: "Next Step",
    back: "Back",
    submit: "Complete Registration",
    submitting: "Creating your Farmer ID…",
    privacyNote: "🔒 Privacy First: Your data is protected under DPDP Act 2023. We do not share your information without consent.",
    alreadyReg: "Already registered?",
    loginLink: "Login with OTP",
    successTitle: "Registration Successful!",
    successSub: "Your official Farmer ID has been generated.",
    successLabel: "Registration ID",
    successState: "State & District",
    successDbt: "DBT Verification",
    successDbtStatus: "Active (Linked)",
    goToDash: "Go to Farmer Dashboard",
    findCentre: "Find Nearby Centres",
    errName: "Please enter your full name.",
    errMobile: "Enter a valid 10-digit mobile number.",
    errDistrict: "Please select your district.",
    errBank: "Enter your bank account number.",
    errIfsc: "Enter a valid 11-character IFSC code.",
    errConsent: "Please provide Aadhaar consent to proceed.",
    serverErr: "Registration failed: ",
    networkErr: "Network error — check if server is running.",
    duplicate: "This mobile number is already registered. Please login instead.",
  },
  hi: {
    title: "किसान पंजीकरण",
    subtitle: "आधिकारिक खरीद पोर्टल · SIH26032",
    prefill: "⚡ डेमो भरें",
    steps: ["व्यक्तिगत", "स्थान", "भूमि", "फसल", "बैंक"],
    stepTitles: [
      "व्यक्तिगत जानकारी",
      "खेत का स्थान",
      "भूमि विवरण",
      "खरीद के लिए फसलें",
      "बैंक और DBT सत्यापन",
    ],
    stepSubtitles: [
      "आधार / भूमि रिकॉर्ड से मिलती जानकारी दर्ज करें।",
      "आपको निकटतम सत्यापित मंडी या खरीद केंद्र से जोड़ने के लिए उपयोग किया जाएगा।",
      "MSP नियमों के तहत अधिकतम खरीद कोटा सत्यापित करने के लिए आवश्यक।",
      "इस सीजन में खरीद केंद्रों पर लाने वाली फसलें चुनें।",
      "PFMS के माध्यम से MSP भुगतान सीधे इस खाते में आएगा।",
    ],
    fullName: "पूरा नाम (आधार / भूमि रिकॉर्ड के अनुसार)",
    fullNamePh: "जैसे: रमेश कुमार वर्मा",
    mobile: "मोबाइल नंबर (आधार से जुड़ा OTP के लिए)",
    mobilePh: "9876543210",
    dob: "जन्म तिथि",
    gender: "लिंग",
    genderM: "पुरुष",
    genderF: "महिला",
    genderO: "अन्य",
    email: "ईमेल (वैकल्पिक)",
    emailPh: "farmer@example.com",
    state: "राज्य",
    district: "जिला",
    tehsil: "तहसील",
    tehsilPh: "जैसे: सोरांव",
    village: "गाँव",
    villagePh: "जैसे: शिवगढ़",
    pincode: "पिन कोड",
    pincodePh: "212502",
    totalLand: "कुल खेती योग्य भूमि",
    irrigatedLand: "सिंचित भूमि",
    landUnit: "भूमि माप इकाई",
    acres: "एकड़",
    hectares: "हेक्टेयर",
    bigha: "बीघा",
    landNote: "कुल खेती योग्य भूमि से अधिक नहीं हो सकता",
    landRule: "📐 अधिकतम विपणन योग्य अधिशेष: ~20–25 Q/एकड़ (गेहूं), ~25–30 Q/एकड़ (धान)।",
    cropsTitle: "प्राथमिक फसलें",
    cropsMsp: "MSP: ₹",
    cropsQtyLabel: "अपेक्षित उपज (क्विंटल)",
    bankName: "बैंक का नाम",
    bankNamePh: "जैसे: स्टेट बैंक ऑफ इंडिया",
    accountNo: "खाता संख्या",
    accountPh: "918273645019",
    ifsc: "IFSC कोड",
    ifscPh: "SBIN0001234",
    aadhaarTitle: "आधार-लिंक्ड DBT सहमति",
    aadhaarNote: "KisanProcure कभी भी 12 अंकों का आधार स्टोर नहीं करता। केवल VID / टोकन लिंक किया जाता है।",
    aadhaarLast4: "आधार के अंतिम 4 अंक",
    dbtConsent: "मैं MSP भुगतान के लिए DBT सब्सिडी लिंक करने की सहमति देता/देती हूं",
    langPref: "अधिसूचना भाषा वरीयता",
    next: "अगला चरण",
    back: "वापस",
    submit: "पंजीकरण पूरा करें",
    submitting: "किसान ID बनाई जा रही है…",
    privacyNote: "🔒 गोपनीयता प्राथमिकता: DPDP अधिनियम 2023 के तहत आपका डेटा सुरक्षित है।",
    alreadyReg: "पहले से पंजीकृत हैं?",
    loginLink: "OTP से लॉगिन करें",
    successTitle: "पंजीकरण सफल!",
    successSub: "आपकी आधिकारिक किसान ID बनाई गई है।",
    successLabel: "पंजीकरण ID",
    successState: "राज्य और जिला",
    successDbt: "DBT सत्यापन",
    successDbtStatus: "सक्रिय (लिंक्ड)",
    goToDash: "किसान डैशबोर्ड पर जाएं",
    findCentre: "निकटतम केंद्र खोजें",
    errName: "अपना पूरा नाम दर्ज करें।",
    errMobile: "10 अंकों का वैध मोबाइल नंबर दर्ज करें।",
    errDistrict: "अपना जिला चुनें।",
    errBank: "अपना बैंक खाता नंबर दर्ज करें।",
    errIfsc: "11 वर्ण का वैध IFSC कोड दर्ज करें।",
    errConsent: "आगे बढ़ने के लिए आधार सहमति प्रदान करें।",
    serverErr: "पंजीकरण विफल: ",
    networkErr: "नेटवर्क त्रुटि — सर्वर चल रहा है?",
    duplicate: "यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।",
  },
} as const;

type Lang = "en" | "hi";

const DEMO_DATA: RegistrationData = {
  fullName: "Ramesh Kumar Verma",
  mobileNumber: "9876543210",
  email: "ramesh.verma@agri.in",
  dateOfBirth: "1982-04-12",
  gender: "MALE",
  state: "Uttar Pradesh",
  district: "Prayagraj",
  tehsil: "Phulpur",
  village: "Kalyanpur",
  pincode: "212402",
  totalCultivatedLand: 5.2,
  irrigatedLand: 4.5,
  landUnit: "ACRE",
  crops: [
    { cropId: "crop-wheat", quantity: 50, unit: "QUINTAL" },
    { cropId: "crop-paddy-com", quantity: 60, unit: "QUINTAL" },
  ],
  preferredCentreId: "center-up-001",
  bankAccountNumber: "918273645019",
  ifscCode: "SBIN0001234",
  bankName: "State Bank of India",
  preferredLanguage: "hi",
};

export default function Registration() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("en");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [successData, setSuccessData] = useState<{ farmerId: string; name: string } | null>(null);

  const [formData, setFormData] = useState<RegistrationData>({
    fullName: "",
    mobileNumber: "",
    email: "",
    dateOfBirth: "1985-06-15",
    gender: "MALE",
    state: "Uttar Pradesh",
    district: "Prayagraj",
    tehsil: "",
    village: "",
    pincode: "",
    totalCultivatedLand: 2.0,
    irrigatedLand: 1.5,
    landUnit: "ACRE",
    crops: [{ cropId: "crop-wheat", quantity: 30, unit: "QUINTAL" }],
    preferredCentreId: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    preferredLanguage: "hi",
  });

  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [aadhaarLastFour, setAadhaarLastFour] = useState("");

  const t = T[lang];

  const update = (field: keyof RegistrationData, val: any) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const handleCropToggle = (cropId: string) => {
    const exists = formData.crops.find((c) => c.cropId === cropId);
    if (exists) {
      if (formData.crops.length > 1)
        update("crops", formData.crops.filter((c) => c.cropId !== cropId));
    } else {
      update("crops", [...formData.crops, { cropId, quantity: 30, unit: "QUINTAL" }]);
    }
  };

  const handleCropQty = (cropId: string, qty: number) =>
    update("crops", formData.crops.map((c) => (c.cropId === cropId ? { ...c, quantity: qty } : c)));

  const validateStep = (): boolean => {
    setFieldError("");
    if (currentStep === 1) {
      if (!formData.fullName.trim()) { setFieldError(t.errName); return false; }
      if (formData.mobileNumber.length < 10) { setFieldError(t.errMobile); return false; }
    }
    if (currentStep === 2) {
      if (!formData.district) { setFieldError(t.errDistrict); return false; }
    }
    if (currentStep === 5) {
      if (!formData.bankAccountNumber) { setFieldError(t.errBank); return false; }
      if (!formData.ifscCode || formData.ifscCode.length < 11) { setFieldError(t.errIfsc); return false; }
      if (!aadhaarConsent) { setFieldError(t.errConsent); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFieldError("");
    try {
      const res = await registerFarmerApi(formData);
      if (res.error) {
        if (res.status === 409) {
          setFieldError(t.duplicate);
        } else if (res.status === 0) {
          setFieldError(t.networkErr);
        } else {
          setFieldError(t.serverErr + res.error);
        }
        setIsSubmitting(false);
        return;
      }
      // Save tokens and redirect
      if (res.data?.accessToken) {
        const auth = saveAuth(res.data as any);
        setSuccessData({
          farmerId: `UP-FMR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          name: formData.fullName,
        });
        // Will auto-redirect after success modal dismiss
      } else {
        // Fallback success (demo)
        setSuccessData({
          farmerId: `UP-FMR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          name: formData.fullName,
        });
      }
    } catch {
      setFieldError(t.networkErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPct = Math.round((currentStep / 5) * 100);

  return (
    <div className="min-h-screen bg-[#f5f7f3] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#dde4d7] shadow-xs">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                currentStep > 1 ? (setCurrentStep((s) => s - 1), setFieldError("")) : navigate("/login")
              }
              className="p-2 rounded-xl bg-[#f4f6f2] hover:bg-[#e6eee3] text-[#181d14] transition-colors"
              aria-label="Back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div>
              <h1 className="text-[15px] font-[800] text-[#181d14]">{t.title}</h1>
              <p className="text-[11px] text-[#6b7563]">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[#dde4d7] text-[#6b7563] hover:bg-[#f4f6f2] transition-colors"
            >
              {lang === "en" ? "हि" : "EN"}
            </button>
            <button
              onClick={() => { setFormData(DEMO_DATA); setAadhaarLastFour("4291"); setAadhaarConsent(true); }}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-[#e6f3eb] text-[#1e5c33] border border-[#a8d4b8] hover:bg-[#d4eddc] transition-colors"
            >
              {t.prefill}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-5">
        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#1e5c33] uppercase tracking-wider">
              {lang === "en" ? `Step ${currentStep} of 5` : `चरण ${currentStep} / 5`}: {t.steps[currentStep - 1]}
            </span>
            <span className="text-[11px] font-semibold text-[#6b7563]">{progressPct}%</span>
          </div>
          <div className="w-full bg-[#e6eee3] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1e5c33] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="grid grid-cols-5 gap-1 mt-2">
            {t.steps.map((label, idx) => (
              <button
                key={label}
                onClick={() => { if (idx + 1 < currentStep) { setCurrentStep(idx + 1); setFieldError(""); } }}
                className={`text-[10px] text-center font-semibold py-1 rounded transition-colors ${
                  currentStep === idx + 1
                    ? "text-[#1e5c33] bg-[#e6f3eb]"
                    : currentStep > idx + 1
                    ? "text-[#16a34a] cursor-pointer hover:bg-[#f0fdf4]"
                    : "text-[#9ca3af]"
                }`}
              >
                {currentStep > idx + 1 ? "✓ " : ""}{label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-[#dde4d7] shadow-sm overflow-hidden">
          {/* Step header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#f0f2ee]">
            <h2 className="text-[18px] font-[800] text-[#181d14]">{t.stepTitles[currentStep - 1]}</h2>
            <p className="text-[12.5px] text-[#6b7563] mt-0.5">{t.stepSubtitles[currentStep - 1]}</p>
          </div>

          <div className="px-5 py-5 space-y-4">
            {/* ── STEP 1: Personal ── */}
            {currentStep === 1 && (
              <>
                <Field label={`${t.fullName} *`}>
                  <input
                    id="reg-fullname"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => { update("fullName", e.target.value); setFieldError(""); }}
                    placeholder={t.fullNamePh}
                    className={inputCls}
                  />
                </Field>

                <Field label={`${t.mobile} *`}>
                  <div className="flex border border-[#dde4d7] rounded-xl overflow-hidden focus-within:border-[#1e5c33] focus-within:ring-1 focus-within:ring-[#1e5c33] transition-all">
                    <span className="px-3 text-[13px] font-bold text-[#6b7563] bg-[#f4f6f2] border-r border-[#dde4d7] h-[46px] flex items-center">+91</span>
                    <input
                      id="reg-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={(e) => { update("mobileNumber", e.target.value.replace(/\D/g, "")); setFieldError(""); }}
                      placeholder={t.mobilePh}
                      className="flex-1 px-3 h-[46px] text-[15px] outline-none bg-white"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label={t.dob}>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => update("dateOfBirth", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t.gender}>
                    <select
                      value={formData.gender}
                      onChange={(e) => update("gender", e.target.value as Gender)}
                      className={selectCls}
                    >
                      <option value="MALE">{t.genderM}</option>
                      <option value="FEMALE">{t.genderF}</option>
                      <option value="OTHER">{t.genderO}</option>
                    </select>
                  </Field>
                </div>

                <Field label={t.email}>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder={t.emailPh}
                    className={inputCls}
                  />
                </Field>

                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3.5 py-2.5 flex items-start gap-2">
                  <span className="text-sm mt-0.5">🔒</span>
                  <p className="text-[11.5px] text-[#166534] leading-relaxed">{t.privacyNote}</p>
                </div>
              </>
            )}

            {/* ── STEP 2: Location ── */}
            {currentStep === 2 && (
              <>
                <Field label={t.state}>
                  <input
                    type="text"
                    value={formData.state}
                    disabled
                    className="w-full px-3.5 h-[46px] rounded-xl border border-[#dde4d7] bg-[#f4f6f2] text-[#181d14] text-[14px] font-medium cursor-not-allowed"
                  />
                </Field>

                <Field label={`${t.district} *`}>
                  <select
                    id="reg-district"
                    value={formData.district}
                    onChange={(e) => { update("district", e.target.value); setFieldError(""); }}
                    className={selectCls}
                  >
                    <option value="">{lang === "en" ? "-- Select District --" : "-- जिला चुनें --"}</option>
                    {UP_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label={`${t.tehsil} *`}>
                    <input
                      type="text"
                      value={formData.tehsil}
                      onChange={(e) => update("tehsil", e.target.value)}
                      placeholder={t.tehsilPh}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={`${t.village} *`}>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => update("village", e.target.value)}
                      placeholder={t.villagePh}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label={`${t.pincode} *`}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
                    placeholder={t.pincodePh}
                    className={inputCls}
                  />
                </Field>
              </>
            )}

            {/* ── STEP 3: Land ── */}
            {currentStep === 3 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={`${t.totalLand} *`}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.totalCultivatedLand}
                      onChange={(e) => update("totalCultivatedLand", parseFloat(e.target.value) || 0)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t.landUnit}>
                    <select
                      value={formData.landUnit}
                      onChange={(e) => update("landUnit", e.target.value as any)}
                      className={selectCls}
                    >
                      <option value="ACRE">{t.acres}</option>
                      <option value="HECTARE">{t.hectares}</option>
                      <option value="BIGHA">{t.bigha}</option>
                    </select>
                  </Field>
                </div>

                <Field label={t.irrigatedLand}>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={formData.totalCultivatedLand}
                    value={formData.irrigatedLand}
                    onChange={(e) => update("irrigatedLand", parseFloat(e.target.value) || 0)}
                    className={inputCls}
                  />
                  <p className="text-[11px] text-[#6b7563] mt-1">
                    {t.landNote} ({formData.totalCultivatedLand} {formData.landUnit})
                  </p>
                </Field>

                {/* Land viz */}
                <div className="rounded-xl bg-[#f4f6f2] border border-[#dde4d7] p-3">
                  <div className="flex justify-between text-[11px] font-semibold text-[#6b7563] mb-1.5">
                    <span>{lang === "en" ? "Irrigated" : "सिंचित"}</span>
                    <span>
                      {formData.totalCultivatedLand > 0
                        ? Math.round((formData.irrigatedLand / formData.totalCultivatedLand) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-[#e6eee3] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1e5c33] h-full rounded-full transition-all"
                      style={{
                        width: `${
                          formData.totalCultivatedLand > 0
                            ? Math.min(100, (formData.irrigatedLand / formData.totalCultivatedLand) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-xl px-3.5 py-2.5">
                  <p className="text-[11.5px] text-[#92400e] leading-relaxed">{t.landRule}</p>
                </div>
              </>
            )}

            {/* ── STEP 4: Crops ── */}
            {currentStep === 4 && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  {DEMO_CROPS.map((crop) => {
                    const isSelected = formData.crops.some((c) => c.cropId === crop.id);
                    const cropObj = formData.crops.find((c) => c.cropId === crop.id);
                    return (
                      <div
                        key={crop.id}
                        onClick={() => handleCropToggle(crop.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all select-none ${
                          isSelected
                            ? "border-[#1e5c33] bg-[#f0fdf4] ring-1 ring-[#1e5c33]"
                            : "border-[#dde4d7] bg-white hover:border-[#1e5c33]/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <p className="font-bold text-[13px] text-[#181d14]">{crop.name}</p>
                            <p className="text-[11px] text-[#6b7563]">{crop.hindiName}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${isSelected ? "bg-[#1e5c33] border-[#1e5c33]" : "border-[#dde4d7]"}`}>
                            {isSelected && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-[#1e5c33] font-semibold mt-1">
                          {t.cropsMsp}{crop.msp}/Q
                        </p>
                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-[#bbf7d0]" onClick={(e) => e.stopPropagation()}>
                            <label className="text-[10px] uppercase font-bold text-[#166534] block mb-1">
                              {t.cropsQtyLabel}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={cropObj?.quantity || 20}
                              onChange={(e) => handleCropQty(crop.id, parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1 text-xs font-bold border border-[#a8d4b8] rounded-lg bg-white text-center"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#6b7563] text-center">
                  {lang === "en"
                    ? `${formData.crops.length} crop${formData.crops.length > 1 ? "s" : ""} selected`
                    : `${formData.crops.length} फसल${formData.crops.length > 1 ? "ें" : ""} चुनी गई`}
                </p>
              </>
            )}

            {/* ── STEP 5: Bank & DBT ── */}
            {currentStep === 5 && (
              <>
                <Field label={t.bankName}>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => update("bankName", e.target.value)}
                    placeholder={t.bankNamePh}
                    className={inputCls}
                  />
                </Field>

                <Field label={`${t.accountNo} *`}>
                  <input
                    id="reg-account"
                    type="text"
                    inputMode="numeric"
                    value={formData.bankAccountNumber}
                    onChange={(e) => { update("bankAccountNumber", e.target.value); setFieldError(""); }}
                    placeholder={t.accountPh}
                    className={`${inputCls} font-mono tracking-wider`}
                  />
                </Field>

                <Field label={`${t.ifsc} *`}>
                  <input
                    id="reg-ifsc"
                    type="text"
                    maxLength={11}
                    value={formData.ifscCode}
                    onChange={(e) => { update("ifscCode", e.target.value.toUpperCase()); setFieldError(""); }}
                    placeholder={t.ifscPh}
                    className={`${inputCls} font-mono uppercase tracking-widest`}
                  />
                </Field>

                {/* Aadhaar Section */}
                <div className="bg-[#f4f6f2] border border-[#dde4d7] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#181d14]">🛡️ {t.aadhaarTitle}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e6f3eb] text-[#1e5c33] font-bold border border-[#a8d4b8]">
                      {lang === "en" ? "DPDP Compliant" : "DPDP अनुपालित"}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#6b7563]">{t.aadhaarNote}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#181d14] font-mono font-bold">XXXX-XXXX-</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={aadhaarLastFour}
                      onChange={(e) => setAadhaarLastFour(e.target.value.replace(/\D/g, ""))}
                      placeholder="8832"
                      className="w-16 px-2 py-1 border border-[#dde4d7] rounded-lg text-[13px] font-mono text-center font-bold focus:outline-none focus:border-[#1e5c33]"
                    />
                    <span className="text-[11px] text-[#6b7563]">({t.aadhaarLast4})</span>
                  </div>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aadhaarConsent}
                      onChange={(e) => { setAadhaarConsent(e.target.checked); setFieldError(""); }}
                      className="mt-0.5 rounded text-[#1e5c33] focus:ring-[#1e5c33] w-4 h-4 shrink-0"
                    />
                    <span className="text-[12.5px] text-[#181d14] leading-relaxed">{t.dbtConsent}</span>
                  </label>
                </div>

                {/* Language preference */}
                <Field label={t.langPref}>
                  <div className="flex gap-3">
                    {(["hi", "en"] as const).map((l) => (
                      <label key={l} className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl cursor-pointer text-[13px] font-semibold flex-1 justify-center transition-all ${
                        formData.preferredLanguage === l
                          ? "border-[#1e5c33] bg-[#f0fdf4] text-[#1e5c33]"
                          : "border-[#dde4d7] text-[#6b7563]"
                      }`}>
                        <input
                          type="radio"
                          name="lang-pref"
                          checked={formData.preferredLanguage === l}
                          onChange={() => update("preferredLanguage", l)}
                          className="sr-only"
                        />
                        {l === "hi" ? "हिन्दी" : "English"}
                      </label>
                    ))}
                  </div>
                </Field>
              </>
            )}

            {/* Error banner */}
            {fieldError && (
              <div className="flex items-start gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3.5 py-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[12.5px] text-[#dc2626] font-medium">{fieldError}</p>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex gap-3 pt-2">
              {currentStep > 1 && (
                <button
                  onClick={() => { setCurrentStep((s) => s - 1); setFieldError(""); }}
                  className="px-5 h-[48px] rounded-xl border border-[#dde4d7] text-[14px] font-bold text-[#181d14] hover:bg-[#f4f6f2] transition-colors"
                >
                  {t.back}
                </button>
              )}
              <button
                id="reg-next-btn"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 h-[48px] rounded-xl bg-[#1e5c33] text-white text-[14px] font-bold shadow-sm hover:bg-[#16432a] active:scale-[0.99] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                    </svg>
                    {t.submitting}
                  </>
                ) : currentStep === 5 ? (
                  t.submit
                ) : (
                  <>
                    {t.next}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[12.5px] text-[#6b7563] mt-4">
          {t.alreadyReg}{" "}
          <button onClick={() => navigate("/login")} className="font-bold text-[#1e5c33] hover:underline">
            {t.loginLink}
          </button>
        </p>
      </main>

      {/* ── Success Modal ── */}
      {successData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#dde4d7] text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Checkmark */}
            <div className="w-16 h-16 rounded-full bg-[#e6f3eb] border-2 border-[#a8d4b8] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e5c33" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-[#1e5c33] uppercase tracking-widest">{t.successTitle}</p>
            <h3 className="text-[22px] font-[800] text-[#181d14] mt-1">
              {lang === "en" ? "Welcome" : "स्वागत"}, {successData.name.split(" ")[0]}!
            </h3>
            <p className="text-[13px] text-[#6b7563] mt-1">{t.successSub}</p>

            <div className="my-5 p-4 rounded-2xl bg-[#f4f6f2] border border-[#dde4d7] text-left space-y-2.5">
              <InfoRow label={t.successLabel} value={successData.farmerId} mono />
              <InfoRow label={t.successState} value={`${formData.district}, UP`} />
              <InfoRow label={t.successDbt} value={t.successDbtStatus} green />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/farmer/home")}
                className="w-full h-[48px] rounded-xl bg-[#1e5c33] text-white font-bold text-[14px] shadow hover:bg-[#16432a] transition-colors"
              >
                {t.goToDash}
              </button>
              <button
                onClick={() => navigate("/farmer/centers")}
                className="w-full h-[44px] rounded-xl border border-[#dde4d7] font-bold text-[14px] text-[#181d14] hover:bg-[#f4f6f2] transition-colors"
              >
                {t.findCentre}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[#181d14] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono, green }: { label: string; value: string; mono?: boolean; green?: boolean }) {
  return (
    <div className="flex justify-between items-center text-[13px]">
      <span className="text-[#6b7563]">{label}</span>
      <span className={`font-bold ${mono ? "font-mono text-[#1e5c33]" : green ? "text-[#16a34a]" : "text-[#181d14]"}`}>
        {value}
      </span>
    </div>
  );
}

const inputCls =
  "w-full px-3.5 h-[46px] rounded-xl border border-[#dde4d7] text-[14px] text-[#181d14] focus:outline-none focus:border-[#1e5c33] focus:ring-1 focus:ring-[#1e5c33] transition-all bg-white placeholder:text-[#aab8a4]";

const selectCls =
  "w-full px-3.5 h-[46px] rounded-xl border border-[#dde4d7] text-[14px] text-[#181d14] focus:outline-none focus:border-[#1e5c33] focus:ring-1 focus:ring-[#1e5c33] transition-all bg-white appearance-none";
