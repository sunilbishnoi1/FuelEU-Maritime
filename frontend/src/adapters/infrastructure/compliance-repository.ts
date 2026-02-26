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
        applied += record.amount_gco2eq;
        transactions.push({
          id: record.id,
          type: record.amount_gco2eq > 0 ? 'bank' : 'apply',
          amount: record.amount_gco2eq,
          date: new Date().toISOString(),
          cb_before_transaction: apiCompliance.cb_gco2eq,
          cb_after_transaction: apiCompliance.cb_gco2eq + record.amount_gco2eq,
        });
      }
    } catch {
      // Bank records endpoint may not exist or return empty — that's fine
    }

    return {
      year: apiCompliance.year,
      cb_before: apiCompliance.cb_gco2eq,
      applied,
      cb_after: apiCompliance.cb_gco2eq + applied,
      transactions,
    };
  }

  async bankSurplus(shipId: string, year: number): Promise<BankingSummary> {
    // Fetch current CB before banking
    const cbBefore = await complianceApi.getComplianceBalance(shipId, year);
    const cbBeforeValue = cbBefore?.cb_gco2eq ?? 0;

    const bankEntry = await bankingApi.bankComplianceBalance(shipId, year);

    // Fetch updated CB after banking
    const cbAfter = await complianceApi.getComplianceBalance(shipId, year);
    const cbAfterValue = cbAfter?.cb_gco2eq ?? 0;

    return {
      year: bankEntry.year,
      cb_before: cbBeforeValue,
      applied: bankEntry.amount_gco2eq,
      cb_after: cbAfterValue,
    };
  }

  async applyBankedCredit(shipId: string, year: number, amount: number): Promise<BankingSummary> {
    // Fetch current CB before applying
    const cbBefore = await complianceApi.getComplianceBalance(shipId, year);
    const cbBeforeValue = cbBefore?.cb_gco2eq ?? 0;

    const bankEntry = await bankingApi.applyBankedSurplus(shipId, year, amount);

    // Fetch updated CB after applying
    const cbAfter = await complianceApi.getComplianceBalance(shipId, year);
    const cbAfterValue = cbAfter?.cb_gco2eq ?? 0;

    return {
      year: bankEntry.year,
      cb_before: cbBeforeValue,
      applied: bankEntry.amount_gco2eq,
      cb_after: cbAfterValue,
    };
  }

  async getAdjustedComplianceBalance(year: number): Promise<AdjustedCompliance[]> {
    const apiAdjustedCbs = await complianceApi.getAllAdjustedComplianceBalances(year);
    return apiAdjustedCbs.map((item) => ({
      ship_id: item.shipId,
      year: item.year,
      adjusted_cb_gco2eq: item.adjustedCb,
    }));
  }

  async createPool(poolRequest: PoolCreationRequest): Promise<Pool> {
    const apiPoolMembers = await poolingApi.createPool(poolRequest.year, poolRequest.member_ship_ids);

    const members = apiPoolMembers.map((m) => ({
      pool_id: m.pool_id,
      ship_id: m.ship_id,
      cb_before: m.cb_before,
      cb_after: m.cb_after,
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
