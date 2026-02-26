/**
 * API-level DTOs (Data Transfer Objects).
 * These mirror the backend API response shapes (snake_case).
 * Domain types are in core/domain/entities.ts.
 */

export interface ApiRoute {
  id: string;
  route_id: string;
  year: number;
  ghg_intensity: number;
  is_baseline: boolean;
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

export interface ApiPool {
  id: string;
  year: number;
  created_at: Date;
}

export interface ApiPoolMember {
  pool_id: string;
  ship_id: string;
  cb_before: number;
  cb_after: number | null;
}
