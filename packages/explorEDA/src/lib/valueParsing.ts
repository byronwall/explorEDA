import type { datum } from "@/types/ChartTypes";

/**
 * Every rule for reading raw values as missing, numbers, booleans, or dates.
 * Type detection, conversion, filters, bins, and charts all call these helpers
 * so one value never reads two ways.
 */

// Missing values ------------------------------------------------------------

/**
 * Missing values (null, undefined, and blank or whitespace-only strings) are
 * not measurements.
 */
export function isMissingValue(value: datum): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  );
}

// Numbers -------------------------------------------------------------------

// Number() also reads "0x1A", "0b11", and "0o17"; those are labels, not measurements.
const RADIX_PREFIX = /^\s*[+-]?0[xbo]/i;

/**
 * The number a value reads as, or NaN. Booleans, blanks, and radix-prefixed
 * text are not numbers. Non-finite text such as "Infinity" reads as itself.
 */
export function parseNumber(value: datum): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string" || value.trim() === "") return NaN;
  if (RADIX_PREFIX.test(value)) return NaN;
  return Number(value);
}

/**
 * True when a present value reads as a number, finite or not. Booleans are not
 * numbers. Numbers and numeric strings that are not finite (NaN, Infinity,
 * -Infinity) belong to a numeric field but are excluded from measurements,
 * bins, extents, and aggregates.
 */
export function isNumberLike(value: datum): boolean {
  if (typeof value === "number") return true;
  if (typeof value !== "string" || value.trim() === "") return false;
  return value.trim() === "NaN" || !Number.isNaN(parseNumber(value));
}

export type NumericExclusionReason =
  | "Missing value"
  | "Blank value"
  | "Boolean values are not numeric"
  | "Not a finite number";

export function numericExclusionReason(
  value: datum
): NumericExclusionReason | undefined {
  if (value === undefined || value === null || value === "") {
    return "Missing value";
  }
  if (typeof value === "boolean") return "Boolean values are not numeric";
  if (typeof value === "string" && value.trim() === "") return "Blank value";
  return Number.isFinite(parseNumber(value))
    ? undefined
    : "Not a finite number";
}

/** The finite measurement for a value, or undefined when it is ineligible. */
export function finiteNumber(value: datum): number | undefined {
  const number = parseNumber(value);
  return Number.isFinite(number) ? number : undefined;
}

/** Finite measurements from a list of values, in input order. */
export function finiteNumbers(values: Iterable<datum>): number[] {
  const numbers: number[] = [];
  for (const value of values) {
    const number = finiteNumber(value);
    if (number !== undefined) numbers.push(number);
  }
  return numbers;
}

// Booleans ------------------------------------------------------------------

/** true or false for booleans and "true"/"false" text in any case, else undefined. */
export function parseBoolean(value: datum): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const text = value.trim().toLowerCase();
  return text === "true" ? true : text === "false" ? false : undefined;
}

// Dates ---------------------------------------------------------------------

/**
 * How numeric dates such as 01/02/2025 are read. "iso" accepts only ISO dates
 * and date-times. Without a preset, ISO, month-first numeric dates, and
 * month-name dates are all accepted.
 */
export type DatePreset = "iso" | "month-day-year" | "day-month-year";

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
const MONTH_NAME =
  /^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?$/i;
const WEEKDAY = /^(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?$/i;

// 08:00, 8:00:05.250, 8:00 PM, 08:00:00Z, 08:00+05:30, 08:00 GMT
const TIME =
  /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(?:\s*([ap])\.?m\.?)?\s*(z|utc|gmt|[+-]\d{2}:?\d{2})?$/i;
const ISO = /^(\d{4})-(\d{2})(?:-(\d{2}))?(?:[T ](.+))?$/i;
const YEAR_FIRST = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[T ](.+))?$/i;
const YEAR_LAST = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})(?:[T ](.+))?$/i;

function calendarTime(
  year: number,
  month: number,
  day: number,
  time = 0
): number {
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCFullYear(year);
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date.getTime() + time
    : NaN;
}

/** Milliseconds into the day, shifted to UTC by any offset; NaN when invalid. */
function timeOfDay(text: string | undefined): number {
  if (text === undefined) return 0;
  const match = TIME.exec(text.trim());
  if (!match) return NaN;
  const [, hourText, minuteText, secondText, fraction, meridiem, zone] = match;
  let hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText ?? 0);
  if (meridiem) {
    if (hour < 1 || hour > 12) return NaN;
    hour = (hour % 12) + (meridiem.toLowerCase() === "p" ? 12 : 0);
  }
  if (hour > 23 || minute > 59 || second > 59) return NaN;
  const ms = fraction ? Math.round(Number(`0.${fraction}`) * 1000) : 0;
  let offset = 0;
  if (zone && /^[+-]/.test(zone)) {
    const digits = zone.replace(":", "");
    const minutes = Number(digits.slice(1, 3)) * 60 + Number(digits.slice(3));
    offset = (zone.startsWith("-") ? -1 : 1) * minutes * 60_000;
  }
  return ((hour * 60 + minute) * 60 + second) * 1000 + ms - offset;
}

function fullYear(text: string): number {
  const year = Number(text);
  if (text.length === 4) return year;
  return year < 50 ? 2000 + year : 1900 + year;
}

function monthNameDate(text: string): number {
  // Jan 15 2025, January 15, 2025, 15 Jan 2025, Wed, 15 Jan 2025 08:00:00 GMT
  const tokens = text.split(/[\s,]+/).filter(Boolean);
  if (tokens[0] && WEEKDAY.test(tokens[0])) tokens.shift();
  const [first = "", second = "", yearText = "", ...rest] = tokens;
  const firstMonth = MONTH_NAME.exec(first);
  const secondMonth = MONTH_NAME.exec(second);
  const monthText = firstMonth?.[1] ?? secondMonth?.[1];
  const dayText = firstMonth ? second : first;
  if (!monthText || !/^\d{1,2}$/.test(dayText) || !/^\d{4}$/.test(yearText)) {
    return NaN;
  }
  const month = MONTHS.indexOf(monthText.slice(0, 3).toLowerCase()) + 1;
  return calendarTime(
    Number(yearText),
    month,
    Number(dayText),
    timeOfDay(rest.length ? rest.join(" ") : undefined)
  );
}

/**
 * Milliseconds since the epoch for date text, or NaN when the text is not a
 * date. Unlike Date.parse, this rejects labels like "Depot 2" and impossible
 * days like 2025-02-30, and reads every form without an offset as UTC.
 */
export function parseDateText(value: string, preset?: DatePreset): number {
  const text = value.trim();

  const iso = ISO.exec(text);
  if (iso) {
    const [, year, month, day, time] = iso;
    if (day === undefined && time !== undefined) return NaN;
    return calendarTime(
      Number(year),
      Number(month),
      Number(day ?? 1),
      timeOfDay(time)
    );
  }
  if (preset === "iso") return NaN;

  const yearLast = YEAR_LAST.exec(text);
  if (yearLast) {
    const [, first, second, year, time] = yearLast;
    if (preset !== undefined && year!.length !== 4) return NaN;
    const dayFirst = preset === "day-month-year";
    return calendarTime(
      fullYear(year!),
      Number(dayFirst ? second : first),
      Number(dayFirst ? first : second),
      timeOfDay(time)
    );
  }
  if (preset !== undefined) return NaN;

  const yearFirst = YEAR_FIRST.exec(text);
  if (yearFirst) {
    const [, year, month, day, time] = yearFirst;
    return calendarTime(
      Number(year),
      Number(month),
      Number(day),
      timeOfDay(time)
    );
  }
  return monthNameDate(text);
}

/**
 * A date filter bound. A date-only upper bound such as 2025-01-31 covers that
 * whole day.
 */
export function dateBound(text: string, end = false): number {
  const trimmed = text.trim();
  return parseDateText(
    end && /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
      ? `${trimmed}T23:59:59.999Z`
      : trimmed
  );
}

/** True when text reads as a date under {@link parseDateText}. */
export function isDateText(value: string, preset?: DatePreset): boolean {
  return Number.isFinite(parseDateText(value, preset));
}

/**
 * The timestamp for a date value: finite numbers are already timestamps and
 * text goes through {@link parseDateText}. Undefined for anything else.
 */
export function timestampOf(value: datum | Date): number | undefined {
  const time =
    value instanceof Date
      ? value.getTime()
      : typeof value === "number"
        ? value
        : typeof value === "string"
          ? parseDateText(value)
          : NaN;
  return Number.isFinite(time) ? time : undefined;
}
