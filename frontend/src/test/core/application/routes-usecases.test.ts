import { FetchRoutes, SetBaseline } from '../../../core/application/routes-usecases';
import type { RouteRepository } from '../../../core/ports/outbound';
import type { Route, RouteFilters } from '../../../core/domain/entities';

describe('FetchRoutes UseCase', () => {
    it('should call getRoutes on the repository and return the results', async () => {
        const mockRoutes: Route[] = [
            { id: '1', routeId: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500, isBaseline: false },
        ];
        const mockRepository: RouteRepository = {
            getRoutes: vi.fn().mockResolvedValue(mockRoutes),
            setBaseline: vi.fn(),
            getComparisonData: vi.fn(),
        };

        const fetchRoutes = new FetchRoutes(mockRepository);
        const filters: RouteFilters = { year: 2024 };

        const result = await fetchRoutes.execute(filters);

        expect(mockRepository.getRoutes).toHaveBeenCalledWith(filters);
        expect(result).toEqual(mockRoutes);
    });
});

describe('SetBaseline UseCase', () => {
    it('should call setBaseline on the repository with the correct id', async () => {
        const mockRepository: RouteRepository = {
            getRoutes: vi.fn(),
            setBaseline: vi.fn().mockResolvedValue(undefined),
            getComparisonData: vi.fn(),
        };

        const setBaseline = new SetBaseline(mockRepository);
        const routeId = 'R001';

        await setBaseline.execute(routeId);

        expect(mockRepository.setBaseline).toHaveBeenCalledWith(routeId);
    });
});
