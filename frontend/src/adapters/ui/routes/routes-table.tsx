import React from 'react';
import { Package } from 'lucide-react';
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
      <div className="bg-card rounded-lg border border-border p-16 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">No Routes Found</h3>
          <p className="text-muted-foreground text-sm">
            No shipping routes match your current filters. Try adjusting your search criteria or clearing filters to see all available routes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary-50 border-b border-border">
            <TableHead className="text-secondary-900 font-semibold">Route ID</TableHead>
            <TableHead className="text-secondary-900 font-semibold">Vessel Type</TableHead>
            <TableHead className="text-secondary-900 font-semibold">Fuel Type</TableHead>
            <TableHead className="text-secondary-900 font-semibold">Year</TableHead>
            <TableHead className="text-secondary-900 font-semibold">GHG Intensity</TableHead>
            <TableHead className="text-secondary-900 font-semibold">Fuel (t)</TableHead>
            <TableHead className="text-secondary-900 font-semibold">Distance (km)</TableHead>
            <TableHead className="text-secondary-900 font-semibold">Emissions (t)</TableHead>
            <TableHead className="text-secondary-900 font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route, idx) => (
            <TableRow
              key={route.id}
              className={`border-b border-border hover:bg-primary-50/50 transition-colors ${
                idx % 2 === 0 ? 'bg-card' : 'bg-secondary-50/30'
              }`}
            >
              <TableCell className="font-semibold text-primary-700">{route.routeId}</TableCell>
              <TableCell className="text-secondary-700">{route.vesselType}</TableCell>
              <TableCell className="text-secondary-700">{route.fuelType}</TableCell>
              <TableCell className="text-secondary-700">{route.year}</TableCell>
              <TableCell className="text-secondary-700 font-mono text-sm">{route.ghgIntensity.toFixed(2)}</TableCell>
              <TableCell className="text-secondary-700 font-mono text-sm">{route.fuelConsumption.toFixed(2)}</TableCell>
              <TableCell className="text-secondary-700 font-mono text-sm">{route.distance.toFixed(2)}</TableCell>
              <TableCell className="text-secondary-700 font-mono text-sm">{route.totalEmissions.toFixed(2)}</TableCell>
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
