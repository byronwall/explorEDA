import { categoryLabel } from "@/lib/categories";
import type { FieldProfile } from "@/lib/fieldProfiles";
import { binValues } from "../utils/statisticsCalculator";

const WIDTH = 96;
const HEIGHT = 20;
const SHARE_SEGMENTS = 5;

type Summary = {
  /** Visual shape of the values. Hidden from assistive technology. */
  graphic: React.ReactNode;
  /** Primary reading, such as a range or the most common value. */
  primary: string;
  /** Short labeled context that follows the primary reading. */
  secondary?: string;
  /** Full sentence for screen readers. */
  description: string;
};

function Histogram({ bins }: { bins: number[] }) {
  const peak = Math.max(...bins, 1);
  const step = WIDTH / bins.length;
  const gap = bins.length > 1 ? Math.min(1, step * 0.2) : 0;
  return (
    <svg
      className="eda-summary-spark"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <line
        className="eda-summary-spark-base"
        x1={0}
        x2={WIDTH}
        y1={HEIGHT - 0.5}
        y2={HEIGHT - 0.5}
      />
      {bins.map((count, index) => {
        if (count === 0) return null;
        const height = Math.max(1.5, (count / peak) * (HEIGHT - 1));
        return (
          <rect
            key={index}
            className="eda-summary-spark-bar"
            x={index * step + gap / 2}
            y={HEIGHT - height}
            width={Math.max(0.5, step - gap)}
            height={height}
          />
        );
      })}
    </svg>
  );
}

function ShareBar({ shares }: { shares: number[] }) {
  let offset = 0;
  const remainder = Math.max(
    0,
    1 - shares.reduce((sum, share) => sum + share, 0)
  );
  return (
    <svg
      className="eda-summary-spark"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {shares.map((share, index) => {
        const x = offset * WIDTH;
        const width = share * WIDTH;
        offset += share;
        return (
          <rect
            key={index}
            className="eda-summary-share"
            data-rank={index}
            x={x}
            y={5}
            width={Math.max(0.5, width - 1)}
            height={HEIGHT - 10}
          />
        );
      })}
      {remainder > 0.001 && (
        <rect
          className="eda-summary-share-rest"
          x={offset * WIDTH}
          y={5}
          width={remainder * WIDTH}
          height={HEIGHT - 10}
        />
      )}
    </svg>
  );
}

const percent = (share: number) =>
  share > 0 && share < 0.01 ? "<1%" : `${Math.round(share * 100)}%`;

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
    bins: binValues(times, first.time, last.time),
  };
}

export function summarizeField(
  profile: FieldProfile,
  format: (value: unknown) => string
): Summary | undefined {
  const present = profile.totalCount - profile.nullCount;
  if (present <= 0) return undefined;

  if (profile.statistics) {
    const { min, max, median, bins = [] } = profile.statistics;
    const range = min === max ? format(min) : `${format(min)} – ${format(max)}`;
    return {
      graphic: <Histogram bins={bins} />,
      primary: range,
      secondary: min === max ? undefined : `median ${format(median)}`,
      description: `Range ${format(min)} to ${format(max)}, median ${format(median)}`,
    };
  }

  if (profile.dataType === "datetime") {
    const dates = dateBins(profile);
    if (dates) {
      const first = format(dates.first);
      const last = format(dates.last);
      return {
        graphic: <Histogram bins={dates.bins} />,
        primary: first === last ? first : `${first} – ${last}`,
        description: `Dates from ${first} to ${last}`,
      };
    }
  }

  const top = profile.categories?.topValues ?? [];
  if (!top[0]) return undefined;

  if (profile.uniqueCount === present && present > 1) {
    return {
      graphic: <ShareBar shares={[]} />,
      primary: "All values unique",
      secondary: `e.g. ${categoryLabel(top[0].value)}`,
      description: `Every value is unique, for example ${categoryLabel(top[0].value)}`,
    };
  }

  const shares = top
    .slice(0, SHARE_SEGMENTS)
    .map(({ count }) => count / present);
  const leader = categoryLabel(top[0].value);
  const others = profile.uniqueCount - 1;
  return {
    graphic: <ShareBar shares={shares} />,
    primary: `${leader} ${percent(shares[0]!)}`,
    secondary:
      others > 0
        ? `most common of ${profile.uniqueCount.toLocaleString()}`
        : "only value",
    description: `Most common value ${leader}, ${percent(shares[0]!)} of rows with a value`,
  };
}
