import React from 'react';
import { Card } from '../../../shared/components/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PoolValidationProps {
  poolSum: number;
  isPoolValid: boolean;
}

export const PoolValidation: React.FC<PoolValidationProps> = ({ poolSum, isPoolValid }) => {
  return (
    <Card className="p-4 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Pool Validation</h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-700">Total Adjusted CB of Selected Ships:</span>
        <span className={`text-lg font-bold ${poolSum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {poolSum.toFixed(2)} gCO₂eq
        </span>
      </div>
      <div className="flex items-center gap-2 mt-4 p-2 rounded-md">
        {isPoolValid ? (
          <CheckCircle2 className="h-5 w-5 text-green-700" />
        ) : (
          <XCircle className="h-5 w-5 text-red-700" />
        )}
        <span className={`font-semibold ${isPoolValid ? 'text-green-700' : 'text-red-700'}`}>
          {isPoolValid ? 'Pool is Valid' : 'Pool is Invalid (Sum must be >= 0 and at least one ship selected)'}
        </span>
      </div>
    </Card>
  );
};
