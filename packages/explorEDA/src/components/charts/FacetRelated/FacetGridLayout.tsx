import { ChartSettings } from "@/types/ChartTypes";
import { useMemo } from "react";
import { ChartRenderer } from "../ChartRenderer";
import { FacetData } from "./FacetContainer";

interface FacetGridLayoutProps {
  width: number;
  height: number;
  rowVariable: string;
  columnVariable: string;
  facetData: FacetData[];
  settings: ChartSettings;
}

export function FacetGridLayout({
  width,
  height,
  rowVariable,
  columnVariable,
  facetData,
  settings,
}: FacetGridLayoutProps) {
  const { rows, columns, grid } = useMemo(() => {
    const rows = new Map(
      facetData.map((facet) => [facet.rowKey, facet.rowValue])
    );
    const columns = new Map(
      facetData
        .filter((facet) => facet.columnKey !== null)
        .map((facet) => [facet.columnKey!, facet.columnValue!])
    );
    const grid = new Map(
      facetData.map((facet) => [
        JSON.stringify([facet.rowKey, facet.columnKey]),
        facet.ids,
      ])
    );
    return {
      rows: [...rows].sort((a, b) => a[1].localeCompare(b[1])),
      columns: [...columns].sort((a, b) => a[1].localeCompare(b[1])),
      grid,
    };
  }, [facetData]);

  // Calculate cell dimensions based on the number of rows and columns
  const cellWidth = Math.max(220, (width - 90) / Math.max(1, columns.length)); // +1 for the row headers
  const cellHeight = Math.max(160, (height - 32) / Math.max(1, rows.length)); // +1 for the column headers

  return (
    <div className="w-full h-full overflow-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            {/* Top-left empty cell */}
            <th className="border border-border/50 px-2 py-1 bg-muted/30 font-medium">
              {rowVariable} / {columnVariable}
            </th>

            {/* Column headers */}
            {columns.map(([col, colLabel]) => (
              <th
                key={col}
                className="border border-border/50 px-2 py-1 bg-muted/30 font-medium"
              >
                {colLabel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([row, rowLabel]) => (
            <tr key={row}>
              {/* Row header */}
              <th className="border border-border/50 px-2 py-1 bg-muted/30 font-medium text-left">
                {rowLabel}
              </th>

              {/* Facet cells */}
              {columns.map(([col]) => (
                <td key={col} className="border border-border/50 p-0">
                  <div
                    style={{
                      width: cellWidth,
                      height: cellHeight,
                    }}
                  >
                    {(grid.get(JSON.stringify([row, col])) ?? []).length > 0 ? (
                      <ChartRenderer
                        settings={settings}
                        width={cellWidth}
                        height={cellHeight}
                        facetIds={grid.get(JSON.stringify([row, col])) ?? []}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No data
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
