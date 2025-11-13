import { Compliance } from "../domain/compliance.js";

export interface ComplianceRepository {
  findByShipIdAndYear(shipId: string, year: number): Promise<Compliance | null>;
  save(compliance: Compliance): Promise<Compliance | null>;
}
