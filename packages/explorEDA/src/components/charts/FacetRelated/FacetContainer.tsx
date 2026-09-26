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
import { Minimize2 } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChartRenderer } from "../ChartRenderer";
import { FacetGridLayout } from "./FacetGridLayout";
import { FacetWrapLayout } from "./FacetWrapLayout";
import { FacetPager, type FacetPickerProps } from "./FacetPager";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import { hasFieldDisplayFormat } from "@/lib/fieldSettings";
import {
  useChartTrace,
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { FacetTrace, TraceSource } from "../trace/traceTypes";
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
  const trace = useChartTrace();
  const traceApi = useChartTraceApi();
  const owner = useId();
  const revision = useTraceRevision(settings);
  const chartIds = useGetLiveIds(settings);
  const canTrace = settings.type === "scatter" || settings.type === "bar";
  /** Layout and members for each traced heading, recorded when it is clicked. */
  const traced = useRef(
    new Map<
      string,
      {
        role: FacetTrace["role"];
        facetIds: string[];
        layout: FacetLayoutPlan;
      }
    >()
  );
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

  const findVisibleRow = traceApi?.findVisibleRow;
  useEffect(() => {
    if (pendingRow !== null && findVisibleRow?.(pendingRow)) {
      setPendingRow(null);
    }
    // A focused facet's chart registers after this render; the version shows it.
  }, [pendingRow, findVisibleRow, trace?.version]);

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

  const resolveFacet = (id: string): FacetTrace | undefined => {
    const record = traced.current.get(id);
    if (!record) return undefined;
    const facets = allFacetData.filter((facet) =>
      record.facetIds.includes(facet.id)
    );
    const first = facets[0];
    if (!first) return undefined;
    const sourceIds = [...new Set(facets.flatMap((facet) => facet.ids))].sort(
      (a, b) => a - b
    );
    const chartSet = new Set(chartIds);
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
    return {
      kind: "facet",
      id,
      revision,
      role: record.role,
      row:
        record.role !== "column-heading"
          ? heading(settings.facet.rowVariable, first.rowRawValue)
          : undefined,
      column:
        settings.facet.type === "grid" && record.role !== "row-heading"
          ? heading(settings.facet.columnVariable, first.columnRawValue)
          : undefined,
      sourceIds,
      chartIds: sourceIds.filter((sourceId) => chartSet.has(sourceId)),
      layout: record.layout,
    };
  };
  const resolveRef = useRef(resolveFacet);
  resolveRef.current = resolveFacet;
  const source = useMemo(
    (): TraceSource | null =>
      canTrace
        ? {
            role: "facets",
            revision,
            resolve: (kind, id) =>
              kind === "facet" ? resolveRef.current(id) : undefined,
            // Rows in a facet off the page open that facet, then the chart finds them.
            findRow: (id) => {
              const facet = allFacetData.find((item) => item.ids.includes(id));
              if (!facet) return undefined;
              setFocusedFacetId(facet.id);
              setPendingRow(id);
              return "pending";
            },
          }
        : null,
    // Facet data, chart rows and settings change the resolved trace too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canTrace, revision, allFacetData, chartIds, settings.facet, displayFacetValue]
  );
  useTraceSource(owner, source);

  const inspectFacet = canTrace
    ? (
        role: FacetTrace["role"],
        facets: FacetData[],
        layout: FacetLayoutPlan = {
          mode: "focused",
          width,
          height: Math.max(1, height - FACET_HEADER_HEIGHT),
        }
      ) => {
        const first = facets[0];
        if (!first) return;
        const id = `facet:${role}:${first.id}`;
        traced.current.set(id, {
          role,
          facetIds: facets.map((facet) => facet.id),
          layout,
        });
        traceApi?.inspect(owner, "facet", id);
      }
    : undefined;

  const updateVisibleFacetIds = (visibleFacetIds: string[] | undefined) =>
    updateChart(settings.id, {
      facet: { ...settings.facet, visibleFacetIds } as ChartSettings["facet"],
    });

  const facetLabel = (facet: FacetData) =>
    settings.facet?.type === "grid" && facet.columnRawValue !== null
      ? `${displayFacetValue(settings.facet.rowVariable, facet.rowRawValue)} · ${displayFacetValue(settings.facet.columnVariable, facet.columnRawValue)}`
      : displayFacetValue(settings.facet?.rowVariable ?? "", facet.rowRawValue);
  const picker: FacetPickerProps = {
    options: allFacetData.map((facet) => ({
      id: facet.id,
      label: facetLabel(facet),
    })),
    visibleIds: settings.facet?.visibleFacetIds,
    onChange: updateVisibleFacetIds,
  };

  if (!settings.facet?.enabled) {
    return null;
  }

  if (focusedFacetId) {
    const focused = allFacetData.find((facet) => facet.id === focusedFacetId);
    if (focused) {
      return (
        <div className="flex h-full w-full min-h-0 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-2 overflow-hidden pb-1 text-xs">
            <span className="flex min-w-0 items-center gap-0.5">
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
                {facetLabel(focused)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 shrink-0 text-muted-foreground hover:text-foreground"
                tooltip="Back to all facets"
                aria-label={`Unfocus ${facetLabel(focused)} facet`}
                onClick={() => setFocusedFacetId(null)}
              >
                <Minimize2 className="size-3" />
              </Button>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 shrink-0 gap-1 px-1.5 text-xs font-normal text-muted-foreground hover:text-foreground"
              onClick={() => setFocusedFacetId(null)}
            >
              <Minimize2 className="size-3" />
              Back to all facets
            </Button>
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
      <div className="flex h-full flex-col">
        <FacetPager
          label="No facets shown"
          page={0}
          pageCount={1}
          onPageChange={() => undefined}
          picker={picker}
        />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
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
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">
        {settings.facet.type === "grid" ? (
          <FacetGridLayout
            width={width}
            height={height}
            rowVariable={settings.facet.rowVariable}
            columnVariable={settings.facet.columnVariable}
            facetData={facetData}
            settings={settings}
            onToggleFacet={toggleFacetValue}
            isFacetFiltered={isFacetFiltered}
            onFocusFacet={setFocusedFacetId}
            onTraceFacet={inspectFacet}
            formatFacetValue={displayFacetValue}
            picker={picker}
            getFieldLabel={getFieldLabel}
            formatVersion={fieldSettings}
          />
        ) : (
          <FacetWrapLayout
            width={width}
            height={height}
            columns={settings.facet.columnCount}
            facetData={facetData}
            settings={settings}
            onToggleFacet={toggleFacetValue}
            isFacetFiltered={isFacetFiltered}
            onFocusFacet={setFocusedFacetId}
            onTraceFacet={inspectFacet}
            formatFacetValue={displayFacetValue}
            picker={picker}
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
