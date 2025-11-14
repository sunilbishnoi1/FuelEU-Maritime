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
import { Button } from '../../../shared/components/button';

interface RoutesTableProps {
  routes: Route[];
  onSetBaseline: (id: string) => void;
}

export const RoutesTable: React.FC<RoutesTableProps> = ({ routes, onSetBaseline }) => {
  if (routes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-600">No routes available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm mt-6">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="text-emerald-900 font-semibold">Route ID</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Vessel Type</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Fuel Type</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Year</TableHead>
            <TableHead className="text-emerald-900 font-semibold">GHG Intensity</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Fuel (t)</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Distance (km)</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Emissions (t)</TableHead>
            <TableHead className="text-emerald-900 font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route, idx) => (
            <TableRow
              key={route.id}
              className={`border-b border-slate-200 hover:bg-emerald-50 transition-colors ${
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              <TableCell className="font-semibold text-emerald-700">{route.routeId}</TableCell>
              <TableCell className="text-slate-700">{route.vesselType}</TableCell>
              <TableCell className="text-slate-700">{route.fuelType}</TableCell>
              <TableCell className="text-slate-700">{route.year}</TableCell>
              <TableCell className="text-slate-700 font-mono text-sm">{route.ghgIntensity.toFixed(2)}</TableCell>
              <TableCell className="text-slate-700 font-mono text-sm">{route.fuelConsumption.toFixed(2)}</TableCell>
              <TableCell className="text-slate-700 font-mono text-sm">{route.distance.toFixed(2)}</TableCell>
              <TableCell className="text-slate-700 font-mono text-sm">{route.totalEmissions.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetBaseline(route.id)}
                >
                  Set Baseline
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
