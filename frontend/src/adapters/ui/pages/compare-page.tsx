import React, { useEffect, useState } from 'react';
import { fetchComparisonUseCase } from '../../../core/application/service-locator';
import type { Route } from '../../../core/domain/entities';
import { ComparisonTable } from '../compare/comparison-table';
import { ComparisonChart } from '../compare/comparison-chart';
import { ComparisonSummary } from '../compare/comparison-summary';

const ComparePage: React.FC = () => {
  const [baselineRoutes, setBaselineRoutes] = useState<Route[]>([]);
  const [comparisonRoutes, setComparisonRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const TARGET_GHG_INTENSITY = 89.3368; // 2% below 91.16

  useEffect(() => {
    const loadComparisonData = async () => {
      try {
        setLoading(true);
        const { baseline, comparison } = await fetchComparisonUseCase.execute();
        setBaselineRoutes(baseline);
        setComparisonRoutes(comparison);
      } catch (err) {
        setError('Failed to fetch comparison data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadComparisonData();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
        <h3 className="font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">GHG Intensity Comparison</h1>
        <p className="text-slate-600">Compare baseline vs. optimized routes</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-600">Loading comparison data...</p>
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
