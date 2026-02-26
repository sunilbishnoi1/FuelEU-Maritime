import { Pool } from "pg";
import { Compliance } from "../../../core/domain/compliance.js";
import { type ComplianceRepository } from "../../../core/ports/compliance_repository.js";

export class PgComplianceRepository implements ComplianceRepository {
  constructor(private pool: Pool) {}

  async findByShipIdAndYear(
    shipId: string,
    year: number,
  ): Promise<Compliance | null> {
    const result = await this.pool.query<Compliance>(
      "SELECT * FROM ship_compliance WHERE ship_id = $1 AND year = $2",
      [shipId, year],
    );
    return result.rows[0] ?? null;
  }

  async save(compliance: Compliance): Promise<Compliance> {
    const { id, ship_id, year, cb_gco2eq } = compliance;
    // H4: Use upsert to handle UNIQUE constraint on (ship_id, year)
    const result = await this.pool.query<Compliance>(
      `INSERT INTO ship_compliance (id, ship_id, year, cb_gco2eq)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (ship_id, year) DO UPDATE SET cb_gco2eq = EXCLUDED.cb_gco2eq
       RETURNING *`,
      [id, ship_id, year, cb_gco2eq],
    );
    const row = result.rows[0];
    if (!row) {
      throw new Error(
        `Failed to save compliance for ship ${ship_id}, year ${year}`,
      );
    }
    return row;
  }
}
