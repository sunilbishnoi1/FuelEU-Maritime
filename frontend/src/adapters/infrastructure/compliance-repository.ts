import type { ComplianceRepository } from '../../core/ports/outbound';
import type {
  ComplianceBalance,
  Pool,
  BankingSummary,
  AdjustedCompliance,
  PoolCreationRequest,
} from '../../core/domain/entities';
import { complianceApi, bankingApi, poolingApi } from './api-client';

export class ApiComplianceRepository implements ComplianceRepository {
  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null> {
    const apiCompliance = await complianceApi.getComplianceBalance(shipId, year);
    if (apiCompliance === null) {
      return null;
    }

    // Fetch bank records to compute applied amount and transactions
    let applied = 0;
    const transactions: ComplianceBalance['transactions'] = [];

    try {
      const bankRecords = await bankingApi.getBankRecords(shipId, year);
      for (const record of bankRecords) {
        const amount = Number(record.amount_gco2eq);
        applied += Number.isFinite(amount) ? amount : 0;
        const cbBeforeVal = Number(apiCompliance.cb_gco2eq);
        const cbAfterVal = Number.isFinite(cbBeforeVal) ? cbBeforeVal + applied : applied;

        transactions.push({
          id: record.id,
          type: amount > 0 ? 'bank' : 'apply',
          amount,
          date: new Date().toISOString(),
          cb_before_transaction: cbBeforeVal,
          cb_after_transaction: cbAfterVal,
        });
      }
    } catch {
      // Bank records endpoint may not exist or return empty — that's fine
    }

    const cbBefore = Number(apiCompliance.cb_gco2eq);
    const safeCbBefore = Number.isFinite(cbBefore) ? cbBefore : 0;
    const cbAfter = safeCbBefore + applied;

    return {
      year: Number(apiCompliance.year),
      cb_before: safeCbBefore,
      applied,
      cb_after: cbAfter,
      transactions,
    };
  }

  async bankSurplus(shipId: string, year: number): Promise<BankingSummary> {
    // Fetch current CB before banking
    const cbBefore = await complianceApi.getComplianceBalance(shipId, year);
    const cbBeforeValue = cbBefore ? Number(cbBefore.cb_gco2eq) : 0;

    const bankEntry = await bankingApi.bankComplianceBalance(shipId, year);

    // Fetch updated CB after banking
    const cbAfter = await complianceApi.getComplianceBalance(shipId, year);
    const cbAfterValue = cbAfter ? Number(cbAfter.cb_gco2eq) : 0;

    return {
      year: Number(bankEntry.year),
      cb_before: Number.isFinite(cbBeforeValue) ? cbBeforeValue : 0,
      applied: Number(bankEntry.amount_gco2eq),
      cb_after: Number.isFinite(cbAfterValue) ? cbAfterValue : 0,
    };
  }

  async applyBankedCredit(shipId: string, year: number, amount: number): Promise<BankingSummary> {
    // Fetch current CB before applying
    const cbBefore = await complianceApi.getComplianceBalance(shipId, year);
    const cbBeforeValue = cbBefore ? Number(cbBefore.cb_gco2eq) : 0;

    const bankEntry = await bankingApi.applyBankedSurplus(shipId, year, amount);

    // Fetch updated CB after applying
    const cbAfter = await complianceApi.getComplianceBalance(shipId, year);
    const cbAfterValue = cbAfter ? Number(cbAfter.cb_gco2eq) : 0;

    return {
      year: Number(bankEntry.year),
      cb_before: Number.isFinite(cbBeforeValue) ? cbBeforeValue : 0,
      applied: Number(bankEntry.amount_gco2eq),
      cb_after: Number.isFinite(cbAfterValue) ? cbAfterValue : 0,
    };
  }

  async getAdjustedComplianceBalance(year: number): Promise<AdjustedCompliance[]> {
    const apiAdjustedCbs = await complianceApi.getAllAdjustedComplianceBalances(year);
    return apiAdjustedCbs
      .filter((item) => item.adjustedCb !== null)
      .map((item) => {
        const val = Number(item.adjustedCb);
        return {
          ship_id: item.shipId,
          year: Number(item.year),
          adjusted_cb_gco2eq: Number.isFinite(val) ? val : 0,
        };
      });
  }

  async createPool(poolRequest: PoolCreationRequest): Promise<Pool> {
    const apiPoolMembers = await poolingApi.createPool(poolRequest.year, poolRequest.member_ship_ids);

    const members = apiPoolMembers.map((m) => ({
      pool_id: m.pool_id,
      ship_id: m.ship_id,
      cb_before: Number.isFinite(Number(m.cb_before)) ? Number(m.cb_before) : 0,
      cb_after: Number.isFinite(Number(m.cb_after)) ? Number(m.cb_after) : 0,
    }));

    const poolSum = members.reduce((sum, m) => sum + (m.cb_after ?? m.cb_before), 0);
    const isValid = poolSum >= 0;

    return {
      id: apiPoolMembers[0]?.pool_id || `pool-${poolRequest.year}-${Date.now()}`,
      year: poolRequest.year,
      members,
      poolSum,
      isValid,
    };
  }
}
