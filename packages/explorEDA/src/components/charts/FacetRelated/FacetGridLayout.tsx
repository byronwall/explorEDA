import { ChartSettings } from "@/types/ChartTypes";
import { useMemo } from "react";
import { ChartRenderer } from "../ChartRenderer";
import { FacetData } from "./FacetContainer";
import { IdType } from "@/providers/DataLayerProvider";

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
  // Extract unique row and column values
  const { rows, columns, grid } = useMemo(() => {
    const rows = Array.from(new Set(facetData.map((d) => d.rowValue))).sort();
    const columns = Array.from(
      new Set(
        facetData
          .filter((d) => d.columnValue !== null)
          .map((d) => d.columnValue as string)
      )
    ).sort();

    // Create a grid of facets
    const grid: Record<string, Record<string, IdType[]>> = {};

    rows.forEach((row) => {
      const rowGrid: Record<string, IdType[]> = (grid[row] = {});
      columns.forEach((col) => {
        rowGrid[col] = [];
      });
    });

    facetData.forEach((facet) => {
      if (facet.rowValue && facet.columnValue) {
        const rowGrid = grid[facet.rowValue];
        if (rowGrid) {
          rowGrid[facet.columnValue] = facet.ids;
        }
      }
    });

    return { rows, columns, grid };
  }, [facetData]);

  // Calculate cell dimensions based on the number of rows and columns
  const cellWidth = width / (columns.length + 1); // +1 for the row headers
  const cellHeight = height / (rows.length + 1); // +1 for the column headers

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full h-full border-collapse">
        <thead>
          <tr>
            {/* Top-left empty cell */}
            <th className="border p-2 bg-muted/50 font-semibold">
              {rowVariable} / {columnVariable}
            </th>

            {/* Column headers */}
            {columns.map((col) => (
              <th key={col} className="border p-2 bg-muted/50 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              {/* Row header */}
              <th className="border p-2 bg-muted/50 font-semibold text-left">
                {row}
              </th>

              {/* Facet cells */}
              {columns.map((col) => (
                <td key={`${row}-${col}`} className="border p-0">
                  <div
                    style={{
                      width: cellWidth,
                      height: cellHeight,
                    }}
                  >
                    {(grid[row]?.[col] ?? []).length > 0 ? (
                      <ChartRenderer
                        settings={settings}
                        width={cellWidth}
                        height={cellHeight}
                        facetIds={grid[row]?.[col] ?? []}
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
