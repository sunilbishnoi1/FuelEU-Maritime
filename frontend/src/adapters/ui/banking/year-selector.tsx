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
    <div className="mb-6 p-4 rounded-lg shadow-md bg-white">
      <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
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
