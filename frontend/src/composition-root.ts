/**
 * Composition Root — wires adapters to ports and instantiates use-cases.
 * This file lives outside core/ to maintain the hexagonal dependency direction:
 *   core → ports ← adapters
 */
import { ApiRouteRepository } from './adapters/infrastructure/route-repository';
import { ApiComplianceRepository } from './adapters/infrastructure/compliance-repository';

import { FetchRoutes, SetBaseline } from './core/application/routes-usecases';
import { FetchComparison } from './core/application/compare-usecases';
import { FetchComplianceBalance, BankSurplus, ApplyBankedCredit } from './core/application/banking-usecases';
import { FetchAdjustedComplianceBalance, CreatePool } from './core/application/pooling-usecases';

// Instantiate repository adapters
const routeRepository = new ApiRouteRepository();
const complianceRepository = new ApiComplianceRepository();

// Instantiate use-cases with injected repositories
export const fetchRoutesUseCase = new FetchRoutes(routeRepository);
export const setBaselineUseCase = new SetBaseline(routeRepository);

export const fetchComparisonUseCase = new FetchComparison(routeRepository);

export const fetchComplianceBalanceUseCase = new FetchComplianceBalance(complianceRepository);
export const bankSurplusUseCase = new BankSurplus(complianceRepository);
export const applyBankedCreditUseCase = new ApplyBankedCredit(complianceRepository);

export const fetchAdjustedComplianceBalanceUseCase = new FetchAdjustedComplianceBalance(complianceRepository);
export const createPoolUseCase = new CreatePool(complianceRepository);
