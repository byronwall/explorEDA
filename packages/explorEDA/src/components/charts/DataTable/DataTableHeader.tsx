import { CalculatedFieldBadge } from "@/components/calculations/CalculatedFieldBadge";
import { ActionTooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildFieldProfile, type FieldProfile } from "@/lib/fieldProfiles";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { Filter } from "@/types/FilterTypes";
import {
  ChevronDown,
  ChevronUp,
  Filter as FilterIcon,
  Settings2,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { useFilteredFieldProfiles } from "@/hooks/useFilteredFieldProfiles";
import { ColumnFilter } from "./components/ColumnFilter";
import { DataTableSettings } from "./definition";
import { FieldInspector } from "@/components/SummaryTable/components/FieldInspector";
import {
  summarizeField,
  type SparkFilter,
} from "@/components/SummaryTable/components/FieldDistribution";
import { FieldMetadata } from "@/components/FieldMetadata";
import type { datum } from "@/types/ChartTypes";
import isEqual from "react-fast-compare";

/** Header height in pixels: one line of names, or names over distributions. */
export const HEADER_HEIGHT = 36;
export const HEADER_HEIGHT_WITH_DISTRIBUTIONS = 62;

interface DataTableHeaderProps {
  settings: DataTableSettings;
  onSettingsChange?: (settings: Partial<DataTableSettings>) => void;
  localFilters?: boolean;
  onColumnResize?: (id: string, width: number | null) => void;
  /**
   * Profiles of the rows this table can show. When set, each header draws
   * its field's distribution under the name.
   */
  distributionProfiles?: FieldProfile[];
}

export function DataTableHeader({
  settings,
  onSettingsChange,
  onColumnResize,
  localFilters = false,
  distributionProfiles,
}: DataTableHeaderProps) {
  const { columns, sortBy, sortDirection, filters } = settings;
  const updateChart = useDataLayer((state) => state.updateChart);
  const update =
    onSettingsChange ??
    ((next: Partial<DataTableSettings>) => updateChart(settings.id, next));
  const fieldProfiles = useDataLayer((state) => state.fieldProfiles) ?? [];
  const calculations = useDataLayer((state) => state.calculations) ?? [];
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const label = getFieldLabel ?? ((field: string) => field);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
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
    [fieldProfiles, calculations, columns, getColumnData, nonce, fieldSettings]
  );
  // One popover serves every column. It moves to the column whose filter
  // opens, so switching columns never shows two popovers at once.
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const filterAnchor = useRef<HTMLElement | null>(null);
  const filterContent = useRef<HTMLDivElement>(null);
  const activeColumn = columns.find((column) => column.id === activeFilter);
  const profileFor = (field: string): FieldProfile =>
    profiles.find((fieldProfile) => fieldProfile.name === field) ?? {
      name: field,
      dataType: "categorical" as const,
      totalCount: 0,
      uniqueCount: 11,
      nullCount: 0,
    };
  useEffect(() => {
    if (!activeFilter) return;
    // Moving to another column replaces the controls; keep focus inside.
    const content = filterContent.current;
    if (content && !content.contains(document.activeElement)) {
      content
        .querySelector<HTMLElement>("input, select, button")
        ?.focus({ preventScroll: true });
    }
  }, [activeFilter]);
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
    <>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => {
            const profile = profileFor(column.field);
            const filter = filters.find(
              (f: Filter) => f.field === column.field
            );
            // Numbers sit against the right edge, like their cells.
            const alignRight = profile.dataType === "numeric";
            const scoped = distributionProfiles?.find(
              (fieldProfile) => fieldProfile.name === column.field
            );
            // A mark filters to its rows; the same mark again clears it.
            const summary =
              scoped &&
              summarizeField(
                scoped,
                (value) =>
                  formatFieldValue
                    ? formatFieldValue(column.field, value as datum)
                    : String(value),
                label(column.field),
                (next: SparkFilter) => {
                  const nextFilter = { ...next, field: column.field } as Filter;
                  handleFilterChange(
                    column.id,
                    isEqual(filter, nextFilter) ? undefined : nextFilter
                  );
                },
                filter
              );

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
                <div
                  className="eda-column-heading"
                  data-sorted={sortBy === column.field || undefined}
                  data-align={alignRight ? "right" : undefined}
                >
                  <button
                    type="button"
                    className="eda-column-sort"
                    aria-label={`Sort by ${column.field}`}
                    onClick={() => handleSort(column.field)}
                  >
                    <FieldMetadata
                      profile={scoped ?? profile}
                      label={label(column.field)}
                      compact
                      className="eda-column-name"
                    />
                    {sortBy === column.field &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </button>
                  <div className="eda-column-actions">
                    <CalculatedFieldBadge field={column.field} />
                    <FieldInspector field={column.field}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        aria-label={`Inspect ${column.field}`}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                    </FieldInspector>
                    <ActionTooltip content={`Filter ${label(column.field)}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`eda-column-filter ${filter ? "is-active" : ""}`}
                        aria-label={`Filter ${column.field}`}
                        aria-haspopup="dialog"
                        aria-expanded={activeFilter === column.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          filterAnchor.current = event.currentTarget;
                          setActiveFilter(
                            activeFilter === column.id ? null : column.id
                          );
                        }}
                      >
                        <FilterIcon className="h-4 w-4" />
                      </Button>
                    </ActionTooltip>
                  </div>
                </div>
                {distributionProfiles && (
                  <div className="eda-column-spark">
                    {summary ? (
                      <>
                        {summary.graphic}
                        <span className="sr-only">{summary.description}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No values</span>
                    )}
                  </div>
                )}
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
                    if (
                      event.key !== "ArrowLeft" &&
                      event.key !== "ArrowRight"
                    ) {
                      return;
                    }
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
      <Popover
        open={activeColumn !== undefined}
        onOpenChange={(open) => {
          if (!open) setActiveFilter(null);
        }}
      >
        <PopoverAnchor
          virtualRef={filterAnchor as React.RefObject<HTMLElement>}
        />
        {activeColumn && (
          <PopoverContent
            ref={filterContent}
            className="w-auto max-w-[calc(100vw-24px)]"
            align="start"
            collisionPadding={12}
            aria-label={`Filter ${label(activeColumn.field)}`}
            // Another column's filter button moves this popover instead.
            onInteractOutside={(event) => {
              const target = event.target;
              if (
                target instanceof Element &&
                target.closest(".eda-column-filter")
              ) {
                event.preventDefault();
              }
            }}
            // A hover tooltip on the distribution must not swallow Escape.
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setActiveFilter(null);
              }
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              filterAnchor.current?.focus({ preventScroll: true });
            }}
          >
            <ScopedColumnFilter
              key={activeColumn.id}
              own={localFilters ? undefined : settings}
              scopedProfiles={distributionProfiles}
              local={localFilters}
              columnId={activeColumn.id}
              columnLabel={label(activeColumn.field)}
              profile={profileFor(activeColumn.field)}
              filter={filters.find(
                (f: Filter) => f.field === activeColumn.field
              )}
              onChange={handleFilterChange}
              onClear={() => handleFilterClear(activeColumn.id)}
            />
          </PopoverContent>
        )}
      </Popover>
    </>
  );
}

/**
 * A column filter with the field's distribution from the rows the table can
 * show. The header passes those profiles when it already has them; otherwise
 * they are built while the popover is open.
 */
function ScopedColumnFilter({
  own,
  scopedProfiles,
  ...props
}: Omit<
  React.ComponentProps<typeof ColumnFilter>,
  "distribution" | "format"
> & {
  own?: DataTableSettings;
  scopedProfiles?: FieldProfile[];
}) {
  const built = useFilteredFieldProfiles(own, scopedProfiles === undefined);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  return (
    <ColumnFilter
      {...props}
      format={(value) =>
        formatFieldValue
          ? formatFieldValue(props.profile.name, value as datum)
          : String(value)
      }
      distribution={(scopedProfiles ?? built).find(
        (profile) => profile.name === props.profile.name
      )}
    />
  );
}
