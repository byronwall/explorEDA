# Build live notebook findings

Build named findings and short prose references that follow one explicitly named chart's local selection.
Reuse the current provider, reducers, and formatting. Let readers open the exact inputs behind each value.
The [implementation plan](../../intent/data-bound-narrative/implementation-plan.md) starts with a count and average, then adds authoring and comparisons.

Topic score: **20/20**. The [run record](run.md) compares four candidates using the research direction.
[Pro conversation](https://chatgpt.com/c/6adab40e-b670-83e9-af00-6619fa79e438), completed after 33m48s; no follow-up needed.
This PR plans the feature. It changes no application behavior.

## Why this design

Named definitions keep metric logic outside sentences and let repeated values share one meaning.
Full inline calculations would repeat scope rules. Direct card references would bind prose to a chart's lifetime and baseline.

A source check confirms that `NotebookProse` renders static Markdown and `ExplorEdaNotebook` enables `localSelections`.
In that mode, `CrossfilterWrapper.updateChartFilters` clears each chart dimension.
Its `getChartFilteredRowIds` applies global filters and authored population, without the owner's local selection.
The finding resolver must apply that owner's predicate explicitly.

Use source, eligible, selected, metric-input, and contributing populations without separate state stores.
The proposed fixture gives East four selected rows and three numeric contributors.
Its group comparison reverses from -8.75 to +15; the eligible share is 40%, while source share is one third.
Fixture arithmetic was checked locally. New feature behavior remains unimplemented.

## Local review of Pro recommendations

Build means included in a plan. It does not mean released or approved for implementation.

| ID    | Disposition | Decision and reason                                                                                              |
| ----- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| LF-01 | Build       | Named declarations and reference-only tokens keep prose simple.                                                  |
| LF-02 | Build       | Follow one local owner without changing notebook defaults.                                                       |
| LF-03 | Build       | Derive explicit populations from existing provider state.                                                        |
| LF-04 | Build       | Reuse reducers, formatting, and contributor presentation.                                                        |
| LF-05 | Build       | Compile one registry; do not persist live result caches.                                                         |
| LF-06 | Build       | Use explicit IDs, existing field names, validation, and source transactions. Avoid duplicate field wrappers.     |
| LF-07 | Build       | Add bounded shares and differences with explicit compatible operands.                                            |
| LF-08 | Explore     | Prove saved inputs, source identity, and payload size before selecting a durable capture format.                 |
| LF-09 | Build       | Separate current inspection from saved inspection and restore. Close current evidence when its revision changes. |
| LF-10 | Build       | Add opt-in shared groups after the live-finding release.                                                         |
| LF-11 | Build       | Keep exact lasso in the separate selection milestone, with original fixture coordinates.                         |
| LF-12 | Explore     | A card shortcut needs scope and formatting parity first.                                                         |
| LF-13 | Defer       | Extra reducers, entity grain, and refresh remapping have separate contracts.                                     |
| LF-14 | Defer       | No new database, Mosaic runtime, or provenance graph is needed.                                                  |
| LF-15 | Avoid       | Arbitrary templates and generated conclusions exceed descriptive metrics.                                        |
| LF-16 | Avoid       | Universal stale warnings, silent rebinding, and saved runtime IDs hide scope.                                    |

The initial cut is live values, authoring, and comparisons: M1–M3.
Pro included saved capture in its third milestone. Local review moves that larger boundary to a separate prototype.
The current `ChartTraceScope` closes traces after revision changes; it does not pin historical input snapshots.
Reuse that current-evidence behavior first. Add historical inspection only with captured inputs.

Main now includes the identity and histogram repairs that were open at submission.
`analysisRowKeys.ts` and `sourceRowIdentity.ts` provide existing key boundaries to inspect and reuse.
They do not establish historical query-content revisions or portable identity for positional fallback rows.
The DSL's `buildFilter` matches present typed values; qualified boolean syntax still needs an explicit round-trip acceptance test.
No new normalization or compatibility framework is justified here.

## Sources and remaining choices

The design separates named dependencies from inline references.
This follows mechanisms in [Observable reactivity](https://observablehq.github.io/framework/reactivity)
and [Quarto inline code](https://quarto.org/docs/computations/inline-code.html).
Explicit selection ownership and resolution also have a precedent in [Vega-Lite selection parameters](https://vega.github.io/vega-lite/docs/selection.html).
These three primary sources were checked locally; the broader comparator review remains in the Pro conversation.
Reuse the earlier [Mosaic decision](../mosaic-selections-2026-10-20/README.md) instead of reopening backend selection.

Open choices concern saved-evidence payload limits, supported capture owners, and reuse of query/source identity.
The original lasso coordinate table is needed before that later truth-table test.
None blocks the first live-finding milestone. No participant study or outside-demand gate applies.
Original reports and the ZIP stay under ignored `tmp/`.

## Preserved Pro result materials

[Complete original Pro artifacts](../../intent/data-bound-narrative/assets/pro-results/live-findings-2026-10-22/ASSET_INDEX.md) are preserved under the intent entry. ZIP containers remain local.
