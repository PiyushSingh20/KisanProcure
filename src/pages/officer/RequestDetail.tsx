import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

interface RequestDetailData {
  id: string;
  recordNumber: string;
  state: string;
  quantity: number;
  weighedQuantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  qualityStatus?: string;
  qualityNotes?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  farmer?: {
    id: string;
    farmerCode: string;
    aadhaarNumber?: string;
    bankAccount?: string;
    ifscCode?: string;
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
  };
  crop?: {
    id: string;
    name: string;
    category?: string;
    unit?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  center?: {
    name: string;
    code: string;
    district: string;
    state: string;
    address: string;
  };
  token?: {
    id: string;
    tokenNumber: string;
    status: string;
    calledAt?: string;
    arrivedAt?: string;
  };
  qualityCheck?: {
    moistureContent?: number;
    foreignMatter?: number;
    damagedGrains?: number;
    testWeight?: number;
    status: string;
    notes?: string;
    checkedAt?: string;
    checkedBy?: { user?: { firstName: string; lastName: string } };
  };
  weighment?: {
    grossWeight: number;
    tareWeight: number;
    netWeight: number;
    weighedAt?: string;
    weighedBy?: { user?: { firstName: string; lastName: string } };
  };
  payment?: {
    id: string;
    paymentNumber: string;
    amount: number;
    status: string;
  };
  auditLogs?: Array<{
    id: string;
    action: string;
    createdAt: string;
    officer?: { user?: { firstName: string; lastName: string } };
  }>;
}

const FALLBACK_DETAIL: RequestDetailData = {
  id: 'req-demo-1',
  recordNumber: 'PRC-20260918-0042',
  state: 'BOOKED',
  quantity: 50,
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  updatedAt: new Date(Date.now() - 1800000).toISOString(),
  farmer: {
    id: 'farmer-1',
    farmerCode: 'KSN-000104',
    aadhaarNumber: '•••• •••• 5678',
    bankAccount: '••••••••4321',
    ifscCode: 'SBIN0001234',
    village: 'Gharaunda',
    district: 'Karnal',
    state: 'Haryana',
    totalLandArea: 12.5,
    user: {
      firstName: 'Sukhwinder',
      lastName: 'Singh',
      mobileNumber: '987****123',
      email: 'sukhwinder.s@example.com',
    },
  },
  crop: {
    id: 'crop-1',
    name: 'Wheat (Sharbati Grade A)',
    category: 'CEREAL',
    unit: 'QUINTAL',
    minPrice: 2275,
    maxPrice: 2350,
  },
  center: {
    name: 'Kisan Procurement Center - Karnal Mandi',
    code: 'KSN-HRY-001',
    district: 'Karnal',
    state: 'Haryana',
    address: 'GT Road, Near Karnal Grain Market Bypass',
  },
  token: {
    id: 'tok-1',
    tokenNumber: 'TK-1034',
    status: 'WAITING',
  },
  auditLogs: [
    {
      id: 'aud-1',
      action: 'BOOKING_CREATED',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
};

const STAGES = [
  { key: 'BOOKED', label: '1. Booking' },
  { key: 'SCHEDULED', label: '2. Scheduled' },
  { key: 'ARRIVED', label: '3. Mandi Arrived' },
  { key: 'QUALITY_CHECK', label: '4. Quality Lab' },
  { key: 'WEIGHMENT', label: '5. Weighbridge' },
  { key: 'PAYMENT_PENDING', label: '6. Payment Issued' },
];

export default function OfficerRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<RequestDetailData>(FALLBACK_DETAIL);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Verification dialog
  const [remarks, setRemarks] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Quality check form
  const [moisture, setMoisture] = useState<number>(11.5);
  const [foreignMatter, setForeignMatter] = useState<number>(0.8);
  const [damagedGrains, setDamagedGrains] = useState<number>(1.0);
  const [testWeight, setTestWeight] = useState<number>(78);
  const [qualityStatus, setQualityStatus] = useState<'PASSED' | 'FAILED'>('PASSED');
  const [qualityNotes, setQualityNotes] = useState('');

  // Weighment form
  const [grossWeight, setGrossWeight] = useState<number>(65);
  const [tareWeight, setTareWeight] = useState<number>(15);

  // Finalize / Complete form
  const [unitPrice, setUnitPrice] = useState<number>(2275);

  const fetchDetail = async () => {
    setLoading(true);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch(`http://localhost:3000/api/v1/officer/procurement-requests/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && json.recordNumber) {
        setData(json);
        if (json.crop?.minPrice) setUnitPrice(json.crop.minPrice);
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }
    } catch {
      setIsDemo(true);
      setData(FALLBACK_DETAIL);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  // 1. Verify request
  const handleVerify = async () => {
    setActionLoading(true);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch(`http://localhost:3000/api/v1/officer/procurement-requests/${id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ remarks }),
      });

      if (res.ok) {
        showNotification('✅ Request Verified & Scheduled successfully!');
        fetchDetail();
      } else {
        setData((prev) => ({ ...prev, state: 'SCHEDULED' }));
        showNotification('✅ Request Verified & Scheduled (Demo Mode)!');
      }
    } catch {
      setData((prev) => ({ ...prev, state: 'SCHEDULED' }));
      showNotification('✅ Request Verified & Scheduled (Demo Mode)!');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Reject request
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    setActionLoading(true);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch(`http://localhost:3000/api/v1/officer/procurement-requests/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (res.ok) {
        showNotification('❌ Request rejected and cancelled.');
        setShowRejectModal(false);
        fetchDetail();
      } else {
        setData((prev) => ({ ...prev, state: 'CANCELLED' }));
        setShowRejectModal(false);
        showNotification('❌ Request rejected and cancelled (Demo Mode).');
      }
    } catch {
      setData((prev) => ({ ...prev, state: 'CANCELLED' }));
      setShowRejectModal(false);
      showNotification('❌ Request rejected and cancelled (Demo Mode).');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Mark Arrived
  const handleMarkArrived = async () => {
    setActionLoading(true);
    const token = localStorage.getItem('kp_token');
    const tokenId = data.token?.id || 'demo-token';
    try {
      const res = await fetch(`http://localhost:3000/api/v1/officer/tokens/${tokenId}/mark-arrived`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        showNotification('📍 Farmer arrival recorded at Mandi desk!');
        fetchDetail();
      } else {
        setData((prev) => ({ ...prev, state: 'ARRIVED' }));
        showNotification('📍 Farmer arrival recorded (Demo Mode)!');
      }
    } catch {
      setData((prev) => ({ ...prev, state: 'ARRIVED' }));
      showNotification('📍 Farmer arrival recorded (Demo Mode)!');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Submit Quality Check
  const handleQualityCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch(`http://localhost:3000/api/v1/officer/procurement-requests/${id}/quality-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          moistureContent: Number(moisture),
          foreignMatter: Number(foreignMatter),
          damagedGrains: Number(damagedGrains),
          testWeight: Number(testWeight),
          status: qualityStatus,
          notes: qualityNotes,
        }),
      });

      if (res.ok) {
        showNotification(`🔬 Quality check recorded: ${qualityStatus}!`);
        fetchDetail();
      } else {
        const nextState = qualityStatus === 'PASSED' ? 'WEIGHMENT' : 'CANCELLED';
        setData((prev) => ({
          ...prev,
          state: nextState,
          qualityCheck: {
            moistureContent: moisture,
            foreignMatter,
            damagedGrains,
            testWeight,
            status: qualityStatus,
            notes: qualityNotes,
          },
        }));
        showNotification(`🔬 Quality check recorded: ${qualityStatus} (Demo Mode)!`);
      }
    } catch {
      const nextState = qualityStatus === 'PASSED' ? 'WEIGHMENT' : 'CANCELLED';
      setData((prev) => ({
        ...prev,
        state: nextState,
        qualityCheck: {
          moistureContent: moisture,
          foreignMatter,
          damagedGrains,
          testWeight,
          status: qualityStatus,
          notes: qualityNotes,
        },
      }));
      showNotification(`🔬 Quality check recorded: ${qualityStatus} (Demo Mode)!`);
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Submit Weighment
  const handleWeighmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const net = grossWeight - tareWeight;
    if (net <= 0) {
      alert('Gross weight must be greater than Tare weight!');
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch(`http://localhost:3000/api/v1/officer/procurement-requests/${id}/weigh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          grossWeight: Number(grossWeight),
          tareWeight: Number(tareWeight),
        }),
      });

      if (res.ok) {
        showNotification(`⚖️ Weighment recorded: ${net} Qtl Net Weight!`);
        fetchDetail();
      } else {
        setData((prev) => ({
          ...prev,
          state: 'PROCUREMENT_COMPLETED',
          weighedQuantity: net,
          weighment: { grossWeight, tareWeight, netWeight: net },
        }));
        showNotification(`⚖️ Weighment recorded: ${net} Qtl Net Weight (Demo Mode)!`);
      }
    } catch {
      setData((prev) => ({
        ...prev,
        state: 'PROCUREMENT_COMPLETED',
        weighedQuantity: net,
        weighment: { grossWeight, tareWeight, netWeight: net },
      }));
      showNotification(`⚖️ Weighment recorded: ${net} Qtl Net Weight (Demo Mode)!`);
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Complete & Generate Payment
  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const token = localStorage.getItem('kp_token');
    try {
      const res = await fetch(`http://localhost:3000/api/v1/officer/procurement-requests/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          unitPrice: Number(unitPrice),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        showNotification(`💰 Procurement completed! Payment #${json.payment?.paymentNumber || 'Invoice'} issued!`);
        fetchDetail();
      } else {
        const finalQty = data.weighedQuantity || (data.weighment?.netWeight ?? data.quantity);
        const amt = finalQty * unitPrice;
        setData((prev) => ({
          ...prev,
          state: 'PAYMENT_PENDING',
          unitPrice,
          totalAmount: amt,
          payment: {
            id: 'pay-demo-1',
            paymentNumber: `PAY-${Date.now()}-8821`,
            amount: amt,
            status: 'PENDING',
          },
        }));
        showNotification('💰 Procurement completed! Payment invoice issued (Demo Mode)!');
      }
    } catch {
      const finalQty = data.weighedQuantity || (data.weighment?.netWeight ?? data.quantity);
      const amt = finalQty * unitPrice;
      setData((prev) => ({
        ...prev,
        state: 'PAYMENT_PENDING',
        unitPrice,
        totalAmount: amt,
        payment: {
          id: 'pay-demo-1',
          paymentNumber: `PAY-${Date.now()}-8821`,
          amount: amt,
          status: 'PENDING',
        },
      }));
      showNotification('💰 Procurement completed! Payment invoice issued (Demo Mode)!');
    } finally {
      setActionLoading(false);
    }
  };

  const getStageIndex = (st: string) => {
    if (st === 'PROCUREMENT_COMPLETED' || st === 'PAYMENT_COMPLETED') return 5;
    const idx = STAGES.findIndex((s) => s.key === st);
    return idx >= 0 ? idx : 0;
  };

  const currentStageIndex = getStageIndex(data.state);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/officer/requests')}
            className="p-2 rounded-xl border border-[#dde4d7] hover:bg-[#f8faf7] text-[#556050]"
            title="Back to requests"
          >
            ←
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[22px] font-[800] text-[#181d14] tracking-tight">
                Record #{data.recordNumber}
              </h1>
              {isDemo && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-[600] bg-amber-100 text-amber-800 border border-amber-200">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-[13px] text-[#6b7563] mt-0.5">
              Farmer: <strong className="text-[#181d14]">{data.farmer?.user?.firstName} {data.farmer?.user?.lastName}</strong> ({data.farmer?.farmerCode})
              &nbsp;•&nbsp;
              Crop: <strong className="text-[#1e5c33]">{data.crop?.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDetail}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[13px] font-[600] text-[#556050] hover:bg-[#f8faf7] transition-colors"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Record'}
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[14px] font-[600] animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Stage Progression Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs">
        <p className="text-[12px] font-[700] uppercase text-[#788572] tracking-wider mb-4">
          Procurement Lifecycle Progress
        </p>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {STAGES.map((s, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div
                key={s.key}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'border-[#1e5c33] bg-[#e6f3eb] text-[#1e5c33] font-[700] ring-2 ring-[#1e5c33]/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800 font-[600]'
                    : 'border-[#dde4d7] bg-[#f8faf7] text-[#85927f]'
                }`}
              >
                <span className="text-[11px] block">{s.label}</span>
                <span className="text-[10px] mt-0.5 block opacity-75">
                  {isCompleted ? '✓ Done' : isCurrent ? '● Active' : '○ Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Contextual Action Station (Left) & Record Information (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Action Station */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. BOOKED State -> Verify / Reject */}
          {data.state === 'BOOKED' && (
            <div className="bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs space-y-4">
              <div className="border-b border-[#dde4d7] pb-3">
                <h3 className="text-[17px] font-[700] text-[#181d14]">Stage 1: Verify & Confirm Booking</h3>
                <p className="text-[13px] text-[#6b7563] mt-0.5">
                  Verify the farmer's registered produce and approve the procurement appointment slot.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[12px] font-[600] text-[#556050] mb-1">
                    Officer Verification Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Land documents and registration verified against Tehsil records."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[13px] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleVerify}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-[#1e5c33] hover:bg-[#16432a] text-white text-[13.5px] font-[700] shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>✅</span>
                    <span>{actionLoading ? 'Processing...' : 'Verify & Schedule Slot'}</span>
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="py-2.5 px-4 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-[13.5px] font-[600] transition-colors"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. SCHEDULED State -> Mark Arrived */}
          {data.state === 'SCHEDULED' && (
            <div className="bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs space-y-4">
              <div className="border-b border-[#dde4d7] pb-3">
                <h3 className="text-[17px] font-[700] text-[#181d14]">Stage 2: Arrival Verification</h3>
                <p className="text-[13px] text-[#6b7563] mt-0.5">
                  Farmer appointment is scheduled. Once the farmer presents their vehicle at the Mandi gate, confirm their arrival.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-center gap-3">
                <span className="text-2xl">🚛</span>
                <div>
                  <p className="text-[13px] font-[700] text-sky-950">Awaiting Gate Arrival</p>
                  <p className="text-[12px] text-sky-800">
                    Expected quantity: <strong>{data.quantity} Quintals</strong> of {data.crop?.name}.
                  </p>
                </div>
              </div>

              <button
                onClick={handleMarkArrived}
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-[700] shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>📍</span>
                <span>{actionLoading ? 'Recording Arrival...' : 'Record Mandi Gate Arrival'}</span>
              </button>
            </div>
          )}

          {/* 3. ARRIVED or QUALITY_CHECK State -> Quality Inspection Form */}
          {(data.state === 'ARRIVED' || data.state === 'QUALITY_CHECK') && (
            <form onSubmit={handleQualityCheckSubmit} className="bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs space-y-5">
              <div className="border-b border-[#dde4d7] pb-3">
                <h3 className="text-[17px] font-[700] text-[#181d14]">Stage 3: Quality Lab Inspection</h3>
                <p className="text-[13px] text-[#6b7563] mt-0.5">
                  Test grain moisture, foreign matter, and test weight against Fair Average Quality (FAQ) standards.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-[600] text-[#556050] mb-1">
                    Moisture Content (%) <span className="text-amber-600 font-[500]">(Max 12%)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={moisture}
                    onChange={(e) => setMoisture(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[14px] font-[700] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[600] text-[#556050] mb-1">
                    Foreign Matter (%) <span className="text-amber-600 font-[500]">(Max 2%)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={foreignMatter}
                    onChange={(e) => setForeignMatter(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[14px] font-[700] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[600] text-[#556050] mb-1">
                    Damaged / Discolored Grains (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={damagedGrains}
                    onChange={(e) => setDamagedGrains(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[14px] font-[700] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[600] text-[#556050] mb-1">
                    Test Weight (kg/hL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={testWeight}
                    onChange={(e) => setTestWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[14px] font-[700] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33]"
                  />
                </div>
              </div>

              {/* Pass / Fail Toggle */}
              <div>
                <label className="block text-[12px] font-[600] text-[#556050] mb-1.5">Inspection Result Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      qualityStatus === 'PASSED'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-[700]'
                        : 'border-[#dde4d7] bg-[#f8faf7] text-[#556050]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="qc_decision"
                      checked={qualityStatus === 'PASSED'}
                      onChange={() => setQualityStatus('PASSED')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>✅ PASSED (Meets FAQ Standards)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      qualityStatus === 'FAILED'
                        ? 'border-rose-600 bg-rose-50 text-rose-950 font-[700]'
                        : 'border-[#dde4d7] bg-[#f8faf7] text-[#556050]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="qc_decision"
                      checked={qualityStatus === 'FAILED'}
                      onChange={() => setQualityStatus('FAILED')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>❌ REJECTED (Substandard)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-[600] text-[#556050] mb-1">
                  Quality Inspector Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. FAQ Grade A confirmed. Low foreign matter."
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[13px] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33]"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className={`w-full py-3 rounded-xl text-white text-[14px] font-[700] shadow-sm transition-all flex items-center justify-center gap-2 ${
                  qualityStatus === 'PASSED'
                    ? 'bg-[#1e5c33] hover:bg-[#16432a]'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <span>🔬</span>
                <span>{actionLoading ? 'Saving Inspection...' : `Submit Quality: ${qualityStatus}`}</span>
              </button>
            </form>
          )}

          {/* 4. WEIGHMENT State -> Weighbridge Form */}
          {data.state === 'WEIGHMENT' && (
            <form onSubmit={handleWeighmentSubmit} className="bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs space-y-5">
              <div className="border-b border-[#dde4d7] pb-3">
                <h3 className="text-[17px] font-[700] text-[#181d14]">Stage 4: Weighbridge Measurement</h3>
                <p className="text-[13px] text-[#6b7563] mt-0.5">
                  Record Gross Vehicle Weight and Tare Weight to compute accurate Net Quintals.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-[600] text-[#556050] mb-1">
                    Gross Weight (Quintals)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dde4d7] text-[16px] font-[800] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[600] text-[#556050] mb-1">
                    Tare Weight (Vehicle Tare Qtl)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={tareWeight}
                    onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#dde4d7] text-[16px] font-[800] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33]"
                  />
                </div>
              </div>

              {/* Net weight readout */}
              <div className="p-4 rounded-xl bg-[#e6f3eb] border border-[#cbe5d4] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-[700] uppercase text-[#1e5c33] tracking-wider">
                    Calculated Net Produce Weight
                  </p>
                  <p className="text-[28px] font-[800] text-[#1e5c33] tracking-tight">
                    {(grossWeight - tareWeight).toFixed(2)} <span className="text-base font-[600]">Quintals</span>
                  </p>
                </div>
                <div className="text-right text-[12px] text-[#556050]">
                  <p>Estimated: {data.quantity} Qtl</p>
                  <p className="font-[600] text-emerald-800">
                    Variance: {((grossWeight - tareWeight) - data.quantity).toFixed(2)} Qtl
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-[14px] font-[700] shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>⚖️</span>
                <span>{actionLoading ? 'Saving Weighment...' : 'Confirm Weighment & Move to Pricing'}</span>
              </button>
            </form>
          )}

          {/* 5. PROCUREMENT_COMPLETED State -> Finalize Unit Price & Issue Payment */}
          {data.state === 'PROCUREMENT_COMPLETED' && (
            <form onSubmit={handleCompleteSubmit} className="bg-white p-6 rounded-2xl border border-[#dde4d7] shadow-xs space-y-5">
              <div className="border-b border-[#dde4d7] pb-3">
                <h3 className="text-[17px] font-[700] text-[#181d14]">Stage 5: Finalize & Generate Payment</h3>
                <p className="text-[13px] text-[#6b7563] mt-0.5">
                  Confirm the Minimum Support Price (MSP) per Quintal and generate official payment receipt.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-[600] text-[#556050] mb-1">
                    Final Net Weight (Qtl)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={data.weighedQuantity || data.weighment?.netWeight || data.quantity}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[15px] font-[700] bg-gray-100 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-[600] text-[#556050] mb-1">
                    MSP Rate (₹ / Quintal)
                  </label>
                  <input
                    type="number"
                    required
                    step="1"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#dde4d7] text-[15px] font-[800] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-[#1e5c33]"
                  />
                </div>
              </div>

              {/* Total readout */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-[700] uppercase text-emerald-800 tracking-wider">
                    Total Payable to Farmer
                  </p>
                  <p className="text-[32px] font-[800] text-emerald-950 tracking-tight">
                    ₹{((data.weighedQuantity || data.weighment?.netWeight || data.quantity) * unitPrice).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[12px] text-emerald-700 font-[500] mt-0.5">
                    Direct Bank Transfer (DBT) will be routed to {data.farmer?.bankAccount || 'Farmer Account'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-xl bg-[#1e5c33] hover:bg-[#16432a] text-white text-[15px] font-[700] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>💳</span>
                <span>{actionLoading ? 'Issuing Payment Invoice...' : 'Generate Official Payment Invoice'}</span>
              </button>
            </form>
          )}

          {/* 6. PAYMENT_PENDING / PAYMENT_COMPLETED State -> Summary Card */}
          {(data.state === 'PAYMENT_PENDING' || data.state === 'PAYMENT_COMPLETED') && (
            <div className="bg-white p-6 rounded-2xl border border-emerald-300 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-[700]">
                  {data.state === 'PAYMENT_COMPLETED' ? 'Payment Disbursed' : 'Payment Invoice Generated (Pending Approval)'}
                </span>
                <span className="text-[12px] font-mono text-[#6b7563]">
                  {data.payment?.paymentNumber || 'PAY-INV-XXXX'}
                </span>
              </div>

              <div className="p-5 rounded-xl bg-[#f8faf7] border border-[#dde4d7] flex items-baseline justify-between">
                <div>
                  <p className="text-[12px] font-[600] text-[#788572] uppercase">Total Invoice Amount</p>
                  <p className="text-[32px] font-[800] text-[#181d14]">
                    ₹{(data.totalAmount || data.payment?.amount || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[12px] text-[#6b7563]">
                    Quantity: {data.weighedQuantity ?? data.quantity} Qtl @ ₹{data.unitPrice || unitPrice} / Qtl
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[#556050]">Credited Account</p>
                  <p className="text-[14px] font-[700] font-mono text-[#181d14]">{data.farmer?.bankAccount || '••••••••4321'}</p>
                  <p className="text-[11px] text-[#6b7563]">IFSC: {data.farmer?.ifscCode || 'SBIN0001234'}</p>
                </div>
              </div>
            </div>
          )}

          {/* 7. CANCELLED State */}
          {data.state === 'CANCELLED' && (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-900 space-y-2">
              <h3 className="text-[16px] font-[700] flex items-center gap-2">
                <span>❌</span>
                <span>Request Cancelled / Disapproved</span>
              </h3>
              <p className="text-[13px] text-rose-800">
                This procurement request has been terminated. The farmer has been notified with the reason.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Farmer Profile & Stage Records */}
        <div className="lg:col-span-5 space-y-6">
          {/* Farmer Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#dde4d7] shadow-xs space-y-3">
            <h3 className="text-[15px] font-[700] text-[#181d14]">👨‍🌾 Farmer Verified Details</h3>
            <div className="divide-y divide-[#dde4d7] text-[13px]">
              <div className="py-2 flex justify-between">
                <span className="text-[#6b7563]">Full Name:</span>
                <span className="font-[600] text-[#181d14]">{data.farmer?.user?.firstName} {data.farmer?.user?.lastName}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#6b7563]">Farmer Code:</span>
                <span className="font-mono font-[700] text-[#181d14]">{data.farmer?.farmerCode}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#6b7563]">Mobile:</span>
                <span className="font-[600] text-[#181d14]">{data.farmer?.user?.mobileNumber}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#6b7563]">Aadhaar (Masked):</span>
                <span className="font-mono text-[#556050]">{data.farmer?.aadhaarNumber || '•••• •••• 5678'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#6b7563]">Bank Account:</span>
                <span className="font-mono text-[#556050]">{data.farmer?.bankAccount || '••••••••4321'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#6b7563]">Total Landholdings:</span>
                <span className="font-[600] text-[#181d14]">{data.farmer?.totalLandArea ?? '12.5'} Acres</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[#6b7563]">Village / District:</span>
                <span className="text-[#181d14]">{data.farmer?.village || 'Karnal'}, {data.farmer?.district}</span>
              </div>
            </div>
          </div>

          {/* Quality Check Inspection Card (if done) */}
          {data.qualityCheck && (
            <div className="bg-white p-5 rounded-2xl border border-[#dde4d7] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-[700] text-[#181d14]">🔬 Recorded Quality Parameters</h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-[700] ${
                  data.qualityCheck.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {data.qualityCheck.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="p-2.5 rounded-xl bg-[#f8faf7]">
                  <p className="text-[#6b7563]">Moisture</p>
                  <p className="text-[15px] font-[700] text-[#181d14]">{data.qualityCheck.moistureContent ?? '11.5'}%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8faf7]">
                  <p className="text-[#6b7563]">Foreign Matter</p>
                  <p className="text-[15px] font-[700] text-[#181d14]">{data.qualityCheck.foreignMatter ?? '0.8'}%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8faf7]">
                  <p className="text-[#6b7563]">Damaged Grains</p>
                  <p className="text-[15px] font-[700] text-[#181d14]">{data.qualityCheck.damagedGrains ?? '1.0'}%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8faf7]">
                  <p className="text-[#6b7563]">Test Weight</p>
                  <p className="text-[15px] font-[700] text-[#181d14]">{data.qualityCheck.testWeight ?? '78'} kg/hL</p>
                </div>
              </div>
            </div>
          )}

          {/* Weighment Card (if done) */}
          {data.weighment && (
            <div className="bg-white p-5 rounded-2xl border border-[#dde4d7] shadow-xs space-y-3">
              <h3 className="text-[15px] font-[700] text-[#181d14]">⚖️ Weighbridge Ticket</h3>
              <div className="grid grid-cols-3 gap-2 text-[12px] text-center">
                <div className="p-2.5 rounded-xl bg-[#f8faf7]">
                  <p className="text-[#6b7563]">Gross</p>
                  <p className="text-[14px] font-[700] text-[#181d14]">{data.weighment.grossWeight} Qtl</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8faf7]">
                  <p className="text-[#6b7563]">Tare</p>
                  <p className="text-[14px] font-[700] text-[#181d14]">{data.weighment.tareWeight} Qtl</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#e6f3eb] border border-[#cbe5d4]">
                  <p className="text-emerald-800 font-[700]">Net</p>
                  <p className="text-[15px] font-[800] text-emerald-950">{data.weighment.netWeight} Qtl</p>
                </div>
              </div>
            </div>
          )}

          {/* Audit Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-[#dde4d7] shadow-xs space-y-3">
            <h3 className="text-[15px] font-[700] text-[#181d14]">📋 Action Audit Log</h3>
            <div className="space-y-2 text-[12px]">
              <div className="flex items-start gap-2 text-[#556050]">
                <span className="text-[#1e5c33] font-[700]">•</span>
                <div>
                  <p className="font-[600] text-[#181d14]">Record Initialized ({data.recordNumber})</p>
                  <p className="text-[11px] text-[#788572]">
                    {new Date(data.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {data.auditLogs?.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-[#556050]">
                  <span className="text-[#1e5c33] font-[700]">•</span>
                  <div>
                    <p className="font-[600] text-[#181d14]">{log.action}</p>
                    <p className="text-[11px] text-[#788572]">
                      {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#dde4d7] shadow-xl space-y-4">
            <h3 className="text-[18px] font-[700] text-[#181d14]">Confirm Rejection</h3>
            <p className="text-[13px] text-[#6b7563]">
              Please state the specific reason for rejecting this procurement booking. This will be sent as an official notice to the farmer.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Mismatched land cultivation records or produce unaligned with season."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#dde4d7] text-[13px] bg-[#f8faf7] text-[#181d14] outline-hidden focus:border-rose-600"
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-[#dde4d7] text-[13px] font-[600] text-[#556050] hover:bg-[#f8faf7]"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-[700] transition-colors"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
