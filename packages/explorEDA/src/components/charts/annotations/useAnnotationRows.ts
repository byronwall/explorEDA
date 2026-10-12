import { useMemo } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";

/**
 * Every source row, for resolving record keys. A chart's local filters and
 * facets decide whether a record shows; they never make its key missing.
 */
export function useAnnotationRows() {
  const data = useDataLayer((state) => state.data);
  const getColumn = useDataLayer((state) => state.getColumnData);
  const nonce = useDataLayer((state) => state.nonce);
  const ids = useMemo(
    () => data.map((row) => row.__ID),
    // The nonce marks replaced or recalculated columns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, nonce]
  );
  return { ids, getColumn };
}
