/**
 * FuelEU Maritime regulatory constants.
 * Centralized to prevent magic numbers and ensure consistency across services.
 */

/** Target GHG intensity for 2025 in gCO₂e/MJ (2% below reference value of 91.16) */
export const TARGET_INTENSITY_2025 = 89.3368;

/** Energy conversion factor: MJ per tonne of fuel */
export const ENERGY_CONVERSION_FACTOR = 41_000;
