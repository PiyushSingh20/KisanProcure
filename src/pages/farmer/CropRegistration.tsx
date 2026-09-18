import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DEMO_CROPS } from '../../lib/demoData';
import { ChevronLeftIcon, CheckIcon, AlertCircleIcon, WheatIcon } from '../../components/Icons';

interface DeclaredCrop {
  id: string;
  cropId: string;
  cropName: string;
  hindiName?: string;
  season: string;
  acres: number;
  expectedYield: number; // in Quintals
  sowingDate: string;
  harvestDate: string;
  msp: number;
  status: 'REGISTERED' | 'HARVESTED' | 'PROCURED';
}

const INITIAL_CROPS: DeclaredCrop[] = [
  {
    id: 'dc-1',
    cropId: 'c1',
    cropName: 'Wheat',
    hindiName: 'गेहूं',
    season: 'RABI',
    acres: 3.5,
    expectedYield: 65,
    sowingDate: '2024-11-10',
    harvestDate: '2025-03-25',
    msp: 2275,
    status: 'REGISTERED',
  },
  {
    id: 'dc-2',
    cropId: 'c12',
    cropName: 'Mustard',
    hindiName: 'सरसों',
    season: 'RABI',
    acres: 1.2,
    expectedYield: 18,
    sowingDate: '2024-10-20',
    harvestDate: '2025-02-28',
    msp: 5650,
    status: 'REGISTERED',
  },
];

export default function CropRegistration() {
  const navigate = useNavigate();
  const [crops, setCrops] = useState<DeclaredCrop[]>(INITIAL_CROPS);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for Adding New Crop
  const [selectedCropId, setSelectedCropId] = useState(DEMO_CROPS[1].id); // Paddy
  const [acres, setAcres] = useState(2.0);
  const [expectedYield, setExpectedYield] = useState(40);
  const [sowingDate, setSowingDate] = useState('2024-07-01');
  const [harvestDate, setHarvestDate] = useState('2024-11-15');

  const selectedCropObj = DEMO_CROPS.find(c => c.id === selectedCropId);

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCropObj) return;

    const newCrop: DeclaredCrop = {
      id: `dc-${Date.now()}`,
      cropId: selectedCropObj.id,
      cropName: selectedCropObj.name,
      hindiName: selectedCropObj.hindiName,
      season: selectedCropObj.season || 'KHARIF',
      acres: Number(acres),
      expectedYield: Number(expectedYield),
      sowingDate,
      harvestDate,
      msp: selectedCropObj.msp || 2000,
      status: 'REGISTERED',
    };

    setCrops([newCrop, ...crops]);
    setShowAddModal(false);
  };

  const totalExpectedQuintals = crops.reduce((sum, c) => sum + c.expectedYield, 0);
  const totalEstimatedMspValue = crops.reduce((sum, c) => sum + (c.expectedYield * c.msp), 0);

  return (
    <div className="min-h-screen bg-[#f4f6f2] flex flex-col pb-16">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#dde4d7] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/farmer/home')}
              className="p-2 rounded-xl bg-[#f4f6f2] hover:bg-[#e6eee3] text-[#181d14] transition-colors"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <div>
              <h1 className="text-base font-bold text-[#181d14]">My Registered Crops</h1>
              <p className="text-[11px] text-[#6b7563]">Manage land produce for government procurement</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1e5c33] text-white hover:bg-[#143d22] transition-colors flex items-center gap-1.5"
          >
            <span>+</span> Register New Crop
          </button>
        </div>
      </header>

      <main className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Summary Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#dde4d7] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#f4f6f2]">
            <span className="text-xs font-bold text-[#1e5c33] uppercase tracking-wider flex items-center gap-1.5">
              <WheatIcon size={16} /> 2024-25 Season Portfolio
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#e6f3eb] text-[#1e5c33]">
              {crops.length} Crops Active
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-[#6b7563]">Total Expected Surplus</p>
              <p className="text-xl font-bold text-[#181d14] mt-0.5">
                {totalExpectedQuintals} <span className="text-sm font-normal text-[#6b7563]">Quintals</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6b7563]">Assured MSP Valuation</p>
              <p className="text-xl font-bold text-[#1e5c33] mt-0.5">
                ₹{totalEstimatedMspValue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* List of Registered Crops */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#181d14]">Active Crop Declarations</h2>

          {crops.map(crop => {
            const cropValue = crop.expectedYield * crop.msp;
            return (
              <div
                key={crop.id}
                className="bg-white rounded-2xl p-4 border border-[#dde4d7] shadow-xs hover:border-[#1e5c33]/40 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#181d14]">{crop.cropName}</h3>
                      {crop.hindiName && (
                        <span className="text-sm font-semibold text-[#1e5c33]">({crop.hindiName})</span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e6f3eb] text-[#1e5c33]">
                        {crop.season}
                      </span>
                    </div>
                    <p className="text-xs text-[#6b7563] mt-0.5">
                      {crop.acres} Acres Cultivated · Sown {crop.sowingDate}
                    </p>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] flex items-center gap-1">
                    <CheckIcon size={12} /> Verified
                  </span>
                </div>

                {/* Details Bar */}
                <div className="grid grid-cols-3 gap-2 bg-[#f8faf7] p-2.5 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] text-[#6b7563] block">Declared Yield</span>
                    <span className="text-xs font-bold text-[#181d14]">{crop.expectedYield} Q</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7563] block">Govt MSP</span>
                    <span className="text-xs font-bold text-[#1e5c33]">₹{crop.msp}/Q</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7563] block">Est. Revenue</span>
                    <span className="text-xs font-bold text-[#181d14]">₹{cropValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#6b7563]">
                    Estimated Harvest: <strong className="text-[#181d14]">{crop.harvestDate}</strong>
                  </span>
                  <button
                    onClick={() => navigate('/farmer/book')}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1e5c33] text-white hover:bg-[#143d22] transition-colors"
                  >
                    Book Delivery Slot →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Regulatory Note */}
        <div className="bg-white p-4 rounded-2xl border border-[#dde4d7] flex items-start gap-3">
          <AlertCircleIcon size={18} className="text-[#1e5c33] shrink-0 mt-0.5" />
          <div className="text-xs text-[#6b7563]">
            <p className="font-bold text-[#181d14] mb-0.5">Yield Verification Protocol</p>
            <p>
              Under Food Corporation of India (FCI) norms, registered produce declarations are cross-verified with Patwari / Land Revenue digital khasra records to prevent unauthorized trader infiltration.
            </p>
          </div>
        </div>
      </main>

      {/* Add Crop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-[#dde4d7] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[#181d14]">Register Crop for Procurement</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#6b7563] hover:bg-[#f4f6f2]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCrop} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#181d14] mb-1">Select Crop *</label>
                <select
                  value={selectedCropId}
                  onChange={e => setSelectedCropId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#dde4d7] text-sm bg-white font-medium"
                >
                  {DEMO_CROPS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.hindiName || c.name}) — MSP ₹{c.msp || 'N/A'}/Q
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#181d14] mb-1">Acres Sown *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={acres}
                    onChange={e => setAcres(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dde4d7] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181d14] mb-1">Expected Yield (Q) *</label>
                  <input
                    type="number"
                    min="1"
                    value={expectedYield}
                    onChange={e => setExpectedYield(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dde4d7] text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#181d14] mb-1">Sowing Date</label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={e => setSowingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dde4d7] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181d14] mb-1">Expected Harvest</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={e => setHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#dde4d7] text-sm"
                  />
                </div>
              </div>

              {selectedCropObj && (
                <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#166534]">Official MSP Rate:</span>
                    <strong className="text-[#1e5c33]">₹{selectedCropObj.msp || 0} per Quintal</strong>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[#166534]">Est. Total Guarantee:</span>
                    <strong className="text-[#1e5c33]">
                      ₹{((selectedCropObj.msp || 0) * expectedYield).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#dde4d7] text-xs font-bold text-[#181d14] hover:bg-[#f4f6f2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1e5c33] text-white text-xs font-bold shadow hover:bg-[#143d22]"
                >
                  Save Crop Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
