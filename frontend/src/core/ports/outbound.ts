import type { Route, ComplianceBalance, Pool } from '../domain/entities';
import type { RouteFilters, BankingSummary, AdjustedCompliance, PoolCreationRequest } from '../../types';

export interface RouteRepository {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(id: string): Promise<void>;
  getComparisonData(): Promise<{ baseline: Route[]; comparison: Route[] }>;
}

export interface ComplianceRepository {
  getComplianceBalance(year: number): Promise<ComplianceBalance>;
  bankSurplus(year: number): Promise<BankingSummary>;
  applyBankedCredit(year: number, amount: number): Promise<BankingSummary>;
  getAdjustedComplianceBalance(year: number): Promise<AdjustedCompliance[]>;
  createPool(poolRequest: PoolCreationRequest): Promise<Pool>;
}
