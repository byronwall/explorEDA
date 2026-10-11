import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  ChevronsLeft,
  Columns3,
  Copy,
  EyeOff,
  Filter as FilterIcon,
  FilterX,
  MoveHorizontal,
  Rows3,
} from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isMissingValue } from "@/lib/valueParsing";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { Filter } from "@/types/FilterTypes";
import { hideColumn, moveColumn, pickColumns } from "./columnOps";
import type { DataTableSettings } from "./definition";
import type { DataTableRow } from "./filteredRows";

/** Where a right-click landed: a column header, or one cell of a row. */
export type TableMenuTarget = {
  x: number;
  y: number;
  columnId: string;
  row?: DataTableRow;
};

/** The filter that keeps only the rows matching one cell's value. */
export function cellFilter(
  field: string,
  value: DataTableRow[string],
  dataType: string | undefined
): Filter {
  if (isMissingValue(value)) {
    return { type: "value", field, values: [null] };
  }
  if (dataType === "numeric" && typeof value === "number") {
    return { type: "range", field, min: value, max: value };
  }
  if (dataType === "datetime" && typeof value === "string") {
    return { type: "date-range", field, min: value, max: value };
  }
  return { type: "value", field, values: [value] };
}

function copy(text: string, message: string) {
  void navigator.clipboard
    ?.writeText(text)
    .then(() => toast(message))
    .catch(() => toast.error("Copying to the clipboard failed"));
}

/**
 * The right-click menu for a data table. A header offers that column's sort,
 * filter, position, and visibility. A cell adds copy and filters built from
 * its value.
 */
export function DataTableContextMenu({
  target,
  onClose,
  settings,
  onSettingsChange,
  onOpenFilter,
}: {
  target: TableMenuTarget | undefined;
  onClose: () => void;
  settings: DataTableSettings;
  onSettingsChange: (settings: Partial<DataTableSettings>) => void;
  onOpenFilter: (columnId: string) => void;
}) {
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles) ?? [];
  const getColumnNames = useDataLayer((state) => state.getColumnNames);
  const { columns, filters, sortBy, sortDirection } = settings;
  const index = columns.findIndex((item) => item.id === target?.columnId);
  const column = columns[index];
  if (!target || !column) return null;

  const field = column.field;
  const name = getFieldLabel ? getFieldLabel(field) : field;
  const dataType = fieldProfiles.find((item) => item.name === field)?.dataType;
  const filter = filters.find((item) => item.field === field);
  const setFilter = (next?: Filter) =>
    onSettingsChange({
      filters: [
        ...filters.filter((item) => item.field !== field),
        ...(next ? [next] : []),
      ],
    });
  const setColumns = (next: DataTableSettings["columns"]) =>
    onSettingsChange({ columns: next });
  const sorted = sortBy === field ? sortDirection : undefined;
  const allFields = (getColumnNames?.() ?? []).filter(
    (item) => item !== "__ID"
  );
  const hidden = allFields.filter(
    (item) => !columns.some((shown) => shown.field === item)
  );

  const row = target.row;
  const value = row?.[field];
  const missing = isMissingValue(value);
  const shown =
    row === undefined || missing
      ? undefined
      : formatFieldValue
        ? formatFieldValue(field, value)
        : String(value);
  const range = filter?.type === "range" ? filter : undefined;
  const rowText = (withHeader: boolean) => {
    const cells = columns.map((item) =>
      isMissingValue(row?.[item.field]) ? "" : String(row?.[item.field])
    );
    return withHeader
      ? `${columns.map((item) => item.field).join("\t")}\n${cells.join("\t")}`
      : cells.join("\t");
  };

  return (
    <DropdownMenu
      open
      modal={false}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {/* In the body, so a transformed chart panel cannot offset it. */}
      {createPortal(
        <DropdownMenuTrigger asChild>
          <span
            aria-hidden="true"
            className="eda-table-menu-anchor"
            style={{ left: target.x, top: target.y }}
          />
        </DropdownMenuTrigger>,
        document.body
      )}
      <DropdownMenuContent
        align="start"
        sideOffset={2}
        collisionPadding={12}
        // The pointer anchor has no name, so the menu names itself.
        aria-labelledby={undefined}
        aria-label={row ? `Cell in ${name}` : `Column ${name}`}
        className="eda-table-menu"
      >
        {row && (
          <>
            <DropdownMenuLabel className="truncate">
              {name}: {missing ? "missing" : shown}
            </DropdownMenuLabel>
            <DropdownMenuItem
              disabled={missing}
              onSelect={() => copy(String(value), "Value copied")}
            >
              <Copy aria-hidden="true" />
              Copy value
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => copy(rowText(false), "Row copied")}
            >
              <Rows3 aria-hidden="true" />
              Copy row
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                copy(rowText(true), "Row copied with column names")
              }
            >
              <Columns3 aria-hidden="true" />
              Copy row with column names
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setFilter(cellFilter(field, value, dataType))}
            >
              <FilterIcon aria-hidden="true" />
              {missing
                ? "Only rows missing a value"
                : "Only rows with this value"}
            </DropdownMenuItem>
            {typeof value === "number" && dataType === "numeric" && (
              <>
                <DropdownMenuItem
                  onSelect={() =>
                    setFilter({ ...range, type: "range", field, min: value })
                  }
                >
                  <ArrowUp aria-hidden="true" />
                  Only rows at or above {shown}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    setFilter({ ...range, type: "range", field, max: value })
                  }
                >
                  <ArrowDown aria-hidden="true" />
                  Only rows at or below {shown}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
        {!row && (
          <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        )}
        {!row && (
          <DropdownMenuItem onSelect={() => onOpenFilter(column.id)}>
            <FilterIcon aria-hidden="true" />
            Filter…
          </DropdownMenuItem>
        )}
        {filter && (
          <DropdownMenuItem onSelect={() => setFilter()}>
            <FilterX aria-hidden="true" />
            Clear the {name} filter
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={sorted === "asc"}
          onSelect={() =>
            onSettingsChange({ sortBy: field, sortDirection: "asc" })
          }
        >
          <ArrowUp aria-hidden="true" />
          Sort ascending
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={sorted === "desc"}
          onSelect={() =>
            onSettingsChange({ sortBy: field, sortDirection: "desc" })
          }
        >
          <ArrowDown aria-hidden="true" />
          Sort descending
        </DropdownMenuItem>
        {sortBy !== undefined && (
          <DropdownMenuItem
            onSelect={() =>
              onSettingsChange({ sortBy: undefined, sortDirection: "asc" })
            }
          >
            <ArrowUpDown aria-hidden="true" />
            Clear sort
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {!row && (
          <>
            <DropdownMenuItem
              disabled={index === 0}
              onSelect={() => setColumns(moveColumn(columns, column.id, 0))}
            >
              <ChevronsLeft aria-hidden="true" />
              Move to first
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={index === 0}
              onSelect={() =>
                setColumns(moveColumn(columns, column.id, index - 1))
              }
            >
              <ArrowLeft aria-hidden="true" />
              Move left
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={index === columns.length - 1}
              onSelect={() =>
                setColumns(moveColumn(columns, column.id, index + 2))
              }
            >
              <ArrowRight aria-hidden="true" />
              Move right
            </DropdownMenuItem>
            {column.width !== undefined && (
              <DropdownMenuItem
                onSelect={() =>
                  setColumns(
                    columns.map((item) =>
                      item.id === column.id
                        ? { id: item.id, field: item.field }
                        : item
                    )
                  )
                }
              >
                <MoveHorizontal aria-hidden="true" />
                Reset width
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuItem
          disabled={columns.length === 1}
          onSelect={() => setColumns(hideColumn(columns, column.id))}
        >
          <EyeOff aria-hidden="true" />
          Hide {row ? `the ${name} column` : "column"}
        </DropdownMenuItem>
        {!row && hidden.length > 0 && (
          <DropdownMenuItem
            onSelect={() =>
              setColumns(
                pickColumns(columns, [
                  ...columns.map((item) => item.field),
                  ...hidden,
                ])
              )
            }
          >
            <Columns3 aria-hidden="true" />
            Show{" "}
            {hidden.length === 1
              ? "1 hidden column"
              : `all ${hidden.length} hidden columns`}
          </DropdownMenuItem>
        )}
        {!row && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => copy(field, "Column name copied")}
            >
              <Copy aria-hidden="true" />
              Copy column name
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
