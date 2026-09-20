import { CalculatedFieldBadge } from "@/components/calculations/CalculatedFieldBadge";
import { useMemo } from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useDataLayer } from "@/providers/DataLayerProvider";

import { DataTableSettings } from "./definition";
import { DataTableRow, getFilteredRows } from "./filteredRows";

interface DataTableBodyProps {
  settings: DataTableSettings;
  rows?: DataTableRow[];
  scrollTop?: number;
  viewportHeight?: number;
}

// Helper function to check if a row matches the global search
export function DataTableBody({
  settings,
  rows,
  scrollTop = 0,
  viewportHeight = 400,
}: DataTableBodyProps) {
  const calculations = useDataLayer((state) => state.calculations) ?? [];
  const manager = useDataLayer((state) => state.calculationManager);
  const data = useDataLayer((state) => state.data);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const format =
    formatFieldValue ?? ((_: string, value: unknown) => String(value ?? "—"));
  void fieldSettings;
  const liveItems = useDataLayer((state) => state.getLiveItems(settings));

  const filteredByColumns = useMemo(
    () => rows ?? getFilteredRows(data, liveItems, settings),
    [rows, data, liveItems, settings]
  );

  const sortedData = filteredByColumns;

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
                title={
                  manager?.getErrors(column.field).get(row.__ID) ??
                  String(row[column.field] ?? "Missing")
                }
              >
                {calculations.some(
                  (calc) => calc.resultColumnName === column.field
                ) ? (
                  <CalculatedFieldBadge field={column.field} rowId={row.__ID}>
                    {manager?.getErrors(column.field).has(row.__ID)
                      ? "Error"
                      : format(column.field, row[column.field])}
                  </CalculatedFieldBadge>
                ) : (
                  format(column.field, row[column.field])
                )}
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
