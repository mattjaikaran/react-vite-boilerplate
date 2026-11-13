/**
 * Bar Chart Component
 * A flexible bar chart built on TanStack Charts.
 */

import { cn } from '@/lib/utils';
import { barX, barY, defineChart, text } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { useMemo } from 'react';
import { chartTheme } from './chart-theme';

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  className?: string;
  color?: string;
  showLabels?: boolean;
  showValues?: boolean;
  horizontal?: boolean;
  animate?: boolean;
  gap?: number;
}

export function BarChart({
  data,
  height = 200,
  className,
  color = 'hsl(var(--primary))',
  showLabels = true,
  showValues = true,
  horizontal = false,
  animate = true,
  gap = 8,
}: BarChartProps) {
  const definition = useMemo(() => {
    const labelAxis = showLabels
      ? ({ line: false, ticks: { size: 0 } } as const)
      : false;

    const marks = horizontal
      ? [
          barX(data, {
            x: 'value',
            y: 'label',
            fill: (row: BarChartDataPoint) => row.color ?? color,
            inset: gap / 2,
            radius: { end: 4 },
          }),
          ...(showValues
            ? [
                text(data, {
                  x: 'value',
                  y: 'label',
                  text: (row: BarChartDataPoint) => row.value.toLocaleString(),
                  dx: 6,
                  anchor: 'start',
                  fontSize: 10,
                }),
              ]
            : []),
        ]
      : [
          barY(data, {
            x: 'label',
            y: 'value',
            fill: (row: BarChartDataPoint) => row.color ?? color,
            inset: gap / 2,
            radius: { end: 4 },
          }),
          ...(showValues
            ? [
                text(data, {
                  x: 'label',
                  y: 'value',
                  text: (row: BarChartDataPoint) => row.value.toLocaleString(),
                  dy: -6,
                  anchor: 'middle',
                  fontSize: 10,
                }),
              ]
            : []),
        ];

    return defineChart({
      marks,
      scales: horizontal
        ? {
            x: { scale: scaleLinear, nice: true, axis: false },
            y: {
              scale: () => scaleBand<string>().padding(0.2),
              axis: labelAxis,
            },
          }
        : {
            x: {
              scale: () => scaleBand<string>().padding(0.2),
              axis: labelAxis,
            },
            y: { scale: scaleLinear, nice: true, axis: false },
          },
      margin: horizontal
        ? { right: showValues ? 36 : 0 }
        : { top: showValues ? 18 : 0 },
      theme: chartTheme,
      svgAnimation: animate,
      tooltip,
    });
  }, [data, color, showLabels, showValues, horizontal, animate, gap]);

  if (data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn('chart-surface', className)}>
      <Chart
        definition={definition}
        height={height}
        ariaLabel={`Bar chart of ${data.length} categories`}
      />
    </div>
  );
}
