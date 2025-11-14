import { RoutesService } from "core/application/routes_service";
import { ComplianceService } from "core/application/compliance_service";
import { BankingService } from "core/application/banking_service";
import { PoolingService } from "core/application/pooling_service";
import {
  MockRoutesRepository,
  MockComplianceRepository,
  MockBankingRepository,
  MockPoolingRepository,
} from "tests/mocks/mock-repositories";
import {
  createRoute,
  createCompliance,
  createBankEntry,
} from "tests/fixtures/test-data";
import { BankEntry } from "core/domain/bank_entry";
import { Compliance } from "core/domain/compliance";
import { PoolMember } from "core/domain/pool_member";
import type { Route } from "core/domain/route";

describe("Edge Cases Tests", () => {
  describe("Routes Service - Edge Cases", () => {
    let routesService: RoutesService;
    let mockRoutesRepository: MockRoutesRepository;

    beforeEach(() => {
      mockRoutesRepository = new MockRoutesRepository();
      routesService = new RoutesService(mockRoutesRepository);
    });

    it("should handle routes with identical GHG intensity", async () => {
      const route1 = createRoute("route-1", 89.3368, true);
      const route2 = createRoute("route-2", 89.3368, false);
      mockRoutesRepository.setRoutes([route1, route2]);
      await mockRoutesRepository.setBaseline("route-1");

      const comparison = await routesService.getComparison();

      expect(comparison).toHaveLength(1);
      expect(comparison[0].percentDiff).toBe(0);
      expect(comparison[0].compliant).toBe(true);
    });

    it("should handle very large intensity differences", async () => {
      const baseline = createRoute("base", 100, true);
      const extremeHigh = createRoute("high", 10000, false);
      const extremeLow = createRoute("low", 0.001, false);

      mockRoutesRepository.setRoutes([baseline, extremeHigh, extremeLow]);
      await mockRoutesRepository.setBaseline("base");

      const comparison = await routesService.getComparison();

      expect(comparison).toHaveLength(2);
      const high = comparison.find((r: Route) => r.id === "high");
      const low = comparison.find((r: Route) => r.id === "low");

      expect(high?.percentDiff).toBeGreaterThan(0);
      expect(low?.percentDiff).toBeLessThan(0);
    });

    it("should handle zero baseline intensity", async () => {
      const baseline = createRoute("base", 0.0001, true); // Nearly zero
      const route = createRoute("route", 0.0002, false);

      mockRoutesRepository.setRoutes([baseline, route]);
      await mockRoutesRepository.setBaseline("base");

      const comparison = await routesService.getComparison();

      expect(comparison).toBeDefined();
      expect(comparison.length).toBeGreaterThan(0);
    });
  });

  describe("Compliance Service - Edge Cases", () => {
    let complianceService: ComplianceService;
    let mockComplianceRepository: MockComplianceRepository;
    let mockRoutesRepository: MockRoutesRepository;
    let mockBankingRepository: MockBankingRepository;

    beforeEach(() => {
      mockComplianceRepository = new MockComplianceRepository();
      mockRoutesRepository = new MockRoutesRepository();
      mockBankingRepository = new MockBankingRepository();
      complianceService = new ComplianceService(
        mockComplianceRepository,
        mockRoutesRepository,
        mockBankingRepository,
      );
    });

    it("should handle very large compliance balances", async () => {
      const largeCompliance = createCompliance("ship-1", 2025, 1e15);
      await mockComplianceRepository.save(largeCompliance);

      const result = await complianceService.getComplianceBalance(
        "ship-1",
        2025,
      );

      expect(result?.cb_gco2eq).toBe(1e15);
    });

    it("should handle very small compliance balances", async () => {
      const smallCompliance = createCompliance("ship-1", 2025, 0.0001);
      await mockComplianceRepository.save(smallCompliance);

      const result = await complianceService.getComplianceBalance(
        "ship-1",
        2025,
      );

      expect(result?.cb_gco2eq).toBeCloseTo(0.0001, 5);
    });

    it("should handle multiple years of banking", async () => {
      const compliance = createCompliance("ship-1", 2025, 100000);
      await mockComplianceRepository.save(compliance);

      // Add entries from many years
      for (let year = 2020; year <= 2025; year++) {
        const bank = createBankEntry("ship-1", year, 50000 * (year - 2019));
        await mockBankingRepository.save(bank);
      }

      const result = await complianceService.getAdjustedComplianceBalance(
        "ship-1",
        2025,
      );

      // Sum: 100000 + 50000 + 100000 + 150000 + 200000 + 250000 + 300000
      expect(result).toBe(1150000);
    });

    it("should handle zero adjusted compliance balance", async () => {
      const compliance = createCompliance("ship-1", 2025, -100000);
      await mockComplianceRepository.save(compliance);

      const bank = createBankEntry("ship-1", 2025, 100000);
      await mockBankingRepository.save(bank);

      const result = await complianceService.getAdjustedComplianceBalance(
        "ship-1",
        2025,
      );

      expect(result).toBe(0);
    });
  });

  describe("Banking Service - Edge Cases", () => {
    let bankingService: BankingService;
    let mockBankingRepository: MockBankingRepository;
    let mockComplianceRepository: MockComplianceRepository;

    beforeEach(() => {
      mockBankingRepository = new MockBankingRepository();
      mockComplianceRepository = new MockComplianceRepository();
      bankingService = new BankingService(
        mockBankingRepository,
        mockComplianceRepository,
      );
    });

    it("should handle very large banking amounts", async () => {
      const largeCompliance = createCompliance("ship-1", 2025, 1e15);
      await mockComplianceRepository.save(largeCompliance);

      const result = await bankingService.bankComplianceBalance("ship-1", 2025);

      expect(result?.amount_gco2eq).toBe(1e15);
    });

    it("should handle applying small fraction of banked amount", async () => {
      const bank = createBankEntry("ship-1", 2025, 1000000);
      await mockBankingRepository.save(bank);

      const result = await bankingService.applyBankedSurplus(
        "ship-1",
        2025,
        0.0001,
      );

      expect(result?.amount_gco2eq).toBe(-0.0001);
    });

    it("should reject applying exactly zero", async () => {
      const bank = createBankEntry("ship-1", 2025, 500000);
      await mockBankingRepository.save(bank);

      await expect(
        bankingService.applyBankedSurplus("ship-1", 2025, 0),
      ).rejects.toThrow();
    });

    it("should track multiple applications correctly", async () => {
      const bank1 = createBankEntry("ship-1", 2025, 300000);
      const bank2 = createBankEntry("ship-1", 2025, 200000);
      await mockBankingRepository.save(bank1);
      await mockBankingRepository.save(bank2);

      // Total: 500000
      await bankingService.applyBankedSurplus("ship-1", 2025, 100000);
      await bankingService.applyBankedSurplus("ship-1", 2025, 150000);

      const records = await bankingService.getBankRecords("ship-1", 2025);

      expect(records).toHaveLength(4); // 2 original + 2 applications
      const applications = records.filter(
        (r: BankEntry) => r.amount_gco2eq < 0,
      );
      expect(applications).toHaveLength(2);
    });
  });

  describe("Pooling Service - Edge Cases", () => {
    let poolingService: PoolingService;
    let mockPoolingRepository: MockPoolingRepository;
    let mockComplianceRepository: MockComplianceRepository;
    let mockBankingRepository: MockBankingRepository;

    beforeEach(() => {
      mockPoolingRepository = new MockPoolingRepository();
      mockComplianceRepository = new MockComplianceRepository();
      mockBankingRepository = new MockBankingRepository();
      poolingService = new PoolingService(
        mockPoolingRepository,
        mockComplianceRepository,
        mockBankingRepository,
      );
    });

    it("should handle pool with all surplus members", async () => {
      const ship1 = createCompliance("ship-1", 2025, 1000);
      const ship2 = createCompliance("ship-2", 2025, 500);
      const ship3 = createCompliance("ship-3", 2025, 200);

      await mockComplianceRepository.save(ship1);
      await mockComplianceRepository.save(ship2);
      await mockComplianceRepository.save(ship3);

      const members = await poolingService.createPool(2025, [
        "ship-1",
        "ship-2",
        "ship-3",
      ]);

      members.forEach((m: PoolMember) => {
        expect(m.cb_after).toBe(m.cb_before);
      });
    });

    it("should handle pool with one large surplus and many small deficits", async () => {
      const hugeSurplus = createCompliance("ship-surplus", 2025, 100000);
      await mockComplianceRepository.save(hugeSurplus);

      const deficitShips = Array.from({ length: 100 }, (_, i) =>
        createCompliance(`ship-deficit-${i}`, 2025, -100),
      );

      for (const ship of deficitShips) {
        await mockComplianceRepository.save(ship);
      }

      const allShipIds = [
        "ship-surplus",
        ...deficitShips.map((s) => s.ship_id),
      ];
      const members = await poolingService.createPool(2025, allShipIds);

      // All small deficits should be covered
      const deficitMembers = members.filter((m: PoolMember) =>
        m.ship_id.startsWith("ship-deficit"),
      );
      expect(deficitMembers.every((m: PoolMember) => m.cb_after === 0)).toBe(
        true,
      );
    });

    it("should handle pool with many surpluses and few deficits", async () => {
      const ships = [
        createCompliance("ship-1", 2025, 100),
        createCompliance("ship-2", 2025, 200),
        createCompliance("ship-3", 2025, 150),
        createCompliance("ship-4", 2025, -50),
        createCompliance("ship-5", 2025, -100),
      ];

      for (const ship of ships) {
        await mockComplianceRepository.save(ship);
      }

      const members = await poolingService.createPool(
        2025,
        ships.map((s) => s.ship_id),
      );

      // Total: 100 + 200 + 150 - 50 - 100 = 300
      const totalAfter = members.reduce(
        (sum: number, m: PoolMember) => sum + (m.cb_after ?? 0),
        0,
      );
      expect(totalAfter).toBe(300);
    });

    it("should handle zero balance pool", async () => {
      const ship1 = createCompliance("ship-1", 2025, 500);
      const ship2 = createCompliance("ship-2", 2025, -500);

      await mockComplianceRepository.save(ship1);
      await mockComplianceRepository.save(ship2);

      const members = await poolingService.createPool(2025, [
        "ship-1",
        "ship-2",
      ]);

      const totalAfter = members.reduce(
        (sum: number, m: PoolMember) => sum + (m.cb_after ?? 0),
        0,
      );
      expect(totalAfter).toBe(0);

      const surplus = members.find((m: PoolMember) => m.ship_id === "ship-1");
      expect(surplus?.cb_after).toBe(0); // Surplus fully used

      const deficit = members.find((m: PoolMember) => m.ship_id === "ship-2");
      expect(deficit?.cb_after).toBe(0); // Fully covered
    });

    it("should handle pool with floating point precision", async () => {
      const ship1 = createCompliance("ship-1", 2025, 0.3);
      const ship2 = createCompliance("ship-2", 2025, 0.2);
      const ship3 = createCompliance("ship-3", 2025, -0.1);

      await mockComplianceRepository.save(ship1);
      await mockComplianceRepository.save(ship2);
      await mockComplianceRepository.save(ship3);

      const members = await poolingService.createPool(2025, [
        "ship-1",
        "ship-2",
        "ship-3",
      ]);

      const totalBefore = members.reduce(
        (sum: number, m: PoolMember) => sum + m.cb_before,
        0,
      );
      const totalAfter = members.reduce(
        (sum: number, m: PoolMember) => sum + (m.cb_after ?? 0),
        0,
      );

      expect(totalBefore).toBeCloseTo(totalAfter, 10);
    });

    it("should handle member with both CB and banked surplus", async () => {
      const ship1 = createCompliance("ship-1", 2025, 1000);
      const ship2 = createCompliance("ship-2", 2025, -800);

      await mockComplianceRepository.save(ship1);
      await mockComplianceRepository.save(ship2);

      // Ship 1 also has banked surplus
      const banked = createBankEntry("ship-1", 2024, 300);
      await mockBankingRepository.save(banked);

      const members = await poolingService.createPool(2025, [
        "ship-1",
        "ship-2",
      ]);

      // Ship 1 should have cb_before = 1000 + 300 = 1300
      const ship1Member = members.find(
        (m: PoolMember) => m.ship_id === "ship-1",
      );
      expect(ship1Member?.cb_before).toBe(1300);

      // Ship 2 should be fully covered
      const ship2Member = members.find(
        (m: PoolMember) => m.ship_id === "ship-2",
      );
      expect(ship2Member?.cb_after).toBe(0);
    });

    it("should preserve total balance with complex allocation", async () => {
      const shipIds: string[] = [];
      for (let i = 0; i < 50; i++) {
        const cb = Math.sin(i) * 1000; // Mixed surplus and deficit
        const compliance = createCompliance(`ship-${i}`, 2025, cb);
        await mockComplianceRepository.save(compliance);
        shipIds.push(`ship-${i}`);
      }

      const members = await poolingService.createPool(2025, shipIds);

      const totalBefore = members.reduce(
        (sum: number, m: PoolMember) => sum + m.cb_before,
        0,
      );
      const totalAfter = members.reduce(
        (sum: number, m: PoolMember) => sum + (m.cb_after ?? 0),
        0,
      );

      expect(totalAfter).toBeCloseTo(totalBefore, 5);
    });
  });

  describe("Cross-Service Integration Edge Cases", () => {
    let complianceService: ComplianceService;
    let bankingService: BankingService;
    let mockComplianceRepository: MockComplianceRepository;
    let mockBankingRepository: MockBankingRepository;
    let mockRoutesRepository: MockRoutesRepository;

    beforeEach(() => {
      mockComplianceRepository = new MockComplianceRepository();
      mockBankingRepository = new MockBankingRepository();
      mockRoutesRepository = new MockRoutesRepository();

      const baseline = createRoute("baseline", 89.3368, true);
      mockRoutesRepository.setRoutes([baseline]);

      complianceService = new ComplianceService(
        mockComplianceRepository,
        mockRoutesRepository,
        mockBankingRepository,
      );

      bankingService = new BankingService(
        mockBankingRepository,
        mockComplianceRepository,
      );
    });

    it("should handle bank and apply cycle correctly", async () => {
      const compliance = createCompliance("ship-1", 2025, 1000);
      await mockComplianceRepository.save(compliance);

      // Bank the compliance
      const banked = await bankingService.bankComplianceBalance("ship-1", 2025);
      expect(banked?.amount_gco2eq).toBe(1000);

      // Check adjusted CB
      const adjusted = await complianceService.getAdjustedComplianceBalance(
        "ship-1",
        2025,
      );
      expect(adjusted).toBe(2000); // 1000 (original) + 1000 (banked)

      // Apply part of the banked
      await bankingService.applyBankedSurplus("ship-1", 2025, 600);

      // Check records
      const records = await bankingService.getBankRecords("ship-1", 2025);
      expect(records).toHaveLength(2); // Original bank + application
    });

    it("should handle cascading operations", async () => {
      const compliance = createCompliance("ship-1", 2025, 5000);
      await mockComplianceRepository.save(compliance);

      // Bank the initial compliance
      await bankingService.bankComplianceBalance("ship-1", 2025);

      // Bank and apply multiple times
      for (let i = 0; i < 5; i++) {
        const currentCB = await complianceService.getAdjustedComplianceBalance(
          "ship-1",
          2025,
        );

        if (currentCB && currentCB > 1000) {
          await bankingService.applyBankedSurplus("ship-1", 2025, 1000);
        }
      }

      const records = await bankingService.getBankRecords("ship-1", 2025);
      expect(records.length).toBeGreaterThan(0);
    });
  });
});
