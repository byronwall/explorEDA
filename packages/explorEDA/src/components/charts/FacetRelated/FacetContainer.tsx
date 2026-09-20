import { categoryKey, categoryLabel } from "@/lib/categories";
import { IdType, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings, datum } from "@/types/ChartTypes";
import { useMemo } from "react";
import { FacetGridLayout } from "./FacetGridLayout";
import { FacetWrapLayout } from "./FacetWrapLayout";
import { useGetAllIds } from "../useGetLiveData";

interface FacetContainerProps {
  settings: ChartSettings;
  width: number;
  height: number;
}

export interface FacetData {
  id: string;
  rowKey: string;
  columnKey: string | null;
  rowValue: string;
  columnValue: string | null;
  ids: IdType[];
}

export function FacetContainer({
  settings,
  width,
  height,
}: FacetContainerProps) {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const allIds = useGetAllIds();
  const nonce = useDataLayer((state) => state.nonce);

  const facetData = useMemo(() => {
    if (!settings.facet?.enabled) {
      return [] as FacetData[];
    }

    const facet = settings.facet;
    const rowVariable = facet.rowVariable;

    if (!rowVariable) {
      return [] as FacetData[];
    }

    const rowData = getColumnData(rowVariable);
    const columnData =
      facet.type === "grid" ? getColumnData(facet.columnVariable) : null;

    return groupFacetData(allIds, rowData, columnData);
  }, [settings.facet, getColumnData, allIds, nonce]);

  if (!settings.facet?.enabled) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-xs text-muted-foreground mb-1">
        Shared full-data scales · selections apply across all facets
      </p>
      <div className="min-h-0 flex-1">
        {settings.facet.type === "grid" ? (
          <FacetGridLayout
            width={width}
            height={height}
            rowVariable={settings.facet.rowVariable}
            columnVariable={settings.facet.columnVariable}
            facetData={facetData}
            settings={settings}
          />
        ) : (
          <FacetWrapLayout
            width={width}
            height={height}
            columns={settings.facet.columnCount}
            facetData={facetData}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
}

export function groupFacetData(
  ids: IdType[],
  rowData: Record<IdType, datum>,
  columnData: Record<IdType, datum> | null
): FacetData[] {
  const groups = new Map<string, FacetData>();
  for (const rowId of ids) {
    const rowKey = categoryKey(rowData[rowId]);
    const columnKey = columnData ? categoryKey(columnData[rowId]) : null;
    const id = JSON.stringify([rowKey, columnKey]);
    let group = groups.get(id);
    if (!group) {
      group = {
        id,
        rowKey,
        columnKey,
        rowValue: categoryLabel(rowData[rowId]),
        columnValue: columnData ? categoryLabel(columnData[rowId]) : null,
        ids: [],
      };
      groups.set(id, group);
    }
    group.ids.push(rowId);
  }
  return [...groups.values()];
}
