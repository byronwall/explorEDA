import { useMemo } from "react";
import { resolveFieldProfile } from "@/components/FieldMetadata";
import { buildFieldDistribution } from "@/lib/fieldDistribution";
import { useDataLayer } from "@/providers/DataLayerProvider";

/**
 * The field's value distribution for all rows and for the rows that pass the
 * current chart filters. Returns null while `enabled` is false, so closed
 * views do no work.
 */
export function useFieldDistribution(field: string | null, enabled: boolean) {
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);
  const liveItems = useDataLayer((state) => state.liveItems);
  const charts = useDataLayer((state) => state.charts);

  return useMemo(() => {
    // liveItems changes whenever chart filters change the remaining rows.
    void liveItems;
    if (!enabled || !field) {
      return null;
    }
    const profile = resolveFieldProfile(
      field,
      fieldProfiles ?? [],
      getColumnData
    );
    if (!profile) {
      return null;
    }
    // Chart filters scope the rows; with no charts every row is in scope.
    const filteredIds = charts.length
      ? new Set(crossfilterWrapper.getFilteredRowIds())
      : undefined;
    return buildFieldDistribution(
      getColumnData(field),
      profile.dataType,
      filteredIds
    );
  }, [
    enabled,
    field,
    fieldProfiles,
    getColumnData,
    crossfilterWrapper,
    charts,
    liveItems,
  ]);
}
