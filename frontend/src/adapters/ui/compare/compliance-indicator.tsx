import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ComplianceIndicatorProps {
  isCompliant: boolean;
}

export const ComplianceIndicator: React.FC<ComplianceIndicatorProps> = ({ isCompliant }) => {
  return (
    <div className={`flex items-center gap-2 mt-4 p-2 rounded-md ${isCompliant ? 'bg-primary-100 text-primary-700' : 'bg-destructive/10 text-destructive'}`}>
      {isCompliant ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : (
        <XCircle className="h-5 w-5" />
      )}
      <span className="font-semibold">
        {isCompliant ? 'Compliant' : 'Non-Compliant'}
      </span>
    </div>
  );
};
