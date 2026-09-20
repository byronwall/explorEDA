import { CalculatedFieldBadge } from "@/components/calculations/CalculatedFieldBadge";
import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildFieldProfile, type FieldProfile } from "@/lib/fieldProfiles";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { Filter } from "@/types/FilterTypes";
import { ChevronDown, ChevronUp, Filter as FilterIcon } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColumnFilter } from "./components/ColumnFilter";
import { DataTableSettings } from "./definition";

interface DataTableHeaderProps {
  settings: DataTableSettings;
  onSettingsChange?: (settings: Partial<DataTableSettings>) => void;
  onColumnResize?: (id: string, width: number | null) => void;
}

export function DataTableHeader({
  settings,
  onSettingsChange,
  onColumnResize,
}: DataTableHeaderProps) {
  const { columns, sortBy, sortDirection, filters } = settings;
  const updateChart = useDataLayer((state) => state.updateChart);
  const update =
    onSettingsChange ??
    ((next: Partial<DataTableSettings>) => updateChart(settings.id, next));
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles) ?? [];
  const calculations = useDataLayer((state) => state.calculations) ?? [];
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const nonce = useDataLayer((state) => state.nonce);
  const profiles = useMemo(
    () => [
      ...fieldProfiles,
      ...calculations
        .filter((calc) =>
          columns.some((column) => column.field === calc.resultColumnName)
        )
        .map((calc) =>
          buildFieldProfile(
            calc.resultColumnName,
            getColumnData(calc.resultColumnName)
          )
        ),
    ],
    [fieldProfiles, calculations, columns, getColumnData, nonce]
  );
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [tempWidths, setTempWidths] = useState<Record<string, number>>({});
  const resizeCleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => resizeCleanup.current?.(), []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort direction
      update({
        sortDirection: sortDirection === "asc" ? "desc" : "asc",
      });
    } else {
      // Set new sort column
      update({
        sortBy: field,
        sortDirection: "asc",
      });
    }
  };

  const handleFilterChange = (columnId: string, filter?: Filter) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column) {
      return;
    }

    const newFilters = filters.filter((f: Filter) => f.field !== column.field);
    if (filter) {
      newFilters.push({ ...filter, field: column.field });
    }

    update({
      filters: newFilters,
    });
  };

  const handleFilterClear = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column) {
      return;
    }

    const newFilters = filters.filter((f: Filter) => f.field !== column.field);

    update({
      filters: newFilters,
    });
  };

  const handleResizeStart = (e: React.PointerEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    resizeCleanup.current?.();
    setResizingColumn(columnId);

    const startX = e.clientX;
    const column = columns.find((col) => col.id === columnId);
    const startWidth =
      e.currentTarget.parentElement?.getBoundingClientRect().width ||
      column?.width ||
      120;
    let width = startWidth;

    const handleMouseMove = (e: PointerEvent) => {
      width = Math.max(50, startWidth + e.clientX - startX);
      setTempWidths((prev) => ({ ...prev, [columnId]: width }));
      onColumnResize?.(columnId, width);
    };

    const handleCancel = () => resizeCleanup.current?.();
    const handleMouseUp = () => {
      const newColumns = columns.map((col) =>
        col.id === columnId ? { ...col, width } : col
      );
      update({ columns: newColumns });
      resizeCleanup.current = null;
      setResizingColumn(null);
      setTempWidths({});
      onColumnResize?.(columnId, null);
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
      window.removeEventListener("pointercancel", handleCancel);
    };

    resizeCleanup.current = () => {
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
      window.removeEventListener("pointercancel", handleCancel);
      setResizingColumn(null);
      setTempWidths({});
      onColumnResize?.(columnId, null);
      resizeCleanup.current = null;
    };

    window.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("pointerup", handleMouseUp);
    window.addEventListener("pointercancel", handleCancel);
  };

  return (
    <TableHeader>
      <TableRow>
        {columns.map((column, index) => {
          const profile = profiles.find(
            (fieldProfile: FieldProfile) => fieldProfile.name === column.field
          ) ?? {
            name: column.field,
            dataType: "categorical" as const,
            totalCount: 0,
            uniqueCount: 11,
            nullCount: 0,
          };
          const filter = filters.find((f: Filter) => f.field === column.field);

          return (
            <TableHead
              key={column.id}
              className={`relative select-none ${index === 0 ? "sticky left-0 z-20 bg-background" : ""}`}
              style={{
                width:
                  resizingColumn === column.id
                    ? tempWidths[column.id] || column.width
                    : column.width,
              }}
              aria-sort={
                sortBy === column.field
                  ? sortDirection === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-1 text-left"
                  aria-label={`Sort by ${column.field}`}
                  onClick={() => handleSort(column.field)}
                >
                  <span className="truncate">{column.field}</span>
                  {sortBy === column.field &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </button>
                <CalculatedFieldBadge field={column.field} />
                <Popover
                  open={activeFilter === column.id}
                  onOpenChange={(open) =>
                    setActiveFilter(open ? column.id : null)
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`eda-column-filter ${filter ? "is-active" : ""}`}
                      aria-label={`Filter ${column.field}`}
                      aria-expanded={activeFilter === column.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveFilter(
                          activeFilter === column.id ? null : column.id
                        );
                      }}
                    >
                      <FilterIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto max-w-[calc(100vw-24px)]"
                    align="start"
                    collisionPadding={12}
                  >
                    <ColumnFilter
                      columnId={column.id}
                      columnLabel={column.field}
                      profile={profile}
                      filter={filter}
                      onChange={handleFilterChange}
                      onClear={() => handleFilterClear(column.id)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label={`Resize ${column.field} column`}
                className="eda-column-resize"
                data-resizing={resizingColumn === column.id}
                tabIndex={0}
                aria-valuemin={50}
                aria-valuenow={tempWidths[column.id] ?? column.width ?? 120}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                    return;
                  event.preventDefault();
                  const width = Math.max(
                    50,
                    event.currentTarget.parentElement!.getBoundingClientRect()
                      .width + (event.key === "ArrowRight" ? 16 : -16)
                  );
                  update({
                    columns: columns.map((item) =>
                      item.id === column.id ? { ...item, width } : item
                    ),
                  });
                }}
                onPointerDown={(e) => handleResizeStart(e, column.id)}
              />
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}
