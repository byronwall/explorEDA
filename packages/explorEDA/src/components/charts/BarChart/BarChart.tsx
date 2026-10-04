import { categoryEqual, categoryIncludes } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
import type { ScaleLinear } from "d3-scale";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { BaseChart } from "../BaseChart";
import { buildScale } from "../Axis/axisPlan";
import { ChartReadout } from "../ChartReadout";
import {
  ChartStatusLine,
  STATUS_HINT_MIN_WIDTH,
  STATUS_LINE_HEIGHT,
} from "../ChartStatusLine";
import { formatFieldValue as formatValue } from "@/lib/fieldSettings";
import { useGetColumnData, useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveIds } from "../useGetLiveData";
import type { AggregateResult } from "@/lib/aggregates";
import {
  barAt,
  planBarChart,
  type BarChartPlan,
  type BarMark,
} from "./barPlan";
import { sameRange, snapRangeToBins } from "./bins";
import { barTraceTargets, findBarTraceRow, resolveBarTrace } from "./barTrace";
import { BarChartSettings } from "./definition";
import { SeriesBarChart } from "./SeriesBarChart";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";

type BarChartProps = BaseChartProps<BarChartSettings> & {
  aggregateResult?: AggregateResult;
  aggregateScope?: string;
};

/** A bin reads as its formatted edges unless it holds whole numbers. */
function barLabel(bar: BarMark, format: (value: number) => string) {
  return bar.bin && bar.label.startsWith("[")
    ? `${format(bar.bin.start)} to ${format(bar.bin.end)}`
    : bar.label;
}

/** Field and value pairs for the hovered bar, in the panel header. */
function HoverReadout({
  plan,
  id,
  format,
}: {
  plan: BarChartPlan;
  id: string;
  format: (value: number) => string;
}) {
  const bar = plan.bars.find((item) => item.id === id);
  if (!bar) return null;
  const rows = plan.mode === "aggregate" ? bar.row.rowCount : bar.value;
  return (
    <ChartReadout fallbackClassName="eda-chart-readout-inline">
      <span className="eda-readout-item">
        <span>{plan.fieldLabel}</span>
        <b>{barLabel(bar, format)}</b>
      </span>
      {plan.mode === "aggregate" && (
        <span className="eda-readout-item">
          <span>{plan.valueLabel}</span>
          <b>{bar.valueText}</b>
        </span>
      )}
      <span className="eda-readout-item">
        <span>Rows</span>
        <b>
          {rows.toLocaleString()}
          {bar.total ? ` of ${bar.total.value.toLocaleString()}` : ""}
        </b>
      </span>
    </ChartReadout>
  );
}

export function BarChart(props: BarChartProps) {
  return props.settings.seriesField ? <SeriesBarChart {...props} /> : <SingleBarChart {...props} />;
}

function SingleBarChart({
  settings,
  width,
  height,
  facetIds,
  aggregateResult,
  aggregateScope,
}: BarChartProps) {
  const getAggregateResult = useDataLayer((s) => s.getAggregateResult);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const formatFieldValue = useDataLayer((s) => s.formatFieldValue);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const nonce = useDataLayer((s) => s.nonce);
  const aggregates = useDataLayer((s) => s.aggregates);
  const updateChart = useDataLayer((s) => s.updateChart);
  const { getColorForValue } = useColorScales();
  const liveIds = useGetLiveIds(settings, facetIds);
  const allValues = useGetColumnDataForIds(settings.field);
  const fieldData = useGetColumnData(settings.field);
  const revision = useTraceRevision(settings);
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const [hovered, setHovered] = useState<{
    id: string | null;
    altKey: boolean;
  }>({
    id: null,
    altKey: false,
  });

  const resolvedAggregate = useMemo(() => {
    void aggregates;
    void fieldSettings;
    void nonce;
    return settings.aggregateId
      ? getAggregateResult(settings.aggregateId, liveIds)
      : undefined;
  }, [
    settings.aggregateId,
    getAggregateResult,
    aggregates,
    fieldSettings,
    liveIds,
    nonce,
  ]);

  const plan = useMemo(
    () =>
      planBarChart({
        settings,
        width,
        height,
        snapshot: {
          revision,
          allValues,
          liveIds,
          fieldData,
          fieldType: fieldSettings[settings.field]?.type,
          aggregate: aggregateResult ?? resolvedAggregate,
        },
        getColor: (value) =>
          getColorForValue(settings.colorScaleId, value, "#3479a8"),
        getFieldLabel,
        formatFieldValue,
        formatAxisValue: (field, value) =>
          formatValue(
            field,
            value,
            // Zero reads as $0 beside $20K, not $0.00.
            value === 0
              ? { ...fieldSettings[field], precision: 0 }
              : fieldSettings[field],
            { compact: true }
          ),
        footer: STATUS_LINE_HEIGHT,
        showTotals: !facetIds,
        aggregateScope,
      }),
    // Label and format getters are stable; field settings carry their changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      settings,
      width,
      height,
      revision,
      allValues,
      liveIds,
      fieldData,
      fieldSettings,
      aggregateResult,
      resolvedAggregate,
      getColorForValue,
      aggregateScope,
      facetIds,
    ]
  );
  const xScale = useMemo(() => buildScale(plan.xScale), [plan.xScale]);
  const yScale = useMemo(
    () => buildScale(plan.yScale) as ScaleLinear<number, number>,
    [plan.yScale]
  );

  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision: plan.revision,
      resolve: (kind, id) => resolveBarTrace(plan, kind, id),
      findRow: (id) => findBarTraceRow(plan, id),
      targets: () => barTraceTargets(plan),
    }),
    [plan]
  );
  useTraceSource(owner, source);
  const inspect = useCallback(
    (kind: string, id: string) => traceApi?.inspect(owner, kind, id),
    [owner, traceApi]
  );
  const selected =
    trace?.selection?.owner === owner ? trace.selection : undefined;

  // A grouped bar selects its group field; a count bar selects its own field.
  const selectField = plan.mode === "aggregate" ? plan.field : settings.field;
  const valueFilter = settings.filters.find(
    (f): f is ValueFilter => f.type === "value" && f.field === selectField
  );

  const toggleCategory = useCallback(
    (label: datum) => {
      const filterValues = valueFilter?.values ?? [];
      const newValues = categoryIncludes(filterValues, label)
        ? filterValues.filter((f) => !categoryEqual(f, label))
        : [...filterValues, label];
      const newFilters = settings.filters.filter(
        (f) => f.type !== "value" || f.field !== selectField
      );
      if (newValues.length > 0) {
        newFilters.push({
          type: "value",
          field: selectField,
          values: newValues,
        });
      }
      updateChart(settings.id, { filters: newFilters });
    },
    [settings.id, selectField, settings.filters, updateChart, valueFilter]
  );

  const handleBrushChange = useCallback(
    (extent: [[number, number], [number, number]] | null) => {
      const newFilters = settings.filters.filter(
        (f) => f.field !== settings.field
      );
      if (extent && plan.mode === "bin") {
        const linear = xScale as ScaleLinear<number, number>;
        const { min, max } = snapRangeToBins(plan.binEdges, {
          min: linear.invert(extent[0][0]),
          max: linear.invert(extent[1][0]),
        });
        newFilters.push({ type: "range", field: settings.field, min, max });
      } else if (extent) {
        return;
      }
      updateChart(settings.id, { filters: newFilters });
    },
    [
      plan.mode,
      plan.binEdges,
      settings.field,
      settings.filters,
      settings.id,
      updateChart,
      xScale,
    ]
  );

  // When the bins change under a range filter, move its bounds to the nearest
  // new edges so the filter still covers whole bars.
  useEffect(() => {
    if (plan.mode !== "bin" || plan.binEdges.length < 2) return;
    const index = settings.filters.findIndex(
      (f) => f.type === "range" && f.field === settings.field
    );
    const filter = settings.filters[index];
    if (!filter || filter.type !== "range") return;
    const snapped = snapRangeToBins(plan.binEdges, filter);
    if (sameRange(snapped, filter, plan.binEdges)) return;
    updateChart(settings.id, {
      filters: settings.filters.map((f, i) =>
        i === index ? { ...filter, ...snapped } : f
      ),
    });
  }, [
    plan.mode,
    plan.binEdges,
    settings.field,
    settings.filters,
    settings.id,
    updateChart,
  ]);

  const isCount = plan.mode === "count";
  const isAggregate = plan.mode === "aggregate";
  const selectable = isCount || isAggregate;
  const formatField = (value: number) =>
    formatFieldValue(settings.field, value);
  const margin = plan.axes.margin;

  // One selected bar is outlined; a larger selection reads from the dimming.
  const selectedBars = plan.bars.filter((bar) =>
    plan.mode === "bin" ? bar.opacity === 1 : bar.selected
  );
  const anyDimmed = plan.bars.some((bar) => bar.opacity < 1);
  const rowsOf = (bars: BarMark[]) =>
    bars.reduce(
      (total, bar) => total + (isAggregate ? bar.row.rowCount : bar.value),
      0
    );
  const rangeFilter = settings.filters.find(
    (f) => f.type === "range" && f.field === settings.field
  );
  let selectionText: string | undefined;
  if (plan.mode === "bin" && rangeFilter?.type === "range") {
    const first = selectedBars[0];
    const last = selectedBars.at(-1);
    // Whole-number bins name their first and last values, not the half-step edges.
    selectionText =
      first && last && !first.label.startsWith("[")
        ? `${first.label.split("–")[0]} to ${last.label.split("–").at(-1)}`
        : `${formatField(
            rangeFilter.min ?? plan.binEdges[0] ?? 0
          )} to ${formatField(rangeFilter.max ?? plan.binEdges.at(-1) ?? 0)}`;
  } else if (selectable && valueFilter?.values.length) {
    const names = selectedBars.map((bar) => bar.label);
    selectionText = `${
      names.length > 3
        ? `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`
        : names.join(", ")
    }`;
  }
  const statusParts = [
    // Counts lead, so a narrow chart that cuts the line keeps them.
    selectionText &&
      `${rowsOf(selectedBars).toLocaleString()} of ${rowsOf(plan.bars).toLocaleString()} rows selected: ${selectionText}`,
    plan.unplotted.length > 0 &&
      `${plan.unplotted.length} ${plan.unplotted.length === 1 ? "group" : "groups"} without a number left out`,
    !selectionText &&
      !facetIds &&
      width >= STATUS_HINT_MIN_WIDTH &&
      (plan.mode === "bin"
        ? "Drag across bars to select a range · Alt-click to inspect"
        : "Click bars or labels to select · Alt-click to inspect"),
  ];
  const band = selectable && "bandwidth" in xScale ? xScale : undefined;

  return (
    <div className="relative" style={{ width, height }}>
      <BaseChart
        width={width}
        height={height}
        xScale={xScale}
        yScale={yScale}
        axes={plan.axes}
        brushingMode={plan.mode === "bin" ? "horizontal" : "none"}
        onBrushChange={handleBrushChange}
        settings={settings}
        onInspectGuide={(id) => inspect("guide", id)}
        onHoverTarget={(id, altKey) => setHovered({ id, altKey })}
        onInspectPlot={([x, y]) => {
          const bar = barAt(plan, x, y);
          return bar ? Boolean(inspect("bar", bar.id)) : false;
        }}
        activeGuideId={
          selected?.kind === "guide"
            ? selected.id
            : hovered.altKey
              ? hovered.id
              : null
        }
        overlay={
          band && (
            // Category labels select their bar. The transparent rects catch
            // clicks between letters, where SVG text has no hit area.
            <g>
              {plan.bars.map((bar) => (
                <rect
                  key={bar.id}
                  x={bar.x}
                  y={plan.axes.plotHeight + 6}
                  width={bar.width}
                  height={16}
                  fill="transparent"
                  className="cursor-pointer"
                  aria-hidden="true"
                  onPointerEnter={() =>
                    setHovered({ id: bar.id, altKey: false })
                  }
                  onPointerLeave={() => setHovered({ id: null, altKey: false })}
                  onClick={(event) => {
                    if (event.altKey) inspect("guide", `x:tick:${bar.label}`);
                    else toggleCategory(bar.groupValue);
                  }}
                />
              ))}
            </g>
          )
        }
      >
        <g>
          {plan.bars.map((bar) =>
            bar.total ? (
              <rect
                key={`${bar.id}:total`}
                x={bar.x}
                y={bar.total.y}
                width={bar.width}
                height={bar.total.height}
                rx={1.5}
                pointerEvents="none"
                aria-hidden="true"
                style={{
                  fill: bar.fill,
                  fillOpacity: "var(--eda-flow-context)",
                  opacity: bar.opacity,
                }}
              />
            ) : null
          )}
        </g>
        <g>
          {plan.bars.map((bar) => {
            const measureLabel = isAggregate
              ? bar.valueText
              : `${bar.value.toLocaleString()} records${bar.total ? ` of ${bar.total.value.toLocaleString()}` : ""}`;
            const clickable = selectable || plan.mode === "bin";
            const isHovered = hovered.id === bar.id;
            const outlined =
              selected?.id === bar.id ||
              (selectedBars.length === 1 &&
                selectedBars[0] === bar &&
                anyDimmed);
            return (
              <rect
                key={bar.id}
                data-plan-id={bar.id}
                data-aggregate-row-id={bar.row.id}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                rx={1.5}
                role="button"
                tabIndex={0}
                aria-label={`${barLabel(bar, formatField)}: ${measureLabel}`}
                aria-pressed={bar.selected}
                className={`chart-mark eda-bar ${clickable ? "cursor-pointer" : ""}`}
                style={{
                  fill: bar.fill,
                  opacity: isHovered ? 1 : bar.opacity,
                  stroke: outlined
                    ? "var(--foreground)"
                    : isHovered
                      ? "var(--foreground)"
                      : undefined,
                  strokeWidth: outlined ? 2 : isHovered ? 1.5 : undefined,
                }}
                onFocus={() => setHovered({ id: bar.id, altKey: false })}
                onBlur={() => setHovered({ id: null, altKey: false })}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  if (event.altKey && event.key === "Enter") {
                    event.preventDefault();
                    inspect("bar", bar.id);
                  } else if (selectable && !event.altKey) {
                    event.preventDefault();
                    toggleCategory(bar.groupValue);
                  }
                }}
                onClick={(event) => {
                  if (event.altKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    inspect("bar", bar.id);
                  } else if (selectable) {
                    toggleCategory(bar.groupValue);
                  }
                }}
              />
            );
          })}
        </g>
      </BaseChart>
      {hovered.id && (
        <HoverReadout plan={plan} id={hovered.id} format={formatField} />
      )}
      <ChartStatusLine
        parts={statusParts}
        left={margin.left}
        right={margin.right}
      />
    </div>
  );
}
