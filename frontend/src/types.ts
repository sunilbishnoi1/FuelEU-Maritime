export interface ApiRoute {
  id: string;
  route_id: string;
  year: number;
  ghg_intensity: number; // Changed to number for calculations
  is_baseline: boolean;
  percentDiff?: number;
  compliant?: boolean;
  vessel_type: string;
  fuel_type: string;
  fuel_consumption: number; // in tons (t)
  distance: number; // in km
  total_emissions: number; // in tons (t)
}

export interface Compliance {
  id: string;
  ship_id: string;
  year: number;
  cb_gco2eq: number;
}

export interface BankEntry {
  id: string;
  ship_id: string;
  year: number;
  amount_gco2eq: number;
}

export interface Pool {
  id: string;
  year: number;
  created_at: Date;
}

export interface PoolMember {
  pool_id: string;
  ship_id: string;
  cb_before: number;
  cb_after: number | null;
}

// New interfaces based on FEplan.md

// For Banking Tab KPIs
export interface BankingSummary {
  year: number;
  cb_before: number;
  applied: number;
  cb_after: number;
}

// For Pooling Tab - adjusted CB per ship
export interface AdjustedCompliance {
  ship_id: string;
  year: number;
  adjusted_cb_gco2eq: number;
}

// For Pooling Tab - creating a pool
export interface PoolCreationRequest {
  year: number;
  member_ship_ids: string[];
}

// For Pooling Tab - displaying pool members with ship name
export interface PoolMemberDisplay {
  ship_id: string;
  pool_id: string; // Added from domain PoolMember
  cb_before: number; // Added from domain PoolMember
  cb_after: number | null; // Added from domain PoolMember
  ship_name?: string;
}

// For Filters in Routes Tab
export interface RouteFilters {
  vesselType?: string;
  fuelType?: string;
  year?: number;
}
