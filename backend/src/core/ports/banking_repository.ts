import { type BankEntry } from "../domain/bank_entry.js";

export interface BankingRepository {
  findByShipIdAndYear(shipId: string, year: number): Promise<BankEntry[]>;
  save(bankEntry: BankEntry): Promise<BankEntry | null>;
  getTotalBanked(shipId: string, year: number): Promise<number>;
  getAvailableSurplus(shipId: string, year: number): Promise<number>;
  /**
   * Atomically validate available surplus and save the application entry
   * within a single transaction to prevent race conditions.
   */
  applyWithinTransaction(
    shipId: string,
    year: number,
    entry: BankEntry,
  ): Promise<BankEntry>;
}
