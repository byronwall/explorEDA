import { IdType, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import type { datum } from "@/types/ChartTypes";
import { useMemo } from "react";
import { useGetColumnDataForIds } from "./useGetColumnData";

const EMPTY_DATA: datum[] = [];

export function useGetLiveData(
  settings: ChartSettings,
  field: string | undefined,
  facetIds?: IdType[]
) {
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));

  const liveIdsPerFacet = useMemo(() => {
    if (!liveItems) {
      return [];
    }

    const facetIdSet = new Set(facetIds);

    const liveIds = liveItems.items
      .filter((c) => c.value > 0)
      .filter((c) =>
        facetIds && facetIds.length > 0 ? facetIdSet.has(c.key) : true
      )
      .map((d) => d.key);

    return liveIds;
  }, [facetIds, liveItems]);

  const data = useGetColumnDataForIds(field, liveIdsPerFacet);

  if (!field) {
    return EMPTY_DATA;
  }

  return data;
}

export function useGetLiveIds(settings: ChartSettings) {
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));
  return useMemo(() => {
    if (!liveItems) {
      return [];
    }

    return liveItems.items.filter((c) => c.value > 0).map((d) => d.key);
  }, [liveItems]);
}

export function useGetAllIds() {
  const data = useDataLayer((s) => s.data);

  const allIds = useMemo(() => data.map((row) => row.__ID), [data]);

  return allIds;
}
