import type { Route, ComplianceBalance, Pool } from '../domain/entities';
import type { RouteFilters, BankingSummary, AdjustedCompliance, PoolCreationRequest } from '../../types';

// Use Cases for Routes Tab
export interface FetchRoutesUseCase {
  execute(filters?: RouteFilters): Promise<Route[]>;
}

export interface SetBaselineUseCase {
  execute(id: string): Promise<void>;
}

// Use Cases for Compare Tab
export interface FetchComparisonUseCase {
  execute(): Promise<{ baseline: Route[]; comparison: Route[] }>;
}

// Use Cases for Banking Tab
export interface FetchComplianceBalanceUseCase {
  execute(shipId: string, year: number): Promise<ComplianceBalance | null>;
}

export interface BankSurplusUseCase {
  execute(shipId: string, year: number): Promise<BankingSummary>;
}

export interface ApplyBankedCreditUseCase {
  execute(shipId: string, year: number, amount: number): Promise<BankingSummary>;
}

// Use Cases for Pooling Tab
export interface FetchAdjustedComplianceBalanceUseCase {
  execute(year: number): Promise<AdjustedCompliance[]>;
}

export interface CreatePoolUseCase {
  execute(poolRequest: PoolCreationRequest): Promise<Pool>;
}
