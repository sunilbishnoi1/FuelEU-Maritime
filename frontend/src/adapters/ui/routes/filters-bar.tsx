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
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label
            htmlFor="vesselType"
            className="block text-sm font-semibold text-emerald-900 mb-2"
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
        <div className="flex-1 min-w-[180px]">
          <label
            htmlFor="fuelType"
            className="block text-sm font-semibold text-emerald-900 mb-2"
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
        <div className="flex-1 min-w-[140px]">
          <label
            htmlFor="year"
            className="block text-sm font-semibold text-emerald-900 mb-2"
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
        <div className="flex gap-3">
          <Button onClick={handleApplyFilters} variant="primary">
            Apply
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};
