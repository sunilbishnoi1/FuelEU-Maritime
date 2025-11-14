import React from 'react';
import { CustomSelect } from '../../../shared/components/select';

interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  onYearChange,
  availableYears,
}) => {
  const yearOptions = availableYears.map(year => ({
    value: String(year),
    label: String(year),
  }));

  return (
    <div className="mb-6 p-6 rounded-lg shadow-sm bg-card border border-border">
      <label htmlFor="year-select" className="block text-sm font-semibold text-secondary-900 mb-2">Select Year</label>
      <CustomSelect
        id="year-select"
        value={String(selectedYear)}
        onValueChange={(value) => onYearChange(parseInt(value, 10))}
        options={yearOptions}
        placeholder="Select a year"
        className="w-[180px]"
      />
    </div>
  );
};
