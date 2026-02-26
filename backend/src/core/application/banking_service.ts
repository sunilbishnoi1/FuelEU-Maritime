import { BankEntry } from "../domain/bank_entry.js";
import { type BankingRepository } from "../ports/banking_repository.js";
import { type ComplianceRepository } from "../ports/compliance_repository.js";
import { v4 as uuidv4 } from "uuid";

export class BankingService {
  constructor(
    private bankingRepository: BankingRepository,
    private complianceRepository: ComplianceRepository,
  ) {}

  async getBankRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return this.bankingRepository.findByShipIdAndYear(shipId, year);
  }

  async bankComplianceBalance(
    shipId: string,
    year: number,
  ): Promise<BankEntry | null> {
    const compliance = await this.complianceRepository.findByShipIdAndYear(
      shipId,
      year,
    );

    if (!compliance || compliance.cb_gco2eq <= 0) {
      return null; // Cannot bank negative or zero compliance balance
    }

    const newBankEntry = new BankEntry(
      uuidv4(),
      shipId,
      year,
      compliance.cb_gco2eq,
    );

    return this.bankingRepository.save(newBankEntry);
  }

  async applyBankedSurplus(
    shipId: string,
    year: number,
    amountToApply: number,
  ): Promise<BankEntry> {
    if (amountToApply <= 0) {
      throw new Error(
        "Invalid amount to apply or insufficient banked surplus.",
      );
    }

    // H2: Use transactional apply to prevent race conditions
    const appliedEntry = new BankEntry(uuidv4(), shipId, year, -amountToApply);
    return this.bankingRepository.applyWithinTransaction(
      shipId,
      year,
      appliedEntry,
    );
  }
}
