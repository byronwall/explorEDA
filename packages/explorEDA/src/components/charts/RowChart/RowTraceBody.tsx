import { useState } from "react";
import { categoryIncludes } from "@/lib/categories";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import { useChartTraceApi } from "../trace/ChartTraceScope";
import type { RowCategory } from "./rowChartPlan";

export interface RowTrace {
  kind: "row-category";
  id: string;
  revision: string;
  owner: string;
  chartId: string;
  field: string;
  other: boolean;
  categories: RowCategory[];
}
export function RowTraceBody({ trace }: { trace: RowTrace }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const api = useChartTraceApi();
  const settings = useDataLayer((state) =>
    state.charts.find((chart) => chart.id === trace.chartId)
  );
  const update = useDataLayer((state) => state.updateChart);
  const filter = settings?.filters.find(
    (item) => item.type === "value" && item.field === trace.field
  );
  const selected = filter?.type === "value" ? filter.values : [];
  const matching = trace.categories.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );
  const select = (items: RowCategory[], remove = false) => {
    if (!settings) return;
    const values = remove
      ? selected.filter(
          (value) =>
            !items.some((item) => categoryIncludes([item.value], value))
        )
      : [
          ...selected,
          ...items
            .filter((item) => !categoryIncludes(selected, item.value))
            .map((item) => item.value),
        ];
    const filters = settings.filters.filter(
      (item) => item.type !== "value" || item.field !== trace.field
    );
    if (values.length)
      filters.push({ type: "value", field: trace.field, values });
    update(settings.id, { filters });
  };
  const ids = trace.categories.flatMap((item) => item.sourceIds);
  return (
    <div className="space-y-2">
      <TraceSection
        heading={trace.other ? "Other categories" : trace.categories[0]?.label}
      >
        <TraceReadout label="Field">{trace.field}</TraceReadout>
        <TraceReadout label="Matching rows">
          {ids.length.toLocaleString()}
        </TraceReadout>
        <TraceReadout label="Members">
          {trace.categories.length.toLocaleString()} categories
        </TraceReadout>
        <p className="text-muted-foreground">
          Counts follow other chart filters. Selection stores category values
          and stays the same when the chart is resized.
        </p>
      </TraceSection>
      <TraceSection heading="Category members">
        {trace.other && (
          <input
            aria-label="Search Other categories"
            placeholder="Search categories"
            className="h-8 w-full rounded border border-input bg-background px-2"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        )}
        <button
          type="button"
          className="rounded border border-border px-2 py-1 disabled:opacity-50"
          disabled={!settings || !matching.length}
          onClick={() => select(matching)}
        >
          Select {matching.length} categories
        </button>
        <div className="space-y-1">
          {matching.slice(page * 25, (page + 1) * 25).map((item) => (
            <div className="flex items-center gap-2" key={item.key}>
              <label className="flex min-w-0 flex-1 items-center gap-2 break-all">
                <input
                  type="checkbox"
                  disabled={!settings}
                  aria-label={`Select ${item.label}`}
                  checked={categoryIncludes(selected, item.value)}
                  onChange={(event) => select([item], !event.target.checked)}
                />
                {item.label}
              </label>
              <span className="tabular-nums">{item.sourceIds.length}</span>
              {trace.other && (
                <button
                  className="rounded border border-border px-1.5 py-0.5"
                  aria-label={`Inspect ${item.label}`}
                  onClick={() =>
                    api?.inspect(trace.owner, "row-category", item.key)
                  }
                >
                  Inspect
                </button>
              )}
            </div>
          ))}
        </div>
        {!matching.length && <p>No matching categories.</p>}
        {matching.length > 25 && (
          <div className="flex items-center justify-between gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              {page * 25 + 1}–{Math.min((page + 1) * 25, matching.length)} of{" "}
              {matching.length}
            </span>
            <button
              disabled={(page + 1) * 25 >= matching.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </TraceSection>
      {!trace.other && (
        <TraceSection heading="Source rows">
          <AggregateContributorTable
            showInputs
            row={{
              id: trace.id,
              groupValue: trace.categories[0]?.value,
              groupLabel: trace.field,
              value: ids.length,
              rowCount: ids.length,
              contributors: ids.map((sourceId) => ({
                sourceId,
                input: trace.categories[0]?.value,
                included: true,
              })),
            }}
          />
        </TraceSection>
      )}
    </div>
  );
}
