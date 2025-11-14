import React from 'react';
import type { Route } from '../../../core/domain/entities';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/components/table';
import { Badge } from '../../../shared/components/badge';

interface ComparisonTableProps {
  baselineRoutes: Route[];
  comparisonRoutes: Route[];
  targetGhgIntensity: number;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  baselineRoutes,
  comparisonRoutes,
  targetGhgIntensity,
}) => {
  const calculatePercentDiff = (comparisonGhg: number, baselineGhg: number) => {
    if (baselineGhg === 0) return 0;
    return ((comparisonGhg / baselineGhg - 1) * 100);
  };

  const getComplianceStatus = (ghgIntensity: number) => {
    return ghgIntensity <= targetGhgIntensity;
  };

  // Combine routes for display, assuming a 1:1 or similar mapping for comparison
  // For simplicity, we'll just display comparison routes and try to match them with baselines
  const combinedRoutes = comparisonRoutes.map(compRoute => {
    const baselineRoute = baselineRoutes.find(bRoute => bRoute.routeId === compRoute.routeId);
    const percentDiff = baselineRoute ? calculatePercentDiff(compRoute.ghgIntensity, baselineRoute.ghgIntensity) : 0;
    const compliant = getComplianceStatus(compRoute.ghgIntensity);
    return { ...compRoute, percentDiff, compliant, baselineGhg: baselineRoute?.ghgIntensity };
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-emerald-900">Route-by-Route Comparison</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="text-emerald-900 font-semibold">Route ID</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Year</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Baseline GHG</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Optimized GHG</TableHead>
            <TableHead className="text-emerald-900 font-semibold">% Change</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Compliant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinedRoutes.map((route, idx) => (
            <TableRow
              key={route.id}
              className={`border-b border-slate-200 hover:bg-emerald-50 transition-colors ${
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              <TableCell className="font-semibold text-emerald-700">{route.routeId}</TableCell>
              <TableCell className="text-slate-700">{route.year}</TableCell>
              <TableCell className="text-slate-700 font-mono text-sm">{route.baselineGhg ? route.baselineGhg.toFixed(2) : 'N/A'}</TableCell>
              <TableCell className="text-slate-700 font-mono text-sm">{route.ghgIntensity.toFixed(2)}</TableCell>
              <TableCell className={`font-semibold font-mono text-sm ${route.percentDiff < 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {route.percentDiff.toFixed(2)}%
              </TableCell>
              <TableCell>
                <Badge variant={route.compliant ? 'success' : 'error'}>
                  {route.compliant ? 'Compliant' : 'Non-Compliant'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
