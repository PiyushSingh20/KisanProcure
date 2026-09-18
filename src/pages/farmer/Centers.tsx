import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { SearchIcon, MapPinIcon } from '../../components/Icons';
import { DEMO_CENTRES, recommendCentres } from '../../lib/demoData';
import { UP_DISTRICTS, type ProcurementCenter } from '../../lib/types';

export default function Centers() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'HIGH_CAPACITY'>('ALL');

  // AI Recommended Centres for default crop (Wheat)
  const recommendations = useMemo(() => {
    return recommendCentres({
      cropCode: 'WHEAT',
      district: 'Prayagraj',
      quantity: 40,
    });
  }, []);

  const recommendedIds = useMemo(() => {
    return new Set(recommendations.map(r => r.center.id));
  }, [recommendations]);

  const filtered = useMemo(() => {
    return DEMO_CENTRES.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.district.toLowerCase().includes(query.toLowerCase()) ||
        (c.address && c.address.toLowerCase().includes(query.toLowerCase()));

      const matchesDistrict = selectedDistrict === 'ALL' || c.district === selectedDistrict;

      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'ACTIVE' && c.status === 'ACTIVE') ||
        (activeFilter === 'HIGH_CAPACITY' && c.capacityPerDay >= 150);

      return matchesSearch && matchesDistrict && matchesFilter;
    });
  }, [query, selectedDistrict, activeFilter]);

  return (
    <div className="min-h-full pb-16">
      {/* Header */}
      <div className="bg-white border-b border-[#dde4d7] px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#181d14]">Procurement Centres</h1>
            <p className="text-xs text-[#6b7563]">Verified UP Food & Civil Supplies Mandis</p>
          </div>
          <button
            onClick={() => navigate('/farmer/map')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e5c33] text-white text-xs font-bold shadow-xs hover:bg-[#143d22] transition-colors"
          >
            <span>🗺️</span> Open Map
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-[#f4f6f2] rounded-2xl px-3.5 h-11 border border-[#dde4d7] mt-3">
          <SearchIcon size={18} className="text-[#6b7563] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by center name or town..."
            className="flex-1 bg-transparent text-xs text-[#181d14] placeholder:text-[#6b7563] outline-none"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeFilter === 'ALL' ? 'bg-[#1e5c33] text-white' : 'bg-[#f4f6f2] text-[#6b7563]'
            }`}
          >
            All Centres
          </button>
          <button
            onClick={() => setActiveFilter('ACTIVE')}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeFilter === 'ACTIVE' ? 'bg-[#1e5c33] text-white' : 'bg-[#f4f6f2] text-[#6b7563]'
            }`}
          >
            Open for Tokens
          </button>
          <button
            onClick={() => setActiveFilter('HIGH_CAPACITY')}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeFilter === 'HIGH_CAPACITY' ? 'bg-[#1e5c33] text-white' : 'bg-[#f4f6f2] text-[#6b7563]'
            }`}
          >
            High Capacity (&gt;150 Q/day)
          </button>
        </div>

        {/* District Selector */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-[#6b7563] font-medium">Filter by UP District:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-[#dde4d7] bg-[#f8faf7] text-[#181d14] font-medium"
          >
            <option value="ALL">All Uttar Pradesh ({DEMO_CENTRES.length})</option>
            {UP_DISTRICTS.slice(0, 15).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content list */}
      <div className="px-5 pt-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold text-[#6b7563]">
            Showing {filtered.length} verified government centres
          </p>
          <span className="text-[11px] text-[#1e5c33] font-semibold cursor-pointer" onClick={() => navigate('/farmer/map')}>
            View on UP Map →
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((center) => {
            const isRecommended = recommendedIds.has(center.id);
            const isOpen = center.status === 'ACTIVE';

            return (
              <div
                key={center.id}
                className="bg-white rounded-2xl p-4 border border-[#dde4d7] shadow-xs hover:border-[#1e5c33]/40 transition-all flex flex-col gap-3"
              >
                {/* Header row */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      {isRecommended && (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] mb-1">
                          ⚡ AI Recommended
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-[#181d14] leading-snug">
                        {center.name}
                      </h3>
                      <p className="text-xs text-[#6b7563] flex items-center gap-1 mt-0.5">
                        <MapPinIcon size={12} /> {center.district}, UP · {center.operatingAuthority || 'PCF / Mandi Samiti'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        isOpen ? 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]' : 'bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]'
                      }`}
                    >
                      {isOpen ? '● Available' : '● Busy'}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-[#f8faf7] p-2 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] text-[#6b7563] block">Capacity</span>
                    <span className="text-xs font-bold text-[#181d14]">{center.capacityPerDay} Q/day</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7563] block">Distance</span>
                    <span className="text-xs font-bold text-[#1e5c33]">{center.distance || 3.8} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6b7563] block">Timing</span>
                    <span className="text-xs font-bold text-[#181d14]">{center.workingHours || '9 AM - 5 PM'}</span>
                  </div>
                </div>

                {/* Supported crops tags */}
                {center.supportedCrops && (
                  <div className="flex flex-wrap gap-1">
                    {center.supportedCrops.map((crop) => (
                      <span key={crop} className="text-[10px] px-1.5 py-0.5 rounded bg-[#f4f6f2] text-[#4b5563]">
                        {crop}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/farmer/centers/${center.id}`)}
                    className="flex-1 py-2 rounded-xl border border-[#dde4d7] text-xs font-bold text-[#181d14] hover:bg-[#f4f6f2] transition-colors"
                  >
                    Center Info
                  </button>
                  <button
                    onClick={() => navigate('/farmer/book')}
                    className="flex-1 py-2 rounded-xl bg-[#1e5c33] text-white text-xs font-bold shadow hover:bg-[#143d22] transition-colors"
                  >
                    Book Slot →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
