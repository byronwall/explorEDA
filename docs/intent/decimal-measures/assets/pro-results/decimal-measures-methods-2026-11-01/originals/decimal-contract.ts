/**
 * Proposed explorEDA decimal contract — inspection companion, not implementation.
 * Baseline: d3920a285f3755a8324998775deb131747e959f5.
 *
 * This file is self-contained TypeScript declarations plus contract constants.
 * No decimal arithmetic, parser, UI, persistence, or export implementation ships
 * here. The implementation plan names the existing modules that must adopt it.
 * Runtime validation remains necessary: TypeScript cannot validate decimal text.
 *
 * All public values are JSON safe. BigInt is an internal arithmetic detail and
 * must not appear in a row, worker message, callback, binding, or saved file.
 */

export const DECIMAL_LIMITS = {
  coefficientDigits: 128,
  scale: 38,
  inputCharacters: 256,
  absoluteExponent: 128,
  scratchDigits: 256,
} as const;

/** Six product modes; no ambient/global rounding context. */
export type DecimalRounding =
  | "halfEven"
  | "halfAwayFromZero"
  | "towardZero"
  | "floor"
  | "ceiling"
  | "unnecessary";

export interface DecimalOutputPolicy {
  /** Integer in [0, 38]. This is arithmetic output scale, not display digits. */
  readonly scale: number;
  readonly rounding: DecimalRounding;
}

/**
 * Value = coefficient * 10^(-scale).
 *
 * coefficient is canonical signed integer text: 0 or -?[1-9][0-9]*.
 * No plus sign, leading zeros, negative zero, decimal point, or exponent here.
 * Trailing coefficient zeros ARE retained to preserve the declared scale.
 * scale is an integer in [0, 38]; coefficient has at most 128 digits, sans sign.
 * Parse of "-0.00" gives {kind:'decimal',coefficient:'0',scale:2}; source text
 * retains its original minus sign. Numeric equality ignores representation scale.
 */
export interface DecimalValue {
  readonly kind: "decimal";
  readonly coefficient: string;
  readonly scale: number;
}

/** Existing datum aliases should reuse one shared scalar union. */
export type DecimalCapableScalar =
  | string
  | number
  | boolean
  | null
  | undefined
  | DecimalValue;

/**
 * Save with a calculation, not with a display format. The exact compiler reads
 * original numeric token lexemes; it must not reconstruct them from Number ASTs.
 */
export interface DecimalArithmetic {
  readonly kind: "decimal";
  readonly version: 1;
}

export interface SavedDecimalCalculation {
  readonly resultColumnName: string;
  readonly expression: string;
  readonly arithmetic: DecimalArithmetic;
}

/**
 * Add this optional property to both SavedDataStructure and SourceDefinition.
 * readTable's preserveTextFields option is an adapter of this saved declaration.
 * CSV quoting alone does not preserve type on a later import.
 */
export interface DecimalInputDeclaration {
  readonly fields: readonly string[];
  readonly readAs: "text";
}

/**
 * Narrow reader provenance, not a general provenance framework. The source
 * field's raw text retains each coefficient; this descriptor records that the
 * reader synthesized it from a native typed decimal rather than original text.
 */
export interface DecimalTypedSourceOrigin {
  readonly kind: "typedSourceDecimal";
  readonly scale: number;
  readonly format: "arrow" | "parquet";
}

/**
 * Carry from TableFile through the host/provider to SavedAnalysisStructure;
 * M2 source snapshots/SourceDefinition retain it too. Refresh replaces it with
 * the new source's descriptor. Settings-only exports do not contain raw rows.
 */
export interface DecimalSourceOriginsExtension {
  readonly decimalSourceOrigins?: Readonly<
    Record<string, DecimalTypedSourceOrigin>
  >;
}

export interface DecimalSettingsExtension {
  readonly decimalInputs?: DecimalInputDeclaration;
}

export interface DecimalSourceExtension extends DecimalSourceOriginsExtension {
  readonly decimalInputs?: DecimalInputDeclaration;
}

export interface DecimalReaderOptions {
  readonly preserveTextFields?: readonly string[];
}

/**
 * An occurrence identifies a record in the CURRENT source/evaluation revision.
 * Reuse the existing source/provenance mapping; this is not a new durable-ID
 * framework. Never infer continuity across refresh from an old row position.
 */
export type OccurrenceId = string;

export type DecimalOrigin =
  | { readonly kind: "sourceText"; readonly field: string; readonly raw: string }
  | {
      readonly kind: "typedSourceDecimal";
      readonly field: string;
      readonly coefficient: string;
      readonly scale: number;
    }
  | { readonly kind: "literal"; readonly lexeme: string }
  | { readonly kind: "generatedString" }
  | { readonly kind: "typedDecimal" }
  | { readonly kind: "currentNumberInteger"; readonly currentValue: number }
  | { readonly kind: "calculated"; readonly calculation: string };

/** Core fixture codes plus narrowly owned integration/limit diagnostics. */
export type DecimalErrorCode =
  | "DECIMAL_TEXT_REQUIRED"
  | "DECIMAL_INVALID_TEXT"
  | "DECIMAL_INPUT_LIMIT"
  | "DECIMAL_SCALE_LIMIT"
  | "DECIMAL_COEFFICIENT_LIMIT"
  | "DECIMAL_SCRATCH_LIMIT"
  | "DECIMAL_POLICY_REQUIRED"
  | "DECIMAL_NON_TERMINATING"
  | "DECIMAL_DIVIDE_BY_ZERO"
  | "DECIMAL_INEXACT"
  | "DECIMAL_UNSAFE_INTEGER"
  | "DECIMAL_MIXED_OPERAND"
  | "DECIMAL_ENTITY_CONFLICT"
  | "DECIMAL_SOURCE_FIELD_REQUIRED"
  | "DECIMAL_UNSUPPORTED_OPERATION"
  | "DECIMAL_UNSUPPORTED_EXPORT"
  | "DECIMAL_INVALID_WIRE";

export interface DecimalDiagnostic {
  readonly code: DecimalErrorCode;
  readonly message: string;
  readonly occurrenceId?: OccurrenceId;
  readonly field?: string;
}

export interface DecimalFailure {
  readonly status: "error";
  readonly diagnostics: readonly DecimalDiagnostic[];
}

export interface DecimalMissing {
  readonly status: "missing";
  readonly reason: "null" | "undefined" | "blank" | "dependency";
}

export interface DecimalSuccess<T = DecimalValue> {
  readonly status: "ok";
  readonly value: T;
  /** True only when explicit rounding discarded a nonzero remainder. */
  readonly inexact?: boolean;
  readonly origin?: DecimalOrigin;
}

export type DecimalOperationResult<T = DecimalValue> =
  | DecimalSuccess<T>
  | DecimalFailure;

export type DecimalCellResult =
  | DecimalSuccess
  | DecimalMissing
  | DecimalFailure;

/** Exact-mode comparisons produce Boolean columns, not decimal amount columns. */
export type ExactExpressionResult =
  | DecimalSuccess<DecimalValue | boolean>
  | DecimalMissing
  | DecimalFailure;

/**
 * Row values store DecimalValue or an absent value. Status/error sidecars remain
 * separate. An invalid result whose cell is undefined must stay distinguishable
 * from a missing result for filters, counts, traces, and reconciliation.
 */
export interface DecimalResolvedColumn {
  readonly values: Readonly<Record<OccurrenceId, DecimalValue | undefined>>;
  readonly results: Readonly<Record<OccurrenceId, DecimalCellResult>>;
}

export interface RawSourceCell {
  readonly occurrenceId: OccurrenceId;
  readonly field: string;
  readonly raw: unknown;
  /** Retain source-kind evidence when a typed decimal reader synthesizes text. */
  readonly origin?: DecimalOrigin;
}

export interface DecimalCalculationContext {
  readonly sourceRevision: string;
  readonly originalSourceFields: readonly string[];
  /** Bypasses fieldSettings and derived-field lookup. Does not stringify. */
  readonly readRawSource: (
    field: string,
    occurrenceId: OccurrenceId,
  ) => RawSourceCell | undefined;
  readonly readResolved: (
    field: string,
    occurrenceId: OccurrenceId,
  ) => DecimalCapableScalar;
  readonly readDecimalStatus: (
    field: string,
    occurrenceId: OccurrenceId,
  ) => DecimalCellResult | undefined;
}

/**
 * Proposed intrinsics. decimalSource(["Price text"]) accepts a source-field AST
 * reference only, not an arbitrary expression or calculated field. decimal()
 * accepts decimal source strings/literals plus missing input, never a Number.
 * exactInteger() admits only a finite currently safe integer; it makes no claim
 * to recover an earlier source spelling or validate the source's original digits.
 */
export declare function decimal(value: unknown): DecimalCellResult;
export declare function decimalSource(
  context: DecimalCalculationContext,
  field: string,
  occurrenceId: OccurrenceId,
): DecimalCellResult;
export declare function exactInteger(value: unknown): DecimalOperationResult;

/** Coefficient-string and scale validation, with no coercion. */
export declare function validateDecimalValue(
  value: unknown,
): DecimalOperationResult;

/** Pure finite-decimal operations; ordinary operands must already be typed. */
export declare function add(
  left: DecimalValue,
  right: DecimalValue,
): DecimalOperationResult;
export declare function subtract(
  left: DecimalValue,
  right: DecimalValue,
): DecimalOperationResult;
export declare function multiply(
  left: DecimalValue,
  right: DecimalValue,
): DecimalOperationResult;
export declare function negate(value: DecimalValue): DecimalOperationResult;
export declare function absolute(value: DecimalValue): DecimalOperationResult;

/** Exact division uses minimal terminating scale; 1/3 reports nontermination. */
export declare function divideExact(
  numerator: DecimalValue,
  denominator: DecimalValue,
): DecimalOperationResult;

/**
 * Rounded division performs ONE quotient/remainder rounding at output.scale.
 * Formula syntax divide(a,b,scale,rounding) compiles to this policy-object API;
 * round(value,scale,rounding) uses the same explicit compiler adapter.
 * In v1 scale/mode are literal policy metadata: an integer in [0,38] and a
 * supported string mode. They are not amount operands or row-varying expressions.
 */
export declare function divide(
  numerator: DecimalValue,
  denominator: DecimalValue,
  output: DecimalOutputPolicy,
): DecimalOperationResult;
export declare function round(
  value: DecimalValue,
  output: DecimalOutputPolicy,
): DecimalOperationResult;

/**
 * Evaluation resolves both operand statuses before propagation: a known error
 * must not be hidden by a missing operand. Both missing => missing. Otherwise
 * missing propagates. Numeric operands never enter these operations implicitly.
 */
export declare function evaluateDecimalBinary(
  operator: "+" | "-" | "*" | "/",
  left: DecimalCellResult,
  right: DecimalCellResult,
): DecimalCellResult;

export declare function compare(
  left: DecimalValue,
  right: DecimalValue,
): -1 | 0 | 1;
export declare function numericEqual(
  left: DecimalValue,
  right: DecimalValue,
): boolean;
export declare function scaleEqual(
  left: DecimalValue,
  right: DecimalValue,
): boolean;

/** Strip decimal trailing zeros for keys only; zero key is decimal:0:0. */
export declare function numericKey(value: DecimalValue): string;
/** All digits and arithmetic scale; no locale formatting or scientific notation. */
export declare function exactText(value: DecimalValue): string;

export type DecimalFilter =
  | {
      readonly type: "decimal-range";
      readonly field: string;
      readonly min?: DecimalValue;
      readonly max?: DecimalValue;
      readonly minExclusive?: boolean;
      readonly maxExclusive?: boolean;
    }
  | {
      readonly type: "decimal-value";
      readonly field: string;
      readonly values: readonly DecimalValue[];
    }
  | {
      readonly type: "decimal-state";
      readonly field: string;
      readonly state: "valid" | "missing" | "invalid";
    };

/** State predicates read sidecars; ranges compare exact values, never projection. */
export declare function applyDecimalFilter(
  cell: DecimalCellResult,
  filter: DecimalFilter,
): boolean;

interface DecimalMeasureBase {
  readonly measureField: string;
  /** M2 only; M1 must reject this option for exact measures on every route. */
  readonly entityField?: string;
}

/**
 * Output quantization is after wide reduction; it never means round each input.
 * For sum WITH output policy, quantize the wide accumulator first, then enforce
 * the 128-digit public coefficient bound. Without policy, finalize at maximum
 * contributor scale and apply the public bound there. Never first wrap the wide
 * accumulator in a bounded DecimalValue just to call the public round helper.
 */
export type DecimalMeasure = DecimalMeasureBase &
  (
    | {
        readonly aggregation: "average";
        readonly decimal: {
          readonly version: 1;
          readonly output: DecimalOutputPolicy;
        };
      }
    | {
        readonly aggregation: "sum";
        readonly decimal: {
          readonly version: 1;
          readonly output?: DecimalOutputPolicy;
        };
      }
    | {
        readonly aggregation: "min" | "max";
        readonly decimal: {
          readonly version: 1;
          readonly output?: never;
        };
      }
  );

export type DecimalGroupedMeasure = DecimalMeasure & {
  readonly id: string;
  readonly name: string;
  readonly groupField: string;
};

/** Ledger total reconciliation accepts additive sum findings only. */
export type DecimalSumMeasure = Extract<
  DecimalMeasure,
  { readonly aggregation: "sum" }
>;

/** Count remains a dimensionless row/entity count, not a currency DecimalValue. */
export interface DecimalMeasureInput {
  readonly occurrenceId: OccurrenceId;
  readonly cell: DecimalCellResult;
  /** Preserve type. Text '1', number 1, and decimal 1 are distinct ID values. */
  readonly entityKey?: DecimalCapableScalar;
}

export interface DecimalPopulation {
  readonly sourceRevision: string;
  /** Exact occurrences after all declared saved predicates, before exclusions. */
  readonly occurrenceIds: readonly OccurrenceId[];
  /** Trace of rows excluded by saved population filters, separate from validity. */
  readonly filteredOutIds: readonly OccurrenceId[];
}

export type DecimalGrain =
  | { readonly kind: "row" }
  | { readonly kind: "entity"; readonly entityField: string };

/** rows === valid + missing + invalid; these are source-occurrence counts. */
export interface DecimalRowCounts {
  readonly rows: number;
  readonly valid: number;
  readonly missing: number;
  readonly invalid: number;
}

export interface DecimalRowMembers {
  readonly valid: readonly OccurrenceId[];
  readonly missing: readonly OccurrenceId[];
  readonly invalid: readonly OccurrenceId[];
}

/** Additional dimensions; never sum these indiscriminately with row counts. */
export interface DecimalEntityCounts {
  readonly keyedEntities: number;
  readonly eligibleEntities: number;
  readonly eligibleOccurrences: number;
  readonly duplicateOccurrences: number;
  readonly missingIdOccurrences: number;
  readonly missingEntities: number;
  readonly invalidEntities: number;
  readonly conflictingEntities: number;
  readonly inconsistentAvailabilityEntities: number;
}

export type DecimalEntityStatus =
  | "eligible"
  | "missing"
  | "invalid"
  | "conflict"
  | "inconsistentAvailability";

export interface DecimalEntityDetail {
  readonly entityKey: DecimalCapableScalar;
  readonly status: DecimalEntityStatus;
  readonly occurrenceIds: readonly OccurrenceId[];
  /** Lexical-minimum occurrence ID among the equivalent eligible occurrences. */
  readonly representativeId?: OccurrenceId;
  /** Maximum scale among equal valid amounts; all source spellings remain. */
  readonly value?: DecimalValue;
}

export type DecimalAggregateStatus =
  | "complete"
  | "partial"
  | "empty"
  | "noValidValues"
  | "conflict"
  | "limit";

export interface DecimalAggregateResult {
  readonly status: DecimalAggregateStatus;
  /** null for empty, noValidValues, conflict, limit; never invent empty zero. */
  readonly value: DecimalValue | null;
  readonly inexact?: boolean;
  readonly counts: DecimalRowCounts;
  readonly members: DecimalRowMembers;
  readonly population: DecimalPopulation;
  readonly grain: DecimalGrain;
  readonly diagnostics: readonly DecimalDiagnostic[];
  readonly entityCounts?: DecimalEntityCounts;
  readonly entities?: readonly DecimalEntityDetail[];
  /** If shown for diagnosis, never substitute this for an unavailable value. */
  readonly diagnosticPartialValue?: DecimalValue;
}

/**
 * Inputs must be typed decimals or explicit missing/error states. String parsing
 * occurs in the source calculation, not in this reducer. Sum uses wide scratch
 * and checks output limits after any explicit sum-output quantization. Without
 * an output policy, sum preserves maximum contributor scale. Average divides
 * the wide exact sum by valid unit count, then rounds once before its public
 * output check. Min/max choose maximum scale among tied values.
 */
export declare function summarizeDecimals(
  inputs: readonly DecimalMeasureInput[],
  measure: DecimalMeasure,
  population: DecimalPopulation,
): DecimalAggregateResult;

/**
 * Re-reduce underlying contributors for a grand total. Do not sum subgroup
 * averages, already-rounded subtotal values, or overlapping entity totals.
 */
export declare function poolDecimalContributors(
  inputs: readonly DecimalMeasureInput[],
  measure: DecimalMeasure,
  population: DecimalPopulation,
): DecimalAggregateResult;

export interface DecimalMetricComparison {
  readonly kind: "exact-delta";
  readonly baseline: DecimalValue;
  readonly delta: DecimalValue;
  readonly baselinePopulation: DecimalPopulation;
  /** M1 has no implicit percent share, Number division, or percentage text. */
  readonly share?: never;
}

/** A saved finding carries its measure and exact population/grain result. */
export interface DecimalFindingResult {
  readonly findingId: string;
  /** Identifies one finished evaluation, including its source and bindings. */
  readonly evaluationRevision: string;
  readonly measure: DecimalMeasure;
  readonly result: DecimalAggregateResult;
}

/** Means and extrema remain exact findings, but are not ledger-total operands. */
export interface DecimalTotalFindingResult extends DecimalFindingResult {
  readonly measure: DecimalSumMeasure;
}

/**
 * M3 reconcile(leftFinding,rightFinding) compares two exact TOTAL findings.
 * Both operands must be additive sums, including sums quantized after reduction.
 * Users declare business rounding in the findings/calculations; this check
 * adds no rounding and requires no allocation of a rounded total to lines.
 */
export interface DecimalTotalReconciliationDefinition {
  readonly kind: "totals";
  readonly id: string;
  readonly leftFindingId: string;
  readonly rightFindingId: string;
}

/**
 * M3 rowpaircheck(leftField,rightField) compares already existing paired values.
 * This is not a join, matching, currency, or allocation engine. The same source
 * occurrence supplies both cells; no line amount is inferred from a total.
 */
export interface DecimalRowReconciliationDefinition {
  readonly kind: "rows";
  readonly id: string;
  readonly leftField: string;
  readonly rightField: string;
  readonly population: DecimalPopulation;
}

export type DecimalReconciliationDefinition =
  | DecimalTotalReconciliationDefinition
  | DecimalRowReconciliationDefinition;

export type DecimalReconciliationStatus =
  | "matched"
  | "different"
  | "incomplete"
  | "revisionMismatch"
  | "populationMismatch"
  | "grainMismatch"
  | "unavailable";

export interface DecimalTotalReconciliationResult {
  readonly kind: "totals";
  readonly status: DecimalReconciliationStatus;
  readonly leftFindingId: string;
  readonly rightFindingId: string;
  readonly left: DecimalAggregateResult;
  readonly right: DecimalAggregateResult;
  readonly delta: DecimalValue | null;
  readonly bothSidesComplete: boolean;
  readonly sameRevision: boolean;
  readonly samePopulation: boolean;
  readonly sameGrain: boolean;
  /** Eligibility requires complete inputs and the same revision/population/grain. */
  readonly eligibleToPass: boolean;
  /**
   * status='matched' requires eligibility AND exact delta=0 and means only
   * "Totals match". It makes no assertion that every underlying line matches.
   * Nonzero row residual counts do not belong to this variant.
   */
}

export interface DecimalRowReconciliationResult {
  readonly kind: "rows";
  readonly status: Exclude<
    DecimalReconciliationStatus,
    "grainMismatch" | "revisionMismatch"
  >;
  readonly leftField: string;
  readonly rightField: string;
  readonly population: DecimalPopulation;
  /** Optional diagnostic net residual; never the criterion for Lines match. */
  readonly delta: DecimalValue | null;
  /** A zero net residual alone cannot pass: +0.01 and -0.01 can cancel. */
  readonly nonzeroResidualCount: number;
  readonly nonzeroResidualIds: readonly OccurrenceId[];
  readonly missingPairIds: readonly OccurrenceId[];
  readonly invalidPairIds: readonly OccurrenceId[];
  readonly bothSidesComplete: boolean;
  readonly samePopulation: boolean;
  /** Eligibility requires complete valid pairs on identical occurrences. */
  readonly eligibleToPass: boolean;
  /**
   * status='matched' requires eligibility AND nonzeroResidualCount=0 and means
   * "Lines match". It never requires or creates allocation of a rounded total.
   */
}

export type DecimalReconciliationResult =
  | DecimalTotalReconciliationResult
  | DecimalRowReconciliationResult;

/** Total-finding overload, used by the saved reconcile(leftFinding,rightFinding). */
export declare function reconcileDecimals(
  left: DecimalTotalFindingResult,
  right: DecimalTotalFindingResult,
  definition: DecimalTotalReconciliationDefinition,
): DecimalTotalReconciliationResult;

/** Row-pair overload, used by the separately named rowpaircheck(leftField,rightField). */
export declare function reconcileDecimals(
  left: readonly DecimalMeasureInput[],
  right: readonly DecimalMeasureInput[],
  definition: DecimalRowReconciliationDefinition,
): DecimalRowReconciliationResult;

/**
 * Optional M4: coordinates are disposable approximations, not filter values.
 * A valid v1 amount has magnitude below 1e128 and a nonzero magnitude at least
 * 1e-38. Direct conversion is therefore finite and cannot underflow to zero;
 * value collisions/inexact coordinates remain possible. Nonfinite checks are
 * defensive internal/invalid-state guards, not valid-input fixture outcomes.
 */
export type DecimalProjection =
  | {
      readonly status: "projected";
      readonly coordinate: number;
      readonly exactValue: DecimalValue;
      readonly occurrenceIds: readonly OccurrenceId[];
      readonly approximate: true;
    }
  | {
      readonly status: "omitted";
      readonly reason: "unsupported";
      readonly exactValue: DecimalValue;
      readonly occurrenceIds: readonly OccurrenceId[];
    };

export declare function projectDecimal(
  value: DecimalValue,
  occurrenceIds: readonly OccurrenceId[],
): DecimalProjection;

/**
 * Feature-specific preflight at an existing export/write boundary. No generic
 * transaction framework: callers check before emitting a callback or writing.
 */
export type DecimalExportPreflight =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: "DECIMAL_UNSUPPORTED_EXPORT";
      readonly reason: string;
    };

export type DecimalExportTarget =
  | "settings-json"
  | "full-analysis-json"
  | "dashboard-text"
  | "rows-text-csv"
  | "project-folder"
  | "notebook";

/**
 * Each owning exporter preflights its complete pending state and returns this
 * result before writing. Implement at the current feature boundary; do not add
 * runtime release-stage switches or a generic export capability framework.
 */

/**
 * Fixture op/mode fields are portable harness notation, not a second saved API.
 * Adapt fixture `mode` into DecimalOutputPolicy.rounding when writing tests.
 * Missing source values propagate; malformed values remain errors in sidecars.
 * Display formatting never mutates arithmetic scale or these saved policies.
 */
