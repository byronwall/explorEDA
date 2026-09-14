import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { applyFilter } from "@/hooks/applyFilter";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useFacetAxis } from "@/providers/FacetAxisProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { Filter, datum } from "@/types/FilterTypes";
import { ScaleLinear, scaleBand, scaleLinear } from "d3-scale";
import natsort from "natsort";
import { useCallback, useEffect, useMemo } from "react";
import { BaseChart } from "../BaseChart";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData } from "../useGetLiveData";
import {
  calculateBeeSwarmPositions,
  calculateBoxPlotStats,
  calculateKernelDensity,
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
  const updateChart = useDataLayer((s) => s.updateChart);
  const { getColorForValue } = useColorScales();
  const registerAxisLimits = useFacetAxis((s) => s.registerAxisLimits);
  const getGlobalAxisLimits = useFacetAxis((s) => s.getGlobalAxisLimits);

  // Get all data for axis limits calculation
  const allData = useGetColumnDataForIds(settings.field);

  // Get filtered data for rendering
  const liveData = useGetLiveData(settings, settings.field, facetIds);

  // Get color field data if specified
  const colorFieldData = useGetLiveData(
    settings,
    settings.colorField,
    facetIds
  );
  const hasColorField = !!settings.colorField;

  // Chart dimensions
  const margin = settings.margin;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Group data by color field if specified
  const groupedData = useMemo(() => {
    if (!hasColorField) {
      const validData = liveData.map(Number).filter((x) => !isNaN(x));

      const result = [
        {
          group: "All Data",
          data: validData,
        },
      ];
      return result;
    }

    const groups = new Map<string | number, number[]>();

    liveData.forEach((value, index) => {
      const colorValue = colorFieldData[index];
      const numValue = Number(value);

      if (colorValue === undefined || colorValue === null) {
        return;
      }

      if (isNaN(numValue)) {
        return;
      }

      if (typeof colorValue === "string" || typeof colorValue === "number") {
        if (!groups.has(colorValue)) {
          groups.set(colorValue, []);
        }
        groups.get(colorValue)?.push(numValue);
      }
    });

    const result = Array.from(groups.entries()).map(([group, data]) => ({
      group,
      data,
    }));

    // If we have no valid groups but we do have data, fall back to single group
    if (result.length === 0 && liveData.length > 0) {
      const validData = liveData.map(Number).filter((x) => !isNaN(x));

      return [
        {
          group: "All Data",
          data: validData,
        },
      ];
    }

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
      const stdDev = Math.sqrt(
        data.reduce(
          (sum, x) =>
            sum +
            Math.pow(x - data.reduce((a, b) => a + b, 0) / data.length, 2),
          0
        ) / data.length
      );
      const autoBandwidth = 1.06 * stdDev * Math.pow(data.length, -0.2);

      const bandwidth = settings.autoBandwidth
        ? autoBandwidth
        : settings.violinBandwidth;

      return {
        group,
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
    const groups = groupedData.map((g) => g.group?.toString() ?? "All Data");

    // Sort groups based on settings
    const sortedGroups = [...groups].sort((a, b) => {
      if (settings.sortBy === "median") {
        const aStats = groupStats.find((g) => g.group?.toString() === a)?.stats;
        const bStats = groupStats.find((g) => g.group?.toString() === b)?.stats;
        return (bStats?.median ?? 0) - (aStats?.median ?? 0);
      }
      return natsort()(a, b);
    });

    const scale = scaleBand()
      .domain(sortedGroups)
      .range([0, innerWidth])
      .padding(BOX_PADDING);

    return scale;
  }, [groupedData, innerWidth, settings.sortBy, groupStats]);

  // Create path generator for violin shapes
  const createPath = useCallback((points: [number, number][]) => {
    if (points.length === 0) {
      return "";
    }
    return points
      .map((point, i) => `${i === 0 ? "M" : "L"} ${point[0]} ${point[1]}`)
      .join(" ");
  }, []);

  // Calculate bee swarm positions for each group if enabled
  const groupBeeSwarmPositions = useMemo(() => {
    if (!settings.beeSwarmOverlay) {
      return null;
    }

    return groupedData.map(({ group, data }) => {
      return {
        group,
        positions: calculateBeeSwarmPositions(data, xScale.bandwidth(), 1000),
      };
    });
  }, [groupedData, settings.beeSwarmOverlay, xScale]);

  // Get global axis limits if in a facet
  const globalYLimits = facetIds ? getGlobalAxisLimits("y") : null;

  // Create y scale with synchronized limits if in a facet
  const yScale = useMemo(() => {
    const allStats = groupStats.map((g) => g.stats);
    const min = Math.min(...allStats.map((s) => s.whiskerLow));
    const max = Math.max(...allStats.map((s) => s.whiskerHigh));
    const range = max - min;
    const padding = range * Y_SCALE_PADDING;

    const globalMin =
      globalYLimits?.type === "numerical" ? globalYLimits.min : min - padding;
    const globalMax =
      globalYLimits?.type === "numerical" ? globalYLimits.max : max + padding;

    const scale = scaleLinear()
      .domain([globalMin, globalMax])
      .range([innerHeight, 0]);

    return scale;
  }, [groupStats, innerHeight, globalYLimits]) as ScaleLinear<number, number>;

  // Register axis limits with the facet context
  useEffect(() => {
    if (facetIds && allData.length > 0) {
      registerAxisLimits(settings.id, "y", {
        type: "numerical",
        min: yScale.domain()[0] ?? 0,
        max: yScale.domain()[1] ?? 0,
      });

      if (settings.colorField) {
        registerAxisLimits(settings.id, "x", {
          type: "categorical",
          categories: new Set(
            groupedData.map((g) => g.group?.toString() ?? "")
          ),
        });
      }
    }
  }, [
    settings.id,
    settings.colorField,
    facetIds,
    allData,
    groupStats,
    registerAxisLimits,
    yScale,
    groupedData,
  ]);

  const handleBrushChange = useCallback(
    (extent: [[number, number], [number, number]] | null) => {
      if (!extent) {
        // Remove range filter for the field
        const newFilters = settings.filters.filter(
          (f: Filter) => f.field !== settings.field
        );
        updateChart(settings.id, { filters: newFilters });
        return;
      }

      const [, [, y1]] = extent;
      const yStart = yScale.invert(y1);
      const yEnd = yScale.invert(extent[0][1]);

      // Create new filters array with updated range filter
      const newFilters = settings.filters.filter(
        (f: Filter) => f.field !== settings.field
      );

      newFilters.push({
        type: "range",
        field: settings.field,
        min: Math.min(yStart, yEnd),
        max: Math.max(yStart, yEnd),
      });

      updateChart(settings.id, { filters: newFilters });
    },
    [settings.id, settings.field, settings.filters, updateChart, yScale]
  );

  const activeFilter = useMemo(() => {
    return settings.filters.find(
      (f: Filter) => f.field === settings.colorField
    );
  }, [settings.filters, settings.colorField]);

  const handleBoxClick = useCallback(
    (group: string | number) => {
      if (!settings.colorField) {
        return;
      }

      let newValues: datum[] = [];
      if (activeFilter && activeFilter.type === "value") {
        // If group is already in filter, remove it
        if (activeFilter.values.includes(group)) {
          newValues = activeFilter.values.filter((v) => v !== group);
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
    (group: string | number) => {
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
    <div style={{ width, height }}>
      <TooltipProvider>
        <BaseChart
          width={width}
          height={height}
          xScale={xScale}
          yScale={yScale}
          brushingMode="2d"
          onBrushChange={handleBrushChange}
          settings={settings}
        >
          {/* Axis labels */}
          {settings.xAxisLabel && (
            <text
              x={innerWidth / 2}
              y={innerHeight + margin.bottom - 5}
              textAnchor="middle"
              className="text-sm fill-muted-foreground"
            >
              {settings.xAxisLabel}
            </text>
          )}
          {settings.yAxisLabel && (
            <text
              x={-innerHeight / 2}
              y={-margin.left + 15}
              textAnchor="middle"
              transform="rotate(-90)"
              className="text-sm fill-muted-foreground"
            >
              {settings.yAxisLabel}
            </text>
          )}

          {/* Main content */}
          {groupStats.map(({ group, stats }) => {
            const isFiltered = isGroupFiltered(group);
            const boxColor = isFiltered
              ? getColorForValue(
                  settings.colorScaleId,
                  group ?? settings.styles.boxFill
                )
              : "rgb(156 163 175)";
            const xPos = xScale(group?.toString() ?? "") ?? 0;
            const boxWidth = xScale.bandwidth();

            // Get KDE for this group if violin overlay is enabled
            const kde = groupKDEs?.find((g) => g.group === group)?.kde;
            const firstKde = kde?.[0];
            const lastKde = kde?.at(-1);

            // Get bee swarm positions for this group if enabled
            const beeSwarmPositions = groupBeeSwarmPositions?.find(
              (g) => g.group === group
            )?.positions;

            // Create tooltip content for the box
            const boxTooltipContent = (
              <div className="space-y-1">
                <p className="font-medium">{group?.toString() ?? "All Data"}</p>
                <p>Total Points: {stats.totalCount}</p>
                <p>Outliers: {stats.outliers.length}</p>
                <p>Q1: {stats.q1.toFixed(2)}</p>
                <p>Median: {stats.median.toFixed(2)}</p>
                <p>Q3: {stats.q3.toFixed(2)}</p>
                <p>IQR: {stats.iqr.toFixed(2)}</p>
              </div>
            );

            // Create tooltip content for whiskers
            const whiskerTooltipContent = (
              <div className="space-y-1">
                <p className="font-medium">{group?.toString() ?? "All Data"}</p>
                <p>Lower Whisker: {stats.whiskerLow.toFixed(2)}</p>
                <p>Upper Whisker: {stats.whiskerHigh.toFixed(2)}</p>
              </div>
            );

            return (
              <g
                key={group?.toString() ?? "default"}
                transform={`translate(${xPos}, 0)`}
              >
                {/* Whiskers */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <line
                      x1={boxWidth / 2}
                      x2={boxWidth / 2}
                      y1={yScale(stats.whiskerHigh)}
                      y2={yScale(stats.whiskerLow)}
                      stroke={boxColor}
                      strokeWidth={settings.styles.whiskerStrokeWidth}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{whiskerTooltipContent}</TooltipContent>
                </Tooltip>

                {/* Box */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <rect
                      x={0}
                      y={yScale(stats.q3)}
                      width={boxWidth}
                      height={yScale(stats.q1) - yScale(stats.q3)}
                      fill={boxColor}
                      stroke={settings.styles.boxStroke}
                      strokeWidth={settings.styles.boxStrokeWidth}
                      onClick={() => handleBoxClick(group)}
                      style={{
                        cursor: settings.colorField ? "pointer" : "default",
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{boxTooltipContent}</TooltipContent>
                </Tooltip>

                {/* Median line */}
                <line
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
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <circle
                          cx={boxWidth / 2}
                          cy={yScale(value)}
                          r={settings.styles.outlierSize}
                          fill={boxColor}
                          stroke={settings.styles.outlierStroke}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Outlier: {value.toFixed(2)}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}

                {/* Violin plot overlay */}
                {settings.violinOverlay && kde && firstKde && lastKde && (
                  <g>
                    <path
                      d={createPath(
                        settings.beeSwarmOverlay
                          ? // If bee swarm is enabled, only show left half of violin
                            [
                              [boxWidth / 2, yScale(firstKde[0])] as [
                                number,
                                number,
                              ],
                              ...kde.map(
                                ([x, y]) =>
                                  [
                                    boxWidth / 2 - y * boxWidth * 0.4,
                                    yScale(x),
                                  ] as [number, number]
                              ),
                              [
                                boxWidth / 2,
                                yScale(lastKde[0]),
                              ] as [number, number],
                            ]
                          : // Otherwise show full violin
                            [
                              [boxWidth / 2, yScale(firstKde[0])] as [
                                number,
                                number,
                              ],
                              ...kde.map(
                                ([x, y]) =>
                                  [
                                    boxWidth / 2 + y * boxWidth * 0.4,
                                    yScale(x),
                                  ] as [number, number]
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
                            ]
                      )}
                      fill={boxColor}
                      fillOpacity={0.2}
                      stroke={boxColor}
                      strokeWidth={1}
                      pointerEvents="none"
                    />
                  </g>
                )}

                {/* Bee swarm overlay */}
                {settings.beeSwarmOverlay && beeSwarmPositions && (
                  <g>
                    {beeSwarmPositions.map(([x, y], i) => (
                      <circle
                        key={i}
                        cx={
                          settings.violinOverlay
                            ? boxWidth / 2 + Math.abs(x)
                            : boxWidth / 2 + x
                        }
                        cy={yScale(y)}
                        r={2}
                        fill={boxColor}
                        fillOpacity={0.5}
                        stroke="none"
                        pointerEvents="none"
                      />
                    ))}
                  </g>
                )}
              </g>
            );
          })}
        </BaseChart>
      </TooltipProvider>
    </div>
  );
}
