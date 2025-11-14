import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/card";
import { Ship, TrendingUp, Fuel, Cloud } from "lucide-react";

interface StatsCardsProps {
  totalRoutes: number;
  compliantPercentage: number;
  avgGhgIntensity: number;
  totalEmissions: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalRoutes,
  compliantPercentage,
  avgGhgIntensity,
  totalEmissions,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border border-border bg-card hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Total Routes
          </CardTitle>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500/20">
            <Ship className="h-5 w-5 text-primary-600" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="text-2xl font-bold text-secondary-900">{totalRoutes}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total number of routes monitored
          </p>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Compliant %
          </CardTitle>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500/20">
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="text-2xl font-bold text-secondary-900">
            {compliantPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Percentage of routes meeting targets
          </p>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Avg GHG Intensity
          </CardTitle>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500/20">
            <Fuel className="h-5 w-5 text-primary-600" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="text-2xl font-bold text-secondary-900">
            {avgGhgIntensity.toFixed(2)} gCO₂e/MJ
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Average Greenhouse Gas Intensity
          </p>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Total Emissions
          </CardTitle>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500/20">
            <Cloud className="h-5 w-5 text-primary-600" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="text-2xl font-bold text-secondary-900">
            {totalEmissions.toFixed(0)} t
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total CO₂e emissions across all routes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export { StatsCards };
