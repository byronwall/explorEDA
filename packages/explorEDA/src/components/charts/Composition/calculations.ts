import { finiteNumber, timestampOf } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";
import type {
  CompositionCalculation,
  CompositionDefinition,
} from "./compositionTypes";
import { orderedRows } from "./ordering";
import type { CompositionData } from "./resolveUnit";

/** One repeat's rows, when a calculation runs for a repeat. */
export interface CalcSubset {
  key: string;
  allIds: number[];
  liveIds: number[];
}

export interface CalcResult {
  calcId: string;
  value?: number;
  /** Dates come back as timestamps and format as dates; a change formats as a signed percent; a difference keeps its sign. */
  kind: "number" | "date" | "percent" | "signed";
  text: string;
  /** The rows the value was computed from. */
  rowIds: number[];
  /** The repeat whose rows were used, when the population is a repeat. */
  instanceKey?: string;
}

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

export function formatCalcValue(
  value: number | undefined,
  kind: CalcResult["kind"]
) {
  if (value === undefined) return "–";
  if (kind === "date") return dateFormat.format(new Date(value));
  if (kind === "percent") return percentFormat.format(value);
  if (kind === "signed") return signedFormat.format(value);
  return numberFormat.format(value);
}

const ORDERED = new Set<CompositionCalculation["aggregation"]>([
  "first",
  "last",
  "change",
  "difference",
]);

const signedFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

/** The rows a calculation reads: its population, then its filter policy. */
export function calcRows(
  calc: CompositionCalculation,
  data: CompositionData,
  subset?: CalcSubset
) {
  const scope =
    calc.population === "repeat" && subset
      ? subset
      : { allIds: data.allIds, liveIds: data.liveIds };
  return calc.filters === "ignore" ? scope.allIds : scope.liveIds;
}

/**
 * Computes a calculation. Without a subset, a per-repeat calculation covers
 * the whole composition, as it does in page text.
 */
export function evaluateCalc(
  calc: CompositionCalculation,
  data: CompositionData,
  subset?: CalcSubset
): CalcResult {
  const rowIds = calcRows(calc, data, subset);
  const instanceKey =
    calc.population === "repeat" && subset ? subset.key : undefined;
  if (calc.aggregation === "count" || !calc.field) {
    const value = rowIds.length;
    return {
      calcId: calc.id,
      value,
      kind: "number",
      text: formatCalcValue(value, "number"),
      rowIds,
      instanceKey,
    };
  }
  const column = data.column(calc.field);
  if (ORDERED.has(calc.aggregation)) {
    const ends = orderedEnds(
      column,
      rowIds,
      calc.orderField ? data.column(calc.orderField) : undefined
    );
    let value: number | undefined;
    let kind: CalcResult["kind"] = ends?.kind ?? "number";
    if (ends) {
      if (calc.aggregation === "first") value = ends.first;
      else if (calc.aggregation === "last") value = ends.last;
      else if (calc.aggregation === "difference") {
        value = ends.last - ends.first;
        kind = "signed";
      } else {
        // The change from the first value to the last, as a share of the first.
        value =
          ends.first === 0 ? undefined : (ends.last - ends.first) / ends.first;
        kind = "percent";
      }
    }
    return {
      calcId: calc.id,
      value,
      kind,
      text: formatCalcValue(value, kind),
      rowIds,
      instanceKey,
    };
  }
  const { values, kind } = readValues(column, rowIds);
  let value: number | undefined;
  if (values.length) {
    switch (calc.aggregation) {
      case "sum":
        value = values.reduce((total, item) => total + item, 0);
        break;
      case "average":
        value = values.reduce((total, item) => total + item, 0) / values.length;
        break;
      case "min":
        value = values.reduce((min, item) => Math.min(min, item), Infinity);
        break;
      case "max":
        value = values.reduce((max, item) => Math.max(max, item), -Infinity);
        break;
    }
  }
  // A sum of dates means nothing; show it as a number.
  const shownKind =
    kind === "date" && calc.aggregation !== "sum" ? "date" : "number";
  return {
    calcId: calc.id,
    value,
    kind: shownKind,
    text: formatCalcValue(value, shownKind),
    rowIds,
    instanceKey,
  };
}

/**
 * The field's value in the first and last rows that have one, in the order
 * of another field. Rows without an order value are left out, as a path
 * leaves them out.
 */
function orderedEnds(
  column: Record<number, datum>,
  ids: number[],
  orderColumn: Record<number, datum> | undefined
) {
  const rows = orderedRows(ids, orderColumn).filter(
    (row) => !orderColumn || row.order !== undefined
  );
  const readable = rows.filter((row) => {
    const value = column[row.id];
    return (
      finiteNumber(value) !== undefined || timestampOf(value) !== undefined
    );
  });
  if (!readable.length) return undefined;
  const firstRaw = column[readable[0]!.id];
  const lastRaw = column[readable[readable.length - 1]!.id];
  const numeric = finiteNumber(firstRaw) !== undefined;
  const read = (value: datum) =>
    numeric ? finiteNumber(value) : timestampOf(value);
  const first = read(firstRaw);
  const last = read(lastRaw);
  if (first === undefined || last === undefined) return undefined;
  return {
    first,
    last,
    kind: numeric ? ("number" as const) : ("date" as const),
  };
}

/** Numbers when the field has any, otherwise dates as timestamps. */
function readValues(column: Record<number, datum>, ids: number[]) {
  const numbers: number[] = [];
  for (const id of ids) {
    const value = column[id];
    if (typeof value === "boolean") continue;
    const number = finiteNumber(value);
    if (number !== undefined) numbers.push(number);
  }
  if (numbers.length) return { values: numbers, kind: "number" as const };
  const dates: number[] = [];
  for (const id of ids) {
    const value = column[id];
    if (typeof value !== "string") continue;
    const time = timestampOf(value);
    if (time !== undefined) dates.push(time);
  }
  return { values: dates, kind: "date" as const };
}

/** Replaces `{Calculation name}` in page text with that value. */
export function fillCalcTokens(
  text: string,
  definition: CompositionDefinition,
  data: CompositionData
) {
  if (!text.includes("{") || !definition.calculations.length) return text;
  return text.replace(/\{([^{}]+)\}/g, (token, name: string) => {
    const calc = definition.calculations.find(
      (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    return calc ? evaluateCalc(calc, data).text : token;
  });
}

const POPULATION_TEXT = {
  repeat: "each repeat's rows",
  composition: "every row in the graphic",
};

const ORDERED_TEXT = {
  first: "First value of",
  last: "Last value of",
  change: "Change from first to last value of",
  difference: "Last minus first value of",
};

/** A short sentence that says which rows a calculation reads. */
export function describeCalc(calc: CompositionCalculation) {
  const of =
    calc.aggregation === "count" || !calc.field
      ? "Row count"
      : calc.aggregation in ORDERED_TEXT
        ? `${ORDERED_TEXT[calc.aggregation as keyof typeof ORDERED_TEXT]} ${calc.field}${
            calc.orderField ? ` by ${calc.orderField}` : ""
          }`
        : `${calc.aggregation[0]!.toUpperCase()}${calc.aggregation.slice(1)} of ${calc.field}`;
  return `${of} over ${POPULATION_TEXT[calc.population]}, ${
    calc.filters === "ignore" ? "ignoring filters" : "after the active filters"
  }`;
}
