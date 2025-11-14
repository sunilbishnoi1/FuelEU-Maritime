import { type RoutesRepository } from "../../core/ports/routes_repository.js";
import { type ComplianceRepository } from "../../core/ports/compliance_repository.js";
import { type BankingRepository } from "../../core/ports/banking_repository.js";
import { type PoolingRepository } from "../../core/ports/pooling_repository.js";
import { type IShipRepository } from "../../core/ports/ship_repository.js"; // New import
import { type Route } from "../../core/domain/route.js";
import { Compliance } from "../../core/domain/compliance.js";
import { BankEntry } from "../../core/domain/bank_entry.js";
import { Pool } from "../../core/domain/pool.js";
import { PoolMember } from "../../core/domain/pool_member.js";
import { Ship } from "../../core/domain/ship.js"; // New import

export class MockRoutesRepository implements RoutesRepository {
  private routes: Route[] = [];
  private baseline: Route | null = null;

  setRoutes(routes: Route[]): void {
    this.routes = routes;
  }

  async findAll(): Promise<Route[]> {
    return Promise.resolve(this.routes);
  }

  async findById(id: string): Promise<Route | null> {
    const route = this.routes.find((r) => r.id === id);
    return Promise.resolve(route || null);
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    return this.findById(routeId);
  }

  async setBaseline(id: string): Promise<Route | null> {
    const route = this.routes.find((r) => r.id === id);
    if (!route) {
      return Promise.resolve(null);
    }

    // Unset current baseline
    this.routes.forEach((r) => {
      if (r.is_baseline) {
        r.is_baseline = false;
      }
    });

    // Set new baseline
    route.is_baseline = true;
    this.baseline = route;
    return Promise.resolve(route);
  }

  async findBaseline(): Promise<Route | null> {
    return Promise.resolve(this.baseline);
  }

  async findNonBaselineRoutes(): Promise<Route[]> {
    const nonBaseline = this.routes.filter((r) => !r.is_baseline);
    return Promise.resolve(nonBaseline);
  }
}

export class MockComplianceRepository implements ComplianceRepository {
  private compliances: Map<string, Compliance> = new Map();

  async findByShipIdAndYear(
    shipId: string,
    year: number,
  ): Promise<Compliance | null> {
    const key = `${shipId}-${year}`;
    return Promise.resolve(this.compliances.get(key) || null);
  }

  async save(compliance: Compliance): Promise<Compliance | null> {
    const key = `${compliance.ship_id}-${compliance.year}`;
    this.compliances.set(key, compliance);
    return Promise.resolve(compliance);
  }

  getAll(): Compliance[] {
    return Array.from(this.compliances.values());
  }
}

export class MockBankingRepository implements BankingRepository {
  private bankEntries: BankEntry[] = [];

  async findByShipIdAndYear(
    shipId: string,
    year: number,
  ): Promise<BankEntry[]> {
    const entries = this.bankEntries.filter(
      (e) => e.ship_id === shipId && e.year === year,
    );
    return Promise.resolve(entries);
  }

  async save(bankEntry: BankEntry): Promise<BankEntry | null> {
    this.bankEntries.push(bankEntry);
    return Promise.resolve(bankEntry);
  }

  async getTotalBanked(shipId: string, year: number): Promise<number> {
    const total = this.bankEntries
      .filter((e) => e.ship_id === shipId && e.year <= year)
      .reduce((sum, e) => sum + e.amount_gco2eq, 0);
    return Promise.resolve(total);
  }

  async getAvailableSurplus(shipId: string, year: number): Promise<number> {
    const total = this.bankEntries
      .filter((e) => e.ship_id === shipId && e.year <= year)
      .reduce((sum, e) => sum + e.amount_gco2eq, 0);
    return Promise.resolve(total);
  }

  getAll(): BankEntry[] {
    return this.bankEntries;
  }
}

export class MockPoolingRepository implements PoolingRepository {
  private pools: Pool[] = [];
  private poolMembers: PoolMember[] = [];

  async savePool(pool: Pool): Promise<Pool | null> {
    this.pools.push(pool);
    return Promise.resolve(pool);
  }

  async savePoolMember(poolMember: PoolMember): Promise<PoolMember | null> {
    this.poolMembers.push(poolMember);
    return Promise.resolve(poolMember);
  }

  async getPoolMembersByPoolId(poolId: string): Promise<PoolMember[]> {
    const members = this.poolMembers.filter((m) => m.pool_id === poolId);
    return Promise.resolve(members);
  }

  getAll(): PoolMember[] {
    return this.poolMembers;
  }

  getPools(): Pool[] {
    return this.pools;
  }
}

export class MockShipRepository implements IShipRepository {
  private ships: Ship[] = [
    { id: "ship-001", name: "Ship A" },
    { id: "ship-002", name: "Ship B" },
    { id: "ship-003", name: "Ship C" },
  ];

  async getAllShips(): Promise<Ship[]> {
    return Promise.resolve(this.ships);
  }
}
