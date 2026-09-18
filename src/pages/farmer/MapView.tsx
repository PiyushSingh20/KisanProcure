import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import L from 'leaflet';
import { DEMO_CENTRES, DEMO_CROPS } from '../../lib/demoData';
import { UP_DISTRICTS, type ProcurementCenter } from '../../lib/types';
import { ChevronLeftIcon, MapPinIcon, ClockIcon, CheckIcon } from '../../components/Icons';

// UP District coordinate anchors
const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Prayagraj': [25.4358, 81.8463],
  'Lucknow': [26.8467, 80.9462],
  'Varanasi': [25.3176, 82.9739],
  'Gorakhpur': [26.7606, 83.3732],
  'Kanpur Nagar': [26.4499, 80.3319],
  'Agra': [27.1767, 78.0081],
  'Meerut': [28.9845, 77.7064],
  'Ayodhya': [26.7922, 82.1998],
  'Bareilly': [28.3670, 79.4304],
  'Jhansi': [25.4484, 78.5685],
};

export default function MapView() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [activeCenter, setActiveCenter] = useState<ProcurementCenter | null>(null);

  // Filter centres
  const filteredCenters = DEMO_CENTRES.filter(center => {
    const matchesDistrict = selectedDistrict === 'ALL' || center.district === selectedDistrict;
    const matchesCrop =
      selectedCrop === 'ALL' ||
      (center.supportedCrops && center.supportedCrops.some(c => c.toLowerCase().includes(selectedCrop.toLowerCase())));
    return matchesDistrict && matchesCrop;
  });

  // Initialize and update Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [26.8467, 80.9462], // UP Center (Lucknow)
        zoom: 7,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add Markers for filtered centres
    filteredCenters.forEach(c => {
      if (!c.latitude || !c.longitude) return;

      const isSelected = activeCenter?.id === c.id;
      const markerColor = c.status === 'ACTIVE' ? '#16a34a' : c.status === 'FULL' ? '#ea580c' : '#6b7280';

      const customIcon = L.divIcon({
        className: 'custom-center-pin',
        html: `
          <div style="
            background: ${markerColor};
            width: ${isSelected ? '32px' : '24px'};
            height: ${isSelected ? '32px' : '24px'};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${isSelected ? '14px' : '11px'};
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            🌾
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([c.latitude, c.longitude], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setActiveCenter(c);
        map.flyTo([c.latitude!, c.longitude!], 11, { duration: 1.2 });
      });

      markersRef.current.push(marker);
    });

    // Handle District Zoom
    if (selectedDistrict !== 'ALL' && DISTRICT_COORDS[selectedDistrict]) {
      map.flyTo(DISTRICT_COORDS[selectedDistrict], 10, { duration: 1.2 });
    }

  }, [filteredCenters.length, selectedDistrict, selectedCrop, activeCenter?.id]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col bg-[#f4f6f2] overflow-hidden">
      {/* Floating Header */}
      <header className="absolute top-3 inset-x-3 z-30 max-w-2xl mx-auto flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#dde4d7] p-2.5 px-3.5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/farmer/centers')}
              className="p-1.5 rounded-xl bg-[#f4f6f2] hover:bg-[#e6eee3] text-[#181d14] transition-colors"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <div>
              <h1 className="text-sm font-bold text-[#181d14] flex items-center gap-1.5">
                <span>📍</span> UP Procurement Centre Map
              </h1>
              <p className="text-[10px] text-[#6b7563]">Live verified GPS coordinates</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/farmer/centers')}
            className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#e6f3eb] text-[#1e5c33] border border-[#a8d4b8] hover:bg-[#d8edd0]"
          >
            List View
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2">
          {/* District Dropdown */}
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="flex-1 text-xs font-semibold py-2 px-3 rounded-xl bg-white/95 backdrop-blur-md border border-[#dde4d7] text-[#181d14] shadow-sm focus:outline-none"
          >
            <option value="ALL">All Uttar Pradesh ({DEMO_CENTRES.length} Centres)</option>
            {Object.keys(DISTRICT_COORDS).map(dist => (
              <option key={dist} value={dist}>{dist} District</option>
            ))}
          </select>

          {/* Crop Dropdown */}
          <select
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl bg-white/95 backdrop-blur-md border border-[#dde4d7] text-[#181d14] shadow-sm focus:outline-none"
          >
            <option value="ALL">All Crops</option>
            <option value="Wheat">Wheat (गेहूं)</option>
            <option value="Paddy">Paddy (धान)</option>
            <option value="Mustard">Mustard (सरसों)</option>
            <option value="Gram">Gram (चना)</option>
          </select>
        </div>
      </header>

      {/* Full Map Canvas */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

      {/* Selected Centre Detail Drawer */}
      {activeCenter && (
        <div className="absolute bottom-4 inset-x-4 z-30 max-w-lg mx-auto bg-white rounded-3xl p-4 sm:p-5 border border-[#dde4d7] shadow-xl animate-in slide-in-from-bottom-6 duration-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e6f3eb] text-[#1e5c33]">
                  {activeCenter.operatingAuthority || 'Food & Civil Supplies'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeCenter.status === 'ACTIVE' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fed7aa] text-[#c2410c]'
                }`}>
                  {activeCenter.status === 'ACTIVE' ? 'Open for Tokens' : 'High Queue Load'}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#181d14] mt-1.5">{activeCenter.name}</h3>
              <p className="text-xs text-[#6b7563] flex items-center gap-1 mt-0.5">
                <MapPinIcon size={12} /> {activeCenter.address}, {activeCenter.district}
              </p>
            </div>
            <button
              onClick={() => setActiveCenter(null)}
              className="p-1.5 rounded-lg text-[#9ca3af] hover:bg-[#f4f6f2]"
            >
              ✕
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-2xl bg-[#f8faf7] border border-[#dde4d7] text-center">
            <div>
              <span className="text-[10px] text-[#6b7563] block">Capacity</span>
              <span className="text-xs font-bold text-[#181d14]">{activeCenter.capacityPerDay} Q/day</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6b7563] block">Distance</span>
              <span className="text-xs font-bold text-[#1e5c33]">{activeCenter.distance || 4.5} km</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6b7563] block">Timing</span>
              <span className="text-xs font-bold text-[#181d14]">{activeCenter.workingHours || '9 AM - 5 PM'}</span>
            </div>
          </div>

          {/* Supported Crops */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {activeCenter.supportedCrops?.map(crop => (
              <span key={crop} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#f4f6f2] text-[#181d14]">
                🌾 {crop}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/farmer/centers/${activeCenter.id}`)}
              className="flex-1 py-2.5 rounded-xl border border-[#dde4d7] text-xs font-bold text-[#181d14] hover:bg-[#f4f6f2]"
            >
              View Full Details
            </button>
            <button
              onClick={() => navigate('/farmer/book')}
              className="flex-1 py-2.5 rounded-xl bg-[#1e5c33] text-white text-xs font-bold shadow hover:bg-[#143d22]"
            >
              Book Delivery Slot →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
