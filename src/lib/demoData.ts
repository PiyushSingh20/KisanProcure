import type { Crop, CropPrice, MspRecord, ProcurementCenter, CentreRecommendation } from "./types";

// ════════════════════════════════════════════════════════════════════════
// DEMO DATA — All prices sourced from CACP/GoI MSP notifications 2024-25
// Market prices are illustrative ranges based on Agmarknet historical data
// Centres are based on real UP district locations with approximate coordinates
// ════════════════════════════════════════════════════════════════════════

export const DEMO_LABEL = "DEMO DATA";
export const DEMO_SOURCE = "CACP/GoI MSP Notification 2024-25";
export const DEMO_MARKET_SOURCE = "Agmarknet (Historical Reference)";

// ─── Crops Database (20+ UP-relevant crops) ──────────────────────────
export const DEMO_CROPS: Crop[] = [
  { id: "c1", code: "WHEAT", name: "Wheat", hindiName: "गेहूं", category: "Cereal", season: "RABI", sowingPeriod: "Oct-Nov", harvestPeriod: "Mar-Apr", unit: "QUINTAL", msp: 2275, marketPrice: 2320, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-10-18", procurementEligibility: true },
  { id: "c2", code: "PADDY", name: "Paddy (Common)", hindiName: "धान", category: "Cereal", season: "KHARIF", sowingPeriod: "Jun-Jul", harvestPeriod: "Oct-Nov", unit: "QUINTAL", msp: 2300, marketPrice: 2380, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-06-19", procurementEligibility: true },
  { id: "c3", code: "MAIZE", name: "Maize", hindiName: "मक्का", category: "Cereal", season: "KHARIF", sowingPeriod: "Jun-Jul", harvestPeriod: "Sep-Oct", unit: "QUINTAL", msp: 2225, marketPrice: 2180, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-06-19", procurementEligibility: true },
  { id: "c4", code: "BAJRA", name: "Bajra (Pearl Millet)", hindiName: "बाजरा", category: "Cereal", season: "KHARIF", sowingPeriod: "Jun-Jul", harvestPeriod: "Sep-Oct", unit: "QUINTAL", msp: 2625, marketPrice: 2500, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-06-19", procurementEligibility: true },
  { id: "c5", code: "JOWAR", name: "Jowar (Sorghum)", hindiName: "ज्वार", category: "Cereal", season: "KHARIF", sowingPeriod: "Jun-Jul", harvestPeriod: "Oct-Nov", unit: "QUINTAL", msp: 3371, marketPrice: 3200, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-06-19", procurementEligibility: true },
  { id: "c6", code: "BARLEY", name: "Barley", hindiName: "जौ", category: "Cereal", season: "RABI", sowingPeriod: "Oct-Nov", harvestPeriod: "Mar-Apr", unit: "QUINTAL", msp: 1850, marketPrice: 1920, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-10-18", procurementEligibility: true },
  { id: "c7", code: "GRAM", name: "Gram (Chickpea)", hindiName: "चना", category: "Pulses", season: "RABI", sowingPeriod: "Oct-Nov", harvestPeriod: "Feb-Mar", unit: "QUINTAL", msp: 5440, marketPrice: 5600, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-10-18", procurementEligibility: true },
  { id: "c8", code: "ARHAR", name: "Arhar (Tur Dal)", hindiName: "अरहर", category: "Pulses", season: "KHARIF", sowingPeriod: "Jun-Jul", harvestPeriod: "Dec-Jan", unit: "QUINTAL", msp: 7550, marketPrice: 9200, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-06-19", procurementEligibility: true },
  { id: "c9", code: "MOONG", name: "Moong (Green Gram)", hindiName: "मूंग", category: "Pulses", season: "KHARIF", sowingPeriod: "Mar-Apr", harvestPeriod: "Jun-Jul", unit: "QUINTAL", msp: 8682, marketPrice: 8500, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-06-19", procurementEligibility: true },
  { id: "c10", code: "URAD", name: "Urad (Black Gram)", hindiName: "उड़द", category: "Pulses", season: "KHARIF", sowingPeriod: "Jun-Jul", harvestPeriod: "Sep-Oct", unit: "QUINTAL", msp: 7400, marketPrice: 7800, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-06-19", procurementEligibility: true },
  { id: "c11", code: "MASOOR", name: "Lentil (Masoor)", hindiName: "मसूर", category: "Pulses", season: "RABI", sowingPeriod: "Oct-Nov", harvestPeriod: "Feb-Mar", unit: "QUINTAL", msp: 6425, marketPrice: 6100, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-10-18", procurementEligibility: true },
  { id: "c12", code: "MUSTARD", name: "Mustard (Rapeseed)", hindiName: "सरसों", category: "Oilseeds", season: "RABI", sowingPeriod: "Oct-Nov", harvestPeriod: "Feb-Mar", unit: "QUINTAL", msp: 5650, marketPrice: 5400, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-10-18", procurementEligibility: true },
  { id: "c13", code: "GROUNDNUT", name: "Groundnut", hindiName: "मूंगफली", category: "Oilseeds", season: "KHARIF", sowingPeriod: "Jun-Jul", harvestPeriod: "Oct-Nov", unit: "QUINTAL", msp: 6783, marketPrice: 6500, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-06-19", procurementEligibility: true },
  { id: "c14", code: "SESAME", name: "Sesame (Til)", hindiName: "तिल", category: "Oilseeds", season: "KHARIF", sowingPeriod: "Jun-Jul", harvestPeriod: "Oct-Nov", unit: "QUINTAL", msp: 9267, marketPrice: 14000, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-06-19", procurementEligibility: true },
  { id: "c15", code: "SUGARCANE", name: "Sugarcane", hindiName: "गन्ना", category: "Cash Crop", season: "ALL_SEASON", sowingPeriod: "Oct-Mar", harvestPeriod: "Nov-Apr", unit: "QUINTAL", msp: 340, marketPrice: 355, isActive: true, priceSource: "UP State Advisory Price 2024-25", lastUpdated: "2024-10-15", procurementEligibility: true },
  { id: "c16", code: "POTATO", name: "Potato", hindiName: "आलू", category: "Vegetable", season: "RABI", sowingPeriod: "Oct-Nov", harvestPeriod: "Jan-Mar", unit: "QUINTAL", marketPrice: 800, isActive: true, priceSource: DEMO_MARKET_SOURCE, lastUpdated: "2024-12-15" },
  { id: "c17", code: "TOMATO", name: "Tomato", hindiName: "टमाटर", category: "Vegetable", season: "ALL_SEASON", sowingPeriod: "Various", harvestPeriod: "Various", unit: "QUINTAL", marketPrice: 1500, isActive: true, priceSource: DEMO_MARKET_SOURCE, lastUpdated: "2024-12-15" },
  { id: "c18", code: "ONION", name: "Onion", hindiName: "प्याज", category: "Vegetable", season: "RABI", sowingPeriod: "Nov-Dec", harvestPeriod: "Apr-May", unit: "QUINTAL", marketPrice: 1200, isActive: true, priceSource: DEMO_MARKET_SOURCE, lastUpdated: "2024-12-15" },
  { id: "c19", code: "PEAS", name: "Peas", hindiName: "मटर", category: "Vegetable", season: "RABI", sowingPeriod: "Oct-Nov", harvestPeriod: "Jan-Feb", unit: "QUINTAL", marketPrice: 2500, isActive: true, priceSource: DEMO_MARKET_SOURCE, lastUpdated: "2024-12-15" },
  { id: "c20", code: "COTTON", name: "Cotton (Medium Staple)", hindiName: "कपास", category: "Cash Crop", season: "KHARIF", sowingPeriod: "Apr-May", harvestPeriod: "Oct-Dec", unit: "QUINTAL", msp: 7121, marketPrice: 6800, isActive: true, priceSource: DEMO_SOURCE, lastUpdated: "2024-06-19", procurementEligibility: true },
];

// ─── MSP Records (GoI Official 2024-25) ──────────────────────────────
export const DEMO_MSP_RECORDS: MspRecord[] = [
  { id: "msp1", cropId: "c1", cropName: "Wheat", year: "2024-25", mspPrice: 2275, unit: "₹/Quintal", notificationDate: "2024-10-18", source: "CACP/GoI", sourceUrl: "https://farmer.gov.in/mspstatement.aspx" },
  { id: "msp2", cropId: "c2", cropName: "Paddy (Common)", year: "2024-25", mspPrice: 2300, unit: "₹/Quintal", notificationDate: "2024-06-19", source: "CACP/GoI", sourceUrl: "https://farmer.gov.in/mspstatement.aspx" },
  { id: "msp3", cropId: "c3", cropName: "Maize", year: "2024-25", mspPrice: 2225, unit: "₹/Quintal", notificationDate: "2024-06-19", source: "CACP/GoI", sourceUrl: "https://farmer.gov.in/mspstatement.aspx" },
  { id: "msp4", cropId: "c4", cropName: "Bajra", year: "2024-25", mspPrice: 2625, unit: "₹/Quintal", notificationDate: "2024-06-19", source: "CACP/GoI", sourceUrl: "https://farmer.gov.in/mspstatement.aspx" },
  { id: "msp5", cropId: "c7", cropName: "Gram", year: "2024-25", mspPrice: 5440, unit: "₹/Quintal", notificationDate: "2024-10-18", source: "CACP/GoI", sourceUrl: "https://farmer.gov.in/mspstatement.aspx" },
  { id: "msp6", cropId: "c8", cropName: "Arhar (Tur)", year: "2024-25", mspPrice: 7550, unit: "₹/Quintal", notificationDate: "2024-06-19", source: "CACP/GoI", sourceUrl: "https://farmer.gov.in/mspstatement.aspx" },
  { id: "msp7", cropId: "c12", cropName: "Mustard", year: "2024-25", mspPrice: 5650, unit: "₹/Quintal", notificationDate: "2024-10-18", source: "CACP/GoI", sourceUrl: "https://farmer.gov.in/mspstatement.aspx" },
  { id: "msp8", cropId: "c11", cropName: "Lentil (Masoor)", year: "2024-25", mspPrice: 6425, unit: "₹/Quintal", notificationDate: "2024-10-18", source: "CACP/GoI", sourceUrl: "https://farmer.gov.in/mspstatement.aspx" },
  { id: "msp9", cropId: "c15", cropName: "Sugarcane", year: "2024-25", mspPrice: 340, unit: "₹/Quintal", notificationDate: "2024-10-15", source: "UP State Advisory Price", sourceUrl: "https://upcane.gov.in" },
  { id: "msp10", cropId: "c20", cropName: "Cotton", year: "2024-25", mspPrice: 7121, unit: "₹/Quintal", notificationDate: "2024-06-19", source: "CACP/GoI", sourceUrl: "https://farmer.gov.in/mspstatement.aspx" },
];

// ─── Crop Prices (Market Reference Data) ─────────────────────────────
export const DEMO_CROP_PRICES: CropPrice[] = [
  { id: "cp1", cropId: "c1", cropName: "Wheat", cropHindiName: "गेहूं", state: "Uttar Pradesh", district: "Lucknow", market: "Lucknow Mandi", minPrice: 2180, maxPrice: 2420, modalPrice: 2320, msp: 2275, unit: "₹/Quintal", date: "2024-12-15", dataSource: "Agmarknet", sourceUrl: "https://agmarknet.gov.in", lastSyncedAt: "2024-12-15T10:30:00Z", verificationStatus: "DEMO_DATA" },
  { id: "cp2", cropId: "c1", cropName: "Wheat", cropHindiName: "गेहूं", state: "Uttar Pradesh", district: "Prayagraj", market: "Prayagraj Mandi", minPrice: 2200, maxPrice: 2380, modalPrice: 2290, msp: 2275, unit: "₹/Quintal", date: "2024-12-14", dataSource: "Agmarknet", sourceUrl: "https://agmarknet.gov.in", lastSyncedAt: "2024-12-14T11:00:00Z", verificationStatus: "DEMO_DATA" },
  { id: "cp3", cropId: "c2", cropName: "Paddy", cropHindiName: "धान", state: "Uttar Pradesh", district: "Gorakhpur", market: "Gorakhpur Mandi", minPrice: 2250, maxPrice: 2450, modalPrice: 2380, msp: 2300, unit: "₹/Quintal", date: "2024-11-20", dataSource: "Agmarknet", sourceUrl: "https://agmarknet.gov.in", lastSyncedAt: "2024-11-20T09:15:00Z", verificationStatus: "DEMO_DATA" },
  { id: "cp4", cropId: "c2", cropName: "Paddy", cropHindiName: "धान", state: "Uttar Pradesh", district: "Varanasi", market: "Varanasi Mandi", minPrice: 2200, maxPrice: 2500, modalPrice: 2350, msp: 2300, unit: "₹/Quintal", date: "2024-11-18", dataSource: "Agmarknet", sourceUrl: "https://agmarknet.gov.in", lastSyncedAt: "2024-11-18T10:00:00Z", verificationStatus: "DEMO_DATA" },
  { id: "cp5", cropId: "c7", cropName: "Gram", cropHindiName: "चना", state: "Uttar Pradesh", district: "Kanpur Nagar", market: "Kanpur Mandi", minPrice: 5300, maxPrice: 5800, modalPrice: 5600, msp: 5440, unit: "₹/Quintal", date: "2024-12-10", dataSource: "Agmarknet", sourceUrl: "https://agmarknet.gov.in", lastSyncedAt: "2024-12-10T12:00:00Z", verificationStatus: "DEMO_DATA" },
  { id: "cp6", cropId: "c12", cropName: "Mustard", cropHindiName: "सरसों", state: "Uttar Pradesh", district: "Agra", market: "Agra Mandi", minPrice: 5200, maxPrice: 5600, modalPrice: 5400, msp: 5650, unit: "₹/Quintal", date: "2024-12-12", dataSource: "Agmarknet", sourceUrl: "https://agmarknet.gov.in", lastSyncedAt: "2024-12-12T11:30:00Z", verificationStatus: "DEMO_DATA" },
  { id: "cp7", cropId: "c8", cropName: "Arhar (Tur)", cropHindiName: "अरहर", state: "Uttar Pradesh", district: "Jaunpur", market: "Jaunpur Mandi", minPrice: 8800, maxPrice: 9500, modalPrice: 9200, msp: 7550, unit: "₹/Quintal", date: "2024-12-08", dataSource: "Agmarknet", sourceUrl: "https://agmarknet.gov.in", lastSyncedAt: "2024-12-08T10:45:00Z", verificationStatus: "DEMO_DATA" },
  { id: "cp8", cropId: "c15", cropName: "Sugarcane", cropHindiName: "गन्ना", state: "Uttar Pradesh", district: "Lucknow", market: "Lucknow Sugar Mill", minPrice: 340, maxPrice: 365, modalPrice: 355, msp: 340, unit: "₹/Quintal", date: "2024-12-01", dataSource: "UP Cane Department", sourceUrl: "https://upcane.gov.in", lastSyncedAt: "2024-12-01T08:00:00Z", verificationStatus: "DEMO_DATA" },
  { id: "cp9", cropId: "c16", cropName: "Potato", cropHindiName: "आलू", state: "Uttar Pradesh", district: "Agra", market: "Agra Mandi", minPrice: 600, maxPrice: 1000, modalPrice: 800, unit: "₹/Quintal", date: "2024-12-14", dataSource: "Agmarknet", sourceUrl: "https://agmarknet.gov.in", lastSyncedAt: "2024-12-14T14:00:00Z", verificationStatus: "DEMO_DATA" },
  { id: "cp10", cropId: "c11", cropName: "Lentil (Masoor)", cropHindiName: "मसूर", state: "Uttar Pradesh", district: "Sultanpur", market: "Sultanpur Mandi", minPrice: 5800, maxPrice: 6300, modalPrice: 6100, msp: 6425, unit: "₹/Quintal", date: "2024-12-11", dataSource: "Agmarknet", sourceUrl: "https://agmarknet.gov.in", lastSyncedAt: "2024-12-11T09:30:00Z", verificationStatus: "DEMO_DATA" },
];

// ─── UP Procurement Centres ──────────────────────────────────────────
// Based on real UP district locations. Coordinates are approximate district HQ locations.
// Individual centre verification status is marked accordingly.
export const DEMO_CENTRES: ProcurementCenter[] = [
  { id: "ctr1", code: "UP-LKO-01", name: "Lucknow Central Grain Procurement Centre", centerType: "Government Procurement Centre", address: "Alambagh Mandi Parishad, Lucknow", tehsil: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", pincode: "226005", latitude: 26.8467, longitude: 80.9462, contactNumber: "+91-522-2620001", status: "ACTIVE", capacityPerDay: 200, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "PADDY", "MUSTARD", "GRAM"], procurementSeason: "Rabi: Apr-Jun, Kharif: Oct-Dec", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area", "Drinking Water", "Parking"], lastVerifiedDate: "2024-03-15", dataSource: "UP Food & Civil Supplies", verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr2", code: "UP-PRY-01", name: "Prayagraj Naini Procurement Centre", centerType: "Government Procurement Centre", address: "Naini Krishi Upaj Mandi, Prayagraj", tehsil: "Prayagraj", district: "Prayagraj", state: "Uttar Pradesh", pincode: "211008", latitude: 25.4358, longitude: 81.8463, contactNumber: "+91-532-2401234", status: "ACTIVE", capacityPerDay: 150, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "PADDY", "GRAM", "MASOOR"], procurementSeason: "Rabi: Apr-Jun, Kharif: Oct-Dec", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area", "Parking"], lastVerifiedDate: "2024-03-10", dataSource: "UP Food & Civil Supplies", verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr3", code: "UP-KNP-01", name: "Kanpur Nagar Procurement Centre", centerType: "Government Procurement Centre", address: "Fazalganj Mandi, Kanpur Nagar", tehsil: "Kanpur", district: "Kanpur Nagar", state: "Uttar Pradesh", pincode: "208012", latitude: 26.4499, longitude: 80.3319, contactNumber: "+91-512-2311234", status: "ACTIVE", capacityPerDay: 180, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "PADDY", "MAIZE", "GRAM"], procurementSeason: "Rabi: Apr-Jun, Kharif: Oct-Dec", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area", "Drinking Water"], lastVerifiedDate: "2024-02-28", dataSource: "UP Food & Civil Supplies", verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr4", code: "UP-VNS-01", name: "Varanasi Ardali Bazar Procurement Centre", centerType: "Government Procurement Centre", address: "Ardali Bazar Mandi, Varanasi", tehsil: "Varanasi", district: "Varanasi", state: "Uttar Pradesh", pincode: "221002", latitude: 25.3176, longitude: 82.9739, contactNumber: "+91-542-2501234", status: "ACTIVE", capacityPerDay: 160, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "PADDY", "GRAM", "ARHAR"], procurementSeason: "Rabi: Apr-Jun, Kharif: Oct-Dec", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area", "Parking", "Drinking Water"], lastVerifiedDate: "2024-03-05", dataSource: "UP Food & Civil Supplies", verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr5", code: "UP-AGR-01", name: "Agra Mandi Samiti Procurement Centre", centerType: "Government Procurement Centre", address: "Naulakha Mandi, Agra", tehsil: "Agra", district: "Agra", state: "Uttar Pradesh", pincode: "282001", latitude: 27.1767, longitude: 78.0081, contactNumber: "+91-562-2461234", status: "ACTIVE", capacityPerDay: 170, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "MUSTARD", "PADDY", "GRAM"], procurementSeason: "Rabi: Apr-Jun", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area", "Parking"], lastVerifiedDate: "2024-03-01", dataSource: "UP Food & Civil Supplies", verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr6", code: "UP-MRT-01", name: "Meerut Procurement Centre", centerType: "Government Procurement Centre", address: "Mawana Road Mandi, Meerut", tehsil: "Meerut", district: "Meerut", state: "Uttar Pradesh", pincode: "250001", latitude: 28.9845, longitude: 77.7064, contactNumber: "+91-121-2601234", status: "ACTIVE", capacityPerDay: 190, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "PADDY", "SUGARCANE"], procurementSeason: "Rabi: Apr-Jun, Kharif: Oct-Dec", workingHours: "7:30 AM - 5:30 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area", "Drinking Water", "Rest Area"], lastVerifiedDate: "2024-03-12", dataSource: "UP Food & Civil Supplies", verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr7", code: "UP-GKP-01", name: "Gorakhpur Procurement Centre", centerType: "Government Procurement Centre", address: "Rapti Nagar Mandi, Gorakhpur", tehsil: "Gorakhpur", district: "Gorakhpur", state: "Uttar Pradesh", pincode: "273001", latitude: 26.7606, longitude: 83.3732, contactNumber: "+91-551-2201234", status: "ACTIVE", capacityPerDay: 140, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["PADDY", "WHEAT", "MAIZE"], procurementSeason: "Rabi: Apr-Jun, Kharif: Oct-Dec", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area"], lastVerifiedDate: "2024-02-20", dataSource: "UP Food & Civil Supplies", verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr8", code: "UP-AYD-01", name: "Ayodhya Procurement Centre", centerType: "Government Procurement Centre", address: "Faizabad Road Mandi, Ayodhya", tehsil: "Ayodhya", district: "Ayodhya", state: "Uttar Pradesh", pincode: "224001", latitude: 26.7922, longitude: 82.1998, contactNumber: "+91-5278-241234", status: "ACTIVE", capacityPerDay: 120, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "PADDY", "GRAM", "ARHAR"], procurementSeason: "Rabi: Apr-Jun, Kharif: Oct-Dec", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area", "Drinking Water"], lastVerifiedDate: "2024-02-15", dataSource: "UP Food & Civil Supplies", verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr9", code: "UP-BRL-01", name: "Bareilly Procurement Centre", centerType: "Government Procurement Centre", address: "Pilibhit Road Mandi, Bareilly", tehsil: "Bareilly", district: "Bareilly", state: "Uttar Pradesh", pincode: "243001", latitude: 28.3670, longitude: 79.4304, status: "ACTIVE", capacityPerDay: 130, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "PADDY", "SUGARCANE"], procurementSeason: "Rabi: Apr-Jun", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab"], lastVerifiedDate: "2024-01-20", dataSource: "UP Food & Civil Supplies", verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr10", code: "UP-JHS-01", name: "Jhansi Procurement Centre", centerType: "Government Procurement Centre", address: "Sipri Bazar Mandi, Jhansi", tehsil: "Jhansi", district: "Jhansi", state: "Uttar Pradesh", pincode: "284001", latitude: 25.4484, longitude: 78.5685, status: "ACTIVE", capacityPerDay: 110, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "GRAM", "MUSTARD", "MASOOR"], procurementSeason: "Rabi: Apr-Jun", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area"], lastVerifiedDate: "2024-01-15", dataSource: "UP Food & Civil Supplies", verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr11", code: "UP-ALG-01", name: "Aligarh Procurement Centre", centerType: "Government Procurement Centre", address: "Sasni Gate Mandi, Aligarh", tehsil: "Aligarh", district: "Aligarh", state: "Uttar Pradesh", pincode: "202001", latitude: 27.8974, longitude: 78.0880, status: "ACTIVE", capacityPerDay: 140, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "MUSTARD", "PADDY"], procurementSeason: "Rabi: Apr-Jun", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area", "Parking"], verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr12", code: "UP-AZM-01", name: "Azamgarh Procurement Centre", centerType: "Government Procurement Centre", address: "Kotwali Road Mandi, Azamgarh", tehsil: "Azamgarh", district: "Azamgarh", state: "Uttar Pradesh", pincode: "276001", latitude: 26.0736, longitude: 83.1858, status: "ACTIVE", capacityPerDay: 100, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["PADDY", "WHEAT", "URAD"], procurementSeason: "Rabi: Apr-Jun, Kharif: Oct-Dec", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab"], verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr13", code: "UP-SLN-01", name: "Sultanpur Procurement Centre", centerType: "Government Procurement Centre", address: "Civil Lines Mandi, Sultanpur", tehsil: "Sultanpur", district: "Sultanpur", state: "Uttar Pradesh", pincode: "228001", latitude: 26.2648, longitude: 82.0727, status: "ACTIVE", capacityPerDay: 90, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "PADDY", "MASOOR", "ARHAR"], procurementSeason: "Rabi: Apr-Jun, Kharif: Oct-Dec", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Shade Area"], verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr14", code: "UP-MRZ-01", name: "Mirzapur Procurement Centre", centerType: "Government Procurement Centre", address: "Kotwali Road Mandi, Mirzapur", tehsil: "Mirzapur", district: "Mirzapur", state: "Uttar Pradesh", pincode: "231001", latitude: 25.1337, longitude: 82.5644, status: "ACTIVE", capacityPerDay: 80, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "PADDY", "GRAM"], procurementSeason: "Rabi: Apr-Jun", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab"], verificationStatus: "VERIFICATION_REQUIRED" },
  { id: "ctr15", code: "UP-GBN-01", name: "Gautam Buddha Nagar Procurement Centre", centerType: "Government Procurement Centre", address: "Sector 82 Mandi, Greater Noida", tehsil: "Dadri", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", pincode: "201310", latitude: 28.4744, longitude: 77.5040, status: "ACTIVE", capacityPerDay: 160, operatingAuthority: "UP State Food & Civil Supplies Dept.", supportedCrops: ["WHEAT", "PADDY"], procurementSeason: "Rabi: Apr-Jun, Kharif: Oct-Dec", workingHours: "8:00 AM - 5:00 PM", facilities: ["Electronic Weighbridge", "Quality Lab", "Shade Area", "Drinking Water", "Parking", "CCTV Monitoring"], verificationStatus: "VERIFICATION_REQUIRED" },
];

// ─── AI Assistant Knowledge Base ─────────────────────────────────────
export const AI_KNOWLEDGE: Record<string, { reply: string; source: string; updated: string }> = {
  "procurement_schedule": { reply: "Rabi season procurement (wheat, gram, mustard, masoor) typically runs April to June. Kharif season procurement (paddy, maize) runs October to December. Exact dates are notified by the District Supply Officer each season.", source: "UP Food & Civil Supplies Dept.", updated: "2024-10-01" },
  "msp_wheat": { reply: "The MSP for Wheat for 2024-25 is ₹2,275 per quintal, as notified by the Government of India (CACP). This is applicable for Rabi 2024-25 procurement.", source: "CACP/GoI MSP Notification", updated: "2024-10-18" },
  "msp_paddy": { reply: "The MSP for Paddy (Common) for 2024-25 is ₹2,300 per quintal, as notified by the Government of India (CACP). This applies to Kharif 2024 procurement.", source: "CACP/GoI MSP Notification", updated: "2024-06-19" },
  "documents_required": { reply: "For procurement at government centres, farmers typically need: 1) Farmer Registration Certificate / Kisan Card, 2) Aadhaar Card (for identity), 3) Bank Passbook (for DBT payment), 4) Land Record (Khatauni), 5) Crop Registration Receipt. Exact requirements may vary by district — please check with your local procurement officer.", source: "UP Kisan Portal", updated: "2024-04-01" },
  "payment_process": { reply: "After procurement is completed and quality/weighment verified, payment is made directly to the farmer's bank account via DBT (Direct Benefit Transfer). Payment typically takes 48-72 hours to reflect in your account after procurement completion.", source: "UP Food & Civil Supplies Dept.", updated: "2024-03-15" },
  "quality_parameters": { reply: "Wheat quality parameters: Moisture ≤ 12%, Foreign Matter ≤ 1%, Damaged/Discolored ≤ 3%, Shrivelled ≤ 3%, Loose Grains ≤ 5%. Paddy: Moisture ≤ 17%, Foreign Matter ≤ 1%. Grade differences may affect acceptance.", source: "FCI Quality Standards", updated: "2024-04-01" },
  "default": { reply: "I apologize, I don't have verified information on that specific topic right now. Please check with your local procurement officer or visit the UP Food & Civil Supplies portal for the latest updates.", source: "System", updated: new Date().toISOString().split("T")[0] },
};

// ─── Smart AI Intent Detection ───────────────────────────────────────
export function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  const hindiLower = message;

  if (lower.includes("schedule") || lower.includes("kab") || hindiLower.includes("कब") || lower.includes("procurement start") || lower.includes("start hoga"))
    return "procurement_schedule";
  if ((lower.includes("msp") || lower.includes("price")) && (lower.includes("wheat") || lower.includes("gehun") || hindiLower.includes("गेहूं")))
    return "msp_wheat";
  if ((lower.includes("msp") || lower.includes("price")) && (lower.includes("paddy") || lower.includes("dhan") || lower.includes("rice") || hindiLower.includes("धान")))
    return "msp_paddy";
  if (lower.includes("document") || lower.includes("kagaz") || lower.includes("chahiye") || hindiLower.includes("दस्तावेज"))
    return "documents_required";
  if (lower.includes("payment") || lower.includes("paisa") || lower.includes("bhugtan") || hindiLower.includes("भुगतान"))
    return "payment_process";
  if (lower.includes("quality") || lower.includes("grade") || lower.includes("gunvatta") || hindiLower.includes("गुणवत्ता"))
    return "quality_parameters";

  // Crop price queries
  for (const crop of DEMO_CROPS) {
    if (lower.includes(crop.code.toLowerCase()) || lower.includes(crop.name.toLowerCase()) || (crop.hindiName && message.includes(crop.hindiName))) {
      if (lower.includes("price") || lower.includes("rate") || lower.includes("daam") || lower.includes("bhav") || hindiLower.includes("भाव") || hindiLower.includes("दाम")) {
        const price = DEMO_CROP_PRICES.find(p => p.cropId === crop.id);
        if (price) {
          return `crop_price_${crop.code}`;
        }
      }
    }
  }

  // Centre queries
  if (lower.includes("centre") || lower.includes("center") || lower.includes("mandi") || lower.includes("kendra") || hindiLower.includes("केंद्र"))
    return "centres_query";
  if (lower.includes("wait") || lower.includes("time") || lower.includes("kitna") || lower.includes("intezaar") || hindiLower.includes("इंतज़ार"))
    return "wait_time";

  return "default";
}

export function getAIResponse(message: string): { reply: string; source: string; updated: string } {
  const intent = detectIntent(message);

  // Handle dynamic crop price queries
  if (intent.startsWith("crop_price_")) {
    const cropCode = intent.replace("crop_price_", "");
    const crop = DEMO_CROPS.find(c => c.code === cropCode);
    const prices = DEMO_CROP_PRICES.filter(p => p.cropId === crop?.id);
    if (crop && prices.length > 0) {
      const p = prices[0];
      const mspInfo = crop.msp ? ` The official MSP is ₹${crop.msp}/quintal (Source: ${DEMO_SOURCE}).` : "";
      return {
        reply: `Latest available market price for ${crop.name} (${crop.hindiName}): ₹${p.modalPrice}/quintal at ${p.market}, ${p.district}. Price range: ₹${p.minPrice} - ₹${p.maxPrice}.${mspInfo} (Note: This is reference data, not real-time.)`,
        source: p.dataSource,
        updated: p.date,
      };
    }
  }

  if (intent === "centres_query") {
    return {
      reply: `There are ${DEMO_CENTRES.length} procurement centres registered across Uttar Pradesh in our system. Major centres are in Lucknow, Prayagraj, Kanpur, Varanasi, Agra, Meerut, and Gorakhpur. You can view all centres in the "Centres" section. Note: Centre availability and status should be confirmed with the local district office.`,
      source: "KisanProcure System Database",
      updated: new Date().toISOString().split("T")[0],
    };
  }

  if (intent === "wait_time") {
    return {
      reply: "Current estimated wait times vary by centre. Based on historical data, average wait at active centres is 30-60 minutes during normal hours, and up to 2 hours during peak procurement season. For real-time queue updates, please check the Queue section after booking a slot.",
      source: "KisanProcure Analytics",
      updated: new Date().toISOString().split("T")[0],
    };
  }

  return AI_KNOWLEDGE[intent] || AI_KNOWLEDGE["default"];
}

// ─── Centre Recommendation Engine ────────────────────────────────────
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function recommendCentres(params: {
  cropCode: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  quantity?: number;
}): CentreRecommendation[] {
  const { cropCode, latitude, longitude, district } = params;

  return DEMO_CENTRES
    .filter(c => c.status === "ACTIVE")
    .map(c => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Crop support check
      if (c.supportedCrops?.includes(cropCode)) {
        score += 25;
        reasons.push(`Supports ${cropCode} procurement`);
      } else {
        score -= 20;
        reasons.push(`${cropCode} support not confirmed at this centre`);
      }

      // Distance scoring
      let distanceKm: number | undefined;
      if (latitude && longitude && c.latitude && c.longitude) {
        distanceKm = haversineDistance(latitude, longitude, c.latitude, c.longitude);
        if (distanceKm < 20) { score += 20; reasons.push(`Very close (${distanceKm.toFixed(1)} km)`); }
        else if (distanceKm < 50) { score += 10; reasons.push(`Within reasonable distance (${distanceKm.toFixed(1)} km)`); }
        else { score -= 5; reasons.push(`${distanceKm.toFixed(1)} km away`); }
      }

      // District match
      if (district && c.district.toLowerCase() === district.toLowerCase()) {
        score += 15;
        reasons.push("Same district as your location");
      }

      // Capacity scoring
      if (c.capacityPerDay >= 150) { score += 10; reasons.push("High capacity centre"); }

      // Facilities bonus
      if (c.facilities.includes("Electronic Weighbridge")) { score += 5; reasons.push("Has electronic weighbridge"); }
      if (c.facilities.includes("Quality Lab")) { score += 5; reasons.push("On-site quality testing lab"); }

      return {
        center: { ...c, distance: distanceKm },
        score: Math.max(0, Math.min(100, score)),
        reasons,
        distanceKm,
        estimatedWaitTime: Math.floor(20 + Math.random() * 40),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
