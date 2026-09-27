import { useMemo } from "react";
import { resolveFieldProfile } from "@/components/FieldMetadata";
import {
  buildFieldDistribution,
  type FieldDistribution,
} from "@/lib/fieldDistribution";
import { useDataLayer } from "@/providers/DataLayerProvider";

/**
 * Value distributions for all rows and for the rows that pass the current
 * chart filters, keyed by field. Returns an empty map while `enabled` is
 * false, so closed views do no work. The filtered row set is read once for
 * every field.
 */
export function useFieldDistributions(fields: string[], enabled: boolean) {
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);
  const liveItems = useDataLayer((state) => state.liveItems);
  const charts = useDataLayer((state) => state.charts);
  const key = fields.join("\u0000");

  return useMemo(() => {
    // liveItems changes whenever chart filters change the remaining rows.
    void liveItems;
    const distributions = new Map<string, FieldDistribution>();
    if (!enabled || fields.length === 0) {
      return distributions;
    }
    // Chart filters scope the rows; with no charts every row is in scope.
    const filteredIds = charts.length
      ? new Set(crossfilterWrapper.getFilteredRowIds())
      : undefined;
    for (const field of fields) {
      const profile = resolveFieldProfile(
        field,
        fieldProfiles ?? [],
        getColumnData
      );
      if (!profile) continue;
      distributions.set(
        field,
        buildFieldDistribution(
          getColumnData(field),
          profile.dataType,
          filteredIds
        )
      );
    }
    return distributions;
    // `key` stands for the field list's contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    key,
    fieldProfiles,
    getColumnData,
    crossfilterWrapper,
    charts,
    liveItems,
  ]);
}

/**
 * One field's value distribution for all rows and for the rows that pass the
 * current chart filters. Returns null while `enabled` is false.
 */
export function useFieldDistribution(field: string | null, enabled: boolean) {
  const fields = useMemo(() => (field ? [field] : []), [field]);
  const distributions = useFieldDistributions(fields, enabled);
  return (field && distributions.get(field)) || null;
}
