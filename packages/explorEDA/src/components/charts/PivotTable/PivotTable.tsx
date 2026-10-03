import { ActionTooltip } from "@/components/ui/tooltip";
import {
  categoryEqual,
  categoryIncludes,
  categoryKey,
} from "@/lib/categories";
import { planHeatScale, type HeatScale } from "../heatScale";
import {
  aggregationUnits,
  calculatePivotData,
} from "@/components/charts/PivotTable/utils/calculations";
import { cn } from "@/lib/utils";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { BaseChartProps } from "@/types/ChartTypes";
import { Filter, ValueFilter, datum } from "@/types/FilterTypes";
import { Filter as FilterIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetLiveIds } from "../useGetLiveData";
import { PivotCell, PivotHeader, PivotRow, CellKey } from "./types";
import { applyFilter } from "@/hooks/applyFilter";
import { PivotTableSettings } from "./definition";
import { getChartSummary } from "../chartAccessibility";
import {
  formatFieldValue as formatWithSettings,
  getFieldName,
  hasFieldDisplayFormat,
} from "@/lib/fieldSettings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PivotTableProps = BaseChartProps & {
  settings: PivotTableSettings;
};

type SelectedCell = { cell: PivotCell; rowHeaders: PivotHeader[] };

/** Aggregates whose values compare by size, so shading them reads. */
const shadable = new Set([
  "count",
  "countUnique",
  "sum",
  "avg",
  "min",
  "max",
  "median",
  "stddev",
  "variance",
]);

/**
 * A light wash of the heat color, layered over the row's own background so
 * hover and selection still show. It stays faint enough for the text on top.
 */
function cellTint(position: number, kind: HeatScale["kind"]) {
  const end =
    kind === "diverging" && position < 0
      ? "--eda-heat-negative"
      : "--eda-heat-high";
  const strength = Math.round(4 + Math.abs(position) * 28);
  const color = `color-mix(in oklab, var(${end}) ${strength}%, transparent)`;
  return `linear-gradient(${color}, ${color})`;
}

function displayValue(value: datum): string {
  if (value === undefined || value === null || value === "") {
    return "Missing";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  return String(value);
}

function displayExactValue(value: datum): string {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  return String(value);
}

function displayCellValue(cell: PivotCell): string {
  if (cell.status === "empty") {
    return "No rows";
  }
  if (cell.status === "error") {
    return "Conflict";
  }
  if (cell.status === "invalid") {
    return "No valid numbers";
  }
  return displayValue(cell.value);
}

function cellName(cell: PivotCell, rowHeaders: PivotHeader[]): string {
  const rowLabel = rowHeaders.map((header) => header.label).join(" / ");
  const columnLabel = cell.key.isTotal
    ? "Total"
    : displayValue(cell.key.columnValue);
  return [rowLabel, columnLabel, cell.key.valueField]
    .filter(Boolean)
    .join(" · ");
}

export function PivotTable({
  settings,
  width,
  height,
  facetIds,
}: PivotTableProps) {
  // Narrow panels give the grouping columns less room, so values stay in view.
  const narrow = width > 0 && width < 520;
  const labelWidth = narrow ? 96 : 140;
  const valueWidth = narrow ? 76 : 96;
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const updateChart = useDataLayer((state) => state.updateChart);
  void fieldSettings;

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
      const row: Record<string, datum> & { __ID: string | number } = {
        __ID: id,
      };
      allFields.forEach((field) => {
        row[field] = fieldData[field]?.[id];
      });
      return row;
    });

    return calculatePivotData(data, settings);
  }, [facetIds, allLiveIds, settings, getColumnData]);

  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const [contributorPage, setContributorPage] = useState(0);
  useEffect(() => {
    setSelectedCell(null);
  }, [pivotData, settings]);
  useEffect(() => {
    setContributorPage(0);
  }, [selectedCell]);

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
        (f) => !cellKey.isTotal && f.field === cellKey.columnField
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
    >
      <span>
        {hasFieldDisplayFormat(fieldSettings[header.field])
          ? (formatFieldValue?.(header.field, header.value) ?? header.label)
          : header.label}
      </span>
      <FilterIcon aria-hidden="true" />
    </button>
  );

  const valueLabel = (field: string, aggregation: string, label?: string) =>
    label ||
    `${
      aggregationUnits(aggregation) === "measure"
        ? (getFieldLabel?.(field) ?? field)
        : getFieldName(field, fieldSettings[field])
    } (${aggregation})`;
  const displayPivotCell = (cell: PivotCell) => {
    if (cell.status !== "ok" || cell.value == null) return displayCellValue(cell);
    const units = aggregationUnits(cell.aggregation);
    if (units === "count" && typeof cell.value === "number") {
      return cell.value.toLocaleString("en-US");
    }
    if (units === "none" && typeof cell.value === "number") {
      // Variance is in squared units, so it keeps precision but not the unit.
      return formatWithSettings(cell.key.valueField!, cell.value, {
        precision: fieldSettings[cell.key.valueField!]?.precision,
      });
    }
    return (
      formatFieldValue?.(cell.key.valueField!, cell.value) ??
      displayCellValue(cell)
    );
  };

  const selectedCellName = selectedCell
    ? cellName(selectedCell.cell, selectedCell.rowHeaders)
    : "";
  const contributorPageSize = 50;
  const contributorCount = selectedCell?.cell.contributors.length ?? 0;
  const contributorPageCount = Math.max(
    1,
    Math.ceil(contributorCount / contributorPageSize)
  );
  const contributorStart = contributorPage * contributorPageSize;
  const visibleContributors =
    selectedCell?.cell.contributors.slice(
      contributorStart,
      contributorStart + contributorPageSize
    ) ?? [];

  const valueCount = settings.valueFields.length;
  const columnCount = settings.columnField ? pivotData.headers.length : 1;
  const hasTotalColumn = pivotData.rows.some((row) => row.total);
  const valueColumnCount =
    valueCount * columnCount + (hasTotalColumn ? valueCount : 0);
  const headerRowCount = settings.columnField ? (valueCount > 1 ? 3 : 2) : 1;

  // Each measure gets its own scale, so a count and a median both read.
  const shading = useMemo(() => {
    if (settings.shadeCells === false) return [];
    return settings.valueFields.map((valueField, valueIndex) => {
      if (!shadable.has(valueField.aggregation)) return undefined;
      const values = pivotData.rows.flatMap((row) =>
        row.cells
          .filter(
            (cell, index) =>
              index % valueCount === valueIndex &&
              cell.status === "ok" &&
              typeof cell.value === "number" &&
              Number.isFinite(cell.value)
          )
          .map((cell) => cell.value as number)
      );
      return values.length > 1 ? planHeatScale(values) : undefined;
    });
  }, [pivotData, settings.shadeCells, settings.valueFields, valueCount]);

  const renderCell = (
    cell: PivotCell,
    index: number,
    rowHeaders: PivotHeader[],
    total?: "row" | "column"
  ) => {
    const scale = total ? undefined : shading[index % valueCount];
    const tint =
      scale && cell.status === "ok" && typeof cell.value === "number"
        ? cellTint(scale.position(cell.value), scale.kind)
        : undefined;
    const name = cellName(cell, rowHeaders);
    return (
      <td
        key={`${cell.key.isTotal ? "total" : cell.key.columnField}-${categoryKey(cell.key.columnValue)}-${cell.key.valueField}`}
        className={cn(
          total && "eda-pivot-total",
          total === "column" && index === 0 && "eda-pivot-total-start",
          !total && isCellFiltered(rowHeaders, cell.key) && "is-selected",
          cell.status !== "ok" && "eda-pivot-note"
        )}
        style={tint ? { backgroundImage: tint } : undefined}
      >
        <ActionTooltip
          content={
            <>
              {cell.error ?? name}
              <br />
              Click to inspect the source rows.
            </>
          }
        >
          <button
            type="button"
            className="eda-pivot-cell"
            aria-haspopup="dialog"
            aria-label={`${displayPivotCell(cell)}, inspect ${name}`}
            onClick={(event) => {
              lastTrigger.current = event.currentTarget;
              setSelectedCell({ cell, rowHeaders });
            }}
          >
            {displayPivotCell(cell)}
          </button>
        </ActionTooltip>
      </td>
    );
  };

  const valueHeaders = (keyPrefix: string) =>
    settings.valueFields.map((valueField) => (
      <th key={`${keyPrefix}-${valueField.field}-${valueField.aggregation}`} scope="col">
        {valueLabel(valueField.field, valueField.aggregation, valueField.label)}
      </th>
    ));
  const singleValueLabel =
    valueCount === 1
      ? valueLabel(
          settings.valueFields[0]!.field,
          settings.valueFields[0]!.aggregation,
          settings.valueFields[0]!.label
        )
      : undefined;
  const totalRowHeaders: PivotHeader[] = [
    { label: "All rows", field: "", value: null, span: 1, depth: 0 },
  ];

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
          minWidth: settings.rowFields.length * labelWidth + valueColumnCount * valueWidth,
        }}
      >
        <caption className="sr-only">{getChartSummary(settings)}</caption>
        <colgroup>
          {settings.rowFields.map((field) => (
            <col key={field} style={{ width: labelWidth }} />
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
                rowSpan={headerRowCount}
                className="eda-pivot-row-label"
                style={{ left: index * labelWidth, zIndex: 20 - index }}
              >
                {getFieldLabel?.(field) ?? field}
              </th>
            ))}
            {settings.columnField ? (
              <>
                {/* The column field names the values below it, as an axis title. */}
                <th
                  scope="colgroup"
                  colSpan={valueCount * columnCount}
                  className="eda-pivot-column-field"
                >
                  <span className="eda-pivot-column-name">
                    {getFieldLabel?.(settings.columnField) ??
                      settings.columnField}
                  </span>
                  {singleValueLabel && (
                    <span className="eda-pivot-measure">
                      {singleValueLabel}
                    </span>
                  )}
                </th>
                {hasTotalColumn && (
                  <th
                    scope="colgroup"
                    colSpan={valueCount}
                    rowSpan={2}
                    className="eda-pivot-total-head"
                  >
                    Total
                  </th>
                )}
              </>
            ) : (
              valueHeaders("value")
            )}
          </tr>
          {settings.columnField && (
            <tr>
              {pivotData.headers.map((header) => (
                <th
                  key={`${header.field}-${categoryKey(header.value)}`}
                  scope={valueCount > 1 ? "colgroup" : "col"}
                  colSpan={valueCount}
                >
                  {filterButton(header)}
                </th>
              ))}
            </tr>
          )}
          {settings.columnField && valueCount > 1 && (
            <tr>
              {pivotData.headers.flatMap((header) =>
                valueHeaders(`${header.field}-${categoryKey(header.value)}`)
              )}
              {hasTotalColumn && valueHeaders("total")}
            </tr>
          )}
        </thead>
        <tbody>
          {pivotData.rows.map((row: PivotRow, rowIndex) => {
            const previous = pivotData.rows[rowIndex - 1];
            // Outer group values print once, at the top of their group.
            const repeats = row.keys.map(
              (_, index) =>
                index < row.keys.length - 1 &&
                previous !== undefined &&
                row.keys
                  .slice(0, index + 1)
                  .every((key, at) =>
                    categoryEqual(key.value, previous.keys[at]!.value)
                  )
            );
            const groupStart =
              row.keys.length > 1 && rowIndex > 0 && !repeats[0];
            return (
              <tr
                key={JSON.stringify(
                  row.keys.map((key) => [key.field, categoryKey(key.value)])
                )}
                className={cn(groupStart && "eda-pivot-group-start")}
              >
                {row.headers.map((header, index) => (
                  <th
                    key={`${header.field}-${categoryKey(header.value)}`}
                    scope="row"
                    className={cn(
                      "eda-pivot-row-label",
                      repeats[index] && "is-repeat"
                    )}
                    style={{ left: index * labelWidth, zIndex: 10 - index }}
                  >
                    {filterButton(header)}
                  </th>
                ))}
                {row.cells.map((cell, index) =>
                  renderCell(cell, index, row.headers)
                )}
                {row.total?.map((cell, index) =>
                  renderCell(cell, index, row.headers, "column")
                )}
              </tr>
            );
          })}
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
        {pivotData.totals && (
          <tfoot>
            <tr>
              {settings.rowFields.length > 0 && (
                <th
                  scope="row"
                  colSpan={settings.rowFields.length}
                  className="eda-pivot-row-label"
                  style={{ left: 0 }}
                >
                  Total
                </th>
              )}
              {pivotData.totals.cells.map((cell, index) =>
                renderCell(cell, index, totalRowHeaders, "row")
              )}
              {pivotData.totals.total?.map((cell, index) =>
                renderCell(cell, index, totalRowHeaders, "column")
              )}
            </tr>
          </tfoot>
        )}
      </table>

      <Dialog
        open={selectedCell !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCell(null);
            window.setTimeout(() => lastTrigger.current?.focus(), 0);
          }
        }}
      >
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          {selectedCell && (
            <>
              <DialogHeader>
                <DialogTitle>Inspect {selectedCellName}</DialogTitle>
                <DialogDescription>
                  This cell uses the current filtered rows and the same
                  aggregation as the table.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <div className="text-muted-foreground">Aggregation</div>
                  <div>{selectedCell.cell.aggregation}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Result</div>
                  <div>{displayPivotCell(selectedCell.cell)}</div>
                  {selectedCell.cell.status === "ok" &&
                    typeof selectedCell.cell.value === "number" &&
                    displayPivotCell(selectedCell.cell) !==
                      String(selectedCell.cell.value) && (
                      <div className="text-xs text-muted-foreground tabular-nums">
                        Exact {String(selectedCell.cell.value)}
                      </div>
                    )}
                </div>
                <div>
                  <div className="text-muted-foreground">Contributors</div>
                  <div>{selectedCell.cell.contributors.length}</div>
                </div>
              </div>
              {selectedCell.cell.error && (
                <p
                  role="alert"
                  className="rounded border border-destructive/50 p-2 text-sm text-destructive"
                >
                  {selectedCell.cell.error}. The other pivot cells remain
                  available.
                </p>
              )}
              {selectedCell.cell.numericExclusions.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedCell.cell.numericExclusions.length} numeric value(s)
                  excluded; the result uses the{" "}
                  {
                    selectedCell.cell.contributors.filter(
                      (contributor) => contributor.included
                    ).length
                  }{" "}
                  valid value(s).
                </p>
              )}
              <div className="overflow-auto rounded border">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Pivot cell contributors</caption>
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2" scope="col">
                        Source row ID (zero-based)
                      </th>
                      <th className="p-2" scope="col">
                        Grouping keys
                      </th>
                      <th className="p-2" scope="col">
                        Input
                      </th>
                      <th className="p-2" scope="col">
                        Used
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleContributors.map((contributor, index) => (
                      <tr
                        key={`${contributor.sourceId ?? "unknown"}-${index}`}
                        className="border-t"
                      >
                        <td className="p-2">
                          {contributor.sourceId ?? "Unknown"}
                        </td>
                        <td className="p-2">
                          {contributor.groupingKeys
                            .map(
                              (key) => `${key.field}=${displayValue(key.value)}`
                            )
                            .join(", ")}
                        </td>
                        <td className="p-2">
                          {displayExactValue(contributor.input)}
                        </td>
                        <td className="p-2">
                          {contributor.included
                            ? "Yes"
                            : contributor.exclusionReason || "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {contributorCount === 0 && (
                  <p className="p-3 text-sm text-muted-foreground">
                    No rows match this cell.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>
                  Showing {contributorCount === 0 ? 0 : contributorStart + 1}–
                  {Math.min(
                    contributorStart + contributorPageSize,
                    contributorCount
                  )}{" "}
                  of {contributorCount} source rows
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={contributorPage === 0}
                    onClick={() => setContributorPage((page) => page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={contributorPage >= contributorPageCount - 1}
                    onClick={() => setContributorPage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
