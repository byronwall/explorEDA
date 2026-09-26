import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { categoryLabel } from "@/lib/categories";
import type {
  CategoryDistribution,
  DistributionBin,
  FieldDistribution,
  NumericSummary,
  OutlierTail,
  PopulationCounts,
} from "@/lib/fieldDistribution";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const WIDTH = 360;
const HEIGHT = 84;
const TOP_CATEGORIES = 8;
const SEARCH_THRESHOLD = 12;
const EXPANDED_LIMIT = 200;

type Format = (value: number) => string;
type Scale = "count" | "share";

const count = (value: number) => value.toLocaleString();
const rows = (value: number) =>
  `${count(value)} ${value === 1 ? "row" : "rows"}`;
const shareLabel = (part: number, whole: number) => {
  if (whole <= 0) {
    return "0%";
  }
  const share = part / whole;
  if (share > 0 && share < 0.01) {
    return "<1%";
  }
  if (share < 1 && share > 0.99) {
    return ">99%";
  }
  return `${Math.round(share * 100)}%`;
};

const FILTERED_LABEL = "After chart filters";
const ALL_LABEL = "All rows";

type Range = "core" | "full";

function Toggle<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; text: string; description: string }>;
}) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      variant="outline"
      value={value}
      onValueChange={(next) => next && onChange(next as T)}
      aria-label={label}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.description}
          className="h-6 px-2 text-[11px]"
        >
          {option.text}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function Header({
  filtered,
  scale,
  onScaleChange,
  range,
  onRangeChange,
}: {
  filtered: boolean;
  scale?: Scale;
  onScaleChange: (scale: Scale) => void;
  range?: Range;
  onRangeChange: (range: Range) => void;
}) {
  if (!filtered && !range) {
    return null;
  }
  return (
    <div className="eda-dist-header">
      {filtered ? (
        <div className="eda-dist-legend" aria-hidden="true">
          <span>
            <i className="eda-dist-swatch" data-population="filtered" />
            {FILTERED_LABEL}
          </span>
          <span>
            <i className="eda-dist-swatch" data-population="all" />
            {ALL_LABEL}
          </span>
        </div>
      ) : (
        <span />
      )}
      <div className="eda-dist-toggles">
        {range && (
          <Toggle
            label="Range"
            value={range}
            onChange={onRangeChange}
            options={[
              {
                value: "core",
                text: "Core",
                description: "Show the core range without far outliers",
              },
              {
                value: "full",
                text: "Full",
                description: "Show the full range",
              },
            ]}
          />
        )}
        {filtered && scale && (
          <Toggle
            label="Bar height"
            value={scale}
            onChange={onScaleChange}
            options={[
              {
                value: "count",
                text: "Rows",
                description: "Bar height by row count",
              },
              {
                value: "share",
                text: "Share",
                description: "Bar height by share of each population",
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Row counts for each population. The filtered column appears only when chart
 * filters remove rows, so an unfiltered field reads as one plain column.
 */
function CountsTable({
  distribution,
  excludedLabel,
}: {
  distribution: FieldDistribution;
  excludedLabel: string;
}) {
  const { all, filtered } = distribution;
  const populations: Array<[string, PopulationCounts]> = filtered
    ? [
        [FILTERED_LABEL, filtered],
        [ALL_LABEL, all],
      ]
    : [[ALL_LABEL, all]];
  const cell = (part: number, population: PopulationCounts) => (
    <>
      {count(part)}
      {part > 0 && part < population.rows && (
        <span className="eda-dist-share">
          {shareLabel(part, population.rows)}
        </span>
      )}
    </>
  );
  const lines: Array<{
    label: string;
    value: (population: PopulationCounts) => React.ReactNode;
    tone?: "warning";
    show: boolean;
  }> = [
    {
      label: "Values",
      value: (population) => cell(population.values, population),
      show: true,
    },
    {
      label: "Missing",
      value: (population) => cell(population.missing, population),
      tone: "warning",
      show: all.missing > 0,
    },
    {
      label: excludedLabel,
      value: (population) => cell(population.excluded, population),
      tone: "warning",
      show: all.excluded > 0,
    },
    {
      label: "Distinct",
      value: (population) => count(population.distinct),
      show: true,
    },
  ];
  return (
    <table className="eda-dist-counts">
      <thead className={filtered ? undefined : "sr-only"}>
        <tr>
          <th scope="col">
            <span className="sr-only">Measure</span>
          </th>
          {populations.map(([label]) => (
            <th key={label} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="eda-dist-total">
          <th scope="row">Rows</th>
          {populations.map(([label, population]) => (
            <td key={label}>{count(population.rows)}</td>
          ))}
        </tr>
        {lines
          .filter((line) => line.show)
          .map((line) => (
            <tr key={line.label} data-tone={line.tone}>
              <th scope="row">{line.label}</th>
              {populations.map(([label, population]) => (
                <td key={label}>{line.value(population)}</td>
              ))}
            </tr>
          ))}
      </tbody>
    </table>
  );
}

function binLabel(bin: DistributionBin, format: Format) {
  if (bin.single) {
    return format(bin.start);
  }
  const start = format(bin.start);
  const end = format(bin.end);
  return start === end ? start : `${start} – ${end}`;
}

/**
 * A histogram of both populations on shared bins. The full source draws as a
 * quiet silhouette and the filtered rows draw on top of it, so a filter's
 * effect on the shape reads at a glance. Arrow keys step through bins.
 */
function Histogram({
  bins,
  format,
  fieldLabel,
  filtered,
  totals,
  summary,
  scale,
  tails,
}: {
  scale: Scale;
  tails?: { below: OutlierTail; above: OutlierTail };
  bins: DistributionBin[];
  format: Format;
  fieldLabel: string;
  filtered: boolean;
  totals: { all: number; filtered: number };
  summary?: { all: NumericSummary; filtered?: NumericSummary };
}) {
  const [active, setActive] = useState<number>();
  const readoutId = useId();
  const step = WIDTH / Math.max(1, bins.length);
  const gap = bins.length > 1 ? Math.min(2, step * 0.18) : 0;
  const byShare = filtered && scale === "share";
  const allHeight = (bin: DistributionBin) =>
    byShare ? bin.all / Math.max(1, totals.all) : bin.all;
  const filteredHeight = (bin: DistributionBin) =>
    byShare ? bin.filtered / Math.max(1, totals.filtered) : bin.filtered;
  const peak = Math.max(
    ...bins.map((bin) =>
      Math.max(allHeight(bin), filtered ? filteredHeight(bin) : 0)
    ),
    Number.EPSILON
  );
  const barHeight = (value: number) =>
    value <= 0 ? 0 : Math.max(1.5, (value / peak) * (HEIGHT - 2));

  const first = bins[0];
  const last = bins.at(-1);
  const low = first ? first.start : 0;
  const high = last ? last.end : 0;
  const single = first?.single ?? false;
  // Integer bins are centered on their value; continuous bins span edges.
  const x = (value: number) =>
    Math.min(
      WIDTH,
      Math.max(
        0,
        single
          ? ((value - low + 0.5) / bins.length) * WIDTH
          : high === low
            ? WIDTH / 2
            : ((value - low) / (high - low)) * WIDTH
      )
    );
  const hiddenAll = tails ? tails.below.all + tails.above.all : 0;
  const hiddenFiltered = tails
    ? tails.below.filtered + tails.above.filtered
    : 0;
  const binWidth = first && !single ? first.end - first.start : undefined;

  const bin = active === undefined ? undefined : bins[active];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = bins.length - 1;
    const next =
      event.key === "ArrowRight"
        ? Math.min(last, (active ?? -1) + 1)
        : event.key === "ArrowLeft"
          ? Math.max(0, (active ?? bins.length) - 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : event.key === "Escape"
                ? undefined
                : null;
    if (next === null) {
      return;
    }
    event.preventDefault();
    if (event.key === "Escape" && active !== undefined) {
      event.stopPropagation();
    }
    setActive(next);
  };

  return (
    <div className="eda-dist-chart">
      <div
        className="eda-dist-plot"
        role="group"
        tabIndex={0}
        aria-label={`Distribution of ${fieldLabel}, ${bins.length} ${
          bins.length === 1 ? "bin" : "bins"
        }. Use the arrow keys to read each bin.`}
        aria-describedby={readoutId}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(undefined)}
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          if (box.width <= 0) {
            return;
          }
          const fraction = (event.clientX - box.left) / box.width;
          const index = Math.floor(
            Math.min(0.9999, Math.max(0, fraction)) * bins.length
          );
          setActive(index);
        }}
        onPointerLeave={() => setActive(undefined)}
      >
        <svg
          className="eda-dist-svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {active !== undefined && (
            <rect
              className="eda-dist-focus"
              x={active * step}
              y={0}
              width={step}
              height={HEIGHT}
            />
          )}
          {bins.map((item, index) => {
            const height = barHeight(allHeight(item));
            return height > 0 ? (
              <rect
                key={`all-${index}`}
                className={filtered ? "eda-dist-bar-all" : "eda-dist-bar"}
                data-active={(!filtered && index === active) || undefined}
                x={index * step + gap / 2}
                y={HEIGHT - height}
                width={Math.max(0.75, step - gap)}
                height={height}
              />
            ) : null;
          })}
          {filtered &&
            bins.map((item, index) => {
              const height = barHeight(filteredHeight(item));
              return height > 0 ? (
                <rect
                  key={`filtered-${index}`}
                  className="eda-dist-bar"
                  data-active={index === active || undefined}
                  x={index * step + gap / 2 + step * 0.14}
                  y={HEIGHT - height}
                  width={Math.max(0.75, (step - gap) * 0.72)}
                  height={height}
                />
              ) : null;
            })}
          <line
            className="eda-dist-base"
            x1={0}
            x2={WIDTH}
            y1={HEIGHT - 0.5}
            y2={HEIGHT - 0.5}
          />
        </svg>
        {summary && (
          <svg
            className="eda-dist-box"
            viewBox={`0 0 ${WIDTH} ${summary.filtered && filtered ? 22 : 12}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            {[
              ...(filtered && summary.filtered
                ? [{ stats: summary.filtered, population: "filtered" }]
                : []),
              {
                stats: summary.all,
                population: filtered ? "all" : "filtered",
              },
            ].map(({ stats, population }, row) => {
              const y = row * 10 + 6;
              return (
                <g key={population} data-population={population}>
                  <line
                    className="eda-dist-whisker"
                    x1={x(stats.min)}
                    x2={x(stats.max)}
                    y1={y}
                    y2={y}
                  />
                  <rect
                    className="eda-dist-iqr"
                    x={x(stats.q1)}
                    y={y - 3.5}
                    width={Math.max(1, x(stats.q3) - x(stats.q1))}
                    height={7}
                  />
                  <line
                    className="eda-dist-median"
                    x1={x(stats.median)}
                    x2={x(stats.median)}
                    y1={y - 4.5}
                    y2={y + 4.5}
                  />
                </g>
              );
            })}
          </svg>
        )}
        <div className="eda-dist-axis" aria-hidden="true">
          <span>{first ? format(low) : ""}</span>
          <span>{last && high !== low ? format(high) : ""}</span>
        </div>
      </div>
      <p id={readoutId} className="eda-dist-readout" aria-live="polite">
        {bin ? (
          <>
            <strong>{binLabel(bin, format)}</strong>
            {filtered ? (
              <>
                <span>
                  {rows(bin.filtered)}{" "}
                  <span className="eda-dist-share">
                    {shareLabel(bin.filtered, totals.filtered)}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  of {count(bin.all)} in all rows
                </span>
              </>
            ) : (
              <span>
                {rows(bin.all)}{" "}
                <span className="eda-dist-share">
                  {shareLabel(bin.all, totals.all)}
                </span>
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground">
            {bins.length === 1
              ? `One value: ${binLabel(bins[0]!, format)}`
              : single
                ? `${bins.length} values from ${format(low)} to ${format(high)}`
                : `${bins.length} bins of ${format(binWidth!)} from ${format(low)} to ${format(high)}`}
            {hiddenAll > 0 &&
              `. ${count(hiddenAll)} far ${
                hiddenAll === 1 ? "outlier sits" : "outliers sit"
              } outside this range${
                filtered ? `, ${count(hiddenFiltered)} after chart filters` : ""
              }.`}
          </span>
        )}
      </p>
    </div>
  );
}

function StatsTable({
  summary,
  format,
  filtered,
}: {
  summary: { all: NumericSummary; filtered?: NumericSummary };
  format: Format;
  filtered: boolean;
}) {
  const columns: Array<[string, NumericSummary | undefined]> = filtered
    ? [
        [FILTERED_LABEL, summary.filtered],
        [ALL_LABEL, summary.all],
      ]
    : [[ALL_LABEL, summary.all]];
  const stats: Array<[string, keyof NumericSummary]> = [
    ["Minimum", "min"],
    ["25th percentile", "q1"],
    ["Median", "median"],
    ["75th percentile", "q3"],
    ["Maximum", "max"],
    ["Mean", "mean"],
    ["Std. deviation", "stdDev"],
  ];
  return (
    <table className="eda-dist-counts eda-dist-stats">
      <thead className={filtered ? undefined : "sr-only"}>
        <tr>
          <th scope="col">
            <span className="sr-only">Statistic</span>
          </th>
          {columns.map(([label]) => (
            <th key={label} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {stats.map(([label, key]) => (
          <tr key={key} data-key={key}>
            <th scope="row">{label}</th>
            {columns.map(([column, values]) => (
              <td key={column}>{values ? format(values[key]) : "—"}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Category frequencies as horizontal bars. The track shows the full-source
 * share and the filled bar shows the filtered share on the same scale.
 */
function CategoryList({
  distribution,
  formatCategory,
}: {
  distribution: CategoryDistribution;
  formatCategory: (
    value: CategoryDistribution["categories"][number]["value"]
  ) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const searchId = useId();
  const { categories, all, filtered } = distribution;
  const allValues = Math.max(1, all.values);
  const filteredValues = Math.max(1, filtered?.values ?? all.values);
  const peak = Math.max(
    ...categories.map((item) =>
      Math.max(
        item.all / allValues,
        filtered ? item.filtered / filteredValues : 0
      )
    ),
    Number.EPSILON
  );
  const everyUnique = all.values > 1 && categories.length === all.values;

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return categories;
    }
    return categories.filter((item) =>
      formatCategory(item.value).toLowerCase().includes(needle)
    );
  }, [categories, formatCategory, query]);
  const shown = expanded
    ? matches.slice(0, EXPANDED_LIMIT)
    : categories.slice(0, TOP_CATEGORIES);
  const rest = categories.slice(TOP_CATEGORIES);
  const restAll = rest.reduce((sum, item) => sum + item.all, 0);
  const restFiltered = rest.reduce((sum, item) => sum + item.filtered, 0);

  if (categories.length === 0) {
    return null;
  }

  const row = (
    key: string,
    label: string,
    allCount: number,
    filteredCount: number,
    muted = false
  ) => {
    const primary = filtered ? filteredCount : allCount;
    const primaryTotal = filtered ? filteredValues : allValues;
    return (
      <li
        key={key}
        className="eda-dist-category"
        data-muted={muted || undefined}
      >
        <span className="eda-dist-category-label">{label}</span>
        <span className="eda-dist-track" aria-hidden="true">
          {filtered && (
            <span
              className="eda-dist-track-all"
              style={{ width: `${(allCount / allValues / peak) * 100}%` }}
            />
          )}
          <span
            className="eda-dist-track-fill"
            style={{
              width: `${(primary / primaryTotal / peak) * 100}%`,
            }}
          />
        </span>
        <span className="eda-dist-category-count">
          {count(primary)}
          {filtered && (
            <span className="text-muted-foreground"> / {count(allCount)}</span>
          )}
        </span>
        <span className="eda-dist-share">
          {shareLabel(primary, primaryTotal)}
        </span>
      </li>
    );
  };

  return (
    <div className="eda-dist-categories">
      {everyUnique && (
        <p className="eda-dist-note">
          Each of the {count(all.values)} values appears once.
        </p>
      )}
      {expanded && categories.length > SEARCH_THRESHOLD && (
        <div className="eda-dist-search">
          <label htmlFor={searchId} className="sr-only">
            Search values
          </label>
          <Search aria-hidden="true" />
          <Input
            id={searchId}
            value={query}
            placeholder={`Search ${count(categories.length)} values`}
            onChange={(event) => setQuery(event.target.value)}
            className="h-7 pl-7 text-xs"
          />
        </div>
      )}
      <ul
        className={cn("eda-dist-category-list", expanded && "eda-dist-scroll")}
        aria-label={
          filtered
            ? `Value counts ${FILTERED_LABEL.toLowerCase()}, out of all rows`
            : "Value counts"
        }
      >
        {shown.map((item, index) =>
          row(
            `value-${index}`,
            formatCategory(item.value),
            item.all,
            item.filtered
          )
        )}
        {!expanded &&
          rest.length > 0 &&
          row(
            "rest",
            `${count(rest.length)} other ${rest.length === 1 ? "value" : "values"}`,
            restAll,
            restFiltered,
            true
          )}
        {expanded && matches.length === 0 && (
          <li className="eda-dist-note">No values match “{query.trim()}”.</li>
        )}
      </ul>
      {expanded && matches.length > EXPANDED_LIMIT && (
        <p className="eda-dist-note">
          First {count(EXPANDED_LIMIT)} of {count(matches.length)} shown. Search
          to narrow the list.
        </p>
      )}
      {rest.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => {
            setExpanded((current) => !current);
            setQuery("");
          }}
        >
          {expanded
            ? `Show top ${TOP_CATEGORIES}`
            : `Show all ${count(categories.length)} values`}
        </Button>
      )}
    </div>
  );
}

export function FieldValues({
  distribution,
  fieldLabel,
  format,
  formatCategory = categoryLabel,
  failedCount = 0,
}: {
  distribution: FieldDistribution;
  fieldLabel: string;
  format: Format;
  formatCategory?: (
    value: CategoryDistribution["categories"][number]["value"]
  ) => string;
  failedCount?: number;
}) {
  const filtered = distribution.filtered !== undefined;
  const excludedLabel =
    distribution.kind === "date" ? "Not a date" : "Not finite";
  const totals = {
    all: distribution.all.values,
    filtered: distribution.filtered?.values ?? distribution.all.values,
  };
  const noValues = distribution.all.values === 0;
  const noFilteredRows = filtered && distribution.filtered!.rows === 0;
  const [scale, setScale] = useState<Scale>("count");
  const [range, setRange] = useState<Range>("core");
  const histogram = distribution.kind !== "category" && !noValues;
  const core =
    distribution.kind === "numeric" && !noValues
      ? distribution.core
      : undefined;
  const useCore = core !== undefined && range === "core";

  return (
    <div className="eda-dist">
      <Header
        filtered={filtered}
        scale={histogram ? scale : undefined}
        onScaleChange={setScale}
        range={core ? range : undefined}
        onRangeChange={setRange}
      />
      {noValues ? (
        <p className="eda-dist-note">
          This field has no values to chart. Every row is missing or excluded.
        </p>
      ) : distribution.kind === "category" ? (
        <CategoryList
          distribution={distribution}
          formatCategory={formatCategory}
        />
      ) : (
        <Histogram
          bins={useCore ? core.bins : distribution.bins}
          tails={useCore ? { below: core.below, above: core.above } : undefined}
          format={format}
          fieldLabel={fieldLabel}
          filtered={filtered}
          totals={totals}
          scale={scale}
          summary={
            distribution.kind === "numeric" ? distribution.summary : undefined
          }
        />
      )}
      {noFilteredRows && (
        <p className="eda-dist-note">
          No rows remain after chart filters. Bars show all rows.
        </p>
      )}
      <CountsTable distribution={distribution} excludedLabel={excludedLabel} />
      {failedCount > 0 && (
        <p className="eda-dist-note" data-tone="destructive">
          {count(failedCount)}{" "}
          {failedCount === 1 ? "value fails" : "values fail"} conversion and
          {failedCount === 1 ? " counts" : " count"} as missing. The Preview tab
          lists each failed row.
        </p>
      )}
      {distribution.kind === "numeric" && distribution.summary && (
        <StatsTable
          summary={distribution.summary}
          format={format}
          filtered={filtered}
        />
      )}
    </div>
  );
}
