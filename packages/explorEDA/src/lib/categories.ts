import type { datum } from "@/types/ChartTypes";

export const categoryValue = (value: datum): datum => value ?? null;
const MISSING_KEY = JSON.stringify(["missing"]);
const TRUE_KEY = JSON.stringify(["boolean", true]);
const FALSE_KEY = JSON.stringify(["boolean", false]);
// Charts key every row, so string keys are kept rather than serialized
// again. The cache starts over once a field has very many distinct values.
const STRING_KEY_LIMIT = 10_000;
const stringKeys = new Map<string, string>();

/**
 * A key that keeps values of different types apart, such as 1 and "1". It
 * is the JSON text of `[typeof value, value]`, built without serializing a
 * finite number or a seen string again.
 */
export const categoryKey = (value: datum): string => {
  if (value == null) return MISSING_KEY;
  if (typeof value === "number") {
    // A finite number's JSON text is its string form, with -0 as "0".
    return Number.isFinite(value)
      ? `["number",${value}]`
      : JSON.stringify(["number", String(value)]);
  }
  if (typeof value === "boolean") return value ? TRUE_KEY : FALSE_KEY;
  let key = stringKeys.get(value);
  if (key === undefined) {
    if (stringKeys.size >= STRING_KEY_LIMIT) stringKeys.clear();
    key = `["string",${JSON.stringify(value)}]`;
    stringKeys.set(value, key);
  }
  return key;
};

export function categoryEqual(left: datum, right: datum): boolean {
  return (
    (left == null && right == null) ||
    left === right ||
    (typeof left === "number" &&
      typeof right === "number" &&
      Number.isNaN(left) &&
      Number.isNaN(right))
  );
}

export function categoryIncludes(values: datum[], value: datum): boolean {
  return (
    values.includes(value) ||
    (value == null && values.some((item) => item == null))
  );
}

export function categoryLabel(value: datum): string {
  if (value == null) return "(missing)";
  if (
    typeof value === "string" &&
    (!value.trim() ||
      !Number.isNaN(Number(value)) ||
      /^(true|false|null|undefined|NaN|Other categories|\(missing\))$/.test(
        value
      ) ||
      value.startsWith('"'))
  )
    return JSON.stringify(value);
  return String(value);
}
