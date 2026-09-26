import {
  categoryEqual,
  categoryIncludes,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings, datum } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
import { useId, useMemo } from "react";
import { useColorScales } from "@/hooks/useColorScales";
import { useGetLiveIds } from "../useGetLiveData";
import { ColorScale } from "./ColorScale";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { LegendTrace, TraceSource } from "../trace/traceTypes";
import { planNumericalLegend } from "@/lib/colorScaleMath";

interface ChartColorLegendProps {
  settings: ChartSettings;
  width: number;
}

export function ChartColorLegend({ settings, width }: ChartColorLegendProps) {
  if (!settings.colorField || !settings.colorScaleId) return null;

  return <ChartColorLegendBody settings={settings} width={width} />;
}

function ChartColorLegendBody({ settings, width }: ChartColorLegendProps) {
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const revision = useTraceRevision(settings);
  const field = settings.colorField!;
  const scaleId = settings.colorScaleId!;
  const { colorScales, getColorForValue } = useColorScales();
  const scale = colorScales.find((item) => item.id === scaleId);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const updateChart = useDataLayer((state) => state.updateChart);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const liveIds = useGetLiveIds(settings);

  const values = getColumnData(field);
  const categories = useMemo(
    () => [
      ...new Map(
        Object.values(values).map((value) => [
          categoryKey(value),
          categoryValue(value),
        ])
      ).values(),
    ],
    [values]
  );
  const counts = useMemo(() => {
    const next = new Map<string, number>();
    liveIds.forEach((id) => {
      const key = categoryKey(values[id]);
      next.set(key, (next.get(key) ?? 0) + 1);
    });
    return next;
  }, [liveIds, values]);
  const selected = settings.filters
    .filter(
      (filter): filter is ValueFilter =>
        filter.type === "value" && filter.field === field
    )
    .flatMap((filter) => filter.values.map(categoryValue));
  // A chart that plans its legend decides the entries and colors shown here.
  const plannedItems = trace?.legendItems;
  const shownCategories = plannedItems?.map((item) => item.value) ?? categories;
  // Subscribe to fieldSettings so provider-stable label getters rerender after edits.
  void fieldSettings[field];
  const formatValue = (value: datum) =>
    hasFieldDisplayFormat(fieldSettings[field])
      ? formatFieldValue(field, value)
      : categoryLabel(value);
  const canTrace = Boolean(
    trace && (settings.type === "scatter" || settings.type === "bar")
  );
  const legendWidth = Math.min(220, Math.max(1, width - 24));
  const numericalPlan =
    scale?.type === "numerical"
      ? planNumericalLegend(scale, legendWidth, 4, formatValue, (value) =>
          getColorForValue(scale.id, value)
        )
      : undefined;
  const colorFor = (value: datum) =>
    plannedItems?.find((item) => item.id === categoryKey(value))?.color ??
    getColorForValue(scaleId, value);
  const labelFor = (value: datum) =>
    plannedItems?.find((item) => item.id === categoryKey(value))?.label ??
    formatValue(value);
  const resolveLegend = (id: string): LegendTrace | undefined => {
    if (!scale) return undefined;
    const value =
      id === "scale"
        ? undefined
        : shownCategories.find((item) => categoryKey(item) === id);
    if (id !== "scale" && value === undefined && !shownCategories.some((item) => categoryKey(item) === id))
      return undefined;
    return {
      kind: "legend",
      id,
      revision,
      field,
      fieldLabel: getFieldLabel(field),
      scaleId: scale.id,
      scaleType: scale.type,
      palette: scale.palette,
      domain: scale.type === "numerical" ? [scale.min, scale.max] : undefined,
      item:
        id === "scale"
          ? undefined
          : {
              id,
              label: labelFor(value),
              color: colorFor(value),
              count: counts.get(id) ?? 0,
              selected: categoryIncludes(selected, value),
            },
      rowIds:
        id === "scale"
          ? liveIds
          : liveIds.filter((rowId) => categoryKey(values[rowId]) === id),
      numericalPlan,
    };
  };
  const source: TraceSource | null = canTrace
    ? {
        role: "legend",
        revision,
        resolve: (kind, id) => (kind === "legend" ? resolveLegend(id) : undefined),
        targets: () =>
          scale?.type === "categorical"
            ? shownCategories.map((value) => ({
                kind: "legend",
                id: categoryKey(value),
                label: `Color: ${labelFor(value)}`,
              }))
            : [{ kind: "legend", id: "scale", label: "Color scale" }],
      }
    : null;
  // The source reads this render's legend. Register a new one only when what it
  // reports changes; the numeric plan is rebuilt every render and would loop.
  const sourceKey = JSON.stringify([
    revision,
    canTrace,
    scale?.type === "categorical" ? [scale.palette, [...scale.mapping]] : scale,
    plannedItems,
    categories.length,
    selected.map(categoryKey),
    legendWidth,
    liveIds.length,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableSource = useMemo(() => source, [sourceKey, fieldSettings]);
  useTraceSource(owner, stableSource);
  const inspectLegend = (id: string) => traceApi?.inspect(owner, "legend", id);

  if (!scale) return null;
  const colorScale = (
    <ColorScale
      scale={scale}
      width={legendWidth}
      numericalPlan={numericalPlan}
      wrap
      numericalBreakpoints={4}
      getColorForValue={(_, value) => colorFor(value)}
      counts={
        plannedItems
          ? new Map(plannedItems.map((item) => [item.id, item.count]))
          : counts
      }
      categories={shownCategories}
      countWidth={liveIds.length.toLocaleString().length}
      selected={selected}
      formatValue={labelFor}
      onToggle={(value) => {
        if (trace?.selection?.kind === "legend") traceApi?.clear();
        const nextValues = categoryIncludes(selected, value)
          ? selected.filter((item) => !categoryEqual(item, value))
          : [...selected, value];
        const filters = settings.filters.filter(
          (filter) => filter.field !== field
        );
        if (nextValues.length)
          filters.push({ type: "value", field, values: nextValues });
        updateChart(settings.id, { filters });
      }}
      onTrace={
        canTrace
          ? (value) =>
              inspectLegend(value === undefined ? "scale" : categoryKey(value))
          : undefined
      }
      traceId={
        canTrace && trace?.selection?.kind === "legend"
          ? trace.selection.id
          : undefined
      }
    />
  );

  return (
    <div
      className="eda-chart-color-legend"
      aria-label={`${getFieldLabel(field)} color legend`}
    >
      <span
        className="eda-legend-field"
        tabIndex={canTrace ? 0 : undefined}
        aria-description={
          canTrace
            ? "Alt-click or Alt-Enter to trace the color scale"
            : undefined
        }
        onClick={(event) => {
          if (event.altKey)
            inspectLegend("scale");
        }}
        onKeyDown={(event) => {
          if (event.altKey && event.key === "Enter")
            inspectLegend("scale");
        }}
      >
        {getFieldLabel(field)}
      </span>
      {scale.type === "categorical" && shownCategories.length > 8 ? (
        <details className="eda-legend-disclosure">
          <summary>Show {shownCategories.length} values</summary>
          <div className="eda-legend-disclosure-content">{colorScale}</div>
        </details>
      ) : (
        colorScale
      )}
    </div>
  );
}
