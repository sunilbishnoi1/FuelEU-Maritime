import type { ComplianceBalance } from '../domain/entities';
import type { ComplianceRepository } from '../ports/outbound';
import type {
  FetchComplianceBalanceUseCase,
  BankSurplusUseCase,
  ApplyBankedCreditUseCase,
} from '../ports/inbound';
import type { BankingSummary } from '../../types';

export class FetchComplianceBalance implements FetchComplianceBalanceUseCase {
  private readonly complianceRepository: ComplianceRepository;

  constructor(complianceRepository: ComplianceRepository) {
    this.complianceRepository = complianceRepository;
  }

  async execute(year: number): Promise<ComplianceBalance> {
    return this.complianceRepository.getComplianceBalance(year);
  }
}

export class BankSurplus implements BankSurplusUseCase {
  private readonly complianceRepository: ComplianceRepository;

  constructor(complianceRepository: ComplianceRepository) {
    this.complianceRepository = complianceRepository;
  }

  async execute(year: number): Promise<BankingSummary> {
    return this.complianceRepository.bankSurplus(year);
  }
}

export class ApplyBankedCredit implements ApplyBankedCreditUseCase {
  private readonly complianceRepository: ComplianceRepository;

  constructor(complianceRepository: ComplianceRepository) {
    this.complianceRepository = complianceRepository;
  }

  async execute(year: number, amount: number): Promise<BankingSummary> {
    return this.complianceRepository.applyBankedCredit(year, amount);
  }
}
