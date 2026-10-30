/**
 * The recode() calculation as data: the field it reads, the categories it
 * replaces, and what an unmatched value becomes. The category editor reads
 * and writes this; the calculator evaluates the text.
 */
import type { datum } from "@/types/ChartTypes";
import { parseExpression } from "./parser/semantics";
import type { Expression } from "./types";

/** A category as the data holds it: 1, "1", true, and "true" all differ. */
export type CategoryValue = string | number | boolean | null;

export interface RecodeEntry {
  source: CategoryValue;
  target: string | null;
}

export interface Recode {
  field: string;
  entries: RecodeEntry[];
  /** Absent: an unmatched value keeps its category. */
  fallback?: { value: string | null };
}

/** True when a calculation's result comes straight from recode(). */
export function isRecodeExpression(expression: Expression) {
  return (
    expression.type === "function" &&
    expression.functionName.toLowerCase() === "recode"
  );
}

/** The category a raw value counts as; undefined is missing, like null. */
export function categoryOf(value: datum | Date): CategoryValue | undefined {
  if (value == null) return null;
  if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return value;
  }
  // Dates and non-finite numbers have no literal a formula can match.
  return undefined;
}

/** The formula text for a value, or undefined when it has none. */
export function categoryLiteral(value: CategoryValue): string | undefined {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return String(value);
  const text = String(Math.abs(value));
  if (!/^\d+(\.\d+)?$/.test(text)) return undefined;
  return value < 0 ? `-${text}` : text;
}

export function recodeText(recode: Recode): string {
  const parts = [`[${JSON.stringify(recode.field)}]`];
  for (const entry of recode.entries) {
    const source = categoryLiteral(entry.source);
    if (source === undefined) continue;
    parts.push(`${source}, ${categoryLiteral(entry.target)}`);
  }
  if (recode.fallback) parts.push(categoryLiteral(recode.fallback.value)!);
  return `recode(${parts.join(", ")})`;
}

/** A constant argument's value, or undefined when it isn't one. */
function constant(expression: Expression): CategoryValue | undefined {
  if (expression.type === "literal" && !expression.dependencies.length) {
    const value = expression.value;
    return value instanceof Date ? undefined : (value ?? null);
  }
  if (
    expression.type === "unary" &&
    expression.operator === "-" &&
    expression.operand.type === "literal" &&
    !expression.operand.dependencies.length &&
    typeof expression.operand.value === "number"
  ) {
    return -expression.operand.value;
  }
  return undefined;
}

/**
 * Reads recode() text the editor can show: one field, then constant pairs
 * with text or null targets. Anything else stays a plain formula.
 */
export function readRecode(text: string): Recode | undefined {
  let expression: Expression;
  try {
    expression = parseExpression(text);
  } catch {
    return undefined;
  }
  if (expression.type !== "function" || !isRecodeExpression(expression)) {
    return undefined;
  }
  const [input, ...rest] = expression.arguments;
  if (
    input?.type !== "literal" ||
    input.dependencies.length !== 1 ||
    rest.length < 2
  ) {
    return undefined;
  }
  const values = rest.map(constant);
  if (values.some((value) => value === undefined)) return undefined;
  const isTarget = (value: CategoryValue | undefined) =>
    value === null || typeof value === "string";
  const entries: RecodeEntry[] = [];
  for (let index = 0; index + 1 < values.length; index += 2) {
    const target = values[index + 1];
    if (!isTarget(target)) return undefined;
    entries.push({
      source: values[index] as CategoryValue,
      target: target as string | null,
    });
  }
  const last = values.length % 2 ? values.at(-1) : undefined;
  if (last !== undefined && !isTarget(last)) return undefined;
  return {
    field: input.dependencies[0]!,
    entries,
    ...(last !== undefined
      ? { fallback: { value: last as string | null } }
      : {}),
  };
}

/** Maps one value the way recode() does, from a lookup of its entries. */
export function recodeLookup(recode: Recode) {
  const targets = new Map<CategoryValue, string | null>();
  for (const entry of recode.entries) {
    if (!targets.has(entry.source)) targets.set(entry.source, entry.target);
  }
  return (value: CategoryValue): CategoryValue => {
    const target = targets.get(value);
    if (target !== undefined) return target;
    return recode.fallback ? recode.fallback.value : value;
  };
}
