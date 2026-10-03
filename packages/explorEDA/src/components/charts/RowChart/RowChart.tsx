import {
  categoryEqual,
  categoryIncludes,
  categoryLabel,
} from "@/lib/categories";
import { numericScale } from "../Axis/numericScale";
import { BaseChartProps, RowChartSettings } from "@/types/ChartTypes";

import { useColorScales } from "@/hooks/useColorScales";
import { applyFilter } from "@/hooks/applyFilter";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { datum, Filter, ValueFilter } from "@/types/FilterTypes";
import { scaleBand } from "d3-scale";
import { useId, useMemo } from "react";
import { useGetColumnData } from "../useGetColumnData";
import { BaseChart } from "../BaseChart";
import { getChartAxisFields, getChartAxisLabel } from "../chartAccessibility";
import { useGetLiveIds } from "../useGetLiveData";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";

import { planRowCategories } from "./rowChartPlan";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { Button } from "@/components/ui/button";

type RowChartProps = BaseChartProps<RowChartSettings>;

export function RowChart({ settings, width, height, facetIds }: RowChartProps) {
  const column = useGetColumnData(settings.field);
  const liveIds = useGetLiveIds(settings, facetIds);
  const owner = useId();
  const api = useChartTraceApi();
  const revision = useTraceRevision(settings);
  const chartHeight = Math.max(40, height - 32);

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

  const plan = useMemo(() => {
    const available =
      chartHeight - baseMargin.top - Math.max(baseMargin.bottom, 42);
    const maxRows = Math.max(
      2,
      Math.floor(available / Math.max(1, settings.minRowHeight))
    );
    return planRowCategories(column, liveIds, maxRows);
  }, [
    column,
    liveIds,
    chartHeight,
    baseMargin.top,
    baseMargin.bottom,
    settings.minRowHeight,
  ]);
  const displayCounts = useMemo(
    () => [
      ...plan.visible.map((item) => ({
        ...item,
        label:
          item.value != null &&
          hasFieldDisplayFormat(fieldSettings[settings.field])
            ? formatFieldValue(settings.field, item.value)
            : categoryLabel(item.value),
        count: item.sourceIds.length,
        other: false,
        members: [item],
      })),
      ...(plan.other.length
        ? [
            {
              key: "__other",
              value: undefined,
              label: "Other categories",
              count: plan.other.reduce(
                (sum, item) => sum + item.sourceIds.length,
                0
              ),
              total: plan.other.reduce((sum, item) => sum + item.total, 0),
              other: true,
              members: plan.other,
            },
          ]
        : []),
    ],
    [plan, fieldSettings, settings.field, formatFieldValue]
  );
  const source = useMemo((): TraceSource => {
    const currentRevision = `${revision.split(":")[0]}:${settings.field}:${chartHeight}:${plan.other.length}:${plan.categories.map((item) => item.sourceIds.join(",")).join(";")}`;
    return {
      role: "chart",
      revision: currentRevision,
      resolve: (kind, id) => {
        if (kind !== "row-category") return;
        const categories =
          id === "__other"
            ? plan.other
            : plan.categories.filter((item) => item.key === id);
        if (!categories.length) return;
        return {
          kind: "row-category",
          id,
          revision: currentRevision,
          owner,
          chartId: settings.id,
          field: settings.field,
          other: id === "__other",
          categories,
        };
      },
      findRow: (id) => {
        const category = plan.categories.find((item) =>
          item.sourceIds.includes(id)
        );
        return category && { kind: "row-category", id: category.key };
      },
      targets: () => [
        ...(plan.other.length
          ? [{ kind: "row-category", id: "__other", label: "Other categories" }]
          : []),
        ...plan.categories.map((item) => ({
          kind: "row-category",
          id: item.key,
          label: item.label,
        })),
      ],
    };
  }, [
    revision,
    settings.field,
    settings.id,
    settings.filters,
    chartHeight,
    plan,
    owner,
  ]);
  useTraceSource(owner, source);
  const inspect = (key: string) => api?.inspect(owner, "row-category", key);

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
  const innerHeight = chartHeight - margin.top - margin.bottom;
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
      .range([
        0,
        Math.min(innerHeight, displayCounts.length * settings.maxRowHeight),
      ])
      .padding(0.3);
  }, [displayCounts, innerHeight, settings.maxRowHeight]);

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
        height={chartHeight}
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
          {displayCounts.map(({ key, label, value, count, other, members }) => {
            let isFiltered = true;
            if (valueFilter) {
              isFiltered = members.some((item) =>
                applyFilter(item.value, valueFilter)
              );
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
                role="button"
                tabIndex={0}
                aria-label={`${label}: ${count.toLocaleString()} rows`}
                aria-pressed={
                  other ? undefined : categoryIncludes(filterValues, value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (other || event.altKey) inspect(key);
                    else handleBarClick(value);
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
                onClick={(event) => {
                  if (other || event.altKey) inspect(key);
                  else handleBarClick(value);
                }}
              />
            );
          })}
        </g>
      </BaseChart>
      {plan.other.length > 0 && (
        <Button
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={() => inspect("__other")}
        >
          Inspect {plan.other.length} Other categories
        </Button>
      )}
    </div>
  );
}
