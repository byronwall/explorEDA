# Implementation plan: pooled and grouped relationships

**Proposal for Codex and Byron · 25 October 2026**  
**Source baseline:** `95832bd473884aeae23453af0888b4ca5187820d`  
**Methods and complete arithmetic:** [methods-report.md](methods-report.md)

## 1. Outcome and implementation boundary

Ship **Compare groups within Scatter Plot**. An analyst chooses X, Y and an explicit G field; compares pooled, group and common-within linear relationships; selects a typed group through normal chart filters; inspects the actual contributing records; and saves/reopens the authored comparison. The second milestone adds the exact within/between explanation and pair-count-weighted relationship among group means.

Use two complete feature milestones. Each includes its UI, selection/trace behavior, persistence, docs, runnable example, tests and measured performance work. Neither is a library-only preparatory milestone. Correct population handling, accessibility, typed grouping and numerical availability are release requirements from the first milestone, not later polish.

This is a research handoff. No repository implementation, installation, commit, merge, publication or deployment was performed. The supplied complete source packet was read before research. All behavior described as new below is a proposal.

### Nonnegotiable contracts

- React and TypeScript; pnpm; package remains storage-neutral.
- Byron's requested feature supplies the demand. Do not add external demand, observed-failure or usability-study gates.
- `finiteNumber` and `numericExclusionReason` read numeric row values; `categoryKey` / `categoryValue` / `categoryLabel` preserve typed groups.
- P is one common pair-valid population over external-filtered rows in the current facet. Missing G remains an explicit category; no additional G exclusion changes pooled membership.
- Own chart filters, including its new category selection, affect linked views/highlighting and **never** refit this comparison. External filters and facets recompute all statistics together.
- No category truncation, sampling, implicit log transform, marker-size weighting, auto group search, inference engine or causal label.
- Plain chart activation selects. Alt-click or Alt-Enter traces without selection. No mark-level Inspect buttons.
- Reuse current trace and row-preview conventions; no generic lineage platform.
- No dependency on proposed PR519, PR520 or PR524.

### The computation contract workers implement

For one group g, `Q_g=(Sxx_g,Sxy_g,Syy_g)` is its centered-moment triple. Across one common P:

```text
T = centered moments of all pairs
W = sum of each group's Q_g
B = sum n_g * outer(groupMean_g - pooledMean, groupMean_g - pooledMean)
T = W + B

pooled slope       = T.xy / T.xx
individual slope_g = Q_g.xy / Q_g.xx
common within slope= W.xy / W.xx
group-means slope  = B.xy / B.xx        # n_g-weighted means

r(S) = S.xy / sqrt(S.xx * S.yy)        # mathematical definition only
                                       # implementation uses normalized norms
sample covariance       = T.xy / (N - 1)
within contribution     = W.xy / (N - 1)
between contribution    = B.xy / (N - 1)
```

Slopes require positive X variation; correlation requires positive X and Y variation. Constant Y permits slope zero with undefined r. Singleton groups remain in P and B with zero raw within moments. The conventional pooled-within covariance `W.xy/(N-K)` is distinct from the additive contribution and is not the main displayed within value. Neither group correlations nor slopes are averaged arithmetically.

The report derives the formulas and limitations. Primary documentation for the independent comparison is [Stata's within/between equations](https://www.stata.com/manuals/xtxtreg.pdf), [R's QR and weighted least squares](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/lm.html), and [NumPy least squares](https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html). Product output is descriptive; tests use coefficients only, not those libraries' p-values or uncertainty estimates.

## 2. Proposed settings, filter representation and internal API

### 2.1 Persist only authored settings and ordinary filters

Add an optional setting in `ScatterPlot/definition.ts`:

```ts
// Proposed new shape; not an existing baseline API.
type ScatterGroupComparisonSettings = {
  groupField: string;
};

// Added to ScatterPlotSettings:
// comparison?: ScatterGroupComparisonSettings;
```

- Absence means off. Enabling and choosing a valid field creates the object.
- X/Y use the chart's existing `xField` and `yField` settings.
- G does not follow color. Color/facet/connection `groupField` settings have different meanings.
- Store no moment arrays, coefficients, source IDs, group means, selected-group duplicate state, cache keys or trace snapshots in this setting.
- Add `comparison` to `CHART_SETTING_KEYS.scatter` and its setting-description entry.
- Keep the existing saved-analysis version; this is an optional additive chart setting, not a parallel version system.
- Missing referenced G produces a repair state. A field missing from the schema must not be mistaken for a present field whose row value is undefined.

Change of X/Y/G or disabling comparison retains ordinary chart filters visibly, rather than deleting unrelated filters under an assumed comparison provenance. The analyst removes them through normal chip/clear/manual controls. The comparison still excludes all of its own filters from P. Explain retained selection in the live scope text when it is relevant.

### 2.2 One canonical selection state, with JSON-safe category equality

Existing `saveDataUtils.ts::isFilter` accepts finite JSON values for `type: "value"`; raw numeric NaN and infinities cannot survive this path. Existing point filters persist snapshot `__ID` values unchanged; durable refresh identity is not established by the supplied source. Neither path is sufficient for every supported durable typed-group selection.

Add one **proposed** narrow filter union variant to the established filter system:

```ts
// Proposed addition to the existing Filter union.
type CategoryFilter = {
  type: "category";
  field: string;
  keys: string[];
};
```

Keys are canonical `categoryKey(value)` strings. All new comparison group selections use this same variant, including ordinary strings; do not create one representation for normal groups and another for special groups. There is no `comparison.selectedGroupKeys` parallel state.

**Matching and normalization:**

- Keys within a filter are OR; filters in `settings.filters` remain AND.
- Toggling a group updates one equality selection for G. A compatible existing `value` filter on G is promoted to canonical keys on this explicit edit, then the clicked key is toggled in that selection. Replace that equality predicate rather than appending a second one. If multiple same-field equality predicates already exist, start from their effective intersection before toggling; do not silently turn their AND into an OR on restore. Preserve range, text and other non-equality constraints on G and all other fields as visible intersections.
- When G equals the categorical color field, comparison and legend controls read and update that same equality selection. Update `scatterPlan.ts`'s currently value-only legend selected-state extraction and inspect the shared legend toggle path. This is interoperability for the new variant, not a second selection store.
- Empty key selection removes the category filter. Saved category predicates contain at least one key.
- Deduplicate keys and sort their canonical strings deterministically. Normalize the same way on author/update/restore/export, before state fingerprints are compared.
- Decode a key only for validation/labeling, then require `categoryKey(decodedDatum) === encodedKey`. Do not use display text to reconstruct a datum.
- Prepare field lookup and any key Set outside the per-row predicate. Inspect `applyFilter` and its callers to choose the actual preparation seam; no unverified compiled-filter API is assumed.
- A selected category absent from current data matches zero rows and remains visible. A missing field yields an unresolved-field filter with zero matches until repaired or removed; it must not turn `['missing']` into an all-row match.
- Add normal filter chips, removal, manual editing, clear-chart and clear-all semantics in the same milestone. Counts and field-filter state must be visible in both workspace status and the Rows header.
- Because the shared `isFilter` validator also accepts workspace and Rows filters, implement this variant in every shared filter consumer that accepts it. The matcher, labels, removal and persistence must work there as well as in Scatter Plot. This adds a typed equality predicate to existing flows; it does not add another grouping-analysis UI to every chart.

Canonical supported key tuples:

```ts
["missing"]
["string", "arbitrary exact string"]
["boolean", true] // or false
["number", 1] // any finite number; zero is canonical +0
["number", "NaN"]
["number", "Infinity"]
["number", "-Infinity"]
```

Reject extra tuple elements, unknown tags, noncanonical encodings, `['number', null]`, and `['number', '1']`. Distinguish numeric NaN from string `"NaN"`. This is a local typed-category predicate addition, not a new identity system.

**Facets and counts:** a group-only predicate selects the category **across this chart's facet panels**. State that in its tooltip and accessible description. A panel's selected counts describe that facet; workspace Rows can contain matching records from every facet. Tracing a group is scoped to its clicked facet. To restrict the population to a facet, the analyst applies an explicit external facet-field filter. This design does not silently append facet predicates.

Plain selection matches category records including invalid X/Y pairs; numerical traces use only P_g. Example: “A: 2 valid pairs from 3 rows” can select 3 records with no other own constraint. After an X brush, selected records can be fewer; derive selected/partial state from actual matching records separately from the category predicate's toggle state.

### 2.3 Internal computation types: local and bounded

New file names are proposals. Prefer a handful of cohesive files over a framework:

- `ScatterPlot/groupComparison.ts`: population preparation, typed partition, group moments and comparison plan.
- `ScatterPlot/centeredMoments.ts`: small shifted/scaled compensated moment helper and coefficient/status conversion, reused locally by the comparison and paired summary adapter.
- `ScatterPlot/GroupComparison.tsx`: visible strip and compact group table.
- `ScatterPlot/groupComparisonTrace.ts`: target resolution, memberships and calculation descriptions.
- `ScatterPlot/GroupComparisonBody.tsx`: existing-trace body for the comparison/decomposition.

Use names matching the codebase when Codex sees the checkout. Do not turn this into a public statistics package.

A useful proposed output shape is:

```ts
type NumericResult =
  | { status: "available"; value: number }
  | { status: "undefined"; reason: string }
  | { status: "unresolved"; reason: string; estimate?: number }
  | { status: "out-of-range"; reason: string };

type GroupComparisonScope = {
  revision: string;
  owner: string;
  facetLabel?: string;
  eligibleIds: IdType[];
  pairIds: IdType[];
  invalidXIds: IdType[];
  invalidYIds: IdType[];
  excludedIds: IdType[]; // distinct union
};

// The actual plan also carries typed group identities, their eligible/pair IDs,
// local and T/W/B moment summaries, means/ranges, statuses and group counts.
// Snapshot IDs stay ephemeral. Internal scaled moments need not be public.
```

There must be separate comparison-group data in `ScatterSnapshot`; existing `groupData` is for connection paths. Proposed name: `comparisonGroupData`. Populate it only when comparison is enabled. Numeric field readiness and source-schema existence are explicit inputs; a missing column does not become an all-missing group.

Construct E from the established external-filtered `snapshot.chartIds` and an **explicit** facet restriction, preserving `undefined` versus `[]`. Do not take rows from `plan.points`, `filteredIds`, selected group keys, X-range clipping, size validity or density cells. Verify chart-local source constraints at the snapshot boundary against current provider semantics before editing; do not reinterpret those settings from their names.

The main plan takes no own-selection membership as an estimation input. A separate presentation step can annotate selected counts/highlights. Revision, X/Y/G prepared data and external/facet membership determine recalculation. Do not reuse `fitInputKey` unchanged: it has no comparison G and current activation excludes comparison-only charts.

Current `ScatterPlot.tsx` routes `display === "density"` directly to `DensityScatter`, bypassing `ScatterPoints` and its fit/trace setup. Put comparison population/UI/trace ownership in a suitable shared wrapper or integrate both rendering branches after inspecting `DensityScatter.tsx`. Points, hexagons, contours and rectangular density must expose the same comparison for the same row scope. Keep derived drawing cells out of the mathematical input.

Local normalized moments retain their X/Y scale exponents. Convert them into common normalized units before summing W/B or checking T=W+B; propagate centering and scale-conversion errors into the direction guard. A numerical helper that adds independently normalized group triples without this conversion fails the method contract even if ordinary fixtures happen to pass.

### 2.4 Text changes

Use these labels or semantically equivalent short wording consistently:

| Surface | Required text |
| --- | --- |
| Settings | `Compare groups`, `Group by` |
| Comparison heading | `Linear relationships · X: … · Y: … · Group: …` |
| Scope | `9 pairs from 14 rows · [facet] · Other filters applied` |
| Own selection note | `This chart's selection does not change these statistics.` |
| Within summary | `Common within-group slope` |
| Between summary | `Group means, weighted by pair count` |
| Decomposition | `Sample covariance = within contribution + between contribution` |
| Means table | `K group summaries representing N original pairs` |
| Exclusions | `X only`, `Y only`, `Both`, `Excluded pairs` |
| Trace references | `Term records`, `Reference population` |
| Group selection description | `Select this category across facets; … valid pairs from … rows.` |
| Numerical failures | `Undefined — constant X`, `Undefined — constant Y for correlation`, `Direction unresolved at numeric precision`, `Outside numeric range` |

Direction labels follow the report's exact classification, using unrounded moments and numerical statuses. Never say “significant,” “confounder,” “corrected/true relationship,” or “influential record” for an additive contribution.

Dashboard text must preserve `comparison.groupField` and the typed category predicate. `settingKeys.ts` establishes key coverage, but the parser/exporter are not in the supplied packet. Inspect their actual syntax and use the existing generic escaping/array representation. Do not claim an invented text snippet is already supported. The release proof is export through the real serializer, compile that text, and compare the restored canonical settings and memberships.

## 3. File map and evidence boundary

All paths below are repository-relative. Current facts come from the supplied baseline; newly named files are proposals.

### Confirmed implementation files in the packet

| Files | Work and reason |
| --- | --- |
| `packages/explorEDA/src/components/charts/ScatterPlot/definition.ts`, `ScatterPlotSettingsPanel.tsx` | Add optional comparison configuration, numeric readiness and compact Group by authoring. Keep chart filter ownership in `settings.filters`. |
| `ScatterPlot/ScatterPlot.tsx`, `scatterPlan.ts` | Connect comparison inputs/UI across rendering branches, selected presentation, value/category-aware legend state, facet-specific trace owners, and correct empty-facet semantics. |
| `ScatterPlot/pairedSummary.ts`, `PairedSummaryBody.tsx` | Reuse prepared moments when comparison and paired summary overlap; prevent duplicate/conflicting readouts. Preserve existing summary-only behavior outside this feature. |
| `ScatterPlot/fitPlan.ts`, `useScatterFits.ts`, `regression.ts` | Inspect dependencies and avoid accidentally activating or copying nonlinear fits. A narrow adapter may share linear coefficients; do not make diagnostics/solver repair a prerequisite. |
| `ScatterPlot/scatterTrace.ts`, `FitTraceBody.tsx`; `charts/ChartTraceDetails.tsx`, `charts/trace/ChartTraceScope.tsx` | Extend established trace presentation and owner/revision routing. Preserve point/fit traces and exact facet selection. |
| `packages/explorEDA/src/lib/categories.ts`, `lib/valueParsing.ts` | Reuse helpers; add canonical-key validation/decoding only if needed for the new predicate. Do not replace raw parsing or equality. |
| `packages/explorEDA/src/utils/saveDataUtils.ts`, `types/SavedDataStructure.ts`, `lib/dsl/settingKeys.ts` | Validate comparison and category filters, carry settings/text round trips, use existing full-analysis special-value preservation. No new statistics store. |
| `apps/demo/src/docs/pages/scatter.mdx`, `scatter-matrix.mdx` | Author comparison documentation with its owning feature; matrix page gets only navigation/context, not a new matrix claim. |
| `apps/demo/src/demos/examples.ts`, `coverage.ts`, `apps/demo/src/docs/live/examples.ts` | Register runnable example, actual coverage state and live documentation steps. |
| `ScatterPlot/summaryMarginals.test.ts`, `regression.test.ts`; `ScatterMatrix/matrixPlan.test.ts` | Preserve known scope expectations; run adjacent tests only where touched. Matrix behavior is not redesigned. |

The `ScatterPlot/` prefix in this table is under `packages/explorEDA/src/components/charts/`.

### Real imported or guide-named neighbors to inspect before edits

These implementations were not supplied. Their existence/reference is grounded in imports or `docs/agent-guide.md`; exact hooks and current behavior are not claimed.

- `packages/explorEDA/src/components/charts/ScatterPlot/useScatterData.ts` — add the distinct prepared comparison column and confirm source/facet semantics.
- `packages/explorEDA/src/components/charts/ScatterPlot/DensityScatter.tsx` — explicitly imported by `ScatterPlot.tsx`; ensure rectangular density uses the same comparison population and native trace route. Inspect the shared categorical-legend selection handler reached through the current chart-role/legend rendering path as well.
- `packages/explorEDA/src/types/FilterTypes.ts` and `packages/explorEDA/src/hooks/applyFilter.ts` — add the typed predicate and prepare membership efficiently.
- `packages/explorEDA/src/providers/DataLayerProvider.tsx` — normalization, `updateChart`, self-excluded chart population, source revision, host echoes and state serialization.
- `packages/explorEDA/src/components/PlotChartPanel.tsx`, `components/ChartSettingsContent.tsx`, and the existing Filters tab under `components/settings/` — activity indicators, clear controls, filter manual editing, details focus/keyboard behavior.
- The existing shared filter-description/chip helper used by workspace status and Rows header — locate through provider/panel imports. No filename is invented for code absent from the packet.
- Existing trace type union, dispatcher and source-row preview used by `useTraceSource`/`ChartTraceDetails` — extend a comparison discriminant, not a generic tracing API.
- `packages/explorEDA/src/lib/dsl/compile.ts`, `export.ts` and their filter parser/serializer helpers; `types/ChartTypes.ts`, `types/SavedDataTypes.ts` if union propagation needs them.
- `apps/demo/src/docs/catalogue.ts`, `targets.ts`, `reference/settingDescriptions.ts`, `gate.ts`, and `packages/explorEDA/src/docsKit/` — preserve docs coverage and described settings.
- `apps/demo/src/demos/coverage.test.ts`, `apps/demo/src/dashboardText.test.ts`, and current saved-state/DSL/browser tests — use their actual existing fixtures and helpers.

Inspect these neighbors as the first implementation step; it is not an outside dependency or approval gate. If their current APIs differ from the proposal, adapt the seams while preserving the stated mathematical and interaction contracts. Do not claim those neighbor flows were executed during this Methods run.

### Research handoff placement

Following `docs/research/DIRECTION.md`, Codex should distill reviewed decisions into `docs/intent/pooled-group-relationships/implementation-plan.md` and a short `docs/research/pooled-group-relationships-2026-10-25/README.md` with the decision, sources, open questions and actual Pro conversation link when available. These are proposed repository destinations, not files written by this research run. Do not commit the downloadable Pro originals or ZIP; repository changes remain Codex's responsibility.

## 4. Milestone 1 — author, compare, select, trace and reopen

**User outcome:** create a scatter comparison with one explicit grouping, see pooled and per-group slopes/r plus common-within slope/r, select a typed category, inspect exact pairs/exclusions, and reopen the saved comparison. The original scatter remains visible throughout.

**Recommendations delivered:** PG-01, PG-02, PG-04, PG-07, PG-08, PG-09, PG-10 and the count/range portion of PG-11. Compute the core T/W/B moments under PG-03 from the outset so the later explanation uses the same arithmetic.

### Implementation sequence inside this complete milestone

1. Inspect the imported neighbors in §3 and identify the existing filter preparation, chip and trace dispatch paths. Keep one current implementation and one canonical state path.
2. Add `comparison?: {groupField}` and the new category predicate, its canonical validator and normalization. Complete the shared filter UI/serialization path before wiring group activation.
3. Add the pure comparison planner and local stable centered-moment helper. Partition E/P once. Keep both axis reason masks and a distinct excluded union. Include all typed categories and singletons, even when no coefficient is available.
4. Add `comparisonGroupData` to snapshot preparation and the exact facet intersection. Preserve existing connection-group data. Handle absent G and nonnumeric axes explicitly.
5. Render the compact comparison strip and scrollable group table in both scatter rendering branches. Show N/eligible count, group counts, slope units, r, X ranges, unavailable reasons and separate selected state. Keep group membership independent of color; no hidden analytic category cap. If providing “Use group field for color,” update both `colorField` and `colorScaleId` through `getOrCreateScaleForField`, matching the current settings control.
6. Route ordinary group activation into the canonical chart category filter. Reconcile compatible existing equality selection and categorical-legend toggles; preserve/intersect other own constraints. Add the manual category editor for numeric-profile G fields, header clear, status/Rows chips and clear-all. Each toggle is one `updateChart` action/host callback.
7. Add group/pooled/common-within trace targets and bodies using the current owner/revision/source-row convention. Show pair-valid contributors and excluded rows; own selection does not mutate the comparison. Keep both numerical and raw/prepared values visible.
8. Normalize save/restore/text consistently. Reopen recomputes; stable semantic category filters follow values on reorder/refresh. Do not serialize statistics or use positional IDs as persistent group identity.
9. Run the numeric/interaction/round-trip tests, docs example checks, real pointer/keyboard acceptance and uncached product performance probe below. Adjust only measured problems before shipping.

### Files

- Modify the confirmed settings/render/snapshot/paired-summary/filter-validation/DSL coverage files in §3.
- Add `ScatterPlot/groupComparison.ts`, `centeredMoments.ts`, `GroupComparison.tsx`, `groupComparisonTrace.ts` and `GroupComparisonBody.tsx` as needed. Keep direct control flow and small components; do not introduce a method/plugin framework.
- Proposed focused test files: `ScatterPlot/groupComparison.test.ts`, `ScatterPlot/GroupComparison.test.tsx`, `lib/categoryFilter.test.ts`, and `utils/groupComparisonPersistence.test.ts`.
- Extend the actual filter union/apply/chip/manual/DSL files found during inspection. New variant exhaustiveness must pass type checking across existing chart and Rows consumers.

### Exact mathematical tests

Use a few table-driven groups of assertions, not one test for every formula. Full rows, sums and expected triples are in report §9.

| Test block | Exact requirements |
| --- | --- |
| Reversal and controls: F1, F2, F3 | F1 `T=(116/5,−124/5,236/5)`, `W=(4,4,4)`, `B=(96/5,−144/5,216/5)`; pooled β `−31/29`, r `−31/√1711`; groups and common-within β/r `+1`. F2 consistent; F3 mixed signs with Wxy=0, never labeled an all-group reversal. |
| Availability: F4, F7, F8, empty/one-pair mutations | F4 singleton remains in P/B, label qualifies 2 estimable groups plus 1 undefined. F7 X constant means slope/r undefined. F8 Y constant means slopes 0 but r undefined. Empty facet `[]` must yield zero pairs, while absent facet restriction uses all eligible pairs. |
| Parsing/population: F5, F11 | F5 eligible14/pairs9/excluded5, invalidX4/invalidY3/both2; missing group two pairs, blank/space separate singleton groups. Its eligible numeric-0 category has zero pairs and counts as undefined in direction availability, so it prevents an unqualified “every group” label. F11 four typed groups, not merged strings/numbers/booleans. |
| Numerical invariance: F12–F18 | Affine coefficient/unit changes, 2^40 offsets, extreme finite scales and near-zero/zero distinctions follow report §7.3 and §9. Never pass an unrepresentable raw variance as a true 0 or return a spurious r=0 from product overflow. |
| Scope: F1, F9, F10 | Own group/brush selection leaves F1 analytic IDs and values unchanged. External removal of b3 gives βT=−81/59; external A-only gives T=W=(2,2,2), B=0. A facet restricted to A matches F10. |

Use the independent rational/NumPy expectations, not new-planner snapshots as the source of truth. Include a deliberate assertion that a zero-contribution record such as F1 b2 remains in membership.

### Exact typed-filter and lifecycle tests

**C1 — canonical matches.** Give these 16 rows identical valid X/Y if desired; vary G exactly as below. Expected ID sets are literals independent of the production matcher.

| Key selected | Raw group values / row IDs | Expected matches |
| --- | --- | --- |
| `["missing"]` | m0:null, m1:undefined | `{m0,m1}` |
| `["string",""]`; `["string"," "]` | e0:`""`, e1:`" "` | `{e0}`; `{e1}` |
| `["number",1]`; `["string","1"]` | n1:1, s1:`"1"` | `{n1}`; `{s1}` |
| `["boolean",true]`; `["string","true"]` | b1:true, sb:`"true"` | `{b1}`; `{sb}` |
| `["number","NaN"]`; `["string","NaN"]` | nn:NaN, sn:`"NaN"` | `{nn}`; `{sn}` |
| `["number","Infinity"]`; `["string","Infinity"]` | pi:Infinity, sp:`"Infinity"` | `{pi}`; `{sp}` |
| `["number","-Infinity"]`; `["string","-Infinity"]` | ni:−Infinity, sm:`"-Infinity"` | `{ni}`; `{sm}` |
| `["number",0]` | z0:+0, zn:−0 | `{z0,zn}` |

Numeric-1 OR missing matches `{m0,m1,n1}`. Union those with numeric/string NaN and expect `{m0,m1,n1,nn,sn}`. Empty selection removes the predicate. Invalid encodings are rejected. Keep raw nonfinite ordinary value-filter rejection unchanged.

**C2 — real serialization.** Round-trip a saved comparison and that four-category selection matching five records through `stringifySavedData`/`parseSavedData`, JSON and Dashboard text export/compile. Keys and memberships remain exact. Round-trip the 16 raw rows via the existing complete-analysis special-values sidecar, then reapply the predicate and assert the same five IDs. An identical host state echo must not create a restore loop or extra undo entry.

**C3 — selection versus contributors and facet ownership.** Use `(id,G,facet,X,Y)`:

```text
r1,A,east,0,0
r2,A,west,1,1
r3,A,east,null,2
r4,B,east,2,2
r5,A,east,3,""
```

With no external filter, clicking A in the east panel sets G=A **across facets** and selects `{r1,r2,r3,r5}`. The east A coefficient trace has eligible `{r1,r3,r5}`, pair contributor `{r1}`, invalid-X `{r3}`, invalid-Y `{r5}`. It must not show west's r2 in that trace. The east analytic population remains pairs `{r1,r4}` regardless of that own selection. Add an external `facet=east` predicate: the global linked selected set becomes `{r1,r3,r5}`; the trace population remains correctly scoped. The copy must make the across-facets selection clear.

**C4 — source reorder/refresh.** Reorder the above source; selection follows typed G, not original indices. Replace data with those rows plus `r6,A,east,4,4`, and change r2 to B. Saved G=A now selects `{r1,r3,r5,r6}`; east A contributors are `{r1,r6}`. Close/invalidate the old trace on revision change. Remove G from the schema entirely: the comparison and filter report unresolved field/zero matches, including when a missing-category predicate was selected. A present G containing undefined still correctly matches the missing category.

**C5 — normal filter lifecycle.** Test pointer and keyboard toggle, an intersecting own X brush, partial selection presentation, manual typed category edits for numeric-profile G, removable status and Rows chips, chart header clear, empty-plot clear and workspace clear. All paths use `settings.filters`; clearing removes the actual predicate. Toggling comparison visibility or choosing a different G does not silently discard existing filters. One action gives one state callback/undo step.

Include a literal interoperability case using F1 with `G = colorField`: begin with existing value selection `{A}`; toggle B in the comparison; expect one canonical category predicate `{A,B}` and all five selected IDs. Toggle A through the legend; expect `{B}` and `{b1,b2,b3}`. Both controls, chips, save/reopen and Dashboard text agree. An own X-range predicate remains intersected throughout. Also check that independently authored multiple equality predicates preserve their effective intersection until the user edits the selection.

Apply the same four-key C1 predicate once as a workspace filter and once as a Rows filter through the existing shared paths: both match exactly `{m0,m1,n1,nn,sn}`, expose the correct typed labels, survive their supported save/text round trips and clear normally. A workspace predicate changes the scatter's analytical P; its own chart predicate does not. Use one table-driven assertion for these shared consumers rather than duplicating the entire feature suite.

### Docs and runnable example in this milestone

- Add `## Compare pooled and grouped relationships` in `apps/demo/src/docs/pages/scatter.mdx` after Fits. Explain X/Y/G, linear meaning, counts, explicit typed missing group, own-selection invariance, facet scope, raw versus log display, selection versus contributors and save/reopen.
- Add a brief link/context sentence in `scatter-matrix.mdx`: its correlation cells already compare pairs; authored within/between explanation lives in Scatter Plot. No promise of a new matrix-to-scatter transfer action unless separately implemented.
- Add `apps/demo/src/demos/groupComparisonExample.ts` (proposed) exporting F1 data/settings and a focused dashboard. Public example ID: `scatter-group-comparison`; route follows the existing examples router. Title: **When the pooled direction points the other way**.
- Supply its five rows in `apps/demo/public/data/group-comparison.csv` (proposed), preserving `record_id`, `group`, `x`, `y`. Label source Synthetic; no purported participant evidence.
- Register in `examples.ts`; add `mode:scatter-group-comparison` and `exampleCoverage` in `coverage.ts`; register the same focused live example in `docs/live/examples.ts` with alt text and scripted checks for 5 pairs, the actual formatted text for pooled −31/29 (for example `−1.069` at three decimals), group A selection of 2 records and unchanged comparison. Exact rational values belong in numerical tests; live text checks use the product's chosen formatter.
- The current LiveStep union does not cover Alt/keyboard input. Add those checks in actual browser tests; do not mark them covered by a text/count-only documentation step.
- Add setting descriptions and docs target coverage through the existing docs machinery. Mark coverage `shown`; mark `reviewed` only after dated browser evidence exists.

### Acceptance and main risk

Perform the common width/input checklist in §6 and the uncached performance probe in §7 before considering a cache or analytic limit. Save/reopen, undo, external-filter recalculation and current-revision traces are mandatory.

**Main risk:** a new category filter is numerically correct but inconsistently handled by generic chip, clear, manual-editor, Dashboard text or missing-field paths. Mitigate by routing through one canonical filter union and releasing C1–C5 in this milestone, including real host echo and refresh behavior. Do not ship hidden filter state.

## 5. Milestone 2 — explain the exact within/between difference

**User outcome:** expand the existing comparison to see why the pooled and group directions differ, inspect each group's signed contribution, inspect the original records, and compare the common-within slope with the pair-count-weighted group-mean slope. Save/reopen keeps the authored comparison and filters; the explanation always recomputes.

**Recommendations delivered:** full PG-03, PG-05, PG-06 and PG-11, with continued PG-08/09/10 acceptance. PG-12 mean-point overlay remains Explore, outside the required milestone.

### Implementation

1. Add a compact **Within / Between** expansion below the comparison, separate from plot settings. Show total, within and between sample-covariance contributions with the same N−1 denominator and units. Include XX/YY details in trace so xy never floats without its variance reference.
2. Add common-within explanation (demeaned records, Qxx weights) and **Group means, weighted by pair count** slope/r, with K group summaries representing N original pairs. Retain individual group slopes and undefined counts.
3. Show a group summary table with n_g, mean X/Y, within xy, between xy and X range. Use numeric columns sized to content and local scrolling. A means table is explicitly derived; no synthetic original rows appear in Rows.
4. Add the all-group X-range intersection classification and per-group within-X weights. No automatic overlap restriction and no pairwise-support score. Search/order/page only the visible table; analytic classification always covers every group.
5. Extend trace targets for total/within/between components and their group contributions. Show **Term records** and **Reference population** separately. For B_g, P_g supplies the term's original records but P establishes global means/denominator. For common-within β, all P is required even when one group row is highlighted.
6. Add original-row within-deviation/products table via the existing row trace. If total products are shown on the same row, do not imply rowwise `total=within+between`; group-level summation cancels the cross terms. Do not describe a contribution as removal influence.
7. Reuse exact owner/facet/revision behavior. Alt activation does not filter. Search or sort in the explanation does not change P. A new source or external-filter revision recomputes and invalidates stale traces.
8. Measure component computation, detail render and contributor opening with complete membership before introducing presentation virtualization or any cache. Keep all rows/categories in the analytical result.

### Files

- Extend proposed `groupComparison.ts`, `GroupComparison.tsx`, `groupComparisonTrace.ts` and `GroupComparisonBody.tsx`.
- Extend `ChartTraceDetails.tsx` only for a small reusable readout/record-section need that existing primitives do not cover; avoid a generic dependency graph.
- Integrate native trace dispatcher/preview types located in Milestone 1.
- Extend `groupComparison.test.ts` and `GroupComparison.test.tsx`; add a focused `groupComparisonTrace.test.ts` only if separating trace memberships improves test clarity.
- Update the existing scatter docs, new example module/CSV, `examples.ts`, `coverage.ts` and live-example registry in the same milestone.

### Exact tests

| Test block | Required evidence |
| --- | --- |
| F1 complete decomposition | Sample covariance `−31/5 = 1 − 36/5`; variances `29/5=1+24/5`, `59/5=1+54/5`; group A covariance 2 vs group B covariance1; W/(N−K)=4/3 is not mislabeled as contribution1. |
| F1 contributor memberships | A between term `(288/25,−432/25,648/25)` has term IDs `{a1,a2}`, reference IDs all5. B term `(192/25,−288/25,432/25)` has `{b1,b2,b3}` plus same reference. Within b2 product is0 but its membership remains. |
| Rowwise nonidentity | a1 total xy `−221/25`, within1, allocated between `−216/25`, cross term `−6/5`; UI must not assert a false two-term row equality. A group sum `−382/25 = 2−432/25` is valid. |
| F6 weighting discriminator | n=(2,3,4), local XX=(2,2,20); βW=5/3, not size-average7/9 or simple-average2/3. Weighted-means β=1/25, not equal-means1/4. T/W/B triples and all contributor terms match report §9. |
| Slope/correlation decomposition | F1 β weights5/29 and24/29 give−31/29. Do not sum rW=1 and rB=−1 to obtain pooled r. Validate cW+cB under the total correlation denominator if the trace displays it. |
| Degenerate component terms | Singleton F4 retained; K=N gives W=0 and undefined within coefficients; equal group X means gives Bxx=0; no `0×undefined`. Constant Y zero slope versus undefined r remains explicit. |
| Range meaning | F1 ranges disjoint; F6 all-group intersection exactly `{1}` (touching). Do not label it broad overlap or no pairwise overlap. |
| External scope and traces | External removal b3 changes A's B term through grand means even though a1/a2 remain; own selection leaves all component values unchanged. Different facet targets never resolve to the first facet by accident. |

Use tolerances in methods-report §7.3, together with exact identities and memberships. Checking only `T≈W+B` is insufficient: two incorrect terms can cancel. Assert each term against independently enumerated expectations.

### Docs and runnable example in this milestone

- Extend `/docs/scatter` with **Within and between contributions**, the N−1 denominator, common-within X-variation weights, group-mean pair-count weights, aggregate-versus-original records, small-group limitations, and contribution-versus-influence distinction.
- Extend `scatter-group-comparison` with a second F6 dataset/layout or an adjacent registered example `scatter-group-comparison-weights`. The second exact runnable source must have all nine specified rows; do not use F1 alone to test weighting.
- Suggested second CSV: `apps/demo/public/data/group-comparison-weights.csv`; proposed export from `groupComparisonExample.ts` supplies its dashboard.
- Add live steps for opening the explanation, reading the formatted `−6.2 = 1 + (−7.2)` F1 identity, and the formatted F6 common-within/group-means values (for example `1.667` and `0.04`, corresponding to exact `5/3` and `1/25`) with K=3/N=9 meanings. Assert the actual selected precision, not undisplayed rational strings. Tooltips explain why there are three mean summaries and nine original pairs.
- Update setting/feature descriptions and example coverage; same-milestone browser checks include trace focus/dismissal and no accidental filter mutation.

**Main risk:** correct formulas are presented with misleading denominators, weights or record provenance. Mitigate with exact unequal-size and three-group fixtures, explicit group-summary labels, separate term/reference record sets, and the rowwise cross-term counterexample. Do not substitute a synthetic mean row or an average correlation for the defined quantity.

## 6. Pointer, keyboard and responsive acceptance

These checks are required for **both milestones** at 1280, 783 and 390 CSS pixels. They are proposed application checks; none was executed in this research run.

| Width | Required layout behavior | Required interaction evidence |
| --- | --- | --- |
| 1280 | Original scatter, scope and comparison remain visible; settings are compact nonmodal controls; details follow the existing side arrangement. | Author X/Y/G; pointer and keyboard group toggle; trace; contributor open; external filter; save/reopen; one action/undo. |
| 783 | Existing chart-above-controls details layout; comparison fits its chart and uses local table scrolling. No new persistent inspector sidebar. | Same complete flow using pointer and keyboard. Popovers remain onscreen; primary actions are reachable; no clipped group/field identity. |
| 390 | Single-column flow, readable X/Y/G and scope, bounded local table scroll, no document-wide horizontal overflow. | Same controls remain operable with keyboard and touch/pointer header trace entry; selected state and exclusions are not hover-only. |

At every width:

- Enter/Space on a group performs exactly one selection action; Alt-Enter/Alt-click opens its trace with no filter or host-state mutation.
- Tab/Shift+Tab reaches authoring, groups, explanation, trace controls and close actions in a sensible order; no 2,000-row table imposes 2,000 mandatory Tab stops. Use table/roving-focus conventions and an accessible search where appropriate.
- Focus/hover readouts do not cover field names. Use `FieldMetadata`, current density tokens and `ActionTooltip` conventions. No native `title` or SVG `<title>`.
- Escape closes the deepest editor/trace before details and returns focus to the activating element. Test actual portal behavior in chart details, background scroll locking and focus return.
- Plain empty-plot click clears the chart's canonical filters, including category filters. A brush is not mistaken for a clearing click.
- Current analytic scope stays visible while own selected counts change. Rows counts for a group including invalid pairs are correctly distinguished from its pair count.
- With facets, the panel's selected count remains local while Rows shows matching categories across facets. With G=color, alternate comparison and legend toggles and confirm a single shared equality selection.
- Switch points, hexagons, contours and rectangular density with the same X/Y/G: pair IDs, coefficients, selections and facet-local traces remain consistent. Confirm comparison-only mode works without enabling regression or paired summary.
- Test long field/group names, null/blank/type-colliding categories, all groups undefined, no pairs, many categories, and a selected category absent after refresh.
- Test light and dark theme borders and semantic status tokens. When color≠G, comparison labels do not invent a competing color encoding.
- Exported chart image excludes editor controls marked with `data-export="omit"`; at-rest comparison values and labels remain intelligible. No hover-only meaning is required.
- Capture screenshots with `pnpm shot` at the three required widths. Screenshots support layout evidence; real DOM/state assertions establish behavior.

## 7. Measured performance before caches or limits

### Research measurement already performed

The research used a Python/NumPy arithmetic-only probe with pre-encoded groups, one warm-up and seven repeats, at N=1,000/10,000/100,000 and feasible K=2/20/200/2,000. At 100,000 rows, observed medians were 1.778–2.790 ms and sampled p95 values 2.117–3.208 ms. Full procedure and results are in methods-report §9. This excludes parsing, typed grouping, membership retention, JavaScript, React, SVG/DOM, traces and peak memory. It **does not** establish explorEDA performance or justify a cache, row cap or category cap.

### Required product probe in Milestone 1, repeated for added Milestone 2 surfaces

Use the actual planner and real browser flow, uncached initially. Keep source construction out of timing. Run in one documented environment and record Node/browser/build, source size, K, facet count, warm-up and repeated timings. Do not run concurrently with other build/performance jobs.

- Matrix: N=1,000/10,000/100,000, K=2/20/200/2,000 where feasible; add K=N at 1,000 and 10,000 for the singleton case. Use 1 and 8 facets, unequal groups, 10% pair-invalid rows, typed G values and long labels. This is a probe matrix, not a product limit.
- Separately measure parsing/partition/moments, selected-state recomputation, full comparison render, external-filter-to-stable-paint, own-selection-to-linked-update, group search/scroll, trace resolution and first contributor page.
- Measure at least 20 post-warm-up runs per selected representative case for median and p95. Report peaks/long tasks and retained memory where browser tooling supports it; report unavailable memory measurement honestly.
- Verify own selections do not rerun numerical planning solely because selected IDs changed. This follows dependency correctness, not an excuse for an unmeasured multi-entry cache.
- Confirm expected complexity O(N+K) for numerical accumulation and bounded displayed rows. Do not compute every pairwise group-overlap score (O(K²)). All-group range intersection is O(K).
- Investigate any >50 ms main-thread task or visible input delay as a measured responsiveness issue. This threshold is an engineering investigation trigger, not an automatic row/category limit or statistical cutoff.

Only after measurements identify a bottleneck may Codex add:

- A bounded display window/virtualized table that preserves full analytic membership, accessible navigation and explicit “shown of total” counts.
- Dependency-local reuse tied to source revision, X/Y/G prepared values, external membership and exact facet identity. Do not rely on an unchecked short row-ID hash as the only correctness key.

Do not sample source records, merge categories, return a top-K decomposition, or add a service/backend to pass the probe. If the measured implementation cannot meet the intended scale, report the specific workload and change the implementation plan with Byron; do not silently reduce the mathematical population.

## 8. Verification run sheet

These commands are **for the implementing checkout**, not commands claimed to have run in this Methods mission. Confirm final proposed test paths after creating the files. Use the repository's shared test time limits; no ad hoc test/config timeouts.

```bash
# 1. Targeted library numerical, typed-filter, UI and persistence checks.
pnpm --filter exploreda exec vitest run \
  src/components/charts/ScatterPlot/groupComparison.test.ts \
  src/components/charts/ScatterPlot/GroupComparison.test.tsx \
  src/lib/categoryFilter.test.ts \
  src/utils/groupComparisonPersistence.test.ts

# 2. Add the trace test in Milestone 2 if split into its own file.
pnpm --filter exploreda exec vitest run \
  src/components/charts/ScatterPlot/groupComparisonTrace.test.ts

# 3. Preserve directly affected current scope and fitting behavior.
pnpm --filter exploreda exec vitest run \
  src/components/charts/ScatterPlot/summaryMarginals.test.ts \
  src/components/charts/ScatterPlot/regression.test.ts
pnpm --filter exploreda check-types

# 4. Verify real example registration and Dashboard text round trips.
pnpm --filter demo exec vitest run \
  src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check
pnpm check:ui

# 5. Build the package before demo type checks after adding package types.
pnpm --filter exploreda build
pnpm --filter demo exec tsc --noEmit

# 6. Run the live example and real pointer/keyboard/performance checks.
# Use the printed dev URL; do not start a competing preview server.
pnpm dev:agent
pnpm shot /examples/scatter-group-comparison --name group-comparison
# In M2, also capture the weights example with its actual registered route.
pnpm shot /examples/scatter-group-comparison-weights --name group-weights

# 7. Docs browser verification (actual keyboard/Alt tests live separately).
pnpm --filter demo build
pnpm --filter demo docs:verify -- -g '/docs/scatter$'

# 8. Package-visible feature: one minor changeset for each implementation PR.
pnpm changeset:add minor "Compare pooled and grouped numeric relationships with exact source records."

# 9. Run the broad gate once, from one checkout, after targeted work passes.
pnpm check
pnpm check:pr

# 10. Stop this checkout's development server when work is done.
pnpm dev:agent --stop
```

Do not run Milestone 2-only commands before those files/routes exist. Use the actual existing test runner forwarding syntax if the checkout's scripts differ. Add scoped browser E2E tests through the current demo test setup; no new Playwright installation is requested. For a PR, use the repository's screenshot attachment convention and user-focused description. This plan authorizes no commit or PR action by the research session.

## 9. Completion, dispositions and open decisions

### Build recommendations mapped to shipment

| Recommendation | Milestone | Acceptance anchor |
| --- | --- | --- |
| PG-01, PG-02 | 1 | Authored explicit G, common P, exact pairs and exclusion sets. |
| PG-03 | Core in 1; visible explanation in 2 | All T/W/B identities and same-denominator display. |
| PG-04 | 1; explained in 2 | Common-within coefficient with per-group slopes retained. |
| PG-05, PG-06 | 2; basic contributor trace in 1 | Weighted means and exact term/reference records. |
| PG-07 | 1 | C1–C5 canonical typed filter lifecycle. |
| PG-08, PG-09 | 1 and 2 | Scope invariance, statuses, all numeric edge fixtures. |
| PG-10 | 1 and 2 | Persistence, docs/example, real interaction and measured performance. |
| PG-11 | Counts/ranges in 1; explanation in 2 | X-range intersection and X-variation weights. |

Full PG-01–PG-17 Build/Explore/Defer/Avoid dispositions are in the report. PG-12 does not block these milestones; PG-13/14 are deferred; PG-15/16/17 specify choices to avoid. Do not make a delayed overlay, ranking or multilevel model a prerequisite for the bounded capability.

### Done means

- Both complete user flows work with the synthetic examples and current source data.
- Exact values and memberships match the independent fixtures; constant, missing, tiny and extreme cases have honest statuses.
- Every filter is visible, removable and persisted through the same canonical path; no dual state or positional group identity.
- Group statistics/term traces use their exact facet and common P; no synthetic mean masquerades as an original record.
- Other filters recompute; own selections do not. Numerical and displayed scope agree after save/reopen/refresh.
- The docs page, runnable example, coverage registration, target tests, browser evidence and measured performance are included with each milestone.
- Codex's implementation report identifies checks actually executed, measured results and any remaining limitations. Planned checks are never reported as passes.

### Open decisions with recommended defaults

There is no unresolved mathematical choice blocking implementation. Recommended defaults are selected throughout:

1. **Exact placement within existing details/trace components:** adapt to the inspected current dispatcher; keep a visible in-chart comparison and the native trace workflow.
2. **Filter parser/chip integration seam:** inspect the guide/import-indicated files and add the category variant through their actual exhaustive paths. The chosen serialized shape and typed matching contract stay fixed.
3. **Numerical guard implementation accounting:** validate the report's conservative engineering status policy against exact cancellation/scale fixtures; document any revised error accounting. Do not silently substitute a statistical magnitude threshold.
4. **Many-category presentation optimization:** decide from the measured product probe. Analytical membership remains uncapped.

**Access status:** complete supplied source packet read; no decisive missing input. **Files read:** all 39 inventory files, listed in the methods report, plus the mission. **Checks executed here:** exact rational/independent NumPy research checks and an arithmetic-only reference performance probe. **Checks proposed:** all application, persistence, browser, integration and product-performance acceptance above. **Deliverables:** this plan and [methods-report.md](methods-report.md), with both included in the companion ZIP. **Open questions:** only the bounded integration/presentation decisions above; no further demand evidence is requested.
