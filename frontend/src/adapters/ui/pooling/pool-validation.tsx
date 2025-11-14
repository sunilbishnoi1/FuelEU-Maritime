import React from 'react';
import { Card } from '../../../shared/components/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PoolValidationProps {
  poolSum: number;
  isPoolValid: boolean;
}

export const PoolValidation: React.FC<PoolValidationProps> = ({ poolSum, isPoolValid }) => {
  return (
    <Card className="p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-secondary-900">Pool Validation</h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-secondary-700">Total Adjusted CB of Selected Ships:</span>
        <span className={`text-lg font-bold font-mono ${poolSum >= 0 ? 'text-primary-700' : 'text-destructive'}`}>
          {poolSum.toFixed(2)} gCO₂eq
        </span>
      </div>
      <div className={`flex items-center gap-2 mt-4 p-3 rounded-md ${isPoolValid ? 'bg-primary-50' : 'bg-destructive/10'}`}>
        {isPoolValid ? (
          <CheckCircle2 className="h-5 w-5 text-primary-700" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
        <span className={`font-semibold text-sm ${isPoolValid ? 'text-primary-700' : 'text-destructive'}`}>
          {isPoolValid ? 'Pool is Valid' : 'Pool is Invalid (Sum must be >= 0 and at least one ship selected)'}
        </span>
      </div>
    </Card>
  );
};
