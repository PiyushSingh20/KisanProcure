import { useState } from 'react';
import { useNavigate } from 'react-router';

const ENV_VARS = [
  { key: 'API Backend URL', value: 'http://localhost:3000/api/v1', editable: false },
  { key: 'Frontend Port', value: '5173', editable: false },
  { key: 'Database', value: 'PostgreSQL (Prisma ORM)', editable: false },
  { key: 'Auth Strategy', value: 'JWT + OTP', editable: false },
  { key: 'AI Model', value: 'LightGBM / Rule-based RAG', editable: false },
];

const LINKS = [
  { label: '📘 API Documentation (Swagger)', url: 'http://localhost:3000/docs' },
  { label: '🗄️ Prisma Studio (Database)', url: 'http://localhost:5555' },
  { label: '🤖 AI Model Status', url: 'http://localhost:3000/api/v1/ai/model-status' },
  { label: '💊 Health Check', url: 'http://localhost:3000/api/v1/health' },
];

export default function AdminSettings() {
  const navigate = useNavigate();
  const [roleSwitch, setRoleSwitch] = useState('ADMIN');

  const switchRole = () => {
    if (roleSwitch === 'ADMIN') navigate('/farmer');
    else if (roleSwitch === 'OFFICER') navigate('/officer');
    else navigate('/');
  };

  return (
    <div className="p-6 flex flex-col gap-6 min-h-full">
      <div>
        <h1 className="text-[24px] font-[700] tracking-[-0.5px] text-[#181d14]">Settings & System</h1>
        <p className="text-[13px] text-[#6b7563] mt-0.5">System configuration, developer tools, and role management</p>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-2xl border border-[#dde4d7] p-5">
        <p className="text-[14px] font-[700] text-[#181d14] mb-4">System Configuration</p>
        <div className="flex flex-col gap-2">
          {ENV_VARS.map(({ key, value }) => (
            <div key={key} className="flex justify-between items-center py-2 border-b border-[#f4f6f2] last:border-0">
              <span className="text-[12px] text-[#6b7563]">{key}</span>
              <span className="text-[12px] font-[600] font-mono text-[#181d14] bg-[#f4f6f2] px-3 py-1 rounded-lg">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Developer Links */}
      <div className="bg-white rounded-2xl border border-[#dde4d7] p-5">
        <p className="text-[14px] font-[700] text-[#181d14] mb-4">Developer Tools</p>
        <div className="grid grid-cols-2 gap-3">
          {LINKS.map(({ label, url }) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl border border-[#dde4d7] hover:border-[#1e5c33] hover:bg-[#f4f6f2] transition-all group"
            >
              <span className="text-[13px] font-[500] text-[#181d14] group-hover:text-[#1e5c33] transition-colors">{label}</span>
              <span className="ml-auto text-[#6b7563] group-hover:text-[#1e5c33]">↗</span>
            </a>
          ))}
        </div>
      </div>

      {/* Role Switch */}
      <div className="bg-white rounded-2xl border border-[#dde4d7] p-5">
        <p className="text-[14px] font-[700] text-[#181d14] mb-1">Demo Role Switch</p>
        <p className="text-[12px] text-[#6b7563] mb-4">Switch to a different role to preview that dashboard (for demo/hackathon purposes)</p>
        <div className="flex gap-3 items-center">
          <select
            value={roleSwitch}
            onChange={e => setRoleSwitch(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl border border-[#dde4d7] text-[13px] text-[#181d14] outline-none focus:border-[#1e5c33] bg-white"
          >
            <option value="ADMIN">Admin Portal</option>
            <option value="OFFICER">Officer Dashboard</option>
            <option value="FARMER">Farmer App</option>
          </select>
          <button
            onClick={switchRole}
            className="px-5 py-2.5 rounded-xl bg-[#1e5c33] text-white text-[13px] font-[600] hover:bg-[#16432a] transition-colors"
          >
            Switch →
          </button>
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-[#f4f6f2] rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1e5c33] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 44 44" fill="none"><path d="M22 8C22 8 10 16 10 28a12 12 0 0024 0C34 16 22 8 22 8z" fill="white" /></svg>
          </div>
          <div>
            <p className="text-[15px] font-[700] text-[#181d14]">KisanProcure — Admin Portal</p>
            <p className="text-[12px] text-[#6b7563]">Smart India Hackathon 2026 · Problem SIH26032 · Built with NestJS + React + PostgreSQL</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[11px] text-[#6b7563]">Version</p>
            <p className="text-[14px] font-[700] text-[#181d14]">1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
