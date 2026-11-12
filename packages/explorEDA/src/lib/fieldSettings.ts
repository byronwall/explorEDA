import {
  type DatePreset,
  parseBoolean,
  parseDateText,
  parseNumber,
  timestampOf,
} from "@/lib/valueParsing";
import {
  isNumberInput,
  NUMBER_INPUT_IDS,
  NUMBER_INPUTS,
  parseNumberInput,
  PLAIN_NUMBER_LABEL,
  type NumberInput,
} from "@/lib/numericInput";
import type { datum } from "@/types/ChartTypes";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";

export type { DatePreset, NumberInput };
export type FieldFormat =
  | "auto"
  | "number"
  | "currency"
  | "percent"
  | "date"
  | "datetime";

export interface FieldSettings {
  type?: DataType;
  label?: string;
  description?: string;
  format?: FieldFormat;
  precision?: number;
  unit?: string;
  currency?: string;
  datePreset?: DatePreset;
  /** How a numeric field's text writes decimals and digit groups. */
  numberInput?: NumberInput;
  /** Text values end in %, and 12% reads as 0.12. */
  percentInput?: boolean;
  /** Text in parentheses, such as (1,234.50), reads as negative. */
  accountingInput?: boolean;
  /** Text can carry the `currency` code's sign, such as $5.00 or USD 5.00. */
  currencyInput?: boolean;
  nullTokens?: string[];
}

export type FieldSettingsMap = Record<string, FieldSettings>;

export interface ConversionFailure {
  row: number;
  raw: datum;
  reason: string;
}

export interface ConversionPreview {
  field: string;
  inferredType: DataType;
  effectiveType: DataType;
  totalCount: number;
  validCount: number;
  missingCount: number;
  failedCount: number;
  failures: ConversionFailure[];
  /**
   * Rows to review, up to REVIEW_LIMIT of each kind: text another number
   * input reads as a different number, text whose value changes when read
   * (1,234.50 to 1234.5), and values that read as they are written.
   */
  review: Record<ReviewKind, ConversionExample[]>;
  /** Text values that read as a different number in another convention. */
  ambiguousCount: number;
  changedCount: number;
  unchangedCount: number;
  /** Valid and failed counts for each number input convention. */
  numberInputs?: Array<{
    input: NumberInput | undefined;
    validCount: number;
    failedCount: number;
  }>;
}

export type ReviewKind = "ambiguous" | "changed" | "unchanged";

/** The most rows of one kind a preview keeps for review. */
export const REVIEW_LIMIT = 200;

export interface ConversionExample {
  row: number;
  raw: datum;
  value: datum;
  /** The same text read in another convention, such as "1.234 as 1.234,5". */
  alternate?: string;
}

const validTypes = new Set<DataType>([
  "numeric",
  "categorical",
  "datetime",
  "boolean",
]);
const validFormats = new Set<FieldFormat>([
  "auto",
  "number",
  "currency",
  "percent",
  "date",
  "datetime",
]);

/** Return the validation error shown before settings are saved. */
export function getFieldSettingsError(
  settings: FieldSettings
): string | undefined {
  if (settings.type && !validTypes.has(settings.type)) {
    return "Choose a valid field type.";
  }
  if (settings.format && !validFormats.has(settings.format)) {
    return "Choose a valid display format.";
  }
  if (
    settings.precision !== undefined &&
    (!Number.isInteger(settings.precision) ||
      settings.precision < 0 ||
      settings.precision > 20)
  ) {
    return "Precision must be a whole number from 0 to 20.";
  }
  if (
    settings.currency !== undefined &&
    !/^[A-Z]{3}$/.test(settings.currency)
  ) {
    return "Currency must be a three-letter code, such as USD.";
  }
  if (
    settings.datePreset !== undefined &&
    !["iso", "month-day-year", "day-month-year"].includes(settings.datePreset)
  ) {
    return "Choose a valid date input preset.";
  }
  if (settings.numberInput !== undefined) {
    if (!isNumberInput(settings.numberInput)) {
      return "Choose a valid number input.";
    }
  }
  if (
    (settings.numberInput !== undefined ||
      settings.percentInput ||
      settings.accountingInput ||
      settings.currencyInput) &&
    settings.type !== "numeric"
  ) {
    return "Number input needs the numeric type.";
  }
  if (
    settings.nullTokens !== undefined &&
    settings.nullTokens.some((token) => typeof token !== "string")
  ) {
    return "Null tokens must be text values.";
  }
  return undefined;
}

export function convertFieldValue(
  raw: datum,
  type: DataType,
  settings: FieldSettings = {}
): { value: datum; error?: string } {
  if (raw == null) {
    return { value: undefined };
  }
  const text = typeof raw === "string" ? raw.trim() : String(raw);
  if (settings.nullTokens?.some((token) => token === text)) {
    return { value: undefined };
  }
  if (type !== "categorical" && text === "") {
    return { value: undefined };
  }

  switch (type) {
    case "categorical":
      return { value: raw };
    case "numeric": {
      if (typeof raw === "string" && readsNumberText(settings)) {
        return parseNumberInput(text, settings.numberInput, {
          percent: settings.percentInput,
          accounting: settings.accountingInput,
          currency: settings.currencyInput
            ? (settings.currency ?? "USD")
            : undefined,
        });
      }
      const value = parseNumber(raw);
      return Number.isFinite(value)
        ? { value }
        : { value: undefined, error: "Not a finite number" };
    }
    case "boolean": {
      const value = parseBoolean(raw);
      return value === undefined
        ? { value: undefined, error: "Expected true or false" }
        : { value };
    }
    case "datetime": {
      const timestamp = parseDateText(text, settings.datePreset ?? "iso");
      return Number.isFinite(timestamp)
        ? { value: new Date(timestamp).toISOString() }
        : { value: undefined, error: "Invalid date" };
    }
  }
}

/** The field's display name without its unit, for text that shows units on values. */
export function getFieldName(field: string, settings: FieldSettings = {}) {
  return settings.label?.trim() || field;
}

/**
 * Format two bounds so they stay distinct. When display rounding would make
 * different bounds read the same, add precision until they differ.
 */
export function formatFieldBounds(
  field: string,
  min: datum,
  max: datum,
  settings: FieldSettings = {}
): [string, string] {
  let low = formatFieldValue(field, min, settings);
  let high = formatFieldValue(field, max, settings);
  if (
    low !== high ||
    min === max ||
    typeof min !== "number" ||
    typeof max !== "number"
  ) {
    return [low, high];
  }
  const start = (settings.precision ?? 3) + 1;
  for (let precision = start; precision <= 20 && low === high; precision++) {
    low = formatFieldValue(field, min, { ...settings, precision });
    high = formatFieldValue(field, max, { ...settings, precision });
  }
  return [low, high];
}

/** True when the field's display format rounds this number. */
export function displayRoundsValue(
  value: number,
  settings: FieldSettings = {}
) {
  const format = settings.format ?? "auto";
  if (!Number.isFinite(value) || format === "date" || format === "datetime") {
    return false;
  }
  const digits = (settings.precision ?? 3) + (format === "percent" ? 2 : 0);
  const scale = 10 ** Math.min(20, digits);
  return (
    Math.abs(Math.round(value * scale) / scale - value) >
    1e-9 * Math.max(1, Math.abs(value))
  );
}

export function getFieldLabel(field: string, settings: FieldSettings = {}) {
  const label = settings.label?.trim() || field;
  return settings.unit ? `${label} (${settings.unit})` : label;
}

export function hasFieldDisplayFormat(settings: FieldSettings = {}) {
  return Boolean(
    (settings.format && settings.format !== "auto") ||
      settings.precision !== undefined ||
      settings.unit
  );
}

/**
 * A UTC timestamp as YYYY-MM-DD, with HH:MM (and seconds or milliseconds when
 * present) only when it is not midnight.
 */
export function formatTimestamp(time: number): string {
  const iso = new Date(time).toISOString();
  const date = iso.slice(0, 10);
  if (time % 86_400_000 === 0) {
    return date;
  }
  const ms = iso.slice(19, 23);
  const clock =
    ms !== ".000"
      ? iso.slice(11, 23)
      : iso.slice(17, 19) !== "00"
        ? iso.slice(11, 19)
        : iso.slice(11, 16);
  return `${date} ${clock}`;
}

/** A value that rounds to zero reads 0, never -0, -$0.00, or -0.0%. */
export function withoutNegativeZero(text: string): string {
  return /^-[^1-9]*$/.test(text) ? text.slice(1) : text;
}

/** A field named for years, such as "year", "fiscal_year", or "gaps.year". */
const YEAR_FIELD = /(^|[\s_.-])years?($|[\s_.-])/i;

// Making an Intl formatter costs far more than using one, and tables and
// axes format every value they show, so each set of options gets one.
const formatters = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();
function formatter<T extends Intl.NumberFormat | Intl.DateTimeFormat>(
  Format: new (locale: string, options: object) => T,
  options: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions
): T {
  const key = `${Format.name}:${JSON.stringify(options)}`;
  let made = formatters.get(key) as T | undefined;
  if (!made) {
    made = new Format("en-US", options);
    formatters.set(key, made);
  }
  return made;
}

export function formatFieldValue(
  field: string,
  value: datum,
  settings: FieldSettings = {},
  {
    compact = false,
    reference,
  }: {
    /** Short numbers such as $46.5K, for legends and other tight labels. */
    compact?: boolean;
    /**
     * The largest value shown beside this one, such as an axis end. Compact
     * labels choose one notation from it, so an axis reads $8K beside $10K,
     * never $8,000 beside $10K.
     */
    reference?: number;
  } = {}
): string {
  if (value == null) {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "string" && value.trim() === "") {
    return "—";
  }

  const format = settings.format ?? "auto";
  if (format === "date" || format === "datetime") {
    const time = timestampOf(value);
    if (time !== undefined) {
      const date = new Date(time);
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "UTC",
        dateStyle: "medium",
      };
      if (format === "datetime") options.timeStyle = "short";
      const text = formatter(Intl.DateTimeFormat, options).format(date);
      return settings.unit ? `${text} ${settings.unit}` : text;
    }
    return String(value);
  }

  // Converted dates are stored as ISO timestamps. Show them as the date, and
  // the time only when there is one.
  if (format === "auto" && settings.type === "datetime") {
    const time = timestampOf(value);
    if (time !== undefined) {
      const text = formatTimestamp(time);
      return settings.unit ? `${text} ${settings.unit}` : text;
    }
  }

  const numberValue =
    format === "number" ||
    format === "currency" ||
    format === "percent" ||
    (typeof value === "number" && format === "auto")
      ? parseNumber(value)
      : NaN;
  if (Number.isFinite(numberValue)) {
    const precision =
      Number.isInteger(settings.precision) &&
      settings.precision !== undefined &&
      settings.precision >= 0 &&
      settings.precision <= 20
        ? settings.precision
        : undefined;
    // Years read as 1960, never 1,960 or 2K.
    if (
      format === "auto" &&
      !settings.unit &&
      YEAR_FIELD.test(field) &&
      Number.isInteger(numberValue) &&
      numberValue >= 1000 &&
      numberValue < 3000
    )
      return String(numberValue);
    const short =
      compact &&
      Math.max(
        Math.abs(numberValue),
        Number.isFinite(reference) ? Math.abs(reference!) : 0
      ) >= 10_000;
    // A short label keeps about three figures, so 4,467 sits beside 12K and
    // 41.3 beside 3.23, not 4,467.02. A field's precision never widens it.
    const shortDigits =
      Math.abs(numberValue) >= 100 ? 0 : Math.abs(numberValue) >= 10 ? 1 : 2;
    const options: Intl.NumberFormatOptions = short
      ? {
          notation: "compact",
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        }
      : {
          maximumFractionDigits: compact
            ? Math.min(precision ?? shortDigits, shortDigits)
            : (precision ?? 3),
          minimumFractionDigits:
            compact && precision !== undefined
              ? Math.min(precision, shortDigits)
              : precision,
        };

    if (format === "currency") {
      options.style = "currency";
      options.currency = /^[A-Z]{3}$/.test(settings.currency ?? "")
        ? settings.currency
        : "USD";
    } else if (format === "percent") {
      options.style = "percent";
    }
    const text = withoutNegativeZero(
      formatter(Intl.NumberFormat, options).format(numberValue)
    );
    return settings.unit ? `${text} ${settings.unit}` : text;
  }

  return String(value);
}

export function applyFieldSettings<T extends Record<string, datum>>(
  rows: T[],
  fieldSettings: FieldSettingsMap,
  inferredTypes: Record<string, DataType>
): T[] {
  return rows.map((row) => {
    const next = { ...row };
    Object.entries(fieldSettings).forEach(([field, settings]) => {
      if (!convertsValues(settings)) {
        return;
      }
      const type = settings.type ?? inferredTypes[field];
      if (!type || !(field in row)) {
        return;
      }
      (next as Record<string, datum>)[field] = convertFieldValue(
        row[field],
        type,
        settings
      ).value;
    });
    return next;
  });
}

/** True when a numeric field reads its text with a number input. */
function readsNumberText(settings: FieldSettings) {
  return Boolean(
    settings.numberInput ||
      settings.percentInput ||
      settings.accountingInput ||
      settings.currencyInput
  );
}

/** True when these settings change a field's runtime values. */
export function convertsValues(settings: FieldSettings = {}) {
  return (
    settings.type !== undefined ||
    Boolean(settings.datePreset) ||
    readsNumberText(settings) ||
    Boolean(settings.nullTokens?.length)
  );
}

/** True when two settings read a field's values the same way. */
export function sameConversion(left: FieldSettings, right: FieldSettings) {
  return (
    left.type === right.type &&
    left.datePreset === right.datePreset &&
    left.numberInput === right.numberInput &&
    Boolean(left.percentInput) === Boolean(right.percentInput) &&
    Boolean(left.accountingInput) === Boolean(right.accountingInput) &&
    Boolean(left.currencyInput) === Boolean(right.currencyInput) &&
    (!left.currencyInput || left.currency === right.currency) &&
    JSON.stringify(left.nullTokens?.filter(Boolean) ?? []) ===
      JSON.stringify(right.nullTokens?.filter(Boolean) ?? [])
  );
}

const NUMBER_CONVENTIONS = [undefined, ...NUMBER_INPUT_IDS] as const;

/** How a convention reads in review text, such as "1,234.5". */
export function numberInputLabel(input: NumberInput | undefined) {
  return input ? NUMBER_INPUTS[input].label : PLAIN_NUMBER_LABEL;
}

export function buildConversionPreview(
  field: string,
  rows: Array<Record<string, datum>>,
  settings: FieldSettings = {},
  inferredType: DataType
): ConversionPreview {
  const effectiveType = settings.type ?? inferredType;
  const converts = convertsValues(settings);
  const numeric = effectiveType === "numeric";
  const failures: ConversionFailure[] = [];
  const review: ConversionPreview["review"] = {
    ambiguous: [],
    changed: [],
    unchanged: [],
  };
  const readings = NUMBER_CONVENTIONS.map((input) => ({
    input,
    settings: { ...settings, type: "numeric", numberInput: input } as const,
    validCount: 0,
    failedCount: 0,
  }));
  let validCount = 0;
  let missingCount = 0;
  const counts: Record<ReviewKind, number> = {
    ambiguous: 0,
    changed: 0,
    unchanged: 0,
  };

  rows.forEach((row, rowIndex) => {
    const raw = row[field];
    const result = converts
      ? convertFieldValue(raw, effectiveType, settings)
      : { value: raw };
    if (result.error) {
      failures.push({ row: rowIndex, raw, reason: result.error });
    } else if (raw == null || result.value == null) {
      missingCount += 1;
    } else {
      validCount += 1;
    }

    let alternate: string | undefined;
    if (numeric) {
      readings.forEach((reading) => {
        const read = convertFieldValue(raw, "numeric", reading.settings);
        if (read.error) {
          reading.failedCount += 1;
          return;
        }
        if (read.value == null) return;
        reading.validCount += 1;
        if (
          !alternate &&
          typeof raw === "string" &&
          typeof result.value === "number" &&
          read.value !== result.value
        ) {
          alternate = `${String(read.value)} as ${numberInputLabel(reading.input)}`;
        }
      });
    }

    if (result.error || raw == null || result.value == null) return;
    const kind: ReviewKind = alternate
      ? "ambiguous"
      : typeof raw === "string" &&
          typeof result.value === "number" &&
          raw.trim() !== String(result.value)
        ? "changed"
        : "unchanged";
    counts[kind] += 1;
    if (review[kind].length < REVIEW_LIMIT) {
      review[kind].push({ row: rowIndex, raw, value: result.value, alternate });
    }
  });

  return {
    field,
    inferredType,
    effectiveType,
    totalCount: rows.length,
    validCount,
    missingCount,
    failedCount: failures.length,
    failures,
    review,
    ambiguousCount: counts.ambiguous,
    changedCount: counts.changed,
    unchangedCount: counts.unchanged,
    numberInputs: numeric
      ? readings.map(({ input, validCount, failedCount }) => ({
          input,
          validCount,
          failedCount,
        }))
      : undefined,
  };
}

/**
 * A number without float noise or more digits than a reader uses: whole
 * numbers as they are, two decimals from 1 up, three significant digits
 * below 1. 12.150452469000001 reads 12.15; 4467.0234 reads 4467.02.
 */
export function readableNumber(value: number) {
  if (Number.isInteger(value) || !Number.isFinite(value)) return String(value);
  const whole = Math.floor(Math.log10(Math.abs(value))) + 1;
  return String(Number(value.toPrecision(whole > 0 ? whole + 2 : 3)));
}
