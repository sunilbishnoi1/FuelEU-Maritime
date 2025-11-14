import { PoolingService } from "core/application/pooling_service";
import {
  MockPoolingRepository,
  MockComplianceRepository,
  MockBankingRepository,
} from "tests/mocks/mock-repositories";
import { createCompliance, createBankEntry } from "tests/fixtures/test-data";
import { PoolMember } from "core/domain/pool_member";

describe("PoolingService", () => {
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

  describe("createPool", () => {
    it("should create a pool with provided year and ship IDs", async () => {
      // Setup: ships with compliance balances
      const ship1Compliance = createCompliance("ship-1", 2025, 1000000); // Surplus
      const ship2Compliance = createCompliance("ship-2", 2025, -500000); // Deficit
      await mockComplianceRepository.save(ship1Compliance);
      await mockComplianceRepository.save(ship2Compliance);

      const members = await poolingService.createPool(2025, [
        "ship-1",
        "ship-2",
      ]);

      expect(members).toHaveLength(2);
      expect(mockPoolingRepository.getPools()).toHaveLength(1);
      expect(mockPoolingRepository.getPools()[0]!.year).toBe(2025);
    });

    it("should validate that total CB is non-negative", async () => {
      const ship1Compliance = createCompliance("ship-1", 2025, -1000000);
      const ship2Compliance = createCompliance("ship-2", 2025, -500000);
      await mockComplianceRepository.save(ship1Compliance);
      await mockComplianceRepository.save(ship2Compliance);

      await expect(
        poolingService.createPool(2025, ["ship-1", "ship-2"]),
      ).rejects.toThrow(
        "Total compliance balance of pool members cannot be negative.",
      );
    });

    it("should allocate surplus to deficits (greedy algorithm)", async () => {
      // Ship 1: +1000, Ship 2: -500, Ship 3: +200, Ship 4: -400
      // Total: 300 (positive)
      const ship1 = createCompliance("ship-1", 2025, 1000);
      const ship2 = createCompliance("ship-2", 2025, -500);
      const ship3 = createCompliance("ship-3", 2025, 200);
      const ship4 = createCompliance("ship-4", 2025, -400);

      await mockComplianceRepository.save(ship1);
      await mockComplianceRepository.save(ship2);
      await mockComplianceRepository.save(ship3);
      await mockComplianceRepository.save(ship4);

      const members = await poolingService.createPool(2025, [
        "ship-1",
        "ship-2",
        "ship-3",
        "ship-4",
      ]);

      // Sorted by CB desc: ship1(1000), ship3(200), ship4(-400), ship2(-500)
      // Allocation:
      // ship1: 1000 -> surplus available = 1000
      // ship3: 200 -> surplus available = 1200
      // ship4: -400 -> covered by surplus -> cb_after = 0, surplus = 800
      // ship2: -500 -> covered by surplus -> cb_after = -300, surplus = 0

      const ship1Member = members.find(
        (m: PoolMember) => m.ship_id === "ship-1",
      );
      const ship3Member = members.find(
        (m: PoolMember) => m.ship_id === "ship-3",
      );
      const ship4Member = members.find(
        (m: PoolMember) => m.ship_id === "ship-4",
      );
      const ship2Member = members.find(
        (m: PoolMember) => m.ship_id === "ship-2",
      );

      expect(ship1Member?.cb_after).toBe(100); // Surplus reduced
      expect(ship3Member?.cb_after).toBe(200); // Surplus stays
      expect(ship4Member?.cb_after).toBe(0); // Deficit covered
      expect(ship2Member?.cb_after).toBe(0); // Deficit covered
    });

    it("should handle all surplus case", async () => {
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
        expect(m.cb_after).toBe(m.cb_before); // No changes as all positive
      });
    });

    it("should handle exact balance pool", async () => {
      const ship1 = createCompliance("ship-1", 2025, 1000);
      const ship2 = createCompliance("ship-2", 2025, -1000);

      await mockComplianceRepository.save(ship1);
      await mockComplianceRepository.save(ship2);

      const members = await poolingService.createPool(2025, [
        "ship-1",
        "ship-2",
      ]);

      const surplus = members.find((m: PoolMember) => m.ship_id === "ship-1");
      const deficit = members.find((m: PoolMember) => m.ship_id === "ship-2");

      expect(surplus?.cb_after).toBe(0); // Surplus fully used
      expect(deficit?.cb_after).toBe(0); // Fully covered
    });

    it("should enforce: deficit ship cannot exit worse", async () => {
      const ship1 = createCompliance("ship-1", 2025, 100); // Small surplus
      const ship2 = createCompliance("ship-2", 2025, -500); // Large deficit

      await mockComplianceRepository.save(ship1);
      await mockComplianceRepository.save(ship2);

      await expect(
        poolingService.createPool(2025, ["ship-1", "ship-2"]),
      ).rejects.toThrow(
        "Total compliance balance of pool members cannot be negative.",
      );
    });

    it("should consider banked surplus in calculations", async () => {
      const ship1 = createCompliance("ship-1", 2025, 500);
      const ship2 = createCompliance("ship-2", 2025, -300);

      await mockComplianceRepository.save(ship1);
      await mockComplianceRepository.save(ship2);

      // Ship 1 also has banked surplus from previous years
      const banked = createBankEntry("ship-1", 2024, 200);
      await mockBankingRepository.save(banked);

      const members = await poolingService.createPool(2025, [
        "ship-1",
        "ship-2",
      ]);

      // Ship1 cb_before should include banked: 500 + 200 = 700
      const ship1Member = members.find(
        (m: PoolMember) => m.ship_id === "ship-1",
      );
      expect(ship1Member?.cb_before).toBe(700);
    });

    it("should handle single ship pool", async () => {
      const ship1 = createCompliance("ship-1", 2025, 500);
      await mockComplianceRepository.save(ship1);

      const members = await poolingService.createPool(2025, ["ship-1"]);

      expect(members).toHaveLength(1);
      expect(members[0]!.cb_before).toBe(500);
      expect(members[0]!.cb_after).toBe(500);
    });

    it("should save all pool members to repository", async () => {
      const ship1 = createCompliance("ship-1", 2025, 1000);
      const ship2 = createCompliance("ship-2", 2025, -500);

      await mockComplianceRepository.save(ship1);
      await mockComplianceRepository.save(ship2);

      await poolingService.createPool(2025, ["ship-1", "ship-2"]);

      const allMembers = mockPoolingRepository.getAll();
      expect(allMembers).toHaveLength(2);
    });

    it("should handle multiple deficits and surplus case", async () => {
      // Total pool: +1500 (surplus to distribute)
      const ship1 = createCompliance("ship-1", 2025, 1000); // Surplus
      const ship2 = createCompliance("ship-2", 2025, 500); // Surplus
      const ship3 = createCompliance("ship-3", 2025, -400); // Deficit
      const ship4 = createCompliance("ship-4", 2025, -300); // Deficit
      const ship5 = createCompliance("ship-5", 2025, -200); // Deficit

      await mockComplianceRepository.save(ship1);
      await mockComplianceRepository.save(ship2);
      await mockComplianceRepository.save(ship3);
      await mockComplianceRepository.save(ship4);
      await mockComplianceRepository.save(ship5);

      const members = await poolingService.createPool(2025, [
        "ship-1",
        "ship-2",
        "ship-3",
        "ship-4",
        "ship-5",
      ]);

      // All deficits should be at least partially covered
      const allDeficitsImproved = members
        .filter((m: PoolMember) => m.cb_before < 0)
        .every((m: PoolMember) => m.cb_after! >= m.cb_before);

      expect(allDeficitsImproved).toBe(true);
    });

    it("should maintain total CB balance", async () => {
      const ship1 = createCompliance("ship-1", 2025, 1500);
      const ship2 = createCompliance("ship-2", 2025, -400);
      const ship3 = createCompliance("ship-3", 2025, -300);

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

      expect(totalBefore).toBe(800); // 1500 - 400 - 300
      expect(totalAfter).toBe(800); // Should remain the same
    });
  });
});
