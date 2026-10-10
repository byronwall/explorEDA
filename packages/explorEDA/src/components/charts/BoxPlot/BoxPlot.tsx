import {
  finiteNumber,
  finiteNumbers,
  numericExclusionReason,
} from "@/lib/numeric";
import {
  categoryEqual,
  categoryKey,
  categoryIncludes,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import { boundedDomain } from "../Axis/axisBounds";
import { numericScale } from "../Axis/numericScale";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { Filter, datum } from "@/types/FilterTypes";
import { ScaleLinear, scaleBand } from "d3-scale";
import natsort from "natsort";
import { useCallback, useId, useMemo, useState } from "react";
import { BaseChart } from "../BaseChart";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import { getChartAxisFields, getChartAxisLabel } from "../chartAccessibility";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData, useGetLiveIds } from "../useGetLiveData";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import {
  calculateBoxPlotStats,
  calculateKernelDensity,
  medianRange,
  selectBoxGroup,
} from "./boxPlotCalculations";
import { BoxPlotSettings } from "./definition";

const Y_SCALE_PADDING = 0.1; // 10% padding for whiskers
const BOX_PADDING = 0.2; // Padding between boxes in a group

export function BoxPlot({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<BoxPlotSettings>) {
  const owner = useId();
  const api = useChartTraceApi();
  const revision = useTraceRevision(settings);
  const liveIds = useGetLiveIds(settings, facetIds);
  const rawData = useDataLayer((state) => state.rawData);
  // The observations note takes a line under the chart when it shows.
  const footerHeight = settings.showObservations ? 32 : 0;
  const chartHeight = Math.max(40, height - footerHeight);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const updateChart = useDataLayer((s) => s.updateChart);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const { getColorForValue } = useColorScales();
  void fieldSettings[settings.field];
  if (settings.colorField) void fieldSettings[settings.colorField];

  // Get all data for axis limits calculation
  const allData = useGetColumnDataForIds(settings.field);
  const allGroupData = useGetColumnDataForIds(settings.colorField);

  // Get filtered data for rendering
  const liveData = useGetLiveData(settings, settings.field, facetIds);

  // Get color field data if specified
  const colorFieldData = useGetLiveData(
    settings,
    settings.colorField,
    facetIds
  );
  const hasColorField = !!settings.colorField;
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

  // Chart dimensions
  const margin = {
    ...settings.margin,
    left: Math.max(settings.margin.left, yAxisLabel ? 64 : 42),
    bottom:
      Math.max(settings.margin.bottom, xAxisLabel ? 44 : 28) +
      STATUS_LINE_HEIGHT,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Group data by color field if specified
  const groupedData = useMemo(() => {
    if (!hasColorField) {
      const validData = finiteNumbers(liveData);

      const result = [
        {
          group: "All Data",
          data: validData,
        },
      ];
      return result;
    }

    const groups = new Map<datum, number[]>();

    liveData.forEach((value, index) => {
      const colorValue = categoryValue(colorFieldData[index]);
      const numValue = finiteNumber(value);
      if (numValue === undefined) return;

      if (!groups.has(colorValue)) groups.set(colorValue, []);
      groups.get(colorValue)!.push(numValue);
    });

    const result = Array.from(groups.entries()).map(([group, data]) => ({
      group,
      data,
    }));

    return result;
  }, [liveData, colorFieldData, hasColorField]);

  // Calculate statistics for all groups
  const groupStats = useMemo(() => {
    const stats = groupedData.map(({ group, data }) => ({
      group,
      stats: calculateBoxPlotStats(data, settings.whiskerType),
    }));
    return stats;
  }, [groupedData, settings.whiskerType]);

  // Calculate KDE for each group if violin overlay is enabled
  const groupKDEs = useMemo(() => {
    if (!settings.violinOverlay) {
      return null;
    }

    return groupedData.map(({ group, data }) => {
      // Calculate bandwidth using Silverman's rule of thumb
      const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
      const stdDev = Math.sqrt(
        data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / data.length
      );
      const autoBandwidth = Math.max(
        0.001,
        1.06 * (stdDev || 1) * Math.pow(Math.max(1, data.length), -0.2)
      );

      const bandwidth = settings.autoBandwidth
        ? autoBandwidth
        : settings.violinBandwidth;

      return {
        group,
        bandwidth,
        kde: calculateKernelDensity(data, bandwidth),
      };
    });
  }, [
    settings.violinOverlay,
    settings.autoBandwidth,
    settings.violinBandwidth,
    groupedData,
  ]);

  // Create scales
  const xScale = useMemo(() => {
    const groups = settings.colorField
      ? [...new Set(allGroupData.map(categoryLabel))]
      : ["All Data"];

    const medians = new Map<string, number>();
    if (settings.sortBy === "median") {
      const values = new Map<string, number[]>();
      allData.forEach((value, index) => {
        const number = finiteNumber(value);
        if (number === undefined) return;
        const group = settings.colorField
          ? categoryLabel(allGroupData[index])
          : "All Data";
        if (!values.has(group)) values.set(group, []);
        values.get(group)!.push(number);
      });
      values.forEach((data, group) =>
        medians.set(
          group,
          calculateBoxPlotStats(data, settings.whiskerType).median
        )
      );
    }
    // Keep the population order while linked filters change the displayed statistics.
    const sortedGroups = [...groups].sort((a, b) => {
      if (settings.sortBy === "median") {
        return (medians.get(b) ?? 0) - (medians.get(a) ?? 0);
      }
      return natsort()(a, b);
    });

    const scale = scaleBand()
      .domain(sortedGroups)
      .range([0, innerWidth])
      .padding(BOX_PADDING);

    return scale;
  }, [
    allData,
    allGroupData,
    settings.colorField,
    innerWidth,
    settings.sortBy,
    settings.whiskerType,
  ]);

  // Create path generator for violin shapes
  const createPath = useCallback((points: [number, number][]) => {
    if (points.length === 0) {
      return "";
    }
    return points
      .map((point, i) => `${i === 0 ? "M" : "L"} ${point[0]} ${point[1]}`)
      .join(" ");
  }, []);

  // Create y scale with synchronized limits if in a facet
  const yScale = useMemo(() => {
    const values = finiteNumbers(allData);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const padding = range * Y_SCALE_PADDING;

    const scale = numericScale(settings.yAxis)
      .domain(
        boundedDomain(
          [
            settings.yAxis.scaleType === "symlog" ? min : min - padding,
            max + padding,
          ],
          settings.yAxis
        )
      )
      .range([innerHeight, 0]);

    return scale;
  }, [allData, innerHeight, settings.yAxis]) as ScaleLinear<number, number>;

  const traceGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        group: datum;
        contributors: {
          sourceId: number;
          input: datum;
          rawInput: datum;
          included: boolean;
          exclusionReason?: string;
        }[];
      }
    >();
    liveIds.forEach((sourceId, index) => {
      const group = hasColorField
        ? categoryValue(colorFieldData[index])
        : "All Data";
      const key = categoryKey(group);
      const item = groups.get(key) ?? { group, contributors: [] };
      const input = liveData[index];
      const rawInput = rawData[sourceId]?.[settings.field];
      const included = finiteNumber(input) !== undefined;
      item.contributors.push({
        sourceId,
        input,
        rawInput,
        included,
        exclusionReason: included
          ? undefined
          : (numericExclusionReason(rawInput) ?? numericExclusionReason(input)),
      });
      groups.set(key, item);
    });
    return groups;
  }, [
    liveIds,
    liveData,
    colorFieldData,
    hasColorField,
    rawData,
    settings.field,
  ]);
  const source = useMemo((): TraceSource => {
    const currentRevision = `${revision}:${JSON.stringify(settings)}:${facetIds?.join(",") ?? ""}`;
    return {
      role: "chart",
      revision: currentRevision,
      resolve: (kind, id) => {
        if (kind !== "distribution") return;
        const sourceId = id.startsWith("row:")
          ? Number(id.slice(4))
          : undefined;
        const entry =
          sourceId === undefined
            ? traceGroups.get(id)
            : [...traceGroups.values()].find((item) =>
                item.contributors.some((row) => row.sourceId === sourceId)
              );
        if (!entry) return;
        return {
          kind: "distribution",
          id,
          revision: currentRevision,
          label: categoryLabel(entry.group),
          field: settings.field,
          sourceId,
          contributors: entry.contributors,
          stats: calculateBoxPlotStats(
            entry.contributors
              .filter((item) => item.included)
              .map((item) => Number(item.input)),
            settings.whiskerType
          ),
          whiskerType: settings.whiskerType,
          bandwidth: groupKDEs?.find((item) =>
            categoryEqual(item.group, entry.group)
          )?.bandwidth,
        };
      },
      findRow: (id) =>
        liveIds.includes(id)
          ? { kind: "distribution", id: `row:${id}` }
          : undefined,
      targets: () =>
        [...traceGroups].map(([id, item]) => ({
          kind: "distribution",
          id,
          label: categoryLabel(item.group),
        })),
    };
  }, [revision, settings, facetIds, traceGroups, groupKDEs, liveIds]);
  useTraceSource(owner, source);
  const inspect = (id: string) => api?.inspect(owner, "distribution", id);

  const activeFilter = useMemo(() => {
    return settings.filters.find(
      (f: Filter) => f.field === settings.colorField
    );
  }, [settings.filters, settings.colorField]);
  const selectedGroups =
    settings.colorField && activeFilter?.type === "value"
      ? activeFilter.values
      : [];

  const handleBoxClick = useCallback(
    // Each click adds or removes a group, like the bars of a bar chart.
    (group: datum) => {
      if (!settings.colorField) return;
      updateChart(settings.id, {
        filters: selectBoxGroup(
          settings.filters,
          settings.colorField,
          group,
          true
        ),
      });
    },
    [settings.colorField, settings.filters, settings.id, updateChart]
  );

  const format = (value: number) => formatFieldValue(settings.field, value);
  const formatGroup = (value: datum) =>
    settings.colorField
      ? formatFieldValue(settings.colorField, value)
      : categoryLabel(value);
  const groupName = settings.colorField
    ? getFieldLabel(settings.colorField)
    : "Group";
  const shown = groupStats.filter(({ stats }) => stats.totalCount > 0);
  const hovered = shown.find(
    ({ group }) => categoryLabel(group) === hoveredGroup
  );
  const range = medianRange(shown);
  const showHints = width >= STATUS_HINT_MIN_WIDTH && !facetIds;
  const statusParts = [
    selectedGroups.length > 0
      ? `${selectedGroups.length} of ${xScale.domain().length} ${groupName} groups selected`
      : range &&
        showHints &&
        `Medians ${format(range.low.stats.median)} (${groupName} ${formatGroup(range.low.group)}) to ${format(range.high.stats.median)} (${groupName} ${formatGroup(range.high.group)})`,
  ];
  const statusHint =
    showHints &&
    settings.colorField &&
    "Click groups to select or clear them · Alt-click to inspect";

  const boxStroke =
    // The original default follows the theme so boxes keep an edge in dark mode.
    settings.styles.boxStroke === "black"
      ? "var(--eda-box-stroke)"
      : settings.styles.boxStroke;
  const boxWidth = xScale.bandwidth();
  // A violin carries the shape, so the box narrows to a summary inside it.
  const boxShare = settings.violinOverlay ? 0.24 : 0.7;
  const boxPixels = Math.max(6, boxWidth * boxShare);
  const boxX = (boxWidth - boxPixels) / 2;

  return (
    <div
      className="relative"
      style={{ width, height }}
      onPointerLeave={() => setHoveredGroup(null)}
    >
      {hovered && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          {(
            [
              [groupName, formatGroup(hovered.group)],
              ["Median", format(hovered.stats.median)],
              [
                "Middle 50%",
                `${format(hovered.stats.q1)} to ${format(hovered.stats.q3)}`,
              ],
              ["Rows", hovered.stats.totalCount.toLocaleString()],
              [
                "Whiskers",
                `${format(hovered.stats.whiskerLow)} to ${format(hovered.stats.whiskerHigh)}`,
              ],
              hovered.stats.outliers.length > 0 && [
                "Outliers",
                hovered.stats.outliers.length.toLocaleString(),
              ],
            ] as Array<false | [string, string]>
          ).map(
            (item) =>
              item && (
                <span key={item[0]} className="eda-readout-item">
                  <span>{item[0]}</span>
                  <b>{item[1]}</b>
                </span>
              )
          )}
        </ChartReadout>
      )}
      <BaseChart
        width={width}
        height={chartHeight}
        xScale={xScale}
        yScale={yScale}
        brushingMode="none"
        settings={{ ...settings, margin }}
        onClearPlot={() => updateChart(settings.id, { filters: [] })}
        footer={STATUS_LINE_HEIGHT}
        overlay={
          // Each group's column, including its axis label, is one target.
          <g>
            {shown.map(({ group, stats }) => {
              const label = categoryLabel(group);
              const selected = categoryIncludes(selectedGroups, group);
              return (
                <rect
                  key={label}
                  data-box-group={label}
                  className="eda-box-hit"
                  x={xScale(label) ?? 0}
                  y={0}
                  width={boxWidth}
                  height={innerHeight + 22}
                  fill="var(--foreground)"
                  fillOpacity={label === hoveredGroup ? 0.04 : 0}
                  role={settings.colorField ? "button" : undefined}
                  tabIndex={settings.colorField ? 0 : undefined}
                  aria-label={`${formatGroup(group)}: median ${format(stats.median)}, ${stats.totalCount} rows`}
                  aria-pressed={settings.colorField ? selected : undefined}
                  onPointerEnter={() => setHoveredGroup(label)}
                  onFocus={() => setHoveredGroup(label)}
                  onBlur={() => setHoveredGroup(null)}
                  onClick={(event) =>
                    event.altKey || !settings.colorField
                      ? inspect(categoryKey(group))
                      : handleBoxClick(group)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (event.altKey || !settings.colorField)
                        inspect(categoryKey(group));
                      else handleBoxClick(group);
                    }
                  }}
                  style={{
                    cursor: settings.colorField ? "pointer" : "default",
                  }}
                />
              );
            })}
            {settings.showObservations &&
              shown.flatMap(({ group }) => {
                const x = xScale(categoryLabel(group)) ?? 0;
                const color = getColorForValue(
                  settings.colorScaleId,
                  group,
                  settings.styles.boxFill
                );
                return (traceGroups.get(categoryKey(group))?.contributors ?? [])
                  .filter((item) => item.included)
                  .slice(0, 300)
                  .map((item) => (
                    <circle
                      key={`observation:${item.sourceId}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Inspect source row ${item.sourceId}: ${item.input}`}
                      className="chart-mark cursor-pointer"
                      cx={
                        x +
                        boxWidth *
                          (0.2 +
                            ((((item.sourceId * 2654435761) >>> 0) % 997) /
                              997) *
                              0.6)
                      }
                      cy={yScale(Number(item.input))}
                      r={3}
                      fill="var(--background)"
                      stroke={color}
                      strokeWidth={1.5}
                      onClick={() => inspect(`row:${item.sourceId}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          inspect(`row:${item.sourceId}`);
                        }
                      }}
                    />
                  ));
              })}
          </g>
        }
      >
        {shown.map(({ group, stats }) => {
          const label = categoryLabel(group);
          const dimmed =
            selectedGroups.length > 0 &&
            !categoryIncludes(selectedGroups, group);
          const outlined =
            label === hoveredGroup || (selectedGroups.length === 1 && !dimmed);
          const boxColor = getColorForValue(
            settings.colorScaleId,
            group,
            settings.styles.boxFill
          );
          const xPos = xScale(label) ?? 0;
          const kde = groupKDEs?.find((g) => g.group === group)?.kde;
          const firstKde = kde?.[0];
          const lastKde = kde?.at(-1);
          const medianY = yScale(stats.median);

          return (
            <g
              key={label}
              transform={`translate(${xPos}, 0)`}
              className="eda-box-group"
              opacity={dimmed && label !== hoveredGroup ? 0.3 : 1}
              pointerEvents="none"
            >
              {/* The violin sits behind the box so the box keeps its color. */}
              {settings.violinOverlay && kde && firstKde && lastKde && (
                <path
                  d={createPath([
                    [boxWidth / 2, yScale(firstKde[0])],
                    ...kde.map(
                      ([x, y]) =>
                        [boxWidth / 2 + y * boxWidth * 0.45, yScale(x)] as [
                          number,
                          number,
                        ]
                    ),
                    ...[...kde]
                      .reverse()
                      .map(
                        ([x, y]) =>
                          [boxWidth / 2 - y * boxWidth * 0.45, yScale(x)] as [
                            number,
                            number,
                          ]
                      ),
                  ])}
                  fill={boxColor}
                  style={{ fillOpacity: "var(--eda-violin-opacity)" }}
                  stroke={boxColor}
                  strokeWidth={1}
                />
              )}
              <line
                x1={boxWidth / 2}
                x2={boxWidth / 2}
                y1={yScale(stats.whiskerHigh)}
                y2={yScale(stats.whiskerLow)}
                stroke={settings.violinOverlay ? boxStroke : boxColor}
                strokeWidth={settings.styles.whiskerStrokeWidth}
              />
              {!settings.violinOverlay && (
                <g stroke={boxColor} strokeWidth={1}>
                  <line
                    x1={boxWidth / 2 - boxPixels / 4}
                    x2={boxWidth / 2 + boxPixels / 4}
                    y1={yScale(stats.whiskerHigh)}
                    y2={yScale(stats.whiskerHigh)}
                  />
                  <line
                    x1={boxWidth / 2 - boxPixels / 4}
                    x2={boxWidth / 2 + boxPixels / 4}
                    y1={yScale(stats.whiskerLow)}
                    y2={yScale(stats.whiskerLow)}
                  />
                </g>
              )}
              <rect
                rx={2}
                x={boxX}
                y={yScale(stats.q3)}
                width={boxPixels}
                height={Math.max(1, yScale(stats.q1) - yScale(stats.q3))}
                fill={boxColor}
                stroke={outlined ? "var(--foreground)" : boxStroke}
                strokeWidth={outlined ? 2 : settings.styles.boxStrokeWidth}
              />
              {/* A dark halo keeps the median readable on light and dark fills. */}
              <line
                x1={boxX}
                x2={boxX + boxPixels}
                y1={medianY}
                y2={medianY}
                stroke="rgb(0 0 0 / 0.55)"
                strokeWidth={settings.styles.medianStrokeWidth + 2}
              />
              <line
                x1={boxX + 1}
                x2={boxX + boxPixels - 1}
                y1={medianY}
                y2={medianY}
                stroke={settings.styles.medianStroke}
                strokeWidth={settings.styles.medianStrokeWidth}
              />
              {settings.showOutliers &&
                stats.outliers.map((value: number, i: number) => (
                  <circle
                    key={i}
                    cx={boxWidth / 2}
                    cy={yScale(value)}
                    r={settings.styles.outlierSize}
                    fill={boxColor}
                    fillOpacity={0.5}
                    stroke={boxColor}
                  />
                ))}
            </g>
          );
        })}
      </BaseChart>
      {settings.showObservations && (
        <div className="absolute bottom-0 left-0 flex h-8 items-center gap-2 overflow-hidden px-2 text-xs text-muted-foreground">
          Observations: first 300 per group
        </div>
      )}
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={margin.left}
        right={margin.right}
        bottom={footerHeight + 2}
      />
    </div>
  );
}
