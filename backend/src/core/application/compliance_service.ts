import { Compliance } from "../domain/compliance";
import { type ComplianceRepository } from "../ports/compliance_repository";
import { type RoutesRepository } from "../ports/routes_repository";
import { type BankingRepository } from "../ports/banking_repository";
import { v4 as uuidv4 } from "uuid";

export class ComplianceService {
  private readonly targetIntensity2025 = 89.3368; // gCO₂e/MJ

  constructor(
    private complianceRepository: ComplianceRepository,
    private routesRepository: RoutesRepository,
    private bankingRepository: BankingRepository,
  ) {}

  async getComplianceBalance(
    shipId: string,
    year: number,
  ): Promise<Compliance | null> {
    const existingCompliance =
      await this.complianceRepository.findByShipIdAndYear(shipId, year);
    if (existingCompliance) {
      return existingCompliance;
    }

    // This is a simplification. In a real scenario, we'd have a way to get the route for a ship.
    // Here we assume the shipId is the route_id.
    const route = await this.routesRepository.findByRouteId(shipId);
    if (!route) {
      return null;
    }

    // Mocked fuel consumption. In a real app, this would come from ship data.
    const fuelConsumption = 1000; // in tonnes
    const energyInScope = fuelConsumption * 41000; // MJ
    const actualIntensity = route.ghg_intensity;

    if (
      typeof actualIntensity !== "number" ||
      !Number.isFinite(actualIntensity)
    ) {
      throw new Error(
        `Invalid ghg_intensity for route ${shipId}: ${actualIntensity}`,
      );
    }

    const complianceBalance =
      (this.targetIntensity2025 - actualIntensity) * energyInScope;

    const newCompliance = new Compliance(
      uuidv4(),
      shipId,
      year,
      complianceBalance,
    );

    return this.complianceRepository.save(newCompliance);
  }

  async getAdjustedComplianceBalance(
    shipId: string,
    year: number,
  ): Promise<number | null> {
    const compliance = await this.getComplianceBalance(shipId, year);
    if (!compliance) {
      return null;
    }

    const totalBanked = await this.bankingRepository.getTotalBanked(
      shipId,
      year,
    );

    return compliance.cb_gco2eq + totalBanked;
  }
}
