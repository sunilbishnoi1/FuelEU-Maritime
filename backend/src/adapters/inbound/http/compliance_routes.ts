import { Router, type Request, type Response } from "express";
import {
  ComplianceService,
  type AdjustedCbDto,
} from "../../../core/application/compliance_service.js";

export function createComplianceRouter(
  complianceService: ComplianceService,
): Router {
  const complianceRouter = Router();

  complianceRouter.get("/cb", async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.query;
      if (!shipId || !year) {
        return res
          .status(400)
          .json({ message: "shipId and year are required" });
      }

      const compliance = await complianceService.getComplianceBalance(
        shipId as string,
        parseInt(year as string),
      );

      if (compliance) {
        res.json(compliance);
      } else {
        res.status(404).json({ message: "Compliance data not found" });
      }
    } catch (error) {
      console.error("Error getting compliance balance:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  complianceRouter.get("/adjusted-cb", async (req: Request, res: Response) => {
    try {
      const { shipId, year } = req.query;

      if (!year) {
        return res.status(400).json({ message: "year is required" });
      }

      const parsedYear = parseInt(year as string);
      if (isNaN(parsedYear)) {
        return res.status(400).json({ message: "year must be a number" });
      }

      // If no shipId provided, return adjusted CB for all ships
      if (!shipId) {
        const allAdjusted: AdjustedCbDto[] =
          await complianceService.getAdjustedComplianceBalanceForAllShips(
            parsedYear,
          );
        return res.json(
          allAdjusted.map((entry) => ({
            shipId: entry.shipId,
            year: parsedYear,
            adjustedCb: entry.adjustedCb,
          })),
        );
      }

      const adjustedCb = await complianceService.getAdjustedComplianceBalance(
        shipId as string,
        parsedYear,
      );

      if (adjustedCb !== null) {
        return res.json({ shipId, year: parsedYear, adjustedCb });
      } else {
        return res
          .status(404)
          .json({ message: "Compliance data not found for this ship" });
      }
    } catch (error) {
      console.error("Error getting adjusted compliance balance:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return complianceRouter;
}
