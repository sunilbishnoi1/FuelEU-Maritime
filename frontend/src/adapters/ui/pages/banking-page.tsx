import React, { useState, useEffect } from 'react';
import {
  fetchComplianceBalanceUseCase,
  bankSurplusUseCase,
  applyBankedCreditUseCase,
} from '../../../core/application/service-locator';
import type { ComplianceBalance } from '../../../core/domain/entities';
import type { BankingSummary } from '../../../types';
import { YearSelector } from '../banking/year-selector';
import { CbDisplayCard } from '../banking/cb-display-card';
import { ActionButtons } from '../banking/action-buttons';

// Helper to generate a range of years
const generateYears = (startYear: number, endYear: number): number[] => {
  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

const BankingPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [complianceBalance, setComplianceBalance] = useState<ComplianceBalance | null>(null);
  const [bankingSummary, setBankingSummary] = useState<BankingSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplianceData = async (year: number) => {
    try {
      setLoading(true);
      const cb = await fetchComplianceBalanceUseCase.execute(year);
      setComplianceBalance(cb);
      // For bankingSummary, we'll need to derive or fetch more detailed banking info
      // For now, we'll use placeholders or simplified data
      setBankingSummary({
        year: cb.year,
        cb_before: cb.cb_before,
        applied: cb.applied, // Assuming 'applied' is part of ComplianceBalance for simplicity
        cb_after: cb.cb_after, // Assuming 'cb_after' is part of ComplianceBalance for simplicity
      });
    } catch (err) {
      setError('Failed to fetch compliance data.');
      console.error(err);
      setComplianceBalance(null);
      setBankingSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData(selectedYear);
  }, [selectedYear]);

  const handleBankSurplus = async () => {
    try {
      setLoading(true);
      const result = await bankSurplusUseCase.execute(selectedYear);
      // After banking, refetch all data to get updated balances
      await fetchComplianceData(selectedYear);
      // Optionally, update bankingSummary with the result if it contains more details
      setBankingSummary(result);
    } catch (err) {
      setError('Failed to bank surplus.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBankedCredit = async (amount: number) => {
    try {
      setLoading(true);
      const result = await applyBankedCreditUseCase.execute(selectedYear, amount);
      // After applying, refetch all data to get updated balances
      await fetchComplianceData(selectedYear);
      // Optionally, update bankingSummary with the result if it contains more details
      setBankingSummary(result);
    } catch (err) {
      setError('Failed to apply banked credit.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-destructive">
        <h3 className="font-semibold mb-2">Error Loading Banking Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const availableYears = generateYears(currentYear - 5, currentYear + 5);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-900 mb-2">Banking Overview</h1>
        <p className="text-secondary-600">Manage compliance balance banking and credits</p>
      </div>

      <YearSelector
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        availableYears={availableYears}
      />

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
            <ActionButtons
              currentCb={complianceBalance.cb_after}
              onBankSurplus={handleBankSurplus}
              onApplyBankedCredit={handleApplyBankedCredit}
            />
          )}
        </>
      )}
    </>
  );
};

export default BankingPage;
