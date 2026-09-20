import {
  categoryEqual,
  categoryIncludes,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import { numericScale } from "../Axis/numericScale";
import { BaseChartProps, RowChartSettings } from "@/types/ChartTypes";

import { useColorScales } from "@/hooks/useColorScales";
import { applyFilter } from "@/hooks/applyFilter";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { datum, Filter, ValueFilter } from "@/types/FilterTypes";
import { scaleBand } from "d3-scale";
import { useMemo } from "react";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { BaseChart } from "../BaseChart";
import { getChartAxisFields, getChartAxisLabel } from "../chartAccessibility";
import { useGetLiveData } from "../useGetLiveData";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";

type RowChartProps = BaseChartProps<RowChartSettings>;

export function RowChart({ settings, width, height, facetIds }: RowChartProps) {
  const allData = useGetColumnDataForIds(settings.field);
  const data = useGetLiveData(settings, settings.field, facetIds);

  const { getColorForValue } = useColorScales();

  const updateChart = useDataLayer((s) => s.updateChart);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  void fieldSettings;

  const valueFilter = settings.filters.find(
    (f: Filter): f is ValueFilter =>
      f.type === "value" && f.field === settings.field
  );
  const filterValues = valueFilter?.values ?? [];

  const handleBarClick = (label: datum) => {
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
  };

  // Chart dimensions
  const baseMargin = settings.margin;

  // Calculate counts and handle overflow
  const { displayCounts } = useMemo(() => {
    const countMap = new Map<datum, number>();
    allData.forEach((value) => {
      const key = categoryValue(value);
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    // Convert to array and sort by count descending
    const sortedCounts = Array.from(countMap.entries())
      .map(([value, count]) => ({
        value,
        key: categoryKey(value),
        label:
          value != null && hasFieldDisplayFormat(fieldSettings[settings.field])
            ? (formatFieldValue?.(settings.field, value) ??
              categoryLabel(value))
            : categoryLabel(value),
        count,
        other: false,
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate how many rows we can fit based on min and max row height constraints
    const availableHeight = height - baseMargin.top - baseMargin.bottom;
    const rowHeight = Math.max(
      settings.minRowHeight,
      Math.min(settings.maxRowHeight, availableHeight / sortedCounts.length)
    );
    const maxRows = Math.max(2, Math.floor(availableHeight / rowHeight));
    const liveCounts = new Map<datum, number>();
    data.forEach((value) => {
      const key = categoryValue(value);
      liveCounts.set(key, (liveCounts.get(key) ?? 0) + 1);
    });
    const visible = sortedCounts.map((item) => ({
      ...item,
      total: item.count,
      count: liveCounts.get(item.value) ?? 0,
    }));

    // If we have more items than we can display, create an "Others" category
    if (sortedCounts.length > maxRows) {
      const visibleCounts = visible.slice(0, maxRows - 1);
      const otherSum = visible
        .slice(maxRows - 1)
        .reduce((sum, item) => sum + item.count, 0);

      return {
        displayCounts: [
          ...visibleCounts,
          {
            key: "__other",
            label: "Other categories",
            value: undefined,
            other: true,
            count: otherSum,
            total: visible
              .slice(maxRows - 1)
              .reduce((sum, item) => sum + item.total, 0),
          },
        ],
      };
    }

    return {
      displayCounts: visible,
    };
  }, [
    data,
    allData,
    height,
    baseMargin.top,
    baseMargin.bottom,
    settings.minRowHeight,
    settings.maxRowHeight,
    formatFieldValue,
    fieldSettings,
  ]);

  const yLabels = displayCounts.map((d) => d.label);
  const axisFields = getChartAxisFields(settings);
  const xAxisLabel = getChartAxisLabel(
    axisFields.x,
    settings.xAxisLabel,
    getFieldLabel
  );
  const requestedLabelMargin = Math.max(
    baseMargin.left,
    ...yLabels.map((label) => label.length * 7 + 24)
  );
  const minPlotWidth = Math.min(
    80,
    Math.max(0, width - baseMargin.left - baseMargin.right)
  );
  const maxLabelMargin = Math.max(0, width - baseMargin.right - minPlotWidth);
  const labelMargin = Math.min(requestedLabelMargin, maxLabelMargin);
  const margin = {
    ...baseMargin,
    left: Math.min(labelMargin, width * 0.42),
    right: Math.max(baseMargin.right, 48),
    bottom: Math.max(baseMargin.bottom, xAxisLabel ? 42 : 26),
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const chartSettings = { ...settings, margin };

  // Create scales with synchronized limits if in a facet
  const xScale = useMemo(() => {
    const maxValue = Math.max(1, ...displayCounts.map((d) => d.total));

    return numericScale(settings.xAxis)
      .domain([0, maxValue])
      .range([0, innerWidth])
      .nice();
  }, [displayCounts, innerWidth, settings.xAxis]);

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(displayCounts.map((d) => d.key))
      .range([0, innerHeight])
      .padding(0.3);
  }, [displayCounts, innerHeight]);

  if (displayCounts.length === 0) {
    return <div style={{ width, height }}>No data to display</div>;
  }

  const yLabelsByKey = new Map(
    displayCounts.map((item) => [item.key, item.label])
  );

  return (
    <div style={{ width, height }}>
      <BaseChart
        width={width}
        height={height}
        xScale={xScale}
        yScale={yScale}
        settings={chartSettings}
        yTickFormatter={(value) =>
          yLabelsByKey.get(String(value)) ?? String(value)
        }
        overlay={
          <g pointerEvents="none">
            {" "}
            {/* Count labels */}
            {displayCounts.map(({ key, count }) => (
              <text
                key={key}
                x={xScale(count) + 5}
                y={yScale(key)! + yScale.bandwidth() / 2}
                dominantBaseline="middle"
                className="fill-foreground"
                fontSize={11}
              >
                {count.toLocaleString()}
              </text>
            ))}
          </g>
        }
      >
        <g className="select-none">
          {/* Bars */}
          {displayCounts.map(({ key, label, value, count, other }) => {
            let isFiltered = true;
            if (valueFilter) {
              isFiltered = applyFilter(value, valueFilter);
            }

            const color =
              valueFilter && !isFiltered
                ? "rgb(156 163 175)" // gray-400 for filtered out points
                : getColorForValue(settings.colorScaleId, value, "#3479a8");

            const barWidth = xScale(count);
            const barHeight = yScale.bandwidth();

            if (barHeight < 1) {
              return null;
            }

            return (
              <rect
                key={key}
                x={0}
                y={yScale(key)}
                width={Math.max(0, barWidth)}
                rx={2}
                role={other ? undefined : "button"}
                tabIndex={other ? undefined : 0}
                aria-label={`${label}: ${count.toLocaleString()} rows`}
                aria-pressed={categoryIncludes(filterValues, value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (!other) handleBarClick(value);
                  }
                }}
                height={barHeight}
                className={`chart-mark ${
                  other ? "fill-muted/80 hover:fill-muted" : "cursor-pointer"
                }`}
                style={{
                  fill: color,
                  opacity: valueFilter && !isFiltered ? 0.3 : 1,
                }}
                onClick={() => {
                  if (!other) handleBarClick(value);
                }}
              />
            );
          })}
        </g>
      </BaseChart>
    </div>
  );
}
