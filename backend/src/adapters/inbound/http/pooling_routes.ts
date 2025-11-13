import { Router, type Request, type Response } from "express";
import { PoolingService } from "../../../core/application/pooling_service.js";

export function createPoolingRouter(poolingService: PoolingService): Router {
  const poolingRouter = Router();

  poolingRouter.post("/", async (req: Request, res: Response) => {
    try {
      const { year, shipIds } = req.body;
      if (
        !year ||
        !shipIds ||
        !Array.isArray(shipIds) ||
        shipIds.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "year and an array of shipIds are required" });
      }

      const poolMembers = await poolingService.createPool(year, shipIds);
      res.status(201).json(poolMembers);
    } catch (error: any) {
      console.error("Error creating pool:", error);
      res.status(400).json({ message: error.message });
    }
  });

  return poolingRouter;
}
