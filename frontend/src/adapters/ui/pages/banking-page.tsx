import React, { useState, useEffect, useCallback } from "react";
import {
  fetchComplianceBalanceUseCase,
  bankSurplusUseCase,
  applyBankedCreditUseCase,
  fetchAdjustedComplianceBalanceUseCase,
} from "../../../composition-root";
import type {
  ComplianceBalance,
  BankingSummary,
  AdjustedCompliance,
} from "../../../core/domain/entities";
import { YearSelector } from "../banking/year-selector";
import { CbDisplayCard } from "../banking/cb-display-card";
import { ActionButtons } from "../banking/action-buttons";
import { TransactionHistory } from "../banking/transaction-history";
import { CustomSelect } from "../../../shared/components/select";

// Helper to generate a range of years
const generateYears = (startYear: number, endYear: number): number[] => {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

const BankingPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [shipId, setShipId] = useState<string>("");
  const [availableShips, setAvailableShips] = useState<AdjustedCompliance[]>(
    [],
  );
  const [complianceBalance, setComplianceBalance] =
    useState<ComplianceBalance | null>(null);
  const [bankingSummary, setBankingSummary] = useState<BankingSummary | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available ships for the year
  const fetchShips = useCallback(async (year: number) => {
    try {
      const ships = await fetchAdjustedComplianceBalanceUseCase.execute(year);
      setAvailableShips(ships);
      // Auto-select first ship if none selected or current selection invalid
      if (ships.length > 0) {
        setShipId((prev) => {
          const stillValid = ships.some((s) => s.ship_id === prev);
          return stillValid ? prev : ships[0].ship_id;
        });
      } else {
        setShipId("");
      }
    } catch {
      // If we can't fetch ships, keep the list empty
      setAvailableShips([]);
    }
  }, []);

  const fetchComplianceData = useCallback(
    async (currentShipId: string, year: number) => {
      if (!currentShipId) {
        setComplianceBalance(null);
        setBankingSummary(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const cb = await fetchComplianceBalanceUseCase.execute(
          currentShipId,
          year,
        );

        if (cb === null) {
          setError("Compliance data not found for the selected ship and year.");
          setComplianceBalance(null);
          setBankingSummary(null);
        } else {
          setComplianceBalance(cb);
          setBankingSummary({
            year: cb.year,
            cb_before: cb.cb_before,
            applied: cb.applied,
            cb_after: cb.cb_after,
          });
        }
      } catch (err) {
        setError("Failed to fetch compliance data.");
        console.error(err);
        setComplianceBalance(null);
        setBankingSummary(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchShips(selectedYear);
  }, [selectedYear, fetchShips]);

  useEffect(() => {
    if (shipId) {
      fetchComplianceData(shipId, selectedYear);
    } else {
      setComplianceBalance(null);
      setBankingSummary(null);
      setLoading(false);
    }
  }, [selectedYear, shipId, fetchComplianceData]);

  const handleBankSurplus = async () => {
    try {
      setLoading(true);
      setError(null);
      await bankSurplusUseCase.execute(shipId, selectedYear);
      // Refetch compliance data after banking to get actual updated values
      await fetchComplianceData(shipId, selectedYear);
    } catch (err) {
      setError("Failed to bank surplus.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleApplyBankedCredit = async (amount: number) => {
    try {
      setLoading(true);
      setError(null);
      await applyBankedCreditUseCase.execute(shipId, selectedYear, amount);
      // Refetch compliance data after applying to get actual values
      await fetchComplianceData(shipId, selectedYear);
    } catch (err) {
      setError("Failed to apply banked credit.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    fetchComplianceData(shipId, selectedYear);
  };

  const currentYear = new Date().getFullYear();
  const availableYears = generateYears(currentYear - 5, currentYear + 5);

  const shipOptions = availableShips.map((s) => ({
    value: s.ship_id,
    label: `Ship ${s.ship_id}`,
  }));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-900 mb-2">
          Banking Overview
        </h1>
        <p className="text-secondary-600">
          Manage compliance balance banking and credits
        </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <YearSelector
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
        />
        <div className="p-6 rounded-lg shadow-sm bg-card border border-border">
          <label
            htmlFor="ship-select"
            className="block text-sm font-semibold text-secondary-900 mb-2"
          >
            Select Ship
          </label>
          {shipOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No ships available for this year.
            </p>
          ) : (
            <CustomSelect
              id="ship-select"
              value={shipId}
              onValueChange={setShipId}
              options={shipOptions}
              placeholder="Select a ship"
              className="w-[220px]"
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center mt-6 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
          <p className="text-muted-foreground">Loading banking data...</p>
        </div>
      ) : (
        <>
          {bankingSummary && (
            <CbDisplayCard
              year={bankingSummary.year}
              cbBefore={bankingSummary.cb_before}
              applied={bankingSummary.applied}
              cbAfter={bankingSummary.cb_after}
            />
          )}
          {complianceBalance && (
            <>
              <ActionButtons
                currentCb={complianceBalance.cb_after}
                onBankSurplus={handleBankSurplus}
                onApplyBankedCredit={handleApplyBankedCredit}
              />
              {complianceBalance.transactions.length > 0 && (
                <div className="mt-6">
                  <TransactionHistory
                    transactions={complianceBalance.transactions}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default BankingPage;
