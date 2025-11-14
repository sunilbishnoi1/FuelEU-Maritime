import type { Route } from '../domain/entities';
import type { RouteRepository } from '../ports/outbound';
import type { FetchRoutesUseCase, SetBaselineUseCase } from '../ports/inbound';
import type { RouteFilters } from '../../types';

export class FetchRoutes implements FetchRoutesUseCase {
  private readonly routeRepository: RouteRepository;

  constructor(routeRepository: RouteRepository) {
    this.routeRepository = routeRepository;
  }

  async execute(filters?: RouteFilters): Promise<Route[]> {
    return this.routeRepository.getRoutes(filters);
  }
}

export class SetBaseline implements SetBaselineUseCase {
  private readonly routeRepository: RouteRepository;

  constructor(routeRepository: RouteRepository) {
    this.routeRepository = routeRepository;
  }

  async execute(id: string): Promise<void> {
    await this.routeRepository.setBaseline(id);
  }
}
