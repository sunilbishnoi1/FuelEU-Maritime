import express from "express";
import cors from "cors";
import { createRoutesRouter } from "../../adapters/inbound/http/routes.js";
import { createComplianceRouter } from "../../adapters/inbound/http/compliance_routes.js";
import { createBankingRouter } from "../../adapters/inbound/http/banking_routes.js";
import { createPoolingRouter } from "../../adapters/inbound/http/pooling_routes.js";

import { RoutesService } from "../../core/application/routes_service.js";
import { ComplianceService } from "../../core/application/compliance_service.js";
import { BankingService } from "../../core/application/banking_service.js";
import { PoolingService } from "../../core/application/pooling_service.js";
import type { RoutesRepository } from "../../core/ports/routes_repository.js";
import type { ComplianceRepository } from "../../core/ports/compliance_repository.js";
import type { BankingRepository } from "../../core/ports/banking_repository.js";
import type { PoolingRepository } from "../../core/ports/pooling_repository.js";

import { PgRoutesRepository } from "../../adapters/outbound/postgres/routes_repository.js";
import { PgComplianceRepository } from "../../adapters/outbound/postgres/compliance_repository.js";
import { PgBankingRepository } from "../../adapters/outbound/postgres/banking_repository.js";
import { PgPoolingRepository } from "../../adapters/outbound/postgres/pooling_repository.js";
import {
  MockRoutesRepository,
  MockComplianceRepository,
  MockBankingRepository,
  MockPoolingRepository,
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

let routesRepository;
let complianceRepository;
let bankingRepository;
let poolingRepository;

if (useMocks) {
  // Use lightweight in-memory repositories from test mocks for a DB-less dev experience
  routesRepository = new MockRoutesRepository();
  complianceRepository = new MockComplianceRepository();
  bankingRepository = new MockBankingRepository();
  poolingRepository = new MockPoolingRepository();
} else {
  // Default: use Postgres-backed repositories (requires DATABASE_URL)
  routesRepository = new PgRoutesRepository();
  complianceRepository = new PgComplianceRepository();
  bankingRepository = new PgBankingRepository();
  poolingRepository = new PgPoolingRepository();
}

// Instantiate Services (cast to the interface types to satisfy TypeScript when using mocks)
const routesService = new RoutesService(
  routesRepository as unknown as RoutesRepository,
);
const bankingService = new BankingService(
  bankingRepository as unknown as BankingRepository,
  complianceRepository as unknown as ComplianceRepository,
);
const complianceService = new ComplianceService(
  complianceRepository as unknown as ComplianceRepository,
  routesRepository as unknown as RoutesRepository,
  bankingRepository as unknown as BankingRepository,
);
const poolingService = new PoolingService(
  poolingRepository as unknown as PoolingRepository,
  complianceRepository as unknown as ComplianceRepository,
  bankingRepository as unknown as BankingRepository,
);

// Create and use Routers
app.use("/routes", createRoutesRouter(routesService));
app.use("/compliance", createComplianceRouter(complianceService));
app.use("/banking", createBankingRouter(bankingService));
app.use("/pools", createPoolingRouter(poolingService));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
