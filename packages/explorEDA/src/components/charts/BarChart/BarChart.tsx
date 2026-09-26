import { categoryEqual, categoryIncludes } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import { useColorScales } from "@/hooks/useColorScales";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
import type { ScaleLinear } from "d3-scale";
import { useCallback, useId, useMemo, useState } from "react";
import { BaseChart } from "../BaseChart";
import { buildScale, findAxisGuide } from "../Axis/axisPlan";
import { useGetColumnData, useGetColumnDataForIds } from "../useGetColumnData";
import { useGetLiveIds } from "../useGetLiveData";
import { displayAggregateValue, type AggregateResult } from "@/lib/aggregates";
import { barAt, planBarChart, type BarChartPlan } from "./barPlan";
import { barTraceTargets, findBarTraceRow, resolveBarTrace } from "./barTrace";
import { BarChartSettings } from "./definition";
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

function HoverReadout({ plan, id }: { plan: BarChartPlan; id: string }) {
  const bar = plan.bars.find((item) => item.id === id);
  const guide = bar ? undefined : findAxisGuide(plan.axes, id)?.guide;
  if (!bar && !guide) return null;
  return (
    <div
      className="pointer-events-none absolute left-2 top-2 max-w-[min(16rem,70%)] rounded border border-border bg-card/95 px-2 py-1 text-xs text-card-foreground shadow-sm"
      role="status"
    >
      {bar ? (
        <>
          <div>Bar · {bar.label}</div>
          <div>
            {bar.bin
              ? `Bin interval: ${bar.bin.start} to ${bar.bin.end}`
              : `Value: ${bar.value}`}
          </div>
        </>
      ) : (
        <>
          <div>
            {guide!.axis === "x" ? "Horizontal" : "Vertical"} {guide!.role}
          </div>
          {guide!.value !== undefined && <div>Value: {String(guide!.value)}</div>}
          {guide!.role !== "zero" && guide!.label && (
            <div>Label: {guide!.label.fullText}</div>
          )}
        </>
      )}
    </div>
  );
}

export function BarChart({
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  const valueFilter = settings.filters.find(
    (f): f is ValueFilter => f.type === "value" && f.field === settings.field
  );

  const toggleCategory = useCallback(
    (label: datum) => {
      const filterValues = valueFilter?.values ?? [];
      const newValues = categoryIncludes(filterValues, label)
        ? filterValues.filter((f) => !categoryEqual(f, label))
        : [...filterValues, label];
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
      updateChart(settings.id, { filters: newFilters });
    },
    [settings.id, settings.field, settings.filters, updateChart, valueFilter]
  );

  const handleBrushChange = useCallback(
    (extent: [[number, number], [number, number]] | null) => {
      const newFilters = settings.filters.filter(
        (f) => f.field !== settings.field
      );
      if (extent && plan.mode === "bin") {
        const linear = xScale as ScaleLinear<number, number>;
        newFilters.push({
          type: "range",
          field: settings.field,
          min: linear.invert(extent[0][0]),
          max: linear.invert(extent[1][0]),
        });
      } else if (extent) {
        return;
      }
      updateChart(settings.id, { filters: newFilters });
    },
    [plan.mode, settings.field, settings.filters, settings.id, updateChart, xScale]
  );

  const isCount = plan.mode === "count";
  const isAggregate = plan.mode === "aggregate";

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
        onHoverTarget={setHoveredId}
        onInspectPlot={([x, y]) => {
          const bar = barAt(plan, x, y);
          return bar ? Boolean(inspect("bar", bar.id)) : false;
        }}
        activeGuideId={selected?.kind === "guide" ? selected.id : hoveredId}
      >
        <g>
          {plan.bars.map((bar) => {
            const measureLabel = isAggregate
              ? displayAggregateValue(bar.value)
              : `${bar.value} records`;
            const clickable = isCount || plan.mode === "bin";
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
                aria-label={`${bar.label}: ${measureLabel}`}
                aria-pressed={bar.selected}
                className={`chart-mark ${clickable ? "cursor-pointer" : ""}`}
                style={{
                  fill: bar.fill,
                  ...(selected?.id === bar.id
                    ? { stroke: "var(--primary)", strokeWidth: 2 }
                    : {}),
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  if (event.altKey && event.key === "Enter") {
                    event.preventDefault();
                    inspect("bar", bar.id);
                  } else if (isCount && !event.altKey) {
                    event.preventDefault();
                    toggleCategory(bar.groupValue);
                  }
                }}
                onClick={(event) => {
                  if (event.altKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    inspect("bar", bar.id);
                  } else if (isCount) {
                    toggleCategory(bar.groupValue);
                  }
                }}
              />
            );
          })}
        </g>
      </BaseChart>
      {hoveredId && <HoverReadout plan={plan} id={hoveredId} />}
    </div>
  );
}
