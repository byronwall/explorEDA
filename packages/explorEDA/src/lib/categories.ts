import type { datum } from "@/types/ChartTypes";

export const categoryValue = (value: datum): datum => value ?? null;
export const categoryKey = (value: datum): string => {
  if (value == null) return JSON.stringify(["missing"]);
  if (typeof value === "number" && !Number.isFinite(value)) {
    return JSON.stringify(["number", String(value)]);
  }
  return JSON.stringify([typeof value, value]);
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
