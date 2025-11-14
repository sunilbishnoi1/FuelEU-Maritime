import type { Route } from '../domain/entities';
import type { RouteRepository } from '../ports/outbound';
import type { FetchComparisonUseCase } from '../ports/inbound';

export class FetchComparison implements FetchComparisonUseCase {
  private readonly routeRepository: RouteRepository;

  constructor(routeRepository: RouteRepository) {
    this.routeRepository = routeRepository;
  }

  async execute(): Promise<{ baseline: Route[]; comparison: Route[] }> {
    return this.routeRepository.getComparisonData();
  }
}
