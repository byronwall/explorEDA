import { numericScale } from "../Axis/numericScale";
import { AxisReadout } from "../Axis/AxisReadout";
import { reduceDataPoints } from "@/lib/chartUtils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";
import { type BaseChartProps } from "@/types/ChartTypes";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import { curveLinear, curveMonotoneX, curveStepAfter, line } from "d3-shape";
import { useEffect, useMemo, useState, type FC } from "react";
import { BaseChart } from "../BaseChart";
import { getChartAxisFields, getChartAxisLabel } from "../chartAccessibility";
import {
  useGetColumnDataForIds,
  useGetColumnDataForMultipleIds,
} from "../useGetColumnData";
import { useGetLiveIds } from "../useGetLiveData";
import { type LineChartSettings, DEFAULT_SERIES_SETTINGS } from "./definition";

const curveTypes = {
  linear: curveLinear,
  monotoneX: curveMonotoneX,
  step: curveStepAfter,
} as const;

type CurveType = keyof typeof curveTypes;

// Define color palettes
const COLOR_PALETTES = {
  default: [
    "#2563eb", // blue-600
    "#dc2626", // red-600
    "#9333ea", // purple-600
    "#ea580c", // orange-600
    "#0891b2", // cyan-600
    "#4f46e5", // indigo-600
    "#be123c", // rose-600
    "#ca8a04", // yellow-600
    "#16a34a", // green-600
    "#059669", // emerald-600
  ],
} as const;

export const LineChart: FC<BaseChartProps<LineChartSettings>> = ({
  settings,
  width,
  height,
  facetIds,
}) => {
  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    field: string;
  } | null>(null);
  const updateChart = useDataLayer((state) => state.updateChart);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  void fieldSettings;
  const displayValue = (field: string, value: number) =>
    hasFieldDisplayFormat(fieldSettings[field])
      ? (formatFieldValue?.(field, value) ?? String(value))
      : String(value);

  // Get all data for axis limits calculation
  const allXData = useGetColumnDataForIds(settings.xField);

  // Get filtered data for rendering
  const liveIds = useGetLiveIds(settings);
  const selectedIds = useMemo(
    () => (facetIds ? liveIds.filter((id) => facetIds.includes(id)) : liveIds),
    [liveIds, facetIds]
  );
  const liveXData = useGetColumnDataForIds(settings.xField, selectedIds);
  const allSeriesData = useGetColumnDataForMultipleIds(settings.seriesField);

  // Get all series data using the new hook
  const liveSeriesData = useGetColumnDataForMultipleIds(
    settings.seriesField,
    selectedIds
  );

  const baseMargin = settings.margin;
  const yValuesByAxis = settings.seriesField.reduce(
    (values, field) => {
      const useRightAxis = settings.seriesSettings[field]?.useRightAxis;
      (allSeriesData[field] ?? []).forEach((value) => {
        const y = value == null || value === "" ? NaN : Number(value);
        if (Number.isFinite(y)) {
          values[useRightAxis ? "right" : "left"].push(y);
        }
      });
      return values;
    },
    { left: [] as number[], right: [] as number[] }
  );
  const leftYExtent = extent(yValuesByAxis.left) as [number, number];
  const leftYTicks = Number.isFinite(leftYExtent[0])
    ? scaleLinear().domain(leftYExtent).nice().ticks(5)
    : [];
  const axisFields = getChartAxisFields(settings);
  const xAxisLabel = getChartAxisLabel(
    axisFields.x,
    settings.xAxisLabel,
    getFieldLabel
  );
  const yAxisLabel = getChartAxisLabel(
    axisFields.y,
    settings.yAxisLabel,
    getFieldLabel
  );
  const requestedLabelMargin = Math.max(
    baseMargin.left,
    ...leftYTicks.map(
      (tick) => String(tick).length * 7 + (yAxisLabel ? 38 : 18)
    )
  );
  const minPlotWidth = Math.min(
    80,
    Math.max(0, width - baseMargin.left - baseMargin.right)
  );
  const maxLabelMargin = Math.max(0, width - baseMargin.right - minPlotWidth);
  const margin = {
    ...baseMargin,
    left: Math.min(requestedLabelMargin, maxLabelMargin),
    bottom: Math.max(baseMargin.bottom, xAxisLabel ? 46 : 28),
  };
  if (
    settings.seriesField.some(
      (field) => settings.seriesSettings[field]?.useRightAxis
    )
  ) {
    margin.right = Math.max(margin.right, 60);
  }

  // Adjust margins based on legend position
  if (settings.showLegend) {
    switch (settings.legendPosition) {
      case "top":
        margin.top += 18;
        break;
      case "bottom":
        margin.bottom += 18;
        break;
      case "right":
        margin.right += Math.min(110, width * 0.24);
        break;
      case "left":
        margin.left += Math.min(110, width * 0.24);
        break;
    }
  }

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Convert data to numbers for d3
  const processedLiveSeriesData = useMemo(() => {
    const orderedIndices = liveXData
      .map((_, index) => index)
      .sort((a, b) => {
        const aValue = liveXData[a];
        const bValue = liveXData[b];
        const aX = aValue == null || aValue === "" ? NaN : Number(aValue);
        const bX = bValue == null || bValue === "" ? NaN : Number(bValue);
        const aFinite = Number.isFinite(aX);
        const bFinite = Number.isFinite(bX);
        if (aFinite !== bFinite) return aFinite ? -1 : 1;
        return aFinite ? aX - bX || a - b : a - b;
      });

    return settings.seriesField.map((field) => {
      const data = liveSeriesData[field] ?? [];
      const reducedData: Array<{ x: number; y: number | null }> = [];
      let segment: Array<{ x: number; y: number }> = [];

      const flushSegment = () => {
        if (segment.length > 0) {
          reducedData.push(...reduceDataPoints(segment, innerWidth));
          segment = [];
        }
      };

      orderedIndices.forEach((i) => {
        const value = data[i];
        const xValue = liveXData[i];
        const x = xValue == null || xValue === "" ? NaN : Number(xValue);
        const y = value == null || value === "" ? NaN : Number(value);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          flushSegment();
          reducedData.push({ x, y: null });
          return;
        }
        segment.push({ x, y });
      });
      flushSegment();

      return { name: field, data: reducedData };
    });
  }, [settings.seriesField, liveSeriesData, liveXData, innerWidth]);

  // Ensure consistent color assignment for series with better distribution
  const seriesColors = useMemo(() => {
    const colors: Record<string, string> = {};
    const palette = COLOR_PALETTES.default;

    // First pass - keep existing colors and track which palette colors are used
    const usedPaletteColors = new Set<string>();
    settings.seriesField.forEach((field) => {
      const existingColor = settings.seriesSettings[field]?.lineColor;
      if (existingColor && existingColor !== "#000000") {
        colors[field] = existingColor;
        if ((palette as readonly string[]).includes(existingColor)) {
          usedPaletteColors.add(existingColor);
        }
      }
    });

    // Get unused palette colors
    const unusedPaletteColors = (palette as readonly string[]).filter(
      (color) => !usedPaletteColors.has(color)
    );

    // Second pass - assign colors to series that need them
    // splice off the first color from the unused palette colors
    settings.seriesField.forEach((field) => {
      if (colors[field]) return;
      const nextColor = unusedPaletteColors.shift();

      // Use an unused palette color
      colors[field] =
        nextColor ??
        palette[settings.seriesField.indexOf(field) % palette.length]!;
    });

    return colors;
  }, [settings.seriesField, settings.seriesSettings]);

  // Store assigned colors back into settings using updateChart
  useEffect(() => {
    requestAnimationFrame(() => {
      const newSeriesSettings = { ...settings.seriesSettings };
      let hasChanges = false;

      settings.seriesField.forEach((field) => {
        if (!newSeriesSettings[field]) {
          newSeriesSettings[field] = { ...DEFAULT_SERIES_SETTINGS };
          hasChanges = true;
        }

        // Only update if color is undefined or "default"
        if (
          !newSeriesSettings[field]?.lineColor ||
          newSeriesSettings[field]?.lineColor === "default"
        ) {
          newSeriesSettings[field] = {
            ...newSeriesSettings[field]!,
            lineColor: seriesColors[field],
          };
          hasChanges = true;
        }
      });

      if (hasChanges) {
        updateChart(settings.id, {
          seriesSettings: newSeriesSettings,
        });
      }
    });
  }, [
    seriesColors,
    settings.id,
    settings.seriesField,
    settings.seriesSettings,
    updateChart,
  ]);

  if (processedLiveSeriesData.length === 0) {
    return null;
  }

  // Process data and create scales
  const xExtent = extent(
    allXData
      .map((value) => (value == null ? NaN : Number(value)))
      .filter(Number.isFinite)
  ) as [number, number];

  // Calculate y extent across all series
  const rightAxisSeries = processedLiveSeriesData.filter(
    (series) => settings.seriesSettings[series.name]?.useRightAxis
  );

  const rightYExtent = extent(yValuesByAxis.right) as [number, number];

  const xScale = numericScale(settings.xAxis)
    .domain(xExtent)
    .range([0, innerWidth])
    .nice();
  const leftYScale = numericScale(settings.yAxis)
    .domain(leftYExtent)
    .range([innerHeight, 0])
    .nice();
  const rightYScale = numericScale(settings.yAxis)
    .domain(rightYExtent)
    .range([innerHeight, 0])
    .nice();

  // Create line generator with dynamic y-accessor
  const createLineGenerator = (yField: string) =>
    line<(typeof processedLiveSeriesData)[0]["data"][0]>()
      .defined((d) => d.y != null && Number.isFinite(d.x))
      .x((d) => xScale(d.x))
      .y((d) =>
        settings.seriesSettings[yField]?.useRightAxis
          ? rightYScale(d.y ?? 0)
          : leftYScale(d.y ?? 0)
      )
      .curve(curveTypes[settings.styles.curveType as CurveType]);

  const Legend = () => {
    if (!settings.showLegend) return null;
    const vertical =
      settings.legendPosition === "left" || settings.legendPosition === "right";
    const sideWidth = Math.min(100, width * 0.22);
    const position =
      settings.legendPosition === "top"
        ? { top: 0, left: margin.left, right: baseMargin.right }
        : settings.legendPosition === "bottom"
          ? { bottom: 0, left: margin.left, right: baseMargin.right }
          : settings.legendPosition === "left"
            ? { left: 0, top: margin.top, width: sideWidth }
            : { right: 0, top: margin.top, width: sideWidth };
    return (
      <div
        className="eda-line-legend"
        style={{ ...position, flexDirection: vertical ? "column" : "row" }}
        aria-label="Chart series"
      >
        {settings.seriesField.map((name) => (
          <span
            key={name}
            className="eda-line-legend-item"
            title={`${name}${settings.seriesSettings[name]?.useRightAxis ? " · right axis" : ""}`}
          >
            <svg width="14" height="6" aria-hidden="true">
              <line
                x1="0"
                x2="14"
                y1="3"
                y2="3"
                stroke={seriesColors[name]}
                strokeWidth="2"
                strokeDasharray={
                  settings.seriesSettings[name]?.lineStyle === "dashed"
                    ? "4 2"
                    : settings.seriesSettings[name]?.lineStyle === "dotted"
                      ? "1 2"
                      : undefined
                }
              />
            </svg>
            <span>
              {name}
              {settings.seriesSettings[name]?.useRightAxis ? " ↗" : ""}
            </span>
          </span>
        ))}
      </div>
    );
  };

  const hoverX = hovered ? hovered.x : NaN;
  const hoverY = hovered ? hovered.y : NaN;
  const hoverRight = hovered
    ? settings.seriesSettings[hovered.field]?.useRightAxis
    : false;

  return (
    <div
      className="relative"
      style={{ width, height }}
      onPointerLeave={() => setHovered(null)}
      onPointerDownCapture={() => setHovered(null)}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") setHovered(null);
      }}
      onPointerMove={(event) => {
        if (event.buttons) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left - margin.left;
        const y = event.clientY - rect.top - margin.top;
        if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) {
          setHovered(null);
          return;
        }
        const target = xScale.invert(x);
        let nearestX = NaN;
        let distance = Infinity;
        for (const series of processedLiveSeriesData) {
          for (const point of series.data) {
            if (!Number.isFinite(point.x)) continue;
            const next = Math.abs(point.x - target);
            if (next < distance) {
              nearestX = point.x;
              distance = next;
            }
          }
        }

        if (!Number.isFinite(nearestX)) {
          setHovered(null);
          return;
        }

        let field: string | null = null;
        let valueAtX = NaN;
        distance = Infinity;
        for (const series of processedLiveSeriesData) {
          for (const point of series.data) {
            if (point.x !== nearestX || point.y == null) continue;
            const scale = settings.seriesSettings[series.name]?.useRightAxis
              ? rightYScale
              : leftYScale;
            const next = Math.abs(scale(point.y) - y);
            if (next < distance) {
              field = series.name;
              valueAtX = point.y;
              distance = next;
            }
          }
        }
        setHovered(field === null ? null : { x: nearestX, y: valueAtX, field });
      }}
    >
      <BaseChart
        width={width}
        height={height}
        xScale={xScale}
        yScale={leftYScale}
        settings={{
          ...settings,
          margin,
          xAxis: {
            ...settings.xAxis,
            grid: settings.xAxis.grid ?? settings.showYGrid,
          },
          yAxis: {
            ...settings.yAxis,
            grid: settings.yAxis.grid ?? settings.showXGrid,
          },
        }}
        overlay={
          <>
            {/* Right Y-Axis */}
            {rightAxisSeries.length > 0 && (
              <g transform={`translate(${innerWidth}, 0)`}>
                {rightYScale.ticks(5).map((tick: number) => (
                  <g
                    key={tick}
                    transform={`translate(0, ${rightYScale(tick)})`}
                  >
                    <line x1={0} x2={6} y1={0} y2={0} stroke="currentColor" />
                    <text
                      x={9}
                      y={0}
                      dy=".32em"
                      fontSize={10}
                      textAnchor="start"
                      fill="currentColor"
                    >
                      {tick}
                    </text>
                  </g>
                ))}
              </g>
            )}
            {hovered && (
              <AxisReadout
                x={xScale(hoverX)}
                y={(hoverRight ? rightYScale : leftYScale)(hoverY)}
                xValue={hoverX}
                yValue={hoverY}
                width={innerWidth}
                height={innerHeight}
                color={seriesColors[hovered.field]!}
                rightAxis={hoverRight}
                xFormatter={(value) => displayValue(settings.xField, value)}
                yFormatter={(value) => displayValue(hovered.field, value)}
                label={`${getFieldLabel?.(settings.xField) ?? settings.xField}: ${displayValue(settings.xField, hoverX)}; ${getFieldLabel?.(hovered.field) ?? hovered.field}: ${displayValue(hovered.field, hoverY)}`}
              />
            )}
          </>
        }
        brushingMode="horizontal"
        onBrushChange={(extent) =>
          updateChart(settings.id, {
            filters: [
              ...settings.filters.filter(
                (filter) => filter.field !== settings.xField
              ),
              ...(extent
                ? [
                    {
                      type: "range" as const,
                      field: settings.xField,
                      min: xScale.invert(extent[0][0]),
                      max: xScale.invert(extent[1][0]),
                    },
                  ]
                : []),
            ],
          })
        }
      >
        <g>
          {/* Lines */}
          {processedLiveSeriesData.map((series) => {
            const lineGenerator = createLineGenerator(series.name);
            const seriesSettings = settings.seriesSettings[series.name] ?? {
              showPoints: false,
              pointSize: 4,
              pointOpacity: 1,
              lineWidth: 2,
              lineOpacity: 0.8,
              lineStyle: "solid",
              useRightAxis: false,
            };

            const seriesColor = seriesColors[series.name];

            return (
              <g key={series.name}>
                <path
                  d={lineGenerator(series.data) || undefined}
                  fill="none"
                  stroke={seriesColor}
                  strokeWidth={seriesSettings.lineWidth}
                  strokeOpacity={seriesSettings.lineOpacity}
                  strokeDasharray={
                    seriesSettings.lineStyle === "dashed"
                      ? "5,5"
                      : seriesSettings.lineStyle === "dotted"
                        ? "2,2"
                        : undefined
                  }
                />
                {seriesSettings.showPoints &&
                  series.data.map((d, j) =>
                    d.y == null ? null : (
                      <circle
                        key={j}
                        cx={xScale(d.x)}
                        cy={(seriesSettings.useRightAxis
                          ? rightYScale
                          : leftYScale)(d.y)}
                        r={seriesSettings.pointSize}
                        fill={seriesColor}
                        fillOpacity={seriesSettings.pointOpacity}
                      />
                    )
                  )}
              </g>
            );
          })}
        </g>
      </BaseChart>
      <Legend />
    </div>
  );
};
