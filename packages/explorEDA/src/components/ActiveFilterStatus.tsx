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
import { FilterX, X } from "lucide-react";
import { Button } from "./ui/button";

type FieldFormatting = {
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
function formatFilterLabel(
  filter: Filter,
  format: FieldFormatting = plainFormatting
): string {
  const name = format.name(filter.field);
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

function getActiveFilters(charts: ChartSettings[]) {
  return charts.flatMap((chart) =>
    chart.filters
      .map((filter, index) => ({ chart, filter, index }))
      .filter(({ filter }) => isActiveFilter(filter))
  );
}

export function ActiveFilterStatus({ view = "charts" }: { view?: string }) {
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

  return (
    <section
      aria-label="Active chart filters"
      className="eda-filter-status mb-2 flex h-11 items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
    >
      <p
        role="status"
        aria-live="polite"
        className="shrink-0 text-xs text-muted-foreground tabular-nums"
      >
        Showing <strong className="text-foreground">{remainingRows}</strong> of{" "}
        <strong className="text-foreground">{data.length}</strong> rows
        <span className="filter-context"> after chart filters.</span>
      </p>
      {activeFilters.length + localFilters.length + searches.length === 0 && (
        <span className="ml-auto hidden whitespace-nowrap text-xs text-muted-foreground sm:inline">
          Table searches and Rows filters apply locally
        </span>
      )}
      {activeFilters.length + localFilters.length + searches.length > 0 && (
        <>
          <ul
            className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap"
            aria-label="Active filters"
          >
            {localFilters.map((filter, index) => (
              <li key={`rows-${index}`}>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Remove Rows filter: ${filterLabel(filter)}`}
                  onClick={() =>
                    updateRowsSettings({
                      filters: rowsSettings.filters.filter(
                        (item) => item !== filter
                      ),
                    })
                  }
                >
                  <span className="truncate">Rows · {filterLabel(filter)}</span>
                  <X aria-hidden="true" />
                </Button>
              </li>
            ))}
            {searches.map((search) => (
              <li key={`search-${search.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Clear ${search.title} search: ${search.text}`}
                  onClick={() =>
                    search.id === "rows"
                      ? updateRowsSettings({ globalSearch: "" })
                      : updateChart(search.id, { globalSearch: "" })
                  }
                >
                  <span className="truncate">
                    {search.title} search · {search.text}
                  </span>
                  <X aria-hidden="true" />
                </Button>
              </li>
            ))}
            {activeFilters.map(({ chart, filter, index }) => {
              const label = formatFilterLabel(filter, formatting);
              const exact = exactBounds(filter, formatting);
              return (
                <li key={`${chart.id}-${index}`}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 max-w-full"
                    tooltip={
                      exact
                        ? `Remove ${label} from ${chart.title || chart.type}. ${exact}.`
                        : `Remove ${label} from ${chart.title || chart.type}`
                    }
                    aria-label={`Remove ${label} from ${chart.title || chart.type}`}
                    onClick={() =>
                      updateChart(chart.id, {
                        filters: chart.filters.filter(
                          (_, filterIndex) => filterIndex !== index
                        ),
                      })
                    }
                  >
                    <span className="truncate">{label}</span>
                    <X aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="ml-auto shrink-0"
        tooltip="Clear chart filters, all table searches, and Rows filters"
        onClick={clearAllFilters}
      >
        <FilterX aria-hidden="true" />
        Clear all filters
      </Button>
    </section>
  );
}
