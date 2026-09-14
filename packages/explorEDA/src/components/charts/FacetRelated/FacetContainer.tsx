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

    // Group data by facet variables
    const facets: Record<string, IdType[]> = {};

    allIds.forEach((id) => {
      const rowValue = rowData[id] ?? "undefined";
      const colValue = columnData
        ? (columnData[id as IdType] ?? "undefined")
        : null;

      const rowLabel = getFacetLabel(rowValue);
      const colLabel = colValue !== null ? getFacetLabel(colValue) : null;

      const facetKey = colLabel ? `${rowLabel}__${colLabel}` : rowLabel;

      const facetIds = facets[facetKey] ?? (facets[facetKey] = []);
      facetIds.push(id);
    });

    return Object.entries(facets).map(([key, ids]) => {
      let rowValue: string;
      let columnValue: string | null = null;

      if (facet.type === "grid" && key.includes("__")) {
        const parts = key.split("__");
        rowValue = parts[0] ?? key;
        columnValue = parts[1] ?? null;
      } else {
        rowValue = key;
      }

      return {
        id: key,
        rowValue,
        columnValue,
        ids,
      };
    }) as FacetData[];
  }, [settings.facet, getColumnData, allIds]);

  if (!settings.facet?.enabled) {
    return null;
  }

  return (
    <div className="w-full h-full">
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
  );
}

function getFacetLabel(value: datum) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  return "unknown";
}
