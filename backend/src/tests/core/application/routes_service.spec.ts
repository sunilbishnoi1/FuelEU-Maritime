import { RoutesService } from "core/application/routes_service";
import { MockRoutesRepository } from "tests/mocks/mock-repositories";
import {
  BASELINE_ROUTE,
  ROUTE_2,
  ROUTE_3,
  ROUTE_4,
  ROUTE_5,
  ALL_ROUTES,
  createRoute,
} from "tests/fixtures/test-data";
import { TARGET_INTENSITY_2025 } from "shared/constants";
import type { ComparisonDto } from "core/application/dtos";

describe("RoutesService", () => {
  let routesService: RoutesService;
  let mockRoutesRepository: MockRoutesRepository;

  beforeEach(() => {
    mockRoutesRepository = new MockRoutesRepository();
    routesService = new RoutesService(mockRoutesRepository);
  });

  describe("getAllRoutes", () => {
    it("should return all routes", async () => {
      mockRoutesRepository.setRoutes(ALL_ROUTES);

      const routes = await routesService.getAllRoutes();

      expect(routes).toHaveLength(5);
      expect(routes).toEqual(ALL_ROUTES);
    });

    it("should return empty array when no routes exist", async () => {
      mockRoutesRepository.setRoutes([]);

      const routes = await routesService.getAllRoutes();

      expect(routes).toHaveLength(0);
      expect(routes).toEqual([]);
    });
  });

  describe("setRouteAsBaseline", () => {
    it("should set a route as baseline", async () => {
      mockRoutesRepository.setRoutes([
        { ...BASELINE_ROUTE, is_baseline: false },
        ROUTE_2,
        ROUTE_3,
      ]);

      const result = await routesService.setRouteAsBaseline("route-2");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("route-2");
      expect(result?.is_baseline).toBe(true);
    });

    it("should unset previous baseline when setting a new one", async () => {
      mockRoutesRepository.setRoutes([BASELINE_ROUTE, ROUTE_2, ROUTE_3]);
      await mockRoutesRepository.setBaseline("route-1"); // Set initial baseline

      await routesService.setRouteAsBaseline("route-2");

      const baseline = await mockRoutesRepository.findBaseline();
      expect(baseline?.id).toBe("route-2");
      expect(baseline?.is_baseline).toBe(true);
    });

    it("should return null if route not found", async () => {
      mockRoutesRepository.setRoutes(ALL_ROUTES);

      const result = await routesService.setRouteAsBaseline("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getComparison", () => {
    it("should return routes with percentage difference and compliance flag", async () => {
      mockRoutesRepository.setRoutes(ALL_ROUTES);
      await mockRoutesRepository.setBaseline("route-1");

      const comparison = await routesService.getComparison();

      expect(comparison).toHaveLength(4); // Non-baseline routes

      // H1: compliant flag now checks against TARGET_INTENSITY_2025 (89.3368)
      // Check ROUTE_2 (95.0) - not compliant because 95.0 > 89.3368
      const route2Comparison = comparison.find(
        (r: ComparisonDto) => r.id === "route-2",
      );
      expect(route2Comparison).toBeDefined();
      expect(route2Comparison?.compliant).toBe(false); // 95 > TARGET
      expect(route2Comparison?.percentDiff).toBeCloseTo(6.36, 1);

      // Check ROUTE_3 (85.0) - compliant because 85 <= 89.3368
      const route3Comparison = comparison.find(
        (r: ComparisonDto) => r.id === "route-3",
      );
      expect(route3Comparison).toBeDefined();
      expect(route3Comparison?.compliant).toBe(true); // 85 < TARGET
      expect(route3Comparison?.percentDiff).toBeCloseTo(-4.81, 1);
    });

    it("should return empty array when no baseline is set", async () => {
      // Set routes with no baseline marked
      const routesWithNoBaseline = ALL_ROUTES.map(r => ({ ...r, is_baseline: false }));
      mockRoutesRepository.setRoutes(routesWithNoBaseline);

      const comparison = await routesService.getComparison();

      expect(comparison).toHaveLength(0);
    });

    it("should calculate correct compliance flag using TARGET_INTENSITY_2025", async () => {
      const route1 = createRoute("route-1", 89.3368, true);
      const route2 = createRoute("route-2", 89.3368, false); // Exactly equal to target → compliant
      const route3 = createRoute("route-3", 89.0, false); // Lower than target → compliant
      const route4 = createRoute("route-4", 90.0, false); // Above target → not compliant

      mockRoutesRepository.setRoutes([route1, route2, route3, route4]);
      await mockRoutesRepository.setBaseline("route-1");

      const comparison = await routesService.getComparison();

      const equalToTarget = comparison.find((r: ComparisonDto) => r.id === "route-2");
      expect(equalToTarget?.compliant).toBe(true); // Exactly at target

      const belowTarget = comparison.find((r: ComparisonDto) => r.id === "route-3");
      expect(belowTarget?.compliant).toBe(true); // Below target

      const aboveTarget = comparison.find((r: ComparisonDto) => r.id === "route-4");
      expect(aboveTarget?.compliant).toBe(false); // Above target
    });

    it("should correctly calculate percentage difference", async () => {
      const baseline = createRoute("base", 100, true);
      const route50PercentHigher = createRoute("route-150", 150, false);
      const route50PercentLower = createRoute("route-50", 50, false);

      mockRoutesRepository.setRoutes([
        baseline,
        route50PercentHigher,
        route50PercentLower,
      ]);
      await mockRoutesRepository.setBaseline("base");

      const comparison = await routesService.getComparison();

      const higher = comparison.find((r: ComparisonDto) => r.id === "route-150");
      expect(higher?.percentDiff).toBe(50);
      // H1: compliant flag against TARGET (89.3368), not baseline (100)
      expect(higher?.compliant).toBe(false); // 150 > 89.3368

      const lower = comparison.find((r: ComparisonDto) => r.id === "route-50");
      expect(lower?.percentDiff).toBe(-50);
      expect(lower?.compliant).toBe(true); // 50 <= 89.3368
    });
  });
});
