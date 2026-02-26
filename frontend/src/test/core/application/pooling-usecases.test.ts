import { FetchAdjustedComplianceBalance, CreatePool } from '../../../core/application/pooling-usecases';
import type { AdjustedCompliance, Pool, PoolCreationRequest } from '../../../core/domain/entities';
import type { ComplianceRepository } from '../../../core/ports/outbound';

describe('FetchAdjustedComplianceBalance UseCase', () => {
    it('should call getAdjustedComplianceBalance and return results', async () => {
        const mockAdjusted: AdjustedCompliance[] = [
            { ship_id: 'S001', year: 2024, adjusted_cb_gco2eq: -100 }
        ];

        const mockRepository = {
            getComplianceBalance: vi.fn(),
            getAdjustedComplianceBalance: vi.fn().mockResolvedValue(mockAdjusted),
            bankSurplus: vi.fn(),
            applyBankedCredit: vi.fn(),
            createPool: vi.fn(),
        } as unknown as ComplianceRepository;

        const fetchAdjusted = new FetchAdjustedComplianceBalance(mockRepository);
        const year = 2024;

        const result = await fetchAdjusted.execute(year);

        expect(mockRepository.getAdjustedComplianceBalance).toHaveBeenCalledWith(year);
        expect(result).toEqual(mockAdjusted);
    });
});

describe('CreatePool UseCase', () => {
    it('should call createPool and return the resulting pool', async () => {
        const mockPool: Pool = {
            id: 'p1',
            year: 2024,
            members: [],
            poolSum: 0,
            isValid: true
        };

        const mockRequest: PoolCreationRequest = {
            year: 2024,
            member_ship_ids: ['S001', 'S002']
        };

        const mockRepository = {
            getComplianceBalance: vi.fn(),
            getAdjustedComplianceBalance: vi.fn(),
            bankSurplus: vi.fn(),
            applyBankedCredit: vi.fn(),
            createPool: vi.fn().mockResolvedValue(mockPool),
        } as unknown as ComplianceRepository;

        const createPool = new CreatePool(mockRepository);

        const result = await createPool.execute(mockRequest);

        expect(mockRepository.createPool).toHaveBeenCalledWith(mockRequest);
        expect(result).toEqual(mockPool);
    });
});
