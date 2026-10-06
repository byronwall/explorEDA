import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { parseExpression } from "@/lib/calculations/parser/semantics";

export function incompatibleSettingsFields(
  settings: SavedDataStructure | undefined,
  availableFields: Set<string>
) {
  if (!settings) return [];
  const calculatedFields = new Set(
    settings.calculations.map((calculation) => calculation.resultColumnName)
  );
  const references = new Set<string>();
  for (const chart of settings.charts) {
    for (const [key, value] of Object.entries(chart)) {
      if (typeof value === "string" && /field/i.test(key) && value) {
        references.add(value);
      }
    }
    for (const filter of chart.filters) {
      if (filter.field !== "__ID") references.add(filter.field);
    }
    const chartFields = chart as typeof chart & {
      columns?: Array<{ field?: unknown }>;
      rowFields?: unknown;
      columnField?: unknown;
      valueFields?: Array<{ field?: unknown }>;
    };
    for (const column of chartFields.columns ?? []) {
      if (typeof column.field === "string") references.add(column.field);
    }
    for (const field of [
      ...(Array.isArray(chartFields.rowFields) ? chartFields.rowFields : []),
      chartFields.columnField,
      ...(chartFields.valueFields ?? []).map((item) => item.field),
      chart.facet.rowVariable,
      chart.facet.type === "grid" ? chart.facet.columnVariable : undefined,
    ]) {
      if (typeof field === "string" && field) references.add(field);
    }
  }
  for (const column of settings.rowsSettings?.columns ?? []) {
    if (column.field !== "__ID") references.add(column.field);
  }
  for (const filter of settings.rowsSettings?.filters ?? []) {
    if (filter.field !== "__ID") references.add(filter.field);
  }
  Object.keys(settings.fieldSettings ?? {}).forEach((field) =>
    references.add(field)
  );
  for (const aggregate of settings.aggregates ?? []) {
    references.add(aggregate.groupField);
    if (aggregate.measureField) references.add(aggregate.measureField);
    if (aggregate.entityField) references.add(aggregate.entityField);
  }
  for (const calculation of settings.calculations) {
    try {
      parseExpression(calculation.expression).dependencies.forEach((field) =>
        references.add(field)
      );
    } catch {
      references.add(`Invalid calculation: ${calculation.resultColumnName}`);
    }
  }
  return [...references]
    .filter(
      (field) =>
        !field.startsWith("Invalid calculation:") &&
        !availableFields.has(field) &&
        !calculatedFields.has(field)
    )
    .concat(
      [...references].filter((field) =>
        field.startsWith("Invalid calculation:")
      )
    );
}
