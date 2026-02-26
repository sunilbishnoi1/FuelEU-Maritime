import React, { useState } from 'react';
import { Button } from '../../../shared/components/button';
import { Input } from '../../../shared/components/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../shared/components/dialog';

interface ActionButtonsProps {
  currentCb: number;
  onBankSurplus: () => void;
  onApplyBankedCredit: (amount: number) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  currentCb,
  onBankSurplus,
  onApplyBankedCredit,
}) => {
  const [amountToApply, setAmountToApply] = useState<string>('');
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  const handleApplyClick = () => {
    const amount = parseFloat(amountToApply);
    if (!isNaN(amount) && amount > 0) {
      onApplyBankedCredit(amount);
      setIsApplyDialogOpen(false);
      setAmountToApply('');
      setValidationError('');
    } else {
      setValidationError('Please enter a valid positive amount to apply.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6 flex flex-col sm:flex-row gap-4">
      <Button
        onClick={onBankSurplus}
        disabled={currentCb <= 0}
        variant="primary"
      >
        Bank Surplus
      </Button>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            disabled={currentCb >= 0}
          >
            Apply Banked Credit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Apply Banked Credit</DialogTitle>
            <DialogDescription>
              Enter the amount of banked credit you wish to apply.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="amount" className="text-right text-sm font-semibold">
                Amount
              </label>
              <Input
                id="amount"
                type="number"
                value={amountToApply}
                onChange={(e) => {
                  setAmountToApply(e.target.value);
                  setValidationError('');
                }}
                className="col-span-3"
                placeholder="e.g., 1000"
              />
            </div>
            {validationError && (
              <div className="text-destructive text-sm">{validationError}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleApplyClick}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
