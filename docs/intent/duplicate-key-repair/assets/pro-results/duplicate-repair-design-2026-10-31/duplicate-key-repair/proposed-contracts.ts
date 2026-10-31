/**
 * DESIGN CONTRACT SKETCH — not a repository patch or a shipped API.
 * Baseline: ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6.
 *
 * This self-contained file makes the report's state boundaries reviewable.
 * Codex should adapt names/imports to AnalysisProject.ts and the existing
 * evaluator, codecs, worker protocol, folder adapter, and public exports.
 * There is no repair implementation, alternate query engine, or date parser.
 */

export type Scalar = string | number | boolean | null | undefined;
export type RawRecord = Readonly<Record<string, Scalar>>;
export type NonEmpty<T> = readonly [T, ...T[]];

/** Legacy single-field form remains accepted. Arrays are authored in M3. */
export type EntityKey = string | NonEmpty<string>;

/** Canonical identity tags; numeric keys must be finite and normalize -0. */
export type KeyAtom =
  | readonly ["string", string]
  | readonly ["number", number]
  | readonly ["boolean", boolean];
export type KeyTuple = NonEmpty<KeyAtom>;

/** Canonical full typed values, not an unchecked hash or input row position. */
export type RecordToken = string;
export type GroupMultisetToken = string;
export type SpecToken = string;
export type SemanticSourceStamp = string;
export type SnapshotId = string;
export type RepairRunId = string;

export interface FieldDefinitionV2 {
  id: string;
  name: string;
  type?: "string" | "number" | "boolean" | "date" | "unknown";
  /** Set only when synthesis or explicit analyst classification proves it. */
  generated?: "source-row-number";
}

export type OrderRule =
  | {
      fieldId: string;
      interpretation: "number";
      direction: "asc" | "desc";
    }
  | {
      fieldId: string;
      interpretation: "date";
      /** String inputs only; numeric epoch timestamps need a future unit rule. */
      preset: "iso" | "month-day-year" | "day-month-year";
      direction: "asc" | "desc";
    }
  | {
      fieldId: string;
      interpretation: "text";
      /** Nonblank strings only; verbatim UTF-16 code-unit lexicographic order. */
      comparison: "ordinal";
      direction: "asc" | "desc";
    };

export type ConflictPolicy =
  | { kind: "review" }
  | {
      kind: "ordered";
      orderBy: NonEmpty<OrderRule>;
      invalidOrder: "block" | "exclude-candidate";
      remainingTies: "review";
    };

export interface DuplicateRepairPreparation {
  kind: "duplicate-repair";
  version: 1;
  inputSourceId: string;
  /** Changes when key field identity/order or key semantics change. */
  identityEpoch: number;
  equality: "typed-full-data-record-v1";
  exactCopies: "collapse-after-apply";
  missingKeys: "block" | "exclude";
  conflictPolicy: ConflictPolicy;
  refresh: "review-content-changes";
  acceptedRunId?: RepairRunId;
}

export interface SourceDefinitionV2 {
  id: string;
  name: string;
  glyph: string;
  /** The sole grouping authority; preparation does not repeat key fields. */
  entityKey: EntityKey;
  fields: readonly FieldDefinitionV2[];
  preparation?: DuplicateRepairPreparation;
}

/** M3: endpoint variants are mutually exclusive and have equal arity. */
export type RelationshipEndpointV2 = { sourceId: string } & (
  | { fieldId: string; fieldIds?: never }
  | { fieldId?: never; fieldIds: NonEmpty<string> }
);

/** Apply the same exclusivity to lookup/expand explicit input overrides. */
export type RelationshipInputOverrideV2 =
  | { inputFieldId?: string; inputFieldIds?: never }
  | { inputFieldId?: never; inputFieldIds: NonEmpty<string> };

export interface OriginalOccurrenceRef {
  kind: "original-occurrence";
  sourceId: string;
  snapshotId: SnapshotId;
  /** Zero-based coordinate in this immutable snapshot, never current rows. */
  ordinal: number;
}

export interface PreparedEntityRef {
  kind: "prepared-entity";
  sourceId: string;
  identityEpoch: number;
  key: KeyTuple;
  /** Collision-free encoding of source ID, epoch, and complete typed tuple. */
  rowKey: string;
}

/** Existing raw result references remain valid through a legacy adapter. */
export interface LegacyRawRef {
  kind?: "raw";
  sourceId: string;
  rowKey: string;
  entityKey?: Scalar;
}

export type ExecutionRef = LegacyRawRef | PreparedEntityRef;

export interface OriginalSnapshot {
  kind: "repair-original-snapshot";
  version: 1;
  id: SnapshotId;
  sourceId: string;
  fields: readonly FieldDefinitionV2[];
  /** Full original own properties, including technical fields and absence. */
  rows: readonly RawRecord[];
  /** Equality over data fields; full rows above preserve technical values. */
  semanticStamp: SemanticSourceStamp;
}

export interface ManualRecordDecision {
  key: KeyTuple;
  schemaToken: string;
  /** Full canonical multiset including counts, or an equivalent archive ref. */
  reviewedGroup: GroupMultisetToken;
  selectedClass: RecordToken;
  reviewedSnapshotId: SnapshotId;
  reason?: string;
}

export type ExclusionReason =
  | "not-selected-manually"
  | "not-selected-by-order"
  | "ineligible-order"
  | "missing-key"
  | "blank-key"
  | "nonfinite-key";

export interface ExcludedOccurrence {
  ref: OriginalOccurrenceRef;
  reason: ExclusionReason;
  fieldId?: string;
}

export interface SelectedClassEvidence {
  entity: PreparedEntityRef;
  values: RawRecord;
  selectedClass: RecordToken;
  decision: "unique" | "exact-collapse" | "manual" | "ordered";
  /** Equal sets: all exact copies, with no privileged physical survivor. */
  winnerRefs: readonly OriginalOccurrenceRef[];
  representedRefs: readonly OriginalOccurrenceRef[];
  excluded: readonly ExcludedOccurrence[];
}

export interface AcceptedRepairRun {
  kind: "repair-accepted-run";
  version: 1;
  id: RepairRunId;
  outputSourceId: string;
  originalSnapshotId: SnapshotId;
  specToken: SpecToken;
  manualDecisions: readonly ManualRecordDecision[];
  groups: readonly SelectedClassEvidence[];
  invalidKeyExclusions: readonly ExcludedOccurrence[];
  reason: "apply" | "accept-refresh";
}

export type RepairEvidenceAsset = OriginalSnapshot | AcceptedRepairRun;
export type RepairEvidenceStore = Readonly<Record<string, RepairEvidenceAsset>>;

export interface RepairEvidenceRef {
  runId: RepairRunId;
  entityRowKey: string;
}

export interface ResolvedRow {
  key: string;
  values: RawRecord;
  /** Prepared logical refs stay in the source identity path for aggregates. */
  sourceRows: readonly ExecutionRef[];
  /** Contributing logical refs, not every rejected original candidate. */
  contributors: readonly ExecutionRef[];
  repairEvidence: readonly RepairEvidenceRef[];
}

export type RepairProblemCode =
  | "missing-input"
  | "missing-evidence"
  | "invalid-definition"
  | "invalid-schema"
  | "unresolved-conflict"
  | "unresolved-order-tie"
  | "ineligible-key"
  | "stale-manual-decision"
  | "refresh-awaiting-review"
  | "downstream-origin-mismatch";

export interface RepairProblem {
  code: RepairProblemCode;
  message: string;
  sourceId: string;
  key?: KeyTuple;
  fieldId?: string;
  occurrences?: readonly OriginalOccurrenceRef[];
}

export type ResolvedSource =
  | {
      status: "ready";
      sourceId: string;
      revision: string;
      fields: readonly FieldDefinitionV2[];
      rows: readonly ResolvedRow[];
      acceptedRunId?: RepairRunId;
    }
  | {
      status: "unavailable";
      sourceId: string;
      revision: string;
      problems: NonEmpty<RepairProblem>;
      /** No current rows/counts: unavailable must not be mistaken for empty. */
      rows?: never;
      historicalRunId?: RepairRunId;
    };

export interface RepairCommit {
  transactionId: string;
  expectedProjectRevision: string;
  expectedSourceRevision: SemanticSourceStamp;
  evidenceAppend: readonly RepairEvidenceAsset[];
  reason: "apply" | "accept-refresh";
}

/**
 * One callback carries project/view + evidence. Never split them into events.
 * The capable host owns publication and resolves after it and required saves.
 * Post-ack checks compare the desired committed state, never the old base.
 * Generic placeholders avoid pretending to patch the full existing model.
 */
export interface ProjectChange<Project, View> {
  project: Project;
  view: View;
  repairCommit?: RepairCommit;
}

export type RepairHost<Project, View> =
  | {
      repair?: undefined;
      onProjectChange: (change: ProjectChange<Project, View>) => void;
    }
  | {
      repair: {
        evidence: RepairEvidenceStore;
        commitProtocol: "atomic-evidence-v1";
      };
      onProjectChange: (change: ProjectChange<Project, View>) => Promise<void>;
    };

/**
 * Required validation outside the type system:
 * - Prepared input is physical, distinct from output, present, and scalar.
 * - Prepared IDs never also appear in physical tables; no preparation chains.
 * - All own raw fields are declared or classified before exact comparison.
 * - Key tuples have eligible values; relationship endpoint arities agree.
 * - Current semantic stamp agrees with the accepted snapshot or stays blocked.
 * - Winner/represented sets are equal; represented/excluded cover each original
 *   exactly once for ready runs; blocked previews also account for unresolved.
 * - Output equals a complete original data class; metadata omissions are marked.
 * - Existing entity-aware conflicting measures still produce unavailable values.
 * - Archives precede their project pointer behind a fail-fast write barrier.
 * - Serialize project edits and prevent ordinary queued writes overtaking commit.
 * - Recheck expected base before pointer save; host publishes then acknowledges.
 * - Post-ack compare desired committed transaction and current source stamp.
 * - A source change during final pointer write leaves a historical, not current, run.
 * - JSON uses the shared lossless codec (extended for -0), not plain stringify.
 * - Source-unavailable propagates before static/live notebook count reducers.
 */
