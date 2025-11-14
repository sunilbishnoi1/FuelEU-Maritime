import { Pool } from "pg";
import { type Route } from "../../../core/domain/route.js";
import { type RoutesRepository } from "../../../core/ports/routes_repository.js";
import db from "../../../infrastructure/db/db.js";

export class PgRoutesRepository implements RoutesRepository {
  private pool: Pool;

  constructor() {
    this.pool = db;
  }

  async findAll(): Promise<Route[]> {
    const result = await this.pool.query<Route>("SELECT * FROM routes");
    return result.rows;
  }

  async findById(id: string): Promise<Route | null> {
    const result = await this.pool.query<Route>(
      "SELECT * FROM routes WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    const result = await this.pool.query<Route>(
      "SELECT * FROM routes WHERE route_id = $1",
      [routeId],
    );
    return result.rows[0] || null;
  }

  async setBaseline(id: string): Promise<Route | null> {
    // Start a transaction
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      // Unset current baseline
      await client.query(
        "UPDATE routes SET is_baseline = FALSE WHERE is_baseline = TRUE",
      );

      // Set new baseline using the UUID
      const result = await client.query<Route>(
        "UPDATE routes SET is_baseline = TRUE WHERE id = $1 RETURNING *",
        [id],
      );

      await client.query("COMMIT");
      return result.rows[0] || null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async findBaseline(): Promise<Route | null> {
    const result = await this.pool.query<Route>(
      "SELECT * FROM routes WHERE is_baseline = TRUE",
    );
    return result.rows[0] || null;
  }

  async findNonBaselineRoutes(): Promise<Route[]> {
    const result = await this.pool.query<Route>(
      "SELECT * FROM routes WHERE is_baseline = FALSE",
    );
    return result.rows;
  }
}
