import React from 'react';
import { Button } from '../../../shared/components/button';

interface CreatePoolButtonProps {
  onCreatePool: () => void;
  isPoolValid: boolean;
}

export const CreatePoolButton: React.FC<CreatePoolButtonProps> = ({ onCreatePool, isPoolValid }) => {
  return (
    <div className="mt-6">
      <Button onClick={onCreatePool} disabled={!isPoolValid} className="w-full">
        Create Pool
      </Button>
    </div>
  );
};
