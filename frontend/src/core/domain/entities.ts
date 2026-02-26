export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  isBaseline: boolean;
  ghgIntensity: number; // gCO₂e/MJ
  fuelConsumption: number; // tons
  distance: number; // km
  totalEmissions: number; // tons
}

export interface ComplianceBalance {
  year: number;
  cb_before: number;
  applied: number;
  cb_after: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'bank' | 'apply';
  amount: number;
  date: string; // ISO date string
  cb_before_transaction: number;
  cb_after_transaction: number;
}

export interface PoolMember {
  pool_id: string;
  ship_id: string;
  cb_before: number;
  cb_after: number | null;
}

export interface Pool {
  id: string;
  year: number;
  members: PoolMember[];
  poolSum: number;
  isValid: boolean;
}

/** Banking KPI summary for displaying cb_before, applied, cb_after */
export interface BankingSummary {
  year: number;
  cb_before: number;
  applied: number;
  cb_after: number;
}

/** Adjusted compliance balance per ship for pooling */
export interface AdjustedCompliance {
  ship_id: string;
  year: number;
  adjusted_cb_gco2eq: number;
}

/** Request shape for creating a pool */
export interface PoolCreationRequest {
  year: number;
  member_ship_ids: string[];
}

/** Filter parameters for routes */
export interface RouteFilters {
  vesselType?: string;
  fuelType?: string;
  year?: number;
}

/** Display-level pool member with optional ship name */
export interface PoolMemberDisplay {
  ship_id: string;
  pool_id: string;
  cb_before: number;
  cb_after: number | null;
  ship_name?: string;
}
