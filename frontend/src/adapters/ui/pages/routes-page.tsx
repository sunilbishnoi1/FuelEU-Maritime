import React, { useEffect, useState } from 'react';
import { fetchRoutesUseCase, setBaselineUseCase } from '../../../core/application/service-locator';
import type { Route } from '../../../core/domain/entities';
import { RoutesTable } from '../routes/routes-table';
import { FiltersBar } from '../routes/filters-bar';
import type { RouteFilters } from '../../../types';

const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RouteFilters>({});

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoading(true);
        const fetchedRoutes = await fetchRoutesUseCase.execute(filters);
        setRoutes(fetchedRoutes);
      } catch (err) {
        setError('Failed to fetch routes.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRoutes();
  }, [filters]);

  const handleSetBaseline = async (id: string) => {
    try {
      await setBaselineUseCase.execute(id);
      // Refetch routes to update baseline status
      const updatedRoutes = await fetchRoutesUseCase.execute(filters);
      setRoutes(updatedRoutes);
    } catch (err) {
      setError('Failed to set baseline.');
      console.error(err);
    }
  };

  const handleFilterChange = (newFilters: RouteFilters) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
        <h3 className="font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">Routes Overview</h1>
        <p className="text-slate-600">Manage and analyze your shipping routes</p>
      </div>
      <FiltersBar onFilterChange={handleFilterChange} />
      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-600">Loading routes...</p>
        </div>
      ) : (
        <RoutesTable routes={routes} onSetBaseline={handleSetBaseline} />
      )}
    </>
  );
};

export default RoutesPage;
