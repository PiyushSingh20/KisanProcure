import type {
  Crop, CropPrice, MspRecord, ProcurementCenter,
  CentreRecommendation, AIChatMessage, Farmer, FarmerProduce,
  ApiResponse, RegistrationData,
} from "./types";

// Uses VITE_API_URL env var (set per environment in .env.development / .env.production)
// In the Android APK, localhost means the phone itself — always use a real URL in production!
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// ─── Generic Fetch Helper ────────────────────────────────────────────────────
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      ...options,
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // non-JSON response
    }

    if (!res.ok) {
      let msg: string = `Request failed (${res.status})`;
      if (typeof data?.message === "string") {
        msg = data.message;
      } else if (Array.isArray(data?.message)) {
        msg = data.message.join(", ");
      } else if (typeof data?.error === "string") {
        msg = data.error;
      } else if (data?.message && typeof data.message === "object" && (data.message.message || data.message.error)) {
        msg = String(data.message.message || data.message.error);
      } else if (data && typeof data === "object" && typeof data.message === "object") {
        msg = JSON.stringify(data.message);
      }
      return { data: null, error: msg, status: res.status };
    }

    return { data: data as T, status: res.status, error: null };
  } catch (err: any) {
    return { data: null, error: "Network error. Is the server running?", status: 0 };
  }
}

// ─── Auth Token ──────────────────────────────────────────────────────────────
function getToken(): string | null {
  return localStorage.getItem("kp_token");
}

export function setToken(token: string) {
  localStorage.setItem("kp_token", token);
}

export function clearToken() {
  localStorage.removeItem("kp_token");
}

// ─── Auth APIs ───────────────────────────────────────────────────────────────

/** OTP-based login flow: step 1 - send OTP */
export async function sendOtpApi(mobileNumber: string) {
  return apiFetch<{ success: boolean; message: string }>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ mobileNumber }),
  });
}

/** OTP-based login flow: step 2 - verify OTP → receive tokens */
export async function verifyOtpApi(mobileNumber: string, otp: string) {
  return apiFetch<{ accessToken: string; refreshToken: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ mobileNumber, otp }),
  });
}

/** Password-based login (for Officers/Admin set via backend) */
export async function loginWithPasswordApi(mobileNumber: string, password: string) {
  return apiFetch<{ accessToken: string; refreshToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ mobileNumber, password }),
  });
}

/** Farmer registration: maps UI RegistrationData → backend RegisterFarmerDto */
export async function registerFarmerApi(data: RegistrationData) {
  // Split fullName into firstName + lastName
  const parts = (data.fullName || "").trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || parts[0] || "";

  const payload = {
    mobileNumber: data.mobileNumber,
    firstName,
    lastName,
    bankAccount: data.bankAccountNumber || undefined,
    ifscCode: data.ifscCode || undefined,
    address: data.village ? `${data.village}, ${data.tehsil || ""}` : undefined,
    village: data.village || undefined,
    district: data.district || undefined,
    state: data.state || undefined,
    pincode: data.pincode || undefined,
    totalLandArea: data.totalCultivatedLand || undefined,
  };

  return apiFetch<{ accessToken: string; refreshToken: string }>("/auth/register/farmer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Get current user from JWT */
export async function getMeApi() {
  return apiFetch<{ id: string; mobileNumber: string; role: string; firstName?: string; lastName?: string; farmer?: any }>("/auth/me");
}

// ─── Crops APIs ──────────────────────────────────────────────────────────────
async function _apiFetchLegacy<T>(path: string, options?: RequestInit): Promise<T | null> {
  const r = await apiFetch<T>(path, options);
  return r.data;
}

export async function fetchCrops(params?: { category?: string; season?: string; search?: string }) {
  const q = new URLSearchParams();
  if (params?.category) q.set("category", params.category);
  if (params?.season) q.set("season", params.season);
  if (params?.search) q.set("search", params.search);
  return _apiFetchLegacy<ApiResponse<Crop[]>>(`/crops?${q.toString()}`);
}

// ─── Crop Prices APIs ─────────────────────────────────────────────────────────
export async function fetchCropPrices(params?: { cropCode?: string; district?: string; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.cropCode) q.set("cropCode", params.cropCode);
  if (params?.district) q.set("district", params.district);
  if (params?.limit) q.set("limit", String(params.limit));
  return _apiFetchLegacy<ApiResponse<CropPrice[]>>(`/prices?${q.toString()}`);
}

export async function fetchLatestPrice(cropCode: string) {
  return _apiFetchLegacy<CropPrice>(`/prices/latest/${cropCode}`);
}

export async function fetchMspRecords() {
  return _apiFetchLegacy<ApiResponse<MspRecord[]>>("/prices/msp");
}

// ─── Centres APIs ─────────────────────────────────────────────────────────────
export async function fetchCentres(params?: { district?: string; status?: string; crop?: string }) {
  const q = new URLSearchParams();
  if (params?.district) q.set("district", params.district);
  if (params?.status) q.set("status", params.status);
  if (params?.crop) q.set("crop", params.crop);
  return _apiFetchLegacy<ApiResponse<ProcurementCenter[]>>(`/centers?${q.toString()}`);
}

export async function fetchCentreById(id: string) {
  return _apiFetchLegacy<ProcurementCenter>(`/centers/${id}`);
}

// ─── Farmer APIs ─────────────────────────────────────────────────────────────
export async function fetchFarmerProfile() {
  return _apiFetchLegacy<Farmer>("/farmers/me");
}

export async function fetchFarmerProduce() {
  return _apiFetchLegacy<ApiResponse<FarmerProduce[]>>("/farmers/me/produce");
}

export async function addFarmerProduce(data: { cropId: string; quantity: number; harvestDate?: string }) {
  return _apiFetchLegacy<FarmerProduce>("/farmers/me/produce", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── AI APIs ─────────────────────────────────────────────────────────────────
export async function aiChat(message: string, language: "en" | "hi" = "en") {
  return _apiFetchLegacy<{ reply: AIChatMessage; sources: string[] }>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, language }),
  });
}

export async function aiRecommendCentres(params: {
  cropId: string;
  quantity: number;
  latitude?: number;
  longitude?: number;
  district?: string;
}) {
  return _apiFetchLegacy<{ recommendations: CentreRecommendation[] }>("/ai/recommend-centres", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function aiPredictPrice(cropId: string, district?: string) {
  return _apiFetchLegacy<any>(`/ai/predict-price`, {
    method: "POST",
    body: JSON.stringify({ cropId, district }),
  });
}

// ─── Unified API Object (backwards-compat) ───────────────────────────────────
export const api = {
  login: loginWithPasswordApi,
  sendOtp: sendOtpApi,
  verifyOtp: verifyOtpApi,
  registerFarmer: registerFarmerApi,
  getCrops: fetchCrops,
  getCropPrices: fetchCropPrices,
  getMspRecords: fetchMspRecords,
  getCentres: fetchCentres,
  getFarmerProfile: fetchFarmerProfile,
  getFarmerProduce: fetchFarmerProduce,
  addFarmerProduce: addFarmerProduce,
  chatWithAI: async (message: string, language: "en" | "hi" = "en") => {
    const res = await aiChat(message, language);
    if (res?.reply) {
      return {
        reply: typeof res.reply === "string" ? res.reply : (res.reply as any).text,
        source: res.sources?.[0] || (res.reply as any).source,
        lastUpdated: (res.reply as any).lastUpdated,
      };
    }
    return null;
  },
  recommendCentres: aiRecommendCentres,
  predictPrice: aiPredictPrice,
};
