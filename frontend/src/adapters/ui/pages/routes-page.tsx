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

  if (loading) return <p>Loading routes...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Routes Overview</h2>
        <FiltersBar onFilterChange={handleFilterChange} />
        <RoutesTable routes={routes} onSetBaseline={handleSetBaseline} />
    </>
  );
};

export default RoutesPage;
