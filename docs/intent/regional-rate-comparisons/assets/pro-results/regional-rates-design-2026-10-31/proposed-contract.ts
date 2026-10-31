/**
 * PROPOSED CONTRACT — not implemented by explorEDA at the reviewed baseline.
 * Baseline: ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6.
 *
 * This self-contained companion specifies the bounded first feature. Merge
 * GroupedRateStep into the existing AnalysisStep union during implementation;
 * retain AnalysisProject.version === 1. Readers that do not understand the new
 * step must fail with an unsupported-operation diagnostic, not omit the step.
 *
 * No executable calculation is provided here. The function declarations are
 * proposed module APIs. Examples are authored configuration, not baseline APIs.
 */

export type Scalar = string | number | boolean | null | undefined;
export type SourceId = string;
export type StepId = string;
export type FieldId = string;
export type ISOInstant = string;

/** Number keys must be finite. No coercion of 1, "1", "01", or true. */
export type TypedRegionKey =
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean };

export interface ExactWindow {
  start: ISOInstant; // Inclusive, normalized instant.
  end: ISOInstant; // Exclusive, normalized instant; end > start.
  timeZone: string; // Explicit source interpretation; M1 accepts UTC only.
}

export interface PopulationReference {
  id: string;
  definition: string;
}

export interface BoundaryReference {
  system: string;
  vintage: string; // Geometry/classification version, not population estimate vintage.
}

export interface ExposureUnit {
  id: string; // E.g. "persons", "person-years", "vehicle-km".
  label: string;
}

/** A literal is an authored assertion; its provenance must be shown in the trace. */
export type FieldOrLiteral<T> =
  | { kind: "field"; fieldId: FieldId }
  | { kind: "literal"; value: T };

export interface InputPopulationAndBoundary {
  populationId: FieldOrLiteral<string>;
  boundarySystem: FieldOrLiteral<string>;
  boundaryVintage: FieldOrLiteral<string>;
}

export interface InputSupportWindow {
  start: FieldOrLiteral<ISOInstant>;
  end: FieldOrLiteral<ISOInstant>;
  timeZone: FieldOrLiteral<string>;
}

export type NumeratorDefinition = InputPopulationAndBoundary & {
  regionFieldId: FieldId;
  // M1's input branch is explicitly scoped to one population/boundary. Mixed
  // sources need an upstream scope filter; unexpected incompatible rows block.
  // Count is row occurrence counting. Entity/person deduplication is not implied.
  rowMeaning: string;
} & (
    | {
        mode: "events";
        measure: { operation: "count" };
        occurrenceSourceId: SourceId;
        occurredAtFieldId: FieldId;
        oneEventPerRow: true; // Required user/source assertion, visible in evidence.
        // Each row must have EXACTLY ONE source reference for occurrenceSourceId,
        // and each raw occurrence may reach this branch at most once. A preceding
        // expansion that duplicates it is invalid. A preaggregate with eight
        // event refs is not one event; use prepared mode instead.
      }
    | {
        mode: "prepared";
        measure: { operation: "sum"; fieldId: FieldId };
        // A single nonnegative safe-integer count per full grain in M1.
        supportWindow: InputSupportWindow;
        oneRowPerGrain: true;
      }
  );

/** Every row must identify one full region-window-population-boundary grain. */
export interface DenominatorDefinition extends InputPopulationAndBoundary {
  regionFieldId: FieldId;
  exposureFieldId: FieldId;
  unitId: FieldOrLiteral<string>;
  supportWindow: InputSupportWindow;
  duplicatePolicy: "reject"; // Strict in contract version 1.
  // A census/estimate reference date is descriptive metadata; it is not the
  // start or end of the observation window and does not prove coverage.
  estimate?: {
    referenceDate: FieldOrLiteral<string>;
    vintage: FieldOrLiteral<string>;
    methodology: string;
  };
}

/** Reserved for a later explicit extraction step; not accepted by version 1. */
export type FutureDenominatorDuplicatePolicy = "collapse-identical";

export type ObservationCoverage =
  | "complete"
  | "partial"
  | "unknown"
  | "not-collected";

export interface CollectionDefinition {
  id: string;
  description: string;
  supportedNumeratorCategories:
    | { kind: "all" }
    | { kind: "declared"; fieldId: FieldId; values: readonly Scalar[] };
}

export type CoverageDefinition = { collection: CollectionDefinition } & (
  | {
      kind: "denominator-field";
      fieldId: FieldId; // Values must be ObservationCoverage, not truthiness.
      noteFieldId?: FieldId;
      asOfFieldId?: FieldId;
      scope: "each-denominator-grain";
    }
  | {
      kind: "authored-assertion";
      status: ObservationCoverage;
      statement: string;
      assertedAt: ISOInstant;
      // This assertion is independent of denominator-row presence.
      scope: "each-comparison-grain";
    }
);

/**
 * M1 does not claim probability/risk/proportion semantics. Those require an
 * eligible-entity denominator and verified numerator membership/uniqueness.
 */
export type RateMeaning = "event-intensity" | "crude-population";

export interface GroupedRateSpecification {
  version: 1;
  meaning: RateMeaning;
  title: string;
  scale: number; // Finite and > 0; display R = scale * N / D.
  window: ExactWindow;
  population: PopulationReference;
  boundary: BoundaryReference;
  exposureUnit: ExposureUnit;
  numerator: NumeratorDefinition;
  denominator: DenominatorDefinition;
  coverage: CoverageDefinition;
}

export interface GroupedRateStep {
  id: StepId;
  kind: "grouped-rate";
  numeratorStepId: StepId;
  denominatorStepId: StepId;
  specification: GroupedRateSpecification;
}

/** Both dependencies participate in cycle checks, closure, and revision keys. */
export type RateDependencies = Pick<
  GroupedRateStep,
  "numeratorStepId" | "denominatorStepId"
>;

/** Reuse AnalysisSourceReference rather than creating merged pseudo-source rows. */
export interface SourceReference {
  sourceId: SourceId;
  rowKey: string;
  entityKey?: Scalar;
}

export interface ComparisonGroupKey {
  region: TypedRegionKey;
  window: ExactWindow;
  populationId: string;
  boundary: BoundaryReference;
}

/**
 * Serialize a canonical structured tuple; do not concatenate keys with ":".
 * The serializer is internal and bijective over the supported finite scalars.
 */
export type SerializedGroupKey = string;

export interface RateInputRow {
  key: string;
  values: Readonly<Record<FieldId, Scalar>>;
  sourceRows: readonly SourceReference[];
  contributors: readonly SourceReference[];
  /** Raw and converted values remain available for count/exposure trace. */
  fieldInputs?: Readonly<Record<FieldId, RateInputFieldTrace>>;
}

export interface RateInputFieldTrace {
  rawValue: Scalar;
  preparedValue: Scalar;
  conversion?: string;
  conversionProblem?: string;
  sources: readonly SourceReference[];
}

export interface RateInputFrame {
  stepId: StepId;
  revision: string;
  rows: readonly RateInputRow[];
  sourceIds: readonly SourceId[];
}

/** Empty successfully loaded sources and failed reads must remain distinguishable. */
export type SourceReadState =
  | { state: "available"; revision: string; loadedRowCount: number }
  | { state: "unavailable"; revision: string; reason: string };

export type RateIssueCode =
  | "source-unavailable"
  | "coverage-unknown"
  | "coverage-partial"
  | "not-collected"
  | "invalid-region-key"
  | "numerator-missing"
  | "numerator-invalid"
  | "numerator-negative"
  | "numerator-noninteger"
  | "numerator-unsafe-integer"
  | "numerator-grain-duplicate"
  | "duplicated-event-occurrence"
  | "unknown-attribution"
  | "invalid-event-time"
  | "unsupported-category-coverage"
  | "exposure-missing"
  | "exposure-invalid"
  | "exposure-negative"
  | "exposure-zero"
  | "denominator-duplicate"
  | "denominator-conflict"
  | "period-mismatch"
  | "population-mismatch"
  | "boundary-mismatch"
  | "unit-mismatch"
  | "unmatched-numerator-group"
  | "unsupported-filter-scope"
  | "nonfinite-result"
  | "selection-unresolved"
  | "empty-selection"
  | "duplicate-selected-group"
  | "pool-member-unavailable"
  | "nonadditive-pool";

export interface RateIssue {
  code: RateIssueCode;
  message: string;
  input?: "numerator" | "denominator" | "coverage" | "scope";
  sources: readonly SourceReference[];
  // An unassignable event is not merely an orphan ledger item: block every
  // potentially affected comparison group when its membership is unknown.
  affectedGroups?: "all-candidate-groups" | readonly ComparisonGroupKey[];
}

export interface InputMembership {
  inputRowKey: string; // The branch's input result row, not a global provider ID.
  sources: readonly SourceReference[];
  rawValue: Scalar;
  contribution: number | null;
  disposition: "contributes" | "excluded" | "blocks";
  reason?: string;
}

export interface RateEvidence {
  numerator: readonly InputMembership[];
  denominator: readonly InputMembership[];
  coverage: {
    status: ObservationCoverage;
    sources: readonly SourceReference[];
    assertion?: Extract<CoverageDefinition, { kind: "authored-assertion" }>;
    note?: string;
  };
  // Rejected keys/intervals stay inspectable without becoming contributors.
  rejectedCandidates: readonly InputMembership[];
}

export interface RateGroupResult {
  key: ComparisonGroupKey;
  serializedKey: SerializedGroupKey;
  state: "available" | "unavailable";
  quantityState: Readonly<Record<RateQuantity, "available" | "unavailable">>;
  // The observed subtotal can remain readable under partial/unknown collection.
  observedNumerator: number | null;
  // Accepted N is null when numerator completeness/validity is unproven.
  // Exposure errors alone do not erase a known N. Prepared missing N stays null;
  // only empty event-mode input under complete collection can establish zero.
  numerator: number | null;
  // Valid exposure remains readable even when N/R is unavailable; zero is
  // readable as zero but cannot be used as a divisor.
  exposure: number | null;
  rate: number | null;
  issues: readonly RateIssue[];
  evidence: RateEvidence;
}

export interface GroupedRateResult {
  queryId: string;
  stepId: StepId;
  revision: string;
  inputRevisions: { numerator: string; denominator: string };
  sourceRevisions: Readonly<Record<SourceId, string>>;
  specification: GroupedRateSpecification;
  // Union of valid typed keys from both inputs and explicitly requested keys.
  // Missing-D keys produce unavailable groups. Geometry alone does not create
  // a valid zero or prove coverage. Unrepresentable keys go in the orphan ledger
  // AND block potentially affected groups.
  groups: readonly RateGroupResult[];
  orphanNumeratorCandidates: readonly InputMembership[];
  diagnostics: readonly RateIssue[];
}

export interface EventPredicate {
  fieldId: FieldId;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
  value: Exclude<Scalar, undefined>;
}

export interface RateScopeRequest {
  // Applies to numerator and denominator universes through their region mappings.
  regions?: readonly TypedRegionKey[];
  // M1 must equal the saved exact window/population; otherwise unavailable.
  window?: ExactWindow;
  populationId?: string;
  // Absent keys may create unavailable placeholders, never fabricated zeros.
  requestedRegions?: readonly TypedRegionKey[];
}

export interface RateEvaluationOptions {
  sourceAvailability: Readonly<Record<SourceId, SourceReadState>>;
  // Event mode only. Prepared mode cannot apply subtype predicates to an
  // already aggregated total without a separately declared subtype grain.
  // Explicit event subtype predicates, not arbitrary global row IDs. Never
  // silently route time, region, population, or denominator-value filters here.
  numeratorOnlyFilters?: readonly EventPredicate[];
  scope?: RateScopeRequest;
  bindings?: Readonly<Record<string, Scalar>>;
  signal?: AbortSignal;
}

/** Proposed pure computation entry; source frames are evaluated by the query engine. */
export declare function evaluateGroupedRate(
  queryId: string,
  step: GroupedRateStep,
  inputs: { numerator: RateInputFrame; denominator: RateInputFrame },
  options: RateEvaluationOptions
): GroupedRateResult;

export type RateQuantity = "rate" | "numerator" | "exposure";

export interface RateColorReferenceBasis {
  window: ExactWindow;
  populationId: string;
  boundary: BoundaryReference;
  meaning: RateMeaning;
  scale: number;
  exposureUnit: ExposureUnit;
  numeratorOnlyFilters: readonly EventPredicate[];
}

export type RateColorDomain =
  | {
      kind: "reference";
      min: 0;
      max: number; // Captured finite upper bound >= 0; max=0 renders a zero-only legend.
      basis: RateColorReferenceBasis;
      capturedAt: ISOInstant;
      sourceLabel?: string; // Human label, not a process-local revision fingerprint.
      subsetProof?: "nonnegative-numerator-fixed-exposure";
    }
  | { kind: "fixed"; min: number; max: number };

export interface RateMapBinding {
  kind: "grouped-rate";
  queryId: string;
  stepId: StepId;
  geometryAssetId: string;
  featureKey: string;
  boundary: BoundaryReference;
  value: RateQuantity;
  selection: readonly ComparisonGroupKey[];
  // Each quantity has its own unit/domain. Switching quantity cannot reuse the
  // numeric rate bounds as exposure/count bounds. Refresh shows overflow;
  // explicit rebase is a settings edit. Captured bounds survive folder reopen.
  colorDomains: Readonly<Record<RateQuantity, RateColorDomain>>;
}

export interface RateRuntimeAdapter {
  getResult(queryId: string, stepId: StepId): GroupedRateResult | undefined;
  // Numeric provider IDs are transient projection positions, never saved identities.
  groupKeyForProviderRow(id: number): ComparisonGroupKey | undefined;
  // Opens evidence by role; a valid zero-event group still has denominator evidence.
  getEvidence(queryId: string, stepId: StepId, key: ComparisonGroupKey): RateEvidence | undefined;
  getInputFieldTrace(
    queryId: string,
    stepId: StepId,
    role: "numerator" | "denominator",
    inputRowKey: string,
    fieldId: FieldId
  ): RateInputFieldTrace | undefined;
}

export interface RatePoolRequest {
  groups: readonly ComparisonGroupKey[];
  memberPolicy: "all-requested-must-be-available";
  // M1 pooling is spatial only: disjoint regions, same exact window/population/unit.
  grain: "disjoint-regions";
}

export interface RatePoolResult {
  state: "available" | "unavailable";
  quantityState: Readonly<Record<RateQuantity, "available" | "unavailable">>;
  requested: readonly ComparisonGroupKey[];
  resolved: readonly ComparisonGroupKey[];
  accepted: readonly ComparisonGroupKey[];
  numerator: number | null;
  exposure: number | null;
  rate: number | null;
  // Known exposure can remain visible if a selected group's numerator is
  // incomplete. It is not a permission to publish a partial pooled rate.
  numeratorContributors: readonly SourceReference[];
  denominatorContributors: readonly SourceReference[];
  omissions: readonly { key: ComparisonGroupKey; issues: readonly RateIssue[] }[];
  compatibilitySignature: string;
  issues: readonly RateIssue[];
  revision: string;
}

/** Proposed shared summarizer; never averages regional rate values implicitly. */
export declare function poolRateGroups(
  result: GroupedRateResult,
  request: RatePoolRequest
): RatePoolResult;

/** New finding kind; it does not change the existing count/share finding meaning. */
export interface RateFinding {
  id: string;
  kind: "rate";
  queryId: string;
  stepId: StepId;
  quantity: RateQuantity;
  groups:
    | { kind: "chart-selection"; chartId: string }
    | { kind: "explicit"; values: readonly ComparisonGroupKey[] };
  summary: "pooled-disjoint-regions";
  memberPolicy: "all-requested-must-be-available";
  digits?: number;
}

/** Runtime-only bridge. It must not be serialized into settings-only callbacks. */
export interface RateNotebookContext {
  adapter: RateRuntimeAdapter;
  resolveChartSelection(chartId: string): readonly ComparisonGroupKey[];
  sourceAvailability: Readonly<Record<SourceId, SourceReadState>>;
}

// Example 1: event rows + a separate population table, one exact window.
const window2026October: ExactWindow = {
  start: "2026-10-01T00:00:00Z",
  end: "2026-11-01T00:00:00Z",
  timeZone: "UTC",
};

const populationBinding: InputPopulationAndBoundary = {
  populationId: { kind: "literal", value: "all-residents" },
  boundarySystem: { kind: "literal", value: "districts" },
  boundaryVintage: { kind: "literal", value: "districts-v1" },
};

export const eventsAndPopulationExample: GroupedRateStep = {
  id: "regional-rates",
  kind: "grouped-rate",
  numeratorStepId: "events-input",
  denominatorStepId: "population-input",
  specification: {
    version: 1,
    meaning: "crude-population",
    title: "Recorded service events per 1,000 residents",
    scale: 1000,
    window: window2026October,
    population: { id: "all-residents", definition: "Residents of the demo districts" },
    boundary: { system: "districts", vintage: "districts-v1" },
    exposureUnit: { id: "persons", label: "residents" },
    numerator: {
      ...populationBinding,
      mode: "events",
      occurrenceSourceId: "events",
      regionFieldId: "events.region",
      occurredAtFieldId: "events.occurredAt",
      measure: { operation: "count" },
      oneEventPerRow: true,
      rowMeaning: "One recorded service event, including repeated events for a resident",
    },
    denominator: {
      regionFieldId: "population.region",
      exposureFieldId: "population.residents",
      populationId: { kind: "field", fieldId: "population.populationId" },
      boundarySystem: { kind: "field", fieldId: "population.boundarySystem" },
      boundaryVintage: { kind: "field", fieldId: "population.boundaryVintage" },
      unitId: { kind: "literal", value: "persons" },
      supportWindow: {
        start: { kind: "field", fieldId: "population.supportStart" },
        end: { kind: "field", fieldId: "population.supportEnd" },
        timeZone: { kind: "literal", value: "UTC" },
      },
      duplicatePolicy: "reject",
      estimate: {
        referenceDate: { kind: "field", fieldId: "population.referenceDate" },
        vintage: { kind: "field", fieldId: "population.estimateVintage" },
        methodology: "Published estimate explicitly adopted for this observation window",
      },
    },
    coverage: {
      kind: "denominator-field",
      fieldId: "population.observationCoverage",
      noteFieldId: "population.coverageNote",
      scope: "each-denominator-grain",
      collection: {
        id: "service-events",
        description: "All service-event categories covered by the collection process",
        supportedNumeratorCategories: { kind: "all" },
      },
    },
  },
};

// Example 2: prepared counts, exposure, and coverage in one region-period table.
// Referencing the same predecessor does not remove the two evidence roles.
export const preparedRowsExample: GroupedRateStep = {
  ...eventsAndPopulationExample,
  id: "prepared-regional-rates",
  numeratorStepId: "prepared-input",
  denominatorStepId: "prepared-input",
  specification: {
    ...eventsAndPopulationExample.specification,
    numerator: {
      ...populationBinding,
      mode: "prepared",
      regionFieldId: "prepared.region",
      measure: { operation: "sum", fieldId: "prepared.events" },
      rowMeaning: "One complete region-period-population-boundary record",
      oneRowPerGrain: true,
      supportWindow: {
        start: { kind: "field", fieldId: "prepared.supportStart" },
        end: { kind: "field", fieldId: "prepared.supportEnd" },
        timeZone: { kind: "literal", value: "UTC" },
      },
    },
    denominator: {
      ...populationBinding,
      regionFieldId: "prepared.region",
      exposureFieldId: "prepared.residents",
      unitId: { kind: "literal", value: "persons" },
      supportWindow: {
        start: { kind: "field", fieldId: "prepared.supportStart" },
        end: { kind: "field", fieldId: "prepared.supportEnd" },
        timeZone: { kind: "literal", value: "UTC" },
      },
      duplicatePolicy: "reject",
    },
    coverage: {
      kind: "denominator-field",
      fieldId: "prepared.observationCoverage",
      scope: "each-denominator-grain",
      collection: {
        id: "service-events",
        description: "Prepared totals for all service-event categories",
        supportedNumeratorCategories: { kind: "all" },
      },
    },
  },
};
