import { calculatePivotData } from "@/components/charts/PivotTable/utils/calculations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { Filter, ValueFilter, datum } from "@/types/FilterTypes";
import { Filter as FilterIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useGetLiveIds } from "../useGetLiveData";
import { PivotCell, PivotHeader, PivotRow, CellKey } from "./types";
import { applyFilter } from "@/hooks/applyFilter";
import { PivotTableSettings } from "./definition";

type PivotTableProps = BaseChartProps & {
  settings: PivotTableSettings;
};

export function PivotTable({ settings, height, facetIds }: PivotTableProps) {
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const updateChart = useDataLayer((state) => state.updateChart);

  const allLiveIds = useGetLiveIds(settings);

  // Get all required field data
  const pivotData = useMemo(() => {
    // Use facetIds if provided, otherwise use liveItems
    const liveIds = facetIds || allLiveIds;

    // Gather all required fields
    const allFields = new Set([
      ...settings.rowFields,
      settings.columnField,
      ...settings.valueFields.map((f) => f.field),
    ]);

    // Get column data for each field
    const fieldData: Record<string, Record<string | number, any>> = {};
    allFields.forEach((field) => {
      fieldData[field] = getColumnData(field);
    });

    // Create data array for pivot calculations
    const data = liveIds.map((id: string | number) => {
      const row: Record<string, any> = {};
      allFields.forEach((field) => {
        row[field] = fieldData[field]?.[id];
      });
      return row;
    });

    return calculatePivotData(data, settings);
  }, [facetIds, allLiveIds, settings, getColumnData]);

  const handleFilterClick = useCallback(
    (field: string, value: datum) => {
      const currentFilters = settings.filters || [];
      const existingFilterIndex = currentFilters.findIndex(
        (f): f is ValueFilter =>
          f.type === "value" &&
          f.field === field &&
          f.values.includes(value as string | number)
      );

      let newFilters: Filter[];
      if (existingFilterIndex >= 0) {
        // Remove the filter if it exists
        newFilters = [
          ...currentFilters.slice(0, existingFilterIndex),
          ...currentFilters.slice(existingFilterIndex + 1),
        ];
      } else {
        // Add new filter
        const newFilter: ValueFilter = {
          type: "value",
          field,
          values: [value as string | number],
        };
        newFilters = [...currentFilters, newFilter];
      }

      updateChart(settings.id, {
        ...settings,
        filters: newFilters,
      });
    },
    [settings, updateChart]
  );

  const handleCellClick = useCallback((cell: PivotCell) => {
    if (!cell.sourceRows) {
      return;
    }

    // TODO: Implement drill-down modal with source rows
    toast(`Showing details for ${cell.value} (${cell.sourceRows.length} rows)`);
  }, []);

  const isValueFiltered = useCallback(
    (field: string, value: datum) => {
      const currentFilters = settings.filters || [];
      const fieldFilters = currentFilters.filter((f) => f.field === field);

      // If no filters for this field, return false
      if (fieldFilters.length === 0) {
        return false;
      }

      // Check if the value matches any of the filters for this field
      return fieldFilters.some((filter) => applyFilter(value, filter));
    },
    [settings.filters]
  );

  const isCellFiltered = useCallback(
    (rowHeaders: PivotHeader[], cellKey: CellKey) => {
      const currentFilters = settings.filters || [];

      if (currentFilters.length === 0) {
        return false;
      }

      // Get all row field filters
      const rowFieldFilters = rowHeaders.map((header) => {
        const fieldFilters = currentFilters.filter(
          (f) => f.field === header.field
        );
        return {
          header,
          filters: fieldFilters,
        };
      });

      // Check if any row header matches its field's filters
      const hasRowFilters = rowFieldFilters.some((rf) => rf.filters.length > 0);
      const rowMatches =
        !hasRowFilters ||
        rowFieldFilters.some(
          ({ header, filters }) =>
            filters.length > 0 &&
            filters.some((filter) => applyFilter(header.value, filter))
        );

      // Get column filters
      const columnFilters = currentFilters.filter(
        (f) => f.field === cellKey.columnField
      );

      // Check if column matches its filters
      const hasColumnFilters = columnFilters.length > 0;
      const columnMatches =
        !hasColumnFilters ||
        columnFilters.some((filter) =>
          applyFilter(cellKey.columnValue, filter)
        );

      // Cell is highlighted if both row and column conditions are met
      return rowMatches && columnMatches;
    },
    [settings.filters]
  );

  const renderHeader = useCallback(
    (header: PivotHeader) => {
      const isFiltered = isValueFiltered(header.field, header.value);
      return (
        <th
          key={`${header.field}-${header.value}`}
          colSpan={settings.valueFields.length}
          className={cn(
            "border p-2",
            header.depth === 0 && "font-semibold",
            isFiltered ? "bg-accent/50" : "bg-muted/50"
          )}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleFilterClick(header.field, header.value)}
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
            <span>{header.label}</span>
          </div>
        </th>
      );
    },
    [handleFilterClick, settings.valueFields.length, isValueFiltered]
  );

  // Calculate the number of header rows needed

  return (
    <div
      className={cn("w-full h-full border rounded-md flex flex-col p-4")}
      style={{ height }}
    >
      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse relative">
          <thead className="sticky top-0 bg-background z-40">
            {/* First row: Row field headers and column field headers */}
            <tr>
              {/* Row field headers */}
              {settings.rowFields.map((field, i) => {
                const leftPosition = i * 150; // Match the body's width
                return (
                  <th
                    key={field}
                    rowSpan={settings.columnField ? 2 : 1}
                    className={cn(
                      "border p-2 bg-muted/50 font-semibold sticky",
                      // Add z-index that decreases as we go right to ensure proper layering
                      `z-[${30 - i}]` // Higher z-index than body to stay on top
                    )}
                    style={{
                      left: `${leftPosition}px`,
                      minWidth: "150px",
                      maxWidth: "150px",
                    }}
                  >
                    {field}
                  </th>
                );
              })}

              {/* Column headers or value fields if no columns */}
              {!settings.columnField
                ? settings.valueFields.map((valueField) => (
                    <th
                      key={valueField.field}
                      className="border p-2 bg-muted/50 font-semibold"
                    >
                      {valueField.label ||
                        `${valueField.field} (${valueField.aggregation})`}
                    </th>
                  ))
                : pivotData.headers.map(renderHeader)}
            </tr>

            {/* Value field headers when column field exists */}
            {settings.columnField && (
              <tr>
                {pivotData.headers.map((header) =>
                  settings.valueFields.map((valueField) => (
                    <th
                      key={`${header.field}-${header.value}-${valueField.field}`}
                      className="border p-2 bg-muted/50"
                    >
                      {valueField.label ||
                        `${valueField.field} (${valueField.aggregation})`}
                    </th>
                  ))
                )}
              </tr>
            )}
          </thead>
          <tbody>
            {pivotData.rows.map((row: PivotRow) => (
              <tr key={row.keys.map((k) => `${k.field}-${k.value}`).join(":")}>
                {row.headers.map((header: PivotHeader, i) => {
                  // Calculate cumulative width of previous headers
                  const leftPosition = i * 150; // Using fixed width for consistency
                  const isFiltered = isValueFiltered(
                    header.field,
                    header.value
                  );
                  return (
                    <th
                      key={`${header.field}-${header.value}`}
                      className={cn(
                        "border p-2 text-left font-normal sticky",
                        isFiltered ? "bg-accent/50" : "bg-background",
                        // Add z-index that decreases as we go right to ensure proper layering
                        `z-[${20 - i}]`
                      )}
                      style={{
                        left: `${leftPosition}px`,
                        minWidth: "150px", // Fixed width for consistency
                        maxWidth: "150px",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            handleFilterClick(header.field, header.value)
                          }
                        >
                          <FilterIcon className="h-4 w-4" />
                        </Button>
                        <span>{header.label}</span>
                      </div>
                    </th>
                  );
                })}
                {row.cells.map((cell: PivotCell) => (
                  <td
                    key={`${cell.key.columnField}-${cell.key.columnValue}${cell.key.valueField ? `-${cell.key.valueField}` : ""}`}
                    className={cn(
                      "border p-2 text-right",
                      cell.sourceRows && "cursor-pointer hover:bg-muted/20",
                      isCellFiltered(row.headers, cell.key) && "bg-yellow-50"
                    )}
                    onClick={() => cell.sourceRows && handleCellClick(cell)}
                  >
                    {typeof cell.value === "number"
                      ? cell.value.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
