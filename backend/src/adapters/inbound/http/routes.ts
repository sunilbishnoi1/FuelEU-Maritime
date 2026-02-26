import { Router, type Request, type Response } from "express";
import { RoutesService } from "../../../core/application/routes_service.js";

export function createRoutesRouter(routesService: RoutesService): Router {
  const routesRouter = Router();

  routesRouter.get("/", async (req: Request, res: Response) => {
    try {
      const routes = await routesService.getAllRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Error fetching all routes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  routesRouter.post("/:id/baseline", async (req: Request, res: Response) => {
    try {
      const id = req.params["id"] as string | undefined;
      if (!id) {
        return res.status(400).json({ message: "Route ID is required" });
      }
      const updatedRoute = await routesService.setRouteAsBaseline(id);
      if (updatedRoute) {
        res.json(updatedRoute);
      } else {
        res.status(404).json({ message: "Route not found" });
      }
    } catch (error) {
      console.error("Error setting baseline:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  routesRouter.get("/comparison", async (req: Request, res: Response) => {
    try {
      const comparison = await routesService.getComparison();
      res.json(comparison);
    } catch (error) {
      console.error("Error getting comparison:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return routesRouter;
}
