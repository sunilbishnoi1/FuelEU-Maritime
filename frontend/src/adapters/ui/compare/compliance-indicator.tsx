import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ComplianceIndicatorProps {
  isCompliant: boolean;
}

export const ComplianceIndicator: React.FC<ComplianceIndicatorProps> = ({ isCompliant }) => {
  return (
    <div className={`flex items-center gap-2 mt-4 p-2.5 rounded-lg border ${isCompliant ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
      {isCompliant ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : (
        <XCircle className="h-5 w-5" />
      )}
      <span className="font-semibold text-sm">
        {isCompliant ? 'Compliant' : 'Non-Compliant'}
      </span>
    </div>
  );
};
