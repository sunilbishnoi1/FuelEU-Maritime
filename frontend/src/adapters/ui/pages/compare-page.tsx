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

  if (loading) return <p>Loading comparison data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">GHG Intensity Comparison</h2>
      <ComparisonSummary
        baselineRoutes={baselineRoutes}
        comparisonRoutes={comparisonRoutes}
        targetGhgIntensity={TARGET_GHG_INTENSITY}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
  );
};

export default ComparePage;
