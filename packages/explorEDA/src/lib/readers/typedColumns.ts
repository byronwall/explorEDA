import type { FieldDefinition } from "@/types/AnalysisProject";

/** What a typed column holds, from a binary file's schema. */
export type Kind =
  | "integer"
  | "float"
  | "decimal"
  | "boolean"
  | "date"
  | "timestamp"
  | "time"
  | "text"
  | "json";

export interface Column {
  name: string;
  kind: Kind;
  /** Decimal scale; for times and timestamps, fractional digits (0 to 9). */
  scale: number;
  /** Timestamps without a zone show wall-clock time. */
  utc: boolean;
  /** Dates stored as days (the default) or as milliseconds. */
  dateUnit?: "day" | "ms";
}

const decoder = new TextDecoder();

/** ISO text for an epoch count, keeping every digit the unit stores. */
export function isoFromEpoch(value: bigint, digits: number, utc: boolean) {
  const perSecond = 10n ** BigInt(digits);
  let seconds = value / perSecond;
  let fraction = value % perSecond;
  if (fraction < 0n) {
    seconds -= 1n;
    fraction += perSecond;
  }
  const whole = new Date(Number(seconds) * 1000).toISOString().slice(0, 19);
  const part =
    fraction === 0n
      ? ""
      : `.${fraction.toString().padStart(digits, "0").replace(/0+$/, "")}`;
  return `${whole}${part}${utc ? "Z" : ""}`;
}

/** The exact decimal text for an unscaled integer and its scale. */
export function decimalText(unscaled: bigint, scale: number): string {
  const negative = unscaled < 0n;
  const digits = (negative ? -unscaled : unscaled)
    .toString()
    .padStart(scale + 1, "0");
  const whole = scale > 0 ? digits.slice(0, -scale) : digits;
  const fraction = scale > 0 ? `.${digits.slice(-scale)}` : "";
  return `${negative ? "-" : ""}${whole}${fraction}`;
}

/** A two's-complement big-endian integer. */
function bytesToBigInt(bytes: Uint8Array): bigint {
  let value = 0n;
  for (const byte of bytes) value = value * 256n + BigInt(byte);
  const bits = BigInt(bytes.length * 8);
  return bytes.length > 0 && value >= 1n << (bits - 1n)
    ? value - (1n << bits)
    : value;
}

export const toBigInt = (value: unknown): bigint =>
  typeof value === "bigint"
    ? value
    : value instanceof Uint8Array
      ? bytesToBigInt(value)
      : BigInt(value as number);

const jsonText = (value: unknown) =>
  JSON.stringify(value, (_key, item: unknown) =>
    typeof item === "bigint"
      ? Number.isSafeInteger(Number(item))
        ? Number(item)
        : item.toString()
      : item instanceof Uint8Array
        ? decoder.decode(item)
        : ArrayBuffer.isView(item) && !(item instanceof DataView)
          ? Array.from(item as unknown as ArrayLike<number | bigint>)
          : item instanceof Date
            ? item.toISOString()
            : item
  );

function timeText(value: unknown, digits: number) {
  const count = toBigInt(value);
  return isoFromEpoch(count, digits, false).slice(11);
}

/** Significant digits in an integer's text, ignoring sign and leading zeros. */
const significant = (text: string) =>
  text.replace(/^-/, "").replace(".", "").replace(/^0+/, "").length;

/**
 * Converts one column's decoded values. Numbers that a JavaScript number
 * holds exactly stay numbers; when any value in an integer or decimal column
 * would round, the whole column keeps exact text instead.
 */
export function convertColumn(column: Column, values: unknown[]) {
  const out: (string | number | boolean | null)[] = new Array(values.length);
  let type: FieldDefinition["type"] = "string";
  switch (column.kind) {
    case "integer": {
      const ints = values.map((value) =>
        value === null || value === undefined ? null : toBigInt(value)
      );
      const exact = ints.every(
        (value) => value === null || Number.isSafeInteger(Number(value))
      );
      ints.forEach((value, index) => {
        out[index] =
          value === null ? null : exact ? Number(value) : value.toString();
      });
      type = exact ? "number" : "string";
      break;
    }
    case "decimal": {
      const texts = values.map((value) =>
        value === null || value === undefined
          ? null
          : decimalText(toBigInt(value), column.scale)
      );
      const exact = texts.every(
        (text) => text === null || significant(text) <= 15
      );
      texts.forEach((text, index) => {
        out[index] = text === null ? null : exact ? Number(text) : text;
      });
      type = exact ? "number" : "string";
      break;
    }
    case "float":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined ? null : Number(value);
      });
      type = "number";
      break;
    case "boolean":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined ? null : Boolean(value);
      });
      type = "boolean";
      break;
    case "timestamp":
      values.forEach((value, index) => {
        if (value === null || value === undefined) {
          out[index] = null;
        } else if (typeof value === "string") {
          out[index] = column.utc ? value : value.replace(/Z$/, "");
        } else {
          out[index] = isoFromEpoch(toBigInt(value), column.scale, column.utc);
        }
      });
      type = "date";
      break;
    case "date":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined
            ? null
            : new Date(
                Number(value) * (column.dateUnit === "ms" ? 1 : 86400000)
              )
                .toISOString()
                .slice(0, 10);
      });
      type = "date";
      break;
    case "time":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined
            ? null
            : timeText(value, column.scale);
      });
      break;
    case "json":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined ? null : jsonText(value);
      });
      break;
    case "text":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined
            ? null
            : value instanceof Uint8Array
              ? decoder.decode(value)
              : String(value);
      });
      break;
  }
  return { values: out, type };
}
