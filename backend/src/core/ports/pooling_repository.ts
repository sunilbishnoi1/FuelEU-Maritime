import { Pool } from "../domain/pool.js";
import { PoolMember } from "../domain/pool_member.js";

export interface PoolingRepository {
  savePool(pool: Pool): Promise<Pool | null>;
  savePoolMember(poolMember: PoolMember): Promise<PoolMember | null>;
  getPoolMembersByPoolId(poolId: string): Promise<PoolMember[]>;
}
