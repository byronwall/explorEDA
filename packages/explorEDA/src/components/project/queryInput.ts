import type { DatumObject } from "@/providers/DataLayerProvider";
import type { AnalysisEvaluation } from "@/types/AnalysisProject";

const FIELD_TYPES = {
  number: "numeric",
  string: "categorical",
  boolean: "boolean",
  date: "datetime",
} as const;

/**
 * What a workspace reads from a query's result: its rows with IDs, its field
 * names, and each field's declared type and name. Every view of a query and
 * its summary in `QuerySummary` start from this, so they describe the same
 * fields the same way.
 */
export function queryInput(evaluation: AnalysisEvaluation) {
  const data: DatumObject[] = evaluation.rows.map((row, __ID) => ({
    ...row.data,
    __ID,
  }));
  const fieldNames = evaluation.fields.map((field) => field.id);
  // Declared types hold even before any settings are saved.
  const fieldTypes = Object.fromEntries(
    evaluation.fields.map((field) => [field.id, field.type ?? "unknown"])
  );
  // Declared field names and types fill in what saved settings leave out.
  const declared = Object.fromEntries(
    evaluation.fields.map((field) => [
      field.id,
      {
        label: field.name,
        ...(field.type && field.type !== "unknown"
          ? { type: FIELD_TYPES[field.type] }
          : {}),
      } as Record<string, unknown>,
    ])
  );
  return { data, fieldNames, fieldTypes, declared };
}
