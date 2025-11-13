import { Router, type Request, type Response } from "express";
import { BankingService } from "../../../core/application/banking_service.js";

export function createBankingRouter(bankingService: BankingService): Router {
  const bankingRouter = Router();

  bankingRouter.get("/records", async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.query;
      if (!shipId || !year) {
        return res
          .status(400)
          .json({ message: "shipId and year are required" });
      }

      const records = await bankingService.getBankRecords(
        shipId as string,
        parseInt(year as string),
      );
      res.json(records);
    } catch (error) {
      console.error("Error fetching banking records:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  bankingRouter.post("/bank", async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.body;
      if (!shipId || !year) {
        return res
          .status(400)
          .json({ message: "shipId and year are required" });
      }

      const bankedEntry = await bankingService.bankComplianceBalance(
        shipId as string,
        parseInt(year as string),
      );

      if (bankedEntry) {
        res.status(201).json(bankedEntry);
      } else {
        res
          .status(400)
          .json({ message: "Cannot bank negative or zero compliance balance" });
      }
    } catch (error) {
      console.error("Error banking compliance balance:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  bankingRouter.post("/apply", async (req: Request, res: Response) => {
    try {
      const { shipId, year, amount } = req.body;
      if (!shipId || !year || !amount) {
        return res
          .status(400)
          .json({ message: "shipId, year, and amount are required" });
      }

      const appliedEntry = await bankingService.applyBankedSurplus(
        shipId as string,
        parseInt(year as string),
        parseFloat(amount as string),
      );

      res.status(201).json(appliedEntry);
    } catch (error: any) {
      console.error("Error applying banked surplus:", error);
      res.status(400).json({ message: error.message });
    }
  });

  return bankingRouter;
}
