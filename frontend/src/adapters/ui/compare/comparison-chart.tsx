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
  const baselineColor = '#cbd5e1'; // slate-300
  const comparisonColor = '#3b82f6'; // blue-500
  const targetColor = '#f43f5e'; // rose-500

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
        label: 'Baseline GHG',
        data: baselineData,
        backgroundColor: hexToRgba(baselineColor, 0.8),
        borderColor: baselineColor,
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        type: 'bar' as const,
        label: 'Optimized GHG',
        data: comparisonData,
        backgroundColor: hexToRgba(comparisonColor, 0.9),
        borderColor: comparisonColor,
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        type: 'line' as const,
        label: 'Target Limit',
        data: routeLabels.map(() => targetGhgIntensity),
        borderColor: targetColor,
        backgroundColor: targetColor,
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#475569', // slate-600
          font: { family: 'Inter, sans-serif', weight: 500 },
          usePointStyle: true,
          pointStyle: 'circle' as const,
          boxWidth: 8,
          padding: 20,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b', // slate-800
        titleFont: { family: 'Inter, sans-serif', size: 13, weight: 600 },
        bodyFont: { family: 'Inter, sans-serif', size: 12 },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b', // slate-500
          font: { family: 'Inter, sans-serif' },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9', // slate-100
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#64748b', // slate-500
          font: { family: 'Inter, sans-serif' },
          padding: 8,
        },
        title: {
          display: true,
          text: 'gCO₂e/MJ',
          color: '#94a3b8', // slate-400
          font: { family: 'Inter, sans-serif', size: 12, weight: 500 },
        },
      },
    },
  };

  return (
    <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">GHG Intensity Chart</h3>
      </div>
      <div className="h-[350px] w-full">
        <Chart type='bar' data={data} options={options} />
      </div>
    </Card>
  );
};
