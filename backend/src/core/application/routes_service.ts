import { type Route } from "../domain/route.js";
import { type RoutesRepository } from "../ports/routes_repository.js";
import { type ComparisonDto } from "./dtos.js";
import { TARGET_INTENSITY_2025 } from "../../shared/constants.js";

export class RoutesService {
  constructor(private routesRepository: RoutesRepository) {}

  async getAllRoutes(): Promise<Route[]> {
    return this.routesRepository.findAll();
  }

  async setRouteAsBaseline(id: string): Promise<Route | null> {
    return this.routesRepository.setBaseline(id);
  }

  async getComparison(): Promise<ComparisonDto[]> {
    const baseline = await this.routesRepository.findBaseline();
    if (!baseline) {
      return [];
    }

    const nonBaselineRoutes =
      await this.routesRepository.findNonBaselineRoutes();

    const comparison: ComparisonDto[] = nonBaselineRoutes.map(
      (route: Route) => {
        const percentDiff =
          ((route.ghg_intensity - baseline.ghg_intensity) /
            baseline.ghg_intensity) *
          100;
        // H1: compliant flag uses regulatory target, not baseline intensity
        const compliant = route.ghg_intensity <= TARGET_INTENSITY_2025;
        return {
          ...route,
          percentDiff: parseFloat(percentDiff.toFixed(2)),
          compliant,
        };
      },
    );

    return comparison;
  }
}
