import { type Route } from "../domain/route.js";

export interface RoutesRepository {
  findAll(): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  setBaseline(id: string): Promise<Route | null>;
  findBaseline(): Promise<Route | null>;
  findNonBaselineRoutes(): Promise<Route[]>;
}
