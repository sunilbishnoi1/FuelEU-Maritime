import request from "supertest";
import express from "express";
import type { Express } from "express";
import { jest } from "@jest/globals";
import { createComplianceRouter } from "adapters/inbound/http/compliance_routes";
import { createBankingRouter } from "adapters/inbound/http/banking_routes";
import { createPoolingRouter } from "adapters/inbound/http/pooling_routes";
import { ComplianceService } from "core/application/compliance_service";
import { BankingService } from "core/application/banking_service";
import { PoolingService } from "core/application/pooling_service";
import {
  MockComplianceRepository,
  MockBankingRepository,
  MockPoolingRepository,
  MockRoutesRepository,
  MockShipRepository, // New import
} from "tests/mocks/mock-repositories";
import {
  createCompliance,
  createBankEntry,
  BASELINE_ROUTE,
} from "tests/fixtures/test-data";

jest.mock("infrastructure/db/db", () => ({
  default: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

jest.mock("adapters/outbound/postgres/compliance_repository");
jest.mock("adapters/outbound/postgres/banking_repository");
jest.mock("adapters/outbound/postgres/pooling_repository");
jest.mock("adapters/outbound/postgres/routes_repository");

let app: Express;
let mockComplianceRepository: MockComplianceRepository;
let mockBankingRepository: MockBankingRepository;
let mockRoutesRepository: MockRoutesRepository;
let mockPoolingRepository: MockPoolingRepository;
let mockShipRepository: MockShipRepository; // New declaration

describe("Compliance HTTP Endpoints", () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockComplianceRepository = new MockComplianceRepository();
    mockBankingRepository = new MockBankingRepository();
    mockRoutesRepository = new MockRoutesRepository();
    mockShipRepository = new MockShipRepository(); // New instantiation

    mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

    // Create services backed by mocks and mount routers created with those services
    const complianceService = new ComplianceService(
      mockComplianceRepository,
      mockRoutesRepository,
      mockBankingRepository,
      mockShipRepository, // New argument
    );

    app.use("/compliance", createComplianceRouter(complianceService));

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("GET /compliance/cb", () => {
    it("should return compliance balance", async () => {
      const compliance = createCompliance("ship-1", 2025, 500000);
      await mockComplianceRepository.save(compliance);
      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      const response = await request(app)
        .get("/compliance/cb")
        .query({ shipId: "ship-1", year: 2025 });

      expect(response.status).toBe(200);
      expect(response.body.cb_gco2eq).toBeDefined();
    });

    it("should return 400 if shipId is missing", async () => {
      const response = await request(app)
        .get("/compliance/cb")
        .query({ year: 2025 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("required");
    });

    it("should return 400 if year is missing", async () => {
      const response = await request(app)
        .get("/compliance/cb")
        .query({ shipId: "ship-1" });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("required");
    });

    it("should return 404 if compliance not found", async () => {
      const response = await request(app)
        .get("/compliance/cb")
        .query({ shipId: "non-existent", year: 2025 });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /compliance/adjusted-cb", () => {
    it("should return adjusted CB including banked surplus", async () => {
      const compliance = createCompliance("ship-1", 2025, 500000);
      await mockComplianceRepository.save(compliance);

      const banked = createBankEntry("ship-1", 2025, 200000);
      await mockBankingRepository.save(banked);

      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      const response = await request(app)
        .get("/compliance/adjusted-cb")
        .query({ shipId: "ship-1", year: 2025 });

      expect(response.status).toBe(200);
      expect(response.body.adjustedCb).toBe(700000); // 500000 + 200000
    });

    it("should return 400 if shipId is missing", async () => {
      const response = await request(app)
        .get("/compliance/adjusted-cb")
        .query({ year: 2025 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("required");
    });

    it("should return correct shipId and year in response", async () => {
      const compliance = createCompliance("ship-1", 2025, 300000);
      await mockComplianceRepository.save(compliance);
      mockRoutesRepository.setRoutes([BASELINE_ROUTE]);

      const response = await request(app)
        .get("/compliance/adjusted-cb")
        .query({ shipId: "ship-1", year: 2025 });

      expect(response.status).toBe(200);
      expect(response.body.shipId).toBe("ship-1");
      expect(response.body.year).toBe(2025);
    });
  });
});

describe("Banking HTTP Endpoints", () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(async () => {
    app = express();
    app.use(express.json());

    // Initialize mock repositories here, so they are fresh for each test in this describe block
    mockComplianceRepository = new MockComplianceRepository();
    mockBankingRepository = new MockBankingRepository();

    const bankingService = new BankingService(
      mockBankingRepository, // Use the initialized mockBankingRepository
      mockComplianceRepository,
    );

    app.use("/banking", createBankingRouter(bankingService));

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Setup for POST /banking/apply tests
    const bank = createBankEntry("ship-1", 2025, 500000);
    await mockBankingRepository.save(bank);
  });

  it("should apply valid banked surplus", async () => {
    const response = await request(app)
      .post("/banking/apply")
      .send({ shipId: "ship-1", year: 2025, amount: 200000 });

    expect(response.status).toBe(201);
    expect(response.body.amount_gco2eq).toBe(-200000);
  });

  it("should return 400 if amount is missing", async () => {
    const response = await request(app)
      .post("/banking/apply")
      .send({ shipId: "ship-1", year: 2025 });

    expect(response.status).toBe(400);
  });

  it("should return 400 if applying more than available", async () => {
    const response = await request(app)
      .post("/banking/apply")
      .send({ shipId: "ship-1", year: 2025, amount: 600000 });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Invalid amount");
  });
});

describe("Pooling HTTP Endpoints", () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockPoolingRepository = new MockPoolingRepository();
    mockComplianceRepository = new MockComplianceRepository();
    mockBankingRepository = new MockBankingRepository();

    const poolingService = new PoolingService(
      mockPoolingRepository as any,
      mockComplianceRepository as any,
      mockBankingRepository as any,
    );

    app.use("/pools", createPoolingRouter(poolingService));

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
  it("should create a pool with members", async () => {
    const ship1 = createCompliance("ship-1", 2025, 1000000);
    const ship2 = createCompliance("ship-2", 2025, -500000);
    await mockComplianceRepository.save(ship1);
    await mockComplianceRepository.save(ship2);

    const response = await request(app)
      .post("/pools")
      .send({
        year: 2025,
        shipIds: ["ship-1", "ship-2"],
      });

    expect(response.status).toBe(201);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
  });

  it("should return 400 if year is missing", async () => {
    const response = await request(app)
      .post("/pools")
      .send({ shipIds: ["ship-1", "ship-2"] });

    expect(response.status).toBe(400);
  });

  it("should return 400 if shipIds is not an array", async () => {
    const response = await request(app)
      .post("/pools")
      .send({ year: 2025, shipIds: "ship-1" });

    expect(response.status).toBe(400);
  });

  it("should return 400 if shipIds array is empty", async () => {
    const response = await request(app)
      .post("/pools")
      .send({ year: 2025, shipIds: [] });

    expect(response.status).toBe(400);
  });

  it("should return 400 if total CB is negative", async () => {
    const ship1 = createCompliance("ship-1", 2025, -1000000);
    const ship2 = createCompliance("ship-2", 2025, -500000);
    await mockComplianceRepository.save(ship1);
    await mockComplianceRepository.save(ship2);

    const response = await request(app)
      .post("/pools")
      .send({
        year: 2025,
        shipIds: ["ship-1", "ship-2"],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("cannot be negative");
  });

  it("should return pool members with cb_before and cb_after", async () => {
    const ship1 = createCompliance("ship-1", 2025, 1000);
    const ship2 = createCompliance("ship-2", 2025, -500);
    await mockComplianceRepository.save(ship1);
    await mockComplianceRepository.save(ship2);

    const response = await request(app)
      .post("/pools")
      .send({
        year: 2025,
        shipIds: ["ship-1", "ship-2"],
      });

    expect(response.status).toBe(201);
    response.body.forEach((member: any) => {
      expect(member).toHaveProperty("pool_id");
      expect(member).toHaveProperty("ship_id");
      expect(member).toHaveProperty("cb_before");
      expect(member).toHaveProperty("cb_after");
    });
  });

  it("should maintain CB balance after allocation", async () => {
    const ship1 = createCompliance("ship-1", 2025, 1500);
    const ship2 = createCompliance("ship-2", 2025, -400);
    const ship3 = createCompliance("ship-3", 2025, -300);
    await mockComplianceRepository.save(ship1);
    await mockComplianceRepository.save(ship2);
    await mockComplianceRepository.save(ship3);

    const response = await request(app)
      .post("/pools")
      .send({
        year: 2025,
        shipIds: ["ship-1", "ship-2", "ship-3"],
      });

    expect(response.status).toBe(201);

    const totalBefore = response.body.reduce(
      (sum: number, m: any) => sum + m.cb_before,
      0,
    );
    const totalAfter = response.body.reduce(
      (sum: number, m: any) => sum + (m.cb_after ?? 0),
      0,
    );

    expect(totalBefore).toBe(totalAfter);
    expect(totalAfter).toBe(800);
  });
});
