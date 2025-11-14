import React from 'react';
import type { Route } from '../../../core/domain/entities';
import { Card } from '../../../shared/components/card';
import { ComplianceIndicator } from './compliance-indicator';

interface ComparisonSummaryProps {
  baselineRoutes: Route[];
  comparisonRoutes: Route[];
  targetGhgIntensity: number;
}

export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({
  baselineRoutes,
  comparisonRoutes,
  targetGhgIntensity,
}) => {
  const calculateAverageGhg = (routes: Route[]) => {
    if (routes.length === 0) return 0;
    const totalGhg = routes.reduce((sum, route) => sum + route.ghgIntensity, 0);
    return totalGhg / routes.length;
  };

  const averageBaselineGhg = calculateAverageGhg(baselineRoutes);
  const averageComparisonGhg = calculateAverageGhg(comparisonRoutes);

  const percentDiff = averageBaselineGhg
    ? ((averageComparisonGhg / averageBaselineGhg - 1) * 100)
    : 0;

  const isCompliant = averageComparisonGhg <= targetGhgIntensity;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Baseline Average GHG Intensity</h3>
        <p className="text-2xl font-bold text-gray-900">
          {averageBaselineGhg.toFixed(2)} gCO₂e/MJ
        </p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Comparison Average GHG Intensity</h3>
        <p className="text-2xl font-bold text-gray-900">
          {averageComparisonGhg.toFixed(2)} gCO₂e/MJ
        </p>
      </Card>
      <Card className="p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Compliance Status</h3>
          <p className="text-xl font-bold">
            {percentDiff.toFixed(2)}% difference from baseline
          </p>
          <p className="text-sm text-gray-600">Target: {targetGhgIntensity.toFixed(2)} gCO₂e/MJ</p>
        </div>
        <ComplianceIndicator isCompliant={isCompliant} />
      </Card>
    </div>
  );
};
