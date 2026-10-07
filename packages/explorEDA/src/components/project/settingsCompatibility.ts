import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { ChartSettings } from "@/types/ChartTypes";
import { getChartFields } from "@/components/charts/chartAccessibility";
import { parseExpression } from "@/lib/calculations/parser/semantics";

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
  const calculated = new Set(
    settings.calculations.map((calculation) => calculation.resultColumnName)
  );
  const used = new Set<string>();
  const add = (field: string | undefined) => {
    if (field && field !== "__ID") used.add(field);
  };
  for (const saved of settings.charts) {
    const chart = saved as ChartSettings;
    getChartFields(chart).forEach(add);
    [...chart.filters, ...(chart.localFilters ?? [])].forEach((filter) =>
      add(filter.field)
    );
    if (chart.facet?.enabled) {
      add(chart.facet.rowVariable);
      if (chart.facet.type === "grid") add(chart.facet.columnVariable);
    }
  }
  settings.rowsSettings?.columns.forEach((column) => add(column.field));
  settings.rowsSettings?.filters.forEach((filter) => add(filter.field));
  for (const aggregate of settings.aggregates ?? []) {
    add(aggregate.groupField);
    add(aggregate.measureField);
    add(aggregate.entityField);
  }
  const invalid: string[] = [];
  for (const calculation of settings.calculations) {
    try {
      parseExpression(calculation.expression).dependencies.forEach(add);
    } catch {
      invalid.push(calculation.resultColumnName);
    }
  }
  return [
    ...[...used].filter(
      (field) => !availableFields.has(field) && !calculated.has(field)
    ),
    ...invalid,
  ];
}
