import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { ChartSettings } from "@/types/ChartTypes";
import { getChartFields } from "@/components/charts/chartAccessibility";
import { parseExpression } from "@/lib/calculations/parser/semantics";

/** Where saved settings read a field. */
export type FieldUsePlace =
  | { kind: "chart"; chartId: string; title: string; role: string }
  | { kind: "rows"; role: "column" | "filter" }
  | { kind: "aggregate"; aggregateId: string; role: string }
  | { kind: "calculation"; name: string };

export interface FieldUse {
  field: string;
  place: FieldUsePlace;
}

export interface SettingsFieldUsage {
  uses: FieldUse[];
  /** Calculated fields the settings define, with the fields they read. */
  calculations: {
    name: string;
    expression: string;
    dependencies: string[];
    error?: string;
  }[];
}

/** `xField` reads as "x", `seriesField` as "series", `field` as "field". */
function roleName(key: string) {
  if (key === "field") return "field";
  const base = key.replace(/Field$/, "");
  return base.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
}

/** Each field a chart reads, named by the setting that reads it. */
function chartUses(chart: ChartSettings): { field: string; role: string }[] {
  const uses: { field: string; role: string }[] = [];
  const seen = new Set<string>();
  const add = (field: unknown, role: string) => {
    if (typeof field !== "string" || !field || field === "__ID") return;
    const key = `${field}\u0000${role}`;
    if (seen.has(key)) return;
    seen.add(key);
    uses.push({ field, role });
  };
  // The chart type decides which fields it reads; setting names only say
  // how, so a leftover setting from another chart type is not a use.
  const read = new Set(getChartFields(chart));
  const record = chart as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (key !== "field" && !key.endsWith("Field")) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (read.has(item as string)) add(item, roleName(key));
    }
  }
  // Fields a chart type keeps elsewhere, such as a time series' measure.
  const named = new Set(uses.map((use) => use.field));
  for (const field of read) {
    if (field && !named.has(field)) add(field, "field");
  }
  [...chart.filters, ...(chart.localFilters ?? [])].forEach((filter) =>
    add(filter.field, "filter")
  );
  if (chart.facet?.enabled) {
    add(chart.facet.rowVariable, "facet");
    if (chart.facet.type === "grid") add(chart.facet.columnVariable, "facet");
  }
  return uses;
}

/**
 * Every place saved settings read a field: chart roles, filters, facets,
 * Rows, aggregates, and calculated fields.
 */
export function settingsFieldUsage(
  settings: SavedDataStructure | undefined
): SettingsFieldUsage {
  if (!settings) return { uses: [], calculations: [] };
  const uses: FieldUse[] = [];
  for (const saved of settings.charts) {
    const chart = saved as ChartSettings;
    const title = chart.title?.trim() || chart.type;
    for (const use of chartUses(chart)) {
      uses.push({
        field: use.field,
        place: { kind: "chart", chartId: chart.id, title, role: use.role },
      });
    }
  }
  const add = (field: string | undefined, place: FieldUsePlace) => {
    if (field && field !== "__ID") uses.push({ field, place });
  };
  settings.rowsSettings?.columns.forEach((column) =>
    add(column.field, { kind: "rows", role: "column" })
  );
  settings.rowsSettings?.filters.forEach((filter) =>
    add(filter.field, { kind: "rows", role: "filter" })
  );
  for (const aggregate of settings.aggregates ?? []) {
    const place = (role: string): FieldUsePlace => ({
      kind: "aggregate",
      aggregateId: aggregate.id,
      role,
    });
    add(aggregate.groupField, place("group"));
    add(aggregate.measureField, place("measure"));
    add(aggregate.entityField, place("entity"));
  }
  const calculations = settings.calculations.map((calculation) => {
    try {
      const dependencies = parseExpression(calculation.expression).dependencies;
      dependencies.forEach((field) =>
        add(field, { kind: "calculation", name: calculation.resultColumnName })
      );
      return {
        name: calculation.resultColumnName,
        expression: calculation.expression,
        dependencies,
      };
    } catch (error) {
      return {
        name: calculation.resultColumnName,
        expression: calculation.expression,
        dependencies: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
  return { uses, calculations };
}

/**
 * Fields the saved settings use that a query result does not have. Charts on
 * a different query would otherwise draw from fields that are not there, so
 * the workspace holds those settings back until they match.
 */
export function incompatibleSettingsFields(
  settings: SavedDataStructure | undefined,
  availableFields: Set<string>
) {
  if (!settings) return [];
  const { uses, calculations } = settingsFieldUsage(settings);
  const calculated = new Set(
    calculations.map((calculation) => calculation.name)
  );
  const used = new Set(uses.map((use) => use.field));
  return [
    ...[...used].filter(
      (field) => !availableFields.has(field) && !calculated.has(field)
    ),
    ...calculations
      .filter((calculation) => calculation.error)
      .map((calculation) => calculation.name),
  ];
}
