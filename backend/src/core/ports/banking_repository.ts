import { BankEntry } from "../domain/bank_entry.js";

export interface BankingRepository {
  findByShipIdAndYear(shipId: string, year: number): Promise<BankEntry[]>;
  save(bankEntry: BankEntry): Promise<BankEntry | null>;
  getTotalBanked(shipId: string, year: number): Promise<number>;
  getAvailableSurplus(shipId: string, year: number): Promise<number>;
}
