import { Pool } from "pg";
import { Compliance } from "../../../core/domain/compliance.js";
import { type ComplianceRepository } from "../../../core/ports/compliance_repository.js";
import db from "../../../infrastructure/db/db.js";

export class PgComplianceRepository implements ComplianceRepository {
  private pool: Pool;

  constructor() {
    this.pool = db;
  }

  async findByShipIdAndYear(
    shipId: string,
    year: number,
  ): Promise<Compliance | null> {
    const result = await this.pool.query<Compliance>(
      "SELECT * FROM ship_compliance WHERE ship_id = $1 AND year = $2",
      [shipId, year],
    );
    return result.rows[0] || null;
  }

  async save(compliance: Compliance): Promise<Compliance | null> {
    const { id, ship_id, year, cb_gco2eq } = compliance;
    const result = await this.pool.query<Compliance>(
      "INSERT INTO ship_compliance (id, ship_id, year, cb_gco2eq) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, ship_id, year, cb_gco2eq],
    );
    return result.rows[0] || null;
  }
}
