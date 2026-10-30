# Implementation plan: reusable grouped results

**Build decision:** add a live query-output reference to the existing analysis evaluator, then expose it through a compact grouped-result editor, local folders, and project-aware notebooks. Keep result-row grain and original measurement provenance distinct.

**Baseline:** [`5594c95690859e8ce456aa3228fa9265ba686d12`](https://github.com/byronwall/explorEDA/tree/5594c95690859e8ce456aa3228fa9265ba686d12). **Date:** October 30, 2026. **Status:** implementation proposal; no application code has been changed. Codex owns all repository integration, tests, commits, and local dispositions.

This plan is standalone. The accompanying [reusable-outputs-design.md](reusable-outputs-design.md) supplies the full alternative comparison, analytical rationale, and evidence catalogue. [proof-fixtures.json](proof-fixtures.json) contains exact inputs and expectations; [verify-proof-fixtures.py](verify-proof-fixtures.py) checks their arithmetic independently. [grouped-results-ui.svg](grouped-results-ui.svg) is a conceptual layout, not tested application output.

## 1. Contract workers should preserve

### Capability and boundaries

- A named producer query emits one row per experiment. Another query can read those rows through a new root-like `ResultStep`, then use the existing filter/calculate/aggregate steps.
- Reuse `AnalysisQuery.id` as the definition identity. Reference its `outputStepId`, not a chart, view, sheet, or private internal stage. Do not add a publication registry or separate grouped-table engine.
- The UI's **Grouped result** form creates ordinary query steps. A copied query is not a live reference; a live reference is not a frozen data snapshot.
- M1 supports reachable parameter-free producers. M2 adds explicit literal bindings owned by the consumer's result-read step. No ambient bindings cross that boundary.
- Keep physical source occurrences, immediate result rows, per-measure operands, and distinct original-record membership separately explainable.
- The initial live dependencies are authored query definitions, explicit bindings, and source snapshots. Chart selections do not become reusable-query inputs.
- Project views keep their existing linked dashboard filtering within each view. Notebook charts keep `localSelections`; sharing a provider does not make their interactive selections global.
- A notebook reads one query instance across all its sheets. Original measurements open through traces or another analysis, not an implicit different-grain sheet.
- No dependencies on unmerged wide-to-long, parameterized-notebook, contributor-comparison, keyed-refresh, or category-mapping proposals. Keep React/TypeScript, pnpm, one local analyst, and current local/server host boundaries.

### Stable recommendation register

These IDs remain stable when Codex records local dispositions. Classification is the design recommendation, not a claim that the work is already accepted or built.

| ID and class | Recommendation | Delivery |
| --- | --- | --- |
| **RO-01 · Build** | New result-read root referencing an existing query ID and designated output; no second catalogue | M1 |
| **RO-02 · Build** | Focused grouped-result authoring over current steps/reducers | M2 |
| **RO-03 · Build** | Structural row-grain metadata and typed grouped-row identity, separate from human labels | M1; UI refined M2 |
| **RO-04 · Build** | Explicit literal reference bindings; definition/instance/revision separation; no ambient inheritance | M1 restriction; M2 literals |
| **RO-05 · Build** | Qualified immediate row/field provenance and retained dependency stages; exact measure tracing | M1; host adapters M3–M4 |
| **RO-06 · Build** | Explicit filter ownership; no downstream-selection-to-producer feedback | M1–M4 |
| **RO-07 · Build** | Narrow numeric eligibility for query count; pooling from compatible sums/counts | M1 |
| **RO-08 · Build** | Coherent applied snapshots, dependency revisions, unavailable-input states, and conservative selection invalidation | M1; refresh hosts M3–M4 |
| **RO-09 · Build** | Persist canonical definitions and references; keep computed rows/provenance transient | M1 text/portable JSON; M3 folders |
| **RO-10 · Build** | React project first, local-folder host next, notebooks afterward | M1–M4 |
| **RO-11 · Build** | Project-aware notebook adapter with one result instance for all sheets | M4 |
| **RO-12 · Build** | Uses list, shared-definition editing, and honest Copy this definition semantics | M1 essential labels; M2 complete flow |
| **RO-13 · Explore** | Explicit capture of supported chart predicates into an authored stage | Later; no M1 gate |
| **RO-14 · Explore** | Copy with dependencies, cloning definitions while retaining original physical sources | Later; ordinary copy remains useful |
| **RO-15 · Defer** | Arbitrary chart-output promotion, including pivot subtotal/stack/bin internals | Separate bounded design if requested |
| **RO-16 · Defer** | Live selection-fed results and automatic cross-grain linked selections | Requires its own direction/feedback contract |
| **RO-17 · Defer** | Mixed-grain notebook sheets and notebook-wide parameter forwarding | Adjacent work; no prerequisite |
| **RO-18 · Avoid** | Universal analytics engine, graph editor, materialized-view/cache platform, or model/density output catalogue | Outside scope |
| **RO-19 · Avoid** | Reinterpreting legacy `count(field)` or using flattened leaf counts as arithmetic weights | Enforced by exact fixtures |
| **RO-20 · Build** | Same-milestone docs, runnable examples, keyboard/visual proof, and source-grounded release notes | Every milestone |

## 2. Exact data and analytical acceptance

### Primary fixture

Use the JSON companion as the authoritative input; do not import CSV if doing so changes the raw types. Its keys are `measurementId`, `experimentId`, and `value`.

| Experiment | Raw values | Exact output |
| --- | --- | --- |
| A | `0, 20, null` | rows=3; present=2; numeric=2; sum=20; mean=10; min=0; max=20 |
| B | `20, 40, 60, "n/a", ""` | rows=5; present=5; numeric=3; sum=120; mean=40; min=20; max=60 |
| C | `null, " ", "Infinity", true` | rows=4; present=3; numeric=0; non-count numeric statistics unavailable |

The complete producer has 12 source occurrences, 3 experiment rows, 5 finite readings, and 2 available means. A downstream global aggregate must give `count()`=3, numeric count of means=2, equal-experiment mean=25, sum of reading sums=140, sum of numeric counts=5, and guarded pooled mean=28. A present-value denominator gives `140/10=14` and must not be offered as the pooled numeric mean.

Production code must call `numericExclusionReason` and `parseNumber` from `lib/valueParsing.ts`. The Python oracle intentionally checks only the supplied fixtures' arithmetic and declared contract; it is not a replacement parser or reference implementation for all JavaScript input formats.

### Arithmetic proof inventory

| Fixture | Required expected result | Meaning protected |
| --- | --- | --- |
| PF-01 | A=10, B=40, C unavailable; equal=25; pooled=28 | Experiment weighting differs from measurement weighting |
| PF-02 | `mean >= 20` selects B: 1 result row, 5 members, 3 numeric contributors | Result filter does not change producer inputs |
| PF-03 | Change B's b3 value 60→90: B=50; equal=30; pooled=34 | Shared source refresh affects both downstream meanings |
| PF-04 | Numeric input `<=20`: A=10, B=20; equal=15; pooled=`40/3`; C absent | Input filtering occurs before grouping |
| PF-05 | Duplicate physical measurement IDs still give 12 occurrences, equal=25, pooled=28 | Duplicate business labels do not collapse occurrences |
| PF-06 | Numeric key `1` and string key `"1"` form different groups; two independent values 4 sum to 8 | Typed grouping and equal-valued independent events |
| PF-07 | One observed zero has numeric count 1, sum/mean/min/max 0 | Zero is not missing |
| PF-08 | Empty keyed grouping: 0 rows. Empty global grouping: 1 row, count 0, non-count measures unavailable | Empty population differs from absent input |
| PF-09 | Two overlapping groups have 4 membership visits but 3 unique leaves; occurrence mean 15 versus unique-leaf mean `40/3` | Membership multiplicity is not leaf-set cardinality |
| PF-10 | Red: 2 orders/120; Blue: 1 order/100; sums: 3 memberships/220; unique orders: 2/120 | A constrained second workflow proves overlap is not hypothetical |

PF-10 uses O1 amount 100 and O2 amount 20; item rows are (O1,Red), (O1,Blue), and (O2,Red). The category query counts each original order occurrence once per category using the existing entity-grain concept. This is a test of reuse and provenance, not a new rate or join-preparation feature.

The companion oracle has been executed: **65 checks passed**. Its **9 application acceptance entries are proposed and unexecuted**. The additional implementation cases below expand those entries into concrete tests; they do not imply more tests were already run.

## 3. M1 — Reuse grouped query outputs in embedded projects

**User outcome:** an embedded React project and the demo can define Experiment means once, use it in two downstream queries, edit that producer, and trace a downstream value to experiment operands and original measurements. Definitions round-trip as project text and portable JSON, including selected-view export. Parameter-free references are a complete useful release.

**Recommendations:** RO-01, RO-03, RO-05–RO-10, essential RO-12, RO-19–RO-20.

### Model and evaluator work

Existing files to change:

- `packages/explorEDA/src/types/AnalysisProject.ts`
  - Add `ResultStep {id,kind:"result",queryId}` to `AnalysisStep`. M1 rejects bindings or reachable producer parameters that require values.
  - Add optional `AggregateMeasure.eligibility: "numeric"`, valid only for count with a field. Absence keeps current count semantics.
  - Add a structural grouped/summary grain descriptor to runtime stages/evaluations. Retain `frameLabel` for display.
  - Add qualified upstream row/field addresses and immediate group-membership links. Count measures acquire contributor entries; existing source refs remain available.
  - Add an imported-result field-origin form, or equivalent qualified upstream field address. An upstream `{stepId}` cannot be interpreted as a local consumer step ID.
  - Preserve physical `{sourceId,fieldId}` endpoint origin for imported source/group-key fields alongside qualified producer trace addresses. Existing lookup/expand relationship matching must still work; aggregate measures do not acquire physical endpoint identity from their contributors.
  - Keep output field metadata structural. Aggregate measure outputs are numeric even when all values are unavailable or grouping emits zero rows; preserve declared source/group-key types.
  - Add explicit runtime availability for a failed dependency; do not conflate it with zero rows. Keep existing root evaluation fields available to API callers.
- `packages/explorEDA/src/lib/analysis/evaluateProject.ts`
  - Refactor its current frame evaluator to accept a request-local evaluation context. Keep `sourceFrame`, `lookupFrame`, `expandedFrame`, `calculateFrame`, `filterFrame`, and `aggregateFrame` as the computation implementation.
  - Resolve result roots, validate producer closures, detect query-definition cycles, and evaluate in dependency order.
  - Preserve existing `evaluateAnalysisQuery` root-result shape. A bundle-returning orchestration helper may be exported for hosts; it must use the same frame evaluator rather than another computation engine.
  - Retain each dependency's stages once and address them by instance/revision/stage/row. Use actual immediate input occurrences as arithmetic membership.
  - For `eligibility:"numeric"`, run entity-grain reduction first, then the same numeric predicate used by the associated numeric measures. Preserve conflict-as-unavailable behavior.
  - Validate consumed output fields, including calculation dependencies, before reduction. Missing fields are named errors rather than implicit undefined columns.
  - Preserve legacy evaluation status counts: a result root's `counts.source` is its immediate input result-row count; `counts.available` remains output-row count. Neither is a numeric-contributor count.
  - Extend revision inputs through producer revisions and source availability. A revision is a runtime freshness token, not a persisted content hash.
- `packages/explorEDA/src/lib/analysis/analysisWorkerProtocol.ts`, `analysisWorker.ts`, and `useAnalysisEvaluation.ts`
  - Carry the full dependency bundle and a host source-generation token through the existing worker protocol.
  - Retain one coherent completed bundle with its applied project/tables/bindings/availability while pending. Capture immutable references on the main thread; avoid reserializing source snapshots unnecessarily.
  - Drop replies for obsolete requests/generations. Update rows, counts, field labels, grain, traces, and applied bindings together.
  - Expose blocked/error separately from a successful empty result. Keep previous data visibly stale/read-only after failure if a previous snapshot exists.

An internal `lib/analysis/resultDependencies.ts` or `resultProvenance.ts` may be added if it keeps validation/resolution testable; these are proposed files, not existing modules. Do not split out a generic dependency framework before the two concrete consumers work.

### Minimal UI and API work

- `packages/explorEDA/src/components/ExplorEdaProject.tsx`
  - Supply the completed dependency bundle to trace context.
  - Render `ProjectScope` from applied evaluation metadata while pending, instead of current query labels paired with old numbers.
  - Keep saved compatible chart settings; preserve incompatible settings for repair.
  - Guard transient row selection on revision changes. Do not persist chart `__ID` indices.
  - Continue using `onProjectChange`, `onStateChange`, and `onOpenView`; no local-folder ownership is assumed in this milestone.
- `components/project/ProjectQueryPanel.tsx` and `queryEditing.ts`
  - Add **Use result in a new query** and **New view using this result** when the host supports opening a view.
  - Add the result-root label/detail. `queryForStage` and `copyQuery` must use an explicit input-step guard rather than treating every non-source step as having `inputStepId`.
  - Rename copy language to **Copy this definition** when retained result dependencies make the old independence wording too broad.
  - Label grouped rows from their typed grouping values, not their first measurement's entity key.
- `components/AnalysisChartContext.tsx` and `components/project/QueryStageRows.tsx`
  - Resolve qualified result rows/fields across the retained bundle.
  - Show immediate result members first; let the user descend through a selected measure to original observations.
  - Keep related-record expansion separate. Existing `sourceView` opens a whole source and must not masquerade as the exact contributor subset.
  - Use existing trace gestures and header actions; add no Inspect button to charts.
- Inspect the actual `exploreda/analysis` export barrel, `QueryFlow` rendering, and field-origin consumers when integrating. They were not all in the source packet; names/behavior beyond the cited boundary are not assumed here.

### Project text and portable JSON work

Change `packages/explorEDA/src/lib/dsl/project.ts`:

- Add `result @step query=producer-id` to `compileStep`, `stepLines`, `stepDefaultId`, and associated keyword/error help.
- Add strict `eligibility=numeric` parsing and serialization for count measures. Reject it on sum/mean/min/max or count without a field.
- Validate all query IDs after parsing so producer declaration order is unrestricted. Preserve the DSL's existing local-step ordering rules.
- Reject missing producer, duplicate query ID, cycles, and unsupported result syntax. Do not silently drop a result-read step or ignore an invalid eligibility mode.
- Retain `AnalysisProject.version: 1`; preserve exact text for old projects. Do not claim that an older library safely executes new eligibility syntax, since its unknown-property behavior is warning/ignore.

Change `packages/explorEDA/src/lib/analysis/projectFile.ts`, an inspected existing persistence path:

- Extend `validateAnalysisProjectFile` and its local traversal/field resolver for the result root and numeric eligibility. Both its operation allowlists and its assumptions that every non-source step has an input require explicit changes.
- Keep `parseAnalysisProject` and `stringifyAnalysisProject` validating the same semantics as the evaluator and text format. Preserve version 1 and existing special scalar encoding; persist no runtime evaluation bundle.
- Extend `selectAnalysisProjectView` from a single-query local walk to the selected view's transitive query closure. Retain reachable steps, producer queries, physical sources and rows, relationships and their endpoint sources, and reachable parameter definitions. Also retain definitions for the selected direct view's bindings, including legacy valid but unused entries. Include physical sources and available rows used by every retained parameter's option list. Preserve omitted source tables as omitted, distinct from `[]`. Local step IDs are qualified by query; unrelated queries/views are excluded.
- Reject invalid result definitions and cycles before export instead of producing a plausible incomplete package. Keep strict whole-file validation distinct from runtime branch evaluation: a broken saved branch may prevent portable export without making an unrelated valid query unevaluable in the editor. [P07]

The baseline portable JSON validator rejects a source with `entityKey:""`, although the evaluator supports positional keyless occurrences. The initial portable example uses declared measurement IDs and does not claim to repair that existing limitation. Result reuse itself must not require durable physical keys; a broader keyless JSON promise would need its own narrow compatibility case.

### M1 exact acceptance

Add `packages/explorEDA/src/test/lib/analysis/reusableOutputs.test.ts` and extend `evaluateProject.test.ts`, `entityGrain.test.ts`, and `lib/dsl/project.test.ts`.

1. **Cross-query capability:** producer P groups PF-01. Consumer Q averages P's means; consumer R filters P's means ≥20. Q=25, R=B, P remains 3 rows. This must use a result reference, not copied producer steps.
2. **Definition propagation:** insert the PF-04 pre-group filter into P under the same query ID. Q becomes 15; R contains B with mean20; P now has A/B only. Restoring the definition restores 25/B40/3 rows.
3. **Weighting support:** Q's explicit pooled comparison is 28 from sums/counts, not 25 or 14. C remains a member but supplies no finite mean.
4. **Double-aggregation lineage:** Q's mean has two included experiment operands, one excluded experiment row, and distinct paths to the five valid physical measurements. B's path shows 3 included and 2 excluded original occurrences. Inspecting `reading_sum` must not accidentally show another field's contributor list. For Q, legacy status counts are `source=3`, `output=1`, and `available=1`; trace reports 12 original members separately. Give P and Q an identical local step ID and verify imported field origins still resolve P's stage.
5. **Source-occurrence multiplicity:** run PF-05/06/09/10. Equal values and repeated source membership do not disappear; leaf-set cardinality never changes arithmetic.
6. **Count compatibility:** all baseline count behavior remains. Blank text and invalid text remain present-value counts; numeric count excludes them. `eligibility:numeric` with `entityFieldId` preserves conflict-as-unavailable and its complete members.
7. **Empty versus unavailable:** PF-08 is ready. An absent producer source or declared unavailable source is blocked with its name; it is not a ready one-row summary with count0. A present empty table with declared fields remains valid. With zero producer groups, downstream `sum(reading_n)` is unavailable; with only C, it is zero while `sum(reading_sum)` is unavailable. Both pooled means must be unavailable without division by zero or a whole-query calculation error. Exercise the proposed conditional in the actual Calculator, including its missing-condition semantics.
8. **Reference validation:** declaration order reversal gives the same results. Self-cycle and P→Q→P report the cycle path. Missing producer, duplicate query ID, and removed consumed field fail explicitly. An unrelated valid query still evaluates.
9. **Field/grain changes:** label-only rename keeps IDs and references. Grouping-field or output-stage change updates grain and clears row selection; missing or currently incompatible downstream fields preserve repairable chart settings. Numeric aggregate field types survive all-missing and zero-row outputs; do not infer them from sampled data or require a historical expected-schema record.
10. **Copy contract:** copy Q. Changing the copy's own reducer leaves Q unchanged. Changing P changes both because they still reference P. A copy of P with only physical-source ancestors has an independent recipe and shared physical data.
11. **Parameter restriction:** a project with an unrelated declared parameter still permits P. A producer whose reachable filter needs a binding is not offered as an M1 result reference; it gets a clear supported-boundary diagnostic.
12. **Worker coherence:** start request N, then N+1; resolve N+1 first and N last. Only N+1 can become current. During pending, labels/counts/trace all use one applied snapshot. A source reorder never sends an old positional key to new rows.
13. **Save text:** export→compile→export preserves all new definitions and IDs. Existing shop fixture exports remain exact. Invalid result grammar does not fall through to a partial successful query.
14. **Portable export:** export only Q's selected view through `selectAnalysisProjectView`, stringify, parse, and reevaluate. Q still gives 25/28 and has complete two-level lineage; its transitive producer/source definitions survive, and unrelated queries/views do not. Repeat after M2 with literal bindings plus a valid unused direct-view binding, and a retained parameter whose options use another physical source; those parameter definitions and source rows must survive too. Omitted versus present-empty tables remain distinct. Invalid result/eligibility syntax fails in both portable JSON and project text.
15. **Relationship origin after import:** add an experiment metadata source with A→control, B→treated, C→treated and the physical measurement-to-experiment relationship. Read P's grouped output, then use the existing lookup on its retained experiment key. The three rows receive control/treated/treated, their numeric measures remain 10/40/unavailable, and trace addresses still point to P. Include the metadata source/relationship in that selected-view export.

The baseline selected tests already contain entity-conflict, repeated-expansion, and missing-value cases; extend them where appropriate rather than duplicating every old test. Runtime behavior and UI behavior need different tests because a pure arithmetic oracle cannot prove trace ownership or worker ordering.

### Documentation and runnable example in M1

- Add `apps/demo/src/docs/pages/reusable-results.mdx` covering **One row per experiment**, **Use a query result**, **Equal experiments or pooled measurements**, **Trace the result**, **Filters stay in their owning scope**, and **Export a view with its dependencies**.
- Register the page and live example through `apps/demo/src/docs/catalogue.ts` and `apps/demo/src/docs/live/examples.ts`; inspect their current APIs. The agent guide identifies these paths, but their full contents were not part of the packet.
- Add a concise React/API example to `packages/explorEDA/README.md` after inspecting that existing package document. It shows two consumers referencing one producer and the host callbacks needed to save changes.
- Create proposed `apps/demo/src/demos/reusableExperiments.ts`; register **reusable-experiments** in `apps/demo/src/demos/examples.ts` through the existing project/tables/views/queryPresets example shape.
- Provide three focused views: **Experiment means**, **Experiment summary**, and **Experiments with high means**. Add a small overlap example only if it makes the membership distinction visible without distracting from the experiment workflow.
- Register required example coverage in `coverage.ts` and relevant tests per the agent guide. The docs and example ship with the feature, not in a later cleanup PR.

**Runnable route after implementation:** `/examples/reusable-experiments`.

**Main risk:** a superficially correct numeric result with a flattened or mixed-revision trace. M1 does not ship until the two-level provenance and source-reorder acceptance passes.

**Independent release boundary:** usable from React and authored project text, with a demo and API documentation. Folder creation UI and notebook integration are not claimed yet.

## 4. M2 — Author grouped results and bind their inputs explicitly

**User outcome:** an analyst defines a grouped result through compact controls, reuses it, edits its shared definition, and understands whether a copy or parameter change affects other analyses.

**Recommendations:** RO-02, RO-04, RO-12; reinforce RO-03, RO-05–RO-08, RO-20.

### Implementation work

- Add proposed `packages/explorEDA/src/components/project/GroupedResultEditor.tsx` or an equivalent focused editor within the existing Query panel.
  - Input selector lists supported physical sources and result outputs with grain and fields.
  - Group selection uses existing `FieldPicker`/field metadata.
  - Measure rows use existing count/sum/average/max/min contracts; a mean recipe offers matching numeric count and sum support fields with stable IDs.
  - Render the output preview through the same evaluator, with visible first-N limit and per-measure excluded counts.
  - Valid committed edits apply while analysis stays visible; partial invalid text remains a draft. One editing session has coherent reset/Escape behavior.
  - Show **Used by** count and direct uses when editing a shared definition. This is an impact preview, not another approval gate.
- Extend `AnalysisProject.ts`, `evaluateProject.ts`, `projectFile.ts`, and `project.ts` with literal `ResultStep.bindings`, matching portable-file validation, and `bind.<parameter-id>=<scalar>` syntax.
  - The reference step is in the consumer query definition; its literals affect that query's entire consumer closure.
  - Required evaluation values are the producer's reachable local filter parameters. A nested result reference supplies its own bindings and ends ambient scope.
  - Reject missing values, unused/unknown IDs, null for current typed parameter declarations, nonfinite numeric values, mismatched types, objects, and dynamic binding-expression/reference syntax. Quoted strings remain literal data even when their text contains `$` or operators.
  - Canonicalize by sorted parameter IDs and type-aware values. Persist no undefined values. Do not coerce a numeric-looking string into a number.
  - Capture completed `appliedBindings` projected onto the producer's reachable local parameter IDs, then validate and persist only that subset. Unrelated legacy view bindings must not block capture. Do not capture pending controls or forward consumer bindings.
- Extend `ProjectQueryPanel.tsx`, `queryEditing.ts`, and `ProjectScope` to show shared definition plus fixed inputs and distinguish a direct view's binding controls from a result-step binding edit.
- Provide **Copy this definition**, retaining and labeling upstream references. Do not implement transitive cloning under that label. Keep existing Open-stage action as an explicit copy-through-stage operation, not a live private-stage link.
- Add a reverse-use lookup computed from definitions/views for the editing/deletion UI. It is transient metadata; do not persist a second authoritative dependency list.

### Binding identity example

The following API is proposed; an existing direct view still supplies its own root bindings separately.

```ts
const reference: ResultStep = {
  id: "read-baseline-experiments",
  kind: "result",
  queryId: "experiment-means-by-phase",
  bindings: { phase: "baseline" },
};

// Editing reference.bindings changes the consumer QUERY definition.
// It affects all views of that query, not just the currently visible chart.
```

Do not introduce `{parameterId: ...}` forwarding, arbitrary binding expressions, shared notebook sliders, or producer-view pointers in M2. Literals satisfy the bounded instance contract and leave adjacent parameter design independent.

### M2 exact acceptance

Add proposed `GroupedResultEditor.test.tsx` and `queryEditing.reuse.test.ts`, and extend the M1 evaluator/text tests.

1. Build PF-01 through the editor. Save once, reopen the definition, and verify all field IDs/group keys/measures and 25/28 outputs match the authored example.
2. Rename **Mean reading** without changing `reading_mean`; existing charts and consumers stay bound. Removing that output field names every affected direct use and produces a recoverable dependency error if committed.
3. Cancel an invalid aggregate draft; the applied producer and both consumers remain unchanged. A valid committed filter edit updates the shared definition for every relevant consumer. Each root publishes a coherent completed dependency bundle; independently mounted views may finish at different times and show their own pending state.
4. Build phase data by concatenating PF-01 as `phase="baseline"` and PF-03 as `phase="followup"`, prefixing every `measurementId` with its phase; there are 24 distinct occurrences. Producer A filters by phase, then groups by experiment. B and C both read A with `{phase:"baseline"}` and compute equal/pooled means; B1 and B2 are views of B. Initially all show 25/28. Change B's reference to `{phase:"followup"}`: B1/B2 show 30/34, while C remains 25/28. Changing a direct A view's phase changes neither captured reference. Add A's pre-group numeric `value<=20` filter: both bound instances become equal=15 and pooled=`40/3`.
5. Reorder binding object properties: same instance key. Supply `1` for a numeric parameter: valid; `"1"`: explicit type error. Supply an unknown or unused ID: explicit error. Omit a value required by a reachable parameterized filter: blocked, even when the parameter metadata's `required` flag is absent.
6. Put different literal values on a cycle: still reject the query-definition cycle. Parameter variants must not enable recursion.
7. Create a reference while the producer is pending: the action is disabled. Once ready, it captures the relevant applied values shown in the result scope, omitting unrelated direct-view binding entries. A quoted `"$phase"` string binds literally to a compatible string parameter and is never evaluated as a reference.
8. Copy a consumer definition: own local edits are independent; shared upstream edits still propagate. The retained producer name remains visible. Copying must not rewrite an upstream producer ID accidentally while remapping local step IDs.
9. Delete a referenced producer from the UI: show its uses and leave definitions intact until references are repaired/removed. File-level deletion remains a named broken reference, not an automatic cascade.
10. Numeric count on C is 0; ordinary count of C's raw values is 3. The editor's count choices must not hide that distinction under one unlabeled Count field.

### Documentation and runnable example in M2

- Extend `reusable-results.mdx` with **Create a grouped result**, **Shared references and copies**, and **Inputs belong to the reference**.
- Add an authoring section to `project-folders.mdx` explaining the canonical definition model, while clearly limiting folder UI availability until M3.
- Extend `/examples/reusable-experiments` with a scripted create/edit/reuse flow and the exact 24-occurrence phase fixture in acceptance #4. Show both B views plus C and the 25/28 versus 30/34 outcomes to prove the ownership rule.
- Add documented text/API snippets for `result` and `bind.*`; compile/export them as fixtures.

**Main risk:** analysts interpreting a reference-step input edit as a single-view change. The B/C/B1/B2 acceptance and the visible ownership text are release requirements.

**Independent release boundary:** the embedded host and demo have a complete authoring workflow, including parameterized reuse. No new folder or notebook controls are required to benefit.

## 5. M3 — Save, reopen, and refresh reusable results in local folders

**User outcome:** a folder analyst creates supported shared definitions and consuming analyses, closes the application, reopens the folder, and refreshes source files while preserving the intended grain and trace.

**Recommendations:** RO-08–RO-10, RO-12, RO-20.

### Integration facts that change this milestone

`readProjectFolder` merges sources and creates implicit source queries; `projectFileText` deliberately omits `implicitQueries` and `localSources`. Missing files/snapshots are recorded in `missingSources` while their table entries become empty arrays. The current app mount supplies `ExplorEdaProject` with a worker but not `onOpenView`. The browser folder route imports the same app shell. These are inspected baseline facts, not hypothetical integration risks. [P03, P04]

### Implementation work

- `packages/explorEDA/src/lib/project/folder.ts`
  - Keep missing/unreadable source availability explicit through the host/evaluator boundary.
  - Resolve project-owned result definitions before reading consuming analyses and notebooks. Validate cross-query references after source/query assembly, not by accidental file enumeration order.
  - Expose enough ownership metadata for the result picker to distinguish explicit project queries and analysis-local/implicit sources.
- `packages/explorEDA/src/lib/project/writeFolder.ts`
  - Persist reusable query definitions once in the canonical project file.
  - Persist consuming analysis references/settings through `analysisFileText`; do not repeat the producer steps or write materialized result rows.
  - Retain paths, existing inferred/declaration behavior, and database metadata; leave unrelated analysis files unwritten. `exportAnalysisText` reconstructs the edited file, so comment-preserving edits are not promised. [P08]
- `apps/app/src/ProjectWorkspace.tsx`
  - Wire `onOpenView` (or a narrow equivalent action) so result reuse can create the new query/view and put it into the host's existing save flow.
  - Make project and source-generation state coherent across active/saved views. Pass source availability instead of only the empty arrays used to represent unavailable files.
  - Source refresh supplies new table-map/array identities; do not mutate arrays in place.
  - Inspect the owning saver and app reload code before choosing write ordering. Their complete implementation was not read in this mission.
- `apps/demo/src/folder/FolderPage.tsx`
  - Confirm that the shared app integration covers the browser folder adapter; avoid implementing another independent reuse flow.

### Explicit ownership policy

Initial cross-file reuse is limited to **explicit project queries whose reachable physical source definitions are project-owned**. This is a product boundary, not an invisible serialization accident.

- A new grouped query created from a project source gets a fresh explicit ID and is persisted in project text.
- An implicit source-reading query is not silently reused if the writer would omit it. Create an explicit named query or deliberately remove its ID from `implicitQueries` during promotion.
- An analysis-local source cannot silently become a project-wide dependency. Offer **Move source definition to project** if the saver can coherently update the project and owning analysis; preserve source ID/path, remove the local ownership entry/declaration, and move no data bytes.
- If that guided promotion is too large for M3, ship the project-owned-source prerequisite with a precise repair instruction. The runnable folder example uses project-owned sources and remains fully supported. Do not postpone the entire feature for a general multi-file transaction system.
- If the owning analysis file is absent on reopen, report an unavailable dependency rather than substitute empty rows.

### M3 exact acceptance

Add proposed `packages/explorEDA/src/lib/project/reusableOutputsFolder.test.ts` using the existing `ProjectFiles` abstraction after inspecting its test utilities. Extend host integration tests with the actual save queue.

1. Load a project containing producer P and consumers Q/R, save all views, close, then reconstruct with `readProjectFolder`. IDs and reference edges are unchanged; PF-01 still gives 25/28 and B40.
2. Inspect written files: one P definition in project text, Q/R reference it, no computed result rows/contributor arrays/request tokens in any save.
3. Edit P's display name: references survive. Edit P's pre-group filter: reopening returns PF-04 values. Reorder query declarations: results unchanged.
4. Refresh the JSON source from PF-01 to PF-03 using new arrays: all active consumers move to equal30/pooled34; previously unmounted consumers show the new values when opened.
5. Remove the physical source file: affected results show a named missing-source error. Restore an intentionally empty valid file: ready zero experiment rows, with the normal global-summary behavior where requested.
6. Start a refresh that reorders duplicate/missing-key rows while an old trace is open. The trace either remains on the retained old source generation or becomes unavailable; it must never open a different row at the same position.
7. Delete P in project text: Q/R keep repairable broken references; a separate physical-source query still opens. Do not erase Q/R or their chart settings on save.
8. Try cross-file reuse from an implicit query or local source: the picker blocks it or executes explicit promotion. Saving and reopening must not lose the promoted definition. Verify `implicitQueries`/`localSources` ownership changes, not just query contents.
9. Worker failure after a successful result: old data is explicitly previous, cannot be captured into a new result, and cannot be used as the successful dependency of a fresh consumer request.
10. Browser folder adapter and CLI host use the same behavior. Verify access and save errors through each host's existing error surface, without adding a collaboration or database platform.

### Documentation and runnable folder in M3

- Extend `apps/demo/src/docs/pages/project-folders.mdx` with **Define once, use in two analyses**, **Source ownership**, **Reopen and refresh**, and **Unavailable input versus empty data**.
- Update `reusable-results.mdx` with the now-shipped folder workflow and exact save layout.
- Add proposed `apps/demo/public/reusable-experiments/` containing:
  - `exploreda.eda`: canonical source and query definitions.
  - `experiments.eda`: views at experiment grain.
  - `summary.eda`: equal-experiment and pooled comparisons using the shared producer.
  - `data/measurements.json`: the typed 12-occurrence proof data.
- Make that repository-local folder runnable with the existing app's folder environment variable. Do not promise a new CLI `--example` option until the omitted example-copy packaging path has been located and implemented.
- The public example and docs use product language about analytical meaning; internal rollout limitations belong in the intent/release notes.

**Main risk:** saving a reference to an implicit/local definition that the serializer intentionally omits, or treating a missing file as an empty source. Both are exact reopen tests.

**Independent release boundary:** the complete project-view workflow works in supported folders. Notebook files may still use their baseline loading path until M4; do not advertise cross-query notebook tracing before it is implemented.

## 6. M4 — Reuse one result across notebook sheets

**User outcome:** a notebook and project views share the same producer definition; every notebook sheet sees one coherent result instance and can trace back through it to the original observations.

**Recommendations:** RO-05–RO-06, RO-08–RO-11, RO-20. Preserve the RO-17 boundary.

### Implementation work

- Add proposed `packages/explorEDA/src/components/notebook/ExplorEdaProjectNotebook.tsx`.
  - Accept project, immutable tables/availability, notebook text, optional worker factory, and existing text/state host callbacks.
  - Resolve one query for the entire notebook; evaluate through the same dependency orchestration/hook as project views.
  - Keep the full completed evaluation/bundle for row identity and tracing; map values only at the existing chart data boundary.
  - Provide `AnalysisChartContextProvider` and the compact applied result scope/status.
  - Preserve generic `ExplorEdaNotebook({data})` for hosts that supply ordinary rows.
- `packages/explorEDA/src/lib/notebook/readNotebook.ts`
  - Separate resolving the notebook's query declaration from flattening evaluated rows.
  - Preserve useful compile results while letting the project-aware wrapper own current evaluation and refresh. Avoid performing a second independent synchronous evaluation on every render.
  - Diagnose conflicting `eda query=` declarations; accepting the first silently is unsuitable when users might think each block selects different data.
- `compileNotebook.ts`
  - Reuse the existing all-block compilation and last-valid-text behavior.
  - Keep definitions notebook-wide. Do not change block position or H1 sheet headings into result identity.
  - If invalid block text uses a last-valid stand-in, the current data can still refresh under that applied definition; the UI must accurately identify it rather than implying a frozen data snapshot.
- `sheets.ts`
  - Keep sheets as reading divisions. No per-sheet source, binding map, evaluation context, or grain.
- `ExplorEdaNotebook.tsx`
  - Preserve `localSelections`, chart writeback, sheet state, and tab keyboard behavior.
  - Add only the adapter hooks needed to use stable analysis row keys/trace context. Do not create a second provider per sheet.
- `apps/app/src/ProjectWorkspace.tsx` and folder loading
  - Mount the project-aware wrapper instead of passing only preloaded `notebook.result.rows` for a project-bound notebook.
  - Re-evaluate when shared definitions or source snapshots change, even if a different sheet was open during the edit.

Parameterized producers can be used through an ordinary wrapper query with fully literal result-step bindings. The notebook itself still has one query declaration and needs no new parameter UI.

### Proposed notebook text

The precise chart names/fields follow the existing notebook and dashboard DSL; the new behavior is the retained project-aware result context. Verify this text through the real compiler after integration.

````markdown
# Experiment means

Each row represents an observed experiment. The mean uses its valid readings.

```eda
eda query=experiment-means
scatter @sample-size x=reading_n y=reading_mean title="Experiment mean and sample size"
hist @means reading_mean title="Distribution of experiment means"
```

# Measurement coverage

The table keeps experiments with no available mean visible.

```eda
table @coverage measurements.experimentId,reading_mean,reading_n,measurement_rows title="Experiment coverage"
```
````

The second sheet still contains experiment rows. It is not a raw-measurement table. Alt-Enter trace on a selected mean opens original measurements through the shared result's provenance.

### M4 exact acceptance

Add proposed `packages/explorEDA/src/components/notebook/ExplorEdaProjectNotebook.test.tsx` and extend existing notebook compile/read/sheet tests located during integration.

1. Both sheets read PF-01's three experiment rows. The plot has two finite means; the coverage table retains C with numeric count0 and unavailable mean.
2. Sheet changes do not create a new producer definition, binding set, or query evaluation solely because the reading tab changed. The result instance is notebook-wide.
3. Refresh to PF-03 while the first sheet is active, then open the second: it has Bmean50, reading sum150, and the same applied revision as the first.
4. Edit the shared producer from a project view: both notebook sheets refresh when open, and an unopened notebook reads the new definition when loaded.
5. Select B in a notebook chart: that chart and explicitly selection-bound findings follow the existing local selection behavior. Another chart, on either sheet, is not silently narrowed. A notebook-wide authored filter applies across the notebook without changing the producer.
6. Trace the summary/query boundary from a notebook mark: immediate experiment operands and original measurement memberships match the project-view trace exactly for that instance/revision.
7. Conflicting query declarations in two blocks produce an explicit diagnostic; they do not create per-block sources or silently select the first.
8. Use an unparameterized wrapper containing a literal-bound result reference: notebook evaluation succeeds without ambient notebook parameters. A root query needing an unbound parameter shows unavailable input.
9. An invalid chart block can use retained valid text, but labels/rows/traces still describe one coherent applied definition and source generation. No fresh rows with stale lineage.
10. Save and reopen `.eda.md`: preserve prose, heading/sheet structure, query ID, named chart IDs, and current writeback behavior. Do not duplicate producer definitions into the notebook.
11. Keyboard ArrowLeft/Right/Home/End on sheet tabs retains existing roving-tab behavior. Alt-Enter trace resolves the correct result row; Escape closes the nested trace/picker before the containing surface and returns focus correctly.

### Documentation and runnable notebook in M4

- Extend `apps/demo/src/docs/pages/notebooks.mdx` with **Share a grouped result across sheets**, **One result for the whole notebook**, **Selections remain local to charts**, and **Trace original measurements**.
- Link the working notebook from `reusable-results.mdx` and `project-folders.mdx`.
- Add `experiments.eda.md` to the M3 example folder with **Experiment means** and **Measurement coverage** sheets, using the same producer as the `.eda` analyses.
- Register a live/demo reading flow where existing infrastructure supports it; otherwise the runnable folder plus documented app command is the concrete example. Do not invent a second notebook runtime for a docs embed.

**Main risk:** continuing to pass only `row.data` from `readNotebookText`, which would make values appear correct while discarding the cross-query provenance and coherent refresh required by this feature.

**Independent release boundary:** the full requested project-and-notebook workflow is delivered. Mixed-grain sheets and notebook parameter controls remain separate decisions.

## 7. Visual and keyboard acceptance

These are required implementation checks, not observations from this research. Use real pointer and keyboard input in the repository's browser tooling. The mockup communicates hierarchy only; it does not prove any breakpoint.

| Width | Required visible behavior |
| --- | --- |
| **1280 px** | Compact scope line names result, grain, count, fixed inputs, and update state. Query editor/trace uses existing narrow/wide panel sizes without resizing the saved chart grid. A useful portion of the plot remains visible. Uses list and primary actions fit; a long name never sits underneath icon actions. |
| **783 px** | Preserve the existing two-column reading flow for charts. No graph canvas or forced three-pane layout. Bounded editor popovers, horizontal tab scrolling, and visible actions. Only explicitly scrollable tables may overflow horizontally; the page itself must not. |
| **390 px** | Single chart column. Editor/trace is a full-width bounded sheet with sticky close/action header and internal scrolling. Row count, grain, and active scope remain visible. Tables scroll inside their region. Group and measure controls remain operable without dragging. |

For each milestone's new surface, exercise the states it owns:

- PF-01 with C's unavailable mean and A's observed zero.
- One result row, many groups, and a legitimate empty result.
- Long source, field, query, and parameter labels.
- Active chart/workspace or notebook-local filters with visible owner/scope.
- Pending first load; pending with previous result; source-missing error; removed field; failed refresh.
- Shared producer edit, copy with retained upstream reference, and attempted deletion with consumers.

Keyboard acceptance:

1. Tab to input/result picker; Enter/Space opens it; type-to-search and arrow movement work; choosing a result does not trigger a chart drag.
2. Every icon action has an accessible name and the repository's real tooltip treatment. No native `title` attribute is introduced. Accessible focus is visible independently of hover.
3. Group selection and measure operations are fully operable without dragging. Inputs do not trigger workspace shortcuts while typing.
4. Escape closes the nested picker first, then the panel/sheet; focus returns to the invoking control. A canceled draft does not become a project edit.
5. Alt-Enter on a mark opens the same trace scope as Alt-click. A count trace and a mean trace distinguish membership from eligibility.
6. Existing project view switching and notebook sheet arrow/Home/End behavior work after a result refresh. Focus must not jump to a newly rendered hidden sheet.
7. During stale display, capture and selection-changing controls are disabled with an understandable accessible state. Any allowed previous-snapshot trace identifies its data generation.
8. On 390 px, focus scrolls controls into the sheet viewport without horizontal page movement; primary actions remain reachable at browser zoom.

Use `docs/ui-defaults.md` for the 28/32 px control scales, 100 px settings label column, border/focus tokens, single right-edge panel ownership, and visibility requirements. `CODING_STANDARDS.md` governs accessible names, raw-value parsing, and forbidden Inspect buttons. Both files were read at the baseline. [P05]

## 8. Proposed verification run sheet

These commands are for the implementing worker in a runnable checkout. They have **not** been executed in this research session. Paths labeled new above must exist by their milestone. Run only the relevant targeted gates while working; run the broad gate once before delivery, following the repository's rules.

```bash
# Mathematical companion only; already executed during this design research.
# Run from the delivered artifact directory, not the repository root.
python3 verify-proof-fixtures.py

# Switch to the runnable repository root for all commands below.
# M1: evaluator, existing entity behavior, project text, and query panel.
pnpm --filter exploreda exec vitest run \
  src/test/lib/analysis/reusableOutputs.test.ts \
  src/test/lib/analysis/evaluateProject.test.ts \
  src/test/lib/analysis/entityGrain.test.ts \
  src/lib/dsl/project.test.ts \
  src/components/project/ProjectQueryPanel.test.tsx
pnpm --filter exploreda check-types

# M2: compact authoring, explicit bindings, and copies.
pnpm --filter exploreda exec vitest run \
  src/components/project/GroupedResultEditor.test.tsx \
  src/components/project/queryEditing.reuse.test.ts \
  src/test/lib/analysis/reusableOutputs.test.ts \
  src/lib/dsl/project.test.ts

# M3: exact folder save/reopen and unavailable-source behavior.
pnpm --filter exploreda exec vitest run \
  src/lib/project/reusableOutputsFolder.test.ts

# M4: project-aware notebook data, trace, sheet, and refresh behavior.
pnpm --filter exploreda exec vitest run \
  src/components/notebook/ExplorEdaProjectNotebook.test.tsx

# New example registration and text round trips are separate demo gates.
pnpm --filter demo exec vitest run \
  src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check

# Start this checkout's demo; use its printed URL for real browser input.
pnpm dev:agent
pnpm shot /examples/reusable-experiments --name reusable-experiments

# M3/M4 local folder example; inspect the printed app URL.
# The environment variable is scoped to this command.
EXPLOREDA_FOLDER="$PWD/apps/demo/public/reusable-experiments" pnpm --filter app dev

# In a separate terminal, use the URL printed by that app command.
# Choose an observed stable selector from the implemented page.
node scripts/app-shot.mjs '<printed-app-url>' \
  --name reusable-experiments-folder --wait '<observed-stable-selector>'

# Full documentation interaction/overflow gate after the implementation exists.
pnpm --filter demo build
pnpm --filter demo docs:verify

# Package-changing releases require a changeset; choose the actual user-facing summary.
pnpm changeset:add minor 'Reuse a grouped query result across analyses and trace its original observations.'

# Run once for the completed milestone; do not run parallel builds in worktrees.
pnpm check:ui
pnpm check

# Stop the demo server started for these checks.
pnpm dev:agent --stop
```

Use the repository's shared `@repo/test-config` time limits. Do not add per-test timeouts or install another Playwright. `pnpm shot` covers the three required widths; the app-specific script avoids waiting for network-idle on the folder host's change stream. Add screenshots to implementation PRs using the repository's existing attachment workflow. These instructions come from `AGENTS.md` and `docs/agent-guide.md`, not from tests run here. [P05]

The run sheet deliberately leaves printed URLs and an observed app selector as placeholders; inventing them would make a purported runnable check misleading. Also inspect the actual package barrel and demo type build requirements if public types change; the agent guide notes the demo's type resolution through built package declarations.

## 9. Failure, compatibility, and integration decisions

### Errors must preserve the analytical question

| Condition | Required behavior |
| --- | --- |
| Missing producer | Name its query ID/display label and block dependents; preserve definitions/settings for repair |
| Missing/unreadable source | Unavailable input, not count0; identify the source and current/previous state |
| Valid empty table or filter result | Ready empty result with normal grouped/global aggregate semantics |
| Removed consumed field | Named schema dependency error; no fallback all-null column or guessed replacement field |
| Query cycle | Report path; reject even when literal bindings differ |
| Invalid binding | Show the owning result-read step and expected parameter type; no ambient fallback |
| Entity measure conflict | Preserve unavailable measure status and full group membership; do not reinterpret eligibility as a valid result |
| Pending worker result | Keep one applied bundle; disable stale capture/selection changes; never mix source generations |
| Failed update after success | Mark previous data explicitly; do not use it as a successful fresh dependency |
| Changed grain | Update grain/rows/labels/traces together; invalidate transient row selections |

Interactive result reuse requires no export/import workaround, materialization, or new service. Source-row deletion is outside this feature.

### Saved format decision

Keep the additive current project format and version 1 under one deployed version. Older software is not promised to understand the new constructs. Strictly handle the new syntax in the new release, retain old-project round trips, and avoid a version header that the current parser silently ignores. A future genuine versioned file format can be designed separately if multiple deployed readers become a requirement. [P02]

### Scope choices workers may refine

- Internal file factoring and exact type names may change if the invariants and public compatibility remain clear.
- Source-declaration promotion may be a guided M3 action or a documented project-owned-source prerequisite. No dangling references are acceptable in either cut.
- A measured large-trace issue may justify indexed addresses or lazy trace transfer later. Do not add persistent caching or implement speculative incremental aggregation now.
- Optional predicate capture and dependency-closure cloning are Explore recommendations, not gates on the selected releases.

## 10. Evidence and access record

### Decisive repository evidence

- **P01 — Model and computation:** [AnalysisProject.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/types/AnalysisProject.ts), `AnalysisQuery`, `AnalysisView`, `AnalysisResultRow`; [evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/evaluateProject.ts), `aggregateFrame`, `sourceReferences`, `validateQuery`, `evaluateAnalysisQuery`; [useAnalysisEvaluation.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts), `useWorkerEvaluation`.
- **P02 — Authoring and text:** [ProjectQueryPanel.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/project/ProjectQueryPanel.tsx), `openCopy`, `openStage`; [queryEditing.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/project/queryEditing.ts), `copyQuery`, `queryForStage`; [project.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/dsl/project.ts), `compileStep`, `stepLines`, `checkReferences`, `compileProjectText`.
- **P03 — Folders:** [folder.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/project/folder.ts), `readProjectFolder`; [writeFolder.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/project/writeFolder.ts), `projectFileText`, `analysisFileText`.
- **P04 — Host boundaries:** [ProjectWorkspace.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/apps/app/src/ProjectWorkspace.tsx); [FolderPage.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/apps/demo/src/folder/FolderPage.tsx); [readNotebook.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/notebook/readNotebook.ts), `readNotebookText`; [ExplorEdaNotebook.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx), `DataLayerProvider`, `SheetTabs`.
- **P05 — Working and UI rules:** [AGENTS.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/AGENTS.md); [agent-guide.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/docs/agent-guide.md); [ui-defaults.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/docs/ui-defaults.md); [CODING_STANDARDS.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/CODING_STANDARDS.md); [DIRECTION.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/docs/research/DIRECTION.md).
- **P06 — Exact arithmetic semantics and trace:** [valueParsing.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/valueParsing.ts), `numericExclusionReason`, `parseNumber`; [aggregates.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/aggregates.ts), `AGGREGATIONS`, `reduceNumbers`; [QueryStageRows.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/project/QueryStageRows.tsx), `relatedRecords`; [entityGrain.test.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/test/lib/analysis/entityGrain.test.ts).
- **P07 — Portable project files:** [projectFile.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/projectFile.ts), `selectAnalysisProjectView`, `parseAnalysisProject`, `stringifyAnalysisProject`, `validateAnalysisProjectFile`.
- **P08 — Analysis text and row-key settings:** [analysisText.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/project/analysisText.ts), `exportAnalysisText`, `analysisViewQueries`; [analysisRowKeys.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/project/analysisRowKeys.ts), `encodeAnalysisRowKeys`, `decodeAnalysisRowKeys`, `unresolvedAnalysisRowKeys`.

### External design basis

The direction was compared with current primary documentation for [Observable's reactive variables](https://observablehq.github.io/notebook-kit/system-guide), [Vega named derived data](https://vega.github.io/vega/docs/data/), [Vega-Lite aggregate selection limits](https://vega.github.io/vega-lite/docs/selection.html), [DuckDB views](https://duckdb.org/docs/2.0/sql/statements/create_view), [Perspective derived tables](https://perspective-dev.github.io/guide/explanation/derived_table.html), [Tableau filter order](https://help.tableau.com/current/pro/desktop/en-us/order_of_operations.htm), and [Mosaic selection ownership](https://idl.uw.edu/mosaic/api/core/selection.html). These are design precedents, not package dependencies. The full comparison and source limits are in the design report.

### Reading coverage and checks versus proposals

Access was sufficient. All **35 selected complete files** were read: the six rule/context files; three intent/research files; seven model/evaluator/worker/aggregation/parsing files; four project UI/test files; four DSL/folder files; three notebook files; three evaluator fixture/test files; and five demo/docs files. Their exact paths are listed in the design report's Files read section. The ten additional same-baseline reads were `DIRECTION.md`, notebook `index.ts` and `readNotebook.ts`, `AnalysisChartContext.tsx`, `QueryStageRows.tsx`, `ProjectWorkspace.tsx`, `FolderPage.tsx`, `projectFile.ts`, `analysisText.ts`, and `analysisRowKeys.ts`.

The source packet is selected complete-file evidence, not a runnable full checkout. The application was not run. No Vitest, type-check, worker, persistence, accessibility, or browser proof is claimed. The independently executed Python oracle passed 65 mathematical checks and labels application tests as proposed.

Full host saver internals, export barrels, detailed chart trace planners, and the lower-level `rowIdFilters` implementation remain integration reads. They are not missing evidence for the selected architectural boundary, and no behavior from them is asserted without qualification.

## Handoff status

**Access:** exact baseline and decisive source confirmed. **Files read:** all 35 packet files plus ten immutable additions. **Checked:** source and primary documentation, fixture arithmetic, artifact consistency, and visual inspection of the static concept. **Proposed:** all M1–M4 code, tests, docs, examples, and browser checks. **Deliverables:** [reusable-outputs-design.md](reusable-outputs-design.md), this plan, [proof-fixtures.json](proof-fixtures.json), [verify-proof-fixtures.py](verify-proof-fixtures.py), [grouped-results-ui.svg](grouped-results-ui.svg), [grouped-results-ui.png](grouped-results-ui.png), and [reusable-grouped-results.zip](reusable-grouped-results.zip). **Open questions:** measured trace volume and the optional source-promotion/predicate-capture/dependency-copy conveniences. The worker can start M1 without outside-demand gates or another research round.
