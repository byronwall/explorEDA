import { IdType, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import type { datum } from "@/types/ChartTypes";
import { useMemo } from "react";
import { useGetColumnDataForIds } from "./useGetColumnData";
import { restrictToPopulation } from "@/lib/chartPopulation";

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

export function useGetLiveIds(settings: ChartSettings, facetIds?: IdType[]) {
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));
  return useMemo(() => {
    if (!liveItems) {
      return [];
    }

    const facetIdSet = new Set(facetIds);
    return liveItems.items
      .filter((c) => c.value > 0)
      .filter((c) =>
        facetIds && facetIds.length > 0 ? facetIdSet.has(c.key) : true
      )
      .map((d) => d.key);
  }, [facetIds, liveItems]);
}

/** Every row the chart can draw: all rows, or its own population. */
export function useGetAllIds(settings?: ChartSettings) {
  const data = useDataLayer((s) => s.data);
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const nonce = useDataLayer((s) => s.nonce);
  const localFilters = settings?.localFilters;

  const allIds = useMemo(
    () =>
      restrictToPopulation(
        data.map((row) => row.__ID),
        { localFilters },
        getColumnData
      ),
    // include the nonce since calculated columns change with it
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, localFilters, getColumnData, nonce]
  );

  return allIds;
}
