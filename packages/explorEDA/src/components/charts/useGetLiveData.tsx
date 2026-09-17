import { IdType, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings, datum } from "@/types/ChartTypes";
import { useMemo } from "react";
import { useGetColumnDataForIds } from "./useGetColumnData";

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
    return [];
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
  const getColumnData = useDataLayer((s) => s.getColumnData);

  const allIds = useMemo(() => {
    const data = getColumnData("__ID") as Record<IdType, datum>;
    return Object.values(data) as IdType[];
  }, [getColumnData]);

  return allIds;
}
