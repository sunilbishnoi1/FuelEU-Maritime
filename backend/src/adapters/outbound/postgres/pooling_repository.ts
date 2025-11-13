import { Pool as DbPool } from "pg";
import { Pool } from "../../../core/domain/pool.js";
import { PoolMember } from "../../../core/domain/pool_member.js";
import { type PoolingRepository } from "../../../core/ports/pooling_repository.js";
import db from "../../../infrastructure/db/db.js";

export class PgPoolingRepository implements PoolingRepository {
  private pool: DbPool;

  constructor() {
    this.pool = db;
  }

  async savePool(pool: Pool): Promise<Pool | null> {
    const { id, year, created_at } = pool;
    const result = await this.pool.query<Pool>(
      "INSERT INTO pools (id, year, created_at) VALUES ($1, $2, $3) RETURNING *",
      [id, year, created_at],
    );
    return result.rows[0] || null;
  }

  async savePoolMember(poolMember: PoolMember): Promise<PoolMember | null> {
    const { pool_id, ship_id, cb_before, cb_after } = poolMember;
    const result = await this.pool.query<PoolMember>(
      "INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after) VALUES ($1, $2, $3, $4) RETURNING *",
      [pool_id, ship_id, cb_before, cb_after],
    );
    return result.rows[0] || null;
  }

  async getPoolMembersByPoolId(poolId: string): Promise<PoolMember[]> {
    const result = await this.pool.query<PoolMember>(
      "SELECT * FROM pool_members WHERE pool_id = $1",
      [poolId],
    );
    return result.rows;
  }
}
