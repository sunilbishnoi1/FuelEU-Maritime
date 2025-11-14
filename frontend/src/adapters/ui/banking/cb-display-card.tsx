import React from 'react';
import { Card } from '../../../shared/components/card';

interface CbDisplayCardProps {
  year: number;
  cbBefore: number;
  applied: number;
  cbAfter: number;
}

export const CbDisplayCard: React.FC<CbDisplayCardProps> = ({
  year,
  cbBefore,
  applied,
  cbAfter,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Compliance Balance (CB) Before Banking ({year})</h3>
        <p className="text-2xl font-bold text-gray-900">
          {cbBefore.toFixed(2)} gCO₂eq
        </p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Applied Credits ({year})</h3>
        <p className="text-2xl font-bold text-gray-900">
          {applied.toFixed(2)} gCO₂eq
        </p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">CB After Banking/Applying ({year})</h3>
        <p className="text-2xl font-bold text-gray-900">
          {cbAfter.toFixed(2)} gCO₂eq
        </p>
      </Card>
    </div>
  );
};
