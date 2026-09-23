import {
  categoryEqual,
  categoryIncludes,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import { IdType, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartSettings, datum } from "@/types/ChartTypes";
import { Filter } from "@/types/FilterTypes";
import { useEffect, useMemo, useState } from "react";
import { ChartRenderer } from "../ChartRenderer";
import { FacetGridLayout } from "./FacetGridLayout";
import { FacetWrapLayout } from "./FacetWrapLayout";
import { useGetAllIds } from "../useGetLiveData";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";
import { useScatterTraceSelection } from "../ScatterPlot/ScatterTraceContext";
import type { FacetLayoutPlan } from "./facetLayout";

const FACET_HEADER_HEIGHT = 20;

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
  rowRawValue: datum;
  columnRawValue: datum | null;
  ids: IdType[];
}

export function FacetContainer({
  settings,
  width,
  height,
}: FacetContainerProps) {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const updateChart = useDataLayer((state) => state.updateChart);
  const allIds = useGetAllIds();
  const nonce = useDataLayer((state) => state.nonce);
  const rawRows = useDataLayer((state) => state.rawData);
  const calculations = useDataLayer((state) => state.calculationManager);
  const trace = useScatterTraceSelection();
  const [focusedFacetId, setFocusedFacetId] = useState<string | null>(null);
  const [pendingRow, setPendingRow] = useState<number | null>(null);
  const displayFacetValue = useMemo(
    () => (field: string, value: datum) =>
      hasFieldDisplayFormat(fieldSettings[field])
        ? formatFieldValue(field, value)
        : categoryLabel(value),
    [fieldSettings, formatFieldValue]
  );

  const allFacetData = useMemo(() => {
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

  const registerRowFallback = trace?.registerRowFallback;
  const inspectVisibleRow = trace?.inspectVisibleRow;
  useEffect(() => {
    if (settings.type !== "scatter") return;
    return registerRowFallback?.((id) => {
      const facet = allFacetData.find((item) => item.ids.includes(id));
      if (!facet) return false;
      setFocusedFacetId(facet.id);
      setPendingRow(id);
      return true;
    });
  }, [settings.type, registerRowFallback, allFacetData]);
  useEffect(() => {
    if (pendingRow !== null && inspectVisibleRow?.(pendingRow)) {
      setPendingRow(null);
    }
  }, [pendingRow, inspectVisibleRow, trace?.plan]);

  useEffect(() => {
    if (
      focusedFacetId &&
      !allFacetData.some((facet) => facet.id === focusedFacetId)
    ) {
      setFocusedFacetId(null);
    }
  }, [allFacetData, focusedFacetId]);

  const facetData = useMemo(() => {
    const visible = settings.facet?.visibleFacetIds;
    if (visible === undefined) return allFacetData;
    const byId = new Map(allFacetData.map((facet) => [facet.id, facet]));
    return visible.flatMap((id) => {
      const facet = byId.get(id);
      return facet ? [facet] : [];
    });
  }, [allFacetData, settings.facet?.visibleFacetIds]);

  const toggleFacetValue = (field: string, value: datum) => {
    const current = settings.filters.find(
      (filter): filter is Filter & { type: "value" } =>
        filter.type === "value" && filter.field === field
    );
    const values = current?.values ?? [];
    const nextValues = categoryIncludes(values, value)
      ? values.filter((item) => !categoryEqual(item, value))
      : [...values, categoryValue(value)];
    const filters = settings.filters.filter((filter) => filter.field !== field);
    if (nextValues.length)
      filters.push({ type: "value", field, values: nextValues });
    updateChart(settings.id, { filters });
  };

  const isFacetFiltered = (field: string, value: datum) => {
    const filter = settings.filters.find(
      (item): item is Filter & { type: "value" } =>
        item.type === "value" && item.field === field
    );
    return !filter || categoryIncludes(filter.values, value);
  };

  const inspectFacet =
    settings.type === "scatter"
      ? (
          role: "panel" | "row-heading" | "column-heading",
          facets: FacetData[],
          layout: FacetLayoutPlan = {
            mode: "focused",
            width,
            height: Math.max(1, height - FACET_HEADER_HEIGHT),
          }
        ) => {
          const first = facets[0];
          if (!first) return;
          const sourceIds = [
            ...new Set(facets.flatMap((facet) => facet.ids)),
          ].sort((a, b) => a - b);
          const chartIds = new Set(trace?.plan?.rowSets.chart ?? []);
          const sampleSourceId = sourceIds[0];
          const heading = (field: string, value: datum) => ({
            field,
            value,
            label: displayFacetValue(field, value),
            sampleSourceId,
            raw:
              sampleSourceId === undefined
                ? undefined
                : rawRows[sampleSourceId]?.[field],
            calculation:
              sampleSourceId === undefined
                ? undefined
                : calculations.traceRow(field, sampleSourceId),
          });
          const row =
            role !== "column-heading"
              ? heading(settings.facet.rowVariable, first.rowRawValue)
              : undefined;
          const column =
            settings.facet.type === "grid" && role !== "row-heading"
              ? heading(settings.facet.columnVariable, first.columnRawValue)
              : undefined;
          trace?.select({
            kind: "facet",
            id: `facet:${role}:${first.id}`,
            plan: trace.plan ?? undefined,
            trace: {
              kind: "facet",
              id: `facet:${role}:${first.id}`,
              revision: trace.plan?.revision ?? String(nonce),
              role,
              row,
              column,
              sourceIds,
              chartIds: sourceIds.filter((id) => chartIds.has(id)),
              layout,
            },
          });
        }
      : undefined;

  const updateVisibleFacetIds = (visibleFacetIds: string[] | undefined) =>
    updateChart(settings.id, {
      facet: { ...settings.facet, visibleFacetIds } as ChartSettings["facet"],
    });

  if (!settings.facet?.enabled) {
    return null;
  }

  if (focusedFacetId) {
    const focused = allFacetData.find((facet) => facet.id === focusedFacetId);
    if (focused) {
      return (
        <div className="flex h-full w-full min-h-0 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-2 overflow-hidden pb-1 text-xs">
            <span
              className="min-w-0 truncate whitespace-nowrap font-medium"
              tabIndex={inspectFacet ? 0 : undefined}
              aria-description={
                inspectFacet
                  ? "Alt-click or Alt-Enter to trace this facet"
                  : undefined
              }
              onClick={(event) => {
                if (event.altKey) inspectFacet?.("panel", [focused]);
              }}
              onKeyDown={(event) => {
                if (event.altKey && event.key === "Enter") {
                  event.preventDefault();
                  inspectFacet?.("panel", [focused]);
                }
              }}
            >
              {displayFacetValue(
                settings.facet.rowVariable,
                focused.rowRawValue
              )}
              {settings.facet.type === "grid" && focused.columnRawValue !== null
                ? ` · ${displayFacetValue(settings.facet.columnVariable, focused.columnRawValue)}`
                : ""}
            </span>
            <button
              type="button"
              className="shrink-0 whitespace-nowrap underline"
              onClick={() => setFocusedFacetId(null)}
            >
              Back to all facets
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <ChartRenderer
              settings={settings}
              width={width}
              height={Math.max(1, height - FACET_HEADER_HEIGHT)}
              facetIds={focused.ids}
            />
          </div>
        </div>
      );
    }
  }

  if (facetData.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>No facets selected.</span>
        {settings.facet.visibleFacetIds !== undefined && (
          <button
            type="button"
            className="underline"
            onClick={() => updateVisibleFacetIds(undefined)}
          >
            Show all facets
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <p className="mb-1 shrink-0 truncate whitespace-nowrap text-xs text-muted-foreground">
        Shared full-data scales · selections apply across all facets
      </p>
      <div className="min-h-0 flex-1">
        {settings.facet.type === "grid" ? (
          <FacetGridLayout
            width={width}
            height={Math.max(1, height - FACET_HEADER_HEIGHT)}
            rowVariable={settings.facet.rowVariable}
            columnVariable={settings.facet.columnVariable}
            facetData={facetData}
            settings={settings}
            onToggleFacet={toggleFacetValue}
            isFacetFiltered={isFacetFiltered}
            onFocusFacet={setFocusedFacetId}
            onTraceFacet={inspectFacet}
            formatFacetValue={displayFacetValue}
            getFieldLabel={getFieldLabel}
            formatVersion={fieldSettings}
          />
        ) : (
          <FacetWrapLayout
            width={width}
            height={Math.max(1, height - FACET_HEADER_HEIGHT)}
            columns={settings.facet.columnCount}
            facetData={facetData}
            settings={settings}
            onToggleFacet={toggleFacetValue}
            isFacetFiltered={isFacetFiltered}
            onFocusFacet={setFocusedFacetId}
            onTraceFacet={inspectFacet}
            formatFacetValue={displayFacetValue}
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
        rowRawValue: categoryValue(rowData[rowId]),
        columnRawValue: columnData ? categoryValue(columnData[rowId]) : null,
        ids: [],
      };
      groups.set(id, group);
    }
    group.ids.push(rowId);
  }
  return [...groups.values()];
}
