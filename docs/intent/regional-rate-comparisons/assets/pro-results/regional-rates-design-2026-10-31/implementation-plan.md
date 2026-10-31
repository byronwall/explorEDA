# Implementation plan: comparable regional rates

**Build a saved Regional comparison whose grouped-rate query step owns numerator, exposure, coverage, and source evidence.** Its first release accepts event rows plus a separate exposure table, or a prepared region-period table, and opens a map with a ranked evidence table and a reusable notebook finding. The map reads the evaluated result; it does not independently divide fields. This feature does not depend on the pending reusable-output or quantity proposals.

Reviewed baseline: **`ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`** of [byronwall/explorEDA](https://github.com/byronwall/explorEDA/tree/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6). This is a design and implementation handoff. No application repository edits, builds, or browser tests were performed. `proposed-contract.ts` is a proposed API companion, not a patch or a claim that the baseline accepts its declarations.

## 1. Ordered outcomes

| Milestone | Independently useful outcome | Principal risk |
|---|---|---|
| **M1 — One complete comparison** | Create, inspect, save, export, and reopen one region/window/population/boundary comparison from either input shape; event-row mode also supports covered subtype filtering. Map, ranked table, basic pooled finding, and evidence agree. | A plausible result silently applies the wrong population, period, or observation coverage. |
| **M2 — Supported periods and populations** | Compare supported time windows and disjoint population strata; explicitly extract repeated exposure and optionally collapse identical denominator duplicates. | Reusing or summing a denominator across overlapping windows or facet copies. |
| **M3 — Comparison findings and host integration** | Reuse selected-group comparisons in richer notebook narratives, multiple synchronized views, and controlled embedded workflows. | View scope or host echoes make prose disagree with the underlying evidence or create repeated undo steps. |
| **M4 — Explicit uncertainty** | Optionally display intervals under a named, appropriate count model while retaining the raw observed rates and exact evidence. | An interval appears authoritative despite an unsuitable model or uncertain denominator. |

M1 is deliberately a complete feature slice. Its internal work packages below can be developed and reviewed in order, but a pure arithmetic engine or a recipe is not the first user-facing release. M2–M4 build on M1; none is a prerequisite for it.

The recommendation IDs refer to the report. M1 implements **RR-01–05, RR-07–17** and respects **RR-23**. M2 implements **RR-18–19**. M3 extends **RR-16–17**. M4 explores and, with a declared method, implements **RR-06**. Eligible-entity proportions (**RR-20**), smoothing/standardization/crosswalks (**RR-21**), and a universal semantic layer (**RR-22**) remain separate decisions.

## 2. Source-grounded starting points

These are facts from the complete files in the supplied packet. They determine the necessary integration work.

| Inspected file and symbol | Existing capability | Necessary change |
|---|---|---|
| `src/types/AnalysisProject.ts` — `AnalysisStep`, `AnalysisResultRow`, `AnalysisStage` | Source, lookup, expand, calculate, filter, and aggregate steps; role-neutral source refs and scalar output rows. | Add a bounded two-input grouped-rate step and role-separated rate evidence. |
| `src/lib/analysis/evaluateProject.ts` — `validateQuery`, `evaluateAnalysisQuery` | Traverses a single `inputStepId` for each non-source step. | Traverse both rate predecessors; preserve both input counts and source dependencies. |
| Same file — `lookupFrame`, `aggregateFrame` | Lookup reads a raw related source table; aggregation can reduce repeated entities, but groups arise from input rows. | Do not treat lookup plus ordinary aggregate as a complete rate workflow. The new operation validates denominator grain and creates zero-event groups from declared exposure/coverage. |
| `src/lib/analysis/projectFile.ts` — `selectAnalysisProjectView`, `validateAnalysisProjectFile` | Validates known step kinds and exports the reachable one-input closure. | Validate and retain both branches and their sources during selected-view export. |
| `src/lib/dsl/project.ts` — `stepLines`, `compileStep`, `checkReferences` | Explicit parser/exporter branches; the preceding step is an implicit input; references must name earlier steps. | Add an explicit two-input declaration and complete semantic round trips. |
| `src/components/charts/Map/definition.ts` — `MapSettings` | Map's scalar aggregations are count, sum, and average. | Add a rate binding/mode, not `"rate"` to the scalar aggregation enum. |
| `src/lib/aggregates.ts` — `AGGREGATIONS`, `summarizeGroup`, `poolAggregateRows` | Shared aggregates additionally support max/min, tracing, and reconstruction from contributors. | Reuse parsing/reduction discipline and evidence types; pool N and D separately rather than reducing displayed ratios. |
| `src/components/charts/Map/regionMapPlan.ts` — `planRegionMap`, `regionFilters` | Typed geometry keys, duplicate polygons grouped as one region, one-source scalar plans; empty source-ID sets cannot create a region filter. | Add result-group binding and a selection that exists independently of event rows. |
| `src/components/charts/Map/RegionMap.tsx` — `RegionMap`, `select` | Empty regions open inspection; zoom detail can change geographic levels. | Rate mode must select a zero-event semantic group and pin its boundary version during pan/zoom. |
| `src/components/charts/Map/useMapData.ts` and `RegionTraceBody.tsx` | One-provider raw data and conversion tracing; region/source/encoding evidence. | Add a rate adapter and separate numerator/exposure/coverage trace sections. |
| `src/lib/notebook/readNotebook.ts` — `readNotebookText` | Evaluates one query with `{}` bindings and passes only `row.data` to notebook compilation. | Retain runtime analysis context and propagate availability/diagnostics, instead of discarding two-source evidence. |
| `src/lib/notebook/findings.ts` — `ComparisonFinding`, `compareFindings` | Share means count/count with row-set containment and percent formatting. | Add a dedicated rate finding; do not overload share. |
| `src/lib/project/folder.ts` — `readProjectFolder` | Missing sources are recorded in `missingSources` while their table is set to `[]`. | Pass source availability explicitly so a failed read cannot become an observed zero. |
| `src/lib/project/writeFolder.ts` — `projectFileText`, `analysisFileText` | Preserves declared source forms, paths, and explicit queries. | Persist the rate query and both source paths; recompute evidence on reopen. |
| `src/providers/DataLayerProvider.tsx`, `src/utils/saveDataUtils.ts`, `src/lib/notebook/writeBack.ts` | Existing host state, saved-settings validation, and notebook write-back seams. | Integrate rate bindings and group selections without saving raw source rows into settings callbacks or discarding the new declarations. |

All `src/` paths in this table are under `packages/explorEDA/`. Keep the existing React and TypeScript stack and pnpm workspace. The [agent guide](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/agent-guide.md) and [UI defaults](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/ui-defaults.md) supply the project-specific integration and verification rules.

### Files outside the packet

The packet is sufficient for this design, but it is not a runnable checkout. Before implementation, read the actual definitions of `ChartTypes`, `SavedDataStructure`, the project host wrapper, the dashboard DSL compiler/exporter and setting keys, the notebook declaration compiler, and the worker/coordinator modules imported by the inspected files. The agent guide names relevant demo registration, coverage, and live-example files; their bodies were not supplied. Proposed work below does not claim those unprovided files already support rates or two-source provenance.

The worker integration must be fitted to the checked-out implementation. Do not introduce a second worker infrastructure merely because this plan proposes a serializable rate request/result.

## 3. M1 — A complete bounded Regional comparison

### 3.1 User-visible boundary

Ship all of the following together:

- **Two input modes.** Event rows plus a separate exposure table; or one prepared table with numerator, exposure, grain, and coverage columns.
- **One exact comparison scope.** One half-open observation window, one explicit population definition, and one pinned boundary system/version. Start with UTC boundaries. Other interpretations fail visibly until supported.
- **Explicit numerator meaning.** Event mode counts one raw event occurrence per row. Each branch row must have exactly one source ref for `occurrenceSourceId`, and no such occurrence may appear in multiple branch rows. A preaggregate containing eight event refs is not one event; it belongs in prepared mode. Prepared mode reads one nonnegative safe-integer event count per full grain through a sum measure. A row count is not distinct people; a preceding expansion must not duplicate a raw event occurrence. Require a visible one-event-per-row assertion for event mode. Broader bucketed/weighted rows require a later explicit input mode.
- **Strict exposure uniqueness.** One authoritative denominator row per full grain. Both identical duplicates and conflicts are unavailable in M1. Repeated exposure on event rows is diagnosed, not summed or silently averaged.
- **Coverage and availability.** Loaded-empty is distinct from source-unavailable. Complete, partial, unknown, and not-collected are explicit observation states. Coverage names a collection definition and the numerator categories it supports. An empty event input becomes an accepted zero only under complete collection for that cell; a missing prepared count remains missing.
- **Paired reading.** A rate map and a ranked comparison table show region, observed/accepted numerator as appropriate, exposure, rate/unit, and status. They retain unavailable regions.
- **Evidence.** Alt-click/Alt-Enter opens role-specific original rows, raw/prepared values, exclusions, duplicate candidates, exact calculation, coverage assertion, and alignment metadata.
- **Saved use.** Query, map/table bindings, semantic selection, reference scale, and a basic pooled notebook finding survive text round trips, project export/import, and folder reopen. The embedded host receives settings changes once per committed edit.

A prepared file's trace terminates at its supplied prepared rows unless additional source provenance is actually supplied. Do not imply access to individual underlying events that were never imported.

### 3.2 Work package A: model, dependency graph, and pure computation

**Change inspected files:**

- `packages/explorEDA/src/types/AnalysisProject.ts` — add `GroupedRateStep` and rate result/evidence extension points.
- `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — evaluate both input frames, call the rate planner, carry availability, and include both dependencies in the result revision.
- `packages/explorEDA/src/lib/analysis/projectFile.ts` — support the new step in operation validation, graph traversal, field validation, and selected-view closure.

**Add proposed modules:**

- `src/lib/analysis/stepInputs.ts`: a small helper that returns `[]` for source, both IDs for grouped-rate, and the current unary ID for other steps. Use the same helper in every dependency walk.
- `src/lib/rates/types.ts`: bounded definitions and result states, based on `proposed-contract.ts`.
- `src/lib/rates/grain.ts`: typed region keys and canonical region/window/population/boundary identities, with no lossy string coercion.
- `src/lib/rates/evaluateGroupedRate.ts`: input validation, alignment, exact contributor partitions, coverage, strict denominator selection, and N/D calculation.
- `src/lib/rates/poolRateGroups.ts`: explicit strict pooling over selected mutually exclusive regional groups.

The saved step has `numeratorStepId`, `denominatorStepId`, and a versioned specification. It can reference the same predecessor twice for prepared input; the evidence roles still remain distinct. Retain `AnalysisProject.version: 1`; old readers must reject an unsupported step rather than partially load a plausible chart. A broader project format migration is unnecessary for this bounded extension.

The output is one comparison record per declared group, not one event with repeated population attached. Its key is a canonical typed tuple. Its scalar fields include numerator, exposure, rate, and status; its runtime evidence contains the original source references separately for numerator, denominator, coverage, and rejected candidates. Preserve an observed subtotal separately from an accepted complete-scope numerator. A valid denominator remains inspectable even when N or R is unavailable. Exposure errors alone do not erase a known N; zero D remains readable as zero although it cannot divide N. Preserve quantity-specific availability so a count or exposure view can show known values while the rate is unavailable.

Use the supplied value-parsing helpers through the existing imports. Do not call `Number` or `Date.parse` on raw rows. The basic arithmetic accepts finite nonnegative N and finite positive D; any invalid required contribution prevents a rate. Numeric sums cannot quietly discard invalid required numerator/exposure values the way a generic numeric summary may.

M1's numerator branch is declared for one population and boundary version. Mixed sources require an explicit upstream scope filter with retained exclusion evidence; unexpected incompatible numerator records reaching that branch block affected groups. Event timestamps are then tested against the requested window. The denominator branch may contain several supported grains: select exact-scope candidates before testing uniqueness, and preserve other-grain candidates as exclusions.

The output universe is the union of representable typed keys from the numerator and denominator inputs, plus any explicitly requested region keys. A known numerator key with missing D receives an unavailable comparison row; it must not disappear into an orphan summary. A region with complete coverage and a positive D can have an empty event contributor set and a valid zero rate. Explicitly requested absent keys create unavailable placeholders. Geometry-only features without a requested comparison/coverage cell remain unmatched geometry with a reconciliation entry; geometry itself proves neither zero nor population.

Unrepresentable region keys and invalid timestamps require more than an orphan ledger. An event known to fall within scope but lacking an assignable region can affect every candidate region, so block accepted rates for those potentially affected cells until the row is corrected or explicitly excluded with a documented rule. An invalid timestamp for a known region blocks that region when its window membership cannot be established. Keep the row in the orphan/rejected evidence as well. A coverage assertion cannot override malformed records whose membership is unresolved.

**Definition of done:** both inputs participate in cycle detection, field validation, dependency closure, revisions, and diagnostics; result membership is stable under source reordering when entity keys are stable; no scalar Map reducer is responsible for rate arithmetic.

### 3.3 Work package B: runtime availability, identity, and scope

**Change inspected files:** `evaluateProject.ts`, `folder.ts`, `DataLayerProvider.tsx`, and `readNotebook.ts`.

**Add proposed modules:** `src/lib/rates/scope.ts` and `src/lib/rates/resultAdapter.ts`.

- Carry an explicit availability map keyed by source ID into rate evaluation. Missing/unreadable sources in `readProjectFolder` must remain unavailable even though the legacy table map contains `[]`.
- Keep source occurrence references as `(sourceId, rowKey, evaluation revision, role)`. A source with no durable entity key may retain current-revision positional references, but those references do not become durable event identity.
- Build a transient adapter from current provider row IDs to stable comparison group keys and result records. A provider's `__ID` remains a local projection position, not an identifier to send to a second source.
- Separate **numerator-only predicates** from **comparison-scope selectors**. In event mode, a covered subtype filter changes N and its event contributors while D and its denominator contributor remain fixed. Unknown subtype collection coverage is unavailable. Prepared mode cannot filter an already aggregated total into an event subtype; a matching subtype grain is a later extension. Date, region, population, and boundary changes are comparison-scope operations; unsupported window/stratum requests are unavailable.
- Keep rate group selection independent of event membership. Selecting C in RR-F01 yields a selected comparison group, zero event rows, and the exposure record `dC`. No fake event row is necessary.
- Define empty selection explicitly in each consumer. A cleared chart selection means its full eligible comparison group set; an explicit empty group list means no groups. Do not use an empty event-ID set to guess either state.

M1 supports a dedicated event-subtype control in event mode and region group selection in both modes. Do not promise that arbitrary existing global field filters automatically map correctly across sources. An unsupported filter must be labeled as inapplicable/unavailable for the comparison, not silently applied to one branch because a field name happens to match. Authored coverage assertions attach to each comparison grain independently of D-row presence; denominator-field assertions attach to that denominator grain and cannot prove collection when its row is absent.

Worker payloads should carry plain rate definitions, source availability/revisions, and compact membership indices or source references. The public result must still materialize the exact contributor sets for tracing; pagination can limit what is shown, not what is known. Keep cancellation transport and result-revision checks aligned with the existing coordinator after reading its actual code. `AbortSignal` is host-side control and is not part of a structured-cloned worker payload.

**Definition of done:** a denominator-only refresh invalidates the rate; a stale worker result cannot replace a newer one; a failed event-source read never produces valid zeros; group selection survives loss/reordering of event rows without inventing durable identity for keyless source occurrences.

### 3.4 Work package C: Map and ranked evidence table

**Change inspected files:**

- `Map/definition.ts` — add an explicit binding to `queryId + stepId` and saved semantic group selection. Keep count/sum/average unchanged for ordinary maps.
- `Map/RegionMapSettings.tsx` — add Regional comparison input setup and the alignment preview.
- `Map/RegionMap.tsx`, `Map/regionMapPlan.ts` — read grouped-rate values/statuses and select semantic groups. Bypass automatic boundary-level substitution for a bound rate result.
- `Map/useMapData.ts`, `Map/regionTrace.ts`, `Map/RegionTraceBody.tsx` — consume the runtime result adapter and render two-source evidence.
- `src/utils/saveDataUtils.ts` — validate the new binding, selection, and scale settings.

**Add proposed modules:**

- `Map/rateMapPlan.ts`: geometry-to-comparison-result binding and color reference planning; no N/D arithmetic.
- `Map/RegionRateTraceBody.tsx`: role-specific rate evidence.
- `Map/RegionRateSetup.tsx`: compact source/field/scope/alignment controls using existing shared UI components.
- `src/components/rates/RegionalRateTable.tsx`: sorted comparison rows with the same selection and evidence adapter. Use an existing compatible table shell after reading it; do not create a second row store.

The default companion can be a table sorted by rate with clear values and an optional small bar column. It supplies a precise ranking and preserves tiny/unavailable regions. This avoids making a new generic chart family a prerequisite. A later specialized ranked chart must consume the same result, not recompute a rate from aggregated display rows.

The setup preview must distinguish key join success from statistical comparability. Show typed-key mismatch, duplicate/conflicting D, missing D, incomplete/unknown coverage, period mismatch, population mismatch, and boundary mismatch separately. A green geometry join cannot clear an unavailable rate.

The hover/header reading and trace show N, D, scale, full interval, unit, population/boundary identity, and status. Do not present unavailable as zero or use a palette endpoint for it. Display numbers with useful precision and make exact inputs available in the trace. Preserve the existing Alt-click/Alt-Enter interactions and use the existing temporary panels rather than a permanent extra inspector.

**Color behavior:** start from zero for nonnegative rates. Capture one reference domain over the declared valid comparison cells and reuse it for numerator-only filters and comparable facets. Keep separate captured bounds for Rate, Numerator, and Exposure; those quantities have different units and availability. Store the captured maximum, semantic scope/measure basis, and capture metadata for save/reopen. A denominator or scope change can exceed the reference; show true values and overflow, then offer an explicit reference rebase. The limited monotonicity proof is nonnegative numerator subsets with fixed positive exposure, not arbitrary ratio filtering. Manual shared bounds remain fixed. Do not copy the existing count/sum/average subset envelope or compute separate quantile classes for each comparison panel. Keep multiple polygons for one region as one analytical group.

**Definition of done:** map and table have the same values, statuses, selection, and trace; C is selectable at zero events; D remains unavailable with inspectable D; pan/zoom leaves the rate boundary version unchanged; duplicate polygons do not multiply numerator or exposure.

### 3.5 Work package D: query text, notebook, host callback, and reopen

**Change inspected files:** `lib/dsl/project.ts`, `lib/analysis/projectFile.ts`, `lib/notebook/readNotebook.ts`, `lib/notebook/findings.ts`, `lib/notebook/writeBack.ts`, `lib/project/folder.ts`, `lib/project/writeFolder.ts`, `utils/saveDataUtils.ts`, and `providers/DataLayerProvider.tsx`.

Inspect and update the unprovided DSL/notebook/type/host seams before choosing their exact additional edits.

1. **Project text.** Add a bounded `grouped-rate` declaration with both predecessor IDs explicit. Use readable child declarations for measure meaning/scale, numerator mapping, exposure mapping, window, population, boundary, coverage, and strict duplicate policy. The parser validates both earlier dependencies. Export every semantic setting; do not rely on generic settings export to understand source roles.
2. **Round trips.** JSON and text preserve field-versus-literal bindings, typed values, interval endpoints, population definition, boundary vintage, estimate reference date, estimate vintage, coverage assertion, both inputs, and scale. Estimate metadata must remain separate from observation support and geography version. Unknown semantics fail visibly.
3. **Notebook runtime.** Extend `NotebookContext` with optional bindings and source availability; keep the evaluated result/context alongside scalar rows. `readNotebookText` currently discards lineage after `.map(row => row.data)`; the rate path must preserve it and surface relevant diagnostics.
4. **Basic finding.** Add `RateFinding` for rate, numerator, or exposure of an explicitly selected group set. It calls `poolRateGroups` with the strict all-requested-members policy. The pool result retains requested/resolved/accepted groups, role contributor refs, incompatibilities/omissions, and a compatibility signature. Known pooled D can remain visible while the complete-scope rate is blocked. Its trace opens the same role-separated source records. This is not the existing count/share kind.
5. **Settings boundary.** Save definitions, chart bindings, semantic group keys, and presentation settings. Do not place raw tables, runtime source refs, worker caches, or result rows in `onStateChange` settings payloads. Full project bundles are the separate existing route that can include tables.
6. **One edit, one callback.** Apply the complete Regional comparison creation and associated layout atomically. Use the existing hold/edit transaction mechanism for continuous edits. Saving a matching host echo must not rebuild the data or create a new callback loop.
7. **Refresh.** Pass immutable replacement source arrays; recompute when either source, relevant metadata, source availability, or rate definition changes. Keep semantic selections and evaluate their current status. Do not treat the process-local table-array revision as a durable on-disk dataset identity.
8. **Folder reopen.** Keep both source path declarations and the explicit rate query in project text; keep view presentation and findings in analysis/notebook text. Reopen reads both sources, validates availability and alignment, and recomputes evidence. A missing source gives an unavailable comparison with actionable file context.
9. **Selected-view bundle.** Export closure includes both branches, relevant definitions, and both source tables. Tests must show that source evidence can still be inspected after reimport.

**Definition of done:** the same saved comparison reopens with the same semantic values and evidence roles; unavailable remains unavailable; no callback contains raw rows; and no supported edit creates multiple undo checkpoints.

#### Proposed text golden case

The following is the **proposed new author syntax**, not syntax accepted by the baseline. It is a complete semantic counterpart to `eventsAndPopulationExample` in the TypeScript companion. Its bounded child grammar distinguishes `field=` from `value=`; each child/property is whitelisted for this operation. Implement and test this representation before advertising text round trips. Preserve its October interval, the distinction between the population estimate's reference date and support window, and both input IDs.

```text
project @regional-rates-example

source @events key=id path=events.csv {
  field id string
  field region string
  field occurredAt date
  field subtype string
}

source @population key=id path=exposure.csv {
  field id string
  field region string
  field residents number
  field populationId string
  field boundarySystem string
  field boundaryVintage string
  field supportStart date
  field supportEnd date
  field referenceDate date
  field estimateVintage string
  field observationCoverage string
  field coverageNote string
}

query @regional-comparison glyph=R frame=regions {
  source @events-input events
  source @population-input population
  grouped-rate @regional-rates numerator=events-input denominator=population-input spec-version=1 {
    meaning crude-population scale=1000 title="Recorded service events per 1,000 residents"
    window start="2026-10-01T00:00:00Z" end="2026-11-01T00:00:00Z" time-zone=UTC
    population id=all-residents definition="Residents of the demo districts"
    boundary system=districts vintage=districts-v1
    unit id=persons label=residents
    numerator mode=events operation=count occurrence-source=events one-event-per-row=true row-meaning="One recorded service event, including repeated events for a resident" {
      region field=events.region
      occurred-at field=events.occurredAt
      population-id value=all-residents
      boundary-system value=districts
      boundary-vintage value=districts-v1
    }
    denominator duplicates=reject {
      region field=population.region
      exposure field=population.residents
      population-id field=population.populationId
      boundary-system field=population.boundarySystem
      boundary-vintage field=population.boundaryVintage
      unit-id value=persons
      support-start field=population.supportStart
      support-end field=population.supportEnd
      support-time-zone value=UTC
      estimate-reference-date field=population.referenceDate
      estimate-vintage field=population.estimateVintage
      estimate-methodology value="Published estimate explicitly adopted for this observation window"
    }
    coverage kind=denominator-field field=population.observationCoverage note-field=population.coverageNote scope=each-denominator-grain {
      collection id=service-events description="All service-event categories covered by the collection process"
      supported-categories all
    }
  }
}
```

The golden test compiles this new declaration into the exact `GroupedRateStep` example, exports it, recompiles it, and compares the semantic objects. Tests also replace a `field=` binding with a literal `value="population.region"` and require that literal to remain a literal. A second golden test exports/recompiles `preparedRowsExample`, including its same-stage two-role references. An authored coverage golden case uses `scope=each-comparison-grain`, independently of a denominator row; category-limited coverage writes explicit typed category values. Unsupported/unknown children or ambiguous duplicate settings are errors, not ignored interpretation changes.

### 3.6 M1 tests with exact expectations

Use `regional-rate-fixtures.json` as an independent expected-value oracle. It has a normalized fixture schema, not the proposed public TypeScript wire format. Add a small test adapter mapping its `denominator/status/(sourceId,rowId)` terms to the implementation's `exposure/state/SourceReference` fields. Keep expected numbers and memberships independently authored; do not regenerate expected values with the production planner.

**Pure evaluator tests — proposed `src/test/lib/rates/evaluateGroupedRate.test.ts`:**

- **RR-F01:** A has 12 events / 1,200 exposure → **10 per 1,000**; B has 8 / 200 → **40**; count ranking A>B reverses to rate ranking B>A. C has 0 / 400 with complete coverage → **0**. D has observed 0 / 500 with unknown collection → accepted N and rate **unavailable**, while D=500 remains readable.
- **RR-F02:** prepared rows reproduce the same accepted totals/rates and retain prepared-source evidence without inventing event records.
- **RR-F03, RR-F05, RR-F06, RR-F35:** repeated or conflicting D is not summed/averaged; strict duplicates block the affected cell and all candidate rows remain visible.
- **RR-F08–10:** successfully loaded-empty/complete events yield zero; unknown coverage and source-unavailable do not. Source-unavailable overrides stale complete-coverage metadata.
- **RR-F11–15:** zero, missing value, missing row, negative, and invalid exposure are distinct unavailable states.
- **RR-F16:** numeric region `1` and string region `"1"` remain distinct, producing **10** and **40** per 1,000 respectively.
- **RR-F17:** repair subtype gives A **3/1,200 × 1,000 = 5/2**, B **2/200 × 1,000 = 10**, C **0**; denominator contributor IDs are unchanged.
- **RR-F18:** include an event exactly at the start and exclude one exactly at the end of the half-open window.
- **RR-F19–21:** time, boundary, and population mismatches block a comparison despite matching region keys.
- **RR-F22:** partial collection keeps observed N=2 but cannot publish a full requested-scope rate.
- **RR-F23:** identical row-ID strings from two sources are still distinct source references.
- **RR-F24–26:** negative, missing, and invalid prepared numerators are not silently ignored.
- **RR-F28:** missing denominator source does not become an empty-but-valid denominator input.
- **RR-F29:** event intensity **3 / 1 = 3** is allowed; do not impose a probability ceiling of 1.
- **RR-F32:** fractional exposure 20.5 is valid where the declared unit allows it; expected scaled rate is **2000/41**, compared with a rational oracle or a tight floating tolerance.
- **RR-F33–34:** explicit not-collected and absent exposure for a region remain unavailable.
- **RR-F36–38:** reject fractional and unsafe-integer prepared counts; retain the maximum safe integer count exactly.
- **RR-F39–42:** an in-window unknown region blocks every possibly affected requested group; a known unmatched region gets its own unavailable row; invalid time blocks its known region; an extra other-period exposure remains a traced exclusion when an exact requested-period row exists.
- **RR-F43–45:** empty, duplicate, and unresolved selected group sets produce explicit diagnostics and no partial pooled rate.
- **RR-F46:** an invalid region on an event proven outside the requested window does not contaminate that window's groups.
- Add execution checks for exactly one event-source ref per event input row, duplicated raw event occurrences after expansion, an aggregate row carrying several event refs, unknown subtype coverage, and prepared-mode subtype rejection. These query/runtime cases supplement the normalized fixture oracle.

RR-F04 and RR-F07 are later explicit extraction/collapse cases, not M1's default behavior. RR-F30 and RR-F31 describe proportion boundaries for future eligible-entity semantics; M1 must reject unsupported proportion mode rather than pretending to verify it.

**Pooling — proposed `src/test/lib/rates/poolRateGroups.test.ts`:**

- RR-F01 A+B: pooled rate is **20/1,400 × 1,000 = 100/7**, not the mean regional rate **25**.
- RR-F01 A+B+C: pooled rate is **20/1,800 × 1,000 = 100/9**, not **50/3**. Exact numerator membership is `a01`–`a12` plus `b01`–`b08`; exposure membership is `dA`, `dB`, `dC` once each.
- A+B+C+D is unavailable under strict selected-member policy; D must not silently disappear. Exposure 2,300 and observed N=20 may remain diagnostic readings, but the complete-scope numerator/rate is unavailable.
- RR-F17 selected A+B+C after subtype filtering yields **5/1,800 × 1,000 = 25/9**, not mean **25/6**. It uses the filtered event contributors and unchanged D members.
- An explicit empty pool, a stale selected group key, repeated group keys, overlapping population groups, and incompatible scope/unit cannot produce an unlabeled pooled value.

**Query/serialization integration — extend `evaluateProject.test.ts` and add focused round-trip cases:**

- Two-branch cycles and missing dependencies fail; each denominator field mapping is checked against the correct frame.
- Denominator-only changes alter the result revision; unused sources do not.
- `selectAnalysisProjectView` retains the numerator and denominator source closure.
- JSON → text → compiled project → evaluation preserves both values and role memberships for event and prepared inputs.
- Field/literal metadata, strings that resemble numbers, and special scalar encoding do not collide.
- A valid empty events file and a missing events file remain distinguishable after folder reopen.

**Map/provider/notebook tests — extend `regionMap.test.tsx` and add focused suites:**

- RR-F27 selects C despite an empty event contributor set and opens `dC` from its exposure trace.
- Unknown-coverage D retains selection and shows unavailable status; it is not drawn as zero.
- Duplicate polygons share one rate result and one denominator.
- Zoom does not substitute a finer boundary for a rate-bound map.
- Subtype changes N without changing D or reference color bounds.
- Numerator-only filter and visible scope label agree in map, table, and finding.
- A source refresh yielding a rate beyond the captured reference shows overflow and the exact value; rebase is explicit.
- One creation/edit/drag transaction produces one host callback and one undo step; data refresh does not manufacture a user settings edit.
- Both resting notebook evaluation and live evaluation resolve the same group keys, rate, statuses, and evidence.

### 3.7 M1 documentation and runnable examples

Create these in the same milestone:

- **Docs:** `apps/demo/src/docs/pages/regional-rates.mdx`, with links from the existing `map.mdx`. Cover both input modes, one-window setup, coverage, fixed D under subtype filters, exact pooled versus mean reading, two-source trace, and unavailable states.
- **Live example:** proposed `apps/demo/src/demos/regionalRates.tsx`, using canonical RR-F01/RR-F17 data and versioned synthetic geometry. It must expose the reversal, C's selectable zero, D's unknown collection, subtype filter, and trace.
- **Folder example:** proposed `apps/demo/public/examples/regional-rates/` containing `exploreda.eda`, `comparison.eda.md`, `events.csv`, and `exposure.csv`, plus the geometry asset in the appropriate existing saved-asset format. The same example must reopen through the local folder product.
- **Registration:** update the actual `apps/demo/src/demos/examples.ts`, `coverage.ts`, docs catalogue/live-example registration, and relevant coverage expectations after reading those checkout files. The agent guide explicitly requires both registration and a runnable example; a docs page alone is insufficient.

Run scripted docs steps that select B, inspect its eight event rows and one exposure row, select C, apply the subtype filter, save/reopen, and verify a basic pooled finding. Check real pointer and keyboard behavior at **1280, 783, and 390 px**. A compact table may replace the side-by-side layout on narrow screens; source evidence and status must remain reachable.

**M1 main risk:** source availability, coverage, and rate validity drift apart because each consumer recomputes a different approximation. The shared result and mandatory evidence adapter are the defense against that design failure.

## 4. M2 — Supported windows, strata, and explicit repeated-exposure preparation

Implement **RR-18–19** after M1 supplies a reusable end-to-end path.

### Outcome and scope

Let an analyst choose supported complete windows or explicitly disjoint additive exposure intervals, compare population strata with matched denominator rows, and prepare a separate exposure input from repeated rows through a visible extraction action. Keep event-subtype facets distinct from population strata.

- A population estimate has a reference date and estimate vintage; its support window is an explicit analytical choice. Neither automatically supplies person-time nor validates a partial observation interval.
- Person-time or other additive exposure may be pooled over disjoint intervals when the unit and population definition match. Repeated population snapshots must not simply be summed to answer a unique-population question.
- A subtype facet can reuse one fixed population denominator, but facets may overlap. Their rates and denominators cannot be summed into a total without an explicit union/deduplication rule.
- A population stratum selector applies to both inputs through declared mappings. Missing denominator strata are unavailable, not filled from the whole population.
- An explicit **Extract exposure** operation may collapse identical repeated values per full grain; show the chosen arithmetic representative and every represented row. Conflicting values block extraction. It cannot discover populations for regions absent from the event source.

### Implementation

Extend `rates/types.ts`, `grain.ts`, `scope.ts`, `evaluateGroupedRate.ts`, and `poolRateGroups.ts`. Add proposed `src/lib/rates/prepareExposure.ts` for explicit extraction and a compact preparation preview. Extend the rate step/DSL with supported-window and stratum mappings using a new internal specification version if necessary; do not silently change the meaning of version 1.

Reuse `AnalysisSourceReference`, the existing entity-aware aggregate ideas, and existing filter/calculation preparation where they preserve the correct source records. Do not assume `entityFieldId` alone proves a composite denominator key or window compatibility. Every extracted denominator retains the original represented source refs and a clear reduction rule.

### Required tests

- **RR-F04:** explicit repeated-value extraction gives **3/200 × 1,000 = 15**. One exposure contribution represents `r1`–`r3`; all three remain evidence. The default strict path stays unavailable.
- **RR-F07:** explicit collapse of identical D rows gives **2/200 × 1,000 = 10**; both raw rows remain visible. **RR-F35** conflicts remain unavailable.
- Add exact intervals: 2 events/100 person-days and 3 events/150 person-days over disjoint days pool to **5/250 = 1/50 events per person-day**; their boundary-touching half-open intervals do not overlap. Overlapping intervals fail.
- Add two monthly snapshots of 100 residents: a request for a unique-population pooled rate cannot silently use D=200. If the user explicitly chooses exposure-time and the source supports that conversion, it is a different declared calculation with its own units.
- Reused D=200 across two subtype facets contributes once to a union summary. Overlapping event memberships are deduplicated only under an explicit stable event identity policy; otherwise the union is unavailable.
- Boundary version changes between windows remain unavailable without an explicit prepared concordance supplied by the user. No automatic boundary crosswalk is introduced.
- Windows/strata and extraction/collapse policy survive project/notebook text and selected-view bundle round trips.

### Docs, example, and risk

- **Docs:** add a “Supported windows and populations” section to `regional-rates.mdx` and a concise preparation page or section for repeated exposure.
- **Runnable example:** proposed `apps/demo/src/demos/regionalRatePeriods.tsx` plus a folder example `apps/demo/public/examples/regional-rate-periods/`, with disjoint person-time windows, overlapping facet membership, and a deliberately conflicting repeated denominator.
- Register both examples and their scripted steps through the same demo/docs mechanisms used in M1.

**Main risk:** an apparently additive denominator is really a repeated estimate, duplicated facet, or overlapping population. Require explicit unit, grain, and additivity semantics in the result and trace.

## 5. M3 — Reusable findings and synchronized embedded comparisons

Extend **RR-16–17** without introducing a general semantic layer.

### Outcome

Add richer notebook bindings for a single group, a selected-region pool, an explicit baseline comparison, and the count of unavailable selected groups. Allow a map, ranked view, and multiple narrative blocks to reference the same saved rate query. Basic rate findings remain available from M1; this milestone adds richer reuse and comparison scopes.

### Implementation

- Extend `lib/notebook/findings.ts` with explicit rate-comparison findings that consume already evaluated, compatible results and retain operand evidence. Ratios/differences between rates require compatible population, window, unit, and boundary semantics; labels must state the compared scopes.
- Extend the actual notebook declaration compiler and `writeBack.ts` to retain authored finding definitions and surrounding prose. Runtime result revisions are not embedded into every prose edit.
- Extend `resultAdapter.ts` so all consumers use the same semantic selection and result revision. A chart is a presentation owner; its transient numeric row IDs are not the shared selection model.
- Inspect and update the actual project-host wrapper and provider bindings to support controlled external group selection, immutable source updates, stale-selection diagnostics, and one atomic edit/callback. Reuse the existing hold-state-change mechanism; do not add a second undo architecture.
- Keep source evidence privacy boundaries explicit in the API. The normal settings callback contains definitions and selections. A host that wants full tables uses the existing project bundle or a separately requested data export.

### Required tests

- A notebook pool over A+B+C is **100/9**, and selecting D makes it unavailable; no consumer silently drops D.
- Repair subtype changes the same pool to **25/9**; all prose, table, and map read the same evaluation revision.
- With two charts, each finding states whether it follows that chart's group selection, an explicit saved group set, or a named comparison scope. Existing count/share finding semantics remain unchanged.
- A group-key selection survives source reordering and zero event membership. A disappeared/changed boundary group becomes an unresolved selection, not an unrelated row at the old numeric index.
- An echoed settings object with the same semantic content does not trigger a full restore or a second callback. A meaningful external replacement does.
- Slow evaluation A followed by newer evaluation B cannot let A overwrite B's chart or finding.
- Notebook write-back preserves surrounding Markdown and unrelated chart/finding declarations while retaining the new rate binding.

### Docs, example, and risk

- **Docs:** add “Rate findings and embedded hosts” to `regional-rates.mdx`, including the callback/data boundary and selection scope.
- **Runnable example:** proposed `apps/demo/src/demos/regionalRateNotebook.tsx`, plus an embedded-host example with a controlled subtype selector, external typed group selection, and replaceable exposure data. Include the corresponding `.eda.md` notebook in the folder example.

**Main risk:** implicit filter inheritance produces narratives that describe different groups from the chart. Each finding must name its result, member set, and compatible scope; one result revision supplies its value and records.

## 6. M4 — Optional intervals under a declared model

This is **Explore → Build when the method and inputs are explicit**, not an outside-demand gate. Keep descriptive raw rates useful without intervals.

### Outcome and method boundary

Offer a named interval for nonnegative integer event counts under a Poisson count model with exposure treated as known and fixed. Poisson here means a model for random event counts over a fixed exposure; it is not a blanket description of every recorded dataset. Repeated correlated events, changing intensity, clustering, overdispersion, and estimated D need different treatment or clear limits. Arbitrary weighted sums are not automatically Poisson counts.

Do not add smoothing, causal interpretation, automatic age standardization, or spatial borrowing in this milestone. The source rate and N/D evidence remain the primary result. Display intervals in the ranked/table companion; avoid turning map opacity into an unexplained precision code.

### Implementation and exact tests

Add proposed `src/lib/rates/intervals.ts` and explicit interval metadata on the rate result: method, level, assumptions, denominator treatment, and unrounded bounds. Extend the trace and ranked table. Pin a vetted numerical method for the required quantiles after checking the actual dependency set; do not silently approximate with a symmetric normal interval for very small N.

For N=0, the Poisson probability is `P(N=0 | μ) = exp(-μ)`. The two-sided 95% exact upper count limit solves `exp(-μ) = 0.025`, so `μ = -ln(0.025)`. For exposure E and display multiplier k, the upper rate is **`k × [-ln(0.025)] / E`**, lower bound 0. A one-sided 95% upper limit instead uses **`-ln(0.05)`**. These are different statements and must have different labels.

- For N=0, E=400, k=1,000, the two-sided 95% upper rate is **`2.5 × ln(40) ≈ 9.2221986353`**, not zero.
- The one-sided 95% upper rate for that cell is **`2.5 × ln(20) ≈ 7.4893306839`**.
- Increasing E with the same N shrinks the rate interval in inverse proportion to E.
- Zero/missing/invalid E, unknown coverage, or source-unavailable still produces no rate interval.
- Noninteger weighted N is rejected by this interval mode. Supporting descriptive weighted numerators requires a separately declared future input mode; M1 does not accept them.
- Display rounding never drives ordering, interval overlap checks, or exported bounds.

The exact zero-count derivation follows directly from the Poisson probability model. [NIST's Poisson distribution reference](https://www.itl.nist.gov/div898/handbook/eda/section3/eda366j.htm) is a primary method reference to retain alongside the tested numerical implementation. The report provides the broader primary-source context and cautions.

### Docs, example, and risk

- **Docs:** proposed `apps/demo/src/docs/pages/regional-rate-uncertainty.mdx`, linked from the main rate page, explaining model conditions, small counts, estimated D, and the difference between one-sided and two-sided limits.
- **Runnable example:** proposed `apps/demo/src/demos/regionalRateUncertainty.tsx`, with equal point rates but different counts/exposures and the exact zero-event case above. Its scripted trace must expose the model and full denominator.

**Main risk:** an interval communicates unwarranted precision. Keep model assumptions and denominator treatment visible, and preserve unavailable states instead of manufacturing an interval for unsupported inputs.

## 7. Verification run sheet for Codex

Run these from a real checkout after implementation. Paths ending in newly proposed test names are created by the milestones; they do not exist at the reviewed baseline. Inspect the checkout's scripts and the unprovided registration/worker files before running. The agent guide requires the demo and broad checks; targeted tests alone are not sufficient for a shipped UI feature.

```bash
# Install with the repository's pinned pnpm version.
pnpm install

# M1 pure rates, pooling, query integration, and map behavior.
pnpm --filter exploreda exec vitest run src/test/lib/rates/evaluateGroupedRate.test.ts src/test/lib/rates/poolRateGroups.test.ts src/test/lib/analysis/evaluateProject.test.ts src/components/charts/Map/regionMap.test.tsx

# Run the new focused persistence/provider/notebook test files created in M1.
# Use their actual checked-in names; do not substitute only snapshot tests.
pnpm --filter exploreda check-types

# Demo registration and every example's text round trip.
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts

# Documentation gate, live examples, and prescribed widths.
pnpm --filter demo docs:check
pnpm --filter demo build
pnpm --filter demo docs:verify -- -g regional-rates

# Inspect the real UI with pointer and keyboard at 1280, 783, and 390 px.
# Use the route registered for the new example and the repo's screenshot tool.
pnpm shot /examples/regional-rates --name regional-rates

# After feature verification, run the full repository gate once.
pnpm check

# Package-visible feature work needs a minor changeset.
# Codex owns repository integration; do not version or publish from this handoff.
pnpm changeset:add minor "Compare regional event rates with explicit exposure, coverage, and source evidence."
```

Use the shared test time limits from `@repo/test-config`. Do not run `pnpm check` concurrently in multiple worktrees. Screenshots and actual implementation/browser verification belong to Codex's integration work; the visual companions supplied with this Design mission are original proposals, not evidence that the application already renders them.

## 8. Delivery and acceptance checklist

### First release acceptance

- [ ] Both required input shapes can create a comparison without a custom formula recipe.
- [ ] Explicit region/window/population/boundary grain, coverage, and source availability are part of evaluation.
- [ ] Repeated D is never multiplied by event row count; duplicate/conflict candidates are inspectable.
- [ ] C's complete zero and D's unknown collection have different values, appearances, and traces.
- [ ] Numerator subtype filtering preserves D and its contributor identity.
- [ ] Map, ranked table, notebook finding, and exported result agree on exact accepted members.
- [ ] Typed group selection survives zero events and source reordering; no cross-source global `__ID` assumption exists.
- [ ] Pooled rates divide total N by total D over the same explicit members; no silent mean or omission.
- [ ] Saved query/view/DSL/bundle/folder reopen retains both inputs and semantic selection.
- [ ] Host callbacks remain settings-only and transactional; stale refresh results cannot overwrite current results.
- [ ] Docs page, registered runnable demo, folder example, and prescribed browser checks ship in M1.

### Open implementation choices with recommended defaults

- **Source coverage metadata location:** begin with a denominator-row coverage field or a scoped authored assertion. A separate generic third source is unnecessary in M1.
- **Provider interface naming:** use an optional rate/analysis runtime adapter alongside scalar data. Keep it narrow and preserve existing consumers; do not require a new universal result registry.
- **Prepared count versus weighted amount:** M1 accepts one nonnegative safe-integer count per full prepared grain. Weighted amounts or bucketed event rows require a later explicit mode and meaning; do not combine them with the one-event-per-row assertion.
- **Duplicate extraction:** strict rejection in M1. Add explicit collapse/extraction in M2 with full represented-row evidence; never turn a first-match implementation detail into policy.
- **Calendar/time-zone support:** UTC exact windows in M1. Add local calendar semantics only with explicit time-zone boundary tests; the source's last observed event is never the window endpoint.
- **Captured reference scale:** keep a declared shared reference and explicit rebase. Avoid treating a process-local runtime revision as a portable saved source fingerprint.
- **Large-source evidence:** retain exact compact memberships and page their display. A preview limit must be visible and cannot change computation or silently truncate contributors.

These choices are implementation details within the authorized feature, not a request for an adoption study or an outside user before building.

## 9. Access and verification status

- **Access:** the supplied complete-file packet contains 34 full files at the stated baseline. The decisive current map, aggregation, project, evaluator, persistence, notebook, provider, and UI evidence was available.
- **Read for this plan:** the complete `AnalysisProject.ts`, `evaluateProject.ts`, evaluator tests, `projectFile.ts`, `lib/dsl/project.ts`, `readNotebook.ts`, `findings.ts`, `folder.ts`, and `writeFolder.ts`, plus governing docs; the root's and map review's packet findings supply the provider/map/write-back integration evidence summarized above.
- **Checked:** source-level contracts and call boundaries; the exact fixture companion's **46 synthetic cases passed 2,849 assertions** in its accompanying verifier. Its arithmetic/membership check is an oracle check, not an application test run. Node 24's TypeScript syntax stripper successfully parsed `proposed-contract.ts`, and both exported configuration examples evaluated with their expected event/prepared modes and October 2026 window. This is a syntax/example check, not TypeScript type checking.
- **Proposed:** all new step kinds, modules, APIs, UI interactions, DSL syntax, milestones, docs/examples, and tests in this plan. The baseline does not already implement them.
- **Not executed:** repository build, TypeScript compilation against a full checkout, existing repository tests, new application tests, or browser flows. Codex owns those checks and repository integration.

Companions: [report.md](report.md), [proposed-contract.ts](proposed-contract.ts), [regional-rate-fixtures.json](regional-rate-fixtures.json), and the fixture documentation/verifier supplied alongside them. The final chat response links every original downloadable artifact and the combined ZIP.
