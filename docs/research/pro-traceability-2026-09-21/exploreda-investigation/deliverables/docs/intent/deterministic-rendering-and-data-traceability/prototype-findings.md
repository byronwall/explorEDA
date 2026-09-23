# Prototype findings: immutable scatter planning and compact lineage

## Status and hypothesis

**Status: PARTIAL.** One bounded experimental vertical slice was retained. Its two related hypotheses were:

1. A non-React planner can consume explicit filtered row-ID populations and produce deterministic point geometry with source references, without querying Crossfilter or the store during drawing.
2. Shared domain-population references avoid the N×M row expansion that a naive complete trace could introduce, while the same plan can feed a real SVG serializer and a non-DOM recording adapter.

The experiment supports those limited claims. It does **not** establish production equivalence with ScatterPlot/BaseChart, stale-calculation safety in the real provider, live Crossfilter semantics at runtime, a full eleven-family scene implementation, or memory/performance on the complete calculated-orders demo.

The architecture decision is documented in [architecture-options.md](architecture-options.md); the exact migration gates are in [implementation-plan.md](implementation-plan.md). Repository source was inspected at `593ca2e1f9210d5bc66985437afc37fcfcd8a56a`. No clone, branch, commit or push was created.

## 1. Why this experiment rather than a chart rewrite

The inspected scatter currently combines full-column scales, per-chart group rows, own-filter dimming, Canvas drawing and array-index hit testing. The wrapper publishes `group.all()` references. These are small enough to isolate but consequential enough to falsify a bad boundary: using only globally filtered IDs removes the chart's own dimmed marks; passing live group objects lets old plans silently change. [ScatterPlot][scatter], [CrossfilterWrapper][crossfilter], [live hooks][live].

The source already contains pure aggregation/reduction/statistics functions. Writing another generic transform engine would not test the crucial boundary and would duplicate those assets. No new dependency was introduced. No production component imports the experimental modules. No public exports, saved formats, package manifests or lockfile changed.

## 2. Retained source and test files

All paths are relative to the repository root; the fallback ZIP preserves them under `deliverables/`.

| Added file | Purpose |
|---|---|
| `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.prototype.ts` | Captures owned ID/column snapshots; validates population consistency; computes linear/symlog point positions; records exclusions; exposes a lazy point trace. |
| `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.prototypeAdapters.ts` | Sends a completed plan to a minimal point sink and serializes valid SVG. No store, raw rows, React or Crossfilter import. |
| `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.prototype.test.ts` | Four focused Vitest cases, including a real CrossfilterWrapper + two chart definitions. **Written, not executed in the repository.** |

The three requested Markdown documents are also new files under `docs/intent/deterministic-rendering-and-data-traceability/`. The patch contains exactly these six files. It does not replace existing chart code.

Outside the patch, the verification bundle contains `run-probe.cjs`, `check-svg.py`, compiled copies of the two pure modules, an executed small plan/input, generated SVG/PNG, `results.json`, `svg-validation.json`, and command/access logs. Those are local fallback evidence, not extra repository changes or package dependencies.

## 3. Experimental contract and deliberate limits

`captureScatterProbe` accepts source IDs, actual group-entry records supplied by a coordinator, actual all-filter IDs, optional facet IDs, requested columns and a revision. It immediately copies/freezes ID arrays and columns. `planScatterProbe` takes that snapshot and plain settings; it emits marks, scales, exclusions and a clip rectangle. Each point has a source row, field names and control references. Each scale references the shared `all` population rather than storing another N-row array on each point.

Own-filter failures remain marks with opacity 0.15; other-filter failures are excluded. Coordinate failures are accounted for individually. Source traversal classifies exclusions in precedence order: other filter, facet, coordinate. This is a **first-failure disposition**, not a full list of every failed predicate. Specific other-chart filter reasons are not invented: the probe says that a predicate failed but does not know which one because it only receives resolved IDs.

The probe copies its two requested columns. This costs O(NF) and is not claimed to be the final shared-column cache. The target may publish owned immutable columns once per revision, after establishing that existing lazy caches cannot mutate them behind the planner.

Layout margins, colors and point style are supplied. The probe does not migrate BaseChart ticks, text metrics, chart title, legends, pointer brushing or hover UI. It uses the source's 2D coordinate-coercion policy and explicit symlog math, but has not been compared against the installed D3 version. An empty numeric domain has a documented probe-only [0,1] fallback. An explicit empty facet emits no marks and a diagnostic noting the legacy helper discrepancy. Those policies must not be silently installed in production.

A point trace resolves its prepared source-row identity and shared scale population. Full conversion/calculation expansion is deliberately not reimplemented; the target plan delegates to the existing field settings and CalculationManager evidence. [field conversion][conversion], [calculation manager][calculation], [calculation inspector][calc-trace].

## 4. Commands actually run

### Access preflight

```sh
# Executed in the available runtime, before any attempted repository mutation.
git --version
command -v node
command -v pnpm
GIT_TERMINAL_PROMPT=0 git ls-remote https://github.com/byronwall/explorEDA.git \
  refs/heads/main refs/heads/codex/deterministic-rendering-data-traceability
```

Git transport failed with:

```text
fatal: unable to access 'https://github.com/byronwall/explorEDA.git/': Could not resolve host: github.com
```

Connected GitHub metadata and source reads succeeded. `main` was verified again at the end of investigation and remained at the base SHA. Account push permission does not supply an authenticated transport in the local runtime. There was no checkout on which to run `git status --short`, no branch creation, and no staged diff/commit/push to report.

### Isolated compilation and verification

```sh
# These are standalone fallback checks, not pnpm or the repository suite.
node /opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/bin/tsc --version
# Reported TypeScript 5.8.3.

node /opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/bin/tsc \
  --strict --noUncheckedIndexedAccess --target es2022 --module commonjs \
  --outDir /mnt/data/exploreda-investigation/verification/compiled \
  /mnt/data/exploreda-investigation/deliverables/packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.prototype.ts \
  /mnt/data/exploreda-investigation/deliverables/packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.prototypeAdapters.ts

node /mnt/data/exploreda-investigation/verification/run-probe.cjs
python /mnt/data/exploreda-investigation/verification/check-svg.py
```

Only the two pure modules were typechecked with the available global TypeScript. The Vitest file's imports from the real repository were not typechecked or executed here. Node used its standard library for the isolated assertions and benchmark; no npm/yarn installation or substitute project dependency tree was created.

### Required repository commands: unavailable

The runtime could not launch `pnpm check`, `pnpm --filter exploreda test`, `pnpm --filter exploreda check-types`, or `pnpm --filter exploreda build`: each attempt returned `No such file or directory: 'pnpm'`. These are **not run**, not failures of the repository and not unrelated baseline test failures. No full-validation claim is made.

## 5. Observed isolated results

**12/12 standalone assertion groups passed:**

- repeatability of plan and serialized SVG.
- self-filter dims; other filters remove; coordinate omissions accounted.
- shared domain keeps a filtered-out extreme; values have one source.
- snapshots are isolated from subsequent alias mutations.
- facets use explicit membership; empty is not unrestricted.
- stable mark identity survives parameter/filter revisions.
- drawing uses the plan only; adapter identity matches the marks.
- bad identities, inconsistent scopes and viewport reject atomically.
- equal-valued domains produce finite center points.
- linear and symlog paths finite; current 2D coercion remains explicit.
- draw order follows the captured group order, not a new sort.
- input values do not leak into the serialized mark plan.

Strict compilation of the two pure modules succeeded. The SVG output was also loaded in Chromium 144.0.7559.96 with networking blocked. Both circle identities, coordinates and opacities matched the executed plan; there were zero requests and zero JavaScript errors. This tests the minimal SVG adapter, not the repository's browser UI. Browser content loading was used, not a local-file launch.

The real-wrapper Vitest case is supplied to test the exact two-dimension situation in an installed checkout. It is **pending**, rather than simulated with a mock that would tautologically implement the expected semantics. Its assertions require own-group IDs `[0,1]`, all-filter IDs `[1]`, a dimmed point 0, a selected point 1, and unchanged old snapshot membership after another filter update.

### Isolated 10,000-row measurement

Dataset: a local adaptation of the pinned `shop_operations` generator's seeded branch, preserving its random-draw sequence. Requested x/y columns evaluate the declared Net sales and Contribution arithmetic directly from generated/rounded numeric inputs. This is **not** the repository CSV parser, CalculationManager, all fourteen calculations, or the rendered fourteen-panel demo. Source generator and formulas were inspected, but generated rows were not hash-compared with the committed CSV. [generator][generator], [dashboard calculations][dashboard], [calculated-orders entry][demo].

Environment: Node v22.16.0, Linux x64. Five warmups, 30 measured iterations. One other-chart region restriction retains 5,000 of 10,000 rows; an illustrative own condition selects 3,374 of those. All 5,000 other-filter survivors remain planned points, with appropriate own-filter emphasis.

| Operation | Median | p95 |
|---|---:|---:|
| Snapshot copy/capture | 2.674 ms | 4.664 ms |
| Pure scatter planning | 6.207 ms | 8.369 ms |
| SVG serialization | 6.683 ms | 9.024 ms |

| Serialized/storage measure | Observed value |
|---|---:|
| Planned points | 5,000 |
| Excluded source rows | 5,000 |
| Whole plan, UTF-8 JSON bytes | 2,587,496 |
| Scope arrays, UTF-8 JSON bytes | 89,872 |
| Per-point lineage objects, UTF-8 JSON bytes | 824,445 |
| Shared population memberships across all/others/all-pass | 18,374 |
| Point-to-source row references | 5,000 |
| Scale-to-shared-population references | 2 |
| Scale-population arrays copied per point | 0 |

Serialized bytes are not heap allocation. No peak heap, GC retention, React commit time, GPU draw time or production speedup was measured. Timing this isolated adaptation cannot establish a budget for the actual calculated-orders workflow; it only shows that the bounded prototype executes at this size and where to measure next.

## 6. What the experiment changes in the plan

**Retain the snapshot boundary.** Owned ID/column captures do not change after simulated upstream mutations. The planner can reject inconsistent all-pass/others-pass sets before producing any partial output. Production still needs a state-level revision-coherence test, because validation of subset relationships cannot detect every stale-but-plausible combination.

**Retain shared domain references.** An extreme row removed by another filter still affects a full-data scatter scale. The point's value reference remains its own row. This makes the two influence types inspectable without storing the entire domain population on every point.

**Reject “one verbose debug object per point” as the final storage model.** The measured plan is about 2.59 MB for 5,000 marks, including about 0.82 MB of repeatedly serialized field/control labels. The target puts common bindings on a layer and retains only compact row/result references per point. This result does not justify a generic graph engine, but it does justify separating shared descriptors from per-mark geometry.

**Do not count an empty-facet correction as harmless extraction.** The prototype's []=empty contract is unambiguous, but differs from one legacy hook. Production opt-in must characterize and contain that mismatch before changing behavior.

**Do not declare renderer parity from serialization alone.** SVG and a recording sink can consume the same completed point plan without raw data. Existing D3 ticks, margin rules, Canvas DPR, interactions, tables and Three.js remain explicit follow-up tests. A type union that can represent them is not an executed adapter.

**Retain only this bounded prototype.** No second chart rewrite, generic operator scheduler, custom formula evaluator or new trace UI was added. Rejected alternatives were architectural directions, not fabricated experiments claimed to have been run.

## 7. Patch, validation and reproduction

The fallback includes `exploreda-deterministic-rendering-data-traceability.patch`, a new-file patch containing the three docs and three experimental source/test files. It must be applied from a real checkout root after verifying the base SHA and authorized branch. No existing manifest, source file or lockfile is replaced by this patch.

Patch verification in this runtime is limited to applying it in a clean scratch directory and comparing recovered bytes with the authored files. This checks patch syntax and new-file content, not merge compatibility, project compilation, tests or branch status in explorEDA. The machine-readable verification log is included in the ZIP.

A guarded `apply-and-validate.sh` run sheet is included outside the patch. It refuses a wrong repo, dirty checkout, moved main, existing requested branch or missing/wrong pnpm; applies and validates the patch; verifies author and committer identities; creates separate prototype/document commits only after successful checks; and pushes only the named branch. It does not open a pull request. It was **not executed** against a repository here.

To repeat isolated checks without installed repository dependencies, use the included compiled modules and `node verification/run-probe.cjs` from the extracted bundle. That reuses generated code rather than testing TypeScript project integration. For real validation, use pnpm in the checkout and run the retained Vitest test, typecheck, package build and full `pnpm check`. Do not replace a failed integrated test with the isolated result.

## 8. Remaining gates

Mutation remains NO-GO until an environment can clone/read the exact base, create the exact branch and authenticate a push. The smallest unblock is a writable checkout with GitHub network/credentials and pnpm 11.9.0 plus its workspace dependencies.

Implementation remains PARTIAL pending: real wrapper parity; source/preparation snapshot coherence; actual D3/Canvas/React equivalence; table and Three.js adapter tests; real 10k/14-calculation/14-panel timings and memory; exhaustive local caller inventory; and the full repository check. Facet-header and aggregate-facet behavior changes require explicit approval, but do not prevent preserving current behavior in a narrow observational slice.

No branch, commit, push or pull request was created. No staged diff or commit identity verification is claimed to have occurred. The evidence supports a bounded implementation plan, not a claim that the production architecture is already implemented.


[policy]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/AGENTS.md "Repository contribution rules"
[readme]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/README.md "Supported workspace and source-reference contract"
[root-package]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/package.json "packageManager; check"
[package]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/package.json "exports; scripts; dependencies"
[build]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/tsup.config.ts "entry; external; splitting"
[trace-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-02-visualization-traceability-and-dataflow.txt "Source-to-glyph provenance; explicit boundaries"
[template-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-25-deterministic-ui-templating.txt "Deterministic template expansion; role of TSX"
[spec-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-03-spec-driven-interactive-visualization.txt "Declarative expansion; chart defaults"
[transform-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-04-advanced-chart-specs-and-transforms.txt "Transform order; stacking; derived layers"
[group-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-04-chart-specs-grouping-and-derived-layers.txt "Grouping versus encodings"
[source-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-07-28-data-transforms-loading-and-source-tables.txt "Loaded, available and visible data"
[workflow]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/calculation-workflow.md "Calculation workflow; calculated-orders example"
[state]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/providers/DataLayerProvider.tsx "getInitialStoreState; getColumnData; refreshCalculations; getAggregateResult; updateFieldSettings; restoreAnalysisFromStructure"
[rows]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/providers/lib/dataLayerState.ts "initializeData; IdType"
[crossfilter]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/CrossfilterWrapper.ts "addChart; getAllData; getFilteredRowIds; updateChartFilters"
[live]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/useGetLiveData.tsx "useGetLiveData; useGetLiveIds; useGetAllIds"
[column]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/useGetColumnData.tsx "useGetColumnData; useGetColumnDataForIds"
[types]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/types/ChartTypes.ts "ChartDefinition; ChartSettings; BaseChartProps; AxisSettings"
[saved]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/types/SavedDataStructure.ts "SavedDataStructure; SavedAnalysisStructure"
[registry]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registry.ts "registerChart; getChartDefinition; component wrapper"
[registered]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registerAllCharts.ts "registerAllCharts"
[renderer]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ChartRenderer.tsx "ChartRenderer"
[base-chart]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BaseChart.tsx "BaseChart; brush and guide rendering"
[facets]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx "groupFacetData; FacetContainer; header selection"
[aggregate]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/aggregates.ts "calculateGroupedAggregate; numericInputs"
[calculation]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/calculations/CalculationState.ts "CalculationManager; executeCalculation; getErrors"
[calc-trace]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/calculations/CalculationTrace.tsx "CalculationTrace; dependency inspection"
[aggregate-inspector]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx "GroupedAggregateInspector"
[scatter]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx "ScatterPlot; full domains; Canvas draw; hover; brush"
[scatter-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ScatterPlot/definition.ts "scatterPlotDefinition.getFilterFunction"
[line]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/LineChart/LineChart.tsx "LineChart; sorted indices; segments; reduction; color effect"
[line-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/LineChart/definition.ts "lineChartDefinition; SeriesSettings"
[bar]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx "BarChart; named aggregate branch; bins and categories"
[bar-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/definition.ts "barChartDefinition.getFilterFunction"
[box]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx "BoxPlot; full versus live groups; overlays"
[box-math]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts "calculateBoxPlotStats; calculateKernelDensity; calculateBeeSwarmPositions"
[pivot]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/PivotTable.tsx "PivotTable; selected rows; contributor inspector"
[pivot-math]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts "calculatePivotData; generateCell; makeContributors"
[table]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx "DataTable; prepared rows; named aggregate branch"
[table-filter]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts "getFilteredRows; compareValues"
[table-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/DataTable/definition.ts "dataTableDefinition.getFilterFunction"
[3d-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/definition.ts "threeDScatterDefinition"
[3d]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterChart.tsx "ThreeDScatterChart; scene and camera lifecycle"
[3d-data]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/useThreeDScatterData.ts "buildThreeDScatterData; useThreeDScatterData"
[3d-points]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterPoints.tsx "ThreeDScatterPoints; attributes and shaders"
[reduction]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/chartUtils.ts "reduceDataPoints"
[filter]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/applyFilter.ts "applyFilter"
[colors]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/useColorScales.ts "getColorForValue; getOrCreateScaleForField; d3Scales"
[categories]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/categories.ts "categoryKey; categoryValue; categoryLabel; categoryEqual"
[scale]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Axis/numericScale.ts "numericScale"
[conversion]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/fieldSettings.ts "applyFieldSettings; convertFieldValue; buildConversionPreview; formatFieldValue"
[row-chart]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/RowChart/RowChart.tsx "RowChart; displayCounts; Other categories"
[summary]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/SummaryTable/SummaryTable.tsx "SummaryTable; allProfiles"
[legend]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ColorLegend/ColorLegendChart.tsx "ColorLegendChart; fieldCounts; scale creation effect"
[markdown-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Markdown/definition.ts "markdownDefinition"
[markdown]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Markdown/Markdown.tsx "Markdown; EditorProvider"
[ui]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/ui-defaults.md "Inspection, tokens, keyboard and responsive checks"
[demo]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/demo/src/demos/examples.ts "calculated-orders"
[dashboard]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/demo/src/demos/dashboardSettings.ts "orderCalculations; calculationDashboard (relevant sections)"
[fixture]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/demo/public/datasets/README.md "Shop Operations: 10,000 rows"
[generator]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/data-samples/sample_data.ts "createSeededRandom; shop_operations (relevant sections)"
[crossfilter-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts "counts rows that survive every chart filter"
[runtime-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/test/charts/chartRuntime.test.ts "line, pivot, legend filters; seeded sampling; 3D data"
[calc-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/test/providers/DataLayerCalculations.test.tsx "dependency order and calculated columns"
[reliability-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/test/providers/analysisReliability.test.tsx "formula edits + active derived filter + restore + CSV"
[reduction-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/chartUtils.test.ts "small-data ordering; ties; reduction"
[aggregate-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/aggregates.test.ts "typed groups; raw inputs; numeric exclusions; signed results"
[pivot-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/__tests__/calculations.test.ts "contributors; errors; missing saved fields; focus restoration"
