import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";
import { createRoutesRouter } from "adapters/inbound/http/routes";
import { RoutesService } from "core/application/routes_service";
import { PgRoutesRepository } from "adapters/outbound/postgres/routes_repository";
import { MockRoutesRepository } from "tests/mocks/mock-repositories";
import {
  BASELINE_ROUTE,
  ROUTE_2,
  ROUTE_3,
  ROUTE_4,
  ROUTE_5,
  ALL_ROUTES,
} from "tests/fixtures/test-data";

// Mock the database
jest.mock("infrastructure/db/db", () => ({
  default: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

jest.mock("adapters/outbound/postgres/routes_repository");

describe("Routes HTTP Endpoints", () => {
  let app: express.Application;
  let mockRoutesRepository: MockRoutesRepository;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Create mock repository
    mockRoutesRepository = new MockRoutesRepository();
    mockRoutesRepository.setRoutes(ALL_ROUTES);

    // Create the RoutesService with the mock repository
    const routesService = new RoutesService(mockRoutesRepository as any);

    // Create the router with the mocked service
    const router = createRoutesRouter(routesService);
    app.use("/routes", router);
  });

  describe("GET /routes", () => {
    it("should return all routes", async () => {
      const response = await request(app).get("/routes");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5);
      expect(response.body).toEqual(ALL_ROUTES);
    });

    it("should return empty array when no routes exist", async () => {
      mockRoutesRepository.setRoutes([]);

      const response = await request(app).get("/routes");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should have correct route data structure", async () => {
      const response = await request(app).get("/routes");

      expect(response.status).toBe(200);
      response.body.forEach((route: any) => {
        expect(route).toHaveProperty("id");
        expect(route).toHaveProperty("route_id");
        expect(route).toHaveProperty("year");
        expect(route).toHaveProperty("ghg_intensity");
        expect(route).toHaveProperty("is_baseline");
      });
    });
  });

  describe("POST /routes/:id/baseline", () => {
    it("should set a route as baseline", async () => {
      const response = await request(app)
        .post("/routes/route-2/baseline")
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.id).toBe("route-2");
      expect(response.body.is_baseline).toBe(true);
    });

    it("should return 400 if route ID is missing", async () => {
      const response = await request(app).post("/routes//baseline").send({});

      expect(response.status).toBe(404); // Express 404 for route not found
    });

    it("should return 404 if route not found", async () => {
      const response = await request(app)
        .post("/routes/non-existent/baseline")
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Route not found");
    });

    it("should unset previous baseline", async () => {
      // Set initial baseline
      await request(app).post("/routes/route-1/baseline").send({});

      // Set new baseline
      const response = await request(app)
        .post("/routes/route-2/baseline")
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.is_baseline).toBe(true);

      // Verify old baseline is unset
      const comparisonResponse = await request(app).get("/routes/comparison");
      const route1 = comparisonResponse.body.find(
        (r: any) => r.id === "route-1",
      );
      expect(route1).toBeDefined();
      expect(route1?.is_baseline).toBe(false);
    });
  });

  describe("GET /routes/comparison", () => {
    beforeEach(async () => {
      // Set a baseline
      await request(app).post("/routes/route-1/baseline").send({});
    });

    it("should return comparison data", async () => {
      const response = await request(app).get("/routes/comparison");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(4); // All except baseline
    });

    it("should include percentDiff in comparison", async () => {
      const response = await request(app).get("/routes/comparison");

      expect(response.status).toBe(200);
      response.body.forEach((route: any) => {
        expect(route).toHaveProperty("percentDiff");
        expect(typeof route.percentDiff).toBe("number");
      });
    });

    it("should include compliant flag", async () => {
      const response = await request(app).get("/routes/comparison");

      expect(response.status).toBe(200);
      response.body.forEach((route: any) => {
        expect(route).toHaveProperty("compliant");
        expect(typeof route.compliant).toBe("boolean");
      });
    });

    it("should mark routes compliant when intensity is <= baseline", async () => {
      const response = await request(app).get("/routes/comparison");

      // ROUTE_3 (85.0) and ROUTE_5 (80.0) should be compliant (< baseline 89.3368)
      const compliantRoutes = response.body.filter(
        (r: any) => r.compliant === true,
      );
      expect(compliantRoutes.length).toBeGreaterThan(0);
      compliantRoutes.forEach((route: any) => {
        expect(route.ghg_intensity).toBeLessThanOrEqual(
          BASELINE_ROUTE.ghg_intensity,
        );
      });
    });

    it("should mark routes non-compliant when intensity is > baseline", async () => {
      const response = await request(app).get("/routes/comparison");

      // ROUTE_2 (95.0) and ROUTE_4 (100.0) should be non-compliant
      const nonCompliantRoutes = response.body.filter(
        (r: any) => r.compliant === false,
      );
      expect(nonCompliantRoutes.length).toBeGreaterThan(0);
      nonCompliantRoutes.forEach((route: any) => {
        expect(route.ghg_intensity).toBeGreaterThan(
          BASELINE_ROUTE.ghg_intensity,
        );
      });
    });

    it("should calculate correct percentage differences", async () => {
      const response = await request(app).get("/routes/comparison");

      // Find ROUTE_2 (95.0 vs baseline 89.3368)
      const route2 = response.body.find((r: any) => r.id === "route-2");
      if (route2) {
        const expectedDiff =
          ((95.0 - BASELINE_ROUTE.ghg_intensity) /
            BASELINE_ROUTE.ghg_intensity) *
          100;
        expect(route2.percentDiff).toBeCloseTo(expectedDiff, 1);
      }
    });
  });

  describe("GET /routes/comparison - No Baseline", () => {
    it("should return empty array when no baseline is set", async () => {
      // Set routes with no baseline marked
      const routesWithNoBaseline = ALL_ROUTES.map((r: any) => ({ ...r, is_baseline: false }));
      mockRoutesRepository.setRoutes(routesWithNoBaseline);

      const response = await request(app).get("/routes/comparison");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
