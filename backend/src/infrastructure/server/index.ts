import express from "express";
import { createRoutesRouter } from "../../adapters/inbound/http/routes.js";
import { createComplianceRouter } from "../../adapters/inbound/http/compliance_routes.js";
import { createBankingRouter } from "../../adapters/inbound/http/banking_routes.js";
import { createPoolingRouter } from "../../adapters/inbound/http/pooling_routes.js";

import { RoutesService } from "../../core/application/routes_service.js";
import { ComplianceService } from "../../core/application/compliance_service.js";
import { BankingService } from "../../core/application/banking_service.js";
import { PoolingService } from "../../core/application/pooling_service.js";

import { PgRoutesRepository } from "../../adapters/outbound/postgres/routes_repository.js";
import { PgComplianceRepository } from "../../adapters/outbound/postgres/compliance_repository.js";
import { PgBankingRepository } from "../../adapters/outbound/postgres/banking_repository.js";
import { PgPoolingRepository } from "../../adapters/outbound/postgres/pooling_repository.js";

const app = express();
const port = 3030;

app.use(express.json()); // Middleware to parse JSON request bodies

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World!");
});

// Instantiate Repositories
const pgRoutesRepository = new PgRoutesRepository();
const pgComplianceRepository = new PgComplianceRepository();
const pgBankingRepository = new PgBankingRepository();
const pgPoolingRepository = new PgPoolingRepository();

// Instantiate Services
const routesService = new RoutesService(pgRoutesRepository);
const bankingService = new BankingService(
  pgBankingRepository,
  pgComplianceRepository,
);
const complianceService = new ComplianceService(
  pgComplianceRepository,
  pgRoutesRepository,
  pgBankingRepository,
);
const poolingService = new PoolingService(
  pgPoolingRepository,
  pgComplianceRepository,
  pgBankingRepository,
);

// Create and use Routers
app.use("/routes", createRoutesRouter(routesService));
app.use("/compliance", createComplianceRouter(complianceService));
app.use("/banking", createBankingRouter(bankingService));
app.use("/pools", createPoolingRouter(poolingService));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
