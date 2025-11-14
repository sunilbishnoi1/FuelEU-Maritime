import express from "express";
import cors from "cors";
import { createRoutesRouter } from "../../adapters/inbound/http/routes.js";
import { createComplianceRouter } from "../../adapters/inbound/http/compliance_routes.js";
import { createBankingRouter } from "../../adapters/inbound/http/banking_routes.js";
import { createPoolingRouter } from "../../adapters/inbound/http/pooling_routes.js";
import pool from "../db/db.js";

import { RoutesService } from "../../core/application/routes_service.js";
import { ComplianceService } from "../../core/application/compliance_service.js";
import { BankingService } from "../../core/application/banking_service.js";
import { PoolingService } from "../../core/application/pooling_service.js";
import type { RoutesRepository } from "../../core/ports/routes_repository.js";
import type { ComplianceRepository } from "../../core/ports/compliance_repository.js";
import type { BankingRepository } from "../../core/ports/banking_repository.js";
import type { PoolingRepository } from "../../core/ports/pooling_repository.js";
import type { IShipRepository } from "../../core/ports/ship_repository.js"; // New import

import { PgRoutesRepository } from "../../adapters/outbound/postgres/routes_repository.js";
import { PgComplianceRepository } from "../../adapters/outbound/postgres/compliance_repository.js";
import { PgBankingRepository } from "../../adapters/outbound/postgres/banking_repository.js";
import { PgPoolingRepository } from "../../adapters/outbound/postgres/pooling_repository.js";
import { PostgresShipRepository } from "../../adapters/outbound/postgres/ship_repository.js"; // New import
import {
  MockRoutesRepository,
  MockComplianceRepository,
  MockBankingRepository,
  MockPoolingRepository,
  MockShipRepository, // New import
} from "../../tests/mocks/mock-repositories.js";

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors());

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World!");
});

// Decide whether to use real Postgres-backed repositories or in-memory mocks
const useMocks = process.env.USE_MOCKS === "true";

async function startServer() {
  let routesRepository: RoutesRepository;
  let complianceRepository: ComplianceRepository;
  let bankingRepository: BankingRepository;
  let poolingRepository: PoolingRepository;
  let shipRepository: IShipRepository; // New declaration

  if (useMocks) {
    // Use lightweight in-memory repositories from test mocks for a DB-less dev experience
    routesRepository = new MockRoutesRepository();
    complianceRepository = new MockComplianceRepository();
    bankingRepository = new MockBankingRepository();
    poolingRepository = new MockPoolingRepository();
    shipRepository = new MockShipRepository(); // New instantiation
  } else {
    // Default: use Postgres-backed repositories (requires DATABASE_URL)
    routesRepository = new PgRoutesRepository();
    complianceRepository = new PgComplianceRepository();
    bankingRepository = new PgBankingRepository();
    poolingRepository = new PgPoolingRepository();
    shipRepository = new PostgresShipRepository(pool); // New instantiation with pool
  }

  // Instantiate Services (cast to the interface types to satisfy TypeScript when using mocks)
  const routesService = new RoutesService(routesRepository);
  const bankingService = new BankingService(
    bankingRepository,
    complianceRepository,
  );
  const complianceService = new ComplianceService(
    complianceRepository,
    routesRepository,
    bankingRepository,
    shipRepository, // New injection
  );
  const poolingService = new PoolingService(
    poolingRepository,
    complianceRepository,
    bankingRepository,
  );

  // Create and use Routers
  app.use("/routes", createRoutesRouter(routesService));
  app.use("/compliance", createComplianceRouter(complianceService));
  app.use("/banking", createBankingRouter(bankingService));
  app.use("/pools", createPoolingRouter(poolingService));

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer();
