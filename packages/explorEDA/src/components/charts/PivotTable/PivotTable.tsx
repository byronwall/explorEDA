import { categoryIncludes, categoryKey } from "@/lib/categories";
import { calculatePivotData } from "@/components/charts/PivotTable/utils/calculations";
import { cn } from "@/lib/utils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { Filter, ValueFilter, datum } from "@/types/FilterTypes";
import { Filter as FilterIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useGetLiveIds } from "../useGetLiveData";
import { PivotCell, PivotHeader, PivotRow, CellKey } from "./types";
import { applyFilter } from "@/hooks/applyFilter";
import { PivotTableSettings } from "./definition";
import { getChartSummary } from "../chartAccessibility";

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
    const liveIds = facetIds
      ? allLiveIds.filter((id) => facetIds.includes(id))
      : allLiveIds;

    // Gather all required fields
    const allFields = new Set([
      ...settings.rowFields,
      settings.columnField,
      ...settings.valueFields.map((f) => f.field),
    ]);

    // Get column data for each field
    const fieldData: Record<string, Record<string | number, datum>> = {};
    allFields.forEach((field) => {
      fieldData[field] = getColumnData(field);
    });

    // Create data array for pivot calculations
    const data = liveIds.map((id: string | number) => {
      const row: Record<string, datum> = {};
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
          categoryIncludes(f.values, value)
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
          values: [value],
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
        rowFieldFilters.every(
          ({ header, filters }) =>
            filters.length === 0 ||
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

  const filterButton = (header: PivotHeader) => (
    <button
      type="button"
      className="eda-pivot-filter"
      aria-label={`Filter ${header.field} by ${header.label}`}
      aria-pressed={isValueFiltered(header.field, header.value)}
      onClick={() => handleFilterClick(header.field, header.value)}
      title={header.label}
    >
      <span>{header.label}</span>
      <FilterIcon aria-hidden="true" />
    </button>
  );
  const valueColumnCount =
    settings.valueFields.length *
    (settings.columnField ? pivotData.headers.length : 1);

  return (
    <div
      className="w-full min-h-0 overflow-auto"
      style={{ height }}
      tabIndex={0}
      aria-label="Pivot table, scroll to see more"
    >
      <table
        className="eda-pivot-table"
        style={{
          minWidth: settings.rowFields.length * 140 + valueColumnCount * 112,
        }}
      >
        <caption className="sr-only">{getChartSummary(settings)}</caption>
        <colgroup>
          {settings.rowFields.map((field) => (
            <col key={field} style={{ width: 140 }} />
          ))}
          {Array.from({ length: valueColumnCount }, (_, index) => (
            <col key={index} />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-30">
          <tr>
            {settings.rowFields.map((field, index) => (
              <th
                key={field}
                scope="col"
                rowSpan={settings.columnField ? 2 : 1}
                className="eda-pivot-row-label"
                style={{ left: index * 140, zIndex: 20 - index }}
                title={field}
              >
                {field}
              </th>
            ))}
            {settings.columnField
              ? pivotData.headers.map((header) => (
                  <th
                    key={`${header.field}-${header.value}`}
                    scope="colgroup"
                    colSpan={settings.valueFields.length}
                  >
                    {filterButton(header)}
                  </th>
                ))
              : settings.valueFields.map((valueField) => (
                  <th
                    key={valueField.field}
                    scope="col"
                    title={
                      valueField.label ||
                      `${valueField.field} (${valueField.aggregation})`
                    }
                  >
                    {valueField.label ||
                      `${valueField.field} (${valueField.aggregation})`}
                  </th>
                ))}
          </tr>
          {settings.columnField && (
            <tr>
              {pivotData.headers.flatMap((header) =>
                settings.valueFields.map((valueField) => (
                  <th
                    key={`${header.field}-${header.value}-${valueField.field}`}
                    scope="col"
                    title={
                      valueField.label ||
                      `${valueField.field} (${valueField.aggregation})`
                    }
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
            <tr
              key={JSON.stringify(
                row.keys.map((key) => [key.field, categoryKey(key.value)])
              )}
            >
              {row.headers.map((header, index) => (
                <th
                  key={`${header.field}-${header.value}`}
                  scope="row"
                  className="eda-pivot-row-label"
                  style={{ left: index * 140, zIndex: 10 - index }}
                >
                  {filterButton(header)}
                </th>
              ))}
              {row.cells.map((cell: PivotCell) => (
                <td
                  key={`${cell.key.columnField}-${cell.key.columnValue}-${cell.key.valueField}`}
                  className={cn(
                    isCellFiltered(row.headers, cell.key) && "is-selected"
                  )}
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
          {pivotData.rows.length === 0 && (
            <tr>
              <td
                colSpan={settings.rowFields.length + valueColumnCount}
                className="text-muted-foreground"
              >
                No matching rows
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
