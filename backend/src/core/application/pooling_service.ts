import { Pool } from "../domain/pool.js";
import { PoolMember } from "../domain/pool_member.js";
import { type PoolingRepository } from "../ports/pooling_repository.js";
import { type ComplianceRepository } from "../ports/compliance_repository.js";
import { type BankingRepository } from "../ports/banking_repository.js";
import { v4 as uuidv4 } from "uuid";

export class PoolingService {
  constructor(
    private poolingRepository: PoolingRepository,
    private complianceRepository: ComplianceRepository,
    private bankingRepository: BankingRepository,
  ) {}

  async createPool(year: number, shipIds: string[]): Promise<PoolMember[]> {
    const poolId = uuidv4();

    // Gather CB data for all ships
    const membersWithCb: { shipId: string; cb: number }[] = [];
    for (const shipId of shipIds) {
      const compliance = await this.complianceRepository.findByShipIdAndYear(
        shipId,
        year,
      );
      const totalBanked = await this.bankingRepository.getTotalBanked(
        shipId,
        year,
      );
      const cbBefore = (compliance?.cb_gco2eq ?? 0) + totalBanked;
      membersWithCb.push({ shipId, cb: cbBefore });
    }

    // Validate ∑ CB ≥ 0 BEFORE any persistence
    const totalCb = membersWithCb.reduce((sum, member) => sum + member.cb, 0);
    if (totalCb < 0) {
      throw new Error(
        "Total compliance balance of pool members cannot be negative.",
      );
    }

    // Sort members desc by CB for greedy allocation
    membersWithCb.sort((a, b) => b.cb - a.cb);

    const membersWithFinalCb: {
      shipId: string;
      cbBefore: number;
      cbAfter: number;
    }[] = [];
    let totalSurplusAvailable = 0;

    // First pass: Calculate initial cbBefore and accumulate total surplus
    for (const member of membersWithCb) {
      membersWithFinalCb.push({
        shipId: member.shipId,
        cbBefore: member.cb,
        cbAfter: member.cb,
      });
      if (member.cb > 0) {
        totalSurplusAvailable += member.cb;
      }
    }

    // Second pass: Distribute surplus to cover deficits
    for (const member of membersWithFinalCb) {
      if (member.cbBefore < 0) {
        const deficitToCover = Math.abs(member.cbBefore);
        if (totalSurplusAvailable >= deficitToCover) {
          member.cbAfter = 0; // Deficit fully covered
          totalSurplusAvailable -= deficitToCover;
        } else {
          member.cbAfter = member.cbBefore + totalSurplusAvailable; // Partially covered
          totalSurplusAvailable = 0;
        }
      }
    }

    // Third pass: Adjust surplus members' cbAfter proportionally
    const initialTotalSurplus = membersWithCb
      .filter((m) => m.cb > 0)
      .reduce((sum, m) => sum + m.cb, 0);
    let surplusUsed = initialTotalSurplus - totalSurplusAvailable;

    if (surplusUsed > 0) {
      for (const member of membersWithFinalCb) {
        if (member.cbBefore > 0 && surplusUsed > 0) {
          const reductionAmount = Math.min(member.cbBefore, surplusUsed);
          member.cbAfter -= reductionAmount;
          surplusUsed -= reductionAmount;
        }
      }
    }

    // Build pool members and validate constraints BEFORE persistence
    const finalPoolMembersList: PoolMember[] = [];
    for (const member of membersWithFinalCb) {
      // Enforce: Deficit ship cannot exit worse
      if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
        throw new Error(`Deficit ship ${member.shipId} cannot exit worse.`);
      }
      // Enforce: Surplus ship cannot exit negative
      if (member.cbBefore > 0 && member.cbAfter < 0) {
        throw new Error(`Surplus ship ${member.shipId} cannot exit negative.`);
      }

      const poolMember = new PoolMember(
        poolId,
        member.shipId,
        member.cbBefore,
        member.cbAfter,
      );
      finalPoolMembersList.push(poolMember);
    }

    // C3: Persist pool + all members atomically in a single transaction
    const newPool = new Pool(poolId, year, new Date());
    await this.poolingRepository.savePoolWithMembers(newPool, finalPoolMembersList);

    return finalPoolMembersList;
  }
}
