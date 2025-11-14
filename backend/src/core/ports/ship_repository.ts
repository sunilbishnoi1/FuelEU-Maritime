import { Ship } from "../domain/ship";

export interface IShipRepository {
  getAllShips(): Promise<Ship[]>;
}
