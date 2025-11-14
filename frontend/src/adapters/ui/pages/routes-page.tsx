import React, { useEffect, useState } from 'react';
import { fetchRoutesUseCase, setBaselineUseCase } from '../../../core/application/service-locator';
import type { Route } from '../../../core/domain/entities';
import { RoutesTable } from '../routes/routes-table';
import { FiltersBar } from '../routes/filters-bar';
import { RouteKPIs } from '../routes/route-kpis';
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
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-destructive">
        <h3 className="font-semibold mb-2">Error Loading Routes</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary-900 mb-2">Routes Overview</h1>
        <p className="text-secondary-600">Manage and analyze your shipping routes</p>
      </div>
      
      <RouteKPIs routes={routes} loading={loading} />
      
      <FiltersBar onFilterChange={handleFilterChange} />
      
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
