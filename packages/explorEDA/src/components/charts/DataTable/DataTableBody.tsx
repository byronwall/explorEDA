import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useDataLayer } from "@/providers/DataLayerProvider";

import { DataTableSettings } from "./definition";
import { getFilteredRows } from "./filteredRows";

interface DataTableBodyProps {
  settings: DataTableSettings;
}

// Helper function to check if a value is numeric
function isNumeric(value: any): boolean {
  if (typeof value === "number") {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

// Helper function to compare values with natural sort
function compareValues(a: any, b: any): number {
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
export function DataTableBody({ settings }: DataTableBodyProps) {
  const {
    pageSize,
    currentPage,
    sortBy,
    sortDirection,
  } = settings;
  const data = useDataLayer((state) => state.data);
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));

  const filteredByColumns = getFilteredRows(data, liveItems, settings);

  // Sort data if sortBy is set
  const sortedData = sortBy
    ? [...filteredByColumns].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        const comparison = compareValues(aValue, bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      })
    : filteredByColumns;

  // Calculate pagination
  // Get paginated data
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedData = sortedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <TableBody>
      {paginatedData.length > 0 ? (
        paginatedData.map((row) => (
          <TableRow key={String(row.__ID)}>
            {settings.columns.map((column) => (
              <TableCell key={column.id} style={{ width: column.width }}>
                {row[column.field]}
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
    </TableBody>
  );
}
