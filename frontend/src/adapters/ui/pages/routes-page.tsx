import React, { useEffect, useState, useCallback } from "react";
import {
  fetchRoutesUseCase,
  setBaselineUseCase,
} from "../../../composition-root";
import type { Route, RouteFilters } from "../../../core/domain/entities";
import { RoutesTable } from "../routes/routes-table";
import { FiltersBar } from "../routes/filters-bar";
import { RouteKPIs } from "../routes/route-kpis";

const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RouteFilters>({});

  const loadRoutes = useCallback(async (currentFilters: RouteFilters) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRoutes = await fetchRoutesUseCase.execute(currentFilters);
      setRoutes(fetchedRoutes);
      // On initial/unfiltered load, save all routes for dynamic filter options
      if (
        !currentFilters.vesselType &&
        !currentFilters.fuelType &&
        !currentFilters.year
      ) {
        setAllRoutes(fetchedRoutes);
      }
    } catch (err) {
      setError("Failed to fetch routes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes(filters);
  }, [filters, loadRoutes]);

  const handleSetBaseline = async (id: string) => {
    try {
      setError(null);
      await setBaselineUseCase.execute(id);
      const updatedRoutes = await fetchRoutesUseCase.execute(filters);
      setRoutes(updatedRoutes);
      // Refresh allRoutes too for baseline status update
      if (!filters.vesselType && !filters.fuelType && !filters.year) {
        setAllRoutes(updatedRoutes);
      }
    } catch (err) {
      setError("Failed to set baseline.");
      console.error(err);
    }
  };

  const handleFilterChange = (newFilters: RouteFilters) => {
    setFilters(newFilters);
  };

  const handleDismissError = () => {
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    loadRoutes(filters);
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Routes Overview
          </h1>
          <p className="text-slate-500">
            Manage and analyze your shipping routes data
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
          <div className="flex gap-2 ml-4 shrink-0">
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-destructive/20 hover:bg-destructive/30 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={handleDismissError}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-destructive/10 hover:bg-destructive/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <RouteKPIs routes={routes} loading={loading} />

      <FiltersBar onFilterChange={handleFilterChange} routes={allRoutes} />

      {loading ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
          <p className="text-muted-foreground">Loading routes...</p>
        </div>
      ) : (
        <RoutesTable routes={routes} onSetBaseline={handleSetBaseline} />
      )}
    </>
  );
};

export default RoutesPage;
