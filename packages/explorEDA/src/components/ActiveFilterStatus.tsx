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
      return `${filter.field}: ${filter.values.map(displayValue).join(", ")}`;
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

function isActiveFilter(filter: Filter) {
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

export function ActiveFilterStatus() {
  const charts = useDataLayer((state) => state.charts);
  const data = useDataLayer((state) => state.data);
  const crossfilterWrapper = useDataLayer((state) => state.crossfilterWrapper);
  const updateChart = useDataLayer((state) => state.updateChart);
  const clearAllFilters = useDataLayer((state) => state.clearAllFilters);
  const activeFilters = getActiveFilters(charts);
  const remainingRows = crossfilterWrapper.getFilteredRowCount();

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
      {activeFilters.length === 0 && (
        <span className="ml-auto hidden whitespace-nowrap text-xs text-muted-foreground sm:inline">
          Linked views · select in any chart to explore
        </span>
      )}
      {activeFilters.length > 0 && (
        <>
          <ul
            className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap"
            aria-label="Active filters"
          >
            {activeFilters.map(({ chart, filter, index }) => {
              const label = formatFilterLabel(filter);
              return (
                <li key={`${chart.id}-${index}`}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 max-w-full"
                    title={`Remove ${label} from ${chart.title || chart.type}`}
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto shrink-0"
            onClick={clearAllFilters}
          >
            <FilterX aria-hidden="true" />
            Clear all filters
          </Button>
        </>
      )}
    </section>
  );
}
