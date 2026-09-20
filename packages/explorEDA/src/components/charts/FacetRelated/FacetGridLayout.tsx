import { ChartSettings, datum } from "@/types/ChartTypes";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChartRenderer } from "../ChartRenderer";
import { FacetData } from "./FacetContainer";

const PAGER_HEIGHT = 20;
const TABLE_HEADER_HEIGHT = 32;

interface FacetGridLayoutProps {
  width: number;
  height: number;
  rowVariable: string;
  columnVariable: string;
  facetData: FacetData[];
  settings: ChartSettings;
  onToggleFacet: (field: string, value: datum) => void;
  isFacetFiltered: (field: string, value: datum) => boolean;
  onFocusFacet: (id: string) => void;
  formatFacetValue: (field: string, value: datum) => string;
  getFieldLabel: (field: string) => string;
  formatVersion: unknown;
}

export function FacetGridLayout({
  width,
  height,
  rowVariable,
  columnVariable,
  facetData,
  settings,
  onToggleFacet,
  isFacetFiltered,
  onFocusFacet,
  formatFacetValue,
  getFieldLabel,
  formatVersion,
}: FacetGridLayoutProps) {
  const { rows, columns, grid } = useMemo(() => {
    const rows = new Map<string, { label: string; value: datum }>();
    const columns = new Map<string, { label: string; value: datum }>();
    const grid = new Map<string, FacetData>();
    facetData.forEach((facet) => {
      rows.set(facet.rowKey, {
        label: formatFacetValue(rowVariable, facet.rowRawValue),
        value: facet.rowRawValue,
      });
      if (facet.columnKey !== null) {
        columns.set(facet.columnKey, {
          label: formatFacetValue(columnVariable, facet.columnRawValue),
          value: facet.columnRawValue,
        });
      }
      grid.set(JSON.stringify([facet.rowKey, facet.columnKey]), facet);
    });
    return { rows: [...rows], columns: [...columns], grid };
  }, [columnVariable, facetData, formatFacetValue, formatVersion, rowVariable]);

  const rowPageSize = Math.max(
    1,
    Math.floor(Math.max(1, height - PAGER_HEIGHT - TABLE_HEADER_HEIGHT) / 160)
  );
  const columnPageSize = Math.max(1, Math.floor(Math.max(1, width - 90) / 220));
  const rowPages = Math.max(1, Math.ceil(rows.length / rowPageSize));
  const columnPages = Math.max(1, Math.ceil(columns.length / columnPageSize));
  const pageCount = rowPages * columnPages;
  const [page, setPage] = useState(0);
  useEffect(
    () => setPage((current) => Math.min(current, pageCount - 1)),
    [pageCount]
  );
  const rowPage = Math.floor(page / columnPages);
  const columnPage = page % columnPages;

  const visibleRows = rows.slice(
    rowPage * rowPageSize,
    (rowPage + 1) * rowPageSize
  );
  const visibleColumns = columns.slice(
    columnPage * columnPageSize,
    (columnPage + 1) * columnPageSize
  );
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null);
  const [tableHeaderHeight, setTableHeaderHeight] =
    useState(TABLE_HEADER_HEIGHT);
  useLayoutEffect(() => {
    const header = tableHeaderRef.current;
    if (!header) return;
    const measure = () =>
      setTableHeaderHeight(
        Math.max(
          TABLE_HEADER_HEIGHT,
          Math.ceil(header.getBoundingClientRect().height)
        )
      );
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, [page, visibleColumns.length, width]);

  const pagerHeight = pageCount > 1 ? PAGER_HEIGHT : 0;
  const cellWidth = Math.max(
    1,
    (width - 90) / Math.max(1, visibleColumns.length)
  );
  const cellHeight = Math.max(
    1,
    (height - pagerHeight - tableHeaderHeight) / Math.max(1, visibleRows.length)
  );
  const pageLabel =
    rowPages > 1 || columnPages > 1
      ? `Rows ${rowPage + 1}/${rowPages} · Columns ${columnPage + 1}/${columnPages}`
      : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {(pageLabel || rowPages > 1 || columnPages > 1) && (
        <div className="flex shrink-0 items-center justify-between gap-2 overflow-hidden pb-1 text-xs text-muted-foreground">
          <span
            className="min-w-0 truncate whitespace-nowrap"
            title={pageLabel ?? "All facets"}
          >
            {pageLabel ?? "All facets"}
          </span>
          <span className="flex shrink-0 gap-1 whitespace-nowrap">
            <button
              type="button"
              className="whitespace-nowrap underline disabled:no-underline disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="whitespace-nowrap underline disabled:no-underline disabled:opacity-40"
              disabled={page === pageCount - 1}
              onClick={() =>
                setPage((current) => Math.min(pageCount - 1, current + 1))
              }
            >
              Next
            </button>
          </span>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        <table className="h-full w-full border-collapse text-xs">
          <thead ref={tableHeaderRef}>
            <tr>
              <th className="border border-border/50 bg-muted/30 px-2 py-1 font-medium">
                {getFieldLabel(rowVariable)} / {getFieldLabel(columnVariable)}
              </th>
              {visibleColumns.map(([columnKey, column]) => (
                <th
                  key={columnKey}
                  className="border border-border/50 bg-muted/30 px-2 py-1 font-medium"
                >
                  <button
                    type="button"
                    className="max-w-full truncate underline-offset-2 hover:underline"
                    aria-pressed={isFacetFiltered(columnVariable, column.value)}
                    onClick={() => onToggleFacet(columnVariable, column.value)}
                  >
                    {column.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(([rowKey, row]) => (
              <tr key={rowKey}>
                <th className="border border-border/50 bg-muted/30 px-2 py-1 text-left font-medium">
                  <button
                    type="button"
                    className="max-w-full truncate underline-offset-2 hover:underline"
                    aria-pressed={isFacetFiltered(rowVariable, row.value)}
                    onClick={() => onToggleFacet(rowVariable, row.value)}
                  >
                    {row.label}
                  </button>
                </th>
                {visibleColumns.map(([columnKey]) => {
                  const facet = grid.get(JSON.stringify([rowKey, columnKey]));
                  return (
                    <td key={columnKey} className="border border-border/50 p-0">
                      <div className="relative h-full w-full">
                        {facet ? (
                          <>
                            <button
                              type="button"
                              className="absolute right-1 top-1 z-10 rounded bg-background/80 px-1 text-[10px] underline"
                              aria-label={`Focus ${formatFacetValue(rowVariable, facet.rowRawValue)}${facet.columnRawValue !== null ? `, ${formatFacetValue(columnVariable, facet.columnRawValue)}` : ""} facet`}
                              onClick={() => onFocusFacet(facet.id)}
                            >
                              Focus
                            </button>
                            <ChartRenderer
                              settings={settings}
                              width={cellWidth}
                              height={cellHeight}
                              facetIds={facet.ids}
                            />
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            No data
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
