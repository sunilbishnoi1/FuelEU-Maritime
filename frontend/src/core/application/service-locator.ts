import { routesApi, complianceApi, bankingApi, poolingApi } from '../../adapters/infrastructure/api-client';
import { FetchRoutes, SetBaseline } from './routes-usecases';
import { FetchComparison } from './compare-usecases';
import { BankSurplus, ApplyBankedCredit, FetchComplianceBalance } from './banking-usecases';
import { CreatePool, FetchAdjustedComplianceBalance } from './pooling-usecases';
import type { Route, ComplianceBalance, Pool } from '../domain/entities';
import type { Compliance, BankEntry, ApiRoute, BankingSummary, AdjustedCompliance, PoolCreationRequest } from '../../types';

// Instantiate Repositories
const routeRepository = {
  getRoutes: async (_filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> => {
    const apiRoutes: ApiRoute[] = await routesApi.getAllRoutes();
    return apiRoutes.map((apiRoute: ApiRoute) => ({
      id: apiRoute.id,
      routeId: apiRoute.route_id,
      vesselType: apiRoute.vessel_type,
      fuelType: apiRoute.fuel_type,
      isBaseline: apiRoute.is_baseline,
      ghgIntensity: parseFloat(String(apiRoute.ghg_intensity)) || 0, // Ensure parsing to number, default to 0 if NaN
      fuelConsumption: parseFloat(String(apiRoute.fuel_consumption)),
      distance: parseFloat(String(apiRoute.distance)),
      totalEmissions: parseFloat(String(apiRoute.total_emissions)),
      year: apiRoute.year,
    }));
  },
  setBaseline: async (id: string): Promise<void> => {
    await routesApi.setRouteAsBaseline(id);
  },
  getComparisonData: async (): Promise<{ baseline: Route[]; comparison: Route[] }> => {
    const apiRoutes: ApiRoute[] = await routesApi.getComparison();
    const baseline: Route[] = [];
    const comparison: Route[] = [];

    apiRoutes.forEach((apiRoute: ApiRoute) => {
      const domainRoute: Route = {
        id: apiRoute.id,
        routeId: apiRoute.route_id,
        vesselType: apiRoute.vessel_type,
        fuelType: apiRoute.fuel_type,
        isBaseline: apiRoute.is_baseline,
        year: apiRoute.year,
        ghgIntensity: parseFloat(String(apiRoute.ghg_intensity)) || 0, // Ensure parsing to number, default to 0 if NaN
        fuelConsumption: apiRoute.fuel_consumption,
        distance: apiRoute.distance,
        totalEmissions: apiRoute.total_emissions,
      };
      if (apiRoute.is_baseline) {
        baseline.push(domainRoute);
      } else {
        comparison.push(domainRoute);
      }
    });
    return { baseline, comparison };
  },
};

const complianceRepository = {
  getComplianceBalance: async (shipId: string, year: number): Promise<ComplianceBalance | null> => {
    const apiCompliance: Compliance | null = await complianceApi.getComplianceBalance(shipId, year);
    if (apiCompliance === null) {
      return null;
    }
    return {
      year: apiCompliance.year,
      cb_before: apiCompliance.cb_gco2eq,
      applied: 0, // Placeholder
      cb_after: apiCompliance.cb_gco2eq,
      transactions: [], // Placeholder
    };
  },
  bankSurplus: async (shipId: string, year: number): Promise<BankingSummary> => {
    const apiBankEntry: BankEntry = await bankingApi.bankComplianceBalance(shipId, year);
    // This mapping is simplified. In a real scenario, you'd fetch the current CB to get cb_before and cb_after.
    return {
      year: apiBankEntry.year,
      cb_before: 0, // Placeholder, needs actual value from a prior fetch
      applied: apiBankEntry.amount_gco2eq,
      cb_after: 0, // Placeholder, needs actual value after banking
    };
  },
  applyBankedCredit: async (shipId: string, year: number, amount: number): Promise<BankingSummary> => {
    const apiBankEntry: BankEntry = await bankingApi.applyBankedSurplus(shipId, year, amount);
    // This mapping is simplified. In a real scenario, you'd fetch the current CB to get cb_before and cb_after.
    return {
      year: apiBankEntry.year,
      cb_before: 0, // Placeholder, needs actual value from a prior fetch
      applied: apiBankEntry.amount_gco2eq,
      cb_after: 0, // Placeholder, needs actual value after applying
    };
  },
  getAdjustedComplianceBalance: async (year: number): Promise<AdjustedCompliance[]> => {
    const apiAdjustedCbs = await complianceApi.getAllAdjustedComplianceBalances(year);
    return apiAdjustedCbs.map(apiAdjustedCb => ({
      ship_id: apiAdjustedCb.shipId,
      year: apiAdjustedCb.year,
      adjusted_cb_gco2eq: apiAdjustedCb.adjustedCb,
    }));
  },
  createPool: async (poolRequest: PoolCreationRequest): Promise<Pool> => {
    const apiPoolMembers = await poolingApi.createPool(poolRequest.year, poolRequest.member_ship_ids);
    // The apiPoolMembers are already of type PoolMember from types.ts, which now matches domain/entities.ts
    // We need to construct the Pool object as defined in domain/entities.ts
    return {
      id: apiPoolMembers[0]?.pool_id || `pool-${poolRequest.year}-${Date.now()}`, // Placeholder for id
      year: poolRequest.year,
      members: apiPoolMembers, // Directly assign as types now match
      poolSum: 0, // Placeholder, needs to be calculated or fetched
      isValid: false, // Placeholder, needs to be calculated or fetched
    };
  },
};

// Instantiate Use Cases
export const fetchRoutesUseCase = new FetchRoutes(routeRepository);
export const setBaselineUseCase = new SetBaseline(routeRepository);

export const fetchComparisonUseCase = new FetchComparison(routeRepository);

export const fetchComplianceBalanceUseCase = new FetchComplianceBalance(complianceRepository);
export const bankSurplusUseCase = new BankSurplus(complianceRepository);
export const applyBankedCreditUseCase = new ApplyBankedCredit(complianceRepository);

export const fetchAdjustedComplianceBalanceUseCase = new FetchAdjustedComplianceBalance(complianceRepository);
export const createPoolUseCase = new CreatePool(complianceRepository);
