import { BankingService } from "core/application/banking_service";
import {
  MockBankingRepository,
  MockComplianceRepository,
} from "tests/mocks/mock-repositories";
import {
  COMPLIANCE_POSITIVE,
  COMPLIANCE_NEGATIVE,
  COMPLIANCE_ZERO,
  BANK_ENTRY_POSITIVE,
  BANK_ENTRY_NEGATIVE,
  createCompliance,
  createBankEntry,
} from "tests/fixtures/test-data";
import { BankEntry } from "core/domain/bank_entry";

describe("BankingService", () => {
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

  describe("getBankRecords", () => {
    it("should return all bank records for a ship and year", async () => {
      await mockBankingRepository.save(BANK_ENTRY_POSITIVE);
      await mockBankingRepository.save(BANK_ENTRY_NEGATIVE);

      const records = await bankingService.getBankRecords("ship-1", 2025);

      expect(records).toHaveLength(2);
      expect(records).toContainEqual(BANK_ENTRY_POSITIVE);
      expect(records).toContainEqual(BANK_ENTRY_NEGATIVE);
    });

    it("should return empty array when no records exist", async () => {
      const records = await bankingService.getBankRecords("non-existent", 2025);

      expect(records).toHaveLength(0);
    });

    it("should filter records by ship and year", async () => {
      const ship1Bank = createBankEntry("ship-1", 2025, 100000);
      const ship2Bank = createBankEntry("ship-2", 2025, 200000);
      const ship1Bank2026 = createBankEntry("ship-1", 2026, 150000);

      await mockBankingRepository.save(ship1Bank);
      await mockBankingRepository.save(ship2Bank);
      await mockBankingRepository.save(ship1Bank2026);

      const records = await bankingService.getBankRecords("ship-1", 2025);

      expect(records).toHaveLength(1);
      expect(records[0]).toEqual(ship1Bank);
    });
  });

  describe("bankComplianceBalance", () => {
    it("should bank positive compliance balance", async () => {
      await mockComplianceRepository.save(COMPLIANCE_POSITIVE);

      const result = await bankingService.bankComplianceBalance("ship-1", 2025);

      expect(result).not.toBeNull();
      expect(result?.ship_id).toBe("ship-1");
      expect(result?.year).toBe(2025);
      expect(result?.amount_gco2eq).toBe(1000000);
    });

    it("should save banked entry to repository", async () => {
      await mockComplianceRepository.save(COMPLIANCE_POSITIVE);

      await bankingService.bankComplianceBalance("ship-1", 2025);

      const records = await mockBankingRepository.findByShipIdAndYear(
        "ship-1",
        2025,
      );
      expect(records).toHaveLength(1);
      expect(records[0]!.amount_gco2eq).toBe(1000000);
    });

    it("should return null for negative compliance balance", async () => {
      await mockComplianceRepository.save(COMPLIANCE_NEGATIVE);

      const result = await bankingService.bankComplianceBalance("ship-2", 2025);

      expect(result).toBeNull();
    });

    it("should return null for zero compliance balance", async () => {
      await mockComplianceRepository.save(COMPLIANCE_ZERO);

      const result = await bankingService.bankComplianceBalance("ship-3", 2025);

      expect(result).toBeNull();
    });

    it("should return null if compliance not found", async () => {
      const result = await bankingService.bankComplianceBalance(
        "non-existent",
        2025,
      );

      expect(result).toBeNull();
    });
  });

  describe("applyBankedSurplus", () => {
    beforeEach(async () => {
      // Setup: bank some surplus
      const bank1 = createBankEntry("ship-1", 2025, 500000);
      const bank2 = createBankEntry("ship-1", 2025, 300000);
      await mockBankingRepository.save(bank1);
      await mockBankingRepository.save(bank2);
      // Total banked: 800000
    });

    it("should apply valid banked surplus amount", async () => {
      const result = await bankingService.applyBankedSurplus(
        "ship-1",
        2025,
        200000,
      );

      expect(result).not.toBeNull();
      expect(result?.amount_gco2eq).toBe(-200000); // Negative to indicate application
      expect(result?.ship_id).toBe("ship-1");
    });

    it("should save applied entry to repository", async () => {
      await bankingService.applyBankedSurplus("ship-1", 2025, 100000);

      const records = await mockBankingRepository.findByShipIdAndYear(
        "ship-1",
        2025,
      );

      const appliedEntry = records.find((r: BankEntry) => r.amount_gco2eq < 0);
      expect(appliedEntry).toBeDefined();
      expect(appliedEntry?.amount_gco2eq).toBe(-100000);
    });

    it("should throw error when applying zero amount", async () => {
      await expect(
        bankingService.applyBankedSurplus("ship-1", 2025, 0),
      ).rejects.toThrow(
        "Invalid amount to apply or insufficient banked surplus.",
      );
    });

    it("should throw error when applying negative amount", async () => {
      await expect(
        bankingService.applyBankedSurplus("ship-1", 2025, -100000),
      ).rejects.toThrow(
        "Invalid amount to apply or insufficient banked surplus.",
      );
    });

    it("should throw error when applying more than available", async () => {
      await expect(
        bankingService.applyBankedSurplus("ship-1", 2025, 900000),
      ).rejects.toThrow(
        "Invalid amount to apply or insufficient banked surplus.",
      );
    });

    it("should allow applying exact total banked amount", async () => {
      const result = await bankingService.applyBankedSurplus(
        "ship-1",
        2025,
        800000,
      );

      expect(result).not.toBeNull();
      expect(result?.amount_gco2eq).toBe(-800000);
    });

    it("should throw error when no surplus is banked", async () => {
      await expect(
        bankingService.applyBankedSurplus("ship-2", 2025, 100000),
      ).rejects.toThrow(
        "Invalid amount to apply or insufficient banked surplus.",
      );
    });

    it("should consider bank entries across multiple years", async () => {
      const bank2024 = createBankEntry("ship-2", 2024, 600000);
      await mockBankingRepository.save(bank2024);

      // Ship-2 now has 600000 banked from 2024
      const result = await bankingService.applyBankedSurplus(
        "ship-2",
        2024,
        600000,
      );

      expect(result).not.toBeNull();
      expect(result?.amount_gco2eq).toBe(-600000);
    });
  });
});
