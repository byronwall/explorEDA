import { ChartSettings, datum } from "@/types/ChartTypes";
import { Maximize2 } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChartRenderer } from "../ChartRenderer";
import { traceOnAltEnter } from "./facetTrace";
import { FacetPager, type FacetPickerProps } from "./FacetPager";
import { FacetData } from "./FacetContainer";
import { planFacetGridLayout, type FacetLayoutPlan } from "./facetLayout";

const TABLE_HEADER_HEIGHT = 32;
const CELL_ACTION_HEIGHT = 20;

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
  onTraceFacet?: (
    role: "panel" | "row-heading" | "column-heading",
    facets: FacetData[],
    layout: FacetLayoutPlan
  ) => void;
  formatFacetValue: (field: string, value: datum) => string;
  picker: FacetPickerProps;
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
  onTraceFacet,
  formatFacetValue,
  picker,
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

  const [page, setPage] = useState(0);
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null);
  const [tableHeaderHeight, setTableHeaderHeight] =
    useState(TABLE_HEADER_HEIGHT);
  const layout = planFacetGridLayout(
    width,
    height,
    rows.length,
    columns.length,
    page,
    tableHeaderHeight
  );
  const {
    rowPageSize,
    columnPageSize,
    rowPages,
    columnPages,
    pageCount,
    rowPage,
    columnPage,
  } = layout;
  useEffect(() => setPage(layout.page), [layout.page]);

  const visibleRows = rows.slice(
    rowPage * rowPageSize,
    (rowPage + 1) * rowPageSize
  );
  const visibleColumns = columns.slice(
    columnPage * columnPageSize,
    (columnPage + 1) * columnPageSize
  );
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

  const { cellWidth, cellHeight } = layout;
  const pageLabel =
    rowPages > 1 || columnPages > 1
      ? `Rows ${rowPage + 1}/${rowPages} · Columns ${columnPage + 1}/${columnPages}`
      : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <FacetPager
        label={pageLabel ?? `${facetData.length} facets`}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        picker={picker}
      />
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
                    onKeyDown={traceOnAltEnter(
                      onTraceFacet &&
                        (() =>
                          onTraceFacet(
                            "column-heading",
                            facetData.filter(
                              (facet) => facet.columnKey === columnKey
                            ),
                            layout
                          ))
                    )}
                    onClick={(event) => {
                      if (event.altKey && onTraceFacet)
                        onTraceFacet(
                          "column-heading",
                          facetData.filter(
                            (facet) => facet.columnKey === columnKey
                          ),
                          layout
                        );
                      else onToggleFacet(columnVariable, column.value);
                    }}
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
                    onKeyDown={traceOnAltEnter(
                      onTraceFacet &&
                        (() =>
                          onTraceFacet(
                            "row-heading",
                            facetData.filter(
                              (facet) => facet.rowKey === rowKey
                            ),
                            layout
                          ))
                    )}
                    onClick={(event) => {
                      if (event.altKey && onTraceFacet)
                        onTraceFacet(
                          "row-heading",
                          facetData.filter((facet) => facet.rowKey === rowKey),
                          layout
                        );
                      else onToggleFacet(rowVariable, row.value);
                    }}
                  >
                    {row.label}
                  </button>
                </th>
                {visibleColumns.map(([columnKey]) => {
                  const facet = grid.get(JSON.stringify([rowKey, columnKey]));
                  return (
                    <td key={columnKey} className="border border-border/50 p-0">
                      <div className="h-full w-full">
                        {facet ? (
                          <>
                            <div
                              className="flex justify-end"
                              style={{ height: CELL_ACTION_HEIGHT }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 text-muted-foreground hover:text-foreground"
                                tooltip="Focus facet"
                                aria-label={`Focus ${formatFacetValue(rowVariable, facet.rowRawValue)}${facet.columnRawValue !== null ? `, ${formatFacetValue(columnVariable, facet.columnRawValue)}` : ""} facet`}
                                onKeyDown={traceOnAltEnter(
                                  onTraceFacet &&
                                    (() =>
                                      onTraceFacet("panel", [facet], layout))
                                )}
                                onClick={(event) => {
                                  if (event.altKey && onTraceFacet)
                                    onTraceFacet("panel", [facet], layout);
                                  else onFocusFacet(facet.id);
                                }}
                              >
                                <Maximize2 className="size-3" />
                              </Button>
                            </div>
                            <ChartRenderer
                              settings={settings}
                              width={cellWidth}
                              height={Math.max(
                                1,
                                cellHeight - CELL_ACTION_HEIGHT
                              )}
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
