import React from 'react';
import type { AdjustedCompliance } from '../../../types';
import { Card } from '../../../shared/components/card';
import { Checkbox } from '../../../shared/components/checkbox';

interface AvailableShipsProps {
  ships: AdjustedCompliance[];
  selectedShipIds: string[];
  onSelectShip: (shipId: string, isSelected: boolean) => void;
}

export const AvailableShips: React.FC<AvailableShipsProps> = ({
  ships,
  selectedShipIds,
  onSelectShip,
}) => {
  return (
    <Card className="p-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Available Ships for Pooling</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {ships.length === 0 ? (
          <p className="text-gray-500">No ships available for pooling in this year.</p>
        ) : (
          ships.map((ship) => (
            <div key={ship.ship_id} className="flex items-center justify-between">
              <label htmlFor={`ship-${ship.ship_id}`} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id={`ship-${ship.ship_id}`}
                  checked={selectedShipIds.includes(ship.ship_id)}
                  onCheckedChange={(checked) => onSelectShip(ship.ship_id, checked as boolean)}
                />
                <span className="text-gray-700">Ship {ship.ship_id}</span>
              </label>
              <span className="text-sm text-gray-600">CB: {ship.adjusted_cb_gco2eq.toFixed(2)} gCO₂eq</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
