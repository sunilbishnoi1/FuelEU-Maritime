import React from "react";
import type { AdjustedCompliance } from "../../../core/domain/entities";
import { Card } from "../../../shared/components/card";
import { Checkbox } from "../../../shared/components/checkbox";

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
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-secondary-900">
        Available Ships
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {ships.length === 0 ? (
          <p className="text-muted-foreground">
            No ships available for pooling
          </p>
        ) : (
          ships.map((ship) => {
            const val = Number(ship.adjusted_cb_gco2eq);
            const isPositive = Number.isFinite(val) ? val >= 0 : false;
            const display = Number.isFinite(val)
              ? `${isPositive ? "+" : ""}${val.toFixed(2)}`
              : "—";
            return (
              <div
                key={ship.ship_id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-primary-50 transition-colors border border-border"
              >
                <label
                  htmlFor={`ship-${ship.ship_id}`}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <Checkbox
                    id={`ship-${ship.ship_id}`}
                    checked={selectedShipIds.includes(ship.ship_id)}
                    onCheckedChange={(checked) =>
                      onSelectShip(ship.ship_id, checked as boolean)
                    }
                  />
                  <span className="font-medium text-secondary-800">
                    Ship {ship.ship_id}
                  </span>
                </label>
                <span
                  className={`text-xs font-mono ml-2 ${isPositive ? "text-primary-700" : "text-destructive"}`}
                >
                  {display}
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
