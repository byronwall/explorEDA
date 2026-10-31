# Implementation plan: explicit expected-record reconciliation

**Build:** a typed, evidence-preserving reconciliation API; a saved two-input project analysis; notebook findings; then bounded calendar generation.  
**Repository:** explorEDA, baseline `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.  
**Date:** October 30, 2026, America/Indianapolis.  
**Owner of repository changes:** Codex. This deliverable is a design and integration plan, not an applied patch.

## 1. Scope and implementation order

The selected capability compares an explicit expected population with an actual population. It reports one row per valid union key, plus separately tagged invalid input occurrences. Presence and duplicate/count-policy flags remain separate.

Keep React and TypeScript and use pnpm. Do not replace the framework, add a database/service dependency, build ingestion monitoring, or wait for outside demand. `AGENTS.md` and `docs/research/DIRECTION.md` require useful staged delivery, docs, and runnable examples in the feature milestones.

### Ordered releases

| Milestone | Shippable outcome | Principal dependency |
|---|---|---|
| M1 | Host applications can reconcile supplied tables through a public API and inspect exact results in a focused embedded React example. | Pure typed-key and grouped-membership contract. |
| M2 | Analysts can create, save, export, reopen, and inspect a reconciliation query in the project workspace. | Both-input graph, availability, text/JSON, and folder integration. |
| M3 | A notebook can state live coverage and link to exact expectation/actual evidence across refresh. | Saved query result and role-aware provenance from M2. |
| M4 | A declared roster and bounded calendar can generate inspectable expected candidates with named skips. | Same reconciliation evaluator and saved project pipeline. |

M1 is an API/embedding release, not a claim that saved notebook support already exists. M2 must ship persistence with the saved interface. M3 completes the notebook capability in this mission. M4 is independently useful expansion and does not block the explicit-table releases.

### Repository evidence and naming convention

- **Existing, read:** a file supplied in the packet; behavior is grounded in its complete contents.
- **Existing seam, inspect:** an import or agent-guide path establishes the seam, but the implementation was not supplied.
- **New, proposed:** the suggested file does not claim to exist at the baseline.

Module names may be adapted to the actual directory conventions after inspection. Keep the responsibilities below intact.

## 2. Non-negotiable semantic contract

These decisions are the implementation specification, not optional UX copy.

1. Source row identity remains the existing single `entityKey`; the new matching key is a separate ordered typed tuple.
2. An expected tuple represents one obligation. Duplicate expected rows retain all evidence and count once in the required-key denominator.
3. Actual input rows are counted as occurrences. Repeated match keys are not automatically erroneous under a multiple-row count policy.
4. Exclusive primary key presence is `matched | absent | unexpected | excluded`.
5. Invalid expected and actual occurrences have no valid key presence.
6. `duplicateExpectedKey`, `repeatedActualKey`, and count-policy flags overlap primary presence.
7. Minimum is a positive safe integer; maximum is null or a safe integer at least minimum.
8. A missing measure in an existing valid-key row does not make the record absent. Zero and false are valid scalar key values.
9. Every exclusion has a typed tuple and a nonblank reason; it applies only to a currently declared expected key.
10. Unused exclusions are visible warnings and never suppress actual-only keys.
11. Failed, unavailable, or known-partial inputs block a current result. A loaded empty actual table is a valid all-absent case.
12. Saved source-population filters are separate from result-display filters and optional chart-selected notebook scope.
13. Absent results have expected-source or schedule evidence and zero actual-source rows.
14. Canonical group focus can survive reorder. Positional individual source evidence is revision-local.
15. All source-derived dates use shared parsing behind the reconciliation mode’s stricter guards.
16. No observed-category product is used to infer expectations.

The exact fixture JSON is the executable acceptance reference for key memberships and counts. Its fixture-only `loaded` source state maps to the proposed runtime `ready` state.

## 3. Types and public API

### 3.1 Core types

**New, proposed:** `packages/explorEDA/src/types/Reconciliation.ts`.

The following is the normative shape. Names can follow existing conventions, but the unions, nullability, and roles must survive integration.

```ts
type KeyMode = "scalar" | "date-only" | "instant-ms";
type KeyValue = string | number | boolean;

interface ReconciliationKeyPair {
  id: string;
  expectedFieldId: string;
  actualFieldId: string;
  mode: KeyMode;
}

interface ReconciliationExclusion {
  key: KeyValue[];
  reason: string;
}

interface ReconciliationDefinition {
  id: string;                  // Stable analysis/step namespace.
  keyVersion: 1;
  keys: ReconciliationKeyPair[];
  observations: { min: number; max: number | null };
  exclusions: ReconciliationExclusion[];
}

type InputAvailability =
  | { state: "ready" }
  | {
      state: "unavailable" | "partial";
      reason: string;
    };

interface ReconciliationInputRow {
  occurrenceId: string;         // Unique within this side and revision.
  values: Record<string, AnalysisScalar>;
  sourceRows: AnalysisSourceReference[];
  generated?: GeneratedExpectationWitness;
}

interface ReconciliationInput {
  label: string;
  revision: string;
  availability: InputAvailability;
  fields: readonly AnalysisField[]; // Required even for a loaded empty table.
  rows: readonly ReconciliationInputRow[];
}

interface GeneratedExpectationWitness {
  kind: "schedule";
  stepId: string;
  candidateDate: string;
  rosterRows: AnalysisSourceReference[];
  due: boolean;
  exclusionReason?: string;
}

type Presence = "matched" | "absent" | "unexpected" | "excluded";
type Cardinality = "short" | "within" | "over";

interface ReconciliationGroup {
  key: string;                 // Canonical result-row identity.
  tuple: KeyValue[];            // Canonical display values.
  presence: Presence;
  required: boolean;
  expectedOccurrenceIds: string[];
  actualOccurrenceIds: string[];
  expectedCount: number;
  actualCount: number;
  duplicateExpectedKey: boolean;
  repeatedActualKey: boolean;
  cardinality: Cardinality | null;
  minimumMet: boolean | null;
  withinPolicy: boolean | null;
  shortfall: number | null;
  excess: number | null;
  exclusionReason: string | null;
}

interface InvalidKeyOccurrence {
  key: string;                 // Revision-scoped result identity.
  side: "expected" | "actual";
  occurrenceId: string;
  inputs: unknown[];           // Diagnostics can retain rejected runtime input.
  problems: Array<{
    component: number;
    reason:
      | "missing"
      | "non-finite"
      | "unsupported-type"
      | "invalid-date"
      | "invalid-instant"
      | "unsupported-precision";
  }>;
}

interface ExactRatio {
  numerator: number;
  denominator: number;
  value: number | null;         // null when denominator is zero.
}

type ReconciliationResult =
  | {
      state: "blocked";
      revision: string;
      reasons: Array<{ side: "expected" | "actual"; message: string }>;
    }
  | {
      state: "ready";
      revision: string;
      groups: ReconciliationGroup[];
      invalidExpected: InvalidKeyOccurrence[];
      invalidActual: InvalidKeyOccurrence[];
      unusedExclusions: ReconciliationExclusion[];
      counts: ReconciliationCounts;
      metrics: ReconciliationMetrics;
      evidence: ReconciliationEvidenceIndex;
    };
```

`AnalysisScalar` and `AnalysisSourceReference` come from existing `AnalysisProject.ts`. Define the remaining count/evidence interfaces concretely in implementation, following the lists below. The illustrative public types intentionally omit fields that can be derived trivially rather than freezing a huge nested API.

Project source cells and result values remain scalar. The key codec accepts `unknown` for runtime validation, and diagnostic input values may retain rejected untyped JavaScript inputs; that does not authorize object-valued project cells. The unsupported-object fixture is a codec check, not a promise that project JSON accepts nested objects.

**Important consistency:** the design oracle reports one first invalid component per occurrence for compact expected fixtures. Production should collect all invalid component reasons while preserving the same occurrence membership. A test may assert at least the fixture’s first reason plus exact occurrence membership; it must not turn several invalid components into several invalid records.

### 3.2 Exact count fields

Keep integer fields for:

- Expected/actual input occurrences.
- Valid/invalid input occurrences by side.
- Expected distinct keys, required keys, excluded keys, matched keys, absent keys, unexpected keys, total valid key groups.
- Duplicate expected groups, repeated actual groups.
- All rows participating in repeated groups, and excess occurrences beyond one, separately.
- Actual rows on required/excluded/unexpected keys.
- Excluded keys with observations.
- Short/within/over required keys.
- Minimum-met required keys.
- Required minimum units, attained units, shortfall units, units beyond minimum, and surplus above maximum.

Never name a count just `duplicates`: the UI and API must distinguish repeated key groups, participating rows, and excess rows.

Required metrics:

- Presence coverage.
- Minimum attainment.
- Minimum-met share.
- Within-policy share.
- Invalid-key rates by side.
- Required-row relevance, if exposed in the UI, with its valid-actual-row denominator stated.

The fixture oracle explicitly checks the first four ratios. The other metrics are direct ratios of its exact counters and need targeted implementation assertions, not a new statistical method.

### 3.3 Evidence storage

Choose **stage-owned immutable evidence**, not a large source-row array copied into every UI cell.

- The core holds expected and actual occurrence maps, grouped membership IDs, and generated witnesses.
- The query evaluation exposes `reconciliations?: Record<stepId, ReconciliationResult>`.
- An `AnalysisResultRow` may carry `reconciliationRefs?: Array<{ stepId: string; rowKey: string }>`.
- Each direct reconciliation output row has one such reference.
- Existing `sourceRows`/`contributors` contain only real source references, as compatibility fields.
- Filter/calculate preserve the optional references.
- Aggregate unions them so a downstream aggregate trace can still resolve its reconciliation groups and role-specific evidence.

This is a small feature-specific provenance addition. It does not require a universal lineage system.

### 3.4 Public entrypoints

**Existing seam, inspect:** actual package entrypoint/export map.

Export:

```ts
function reconcileRecords(input: {
  definition: ReconciliationDefinition;
  expected: ReconciliationInput;
  actual: ReconciliationInput;
}): ReconciliationResult;

function validateReconciliationDefinition(
  definition: ReconciliationDefinition,
  fields: { expected: readonly AnalysisField[]; actual: readonly AnalysisField[] }
): ReconciliationDefinitionProblem[];
```

Expose types and the core. An optional key-preparation utility is useful to hosts that deliberately prepare an epoch field, but do not create a separate general data-preparation API in this release.

The React surface consumes `ReconciliationResult` and callbacks for opening evidence; it never recomputes membership independently.

## 4. Algorithm and key codec

**New, proposed modules:**

- `lib/analysis/reconciliationKeys.ts`: mode guards, typed atoms, tuple identity, component diagnostics.
- `lib/analysis/reconcile.ts`: grouping, exclusions, memberships, metrics, evidence.
- `lib/analysis/reconciliationFrame.ts`: adapter to project result fields and evidence references.

### Evaluation sequence

1. Validate the definition's structure: IDs, nonempty key list, supported modes, min/max, exclusion tuple shapes/reasons.
2. Reject invalid input readiness before constructing a current result. For ready inputs, validate mapped fields against their explicit schemas, including when there are zero rows. A misspelled field is a definition error, not an all-invalid or all-absent dataset. If an unavailable inferred source has no resolved schema, report unavailable first and defer that source's field-resolution check until it loads.
3. Prepare every expected key once; quarantine invalid occurrences.
4. Prepare every actual key once; quarantine invalid occurrences.
5. Group valid occurrences in two maps keyed by a structural tagged tuple.
6. Resolve exclusion keys. Validate duplicate entries even when a key is unused. Retain unused valid entries as warnings.
7. Walk the union of valid keys once.
8. Assign one primary presence per key.
9. Compute independent duplicate flags and required-key count status.
10. Compute exact integer counters and ratios from the same memberships.
11. Create evidence references and canonical result keys.
12. Return one immutable ready result.

Expected complexity is O((E + A) × K) key work, plus output ordering, with linear membership storage. This is an algorithmic analysis, not an executed benchmark. A sorted display may add O(G log G) work over G groups.

Do not build a Cartesian join. Do not scan entire tables anew for each selected group. Do not keep only a small contributor sample in the core. Page the inspector over exact stored membership.

### Key preparation details

- Call shared `isMissingValue` first.
- Scalar keys keep strings/finite numbers/booleans and type tags.
- Use numeric zero as the canonical form of negative zero.
- Nonblank strings retain leading/trailing whitespace. The feature does not silently repair key mismatches.
- Date-only accepts a complete calendar date and rejects impossible dates.
- Instant-ms accepts strict uppercase `YYYY-MM-DDTHH:mm:ss[.1–3 digits](Z|±HH:mm)`.
- Guard hour, minute, second, offset, and fractional precision before shared `parseDateText`.
- Reject naive timestamps, reduced precision, numeric epoch inputs in this mode, leap seconds, and finer fractions. A separate explicitly prepared epoch field may be used for source filtering.
- Preserve display raw values in evidence even when two offset strings map to one instant.
- Distinguish a data error from an unavailable source.

Use one structural encoding for identity. Avoid delimiter concatenation and avoid a lossy stringification of all components. A hash may index an already collision-checked canonical key, but a hash alone must not decide identity.

Keep integer accounting exact. Before reporting a policy-derived total such as `min × requiredKeys`, check that it remains a safe integer; reject an unrepresentable configured total with a clear error rather than returning a rounded exact-count claim. This needs no arbitrary-precision framework for ordinary in-memory row counts.

### Stable ordering

Group membership is independent of input order. Choose deterministic output order for the canonical result, then let the UI sort. Evidence retains source order or a documented stable row ordering. Refresh tests should compare member sets where order is not semantic.

## 5. M1 — Exact API and embedded inspector

### Outcome

A host can pass two explicit prepared tables and a matching definition, inspect all memberships and evidence, and change the count policy/exclusions. The library exposes a useful capability without requiring the saved project host.

### Work

- Add the core types, key codec, validation, and pure evaluator.
- Add an embedded React result component with summary, key table, invalid lists, and expected/actual evidence sections.
- Show exact required-key counts and coverage, with invalid-expectation qualification.
- Add explicit empty/no-required/blocked result states.
- Expose callback-driven evidence actions. For an absent key, do not invoke an actual-row action.
- Add the fixture adapter in the test tree; do not import the external research oracle into production.
- Keep the default exactly-one policy and typed composite key behavior.
- Add source-identity diagnostics to the evidence display when provided; do not infer event deduplication.

### Files/modules

- **New:** `packages/explorEDA/src/types/Reconciliation.ts`.
- **New:** `packages/explorEDA/src/lib/analysis/reconciliationKeys.ts`.
- **New:** `packages/explorEDA/src/lib/analysis/reconcile.ts`.
- **New:** `packages/explorEDA/src/components/project/ReconciliationPanel.tsx`.
- **New or colocated:** `ReconciliationEvidence.tsx` for origin-aware evidence.
- **Inspect:** existing table/Rows components and public exports.
- **New tests:** `src/test/lib/analysis/reconcile.test.ts`, `reconciliationKeys.test.ts`, and a focused component test alongside the new panel.

### Important tests

- F01: nine expected occurrences and ten actual occurrences; six valid expected keys; five required; matched four; absent one; excluded one; unexpected one.
- F01 source accounting: expected 9 = invalid 1 + valid 8; actual 10 = invalid 2 + required rows 5 + excluded rows 1 + unexpected rows 2.
- F01 flags: expected duplicates at A/Oct28 and B/Oct27; repeated actual keys at A/Oct27 and Z/Oct26.
- F01 metrics: presence 4/5; within-policy 3/5. Zero a1 and null-valued a4 are both present.
- F02/F03: typed and structural tuple collisions do not match.
- F04: A4/B2/C1/D0 with min2/max3 gives presence3/4, minimum attainment5/8, minimum-met2/4, within-policy1/4.
- F06: zero required denominator yields null/unavailable ratio.
- Two required keys with a configured minimum of `Number.MAX_SAFE_INTEGER` fail exact-counter validation before publishing a rounded denominator.
- F07/F08: loaded empty actual gives absence; unavailable actual gives no current memberships/metrics.
- Invalid raw keys remain visible; no null-null match.
- Unused exclusion cannot turn an actual-only key into excluded.
- Two expected × three actual rows at one key gives one key row and five evidence occurrences, not six pair rows.
- Clicking absent evidence never routes an empty actual selection to a “show all” action.

### Docs and runnable example in this milestone

- **New docs page:** `apps/demo/src/docs/pages/expected-records.mdx`, initial sections “Explicit expected keys,” “Reading memberships,” and “Key versus row counts.”
- **New runnable example:** `apps/demo/src/demos/expectedRecords.tsx`, using the F01 data and the public API with a minimal controlled count-policy editor.
- Register the example and docs in actual catalogue/live-example/coverage files after inspecting conventions.
- Example steps: select Absent; inspect B/Oct27; inspect zero-valued A/Oct26; inspect repeated A/Oct27; switch min/max and observe changed compliance without changed presence.

**Main risk:** an apparently convenient table implementation loses the side roles or conflates duplicate flags with primary membership.

**Exit condition:** the public API and focused example are usable and documented, and exact semantics pass. Do not claim saved project/notebook support yet.

## 6. M2 — Saved project workflow, persistence, and folder reopen

### Outcome

An analyst creates an explicit-table reconciliation inside the existing React project workspace, saves its source populations and key mapping, inspects memberships, exports the selected analysis, and reopens it correctly.

### 6.1 Add the project step

**Existing, read:** `types/AnalysisProject.ts`.

Add:

```ts
interface ReconcileStep extends ReconciliationDefinition {
  kind: "reconcile";
  expectedStepId: string;
  actualStepId: string;
  as: string;
}
```

Add it to `AnalysisStep`. The existing step `id` serves as the definition namespace within the project/query; the evaluator supplies the full namespace for result identity.

Add narrowly typed stage/evaluation extensions:

- Role-aware `inputs` with expected/actual step IDs, occurrence counts, and units.
- Reconciliation summary/evidence at the stage/evaluation.
- Optional evaluation availability.
- Optional row reconciliation references as specified in section 3.

Add optional display state to `AnalysisView`, for example:

```ts
interface ReconciliationViewState {
  stepId: string;
  lens:
    | "all" | "required" | "matched" | "absent" | "unexpected" | "excluded"
    | "duplicate-expected" | "repeated-actual"
    | "invalid-expected" | "invalid-actual";
  search?: string;
  sort?: { fieldId: string; direction: "asc" | "desc" };
}
```

Use existing `selectedRowKeys` for canonical result-key selections and existing inspection state where it fits. The new view state is display-only. Validate that its step exists and is a reachable reconciliation result. Built-in reconciliation views bind the query’s reconciliation output; downstream generic query outputs keep their own declared units.

### 6.2 Update every dependency boundary

**New:** `lib/analysis/stepDependencies.ts`.

```ts
function inputStepIds(step: AnalysisStep): string[] {
  if (step.kind === "source") return [];
  if (step.kind === "reconcile") {
    return [step.expectedStepId, step.actualStepId];
  }
  // Add the schedule case in M4.
  return [step.inputStepId];
}
```

Use it in all the following existing, read modules:

- `evaluateProject.ts::validateQuery` and recursive evaluation.
- `projectFile.ts::selectAnalysisProjectView` dependency closure.
- `projectFile.ts::validateAnalysisProjectFile` graph traversal and field resolution.
- `dsl/project.ts::checkReferences` and canonical step ordering.
- Revision source/parameter collection and role-aware stages.
- `writeFolder.ts::projectFileText` as needed for new dependency shapes.

Do not only patch the main evaluator switch. A one-sided export is a broken saved feature.

Initial reconcile branch constraints:

- Each branch has one source root and only source/filter/calculate operations.
- Reject lookup/expand/aggregate/reconcile ancestry at that input with a clear grain explanation.
- Source and field existence must be validated before evaluation.
- Shared source roots across the two roles are allowed.
- Downstream filter/calculate/aggregate can read the flat result; preserve reconciliation references through aggregate union.
- No cross-query input references in this milestone.

### 6.3 Runtime availability

Add an optional fifth argument:

```ts
evaluateAnalysisQuery(project, tables, queryId, bindings, {
  sourceStates,
});
```

A private frame carries ready/blocked state. Only the output’s reachable dependencies participate in blocking.

- Missing or explicitly unavailable source: blocked.
- Known partial input: blocked for current reconciliation.
- Any unbound or type-invalid parameter read by a reachable filter: blocked, regardless of the parameter declaration's optional `required` flag.
- Upstream reachable calculation error: block in this first version.
- A successful filter yielding no rows: ready.
- Raw invalid key values in otherwise successful rows: quarantined, ready with diagnostics.
- Unrelated diagnostics on an unreachable query branch: do not block this result.

Include source states and both relevant source revisions in the evaluation revision. Keep immutable table-array identity as the runtime mechanism; do not add durable content hashing.

### 6.4 JSON persistence

**Existing, read:** `lib/analysis/projectFile.ts`.

- Keep envelope and project version 1; older readers must reject the new unsupported operation.
- Add reconcile validation to both allowed-kind boundaries.
- Resolve fields separately at expected and actual inputs.
- Validate key IDs/order/modes, `as`, keyVersion, min/max, exclusions, and view references.
- Export both source branches, all required bindings/parameters, and both tables.
- Preserve current special-value encoding for source data.
- Keep array-valued composite key configuration out of scalar table cells.
- A missing/unavailable table is omitted, retaining its source definition.
- A ready empty table is explicitly `[]`.
- Refuse a complete bundle export containing known-partial inputs as if ready. Definitions-only export may omit them explicitly.
- Do not persist derived membership/count caches as the source of truth.

### 6.5 Project DSL

**Existing, read:** `lib/dsl/project.ts`.

Add `reconcile` to `compileStep`/`stepLines` with explicit `expected=`/`actual=`. Add child `key` and `exclude` declarations.

Canonical proposed form:

```text
reconcile @check expected=expected-ready actual=actual-ready as=rec key-version=1 min=1 max=1 {
  key @site expected.site actual.site mode=scalar
  key @day expected.day actual.day mode=date-only
  exclude values="[\"A\",\"2026-10-29\"]" reason="Planned closure"
}
```

- `max=none` maps to null.
- `values=` contains one quoted JSON scalar array.
- Both inputs must be earlier in the canonical exported order.
- Preserve field-pair order and explicit type distinctions.
- Unknown keys/modes and invalid tuples produce errors, not ignored policy.
- Do not infer inputs from prior textual position for reconcile.
- Recompile exported text and compare normalized semantic model equality.
- For ordinary query graphs exported from API order, topologically order dependencies so the exported text meets the DSL’s existing earlier-input constraint.

### 6.6 Folder read/write integration

**Existing, read:** `lib/project/folder.ts`, `writeFolder.ts`.

- Translate `missingSources` and unresolved pathless sources into evaluation source states before invoking analysis/notebook reads.
- Preserve ready empty files as ready.
- Pass source states through the exact imported `analysisText.ts` and notebook-read adapters.
- Retain both explicit branch source declarations in the project file.
- Preserve inferred-source short declarations and unchanged implicit queries.
- Keep source paths and missing-source repair information.
- A snapshot marked known partial remains partial after reopen; inspect `lib/project/snapshots.ts` through the actual import before implementing this.
- Do not reuse cached partial data when its marker cannot survive serialization.
- Never automatically contact a database or change external data as a side effect of opening a finding.

### 6.7 Workspace UI

**New, proposed:** `ReconciliationSetup.tsx`; extend M1 panel.

Implement:

- Explicit Expected/Actual selectors.
- Ordered key mappings and modes.
- Two population summaries with visible saved filters.
- Exactly-one/at-least/between count policy.
- Keyed exclusion editor with reason and denominator preview.
- Exact summary and lenses.
- Two evidence roles plus generated role reserved for M4.
- Export memberships as key-result data, with separate actual/expected evidence export actions.
- Ready-empty, missing-source, invalid-definition, and partial-read states.

The default header remains whole-analysis coverage. Clicking Absent changes the displayed result set, not the expected denominator. A user who wants to narrow the semantic source populations edits those branches explicitly.

Temporal source scopes follow the report’s contract: do not offer chronological comparisons over raw offset timestamp text. Use an explicitly prepared epoch field.

### Important tests

- Both-input dependency closure and cycle detection; missing second input; missing mapped field on either side.
- Branch-grain rejection for expand/aggregate.
- Two side filters and shared parameter binding survive JSON and DSL round trips.
- Changing only actual array, only expected array, policy, exclusion, or input state changes revision.
- Reordering unique inputs preserves group identity.
- Missing file and missing parameter do not yield all absent.
- A loaded empty actual file yields the F07 result.
- Known-partial bundle export is refused or explicitly definitions-only.
- Selected-view export includes both sources and no unrelated source.
- A stale exclusion after expected-side refresh is unused; matching actual-only key stays unexpected.
- Downstream aggregate trace still resolves expected/actual roles through `reconciliationRefs`.
- Invalid occurrence rows never enter required-key coverage.
- Display lens/search/sort does not change headline denominator.
- Complete project model → text → model; text → canonical text is stable.
- Folder reopen in visible and hidden layouts; empty versus missing file; renamed/missing field produces a repairable definition error.

### Docs and runnable example in this milestone

- Extend `apps/demo/src/docs/pages/expected-records.mdx`: “Save a reconciliation,” “Populations and exclusions,” “Files and refresh,” “Export.”
- Add/update the package API/project docs at their actual inspected locations.
- **Runnable folder example:** `apps/demo/public/examples/expected-records/` containing `exploreda.eda`, explicit expected/actual data files, and one analysis file.
- Use F01 data so inspection paths and counts remain exact.
- Add live example steps for create/save/reopen, absent evidence, and missing-source recovery.
- Register docs/examples/coverage in the same feature PR.

**Main risk:** saved state or a failed read silently changes the population being compared.

**Exit condition:** the analyst can close and reopen a saved explicit-table reconciliation with the same definition and recomputed memberships; missing inputs remain unavailable.

## 7. M3 — Notebook findings, evidence links, and refresh

### Outcome

The analyst adds live key coverage and exact membership links to a notebook, edits the notebook safely, and refreshes data without misrouting evidence.

### Work and existing seams

- **Existing, read:** `lib/notebook/compileNotebook.ts`, `findings.ts`, `writeBack.ts`.
- **Existing seam, inspect:** `lib/notebook/index.ts` to locate `readNotebookText`; `lib/project/analysisText.ts`; dashboard DSL compile/export/parse; source/trace adapters.
- **New, proposed:** `lib/notebook/reconciliationContext.ts`.
- **New, proposed if needed:** `lib/notebook/writeBackFinding.ts`.
- **Inspect:** project React host and current `components/project/analysisRowKeys.ts`.

### Query binding

Reuse the current notebook query binding if one exists. If absent, add exactly one narrow input-query declaration, `query @daily-check`, to the notebook-read layer.

- Resolve the query before dashboard blocks compile.
- Blank the binding line in dashboard input to preserve diagnostic line numbers.
- Use result fields/rows as notebook input.
- Never let dashboard compilation interpret a project query body.
- Keep one query input per notebook in this release.
- Save the binding in the text and round-trip it.

### Finding context

Use the existing required `FindingContext.revision` for the actual result revision. Extend the context with optional:

- Input availability.
- Row-unit and population labels.
- Row evidence resolver using reconciliation references.

Extend `FindingUnavailable` with `input-unavailable`. In `evaluateFinding`, return unavailable before count reduction when input is blocked. `compareFindings` already propagates operand unavailability; preserve that behavior.

Extend the initial `evaluateNotebookFindings` adapter to receive the real runtime revision/context. Do not retain the generic `rest` revision as if it identified a refreshed reconciliation.

The built-in templates create ordinary metric/count/share definitions:

- Required keys: `rowKind=key AND required=true`.
- Observed required keys: `rowKind=key AND presence=matched`.
- Absent required keys: `rowKind=key AND presence=absent`.
- Within-policy keys: `rowKind=key AND withinPolicy=true`.
- Coverage: observed count / required count.
- Invalid expected/actual counts: side-specific rowKind, occurrence units.

Use the actual dashboard finding grammar after inspection. The semantic predicates above are fixed even if its text spelling differs.

### Provenance and actions

A finding’s numeric IDs map into the current reconciliation frame. Opening its records resolves:

1. Exact key/invalid-occurrence result identities.
2. Expected versus actual membership.
3. Real source references or schedule witness.
4. Revision and scope.

For F01, the absent link resolves B/Oct27, expected e6/e7, actual none. It must not clear an actual-source filter and show all actual rows.

A count finding over invalid rows says “invalid expected input records” or “invalid actual input records.” A key coverage finding says “valid required keys.” A general unfiltered result count says “result rows.”

Do not make a notebook count mean summed actual observations. A standalone sum of `actualCount` is allowed when labeled; a sum/sum share is outside the existing count-share contract and remains ER13.

### Refresh and persistence

- Recompute every finding operand from one result revision.
- Keep valid canonical group focus across reorder and status change.
- A predicate finding for current absence updates its members.
- An individually focused key that leaves the result becomes unresolved, with a clear reason.
- Positional source-row evidence does not survive refresh as if it had stable identity.
- While fetching/evaluating, label the previous result as previous.
- On failure, show unavailable current findings and retain any previous result separately.
- Do not mix source revisions without explicit snapshot selection.
- Reopen recomputes, rather than trusting persisted displayed numbers.

### Text writeback

Current `writeBackSettings` handles charts only. Add a finding-specific insertion/edit path:

- Generate the requested declaration.
- Splice only its target lines or insert at the chosen block.
- Preserve prose/comments/unrelated chart text.
- Recompile with the same query result context.
- Compare normalized finding definitions and binding.
- Return unsupported without applying a destructive rewrite if verification fails.

Keep frozen block text explicit. Frozen definition and stale data are separate labels.

### Important tests

- F01 notebook required=5, observed=4, absent=1, within=3, coverage=80.0%.
- An absent link opens e6/e7 and no actual source row.
- A matched duplicate link opens both a2/a3 for A/Oct27.
- Invalid expected finding returns e9 only; invalid actual returns a9/a10.
- Zero denominator gives no-required-keys, not 100%.
- Unavailable input gives unavailable finding, not zero.
- Changing a result-display lens leaves baseline coverage at 4/5.
- Intentional chart-bound finding follows its own selection and describes that scope.
- Adding a11 for B/Oct27 yields observed5/required5 and absent0; the canonical B/Oct27 key remains the same.
- Invalid expected e9 still qualifies the nominal 100% result.
- Reorder does not redirect evidence.
- Finding insertion/edit round trips while preserving prose and comments.
- Broken block/frozen definition and failed-refresh cases do not present uncomputed claims as current.
- Folder reopen resolves query binding and both source inputs before finding evaluation.

### Docs and runnable example in this milestone

- Extend `expected-records.mdx`: “Write a finding,” “Inspect absent evidence,” and “Refresh and identity.”
- Update the existing notebook documentation page after locating it.
- **Runnable notebook:** `apps/demo/public/examples/expected-records/coverage.eda.md`, bound to the M2 query with required/observed/absent/coverage statements and links.
- Provide a second actual dataset revision containing a11 for the scripted refresh example.
- Add example steps: read 80%; open absent evidence; refresh; read 100% valid-key coverage with invalid-definition qualification; reopen.
- Keep the live-example/coverage registration in this milestone.

**Main risk:** a generic notebook row abstraction loses the expected-side evidence or silently changes a key denominator into a record count.

**Exit condition:** the notebook’s live numbers, record links, saved text, and reopened state agree with the same exact reconciliation result.

## 8. M4 — Bounded calendar expectations

### Outcome

An analyst chooses an explicitly authored roster and bounded calendar, sees due and skipped candidates, and reconciles them through the existing result engine.

### Saved generator

**New, proposed:** `lib/analysis/expectedSchedule.ts`; add `ExpectedScheduleStep` to `AnalysisProject.ts`.

```ts
interface ExpectedScheduleStep {
  id: string;
  kind: "expected-schedule";
  rosterStepId: string;
  as: string;
  rosterKeys: Array<{
    id: string;
    fieldId: string;
    mode: "scalar";
  }>;
  dateFieldId: string;
  start: string;              // Inclusive YYYY-MM-DD.
  endExclusive: string;       // Exclusive YYYY-MM-DD.
  cadence:
    | { kind: "daily"; every: number; anchor: string }
    | {
        kind: "weekly";
        every: number;
        anchorMonday: string;
        weekdays: number[];   // ISO 1=Monday ... 7=Sunday.
      };
  skips: ReconciliationExclusion[];
  maxCandidates: number;
}
```

The generator emits a frame with one candidate per roster tuple per calendar day in the interval. It carries generated witnesses and excluded-candidate metadata for the core adapter. The reconcile step must merge these generator exclusions with its explicit exclusions under a single documented precedence rule.

The generated field IDs are `${as}.${rosterKeys[i].id}` for roster components and `${as}.${dateFieldId}` for the date; reject collisions or duplicate IDs. A generator exclusion tuple is ordered by `rosterKeys`, followed by the date. In M4, require the consuming reconcile expected-key mapping to use that complete generated identity in exactly that order: scalar roster components, then date-only. Do not permit a subset or reordered identity to silently reinterpret skips. A later generalized mapping can be designed separately.

Choose:

- Cadence exclusion is generic.
- An explicit schedule skip overrides the generic reason for that key.
- A reconcile-level exclusion may add an exclusion for another key.
- If a reconcile-level exclusion duplicates any generator exclusion, including a generic cadence exclusion, reject that duplicate and direct the author to edit the schedule's skip instead. Explicit schedule skips may override generic cadence reasons inside the generator; there is no second override layer in reconcile.
- Unused saved skips after a horizon/roster change remain visible warnings and never suppress an actual-only key.

### Generation details

- Validate finite valid date bounds and `endExclusive >= start`.
- Empty horizon gives zero candidates and an unavailable ratio, not an error or 100%.
- Validate positive safe integer cadence and candidate cap.
- Require unique valid roster tuples; expose offending rows on failure.
- Compute candidate count before allocation.
- Reject a count above the cap; never truncate.
- Initial product default cap: 100,000 candidates, explicitly unbenchmarked.
- Enumerate daily calendar candidates using numeric UTC calendar arithmetic only as a date-counting implementation, not local-time recurrence.
- Daily due: calendar-day offset from anchor modulo every equals zero.
- Weekly due: Monday-week offset modulo every equals zero, and weekday is selected.
- Mark not-due candidates excluded with generated reasons.
- Apply explicit skip reasons.
- Save all anchors; extending the start must not phase-shift cadence.
- Do not use current time, locale, browser timezone, observed roster values, or observed min/max dates as hidden inputs.
- Keep actual source population independent and visible.

Add the generator dependency to `inputStepIds`, source closure, field validation, revisions, and text export. Accept it as the expected input of reconcile; keep actual branches source/filter/calculate.

### Generated evidence and materialization

Each candidate references its roster rows and schedule witness. It has no original expected-source record unless explicitly materialized.

**Export expected table** writes every candidate with a stable explicit ID and required/excluded metadata plus an equivalent exclusion list. The export explains that it is a generated expectation table, not actual data.

A saved generated analysis stores the generator definition and roster source; it recomputes on reopen. An explicit materialized copy is a separate authored source and does not silently update when the schedule changes.

### Important tests

- F12/F13 parity: one West roster key, Oct26 through Nov02 exclusive, weekdays due, Oct28 maintenance.
- Seven candidates; four required; three excluded.
- Matched Oct26/27/30, absent Oct29.
- Saturday Oct31 actual stays excluded; East/Oct26 stays unexpected.
- Presence3/4, within-policy2/4 under default exactly-one.
- Explicit table and generator memberships/counters agree, with intentionally different expectation provenance.
- Candidate cap rejects before allocation.
- Start inclusive/end exclusive.
- Empty range.
- Daily every2 with saved anchor remains phase-stable when visible bounds change.
- Weekly every2 with Monday anchor and selected weekdays.
- Duplicate/invalid roster blocks; it cannot multiply expected obligations.
- Leap day and month/year transitions in date-only calendar generation.
- Saved unused skip after horizon/roster change is warned and does not exclude an actual-only key.
- JSON/DSL/view-export/folder/notebook parity for generated sources.
- An absent generated key opens schedule+roster evidence and no actual rows.

The provided oracle exercises weekday schedules and table parity. Daily interval/weekly anchor tests above are required implementation tests and were not executed by this research.

### Docs and runnable example in this milestone

- Extend `expected-records.mdx`: “Generate a bounded schedule,” “Skipped days,” “Actual population,” and “Export expectations.”
- **Runnable example:** `apps/demo/public/examples/expected-sampling/`, using F12/F13 data, a roster file, saved schedule, actual observations, and a notebook.
- Live steps: inspect West/Oct29 absence; inspect Saturday’s exclusion; inspect unexpected East; export equivalent table; compare unchanged memberships.
- Document inclusive/exclusive bounds, anchors, candidate cap, and date-only scope alongside the control.
- Register all docs/examples in the feature release.

**Main risk:** cadence, exclusions, or automatic actual filtering silently fabricate or hide obligations.

**Exit condition:** generated and explicit expectations produce the same exact reconciliation semantics and honest provenance.

## 9. Validation plan and run sheet

### Executed during this Design mission

The standalone fixture oracle was run against explicitly authored expected memberships/counters. It is an independent semantic reference. No repository test, package build, browser interaction, DSL parser, or folder adapter was run.

### Required when Codex implements

Use targeted tests as each module changes, then the repository’s required full check once before a feature PR. Do not run broad unrelated audits or repeat full builds without a concrete remaining risk.

The commands below are a **future implementation run sheet**. New test files are proposed targets, not files claimed to exist at the supplied baseline.

```bash
# Independent research fixture check, after downloading these two companions together.
node verify-fixtures.mjs

# In the implementation checkout: follow the repository's pnpm / Node setup.
# M1: exact pure-core and key-codec tests.
pnpm --filter exploreda exec vitest run   src/test/lib/analysis/reconcile.test.ts   src/test/lib/analysis/reconciliationKeys.test.ts

# M2: query, serialization, DSL, and folder integration.
# Locate/confirm existing test paths before adding the proposed new cases.
pnpm --filter exploreda exec vitest run   src/test/lib/analysis/evaluateProject.test.ts   src/test/lib/analysis/reconciliationPersistence.test.ts   src/test/lib/project/reconciliationFolder.test.ts

# M3: finding math, provenance, and guarded text writeback.
pnpm --filter exploreda exec vitest run   src/test/lib/notebook/reconciliationFindings.test.ts   src/test/lib/notebook/reconciliationWriteBack.test.ts

# M4: bounded generator and exact table parity.
pnpm --filter exploreda exec vitest run   src/test/lib/analysis/expectedSchedule.test.ts

# Targeted type verification during work.
pnpm --filter exploreda check-types

# Examples and text export registration are part of each feature milestone.
pnpm --filter demo exec vitest run   src/demos/coverage.test.ts   src/dashboardText.test.ts
pnpm --filter demo docs:check

# Run the project's browser/docs workflow after visible changes.
# Use repository-pinned tooling; capture wide/intermediate/narrow input flows.
pnpm dev:agent
pnpm shot /examples/expected-records --name expected-records
# Once the example route exists, verify it at 1280, 783, and 390 CSS pixels.
# For the folder app, use scripts/app-shot.mjs as directed by agent-guide.md.

# Include a user-facing changeset for a package feature release.
pnpm changeset:add minor "Compare explicit expected records with actual observations and inspect exact memberships."

# Final required repository gate: once, from one worktree.
pnpm check
```

Do not install another browser package for screenshots. Use shared timeout configuration and the repository’s documented screenshot upload workflow when a PR is actually created. Do not run release/version/publish commands as part of implementation verification.

### Acceptance matrix

| Boundary | Exact acceptance |
|---|---|
| Presence versus measurement | F01 a1=0 and a4=null each make their key present. |
| Overlapping flags | B/Oct27 is absent and duplicate-expected; Z/Oct26 is unexpected and repeated-actual. |
| Typed identity | 1, “1”, false, 0, and “001” remain distinct. |
| Composite identity | (“a|b”, “c”) differs from (“a”, “b|c”). |
| Count policy | A4/B2/C1/D0 gives 3/4 presence but 1/4 within bounds. |
| Empty versus unavailable | Ready [] yields absence; missing/partial input yields no current absence claim. |
| Exclusions | Actual on a declared skipped key is excluded; an unused exclusion cannot hide an unexpected key. |
| Source scope | A saved actual filter changes the semantic result; a display lens does not. |
| Provenance | Absent finding opens expected evidence and zero actual records. |
| Refresh | Canonical key persists when absence becomes match; positional raw rows are re-resolved. |
| Text and folder | Both branches, policies, key types, and read state survive the appropriate round trips. |
| Schedule | Explicit and generated candidates give identical sets/counts, preserving different witnesses. |

## 10. Recommendation disposition map

| ID | Disposition | Implementation destination |
|---|---|---|
| ER01 | Build | M1/M2 focused explicit-table workflow. |
| ER02 | Build | M1 core, M2 dedicated two-input operator. |
| ER03 | Build | M1 key codec, M2/M3 stable result identity. |
| ER04 | Build | M1 blocked input; M2/M3 source/dependency/read-state plumbing. |
| ER05 | Build | M1 exact membership and metric contract; all later views reuse it. |
| ER06 | Build | M1 keyed exclusions; M2 saved edit; M4 generated reasons. |
| ER07 | Build | M2 source/display scope; M3 notebook scope. |
| ER08 | Build | M1 evidence roles; M2 query trace; M3 links/refresh; M4 witnesses. |
| ER09 | Build | M2 JSON/DSL/closure/folder; M4 generator extensions. |
| ER10 | Build | M3 existing findings with context adapter. |
| ER11 | Build | M4 bounded date schedule. |
| ER12 | Explore | Later fixed UTC / named-zone schedule design. No dependency of M4. |
| ER13 | Explore | Later per-key counts, unique-event units, and sum-based notebook ratios. |
| ER14 | Explore | Profile actual UI/evaluator before worker or larger-scale work. |
| ER15 | Defer | Generic outer joins, cross-query graphs, changed observation grains. |
| ER16 | Defer | Full recurrence, tolerance allocation, late/overdue interpretation. |
| ER17 | Avoid | Inferred expectations, zero fill, fuzzy matching, first-duplicate choice. |
| ER18 | Avoid | Rules platform, ingestion monitoring, paid services, demand gates. |

## 11. Source-grounded implementation cautions

These are scoped design integration issues, not a general audit.

- `AnalysisProject.ts::SourceDefinition` has one `entityKey`. Do not change its meaning to a comma-joined composite.
- `evaluateProject.ts::lookupFrame` is one-sided and scalar-keyed. Do not reinterpret missing lookup diagnostics as a complete absence ledger.
- `expandedFrame` changes grain. Count source occurrences deliberately.
- `sourceReferences` uses positional fallback for duplicate/invalid source identity. Do not promise cross-refresh raw-row stability.
- `valueParsing.ts::parseDateText` is more permissive than strict reconciliation modes. Add guards, reuse its actual calendar parsing, and leave unrelated parsing semantics alone.
- `filterFrame` string order is lexical. Instant-key normalization does not normalize upstream chronological filters.
- `validateQuery`, `selectAnalysisProjectView`, project-file field resolution, and DSL checks are unary today. Update all of them for the second input.
- `readProjectFolder` separates missing-source state from its empty array. Thread the state before absence math.
- `evaluateFinding` returns zero for an empty count. Block unavailable input before that reduction.
- `comparisonProblem` allows count shares. Do not disguise observation totals as key counts.
- `compileNotebook` compiles dashboard blocks. Bind a query in the read adapter instead of inventing a project parser inside each block.
- `writeBackSettings` handles charts. Finding/configuration writeback needs an explicit path and compile-and-compare verification.
- `writeFolder.ts::declaredSource` preserves original inferred declarations. Keep no-op saves stable.

## 12. Files Codex must inspect before integration

The complete provided source is sufficient for this design decision, but not for compiling a patch. Locate these actual implementation seams before editing:

- `packages/explorEDA/src/lib/project/analysisText.ts`.
- `packages/explorEDA/src/lib/notebook/index.ts`, then the actual `readNotebookText` definition.
- `packages/explorEDA/src/lib/project/snapshots.ts`.
- `packages/explorEDA/src/components/project/analysisRowKeys.ts`.
- Project React host and its result/trace/Rows actions.
- `packages/explorEDA/src/lib/dsl/compile.ts`, `parse.ts`, `export.ts` and finding declaration handling.
- `packages/explorEDA/src/types/SavedDataStructure.ts`, `SavedDataTypes.ts`, `ChartTypes.ts`.
- `packages/explorEDA/src/providers/DataLayerProvider.tsx`.
- The actual package public exports.
- `docs/ui-defaults.md` and `CODING_STANDARDS.md` before visible implementation.
- Demo docs catalogue/coverage/live-example registration and example routing at paths listed in the agent guide.

These are inspection tasks with concrete choices above; they are not a request to restart the design or broaden it into a repository audit.

## 13. Research basis and handoff

The complete [research report](report.md) supplies the seven-reference comparison, exact semantic rationale, denominator algebra, provenance decisions, source inventory, and stable recommendation dispositions.

Primary references informing the implementation:

- pandas membership/cardinality/null semantics: https://pandas.pydata.org/docs/reference/api/pandas.merge.html
- Power Query paired-key interaction: https://learn.microsoft.com/en-us/power-query/merge-queries-overview
- GX compound identity: https://docs.greatexpectations.io/docs/reference/learn/data_quality_use_cases/uniqueness/
- GX result identity and exact retrieval: https://docs.greatexpectations.io/docs/core/trigger_actions_based_on_results/choose_a_result_format/
- Explicit completion versus inferred combinations: https://tidyr.tidyverse.org/reference/complete.html
- Bounded time series and timezone behavior: https://www.postgresql.org/docs/18/functions-srf.html
- Referential integrity versus completeness: https://docs.getdbt.com/reference/resource-properties/data-tests?version=2#relationships
- Explicit recurrence exclusions: https://www.rfc-editor.org/rfc/rfc5545.html#section-3.8.5.1

**Access status:** prompt and all 19 complete scoped source files read at the fixed baseline. The full inventory is in report section 15.

**Checked:** source integration analysis, current primary documentation, independent semantic review, and the standalone exact fixture oracle.

**Proposed, not executed:** every repository edit, React interaction, project/DSL/notebook/folder integration test, browser check, and performance assessment in this plan.

**Original companion downloads:** [report.md](report.md), [exact-fixtures.json](exact-fixtures.json), [verify-fixtures.mjs](verify-fixtures.mjs), and [fixture-guide.md](fixture-guide.md). The final response provides individual original artifact links and the ZIP bundle.

When Codex integrates this work, follow `docs/research/DIRECTION.md`: keep a concise repository research summary and buildable intent plan with the Pro conversation link. Do not commit these original downloadable reports, ZIP, or process receipts to the repository merely as archival material.

