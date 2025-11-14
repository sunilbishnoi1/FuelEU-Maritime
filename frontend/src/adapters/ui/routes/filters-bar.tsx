import React, { useState } from "react";
import type { RouteFilters } from "../../../types";
import { Button } from "../../../shared/components/button";
import { CustomSelect } from "../../../shared/components/select";

interface FiltersBarProps {
  onFilterChange: (filters: RouteFilters) => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({ onFilterChange }) => {
  const [vesselType, setVesselType] = useState<string>("");
  const [fuelType, setFuelType] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const handleApplyFilters = () => {
    onFilterChange({
      vesselType: vesselType || undefined,
      fuelType: fuelType || undefined,
      year: year ? parseInt(year, 10) : undefined,
    });
  };

  const handleClearFilters = () => {
    setVesselType("");
    setFuelType("");
    setYear("");
    onFilterChange({});
  };

  // Mock data for select options - replace with actual data fetched from API if available
  const vesselTypeOptions = [
    { value: "Container", label: "Container" },
    { value: "BulkCarrier", label: "Bulk Carrier" },
    { value: "Tanker", label: "Tanker" },
    { value: "RoRo", label: "RoRo" },
  ];

  const fuelTypeOptions = [
    { value: "HFO", label: "HFO" },
    { value: "LNG", label: "LNG" },
    { value: "MGO", label: "MGO" },
  ];

  const yearOptions = [
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[150px] mb-4">
        <label
          htmlFor="vesselType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Vessel Type
        </label>
        <CustomSelect
          id="vesselType"
          value={vesselType}
          onValueChange={setVesselType}
          options={vesselTypeOptions}
          placeholder="Select vessel type"
        />
      </div>
      <div className="flex-1 min-w-[150px] mb-4">
        <label
          htmlFor="fuelType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Fuel Type
        </label>
        <CustomSelect
          id="fuelType"
          value={fuelType}
          onValueChange={setFuelType}
          options={fuelTypeOptions}
          placeholder="Select fuel type"
        />
      </div>
      <div className="flex-1 min-w-[100px] mb-4">
        <label
          htmlFor="year"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Year
        </label>
        <CustomSelect
          id="year"
          value={year}
          onValueChange={setYear}
          options={yearOptions}
          placeholder="Select year"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
};
