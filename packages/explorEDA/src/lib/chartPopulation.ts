import { applyFilter } from "@/hooks/applyFilter";
import type { IdType } from "@/providers/lib/dataLayerState";
import type { BaseChartSettings, datum } from "@/types/ChartTypes";

type FieldGetter = (name: string) => Record<IdType, datum>;

/** True when the chart draws only some rows, whatever other charts select. */
export function hasLocalFilters(
  chart: Pick<BaseChartSettings, "localFilters">
) {
  return Boolean(chart.localFilters?.length);
}

/**
 * Tests whether a row belongs to the chart's own population. Returns
 * undefined when the chart draws every row. A filter on a field that has no
 * values matches no rows, so a broken restriction never widens the chart.
 */
export function getPopulationTest(
  chart: Pick<BaseChartSettings, "localFilters">,
  fieldGetter: FieldGetter
): ((id: IdType) => boolean) | undefined {
  if (!hasLocalFilters(chart)) {
    return undefined;
  }
  const active = chart.localFilters!.map((filter) => ({
    filter,
    values: fieldGetter(filter.field),
  }));
  return (id) =>
    active.every(({ filter, values }) => applyFilter(values[id], filter));
}

/** Keeps the ids in the chart's population, or every id without one. */
export function restrictToPopulation(
  ids: IdType[],
  chart: Pick<BaseChartSettings, "localFilters">,
  fieldGetter: FieldGetter
): IdType[] {
  const test = getPopulationTest(chart, fieldGetter);
  return test ? ids.filter(test) : ids;
}
