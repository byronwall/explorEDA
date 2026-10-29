# Engineering histograms: build authored intervals and specification compliance

Extend the existing Bar chart with repeatable boundaries, inclusive specification limits, numeric groups, and exact records.
[The implementation plan](../../intent/engineering-histograms/implementation-plan.md) has four shippable milestones: regular bins, specifications, numeric groups, and explicit edges.
Each milestone includes its docs section, runnable example, meaningful checks, and main risk.
Build is a planning disposition; implementation remains proposed.

Topic score: **20/20**: capability 5, Pro advantage 5, buildable 5, momentum 5.
[Pro conversation](https://chatgpt.com/c/6adb5dd2-8f38-83ea-975f-4d5172f09ee8), Design, finished after 39m30s. No follow-up: 0/1.
[Run record](run.md). Originals stay under ignored `tmp/pro-engineering-histograms-2026-10-23/collected/`.

## Decisions

| ID    | Local disposition | Reason                                                                                                             |
| ----- | ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| EH-01 | Build             | Auto, saved width/origin coverage, and short complete edges make intervals repeatable.                             |
| EH-02 | Build             | Independent limits classify finite measurements, including coverage tails. Equality passes.                        |
| EH-03 | Build, scoped     | One status atom expresses both tails. Freeze predicates only for explicit engineering settings.                    |
| EH-04 | Build             | One plan supplies counts, exact contributor IDs, traces, and scoped Records.                                       |
| EH-05 | Build             | Numeric groups need shared edges/scales and a complete group table. Existing series bars are categorical.          |
| EH-06 | Build             | Use group-valid denominators; require density for unequal widths and account for uncovered mass.                   |
| EH-07 | Build             | Live edits, lossless text/save, refresh rules, and feature-matched docs/examples complete the capability.          |
| EH-08 | Explore           | Status segments and alternate group layouts need a focused visual prototype after the core flow.                   |
| EH-09 | Defer             | Fitted capability, control charts, weights, per-group limits, and unit conversion expand the statistical contract. |
| EH-10 | Avoid             | Fuzzy membership, silent rebins, whole-bin failure color, intersected tails, and saved row IDs change meaning.     |
| EH-11 | Avoid             | General OR syntax, new frameworks, migrations, and outside-demand gates do not solve this scope.                   |

## What the local review changed

Pro proposed removing range re-snapping for all numeric histograms, including ordinary Auto charts.
Keep the existing ordinary path. Freeze selections only when the chart has explicit `histogram` settings.
Enabling engineering mode preserves its current numeric predicate. Partial-bin selection rendering is required.
This preserves the current product while giving authored analyses durable measurement meaning.

Pro also proposed an ordinary Trace/Records action. Use the existing header trace access and scoped trace actions.
Follow the repository's ban on plot-level Inspect buttons.
Reuse trace invalidation, but verify that geometry/settings changes alter its revision; extend the key where necessary.

The source measurement column sets current histogram edges before filters.
Local/facet population helpers serve separate aggregate-domain and annotation paths.
The plan keeps source edge references explicit and applies chart-local restrictions to compliance context.
A chart-local Outside count must open its exact IDs; global Rows can describe a different population.

## Evidence checked

Reviewed decisive files on current main `95832bd4`, after rebasing from Pro's `6d9130ba` baseline:

- `BarChart/{bins.ts,definition.ts,barPlan.ts,BarChart.tsx,seriesBarPlan.ts}`: repaired endpoints, exact contributors, first-filter ordinary route, categorical series, and render-time re-snapping.
- `useGetLiveData.tsx`, `useGetColumnData.tsx`, `chartPopulation.ts`, and `CrossfilterWrapper.ts`: source versus peer/local/facet scope and own-dimension exclusion.
- `FilterTypes.ts`, `applyFilter.ts`, `saveDataUtils.ts`, and DSL `compile.ts`/`export.ts`: no focused union or strict lower endpoint yet. Shared text changes are required in all filter contexts.
- `DataLayerProvider.tsx`, `ChartTraceScope.tsx`, and `ChartDataPreview.tsx`: shallow settings merge, held edits, transient revision checks, and a first-100 chart preview. Complete exact Records requires implementation.

Independent fixture arithmetic confirms A–D: bins, exact memberships, group denominators, one-sided/equal limits, density area, decimal neighbors, replacement/Fit, and large-grid indices.
The proposed fixture's n=15 gives below/within/above=3/9/3. Irregular-bin area is 13/15, with two coverage tails.
These are arithmetic checks, not proof of unbuilt product behavior.

Primary spot checks support the decisive method choices:

- [D3 binning](https://d3js.org/d3-array/bin) retains inputs and closes only the final upper edge.
- [Minitab observed performance](https://support.minitab.com/en-us/minitab/help-and-how-to/quality-and-process-improvement/capability-analysis/how-to/capability-analysis/normal-capability-analysis/interpret-the-results/all-statistics-and-graphs/observed-performance/) counts strict lower and upper failures. Equality passes.
- [NumPy histogram](https://numpy.org/doc/stable/reference/generated/numpy.histogram.html) supports complete unequal edges and density area. This plan deliberately includes coverage tails in its denominator, so covered area can be less than one.
- [NIST capability](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm) requires additional process/distribution assumptions. Keep this feature's claims empirical.

## Open questions and limits

The proposed caps are 512 regular bins, 64 explicit intervals, and six visible groups, initially two.
These are product defaults, not measured performance limits. Adjust them after concrete implementation evidence.
Keep a full group table even when panels are hidden. Status segmentation remains an exploration.

Current tests and docs checks verify the baseline only. New filter/runtime, browser, exact Records, restore, and export acceptance remain proposed.
No feature code, docs-site example, or package output changed in this planning PR.

## Preserved Pro result materials

[Complete original Pro artifacts](../../intent/engineering-histograms/assets/pro-results/engineering-histograms-2026-10-23/ASSET_INDEX.md) are preserved under the intent entry. ZIP containers remain local.
