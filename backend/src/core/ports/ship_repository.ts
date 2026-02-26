import { type Ship } from "../domain/ship.js";

export interface IShipRepository {
  getAllShips(): Promise<Ship[]>;
  findById(shipId: string): Promise<Ship | null>;
}
