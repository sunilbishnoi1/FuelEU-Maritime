import { Pool } from "pg";
import { BankEntry } from "../../../core/domain/bank_entry.js";
import { type BankingRepository } from "../../../core/ports/banking_repository.js";
import db from "../../../infrastructure/db/db.js";

export class PgBankingRepository implements BankingRepository {
  private pool: Pool;

  constructor() {
    this.pool = db;
  }

  async findByShipIdAndYear(
    shipId: string,
    year: number,
  ): Promise<BankEntry[]> {
    const result = await this.pool.query<BankEntry>(
      "SELECT * FROM bank_entries WHERE ship_id = $1 AND year = $2 ORDER BY year ASC",
      [shipId, year],
    );
    return result.rows;
  }

  async save(bankEntry: BankEntry): Promise<BankEntry | null> {
    const { id, ship_id, year, amount_gco2eq } = bankEntry;
    const result = await this.pool.query<BankEntry>(
      "INSERT INTO bank_entries (id, ship_id, year, amount_gco2eq) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, ship_id, year, amount_gco2eq],
    );
    return result.rows[0] || null;
  }

  async getTotalBanked(shipId: string, year: number): Promise<number> {
    const result = await this.pool.query<{ sum: string }>(
      "SELECT SUM(amount_gco2eq) FROM bank_entries WHERE ship_id = $1 AND year <= $2",
      [shipId, year],
    );
    const sum =
      result.rows.length > 0 && result.rows[0] ? result.rows[0].sum : "0";
    return parseFloat(sum);
  }

  async getAvailableSurplus(shipId: string, year: number): Promise<number> {
    return this.getTotalBanked(shipId, year);
  }
}
