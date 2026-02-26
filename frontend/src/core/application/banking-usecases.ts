import type { ComplianceBalance, BankingSummary } from '../domain/entities';
import type { ComplianceRepository } from '../ports/outbound';
import type {
  FetchComplianceBalanceUseCase,
  BankSurplusUseCase,
  ApplyBankedCreditUseCase,
} from '../ports/inbound';

export class FetchComplianceBalance implements FetchComplianceBalanceUseCase {
  private readonly complianceRepository: ComplianceRepository;

  constructor(complianceRepository: ComplianceRepository) {
    this.complianceRepository = complianceRepository;
  }

  async execute(shipId: string, year: number): Promise<ComplianceBalance | null> {
    return this.complianceRepository.getComplianceBalance(shipId, year);
  }
}

export class BankSurplus implements BankSurplusUseCase {
  private readonly complianceRepository: ComplianceRepository;

  constructor(complianceRepository: ComplianceRepository) {
    this.complianceRepository = complianceRepository;
  }

  async execute(shipId: string, year: number): Promise<BankingSummary> {
    return this.complianceRepository.bankSurplus(shipId, year);
  }
}

export class ApplyBankedCredit implements ApplyBankedCreditUseCase {
  private readonly complianceRepository: ComplianceRepository;

  constructor(complianceRepository: ComplianceRepository) {
    this.complianceRepository = complianceRepository;
  }

  async execute(shipId: string, year: number, amount: number): Promise<BankingSummary> {
    return this.complianceRepository.applyBankedCredit(shipId, year, amount);
  }
}
