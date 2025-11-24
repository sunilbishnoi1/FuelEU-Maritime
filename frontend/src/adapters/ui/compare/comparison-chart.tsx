import React from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';
import type { Route } from '../../../core/domain/entities';
import { Card } from '../../../shared/components/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  PointElement
);

interface ComparisonChartProps {
  baselineRoutes: Route[];
  comparisonRoutes: Route[];
  targetGhgIntensity: number;
}

const getCSSVariable = (name: string): string => {
  if (typeof window === 'undefined') return '';
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value;
};

const hexToRgba = (hex: string, alpha: number = 1): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  baselineRoutes,
  comparisonRoutes,
  targetGhgIntensity,
}) => {
  const secondaryColor = getCSSVariable('--color-secondary-500') || '#627D98';
  const primaryColor = getCSSVariable('--color-primary-500') || '#1F8A9E';
  const destructiveColor = getCSSVariable('--color-destructive') || '#EF4444';

  const routeLabels = Array.from(new Set([...baselineRoutes, ...comparisonRoutes].map(route => route.routeId)));

  const baselineData = routeLabels.map(label => {
    const route = baselineRoutes.find(r => r.routeId === label);
    return route ? route.ghgIntensity : null;
  });

  const comparisonData = routeLabels.map(label => {
    const route = comparisonRoutes.find(r => r.routeId === label);
    return route ? route.ghgIntensity : null;
  });

  const data = {
    labels: routeLabels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Baseline GHG Intensity (gCO₂e/MJ)',
        data: baselineData,
        backgroundColor: hexToRgba(secondaryColor, 0.6),
        borderColor: hexToRgba(secondaryColor, 1),
        borderWidth: 1,
      },
      {
        type: 'bar' as const,
        label: 'Comparison GHG Intensity (gCO₂e/MJ)',
        data: comparisonData,
        backgroundColor: hexToRgba(primaryColor, 0.6),
        borderColor: hexToRgba(primaryColor, 1),
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: 'Target GHG Intensity (gCO₂e/MJ)',
        data: routeLabels.map(() => targetGhgIntensity),
        borderColor: hexToRgba(destructiveColor, 1),
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'GHG Intensity Comparison by Route',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'GHG Intensity (gCO₂e/MJ)',
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-secondary-900">GHG Intensity Chart</h3>
      </div>
      <Chart type='bar' data={data} options={options} />
    </Card>
  );
};
