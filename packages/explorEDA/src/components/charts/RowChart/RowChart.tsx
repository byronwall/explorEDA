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
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import {
  formatFieldValue as formatValue,
  hasFieldDisplayFormat,
} from "@/lib/fieldSettings";

import {
  planRowCategories,
  planRowSummary,
  type RowSummaryPlan,
} from "./rowChartPlan";
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

/** The smallest row, in pixels, that Top N compresses to before it gives way. */
const TOP_N_ROW_FLOOR = 12;

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

  // A grouped summary ranks its value instead of the row count. Its order and
  // context come from every row; the bars show rows that pass other filters.
  const allIds = useGetAllIds(settings);
  const aggregates = useDataLayer((s) => s.aggregates);
  const nonce = useDataLayer((s) => s.nonce);
  const getAggregateResult = useDataLayer((s) => s.getAggregateResult);
  const spec = settings.aggregateId
    ? aggregates.find((item) => item.id === settings.aggregateId)
    : undefined;
  const summaryMismatch = settings.aggregateId
    ? !spec
      ? "This chart's grouped summary no longer exists."
      : spec.groupField !== settings.field
        ? `${spec.name} groups by ${getFieldLabel(spec.groupField)}, not ${getFieldLabel(settings.field)}.`
        : undefined
    : undefined;
  const summarized = Boolean(spec) && !summaryMismatch;
  const allSummary = useMemo(() => {
    void nonce;
    void fieldSettings;
    return summarized && settings.aggregateId
      ? getAggregateResult(settings.aggregateId, allIds)
      : undefined;
  }, [
    summarized,
    settings.aggregateId,
    getAggregateResult,
    allIds,
    aggregates,
    fieldSettings,
    nonce,
  ]);
  const liveSummary = useMemo(() => {
    void nonce;
    void fieldSettings;
    return summarized && settings.aggregateId
      ? getAggregateResult(settings.aggregateId, liveIds)
      : undefined;
  }, [
    summarized,
    settings.aggregateId,
    getAggregateResult,
    liveIds,
    aggregates,
    fieldSettings,
    nonce,
  ]);
  const measureField =
    spec && spec.aggregation !== "count" ? spec.measureField : undefined;
  const formatMeasure = (value: number | undefined) =>
    value === undefined
      ? "—"
      : measureField
        ? formatValue(
            measureField,
            value,
            // Zero reads as $0 beside $20K, not $0.00, as on vertical bars.
            value === 0
              ? { ...fieldSettings[measureField], precision: 0 }
              : fieldSettings[measureField],
            { compact: true }
          )
        : value.toLocaleString();

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

  const available =
    chartHeight - baseMargin.top - Math.max(baseMargin.bottom, 42);
  const fitRows = Math.max(
    2,
    Math.floor(available / Math.max(1, settings.minRowHeight))
  );
  // Top N rows may compress below the minimum height, but not below this.
  const floorRows = Math.max(2, Math.floor(available / TOP_N_ROW_FLOOR));
  const plan = useMemo((): RowSummaryPlan => {
    // Top N keeps the same members at every usable size; unset fits the
    // height. A chart too short for Top N shows as many as it can.
    const maxRows = settings.topN
      ? Math.min(settings.topN + 1, floorRows)
      : fitRows;
    if (liveSummary && allSummary)
      return planRowSummary(liveSummary, allSummary, maxRows);
    return planRowCategories(column, liveIds, maxRows);
  }, [column, liveIds, liveSummary, allSummary, fitRows, settings.topN]);
  const displayCounts = useMemo(
    () => [
      ...plan.visible.map((item) => ({
        ...item,
        label:
          item.value != null &&
          hasFieldDisplayFormat(fieldSettings[settings.field])
            ? formatFieldValue(settings.field, item.value)
            : categoryLabel(item.value),
        count: summarized ? item.current : item.sourceIds.length,
        rows: item.sourceIds.length,
        other: false,
        members: [item],
      })),
      ...(plan.other.length
        ? [
            {
              key: "__other",
              value: undefined,
              label: "Other categories",
              count: plan.otherSummary
                ? plan.otherSummary.current
                : plan.other.reduce(
                    (sum, item) => sum + item.sourceIds.length,
                    0
                  ),
              total: plan.otherSummary
                ? plan.otherSummary.total
                : plan.other.reduce((sum, item) => sum + (item.total ?? 0), 0),
              rows: plan.other.reduce(
                (sum, item) => sum + item.sourceIds.length,
                0
              ),
              other: true,
              members: plan.other,
            },
          ]
        : []),
    ],
    [plan, summarized, fieldSettings, settings.field, formatFieldValue]
  );
  const source = useMemo((): TraceSource => {
    const currentRevision = `${revision.split(":")[0]}:${settings.field}:${settings.aggregateId ?? ""}:${chartHeight}:${plan.other.length}:${plan.categories.map((item) => item.sourceIds.join(",")).join(";")}`;
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
  const xAxisLabel =
    summarized && spec && !settings.xAxisLabel
      ? measureField
        ? getFieldLabel(measureField)
        : "Count"
      : getChartAxisLabel(axisFields.x, settings.xAxisLabel, getFieldLabel);
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
  // Labels of bars left of zero sit past the bar's end, so the plot keeps
  // room for the widest one, as the right margin does for positive labels.
  const negativeLabelRoom = Math.max(
    0,
    ...displayCounts
      .filter((d) => (d.count ?? 0) < 0)
      .map((d) => typography.measure(formatMeasure(d.count), 11) + 10)
  );
  const xScale = useMemo(() => {
    const values = displayCounts.flatMap((d) =>
      [d.total, d.count].filter(
        (value): value is number =>
          value !== undefined && Number.isFinite(value)
      )
    );
    // Signed measures extend left of zero; zero always stays on the axis.
    let minValue = Math.min(0, ...values);
    const maxValue = Math.max(
      summarized ? (minValue < 0 ? 0 : Number.MIN_VALUE) : 1,
      ...values
    );
    if (negativeLabelRoom > 0 && innerWidth > negativeLabelRoom * 2) {
      minValue -=
        (negativeLabelRoom / (innerWidth - negativeLabelRoom)) *
        (maxValue - minValue);
    }

    const scale = numericScale(settings.xAxis)
      .domain(boundedDomain([minValue, maxValue], settings.xAxis))
      .range([0, innerWidth]);
    // Bounds draw exactly as entered.
    return hasAxisBounds(settings.xAxis) ? scale : scale.nice();
  }, [
    displayCounts,
    innerWidth,
    settings.xAxis,
    summarized,
    negativeLabelRoom,
  ]);

  const yScale = useMemo(() => {
    return scaleBand()
      .domain(displayCounts.map((d) => d.key))
      .range([0, innerHeight])
      .padding(0.3);
  }, [displayCounts, innerHeight]);

  if (summaryMismatch || displayCounts.length === 0) {
    return (
      <ChartMessage width={width} height={height}>
        {summaryMismatch ??
          (settings.field
            ? NO_MATCHING_ROWS
            : "Choose a field in chart settings.")}
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
    settings.topN && plan.visible.length < settings.topN && plan.other.length
      ? `Top ${settings.topN} needs a taller chart; showing the top ${plan.visible.length}`
      : Boolean(settings.topN) &&
        displayCounts.length > fitRows &&
        `Rows compressed to show the top ${settings.topN}`,
  ];
  // A bar runs from zero to its value, on either side.
  const zero = xScale(0);
  const span = (value: number | undefined) => {
    const end = xScale(value ?? 0);
    return { x: Math.min(zero, end), width: Math.abs(end - zero) };
  };
  // The all-row value draws as a faint bar behind a part of it, such as a
  // filtered count or sum. An average, or a value the faint bar would hide,
  // marks it with a tick instead.
  const contextAsTick = (count: number | undefined, total: number) =>
    spec?.aggregation === "average" ||
    !(
      count === undefined ||
      count === 0 ||
      (Math.sign(count) === Math.sign(total) &&
        Math.abs(count) < Math.abs(total))
    );
  const valueText = (count: number | undefined, rows: number) =>
    count === undefined
      ? rows === 0
        ? "No rows"
        : "Unavailable"
      : formatMeasure(count);
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
          {summarized && spec ? (
            <>
              <span className="eda-readout-item">
                <span>{spec.name}</span>
                <b>{formatMeasure(hoveredItem.count)}</b>
              </span>
              <span className="eda-readout-item">
                <span>All rows</span>
                <b>{formatMeasure(hoveredItem.total)}</b>
              </span>
            </>
          ) : (
            <span className="eda-readout-item">
              <span>Rows</span>
              <b>
                {(hoveredItem.count ?? 0).toLocaleString()} of{" "}
                {(hoveredItem.total ?? 0).toLocaleString()}
              </b>
            </span>
          )}
          {!summarized && liveRows > 0 && (
            <span className="eda-readout-item">
              <span>Share</span>
              <b>
                {((hoveredItem.count ?? 0) / liveRows).toLocaleString("en-US", {
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
            {displayCounts.map(({ key, count, rows, total }) => {
              const left = (count ?? 0) < 0;
              // Past the tick when it sits beyond the bar's end.
              const tick =
                !facetIds &&
                total !== undefined &&
                total !== (count ?? 0) &&
                contextAsTick(count, total);
              const edge =
                tick && (left ? total < (count ?? 0) : total > (count ?? 0))
                  ? total
                  : (count ?? 0);
              return (
                <text
                  key={key}
                  x={left ? xScale(edge) - 5 : xScale(edge) + 5}
                  y={yScale(key)! + yScale.bandwidth() / 2}
                  dominantBaseline="middle"
                  textAnchor={left ? "end" : "start"}
                  className="fill-foreground"
                  fontSize={11}
                >
                  {valueText(count, rows)}
                </text>
              );
            })}
          </g>
        }
      >
        <g className="select-none">
          {!facetIds &&
            displayCounts.map((item) =>
              item.total !== undefined &&
              item.total !== (item.count ?? 0) &&
              !contextAsTick(item.count, item.total) ? (
                <rect
                  key={`${item.key}:total`}
                  {...span(item.total)}
                  y={yScale(item.key)}
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
          {zero > 0 && (
            <line
              x1={zero}
              x2={zero}
              y1={0}
              y2={innerHeight}
              className="stroke-muted-foreground"
              strokeWidth={1}
              pointerEvents="none"
              aria-hidden="true"
            />
          )}
          {displayCounts.map(
            ({ key, label, value, count, rows, other, members }) => {
              let isFiltered = true;
              if (valueFilter) {
                isFiltered = members.some((item) =>
                  applyFilter(item.value, valueFilter)
                );
              }

              const color =
                valueFilter && !isFiltered
                  ? "rgb(156 163 175)" // gray-400 for filtered out points
                  : getColorForValue(
                      settings.colorScaleId,
                      value,
                      themeColors.mark
                    );

              const bar = span(count);
              const barHeight = yScale.bandwidth();

              if (barHeight < 1) {
                return null;
              }

              return (
                <rect
                  key={key}
                  x={bar.x}
                  y={yScale(key)}
                  width={bar.width}
                  rx={2}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    summarized && spec
                      ? `${label}, ${spec.name}: ${valueText(count, rows)}`
                      : `${label}: ${(count ?? 0).toLocaleString()} rows`
                  }
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
            }
          )}
        </g>
        {!facetIds && (
          <g pointerEvents="none" aria-hidden="true">
            {displayCounts.map((item) =>
              item.total !== undefined &&
              item.total !== (item.count ?? 0) &&
              contextAsTick(item.count, item.total) ? (
                <line
                  key={`${item.key}:total`}
                  x1={xScale(item.total)}
                  x2={xScale(item.total)}
                  y1={yScale(item.key)! - 2}
                  y2={yScale(item.key)! + yScale.bandwidth() + 2}
                  className="stroke-foreground"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              ) : null
            )}
          </g>
        )}
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
