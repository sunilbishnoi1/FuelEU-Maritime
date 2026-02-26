import React from 'react';
import { Card } from '../../../shared/components/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PoolValidationProps {
  poolSum: number;
  isPoolValid: boolean;
}

export const PoolValidation: React.FC<PoolValidationProps> = ({ poolSum, isPoolValid }) => {
  return (
    <Card className="p-6 mb-6 bg-white border-slate-200 shadow-sm rounded-xl">
      <h3 className="text-xl font-semibold mb-4 text-slate-900">Pool Validation</h3>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 font-medium">Total Adjusted CB of Selected Ships:</span>
        <span className={`text-xl font-bold font-mono tabular-nums ${poolSum >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {poolSum >= 0 ? '+' : ''}{poolSum.toFixed(2)} <span className="text-sm font-normal text-slate-500">gCO₂eq</span>
        </span>
      </div>
      <div className={`flex items-center gap-2 mt-5 p-4 rounded-lg border ${isPoolValid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        {isPoolValid ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 text-rose-600" />
        )}
        <span className={`font-semibold text-sm ${isPoolValid ? 'text-emerald-700' : 'text-rose-700'}`}>
          {isPoolValid ? 'Pool is Valid' : 'Pool is Invalid (Sum must be >= 0 and at least one ship selected)'}
        </span>
      </div>
    </Card>
  );
};
