import { type Route } from "../../core/domain/route";
import { Compliance } from "../../core/domain/compliance";
import { BankEntry } from "../../core/domain/bank_entry";
import { type Ship } from "../../core/domain/ship";

export const BASELINE_ROUTE: Route = {
  id: "route-1",
  route_id: "route-1",
  year: 2025,
  ghg_intensity: 89.3368,
  is_baseline: true,
  vessel_type: "Container",
  fuel_type: "HFO",
  fuel_consumption: 5000,
  distance: 12000,
  total_emissions: 4500,
};

export const ROUTE_2: Route = {
  id: "route-2",
  route_id: "route-2",
  year: 2025,
  ghg_intensity: 95.0,
  is_baseline: false,
  vessel_type: "BulkCarrier",
  fuel_type: "LNG",
  fuel_consumption: 4800,
  distance: 11500,
  total_emissions: 4200,
};

export const ROUTE_3: Route = {
  id: "route-3",
  route_id: "route-3",
  year: 2025,
  ghg_intensity: 85.0,
  is_baseline: false,
  vessel_type: "Tanker",
  fuel_type: "MGO",
  fuel_consumption: 5100,
  distance: 12500,
  total_emissions: 4700,
};

export const ROUTE_4: Route = {
  id: "route-4",
  route_id: "route-4",
  year: 2025,
  ghg_intensity: 100.0,
  is_baseline: false,
  vessel_type: "RoRo",
  fuel_type: "HFO",
  fuel_consumption: 4900,
  distance: 11800,
  total_emissions: 4300,
};

export const ROUTE_5: Route = {
  id: "route-5",
  route_id: "route-5",
  year: 2025,
  ghg_intensity: 80.0,
  is_baseline: false,
  vessel_type: "Container",
  fuel_type: "LNG",
  fuel_consumption: 4950,
  distance: 11900,
  total_emissions: 4400,
};

export const ALL_ROUTES: Route[] = [
  BASELINE_ROUTE,
  ROUTE_2,
  ROUTE_3,
  ROUTE_4,
  ROUTE_5,
];

export const COMPLIANCE_POSITIVE: Compliance = new Compliance(
  "compliance-1",
  "ship-1",
  2025,
  1000000, // Positive CB (surplus)
);

export const COMPLIANCE_NEGATIVE: Compliance = new Compliance(
  "compliance-2",
  "ship-2",
  2025,
  -500000, // Negative CB (deficit)
);

export const COMPLIANCE_ZERO: Compliance = new Compliance(
  "compliance-3",
  "ship-3",
  2025,
  0, // Zero CB
);

export const BANK_ENTRY_POSITIVE: BankEntry = new BankEntry(
  "bank-1",
  "ship-1",
  2025,
  500000,
);

export const BANK_ENTRY_NEGATIVE: BankEntry = new BankEntry(
  "bank-2",
  "ship-1",
  2025,
  -200000, // Applied from bank
);

// Test data helpers
export function createRoute(
  id: string,
  intensity: number,
  isBaseline: boolean = false,
  vesselType: string = "Container",
  fuelType: string = "HFO",
  fuelConsumption: number = 5000,
  distance: number = 12000,
  totalEmissions: number = 4500,
): Route {
  return {
    id,
    route_id: id,
    year: 2025,
    ghg_intensity: intensity,
    is_baseline: isBaseline,
    vessel_type: vesselType,
    fuel_type: fuelType,
    fuel_consumption: fuelConsumption,
    distance: distance,
    total_emissions: totalEmissions,
  };
}

export function createCompliance(
  shipId: string,
  year: number,
  cb: number,
): Compliance {
  return new Compliance(`comp-${shipId}`, shipId, year, cb);
}

export function createBankEntry(
  shipId: string,
  year: number,
  amount: number,
): BankEntry {
  return new BankEntry(`bank-${shipId}`, shipId, year, amount);
}

export function createShip(
  id: string,
  routeId: string,
  name?: string,
): Ship {
  return {
    id,
    name: name ?? `Ship ${id}`,
    route_id: routeId,
  };
}
