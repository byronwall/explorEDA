import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { DataTableBody } from "./DataTableBody";
import {
  DataTableHeader,
  HEADER_HEIGHT,
  HEADER_HEIGHT_WITH_DISTRIBUTIONS,
} from "./DataTableHeader";
import { useFilteredFieldProfiles } from "@/hooks/useFilteredFieldProfiles";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableSettings } from "./definition";
import { getFilteredRows, DataTableRow } from "./filteredRows";
import { getChartSummary } from "../chartAccessibility";

interface DataTableProps extends BaseChartProps {
  settings: DataTableSettings;
  rows?: DataTableRow[];
  onSettingsChange?: (settings: Partial<DataTableSettings>) => void;
}

export function DataTable({
  settings,
  height,
  width,
  rows,
  onSettingsChange,
  toolbarTarget,
}: DataTableProps) {
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));
  const updateChart = useDataLayer((state) => state.updateChart);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const calculations = useDataLayer((state) => state.calculations);
  const nonce = useDataLayer((state) => state.nonce);
  const resolvedRows = useMemo(() => {
    void nonce;
    const source = rows ?? data;
    if (!calculations.length) {
      return source;
    }
    const columns = calculations.map(
      (calc) =>
        [calc.resultColumnName, getColumnData(calc.resultColumnName)] as const
    );
    return source.map((row) => ({
      ...row,
      ...Object.fromEntries(
        columns.map(([name, values]) => [name, values[row.__ID]])
      ),
    }));
  }, [rows, data, calculations, getColumnData, nonce]);
  // The Rows view always shows distributions; a table chart opts in.
  const showDistributions =
    rows !== undefined || Boolean(settings.showDistributions);
  // Rows passes every chart filter. A table chart ignores its own filters,
  // so a filtered column keeps its shape with the kept range highlighted.
  const distributionProfiles = useFilteredFieldProfiles(
    rows ? undefined : settings,
    showDistributions
  );
  const headerHeight = showDistributions
    ? HEADER_HEIGHT_WITH_DISTRIBUTIONS
    : HEADER_HEIGHT;
  const columnWidth = (column: DataTableSettings["columns"][number]) =>
    columnWidths[column.id] ??
    column.width ??
    Math.max(110, column.field.length * 7 + 58);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const update =
    onSettingsChange ??
    ((next: Partial<DataTableSettings>) => updateChart(settings.id, next));
  const filteredRows = useMemo(
    () =>
      getFilteredRows(
        resolvedRows,
        rows
          ? {
              items: rows.map((row) => ({ key: row.__ID, value: 1 })),
              nonce: 0,
            }
          : liveItems,
        settings
      ),
    [resolvedRows, rows, liveItems, settings]
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    setScrollTop(0);
  }, [
    settings.globalSearch,
    settings.filters,
    settings.sortBy,
    settings.sortDirection,
    filteredRows.length,
  ]);

  const toolbar = (
    <DataTableToolbar
      settings={settings}
      rows={filteredRows}
      onSettingsChange={update}
      compact={toolbarTarget !== undefined}
      localFilters={rows !== undefined}
    />
  );

  return (
    <div
      className="eda-table-view flex min-h-0 flex-col w-full"
      style={{ height }}
    >
      {toolbarTarget === undefined
        ? toolbar
        : toolbarTarget && createPortal(toolbar, toolbarTarget)}
      <div
        ref={scrollRef}
        className="eda-table-scroll relative min-h-0 flex-1 overflow-auto"
        tabIndex={0}
        aria-label="Data rows, scroll to see more"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <table
          className="eda-data-table border-collapse"
          data-distributions={showDistributions || undefined}
          aria-rowcount={filteredRows.length + 1}
          style={{
            tableLayout: "fixed",
            width: Math.max(
              width,
              settings.columns.reduce(
                (sum, column) => sum + columnWidth(column),
                0
              )
            ),
          }}
        >
          <caption className="sr-only">{getChartSummary(settings)}</caption>
          <colgroup>
            {settings.columns.map((column) => (
              <col key={column.id} style={{ width: columnWidth(column) }} />
            ))}
          </colgroup>
          <DataTableHeader
            localFilters={rows !== undefined}
            settings={settings}
            onSettingsChange={update}
            distributionProfiles={
              showDistributions ? distributionProfiles : undefined
            }
            onColumnResize={(id, width) =>
              setColumnWidths((current) => {
                const next = { ...current };
                if (width === null) {
                  delete next[id];
                } else {
                  next[id] = width;
                }
                return next;
              })
            }
          />
          <DataTableBody
            settings={settings}
            rows={filteredRows}
            scrollTop={scrollTop}
            headerHeight={headerHeight}
            viewportHeight={height - (toolbarTarget === undefined ? 38 : 0)}
          />
        </table>
      </div>
    </div>
  );
}
