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

import { PgRoutesRepository } from "../../adapters/outbound/postgres/routes_repository.js";
import { PgComplianceRepository } from "../../adapters/outbound/postgres/compliance_repository.js";
import { PgBankingRepository } from "../../adapters/outbound/postgres/banking_repository.js";
import { PgPoolingRepository } from "../../adapters/outbound/postgres/pooling_repository.js";
import { PostgresShipRepository } from "../../adapters/outbound/postgres/ship_repository.js";

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World!");
});

// Global error handling middleware (L3)
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  },
);

// L4: Unhandled promise rejection handler
process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled promise rejection:", reason);
});

async function startServer() {
  // All repositories use constructor-injected DB pool (M1)
  const routesRepository = new PgRoutesRepository(pool);
  const complianceRepository = new PgComplianceRepository(pool);
  const bankingRepository = new PgBankingRepository(pool);
  const poolingRepository = new PgPoolingRepository(pool);
  const shipRepository = new PostgresShipRepository(pool);

  const routesService = new RoutesService(routesRepository);
  const bankingService = new BankingService(
    bankingRepository,
    complianceRepository,
  );
  const complianceService = new ComplianceService(
    complianceRepository,
    routesRepository,
    bankingRepository,
    shipRepository,
  );
  const poolingService = new PoolingService(
    poolingRepository,
    complianceRepository,
    bankingRepository,
  );

  app.use("/routes", createRoutesRouter(routesService));
  app.use("/compliance", createComplianceRouter(complianceService));
  app.use("/banking", createBankingRouter(bankingService));
  app.use("/pools", createPoolingRouter(poolingService));

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer();
