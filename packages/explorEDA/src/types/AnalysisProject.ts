import type { SavedDataStructure } from "./SavedDataStructure";
import type { datum } from "./ChartTypes";

export type AnalysisScalar = string | number | boolean | null | undefined;
export type AnalysisSourceRow = Record<string, datum>;

export interface FieldDefinition {
  id: string;
  name: string;
  type?: "string" | "number" | "boolean" | "date" | "unknown";
}

export interface SourceDefinition {
  id: string;
  name: string;
  glyph: string;
  entityKey: string;
  fields: FieldDefinition[];
}

export interface RelationshipDefinition {
  id: string;
  name: string;
  from: { sourceId: string; fieldId: string };
  to: { sourceId: string; fieldId: string };
  cardinality: "many-to-one" | "one-to-one" | "one-to-many" | "many-to-many";
}

export interface SourceStep {
  id: string;
  kind: "source";
  sourceId: string;
}

export interface LookupStep {
  id: string;
  kind: "lookup";
  inputStepId: string;
  relationshipId: string;
  as: string;
  inputFieldId?: string;
}

export interface ExpandStep {
  id: string;
  kind: "expand";
  inputStepId: string;
  relationshipId: string;
  as: string;
  inputFieldId?: string;
  /** Keep one parent row when the related table has no match. */
  keepUnmatched?: boolean;
}

export interface CalculateStep {
  id: string;
  kind: "calculate";
  inputStepId: string;
  fieldId: string;
  label: string;
  expression: string;
}

export type AnalysisFilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "is-null"
  | "is-not-null";

export interface FilterStep {
  id: string;
  kind: "filter";
  inputStepId: string;
  fieldId: string;
  operator: AnalysisFilterOperator;
  value?: AnalysisScalar;
  parameterId?: string;
}

export interface AggregateMeasure {
  id: string;
  label: string;
  operation: "count" | "sum" | "average";
  fieldId?: string;
  /** Reduce repeated values once per entity. Conflicting values are unavailable. */
  entityFieldId?: string;
}

export interface AggregateStep {
  id: string;
  kind: "aggregate";
  inputStepId: string;
  groupBy: string[];
  measures: AggregateMeasure[];
}

export type AnalysisStep =
  | SourceStep
  | LookupStep
  | ExpandStep
  | CalculateStep
  | FilterStep
  | AggregateStep;

export interface AnalysisQuery {
  id: string;
  name: string;
  glyph: string;
  frameLabel: string;
  steps: AnalysisStep[];
  outputStepId: string;
}

export interface AnalysisParameter {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "date";
  required?: boolean;
  /** Pick the value from a source's records: its entity key, labeled by another field. */
  options?: { sourceId: string; labelFieldId?: string };
}

export interface AnalysisProject {
  id: string;
  version: 1;
  sources: SourceDefinition[];
  relationships: RelationshipDefinition[];
  queries: AnalysisQuery[];
  parameters?: AnalysisParameter[];
}

export interface AnalysisView {
  id: string;
  name: string;
  queryId: string;
  bindings?: Record<string, AnalysisScalar>;
  settings?: SavedDataStructure;
  inspection?: { stepId?: string; mode?: "summary" | "full"; rowKey?: string };
  selectedRowKeys?: string[];
}

export interface AnalysisField {
  id: string;
  name: string;
  type?: FieldDefinition["type"];
  origin: { sourceId: string; fieldId: string } | { stepId: string };
}

export interface AnalysisSourceReference {
  sourceId: string;
  rowKey: string;
  entityKey?: AnalysisScalar;
}

export interface AnalysisMeasureContributor {
  rowKey: string;
  input: AnalysisScalar;
  sourceRows: AnalysisSourceReference[];
  included: boolean;
  exclusionReason?: string;
}

export interface AnalysisResultRow {
  key: string;
  values: Record<string, AnalysisScalar>;
  data: Record<string, datum>;
  sourceRows: AnalysisSourceReference[];
  contributors: AnalysisSourceReference[];
  measureContributors?: Record<string, AnalysisMeasureContributor[]>;
}

export interface AnalysisDiagnostic {
  code:
    | "missing-source"
    | "missing-key"
    | "duplicate-key"
    | "ambiguous-lookup"
    | "missing-lookup"
    | "invalid-query"
    | "calculation-error"
    | "missing-parameter"
    | "conflicting-entity-measure";
  message: string;
  stepId?: string;
  sourceId?: string;
  rowKey?: string;
  fieldId?: string;
  value?: AnalysisScalar;
}

export interface AnalysisStage {
  stepId: string;
  kind: AnalysisStep["kind"];
  inputCount: number;
  outputCount: number;
  excludedCount: number;
  rowUnit: string;
  condition?: string;
  fields: AnalysisField[];
  rows: AnalysisResultRow[];
}

export interface AnalysisEvaluation {
  queryId: string;
  revision: string;
  fields: AnalysisField[];
  rows: AnalysisResultRow[];
  stages: AnalysisStage[];
  diagnostics: AnalysisDiagnostic[];
  counts: {
    source: number;
    output: number;
    available: number;
    excluded: number;
  };
}
