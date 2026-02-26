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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-xl">
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Baseline Average</p>
        </div>
        <p className="text-3xl font-bold font-mono text-slate-800 tabular-nums">
          {averageBaselineGhg.toFixed(2)}
        </p>
        <p className="text-xs text-slate-500 mt-2">gCO₂e/MJ</p>
      </Card>

      <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-xl">
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Optimized Average</p>
        </div>
        <p className={`text-3xl font-bold font-mono tabular-nums ${percentDiff < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {averageComparisonGhg.toFixed(2)}
        </p>
        <p className="text-xs text-slate-500 mt-2">gCO₂e/MJ</p>
      </Card>

      <Card className="p-6 flex flex-col justify-between bg-white border-slate-200 shadow-sm rounded-xl">
        <div>
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Compliance</p>
          </div>
          <p className={`text-xl font-bold ${percentDiff < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {percentDiff < 0 ? '↓' : '↑'} {Math.abs(percentDiff).toFixed(2)}%
          </p>
          <p className="text-xs text-slate-500 mt-2">Target: <span className="font-mono">{targetGhgIntensity.toFixed(2)}</span></p>
        </div>
        <ComplianceIndicator isCompliant={isCompliant} />
      </Card>
    </div>
  );
};
