import { ComplianceService } from "core/application/compliance_service";
import {
  MockComplianceRepository,
  MockRoutesRepository,
  MockBankingRepository,
  MockShipRepository, // New import
} from "tests/mocks/mock-repositories";
import {
  BASELINE_ROUTE,
  ROUTE_2,
  COMPLIANCE_POSITIVE,
  COMPLIANCE_NEGATIVE,
  BANK_ENTRY_POSITIVE,
  BANK_ENTRY_NEGATIVE,
  createCompliance,
  createBankEntry,
} from "tests/fixtures/test-data";

describe("ComplianceService", () => {
  let complianceService: ComplianceService;
  let mockComplianceRepository: MockComplianceRepository;
  let mockRoutesRepository: MockRoutesRepository;
  let mockBankingRepository: MockBankingRepository;
  let mockShipRepository: MockShipRepository; // New declaration

  beforeEach(() => {
    mockComplianceRepository = new MockComplianceRepository();
    mockRoutesRepository = new MockRoutesRepository();
    mockBankingRepository = new MockBankingRepository();
    mockShipRepository = new MockShipRepository(); // New instantiation
    complianceService = new ComplianceService(
      mockComplianceRepository,
      mockRoutesRepository,
      mockBankingRepository,
      mockShipRepository, // New argument
    );
  });

  describe("getComplianceBalance", () => {
    const targetIntensity = 89.3368; // gCO₂e/MJ
    const fuelConsumption = 1000; // tonnes
    const energyInScope = fuelConsumption * 41000; // MJ

    it("should return cached compliance if it exists", async () => {
      await mockComplianceRepository.save(COMPLIANCE_POSITIVE);

      const result = await complianceService.getComplianceBalance(
        "ship-1",
        2025,
      );

      expect(result).not.toBeNull();
      expect(result?.cb_gco2eq).toBe(1000000);
    });

    it("should compute and return new compliance balance if not cached", async () => {
      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      const result = await complianceService.getComplianceBalance(
        "route-1",
        2025,
      );

      expect(result).not.toBeNull();
      expect(result?.ship_id).toBe("route-1");
      expect(result?.year).toBe(2025);

      // Expected CB = (89.3368 - 89.3368) * 41000000 = 0
      const expectedCb =
        (targetIntensity - BASELINE_ROUTE.ghg_intensity) * energyInScope;
      expect(result?.cb_gco2eq).toBeCloseTo(expectedCb, 0);
    });

    it("should calculate positive CB for compliant routes", async () => {
      const highIntensityRoute = {
        ...ROUTE_2,
        ghg_intensity: 95.0,
      };
      mockRoutesRepository.setRoutes([highIntensityRoute]);

      const result = await complianceService.getComplianceBalance(
        "route-2",
        2025,
      );

      // Expected CB = (89.3368 - 95.0) * 41000000 = negative
      const expectedCb = (targetIntensity - 95.0) * energyInScope;
      expect(result?.cb_gco2eq).toBeCloseTo(expectedCb, 0);
      expect(result?.cb_gco2eq).toBeLessThan(0); // Deficit
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

      // Mock route for CB calculation
      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      // Add banked entries
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

      // Add bank entries from different years
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
});
