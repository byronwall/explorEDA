import { useLayoutEffect, useRef, useState } from "react";
import { categoryLabel } from "@/lib/categories";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { datum, Filter } from "@/types/FilterTypes";
import {
  displayRoundsValue,
  formatFieldBounds,
  formatFieldValue,
  getFieldName,
} from "@/lib/fieldSettings";
import { FilterX, ListFilter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ActionTooltip } from "./ui/tooltip";

export type FieldFormatting = {
  name: (field: string) => string;
  bounds: (field: string, min: datum, max: datum) => [string, string];
  value: (field: string, value: datum) => string;
  rounds: (field: string, value: number) => boolean;
};

const plainFormatting: FieldFormatting = {
  name: (field) => field,
  bounds: (field, min, max) => formatFieldBounds(field, min, max),
  value: (field, value) => formatFieldValue(field, value),
  rounds: (_field, value) => displayRoundsValue(value),
};

/** Raw numeric bounds, shown when display rounding hides their exact values. */
function exactBounds(filter: Filter, format: FieldFormatting) {
  if (filter.type !== "range") {
    return undefined;
  }
  const bounds = [filter.min, filter.max].filter(
    (bound): bound is number => bound !== undefined
  );
  const rounded = bounds.some((bound) => format.rounds(filter.field, bound));
  return rounded
    ? `Exact bounds: ${bounds.map(String).join(" to ")}`
    : undefined;
}

function assertNever(value: never): never {
  throw new Error(`Unsupported filter type: ${String(value)}`);
}

/**
 * Name a filter the way the field reads everywhere else: its display label,
 * with bounds in the field's format and unit.
 */
export function formatFilterLabel(
  filter: Filter,
  format: FieldFormatting = plainFormatting
): string {
  const name = filter.field === "__ID" ? "Source row" : format.name(filter.field);
  switch (filter.type) {
    case "value":
      return `${name}: ${filter.values.map(categoryLabel).join(", ")}`;
    case "range":
    case "date-range": {
      const { min, max } = filter;
      if (min !== undefined && max !== undefined) {
        const [low, high] = format.bounds(filter.field, min, max);
        return `${name}: ${low}–${high}`;
      }
      if (min !== undefined) {
        return `${name}: ≥ ${format.value(filter.field, min)}`;
      }
      if (max !== undefined) {
        return `${name}: ≤ ${format.value(filter.field, max)}`;
      }
      return `${name}: active`;
    }
    case "text":
      return `${name} ${filter.operator} “${filter.value}”`;
    default:
      return assertNever(filter);
  }
}

export function isActiveFilter(filter: Filter) {
  switch (filter.type) {
    case "value":
      return filter.values.length > 0;
    case "range":
    case "date-range":
      return filter.min !== undefined || filter.max !== undefined;
    case "text":
      return filter.value.length > 0;
    default:
      return assertNever(filter);
  }
}

/**
 * One active filter: the label jumps to the chart that set it, and only the X
 * removes it. Filters without a chart show a plain label.
 */
function FilterChip({
  label,
  showLabel,
  showTooltip,
  onShow,
  onHighlight,
  removeLabel,
  removeTooltip,
  onRemove,
  overflow,
}: {
  label: string;
  showLabel?: string;
  showTooltip?: string;
  onShow?: () => void;
  onHighlight?: (active: boolean) => void;
  removeLabel: string;
  removeTooltip: string;
  onRemove: () => void;
  /** Hidden in place because it does not fit; the overflow popover lists it. */
  overflow?: boolean;
}) {
  return (
    <li
      className="eda-filter-chip flex h-7 max-w-full shrink-0 items-center rounded-md border border-input bg-background shadow-xs"
      data-overflow={overflow || undefined}
    >
      {onShow ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-full min-w-0 rounded-r-none px-2 font-normal"
          tooltip={showTooltip}
          aria-label={showLabel}
          onClick={onShow}
          onPointerEnter={() => onHighlight?.(true)}
          onPointerLeave={() => onHighlight?.(false)}
          onFocus={() => onHighlight?.(true)}
          onBlur={() => onHighlight?.(false)}
        >
          <span className="truncate">{label}</span>
        </Button>
      ) : (
        <span className="min-w-0 truncate px-2 text-sm">{label}</span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 rounded-l-none border-l border-border text-muted-foreground hover:text-foreground"
        tooltip={removeTooltip}
        aria-label={removeLabel}
        onClick={() => {
          onHighlight?.(false);
          onRemove();
        }}
      >
        <X aria-hidden="true" />
      </Button>
    </li>
  );
}

function getActiveFilters(charts: ChartSettings[]) {
  return charts.flatMap((chart) =>
    chart.filters
      .map((filter, index) => ({ chart, filter, index }))
      .filter(({ filter }) => isActiveFilter(filter))
  );
}

export function ActiveFilterStatus({
  view = "charts",
  onShowChart,
  onHighlightChart,
  className,
}: {
  view?: string;
  className?: string;
  /** Scrolls to and focuses the chart that owns a filter. */
  onShowChart?: (id: string) => void;
  /** Marks the chart that owns a filter while its chip has hover or focus. */
  onHighlightChart?: (id: string | undefined) => void;
}) {
  const charts = useDataLayer((state) => state.charts);
  const data = useDataLayer((state) => state.data);
  const remainingRows = useDataLayer((state) =>
    state.crossfilterWrapper.getFilteredRowCount()
  );
  const updateChart = useDataLayer((state) => state.updateChart);
  const clearAllFilters = useDataLayer((state) => state.clearAllFilters);
  const rowsSettings = useDataLayer((state) => state.rowsSettings);
  const updateRowsSettings = useDataLayer((state) => state.updateRowsSettings);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const formatting: FieldFormatting = {
    name: (field) => getFieldName(field, fieldSettings[field]),
    bounds: (field, min, max) =>
      formatFieldBounds(field, min, max, fieldSettings[field]),
    value: (field, value) =>
      formatFieldValue(field, value, fieldSettings[field]),
    rounds: (field, value) => displayRoundsValue(value, fieldSettings[field]),
  };
  const filterLabel = (filter: Filter) => formatFilterLabel(filter, formatting);
  const activeFilters = getActiveFilters(charts);
  const localFilters =
    view === "rows" ? rowsSettings.filters.filter(isActiveFilter) : [];
  const searches =
    view === "rows"
      ? rowsSettings.globalSearch
        ? [{ id: "rows", title: "Rows", text: rowsSettings.globalSearch }]
        : []
      : charts.flatMap((chart) =>
          chart.type === "data-table" && chart.globalSearch
            ? [
                {
                  id: chart.id,
                  title: chart.title || "Table",
                  text: chart.globalSearch,
                },
              ]
            : []
        );

  type ChipProps = Omit<Parameters<typeof FilterChip>[0], "overflow"> & {
    key: string;
  };
  const chips: ChipProps[] = [
    ...localFilters.map((filter, index) => ({
      key: `rows-${index}`,
      label: `Rows · ${filterLabel(filter)}`,
      removeLabel: `Remove Rows filter: ${filterLabel(filter)}`,
      removeTooltip:
        "Remove this Rows filter. It was set in the Rows view, not by a chart, and applies only there.",
      onRemove: () =>
        updateRowsSettings({
          filters: rowsSettings.filters.filter((item) => item !== filter),
        }),
    })),
    ...searches.map((search) => {
      const chartId = search.id === "rows" ? undefined : search.id;
      return {
        key: `search-${search.id}`,
        label: `${search.title} search · ${search.text}`,
        showLabel: `Show ${search.title}, the table with this search`,
        showTooltip: `Show ${search.title}, the table with this search. Use × to clear it.`,
        onShow: chartId && onShowChart ? () => onShowChart(chartId) : undefined,
        onHighlight: (active: boolean) =>
          onHighlightChart?.(active ? chartId : undefined),
        removeLabel: `Clear ${search.title} search: ${search.text}`,
        removeTooltip: chartId
          ? `Clear this search from ${search.title}`
          : "Clear this Rows search. It was set in the Rows view, not by a chart, and applies only there.",
        onRemove: () =>
          chartId
            ? updateChart(chartId, { globalSearch: "" })
            : updateRowsSettings({ globalSearch: "" }),
      };
    }),
    ...activeFilters.map(({ chart, filter, index }) => {
      const label = formatFilterLabel(filter, formatting);
      const exact = exactBounds(filter, formatting);
      const owner = chart.title || chart.type;
      return {
        key: `${chart.id}-${index}`,
        label,
        showLabel: `Show ${owner}, the chart with filter ${label}`,
        showTooltip: `Show ${owner}, the chart that set this filter. Use × to remove it.${exact ? ` ${exact}.` : ""}`,
        onShow: onShowChart ? () => onShowChart(chart.id) : undefined,
        onHighlight: (active: boolean) =>
          onHighlightChart?.(active ? chart.id : undefined),
        removeLabel: `Remove ${label} from ${owner}`,
        removeTooltip: `Remove this filter from ${owner}`,
        onRemove: () =>
          updateChart(chart.id, {
            filters: chart.filters.filter(
              (_, filterIndex) => filterIndex !== index
            ),
          }),
      };
    }),
  ];
  // Chips stay on one line. Those that do not fit are hidden in place and
  // listed in the "+N more" popover instead.
  const listRef = useRef<HTMLUListElement>(null);
  const [fitCount, setFitCount] = useState(chips.length);
  const chipSignature = chips.map((chip) => chip.key + chip.label).join("|");
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const right = list.getBoundingClientRect().right + 0.5;
      let count = 0;
      for (const item of Array.from(list.children)) {
        if (item.getBoundingClientRect().right > right) break;
        count += 1;
      }
      setFitCount(count);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [chipSignature]);
  const shownCount = Math.min(fitCount, chips.length);
  const hiddenCount = chips.length - shownCount;

  return (
    <section
      aria-label="Active chart filters"
      className={cn("eda-filter-status", className)}
    >
      <ActionTooltip
        content={
          <>
            Rows that pass every chart filter. Table searches and Rows filters
            apply only to their own table.
          </>
        }
      >
        <p
          role="status"
          aria-live="polite"
          tabIndex={0}
          className="eda-row-count shrink-0 tabular-nums"
        >
          <span className="eda-row-count-lead">Showing </span>
          <strong>{remainingRows.toLocaleString()}</strong> of{" "}
          <strong>{data.length.toLocaleString()}</strong> rows
          <span className="sr-only"> after chart filters.</span>
        </p>
      </ActionTooltip>
      {chips.length > 0 && (
        <ul
          ref={listRef}
          className="eda-filter-chips"
          aria-label="Active filters"
        >
          {chips.map(({ key, ...chip }, index) => (
            <FilterChip key={key} {...chip} overflow={index >= shownCount} />
          ))}
        </ul>
      )}
      {hiddenCount > 0 && (
        <Popover>
          <ActionTooltip content="Show every active filter and search">
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="eda-filter-more"
                aria-label={`Show all ${chips.length} active filters`}
              >
                <ListFilter aria-hidden="true" />
                {shownCount > 0 ? `+${hiddenCount}` : chips.length}
                <span className="eda-filter-more-label">
                  {shownCount > 0
                    ? " more"
                    : chips.length === 1
                      ? " filter"
                      : " filters"}
                </span>
              </Button>
            </PopoverTrigger>
          </ActionTooltip>
          <PopoverContent
            align="start"
            aria-label="Active filters"
            className="eda-filter-popover w-80 max-w-[calc(100vw-2rem)] p-2"
          >
            <h3 className="px-1 pb-2 text-xs font-medium text-muted-foreground">
              {chips.length} active {chips.length === 1 ? "filter" : "filters"}
            </h3>
            <ul
              aria-label="All active filters"
              className="flex max-h-[min(60vh,360px)] flex-col gap-1.5 overflow-y-auto"
            >
              {chips.map(({ key, ...chip }) => (
                <FilterChip key={key} {...chip} />
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      )}
      {chips.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="eda-filter-clear shrink-0"
          aria-label="Clear all filters"
          tooltip="Clear all filters: chart filters, table searches, and Rows filters"
          onClick={clearAllFilters}
        >
          <FilterX aria-hidden="true" />
        </Button>
      )}
    </section>
  );
}
