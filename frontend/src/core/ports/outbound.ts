import type { Route, ComplianceBalance, Pool } from '../domain/entities';
import type { RouteFilters, BankingSummary, AdjustedCompliance, PoolCreationRequest } from '../../types';

export interface RouteRepository {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(id: string): Promise<void>;
  getComparisonData(): Promise<{ baseline: Route[]; comparison: Route[] }>;
}

export interface ComplianceRepository {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null>;
  bankSurplus(shipId: string, year: number): Promise<BankingSummary>;
  applyBankedCredit(shipId: string, year: number, amount: number): Promise<BankingSummary>;
  getAdjustedComplianceBalance(year: number): Promise<AdjustedCompliance[]>;
  createPool(poolRequest: PoolCreationRequest): Promise<Pool>;
}
