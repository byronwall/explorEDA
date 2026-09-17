import { useMemo } from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useDataLayer } from "@/providers/DataLayerProvider";

import { DataTableSettings } from "./definition";
import { DataTableRow, getFilteredRows } from "./filteredRows";
import type { datum } from "@/types/ChartTypes";

interface DataTableBodyProps {
  settings: DataTableSettings;
  rows?: DataTableRow[];
  scrollTop?: number;
  viewportHeight?: number;
}

// Helper function to check if a value is numeric
function isNumeric(value: datum): boolean {
  if (typeof value === "number") {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

// Helper function to compare values with natural sort
function compareValues(a: datum, b: datum): number {
  // Handle null/undefined values
  if (a === null || a === undefined) {
    return 1;
  }
  if (b === null || b === undefined) {
    return -1;
  }
  if (a === b) {
    return 0;
  }

  // Convert to strings for comparison if not numeric
  const aStr = String(a);
  const bStr = String(b);

  // If both values are numeric, compare as numbers
  if (isNumeric(a) && isNumeric(b)) {
    return Number(a) - Number(b);
  }

  // For strings, use localeCompare for natural sort
  return aStr.localeCompare(bStr);
}

// Helper function to check if a row matches the global search
export function DataTableBody({
  settings,
  rows,
  scrollTop = 0,
  viewportHeight = 400,
}: DataTableBodyProps) {
  const { sortBy, sortDirection } = settings;
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));

  const filteredByColumns = useMemo(
    () => rows ?? getFilteredRows(data, liveItems, settings),
    [rows, data, liveItems, settings]
  );

  // Sort data if sortBy is set
  const sortedData = useMemo(
    () =>
      sortBy
        ? [...filteredByColumns].sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            const comparison = compareValues(aValue, bValue);
            return sortDirection === "asc" ? comparison : -comparison;
          })
        : filteredByColumns,
    [filteredByColumns, sortBy, sortDirection]
  );

  // Fixed-height rows keep the scroll position stable. Render one viewport plus overscan.
  const start = Math.min(
    Math.max(0, Math.floor((scrollTop - 36) / 30) - 6),
    Math.max(0, sortedData.length - 1)
  );
  const end = Math.min(
    sortedData.length,
    start + Math.ceil(viewportHeight / 30) + 12
  );
  const visibleRows = sortedData.slice(start, end);
  const spacer = (count: number, key: string) =>
    count > 0 && (
      <tr key={key} aria-hidden="true" className="eda-table-spacer">
        <td
          colSpan={settings.columns.length}
          style={{ height: count * 30, padding: 0, border: 0 }}
        />
      </tr>
    );

  return (
    <TableBody>
      {spacer(start, "before")}
      {visibleRows.length > 0 ? (
        visibleRows.map((row, index) => (
          <TableRow key={String(row.__ID)} aria-rowindex={start + index + 2}>
            {settings.columns.map((column, index) => (
              <TableCell
                key={column.id}
                className={
                  index === 0 ? "sticky left-0 z-10 bg-background" : ""
                }
                style={{
                  width: column.width,
                  textAlign:
                    typeof row[column.field] === "number" ? "right" : "left",
                }}
                title={String(row[column.field] ?? "Missing")}
              >
                {row[column.field] == null
                  ? "—"
                  : typeof row[column.field] === "boolean"
                    ? row[column.field]
                      ? "Yes"
                      : "No"
                    : row[column.field]}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={settings.columns.length} className="text-center">
            No rows match the current filters.
          </TableCell>
        </TableRow>
      )}
      {spacer(sortedData.length - end, "after")}
    </TableBody>
  );
}
