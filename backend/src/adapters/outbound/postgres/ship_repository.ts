import { Pool } from "pg";
import { IShipRepository } from "../../../core/ports/ship_repository";
import { Ship } from "../../../core/domain/ship";

export class PostgresShipRepository implements IShipRepository {
  constructor(private pool: Pool) {}

  async getAllShips(): Promise<Ship[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT DISTINCT ship_id
        FROM ship_compliance;
      `;
      const result = await client.query(query);
      return result.rows.map((row) => ({
        id: row.ship_id,
        name: `Ship ${row.ship_id}`, // Placeholder name, as no ship name in ship_compliance
      }));
    } finally {
      client.release();
    }
  }
}
