import express from "express";
import { createRoutesRouter } from "../../adapters/inbound/http/routes";
import { createComplianceRouter } from "../../adapters/inbound/http/compliance_routes";
import { createBankingRouter } from "../../adapters/inbound/http/banking_routes";
import { createPoolingRouter } from "../../adapters/inbound/http/pooling_routes";

import { RoutesService } from "../../core/application/routes_service";
import { ComplianceService } from "../../core/application/compliance_service";
import { BankingService } from "../../core/application/banking_service";
import { PoolingService } from "../../core/application/pooling_service";

import {
  MockRoutesRepository,
  MockComplianceRepository,
  MockBankingRepository,
  MockPoolingRepository,
  MockShipRepository, // New import
} from "../mocks/mock-repositories";
import { ALL_ROUTES, BASELINE_ROUTE } from "../fixtures/test-data"; // ALL_ROUTES added

export function createTestApp() {
  const app = express();

  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  // Instantiate mock repositories
  const mockRoutesRepository = new MockRoutesRepository();
  const mockComplianceRepository = new MockComplianceRepository();
  const mockBankingRepository = new MockBankingRepository();
  const mockPoolingRepository = new MockPoolingRepository();
  const mockShipRepository = new MockShipRepository(); // New instantiation

  // Set up some initial data for routes
  mockRoutesRepository.setRoutes(ALL_ROUTES);

  // Instantiate services with mock repositories
  const routesService = new RoutesService(mockRoutesRepository);
  const complianceService = new ComplianceService(
    mockComplianceRepository,
    mockRoutesRepository,
    mockBankingRepository,
    mockShipRepository, // New argument
  );
  const bankingService = new BankingService(
    mockBankingRepository,
    mockComplianceRepository,
  );
  const poolingService = new PoolingService(
    mockPoolingRepository,
    mockComplianceRepository,
    mockBankingRepository,
  );

  // Create routers with the instantiated services
  app.use("/routes", createRoutesRouter(routesService));
  app.use("/compliance", createComplianceRouter(complianceService));
  app.use("/banking", createBankingRouter(bankingService));
  app.use("/pools", createPoolingRouter(poolingService));

  return app;
}
