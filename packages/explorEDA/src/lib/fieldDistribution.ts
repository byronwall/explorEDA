import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import { DISTRIBUTION_BINS } from "@/components/SummaryTable/utils/statisticsCalculator";
import { finiteNumber, isMissingValue } from "@/lib/numeric";
import { nice, tickStep } from "d3-array";
import type { datum } from "@/types/ChartTypes";

type RowId = string | number;

/** Row counts for one population of a field. */
export interface PopulationCounts {
  /** Rows in the population. */
  rows: number;
  /** Rows with a usable value: a finite number, a date, or a category. */
  values: number;
  /** Rows with no value. */
  missing: number;
  /** Rows with a value the view cannot place, such as Infinity or a bad date. */
  excluded: number;
  distinct: number;
}

export interface NumericSummary {
  count: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  stdDev: number;
}

/** One histogram bin. Both populations share the bin edges. */
export interface DistributionBin {
  start: number;
  end: number;
  /** True when the bin holds exactly one integer value. */
  single: boolean;
  all: number;
  filtered: number;
}

export interface CategoryCount {
  value: datum;
  all: number;
  filtered: number;
}

interface DistributionBase {
  all: PopulationCounts;
  /** Present when chart filters leave only some rows. */
  filtered?: PopulationCounts;
}

/** Counts of far outliers left out of the core range. */
export interface OutlierTail {
  all: number;
  filtered: number;
}

export interface NumericDistribution extends DistributionBase {
  kind: "numeric";
  bins: DistributionBin[];
  /**
   * Bins for the values inside the far-outlier fences. Present only when a
   * few far outliers stretch the full range enough to flatten its shape.
   */
  core?: {
    bins: DistributionBin[];
    min: number;
    max: number;
    below: OutlierTail;
    above: OutlierTail;
  };
  summary?: { all: NumericSummary; filtered?: NumericSummary };
}

export interface DateDistribution extends DistributionBase {
  kind: "date";
  bins: DistributionBin[];
  /** The calendar period each bin covers, when bins follow the calendar. */
  unit?: CalendarUnit;
  range?: {
    all: { first: number; last: number };
    filtered?: { first: number; last: number };
  };
}

export interface CategoryDistribution extends DistributionBase {
  kind: "category";
  /** Every distinct value, most common first. */
  categories: CategoryCount[];
}

export type FieldDistribution =
  | NumericDistribution
  | DateDistribution
  | CategoryDistribution;

/** Linear-interpolated quantile of sorted values (R type 7). */
export function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) {
    return NaN;
  }
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const low = sorted[lower]!;
  const high = sorted[upper]!;
  return low + (high - low) * (position - lower);
}

export function summarizeNumbers(values: number[]): NumericSummary | undefined {
  if (values.length === 0) {
    return undefined;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const variance =
    sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sorted.length;
  return {
    count: sorted.length,
    min: sorted[0]!,
    q1: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    q3: quantile(sorted, 0.75),
    max: sorted.at(-1)!,
    mean,
    stdDev: Math.sqrt(variance),
  };
}

/**
 * Bin both populations on the full population's extent, so a filtered bar
 * always sits inside the bar it came from. Small integer ranges get one bin
 * per value, as in the Summary sparkline. Numbers use round bin edges.
 */
export function binPopulations(
  all: number[],
  filtered: number[] | undefined,
  { integerBins = true, roundEdges = true, binCount = DISTRIBUTION_BINS } = {}
): DistributionBin[] {
  if (all.length === 0) {
    return [];
  }
  let min = Infinity;
  let max = -Infinity;
  for (const value of all) {
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  }
  if (min === max) {
    return [
      {
        start: min,
        end: max,
        single: true,
        all: all.length,
        filtered: filtered?.length ?? 0,
      },
    ];
  }
  const perValue =
    integerBins && max - min + 1 < binCount && all.every(Number.isInteger);
  let start = min;
  let width = (max - min) / binCount;
  let count = binCount;
  if (perValue) {
    width = 1;
    count = max - min + 1;
  } else if (roundEdges) {
    const [low, high] = nice(min, max, binCount);
    const step = tickStep(low, high, binCount);
    if (step > 0 && Number.isFinite(step)) {
      start = low;
      width = step;
      count = Math.max(1, Math.round((high - low) / step));
    }
  }
  // Multiply rather than add so edges stay free of accumulated float error.
  const edge = (index: number) => start + index * width;
  const bins: DistributionBin[] = Array.from({ length: count }, (_, index) =>
    perValue
      ? {
          start: min + index,
          end: min + index,
          single: true,
          all: 0,
          filtered: 0,
        }
      : {
          start: edge(index),
          end: index === count - 1 && !roundEdges ? max : edge(index + 1),
          single: false,
          all: 0,
          filtered: 0,
        }
  );
  const indexOf = (value: number) =>
    perValue
      ? value - min
      : Math.max(0, Math.min(count - 1, Math.floor((value - start) / width)));
  for (const value of all) {
    bins[indexOf(value)]!.all += 1;
  }
  for (const value of filtered ?? []) {
    if (value >= min && value <= max) {
      bins[indexOf(value)]!.filtered += 1;
    }
  }
  return bins;
}

/** A calendar period in UTC, such as one month or five years. */
export interface CalendarUnit {
  unit: "hour" | "day" | "week" | "month" | "quarter" | "year";
  step: number;
}

/** Periods from finest to coarsest. Dates take the finest that fits. */
const CALENDAR_UNITS: CalendarUnit[] = [
  { unit: "hour", step: 1 },
  { unit: "hour", step: 6 },
  { unit: "day", step: 1 },
  { unit: "week", step: 1 },
  { unit: "month", step: 1 },
  { unit: "quarter", step: 1 },
  { unit: "year", step: 1 },
  { unit: "year", step: 2 },
  { unit: "year", step: 5 },
  { unit: "year", step: 10 },
  { unit: "year", step: 25 },
  { unit: "year", step: 50 },
  { unit: "year", step: 100 },
];

/** The most calendar bins a date distribution draws. */
export const MAX_CALENDAR_BINS = 40;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** A UTC time from calendar parts, including years before 100. */
function utc(year: number, month = 0, day = 1, hour = 0) {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  date.setUTCHours(hour, 0, 0, 0);
  return date.getTime();
}

const floorTo = (value: number, step: number) =>
  value - (((value % step) + step) % step);

/** The start of the period that holds a time. Weeks start on Monday. */
export function calendarFloor(time: number, { unit, step }: CalendarUnit) {
  const date = new Date(time);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  switch (unit) {
    case "hour":
      return utc(year, month, day, floorTo(date.getUTCHours(), step));
    case "day":
      return utc(year, month, day);
    case "week":
      return utc(year, month, day - ((date.getUTCDay() + 6) % 7));
    case "month":
      return utc(year, floorTo(month, step));
    case "quarter":
      return utc(year, floorTo(month, 3 * step));
    case "year":
      return utc(floorTo(year, step));
  }
}

/** The start of the period after the one that starts at a time. */
export function calendarNext(start: number, { unit, step }: CalendarUnit) {
  const date = new Date(start);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  switch (unit) {
    case "hour":
      return start + step * HOUR;
    case "day":
      return start + step * DAY;
    case "week":
      return start + step * 7 * DAY;
    case "month":
      return utc(year, month + step);
    case "quarter":
      return utc(year, month + 3 * step);
    case "year":
      return utc(year + step);
  }
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Name the period a calendar bin covers, such as "Mar 2024" or "Q1 2024". */
export function calendarLabel(start: number, unit: CalendarUnit) {
  const iso = new Date(start).toISOString();
  const date = new Date(start);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  switch (unit.unit) {
    case "hour":
      return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
    case "day":
      return iso.slice(0, 10);
    case "week":
      return `Week of ${iso.slice(0, 10)}`;
    case "month":
      return `${MONTHS[month]} ${year}`;
    case "quarter":
      return `Q${Math.floor(month / 3) + 1} ${year}`;
    case "year":
      return unit.step === 1 ? String(year) : `${year}–${year + unit.step - 1}`;
  }
}

/** The plural name of a calendar unit, for sentences such as "12 months". */
export function calendarUnitName({ unit, step }: CalendarUnit) {
  return step === 1 ? `${unit}s` : `${step}-${unit} periods`;
}

/**
 * Bin dates by whole calendar periods in UTC: the finest of hours, days,
 * weeks, months, quarters, or years that needs no more than
 * MAX_CALENDAR_BINS bins. Both populations share the bins. Returns undefined
 * when every date falls inside one hour, so the caller can bin by time.
 */
export function calendarBins(
  all: number[],
  filtered: number[] | undefined
): { bins: DistributionBin[]; unit: CalendarUnit } | undefined {
  const range = extent(all);
  if (!range || range.first === range.last) {
    return undefined;
  }
  for (const unit of CALENDAR_UNITS) {
    const edges = [calendarFloor(range.first, unit)];
    while (
      edges.at(-1)! <= range.last &&
      edges.length <= MAX_CALENDAR_BINS + 1
    ) {
      edges.push(calendarNext(edges.at(-1)!, unit));
    }
    const count = edges.length - 1;
    if (count > MAX_CALENDAR_BINS) {
      continue;
    }
    if (count < 2 && unit === CALENDAR_UNITS[0]) {
      return undefined;
    }
    const bins: DistributionBin[] = edges.slice(0, -1).map((start, index) => ({
      start,
      end: edges[index + 1]!,
      single: false,
      all: 0,
      filtered: 0,
    }));
    const indexOf = (value: number) => {
      let low = 0;
      let high = count - 1;
      while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (edges[middle]! <= value) low = middle;
        else high = middle - 1;
      }
      return low;
    };
    for (const value of all) {
      bins[indexOf(value)]!.all += 1;
    }
    for (const value of filtered ?? []) {
      if (value >= range.first && value <= range.last) {
        bins[indexOf(value)]!.filtered += 1;
      }
    }
    return { bins, unit };
  }
  return undefined;
}

/** Values far outside the middle half: beyond three interquartile ranges. */
export function farOutlierFences(summary: NumericSummary) {
  const spread = summary.q3 - summary.q1;
  if (!(spread > 0)) {
    return undefined;
  }
  return { low: summary.q1 - 3 * spread, high: summary.q3 + 3 * spread };
}

/**
 * Bins for the values inside the far-outlier fences, when a few outliers
 * stretch the full range to more than twice the core range.
 */
function coreRange(
  all: number[],
  filtered: number[],
  summary: NumericSummary
): NumericDistribution["core"] {
  const fences = farOutlierFences(summary);
  if (!fences) {
    return undefined;
  }
  const inside = (value: number) => value >= fences.low && value <= fences.high;
  const coreAll = all.filter(inside);
  const coreBounds = extent(coreAll);
  if (
    !coreBounds ||
    coreAll.length === all.length ||
    (coreBounds.last - coreBounds.first) * 2 > summary.max - summary.min
  ) {
    return undefined;
  }
  const tail = (test: (value: number) => boolean): OutlierTail => ({
    all: all.filter(test).length,
    filtered: filtered.filter(test).length,
  });
  return {
    bins: binPopulations(coreAll, filtered.filter(inside)),
    min: coreBounds.first,
    max: coreBounds.last,
    below: tail((value) => value < fences.low),
    above: tail((value) => value > fences.high),
  };
}

function countDistinct(values: datum[]) {
  return new Set(values.filter((value) => value != null)).size;
}

function dateTime(value: datum): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
}

function extent(values: number[]) {
  if (values.length === 0) {
    return undefined;
  }
  let first = Infinity;
  let last = -Infinity;
  for (const value of values) {
    if (value < first) {
      first = value;
    }
    if (value > last) {
      last = value;
    }
  }
  return { first, last };
}

/**
 * Describe a field's values for the full source and, when chart filters are
 * active, for the rows that remain. Missing and excluded values follow the
 * same rules as field profiles, so counts agree with the Summary table.
 */
export function buildFieldDistribution(
  column: Record<RowId, datum>,
  dataType: DataType,
  filteredIds?: ReadonlySet<RowId>
): FieldDistribution {
  const entries = Object.entries(column);
  const isFiltered = (id: string) =>
    filteredIds === undefined ||
    filteredIds.has(id) ||
    filteredIds.has(Number(id));
  const filteredEntries = filteredIds
    ? entries.filter(([id]) => isFiltered(id))
    : entries;
  const hasFilter =
    filteredIds !== undefined && filteredEntries.length < entries.length;

  if (dataType === "numeric" || dataType === "datetime") {
    const measure =
      dataType === "numeric"
        ? (value: datum) => finiteNumber(value)
        : (value: datum) => dateTime(value);
    const missing =
      dataType === "numeric" ? isMissingValue : (value: datum) => value == null;
    const read = (rows: Array<[string, datum]>) => {
      const numbers: number[] = [];
      let missingCount = 0;
      for (const [, value] of rows) {
        if (missing(value)) {
          missingCount += 1;
          continue;
        }
        const number = measure(value);
        if (number !== undefined) {
          numbers.push(number);
        }
      }
      const counts: PopulationCounts = {
        rows: rows.length,
        values: numbers.length,
        missing: missingCount,
        excluded: rows.length - missingCount - numbers.length,
        distinct: countDistinct(rows.map(([, value]) => value)),
      };
      return { numbers, counts };
    };
    const all = read(entries);
    const filtered = hasFilter ? read(filteredEntries) : undefined;
    const filteredNumbers = filtered?.numbers ?? all.numbers;
    const numeric = dataType === "numeric";
    const calendar = numeric
      ? undefined
      : calendarBins(all.numbers, filteredNumbers);
    const bins =
      calendar?.bins ??
      binPopulations(all.numbers, filteredNumbers, {
        integerBins: numeric,
        roundEdges: numeric,
      });

    if (numeric) {
      const allSummary = summarizeNumbers(all.numbers);
      return {
        kind: "numeric",
        all: all.counts,
        filtered: filtered?.counts,
        bins,
        core: allSummary && coreRange(all.numbers, filteredNumbers, allSummary),
        summary: allSummary && {
          all: allSummary,
          filtered: filtered && summarizeNumbers(filtered.numbers),
        },
      };
    }
    const allRange = extent(all.numbers);
    return {
      kind: "date",
      all: all.counts,
      filtered: filtered?.counts,
      bins,
      unit: calendar?.unit,
      range: allRange && {
        all: allRange,
        filtered: filtered && extent(filtered.numbers),
      },
    };
  }

  const counts = new Map<datum, CategoryCount>();
  const tally = (rows: Array<[string, datum]>, key: "all" | "filtered") => {
    let missing = 0;
    for (const [, value] of rows) {
      if (value == null) {
        missing += 1;
        continue;
      }
      const entry = counts.get(value) ?? { value, all: 0, filtered: 0 };
      entry[key] += 1;
      counts.set(value, entry);
    }
    return {
      rows: rows.length,
      values: rows.length - missing,
      missing,
      excluded: 0,
      distinct: 0,
    } satisfies PopulationCounts;
  };
  const allCounts = tally(entries, "all");
  const filteredCounts = tally(
    hasFilter ? filteredEntries : entries,
    "filtered"
  );
  const categories = [...counts.values()].sort(
    (a, b) =>
      b.all - a.all ||
      b.filtered - a.filtered ||
      String(a.value).localeCompare(String(b.value))
  );
  allCounts.distinct = categories.length;
  filteredCounts.distinct = categories.filter(
    (item) => item.filtered > 0
  ).length;
  return {
    kind: "category",
    all: allCounts,
    filtered: hasFilter ? filteredCounts : undefined,
    categories,
  };
}
