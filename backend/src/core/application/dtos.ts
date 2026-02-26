import { type Route } from "../domain/route.js";

/** DTO returned by the comparison endpoint */
export interface ComparisonDto {
  id: string;
  route_id: string;
  year: number;
  ghg_intensity: number;
  is_baseline: boolean;
  vessel_type: string;
  fuel_type: string;
  fuel_consumption: number;
  distance: number;
  total_emissions: number;
  percentDiff: number;
  compliant: boolean;
}
