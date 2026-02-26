import React, { useState, useMemo } from "react";
import type { RouteFilters, Route } from "../../../core/domain/entities";
import { Button } from "../../../shared/components/button";
import { CustomSelect } from "../../../shared/components/select";

interface FiltersBarProps {
  onFilterChange: (filters: RouteFilters) => void;
  routes: Route[];
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  onFilterChange,
  routes,
}) => {
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

  // Derive filter options dynamically from actual route data
  const vesselTypeOptions = useMemo(() => {
    const types = [...new Set(routes.map((r) => r.vesselType))].sort();
    return types.map((t) => ({ value: t, label: t }));
  }, [routes]);

  const fuelTypeOptions = useMemo(() => {
    const types = [...new Set(routes.map((r) => r.fuelType))].sort();
    return types.map((t) => ({ value: t, label: t }));
  }, [routes]);

  const yearOptions = useMemo(() => {
    const years = [...new Set(routes.map((r) => r.year))].sort();
    return years.map((y) => ({ value: String(y), label: String(y) }));
  }, [routes]);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-3">
          <label
            htmlFor="vesselType"
            className="block text-sm font-medium text-slate-700 mb-1.5"
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
        <div className="lg:col-span-3">
          <label
            htmlFor="fuelType"
            className="block text-sm font-medium text-slate-700 mb-1.5"
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
        <div className="lg:col-span-3">
          <label
            htmlFor="year"
            className="block text-sm font-medium text-slate-700 mb-1.5"
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
        <div className="lg:col-span-3 flex gap-3">
          <Button
            onClick={handleApplyFilters}
            variant="primary"
            className="flex-1"
          >
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};
