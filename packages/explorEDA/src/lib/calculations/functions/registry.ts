import { dateTimestamp } from "@/lib/dateTime";
import { utcFormat } from "d3-time-format";
import type { CalculationValue } from "../types";

export function numericValue(value: CalculationValue): number {
  if (value == null || value === "") throw new Error("Missing numeric value");
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !value.trim()) ||
    !Number.isFinite(Number(value))
  ) {
    throw new Error(`Invalid numeric value: ${String(value)}`);
  }
  return Number(value);
}

function dateValue(value: CalculationValue): Date {
  const date =
    value instanceof Date ? value : new Date(dateTimestamp(String(value)));
  if (!Number.isFinite(date.getTime())) {
    throw new Error(`Invalid date: ${String(value)}`);
  }
  return date;
}

interface CalculationFunction {
  syntax: string;
  description: string;
  minArgs: number;
  maxArgs?: number;
  evaluate: (...args: CalculationValue[]) => CalculationValue;
}

// Functions operate on values within one row. Date results use UTC.
export const calculationFunctions: Record<string, CalculationFunction> = {
  sum: {
    description: "Add values within this row.",
    syntax: "sum(x, y, …)",
    minArgs: 1,
    evaluate: (...values) =>
      values.reduce<number>((sum, value) => sum + numericValue(value), 0),
  },
  avg: {
    description: "Average values within this row, not across rows.",
    syntax: "avg(x, y, …)",
    minArgs: 1,
    evaluate: (...values) =>
      values.reduce<number>((sum, value) => sum + numericValue(value), 0) /
      values.length,
  },
  min: {
    description: "Return the smallest supplied value.",
    syntax: "min(x, y, …)",
    minArgs: 1,
    evaluate: (...values) => Math.min(...values.map(numericValue)),
  },
  max: {
    description: "Return the largest supplied value.",
    syntax: "max(x, y, …)",
    minArgs: 1,
    evaluate: (...values) => Math.max(...values.map(numericValue)),
  },
  count: {
    description: "Count supplied arguments, including missing values.",
    syntax: "count(x, y, …)",
    minArgs: 0,
    evaluate: (...values) => values.length,
  },
  formatdate: {
    description: "Format a UTC date. Use %Y-%m for a month label.",
    syntax: 'formatDate(date, "%Y-%m-%d")',
    minArgs: 2,
    maxArgs: 2,
    evaluate: (value, format) => utcFormat(String(format))(dateValue(value)),
  },
  extractdatecomponent: {
    description: "Extract a UTC year, month, day, quarter, or ISO week.",
    syntax: 'extractDateComponent(date, "year")',
    minArgs: 2,
    maxArgs: 2,
    evaluate: (value, component) => {
      const date = dateValue(value);
      switch (component) {
        case "year":
          return date.getUTCFullYear();
        case "month":
          return date.getUTCMonth() + 1;
        case "day":
          return date.getUTCDate();
        case "quarter":
          return Math.floor(date.getUTCMonth() / 3) + 1;
        case "week":
          return Number(utcFormat("%V")(date));
        default:
          throw new Error(`Unknown date component: ${String(component)}`);
      }
    },
  },
};

export function getFunction(
  name: string,
  argumentCount: number
): CalculationFunction {
  const key = name.toLowerCase();
  const fn = Object.hasOwn(calculationFunctions, key)
    ? calculationFunctions[key]
    : undefined;
  if (!fn) throw new Error(`Unknown function: ${name}`);
  if (
    argumentCount < fn.minArgs ||
    (fn.maxArgs !== undefined && argumentCount > fn.maxArgs)
  ) {
    throw new Error(`Invalid arguments. Use ${fn.syntax}`);
  }
  return fn;
}
