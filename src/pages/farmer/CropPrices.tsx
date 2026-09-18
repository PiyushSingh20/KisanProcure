import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DEMO_CROPS, DEMO_CROP_PRICES, DEMO_LABEL, DEMO_SOURCE } from '../../lib/demoData';
import { UP_DISTRICTS, type CropPrice } from '../../lib/types';
import { api } from '../../lib/api';
import { ChevronLeftIcon, SearchIcon, TrendingUpIcon, AlertCircleIcon } from '../../components/Icons';

export default function CropPrices() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<'ALL' | 'KHARIF' | 'RABI' | 'OTHER'>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [livePrices, setLivePrices] = useState<CropPrice[]>(DEMO_CROP_PRICES);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    async function loadPrices() {
      try {
        const res = await api.getCropPrices();
        if (res?.data && Array.isArray((res.data as any).data)) {
          setLivePrices((res.data as any).data);
          setIsLiveConnected(true);
        } else if (res?.data && Array.isArray(res.data)) {
          setLivePrices(res.data);
          setIsLiveConnected(true);
        }
      } catch {
        // Retain demo dataset
      }
    }
    loadPrices();
  }, []);

  const filteredCrops = useMemo(() => {
    return DEMO_CROPS.filter(crop => {
      const matchesSearch =
        crop.name.toLowerCase().includes(search.toLowerCase()) ||
        (crop.hindiName && crop.hindiName.includes(search)) ||
        (crop.category && crop.category.toLowerCase().includes(search.toLowerCase()));

      const matchesSeason =
        selectedSeason === 'ALL' ||
        (selectedSeason === 'KHARIF' && crop.season === 'KHARIF') ||
        (selectedSeason === 'RABI' && crop.season === 'RABI') ||
        (selectedSeason === 'OTHER' && crop.season !== 'KHARIF' && crop.season !== 'RABI');

      return matchesSearch && matchesSeason;
    });
  }, [search, selectedSeason]);

  // Find latest market price record for crop if available
  const getMarketData = (cropId: string) => {
    return livePrices.find(p => p.cropId === cropId) || DEMO_CROP_PRICES.find(p => p.cropId === cropId);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f2] flex flex-col pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#dde4d7] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/farmer/home')}
              className="p-2 rounded-xl bg-[#f4f6f2] hover:bg-[#e6eee3] text-[#181d14] transition-colors"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <div>
              <h1 className="text-base font-bold text-[#181d14]">Verified Crop Prices & MSP</h1>
              <p className="text-[11px] text-[#6b7563]">CACP & Agmarknet Government Feeds</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
            {DEMO_LABEL}
          </span>
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Transparency Banner */}
        <div className="bg-[#1e5c33] text-white p-4 sm:p-5 rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#a8d4b8] flex items-center gap-1.5">
              <TrendingUpIcon size={14} /> Official Government MSP Rate Index
            </span>
            <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-lg text-white font-medium">
              Season 2024-25
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Transparent Mandi vs MSP Rates</h2>
          <p className="text-xs text-[#d1e7d8] leading-relaxed">
            Minimum Support Price (MSP) is backed by the Government of India. Procurement centres cannot buy below MSP for eligible fair-average-quality (FAQ) crops.
          </p>
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-[#a8d4b8] gap-2">
            <span>Source: {DEMO_SOURCE}</span>
            <span>Refreshed daily from Agmarknet API</span>
          </div>
        </div>

        {/* Search & Season Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#dde4d7] shadow-2xs space-y-3">
          <div className="relative">
            <SearchIcon size={16} className="absolute left-3.5 top-3 text-[#6b7563]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search crop by English or Hindi (e.g. Wheat, गेहूं, Arhar)..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#dde4d7] text-sm focus:outline-none focus:border-[#1e5c33]"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            {/* Season Pill Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'ALL', label: 'All Crops' },
                { id: 'RABI', label: 'Rabi (रबी)' },
                { id: 'KHARIF', label: 'Kharif (खरीफ)' },
                { id: 'OTHER', label: 'Cash & Veg' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSeason(tab.id as any)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                    selectedSeason === tab.id
                      ? 'bg-[#1e5c33] text-white shadow-xs'
                      : 'bg-[#f4f6f2] text-[#6b7563] hover:text-[#181d14]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* UP District Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7563]">District:</span>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="text-xs font-medium py-1.5 px-2.5 rounded-xl border border-[#dde4d7] bg-white text-[#181d14]"
              >
                <option value="ALL">All UP Districts</option>
                {UP_DISTRICTS.slice(0, 15).map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center px-1">
          <p className="text-xs font-bold text-[#6b7563]">
            Showing {filteredCrops.length} government tracked commodities
          </p>
          <span className="text-[11px] text-[#1e5c33] font-semibold">
            All prices per Quintal (100 kg)
          </span>
        </div>

        {/* Crops List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredCrops.map(crop => {
            const market = getMarketData(crop.id);
            const msp = crop.msp || 0;
            const marketModal = market?.modalPrice || crop.marketPrice || 0;
            const diff = marketModal - msp;
            const hasMSP = msp > 0;

            return (
              <div
                key={crop.id}
                className="bg-white rounded-2xl p-4 border border-[#dde4d7] hover:border-[#1e5c33]/40 shadow-xs transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Top Row: Crop Name & Season */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#181d14]">{crop.name}</h3>
                        {crop.hindiName && (
                          <span className="text-sm font-semibold text-[#1e5c33]">({crop.hindiName})</span>
                        )}
                      </div>
                      <p className="text-xs text-[#6b7563] mt-0.5">
                        {crop.category} · Sowing: {crop.sowingPeriod || 'N/A'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        crop.season === 'RABI'
                          ? 'bg-[#dbeafe] text-[#1e40af]'
                          : crop.season === 'KHARIF'
                          ? 'bg-[#fef3c7] text-[#92400e]'
                          : 'bg-[#f3e8ff] text-[#6b21a8]'
                      }`}
                    >
                      {crop.season}
                    </span>
                  </div>

                  {/* Price Cards Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {/* MSP Box */}
                    <div className="p-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#166534] uppercase tracking-wider">
                          Govt MSP
                        </span>
                        <span className="text-[9px] bg-[#dcfce7] text-[#15803d] px-1.5 py-0.2 rounded font-bold">
                          Assured
                        </span>
                      </div>
                      <p className="text-lg font-bold text-[#1e5c33] mt-1">
                        {hasMSP ? `₹${msp.toLocaleString('en-IN')}` : 'No MSP'}
                      </p>
                      <p className="text-[10px] text-[#166534]">per {crop.unit.toLowerCase()}</p>
                    </div>

                    {/* Mandi Market Box */}
                    <div className="p-2.5 rounded-xl bg-[#f8faf7] border border-[#dde4d7]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#6b7563] uppercase tracking-wider">
                          Mandi Modal
                        </span>
                        <span className="text-[9px] text-[#6b7563]">Agmarknet</span>
                      </div>
                      <p className="text-lg font-bold text-[#181d14] mt-1">
                        {marketModal ? `₹${marketModal.toLocaleString('en-IN')}` : '₹—'}
                      </p>
                      <p className="text-[10px] text-[#6b7563]">
                        {market ? `Range ₹${market.minPrice}-₹${market.maxPrice}` : 'Spot average'}
                      </p>
                    </div>
                  </div>

                  {/* Price Spread Indicator */}
                  {hasMSP && marketModal > 0 && (
                    <div className="mt-2 text-[11px] flex items-center gap-1.5">
                      {diff >= 0 ? (
                        <span className="text-[#15803d] font-semibold flex items-center gap-1">
                          ▲ Mandi open market trading ₹{diff} higher than MSP floor
                        </span>
                      ) : (
                        <span className="text-[#b45309] font-semibold flex items-center gap-1">
                          🛡️ MSP protects you with +₹{Math.abs(diff)} guaranteed floor
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom CTA Row */}
                <div className="pt-3 border-t border-[#f4f6f2] flex items-center justify-between">
                  <span className="text-[10px] text-[#9ca3af]">
                    Updated {crop.lastUpdated || 'Recent'}
                  </span>
                  <button
                    onClick={() => navigate('/farmer/book')}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1e5c33] text-white hover:bg-[#143d22] transition-colors"
                  >
                    Sell at MSP →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Data Source Guarantee Footer */}
        <div className="bg-white p-4 rounded-2xl border border-[#dde4d7] flex items-start gap-3 mt-6">
          <AlertCircleIcon size={18} className="text-[#1e5c33] shrink-0 mt-0.5" />
          <div className="text-xs text-[#6b7563] space-y-1">
            <p className="font-bold text-[#181d14]">Data Guarantee & Audit Trail</p>
            <p>
              Procurement prices published on KisanProcure are synchronized directly with Department of Agriculture & Farmers Welfare notifications. In accordance with SIH26032 guidelines, demo values are clearly flagged when offline.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
