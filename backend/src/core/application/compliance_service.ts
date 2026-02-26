import { Compliance } from "../domain/compliance.js";
import { type ComplianceRepository } from "../ports/compliance_repository.js";
import { type RoutesRepository } from "../ports/routes_repository.js";
import { type BankingRepository } from "../ports/banking_repository.js";
import { type IShipRepository } from "../ports/ship_repository.js";
import { v4 as uuidv4 } from "uuid";
import {
  TARGET_INTENSITY_2025,
  ENERGY_CONVERSION_FACTOR,
} from "../../shared/constants.js";

export interface AdjustedCbDto {
  shipId: string;
  adjustedCb: number | null;
}

export class ComplianceService {
  constructor(
    private complianceRepository: ComplianceRepository,
    private routesRepository: RoutesRepository,
    private bankingRepository: BankingRepository,
    private shipRepository: IShipRepository,
  ) { }

  async getComplianceBalance(
    shipId: string,
    year: number,
  ): Promise<Compliance | null> {
    const existingCompliance =
      await this.complianceRepository.findByShipIdAndYear(shipId, year);
    if (existingCompliance) {
      return existingCompliance;
    }

    // H5: Resolve the route via the ship-to-route mapping
    const ship = await this.shipRepository.findById(shipId);
    const routeId = ship ? ship.route_id : shipId; // Fallback to shipId for backward compat
    const route = await this.routesRepository.findByRouteId(routeId);
    if (!route) {
      return null;
    }

    // C1: Use actual fuel_consumption from route data instead of hardcoded value
    // pg driver returns NUMERIC columns as strings, so coerce to number
    const fuelConsumption = Number(route.fuel_consumption);
    if (!Number.isFinite(fuelConsumption) || fuelConsumption <= 0) {
      throw new Error(
        `Invalid fuel_consumption for route ${routeId}: ${route.fuel_consumption}`,
      );
    }

    const energyInScope = fuelConsumption * ENERGY_CONVERSION_FACTOR; // MJ
    const actualIntensity = Number(route.ghg_intensity);

    if (!Number.isFinite(actualIntensity)) {
      throw new Error(
        `Invalid ghg_intensity for route ${routeId}: ${route.ghg_intensity}`,
      );
    }

    const complianceBalance =
      (TARGET_INTENSITY_2025 - actualIntensity) * energyInScope;

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

  async getAdjustedComplianceBalanceForAllShips(
    year: number,
  ): Promise<AdjustedCbDto[]> {
    const allShips = await this.shipRepository.getAllShips();
    const adjustedBalances: AdjustedCbDto[] = [];

    for (const ship of allShips) {
      try {
        const adjustedCb = await this.getAdjustedComplianceBalance(ship.id, year);
        adjustedBalances.push({ shipId: ship.id, adjustedCb });
      } catch (error) {
        // Skip ships whose route data is incomplete/invalid
        console.warn(`Skipping ship ${ship.id}: ${error instanceof Error ? error.message : error}`);
        adjustedBalances.push({ shipId: ship.id, adjustedCb: null });
      }
    }

    return adjustedBalances;
  }
}
