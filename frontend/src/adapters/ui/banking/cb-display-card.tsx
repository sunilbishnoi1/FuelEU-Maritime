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
  const isBefore = cbBefore >= 0;
  const isAfter = cbAfter >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
      <Card className="p-6">
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CB Before Banking</p>
          <p className="text-xs text-muted-foreground">{year}</p>
        </div>
        <p className={`text-3xl font-bold font-mono ${isBefore ? 'text-primary-700' : 'text-destructive'}`}>
          {cbBefore.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">gCO₂eq</p>
      </Card>

      <Card className="p-6">
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Applied Credits</p>
          <p className="text-xs text-muted-foreground">{year}</p>
        </div>
        <p className="text-3xl font-bold font-mono text-accent-700">
          {applied.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">gCO₂eq</p>
      </Card>

      <Card className="p-6">
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CB After Banking</p>
          <p className="text-xs text-muted-foreground">{year}</p>
        </div>
        <p className={`text-3xl font-bold font-mono ${isAfter ? 'text-primary-700' : 'text-destructive'}`}>
          {cbAfter.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">gCO₂eq</p>
      </Card>
    </div>
  );
};
