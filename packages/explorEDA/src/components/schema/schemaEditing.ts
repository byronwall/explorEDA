import type {
  AnalysisProject,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import type { FieldSettings } from "@/lib/fieldSettings";
import type { SchemaEndpoint } from "@/lib/schema/schemaGraph";

/** Project definitions the diagram can change: sources and relationships. */
export interface SchemaProjectEditing {
  project: AnalysisProject;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  /** One call per confirmed edit, so each edit is one undo step. */
  onChange: (project: AnalysisProject) => void;
}

/** The workspace's calculated fields, edited in the calculation editor. */
export interface SchemaCalculationEditing {
  /** The card that holds the workspace's calculations. */
  nodeId: string;
  /** Open the editor on a calculation, or empty to add one. */
  open: (name?: string, returnFocus?: HTMLElement | null) => void;
}

/** A single-table workspace's field labels, units, and types. */
export interface SchemaFieldEditing {
  settings: (field: string) => FieldSettings;
  update: (field: string, updates: Partial<FieldSettings>) => void;
}

/** What the diagram may edit. Omit it, or both parts, for a read-only view. */
export interface SchemaEditing {
  project?: SchemaProjectEditing;
  fields?: SchemaFieldEditing;
  calculations?: SchemaCalculationEditing;
}

export type SchemaSelection =
  | { kind: "table"; nodeId: string }
  | { kind: "field"; nodeId: string; rowId: string }
  | { kind: "relationship"; edgeId: string }
  | { kind: "proposal"; from: SchemaEndpoint; to: SchemaEndpoint };

export function sameSelection(
  a: SchemaSelection | undefined,
  b: SchemaSelection | undefined
) {
  return JSON.stringify(a) === JSON.stringify(b);
}
