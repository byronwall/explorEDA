import {
  categoryEqual,
  categoryIncludes,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import { numericScale } from "../Axis/numericScale";
import { numericBins } from "./bins";
import { useColorScales } from "@/hooks/useColorScales";
import { getRangeFilterForField } from "@/hooks/getAxisFilter";
import { applyFilter } from "@/hooks/applyFilter";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from "d3-scale";
import { useCallback, useMemo, useState } from "react";
import isEqual from "react-fast-compare";
import { useCustomCompareMemo } from "use-custom-compare";
import { BaseChart } from "../BaseChart";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData } from "../useGetLiveData";
import {
  displayAggregateValue,
  type AggregateResult,
  type AggregateResultRow,
} from "@/lib/aggregates";
import { GroupedAggregateInspector } from "./GroupedAggregateInspector";
import { BarChartSettings } from "./definition";
import { getChartAxisLabel } from "../chartAccessibility";

const X_SCALE_PADDING = 0.05; // 5% padding on each side
const Y_SCALE_PADDING = 0.1; // 10% padding for top of bars

type NumericBin = {
  label: string;
  start: number;
  end: number;
  value: number;
  isNumeric: true;
};

type CategoryBin = {
  label: string;
  category: datum;
  value: number;
  isNumeric: false;
};

type AggregateBin = {
  label: string;
  category: datum;
  value: number | undefined;
  isNumeric: false;
  aggregateRow: AggregateResultRow;
};

type BarChartProps = BaseChartProps<BarChartSettings> & {
  aggregateResult?: AggregateResult;
  aggregateScope?: string;
  formatValue?: (value: datum) => string;
};

export function BarChart({
  settings,
  width,
  height,
  facetIds,
  aggregateResult,
  aggregateScope = "This result uses the current globally filtered source rows",
  formatValue,
}: BarChartProps) {
  const getAggregateResult = useDataLayer((s) => s.getAggregateResult);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const nonce = useDataLayer((s) => s.nonce);
  const aggregates = useDataLayer((s) => s.aggregates);
  const aggregateLiveItems = useDataLayer((s) => s.getLiveItems(settings));
  const resolvedAggregateResult = useMemo(() => {
    void aggregates;
    void aggregateLiveItems;
    void fieldSettings;
    void nonce;
    return settings.aggregateId
      ? getAggregateResult(settings.aggregateId)
      : undefined;
  }, [
    settings.aggregateId,
    getAggregateResult,
    aggregates,
    aggregateLiveItems,
    fieldSettings,
    nonce,
  ]);
  const effectiveAggregateResult = aggregateResult ?? resolvedAggregateResult;
  void fieldSettings;
  void nonce;
  const isAggregate = Boolean(settings.aggregateId);
  // Get all data for axis limits calculation (not filtered by current selections)
  const allColData = useGetColumnDataForIds(settings.field);
  // Get filtered data for rendering
  const liveColData = useGetLiveData(settings, settings.field, facetIds);

  const updateChart = useDataLayer((s) => s.updateChart);
  const { getColorForValue } = useColorScales();
  const [inspectedRowId, setInspectedRowId] = useState<string>();
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const isNumeric = useMemo(
    () =>
      !isAggregate &&
      fieldSettings[settings.field]?.type !== "categorical" &&
      !settings.forceString &&
      allColData.some((d) => d != null && d !== "") &&
      allColData
        .filter((d) => d != null && d !== "")
        .every((d) => typeof d !== "boolean" && Number.isFinite(Number(d))),
    [
      allColData,
      fieldSettings,
      isAggregate,
      settings.field,
      settings.forceString,
    ]
  );

  // Calculate chart data from live (filtered) data for rendering
  const chartData = useMemo(() => {
    void nonce;
    if (isAggregate) {
      return (effectiveAggregateResult?.rows ?? []).map(
        (row): AggregateBin => ({
          label: row.groupLabel,
          category: row.groupValue,
          value: row.value,
          isNumeric: false,
          aggregateRow: row,
        })
      );
    }
    if (isNumeric) {
      return numericBins(
        allColData.filter((d) => d != null && d !== "").map(Number),
        liveColData.filter((d) => d != null && d !== "").map(Number),
        settings.binCount || 20
      );
    } else {
      const categories = new Map(
        allColData.map((value) => [categoryKey(value), categoryValue(value)])
      );
      const counts = new Map<string, number>();
      liveColData.forEach((value) =>
        counts.set(
          categoryKey(value),
          (counts.get(categoryKey(value)) ?? 0) + 1
        )
      );
      return Array.from(
        categories,
        ([key, category]): CategoryBin => ({
          label: categoryLabel(category),
          category,
          value: counts.get(key) ?? 0,
          isNumeric: false,
        })
      );
    }
  }, [
    effectiveAggregateResult,
    allColData,
    isAggregate,
    isNumeric,
    liveColData,
    settings.binCount,
    nonce,
  ]);

  // Calculate min/max from ALL data for axis limits
  const { min, max, uniqueValues } = useMemo(() => {
    if (isAggregate) {
      return {
        min: undefined,
        max: undefined,
        uniqueValues: chartData.map((item) => item.label),
      };
    }
    if (isNumeric) {
      const numericData = allColData
        .filter((d) => d != null && d !== "")
        .map(Number);
      const dataMin = Math.min(...numericData);
      const dataMax = Math.max(...numericData);

      return {
        min: dataMin === dataMax ? dataMin - 0.5 : dataMin,
        max: dataMin === dataMax ? dataMax + 0.5 : dataMax,
        uniqueValues: undefined,
      };
    }

    return {
      min: undefined,
      max: undefined,
      uniqueValues: Array.from(new Set(allColData.map(categoryLabel))),
    };
  }, [allColData, chartData, isAggregate, isNumeric]);

  // Keep numeric axis labels and X ticks inside the SVG viewport.
  const populationCounts = isNumeric
    ? numericBins(
        allColData.filter((d) => d != null && d !== "").map(Number),
        allColData.filter((d) => d != null && d !== "").map(Number),
        settings.binCount || 20
      ).map((bin) => bin.value)
    : isAggregate
      ? chartData
          .map((item) => item.value)
          .filter((value): value is number => Number.isFinite(value))
      : Array.from(
          allColData
            .reduce(
              (counts, value) =>
                counts.set(
                  categoryKey(value),
                  (counts.get(categoryKey(value)) ?? 0) + 1
                ),
              new Map<string, number>()
            )
            .values()
        );
  const yScaleMax = Math.max(
    1,
    Math.max(...populationCounts, 0) * (1 + Y_SCALE_PADDING)
  );
  const aggregateMin = isAggregate ? Math.min(...populationCounts, 0) : 0;
  const aggregateMax = isAggregate
    ? Math.max(...populationCounts, 0)
    : yScaleMax;
  const aggregatePadding =
    isAggregate && aggregateMin === aggregateMax
      ? 0.5
      : (aggregateMax - aggregateMin) * Y_SCALE_PADDING;
  const aggregateAxisFields = isAggregate
    ? {
        x: effectiveAggregateResult?.spec.groupField,
        y:
          effectiveAggregateResult?.spec.aggregation === "count"
            ? undefined
            : effectiveAggregateResult?.spec.measureField,
      }
    : undefined;
  const aggregateXAxisLabel =
    effectiveAggregateResult &&
    (settings.xAxisLabel ||
      getFieldLabel(effectiveAggregateResult.spec.groupField));
  const aggregateYAxisLabel = effectiveAggregateResult
    ? settings.yAxisLabel ||
      (effectiveAggregateResult.spec.aggregation === "count"
        ? "Count"
        : getFieldLabel(
            effectiveAggregateResult.spec.measureField ?? "Measure"
          ))
    : settings.yAxisLabel;
  const xAxisLabel = getChartAxisLabel(
    aggregateAxisFields?.x ?? settings.field,
    isAggregate ? aggregateXAxisLabel || "" : settings.xAxisLabel,
    getFieldLabel
  );
  const yAxisLabel = getChartAxisLabel(
    aggregateAxisFields?.y,
    isAggregate ? aggregateYAxisLabel || "" : settings.yAxisLabel,
    getFieldLabel
  );
  const yTickLabelWidth = Math.max(
    ...scaleLinear()
      .domain(
        isAggregate
          ? [
              aggregateMin - (aggregateMin < 0 ? aggregatePadding : 0),
              aggregateMax + aggregatePadding,
            ]
          : [0, yScaleMax]
      )
      .ticks(5)
      .map((tick) => String(tick).length * 7 + (yAxisLabel ? 38 : 18))
  );
  const minPlotWidth = Math.min(
    80,
    Math.max(0, width - settings.margin.left - settings.margin.right)
  );
  const maxLeftMargin = Math.max(
    0,
    width - settings.margin.right - minPlotWidth
  );
  const margin = {
    ...settings.margin,
    left: Math.min(
      Math.max(settings.margin.left, yTickLabelWidth),
      maxLeftMargin
    ),
    bottom: Math.max(settings.margin.bottom, xAxisLabel ? 46 : 28),
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const aggregateGroupField = effectiveAggregateResult?.spec.groupField;
  const groupDisplaySettings = aggregateGroupField
    ? fieldSettings[aggregateGroupField]
    : undefined;
  const hasGroupDisplayFormat = Boolean(
    groupDisplaySettings &&
      ((groupDisplaySettings.format &&
        groupDisplaySettings.format !== "auto") ||
        groupDisplaySettings.precision !== undefined ||
        groupDisplaySettings.unit)
  );

  // Create scales with synchronized limits if in a facet
  const xScale = useCustomCompareMemo(
    () => {
      if (min !== undefined && max !== undefined) {
        // Numerical x-axis
        const padding = (max - min) * X_SCALE_PADDING;
        return numericScale(settings.xAxis)
          .domain([min - padding, max + padding])
          .range([0, innerWidth]);
      } else {
        return scaleBand()
          .domain(uniqueValues ?? [])
          .range([0, innerWidth])
          .padding(0.3);
      }
    },
    [innerWidth, max, min, uniqueValues, settings.xAxis],
    isEqual
  ) as ScaleLinear<number, number> | ScaleBand<string>;

  const yScale = useMemo(() => {
    return numericScale(settings.yAxis)
      .domain(
        isAggregate
          ? [
              aggregateMin - (aggregateMin < 0 ? aggregatePadding : 0),
              aggregateMax + aggregatePadding,
            ]
          : [0, yScaleMax]
      )
      .range([innerHeight, 0]);
  }, [
    aggregateMax,
    aggregateMin,
    aggregatePadding,
    innerHeight,
    isAggregate,
    settings.yAxis,
    yScaleMax,
  ]);

  const isBandScale = "bandwidth" in xScale;

  const valueFilter = settings.filters.find(
    (f): f is ValueFilter => f.type === "value" && f.field === settings.field
  );
  const rangeFilter = isAggregate
    ? undefined
    : getRangeFilterForField(settings.filters, settings.field);
  const hasActiveFilters = !isAggregate && (valueFilter || rangeFilter);

  const handleBarClick = useCallback(
    (label: datum) => {
      if (isAggregate) {
        const row = effectiveAggregateResult?.rows.find((candidate) =>
          categoryEqual(candidate.groupValue, label)
        );
        if (row) {
          setInspectedRowId(row.id);
          setInspectorOpen(true);
        }
        return;
      }
      if (!isBandScale) {
        return;
      }

      const filterValues = valueFilter?.values ?? [];
      const newValues = categoryIncludes(filterValues, label)
        ? filterValues.filter((f) => !categoryEqual(f, label))
        : [...filterValues, label];

      // Create new filters array with updated value filter
      const newFilters = settings.filters.filter(
        (f) => f.type !== "value" || f.field !== settings.field
      );

      if (newValues.length > 0) {
        newFilters.push({
          type: "value",
          field: settings.field,
          values: newValues,
        });
      }

      updateChart(settings.id, {
        filters: newFilters,
      });
    },
    [
      isBandScale,
      settings.id,
      settings.field,
      updateChart,
      valueFilter,
      settings.filters,
      effectiveAggregateResult,
      isAggregate,
    ]
  );

  const handleBrushChange = useCallback(
    (extent: [[number, number], [number, number]] | null) => {
      if (!extent) {
        // Remove both value and range filters for the field
        const newFilters = settings.filters.filter(
          (f) => f.field !== settings.field
        );
        updateChart(settings.id, {
          filters: newFilters,
        });
        return;
      }

      if (isBandScale) {
        return;
      }

      const xStart = extent?.[0]?.[0];
      const xEnd = extent?.[1]?.[0];

      const linearScale = xScale as ScaleLinear<number, number>;
      const start = linearScale.invert(xStart);
      const end = linearScale.invert(xEnd);

      // Create new filters array with updated range filter
      const newFilters = settings.filters.filter(
        (f) => f.field !== settings.field
      );

      newFilters.push({
        type: "range",
        field: settings.field,
        min: start,
        max: end,
      });

      updateChart(settings.id, {
        filters: newFilters,
      });
    },
    [
      isBandScale,
      settings.id,
      settings.field,
      updateChart,
      xScale,
      settings.filters,
    ]
  );

  return (
    <div style={{ width, height }}>
      <BaseChart
        width={width}
        height={height}
        xScale={xScale}
        yScale={yScale}
        brushingMode={isBandScale ? "none" : "horizontal"}
        onBrushChange={handleBrushChange}
        settings={{
          ...settings,
          ...(isAggregate
            ? {
                xAxisLabel: aggregateXAxisLabel || "",
                yAxisLabel: aggregateYAxisLabel || "",
              }
            : {}),
          margin,
          yAxis: { grid: true, ...settings.yAxis },
        }}
        axisFields={aggregateAxisFields}
      >
        <g>
          {chartData.map((d, i) => {
            const isNumeric = d.isNumeric;
            let x: number;
            let barWidth: number;

            if (isNumeric) {
              const numericBin = d as NumericBin;
              const linearScale = xScale as ScaleLinear<number, number>;
              x = linearScale(numericBin.start);
              barWidth =
                linearScale(numericBin.end) - linearScale(numericBin.start);
            } else {
              const categoryBin = d as CategoryBin;
              const bandScale = xScale as ScaleBand<string>;
              x = bandScale(categoryBin.label) || 0;
              barWidth = bandScale.bandwidth();
            }

            const value = isNumeric
              ? (d as NumericBin).start
              : (d as CategoryBin).category;
            const aggregateRow =
              !isNumeric && "aggregateRow" in d
                ? (d as AggregateBin).aggregateRow
                : undefined;
            let isFiltered = true;

            // Apply value and range filters using applyFilter
            if (valueFilter) {
              isFiltered = applyFilter(value, valueFilter);
            }

            if (rangeFilter && isNumeric) {
              isFiltered = applyFilter(value, rangeFilter);
            }

            const color =
              hasActiveFilters && !isFiltered
                ? "rgb(156 163 175)" // gray-400 for filtered out points
                : getColorForValue(settings.colorScaleId, value, "#3479a8");

            if (typeof d.value !== "number" || !Number.isFinite(d.value)) {
              return null;
            }

            const baseline = yScale(0);
            const valuePosition = yScale(d.value);
            const barHeight = Math.abs(baseline - valuePosition);
            const barY = Math.min(baseline, valuePosition);

            if (barWidth < 1) {
              return null;
            }

            const displayHeight = Math.max(1, barHeight);
            const measureLabel = isAggregate
              ? aggregateRow && aggregateRow.value === undefined
                ? "No valid numbers"
                : displayAggregateValue(d.value)
              : `${d.value} records`;

            return (
              <rect
                key={i}
                x={x}
                y={barY}
                width={Math.max(0, barWidth - (isNumeric ? 1 : 0))}
                rx={1.5}
                role={isBandScale ? "button" : undefined}
                tabIndex={isBandScale ? 0 : undefined}
                aria-label={`${d.label}: ${measureLabel}`}
                aria-pressed={
                  isBandScale
                    ? !!valueFilter && applyFilter(value, valueFilter)
                    : undefined
                }
                onKeyDown={(event) => {
                  if (
                    isBandScale &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    handleBarClick(value);
                  }
                }}
                className={`chart-mark ${isBandScale ? "cursor-pointer" : ""}`}
                style={{ fill: color }}
                onClick={() =>
                  isBandScale && handleBarClick((d as CategoryBin).category)
                }
                height={displayHeight}
              >
                <title>
                  {isAggregate
                    ? `${d.label}: ${measureLabel}; ${aggregateRow?.contributors.length ?? 0} source rows`
                    : isNumeric
                      ? `Range: ${(d as NumericBin).start.toFixed(2)} - ${(
                          d as NumericBin
                        ).end.toFixed(2)}, Count: ${d.value}`
                      : `${(d as CategoryBin).label}, Count: ${d.value}`}
                </title>
              </rect>
            );
          })}
        </g>
      </BaseChart>
      {isAggregate && effectiveAggregateResult && (
        <GroupedAggregateInspector
          result={effectiveAggregateResult}
          open={inspectorOpen}
          onOpenChange={setInspectorOpen}
          selectedRowId={inspectedRowId}
          scopeDescription={aggregateScope}
          formatValue={
            formatValue ??
            ((value) =>
              effectiveAggregateResult.spec.aggregation === "count"
                ? displayAggregateValue(value)
                : formatFieldValue(
                    effectiveAggregateResult.spec.measureField ??
                      effectiveAggregateResult.spec.groupField,
                    value
                  ))
          }
          getFieldLabel={getFieldLabel}
          formatGroupValue={(value) =>
            hasGroupDisplayFormat && value != null
              ? formatFieldValue(
                  effectiveAggregateResult.spec.groupField,
                  value
                )
              : categoryLabel(value)
          }
        />
      )}
    </div>
  );
}
