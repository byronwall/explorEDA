import isEqual from "react-fast-compare";
import { chartRegistry, getChartDefinition } from "@/charts/registry";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";

/** A filter without its field, as a sparkline mark or brush produces it. */
export type FieldFilterSpec = Filter extends infer F
  ? F extends Filter
    ? Omit<F, "field">
    : never
  : never;

/**
 * Field filters that the summary table and the field list set. They live on
 * one Summary Table chart, so they show in the filter bar, clear with its
 * controls, and save with the workspace. `chart` picks the chart; without
 * it the first Summary Table holds them, and the first filter set with none
 * adds a Summary Table below the other charts.
 */
export function useFieldFilter(chart?: ChartSettings) {
  const charts = useDataLayer((state) => state.charts);
  const updateChart = useDataLayer((state) => state.updateChart);
  const addChart = useDataLayer((state) => state.addChart);
  const target = chart ?? charts.find((item) => item.type === "summary");
  const filters = target?.filters ?? [];

  /** Replace a field's filter, or clear it with undefined. */
  const setFilter = (field: string, spec?: FieldFilterSpec) => {
    const others = filters.filter((item) => item.field !== field);
    const next = spec ? [...others, { ...spec, field } as Filter] : others;
    if (target) {
      updateChart(target.id, { filters: next });
      return;
    }
    if (!spec || !chartRegistry.has("summary")) return;
    const layout = {
      x: 0,
      y: Math.max(0, ...charts.map((item) => item.layout.y + item.layout.h)),
      w: 6,
      h: 6,
    };
    const summary = getChartDefinition("summary").createDefaultSettings(
      layout,
      ""
    );
    addChart({ ...summary, filters: next });
  };

  /** Set a field's filter, or clear it when the same filter is set again. */
  const toggleFilter = (field: string, spec: FieldFilterSpec) => {
    const filter = { ...spec, field };
    const same = filters.some((item) => isEqual(item, filter));
    setFilter(field, same ? undefined : spec);
  };

  return {
    target,
    filterFor: (field: string) => filters.find((item) => item.field === field),
    setFilter,
    toggleFilter,
  };
}
