export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
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
