import { type Route } from "../domain/route";
import { type RoutesRepository } from "../ports/routes_repository";

export class RoutesService {
  constructor(private routesRepository: RoutesRepository) {}

  async getAllRoutes(): Promise<Route[]> {
    return this.routesRepository.findAll();
  }

  async setRouteAsBaseline(id: string): Promise<Route | null> {
    // First, unset the current baseline if any
    const currentBaseline = await this.routesRepository.findBaseline();
    if (currentBaseline && currentBaseline.id !== id) {
      // Assuming a method to unset baseline exists or can be handled internally by setBaseline
      // For now, we'll rely on the repository to handle ensuring only one baseline
    }
    return this.routesRepository.setBaseline(id);
  }

  async getComparison(): Promise<any[]> {
    const baseline = await this.routesRepository.findBaseline();
    if (!baseline) {
      return []; // Or throw an error, depending on desired behavior
    }

    const nonBaselineRoutes =
      await this.routesRepository.findNonBaselineRoutes();

    const comparison = nonBaselineRoutes.map((route: Route) => {
      const percentDiff =
        ((route.ghg_intensity - baseline.ghg_intensity) /
          baseline.ghg_intensity) *
        100;
      const compliant = route.ghg_intensity <= baseline.ghg_intensity;
      return {
        ...route,
        percentDiff: parseFloat(percentDiff.toFixed(2)),
        compliant,
      };
    });

    return comparison;
  }
}
