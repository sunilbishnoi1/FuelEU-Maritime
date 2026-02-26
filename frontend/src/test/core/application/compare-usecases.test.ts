import { FetchComparison } from '../../../core/application/compare-usecases';
import type { Route } from '../../../core/domain/entities';
import type { RouteRepository } from '../../../core/ports/outbound';

describe('FetchComparison UseCase', () => {
    it('should call getComparisonData on the repository and return baseline and comparison routes', async () => {
        const mockBaseline: Route[] = [
            { id: '1', routeId: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500, isBaseline: true },
        ];
        const mockComparison: Route[] = [
            { id: '2', routeId: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200, isBaseline: false },
        ];

        const mockRepository = {
            getRoutes: vi.fn(),
            setBaseline: vi.fn(),
            getComparisonData: vi.fn().mockResolvedValue({ baseline: mockBaseline, comparison: mockComparison }),
        } as unknown as RouteRepository;

        const fetchComparison = new FetchComparison(mockRepository);

        const result = await fetchComparison.execute();

        expect(mockRepository.getComparisonData).toHaveBeenCalled();
        expect(result).toEqual({ baseline: mockBaseline, comparison: mockComparison });
    });
});
