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
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Route-by-Route Comparison</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route ID</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Baseline GHG (gCO₂e/MJ)</TableHead>
            <TableHead>Comparison GHG (gCO₂e/MJ)</TableHead>
            <TableHead>% Difference</TableHead>
            <TableHead>Compliant</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinedRoutes.map((route) => (
            <TableRow key={route.id}>
              <TableCell className="font-medium">{route.routeId}</TableCell>
              <TableCell>{route.year}</TableCell>
              <TableCell>{route.baselineGhg ? route.baselineGhg.toFixed(2) : 'N/A'}</TableCell>
              <TableCell>{route.ghgIntensity.toFixed(2)}</TableCell>
              <TableCell>{route.percentDiff.toFixed(2)}%</TableCell>
              <TableCell>
                <Badge variant={route.compliant ? 'success' : 'destructive'}>
                  {route.compliant ? '✅ Yes' : '❌ No'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
