import { useState, useEffect } from 'react';

interface FarmerItem {
  id: string;
  farmerCode: string;
  aadhaarNumber?: string;
  bankAccount?: string;
  village?: string;
  district?: string;
  state?: string;
  totalLandArea?: number;
  user?: {
    firstName: string;
    lastName: string;
    mobileNumber: string;
    email?: string;
  };
  produce?: Array<{
    id: string;
    quantity: number;
    crop?: { name: string; category?: string };
  }>;
  _count?: {
    bookings: number;
    procurementRecords: number;
  };
}

const FALLBACK_FARMERS: FarmerItem[] = [
  {
    id: 'f-1',
    farmerCode: 'KSN-000101',
    aadhaarNumber: '•••• •••• 1234',
    bankAccount: '••••••••5678',
    village: 'Nilokheri',
    district: 'Karnal',
    state: 'Haryana',
    totalLandArea: 14.5,
    user: {
      firstName: 'Gurpreet',
      lastName: 'Singh',
      mobileNumber: '987****101',
      email: 'gurpreet.s@example.com',
    },
    produce: [{ id: 'p-1', quantity: 120, crop: { name: 'Wheat' } }],
    _count: { bookings: 3, procurementRecords: 2 },
  },
  {
    id: 'f-2',
    farmerCode: 'KSN-000102',
    aadhaarNumber: '•••• •••• 2345',
    bankAccount: '••••••••6789',
    village: 'Gharaunda',
    district: 'Karnal',
    state: 'Haryana',
    totalLandArea: 8.0,
    user: {
      firstName: 'Ram',
      lastName: 'Kishore',
      mobileNumber: '981****102',
      email: 'ram.k@example.com',
    },
    produce: [{ id: 'p-2', quantity: 80, crop: { name: 'Paddy (Rice)' } }],
    _count: { bookings: 2, procurementRecords: 1 },
  },
  {
    id: 'f-3',
    farmerCode: 'KSN-000103',
    aadhaarNumber: '•••• •••• 3456',
    bankAccount: '••••••••7890',
    village: 'Indri',
    district: 'Karnal',
    state: 'Haryana',
    totalLandArea: 22.0,
    user: {
      firstName: 'Satish',
      lastName: 'Choudhary',
      mobileNumber: '972****103',
    },
    produce: [
      { id: 'p-3', quantity: 180, crop: { name: 'Wheat' } },
      { id: 'p-4', quantity: 90, crop: { name: 'Mustard' } },
    ],
    _count: { bookings: 5, procurementRecords: 4 },
  },
  {
    id: 'f-4',
    farmerCode: 'KSN-000104',
    aadhaarNumber: '•••• •••• 4567',
    bankAccount: '••••••••8901',
    village: 'Assandh',
    district: 'Karnal',
    state: 'Haryana',
    totalLandArea: 6.5,
    user: {
      firstName: 'Kuldeep',
      lastName: 'Kaur',
      mobileNumber: '998****104',
    },
    produce: [{ id: 'p-5', quantity: 50, crop: { name: 'Wheat' } }],
    _count: { bookings: 1, procurementRecords: 1 },
  },
];

export default function OfficerFarmers() {
  const [farmers, setFarmers] = useState<FarmerItem[]>(FALLBACK_FARMERS);
  const [total, setTotal] = useState(FALLBACK_FARMERS.length);
  const [search, setSearch] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchFarmers = async () => {
    setLoading(true);
    const token = localStorage.getItem('kp_token');
    const query = new URLSearchParams({
      page: String(page),
      limit: '20',
      ...(search.trim() ? { search: search.trim() } : {}),
    });

    try {
      const res = await fetch(`http://localhost:3000/api/v1/officer/farmers?${query.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && json.data) {
        setFarmers(json.data);
        setTotal(json.total);
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }
    } catch {
      setIsDemo(true);
      let filtered = FALLBACK_FARMERS;
      if (search.trim()) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (f) =>
            f.farmerCode.toLowerCase().includes(s) ||
            f.user?.firstName.toLowerCase().includes(s) ||
            f.user?.lastName.toLowerCase().includes(s) ||
            f.village?.toLowerCase().includes(s)
        );
      }
      setFarmers(filtered);
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFarmers();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[24px] font-[800] text-[#181d14] tracking-tight">District Farmers Directory</h1>
            {isDemo && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-[600] bg-amber-100 text-amber-800 border border-amber-200">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#6b7563] mt-1">
            Verified agricultural producers linked to this procurement center's jurisdiction.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search farmer name, code, village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[13px] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33] w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#1e5c33] hover:bg-[#16432a] text-white text-[13px] font-[600] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Farmers Grid/Table */}
      <div className="bg-white rounded-2xl border border-[#dde4d7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8faf7] text-[#566050] font-[600] border-b border-[#dde4d7]">
              <tr>
                <th className="py-3 px-4">Farmer Details</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Land Area</th>
                <th className="py-3 px-4">Registered Produce</th>
                <th className="py-3 px-4">Aadhaar / Bank</th>
                <th className="py-3 px-4 text-center">Center Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4d7]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#788572]">
                    Loading registered farmers...
                  </td>
                </tr>
              ) : farmers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#788572]">
                    No farmers found.
                  </td>
                </tr>
              ) : (
                farmers.map((f) => (
                  <tr key={f.id} className="hover:bg-[#fafcf9] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-[700] text-[#181d14]">
                        {f.user?.firstName} {f.user?.lastName}
                      </p>
                      <p className="text-[11px] text-[#6b7563] font-mono">
                        {f.farmerCode} • {f.user?.mobileNumber || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-[600] text-[#181d14]">{f.village || 'Village'}</p>
                      <p className="text-[11px] text-[#6b7563]">{f.district}, {f.state}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-[700] text-[#181d14]">{f.totalLandArea ?? '0'}</span> Acres
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {f.produce && f.produce.length > 0 ? (
                          f.produce.map((p) => (
                            <span
                              key={p.id}
                              className="px-2 py-0.5 rounded-md bg-[#e6f3eb] text-[#1e5c33] text-[11px] font-[600]"
                            >
                              {p.crop?.name || 'Crop'} ({p.quantity} Qtl)
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[#788572]">No declared crops</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#556050]">
                      <p>UID: {f.aadhaarNumber || '•••• •••• ----'}</p>
                      <p>A/C: {f.bankAccount || '••••••••----'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-[700] bg-emerald-50 text-emerald-800">
                        {f._count?.procurementRecords ?? 1} Procured
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#f8faf7] border-t border-[#dde4d7] flex items-center justify-between text-[12px] text-[#6b7563]">
          <span>Showing {farmers.length} of {total} farmers</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-[#dde4d7] disabled:opacity-50 hover:bg-white"
            >
              Previous
            </button>
            <button
              disabled={farmers.length < 20}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-[#dde4d7] disabled:opacity-50 hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
