# Implementation plan: live notebook findings and evidence scope

**Decision.** Implement named notebook cohorts and findings, reference-only Markdown values, and exact evidence inspection over the existing React/TypeScript/Crossfilter provider. Preserve local notebook selections. Ship live reductions first, compact source-preserving authoring second, and explicit comparisons plus saved-cohort claims third; that is the core release cut. Add opt-in shared selection and the prior exact-lasso proof afterward. The work requires no new database, remote runtime, generated prose, or general query language.

Design baseline: `7f466fdebcf14c0fd87233aa634c0c74f91b4e93`. Companion decision and source analysis: [report.md](report.md).

## 0. Access, scope, and dependency order

**Access passed for planning.** All 33 complete source files in the attached packet were reviewed. The packet is not runnable and contains no dependencies or source-data payloads. The tests and browser checks below are implementation acceptance criteria, not completed results. Fixture arithmetic was checked independently. No repository changes, commits, or pushes were made in this design run.

Preserve the current repository rules: React, TypeScript, pnpm, existing renderers, one local client/server, compact nonmodal controls, docs/examples in every visible milestone, and real keyboard/pointer checks at 1280/783/390 px. `docs/research/DIRECTION.md` supersedes the historical expansion gates. Follow the earlier Mosaic selection decision instead of reopening the architecture survey.

### Shippable sequence

| Stage | What becomes useful | Depends on |
| --- | --- | --- |
| **M1** | Live named reductions plus exact current records, authored in notebook text. | Existing provider/filter/reducer interfaces; no identity or lasso work. |
| **M2** | Compact Insert/Edit/Rename/Rebind controls and durable source edits. | M1 declaration spans, registry, and evaluator. |
| **M3 — core cut** | Row shares, signed differences, saved evidence, explicit restore, and reversal example. | M1–M2; exact source revision and unique key boundary. |
| **M4** | Opt-in linked groups for several views and their findings/table. | Core contracts; prior Crossfilter selection contract. |
| **M5** | Real polygon lasso with exact evidence across the four-consumer proof. | M4 consumer resolution and precise-selection implementation. |

The main implementation risk is **a number and its evidence resolving different populations or revisions**. Address it with one semantic result object per finding, exact-key assertions, and transaction boundaries. Avoid widening this task into repairs of unrelated row identity, histogram edges, regression, or entity grain. Integrate those separately landed contracts where applicable.

### Fixed design contract

- Cohort declarations own references to a source/workspace/chart basis and fixed conditions.
- Finding declarations own metric, chosen population, fixed partition, and display options.
- The existing provider owns interactive predicates. No new selection store.
- Prose tokens only resolve names: `{{finding:selected-count}}`.
- Current evidence links use `#finding:ID`; saved evidence links use `#evidence:ID`.
- Live results are derived. Only an explicit Save evidence action persists captured values.
- First release uses row grain and existing count/sum/average/min/max reducers.
- Comparisons are bounded differences and row-count shares of primitive reductions.
- Unknown, missing, duplicate, or incompatible references produce unavailable values.
- The notebook remains readable static Markdown when none of the new syntax is present.

## 1. Start here: the first worker's concrete task

Create the M1 pure scope/evaluation contract and its exact fixture tests before adding editor UI.

1. Read the local checkout's `AGENTS.md`, `docs/research/DIRECTION.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, and `docs/ui-defaults.md`. Inspect changes since the design baseline only in touched boundaries; preserve unrelated user work.
2. Locate the current definitions of `applyFilter`, `getPopulationTest/restrictToPopulation`, `getFilterFunction`, `summarizeGroup`, `formatFieldValue`, `ChartTraceScope`, and the saved-data validator. The first five are directly referenced by supplied code; trace internals are a worker integration check.
3. Add the proposed `lib/notebook/findings/types.ts`, `resolveScope.ts`, and `evaluate.ts`.
4. Add the twelve-row fixture below. Start with a named row chart and `localSelections=true`.
5. Prove East resolves to r01,r06,r07,r10 and its numeric contributors to r01,r06,r07. Then prove an unrelated notebook chart's filter changes neither result.
6. Add the compiler and prose integration, current-evidence surface, docs section, and reachable demo before declaring M1 shipped.

Do not change `ExplorEdaNotebook` to use global linked selections to make the test pass. The intended feature is an explicit consumer of one local owner.

### Current source seam

`ExplorEdaNotebook.tsx` passes `localSelections`. In `CrossfilterWrapper.updateChartFilters`, local mode calls `dimension.filterAll()`. `getChartFilteredRowIds` applies the globally filtered IDs plus fixed chart population. A notebook binding must explicitly evaluate its owner's interactive predicate over the eligible IDs. This follows the code; it is not a request to “fix” every existing chart.

## 2. Exact fixture and test oracle

Use the following source records. Each key is a user-visible source field; runtime `__ID` values may differ. Assertions compare the key column after mapping runtime IDs.

~~~ts
export const findingRows = [
  { key: "r01", group: "A", region: "East", score: 90, active: true },
  { key: "r02", group: "A", region: "West", score: 10, active: true },
  { key: "r03", group: "A", region: "West", score: 20, active: true },
  { key: "r04", group: "A", region: "West", score: 0, active: true },
  { key: "r05", group: "A", region: "West", score: null, active: true },
  { key: "r06", group: "B", region: "East", score: 80, active: true },
  { key: "r07", group: "B", region: "East", score: 70, active: true },
  { key: "r08", group: "B", region: "West", score: 5, active: true },
  { key: "r09", group: "B", region: "West", score: 0, active: true },
  { key: "r10", group: "B", region: "East", score: "bad", active: true },
  { key: "r11", group: "A", region: "East", score: 100, active: false },
  { key: "r12", group: "B", region: "West", score: 100, active: false },
] as const;

export const eligibleKeys = [
  "r01", "r02", "r03", "r04", "r05",
  "r06", "r07", "r08", "r09", "r10",
];

export const eastKeys = ["r01", "r06", "r07", "r10"];
export const eastContributorKeys = ["r01", "r06", "r07"];

export const activeFilter = {
  type: "value",
  field: "active",
  values: [true],
} as const;

export const eastFilter = {
  type: "value",
  field: "region",
  values: ["East"],
} as const;
~~~

Declare score numeric through the existing source/field-settings route. Do not rely on inference from mixed score cells. Preserve boolean true as boolean, and distinguish null from the invalid string "bad".

Run two initial-population variants:

- **Notebook example:** owner's `localFilters=[activeFilter]`; workspace filters empty.
- **Workspace-denominator test:** owner's local filters empty; `workspaceFilters=[activeFilter]`.

Both yield the same eligible ten records and selected East four. The card's all-row baseline can differ between the variants. Do not claim they are the same persistence setting.

### Numerical oracle

| State | Counts / score results | Group comparison |
| --- | --- | --- |
| Cleared owner selection | D=12, E=10, S=10, C=8; sum=275; average=34.375; min=0; max=90. | A sum=120, average=30, C=4/T=5; B sum=155, average=38.75, C=4/T=5; difference=−8.75. |
| East | E=10, S=4, C=3; sum=240; average=80; min=70; max=90. | A=90; B=75; difference=15. |
| West | E=10, S=6, C=5; sum=35; average=7; min=0; max=20. | A=10; B=2.5; difference=7.5. |
| score=0 | S=C=2 at r04,r09; count=2; sum=0; average=0; min=max=0. | Difference=0. |
| keys r05,r10 | S=2, C=0; count=2; numeric measures unavailable, no-valid-values. | Difference unavailable. |
| region=Nowhere | E=10, S=C=0; count=0; numeric measures unavailable, empty-scope. | Difference unavailable. |
| workspace active matches nothing | E=S=C=0; count=0. | Share unavailable, zero-denominator. |

Additional derived expectations:

- East selected/eligible: `4 / 10 = 0.4`, displayed **40%** at zero percentage digits.
- East selected/source: `4 / 12 = 1/3`; do not compare the displayed rounded percentage as the exact ratio.
- Cleared selected/eligible: **100%**.
- Empty selected/eligible with E=10: **0%**.
- Group A/B displays at two decimals: **30.00 / 38.75**, then **90.00 / 75.00**.
- Signed difference displays: **−8.75**, **+15.00**, and **0.00** with the proposed `sign=except-zero` option; zero remains unsigned.
- All-source numeric score sum: **475**; contributors **10**; average **47.5**. The two inactive rows affect source scope but not the eligible review cohort.

Use exact fractions or appropriate floating-point assertions for arithmetic. Test display strings separately. Never use a rounded display value to compute a comparison.

### Exact evidence expectations

- All-active numeric contributors: r01,r02,r03,r04,r06,r07,r08,r09.
- All-active excluded score inputs: r05 (missing), r10 (numeric conversion failure).
- All-active A contributors: r01,r02,r03,r04; B contributors: r06,r07,r08,r09.
- East count evidence: r01,r06,r07,r10.
- East average evidence: inputs r01,r06,r07,r10; included r01,r06,r07; excluded r10.
- A comparison inspector exposes the left and right evidence separately. Do not manufacture one combined contributor count for two different averages.
- Evidence table sorting/search affects presentation only; it never changes the reported arithmetic. A local search count is labeled separately.
- All expectations refer to rows, not distinct entities.

## 3. M1 — Live named reductions and exact current evidence

**Useful outcome:** an author can hand-write a named count or average in a notebook, reference it in prose, filter its local chart, and open the exact selected/contributing/excluded records. Other chart selections remain independent.

**Recommendations delivered:** LF-01 through LF-05, the read-only portion of LF-06 and LF-09.

### Files and implementation tasks

**A. Pure finding contracts and evaluator — new modules**

Under `packages/explorEDA/src/lib/notebook/findings/` add:

- `types.ts`: the cohort, primitive finding, display, diagnostic, and result types from report §2.3. Do not implement comparison variants until M3, but keep their future contract explicit in the design.
- `resolveScope.ts`: resolve D/E/S from a provider snapshot.
- `evaluate.ts`: build T, call shared reduction-input preparation and `summarizeGroup`, return value and evidence together.
- `dependencies.ts`: enumerate source fields, calculations, owner chart IDs, and cohort references.
- `format.ts`: delegate field formatting; apply bounded precision/sign overrides; no daily Python-format parser.
- `fixtures.ts` or a test-local equivalent: the synthetic records and oracle.

Scope resolution must:

1. Use the actual notebook query's source IDs for D.
2. For chart/workspace bases, evaluate workspace filters through the existing filter semantics.
3. For a chart basis, apply its authored population with `getPopulationTest/restrictToPopulation`.
4. Apply fixed cohort conditions.
5. Apply only the declared owner's current `getFilterFunction` for S.
6. Preserve source scope's explicit independence from workspace/interactive filters.
7. Apply the finding's selected/eligible choice and partition filters to form T.

Read each referenced converted column once per resolution. Build predicate closures outside row loops. Do not add a dimension or filter store per finding. A derived membership cache is allowed; only existing provider actions mutate selection. Produce the result and an immutable evidence read view from that same snapshot. Opening evidence pins both, including the raw and converted inputs; a later provider getter must not reinterpret an old result after data replacement, runtime-ID reuse, or a calculation edit.

**B. Reuse metric preparation — existing and new modules**

- Existing `components/charts/MetricCard/MetricCard.tsx`: identify the conversion/raw-input/exclusion preparation to share.
- Existing `metricCardPlan.ts`, `metricCardTrace.ts`, and `lib/aggregates.ts`: reuse semantics and contributor records.
- Proposed `lib/metrics/prepareMetricInputs.ts`: pure shared preparation if extraction is needed. Keep it narrowly about inputs and reasons.
- Existing `providers/DataLayerProvider.tsx`: expose a narrow immutable snapshot/selector boundary if necessary; add registry storage and dependency checks.

A refactor must preserve current card values, formatting, comparison baseline, and trace records. New findings may intentionally distinguish count-zero from numeric-empty without changing the card's existing empty wording.

**C. Notebook parsing/compilation — existing and new modules**

- Existing `lib/notebook/parseNotebook.ts`, `compileNotebook.ts`, and notebook exports.
- Proposed `lib/notebook/findings/parseDeclarations.ts`.

Implement notebook-only top-level `cohort` and `finding` declarations inside `eda` blocks. Reuse the existing tokenizer/span conventions. Blank their lines before ordinary chart DSL parsing/compilation; preserve line numbers. Both `blockProblems` and the final combined compile must use the same extraction, so new keywords are not reported as unknown chart declarations.

Resolve aliases after ordinary definitions are available. Support forward references across blocks and sheets. Preserve the full source spans for later writer actions. The grammar initially accepts fixed conjunctions using existing filter forms, no function calls or arbitrary expressions.

The complete report example uses `where.reviews.active=true` as its acceptance target. The scoped packet does not establish the unaliased boolean parser/writer round trip. Verify that exact form in the checkout before reusing it; require boolean `true`, not the string `"true"` or a categorical coercion. If the ordinary DSL cannot preserve it, add the smallest typed normalization needed for this example and test the emitted form. Do not silently change the ten-row eligible fixture.

Examples to compile in M1:

~~~text
cohort @review scope=chart chart=@regions key=key label="Active reviews"
finding @selected-count cohort=@review aggregation=count population=selected
finding @selected-mean cohort=@review aggregation=average field=score population=selected digits=2
~~~

Require an explicit chart ID for durable references; hand-authored references to generated positional IDs are diagnostics. Authoring promotion arrives in M2.

**D. Durable definitions — existing files**

- `types/SavedDataStructure.ts`: optional `notebookFindings` registry.
- `utils/saveDataUtils.ts`: strict shape validation and source-field checks where appropriate.
- `providers/DataLayerProvider.tsx`: `saveToStructure`, initialization, restore, and `assertUnusedCalculation`.

Absent registry means empty. Do not serialize live result objects, ephemeral inspector state, runtime row IDs, or a new copy of interactive filters. The source compiles into this registry; it is not a separately edited authority.

Validate structure strictly. Distinguish malformed saved payloads from well-formed definitions whose references are currently missing: the latter should load with local unavailable diagnostics, not silently bind elsewhere or prevent all other charts from opening. Respect the existing save validator's rejection rules for malformed data.

**E. Rendering and current evidence — existing and new components**

- Existing `components/notebook/NotebookProse.tsx` and `ExplorEdaNotebook.tsx`.
- Proposed `NotebookFindingValue.tsx`, `NotebookFindingEvidence.tsx`, and `useNotebookFindingResults.ts`.
- Proposed `components/charts/trace/findingTrace.ts` or the equivalent adapter next to current trace types.

Add a MarkdownIt inline rule for `{{finding:ID}}` and the allowlisted evidence links. Preserve `html:false`, unsafe-link rejection, and external-link handling. Ignore tokens in inline/fenced code, escaped text, image alt text, link destinations, and nested link content. Do not replace tokens through a regex over generated HTML.

Recommended rendering implementation: render trusted inert slots from the Markdown token stream, then place React value controls into them. Memoize the surrounding Markdown HTML by source text only; selection updates change the React controls, not the entire prose subtree. This preserves focus. Existing static prose can retain its current fast path.

Evaluate all findings from provider definitions, not mounted chart components. One coordinator can deliver derived results through React context; that context carries no selection state/actions. Reuse results for repeated references and subscribe to actual dependencies rather than the whole chart list for each token.

Adapt the existing trace/evidence row presentation around the `AggregateContributor` contract. Open exact result evidence even when its chart is on another sheet. If the chart trace panel is too tightly chart-scoped, factor its presentation into a reusable component; do not render a hidden card. Once opened, keep the result and evidence read view pinned until an explicit Refresh replaces both together. Record sorting and searching must not reevaluate the finding.

### Acceptance tests

Add meaningful tests such as:

- `lib/notebook/findings/resolveScope.test.ts`: both fixture setup variants, source vs eligible scope, owner-local filter, unrelated owner independence, workspace influence, cleared vs active-empty.
- `lib/notebook/findings/evaluate.test.ts`: exact values and key sets above, null vs conversion failure, true zero, no-valid-input, absent field, nonfinite aggregate, unit-preserving formatting.
- `lib/notebook/compileNotebook.test.ts` or a focused new `compileFindings.test.ts`: cross-block forward references, duplicate IDs, missing owner, source aliases, typed boolean/string/numeric filter values, line-accurate diagnostics.
- Extend `components/notebook/ExplorEdaNotebook.test.tsx`: values and evidence agree; another chart's local selection does not change them; switching sheets preserves them; affected frozen/invalid declarations show unavailable.
- New `NotebookProse.test.tsx`: static Markdown/external-link parity, raw HTML remains text, script-like tokens are never executed, code samples remain literal, focus survives live updates.
- Pin evidence, then change a calculation and replace the source with reused runtime IDs: the old inputs stay attached to the old result; Refresh replaces the full view atomically or reports unavailable.
- Extend saved-data tests: registry round-trip; no result cache serialized; stable host-echo fingerprint; well-formed unresolved references remain local diagnostics.
- If input preparation is extracted, run existing MetricCard tests and one parity assertion on its value, baseline, and contributor trace.

For disabled/missing references, assert the exact reason and that no previous numeric value is presented as current. Test relevant semantic revisions, not only provider `nonce`.

### Docs and runnable example in M1

- Update `apps/demo/src/docs/pages/notebooks.mdx`, new **Live findings** section.
- Add proposed `apps/demo/src/docs/live/NotebookFindingsExample.tsx` and a fixture/notebook source module beside it.
- Render it on the existing **/docs/notebooks** page with a named **notebook-findings** example.
- Integrate `apps/demo/src/docs/live/examples.ts` and its scripted-step registration. If that registry currently accepts only dashboard fixtures, extend it minimally for this notebook example or use the page's component plus explicit docs test steps; the visible route is mandatory.
- Document one count, one average, scope label, current evidence, invalid/empty state, and local chart behavior.
- Example steps: initial count10/average34.375 → select East → count4/average80 → inspect r10 exclusion → select an unrelated chart → unchanged finding → clear East.
- Read-only and keyboard paths work without an authoring editor.

**M1 main risk:** conflating chart context, eligible rows, and the selected local predicate.  
**Exit:** the page can be opened and these exact steps pass through real input. No lasso, save-capture, or shared mode is needed.

## 4. M2 — Compact authoring and source-preserving edits

**Useful outcome:** authors insert and maintain live values from the notebook UI; renames and layout changes do not silently break bindings.

**Dependency:** M1 compiler spans, resolver, registry, and evidence controls.  
**Recommendations delivered:** complete LF-06; authoring parts of LF-01 and LF-05.

### Files and implementation tasks

- Proposed `components/notebook/NotebookFindingEditor.tsx`.
- Proposed `lib/notebook/writeBackFindings.ts`.
- Existing `ExplorEdaNotebook.tsx`, `NotebookProse.tsx`, `NotebookSourceEditor` integration, and `notebook.css`.
- Existing `lib/notebook/writeBack.ts`: share span-edit utilities if useful without broad unrelated formatting changes.
- Existing provider dependency traversal and save validation.

Add **Insert value** beside prose editing, plus **Edit definition**, **Rename**, and **Rebind** in the value's editor view. Controls: existing/new name; source/workspace/chart basis; selected/eligible population; reducer; field; fixed conditions; format; preview; Insert/Apply/Cancel.

Use the existing field picker and field metadata. Every abbreviated/icon control has an accessible name and the project's real tooltip component. Keep controls dense, popovers viewport-bounded, and active scope visible.

Treat IDs and labels separately. Editing a label does not update references. Renaming an ID updates all parsed references/dependent declarations in one transaction; never search-and-replace through code blocks or ordinary prose. To bind an unnamed chart, insert an explicit collision-free `@id` at that chart's declaration, then add the cohort/finding/token in the same transaction.

Before applying a graphical edit:

1. Produce source-span replacements against the current source revision.
2. Reparse and recompile.
3. Verify the intended normalized definition and references.
4. Commit once through `onTextChange`.
5. If another source edit occurred, regenerate spans against it or show a local conflict; never write stale offsets.

Preserve comments, unrelated blocks, whitespace, alias choices, newline style, and external links. Do not trigger the current 2-second input heuristic accidentally to classify a finding operation as an unrelated chart edit; use an explicit edit intent. Preserve the writer's `select.*` skip and unchanged-source behavior on brushes.

Reconcile the compiled registry after a finding-only source transaction while preserving current workspace and chart-local predicates. The current `written.current` echo guard is tied to chart writing; invoking `onTextChange` alone can cause a fresh provider state to discard a reader's transient selection. Extend that explicit echo/reconciliation boundary for finding edits. Carry predicates in provider state, never serialize them into the source to preserve them. If an edit removes an owner or changes a field's meaning, resolve that specific dependency explicitly instead of copying invalid predicates.

Keep a draft preview within the editor. Apply is one host undo checkpoint; Cancel/Escape creates none. Never add live values to saved output merely to obtain undo.

### Acceptance tests

- Insert at a prose caret and verify exactly the token plus necessary definitions changed.
- Promote an unnamed chart, then reorder/insert another block; the finding still targets the same explicit chart.
- Rename a label, a finding ID, an owner chart title, and a sheet heading; only the appropriate references change.
- Reject duplicate IDs with diagnostics at both declarations; label duplicates remain allowed.
- Rebind a missing field explicitly; do not choose a similarly named field automatically.
- Remove a referenced chart/calculation: affected values unavailable; independent values remain live; in-app delete guards include the new dependency.
- Round-trip comments, quoted labels, CRLF, multiple sheets, escaped references, references inside code, and repeated live references.
- A brush or clear produces no notebook text change; a field/definition edit produces a valid minimal change.
- Select East, then rename a finding or change its precision: count stays four, both local/workspace predicates remain intact, and the source still contains no transient `select.*` tokens.
- Save/reopen the notebook: definitions survive, transient selection follows the existing notebook persistence rule, and values recompute.
- Source editing and chart editing in adjacent blocks do not overwrite one another.
- Keyboard Cancel restores the old source and returns focus; Apply is one undo operation.

### Docs and runnable example in M2

- Add **Insert and edit a finding** to `notebooks.mdx`.
- Extend the same `NotebookFindingsExample` with a host-owned text state and `onTextChange`.
- Add the editor steps to the registered **notebook-findings** example: insert Average score, rename it, alter precision, inspect scope, cancel an edit, and reopen the saved source.
- Explain explicit names, source vs chart scope, and failure/rebind behavior. Keep internal implementation limitations out of product copy.

**M2 main risk:** correctly changing several distant source spans as one edit while preserving surrounding text.  
**Exit:** an author can create the M1 example through the UI and reproduce it from its notebook text.

## 5. M3 — Explicit comparisons and saved cohort claims

**Useful outcome:** the complete comparison-reversal example can show current values and a fixed claim about saved evidence. Readers can inspect either population and deliberately restore compatible saved scope.

**Dependency:** M1–M2. Durable captures require exact source revision and a unique nonmissing key/typed tuple. They do not require cross-refresh identity remapping.  
**Recommendations delivered:** LF-07, LF-08, complete LF-09.  
**This is the recommended core release cut.**

### Files and implementation tasks

**A. Comparisons**

- Extend finding `types.ts`, `parseDeclarations.ts`, `evaluate.ts`, `dependencies.ts`, and `format.ts`.
- Add difference and row-share forms shown in report §1.4.
- Resolve all operands from one provider snapshot.
- Require primitive operands. A difference requires the same source, cohort, row grain, aggregation, canonical measure field, and effective unit; two counts are also compatible. Partition predicates may differ and display precision is irrelevant. A share requires two row counts from the same source with numerator keys a subset of denominator keys. Validate these contracts before evaluating a comparison.
- Do not add percent change, division-by-zero special guesses, or arbitrary expression evaluation.

**B. Saved evidence and keys**

Proposed modules:

- `lib/notebook/findings/captureEvidence.ts`
- `lib/notebook/findings/captureOwnerSelection.ts`
- `lib/notebook/findings/evidenceKeys.ts`
- `lib/notebook/findings/sourceRevision.ts`
- `lib/notebook/findings/validateEvidence.ts`
- `lib/notebook/findings/restoreEvidence.ts`

If the separate identity initiative has landed, inspect and reuse its approved key boundary. If it has not, implement only explicit typed nonmissing unique key/tuple validation plus exact-source-revision matching. M3 keys must be raw source fields; reject calculated keys. Validate uniqueness over the entire source, before display conversions. A string `"1"` differs from numeric `1`, and raw date strings remain strings. Never persist runtime `__ID`, use row order as a portable identity, or match keys across changed data and call the result original evidence.

Choose one capture-owned `keyFields` tuple and use it for every captured cohort and reduction. Cohort-level key hints may help choose the tuple; they must not produce differently encoded keys inside the same saved record. Record count inputs as a contribution of 1 per row, and measure inputs as their actual converted values plus relevant raw values.

Implement lossless owner-specific selection snapshot/validation/reapply adapters. M3 supports row-value and histogram-range owners after verifying all of their `getFilterFunction` dependencies. A bare `filters` array does not cover every current chart: data-table `globalSearch` is separate state in `DataLayerProvider.clearAllFilters`. Disable Save/Restore for unsupported owner types with a local reason while keeping live findings/current evidence usable. Extend the discriminated snapshot only when the adapter preserves every predicate input; do not silently omit search or other selection state.

The source revision adapter should consume a verified query-content revision if the host exposes one. Otherwise fingerprint the canonical typed raw query data once per replacement, with a stable field ordering, preserved row order, and the existing saved-value encoding for undefined/nonfinite values. Keep data revision separate from relevant field/calculation semantics. Mark capture pending until the revision exists.

Capture the complete dependency closure needed to explain a result:

- Every frozen cohort in the result's dependency closure, including a separate all-source denominator, plus primitive findings and bounded comparison definitions.
- Relevant effective field types/settings, transitive calculation expressions, and versioned reducer/filter interpretation contracts, using the existing `FieldSettings`, `SavedCalculation`, and special-value encoding where applicable.
- Workspace filters only for workspace/chart bases; an absent property means that scope does not participate, while an empty array means a participating unrestricted workspace.
- An owner array containing the authored population, chart type, and current selection semantics/predicates for each participating chart. M3 permits zero or one owner; multiple owners arrive in M4.
- Exact E/S keys separately for every cohort, plus each reduction's keyed raw and converted inputs, inclusion flags, exclusion reasons, and captured formatted/unformatted values. Reuse the saved special-value codec so undefined and nonfinite inputs are distinguishable from null.

Persist effective semantic configuration as data, not just its digest. Historical summary values are a deliberate capture exception to the “do not save derived live results” rule. Validate the complete proposed `SavedEvidence` shape in report §3, including every cohort reference and keyed input join; a single E/S pair is insufficient for a share with an all-source denominator.

At Save evidence, freeze the selected result, immutable evidence read view, and complete dependency closure from one analytical revision. Naming the capture afterward commits that revision. Disable Save while its source revision is pending. If the user elects to capture a newer result, refresh the entire capture together; do not combine old values with later rows or filters.

**C. Notebook evidence segments**

- Extend `parseNotebook.ts` with a distinct `NotebookEvidence` segment for a closed `eda-evidence` JSON fence.
- Extend `compileNotebook.ts`: validate JSON/schema, blank evidence lines before chart compilation, fold snapshots into the same registry.
- Update `sheets.ts`, `notebookSections`, `NotebookSectionsView`, and `NotebookColumn` so a non-prose evidence segment is not mistaken for a chart block.
- Extend `writeBackFindings.ts` to insert/update exactly one evidence segment.
- Extend `SavedDataStructure`, provider save/restore, validators, and source dependency diagnostics.

The source editor may expose the JSON, but the reading view shows a compact **Saved evidence · [label]** summary or its linked inspector. A capture operation writes a fully validated record. No mixed-version support or automatic migration framework is part of the feature.

**D. Saved inspection and restoration**

- Extend `NotebookFindingEvidence.tsx`.
- Add proposed `NotebookSavedEvidence.tsx`.
- Add one provider action for transactional scope application, reusing its existing chart/workspace state.

Saved inspection resolves keys against the original available source revision and ignores current filters. Render raw source records together with the captured reduction inputs and inclusion/exclusion reasons. Do not call today's `getColumnData` to reconstruct historical converted or calculated values. The owner need not exist to inspect compatible saved row evidence. A calculation edit may leave raw source rows inspectable while making restoration incompatible. If the source is different/unavailable, show captured summaries, inputs, and definitions, with a specific unavailable-records reason; no fresh predicate results are substituted.

A separate **Restore saved scope** control:

1. Derives and names the mutation set from the captured bases: source-only has nothing to restore; workspace replaces workspace filters; chart replaces workspace filters plus that owner's selection. An all-source denominator adds no mutations.
2. Requires compatible source, keys, owner type, authored population, conversions, and calculations.
3. Computes candidate exact E/S memberships for every captured cohort before mutation, including any independent denominator.
4. Rejects a mismatch.
5. Updates all affected predicates and publishes one coherent result revision.
6. Creates one host undo step, with immediate Undo.

Do not implement this as several ordinary setters followed only by `holdStateChanges`: holding host callbacks does not itself guarantee that subscribers never observe intermediate populations. Prepare the transaction, update Crossfilter/state together, and publish once. If an atomic restore cannot be guaranteed, ship saved inspection first and keep Restore unavailable until the contract is met.

Do not restore data, rewrite a calculation, alter authored local population, or rebind a missing chart as a side effect. Do not erase unrelated notebook-local selections.

### Acceptance tests

**Comparison and prose:**

- All-active A30/B38.75/difference−8.75 → East A90/B75/difference+15.
- Verify both operands and their evidence share one revision during rapid selection changes.
- No-members/invalid operand makes comparison unavailable with a useful reason.
- Source/eligible shares produce 1/3 versus 0.4 under East.
- No selected rows with E10 produces 0%; E0 produces zero-denominator.
- Reject incompatible cohorts, aggregations, measure fields, units, or sources for differences; reject non-count share operands, numerator outside denominator, unknown operands, and cycles. Accept different partitions of a compatible measure and different display precision.
- Signed zero displays 0.00; valid values never disappear because they are falsy.

**Capture and evidence:**

- Capture all-active: E/S keys r01–r10; A contributors r01–r04; B contributors r06–r09; excluded r05/r10; values30/38.75/−8.75.
- Choose East: current records show four; saved evidence still shows ten. Inspecting either changes no filters, source text, or undo history.
- The fixed saved-claim sentence is byte-for-byte unchanged after the reversal.
- Styling, owner title changes, sheet navigation, and unrelated local selections produce no changed-scope notice.
- Relevant selection/eligible membership or analytical-semantic changes produce the local **Current scope differs** indication.
- Snapshot round-trips through notebook text and saved structures; all raw runtime IDs are absent.
- Capture the selected/source share under East: store both chart E/S keys and source denominator E/S keys; the result stays 4/12 even after a later selection.
- Freeze Save evidence, then change the selection while naming the capture: the stored value, inputs, keys, and predicates all belong to the captured revision.
- Reject missing or duplicate keys, calculated key fields, mismatched typed key values, malformed evidence, and unknown schema format/version. Confirm raw string `"1"` and numeric `1` remain distinct.
- Verify all cohort/input keys use the single capture-owned tuple. A data-table owner without a complete search adapter cannot be captured or restored as though its filter list were the full predicate.
- Restore all-active from East: same source/semantics → ten selected, original comparison, one undo; Undo returns exactly to East.
- Restore also accounts for workspace-filter changes; restoring only the owner's brush is insufficient.
- Source-only evidence has no Restore action; a workspace-only capture never changes chart-local selections; a source denominator adds no mutation to a chart capture.
- Deleted owner: saved records still inspectable when source matches; restore unavailable.
- Changed calculation or field conversion/type: stored inputs remain historical and raw source records can still be inspected when the raw source matches; Restore is unavailable. Changed authored population or source revision produces its own compatibility reason, without fresh values masquerading as captured evidence.
- Source reorder changes the initial strict revision even when keys look familiar; no cross-refresh claim is implied.
- If current evidence is pinned and a filter changes, the old evidence remains labeled and Refresh switches the entire result atomically.

### Docs and runnable example in M3

- Add **Comparisons**, **Current records and saved evidence**, and **Restore a saved scope** to `notebooks.mdx`.
- Upgrade the same reachable **/docs/notebooks** example to the complete body in report §1.4.
- Add the saved all-active claim, generated validated evidence fence, and a Restore action.
- Script: clear → save comparison → select East → read reversal → inspect saved ten/current four → restore → undo → simulate source replacement and see its precise unavailable state.
- Include a downloadable example notebook only if the current project/demo packaging supports it; the docs route is sufficient for this milestone's runnable requirement.
- Keep the synthetic dataset beside the example. Do not claim the real earthquake statistics were tested until their actual payload is loaded.

**M3 main risk:** presenting newly matched rows as old evidence or partially restoring a scope.  
**Exit:** exact captured keys, coherent current values, and explicit read-versus-mutate semantics pass end to end.

## 6. M4 — Opt-in shared selection groups

**Useful outcome:** an author can intentionally make several charts, an evidence table, and findings participate in one exploration while the rest of the notebook remains local.

**Dependency:** M1 scope contract and M3 saved-scope semantics. This follows the core cut.  
**Recommendations delivered:** LF-10.

### Files and implementation tasks

Reuse the prior Mosaic small contract over Crossfilter. Proposed additions:

- `lib/selections/resolveSelection.ts`: owner/target resolution if no equivalent has landed.
- `lib/notebook/findings/sharedScope.ts`: notebook declarations adapting to that contract.
- Existing `CrossfilterWrapper.ts`, provider chart actions, `useGetLiveData.tsx`, and affected table/evidence consumers.
- Extend registry validation, declaration parsing, capture/restore dependency closure, and docs.

Proposed notebook form:

~~~text
selection @review-linked owners=@regions,@scores resolve=intersect
cohort @review-shared scope=shared selection=@review-linked
~~~

This syntax is new and opt-in. The group holds member IDs and resolution metadata, not mirrored predicates. Reject accidental multiple-group ownership in the first release rather than invent ambiguous routing. Nonmembers retain existing local behavior.

For this first shared release, member views use the same declared eligible population; diagnose incompatible populations rather than guessing how to combine them. Source context for a member excludes only that member's own selection. Exact findings/table/evidence include every relevant member selection. Membership is never inferred from matching field names, display titles, or sheet placement.

Extend the existing saved-scope owner array from zero/one to the declared shared owner set; capture each cohort's full dependency closure. A restore affecting shared owners remains one transaction and explicitly names them.

### Acceptance tests

Use the original twelve-row review fixture for a first ordinary-filter linked demonstration:

- `@regions` selects East.
- `@scores` selects score in [75,95] using the currently supported range contract.
- Exact selected keys are r01,r06; count2; mean85; eligible share20%.
- Region context after excluding its own selection includes r01,r06.
- Score context after excluding its own selection includes the four East selected inputs before score reduction/drawing exclusions.
- Unrelated local chart selections change none of those results.
- Two different owners filtering the same field are retained separately.
- Removing an owner produces a local reference diagnostic, not a broader fallback scope.
- Clear one owner, switch sheets, save/reopen, capture/restore, and undo preserve declared membership and resolution.

Do not use this rectangular/range demonstration as lasso acceptance.

### Docs and runnable example in M4

- Add **Share a selection explicitly** to `notebooks.mdx`.
- Add a second registered example, **notebook-shared-findings**, visible on **/docs/notebooks**.
- Display histogram, scatter or score view, evidence table, and finding; label the shared group.
- Document local default, explicit intersection, owner context, and exact evidence.
- Include keyboard selection through each chart's existing Filters control.

**M4 main risk:** subtly changing global/local behavior or storing duplicate predicates.  
**Exit:** the shared group works while a nonmember chart demonstrates unchanged local behavior.

## 7. M5 — Exact lasso with the prior four-consumer proof

**Useful outcome:** a real polygon selection participates in the declared scope, and its count, rows, and prose are exact.

**Dependency:** M4 and the precise-selection work. Reuse or integrate that work; do not rewrite its architecture.  
**Recommendations delivered:** LF-11.

### Files and implementation tasks

- Existing `types/FilterTypes.ts` plus the prior selection-contract module: introduce the bounded joint geometry clause through the approved owner-aware contract; do not force a two-field predicate into two unrelated field filters.
- Existing scatter selection path under `components/charts/ScatterPlot/`, including `ScatterSvg.tsx` where appropriate; inspect current implementation before choosing exact edits.
- Proposed `lib/selections/polygonMembership.ts` only if that helper does not already exist.
- Existing selection resolver, save validation, field-dependency traversal, notebook shared scope, finding evidence, and capture/restore.
- Extend saved ownership/predicate records and the lossless owner-selection adapter for joint field references and exact geometry; no pixel-space membership or display-only row approximation.

Represent exact committed polygon geometry in source units with explicit x/y fields, owner, and boundary rule. For the first release, use linear axes and include boundary points; reject fewer than three distinct vertices, nonfinite coordinates, and degenerate polygons. Keep current global-coordinate behavior explicit; facet-local semantics and transformed-axis lasso are deferred. A view range changes the picture, not committed membership.

Provide a keyboard path to create/edit polygon vertices in a compact coordinate editor, with Enter to commit and Escape to cancel. Keyboard users can also inspect, clear, and restore it. Merely allowing a keyboard user to draw a rectangle does not provide the same lasso operation.

### Prior proof acceptance

The supplied Mosaic summary defines:

- Histogram A selects X in **[1,3)**.
- Scatter B selects triangle **(0,0), (3,0), (0,3)**.
- Histogram context has **5** rows.
- Scatter context has **7** rows.
- Exact evidence/finding/table share **r02,r07,r10,r11**.
- Selected count is **4 of 12 eligible**, or **1/3**.

The earlier twelve-row **coordinate fixture itself is not in the supplied packet**. Retrieve its established definition from the earlier proof materials/worker checkout before executing these ID assertions. Do not invent coordinates that happen to satisfy the reported answer. This missing input blocks that specific M5 proof, not M1–M4. If it remains unavailable when M5 starts, the smallest required input is the twelve-row coordinate/key table and its boundary policy.

Test polygon edges/vertices, overlapping points, excluded nonfinite coordinates, clear versus empty, source replacement invalidation, both owner contexts, exact export/trace IDs, shared findings, persistence, and restore. Reuse the already-owned interval-edge work for the half-open histogram selection; do not reopen it as a new audit or treat an inclusive rectangle as success.

### Docs and runnable example in M5

- Add **Exact lasso findings** to `notebooks.mdx` and the existing Scatter/selection docs section.
- Add **notebook-lasso-evidence** to the docs live examples, reachable from **/docs/notebooks** and the selection documentation.
- Show histogram, actual scatter lasso, evidence table, selected count, and prose reference together.
- Include the keyboard polygon editor and the explicit global-coordinate scope label.

**M5 main risk:** geometry or context resolution diverging from exact evidence.  
**Exit:** the established four-consumer truth table passes with a real polygon and identical IDs.

## 8. Keyboard, layout, and source checks in every visible milestone

These checks are scoped acceptance gates for the new flow, not a general redesign audit.

| Width | Required behavior |
| --- | --- |
| **1280 px** | Read-only sections layout remains effective; inline summaries do not cover the prose/chart relationship; long scope labels and evidence stay readable. |
| **783 px** | Notebook uses its reading-column fallback; popovers fit the viewport; primary actions remain visible while controls/rows scroll. |
| **390 px** | Prose and value controls wrap without page overflow; the evidence surface fits the screen; horizontal row scrolling stays inside the table; all close/apply/restore actions remain reachable. |

At each width exercise:

- Tab through values, evidence links, and editor controls; Enter/Space opens; Escape closes the nested surface first and restores focus.
- Existing sheet ArrowLeft/ArrowRight/Home/End navigation still works.
- Local selections are reachable through manual chart Filters controls; M5 additionally provides equivalent polygon entry.
- Long field/cohort names, null values, invalid inputs, active zero matches, and zero eligible rows.
- Light mode as the default design; semantic borders and contrast in both themes.
- No native `title` tooltip attributes, hidden-only accessible names, or chart Inspect buttons.
- No hover-only action on touch.
- Current inline focus remains stable during selection updates.
- One polite status message after a committed selection, without repeated announcements during dragging.
- Editor controls carry `data-export="omit"` where applicable; exported chart appearance is not polluted by temporary authoring UI.
- Current evidence, saved evidence, and Restore have distinct names and visible scope labels.

The current `CODING_STANDARDS.md` and `ui-defaults.md` differ in wording about tooltip focus. Use the shared component's current behavior, retain explicit accessible names/focus indicators, and verify help is keyboard-reachable without a tooltip opening merely on focus return.

## 9. Verification run sheet and repository handoff

Run from a real checkout after the relevant files exist. These commands were **not executed on the scoped packet**. Keep test time limits in `@repo/test-config`; do not add one-off timeouts.

~~~bash
# Find the current extension seams before editing.
rg -n 'compileNotebook|parseNotebook|NotebookProse' packages/explorEDA/src
rg -n 'getFilterFunction|getChartFilteredRowIds|restrictToPopulation' packages/explorEDA/src
rg -n 'summarizeGroup|formatFieldValue|useTraceSource|ChartTraceScope' packages/explorEDA/src
rg -n 'saveToStructure|restoreAnalysisFromStructure|assertUnusedCalculation' packages/explorEDA/src/providers/DataLayerProvider.tsx
rg -n 'validateSavedData|validateSavedAnalysisForData' packages/explorEDA/src/utils/saveDataUtils.ts
rg -n 'compileNotebook|isNotebookPath' packages apps
rg -n 'notebooks|live/examples' apps/demo/src/docs apps/demo/e2e

# Targeted library verification after M1, expanded as later files land.
pnpm --filter exploreda exec vitest run src/lib/notebook src/components/notebook src/components/charts/MetricCard
pnpm --filter exploreda check-types

# Check saved-state and provider tests at their actual current paths.
# Locate them with rg --files; include only the suites affected by the change.
rg --files packages/explorEDA/src | rg '(saveData|DataLayer|Crossfilter).*test'

# Run the demo from source and inspect the /docs/notebooks examples.
pnpm dev:agent

# Build the demo/docs and exercise this page's registered scripted examples.
pnpm --filter demo build
pnpm --filter demo docs:verify --list
# Select the actual notebook test title shown by this checkout, or run the full
# docs:verify command. Require at least one executed /docs/notebooks example test;
# a zero-match grep is not a successful acceptance check.
pnpm --filter demo docs:verify

# Use the repository's screenshot runner, following its documented arguments.
pnpm shot --help
# Capture the new flow at 1280, 783, and 390 px with real input.

# Once the milestone is ready, run the broad gate from one worktree only.
pnpm check
pnpm check:ui

# For each implementation PR that changes the package, add its changeset.
# Write a milestone-specific user-facing summary; do not publish/version here.
pnpm changeset:add minor "Add live notebook findings with explicit evidence scope"
~~~

If a new demo dashboard example is added under `src/demos/examples.ts`, also add its coverage entry and run the documented `coverage.test.ts` and `dashboardText.test.ts` suites. A notebook embedded directly in the docs still needs scripted example checks and route reachability. Do not add an unrelated new dashboard just to satisfy registration.

If changed exported library types require demo type checking against dist, build the library once first, as the agent guide requires. Avoid concurrent broad builds in separate worktrees.

For future implementation, follow repository practice of a small PR per useful milestone, user-facing changeset, and screenshots for visible work. This design mission itself authorizes no repository edits, commit, push, or PR creation. Codex can reconcile the report against its checkout and place the working plan under `docs/intent/live-notebook-findings/implementation-plan.md`, with a short decision summary under `docs/research/`; do not commit raw Pro attachments or this delivery archive as source receipts.

## 10. Cut line, non-goals, and remaining decisions

**Ship through M3** for the complete core feature. M1 is an independently usable early release, and M2 makes it practical to author. The core works with one local chart selection and exact source-revision evidence; M4/M5 add coordinated views and exact lasso.

Do not make these prerequisites:

- A full query language, arbitrary JavaScript templates, report engine, or generated text.
- A database/backend migration, Mosaic packages, paid service, remote model, or framework conversion.
- Every operation in the demo's DailyFinding evaluator.
- Entity grain, percent change, weighted statistics, or cross-refresh key remapping.
- A full history/provenance graph or automatic migration framework.
- A broad audit of already-owned histogram, identity, regression, or trust repairs.
- A usability study or outside demand to authorize the feature.

Remaining decisions have usable defaults:

- **Capture payload limit:** exact keys, reduction inputs, semantic configuration, and summary data first; set the practical cap from actual local workloads before M3 release, without claiming benchmark results now.
- **Identity adapter:** reuse a verified landed API; otherwise unique explicit typed keys plus strict revision matching.
- **Card shortcut:** defer until scope/value/format parity can be guaranteed.
- **Facet lasso:** global-coordinate first; facet-local extension later.
- **Missing prior lasso fixture:** obtain its twelve keyed coordinates before M5 truth-table execution.
- **Static export:** preserve notebook source; freezing values into a publication is separate work.

## Closing evidence and access status

**Files read:** all 33 source-packet files: five governance files; six intent/research files; the notebook component/parser/compiler/sheets/writer files and supplied tests; four MetricCard files; aggregates; CrossfilterWrapper; useGetLiveData; DataLayerProvider; FilterTypes; SavedDataStructure; saveDataUtils; the daily evaluator; notebook docs; and the earthquake notebook. The exact paths and symbols are enumerated in [report.md, repository sources](report.md#repository-sources).

**Checked:** static source contracts, primary-source mechanisms linked in the report, and independently computed synthetic fixture arithmetic. **Proposed/unrun:** new syntax, types, modules, source edits, all runtime behavior, screenshots, and application acceptance tests. No earthquake data payload, runnable checkout, participant study, or performance benchmark was available or invented.

**Downloads:** [report.md](report.md) and [implementation-plan.md](implementation-plan.md). The missing M5 coordinate fixture and the bounded choices above remain explicit; milestone one can start from this plan.

