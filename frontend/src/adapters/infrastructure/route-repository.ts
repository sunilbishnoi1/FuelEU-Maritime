import type { RouteRepository } from '../../core/ports/outbound';
import type { Route, RouteFilters } from '../../core/domain/entities';
import type { ApiRoute } from '../../types';
import { routesApi } from './api-client';

function mapApiRouteToDomain(apiRoute: ApiRoute): Route {
  return {
    id: apiRoute.id,
    routeId: apiRoute.route_id,
    vesselType: apiRoute.vessel_type,
    fuelType: apiRoute.fuel_type,
    isBaseline: apiRoute.is_baseline,
    ghgIntensity: Number(apiRoute.ghg_intensity) || 0,
    fuelConsumption: Number(apiRoute.fuel_consumption),
    distance: Number(apiRoute.distance),
    totalEmissions: Number(apiRoute.total_emissions),
    year: apiRoute.year,
  };
}

export class ApiRouteRepository implements RouteRepository {
  async getRoutes(filters?: RouteFilters): Promise<Route[]> {
    const apiRoutes = await routesApi.getAllRoutes(filters);
    const routes = apiRoutes.map(mapApiRouteToDomain);

    // Apply client-side filtering as fallback if backend doesn't filter
    if (!filters) return routes;

    return routes.filter((route) => {
      if (filters.vesselType && route.vesselType !== filters.vesselType) return false;
      if (filters.fuelType && route.fuelType !== filters.fuelType) return false;
      if (filters.year && route.year !== filters.year) return false;
      return true;
    });
  }

  async setBaseline(id: string): Promise<void> {
    await routesApi.setRouteAsBaseline(id);
  }

  async getComparisonData(): Promise<{ baseline: Route[]; comparison: Route[] }> {
    const apiRoutes = await routesApi.getComparison();
    const baseline: Route[] = [];
    const comparison: Route[] = [];

    for (const apiRoute of apiRoutes) {
      const domainRoute = mapApiRouteToDomain(apiRoute);
      if (apiRoute.is_baseline) {
        baseline.push(domainRoute);
      } else {
        comparison.push(domainRoute);
      }
    }

    return { baseline, comparison };
  }
}
