import { FetchComplianceBalance, BankSurplus, ApplyBankedCredit } from '../../../core/application/banking-usecases';
import type { ComplianceBalance, BankingSummary } from '../../../core/domain/entities';
import type { ComplianceRepository } from '../../../core/ports/outbound';

describe('FetchComplianceBalance UseCase', () => {
    it('should call getComplianceBalance on the repository and return the result', async () => {
        const mockBalance: ComplianceBalance = {
            year: 2024,
            cb_before: 1000,
            applied: 0,
            cb_after: 1000,
            transactions: [],
        };

        const mockRepository = {
            getComplianceBalance: vi.fn().mockResolvedValue(mockBalance),
            getAdjustedComplianceBalance: vi.fn(),
            bankSurplus: vi.fn(),
            applyBankedCredit: vi.fn(),
            createPool: vi.fn(),
        } as unknown as ComplianceRepository;

        const fetchBalance = new FetchComplianceBalance(mockRepository);
        const shipId = 'S001';
        const year = 2024;

        const result = await fetchBalance.execute(shipId, year);

        expect(mockRepository.getComplianceBalance).toHaveBeenCalledWith(shipId, year);
        expect(result).toEqual(mockBalance);
    });
});

describe('BankSurplus UseCase', () => {
    it('should call bankSurplus on the repository and return the summary', async () => {
        const mockSummary: BankingSummary = {
            year: 2024,
            cb_before: 1000,
            applied: 0,
            cb_after: 500,
        };

        const mockRepository = {
            getComplianceBalance: vi.fn(),
            getAdjustedComplianceBalance: vi.fn(),
            bankSurplus: vi.fn().mockResolvedValue(mockSummary),
            applyBankedCredit: vi.fn(),
            createPool: vi.fn(),
        } as unknown as ComplianceRepository;

        const bankSurplus = new BankSurplus(mockRepository);
        const shipId = 'S001';
        const year = 2024;

        const result = await bankSurplus.execute(shipId, year);

        expect(mockRepository.bankSurplus).toHaveBeenCalledWith(shipId, year);
        expect(result).toEqual(mockSummary);
    });
});

describe('ApplyBankedCredit UseCase', () => {
    it('should call applyBankedCredit on the repository and return the summary', async () => {
        const mockSummary: BankingSummary = {
            year: 2024,
            cb_before: -1000,
            applied: 500,
            cb_after: -500,
        };

        const mockRepository = {
            getComplianceBalance: vi.fn(),
            getAdjustedComplianceBalance: vi.fn(),
            bankSurplus: vi.fn(),
            applyBankedCredit: vi.fn().mockResolvedValue(mockSummary),
            createPool: vi.fn(),
        } as unknown as ComplianceRepository;

        const applyBankedCredit = new ApplyBankedCredit(mockRepository);
        const shipId = 'S001';
        const year = 2024;
        const amount = 500;

        const result = await applyBankedCredit.execute(shipId, year, amount);

        expect(mockRepository.applyBankedCredit).toHaveBeenCalledWith(shipId, year, amount);
        expect(result).toEqual(mockSummary);
    });
});
