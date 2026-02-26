import React, { useEffect, useState } from "react";
import { fetchComparisonUseCase } from "../../../composition-root";
import type { Route } from "../../../core/domain/entities";
import { TARGET_GHG_INTENSITY } from "../../../core/domain/constants";
import { ComparisonTable } from "../compare/comparison-table";
import { ComparisonChart } from "../compare/comparison-chart";
import { ComparisonSummary } from "../compare/comparison-summary";

const ComparePage: React.FC = () => {
  const [baselineRoutes, setBaselineRoutes] = useState<Route[]>([]);
  const [comparisonRoutes, setComparisonRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { baseline, comparison } = await fetchComparisonUseCase.execute();
      setBaselineRoutes(baseline);
      setComparisonRoutes(comparison);
    } catch (err) {
      setError("Failed to fetch comparison data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparisonData();
  }, []);

  const handleDismissError = () => {
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    loadComparisonData();
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            GHG Intensity Comparison
          </h1>
          <p className="text-slate-500">
            Compare baseline vs. optimized routes
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

      {loading ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
          <p className="text-muted-foreground">Loading comparison data...</p>
        </div>
      ) : (
        <>
          <ComparisonSummary
            baselineRoutes={baselineRoutes}
            comparisonRoutes={comparisonRoutes}
            targetGhgIntensity={TARGET_GHG_INTENSITY}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <ComparisonTable
              baselineRoutes={baselineRoutes}
              comparisonRoutes={comparisonRoutes}
              targetGhgIntensity={TARGET_GHG_INTENSITY}
            />
            <ComparisonChart
              baselineRoutes={baselineRoutes}
              comparisonRoutes={comparisonRoutes}
              targetGhgIntensity={TARGET_GHG_INTENSITY}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ComparePage;
