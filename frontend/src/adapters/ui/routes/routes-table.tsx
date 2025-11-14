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
  return (
    <div className=" bg-white p-4 mt-8 rounded-lg shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route ID</TableHead>
            <TableHead>Vessel Type</TableHead>
            <TableHead>Fuel Type</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>GHG Intensity (gCO₂e/MJ)</TableHead>
            <TableHead>Fuel Consumption (t)</TableHead>
            <TableHead>Distance (km)</TableHead>
            <TableHead>Total Emissions (t)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => (
            <TableRow key={route.id}>
              <TableCell className="font-medium">{route.routeId}</TableCell>
              <TableCell>{route.vesselType}</TableCell>
              <TableCell>{route.fuelType}</TableCell>
              <TableCell>{route.year}</TableCell>
              <TableCell>{route.ghgIntensity.toFixed(2)}</TableCell>
              <TableCell>{route.fuelConsumption.toFixed(2)}</TableCell>
              <TableCell>{route.distance.toFixed(2)}</TableCell>
              <TableCell>{route.totalEmissions.toFixed(2)}</TableCell>
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
