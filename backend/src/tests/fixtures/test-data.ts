import { type Route } from "../../core/domain/route";
import { Compliance } from "../../core/domain/compliance";
import { BankEntry } from "../../core/domain/bank_entry";

export const BASELINE_ROUTE: Route = {
  id: "route-1",
  route_id: "baseline",
  year: 2025,
  ghg_intensity: 89.3368,
  is_baseline: true,
};

export const ROUTE_2: Route = {
  id: "route-2",
  route_id: "route-2-data",
  year: 2025,
  ghg_intensity: 95.0,
  is_baseline: false,
};

export const ROUTE_3: Route = {
  id: "route-3",
  route_id: "route-3-data",
  year: 2025,
  ghg_intensity: 85.0,
  is_baseline: false,
};

export const ROUTE_4: Route = {
  id: "route-4",
  route_id: "route-4-data",
  year: 2025,
  ghg_intensity: 100.0,
  is_baseline: false,
};

export const ROUTE_5: Route = {
  id: "route-5",
  route_id: "route-5-data",
  year: 2025,
  ghg_intensity: 80.0,
  is_baseline: false,
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
): Route {
  return {
    id,
    route_id: `route-${id}`,
    year: 2025,
    ghg_intensity: intensity,
    is_baseline: isBaseline,
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
