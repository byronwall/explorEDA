import { categoryLabel } from "@/lib/categories";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { FilterX, X } from "lucide-react";
import { Button } from "./ui/button";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const displayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "missing";
  }
  if (typeof value === "number") {
    return numberFormatter.format(value);
  }
  return String(value);
};

function assertNever(value: never): never {
  throw new Error(`Unsupported filter type: ${String(value)}`);
}

function formatFilterLabel(filter: Filter): string {
  switch (filter.type) {
    case "value":
      return `${filter.field}: ${filter.values.map(categoryLabel).join(", ")}`;
    case "range":
    case "date-range":
      if (filter.min !== undefined && filter.max !== undefined) {
        return `${filter.field}: ${displayValue(filter.min)}–${displayValue(filter.max)}`;
      }
      if (filter.min !== undefined) {
        return `${filter.field}: ≥ ${displayValue(filter.min)}`;
      }
      if (filter.max !== undefined) {
        return `${filter.field}: ≤ ${displayValue(filter.max)}`;
      }
      return `${filter.field}: active`;
    case "text":
      return `${filter.field} ${filter.operator} “${filter.value}”`;
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
                  aria-label={`Remove Rows filter: ${formatFilterLabel(filter)}`}
                  onClick={() =>
                    updateRowsSettings({
                      filters: rowsSettings.filters.filter(
                        (item) => item !== filter
                      ),
                    })
                  }
                >
                  <span className="truncate">
                    Rows · {formatFilterLabel(filter)}
                  </span>
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
              const label = formatFilterLabel(filter);
              return (
                <li key={`${chart.id}-${index}`}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 max-w-full"
                    tooltip={`Remove ${label} from ${chart.title || chart.type}`}
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
