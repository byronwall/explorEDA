/**
 * Written findings are declared as calculations, not typed numbers. The page
 * shows each one with the rows it read, and the corpus test recomputes every
 * statement from the piece's local data, so prose cannot drift from the data.
 */
type Row = Record<string, unknown>;
type Comparison = "eq" | "ne" | "lt" | "le" | "gt" | "ge";
export type Condition = [field: string, comparison: Comparison, value: unknown];

export interface DailyFinding {
  /** The sentence, with `{value}` where the computed number goes. */
  text: string;
  /** Python-style number format: `.2f`, `,.1f`, `.0f`. */
  format: string;
  op:
    | "count"
    | "mean"
    | "median"
    | "min"
    | "max"
    | "sum"
    | "quantile"
    | "corr"
    | "share"
    | "missing_share"
    | "top_share"
    | "ratio_sums"
    | "weighted_mean";
  field: string;
  /** Query id when it differs from the piece's own query. */
  query?: string;
  where?: Condition[];
  /** Rows that count toward a `share`. */
  condition?: Condition[];
  other?: string;
  weight?: string;
  q?: number;
  k?: number;
  scale?: number;
}

export interface FindingResult {
  statement: string;
  value: number;
  /** Rows the calculation read, after `where` and missing values. */
  rows: Row[];
}

const NUMBER = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i;

/** A prepared CSV cell as a number, or null for a blank or non-numeric cell. */
export function numeric(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && NUMBER.test(value.trim()))
    return Number(value);
  return null;
}

const missing = (value: unknown) =>
  value === null || value === undefined || value === "";

function matches(row: Row, [field, comparison, expected]: Condition) {
  const value = row[field];
  if (comparison === "eq" || comparison === "ne") {
    const equal =
      typeof expected === "number"
        ? numeric(value) === expected
        : String(value ?? "") === String(expected);
    return comparison === "eq" ? equal : !equal;
  }
  // ISO dates compare as text: "2021-02-14" < "2021-02-14T06:00:00Z".
  if (typeof expected === "string" && numeric(expected) === null) {
    const text = String(value ?? "");
    if (!text) return false;
    if (comparison === "lt") return text < expected;
    if (comparison === "le") return text <= expected;
    if (comparison === "gt") return text > expected;
    return text >= expected;
  }
  const number = numeric(value);
  const bound = Number(expected);
  if (number === null) return false;
  if (comparison === "lt") return number < bound;
  if (comparison === "le") return number <= bound;
  if (comparison === "gt") return number > bound;
  return number >= bound;
}

const filter = (rows: readonly Row[], conditions: Condition[] = []) =>
  rows.filter((row) =>
    conditions.every((condition) => matches(row, condition))
  );

/** Linear interpolation between order statistics, as pandas does by default. */
function quantile(sorted: number[], q: number) {
  const position = (sorted.length - 1) * q;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  return sorted[low]! + (sorted[high]! - sorted[low]!) * (position - low);
}

function correlation(x: number[], y: number[]) {
  const mx = x.reduce((a, b) => a + b, 0) / x.length;
  const my = y.reduce((a, b) => a + b, 0) / y.length;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  x.forEach((xi, i) => {
    sxy += (xi - mx) * (y[i]! - my);
    sxx += (xi - mx) ** 2;
    syy += (y[i]! - my) ** 2;
  });
  return sxy / Math.sqrt(sxx * syy);
}

/** Formats like Python's `format(value, ",.2f")`, the notation findings use. */
export function formatValue(value: number, format: string) {
  const match = /^(,)?\.(\d+)f$/.exec(format);
  if (!match) throw new Error(`Unsupported finding format "${format}".`);
  const digits = Number(match[2]);
  // Python rounds an exact binary tie, such as 15.625, to even; toFixed
  // rounds it away from zero. The long expansion shows whether it is exact.
  const expansion = value.toFixed(Math.min(100, digits + 40));
  const rest = expansion.slice(expansion.length - 40);
  const kept = BigInt(expansion.slice(0, -40).replace(/[-.]/g, "") || "0");
  const fixed =
    /^50*$/.test(rest) && kept % 2n === 0n
      ? expansion.slice(0, digits ? -40 : -41)
      : value.toFixed(digits);
  if (!match[1]) return fixed;
  const [integer, fraction] = fixed.split(".");
  const grouped = integer!.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

/**
 * Query rows key fields by source, as `r.co2`; findings name the bare field.
 * Returns rows keyed by bare field names alongside the originals.
 */
function bareFields(rows: readonly Row[]) {
  const first = rows[0];
  if (!first || !Object.keys(first).some((key) => key.includes(".")))
    return rows;
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key.slice(key.indexOf(".") + 1),
        value,
      ])
    )
  );
}

export function evaluateFinding(
  finding: DailyFinding,
  queryRows: readonly Row[]
): FindingResult {
  const allRows = bareFields(queryRows);
  const scoped = filter(allRows, finding.where);
  const present = (row: Row, ...fields: string[]) =>
    fields.every((field) => numeric(row[field]) !== null);
  const values = (rows: Row[], field: string) =>
    rows.map((row) => numeric(row[field])!);
  let rows: Row[];
  let value: number;
  switch (finding.op) {
    case "count":
      rows = scoped;
      value = rows.length;
      break;
    case "share":
      rows = scoped;
      value = (100 * filter(rows, finding.condition).length) / rows.length;
      break;
    case "missing_share":
      rows = scoped;
      value =
        (100 * rows.filter((row) => missing(row[finding.field])).length) /
        rows.length;
      break;
    case "corr":
      rows = scoped.filter((row) =>
        present(row, finding.field, finding.other!)
      );
      value = correlation(
        values(rows, finding.field),
        values(rows, finding.other!)
      );
      break;
    case "ratio_sums":
    case "weighted_mean": {
      const by = finding.other ?? finding.weight!;
      rows = scoped.filter((row) => present(row, finding.field, by));
      const denominator = values(rows, by).reduce((a, b) => a + b, 0);
      const numerator =
        finding.op === "ratio_sums"
          ? values(rows, finding.field).reduce((a, b) => a + b, 0)
          : rows.reduce(
              (sum, row) =>
                sum + numeric(row[finding.field])! * numeric(row[by])!,
              0
            );
      value = ((finding.scale ?? 1) * numerator) / denominator;
      break;
    }
    default: {
      rows = scoped.filter((row) => present(row, finding.field));
      const list = values(rows, finding.field);
      const sorted = [...list].sort((a, b) => a - b);
      const total = list.reduce((a, b) => a + b, 0);
      if (finding.op === "mean") value = total / list.length;
      else if (finding.op === "sum") value = total;
      else if (finding.op === "min") value = sorted[0]!;
      else if (finding.op === "max") value = sorted[sorted.length - 1]!;
      else if (finding.op === "median") value = quantile(sorted, 0.5);
      else if (finding.op === "quantile") value = quantile(sorted, finding.q!);
      else {
        const top = sorted.slice(-(finding.k ?? 1));
        value = (100 * top.reduce((a, b) => a + b, 0)) / total;
      }
    }
  }
  if (!rows.length || !Number.isFinite(value))
    throw new Error(`Finding "${finding.text}" has no rows to read.`);
  return {
    value,
    rows,
    statement: finding.text.replace(
      "{value}",
      formatValue(value, finding.format)
    ),
  };
}
