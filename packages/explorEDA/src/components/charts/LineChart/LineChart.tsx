import { finiteNumber } from "@/lib/numeric";
import { numericScale } from "../Axis/numericScale";
import { ChartMessage } from "../ChartMessage";
import { reduceDataPoints } from "@/lib/chartUtils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";
import { type BaseChartProps } from "@/types/ChartTypes";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import { curveLinear, curveMonotoneX, curveStepAfter, line } from "d3-shape";
import { useEffect, useMemo, useState, type FC } from "react";
import { BaseChart } from "../BaseChart";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import { AxisValuePill, pillX, spreadLabels } from "../PlotValueLabels";
import { getChartAxisFields, getChartAxisLabel } from "../chartAccessibility";
import {
  useGetColumnDataForIds,
  useGetColumnDataForMultipleIds,
} from "../useGetColumnData";
import { useGetLiveIds } from "../useGetLiveData";
import { type LineChartSettings, DEFAULT_SERIES_SETTINGS } from "./definition";
import { TimeSeriesChart } from "./TimeSeriesChart";

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

export const LineChart: FC<BaseChartProps<LineChartSettings>> = (props) =>
  props.settings.time ? (
    <TimeSeriesChart {...props} />
  ) : (
    <ObservationLineChart {...props} />
  );

const ObservationLineChart: FC<BaseChartProps<LineChartSettings>> = ({
  settings,
  width,
  height,
  facetIds,
}) => {
  // The x value under the pointer; every series reads its value there.
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [legendHover, setLegendHover] = useState<string | null>(null);
  const updateChart = useDataLayer((state) => state.updateChart);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  void fieldSettings;
  const displayValue = (field: string, value: number) =>
    hasFieldDisplayFormat(fieldSettings[field])
      ? (formatFieldValue?.(field, value) ?? String(value))
      : value.toLocaleString("en-US", { maximumFractionDigits: 3 });
  const seriesLabel = (field: string) => getFieldLabel?.(field) ?? field;

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
        const y = finiteNumber(value) ?? NaN;
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
    bottom:
      Math.max(baseMargin.bottom, xAxisLabel ? 46 : 28) + STATUS_LINE_HEIGHT,
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
        const aX = finiteNumber(aValue) ?? NaN;
        const bX = finiteNumber(bValue) ?? NaN;
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
        const x = finiteNumber(xValue) ?? NaN;
        const y = finiteNumber(value) ?? NaN;
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

  if (processedLiveSeriesData.length === 0 || !settings.xField) {
    return (
      <ChartMessage width={width} height={height}>
        Choose an x field and at least one series in chart settings.
      </ChartMessage>
    );
  }

  // Process data and create scales
  const xExtent = extent(
    allXData.map((value) => finiteNumber(value) ?? NaN).filter(Number.isFinite)
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

  const renderLegend = () => {
    if (!settings.showLegend) return null;
    const vertical =
      settings.legendPosition === "left" || settings.legendPosition === "right";
    const sideWidth = Math.min(100, width * 0.22);
    const position =
      settings.legendPosition === "top"
        ? { top: 0, left: margin.left, right: baseMargin.right }
        : settings.legendPosition === "bottom"
          ? {
              bottom: STATUS_LINE_HEIGHT,
              left: margin.left,
              right: baseMargin.right,
            }
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
            data-muted={
              legendHover && legendHover !== name ? "true" : undefined
            }
            onPointerEnter={() => setLegendHover(name)}
            onPointerLeave={() => setLegendHover(null)}
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
              {seriesLabel(name)}
              {settings.seriesSettings[name]?.useRightAxis && (
                <span className="text-muted-foreground"> · right axis</span>
              )}
            </span>
          </span>
        ))}
      </div>
    );
  };

  // Each series' value at the hovered x, top of the plot first.
  const hoverPoints =
    hoverX === null
      ? []
      : processedLiveSeriesData
          .flatMap((series) => {
            const point = series.data.find(
              (item) => item.x === hoverX && item.y != null
            );
            if (!point) return [];
            const right = settings.seriesSettings[series.name]?.useRightAxis;
            const y = point.y!;
            return [
              {
                name: series.name,
                value: y,
                py: (right ? rightYScale : leftYScale)(y),
              },
            ];
          })
          .sort((a, b) => a.py - b.py);
  const labelYs = spreadLabels(
    hoverPoints.map((point) => point.py),
    13,
    6,
    innerHeight - 6
  );
  const hoverPx = hoverX === null ? 0 : xScale(hoverX);
  const labelsLeft = hoverPx > innerWidth - 64;
  const xText = hoverX === null ? "" : displayValue(settings.xField, hoverX);

  const range = settings.filters.find(
    (filter) => filter.type === "range" && filter.field === settings.xField
  );
  // A dragged range has arbitrary decimals; show about three significant digits.
  const spanDigits = Math.max(
    0,
    2 - Math.floor(Math.log10(Math.abs(xExtent[1] - xExtent[0]) || 1))
  );
  const rangeValue = (value: number) =>
    hasFieldDisplayFormat(fieldSettings[settings.xField])
      ? displayValue(settings.xField, value)
      : value.toLocaleString("en-US", { maximumFractionDigits: spanDigits });
  const rangeText =
    range?.type === "range"
      ? `${rangeValue(range.min ?? xExtent[0])} to ${rangeValue(range.max ?? xExtent[1])}`
      : undefined;
  const inRange = (value: number) =>
    range?.type === "range" &&
    (range.min === undefined || value >= range.min) &&
    (range.max === undefined || value <= range.max);
  const liveRows = liveXData.filter(
    (value) => finiteNumber(value) !== undefined
  ).length;
  const statusParts = [
    // Counts lead, so a narrow chart that cuts the line keeps them.
    rangeText &&
      `${liveXData
        .filter((value) => {
          const x = finiteNumber(value);
          return x !== undefined && inRange(x);
        })
        .length.toLocaleString()} of ${liveRows.toLocaleString()} rows selected: ${xAxisLabel || settings.xField} ${rangeText}`,
  ];
  const statusHint =
    !rangeText &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    `Drag across to select a range of ${xAxisLabel || settings.xField}`;
  const seriesOpacity = (name: string) =>
    legendHover && legendHover !== name ? 0.2 : 1;

  return (
    <div
      className="relative"
      style={{ width, height }}
      onPointerLeave={() => setHoverX(null)}
      onPointerDownCapture={() => setHoverX(null)}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") setHoverX(null);
      }}
      onPointerMove={(event) => {
        if (event.buttons) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left - margin.left;
        const y = event.clientY - rect.top - margin.top;
        if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) {
          setHoverX(null);
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
        // A gap where no series has a value reads as nothing, not a neighbor.
        const observed = processedLiveSeriesData.some((series) =>
          series.data.some((point) => point.x === nearestX && point.y != null)
        );
        setHoverX(observed ? nearestX : null);
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
                    <line
                      x1={0}
                      x2={4}
                      y1={0}
                      y2={0}
                      stroke="var(--foreground)"
                      strokeOpacity={0.45}
                    />
                    <text
                      x={7}
                      y={0}
                      dy=".32em"
                      fontSize={10}
                      textAnchor="start"
                      className="fill-muted-foreground"
                    >
                      {displayValue(rightAxisSeries[0]!.name, tick)}
                    </text>
                  </g>
                ))}
              </g>
            )}
            {hoverX !== null && (
              <g pointerEvents="none" aria-hidden="true">
                <line
                  x1={hoverPx}
                  x2={hoverPx}
                  y1={0}
                  y2={innerHeight}
                  stroke="var(--foreground)"
                  strokeOpacity={0.4}
                  strokeDasharray="3 3"
                />
                {hoverPoints.map((point) => (
                  <circle
                    key={point.name}
                    cx={hoverPx}
                    cy={point.py}
                    r={3.5}
                    fill={seriesColors[point.name]}
                    stroke="var(--background)"
                    strokeWidth={1.5}
                  />
                ))}
                {hoverPoints.map((point, index) => (
                  <text
                    key={point.name}
                    x={hoverPx + (labelsLeft ? -8 : 8)}
                    y={labelYs[index]}
                    textAnchor={labelsLeft ? "end" : "start"}
                    dominantBaseline="middle"
                    className="eda-ecdf-value"
                  >
                    {displayValue(point.name, point.value)}
                  </text>
                ))}
                <AxisValuePill
                  x={pillX(hoverPx, xText, innerWidth)}
                  y={innerHeight + 3}
                  text={xText}
                />
              </g>
            )}
          </>
        }
        footer={STATUS_LINE_HEIGHT}
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
                  strokeOpacity={
                    seriesSettings.lineOpacity * seriesOpacity(series.name)
                  }
                  style={{ transition: "stroke-opacity 140ms ease-out" }}
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
                        fillOpacity={
                          seriesSettings.pointOpacity *
                          seriesOpacity(series.name)
                        }
                      />
                    )
                  )}
              </g>
            );
          })}
        </g>
      </BaseChart>
      {renderLegend()}
      {hoverX !== null && hoverPoints.length > 0 && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>{xAxisLabel || settings.xField}</span>
            <b>{xText}</b>
          </span>
          {hoverPoints.map((point) => (
            <span key={point.name} className="eda-readout-item">
              <span>{seriesLabel(point.name)}</span>
              <b>{displayValue(point.name, point.value)}</b>
            </span>
          ))}
        </ChartReadout>
      )}
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={margin.left}
        right={baseMargin.right}
      />
    </div>
  );
};
