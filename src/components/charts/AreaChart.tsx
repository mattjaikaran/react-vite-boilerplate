/**
 * Area Chart Component
 * A flexible area chart built on TanStack Charts.
 */

import { cn } from '@/lib/utils';
import { areaY, defineChart, lineY } from '@tanstack/charts';
import { Chart } from '@tanstack/charts/react';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';
import { useId, useMemo } from 'react';
import { chartTheme } from './chart-theme';

export interface AreaChartDataPoint {
  label: string;
  value: number;
}

export interface AreaChartProps {
  data: AreaChartDataPoint[];
  height?: number;
  className?: string;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  animate?: boolean;
}

export function AreaChart({
  data,
  height = 200,
  className,
  color = 'hsl(var(--primary))',
  gradientFrom = 'hsl(var(--primary) / 0.3)',
  gradientTo = 'hsl(var(--primary) / 0.05)',
  showGrid = true,
  showLabels = true,
  showValues = false,
  animate = true,
}: AreaChartProps) {
  const id = useId();
  const gradientId = `area-gradient-${id.replace(/:/g, '')}`;

  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          areaY(data, {
            x: 'label',
            y: 'value',
            fill: `url(#${gradientId})`,
            fillOpacity: 1,
          }),
          lineY(data, {
            x: 'label',
            y: 'value',
            stroke: color,
            strokeWidth: 2,
            points: true,
          }),
        ],
        scales: {
          x: {
            scale: () => scalePoint<string>().padding(0.2),
            axis: showLabels ? { line: false, ticks: { size: 0 } } : false,
          },
          y: {
            scale: scaleLinear,
            nice: true,
            grid: showGrid,
            axis: showValues ? { line: false, ticks: { size: 0 } } : false,
          },
        },
        gradients: [
          {
            id: gradientId,
            y1: 1,
            y2: 0,
            stops: [
              { offset: 0, color: gradientTo },
              { offset: 1, color: gradientFrom },
            ],
          },
        ],
        theme: chartTheme,
        svgAnimation: animate,
        tooltip,
      }),
    [
      data,
      gradientId,
      color,
      gradientFrom,
      gradientTo,
      showGrid,
      showLabels,
      showValues,
      animate,
    ]
  );

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
    <div className={cn('chart-surface relative', className)}>
      <Chart
        definition={definition}
        height={height}
        ariaLabel={`Activity from ${data[0]?.label} to ${data[data.length - 1]?.label}`}
      />
    </div>
  );
}
