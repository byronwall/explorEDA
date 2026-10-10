import { useThemeColors } from "@/hooks/useDisplayColorScales";
import { useAxisTypography } from "../chartTypography";
import {
  categoryEqual,
  categoryIncludes,
  categoryLabel,
} from "@/lib/categories";
import { boundedDomain, hasAxisBounds } from "../Axis/axisBounds";
import { numericScale } from "../Axis/numericScale";
import { ChartMessage, NO_MATCHING_ROWS } from "../ChartMessage";
import { BaseChartProps, RowChartSettings } from "@/types/ChartTypes";

import { useColorScales } from "@/hooks/useColorScales";
import { applyFilter } from "@/hooks/applyFilter";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { datum, Filter, ValueFilter } from "@/types/FilterTypes";
import { scaleBand } from "d3-scale";
import { useId, useMemo, useState } from "react";
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
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";

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
  const [hovered, setHovered] = useState<string | null>(null);
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
  const handleOtherClick = (members: typeof plan.categories) => {
    const values = members.map((item) => item.value);
    const allSelected = values.every((value) =>
      categoryIncludes(filterValues, value)
    );
    const next = allSelected
      ? filterValues.filter(
          (value) => !values.some((member) => categoryEqual(value, member))
        )
      : [
          ...filterValues.filter(
            (value) => !values.some((member) => categoryEqual(value, member))
          ),
          ...values,
        ];
    const filters = settings.filters.filter(
      (filter) => filter.type !== "value" || filter.field !== settings.field
    );
    if (next.length)
      filters.push({ type: "value", field: settings.field, values: next });
    updateChart(settings.id, { filters });
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

  const typography = useAxisTypography();
  const themeColors = useThemeColors();
  const yLabels = displayCounts.map((d) => d.label);
  const axisFields = getChartAxisFields(settings);
  const xAxisLabel = getChartAxisLabel(
    axisFields.x,
    settings.xAxisLabel,
    getFieldLabel
  );
  const tickSize = settings.yAxis.tickFontSize ?? typography.tickSize;
  // Category names claim their measured width, never less than the estimate.
  const requestedLabelMargin = Math.max(
    baseMargin.left,
    ...yLabels.map(
      (label) =>
        Math.max(
          label.length * tickSize * 0.7,
          typography.measure(label, tickSize)
        ) + 24
    )
  );
  const typeGrowth =
    Math.max(0, (settings.xAxis.tickFontSize ?? typography.tickSize) - 10) +
    (xAxisLabel ? Math.max(0, typography.labelSize - 11) : 0);
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
    bottom:
      Math.max(baseMargin.bottom, (xAxisLabel ? 42 : 26) + typeGrowth) +
      STATUS_LINE_HEIGHT,
  };
  // Few categories keep their bar height, so the X axis rises to sit under
  // the last bar instead of leaving a gap above it.
  const bandHeight = Math.min(
    chartHeight - margin.top - margin.bottom,
    displayCounts.length *
      Math.max(settings.minRowHeight, settings.maxRowHeight)
  );
  const axisRise = Math.max(
    0,
    chartHeight - margin.top - margin.bottom - Math.max(0, bandHeight)
  );
  margin.bottom += axisRise;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  const chartSettings = { ...settings, margin };

  // Create scales with synchronized limits if in a facet
  const xScale = useMemo(() => {
    const maxValue = Math.max(1, ...displayCounts.map((d) => d.total));

    const scale = numericScale(settings.xAxis)
      .domain(boundedDomain([0, maxValue], settings.xAxis))
      .range([0, innerWidth]);
    // Bounds draw exactly as entered.
    return hasAxisBounds(settings.xAxis) ? scale : scale.nice();
  }, [displayCounts, innerWidth, settings.xAxis]);

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(displayCounts.map((d) => d.key))
      .range([0, innerHeight])
      .padding(0.3);
  }, [displayCounts, innerHeight]);

  if (displayCounts.length === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {settings.field
          ? NO_MATCHING_ROWS
          : "Choose a field in chart settings."}
      </ChartMessage>
    );
  }

  const yLabelsByKey = new Map(
    displayCounts.map((item) => [item.key, item.label])
  );
  const fieldLabel = getFieldLabel(settings.field);
  const hoveredItem = displayCounts.find((item) => item.key === hovered);
  const liveRows = liveIds.length;
  const statusParts = [
    valueFilter && `${filterValues.length} categories selected`,
    plan.other.length > 0 &&
      `${plan.other.length} smaller categories in Other categories`,
  ];
  const statusHint =
    !valueFilter &&
    !facetIds &&
    width >= STATUS_HINT_MIN_WIDTH &&
    "Click rows or labels to select categories";

  return (
    <div className="relative" style={{ width, height }}>
      {hoveredItem && (
        <ChartReadout fallbackClassName="eda-chart-readout-inline">
          <span className="eda-readout-item">
            <span>{fieldLabel}</span>
            <b>{hoveredItem.label}</b>
          </span>
          <span className="eda-readout-item">
            <span>Rows</span>
            <b>
              {hoveredItem.count.toLocaleString()} of{" "}
              {hoveredItem.total.toLocaleString()}
            </b>
          </span>
          {liveRows > 0 && (
            <span className="eda-readout-item">
              <span>Share</span>
              <b>
                {(hoveredItem.count / liveRows).toLocaleString("en-US", {
                  style: "percent",
                  maximumFractionDigits: 1,
                })}
              </b>
            </span>
          )}
        </ChartReadout>
      )}
      <BaseChart
        width={width}
        height={chartHeight}
        footer={axisRise + STATUS_LINE_HEIGHT}
        xScale={xScale}
        yScale={yScale}
        settings={chartSettings}
        onClearPlot={() => updateChart(settings.id, { filters: [] })}
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
          {!facetIds &&
            displayCounts.map((item) =>
              item.total > item.count ? (
                <rect
                  key={`${item.key}:total`}
                  x={0}
                  y={yScale(item.key)}
                  width={Math.max(0, xScale(item.total))}
                  height={yScale.bandwidth()}
                  rx={2}
                  pointerEvents="none"
                  aria-hidden="true"
                  style={{
                    fill: item.other
                      ? "var(--muted-foreground)"
                      : getColorForValue(
                          settings.colorScaleId,
                          item.value,
                          themeColors.mark
                        ),
                    fillOpacity: "var(--eda-flow-context)",
                  }}
                />
              ) : null
            )}
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
                : getColorForValue(settings.colorScaleId, value, themeColors.mark);

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
                  other
                    ? members.every((item) =>
                        categoryIncludes(filterValues, item.value)
                      )
                      ? true
                      : members.some((item) =>
                            categoryIncludes(filterValues, item.value)
                          )
                        ? "mixed"
                        : false
                    : categoryIncludes(filterValues, value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (event.altKey) inspect(key);
                    else if (other) handleOtherClick(members);
                    else handleBarClick(value);
                  }
                }}
                onPointerEnter={() => setHovered(key)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(key)}
                onBlur={() => setHovered(null)}
                height={barHeight}
                className={`chart-mark ${
                  other ? "fill-muted/80 hover:fill-muted" : "cursor-pointer"
                }`}
                style={{
                  fill: color,
                  opacity: valueFilter && !isFiltered ? 0.3 : 1,
                }}
                onClick={(event) => {
                  if (event.altKey) inspect(key);
                  else if (other) handleOtherClick(members);
                  else handleBarClick(value);
                }}
              />
            );
          })}
        </g>
      </BaseChart>
      <ChartStatusLine
        parts={statusParts}
        hint={statusHint}
        left={margin.left}
        right={margin.right}
        bottom={34}
      />
    </div>
  );
}
