import { useCallback } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { inferRegionField, type RegionMatch } from "@/lib/boundaries/infer";

const SAMPLE = 2000;
/** Finds which field and supplied boundaries a region map should use. */
export function useRegionInference() {
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  return useCallback(
    (fields?: string[]): RegionMatch | undefined =>
      inferRegionField(
        (fields ?? getColumnNames()).map((field) => ({
          field,
          values: Object.values(getColumnData(field)).slice(0, SAMPLE),
        }))
      ),
    [getColumnNames, getColumnData]
  );
}
