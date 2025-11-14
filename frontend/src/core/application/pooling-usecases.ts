import type { Pool } from '../domain/entities';
import type { ComplianceRepository } from '../ports/outbound';
import type {
  FetchAdjustedComplianceBalanceUseCase,
  CreatePoolUseCase,
} from '../ports/inbound';
import type { AdjustedCompliance, PoolCreationRequest } from '../../types';

export class FetchAdjustedComplianceBalance implements FetchAdjustedComplianceBalanceUseCase {
  private readonly complianceRepository: ComplianceRepository;

  constructor(complianceRepository: ComplianceRepository) {
    this.complianceRepository = complianceRepository;
  }

  async execute(year: number): Promise<AdjustedCompliance[]> {
    return this.complianceRepository.getAdjustedComplianceBalance(year);
  }
}

export class CreatePool implements CreatePoolUseCase {
  private readonly complianceRepository: ComplianceRepository;

  constructor(complianceRepository: ComplianceRepository) {
    this.complianceRepository = complianceRepository;
  }

  async execute(poolRequest: PoolCreationRequest): Promise<Pool> {
    return this.complianceRepository.createPool(poolRequest);
  }
}
