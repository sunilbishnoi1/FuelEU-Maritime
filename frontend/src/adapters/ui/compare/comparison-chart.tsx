import React from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement, // Import LineElement
  PointElement, // Import PointElement
} from 'chart.js';
import type { Route } from '../../../core/domain/entities';
import { Card } from '../../../shared/components/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement, // Register LineElement
  PointElement, // Register PointElement
);

interface ComparisonChartProps {
  baselineRoutes: Route[];
  comparisonRoutes: Route[];
  targetGhgIntensity: number;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  baselineRoutes,
  comparisonRoutes,
  targetGhgIntensity,
}) => {
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
        type: 'bar' as const, // Explicitly define type for bar dataset
        label: 'Baseline GHG Intensity (gCO₂e/MJ)',
        data: baselineData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        type: 'bar' as const, // Explicitly define type for bar dataset
        label: 'Comparison GHG Intensity (gCO₂e/MJ)',
        data: comparisonData,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: 'Target GHG Intensity (gCO₂e/MJ)',
        data: routeLabels.map(() => targetGhgIntensity),
        borderColor: 'rgba(255, 99, 132, 1)',
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
    <Card className="p-4">
      <Chart type='bar' data={data} options={options} />
    </Card>
  );
};
