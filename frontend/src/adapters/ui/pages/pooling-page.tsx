import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAdjustedComplianceBalanceUseCase,
  createPoolUseCase,
} from "../../../composition-root";
import type {
  AdjustedCompliance,
  PoolCreationRequest,
  Pool,
  PoolMemberDisplay,
} from "../../../core/domain/entities";
import { YearSelector } from "../banking/year-selector";
import { AvailableShips } from "../pooling/available-ships";
import { PoolMembers } from "../pooling/pool-members";
import { PoolValidation } from "../pooling/pool-validation";
import { CreatePoolButton } from "../pooling/create-pool-button";

// Helper to generate a range of years
const generateYears = (startYear: number, endYear: number): number[] => {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

/**
 * Simulate greedy allocation to validate pooling rules 2 & 3 on frontend.
 * Returns { isValid, validationErrors, simulatedMembers }.
 */
function simulatePoolAllocation(selectedShips: AdjustedCompliance[]): {
  isValid: boolean;
  validationErrors: string[];
  simulatedMembers: Array<{
    ship_id: string;
    cb_before: number;
    cb_after: number;
  }>;
} {
  const errors: string[] = [];
  // Normalize numeric fields (API may return strings)
  const normalized: Array<AdjustedCompliance & { adjusted_cb_gco2eq: number }> =
    selectedShips.map((s) => ({
      ...s,
      adjusted_cb_gco2eq: Number(s.adjusted_cb_gco2eq),
    }));

  const totalSum = normalized.reduce(
    (s, ship) =>
      s +
      (Number.isFinite(ship.adjusted_cb_gco2eq) ? ship.adjusted_cb_gco2eq : 0),
    0,
  );

  // Rule 1: Sum must be >= 0
  if (totalSum < 0) {
    errors.push("Total adjusted CB of selected ships must be ≥ 0.");
  }

  // Separate deficit and surplus ships
  const deficitShips = normalized.filter(
    (s) => Number.isFinite(s.adjusted_cb_gco2eq) && s.adjusted_cb_gco2eq < 0,
  );
  const surplusShips = normalized.filter(
    (s) => Number.isFinite(s.adjusted_cb_gco2eq) && s.adjusted_cb_gco2eq >= 0,
  );

  // Simulate greedy allocation: distribute surplus to cover deficits
  let remainingSurplus = surplusShips.reduce(
    (s, ship) => s + ship.adjusted_cb_gco2eq,
    0,
  );

  const simulatedMembers = normalized.map((ship) => {
    const val = Number.isFinite(ship.adjusted_cb_gco2eq)
      ? ship.adjusted_cb_gco2eq
      : 0;
    if (val >= 0) {
      return { ship_id: ship.ship_id, cb_before: val, cb_after: 0 };
    }
    return { ship_id: ship.ship_id, cb_before: val, cb_after: val };
  });

  // Greedy: allocate surplus to deficit ships
  for (const member of simulatedMembers) {
    if (member.cb_before < 0 && remainingSurplus > 0) {
      const needed = Math.abs(member.cb_before);
      const allocated = Math.min(needed, remainingSurplus);
      member.cb_after = member.cb_before + allocated;
      remainingSurplus -= allocated;
    }
  }

  // Distribute remaining surplus back to surplus ships proportionally
  if (remainingSurplus > 0 && surplusShips.length > 0) {
    const totalOriginalSurplus = surplusShips.reduce(
      (s, ship) => s + ship.adjusted_cb_gco2eq,
      0,
    );
    for (const member of simulatedMembers) {
      const originalShip = selectedShips.find(
        (s) => s.ship_id === member.ship_id,
      );
      if (
        originalShip &&
        originalShip.adjusted_cb_gco2eq >= 0 &&
        totalOriginalSurplus > 0
      ) {
        const proportion =
          originalShip.adjusted_cb_gco2eq / totalOriginalSurplus;
        member.cb_after = remainingSurplus * proportion;
      }
    }
  }

  // Rule 2: Deficit ship cannot exit worse (cb_after < cb_before)
  for (const ship of deficitShips) {
    const simulated = simulatedMembers.find((m) => m.ship_id === ship.ship_id);
    if (simulated && simulated.cb_after < simulated.cb_before) {
      const afterStr = Number.isFinite(simulated.cb_after)
        ? simulated.cb_after.toFixed(2)
        : "—";
      const beforeStr = Number.isFinite(simulated.cb_before)
        ? simulated.cb_before.toFixed(2)
        : "—";
      errors.push(
        `Deficit ship ${ship.ship_id} would exit with worse CB (${afterStr} < ${beforeStr}).`,
      );
    }
  }

  // Rule 3: Surplus ship cannot exit negative (cb_after < 0)
  for (const ship of surplusShips) {
    const simulated = simulatedMembers.find((m) => m.ship_id === ship.ship_id);
    if (simulated && simulated.cb_after < 0) {
      const afterStr = Number.isFinite(simulated.cb_after)
        ? simulated.cb_after.toFixed(2)
        : "—";
      errors.push(
        `Surplus ship ${ship.ship_id} would exit negative (cb_after=${afterStr}).`,
      );
    }
  }

  return {
    isValid: errors.length === 0 && selectedShips.length > 0,
    validationErrors: errors,
    simulatedMembers,
  };
}

const PoolingPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [availableShips, setAvailableShips] = useState<AdjustedCompliance[]>(
    [],
  );
  const [selectedShipIds, setSelectedShipIds] = useState<string[]>([]);
  const [currentPool, setCurrentPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [poolSum, setPoolSum] = useState<number>(0);
  const [isPoolValid, setIsPoolValid] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fetchPoolingData = useCallback(async (year: number) => {
    try {
      setLoading(true);
      setError(null);
      const adjustedCbs =
        await fetchAdjustedComplianceBalanceUseCase.execute(year);
      setAvailableShips(adjustedCbs);
      setSelectedShipIds([]);
      setCurrentPool(null);
    } catch (err) {
      setError("Failed to fetch pooling data.");
      console.error(err);
      setAvailableShips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoolingData(selectedYear);
  }, [selectedYear, fetchPoolingData]);

  useEffect(() => {
    const selectedShips = availableShips.filter((ship) =>
      selectedShipIds.includes(ship.ship_id),
    );
    const sum = selectedShips.reduce(
      (acc, member) => acc + member.adjusted_cb_gco2eq,
      0,
    );
    setPoolSum(sum);

    if (selectedShipIds.length === 0) {
      setIsPoolValid(false);
      setValidationErrors([]);
      return;
    }

    // Full validation including rules 2 & 3
    const { isValid, validationErrors: errors } =
      simulatePoolAllocation(selectedShips);
    setIsPoolValid(isValid);
    setValidationErrors(errors);
  }, [selectedShipIds, availableShips]);

  const handleShipSelectionChange = (shipId: string, isSelected: boolean) => {
    setSelectedShipIds((prev) =>
      isSelected ? [...prev, shipId] : prev.filter((id) => id !== shipId),
    );
  };

  const handleCreatePool = async () => {
    if (!isPoolValid) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const poolRequest: PoolCreationRequest = {
        year: selectedYear,
        member_ship_ids: selectedShipIds,
      };
      const newPool = await createPoolUseCase.execute(poolRequest);
      setCurrentPool(newPool);
      await fetchPoolingData(selectedYear);
    } catch (err) {
      setError("Failed to create pool.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    fetchPoolingData(selectedYear);
  };

  const currentYear = new Date().getFullYear();
  const years = generateYears(currentYear - 5, currentYear + 5);

  const membersInPoolDisplay: PoolMemberDisplay[] =
    currentPool?.members.map((member) => {
      const ship = availableShips.find((s) => s.ship_id === member.ship_id);
      return {
        pool_id: member.pool_id,
        ship_id: member.ship_id,
        cb_before: member.cb_before,
        cb_after: member.cb_after,
        ship_name: ship ? `Ship ${ship.ship_id}` : member.ship_id,
      };
    }) ?? [];

  return (
    <>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Pooling Overview
          </h1>
          <p className="text-slate-500">
            Create and manage compliance pooling arrangements
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
          <div className="flex gap-2 ml-4 shrink-0">
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-destructive/20 hover:bg-destructive/30 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={handleDismissError}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-destructive/10 hover:bg-destructive/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <YearSelector
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        availableYears={years}
      />

      {loading ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center mt-6 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
          <p className="text-muted-foreground">Loading pooling data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div>
            <AvailableShips
              ships={availableShips}
              selectedShipIds={selectedShipIds}
              onSelectShip={handleShipSelectionChange}
            />
          </div>
          <div>
            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive mb-4">
                <p className="text-sm font-medium mb-1">Validation Errors:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            <PoolValidation poolSum={poolSum} isPoolValid={isPoolValid} />
            <PoolMembers members={membersInPoolDisplay} />
            <CreatePoolButton
              onCreatePool={handleCreatePool}
              isPoolValid={isPoolValid}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PoolingPage;
