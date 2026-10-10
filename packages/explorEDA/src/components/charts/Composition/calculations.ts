import { finiteNumber, timestampOf } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";
import type {
  CompositionCalculation,
  CompositionDefinition,
} from "./compositionTypes";
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
  /** Dates come back as timestamps and format as dates. */
  kind: "number" | "date";
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

export function formatCalcValue(value: number | undefined, kind: CalcResult["kind"]) {
  if (value === undefined) return "–";
  return kind === "date"
    ? dateFormat.format(new Date(value))
    : numberFormat.format(value);
}

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
  const shownKind = kind === "date" && calc.aggregation !== "sum" ? "date" : "number";
  return {
    calcId: calc.id,
    value,
    kind: shownKind,
    text: formatCalcValue(value, shownKind),
    rowIds,
    instanceKey,
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

/** A short sentence that says which rows a calculation reads. */
export function describeCalc(calc: CompositionCalculation) {
  const of =
    calc.aggregation === "count" || !calc.field
      ? "Row count"
      : `${calc.aggregation[0]!.toUpperCase()}${calc.aggregation.slice(1)} of ${calc.field}`;
  return `${of} over ${POPULATION_TEXT[calc.population]}, ${
    calc.filters === "ignore"
      ? "ignoring filters"
      : "after the active filters"
  }`;
}
