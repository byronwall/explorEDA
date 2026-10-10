import { useThemeColors } from "@/hooks/useDisplayColorScales";
import { useAxisTypography } from "../chartTypography";
import { useId, useMemo, useRef, useState } from "react";
import { useColorScales } from "@/hooks/useColorScales";
import { calculateGroupedAggregate } from "@/lib/aggregates";
import { categoryKey, categoryValue } from "@/lib/categories";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { BaseChart } from "../BaseChart";
import { ChartReadout } from "../ChartReadout";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import { useGetColumnData } from "../useGetColumnData";
import {
  useChartTraceApi,
  useChartTrace,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import { barAt, sortByLabel } from "./barPlan";
import { barTraceTargets, findBarTraceRow, resolveBarTrace } from "./barTrace";
import { planSeriesBars, selectSeriesBar } from "./seriesBarPlan";
import type { BarChartSettings } from "./definition";

export function SeriesBarChart({
  settings,
  width,
  height,
  facetIds,
}: BaseChartProps<BarChartSettings>) {
  const owner = useId();
  const api = useChartTraceApi();
  const trace = useChartTrace();
  const revision = useTraceRevision(settings);
  const allIds = useGetAllIds(settings);
  const liveIds = useGetLiveIds(settings);
  const aggregate = useDataLayer((s) =>
    s.aggregates.find((item) => item.id === settings.aggregateId)
  );
  const getAggregate = useDataLayer((s) => s.getAggregateResult);
  const fieldSettings = useDataLayer((s) => s.fieldSettings);
  const getLabel = useDataLayer((s) => s.getFieldLabel);
  const format = useDataLayer((s) => s.formatFieldValue);
  const updateChart = useDataLayer((s) => s.updateChart);
  const groupData = useGetColumnData(aggregate?.groupField ?? settings.field);
  const seriesData = useGetColumnData(settings.seriesField);
  const facetRows = useGetColumnData(settings.facet.rowVariable);
  const facetColumns = useGetColumnData(
    settings.facet.type === "grid" ? settings.facet.columnVariable : undefined
  );
  const { getColorForValue } = useColorScales();
  const [activeId, setActiveId] = useState<string>();
  const refs = useRef(new Map<string, SVGRectElement>());
  const typography = useAxisTypography();
  const themeColors = useThemeColors();
  const plan = useMemo(() => {
    const facets = facetIds ? new Set(facetIds) : undefined;
    const ids = liveIds.filter((id) => !facets || facets.has(id));
    const values = new Map(
      allIds.map((id) => [
        categoryKey(seriesData[id]),
        categoryValue(seriesData[id]),
      ])
    );
    const liveSeries = new Map<string, number[]>();
    ids.forEach((id) => {
      const key = categoryKey(seriesData[id]);
      const group = liveSeries.get(key);
      if (group) group.push(id);
      else liveSeries.set(key, [id]);
    });
    const spec = aggregate ?? {
      id: `${settings.id}:count`,
      name: "Row count",
      groupField: settings.field,
      aggregation: "count" as const,
    };
    const summaries = [...values].flatMap(([key, value]) => {
      const group = liveSeries.get(key);
      if (!group) return [];
      const result = aggregate
        ? getAggregate(aggregate.id, group)
        : calculateGroupedAggregate(
            group.map((id) => ({ __ID: id, [settings.field]: groupData[id] })),
            spec
          );
      return result ? [{ value, result }] : [];
    });
    const facetFilters: Filter[] = [];
    if (facetIds) {
      const fields = [
        settings.facet.rowVariable,
        ...(settings.facet.type === "grid"
          ? [settings.facet.columnVariable]
          : []),
      ];
      for (const field of fields) {
        if (!field || facetFilters.some((filter) => filter.field === field))
          continue;
        const data =
          field === settings.facet.rowVariable ? facetRows : facetColumns;
        facetFilters.push({
          type: "value",
          field,
          values: [
            ...new Map(
              facetIds.map((id) => [
                categoryKey(data[id]),
                categoryValue(data[id]),
              ])
            ).values(),
          ],
        });
      }
    }
    const colors = new Map(
      [...values].map(([key], index) => [
        key,
        themeColors.categorical[index % themeColors.categorical.length]!,
      ])
    );
    return planSeriesBars({
      settings,
      typography,
      summaries,
      width,
      height: Math.max(1, height - 28),
      revision: `${revision}:${JSON.stringify(aggregate)}:${JSON.stringify(fieldSettings)}`,
      getLabel,
      format,
      facetFilters,
      categoryOrder:
        settings.categoryOrder === "label"
          ? sortByLabel(
              allIds.map((id) => groupData[id]),
              (value) => value
            )
          : allIds.map((id) => groupData[id]),
      getColor: (value) =>
        getColorForValue(
          settings.colorScaleId,
          value,
          colors.get(categoryKey(value))!
        ),
    });
  }, [
    settings,
    typography,
    themeColors,
    width,
    height,
    revision,
    allIds,
    liveIds,
    facetIds,
    aggregate,
    getAggregate,
    fieldSettings,
    getLabel,
    format,
    groupData,
    seriesData,
    facetRows,
    facetColumns,
    getColorForValue,
  ]);
  const source = useMemo(
    () => ({
      role: "chart" as const,
      revision: plan.revision,
      resolve: (kind: string, id: string) => resolveBarTrace(plan, kind, id),
      findRow: (id: number) => findBarTraceRow(plan, id),
      targets: () => barTraceTargets(plan),
    }),
    [plan]
  );
  useTraceSource(owner, source);
  const active = plan.bars.find((bar) => bar.id === activeId);
  const inspect = (id: string) => api?.inspect(owner, "bar", id);
  const select = (bar: (typeof plan.bars)[number]) =>
    updateChart(settings.id, { filters: selectSeriesBar(settings, bar) });
  const sharedLegend =
    settings.colorField === settings.seriesField && settings.colorScaleId;
  return (
    <div className="relative" style={{ width, height }}>
      {!sharedLegend && (
        <div
          className="absolute inset-x-2 top-1 flex h-9 items-start gap-3 overflow-auto text-xs"
          aria-label="Bar series legend"
        >
          {plan.legend.map((item) => (
            <span
              key={item.key}
              className="inline-flex shrink-0 items-center gap-1"
            >
              <span
                className="h-2 w-2 rounded-sm"
                style={{ background: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
      {plan.notice || !plan.bars.length ? (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {plan.notice ?? "No rows match the current filters"}
        </div>
      ) : (
        <BaseChart
          width={width}
          height={Math.max(1, height - 28)}
          settings={{ ...settings, margin: plan.axes.margin }}
          axes={plan.axes}
          xScale={plan.x}
          yScale={plan.y}
          brushingMode="none"
          onClearPlot={() => updateChart(settings.id, { filters: [] })}
          onBrushChange={() => {}}
          onInspectGuide={(id) => api?.inspect(owner, "guide", id)}
          onInspectPlot={([x, y]) => {
            const bar = barAt(plan, x, y);
            return bar ? Boolean(inspect(bar.id)) : false;
          }}
        >
          {plan.bars.map((bar, index) => (
            <rect
              key={bar.id}
              ref={(node) => {
                if (node) refs.current.set(bar.id, node);
                else refs.current.delete(bar.id);
              }}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={bar.height}
              rx={1}
              fill={
                bar.row.value === undefined ||
                bar.row.value === 0 ||
                (bar.stack?.mode === "percent" && bar.stack.share === undefined)
                  ? "var(--background)"
                  : bar.fill
              }
              stroke={
                trace?.selection?.owner === owner &&
                trace.selection.id === bar.id
                  ? "var(--foreground)"
                  : bar.fill
              }
              strokeWidth={
                trace?.selection?.owner === owner &&
                trace.selection.id === bar.id
                  ? 2
                  : 1
              }
              strokeDasharray={bar.row.value === undefined ? "2 2" : undefined}
              opacity={bar.selected === false ? 0.25 : 1}
              role="button"
              tabIndex={
                bar.id === active?.id || (!active && index === 0) ? 0 : -1
              }
              aria-label={`${bar.label}: ${bar.valueText}`}
              aria-pressed={bar.selected}
              aria-description="Enter selects this category and series. Alt-Enter inspects its records. Arrow keys move between bars."
              className="cursor-pointer outline-none focus-visible:stroke-[var(--ring)] focus-visible:stroke-2"
              onPointerEnter={() => setActiveId(bar.id)}
              onFocus={() => setActiveId(bar.id)}
              onClick={(event) => {
                event.stopPropagation();
                if (event.altKey) inspect(bar.id);
                else select(bar);
              }}
              onKeyDown={(event) => {
                if (
                  [
                    "ArrowRight",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowUp",
                    "Home",
                    "End",
                  ].includes(event.key)
                ) {
                  event.preventDefault();
                  event.stopPropagation();
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? plan.bars.length - 1
                        : (index +
                            (["ArrowRight", "ArrowDown"].includes(event.key)
                              ? 1
                              : -1) +
                            plan.bars.length) %
                          plan.bars.length;
                  refs.current.get(plan.bars[next]!.id)?.focus();
                } else if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  if (event.altKey) inspect(bar.id);
                  else select(bar);
                }
              }}
            />
          ))}
        </BaseChart>
      )}
      <div className="absolute inset-x-2 bottom-0 flex h-7 items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate">
          {plan.zeroTotals
            ? "Zero-total categories have no share"
            : plan.percent
              ? "Share of each category total"
              : plan.bars.some((bar) => bar.row.value === undefined)
                ? "Outline marks have no valid values"
                : `${plan.bars.length} category–series pairs`}
        </span>
      </div>
      {active && (
        <ChartReadout fallbackClassName="sr-only">
          {active.label} · {active.valueText} · {active.row.rowCount} rows
        </ChartReadout>
      )}
    </div>
  );
}
