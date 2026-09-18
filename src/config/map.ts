/**
 * NASA Earthdata GIBS (Global Imagery Browse Services) & KisanProcure Map Configuration
 *
 * Official NASA Earthdata GIBS Service Documentation:
 * https://wiki.earthdata.nasa.gov/display/GIBS
 *
 * Uses official WMTS Web Mercator (EPSG:3857) GoogleMapsCompatible_Level9 projection
 * for standard Leaflet compatibility.
 */

export interface MapLayerConfig {
  id: string;
  name: string;
  type: 'base' | 'satellite';
  url: string;
  options: {
    attribution: string;
    subdomains?: string[] | string;
    maxZoom?: number;
    minZoom?: number;
    tileSize?: number;
    format?: string;
  };
}

// Calculate appropriate date for NASA GIBS daily imagery (yesterday UTC ensures complete global coverage)
export function getGibsDateString(daysAgo: number = 1): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const NASA_GIBS_CONFIG = {
  // Official NASA GIBS WMTS Endpoint Template (EPSG:3857 - Web Mercator)
  wmtsBaseUrl: 'https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg',
  subdomains: ['a', 'b', 'c'],
  tileMatrixSet: 'GoogleMapsCompatible_Level9',
  
  // Recommended True-Color Visualizations
  primaryLayer: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
  backupLayer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
  
  // Official NASA EOSDIS Required Attribution
  attribution:
    'Imagery &copy; <a href="https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs" target="_blank" rel="noopener noreferrer">NASA GIBS</a> / <a href="https://earthdata.nasa.gov" target="_blank" rel="noopener noreferrer">EOSDIS</a>',
};

export const OSM_BASE_CONFIG = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  subdomains: ['a', 'b', 'c'],
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// Default map view centered over Uttar Pradesh (central state for KisanProcure)
export const MAP_DEFAULTS = {
  center: [26.8467, 80.9462] as [number, number], // Lucknow, UP
  zoom: 7,
  minZoom: 5,
  maxZoom: 18,
  satelliteMaxZoom: 9, // NASA GIBS GoogleMapsCompatible_Level9 has max zoom 9
};

// Center Status Enum matching backend specification
export type CenterStatusType = 
  | 'OPEN' 
  | 'CLOSED' 
  | 'FULL' 
  | 'TEMPORARILY_UNAVAILABLE' 
  | 'VERIFICATION_REQUIRED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'MAINTENANCE';

export interface CenterStatusMeta {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
}

export const STATUS_META: Record<string, CenterStatusMeta> = {
  OPEN: {
    label: 'Open for Procurement',
    color: '#16a34a',
    bgColor: '#dcfce7',
    textColor: '#15803d',
    borderColor: '#86efac',
    description: 'Active and accepting tokens and produce deliveries',
  },
  ACTIVE: {
    label: 'Open for Procurement',
    color: '#16a34a',
    bgColor: '#dcfce7',
    textColor: '#15803d',
    borderColor: '#86efac',
    description: 'Active and accepting tokens and produce deliveries',
  },
  FULL: {
    label: 'At Capacity',
    color: '#ea580c',
    bgColor: '#ffedd5',
    textColor: '#c2410c',
    borderColor: '#fdba74',
    description: 'Daily quota reached, please book for next available date',
  },
  TEMPORARILY_UNAVAILABLE: {
    label: 'Temporarily Closed',
    color: '#d97706',
    bgColor: '#fef3c7',
    textColor: '#b45309',
    borderColor: '#fcd34d',
    description: 'Under maintenance or stock movement',
  },
  MAINTENANCE: {
    label: 'Maintenance Mode',
    color: '#d97706',
    bgColor: '#fef3c7',
    textColor: '#b45309',
    borderColor: '#fcd34d',
    description: 'Scheduled maintenance or weighbridge calibration',
  },
  CLOSED: {
    label: 'Closed',
    color: '#dc2626',
    bgColor: '#fee2e2',
    textColor: '#b91c1c',
    borderColor: '#fca5a5',
    description: 'Closed outside procurement season or off-hours',
  },
  INACTIVE: {
    label: 'Inactive',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    textColor: '#4b5563',
    borderColor: '#d1d5db',
    description: 'Not currently operating',
  },
  VERIFICATION_REQUIRED: {
    label: 'Verification Required',
    color: '#6366f1',
    bgColor: '#e0e7ff',
    textColor: '#4338ca',
    borderColor: '#a5b4fc',
    description: 'Government audit or registration verification pending',
  },
};

export function normalizeStatus(status?: string): CenterStatusType {
  if (!status) return 'VERIFICATION_REQUIRED';
  const s = status.toUpperCase();
  if (STATUS_META[s]) return s as CenterStatusType;
  return 'VERIFICATION_REQUIRED';
}
