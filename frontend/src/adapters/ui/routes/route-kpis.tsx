import React from 'react';
import { TrendingUp, TrendingDown, Route as RouteIcon, BarChart3 } from 'lucide-react';
import type { Route } from '../../../core/domain/entities';

interface RouteKPIsProps {
  routes: Route[];
  loading: boolean;
}

export const RouteKPIs: React.FC<RouteKPIsProps> = ({ routes, loading }) => {
  const totalRoutes = routes.length;
  const avgGHGIntensity = routes.length > 0 
    ? routes.reduce((sum, r) => sum + r.ghgIntensity, 0) / routes.length 
    : 0;
  const totalEmissions = routes.reduce((sum, r) => sum + r.totalEmissions, 0);
  const totalDistance = routes.reduce((sum, r) => sum + r.distance, 0);

  const kpis = [
    {
      label: 'Total Routes',
      value: loading ? '...' : totalRoutes.toString(),
      icon: RouteIcon,
      color: 'primary',
    },
    {
      label: 'Avg GHG Intensity',
      value: loading ? '...' : avgGHGIntensity.toFixed(2),
      unit: 'gCO₂e/t·km',
      icon: BarChart3,
      color: 'secondary',
      trend: avgGHGIntensity < 80 ? 'down' : 'up',
    },
    {
      label: 'Total Emissions',
      value: loading ? '...' : totalEmissions.toFixed(2),
      unit: 't CO₂e',
      icon: TrendingUp,
      color: 'accent',
    },
    {
      label: 'Total Distance',
      value: loading ? '...' : (totalDistance / 1000).toFixed(2),
      unit: '×10³ km',
      icon: RouteIcon,
      color: 'primary',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const bgColor = kpi.color === 'primary' 
          ? 'bg-primary-50' 
          : kpi.color === 'secondary' 
          ? 'bg-secondary-50' 
          : 'bg-accent-50';
        const iconColor = kpi.color === 'primary' 
          ? 'text-primary-600' 
          : kpi.color === 'secondary' 
          ? 'text-secondary-600' 
          : 'text-accent-600';
        const textColor = kpi.color === 'primary' 
          ? 'text-primary-900' 
          : kpi.color === 'secondary' 
          ? 'text-secondary-900' 
          : 'text-accent-900';

        return (
          <div 
            key={idx}
            className="bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${bgColor} p-2.5 rounded-lg`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              {kpi.trend && (
                <div className="flex items-center gap-1">
                  {kpi.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-primary-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {kpi.label}
              </p>
              <p className={`text-2xl font-bold ${textColor}`}>
                {kpi.value}
                {kpi.unit && (
                  <span className="text-sm font-normal text-muted-foreground ml-1.5">
                    {kpi.unit}
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
