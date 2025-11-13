import { BankEntry } from "../domain/bank_entry";
import { type BankingRepository } from "../ports/banking_repository";
import { type ComplianceRepository } from "../ports/compliance_repository";
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
  ): Promise<BankEntry | null> {
    const availableSurplus = await this.bankingRepository.getAvailableSurplus(
      shipId,
      year,
    );

    if (amountToApply <= 0 || amountToApply > availableSurplus) {
      throw new Error(
        "Invalid amount to apply or insufficient banked surplus.",
      );
    }

    // For now, we'll just record the application as a negative bank entry.
    // A more sophisticated system might adjust the original bank entries or have a separate "applied" record.
    const appliedEntry = new BankEntry(uuidv4(), shipId, year, -amountToApply);

    return this.bankingRepository.save(appliedEntry);
  }
}
