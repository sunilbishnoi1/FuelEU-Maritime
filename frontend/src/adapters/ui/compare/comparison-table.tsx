import React from "react";
import type { Route } from "../../../core/domain/entities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/components/table";
import { Badge } from "../../../shared/components/badge";

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
  // Use the average GHG of all baseline routes as the reference
  const baselineGhg =
    baselineRoutes.length > 0
      ? baselineRoutes.reduce((sum, r) => sum + r.ghgIntensity, 0) /
        baselineRoutes.length
      : null;

  const calculatePercentDiff = (comparisonGhg: number, refGhg: number) => {
    if (refGhg === 0) return 0;
    return (comparisonGhg / refGhg - 1) * 100;
  };

  const getComplianceStatus = (ghgIntensity: number) => {
    return ghgIntensity <= targetGhgIntensity;
  };

  // Compare every non-baseline route against the baseline reference
  const combinedRoutes = comparisonRoutes.map((compRoute) => {
    const percentDiff =
      baselineGhg !== null
        ? calculatePercentDiff(compRoute.ghgIntensity, baselineGhg)
        : 0;
    const compliant = getComplianceStatus(compRoute.ghgIntensity);
    return {
      ...compRoute,
      percentDiff,
      compliant,
      baselineGhgValue: baselineGhg,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">
          Route-by-Route Comparison
        </h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Route ID
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Year
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Baseline GHG
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Optimized GHG
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              % Change
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Compliant
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinedRoutes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-slate-500 py-6"
              >
                No comparison routes available.
              </TableCell>
            </TableRow>
          ) : (
            combinedRoutes.map((route, idx) => (
              <TableRow
                key={route.id}
                className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                }`}
              >
                <TableCell className="font-semibold text-slate-800">
                  {route.routeId}
                </TableCell>
                <TableCell className="text-slate-600">
                  {route.year}
                </TableCell>
                <TableCell className="text-slate-600 font-mono text-sm tabular-nums">
                  {route.baselineGhgValue !== null
                    ? route.baselineGhgValue.toFixed(2)
                    : "N/A"}
                </TableCell>
                <TableCell className="text-slate-600 font-mono text-sm tabular-nums">
                  {route.ghgIntensity.toFixed(2)}
                </TableCell>
                <TableCell
                  className={`font-semibold font-mono text-sm tabular-nums ${route.percentDiff < 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {route.percentDiff > 0 ? "+" : ""}{route.percentDiff.toFixed(2)}%
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={route.compliant ? "success" : "error"}
                    className={
                      route.compliant
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }
                  >
                    {route.compliant ? "Compliant" : "Non-Compliant"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
