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
import { useMemo } from "react";
import { useColorScales } from "@/hooks/useColorScales";
import { useGetLiveIds } from "../useGetLiveData";
import { ColorScale } from "./ColorScale";
import { useScatterTraceSelection } from "../ScatterPlot/ScatterTraceContext";
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
  const trace = useScatterTraceSelection();
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
  const plannedItems =
    settings.type === "scatter" && trace?.plan?.legend?.type === "categorical"
      ? trace.plan.legend.items
      : undefined;
  const shownCategories = plannedItems?.map((item) => item.value) ?? categories;

  if (!scale) return null;
  // Subscribe to fieldSettings so provider-stable label getters rerender after edits.
  void fieldSettings[field];
  const formatValue = (value: datum) =>
    hasFieldDisplayFormat(fieldSettings[field])
      ? formatFieldValue(field, value)
      : categoryLabel(value);
  const canTrace = Boolean(settings.type === "scatter" && trace);
  const legendWidth = Math.min(220, Math.max(1, width - 24));
  const numericalPlan =
    scale.type === "numerical"
      ? planNumericalLegend(scale, legendWidth, 4, formatValue, (value) =>
          getColorForValue(scale.id, value)
        )
      : undefined;
  const colorScale = (
    <ColorScale
      scale={scale}
      width={legendWidth}
      numericalPlan={numericalPlan}
      wrap
      numericalBreakpoints={4}
      getColorForValue={(id, value) =>
        plannedItems?.find((item) => item.id === categoryKey(value))?.color ??
        getColorForValue(id, value)
      }
      counts={
        plannedItems
          ? new Map(plannedItems.map((item) => [item.id, item.count]))
          : counts
      }
      categories={shownCategories}
      countWidth={liveIds.length.toLocaleString().length}
      selected={selected}
      formatValue={(value) =>
        plannedItems?.find((item) => item.id === categoryKey(value))?.label ??
        formatValue(value)
      }
      onToggle={(value) => {
        if (trace?.selection?.kind === "legend") trace.select(null);
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
              trace?.inspectFirst({
                kind: "legend",
                id: value === undefined ? "scale" : categoryKey(value),
                numericalPlan,
              })
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
            trace?.inspectFirst({ kind: "legend", id: "scale", numericalPlan });
        }}
        onKeyDown={(event) => {
          if (event.altKey && event.key === "Enter")
            trace?.inspectFirst({ kind: "legend", id: "scale", numericalPlan });
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
