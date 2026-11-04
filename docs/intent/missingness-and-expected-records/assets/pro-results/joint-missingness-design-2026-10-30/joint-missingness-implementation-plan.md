# Joint missingness — worker-ready implementation plan

Build a saved **Joint missingness** chart over effective values, with exact pattern selection, one explicit population, complete record traces, and notebook findings that retain their meaning after Keep and reopen. Ship that vertical slice first. Then add bounded group comparisons and chosen-input presence/finite-number checks using the same selector, trace, and persistence machinery. Keep the existing React/TypeScript architecture and pnpm workflow. No independent missing-data engine, general rules language, new visualization dependency, or unbuilt selection-refresh prerequisite is needed.

**Design baseline:** `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6` (`origin/main` snapshot supplied for October 30, 2026).  
**Status:** proposed implementation, not shipped code or acceptance evidence.  
**Decision report:** [joint-missingness-report.md](joint-missingness-report.md).  
**Recommendation IDs:** `JM-D01`–`JM-D18`, with dispositions in §11 below.

## 1. Contract to implement

### 1.1 Product boundary

- The chart answers which fields are missing together in **existing observations**, how groups differ, which observations meet a chosen input requirement, and which records establish the answers.
- M1 uses effective values and exact binary patterns. Raw input and known conversion/calculation explanations are visible in trace.
- M2 adds a descriptive group table and chosen-input checks. No missingness-mechanism inference, imputation, quality grade, expected-record generation, or automatic cleaning is included.
- A saved pattern is a predicate. Its members may change after data, conversion, or calculation changes. It is not a frozen list of records.
- Kept settings/text re-evaluate after reload. Survival of unkept exploratory selections through arbitrary `data`/`savedData` replacement or folder remount remains outside this first implementation.

This replaces the October 19 outside-demand gate while preserving its valid semantic distinctions. It does not reopen the October 21 value-accounting audit. `docs/research/DIRECTION.md` and the attached mission govern that decision.

### 1.2 Population contract

Define once and reuse:

- `S`: current provider input rows, or current query-output rows.
- `L`: `S` restricted by this chart’s `localFilters`.
- `B`: `L` after workspace and peer-chart selections, excluding this chart’s own selector.
- `Q`: `B` after this chart’s selector.

In notebooks, peer-chart selections are local and therefore do not enter `B`. Pattern shares always use `|B|`. Group shares use `|B_g|`. The existing notebook `population=eligible` means this pre-selection chart population; it does not claim analysis suitability.

Source facts: `CrossfilterWrapper.getAllData`, `getChartFilteredRowIds`, and `localSelections`; `chartPopulation.getPopulationTest`; `NotebookFindings.useFindingResults`. See pinned source references in §12.

### 1.3 Pattern and empty-state contract

For configured field set `F`, an exact pattern records the subset that is missing; **every other field in `F` is present**. Fields outside `F` are ignored. Multiple patterns are ORed as whole predicates.

| Serialized/semantic state | Required result |
|---|---|
| No selector | No outgoing filtering; selected finding equals pre-selection population. |
| `patterns: []` in a present selector | Active-empty; selected count 0. |
| `patterns: [[]]` | All chosen fields present. |
| Selected pattern with no current members | Retain selected meaning; count 0; share 0% if base is nonempty. |
| Empty valid base population | Count 0; percentage unavailable because denominator is 0. |
| Referenced field unavailable in schema | Retain blocked chart/selector; chart and dependent findings unavailable. |

Clear removes the selector. The UI does not create active-empty merely because the user toggles off the last selected pattern. Active-empty remains supported as a precise authored/serialized state.

### 1.4 Value contract

Use `valueParsing.isMissingValue` for patterns and `finiteNumber` for finite checks. Use effective `getColumnData` values, including calculated results.

- Null, undefined, absent properties, empty strings, and whitespace-only strings count as missing.
- Zero and false are present unless the analyst’s explicit conversion/null-token settings change them. False is not a numeric input under this parser.
- Unconverted invalid numeric text and nonfinite numbers/text are present but may be numerically ineligible.
- Explicit numeric conversion can turn a failed input into effective missingness. Count it once.
- Categorical blanks can stay literal category values while satisfying this missing predicate.
- Calculated outputs are classified as returned. A missing input is not automatically propagated through a successful calculation.
- Query-created missing values are missing in the current output frame. Preserve available query diagnostics; do not invent a raw-input cause.

The baseline conversion preview counts a different operation and cannot be reused as numeric eligibility or as a joint-pattern denominator.

## 2. Architecture and saved state

### 2.1 Add one normal chart folder

Proposed new files under `packages/explorEDA/src/components/charts/JointMissingness/`:

| File | Responsibility |
|---|---|
| `definition.ts` | Register defaults, settings validation, renderers, and semantic predicate. |
| `missingnessCore.ts` | Canonical field sets/patterns, schema availability, signature and input predicates. |
| `missingnessPlan.ts` | Counts, one population, sorting, group totals, and exact on-demand record membership. |
| `JointMissingness.tsx` | Existing chart shell, pattern rows, selection, readout, and trace targets. |
| `JointMissingnessSettings.tsx` | Shared field picker and small settings sections; no persistent extra sidebar. |
| `MissingnessTraceBody.tsx` | Paged multi-field raw/effective record view, shared by trace and Chart data. |

Keep state in existing settings and filters. Do not add a parallel cohort store, a persisted mask cache, or a second notebook selection model. The pure core must not import the provider or DOM.

### 2.2 Settings and selectors

Conceptual types; integrate them with the repository’s current unions and exported type conventions:

```ts
interface JointMissingnessSettings extends BaseChartSettings {
  type: "joint-missingness";
  fields: string[];
  patternSort: "frequency" | "rare-first" | "missing-count";
  groupField?: string; // M2, may be outside diagnostic fields.
  eligibility?: {     // M2 configuration; not itself a selection.
    fields: string[];
    requirement: "present" | "finite";
  };
}

interface MissingnessPatternFilter {
  type: "missingness-pattern";
  field: "__ID";
  patterns: string[][];
}

interface MissingnessEligibilityFilter { // M2
  type: "missingness-eligibility";
  field: "__ID";
  match: "eligible" | "ineligible";
}
```

`__ID` is the existing input coordinate for the row predicate; neither selector stores row positions. `fields` gives display order. Sort/deduplicate each missing-field subset by canonical field key, then sort/deduplicate the outer pattern list deterministically. Use structural arrays/JSON tuple keys, not delimiter concatenation.

For the inherited `BaseChartSettings.field`, mirror the first configured diagnostic field as compatibility metadata; never use it as the missingness universe. A setup preview can collect two fields before a new configured chart is committed. A blocked/unconfigured view without a selector must not narrow other charts.

A configured chart has 2–12 unique diagnostic fields. Each pattern is a subset of those fields. Allow at most 4,096 unique selected patterns. M2 required fields form a nonempty subset of the diagnostic fields. The two selector variants are mutually exclusive; reject multiple semantic selectors rather than assigning undocumented AND/OR meaning.

### 2.3 Reuse the chart predicate seam

`ChartDefinition.getFilterFunction(settings, fieldGetter)` is the existing seam. Add an optional third context with `hasField(field)` and `sourceRowCount`; forward it through registry wrapping and Crossfilter. Existing charts need not use it. The row count is already known from the current source frame and permits the computation preflight before column access.

The new predicate does these steps:

1. Determine whether a semantic selector exists.
2. If none exists, return true without applying local cohort restrictions globally.
3. Validate availability against current source/calculation schema and the source-row/field budget before resolving getters or computing signatures.
4. If an active selector is blocked, return false for every row while exposing the explicit problem separately.
5. Resolve each needed column and the ordinary local-population test once.
6. Match `localPopulation(id) && selectedSemanticPredicate(id)`.

Resolve getters before returning the per-row function. Repeated getter lookup inside the row test violates an explicit repository performance rule.

### 2.4 Do not widen scalar filtering

Keep the new filters valid **only** in this chart’s `filters` array. Reject them in:

- Workspace filters.
- Rows settings filters.
- `localFilters`.
- Other chart types.
- Finding-local `where` filters.

Change `saveDataUtils.isBaseChart` to accept an owner-aware selection validator, or an equivalent small seam, while retaining ordinary scalar validation elsewhere. Its current common validation runs before `isChart` dispatch; adding a late chart case alone is insufficient. Keep `applyFilter` scalar. Update its type handling only as necessary to reject unsupported new variants safely and satisfy exhaustive typing.

Extend `ActiveFilterStatus.formatFilterLabel` and `isActiveFilter` explicitly. A nonempty selector with zero matches, and an explicit outer-empty selector, must both remain visible as active. Existing Clear and filter-length consumers can continue using the `filters` array.

### 2.5 Schema, unavailable findings, and query provenance

Add one small shared `missingnessProblem(settings, context)` helper, where context supplies `hasField` and `sourceRowCount`. Field existence comes from observed source keys, declared `fieldNames`, all keys of `fieldTypes` including `"unknown"`, and calculated result names. Requested chart fields are not source schema evidence. Check the source-row/field budget in the same preflight before any signature construction or selection-column access.

Add an optional `FindingContext.chartProblem(chartId)` and a `chart-unavailable` result reason with detail text. Check it before reducers run. This preserves the difference between a valid zero count and a broken analysis. Include status in the finding revision so old record popovers close.

An over-budget analysis uses this same status path: selected and `population=eligible` findings are unavailable, dependent shares propagate that status, and trace does not assert an empty or complete result for work not evaluated. Retain an active selector and fail it closed. With no selector, contribute no outgoing restriction even though this chart and its findings remain unavailable. Lowering the source query size below the guard with the same diagnostic field universe resumes the saved meaning. Reducing the chosen field set follows the normal field-set edit policy, including clearing an exact-pattern selector; it is not predicate-preserving recovery. There is no sampled fallback.

For folder notebooks, `readNotebookText` currently discards query fields and result-row provenance when extracting `.rows.map(row => row.data)`. Retain both as read-only metadata:

- Pass field keys/types through `NotebookReadResult`, `ProjectWorkspace`, `ExplorEdaNotebook`, compiler/writeback contexts, and the provider.
- Retain `AnalysisResultRow` references beside the notebook’s row data. Reuse the existing analysis trace context where possible, with an optional host navigation callback. Do not add a second lineage engine.
- A trace must say **current input/output rows** when original-source provenance is unavailable. Never label flattened query output as original raw source records.
- Keep output-row count separate from deduplicated source-reference count. A single grouped output with two contributors is one pattern record.

The existing pure `evaluateNotebookFindings(settings, rows)` builds raw columns. Add a narrow optional prepared-column/schema context for new missingness callers; route the relevant demo/checker through the same effective columns or explicitly report unavailable. Do not silently classify raw values when a saved field conversion/calculation is required. Live notebook evaluation already supplies effective columns.

## 3. Milestone 1 — Exact patterns, exact records, and kept notebooks

**Independently useful outcome:** an analyst can choose fields, select exact patterns, inspect every matching record, save the analysis, keep its selection in notebook text, and reopen the notebook with current findings. Supports recommendations JM-D01–D09, D11–D12, and the Avoid boundaries.

**Main risk:** chart counts are right but the saved notebook uses a different, lost, or silently broadened selector. Treat membership and persistence as one acceptance boundary.

### M1.1 First proof a worker can start now

Implement the pure core, chart definition predicate, and a focused provider/notebook test before styling the full view. Use the supplied 12-record fixture:

1. Apply the existing x numeric and note null-token settings.
2. Configure six fields and exact `{x,y}` OR `{note}`.
3. Assert selected IDs r05/r06/r07/r12, base 12, selected 4.
4. In a local-selection notebook provider, assert count 4, eligible scope count 12, share 1/3; select A in a sibling chart and assert no change.
5. Serialize the semantic selector, restore against reversed rows, and assert the same business IDs.
6. Separately select x-only and change r08.x to 0; assert r08 leaves that predicate.

No general keyed-record selection, raw-pattern API, worker service, or generic rule syntax is required for this proof. A pure arithmetic helper alone is not the completion criterion; the mounted provider/finding test proves the actual selection route.

### M1.2 Implement the chart and record route

Affected existing package files/modules:

- `types/ChartTypes.ts`: chart union, settings and predicate context.
- `types/FilterTypes.ts`: dedicated filter variant.
- `charts/registry.ts`, `charts/registerAllCharts.ts`: forwarding and registration.
- `providers/DataLayerProvider.tsx`: schema context, current getter wiring, atomic field-set edits, refresh integration.
- `hooks/CrossfilterWrapper.ts`: forward context and use existing owner-excluded items.
- `lib/chartPopulation.ts`: reuse ordinary local-population helper; do not turn it into a missingness rules engine.
- `components/FieldList/FieldPicker.tsx`: explicit scoped profiles and selection maximum; collect a valid two-field configuration.
- `components/charts/chartAccessibility.ts`: referenced fields and summary/deletion guards.
- `components/ActiveFilterStatus.tsx`: semantic labels and active-empty handling.
- `components/charts/trace/{traceTypes,traceRows,ChartTracePanel}.tsx/ts`: correct actual extensions for the new trace union/body and full runtime ID list.
- `components/ChartDataPreview.tsx`: dedicated missingness branch using exact selected IDs and the shared paged table.
- Package exports/docs-kit entries as required by the existing registry/type export route.

Render exact missing sets with all chosen fields represented, filled/hollow dots, frequency bars, count/share, and an all-present reading. Keep the field names and stage visible. Use theme tokens and existing keyboard/Alt-trace behavior; do not introduce an Inspect button or native tooltip.

Use owner-excluded chart items for `B`, not `getFilteredRowIds` after this chart’s global selection and not independent field profiles. When rendering a pattern trace, derive its complete current `B` membership; selected-union trace uses the selector once and deduplicates by row ID. Chart data and finding record links must agree.

For raw/effective cells, reuse the existing provider raw rows, converters, calculation traces, and trace detail components. Generate details lazily for 50 records per page. Do not materialize a full `N × K` table of explanation objects.

### M1.3 JSON and Dashboard text

Affected files:

- `utils/saveDataUtils.ts`: owner-aware validators, new chart case, special filter structure and limits.
- `types/SavedDataStructure.ts` and the saved chart type route: extend existing types; do not save derived results.
- `lib/dsl/settingKeys.ts`: exhaustive chart settings map and deliberate persistence coverage.
- `lib/dsl/compile.ts`: chart-only selector lowering and strict failure behavior.
- `lib/dsl/export.ts`: lift semantic filter into readable native path syntax.
- Existing parse/path helpers remain the parser; no nested-JSON parser is added.

Chosen M1 text contract:

```text
field x as=numeric
field note as=categorical nullTokens[]=NA
chart joint-missingness @gaps fields[]=x,y,z,note,flag,w {
  patterns[]=
  patterns.0[]=x,y
  patterns.1[]=note
}
```

`patterns` is a compiler/exporter alias, not another saved selection property. All inner members resolve as field references, including aliases and quoted names. Use the native array/path machinery; `patterns=[[...]]` is not valid baseline syntax.

Required distinctions:

- Absence: no selector.
- `patterns[]=` alone: active-empty.
- `patterns.0[]=`: all-present.
- `patterns=unset`: remove selector.
- Multiple indexed lists: exact OR.
- Duplicate equivalent entries: canonicalized without changing meaning.
- Sparse indices, nonlists, outside-universe fields, invalid discriminants, oversized fields/patterns, or conflicting selector forms: explicit failure, never fallback to default empty filters.

**Retain unavailable intent on source-schema change.** A syntactically valid new-chart declaration whose canonical field key is absent from the current source retains its named chart and selector as blocked intent. Preserve nominal alias-to-field bindings from declarations where resolvable, then check availability separately. An unresolved alias or malformed structure is a text error, not an invented field binding.

The baseline general compiler may reject unknown fields or skip a bad chart. Do not let that behavior delete a kept missingness restriction and widen the workspace. Make this a targeted new-chart rule, including generic `filters.*` paths. On malformed input, preserve the previous valid block when available; on a fresh invalid document, report a failed analysis/block instead of rendering it as an unselected successful chart. When the missing field returns, the original retained predicate can evaluate again.

### M1.4 Notebook Keep, Reset, and Undo Keep

Affected package files:

- `components/notebook/ExplorEdaNotebook.tsx`: block-level action, latest compiled/authored state, naming, writeback bookkeeping.
- `lib/notebook/writeBack.ts`: explicit semantic-selector writeback and atomic field-set reconciliation.
- `components/notebook/NotebookFindings.tsx`, `lib/notebook/findings.ts`: same predicate, unavailable status, exact records, prepared-column adapter where needed.
- `lib/notebook/readNotebook.ts`, `compileNotebook.ts`, and DSL compile options: source schema/provenance forwarding.

Affected host files:

- `apps/app/src/ProjectWorkspace.tsx`: pass current notebook schema/provenance and reuse `onTextChange`/saver path.
- Existing `apps/app/src/saver.ts`, `App.tsx`, and folder-reader tests: add lifecycle proofs; do not replace the saver.

Use a small block/context callback analogous to the existing Explore callback. Keep resolves the latest authored chart and substitutes only the live semantic selection. M1 can then call `writeBackChart` and its export → splice/rewrite → recompile verification. Assign an unnamed chart a collision-free stable authored name in the same source edit before defining findings. Existing `writeBackChart` preserves names; new-name insertion is an explicit small addition, not assumed current behavior.

Ordinary clicks continue not to rewrite notebook text. Title/sort/display-order edits preserve the **authored** selector, not an unkept live preview. Diagnostic field-set changes clear the exact selector in both runtime and authored text in one action; field-order-only changes preserve it.

Keep returns “Kept in notebook text” after verified source editing. Folder save status remains owned by `FolderSaver`/`SaveStatus`; success is not implied by the synchronous `onTextChange` callback. Failure preserves in-memory text and uses the existing retry/flush route.

Reset to kept restores the current authored selector into live chart settings. If the notebook has no kept selector, Reset clears the live restriction.

Undo Keep stores a small in-memory inverse command: named chart, canonical field set, before/after authored selectors. It verifies that the current authored selector still equals the after state, then changes only the selector through `writeBackChart`. Preserve unrelated prose and comments. Refuse a stale inverse when its chart/basis/selector changed incompatibly. It emits one text change and leaves the live preview as-is, visibly different if necessary. Do not add a second general history system or claim DataLayerProvider owns Undo.

Exercise `ExplorEdaNotebook`’s `written`, `applied`, `savedData`, and parent text-echo path. Pure writeback equality alone does not prove that the mounted notebook retains its live selection or named identity after the host accepts the new text.

### M1.5 Dashboard-to-notebook continuation

Add **Copy notebook section** to an appropriate existing chart/analysis export action. It emits the named chart, required field settings/calculation dependency closure, scope, existing finding definitions, and prose record links.

Generate selection-neutral live prose, such as “The current selection contains…,” with the current predicate visible on the chart. Do not hardcode the number of selected patterns, a finite/present requirement, an admitted/excluded label, or specific required fields into a sentence that follows changing counts. Test the generated prose after a different pattern is toggled and after a readiness rule/side changes.

M1 section export is supported when:

- There are no active peer-chart selections.
- Workspace and chart-local restrictions are ordinary scalar predicates that round-trip exactly.
- Field preparation/calculation dependencies are representable in the notebook and names do not collide.
- The same source/query binding is available to the recipient notebook.

Copy ordinary workspace predicates into this chart’s local scope so the section’s denominator is reproducible. Do not copy only the selected member positions. Do not present dashboard text export alone as a full notebook export; the baseline deliberately omits finding declarations from dashboard export.

For unsupported peer predicates or typed-value collisions, show the precise scope-transfer problem. The current analysis remains intact. This is an implementation boundary, not a request for additional user approval.

### M1.6 Documentation and runnable examples, shipped together

Add:

- `apps/demo/src/docs/pages/joint-missingness.mdx`: field selection, exact semantics, denominator, all-present, records, effective values, Keep and limitations.
- `fields.mdx`: an entry/link from marginal field summaries.
- `dashboard-text.mdx`: the new chart and `patterns` syntax, including empty states.
- `notebooks.mdx`: local selection, Keep/Reset/Undo Keep, source-vs-live distinction, finding links, and folder acknowledgment.
- `project-folders.mdx` and the relevant package/API reference: kept predicate reopen and known-schema empty results.
- Settings descriptions, docs catalogue/glance/related links, and chart target coverage required by the docs gate.

Register a runnable example **`joint-missingness`** in `examples.ts`, with an actual fixture data file, configured chart, adjacent record view, and editable notebook. Add **`joint-missingness-equal-marginals`** as a tab/example using the second fixture. Update `coverage.ts` with `chart:joint-missingness` and specific persistence/trace coverage. Add scripted live-example steps in the existing docs live-example registry. The examples must run their behavior; a prose snippet is insufficient.

Coverage may be marked shown initially. Mark it reviewed only after the required browser evidence exists. Do not list research arithmetic as browser acceptance.

### M1.7 Acceptance tests

Use the exact fixtures in §6–§7. Proposed new test names below are implementation destinations, not existing files or tests already run.

**Core and validation:** `JointMissingness/missingnessCore.test.ts`, `missingnessPlan.test.ts`, and save/DSL coverage tests.

- Counts and all exact IDs match the fixture tables.
- Sum of pattern counts equals `|B|`; every row belongs to exactly one pattern.
- `{x,y} OR {note}` produces four records, not the nine-record Cartesian result.
- `{x} OR {y}` excludes both-missing and all-present rows.
- Blank text, absent property, undefined, valid zero/false, authored tokens, invalid conversion, and unconverted nonfinite values match §1.4.
- `patterns: []`, `[[]]`, a zero-match pattern, and absent selector remain distinct.
- No new filter variant is accepted at a foreign owner.
- Reordering fields preserves predicate membership and serialized canonical pattern subsets.
- Empty source with declared schema is count 0; unknown schema/field is unavailable; a declared all-absent column is ordinary missingness.

**Provider and finding integration:** proposed `src/test/providers/jointMissingness.test.tsx` and notebook integration cases.

- Dashboard peer `group=A`: `B=8`; selected x/y-or-note = 3; own pattern denominator remains 8 after selection.
- Chart-local `group=A`, no own selector: this chart has 8 rows while the otherwise unfiltered workspace has 12.
- Same local cohort with active union: outgoing selected IDs r05/r06/r07; no B-group leakage.
- Notebook sibling selecting A: missingness `B=12`, selected union 4; its finding IDs remain r05/r06/r07/r12.
- Workspace `group=B` plus local `group=A`: valid empty base; count 0, no share. Clearing only this chart’s selector must not clear the workspace restriction.
- Value/conversion/calculation refresh re-evaluates current predicates; stale trace and finding popovers close.
- Use a prepared calculated column vector `[0, false, undefined]` as a core test: present, present, missing; finite check admits only 0. Add a mounted real-manager fixture from its supported expression tests so the calculation column route is exercised without inventing parser semantics.
- Pure/headless effective-value adapter agrees with live results. Without needed preparation, the new chart’s findings are unavailable, not raw-value counts.
- Over-budget preflight executes before any column getter/signature evaluation. Both selected and eligible findings, their share, and trace report unavailable; an active selector fails closed, while no selector leaves other charts unrestricted. Narrow the source row count below the guard with the same field universe and recover the retained predicate. Reducing chosen fields instead follows the normal selector-clearing policy. Test the preflight with a spy getter so an asserted unavailable state cannot conceal expensive evaluation.

**Keep and reopen:** proposed `lib/notebook/jointMissingness.test.tsx`, writeback tests, and `apps/app/src/jointMissingnessNotebook.test.tsx`.

- Clicks change live findings and `onStateChange` once, while source text is unchanged.
- Keep changes only the owning declaration/necessary naming, calls `onTextChange` once, and preserves comments, aliases, unrelated blocks, and current live state after parent text echo.
- Recompile/reopen restores exact selector, count 4, denominator 12, share 1/3, and matching IDs.
- Title changes do not accidentally keep a different unkept selector.
- Field-order change preserves kept selector; field-set change clears it in text and runtime atomically.
- Reset and guarded Undo Keep do exactly the operations specified above; unrelated prose edits survive the inverse.
- Invalid/frozen block refuses Keep while preserving the live selection and clearly showing that text was not changed.
- Keep x-only, remove field x from source schema, then save/reopen: retain named chart and predicate as blocked; count and share unavailable; active selector fails closed. Restore x: resume the original predicate.
- Wait for acknowledged folder save, read the folder again, and verify the actual saved `.eda.md`. Simulate write failure, verify in-memory retention and reload refusal after failed flush, then retry successfully.
- Reopen kept x-only over reversed rows and after r08 correction; verify semantic memberships, not old numeric positions.

**Trace/provenance and UI:** component tests plus real browser input.

- Pattern, selected-union, finding, and Chart data paths expose the same exact set.
- With 101 matching records, first trace page shows 50, next 50, final 1; total remains 101 and no selection is truncated to 50/100.
- A synthetic current output row `out1` with missing x, present y, and two source contributors counts as one pattern record; trace shows two distinct source references separately.
- Long field names, all-present/all-missing fields, empty base, zero-match selected pattern, missing schema, and 12-field horizontal overflow are readable.
- Mouse, keyboard selection, Alt-click/Alt-Enter, Clear, settings, Keep, and Reset behave at 1280, 783, and 390 px under the repo’s responsive conventions.
- Exported image matches the resting chart and includes the correct stage, denominator, legend, and omission notice; editor-only controls are omitted.

M1 exits only after this complete saved-analysis slice, its docs, and its examples work together. Do not wait for M2 to fix a dropped selector or a wrong notebook denominator.

## 4. Milestone 2 — Group consequences and chosen-input checks

**Independently useful outcome:** an analyst can compare the same selected patterns across unequal groups and keep an admitted/excluded cohort for explicitly chosen inputs, with live notebook counts/shares and exact records. Supports JM-D09–D12; builds on M1 without another infrastructure dependency.

**Main risk:** counts remain arithmetically correct while the UI silently changes the denominator, admits a Cartesian product of group-pattern choices, or calls a presence check general analytical suitability.

### M2.1 Extend the existing plan and settings

Reuse the same new chart folder. Add optional `groupField` and `eligibility` configuration, `MissingnessEligibilityFilter`, the native settings descriptions, and the specific text alias below. Extend existing trace payloads, not a second inspection subsystem.

Group comparison:

- One effective group field. It may be metadata outside the diagnostic field set.
- Preserve typed categories via `categoryKey`; collapse diagnostic-missing group values into an explicit missing bucket.
- At most eight named display groups plus one labeled remainder. Every record contributes to exactly one group bucket; show the remainder’s constituent categories in trace.
- Compare the current selected predicate in every group using `selected / group total` and percentage. A two-group gap is descriptive percentage points from unrounded values.
- Group counts remain visible for zero selected records. Zero-size groups explicitly requested by the user show no percentage rather than 0%.
- Group table values are secondary readings with trace. Do not implement arbitrary multiselection of group-pattern cells. An explicit Use as cohort action replaces the group restriction in this chart’s `localFilters`, while preserving the current semantic selector.
- The remainder is not a literal value and has no default cohort action. Choose its actual categories explicitly if needed.

The combined missing-group predicate already has a compatible existing form: `ValueFilter.values=[null]`, authored as unquoted `where.group=null`. The baseline `applyFilter` includes blanks in that case. Avoid a redundant new group filter type.

For numeric/string category-label collisions, verify generated `where.` text by recompilation and typed membership. Current `buildFilter` uses a string-keyed lookup, so do not assume quoting alone disambiguates every case. Disable the affected text/cohort export if it would change membership; retain exact group counts, JSON filters, and trace. This is a bounded limitation, not a parser rewrite.

### M2.2 Chosen-input semantics

The required set `R` is a nonempty subset of `F`:

- `present`: every effective value passes `!isMissingValue`.
- `finite`: every effective value passes `finiteNumber(...) !== undefined`.
- `eligible` selector: `B ∩ rule`.
- `ineligible` selector: `B \ rule`, never the complement of the full source.

Use user-facing labels **Have values** and **Finite numbers**. Clicking an admitted/excluded count replaces an active pattern selector in one store update and status change. Clearing removes the selector while preserving the configured requirement. There is no hidden intersection of two selector kinds.

The eligibility filter reads its owning chart’s current requirement. Deliberately editing that requirement re-evaluates the selected admitted/excluded set and is one ordinary settings edit. Missing required field definitions make the analysis unavailable, not merely ineligible.

Changing the diagnostic field set has this deterministic policy:

1. Clear any exact-pattern selector because its exact universe changed.
2. Retain an eligibility rule and selector only if its nonempty required set is still a subset of the new diagnostic fields.
3. Otherwise clear the rule and eligibility selector together.
4. Apply the same changes to authored notebook text in the same edit.
5. A pure reordering of the field set preserves all these meanings.

Display excluded records in two disjoint row buckets for a finite check: required missingness; or all required values present with at least one numeric exclusion. A row with several failing fields occurs once in the total and may list multiple field reasons.

### M2.3 Persistence and notebook continuation

Chosen M2 text syntax:

```text
chart joint-missingness @ready fields[]=x,y,z,note,flag,w {
  groupField=group
  eligibility.fields[]=x,y,w
  eligibility.requirement=finite
  inputSelection=eligible
}

finding @ready-count count chart=@ready
finding @ready-scope count chart=@ready population=eligible
finding @ready-share share ready-count ready-scope digits=1
```

`inputSelection` is a narrow alias into `MissingnessEligibilityFilter`, not a second stored property. Valid values are `eligible`, `ineligible`, and `unset`. Active `patterns` plus active `inputSelection` is a declaration error. Support equivalent generic `filters.*` paths only with the same owner-aware strict validation; the exporter uses the readable alias.

Normal requirement settings have ordinary path coverage. Extend Keep so that the live eligibility selector is paired with the exact rule it used. If that rule has not yet reached authored text, include only the required rule fields/requirement in the same verified Keep edit, not unrelated transient settings. Guard Undo Keep by the rule as well as chart identity, field set, and after-selector; invert any rule change included by that command. An old Undo token must not rebind a selector to a new finite/present rule silently.

Existing per-group count/share findings remain sufficient:

```text
finding @part-a count chart=@gaps where.group=A
finding @whole-a count chart=@gaps population=eligible where.group=A
finding @share-a share part-a whole-a digits=1
finding @part-b count chart=@gaps where.group=B
finding @whole-b count chart=@gaps population=eligible where.group=B
finding @share-b share part-b whole-b digits=1
```

Do not use `difference share-a share-b` as though current comparison findings accept share operands. Display the two live rates; the chart can show its own bounded rate gap. A named percentage-point finding remains Explore, outside this milestone.

### M2.4 Files, docs, and runnable example

Extend the M1 core/plan/settings/renderer/trace files plus:

- `FilterTypes.ts`, owner-aware save validators, `ActiveFilterStatus.tsx`.
- `dsl/settingKeys.ts`, `compile.ts`, `export.ts` for eligibility settings and alias.
- Notebook Keep/writeback/inverse-command tests for the rule guard.
- `categories.ts` and `applyFilter.ts` are reused, not semantically rewritten.

In the same milestone:

- Extend `joint-missingness.mdx` with group denominators, remainder handling, presence versus finite checks, exclusion records, and causal limits.
- Extend `notebooks.mdx` and `dashboard-text.mdx` with eligibility selection and live per-group findings.
- Register a runnable **`joint-missingness-groups`** example/tab using the twelve-record fixture. Include controls for x/y/w requirements, group A/B, conversion of w, Keep/reopen, and an exact-record trace.
- Add live-example steps asserting the visible counts and records; update coverage/features and reference descriptions.
- Include an example of missing-group handling and a typed-category collision guard. Describe the limitation in the owning intent/developer guidance; product copy should identify the concrete unavailable action rather than narrate internal implementation gaps.

### M2.5 Exact acceptance values

- Selected exact x/y OR note: A = r05/r06/r07, 3/8 = 37.5%; B = r12, 1/4 = 25%; displayed A−B = 12.5 percentage points.
- Exact x/y/z: r09; 1/12 = 8⅓% overall; A 0/8; B 1/4 = 25%.
- Effective x marginal: A 5/8 = 62.5%, B 1/4 = 25%, pooled 6/12 = 50%. Do not display the unweighted 43.75% as the pooled rate.
- x/y/w Have values: r01/r07/r10/r12, 4/12; A 2/8, B 2/4.
- x/y/w Finite numbers: r01/r07/r10, 3/12; A 2/8, B 1/4.
- Finite exclusions: r02/r03/r04/r05/r06/r08/r09/r11/r12, 9/12. Required missingness = first eight; present numeric exclusion = r12 alone.
- Under local group A, finite admitted = r01/r07, 2/8; excluded = r02/r03/r04/r05/r06/r08, 6/8. No B records enter either set.
- Change r08.x to 0: finite admitted adds r08, becoming four overall and three in A.
- Explicitly convert w to numeric: exact note-only loses r12, but finite x/y/w remains r01/r07/r10. The original x/y-or-note selection becomes r05/r06/r07.
- Require flag as finite: false and true are both numerically ineligible under the baseline parser. Requiring flag merely present admits its nonmissing Booleans. Do not silently map them to 0/1.
- Clear readiness selection restores all `B` for selected findings; the configured rule remains visible.
- Change/restore/save/reopen every eligibility selector and rule, including no matches and empty scope, with matching finding IDs.
- Reject invalid/empty required sets, outside-`F` fields, foreign filter owners, and simultaneous selector variants.

**Bounded group fixture:** make ten one-record categories g01–g10. Display g01–g08 plus Other = g09/g10. With a selector matching g02/g09/g10, visible named totals = 8, remainder total = 2; selected named = 1, remainder selected = 2; all totals reconcile to 10 and selected 3. Paging or hiding the remainder must not change the selected set.

**Missing/typed group fixture:** group values `null`, absent, `undefined`, `""`, `"  "`, numeric `0`, string `"0"`, `false`, and literal `"(missing)"` produce a diagnostic missing bucket of five plus four distinct typed/literal categories. `where.group=null` matches exactly the first five. JSON selection of numeric 0 must not select string 0. A text export that cannot preserve that last distinction must fail its exactness check visibly.

## 5. Shared rendering and computational bounds

These are proposed engineering limits, not measured performance claims:

- **Configured fields:** maximum 12. No implicit removal of fields to make a chart fit.
- **Observed patterns:** maximum `min(N, 4096)`. Do not enumerate the full powerset unnecessarily.
- **Selected patterns:** at most 4,096 canonical unique patterns. Retained zero-count patterns remain reachable in a paged selected-pattern view.
- **Pattern rendering:** 20 ordinary rows per page plus the all-present reading; each row at most 12 field glyphs. A textual label remains available.
- **Trace rendering:** 50 records per page. Complete membership and counts do not depend on the page limit.
- **Group rendering:** eight named groups plus remainder, with all counts exact.
- **Rebuild guard:** initially 12 million source-row/field evaluations. Preflight `sourceRowCount × fields.length` before column/signature work. Above the guard, propagate the shared chart-unavailable state through predicates, selected/eligible findings, shares, and trace as specified in §2.5; show a concrete narrowing action and never report a partial exact analysis.
- **Cache:** one runtime `Uint16Array` mask per row for a stable effective-value revision and canonical field universe; at most 4,096 counts. Do not persist it or duplicate full membership arrays per pattern/group.
- **Cost:** build `O(NK)`; recount `O(|B|)` after source IDs are available; ordering `O(P log P)`; on-demand full membership scan `O(|B|)`; rendered cells `O(20K)` or `O(50K)`. Account separately for existing Crossfilter/source-column costs.
- **Invalidation:** data/effective-value/calculation revision or field universe invalidates masks; peer/workspace scope changes recount; own selection only changes selected state; field display reorder can reuse canonical masks.
- **Measurement:** profile 10k/100k/1m rows at 6/12 fields, both high repetition and near-maximal pattern diversity. Record cold/warm counts, selection, trace opening, and memory. State the device/browser and actual numbers.

Suggested implementation target for the owner’s agreed desktop is a warm selection/recount interaction under 100 ms at 100k rows, with no dropped input. This is an initial target to measure, not a promise. If measurements fail, use bounded chunking or existing worker infrastructure only after identifying the bottleneck. Sampling cannot replace exactness.

Count bars use a linear scale based on the chart source cohort before peer/workspace filters. This prevents those filters from changing the axis interpretation. Sorting can change with explicit current-frequency ordering; keys and selection do not.

## 6. Exact fixture A — twelve records, six fields

Use [fixture-data.json](fixture-data.json), not a CSV that accidentally coerces `false`, absent properties, or `"Infinity"`. It is a research data specification; the worker should integrate its rows into the actual example data loader. Add native undefined/NaN/Infinity cases through a TypeScript fixture builder or the existing saved-analysis special-value format.

Required preparation:

```ts
const fields = ["x", "y", "z", "note", "flag", "w"];
const fieldSettings = {
  x: { type: "numeric" },
  note: { type: "categorical", nullTokens: ["NA"] },
};
// w remains unconverted, even when its inferred type is numeric.
```

Raw row values, tuple order x/y/z/note/flag/w:

| ID / group | Raw tuple | Effective mask |
|---|---|---|
| r01 / A | `[0,10,1,"ok",false,5]` | `000000` |
| r02 / A | `[null,20,2,"ok",true,6]` | `100000` |
| r03 / A | `[null,30,3,"ok",false,7]` | `100000` |
| r04 / A | `[40,null,4,"ok",true,8]` | `010000` |
| r05 / A | `[null,null,5,"ok",true,9]` | `110000` |
| r06 / A | `[null,null,6,"ok",true,10]` | `110000` |
| r07 / A | `[70,70,7,"  ",true,11]` | `000100` |
| r08 / A | `["bad",80,8,"ok",true,12]` | `100000` |
| r09 / B | `[null,null,null,"ok",false,13]` | `111000` |
| r10 / B | `[100,100,10,"NA",null,14]` | `000110` |
| r11 / B | `[110,110,11,"ok",true,absent]` | `000001` |
| r12 / B | `[120,120,12,"",true,"Infinity"]` | `000100` |

Mask bit 1 means missing. Masks are explanatory test output, not the saved selector representation.

| Exact effective pattern | IDs | Count / 12 |
|---|---|---|
| Complete | r01 | 1; 8⅓% |
| x | r02, r03, r08 | 3; 25% |
| y | r04 | 1; 8⅓% |
| x/y | r05, r06 | 2; 16⅔% |
| note | r07, r12 | 2; 16⅔% |
| x/y/z | r09 | 1; 8⅓% |
| note/flag | r10 | 1; 8⅓% |
| w | r11 | 1; 8⅓% |

Marginal effective missing IDs:

- x: r02/r03/r05/r06/r08/r09 — 6/12 = 50%.
- y: r04/r05/r06/r09 — 4/12 = 33⅓%.
- z: r09 — 1/12 = 8⅓%.
- note: r07/r10/r12 — 3/12 = 25%.
- flag: r10 — 1/12 = 8⅓%.
- w: r11 — 1/12 = 8⅓%.

Raw patterns differ only at r08 and r10: raw complete = r01/r08; raw x-only = r02/r03; raw flag-only = r10. All other raw pattern memberships equal the corresponding effective memberships. Raw missing-cell count is 14; effective missing-cell count is 16. Those are cell counts, not record counts.

Conversion previews from baseline helpers:

| Field | Valid / missing / failed | Diagnostic consequence |
|---|---|---|
| x, explicit numeric | 6 / 5 / 1 | Effective x missing = 6; failure already included. |
| note, categorical plus NA | 11 / 1 / 0 | Effective note missing = 3 because blank text counts. |
| w, no conversion | 11 / 1 / 0 | w is present in 11 records but finite in 10. |

### Scope and selected-membership ledger

| Scenario | Denominator | Selected IDs / value |
|---|---:|---|
| Exact x/y | 12 | r05/r06; 2/12 |
| Inclusive x/y, comparison only | 12 | r05/r06/r09; 3/12 |
| Exact x/y OR note | 12 | r05/r06/r07/r12; 4/12 |
| Same selector with group A as base | 8 | r05/r06/r07; 3/8 |
| Same selector with group B as base | 4 | r12; 1/4 |
| Exact x OR y | 12 | r02/r03/r04/r08; 4/12 |
| All-present | 12 | r01; 1/12 |
| Active-empty | 12 | None; count 0, share 0% |
| Selected all-six-missing pattern | 12 | None; retained semantic selector, count 0 |
| No selector | 12 | All twelve; selected finding 12 |
| Valid empty base | 0 | Count 0; share unavailable |

### Refresh ledger

| Operation | Expected semantic result | Wrong result to detect |
|---|---|---|
| Correct r08.x to 0 while x-only selected | r02/r03; 2/12 | Retaining r08 because membership was frozen. |
| Reverse source order, original x-only selected | r02/r03/r08 at new positions 10/9/4 | Original positions 1/2/7 now point to r11/r10/r05. |
| Append r13 with x null, all other chosen fields present | x-only r02/r03/r08/r13; 4/13 | Ignoring new matching records. |
| Reorder diagnostic fields | Same selected IDs | Reinterpreting persisted bit positions. |
| Convert w to numeric while x/y OR note selected | r05/r06/r07; 3/12 | Retaining r12 even though exact note now includes w missing. |
| Remove referenced x from schema | Retained blocked selector; findings unavailable | Treating every row as ordinary missing x, or clearing selector. |

Adding r13 changes denominators: A becomes 9, B remains 4, full source becomes 13. Its x-only share is 4/13 overall and 4/9 in A. Do not retain the old denominator 12.

## 7. Exact fixture B — equal marginals, unequal usable membership

Every present value is 1; diagnostic fields x/y/z.

| IDs | Missing fields | Group |
|---|---|---|
| s1 | x | Spread |
| s2 | y | Spread |
| s3 | z | Spread |
| s4 | None | Spread |
| c1 | x, y, z | Cluster |
| c2, c3, c4 | None | Cluster |

Both groups have four records and each field is missing once: 1/4 = 25%. Both also have three missing cells out of twelve.

| Reading | Spread | Cluster |
|---|---|---|
| Complete x/y/z | s4; 1/4 = 25% | c2/c3/c4; 3/4 = 75% |
| Any chosen field missing | s1/s2/s3; 3/4 = 75% | c1; 1/4 = 25% |
| Complete x/y | s3/s4; 2/4 = 50% | c2/c3/c4; 3/4 = 75% |
| Exact x/y missing, z present | None; 0 | None; 0 |
| Inclusive x/y missing | None; 0 | c1; 1/4 = 25% |

Use this fixture in the runnable example, not merely a documentation illustration. It proves the reason for adding joint analysis beyond marginal summaries.

## 8. Persistence and interaction coverage matrix

| Route | M1 proof | M2 extension |
|---|---|---|
| Saved settings JSON | Exact fields, local scope, conversions, selector; no derived members | Group field, requirement, one eligibility selector |
| Full analysis JSON | Preserve special native values through existing codec | Same; no coercion of false/nonfinite cases |
| Dashboard text | Native chart form, exact patterns, active-empty/all-present | Rule settings and `inputSelection` alias |
| Notebook ordinary clicks | Live finding changes; text unchanged | Readiness selection same locality |
| Notebook Keep | Verified selector edit; one callback; naming/echo correctness | Selector and exact rule saved together |
| Reset to kept | Restore authored selector to live chart | Restore authored selector and matching authored rule |
| Undo Keep | Guarded inverse source edit; preserve unrelated prose | Also guard/invert rule settings included by Keep |
| Host Undo | One settings edit per toggle/field-set action | One edit per selector-mode/rule/cohort change |
| Folder save/reopen | Actual saver acknowledgment and fresh folder read | Same for group/rule/eligibility state |
| Source reorder/changed values | Re-evaluate kept predicates, regenerate runtime IDs | Re-evaluate admitted/excluded/group readings |
| Source schema loss | Preserve blocked intent and unavailable findings | Same for required/configured group fields |
| Chart image | Resting chart, stage, denominator, omission notice | Group/readiness reading and correct group denominator |

Do not invent a new save format migration framework. The user’s one-owner/one-client/one-version assumption permits a direct discriminated extension. Preserve existing saves; old chart types and scalar filters must round-trip unchanged.

## 9. Verification run sheet for Codex

These commands are **proposed for after implementation**. They were not run against a feature checkout during this research. The new test paths and export-proof case must be created/registered by the worker. Keep all testing limits in `@repo/test-config`.

```bash
# Use the repository checkout and its pinned pnpm/Node requirements.
pnpm install

# Pure contract + chart/provider/DSL/notebook checks while implementing M1.
pnpm --filter exploreda exec vitest run src/components/charts/JointMissingness
pnpm --filter exploreda exec vitest run src/test/providers/jointMissingness.test.tsx
pnpm --filter exploreda exec vitest run src/lib/notebook/jointMissingness.test.tsx
pnpm --filter exploreda check-types

# Build before demo checks that resolve published package types.
pnpm --filter exploreda build
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check

# Actual app save/reopen failure and retry proof (new targeted test).
pnpm --filter app exec vitest run src/jointMissingnessNotebook.test.tsx

# Verify docs examples and real input at repository-required widths.
pnpm --filter demo build
pnpm --filter demo docs:verify -g '/docs/joint-missingness$'
pnpm shot /examples/joint-missingness --name joint-missingness

# Register a concrete case before invoking this image-export comparison.
pnpm export-proof --only joint-missingness

# Run the broad gate once per implementation PR, not concurrently.
pnpm check

# Feature changes need a minor changeset under the repository's 0.x rule.
# Run only as part of the actual implementation PR, not this research handoff.
pnpm changeset:add minor "Explore exact joint missingness patterns and keep their record-backed notebook findings."
```

For M2, extend the same targeted suites with group/readiness cases and run the groups example. Do not repeat broad performance/browser work without a concrete remaining risk. A screenshot cannot substitute for exact record membership, saving, or keyboard verification.

## 10. Executed research verification and companion use

The delivered [verification-results.txt](verification-results.txt) records **41 passing checks** against the actual baseline `valueParsing.ts` and `fieldSettings.ts` helpers plus independent membership arithmetic. The program makes temporary module copies and changes only a runtime import path for Node resolution; it does not modify the repository.

To repeat that research proof against the supplied extracted source or an exact-baseline checkout:

```bash
# Run beside fixture-data.json and expected-results.json, using Node 24.
# This is fixture/helper verification, not feature acceptance.
node verify-fixtures.mjs /absolute/path/to/explorEDA
```

The machine-readable [expected-results.json](expected-results.json) contains hand-authored IDs/masks, conversion-preview counts, and refresh expectations. The verification program does not generate its own expected sets. Native undefined and nonfinite cases are constructed in the program because ordinary JSON cannot preserve them faithfully.

The [notebook companion](joint-missingness-notebook-example.md) is a proposed authored end state. It uses new chart/selector syntax and is intentionally not claimed runnable at the baseline. The [PNG](joint-missingness-wireframe.png) and [SVG](joint-missingness-wireframe.svg) are low-fidelity design artifacts, not screenshots of implemented behavior.

No renderer, Crossfilter feature integration, new JSON/DSL behavior, Keep/Undo, actual folder reopening, browser acceptance, or performance measurement was executed during this research.

## 11. Recommendation dispositions and milestone mapping

| ID | Disposition / destination | Reason |
|---|---|---|
| JM-D01 | **Build — M1** | Registered exact pattern chart supplies saved lifecycle and quantitative comparison. |
| JM-D02 | **Build — M1** | Effective binary semantics reuse current value readers and preserve zero/false distinctions. |
| JM-D03 | **Build — M1** | Semantic pattern union preserves exactness through edits and reorder. |
| JM-D04 | **Build — M1** | One owner-excluded base prevents mixed denominators and cohort leakage. |
| JM-D05 | **Build — M1** | Full-membership paged trace connects every result to records. |
| JM-D06 | **Build — M1** | Strict persistence and empty-state semantics prevent silent widening. |
| JM-D07 | **Build — M1** | Keep and existing count/share findings complete the notebook workflow. |
| JM-D08 | **Build — M1** | Schema-aware availability and kept-refresh tests distinguish broken analysis from zero. |
| JM-D09 | **Build — M1/M2** | All-present first; chosen-input presence/finite checks show concrete consequences next. |
| JM-D10 | **Build — M2** | Group rates expose subgroup concentration with exact denominators. |
| JM-D11 | **Build — M1/M2** | Bounded drawing preserves exact record accounting. |
| JM-D12 | **Build — M1/M2** | Docs, examples, image/persistence proof ship with the feature they explain. |
| JM-D13 | **Explore — later** | Selectable raw patterns need an explicit raw-column predicate context. |
| JM-D14 | **Defer** | Inclusive queries and arbitrary group-pattern unions require separate saved semantics. |
| JM-D15 | **Defer** | Unbounded row matrices, correlation and clustering do not replace exact evidence. |
| JM-D16 | **Avoid** | Mechanism tests, imputation, grades and expected-record generation are outside the contract. |
| JM-D17 | **Avoid** | No advantage justifies an independent engine, general rule language, or new chart dependency. |
| JM-D18 | **Explore — later** | Named rate-gap findings may be useful, but two existing live shares suffice now. |

Build means include in the implementation plan; it is not approval to merge or deploy.

## 12. Evidence, access status, and open questions

### Decisive repository references

All links below are pinned to the supplied baseline. Symbols describe source inspection, not executed feature behavior.

- [Direction](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/research/DIRECTION.md), [agent guide](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/agent-guide.md), [UI defaults](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/ui-defaults.md): feature design direction, docs/examples, history ownership, raw-value readers, and interaction/export conventions.
- [`valueParsing.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/valueParsing.ts)::`isMissingValue`, `finiteNumber`; [`fieldSettings.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/fieldSettings.ts)::`convertFieldValue`, `applyFieldSettings`, `buildConversionPreview`; `fieldProfiles.ts::missingRowCount`.
- [`CrossfilterWrapper.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/hooks/CrossfilterWrapper.ts)::`getAllData`, `getFilterFunction`, `getChartFilteredRowIds`; `chartPopulation.ts::getPopulationTest`; `useFilteredFieldProfiles.ts`; `charts/registry.ts`.
- [`DataLayerProvider.tsx`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/providers/DataLayerProvider.tsx)::`updateChart`, `updateFieldSettings`, `refreshCalculations`, prop-replacement effect; `rowIdFilters.ts`; `providers/lib/carryRowSelections.ts`.
- [`findings.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/notebook/findings.ts)::`evaluateFinding`, `compareFindings`, `evaluateNotebookFindings`; `NotebookFindings.tsx::useFindingResults`.
- [`writeBack.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/notebook/writeBack.ts)::`skippedKey`, `textPart`, `writeBackSettings`, `writeBackChart`; `ExplorEdaNotebook.tsx::handleStateChange` and local provider.
- [`compile.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/dsl/compile.ts)::`buildChart`, `resolveValueFields`, `buildFilter`; `dsl/parse.ts::parseValue`; `dsl/paths.ts`; `dsl/export.ts`; `dsl/settingKeys.ts`.
- [`saveDataUtils.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/utils/saveDataUtils.ts)::`isBaseChart`, `isChart`, `isFilter`, `validateSavedData`, special-value analysis codec; `ChartTypes.ts`; `FilterTypes.ts`; `SavedDataStructure.ts`.
- [`ChartDataPreview.tsx`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/ChartDataPreview.tsx), `trace/traceRows.ts`, `trace/ChartTracePanel.tsx::QueryRowsLink`, `trace/ChartTraceScope.tsx`, `ChartTraceDetails.tsx`.
- [`evaluateProject.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/analysis/evaluateProject.ts)::`sourceReferences`, `lookupFrame`, `aggregateFrame`; `AnalysisProject.ts::AnalysisResultRow`; `readNotebook.ts::readNotebookText`.
- [`ProjectWorkspace.tsx`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/apps/app/src/ProjectWorkspace.tsx)::notebook callback and `SaveStatus`; `apps/app/src/saver.ts::FolderSaver`; `apps/app/src/App.tsx::reload`; `lib/project/folder.ts::readProjectFolder`.
- [`categories.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/categories.ts)::`categoryKey`, `categoryIncludes`; `applyFilter.ts` null/missing matching.
- [`docs/gate.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/apps/demo/src/docs/gate.ts), `demos/coverage.ts`, `demos/examples.ts`, and packet docs pages: the actual documentation/example gates.

Primary external design evidence is documented with URLs in the report: UpSet’s exclusive intersections and element view; naniar’s pattern/group displays; missingno’s matrix; VIM’s aggregation/matrix alternatives; OpenRefine facets; and van Buuren’s mechanism-identification limits. These informed the representation and scope, not any claim of tested product superiority.

**Access status:** sufficient. The prompt was read before source; all 55 complete packet files were read. Twenty-five adjacent files were consulted at the same baseline for decisive seams. The full named inventory is in the report’s §12.

**Checked versus proposed:** 41 baseline-helper/arithmetic checks passed; source contracts and primary documentation were inspected; the wireframe was rendered and visually checked. Every feature implementation, integration test, folder save/reopen acceptance, browser behavior, and performance target above remains proposed.

**Deliverable links:** [report](joint-missingness-report.md), [fixture data](fixture-data.json), [expected results](expected-results.json), [verification program](verify-fixtures.mjs), [executed log](verification-results.txt), [notebook specification](joint-missingness-notebook-example.md), [PNG wireframe](joint-missingness-wireframe.png), [SVG wireframe](joint-missingness-wireframe.svg).

**Open questions:** measured resource/timing thresholds; the precise existing action slot for section export; reconciliation with post-baseline changes; and the later raw/inclusive/rate-gap extensions. None blocks M1. Codex owns repository changes, original-artifact preservation, integration review, and the eventual PR.
