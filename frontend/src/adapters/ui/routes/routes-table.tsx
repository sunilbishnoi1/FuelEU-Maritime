import React, { useState } from "react";
import { Package, Star } from "lucide-react";
import type { Route } from "../../../core/domain/entities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/components/table";
import { Button } from "../../../shared/components/button";
import { Badge } from "../../../shared/components/badge";

interface RoutesTableProps {
  routes: Route[];
  onSetBaseline: (id: string) => void;
}

export const RoutesTable: React.FC<RoutesTableProps> = ({
  routes,
  onSetBaseline,
}) => {
  const [settingBaselineId, setSettingBaselineId] = useState<string | null>(null);

  const handleSetBaseline = async (id: string) => {
    setSettingBaselineId(id);
    try {
      await onSetBaseline(id);
    } finally {
      setSettingBaselineId(null);
    }
  };
  if (routes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="bg-slate-50 rounded-full p-4 mb-4">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Routes Found
          </h3>
          <p className="text-slate-500 text-sm">
            No shipping routes match your current filters. Try adjusting your
            search criteria or clearing filters to see all available routes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Route ID
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Vessel Type
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Fuel Type
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Year
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              GHG Intensity (gCO₂e/MJ)
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Fuel (t)
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Distance (km)
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Emissions (t)
            </TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route, idx) => (
            <TableRow
              key={route.id}
              className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
                route.isBaseline
                  ? "bg-blue-50/40"
                  : idx % 2 === 0
                    ? "bg-white"
                    : "bg-slate-50/30"
              }`}
            >
              <TableCell className="font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  {route.routeId}
                  {route.isBaseline && (
                    <Badge
                      variant="success"
                      className="text-xs flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      <Star className="w-3 h-3" />
                      Baseline
                    </Badge>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-slate-600">
                {route.vesselType}
              </TableCell>
              <TableCell className="text-slate-600">
                {route.fuelType}
              </TableCell>
              <TableCell className="text-slate-600">{route.year}</TableCell>
              <TableCell className="text-slate-600 font-mono text-sm tabular-nums">
                {route.ghgIntensity.toFixed(2)}
              </TableCell>
              <TableCell className="text-slate-600 font-mono text-sm tabular-nums">
                {route.fuelConsumption.toFixed(2)}
              </TableCell>
              <TableCell className="text-slate-600 font-mono text-sm tabular-nums">
                {route.distance.toFixed(2)}
              </TableCell>
              <TableCell className="text-slate-600 font-mono text-sm tabular-nums">
                {route.totalEmissions.toFixed(2)}
              </TableCell>
              <TableCell>
                {route.isBaseline ? (
                  <span className="text-xs text-slate-400 font-medium tracking-wide">
                    Current baseline
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetBaseline(route.id)}
                    disabled={settingBaselineId === route.id}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-3 py-1 h-auto text-xs font-semibold shadow-sm w-full min-w-[90px]"
                  >
                    {settingBaselineId === route.id ? "Setting..." : "Set Baseline"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
