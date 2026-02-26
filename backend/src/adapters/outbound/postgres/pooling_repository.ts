import { Pool as DbPool } from "pg";
import { Pool } from "../../../core/domain/pool.js";
import { PoolMember } from "../../../core/domain/pool_member.js";
import { type PoolingRepository } from "../../../core/ports/pooling_repository.js";

export class PgPoolingRepository implements PoolingRepository {
  constructor(private pool: DbPool) {}

  async savePool(pool: Pool): Promise<Pool | null> {
    const { id, year, created_at } = pool;
    const result = await this.pool.query<Pool>(
      "INSERT INTO pools (id, year, created_at) VALUES ($1, $2, $3) RETURNING *",
      [id, year, created_at],
    );
    return result.rows[0] ?? null;
  }

  async savePoolMember(poolMember: PoolMember): Promise<PoolMember | null> {
    const { pool_id, ship_id, cb_before, cb_after } = poolMember;
    const result = await this.pool.query<PoolMember>(
      "INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after) VALUES ($1, $2, $3, $4) RETURNING *",
      [pool_id, ship_id, cb_before, cb_after],
    );
    return result.rows[0] ?? null;
  }

  async getPoolMembersByPoolId(poolId: string): Promise<PoolMember[]> {
    const result = await this.pool.query<PoolMember>(
      "SELECT * FROM pool_members WHERE pool_id = $1",
      [poolId],
    );
    return result.rows;
  }

  /**
   * C3: Atomically save pool and all members in a single transaction.
   * Rolls back completely on any failure — no orphan pools or partial members.
   */
  async savePoolWithMembers(pool: Pool, members: PoolMember[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "INSERT INTO pools (id, year, created_at) VALUES ($1, $2, $3)",
        [pool.id, pool.year, pool.created_at],
      );

      for (const member of members) {
        await client.query(
          "INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after) VALUES ($1, $2, $3, $4)",
          [member.pool_id, member.ship_id, member.cb_before, member.cb_after],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
