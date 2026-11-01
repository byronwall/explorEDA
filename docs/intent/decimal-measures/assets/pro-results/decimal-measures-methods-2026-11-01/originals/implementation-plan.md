# Exact decimal measures and ledger reconciliation — implementation plan

## Build decision and scope

Build an explicit exact-decimal calculation path in the existing React and TypeScript library. Source text remains available as source evidence. Typed decimal results support line calculations, exact comparisons, useful summaries, and declared rounding. Ordinary measurement calculations continue using their present numeric behavior.

The public scalar is a plain JSON-safe object with a signed integer coefficient string and a decimal scale. BigInt is an internal arithmetic tool. Calculations opt in with `arithmetic: { kind: "decimal", version: 1 }`; reducers carry an explicit decimal output policy when they round. Display precision is never an arithmetic instruction.

Four stages close progressively larger loops:

| Stage | Complete user outcome | Explicit boundary |
| --- | --- | --- |
| **M1 — one-source reconciliation** | Preserve amount text, calculate lines, filter one invoice, inspect exact Rows and metric totals/differences, save a native analysis or Dashboard text, reopen, and refresh with the same recipe. | Exact grouping/entity summaries, Pivot, project queries/folders, notebooks, and numeric chart projection are unavailable. |
| **M2 — grouped reconciliation** | Run exact project calculations, filters, grouping and entity measures; inspect Pivot cells/subtotals; use workers; save/reopen a portable folder with the reader policy and parameter bindings. | Notebook exact definitions still fail before callbacks or writes. |
| **M3 — saved notebook findings** | Bind exact values and a reconciliation finding into prose; inspect contributors; edit rules; save, reopen, and refresh with identical rest/live evaluation. | No general bookkeeping workflow or arbitrary finding-expression language. |
| **M4 — optional chart projection** | View selected exact measures in a narrowly adapted scatter/bar surface while exact IDs, values, filters, and traces remain authoritative. | No all-chart conversion, approximate amount predicates, or exactness claim for pixel coordinates. |

M1–M3 are the recommended build. M4 is an optional follow-on. A pure arithmetic helper is an internal work package, not a user-visible milestone. No stage depends on the prior numeric-preparation, quantity-calculation, reusable-output, or refresh proposals.

This document is a proposed plan. It does not describe shipped decimal support. The baseline is `d3920a285f3755a8324998775deb131747e959f5`; no repository code, commits, deployment, or application tests were produced for this Methods mission. `report.md` supplies the numerical rationale and primary sources. `decimal-fixtures.json` supplies portable expected data; `decimal-contract.ts` is an inspection companion defining the proposed types, not production implementation.

## 1. Fixed contract for implementers

### 1.1 Representation and bounds

Use one validated scalar throughout supported row, query, worker, and saved-value boundaries:

```ts
type DecimalValue = Readonly<{
  kind: "decimal";
  coefficient: string;
  scale: number;
}>;

type DecimalArithmetic = Readonly<{
  kind: "decimal";
  version: 1;
}>;

type DecimalRounding =
  | "halfEven"
  | "halfAwayFromZero"
  | "towardZero"
  | "floor"
  | "ceiling"
  | "unnecessary";

type DecimalMeasurePolicy = Readonly<{
  version: 1;
  output?: Readonly<{
    scale: number;
    rounding: DecimalRounding;
  }>;
}>;
```

- The coefficient is canonical signed integer text: no leading `+`, redundant leading zeros, or `-0`. Zero has coefficient `"0"`; its stored scale may still preserve the declared decimal places.
- Persist scale from 0 through 38. Limit public coefficients to 128 digits, raw input to 256 characters, absolute exponent to 128, and internal integer scratch values to 256 digits. These are product bounds, not claims about the mathematical range of decimal arithmetic.
- Preserve source spelling separately. Numeric equality removes insignificant trailing coefficient zeros and equates all decimal zeros; representation equality additionally compares scale. The raw lexeme may distinguish leading zeros, sign, exponent notation, and whitespace that the atom deliberately does not retain.
- Formula operations check their own result bounds. Sum and average use the wider scratch accumulator and finalize once. A sum with an explicit output policy quantizes the wide exact accumulator first, then checks the 128-digit public-result bound. Without an output policy, sum checks the result at the maximum input scale. Average divides the wide sum directly and checks the final rounded result. Do not require a bounded public scalar as an intermediate; that would reject useful cancellation, scale-reduction and averaging cases.
- No global mutable precision context. No decimal-library class crosses row, worker, JSON, or host-callback boundaries. No new runtime dependency is required for the proposed finite arithmetic kernel.

The accepted grammar and exact scale rules in `report.md` and the fixtures are normative. Implement those rules directly rather than importing the permissive input grammar of a third-party decimal library. All raw row reads continue through `lib/valueParsing.ts`; its decimal branch may delegate to a pure `lib/decimal` parser.

### 1.2 Source binding and arithmetic mode

Add `arithmetic?: DecimalArithmetic` to `SavedCalculation`, runtime calculation definitions, and `CalculateStep`. An absent tag retains existing behavior. Exact mode must see literal token text before `Number` conversion.

Provide these distinct entry points:

```ts
// Proposed formula examples; these are not available at the baseline.
decimalSource(["Price text"])
decimal("1.005")
exactInteger(quantity)

// Exact mode: integer and decimal literal lexemes become exact operands.
round(net * 0.075, 2, "halfEven")
divide(net, 3, 6, "halfEven")
```

- `decimalSource` accepts one syntactic raw-source field reference. It does not first evaluate that reference through the converted runtime column getter. The compiler rejects a literal, arbitrary expression, or derived-field reference in that position.
- The standalone manager obtains that value from immutable `rawData` aligned with the runtime row ID. A query validates original-source field origin and reads the untouched incoming source projection for the referenced field. Do not guess a source row by `sourceId` after multiple lookups.
- `decimal(text)` parses a string under the exact grammar. It does not stringify a native number. A generated string can be parsed, but its provenance is a generated string rather than original source evidence.
- `exactInteger(number)` is an explicit bridge for a finite safe integer currently represented by JavaScript. It does not certify what the original file contained. All other implicit exact/approximate mixing is an error.
- `/` succeeds only when its exact terminating result satisfies the contract. `divide` explicitly rounds to a requested scale/mode; divide by zero is an error. `round` quantizes a decimal value at the indicated business stage.
- Scale/mode arguments are compile-time policy metadata: v1 requires a literal integer scale from 0 through 38 and a literal supported mode. Compile those into the output-policy object, rather than treating scale as an amount operand. Reject row-dependent policy expressions in this version; test these argument roles alongside literal preservation.
- Exact measure inputs must already be typed decimals. A reducer does not parse arbitrary strings or adopt numbers. Counts remain ordinary dimensionless counts and never inherit currency formatting.

Persist `decimalInputs: { fields: string[], readAs: "text" }` in standalone settings and, in M2, `SourceDefinition`. This is a reader recipe. It feeds `preserveTextFields` before numeric inference/coercion; it does not overwrite original data and does not change the meaning of a formatted numeric field. The exact-source preview should add the declared field when the user creates `decimalSource(...)` so later refresh has a saved input requirement.

Keep source provenance beside that recipe. When a native decimal column is exposed as exact text, retain a small per-field descriptor such as `decimalSourceOrigins[field] = { kind: "typedSourceDecimal", scale, format: "arrow" | "parquet" }`. `TableFile` returns this metadata; the host passes it through `ExplorEda`/the provider with the corresponding rows; full-analysis JSON retains it with those raw rows; M2 source definitions/snapshots retain it with their table. An exact trace reconstructs the original coefficient and declared scale from the preserved text plus this validated descriptor and reports `typedSourceDecimal`, rather than calling it an original text lexeme. Ordinary text sources and generated strings keep their distinct provenance. This is a feature-specific descriptor, not a new source metadata framework.

### 1.3 Reducers and reconciliation

Exact measure configurations use `decimal: { version: 1, output?: { scale, rounding } }` across adapters. `output` is mandatory for average and optional for sum; a sum output policy quantizes only after the exact sum. Min/max are comparisons under the written decimal contract. A formula can deliberately round each line before summing; that is a different saved calculation.

Keep both the computed value and its completeness:

- A sum of valid contributors may be exact for those contributors while the requested ledger population is incomplete.
- Missing input, invalid text, missing raw evidence, type mismatch, arithmetic failure, filtered-out rows, duplicates, and entity conflicts are distinguishable.
- A zero value is not an empty or unavailable result.
- A total reconciliation declares **Totals match** only when both operands are available, complete under the requested population, and have exactly zero decimal difference. Equal partial sums do not prove reconciliation. This statement does not claim that corresponding lines agree.
- A separate paired-line check declares **Lines match** only when both sides are complete and every paired residual is zero. Opposite row errors can cancel in a total; expose nonzero residual count and IDs instead of using a sum of residuals as the line test.
- In M1, card difference compares the selected and baseline measures under the same saved policy. Automatic shares and percentage strips are disabled for exact amounts; they cannot silently use JS division.

The stable recommendation IDs are in `recommendations.md`: M1 primarily implements ED-01–ED-15 and ED-28; M2 implements ED-16–ED-19; M3 implements ED-20; optional M4 investigates ED-21. ED-22 is measured performance exploration. ED-23–ED-27 identify work to defer or avoid.

## 2. Current integration seams and ownership

The following facts were checked at the fixed baseline. Paths are relative to `packages/explorEDA/src/` unless prefixed with `apps/`.

| Existing owner | Checked behavior | Required change |
| --- | --- | --- |
| `lib/valueParsing.ts`, `lib/fieldSettings.ts` | Raw parsing and ordinary field conversion are separate from display formatting. | Add the strict decimal raw-input entry point; keep source access independent of ordinary converted values. |
| `lib/calculations/types.ts`, `parser/semantics.ts`, `engine/Calculator.ts`, `functions/registry.ts`, `CalculationState.ts` | Calculator operations are numeric; manager resolves/caches calculations. | Preserve literal lexemes, propagate arithmetic mode, add typed operator/function dispatch and raw-source access. |
| `providers/DataLayerProvider.tsx` | `toRuntimeCalculations` and `toSavedCalculations` copy only name/expression; conversion precedes manager creation; `setData` resets settings. | Carry policy and raw data everywhere, use existing invalidation/notification controls, add explicit retained-recipe refresh. |
| `types/ChartTypes.ts`, `types/FilterTypes.ts`, `hooks/CrossfilterWrapper.ts` | There are independent primitive scalar aliases. Crossfilter dimensions use row IDs. | Share the decimal-capable scalar contract; keep row-ID dimensions, add exact predicate evaluation. |
| `lib/categories.ts`, profiles/statistics helpers, DataTable helpers | Equality, keys, sorting, search and CSV include primitive/String/Number assumptions. | Add explicit decimal branches, with bounded exact profiles rather than Float64 statistics. |
| `lib/aggregates.ts`, MetricCard plan/render/input helpers | Shared numeric reductions; card delta/share are number operations; calculated measures omit raw inputs. | Add exact row reducer and exact delta; connect formula source traces; disable automatic exact shares. |
| `lib/analysis/evaluateProject.ts` | Query calculation, grouping, filtering and entity agreement have independent numeric/identity assumptions. | M2 dispatch, semantic keys/comparison, complete contribution evidence, exact field contracts. |
| `components/charts/PivotTable/utils/calculations.ts` | Independent reductions; totals recompute from original contributor rows. | M2 exact dispatch; preserve recomputation of totals; do not add displayed cell means. |
| `utils/saveDataUtils.ts`, `lib/analysis/projectFile.ts` | Primitive scalar guards; settings and restore project calculation fields explicitly. | Validate tagged values and rule shapes; preserve policies through every reconstruction. |
| `lib/project/tables.ts`, `lib/readers/columns.ts`, `typedColumns.ts` | Multiple early Number conversions, including the typed-decimal ≤15-digit branch. | Preserve requested source text or native decimal coefficient/scale before conversion. |
| `lib/dsl/{compile,export,paths,views,project}.ts` | Calculations, bindings, filters and shared-view export have separate parse/print rules. | Add concrete exact declarations/literals; reject unsupported or conflicting exports before loss. |
| `lib/notebook/{compileNotebook,readNotebook,findings,writeBack}.ts`, notebook component | Findings are numeric; rest evaluation skips calculations; writeback handles charts; host callback precedes refusal. | M3 resolved columns, exact finding/reconciliation result types and definition writeback with preflight. |

Supplemental exact-ref GitHub files resolved the omitted Rows/filter/DSL/writeback seams. There is no decisive missing input. The implementation worker should inspect its working checkout before edits because main may have advanced; current-source claims in the report remain tied to the supplied baseline.

At this baseline, `lib/aggregates.ts::AGGREGATIONS` explicitly includes `count`, `sum`, `average`, `max`, and `min`; MetricCard uses that shared union and reducer. README/intent descriptions mentioning only count, sum and average are nonexhaustive. Exact min/max support in M1 therefore adapts an existing operation.

## 3. M1 — complete single-source line reconciliation

### User promise

Open a CSV or supported typed-decimal source, choose amount/rate text, preview all invalid/missing inputs, calculate invoice lines and two rounding alternatives, filter one invoice, inspect exact rows and totals, and save/reopen/refresh without changing source evidence or rules. The supported views are Rows/DataTable and metric cards at row grain.

### Work package A: finite arithmetic kernel and scalar adapters

Add focused modules under `lib/decimal/`: `types.ts`, `parse.ts`, `arithmetic.ts`, `format.ts`, and `reduce.ts`, with tests beside them. A separate small `contract.ts` may own guards/constants if that avoids circular imports; do not introduce a general numeric backend framework.

Public or internal APIs should cover:

- `isDecimalValue`, strict validation, parse-from-text, and parse-from-literal lexeme.
- Exact add/subtract/multiply, exact terminating divide, explicit rounded divide, quantize, compare, numeric key, and exact text formatting.
- A wide sum accumulator retaining scale and contribution count; average finalizes directly from the wide sum and count.
- Structured operation failure and per-row diagnostic codes matching fixtures. Reuse existing error display plumbing while retaining a machine-readable reason in trace data.

Use integer quotient and remainder to round once, including negative ties. Do not use floating logarithms, epsilon comparisons, `toFixed`, `Math.round`, or an approximate intermediate to derive exact results. Reject limits rather than clamping or silently dropping digits. Ensure compare/key operations do not fail merely because a value is large but valid.

Preflight allocation from lexical lengths before constructing a large BigInt or padding/appending zeros. Check the raw character bound, exponent magnitude, effective scale, expanded coefficient length and scratch-operation bound first. Native typed columns must validate their declared scale and exact unscaled representation before `decimalText` pads it. A value whose expansion exceeds the contract fails before the expansion is allocated. Keep this within the parser/kernel; no general resource-limit system is needed.

Add decimal-aware branches to the scalar aliases, `lib/categories.ts`, and field type/profiling code. `valueParsing` must explicitly refuse a decimal in ordinary numeric parsing rather than implicitly projecting it. Decimal profiles initially expose counts, exact min/max, and canonical value frequencies; variance, standard deviation, median, numeric bins and other unsupported numeric summaries remain absent for this type.

### Work package B: preserve inputs before conversion

Add `ReadTableOptions.preserveTextFields` and thread it through `readTableText`, `readTableFile`, `readText/decode`, `readDelimited`, and `typeTextColumns`. Parse CSV as strings first, as the delimited reader already does, and skip numeric inference conversion for those declared fields. Retain actual blank/missing distinctions according to the fixture contract rather than replacing a failed parse with zero.

For Arrow/Parquet typed decimal columns, use the unscaled integer and declared scale in `typedColumns.ts::convertColumn` before its present Number conversion. Return exact source text with the scale intact. Floats remain approximate. The existing ≤15-digit shortcut is not an exact-source guarantee.

Return the typed-source descriptor described above from the reader along with the text. Thread it through `readers/types.ts::TableFile`, the reader consumers/host props in `components/ExplorEda.tsx`, provider raw-data state, and `SavedAnalysisStructure` serialization/validation. A descriptor names only an existing field and has a supported format and valid integer scale. It does not replace per-row coefficient data: the exact preserved text supplies that. If an upstream decoder has already supplied an unsafe Number coefficient, refuse to call it an exact native decimal. On refresh, provenance arrives with the new rows and replaces the old descriptors; never carry a prior file's typed-origin label onto unrelated replacement text.

The import preview may retain the file/text while choosing fields, then re-read with the selected preservation policy before committing the dataset. If only a Number is available, report unavailable original digits and request a fresh source read through the supported workflow. JSON source input in M1 uses quoted decimal strings. Numeric JSON tokens are not presented as recoverable exact source text; a general lossless JSON parser is outside this stage.

Persist `decimalInputs` with settings. Validate duplicate field names and incompatible source data. A settings-only restore can require new source data but cannot promise to contain it; a full analysis stores the raw strings. `decimalSource` continues to read rawData even if an ordinary field display/type setting produces a different runtime value.

### Work package C: calculator, manager, and provider

Modify `parser/semantics.ts` so exact-mode literals use their raw token lexeme. Keep existing numeric-mode AST/evaluation semantics intact. `decimalSource` is a restricted AST operation: validate a direct source-field reference and invoke the raw-source accessor before ordinary argument evaluation. Do not let `decimalSource(numberExpression)` become a covert Number-to-decimal cast.

Extend calculation context/manager construction with raw source rows or an equivalent row-indexed accessor. The accessor is created locally; it is not serialized in saved state or worker messages. It must reject derived field names, invalid raw values and unknown source fields. Reuse the dependency graph and calculation cache; record raw-source dependencies so a refresh or source-recipe edit invalidates the correct results.

Propagate `arithmetic` in every constructor/projection, including:

- `CalculationState.ts` set/add/update/rebuild paths.
- `DataLayerProvider.tsx::toRuntimeCalculations`, `toSavedCalculations`, initial construction, restore, and refresh.
- `utils/saveDataUtils.ts::validateSavedAnalysisForData`.
- `dsl/compile.ts` saved calculation construction and manager inputs.

Tag resulting columns as semantic decimals; comparison expressions may produce booleans through the declared exact evaluator. Do not infer an amount from a string that resembles a number or infer decimal mode from a currency display setting. Retain a `DecimalCellResult` status sidecar beside the row value so an undefined invalid result remains distinguishable from a genuinely missing input. Derived field errors remain per row and visible in the existing editor/Rows error path. Known operand errors must not disappear behind another operand's missing status; the fixture propagation cases define this behavior.

### Work package D: Rows, exact filtering, and source inspection

Add a distinct exact range predicate to `types/FilterTypes.ts` with validated decimal lower/upper bounds and inclusivity, an exact value predicate, and a `decimal-state` predicate for `valid`, `missing`, or `invalid`. Update `hooks/applyFilter.ts` and its supported callers to pass the cell's status sidecar when a state predicate requires it. An undefined value alone cannot determine missing versus invalid. Exact comparisons use the atom; state predicates use the corresponding `DecimalCellResult`. Category equality/keys must retain type distinction from number and string.

Required adapters include `DataTable/filteredRows.ts`, `DataTableBody.tsx`, `DataTableHeader.tsx`, `components/ColumnFilter.tsx`, `DataTableContextMenu.tsx`, `DataTableToolbar.tsx`, `hooks/useFilteredFieldProfiles.ts`, `lib/fieldProfiles.ts`, `lib/declaredFieldTypes.ts`, and the SummaryTable type/statistics helpers.

- Sorting uses decimal comparison, with stable source order only as an equal-value tie break within one dataset.
- Search, highlighting, copy value/row, and CSV use exact decimal text rather than `String(object)`.
- Exact bound controls are text inputs with validated previews. They do not use `Number(raw)`, 12-significant-digit formatting, numeric sliders, or approximate header histograms to create predicates.
- The analyst can deliberately save a `decimal-state=valid` population before reconciliation. Keep the upstream excluded IDs/reasons visible. Filtering eight source rows to six valid rows makes the six-row active ledger explicit; it does not erase the blank and invalid source records or describe the original eight-row ledger as complete.
- Display rounding can show fewer digits, but trace/copy-exact actions and predicate values retain the full amount. A display edit cannot change membership or reconciliation status.
- Reuse DataTable's resolved calculated rows for rendering and export. Do not create a second independent formula evaluation path for CSV.

Trace records need raw source text, source field/reference, parsed coefficient/scale, formula and rounding stage, resolved result, and included/excluded status. Extend `MetricCard/measureInputs.ts` and the provider's aggregate-input resolver so calculated measures no longer omit their original inputs. Store or derive a compact operation trace; do not duplicate entire rows in every intermediate node.

### Work package E: row-grain metric cards

Route an explicitly decimal measure to the exact reducer in `lib/aggregates.ts` and `MetricCard/metricCardPlan.ts`. Adapt `MetricCard.tsx` numeric comparisons/formatting, and retain the existing metric trace mechanism. Sum/min/max/average, baseline value, and exact delta must preserve typed values. Average requires saved output scale/mode. A sum's optional output quantizes the wide accumulator before the public coefficient-limit check; do not materialize a bounded unrounded sum first.

Disable automatic shares/percentage strips for decimal cards. Counts remain counts. Label row-grain scope and completeness in the plan/trace. A card with blank/invalid amounts can show the exact valid-contributor subtotal with an incomplete status; it cannot claim the whole invoice reconciles.

For paired-line validation in the M1 example, derive a decimal residual per row, show the number of valid nonzero residuals and the missing/invalid pair counts, and provide the exact offending IDs. A total residual of zero is only total agreement. The example must include opposite residuals that cancel and still identify two different lines. The first stage can express this with existing row filters/count cards and derived fields; it does not need the M3 finding API to make the distinction visible.

M1 blocks exact `entityField`, exact grouped aggregate definitions, and unsupported exact chart measures at authoring, restore validation, and evaluation. It must not leave the existing `Object.is` entity agreement available for decimal objects. The M1 example uses a categorical invoice filter and row-grain cards instead of introducing a new grouped-results surface.

### Work package F: native save and Dashboard text

Extend `SavedDatum`, `SavedCalculation`, saved filter and measure shapes, and the corresponding guards in `saveDataUtils.ts`. Valid decimal objects serialize unchanged as plain JSON; BigInt never reaches these APIs. Full-analysis save keeps rawData, input-origin descriptors and definitions, then recomputes on restore. Validate before changing provider state. Preserve the existing special-value behavior for ordinary fields. A settings-only/Dashboard export preserves the interpretation recipe; its host/source must supply the associated origin metadata on reopening, while a full analysis is self-contained for that evidence.

Dashboard text must support the complete M1 settings semantics in the same stage. The proposed readable form is:

```text
decimal-input "Price text" "Rate text"
calc price arithmetic=decimal = decimalSource(["Price text"])
calc tax arithmetic=decimal = round(price * decimalSource(["Rate text"]), 2, "halfEven")
```

Implement the declaration in `dsl/parse.ts`, allowlists, compiler and exporter. Consume `arithmetic=decimal` as calculation metadata before field-display pairs. Export exact predicate literals and measure policies using a shared typed-scalar writer, never the existing primitive cast. The importer reads an explicit decimal literal before general Number parsing. Add roundtrip coverage for all supported exact declarations; no implied legacy-text migration is needed.

Update `dsl/views.ts` shared signatures to include decimal input declarations. A multi-view text export with different shared decimal recipes must fail before producing a supposedly complete export. Do not substitute the first view's policy. A supported single/shared-policy Dashboard export and native full analysis provide complete M1 save paths.

CSV export is **values-only**: exact coefficient/scale text, correctly escaped, with no locale grouping or currency marks. CSV itself does not retain formulas or semantic type. The UI should direct a reusable analysis save to native JSON/Dashboard plus the source read recipe; it must not advertise plain CSV as a full analysis restore format.

### Work package G: explicit refresh and callback discipline

Add a narrowly named refresh operation, for example `refreshData(nextRawRows)`, separate from existing reset/import. It retains the current saved recipes, calculations, exact filters, card definitions and layout; revalidates the source contract; reruns derivation; and publishes one consistent new revision. The ordinary `data` prop replacement/reset behavior is not silently redefined.

Use existing provider hold/invalidation mechanisms around accepted edits and refresh. Failed rule validation causes zero settings callbacks and leaves the previous valid state. A successful user rule edit is one state change/undo checkpoint. A valid refresh with row-level input failures replaces the population and exposes those failures; it must not keep stale successful totals under a new source revision.

Keep source identity conservative. Reuse current unique-content remapping where it can prove membership; clear unprovable positional selections when rows change. No stable-key framework is a prerequisite. Exact typed predicates can remain when their field contract remains unchanged; an incompatible source/meaning change requires explicit invalidation rather than silently reusing a threshold.

### Work package H: unsupported boundaries

Before M2, exact project/folder/Pivot configurations are refused before evaluation or export. Before M3, notebooks containing decimal definitions or typed decimal rows must report unsupported capability before provider acceptance, host callbacks, or writeback. The existing notebook callback-before-refusal order cannot be reused for these attempts.

Add targeted feature preflight at existing entry points. Do not build a generic capability registry or migration system. Preserve untouched source text when appropriate, but do not partially save a downgraded analysis. Unsupported numeric charts cannot silently discard decimal values as invalid numbers.

### M1 docs, example, acceptance, and main risk

- **Docs in this stage:** add `apps/demo/src/docs/pages/exact-decimals.mdx` and catalogue entry. Update `calculated-fields`, `data-table`, `metric-card`, `filters`, `trace`, `export`, `dashboard-text`, and `developers` sections. Explain source evidence, business rounding versus display digits, completeness, native-number refusal, and supported saves.
- **Runnable example:** register `decimal-line-reconciliation` in the demo and `apps/demo/src/docs/live/examples.ts`, using the supplied invoice/rounding data. It must allow invoice filtering, exact Rows inspection, line-rounded versus total-rounded totals, card tracing, native save/reopen and explicit refresh. Include a source value already supplied as Number so refusal is visible through a deliberate example action, not a hidden implementation caveat.
- **Exact acceptance:** all parser/basic arithmetic/division/rounding fixtures; CSV and native-decimal source preservation; 20-digit sorting and narrow exact filters; raw-source binding after ordinary field conversion; valid zero versus no valid values; average output policy; exact metric delta; decimal-state validity filters with tracked exclusions; opposite row residuals whose total is zero but nonzero residual count is two; rejected entity/group support; source/recipe/trace equality after JSON and Dashboard roundtrip; one accepted callback and zero rejected callbacks; refresh updates totals while retaining definitions/layout.
- **Boundary acceptance:** a native Arrow/Parquet amount retains typed-source origin, coefficient and scale after host handoff and full-analysis reopen; a subsequent textual refresh cannot inherit that native-origin label. An over-limit expanded token fails before BigInt/padding allocation. A 128-digit amount plus `0.0` may exceed the public coefficient limit at the unreduced input scale; an explicit scale-0 `unnecessary` sum succeeds by quantizing the wide accumulator before the public limit check.
- **Main risk:** a decimal mode or raw source requirement is lost in an existing object reconstruction, yielding a plausible ordinary-number result. Test the full manager/provider/export/restore path, not merely the helper.

M1 is complete only when this whole loop works in the browser. The pure kernel and UI editor alone do not satisfy it.

## 4. M2 — exact project queries, entity measures, Pivot, and folders

### User promise

Reconcile several invoices or categories, compare line totals with grouped/subtotal totals, remove duplicated joined entities correctly, filter an exact amount population, inspect original contributors, and reopen/refresh the same project folder. Direct and worker evaluation agree.

### Query and worker implementation

Extend `CalculateStep` with the same arithmetic tag. Reuse exact formula compilation; provide the query raw-source accessor only for original-source fields. A calculation after aggregation must not treat a derived total as raw source text. Preserve source references through lookup/expand and expose the originating raw cell in traces.

Modify `evaluateProject.ts` at `calculateFrame`, `filterFrame`, `aggregateFrame`, semantic key generation, field metadata, parameter validation, and stage diagnostics. Its `stable` helper cannot remain `typeof + String` for decimal values. Exact numeric equality controls grouping and entity agreement; representation differences remain trace metadata.

Add decimal parameter types and exact literal bindings to `AnalysisParameter`, project validation, Dashboard analysis bindings and project DSL. A quoted ordinary string remains a string; a decimal parameter/literal is explicitly typed. Add the query equivalent of the saved `decimal-state` population filter, retaining status sidecars through calculate/filter stages. Reject mixed exact/approximate operands and invalid typed bindings before computing a filtered result.

Carry the same plain atoms through `analysisWorkerProtocol.ts`. `useAnalysisEvaluation.ts` should retain its latest-request and applied-binding guarantees: the value, counts, raw trace, and visible bindings must belong to the same finished evaluation. Rebuild the accessor inside the worker from transferred source tables; never transfer functions or decimal class instances.

### Entity-grain aggregation and counts

Use the existing once-per-entity model with decimal semantic equality:

- `1.0` and `1.00` agree numerically. Their original representations remain visible.
- A differing numeric amount conflicts. Preserve every conflicting row and make the entire requested measure unavailable, consistent with the current conservative contract.
- Every observed occurrence of an eligible entity must hold a valid agreeing amount. Valid mixed with missing/invalid input is inconsistent availability and makes the requested entity measure unavailable; an all-missing or all-invalid entity has its own explicit excluded status. Do not silently take its one good row.
- Select the lexicographically smallest occurrence ID as the representative of agreeing duplicates, and use the maximum scale among their equal amounts for the representative value. Include duplicate memberships separately from valid contribution count.
- Preserve missing/invalid amounts and missing identity separately. Do not hide conflicts by dropping them from `measureContributors`.
- Keep row-population counts and entity/unit counts distinct. Do not reuse the existing ambiguous `rowCount` as every denominator.

Use D-L005 as a completeness acceptance: eight source rows contain six valid amounts, one blank and one invalid value; the valid subtotal is `28.685` but the full population is partial. An explicit valid-state filter reduces the active population to six rows and retains the two upstream exclusions; the active ledger can then be complete at `28.685`. Group A still reports its original four-row/two-valid population before that filter. The amounts and IDs in the fixture are the oracle.

Primitive source/entity identifiers retain their existing meaning. Decimal measure equality does not authorize decimal relationship identifiers or silent normalization of text IDs and numeric IDs. Reject exact decimal relationship/entity-key fields until there is an explicit identity design; this stage needs decimal measures, not money-valued row IDs.

For combined groups and grand totals, pool the original contributors and reapply the grain rule. An entity appearing in two groups counts once in the pooled total. Average combines exact sum/count state, never rounded group averages. A deliberately summed set of rounded subtotals is a different authored expression and must retain that rounding stage in its trace.

### Pivot implementation

Adapt `PivotTable/types.ts` and `utils/calculations.ts`, its editors/renderers and saved validation. Support exact sum, average, min/max, row/column/grand totals and their trace records. Counts remain dimensionless. Other Pivot reductions such as variance, standard deviation, median or mode must be explicitly unavailable for decimal measures until their semantics are intentionally added; do not fall through to numeric coercion.

Keep `calculatePivotData`, `generateRows` and `generateCells` recomputing totals from relevant original rows. Add decimal sorting/labels and group keys. Store the measure's decimal policy; do not infer it from cell precision. Ensure filtering changes the actual contributing source population before reduction.

### Source policies, project files, and folder persistence

Add `decimalInputs` to source definitions, and preserve the narrow `decimalSourceOrigins` descriptor for tables materialized from native decimal input. Pass the read declaration through `readProjectFolder` to `parseTable/parseCsv/typedCell` before Number conversion. A declared string/decimal source policy must actually affect reading; at the baseline, ordinary field type declarations alone do not do so. Project JSON and any snapshot/folder representation that claims to preserve typed-source provenance must carry the descriptor, or refuse that export before losing the distinction. Re-reading an actual typed source regenerates its descriptor from the new schema.

Extend project JSON validation for exact atoms, calculation/reduction policies, parameter types, and exact filters. Continue using the existing encoder for undefined/nonfinite values; plain decimal atoms require validation but no class revival. Ensure view selection carries all input steps and source read declarations.

Implement source/query/aggregate/filter/parameter syntax in `dsl/project.ts`, and typed bindings in `project/analysisText.ts`. Roundtrip a decimal literal such as `decimal("9007199254740993.01")` without passing its digits through Number. The source text declaration and query calculation must both survive project text export. If a folder materializes native-decimal source rows as text, write the narrow source descriptor too, for example a source-block `decimal-origin "Amount text" format=arrow scale=2` declaration. Its parser validates the referenced field, format and scale; it is provenance for the retained source representation, not permission to reinterpret arbitrary numeric data.

Update `writeFolder.ts::analysisFileText` to inspect export omissions. A missing decimal recipe, incompatible shared-view policy or unsupported notebook must refuse the save before file writes. `projectFileText` must retain the source read recipe even when preserving short inferred declarations. Folder refresh rereads with the persisted policy, recomputes queries, and invalidates stale results without discarding definitions.

No database/connection redesign is required. A database driver that returns decimal source text or an exact unscaled/scale representation can join the same input seam. A driver that has already returned a binary64 value cannot be relabeled as original exact input.

### M2 docs, example, acceptance, and main risk

- **Docs in this stage:** `exact-decimals.mdx` grouped/entity section; `pivot.mdx` exact measures/subtotals; `project-folders.mdx` preserved-text source declarations; `dashboard-text.mdx` query literal/binding syntax; `developers` worker and source APIs.
- **Runnable example:** `decimal-invoice-groups` project folder with invoice lines, duplicated joined records, one conflicting entity, exact query filters and a Pivot. Include the supplied grouped/subtotal and filtered-population reconciliation cases. The demo must offer source trace, folder save/reopen and refresh.
- **Exact acceptance:** same-scale and mixed-scale entity duplicates; conflicting entities with complete row lists; group/subtotal/grand totals; unequal subgroup means with correct pooled average; exact filter membership above the safe-integer range; row-order/chunk regrouping invariance within bounds; typed bindings through JSON/text; direct versus worker output/trace equality; stale worker response suppression; folder read/write/refresh without digit loss; refused unsupported notebook write with zero mutations.
- **Main risk:** totals look correct while the counted grain or contributor membership differs. Assert member sets and row/entity counts alongside values.

## 5. M3 — exact notebook values and reconciliation findings

### User promise

Write a notebook that explains the reconciliation, shows exact totals and a difference/match finding, links to original records, and retains its formulas, source interpretation and rounding choices after an edit, save, reopen or refresh.

### One resolved-column path for live and rest evaluation

Extend `FindingResult` to retain typed decimal values and operation/completeness metadata. Adapt `evaluateFinding`, `formatDigits`, comparison formatting and result guards so they do not call Number operations on atoms. A display `digits` setting formats a copy; it is not the measure's output policy.

`evaluateNotebookFindings` currently reads source columns only. Add a small reusable resolved-column adapter over raw rows, field settings, the calculation manager and definitions, and use it for rest evaluation and the live finding context. It must supply exact values, raw source access, per-row errors and matching IDs. A workspace decimal calculation and a query-generated decimal field must both produce the same reopened finding as their live version.

Extend notebook query binding support if the notebook declares decimal parameters. `readNotebookText` currently evaluates with empty bindings; typed values must be read explicitly from the notebook/context and included in the evaluation revision. A source rule, binding or refresh change invalidates both numeric text and trace membership together.

### Narrow reconciliation finding

Add a new finding operation corresponding to `reconcile(leftFinding, rightFinding)`. Its proposed definition follows the type companion's totals variant: `{ id, kind: "totals", leftFindingId, rightFindingId }`, with a targeted DSL declaration such as `finding @check reconcile @expected @observed`. The author-facing word `reconcile` compiles to that totals definition; it does not create a second persisted shape.

This operation compares totals from two different exact amount measures. Its operands must be additive **sum findings**, including a sum with explicit post-total output quantization. Means, min/max and counts remain useful findings but are not eligible ledger totals for this operation. Enforce that rule in authoring, saved-definition validation and evaluation. Do not weaken the existing same-field `difference` semantics accidentally. It checks:

1. Both findings are available exact-decimal sum results from the same finished evaluation.
2. Their requested population and grain identify the same contributors/units; compare memberships, not counts alone.
3. Both are complete. Equal exclusion counts, or even equal partial totals, are insufficient.
4. Their exact decimal difference is computed and compared with zero.

Return **Totals match**, **Totals differ**, or unavailable/incomplete status with the exact difference and operand traces. Rounding rules may deliberately differ when comparing line-rounded and total-rounded results; retain those rules visibly rather than rejecting the central reconciliation question. Total-rounded measures have no implicit line allocation, so this operation must not require a fabricated per-line comparison.

Provide a separate narrow `rowPairCheck(leftField, rightField)` for corresponding exact amounts on the same occurrences. It returns exact residuals, nonzero residual count/IDs, and missing/invalid pair IDs. **Lines match** requires complete pairs and no nonzero residual. A fixture with residuals `+0.01` and `-0.01` therefore yields Totals match and Lines differ. An average/total summary cannot stand in for this paired-line test. The two operations make distinct, limited claims; neither certifies currency identity, tax compliance, or accounting correctness beyond its declared operands/population.

Keep missing names, division errors, incomplete populations, and entity conflicts distinguishable. A zero delta with an invalid source line is not a match. Contributor links for both operands must show original source records and rule stages.

### Definition ownership and complete writeback

Extend `compileNotebook` ownership tracking to exact input/calculation/finding declarations. Reuse the existing block line information and targeted writeback approach. Accepted edits must preserve unrelated prose, comments, other blocks and valid source declarations.

Extend `writeBackSettings` beyond charts for the precise decimal definitions this feature exposes. Before any host callback:

- Construct the candidate text/settings for the entire requested edit.
- Compile and validate the candidate with the original raw rows and exact policies.
- Confirm the rebuilt decimal definitions, output values and relevant predicate/measure contracts match the intended edit.
- If any required declaration cannot be represented, retain prior valid text/state and emit zero settings/text callbacks.
- Otherwise apply the accepted state and invoke each documented callback once.

Move the notebook component's current early `onStateChange` call behind this preflight for semantic edits. This is a local definition-writeback change, not a generic transaction framework. Preserve the existing distinction between chart selection/view state and authored notebook text; selection may update a live finding without rewriting prose.

Lift the M1/M2 notebook guard only after import, authoring, restore, full definition writeback, findings, and folder save all support the same contract. Source text that cannot be evaluated must not fall back to an apparently successful numeric notebook.

### M3 docs, example, acceptance, and main risk

- **Docs in this stage:** `notebooks.mdx` exact values, source declarations, explicit average output, reconciliation status, contributor links and edit persistence; `exact-decimals.mdx` saved findings; `trace.mdx` operand and rule inspection.
- **Runnable example:** `decimal-ledger-notebook.eda.md` registered as a live notebook example. Show source count, line-rounded total, total-rounded total, exact difference, mismatch reason and record links. Include a filtered-population variation and an incomplete-input variation whose zero partial delta does not match.
- **Exact acceptance:** standalone calculated and query-derived findings agree at rest/live; different-field sum reconciliation accepts equal complete populations; exact mean/min/max/count findings are refused as ledger-total operands; post-total quantized sums are accepted; equal-sized different populations fail; missing/invalid operands do not match; opposite line residuals produce Totals match but Lines differ; a total-rounded amount does not require invented line allocations; exact zero/nonzero deltas render correctly; changing business rounding survives text writeback and reopening; display digits leave values unchanged; refusal has zero callbacks/writes; refresh updates findings and traces together; existing numeric notebook behavior remains intact.
- **Main risk:** notebook text and live state diverge, or a reopened finding omits derived calculations. Test saved text and reopened findings, not only the live card display.

## 6. M4 — optional limited approximate projection

Implement only after M1–M3 if useful for the owner's workflow. This stage does not increase arithmetic exactness; it makes selected exact analyses viewable on number-based plot coordinates.

Add a narrow adapter returning a projected coordinate plus the exact scalar, original row/group IDs, projection status and trace reference. Decimal-to-number conversion is allowed only here. With the v1 bounds, every valid magnitude is below `1e128` and every nonzero magnitude is at least `1e-38`; conversion of a validated scalar therefore remains finite and nonzero. A nonfinite/zero-underflow check is only a defensive guard against invalid/internal state, not an expected valid-data exclusion. Distinct exact amounts may map to one coordinate; they remain distinct records and exact predicate values.

- **Scatter:** render points from explicit projected fields. Click selection resolves actual mark IDs; overlapping points expose their distinct records. The first version disables continuous amount brushing rather than manufacturing decimal bounds from approximate coordinates.
- **Bar:** reduce and order exact values first, then project the resulting height. Selection uses precomputed category/group membership. Exact Top-N ranking, if supported, uses decimal comparison. Do not add percent stacking or arbitrary numeric reducers to this stage.
- **Trace:** always display the original exact amount and the conversion boundary. Axis ticks describe the projected plot; they never become saved exact thresholds.
- **Persistence:** retain the explicit projection setting and source exact field reference. Reopening must not replace the exact field with its numeric projection. Exact Rows/card/notebook values continue using the authoritative scalar.

**Docs:** `exact-decimals.mdx` projection section, `scatter.mdx`/`bar.mdx`, `scales-and-axes.mdx`, and `trace.mdx`. **Runnable example:** `decimal-projection-collisions` with neighboring large values that share a binary64 coordinate and finite values at the supported magnitude boundaries. **Acceptance:** exact identities and predicate membership survive collision; clicks trace correct IDs; bars rank exact amounts; no approximate range is saved; boundary values project finitely and nonzero values do not underflow. **Main risk:** UI convenience accidentally creates an amount predicate from pixel geometry. Keep the feature narrow enough that this cannot happen.

## 7. Validation and repository workflow

Use the fixture JSON as expected data in repository-owned tests. The supplied verifier companion is for inspection of independent derivations; executing a downloaded program is not an implementation prerequisite. Fixture values and memberships must not be regenerated by the same arithmetic implementation being tested.

| Fixture family | Implementation acceptance owner |
| --- | --- |
| `D-P001`–`D-P052`, `D-I001`–`D-I008` | Parser, source preview, limits, missing status, native-number refusal and explicit safe-integer bridge. |
| `D-W001`–`D-W025` | Strict saved/wire atom validation, including malformed tags, coefficient syntax and scale bounds. |
| `D-A001`–`D-A021` | Exact add/subtract/multiply, mixed operands, bounds, missing/error propagation, literal/manager integration. |
| `D-R001`–`D-R046`, `D-D001`–`D-D028` | Six rounding modes, signed ties, double rounding, exact versus explicitly rounded division and error codes. |
| `D-C001`–`D-C010` | Numeric/representation equality, canonical keys, ordering and exact filter controls. |
| `D-G001`–`D-G025` | Row-grain reducers, contribution counts, empty/no-valid states, cancellation, widened average and deterministic extrema; `D-G023` fails the unreduced public coefficient limit while `D-G025` succeeds after explicit scale-0 quantization of the same wide sum. |
| `D-L001`–`D-L006`, `D-L005-full-valid-only` | Line versus total rounding, refunds, discount/tax ordering, rounding placement, grouped/filtered populations, explicit valid-only active ledger and a fixed-discount tax-base example. |
| `D-L007` | Same complete population and zero total difference with two nonzero opposite line residuals: Totals match, Lines differ. |
| `D-E001`, `D-GR001`–`D-GR003` | Entity agreement/conflict and evidence; subgroup versus pooled averages, including `4.33` pooled versus the incorrect `5.50` unweighted average of group means. |
| `D-X001`–`D-X003` | Projection collisions and source-reader digit loss/refusal. |

These are arithmetic/data fixtures. Browser save/reopen, callbacks, query bindings, worker behavior and notebook writeback are proposed application acceptance tests in this plan; the research assignment did not execute those features. Additional explicit population and cancellation cases in the fixture file supplement the families above.

Meaningful test layers are:

- **Kernel:** strict grammar, scale, sign, canonical equality/order/key, bounds, quotient/remainder rounding, exact division, overflow and wide accumulation.
- **Calculation/provider:** literal lexemes, restricted raw-source binding, mixed-type failures, error propagation, caches, save/restore, callbacks, refresh and semantic type.
- **Surface/persistence:** exact filters/sort/format/copy/CSV, card outputs/traces, text/JSON roundtrip and zero-write unsupported export.
- **M2/M3:** source membership/grain, query/direct-worker parity, Pivot totals, folder read policy, notebook rest/live and definition writeback.

Use existing Vitest and demo test conventions. Do not add a generic property-testing framework, migration runner, transaction layer or plug-in arithmetic backend. Deterministic row permutations/chunkings in a few meaningful accumulator tests are useful; testing every trivial wrapper separately is not.

The implementation worker should use one run sheet, adjusting test filenames to the actual committed files:

```bash
# Focused arithmetic and integration checks while implementing.
pnpm --filter exploreda exec vitest run src/lib/decimal
pnpm --filter exploreda exec vitest run src/test/lib/calculations src/lib/calculations src/lib/aggregates.test.ts
pnpm --filter exploreda exec vitest run src/lib/analysis src/lib/project src/lib/notebook
pnpm --filter exploreda check-types

# Run the library from source for the actual stage's browser loop.
pnpm --filter demo dev

# After the complete stage, run the repository-wide gate once.
# Use @repo/test-config time limits; do not add ad hoc test timeouts.
pnpm check

# A user-visible package change needs a manually authored changeset.
pnpm changeset:add minor "Add exact decimal calculations and reconciliation with saved rounding rules."
```

Commands above are proposed validation steps and were not run in this research assignment. `pnpm check` builds the package and must not run concurrently from several worktrees. Browser acceptance covers wide, intermediate and narrow widths under repository rules, especially raw-input preview, text bounds, long exact numbers, trace popovers and notebook refusal/edit behavior. Use existing tooltips/field metadata, nonmodal controls, and Alt-click/Alt-Enter tracing. Do not add redundant Inspect buttons.

Every user-visible stage registers its docs page and actual runnable example in the same change. The existing catalogue gate alone does not prove example coverage; exercise the example's live assertions and Dashboard roundtrip. No framework conversion is part of this plan.

## 8. Performance decisions, release risks, and completion criteria

Expect more allocation and CPU work than binary64: coefficient parsing, BigInt arithmetic, exact keys, long formatted strings, contribution records and worker transfer all have costs. No benchmark was executed for this mission. Measure actual ledger workloads at roughly 10k, 100k and, if still relevant, 1M rows, recording import, first evaluation, filter update, refresh, serialization size and peak memory. Compare cold and warm calculations; report hardware/browser/runtime and source sizes. These are experiments, not release performance claims.

Start with the manager's existing caches and plain JSON atoms. If repeated BigInt construction dominates measured work, add a narrowly scoped compiled-column cache keyed by immutable input revision and arithmetic policy. If trace memory dominates, retain IDs and structured reasons and resolve raw cells on demand. Do not introduce global caches, parallel execution infrastructure or an arbitrary-precision CAS in anticipation of a bottleneck.

Primary correctness risks and their completion evidence:

| Risk | Evidence required before a stage is complete |
| --- | --- |
| Source digits lost before exact parsing | Both reader routes and native typed-decimal branch preserve fixture text/scale; Number-only input is refused. |
| Rounding hidden in formatting or reducer wrappers | Stored arithmetic policy appears in traces and survives all supported save routes; display edits do not change values. |
| Exact helpers bypassed by primitive fallbacks | Adjacent large values sort/filter/group correctly; no `[object Object]`, implicit Number or object-identity equality in supported paths. |
| Correct amount over the wrong population | Assert original member IDs, exclusions, units, duplicates and conflicts with totals. |
| Callback or write precedes rejection | Refused edits/exports leave text, state and files unchanged with zero outward callbacks. |
| Reopen/refresh uses a different evaluator | Native, Dashboard, folder and notebook stage loops return the same values/rules/memberships under the same source revision. |

Stage release notes should describe the newly usable loop and its explicit surfaces. Unsupported modes remain guarded until their stage ships. Do not create a compatibility framework for hypothetical old clients; this is one owner and one application version, with a small versioned arithmetic contract for clarity.

### Access, checked work, proposed work, and remaining questions

- **Access:** complete attached source packet at the named baseline was available. Supplemental exact-SHA GitHub retrieval succeeded for decisive omitted adapter files. The report's evidence inventory names the files/symbols; no source-packet receipt or hash manifest is needed.
- **Checked:** source-level call paths and serialization/reader behavior; independent exact fixture derivations are recorded in the companion outputs. Source reading is not application execution.
- **Proposed:** all decimal APIs, scalar adapters, UI behavior, schemas, text declarations, stages, tests, performance experiments and runnable demo additions in this plan.
- **Remaining implementation choices:** finalize UI labels and implement tokenizer tests for the selected exact declaration/literal spellings; measure real allocation/interaction costs; choose whether optional M4 merits its limited chart work. No unresolved product question blocks M1.
- **Companions:** `report.md`, `recommendations.md`, `decimal-fixtures.json`, and `decimal-contract.ts` are part of the same handoff. Treat the prior research summaries as proposals and integrate only the narrow seams explicitly needed here.
