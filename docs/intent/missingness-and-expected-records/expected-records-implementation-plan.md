# Build explicit expected-record reconciliation

Build an analysis that compares an explicit expected table with an actual table. Show one row per typed matching key. Keep absent expectations, unexpected observations, excluded keys, invalid inputs, and duplicate flags inspectable.

This is a plan for review, not implementation approval. Joint missingness remains a separate plan in PR #577.

Source: [Pro conversation](https://chatgpt.com/c/6ae554c9-6f0c-83ea-a8dd-351611d0c2b1), [all original assets](assets/pro-results/expected-records-design-2026-10-31/index.md), and [local evidence](../../research/expected-records-design-2026-10-31/evidence.md). Baseline: `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.

## Contract

- Matching keys are ordered typed tuples, separate from source row identity. Numeric 1 and text "1" differ.
- One distinct expected key means one obligation. Duplicate expected rows retain their evidence without multiplying obligations.
- Default policy requires exactly one actual input row per required key. Support positive minimum and optional maximum counts.
- Primary membership is matched, absent, unexpected, or excluded. Duplicate and count-policy flags can overlap membership.
- Invalid key occurrences have no valid membership. Show their side and reasons separately.
- Zero, null, or invalid measurements do not remove presence when the matching key is valid.
- Exclusions require typed keys and reasons. An unused exclusion cannot hide an actual-only key.
- Coverage is matched required keys / valid required keys. Zero denominator means unavailable. Qualify rates beside invalid expectations.
- Input filters change the compared population. Display lenses do not change the headline denominator.
- Loaded empty actual data can establish absence. Missing, failed, or explicitly partial inputs cannot.
- Absent keys have expected evidence and no actual record. An empty actual action must never clear filters and show everything.
- Group focus survives input reorder and absent-to-matched changes. Positional source evidence remains revision-local.

## M1: exact core and embedded inspector

Ship a public pure `reconcileRecords` function and a focused React inspector. Accept explicit schemas, rows, revisions, availability, key pairs, count policy, and exclusions. Use two grouped maps rather than expanded join pairs. Keep role-specific occurrence evidence once per result.

Add small modules under `src/lib/analysis/` for key preparation and reconciliation. Add result types under `src/types/`, and a panel under `src/components/project/`. Export through the existing `packages/explorEDA` entrypoints. Reuse shared `valueParsing.ts` behind strict date-only and explicit-offset millisecond guards. Do not change global parsing behavior.

Use exact integers for counts. Reject unsafe policy-derived totals. Keep required-key coverage, within-policy share, and actual-row relevance separately named. Expose all invalid components while counting each invalid occurrence once. Avoid copying every derived field in Pro's illustrative API; retain the counts, units, evidence, and states consumers need.

Proof: F01 has 9 expected and 10 actual occurrences; 5 required keys, 4 matched, 1 absent, 1 excluded, and 1 unexpected. Coverage is 4/5; compliance is 3/5. Absent B/Oct27 links to e6/e7 and no actual record. A/Oct26 with value zero and A/Oct28 with null measurement remain present. Two expected and three actual rows at one key yield one group and five evidence occurrences. Test typed/composite collisions, ready-empty versus unavailable, orphan exclusions, and safe integer bounds.

Docs and example: add `apps/demo/src/docs/pages/expected-records.mdx` and an embedded example in `apps/demo/src/demos/`. Register the page, route, live example, and coverage together. Demonstrate absence, zero, duplicates, and changed count policy at 1280, 783, and 390 px.

Main risk: combining membership and duplicate flags into one status loses evidence.

## M2: saved two-input analysis

Add `ReconcileStep` to `AnalysisStep`, with explicit expected/actual step IDs. Initially allow source/filter/calculate branches with one source root per side. Reject changed-grain expand/aggregate branches. Shared roots are allowed. Use one small dependency helper across evaluator validation, execution, revision collection, project validation, selected-view closure, and DSL ordering.

Change `types/AnalysisProject.ts`, `lib/analysis/evaluateProject.ts`, `projectFile.ts`, `lib/dsl/project.ts`, `components/ExplorEdaProject.tsx`, and its query editor. Add the setup surface beside the result panel. Preserve expected/actual evidence through downstream filter/calculate/aggregate operations. Keep stage input counts labeled as combined inputs; coverage always reads the dedicated required-key summary.

Carry source availability through `useAnalysisEvaluation.ts`, `analysisWorkerProtocol.ts`, `analysisWorker.ts`, `lib/project/analysisText.ts`, folder callers, and host props. Changing availability must invalidate evaluation. Reuse existing pending-result handling. Do not add a second worker or cache system.

`folder.ts` uses empty arrays for failed reads and pathless sources. Pass `missingSources` plus unresolved path information before reconciliation. A deliberate loaded empty table remains ready. `snapshots.ts` has no partial marker. Define the existing snapshot as the selected population; block explicit partial status from a host. If a reader can establish truncation of an intended complete population, preserve that fact through its snapshot writer and reader. Do not infer truncation from equality with a row limit or parse free-form notes. Do not add a general ingestion certification system.

Ship JSON, canonical project text, selected-view export, folder reopen, and UI together. Retain both branches and parameter bindings. Preserve typed exclusion tuples and their order. Reject unsupported kinds and malformed policy. Keep current version conventions; add no downgrade or mixed-reader support. Omit unavailable tables from portable data exports, retain ready `[]`, and refuse to represent explicitly partial data as a complete bundle.

Proof: test both-input closure/cycles; expected-only and actual-only refresh; missing field with empty data; failed upstream parameter/calculation versus valid empty filter; model/text/model parity; missing file versus empty file; explicit partial status; no-op folder save; and role-aware downstream trace. Display Absent must preserve 4/5 headline coverage.

Docs and example: extend `expected-records.mdx`, project text/API guidance, and a runnable folder under `apps/demo/public/examples/expected-records/`. Use F01 and include missing-file recovery. Register the example in the same milestone.

Main risk: one missing dependency or read state becomes false absence after export or reopen.

## M3: notebook findings and refresh

Reuse the existing fenced `eda query=<id>` binding in `lib/notebook/readNotebook.ts`. Do not add Pro's fallback `query @...` declaration. Keep evaluation rows, revision, availability, and role-aware evidence through this adapter; it currently reduces result rows to `row.data`.

Extend `findings.ts`, `compileNotebook.ts`, `components/notebook/ExplorEdaNotebook.tsx`, and `NotebookFindings.tsx` with a narrow reconciliation context. Reuse count/share arithmetic. Required/observed/absent findings count key rows; invalid findings count input occurrences. Do not route observation sums through count/share comparisons.

Use the actual finding grammar from `lib/dsl/compile.ts`. Add guarded insertion/editing beside `writeBack.ts`: preserve prose and unrelated declarations, compile, and compare definitions before applying. Reuse `components/project/analysisRowKeys.ts` for canonical key encoding. A key that leaves the result becomes unresolved. Keep frozen text and previous data revision labels separate. Keep host callbacks and saved-data echo stable.

Proof: required=5, observed=4, absent=1, within=3, coverage=80%. An absent link opens e6/e7 and no actual rows. Adding zero-valued a11 changes coverage to 100% valid-key coverage; invalid expected e9 remains qualified. Failed inputs produce unavailable findings, not zero. Reorder preserves group focus. Round-trip notebook edits and folder reopen.

Docs and example: extend notebook guidance and `expected-records.mdx`. Add a runnable `coverage.eda.md` with both source revisions under the M2 folder. Verify reading, evidence links, refresh, writeback, and reopen at all three widths.

Main risk: flattening the query loses evidence roles or changes key counts into record counts.

## M4: bounded date expectations

Add a date-only schedule step under `lib/analysis/expectedSchedule.ts`. Read an explicit unique roster. Save inclusive start, exclusive end, cadence anchors, weekdays, and keyed skips with reasons. Generate bounded daily candidates, including excluded non-due days. Use the same core; preserve roster plus schedule witnesses.

Extend the two-input integration, DSL, folder save, and notebook bridge from M2/M3. Enforce a complete generated identity mapping: ordered roster components followed by date. A schedule skip overrides its generic cadence reason. Reject duplicate reconcile-level exclusions for an already excluded generated key. Unused skips remain visible.

Compute candidate count before allocation. Pro's 100,000-candidate default is an unmeasured proposal. Measure a representative fixture before selecting the shipped cap. Never silently truncate. Actual population stays explicit; schedule bounds must not hide unknown entities or outside-window records.

Proof: F12/F13 have seven West date candidates, four required, three matched, one absent, three excluded, and one unexpected East key. Coverage is 3/4; compliance is 2/4. Explicit table plus exclusions and generated expectations must have identical memberships with different provenance. Test anchors, empty horizon, leap day, invalid roster, allocation guard, skip persistence, and no hidden actual filtering.

Docs and example: extend `expected-records.mdx`; add `apps/demo/public/examples/expected-sampling/` with roster, actual data, schedule, notebook, and equivalent exported expectations.

Main risk: automatic bounds or cadence changes fabricate obligations or hide unexpected data.

## Local dispositions

| IDs       | Disposition | Reason                                                                                         |
| --------- | ----------- | ---------------------------------------------------------------------------------------------- |
| ER01–ER03 | Build       | Explicit tables, grouped core, and separate typed identity define the capability.              |
| ER04      | Build       | Propagate known input state; use the concrete snapshot contract above.                         |
| ER05–ER06 | Build       | Exact units, overlapping flags, and authored exclusions prevent false totals.                  |
| ER07–ER08 | Build       | Separate input scope from lenses and preserve evidence roles.                                  |
| ER09      | Build       | Persistence belongs with the saved interface.                                                  |
| ER10      | Build       | Reuse existing notebook query binding with a context bridge.                                   |
| ER11      | Build       | Bounded date generation is the later M4 expansion.                                             |
| ER12      | Explore     | UTC and named-zone schedules need a separate time contract.                                    |
| ER13      | Explore     | Per-key targets and event-count ratios need explicit units.                                    |
| ER14      | Explore     | Profile before adding execution machinery.                                                     |
| ER15–ER16 | Defer       | General joins, changed grain, full recurrence, tolerance, and lateness broaden scope.          |
| ER17–ER18 | Avoid       | Inferred expectations, fuzzy matching, zero filling, and a rules platform break this boundary. |

## Verification boundary

Original Pro fixtures and its verifier are design references. The verifier was inspected and preserved without execution. Local checks independently confirm 74 membership/counter assertions across 14 non-generated cases. Pro reports 15 cases and 20 codec vectors; that claim is not a local product test.

During implementation, run targeted core/query/persistence/notebook tests and example registration checks. Run `pnpm --filter demo docs:check`, type checks, real browser flows, and `pnpm check` once before each feature PR. Add a minor changeset for package features. Current research changes contain no runtime feature or browser acceptance claim.
