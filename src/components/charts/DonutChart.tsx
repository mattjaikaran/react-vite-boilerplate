/**
 * Donut Chart Component
 * A flexible donut chart built on TanStack Charts.
 */

import { cn } from '@/lib/utils';
import { defineChart } from '@tanstack/charts';
import { pie, polar, radialArc, radialText } from '@tanstack/charts/polar';
import { Chart } from '@tanstack/charts/react';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { useMemo } from 'react';
import { chartTheme } from './chart-theme';

export interface DonutChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutChartDataPoint[];
  size?: number;
  thickness?: number;
  className?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  showCenter?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
  animate?: boolean;
}

export function DonutChart({
  data,
  size = 200,
  thickness = 30,
  className,
  showLegend = true,
  showLabels = false,
  showCenter = true,
  centerLabel,
  centerValue,
  animate = true,
}: DonutChartProps) {
  // pie() throws on negative values; negatives are excluded from slices and total.
  const plotted = useMemo(() => data.filter(point => point.value >= 0), [data]);
  const total = useMemo(
    () => plotted.reduce((sum, point) => sum + point.value, 0),
    [plotted]
  );

  const definition = useMemo(() => {
    const ringThickness = (thickness / 100) * size;
    const slices = pie(plotted, { value: 'value' });

    return defineChart({
      marks: [
        polar({
          inset: 0,
          radiusRatio: 1,
          marks: [
            radialArc(slices, {
              innerRadius: ({ radius }) => Math.max(radius - ringThickness, 0),
              fill: slice => slice.color,
              key: slice => slice.label,
            }),
            radialText(slices, {
              angle: 'angle',
              radius: 0.78,
              text: slice =>
                showLabels && slice.fraction > 0.05
                  ? `${Math.round(slice.fraction * 100)}%`
                  : null,
              fontSize: 10,
              fontWeight: 600,
              anchor: 'middle',
            }),
          ],
          scales: {
            angle: { scale: scaleLinear().domain([0, Math.PI * 2]) },
            radius: { scale: scaleLinear().domain([0, 1]) },
          },
        }),
      ],
      scales: { x: null, y: null },
      theme: chartTheme,
      svgAnimation: animate,
      tooltip,
    });
  }, [plotted, thickness, size, showLabels, animate]);

  if (data.length === 0 || total === 0) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn('chart-surface flex items-center gap-6', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <Chart
          definition={definition}
          width={size}
          height={size}
          ariaLabel={`Distribution across ${data.length} categories`}
        />

        {showCenter && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerValue !== undefined && (
              <span className="text-2xl font-bold">
                {typeof centerValue === 'number'
                  ? centerValue.toLocaleString()
                  : centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-sm text-muted-foreground">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex flex-col gap-2">
          {data.map(point => (
            <div key={point.label} className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: point.color }}
              />
              <span className="text-sm text-muted-foreground">
                {point.label}
              </span>
              <span className="ml-auto text-sm font-medium">
                {point.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
