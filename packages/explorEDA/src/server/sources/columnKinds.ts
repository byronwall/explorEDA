/**
 * Column kinds from the values a column holds, for databases that don't
 * enforce a column's type. A declared type only narrows what the values
 * already show: a `date` column of ISO text reads as dates, and a
 * `boolean` column of 0 and 1 reads as booleans.
 */
import type { Column, Kind } from "../../lib/readers/typedColumns";
import { SourceReadError } from "./types";

const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

function present(values: readonly unknown[]) {
  return values.filter((value) => value !== null && value !== undefined);
}

/** Throws for binary values, which a chart can't use. */
export function refuseBinary(
  sourceId: string,
  name: string,
  values: readonly unknown[]
) {
  // Drivers return bytes as typed arrays or Buffers, from whichever realm
  // made them, so `instanceof` can't tell.
  if (values.some((value) => ArrayBuffer.isView(value))) {
    throw new SourceReadError(
      "unsupported-type",
      `${sourceId}.${name} holds binary data, which explorEDA can't chart.`,
      `Leave ${name} out by listing the columns you need with sql=.`
    );
  }
}

/** The kind of values a column holds, guided by its declared type. */
export function kindFromValues(
  values: readonly unknown[],
  declared = ""
): Kind {
  const items = present(values);
  if (!items.length) {
    return "text";
  }
  const type = declared.toLowerCase();
  const isInteger = (value: unknown) =>
    typeof value === "bigint" ||
    (typeof value === "number" && Number.isInteger(value));
  const isNumber = (value: unknown) =>
    typeof value === "bigint" ||
    (typeof value === "number" && Number.isFinite(value));
  if (
    type.includes("bool") &&
    items.every(
      (value) => isInteger(value) && Number(value) <= 1 && Number(value) >= 0
    )
  ) {
    return "boolean";
  }
  if (items.every((value) => typeof value === "boolean")) {
    return "boolean";
  }
  if (items.every(isInteger)) {
    return "integer";
  }
  if (items.every(isNumber)) {
    return "float";
  }
  if (
    (type.includes("date") || type.includes("time")) &&
    items.every((value) => typeof value === "string" && ISO_DATE.test(value))
  ) {
    return "timestamp";
  }
  return "text";
}

/** A typed column read from values, as `convertColumn` takes it. */
export function columnFromValues(
  name: string,
  values: readonly unknown[],
  declared?: string
): Column {
  // ISO text keeps its own zone, or lack of one, as written.
  return { name, kind: kindFromValues(values, declared), scale: 0, utc: true };
}

/** `2024-01-02 03:04:05+00` as ISO text: `2024-01-02T03:04:05Z`. */
export function isoTimestamp(value: string) {
  return value
    .replace(" ", "T")
    .replace(/\+00(:00)?$/, "Z")
    .replace(/([+-]\d{2})$/, "$1:00");
}

/**
 * A numeric column as unscaled integers and one scale, the form
 * `convertColumn` takes. Undefined when a value isn't a finite number.
 */
export function decimalColumn(values: unknown[]) {
  let scale = 0;
  for (const value of values) {
    if (typeof value !== "string") continue;
    if (!/^-?\d+(\.\d+)?$/.test(value)) return undefined;
    scale = Math.max(scale, value.split(".")[1]?.length ?? 0);
  }
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (typeof value !== "string") continue;
    const [whole, fraction = ""] = value.split(".");
    values[index] = BigInt(`${whole}${fraction.padEnd(scale, "0")}`);
  }
  return scale;
}
