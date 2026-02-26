import { Pool } from "pg";
import { BankEntry } from "../../../core/domain/bank_entry.js";
import { type BankingRepository } from "../../../core/ports/banking_repository.js";

export class PgBankingRepository implements BankingRepository {
  constructor(private pool: Pool) {}

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
    return result.rows[0] ?? null;
  }

  async getTotalBanked(shipId: string, year: number): Promise<number> {
    const result = await this.pool.query<{ sum: string | null }>(
      "SELECT SUM(amount_gco2eq) as sum FROM bank_entries WHERE ship_id = $1 AND year <= $2",
      [shipId, year],
    );
    const sum = result.rows[0]?.sum;
    return sum ? parseFloat(sum) : 0;
  }

  async getAvailableSurplus(shipId: string, year: number): Promise<number> {
    return this.getTotalBanked(shipId, year);
  }

  /**
   * H2: Atomically validate and apply banked surplus within a transaction.
   * Uses SELECT ... FOR UPDATE to lock rows and prevent race conditions.
   */
  async applyWithinTransaction(
    shipId: string,
    year: number,
    entry: BankEntry,
  ): Promise<BankEntry> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Lock and sum all bank entries for this ship/year within the transaction
      const surplusResult = await client.query<{
        amount_gco2eq: string | number;
      }>(
        `SELECT amount_gco2eq
         FROM bank_entries
         WHERE ship_id = $1 AND year <= $2
         FOR UPDATE`,
        [shipId, year],
      );

      const availableSurplus = surplusResult.rows.reduce(
        (sum, row) => sum + parseFloat(String(row.amount_gco2eq)),
        0,
      );
      const amountToApply = Math.abs(entry.amount_gco2eq);

      if (amountToApply > availableSurplus) {
        throw new Error(
          "Invalid amount to apply or insufficient banked surplus.",
        );
      }

      const result = await client.query<BankEntry>(
        "INSERT INTO bank_entries (id, ship_id, year, amount_gco2eq) VALUES ($1, $2, $3, $4) RETURNING *",
        [entry.id, entry.ship_id, entry.year, entry.amount_gco2eq],
      );

      await client.query("COMMIT");

      const row = result.rows[0];
      if (!row) {
        throw new Error("Failed to save bank entry");
      }
      return row;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
