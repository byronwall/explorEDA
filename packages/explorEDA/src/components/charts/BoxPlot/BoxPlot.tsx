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
import { numericScale } from "../Axis/numericScale";
import { applyFilter } from "@/hooks/applyFilter";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { Filter, datum } from "@/types/FilterTypes";
import { ScaleLinear, scaleBand } from "d3-scale";
import natsort from "natsort";
import { useCallback, useId, useMemo, useState, type ReactNode } from "react";
import { BaseChart } from "../BaseChart";
import { getChartAxisFields, getChartAxisLabel } from "../chartAccessibility";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData, useGetLiveIds } from "../useGetLiveData";
import {
  calculateBoxPlotStats,
  calculateKernelDensity,
} from "./boxPlotCalculations";
import { BoxPlotSettings } from "./definition";

import { Button } from "@/components/ui/button";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";

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
  const chartHeight = Math.max(40, height - 32);
  const [tooltip, setTooltip] = useState<ReactNode>(null);
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
    bottom: Math.max(settings.margin.bottom, xAxisLabel ? 44 : 28),
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
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 1;
    const range = max - min;
    const padding = (range || Math.abs(min) || 1) * Y_SCALE_PADDING;

    const scale = numericScale(settings.yAxis)
      .domain([
        settings.yAxis.scaleType === "symlog" ? min : min - padding,
        max + padding,
      ])
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
            : [...traceGroups.values()].find((group) =>
                group.contributors.some((item) => item.sourceId === sourceId)
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
        [...traceGroups].map(([id, group]) => ({
          kind: "distribution",
          id,
          label: categoryLabel(group.group),
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

  const handleBoxClick = useCallback(
    (group: datum) => {
      if (!settings.colorField) {
        return;
      }

      let newValues: datum[] = [];
      if (activeFilter && activeFilter.type === "value") {
        // If group is already in filter, remove it
        if (categoryIncludes(activeFilter.values, group)) {
          newValues = activeFilter.values.filter(
            (v) => !categoryEqual(v, group)
          );
        } else {
          // Add group to existing filter
          newValues = [...activeFilter.values, group];
        }
      } else {
        // Create new filter with just this group
        newValues = [group];
      }

      // Create a new filter for the color field
      const newFilters = settings.filters.filter(
        (f: Filter) => f.field !== settings.colorField
      );

      if (newValues.length > 0) {
        newFilters.push({
          type: "value",
          field: settings.colorField,
          values: newValues,
        });
      }

      updateChart(settings.id, { filters: newFilters });
    },
    [
      settings.colorField,
      settings.filters,
      settings.id,
      activeFilter,
      updateChart,
    ]
  );

  // Helper function to check if a group matches the current filter
  const isGroupFiltered = useCallback(
    (group: datum) => {
      if (!settings.colorField) {
        return true;
      }

      if (
        !activeFilter ||
        activeFilter.type !== "value" ||
        !activeFilter.values
      ) {
        return true;
      }

      return applyFilter(group, activeFilter);
    },
    [settings.colorField, activeFilter]
  );

  return (
    <div
      className="relative"
      style={{ width, height }}
      onPointerLeave={() => setTooltip(null)}
    >
      {tooltip && (
        <div role="tooltip" className="eda-tooltip">
          {tooltip}
        </div>
      )}
      <BaseChart
        width={width}
        height={chartHeight}
        xScale={xScale}
        yScale={yScale}
        brushingMode="none"
        settings={{ ...settings, margin }}
      >
        {/* Main content */}
        {groupStats
          .filter(({ stats }) => stats.totalCount > 0)
          .map(({ group, stats }) => {
            const isFiltered = isGroupFiltered(group);
            const boxColor = isFiltered
              ? getColorForValue(
                  settings.colorScaleId,
                  group,
                  settings.styles.boxFill
                )
              : "rgb(156 163 175)";
            const xPos = xScale(categoryLabel(group)) ?? 0;
            const boxWidth = xScale.bandwidth();

            // Get KDE for this group if violin overlay is enabled
            const kde = groupKDEs?.find((g) => g.group === group)?.kde;
            const firstKde = kde?.[0];
            const lastKde = kde?.at(-1);

            const format = (value: number) =>
              formatFieldValue(settings.field, value);
            const formatGroup = (value: datum) =>
              settings.colorField
                ? formatFieldValue(settings.colorField, value)
                : categoryLabel(value);
            const boxTooltipContent = (
              <div>
                <p className="font-medium">
                  {formatGroup(group)}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {stats.totalCount} rows
                  </span>
                </p>
                <dl className="grid grid-cols-[auto_auto] gap-x-3">
                  <dt>Median</dt>
                  <dd className="text-right tabular-nums">
                    {format(stats.median)}
                  </dd>
                  <dt>Middle 50%</dt>
                  <dd className="text-right tabular-nums">
                    {format(stats.q1)}–{format(stats.q3)}
                  </dd>
                  {stats.outliers.length > 0 && (
                    <>
                      <dt>Outliers</dt>
                      <dd className="text-right">{stats.outliers.length}</dd>
                    </>
                  )}
                </dl>
              </div>
            );
            const whiskerTooltipContent = (
              <div>
                <p className="font-medium">{formatGroup(group)}</p>
                <p>
                  Whiskers {format(stats.whiskerLow)}–
                  {format(stats.whiskerHigh)}
                </p>
              </div>
            );

            return (
              <g key={categoryLabel(group)} transform={`translate(${xPos}, 0)`}>
                {/* Whiskers */}
                <line
                  onPointerEnter={() => setTooltip(whiskerTooltipContent)}
                  onPointerLeave={() => setTooltip(null)}
                  x1={boxWidth / 2}
                  x2={boxWidth / 2}
                  y1={yScale(stats.whiskerHigh)}
                  y2={yScale(stats.whiskerLow)}
                  stroke={boxColor}
                  strokeWidth={settings.styles.whiskerStrokeWidth}
                />

                {/* Box */}
                <rect
                  onPointerEnter={() => setTooltip(boxTooltipContent)}
                  onPointerMove={() => setTooltip(boxTooltipContent)}
                  onPointerLeave={() => setTooltip(null)}
                  onFocus={() => setTooltip(boxTooltipContent)}
                  onBlur={() => setTooltip(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${group}: median ${stats.median.toFixed(2)}, ${stats.totalCount} records`}
                  aria-pressed={
                    activeFilter?.type === "value"
                      ? categoryIncludes(activeFilter.values, group)
                      : false
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (event.altKey || !settings.colorField)
                        inspect(categoryKey(group));
                      else handleBoxClick(group);
                    }
                  }}
                  className="chart-mark"
                  rx={2}
                  x={boxWidth * 0.15}
                  y={yScale(stats.q3)}
                  width={boxWidth * 0.7}
                  height={yScale(stats.q1) - yScale(stats.q3)}
                  fill={boxColor}
                  stroke={settings.styles.boxStroke}
                  strokeWidth={settings.styles.boxStrokeWidth}
                  onClick={(event) =>
                    event.altKey || !settings.colorField
                      ? inspect(categoryKey(group))
                      : handleBoxClick(group)
                  }
                  style={{
                    cursor: settings.colorField ? "pointer" : "default",
                  }}
                />

                {/* Median line */}
                <line
                  pointerEvents="none"
                  x1={0}
                  x2={boxWidth}
                  y1={yScale(stats.median)}
                  y2={yScale(stats.median)}
                  stroke={settings.styles.medianStroke}
                  strokeWidth={settings.styles.medianStrokeWidth}
                />

                {/* Outliers */}
                {settings.showOutliers &&
                  stats.outliers.map((value: number, i: number) => (
                    <circle
                      key={i}
                      onPointerEnter={() =>
                        setTooltip(<span>Outlier: {format(value)}</span>)
                      }
                      onPointerLeave={() => setTooltip(null)}
                      cx={boxWidth / 2}
                      cy={yScale(value)}
                      r={settings.styles.outlierSize}
                      fill={boxColor}
                    />
                  ))}

                {settings.showObservations &&
                  traceGroups
                    .get(categoryKey(group))
                    ?.contributors.filter((item) => item.included)
                    .slice(0, 300)
                    .map((item) => (
                      <circle
                        key={item.sourceId}
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect source row ${item.sourceId}: ${item.input}`}
                        className="chart-mark cursor-pointer"
                        cx={
                          boxWidth *
                          (0.2 +
                            ((((item.sourceId * 2654435761) >>> 0) % 997) /
                              997) *
                              0.6)
                        }
                        cy={yScale(Number(item.input))}
                        r={3}
                        fill="var(--background)"
                        stroke={boxColor}
                        strokeWidth={1.5}
                        onClick={() => inspect(`row:${item.sourceId}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            inspect(`row:${item.sourceId}`);
                          }
                        }}
                      />
                    ))}

                {/* Violin plot overlay */}
                {settings.violinOverlay && kde && firstKde && lastKde && (
                  <g>
                    <path
                      d={createPath([
                        [boxWidth / 2, yScale(firstKde[0])],
                        ...kde.map(
                          ([x, y]) =>
                            [boxWidth / 2 + y * boxWidth * 0.4, yScale(x)] as [
                              number,
                              number,
                            ]
                        ),
                        ...[...kde]
                          .reverse()
                          .map(
                            ([x, y]) =>
                              [
                                boxWidth / 2 - y * boxWidth * 0.4,
                                yScale(x),
                              ] as [number, number]
                          ),
                      ])}
                      fill={boxColor}
                      fillOpacity={0.2}
                      stroke={boxColor}
                      strokeWidth={1}
                      pointerEvents="none"
                    />
                  </g>
                )}
              </g>
            );
          })}
      </BaseChart>
      <div className="flex h-8 items-center gap-2 overflow-hidden px-2 text-xs text-muted-foreground">
        <Button
          variant="ghost"
          className="h-7 shrink-0 px-1 text-xs"
          disabled={!traceGroups.size}
          onClick={() => {
            const key = traceGroups.keys().next().value;
            if (key) inspect(key);
          }}
        >
          Inspect distribution
        </Button>
        {settings.showObservations && (
          <span>Observations: first 300 per group</span>
        )}
      </div>
    </div>
  );
}
