import { useNavigate } from 'react-router';
import { ChevronRightIcon } from '../../components/Icons';
import { useLanguage } from '../../context/LanguageContext';

const MENU = [
  { emoji: '🌾', label: 'My Produce', path: '' },
  { emoji: '📋', label: 'My History', path: '/farmer/history' },
  { emoji: '📄', label: 'Documents', path: '' },
  { emoji: '📱', label: 'Install Android App (APK / PWA)', path: '', action: 'install' },
  { emoji: '🌐', label: 'Language', path: '', action: 'lang' },
  { emoji: '🔔', label: 'Notifications', path: '/farmer/notifications' },
  { emoji: '❓', label: 'Help & Support', path: '' },
  { emoji: '⚙️', label: 'Settings', path: '' },
];

export default function FarmerProfile() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="min-h-full pb-6">
      <div className="bg-white border-b border-[#dde4d7] px-5 pt-14 pb-5">
        <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">{t.profile}</h1>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl p-5 border border-[#dde4d7] flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#1e5c33] flex items-center justify-center text-white text-[24px] font-[700] shrink-0">
            P
          </div>
          <div className="flex-1">
            <p className="text-[18px] font-[700] text-[#181d14]">Piyush Kumar</p>
            <p className="text-[14px] text-[#6b7563] mt-0.5">+91 98765 43210</p>
            <p className="text-[13px] text-[#6b7563]">ID: KP-UP-240891</p>
          </div>
          <button className="px-3 py-1.5 rounded-xl border border-[#dde4d7] text-[13px] font-[500] text-[#6b7563]">
            Edit
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Bookings', value: '12' },
            { label: 'Completed', value: '11' },
            { label: 'Total', value: '₹1.2L' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-[#dde4d7] text-center">
              <p className="text-[20px] font-[700] text-[#1e5c33]">{value}</p>
              <p className="text-[11px] text-[#6b7563] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Language toggle */}
        <div className="bg-white rounded-2xl p-4 border border-[#dde4d7]">
          <p className="text-[12px] text-[#6b7563] font-[600] uppercase tracking-widest mb-3">{t.language}</p>
          <div className="flex gap-2">
            {(['en', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 py-2.5 rounded-xl text-[14px] font-[600] transition-colors ${
                  lang === l ? 'bg-[#1e5c33] text-white' : 'bg-[#f4f6f2] text-[#6b7563]'
                }`}
              >
                {l === 'en' ? 'English' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl border border-[#dde4d7] overflow-hidden">
          {MENU.filter((m) => m.action !== 'lang').map((item, i) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-[#f4f6f2] transition-colors text-left ${
                i < MENU.filter((m) => m.action !== 'lang').length - 1 ? 'border-b border-[#dde4d7]' : ''
              }`}
            >
              <span className="text-xl w-7 text-center">{item.emoji}</span>
              <p className="flex-1 text-[15px] font-[500] text-[#181d14]">{item.label}</p>
              <ChevronRightIcon size={18} className="text-[#b0bba8]" />
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={() => navigate('/login')}
          className="w-full h-[50px] rounded-2xl border border-[#dc2626]/30 text-[#dc2626] text-[15px] font-[600] hover:bg-red-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
