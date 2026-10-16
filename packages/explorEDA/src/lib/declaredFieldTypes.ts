import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import type { FieldDefinition } from "@/types/AnalysisProject";

/** A field type that a source or file reader declares. */
export type DeclaredFieldType = NonNullable<FieldDefinition["type"]>;

/** The workspace type each declared field type reads as. */
export const DECLARED_DATA_TYPES = {
  number: "numeric",
  string: "categorical",
  boolean: "boolean",
  date: "datetime",
} as const satisfies Record<Exclude<DeclaredFieldType, "unknown">, DataType>;

/** Workspace types for declared fields; unknown fields are left to detection. */
export function declaredDataTypes(
  fieldTypes: Readonly<Record<string, DeclaredFieldType>> = {}
): Record<string, DataType> {
  const types: Record<string, DataType> = {};
  for (const [field, type] of Object.entries(fieldTypes)) {
    if (type !== "unknown") types[field] = DECLARED_DATA_TYPES[type];
  }
  return types;
}
