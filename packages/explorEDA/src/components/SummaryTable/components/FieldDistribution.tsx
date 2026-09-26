import { useState, type PointerEvent } from "react";
import { categoryLabel } from "@/lib/categories";
import type { FieldProfile } from "@/lib/fieldProfiles";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { binValues, DISTRIBUTION_BINS } from "../utils/statisticsCalculator";

const WIDTH = 96;
const HEIGHT = 20;
const SHARE_SEGMENTS = 5;
const OTHER_LABEL = "Other values";

/** One mark in a sparkline: a histogram bin or a category share. */
export type SparkBar = { label: string; count: number; muted?: boolean };

export type FieldSummary = {
  /** Visual shape of the values. Hidden from assistive technology. */
  graphic: React.ReactNode;
  /** Marks behind the graphic, used for its hover details. */
  bars: SparkBar[];
  /** Low end of a range, such as a minimum or first date. */
  low?: string;
  /** High end of a range, such as a maximum or last date. */
  high?: string;
  /** Text reading that spans the range columns, such as a top value. */
  label?: string;
  /** Name of the trailing statistic, such as "median". */
  statLabel?: string;
  /** Value of the trailing statistic. */
  stat?: string;
  /** Full sentence for screen readers. */
  description: string;
};

const percent = (share: number) =>
  share > 0 && share < 0.01 ? "<1%" : `${Math.round(share * 100)}%`;

/**
 * Wraps a sparkline so hovering a mark names its values and row count.
 * The marks stay hidden from assistive technology; the row already reads the
 * same summary aloud.
 */
function SparkDetails({
  bars,
  total,
  fieldLabel,
  locate,
  children,
}: {
  bars: SparkBar[];
  total: number;
  fieldLabel: string;
  locate: (fraction: number) => number;
  children: (active: number | undefined) => React.ReactNode;
}) {
  const [active, setActive] = useState<number>();
  const bar = active === undefined ? undefined : bars[active];
  const onPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width <= 0) return;
    const fraction = (event.clientX - box.left) / box.width;
    const index = locate(Math.min(0.9999, Math.max(0, fraction)));
    setActive(index >= 0 && index < bars.length ? index : undefined);
  };
  return (
    <TooltipProvider>
      <Tooltip open={bar !== undefined}>
        <TooltipTrigger asChild>
          <span
            className="eda-summary-spark-hit"
            aria-hidden="true"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(undefined)}
          >
            {children(active)}
          </span>
        </TooltipTrigger>
        {bar && (
          <TooltipContent side="top" collisionPadding={12}>
            <p className="text-muted-foreground">{fieldLabel}</p>
            <p className="font-medium">{bar.label}</p>
            <p className="tabular-nums">
              {bar.count.toLocaleString()} {bar.count === 1 ? "row" : "rows"}
              {total > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  · {percent(bar.count / total)}
                </span>
              )}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

type SparkProps = { bars: SparkBar[]; total: number; fieldLabel: string };

function Histogram({ bars, total, fieldLabel }: SparkProps) {
  const peak = Math.max(...bars.map((bar) => bar.count), 1);
  const step = WIDTH / Math.max(1, bars.length);
  const gap = bars.length > 1 ? Math.min(1, step * 0.2) : 0;
  return (
    <SparkDetails
      bars={bars}
      total={total}
      fieldLabel={fieldLabel}
      locate={(fraction) => Math.floor(fraction * bars.length)}
    >
      {(active) => (
        <svg
          className="eda-summary-spark"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          focusable="false"
        >
          {active !== undefined && (
            <rect
              className="eda-summary-spark-focus"
              x={active * step}
              y={0}
              width={step}
              height={HEIGHT}
            />
          )}
          <line
            className="eda-summary-spark-base"
            x1={0}
            x2={WIDTH}
            y1={HEIGHT - 0.5}
            y2={HEIGHT - 0.5}
          />
          {bars.map(({ count }, index) => {
            if (count === 0) return null;
            const height = Math.max(1.5, (count / peak) * (HEIGHT - 1));
            return (
              <rect
                key={index}
                className="eda-summary-spark-bar"
                data-active={index === active || undefined}
                x={index * step + gap / 2}
                y={HEIGHT - height}
                width={Math.max(0.5, step - gap)}
                height={height}
              />
            );
          })}
        </svg>
      )}
    </SparkDetails>
  );
}

function ShareBar({ bars, total, fieldLabel }: SparkProps) {
  const shares = bars.map((bar) => (total > 0 ? bar.count / total : 0));
  const starts = shares.map((_, index) =>
    shares.slice(0, index).reduce((sum, share) => sum + share, 0)
  );
  return (
    <SparkDetails
      bars={bars}
      total={total}
      fieldLabel={fieldLabel}
      locate={(fraction) =>
        starts.findIndex(
          (start, index) =>
            fraction >= start && fraction < start + shares[index]!
        )
      }
    >
      {(active) => (
        <svg
          className="eda-summary-spark"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          focusable="false"
        >
          {bars.map((bar, index) => (
            <rect
              key={index}
              className={
                bar.muted ? "eda-summary-share-rest" : "eda-summary-share"
              }
              data-rank={index}
              data-active={index === active || undefined}
              x={starts[index]! * WIDTH}
              y={5}
              width={Math.max(0.5, shares[index]! * WIDTH - 1)}
              height={HEIGHT - 10}
            />
          ))}
        </svg>
      )}
    </SparkDetails>
  );
}

function dateBins(profile: FieldProfile) {
  const times: number[] = [];
  let first: { time: number; value: unknown } | undefined;
  let last: { time: number; value: unknown } | undefined;
  for (const { value, count } of profile.categories?.distribution ?? []) {
    const time = Date.parse(String(value));
    if (!Number.isFinite(time)) continue;
    for (let i = 0; i < count; i += 1) times.push(time);
    if (!first || time < first.time) first = { time, value };
    if (!last || time > last.time) last = { time, value };
  }
  if (!first || !last) return undefined;
  times.sort((a, b) => a - b);
  return {
    first: first.value,
    last: last.value,
    firstTime: first.time,
    lastTime: last.time,
    bins: binValues(times, first.time, last.time),
  };
}

/** Name each bin by the values it covers. */
export function labelBins(
  bins: number[],
  min: number,
  max: number,
  label: (value: number) => string
): SparkBar[] {
  // binValues gives small integer ranges fewer bins, one per value.
  const oneBinPerValue =
    bins.length === 1 ||
    (bins.length < DISTRIBUTION_BINS &&
      Number.isInteger(min) &&
      bins.length === max - min + 1);
  const width = (max - min) / Math.max(1, bins.length);
  return bins.map((count, index) => {
    if (oneBinPerValue) return { label: label(min + index), count };
    const start = label(min + index * width);
    const end = label(
      index === bins.length - 1 ? max : min + (index + 1) * width
    );
    return { label: start === end ? start : `${start} – ${end}`, count };
  });
}

const isoDate = (time: number) => new Date(time).toISOString().slice(0, 10);

export function summarizeField(
  profile: FieldProfile,
  format: (value: unknown) => string,
  fieldLabel = profile.name
): FieldSummary | undefined {
  const present =
    profile.totalCount - profile.nullCount - (profile.excludedCount ?? 0);
  if (present <= 0) return undefined;

  if (profile.statistics) {
    const { min, max, median, bins = [] } = profile.statistics;
    const low = format(min);
    const high = format(max);
    const bars = labelBins(bins, min, max, format);
    const graphic = (
      <Histogram bars={bars} total={present} fieldLabel={fieldLabel} />
    );
    if (min === max) {
      return { graphic, bars, low, description: `Every value is ${low}` };
    }
    return {
      graphic,
      bars,
      low,
      high,
      statLabel: "median",
      stat: format(median),
      description: `Range ${low} to ${high}, median ${format(median)}`,
    };
  }

  if (profile.dataType === "datetime") {
    const dates = dateBins(profile);
    if (dates) {
      const first = format(dates.first);
      const last = format(dates.last);
      const bars = labelBins(
        dates.bins,
        dates.firstTime,
        dates.lastTime,
        isoDate
      );
      return {
        graphic: (
          <Histogram bars={bars} total={present} fieldLabel={fieldLabel} />
        ),
        bars,
        low: first,
        high: first === last ? undefined : last,
        description: `Dates from ${first} to ${last}`,
      };
    }
  }

  const top = profile.categories?.topValues ?? [];
  if (!top[0]) return undefined;

  if (profile.uniqueCount === present && present > 1) {
    const bars = [
      { label: "Each value appears once", count: present, muted: true },
    ];
    return {
      graphic: <ShareBar bars={bars} total={present} fieldLabel={fieldLabel} />,
      bars,
      label: "All values unique",
      description: `Every value is unique, for example ${categoryLabel(top[0].value)}`,
    };
  }

  const bars: SparkBar[] = top
    .slice(0, SHARE_SEGMENTS)
    .map(({ value, count }) => ({ label: categoryLabel(value), count }));
  const rest = present - bars.reduce((sum, bar) => sum + bar.count, 0);
  if (rest > 0) bars.push({ label: OTHER_LABEL, count: rest, muted: true });
  const leader = categoryLabel(top[0].value);
  const share = percent(top[0].count / present);
  return {
    graphic: <ShareBar bars={bars} total={present} fieldLabel={fieldLabel} />,
    bars,
    label: leader,
    statLabel: "share",
    stat: share,
    description: `Most common value ${leader}, ${share} of rows with a value`,
  };
}
