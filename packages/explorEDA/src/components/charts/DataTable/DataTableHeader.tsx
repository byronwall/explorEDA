import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { Filter, TextFilter } from "@/types/FilterTypes";
import { ChevronDown, ChevronUp, Filter as FilterIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ColumnFilter } from "./components/ColumnFilter";
import { DataTableSettings } from "./definition";

interface DataTableHeaderProps {
  settings: DataTableSettings;
}

export function DataTableHeader({ settings }: DataTableHeaderProps) {
  const { columns, sortBy, sortDirection, filters } = settings;
  const updateChart = useDataLayer((state) => state.updateChart);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [tempWidths, setTempWidths] = useState<Record<string, number>>({});
  const resizeCleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => resizeCleanup.current?.(), []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort direction
      updateChart(settings.id, {
        sortDirection: sortDirection === "asc" ? "desc" : "asc",
      });
    } else {
      // Set new sort column
      updateChart(settings.id, {
        sortBy: field,
        sortDirection: "asc",
      });
    }
  };

  const handleFilterChange = (
    columnId: string,
    value: string,
    operator: TextFilter["operator"]
  ) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column) {
      return;
    }

    // Create new filters array with updated text filter
    const newFilters = filters.filter(
      (f: Filter) => f.type !== "text" || f.field !== column.field
    );

    if (value) {
      const textFilter: TextFilter = {
        type: "text",
        field: column.field,
        operator,
        value,
      };
      newFilters.push(textFilter);
    }

    updateChart(settings.id, {
      filters: newFilters,
    });
  };

  const handleFilterClear = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column) {
      return;
    }

    // Remove text filter for this column
    const newFilters = filters.filter(
      (f: Filter) => f.type !== "text" || f.field !== column.field
    );

    updateChart(settings.id, {
      filters: newFilters,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    resizeCleanup.current?.();
    setResizingColumn(columnId);

    const startX = e.clientX;
    const column = columns.find((col) => col.id === columnId);
    const startWidth = column?.width || 0;
    let width = startWidth;

    const handleMouseMove = (e: MouseEvent) => {
      width = Math.max(50, startWidth + e.clientX - startX);
      setTempWidths((prev) => ({ ...prev, [columnId]: width }));
    };

    const handleMouseUp = () => {
      const newColumns = columns.map((col) =>
        col.id === columnId ? { ...col, width } : col
      );
      updateChart(settings.id, { columns: newColumns });
      resizeCleanup.current = null;
      setResizingColumn(null);
      setTempWidths({});
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    resizeCleanup.current = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      setResizingColumn(null);
      setTempWidths({});
      resizeCleanup.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <TableHeader>
      <TableRow>
        {columns.map((column) => {
          const textFilter = filters.find(
            (f: Filter): f is TextFilter =>
              f.type === "text" && f.field === column.field
          );

          return (
            <TableHead
              key={column.id}
              className="relative select-none"
              style={{
                width:
                  resizingColumn === column.id
                    ? tempWidths[column.id] || column.width
                    : column.width,
              }}
            >
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleSort(column.field)}
              >
                {column.field}
                {sortBy === column.field &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
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
                {activeFilter === column.id && (
                  <ColumnFilter
                    columnId={column.id}
                    columnLabel={column.field}
                    value={textFilter?.value || ""}
                    operator={textFilter?.operator || "contains"}
                    onChange={handleFilterChange}
                    onClear={() => handleFilterClear(column.id)}
                  />
                )}
              </div>
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label={`Resize ${column.field} column`}
                className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary"
                onMouseDown={(e) => handleResizeStart(e, column.id)}
              />
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}
