import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Route as RouteIcon,
  BarChart3,
} from "lucide-react";
import type { Route } from "../../../core/domain/entities";

interface RouteKPIsProps {
  routes: Route[];
  loading: boolean;
}

export const RouteKPIs: React.FC<RouteKPIsProps> = ({ routes, loading }) => {
  const totalRoutes = routes.length;
  const avgGHGIntensity =
    routes.length > 0
      ? routes.reduce((sum, r) => sum + Number(r.ghgIntensity), 0) /
        routes.length
      : 0;

  const totalEmissions = routes.reduce(
    (sum, r) => sum + Number(r.totalEmissions),
    0,
  );
  const totalDistance = routes.reduce((sum, r) => sum + Number(r.distance), 0);

  const kpis = [
    {
      label: "Total Routes",
      value: loading ? "..." : totalRoutes.toString(),
      icon: RouteIcon,
      color: "primary",
    },
    {
      label: "Avg GHG Intensity",
      value: loading ? "..." : avgGHGIntensity.toFixed(2),
      unit: "gCO₂e/MJ",
      icon: BarChart3,
      color: "secondary",
      trend: avgGHGIntensity < 80 ? "down" : "up",
    },
    {
      label: "Total Emissions",
      value: loading ? "..." : totalEmissions.toFixed(2),
      unit: "t CO₂e",
      icon: TrendingUp,
      color: "accent",
    },
    {
      label: "Total Distance",
      value: loading ? "..." : (totalDistance / 1000).toFixed(2),
      unit: "×10³ km",
      icon: RouteIcon,
      color: "primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const bgColor =
          kpi.color === "primary"
            ? "bg-blue-50"
            : kpi.color === "secondary"
              ? "bg-slate-50"
              : "bg-emerald-50";
        const iconColor =
          kpi.color === "primary"
            ? "text-blue-600"
            : kpi.color === "secondary"
              ? "text-slate-600"
              : "text-emerald-600";

        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${bgColor} p-2 rounded-lg`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              {kpi.trend && (
                <div className="flex items-center gap-1">
                  {kpi.trend === "down" ? (
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-rose-600" />
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {kpi.value}
                {kpi.unit && (
                  <span className="text-sm font-normal text-slate-500 ml-1.5">
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
