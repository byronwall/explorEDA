import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActionTooltip } from "@/components/ui/tooltip";
import {
  unavailableReason,
  type CorrelationResult,
} from "@/lib/pairCorrelation";
import { useDataLayer } from "@/providers/DataLayerProvider";
import { ListOrdered } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { groupFacetData } from "../FacetRelated/FacetContainer";
import { useChartTraceApi } from "../trace/ChartTraceScope";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import {
  DEFAULT_UPPER_CELLS,
  type MatrixPairOrder,
  type ScatterMatrixSettings,
} from "./definition";
import { continuousValue, matrixFieldKind } from "./matrixPlan";
import {
  planDiscoveryPairs,
  sortDiscoveryPairs,
  type DiscoveryField,
  type DiscoveryPair,
} from "./pairDiscoveryPlan";

/** Options as [value, short label, help]. */
const ORDERS: readonly (readonly [MatrixPairOrder, string, string])[] = [
  ["fields", "Fields", "Keep the matrix's field order."],
  ["spearman", "|ρ|", "Strongest steady rise or fall first, by Spearman ρ."],
  ["pearson", "|r|", "Closest to a straight line first, by Pearson r."],
  [
    "difference",
    "|ρ − r|",
    "Largest gap between the two first: a trend that bends, or one an outlier drives. The gap is a lead to look at, not a test.",
  ],
];

const format = (result: CorrelationResult | undefined) =>
  result?.value === undefined ? "—" : result.value.toFixed(2);

/**
 * Lists every pair of continuous fields with r, ρ, and n, sorted to find the
 * pairs worth a look. Opening it computes both methods; it never changes
 * what the cells show.
 */
export function MatrixPairsAction({
  settings,
  chartTitle,
}: {
  settings: ScatterMatrixSettings;
  chartTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const traceApi = useChartTraceApi();
  // The cell to trace once this popover has closed, so returning focus to
  // the trigger does not dismiss the trace that just opened.
  const pendingTrace = useRef<string | null>(null);
  const container = open
    ? triggerRef.current?.closest<HTMLElement>("[role='dialog']")
    : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ActionTooltip content="Pairs: every pair of number and date fields with r, ρ, and rows, sorted to find the ones worth a look">
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="ghost"
            size="icon"
            aria-label={`Pairs in ${chartTitle}`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </ActionTooltip>
      <PopoverContent
        container={container}
        aria-label={`Pairs in ${chartTitle}`}
        className="w-[min(30rem,calc(100vw-1.5rem))] p-0"
        align="end"
        onOpenAutoFocus={(event) => {
          // Start in the search, not on the first order option.
          event.preventDefault();
          (event.currentTarget as HTMLElement)
            .querySelector<HTMLInputElement>("input")
            ?.focus();
        }}
        onCloseAutoFocus={(event) => {
          const cell = pendingTrace.current;
          pendingTrace.current = null;
          if (cell && traceApi) {
            event.preventDefault();
            traceApi.inspectChart("matrix-cell", cell);
          }
        }}
      >
        {open && (
          <PairsList
            settings={settings}
            onTrace={
              traceApi && !settings.facet?.enabled
                ? (cell) => {
                    pendingTrace.current = cell;
                    setOpen(false);
                  }
                : undefined
            }
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function PairsList({
  settings,
  onTrace,
}: {
  settings: ScatterMatrixSettings;
  /** Absent when a faceted matrix has no single cell to trace. */
  onTrace?: (cell: string) => void;
}) {
  const getColumnData = useDataLayer((s) => s.getColumnData);
  const getFieldLabel = useDataLayer((s) => s.getFieldLabel);
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const updateChart = useDataLayer((s) => s.updateChart);
  const nonce = useDataLayer((s) => s.nonce);
  const allIds = useGetAllIds(settings) as number[];
  const chartIds = useGetLiveIds(settings) as number[];
  const [search, setSearch] = useState("");
  const [facetId, setFacetId] = useState<string>();
  const order = settings.pairOrder ?? "fields";

  const facet = settings.facet?.enabled ? settings.facet : undefined;
  const facets = useMemo(() => {
    if (!facet?.rowVariable) return [];
    return groupFacetData(
      allIds,
      getColumnData(facet.rowVariable),
      facet.type === "grid" ? getColumnData(facet.columnVariable) : null
    );
    // The nonce carries data edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facet, allIds, getColumnData, nonce]);
  const chosen = facets.find((item) => item.id === facetId) ?? facets[0];

  const pairs = useMemo(() => {
    const members = chosen ? new Set(chosen.ids) : undefined;
    const ids = members ? chartIds.filter((id) => members.has(id)) : chartIds;
    const fields = settings.fields.flatMap((field, index): DiscoveryField[] => {
      const type = profiles.find((item) => item.name === field)?.dataType;
      const kind = matrixFieldKind(type);
      if (kind === "band") return [];
      const data = getColumnData(field);
      const value = Float64Array.from(
        ids,
        (id) => continuousValue(kind, data[id]) ?? NaN
      );
      return [{ field, label: getFieldLabel(field), index, value }];
    });
    return planDiscoveryPairs(fields);
    // The nonce carries data edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen, chartIds, settings.fields, profiles, getColumnData, nonce]);

  const query = search.trim().toLowerCase();
  const shown = sortDiscoveryPairs(pairs, order).filter(
    (pair) =>
      !query ||
      pair.a.label.toLowerCase().includes(query) ||
      pair.b.label.toLowerCase().includes(query)
  );
  // A pair's correlation cell, when a triangle draws one; else its points.
  const upper = { ...DEFAULT_UPPER_CELLS, ...settings.upper }.numeric;
  const cellId = (pair: DiscoveryPair) =>
    upper === "correlation"
      ? `${pair.a.index}:${pair.b.index}`
      : `${pair.b.index}:${pair.a.index}`;

  return (
    <div className="space-y-2 p-2 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="eda-segmented"
          role="radiogroup"
          aria-label="Order pairs by"
        >
          {ORDERS.map(([value, short, tip]) => (
            <ActionTooltip key={value} content={tip}>
              <button
                type="button"
                role="radio"
                aria-checked={value === order}
                className="eda-segmented-item"
                onClick={() =>
                  updateChart(settings.id, {
                    pairOrder: value === "fields" ? undefined : value,
                  } as Partial<ScatterMatrixSettings>)
                }
              >
                {short}
              </button>
            </ActionTooltip>
          ))}
        </div>
        <Input
          aria-label="Search pairs by field name"
          placeholder="Search fields"
          className="h-7 min-w-0 flex-1 text-xs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {facets.length > 0 && (
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Facet</span>
          <select
            aria-label="Facet"
            className="h-7 min-w-0 flex-1 rounded-md border-input bg-background px-2"
            value={chosen?.id}
            onChange={(event) => setFacetId(event.target.value)}
          >
            {facets.map((item) => (
              <option key={item.id} value={item.id}>
                {item.columnValue === null
                  ? item.rowValue
                  : `${item.rowValue} · ${item.columnValue}`}
              </option>
            ))}
          </select>
        </label>
      )}
      {pairs.length === 0 ? (
        <p className="text-muted-foreground">
          Pairs need at least two number or date fields in the matrix.
        </p>
      ) : (
        <div className="max-h-[min(22rem,60vh)] overflow-auto">
          <table className="w-full table-fixed tabular-nums">
            <colgroup>
              <col />
              <col className="w-11" />
              <col className="w-11" />
              <col className="w-12" />
              <col className="w-14" />
            </colgroup>
            <thead className="sticky top-0 bg-popover text-muted-foreground">
              <tr>
                <th className="py-1 text-left font-normal">Pair</th>
                <th className="text-right font-normal">
                  <i>r</i>
                </th>
                <th className="text-right font-normal">
                  <i>ρ</i>
                </th>
                <th className="text-right font-normal">Rows</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((pair) => {
                const missing = [pair.pearson, pair.spearman]
                  .map((result) => result && unavailableReason(result))
                  .find(Boolean);
                return (
                  <tr key={pair.id} className="border-t border-border">
                    <td className="break-words py-1 pr-2">
                      {pair.a.label} × {pair.b.label}
                      {missing && (
                        <span className="block text-muted-foreground">
                          {missing}
                        </span>
                      )}
                    </td>
                    <td className="text-right">{format(pair.pearson)}</td>
                    <td className="text-right">{format(pair.spearman)}</td>
                    <td className="text-right">
                      {pair.counts.paired.toLocaleString()}
                    </td>
                    <td className="text-right">
                      {onTrace && (
                        <button
                          type="button"
                          className="h-6 rounded px-1.5 hover:bg-muted"
                          aria-label={`Trace ${pair.a.label} × ${pair.b.label}`}
                          onClick={() => onTrace(cellId(pair))}
                        >
                          Trace
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {shown.length === 0 && (
            <p className="py-2 text-muted-foreground">
              No pair has a field name with “{search}”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
