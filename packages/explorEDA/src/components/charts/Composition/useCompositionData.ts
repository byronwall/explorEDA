import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { useMemo } from "react";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import type { CompositionData } from "./resolveUnit";

/**
 * The rows a composition draws: its population, and the rows that pass the
 * other filters.
 */
export function useCompositionData(settings: ChartSettings): CompositionData {
  const liveIds = useGetLiveIds(settings);
  const allIds = useGetAllIds(settings);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const nonce = useDataLayer((state) => state.nonce);
  return useMemo(
    () => ({ allIds, liveIds, column: getColumnData }),
    // Calculated columns change with the nonce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allIds, liveIds, getColumnData, nonce]
  );
}
