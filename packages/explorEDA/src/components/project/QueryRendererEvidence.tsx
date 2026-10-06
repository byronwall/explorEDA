import {
  formatFilterLabel,
  isActiveFilter,
} from "@/components/ActiveFilterStatus";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { AnalysisResultRow } from "@/types/AnalysisProject";
import type { datum } from "@/types/FilterTypes";
import type {
  QueryChartFilterScope,
  QueryFlowTraceHandoff,
} from "../AnalysisChartContext";
import { queryChartFilterRevision } from "../AnalysisChartContext";
import { ChartTraceBody } from "../charts/trace/ChartTracePanel";
import { ChartTraceScope } from "../charts/trace/ChartTraceScope";
import type { ChartTrace } from "../charts/trace/traceTypes";

function sourceIds(trace: ChartTrace): number[] | undefined {
  if (trace.kind === "metric-card")
    return trace.plan.contributors.map((item) => item.sourceId);
  if (trace.kind === "bar")
    return trace.mark.row.contributors.map((item) => item.sourceId);
  if (trace.kind === "time-bucket")
    return trace.point?.contributors.map((item) => item.sourceId) ?? [];
  if (trace.kind === "time-omissions") return trace.plan.invalidDateIds;
  if (trace.kind === "point") return trace.sourceIds;
  if (trace.kind === "excluded") return [trace.sourceId];
  return undefined;
}

function traceHeading(trace: ChartTrace) {
  if (trace.kind === "metric-card") return trace.plan.metricLabel;
  if (trace.kind === "bar") return `Grouped bar · ${trace.mark.label}`;
  if (trace.kind === "time-bucket")
    return `Time series · ${trace.point?.seriesLabel} · ${trace.point?.label}`;
  if (trace.kind === "time-omissions") return "Time-series date exclusions";
  if (trace.kind === "point") return `Scatter point · row ${trace.sourceId}`;
  if (trace.kind === "excluded")
    return `Scatter exclusion · row ${trace.sourceId}`;
  return trace.kind;
}

export function QueryRendererEvidence({
  handoff,
  queryRevision,
  traceRevisions,
  rowsById,
  chartFilterScopes,
}: {
  handoff?: QueryFlowTraceHandoff;
  queryRevision: string;
  traceRevisions: Record<string, string>;
  rowsById: Record<number, AnalysisResultRow>;
  chartFilterScopes: QueryChartFilterScope[];
}) {
  const calculationManager = useDataLayer((state) => state.calculationManager);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  if (
    !handoff ||
    handoff.queryRevision !== queryRevision ||
    handoff.traceRevision !== traceRevisions[handoff.owner] ||
    handoff.filterRevision !==
      queryChartFilterRevision(handoff.chartId, chartFilterScopes)
  )
    return null;

  const { trace } = handoff;
  const ownChart = chartFilterScopes.find(
    (scope) => scope.chartId === handoff.chartId
  );
  const otherCharts = chartFilterScopes.filter(
    (scope) => scope.chartId !== handoff.chartId
  );
  const ids = sourceIds(trace);
  const rowKeys = ids
    ? [
        ...new Set(
          ids.flatMap((id) => (rowsById[id] ? [rowsById[id]!.key] : []))
        ),
      ]
    : [];
  const fields =
    trace.kind === "metric-card" ||
    trace.kind === "bar" ||
    trace.kind === "time-bucket" ||
    trace.kind === "time-omissions"
      ? trace.fields
      : trace.kind === "point"
        ? [
            trace.x.field,
            trace.y.field,
            trace.color?.field,
            trace.size?.field,
          ].filter((field): field is string => Boolean(field))
        : [];
  const calculationTraces = (ids ?? []).slice(0, 12).flatMap((id) =>
    fields.flatMap((field) => {
      const row = calculationManager.traceRow(field, id);
      return row ? [{ sourceId: id, row }] : [];
    })
  );
  const calculations = [
    ...new Map(
      calculationTraces.map(({ row }) => [
        `${row.field}:${row.expression}`,
        row,
      ])
    ).values(),
  ];
  const formatting = {
    name: getFieldLabel,
    bounds: (field: string, min: datum, max: datum) =>
      [formatFieldValue(field, min), formatFieldValue(field, max)] as [
        string,
        string,
      ],
    value: formatFieldValue,
    rounds: () => false,
  };
  const activeFilters = (scope: QueryChartFilterScope) =>
    scope.filters.filter(isActiveFilter);

  return (
    <section
      className="space-y-2 border-b border-border pb-3"
      aria-label="Chart operations"
    >
      <h4 className="font-medium">Chart operations · {traceHeading(trace)}</h4>
      <p>
        Input scope · query output plus active filters from other charts. This
        chart’s own filters are shown with its chart result.
      </p>
      {otherCharts.some((scope) => activeFilters(scope).length > 0) && (
        <ul className="list-inside list-disc text-muted-foreground">
          {otherCharts.flatMap((scope) =>
            activeFilters(scope).map((filter, index) => (
              <li key={`${scope.chartId}-${index}`}>
                {scope.label} · {formatFilterLabel(filter, formatting)}
              </li>
            ))
          )}
        </ul>
      )}
      {ownChart && activeFilters(ownChart).length > 0 && (
        <p>
          This chart’s filters ·{" "}
          {activeFilters(ownChart)
            .map((filter) => formatFilterLabel(filter, formatting))
            .join(" · ")}
        </p>
      )}
      {calculations.length > 0 && (
        <div>
          <p>
            Calculation traces · first {Math.min(ids?.length ?? 0, 12)}
            {ids?.length === 1 ? " contributor row" : " contributor rows"}
          </p>
          <ul className="list-inside list-disc text-muted-foreground">
            {calculations.map((calculation) => (
              <li key={`${calculation.field}-${calculation.expression}`}>
                {calculation.field} = {calculation.expression}
              </li>
            ))}
          </ul>
        </div>
      )}
      {rowKeys.length > 0 && ids && (
        <p>
          Query result rows represented · {rowKeys.length.toLocaleString()} of{" "}
          {ids.length.toLocaleString()}
        </p>
      )}
      {rowKeys.length > 0 && ids && (
        <p className="break-words text-muted-foreground">
          {rowKeys.length > 12
            ? `First 12 query row keys: ${rowKeys.slice(0, 12).join(", ")} · ${rowKeys.length - 12} more`
            : `Query row keys: ${rowKeys.join(", ")}`}
        </p>
      )}
      <details open>
        <summary className="cursor-pointer font-medium">Chart result</summary>
        <ChartTraceScope>
          <ChartTraceBody trace={trace} />
        </ChartTraceScope>
      </details>
    </section>
  );
}
