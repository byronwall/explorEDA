import { BaseChartProps, RowChartSettings } from "@/types/ChartTypes";

import { useColorScales } from "@/hooks/useColorScales";
import { applyFilter } from "@/hooks/applyFilter";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useFacetAxis } from "@/providers/FacetAxisProvider";
import { datum, Filter, ValueFilter } from "@/types/FilterTypes";
import { scaleBand, scaleLinear } from "d3-scale";
import { useEffect, useMemo } from "react";
import { BaseChart } from "../BaseChart";
import { useGetLiveData } from "../useGetLiveData";

type RowChartProps = BaseChartProps<RowChartSettings>;

export function RowChart({ settings, width, height, facetIds }: RowChartProps) {
  const data = useGetLiveData(settings, settings.field, facetIds);

  const { getColorForValue } = useColorScales();
  const getGlobalAxisLimits = useFacetAxis((s) => s.getGlobalAxisLimits);
  const registerAxisLimits = useFacetAxis((s) => s.registerAxisLimits);

  const updateChart = useDataLayer((s) => s.updateChart);

  const valueFilter = settings.filters.find(
    (f: Filter): f is ValueFilter =>
      f.type === "value" && f.field === settings.field
  );
  const filterValues = valueFilter?.values ?? [];

  const handleBarClick = (label: datum) => {
    if (label === "Others") {
      // Don't allow filtering on "Others" category
      return;
    }

    const newValues = filterValues.includes(label)
      ? filterValues.filter((f) => f !== label)
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
  const innerHeight = height - baseMargin.top - baseMargin.bottom;

  // Calculate counts and handle overflow
  const { displayCounts } = useMemo(() => {
    const countMap = new Map<datum, number>();
    data.forEach((value) => {
      const key = value === undefined ? "undefined" : value;
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    // Convert to array and sort by count descending
    const sortedCounts = Array.from(countMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate how many rows we can fit based on min and max row height constraints
    const availableHeight = height - baseMargin.top - baseMargin.bottom;
    const rowHeight = Math.max(
      settings.minRowHeight,
      Math.min(settings.maxRowHeight, availableHeight / sortedCounts.length)
    );
    const maxRows = Math.floor(availableHeight / rowHeight);

    // If we have more items than we can display, create an "Others" category
    if (sortedCounts.length > maxRows) {
      const visibleCounts = sortedCounts.slice(0, maxRows - 1);
      const otherSum = sortedCounts
        .slice(maxRows - 1)
        .reduce((sum, item) => sum + item.count, 0);

      return {
        displayCounts: [...visibleCounts, { label: "Others", count: otherSum }],
      };
    }

    return {
      displayCounts: sortedCounts,
    };
  }, [
    data,
    height,
    baseMargin.top,
    baseMargin.bottom,
    settings.minRowHeight,
    settings.maxRowHeight,
  ]);

  // Register axis limits with the facet context if in a facet
  useEffect(() => {
    if (facetIds && displayCounts.length > 0) {
      // Register x-axis limits (numerical for row chart)
      const maxValue = Math.max(...displayCounts.map((d) => d.count));
      registerAxisLimits(settings.id, "x", {
        type: "numerical",
        min: 0,
        max: maxValue,
      });
    }
  }, [settings.id, facetIds, displayCounts, registerAxisLimits]);

  // Get global axis limits if in a facet
  const globalXLimits = facetIds ? getGlobalAxisLimits("x") : null;
  const globalYLimits = facetIds ? getGlobalAxisLimits("y") : null;

  // Reserve room for the category labels before drawing the shared Y axis.
  const yLabels =
    globalYLimits?.type === "categorical"
      ? Array.from(globalYLimits.categories)
      : displayCounts.map((d) => String(d.label));
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
    left: labelMargin,
    bottom: Math.max(baseMargin.bottom, 30),
  };
  const innerWidth = width - margin.left - margin.right;
  const chartSettings =
    margin.left === baseMargin.left && margin.bottom === baseMargin.bottom
      ? settings
      : { ...settings, margin };

  // Create scales with synchronized limits if in a facet
  const xScale = useMemo(() => {
    const maxValue = Math.max(...displayCounts.map((d) => d.count));

    if (globalXLimits && globalXLimits.type === "numerical") {
      return scaleLinear()
        .domain([0, globalXLimits.max])
        .range([0, innerWidth])
        .nice();
    }

    return scaleLinear().domain([0, maxValue]).range([0, innerWidth]).nice();
  }, [displayCounts, innerWidth, globalXLimits]);

  const yScale = useMemo(() => {
    if (globalYLimits && globalYLimits.type === "categorical") {
      const allCategories = Array.from(globalYLimits.categories);
      return scaleBand()
        .domain(allCategories)
        .range([0, innerHeight])
        .padding(0.1);
    }

    return scaleBand()
      .domain(displayCounts.map((d) => String(d.label)))
      .range([0, innerHeight])
      .padding(0.1);
  }, [displayCounts, innerHeight, globalYLimits]);

  if (displayCounts.length === 0) {
    return <div style={{ width, height }}>No data to display</div>;
  }

  return (
    <div style={{ width, height }}>
      <BaseChart
        width={width}
        height={height}
        xScale={xScale}
        yScale={yScale}
        settings={chartSettings}
      >
        <g className="select-none">
          {/* Bars */}
          {displayCounts.map(({ label, count }) => {
            let isFiltered = true;
            if (valueFilter) {
              isFiltered = applyFilter(label, valueFilter);
            }

            const color =
              valueFilter && !isFiltered
                ? "rgb(156 163 175)" // gray-400 for filtered out points
                : getColorForValue(
                    settings.colorScaleId,
                    String(label),
                    "hsl(217.2 91.2% 59.8%)"
                  );

            const barWidth = xScale(count);
            const barHeight = yScale.bandwidth();

            if (barWidth < 1 || barHeight < 1) {
              return null;
            }

            return (
              <rect
                key={String(label)}
                x={0}
                y={yScale(String(label))}
                width={barWidth}
                height={barHeight}
                className={`${
                  label === "Others"
                    ? "fill-muted/80 hover:fill-muted"
                    : "cursor-pointer"
                }`}
                style={{ fill: color }}
                onClick={() => handleBarClick(label)}
              />
            );
          })}

          {/* Count labels */}
          {displayCounts.map(({ label, count }) => (
            <text
              key={String(label)}
              x={xScale(count) + 5}
              y={yScale(String(label))! + yScale.bandwidth() / 2}
              dominantBaseline="middle"
              className="text-sm fill-foreground"
            >
              {count}
            </text>
          ))}
        </g>
      </BaseChart>
    </div>
  );
}
