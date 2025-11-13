import { Pool } from "../domain/pool";
import { PoolMember } from "../domain/pool_member";
import { type PoolingRepository } from "../ports/pooling_repository";
import { type ComplianceRepository } from "../ports/compliance_repository";
import { type BankingRepository } from "../ports/banking_repository";
import { v4 as uuidv4 } from "uuid";

export class PoolingService {
  constructor(
    private poolingRepository: PoolingRepository,
    private complianceRepository: ComplianceRepository,
    private bankingRepository: BankingRepository,
  ) {}

  async createPool(year: number, shipIds: string[]): Promise<PoolMember[]> {
    const poolId = uuidv4();
    const newPool = new Pool(poolId, year, new Date());
    await this.poolingRepository.savePool(newPool);

    let membersWithCb: { shipId: string; cb: number }[] = [];
    for (const shipId of shipIds) {
      const compliance = await this.complianceRepository.findByShipIdAndYear(
        shipId,
        year,
      );
      const totalBanked = await this.bankingRepository.getTotalBanked(
        shipId,
        year,
      );
      const cbBefore = (compliance?.cb_gco2eq || 0) + totalBanked;
      membersWithCb.push({ shipId, cb: cbBefore });
    }

    // Validate ∑ CB ≥ 0
    const totalCb = membersWithCb.reduce((sum, member) => sum + member.cb, 0);
    if (totalCb < 0) {
      throw new Error(
        "Total compliance balance of pool members cannot be negative.",
      );
    }

    // Sort members desc by CB for greedy allocation
    membersWithCb.sort((a, b) => b.cb - a.cb);

    const membersWithFinalCb: { shipId: string; cbBefore: number; cbAfter: number }[] = [];
    let totalSurplusAvailable = 0;

    // First pass: Calculate initial cbBefore and accumulate total surplus
    for (const member of membersWithCb) {
      membersWithFinalCb.push({ shipId: member.shipId, cbBefore: member.cb, cbAfter: member.cb });
      if (member.cb > 0) {
        totalSurplusAvailable += member.cb;
      }
    }

    // Second pass: Distribute surplus to cover deficits
    for (const member of membersWithFinalCb) {
      if (member.cbBefore < 0) { // This is a deficit member
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

    // Third pass: Adjust surplus members' cbAfter based on remaining `totalSurplusAvailable`
    // The `totalSurplusAvailable` now represents the surplus remaining after covering all deficits.
    // This remaining surplus needs to be distributed back to the original surplus members.
    // The reduction in surplus (initial total surplus - remaining total surplus) must be applied to the surplus members.

    const initialTotalSurplus = membersWithCb.filter(m => m.cb > 0).reduce((sum, m) => sum + m.cb, 0);
    let surplusUsed = initialTotalSurplus - totalSurplusAvailable;

    if (surplusUsed > 0) {
      // Iterate through original surplus members (still sorted descending by CB)
      // and reduce their cbAfter until `surplusUsed` is 0.
      for (const member of membersWithFinalCb) {
        if (member.cbBefore > 0 && surplusUsed > 0) {
          const reductionAmount = Math.min(member.cbBefore, surplusUsed);
          member.cbAfter -= reductionAmount;
          surplusUsed -= reductionAmount;
        }
      }
    }

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
      await this.poolingRepository.savePoolMember(poolMember);
      finalPoolMembersList.push(poolMember);
    }

    return finalPoolMembersList;
  }
}
