import { type Pool } from "../domain/pool.js";
import { type PoolMember } from "../domain/pool_member.js";

export interface PoolingRepository {
  savePool(pool: Pool): Promise<Pool | null>;
  savePoolMember(poolMember: PoolMember): Promise<PoolMember | null>;
  getPoolMembersByPoolId(poolId: string): Promise<PoolMember[]>;
  /** Atomically save pool and all members in a single transaction */
  savePoolWithMembers(pool: Pool, members: PoolMember[]): Promise<void>;
}
