import { useColorScales } from "@/hooks/useColorScales";
import { getRangeFilterForField } from "@/hooks/getAxisFilter";
import { applyFilter } from "@/hooks/applyFilter";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { useFacetAxis } from "@/providers/FacetAxisProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
import { scaleBand, ScaleBand, scaleLinear, ScaleLinear } from "d3-scale";
import { useCallback, useEffect, useMemo } from "react";
import isEqual from "react-fast-compare";
import { useCustomCompareMemo } from "use-custom-compare";
import { BaseChart } from "../BaseChart";
import { useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveData } from "../useGetLiveData";
import { BarChartSettings } from "./definition";

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
  value: number;
  isNumeric: false;
};

type BarChartProps = BaseChartProps<BarChartSettings>;

export function BarChart({ settings, width, height, facetIds }: BarChartProps) {
  // Get all data for axis limits calculation (not filtered by current selections)
  const allColData = useGetColumnDataForIds(settings.field);
  // Get filtered data for rendering
  const liveColData = useGetLiveData(settings, settings.field, facetIds);

  const updateChart = useDataLayer((s) => s.updateChart);
  const { getColorForValue } = useColorScales();

  const registerAxisLimits = useFacetAxis((s) => s.registerAxisLimits);
  const getGlobalAxisLimits = useFacetAxis((s) => s.getGlobalAxisLimits);

  // Chart dimensions
  const margin = settings.margin;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const isNumeric = useMemo(
    () => allColData.every((d) => !isNaN(Number(d))),
    [allColData]
  );

  // Calculate chart data from live (filtered) data for rendering
  const chartData = useMemo(() => {
    if (isNumeric) {
      const numericData = liveColData.map(Number);
      const allNumericData = allColData.map(Number);

      // Create bins using full data range
      const binCount = settings.binCount || 10;
      const min = Math.min(...allNumericData);
      const max = Math.max(...allNumericData);
      const binWidth = (max - min) / binCount;

      const bins = Array.from({ length: binCount }, (_, i) => {
        const start = min + i * binWidth;
        const end = start + binWidth;
        const value = numericData.filter((d) => d >= start && d < end).length;
        return { start, end, value, isNumeric: true } as NumericBin;
      });

      return bins;
    } else {
      // Handle categorical data using all possible categories
      const uniqueCats = new Set(allColData.map(String));
      const countMap = new Map<string, number>();

      // Initialize all categories with 0
      uniqueCats.forEach((cat) => countMap.set(cat, 0));

      // Count occurrences from live data
      liveColData.forEach((value) => {
        const key = String(value);
        countMap.set(key, (countMap.get(key) || 0) + 1);
      });

      return Array.from(countMap.entries()).map(
        ([label, value]) =>
          ({
            label,
            value,
            isNumeric: false,
          }) as CategoryBin
      );
    }
  }, [liveColData, allColData, isNumeric, settings.binCount]);

  // Calculate min/max from ALL data for axis limits
  const { min, max, uniqueValues } = useMemo(() => {
    if (isNumeric) {
      const numericData = allColData.map(Number);
      const binCount = settings.binCount || 10;
      const dataMin = Math.min(...numericData);
      const dataMax = Math.max(...numericData);
      const binWidth = (dataMax - dataMin) / binCount;

      return {
        min: dataMin,
        max: dataMax + binWidth, // Add one bin width to include the last bin's end
        uniqueValues: undefined,
      };
    }

    return {
      min: undefined,
      max: undefined,
      uniqueValues: Array.from(new Set(allColData.map(String))),
    };
  }, [allColData, isNumeric, settings.binCount]);

  // Get global axis limits if in a facet
  const globalXLimits = facetIds ? getGlobalAxisLimits("x") : null;
  const globalYLimits = facetIds ? getGlobalAxisLimits("y") : null;

  // Create scales with synchronized limits if in a facet
  const xScale = useCustomCompareMemo(
    () => {
      if (min !== undefined && max !== undefined) {
        // Numerical x-axis
        const globalMin =
          globalXLimits?.type === "numerical" ? globalXLimits.min : min;
        const globalMax =
          globalXLimits?.type === "numerical" ? globalXLimits.max : max;

        // Only pad if using local limits
        const range = max - min;
        const padding = range * X_SCALE_PADDING;
        const minToUse = globalXLimits ? globalMin : min - padding;
        const maxToUse = globalXLimits ? globalMax : max + padding;

        return scaleLinear()
          .domain([minToUse, maxToUse])
          .range([0, innerWidth]);
      } else {
        const globalCategories =
          globalXLimits?.type === "categorical"
            ? globalXLimits.categories
            : uniqueValues;

        const allCategories = Array.from(globalCategories);

        return scaleBand()
          .domain(allCategories)
          .range([0, innerWidth])
          .padding(0.3);
      }
    },
    [innerWidth, max, min, uniqueValues, globalXLimits],
    isEqual
  ) as ScaleLinear<number, number> | ScaleBand<string>;

  const yScale = useMemo(() => {
    const maxValue = Math.max(...chartData.map((d) => d.value));
    const paddedMax = maxValue * (1 + Y_SCALE_PADDING);

    // take larger of global or padded max
    const globalMax =
      globalYLimits?.type === "numerical" ? globalYLimits.max : paddedMax;

    const limitToUse = Math.max(globalMax, paddedMax);

    return scaleLinear().domain([0, limitToUse]).range([innerHeight, 0]);
  }, [chartData, innerHeight, globalYLimits]);

  // Register axis limits with the facet context if in a facet
  useEffect(() => {
    if (facetIds && chartData.length > 0) {
      // determine x limits based on data type
      if (isNumeric) {
        registerAxisLimits(settings.id, "x", {
          type: "numerical",
          min: Number(xScale.domain()[0]),
          max: Number(xScale.domain()[1]),
        });
      } else {
        registerAxisLimits(settings.id, "x", {
          type: "categorical",
          categories: new Set(chartData.map((d) => d.label)),
        });
      }
      // Register y-axis limits (numerical for bar chart)
      const maxValue = yScale.domain()[1] ?? 0;

      registerAxisLimits(settings.id, "y", {
        type: "numerical",
        min: 0,
        max: maxValue,
      });
    }
  }, [
    settings.id,
    facetIds,
    chartData,
    registerAxisLimits,
    isNumeric,
    min,
    max,
    yScale,
    xScale,
  ]);

  const isBandScale = "bandwidth" in xScale;

  const valueFilter = settings.filters.find(
    (f): f is ValueFilter => f.type === "value" && f.field === settings.field
  );
  const rangeFilter = getRangeFilterForField(settings.filters, settings.field);
  const hasActiveFilters = valueFilter || rangeFilter;

  const handleBarClick = useCallback(
    (label: string) => {
      if (!isBandScale) {
        return;
      }

      const filterValues = valueFilter?.values ?? [];
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
    },
    [
      isBandScale,
      settings.id,
      settings.field,
      updateChart,
      valueFilter,
      settings.filters,
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
        settings={settings}
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
              : (d as CategoryBin).label;
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
                : getColorForValue(
                    settings.colorScaleId,
                    value,
                    "hsl(217.2 91.2% 59.8%)"
                  );

            const barHeight = innerHeight - yScale(d.value);

            if (barWidth < 1 || barHeight < 1) {
              return null;
            }

            return (
              <rect
                key={i}
                x={x}
                y={yScale(d.value)}
                width={barWidth}
                height={barHeight}
                className={isBandScale ? "cursor-pointer" : ""}
                style={{ fill: color }}
                onClick={() =>
                  isBandScale && handleBarClick((d as CategoryBin).label)
                }
              >
                <title>
                  {isNumeric
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
    </div>
  );
}
