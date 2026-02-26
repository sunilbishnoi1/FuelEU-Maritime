import { ComplianceService } from "core/application/compliance_service";
import {
  MockComplianceRepository,
  MockRoutesRepository,
  MockBankingRepository,
  MockShipRepository,
} from "tests/mocks/mock-repositories";
import {
  BASELINE_ROUTE,
  ROUTE_2,
  COMPLIANCE_POSITIVE,
  createCompliance,
  createBankEntry,
  createRoute,
} from "tests/fixtures/test-data";
import {
  TARGET_INTENSITY_2025,
  ENERGY_CONVERSION_FACTOR,
} from "shared/constants";

describe("ComplianceService", () => {
  let complianceService: ComplianceService;
  let mockComplianceRepository: MockComplianceRepository;
  let mockRoutesRepository: MockRoutesRepository;
  let mockBankingRepository: MockBankingRepository;
  let mockShipRepository: MockShipRepository;

  beforeEach(() => {
    mockComplianceRepository = new MockComplianceRepository();
    mockRoutesRepository = new MockRoutesRepository();
    mockBankingRepository = new MockBankingRepository();
    mockShipRepository = new MockShipRepository();
    complianceService = new ComplianceService(
      mockComplianceRepository,
      mockRoutesRepository,
      mockBankingRepository,
      mockShipRepository,
    );
  });

  describe("getComplianceBalance", () => {
    it("should return cached compliance if it exists", async () => {
      await mockComplianceRepository.save(COMPLIANCE_POSITIVE);

      const result = await complianceService.getComplianceBalance(
        "ship-1",
        2025,
      );

      expect(result).not.toBeNull();
      expect(result?.cb_gco2eq).toBe(1000000);
    });

    it("should compute and return new compliance balance using route fuel_consumption", async () => {
      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      const result = await complianceService.getComplianceBalance(
        "route-1",
        2025,
      );

      expect(result).not.toBeNull();
      expect(result?.ship_id).toBe("route-1");
      expect(result?.year).toBe(2025);

      // C1: Using route.fuel_consumption (5000) instead of hardcoded 1000
      const expectedEnergy =
        BASELINE_ROUTE.fuel_consumption * ENERGY_CONVERSION_FACTOR;
      const expectedCb =
        (TARGET_INTENSITY_2025 - BASELINE_ROUTE.ghg_intensity) * expectedEnergy;
      expect(result?.cb_gco2eq).toBeCloseTo(expectedCb, 0);
    });

    it("should calculate negative CB for high-intensity routes", async () => {
      const highIntensityRoute = {
        ...ROUTE_2,
        ghg_intensity: 95.0,
      };
      mockRoutesRepository.setRoutes([highIntensityRoute]);

      const result = await complianceService.getComplianceBalance(
        "route-2",
        2025,
      );

      // C1: Using route.fuel_consumption (4800) instead of hardcoded 1000
      const expectedEnergy =
        highIntensityRoute.fuel_consumption * ENERGY_CONVERSION_FACTOR;
      const expectedCb = (TARGET_INTENSITY_2025 - 95.0) * expectedEnergy;
      expect(result?.cb_gco2eq).toBeCloseTo(expectedCb, 0);
      expect(result?.cb_gco2eq).toBeLessThan(0); // Deficit
    });

    it("should produce proportional CB for different fuel_consumption values", async () => {
      const routeA = createRoute("rA", 85.0, false, "Container", "HFO", 2000);
      const routeB = createRoute("rB", 85.0, false, "Container", "HFO", 4000);
      mockRoutesRepository.setRoutes([routeA, routeB]);

      const resultA = await complianceService.getComplianceBalance("rA", 2025);
      const resultB = await complianceService.getComplianceBalance("rB", 2025);

      expect(resultA).not.toBeNull();
      expect(resultB).not.toBeNull();
      // CB should be proportional to fuel_consumption (4000/2000 = 2x)
      expect(resultB!.cb_gco2eq).toBeCloseTo(resultA!.cb_gco2eq * 2, 0);
    });

    it("should match manual calculation", async () => {
      const route = createRoute(
        "manual",
        91.0,
        false,
        "Container",
        "HFO",
        3000,
      );
      mockRoutesRepository.setRoutes([route]);

      const result = await complianceService.getComplianceBalance(
        "manual",
        2025,
      );

      // Manual: (89.3368 - 91.0) * 3000 * 41000 = -1.6632 * 123000000 = -204573600
      const expectedCb = (89.3368 - 91.0) * 3000 * 41000;
      expect(result).not.toBeNull();
      expect(result!.cb_gco2eq).toBeCloseTo(expectedCb, 0);
    });

    it("should save computed compliance to repository", async () => {
      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      const result = await complianceService.getComplianceBalance(
        "route-1",
        2025,
      );

      const saved = await mockComplianceRepository.findByShipIdAndYear(
        "route-1",
        2025,
      );
      expect(saved).not.toBeNull();
      expect(saved?.cb_gco2eq).toBe(result?.cb_gco2eq);
    });

    it("should return null if route not found", async () => {
      mockRoutesRepository.setRoutes([]);

      const result = await complianceService.getComplianceBalance(
        "non-existent",
        2025,
      );

      expect(result).toBeNull();
    });
  });

  describe("getAdjustedComplianceBalance", () => {
    it("should return CB plus total banked amount", async () => {
      const compliance = createCompliance("ship-1", 2025, 1000000);
      await mockComplianceRepository.save(compliance);

      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      const bank1 = createBankEntry("ship-1", 2025, 500000);
      const bank2 = createBankEntry("ship-1", 2025, 300000);
      await mockBankingRepository.save(bank1);
      await mockBankingRepository.save(bank2);

      const result = await complianceService.getAdjustedComplianceBalance(
        "ship-1",
        2025,
      );

      // Should be 1000000 + (500000 + 300000) = 1800000
      expect(result).toBe(1800000);
    });

    it("should handle zero banked amount", async () => {
      const compliance = createCompliance("ship-1", 2025, 500000);
      await mockComplianceRepository.save(compliance);
      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      const result = await complianceService.getAdjustedComplianceBalance(
        "ship-1",
        2025,
      );

      expect(result).toBe(500000);
    });

    it("should handle negative compliance balance with positive banked", async () => {
      const compliance = createCompliance("ship-1", 2025, -200000);
      await mockComplianceRepository.save(compliance);
      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      const bank = createBankEntry("ship-1", 2025, 300000);
      await mockBankingRepository.save(bank);

      const result = await complianceService.getAdjustedComplianceBalance(
        "ship-1",
        2025,
      );

      // -200000 + 300000 = 100000
      expect(result).toBe(100000);
    });

    it("should return null if compliance not found", async () => {
      mockRoutesRepository.setRoutes([]);

      const result = await complianceService.getAdjustedComplianceBalance(
        "non-existent",
        2025,
      );

      expect(result).toBeNull();
    });

    it("should consider bank entries from previous years", async () => {
      const compliance = createCompliance("ship-1", 2025, 100000);
      await mockComplianceRepository.save(compliance);
      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      const bank2024 = createBankEntry("ship-1", 2024, 200000);
      const bank2025 = createBankEntry("ship-1", 2025, 150000);
      await mockBankingRepository.save(bank2024);
      await mockBankingRepository.save(bank2025);

      const result = await complianceService.getAdjustedComplianceBalance(
        "ship-1",
        2025,
      );

      // Should include both 2024 and 2025 entries: 100000 + 200000 + 150000 = 450000
      expect(result).toBe(450000);
    });
  });

  describe("getAdjustedComplianceBalanceForAllShips", () => {
    it("should return adjusted CB for all ships", async () => {
      // Setup ships in mock
      mockShipRepository.setShips([
        { id: "ship-001", name: "Ship A", route_id: "route-1" },
        { id: "ship-002", name: "Ship B", route_id: "route-2" },
      ]);

      const compliance1 = createCompliance("ship-001", 2025, 500000);
      const compliance2 = createCompliance("ship-002", 2025, -200000);
      await mockComplianceRepository.save(compliance1);
      await mockComplianceRepository.save(compliance2);

      const bank = createBankEntry("ship-001", 2025, 100000);
      await mockBankingRepository.save(bank);

      mockRoutesRepository.setRoutes([BASELINE_ROUTE, ROUTE_2]);

      const results =
        await complianceService.getAdjustedComplianceBalanceForAllShips(2025);

      expect(results).toHaveLength(2);
      const ship1Result = results.find((r) => r.shipId === "ship-001");
      expect(ship1Result?.adjustedCb).toBe(600000); // 500000 + 100000
      const ship2Result = results.find((r) => r.shipId === "ship-002");
      expect(ship2Result?.adjustedCb).toBe(-200000); // -200000 + 0
    });
  });
});
