import React, { useState, useEffect } from 'react';
import {
  fetchAdjustedComplianceBalanceUseCase,
  createPoolUseCase,
} from '../../../core/application/service-locator';
import type { AdjustedCompliance, PoolCreationRequest } from '../../../types';
import type { Pool } from '../../../core/domain/entities';
import { YearSelector } from '../banking/year-selector'; // Reusing YearSelector
import { AvailableShips } from '../pooling/available-ships';
import { PoolMembers } from '../pooling/pool-members';
import { PoolValidation } from '../pooling/pool-validation';
import { CreatePoolButton } from '../pooling/create-pool-button';

// Helper to generate a range of years (re-using from banking-page)
const generateYears = (startYear: number, endYear: number): number[] => {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

const PoolingPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableShips, setAvailableShips] = useState<AdjustedCompliance[]>([]);
  const [selectedShipIds, setSelectedShipIds] = useState<string[]>([]);
  const [currentPool, setCurrentPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [poolSum, setPoolSum] = useState<number>(0);
  const [isPoolValid, setIsPoolValid] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  const fetchPoolingData = async (year: number) => {
    try {
      setLoading(true);
      const adjustedCbs = await fetchAdjustedComplianceBalanceUseCase.execute(year);
      setAvailableShips(adjustedCbs);
      // Clear selected ships and current pool when year changes
      setSelectedShipIds([]);
      setCurrentPool(null);
    } catch (err) {
      setError('Failed to fetch pooling data.');
      console.error(err);
      setAvailableShips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolingData(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    // Calculate pool sum and validate pool whenever selected ships or available ships change
    const members = availableShips.filter(ship => selectedShipIds.includes(ship.ship_id));
    const sum = members.reduce((acc, member) => acc + member.adjusted_cb_gco2eq, 0);
    setPoolSum(sum);

    // Basic validation rules (as per FEplan.md)
    // 1. Sum(adjustedCB) >= 0
    // 2. Deficit ship cannot exit worse (cb_after < cb_before for deficit ships)
    // 3. Surplus ship cannot exit negative (cb_after < 0 for surplus ships)
    // For now, we'll implement rule 1. Rules 2 and 3 require more complex logic involving cb_before/cb_after which are not directly in AdjustedCompliance.
    // This will be handled when creating the pool on the backend and validating the response.
    const isValid = sum >= 0 && selectedShipIds.length > 0;
    setIsPoolValid(isValid);
    
    // Clear validation error when pool becomes valid
    if (isValid) {
      setValidationError('');
    }
  }, [selectedShipIds, availableShips]);

  const handleShipSelectionChange = (shipId: string, isSelected: boolean) => {
    setSelectedShipIds(prev =>
      isSelected ? [...prev, shipId] : prev.filter(id => id !== shipId)
    );
  };

  const handleCreatePool = async () => {
    if (!isPoolValid) {
      setValidationError('Pool is not valid. Please ensure the sum of adjusted CB is non-negative and at least one ship is selected.');
      return;
    }
    setValidationError('');
    try {
      setLoading(true);
      const poolRequest: PoolCreationRequest = {
        year: selectedYear,
        member_ship_ids: selectedShipIds,
      };
      const newPool = await createPoolUseCase.execute(poolRequest);
      setCurrentPool(newPool);
      // After creating a pool, potentially refetch available ships or update their status
      await fetchPoolingData(selectedYear);
    } catch (err) {
      setError('Failed to create pool.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-destructive">
        <h3 className="font-semibold mb-2">Error Loading Pooling Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = generateYears(currentYear - 5, currentYear + 5);

  const membersInPoolDisplay = currentPool?.members.map(member => {
    const ship = availableShips.find(s => s.ship_id === member.ship_id);
    return {
      pool_id: member.pool_id,
      ship_id: member.ship_id,
      cb_before: member.cb_before,
      cb_after: member.cb_after,
      ship_name: ship ? `Ship ${ship.ship_id}` : member.ship_id,
    };
  }) || [];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-900 mb-2">Pooling Overview</h1>
        <p className="text-secondary-600">Create and manage compliance pooling arrangements</p>
      </div>

      <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} availableYears={years} />

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
            {validationError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive mb-4">
                <p className="text-sm font-medium">{validationError}</p>
              </div>
            )}
            <PoolValidation poolSum={poolSum} isPoolValid={isPoolValid} />
            <PoolMembers members={membersInPoolDisplay} />
            <CreatePoolButton onCreatePool={handleCreatePool} isPoolValid={isPoolValid} />
          </div>
        </div>
      )}
    </>
  );
};

export default PoolingPage;
