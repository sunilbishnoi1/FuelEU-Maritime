import { Pool } from "pg";
import { type IShipRepository } from "../../../core/ports/ship_repository.js";
import { type Ship } from "../../../core/domain/ship.js";

export class PostgresShipRepository implements IShipRepository {
  constructor(private pool: Pool) {}

  async getAllShips(): Promise<Ship[]> {
    const result = await this.pool.query<Ship>(
      "SELECT id, name, route_id FROM ships",
    );
    return result.rows;
  }

  async findById(shipId: string): Promise<Ship | null> {
    const result = await this.pool.query<Ship>(
      "SELECT id, name, route_id FROM ships WHERE id = $1",
      [shipId],
    );
    return result.rows[0] ?? null;
  }
}
