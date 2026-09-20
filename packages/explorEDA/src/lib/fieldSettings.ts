import { dateTimestamp } from "@/lib/dateTime";
import type { datum } from "@/types/ChartTypes";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";

export type DatePreset = "iso" | "month-day-year" | "day-month-year";
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
  examples: Array<{ row: number; raw: datum; value: datum }>;
  failures: ConversionFailure[];
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
  if (settings.currency !== undefined && !/^[A-Z]{3}$/.test(settings.currency)) {
    return "Currency must be a three-letter code, such as USD.";
  }
  if (
    settings.datePreset !== undefined &&
    !["iso", "month-day-year", "day-month-year"].includes(settings.datePreset)
  ) {
    return "Choose a valid date input preset.";
  }
  if (
    settings.nullTokens !== undefined &&
    settings.nullTokens.some((token) => typeof token !== "string")
  ) {
    return "Null tokens must be text values.";
  }
  return undefined;
}

function validCalendarDate(year: number, month: number, day: number) {
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  return (
    Number.isFinite(timestamp) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseDate(value: string, preset: DatePreset = "iso") {
  const text = value.trim();
  if (preset === "month-day-year" || preset === "day-month-year") {
    const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (match) {
      const [, first, second, yearText] = match;
      const year = Number(yearText);
      const month =
        preset === "month-day-year" ? Number(first) : Number(second);
      const day = preset === "month-day-year" ? Number(second) : Number(first);
      const parsed = Date.UTC(year, month - 1, day);
      if (validCalendarDate(year, month, day)) {
        return parsed;
      }
    }
    return NaN;
  }

  const isoMatch = text.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|[+-]\d{2}:\d{2})?)?$/
  );
  if (!isoMatch) return NaN;
  const [, yearText, monthText, dayText] = isoMatch;
  if (
    !validCalendarDate(
      Number(yearText),
      Number(monthText),
      Number(dayText)
    )
  ) {
    return NaN;
  }
  return dateTimestamp(text);
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
      const value = typeof raw === "number" ? raw : Number(text);
      return Number.isFinite(value)
        ? { value }
        : { value: undefined, error: "Not a finite number" };
    }
    case "boolean":
      if (raw === true || raw === false) {
        return { value: raw };
      }
      if (text.toLowerCase() === "true") {
        return { value: true };
      }
      if (text.toLowerCase() === "false") {
        return { value: false };
      }
      return { value: undefined, error: "Expected true or false" };
    case "datetime": {
      const timestamp = parseDate(text, settings.datePreset);
      return Number.isFinite(timestamp)
        ? { value: new Date(timestamp).toISOString() }
        : { value: undefined, error: "Invalid date" };
    }
  }
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

export function formatFieldValue(
  field: string,
  value: datum,
  settings: FieldSettings = {}
): string {
  void field;
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
    const date =
      typeof value === "number" ? new Date(value) : new Date(String(value));
    if (Number.isFinite(date.getTime())) {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "UTC",
        dateStyle: "medium",
      };
      if (format === "datetime") options.timeStyle = "short";
      const text = new Intl.DateTimeFormat("en-US", options).format(date);
      return settings.unit ? `${text} ${settings.unit}` : text;
    }
    return String(value);
  }

  const numberValue =
    format === "number" || format === "currency" || format === "percent" ||
    (typeof value === "number" && format === "auto")
      ? Number(value)
      : NaN;
  if (Number.isFinite(numberValue)) {
    const precision =
      Number.isInteger(settings.precision) &&
      settings.precision !== undefined &&
      settings.precision >= 0 &&
      settings.precision <= 20
        ? settings.precision
        : undefined;
    const options: Intl.NumberFormatOptions = {
      maximumFractionDigits: precision ?? 3,
      minimumFractionDigits: precision,
    };
    if (format === "currency") {
      options.style = "currency";
      options.currency = /^[A-Z]{3}$/.test(settings.currency ?? "")
        ? settings.currency
        : "USD";
    } else if (format === "percent") {
      options.style = "percent";
    }
    const text = new Intl.NumberFormat("en-US", options).format(numberValue);
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
      if (
        !settings.type &&
        !(settings.nullTokens && settings.nullTokens.length > 0) &&
        !settings.datePreset
      ) {
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

export function buildConversionPreview(
  field: string,
  rows: Array<Record<string, datum>>,
  settings: FieldSettings = {},
  inferredType: DataType
): ConversionPreview {
  const effectiveType = settings.type ?? inferredType;
  const examples: ConversionPreview["examples"] = [];
  const failures: ConversionFailure[] = [];
  let validCount = 0;
  let missingCount = 0;

  rows.forEach((row, rowIndex) => {
    const raw = row[field];
    const converts =
      settings.type !== undefined ||
      Boolean(settings.datePreset) ||
      Boolean(settings.nullTokens?.length);
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
    if (examples.length < 8 && (raw != null || result.error)) {
      examples.push({ row: rowIndex, raw, value: result.value });
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
    examples,
    failures,
  };
}
