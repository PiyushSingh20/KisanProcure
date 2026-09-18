// ─── Enums ───────────────────────────────────────────────────────────
export type Role = "FARMER" | "OFFICER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "COMPLETED";
export type TokenStatus = "GENERATED" | "WAITING" | "CALLED" | "ARRIVED" | "QUALITY_CHECK" | "WEIGHMENT" | "PROCUREMENT_COMPLETED" | "PAYMENT_PENDING" | "PAYMENT_COMPLETED" | "CANCELLED" | "NO_SHOW";
export type ProcurementState = "BOOKED" | "SCHEDULED" | "WAITING" | "CALLED" | "ARRIVED" | "QUALITY_CHECK" | "WEIGHMENT" | "PROCUREMENT_COMPLETED" | "PAYMENT_PENDING" | "PAYMENT_COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED";
export type CenterStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "FULL";
export type CropSeason = "KHARIF" | "RABI" | "ZAID" | "ALL_SEASON";
export type VerificationStatus = "VERIFIED" | "UNVERIFIED" | "VERIFICATION_REQUIRED" | "DEMO_DATA";
export type Gender = "MALE" | "FEMALE" | "OTHER";

// ─── Core Models ─────────────────────────────────────────────────────
export interface User {
  id: string;
  mobileNumber: string;
  email?: string;
  role: Role;
  status: UserStatus;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Farmer {
  id: string;
  userId: string;
  farmerCode: string;
  aadhaarLastFour?: string;
  panNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bankAccount?: string;
  ifscCode?: string;
  address?: string;
  village?: string;
  tehsil?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  totalLandArea?: number;
  irrigatedLand?: number;
  preferredLanguage?: string;
  user?: User;
}

export interface Crop {
  id: string;
  code: string;
  name: string;
  hindiName?: string;
  scientificName?: string;
  category?: string;
  season?: CropSeason;
  sowingPeriod?: string;
  harvestPeriod?: string;
  procurementEligibility?: boolean;
  qualityParameters?: Record<string, string>;
  unit: string;
  minPrice?: number;
  maxPrice?: number;
  msp?: number;
  marketPrice?: number;
  seasonStart?: number;
  seasonEnd?: number;
  isActive: boolean;
  lastUpdated?: string;
  priceSource?: string;
}

export interface CropPrice {
  id: string;
  cropId: string;
  cropName: string;
  cropHindiName?: string;
  state: string;
  district: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  msp?: number;
  unit: string;
  date: string;
  dataSource: string;
  sourceUrl?: string;
  lastSyncedAt: string;
  verificationStatus: VerificationStatus;
}

export interface MspRecord {
  id: string;
  cropId: string;
  cropName: string;
  year: string;
  mspPrice: number;
  unit: string;
  notificationDate?: string;
  source: string;
  sourceUrl?: string;
}

export interface ProcurementCenter {
  id: string;
  code: string;
  name: string;
  centerType?: string;
  address: string;
  village?: string;
  tehsil?: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  email?: string;
  status: CenterStatus;
  capacityPerDay: number;
  operatingAuthority?: string;
  supportedCrops?: string[];
  procurementSeason?: string;
  openingDate?: string;
  closingDate?: string;
  workingHours?: string;
  facilities: string[];
  lastVerifiedDate?: string;
  dataSource?: string;
  verificationStatus?: VerificationStatus;
  distance?: number; // Computed field
}

export interface FarmerProduce {
  id: string;
  farmerId: string;
  cropId: string;
  crop?: Crop;
  quantity: number;
  expectedPrice?: number;
  harvestDate?: string;
  qualityGrade?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  farmerId: string;
  centerId: string;
  cropId: string;
  slotId: string;
  scheduledDate: string;
  status: BookingStatus;
  quantity: number;
  expectedPrice?: number;
  center?: ProcurementCenter;
  crop?: Crop;
}

export interface Token {
  id: string;
  tokenNumber: string;
  bookingId: string;
  farmerId: string;
  centerId: string;
  cropId: string;
  status: TokenStatus;
  queuePosition?: number;
  estimatedWait?: number;
  calledAt?: string;
  arrivedAt?: string;
  completedAt?: string;
}

export interface ProcurementRecord {
  id: string;
  recordNumber: string;
  tokenId: string;
  farmerId: string;
  centerId: string;
  cropId: string;
  state: ProcurementState;
  quantity: number;
  qualityGrade?: string;
  weighedQuantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  paymentStatus: PaymentStatus;
  completedAt?: string;
}

// ─── AI Types ────────────────────────────────────────────────────────
export interface AIChatMessage {
  from: "user" | "bot";
  text: string;
  source?: string;
  lastUpdated?: string;
  language?: "en" | "hi";
}

export interface CentreRecommendation {
  center: ProcurementCenter;
  score: number;
  reasons: string[];
  estimatedWaitTime?: number;
  distanceKm?: number;
}

export interface PricePrediction {
  cropId: string;
  cropName: string;
  predictedPrice: number;
  predictionDate: string;
  trainingDataPeriod: string;
  confidence: number;
  modelVersion: string;
  trend: "UP" | "DOWN" | "STABLE";
}

// ─── API Response Types ──────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface DataSourceInfo {
  sourceName: string;
  sourceUrl?: string;
  retrievedAt: string;
  publishedAt?: string;
  verificationStatus: VerificationStatus;
}

// ─── Registration Types ──────────────────────────────────────────────
export interface RegistrationStep1 {
  fullName: string;
  mobileNumber: string;
  email?: string;
  dateOfBirth: string;
  gender: Gender;
}

export interface RegistrationStep2 {
  state: string;
  district: string;
  tehsil: string;
  village: string;
  pincode: string;
}

export interface RegistrationStep3 {
  totalCultivatedLand: number;
  irrigatedLand: number;
  landUnit: "ACRE" | "HECTARE" | "BIGHA";
}

export interface RegistrationStep4 {
  crops: { cropId: string; quantity: number; unit: string }[];
  preferredCentreId?: string;
}

export interface RegistrationStep5 {
  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  preferredLanguage: "en" | "hi";
}

export type RegistrationData = RegistrationStep1 & RegistrationStep2 & RegistrationStep3 & RegistrationStep4 & RegistrationStep5;

// ─── UP Districts ────────────────────────────────────────────────────
export const UP_DISTRICTS = [
  "Prayagraj", "Lucknow", "Kanpur Nagar", "Kanpur Dehat", "Varanasi",
  "Agra", "Meerut", "Gorakhpur", "Ayodhya", "Bareilly",
  "Moradabad", "Aligarh", "Ghaziabad", "Gautam Buddha Nagar",
  "Jhansi", "Mathura", "Firozabad", "Mirzapur", "Sonbhadra",
  "Jaunpur", "Azamgarh", "Sultanpur", "Raebareli", "Unnao",
  "Sitapur", "Lakhimpur Kheri", "Bahraich", "Barabanki",
  "Fatehpur", "Kaushambi", "Pratapgarh", "Chitrakoot",
  "Banda", "Hamirpur", "Mahoba", "Jalaun", "Etawah",
  "Mainpuri", "Auraiya", "Kannauj", "Farrukhabad", "Hardoi",
  "Shahjahanpur", "Pilibhit", "Budaun", "Rampur", "Sambhal",
  "Bijnor", "Amroha", "Bulandshahr", "Hapur", "Baghpat",
  "Muzaffarnagar", "Saharanpur", "Shamli"
] as const;

export type UPDistrict = typeof UP_DISTRICTS[number];
