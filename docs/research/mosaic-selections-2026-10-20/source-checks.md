# Codex evidence checks

The research baseline is `9b16d78e3ed0742ed4d5858c1939fec9e758b510`.
All 528 source-packet files still match their recorded SHA-256 hashes.
Only research documents and links in two intent briefs changed.

## Collection integrity

The complete ZIP has 78 payload entries and passes the ZIP integrity check.
All 77 entries listed in Pro's manifest match its byte sizes and SHA-256 hashes.
The remaining entry is the manifest itself; its external hash is in the collection manifest.
The standalone source ZIP has 73 members. Each matches the corresponding source-material member in the complete ZIP.
No archive contains an absolute path, traversal path, or symbolic link.
All collected JSON files parse.

The five companion files were preserved from the verified complete archive.
The standalone report controls opened a preview without producing a local download.
No report content is missing: its original ZIP member passed the manifest checks.
The browser download-event wait also timed out for the complete ZIP, but the actual downloaded file was present and verified.

The originals remain under `raw/`. Codex analysis is outside that folder.
No downloaded program was executed. The included fixture generator was preserved as source only.

## Independent source checks

These are source observations, not UI reproductions or new feature tests.

| Claim                                                             | Local evidence                                                                                                    | Result                                                                                                                                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chart filters have independent owners and source exclusion        | `hooks/CrossfilterWrapper.ts`: `addChart`, `getAllData`, `getFilteredRowIds`                                      | Each chart has its own dimension. Groups exclude their own dimension; all-filtered IDs include it. Workspace dimensions remain separate.                                         |
| Histogram boundaries can disagree with outgoing membership        | `BarChart/bins.ts`: `numericBins`; `barPlan.ts`: `binRows`; `BarChart.tsx`: `selectBinAt`; `hooks/applyFilter.ts` | Internal bins are half-open. The click writer supplies min/max only; evaluation includes both endpoints. The static `[0,.5,1]` case supports MOS-002.                            |
| Marginals have the same boundary concern                          | `ScatterPlot/marginalPlan.ts`: member assignment and `marginalBinFilters`                                         | Interior edges enter the right bin, while the emitted range includes the upper edge. Runtime reproduction remains unrun.                                                         |
| Column visibility can change outgoing table filtering             | `DataTable/definition.ts`, `filteredRows.ts`, `columnOps.ts`                                                      | The linked definition skips filters whose field is absent from columns. Local evaluation applies all filters. Hiding a column changes columns only.                              |
| Project logical identity already exists but has limited traversal | `components/project/analysisRowKeys.ts`: `mapIdFilters`                                                           | Handles chart and Rows ID filters. It does not automatically handle workspace/local filters or future geometry nodes. Extend this path if needed.                                |
| DSL values can lose scalar type                                   | `lib/dsl/compile.ts`: `buildFilter`                                                                               | A map keyed by `String(raw)` can merge number/string lookalikes. The complete export/import path needs a runtime reproduction before claiming a failing round trip.              |
| A metric and proposed finding can have different denominators     | `MetricCard/MetricCard.tsx`, `components/charts/useGetLiveData.tsx`                                               | Metric live IDs include active filters; `useGetAllIds` applies chart-local population without workspace filters. Compare equal-scope numerators unless denominators are aligned. |
| Explicit empty facets need a contract                             | `components/charts/useGetLiveData.tsx`: `useGetLiveIds`                                                           | An empty array currently follows the unrestricted branch. This is an input edge, not a reproduced ordinary facet failure.                                                        |
| Daily findings use a separate representation                      | `apps/demo/src/daily/findings.ts`                                                                                 | Conditions and arithmetic are separate from interactive selection. A live count binding is proposed.                                                                             |
| Heatmap color stability is configurable                           | `Heatmap/heatmapPlan.ts`: scale provenance                                                                        | Fixed ends are explicit. Otherwise the scale uses shown cells after other filters. Histories/fixed-end work is already delivered.                                                |

Package-relative paths in this table start at `packages/explorEDA/src/`.
The [source register](raw/research/mosaic-selections-sources.json) provides the full reading route and pinned URLs.

## Primary-source verification

Codex fetched these files from official Mosaic commit `9ca1d860e30ed148d0b228b92ebf30f66cb9e2ce`:

- `packages/mosaic/core/src/Selection.ts`
- `packages/mosaic/core/src/preagg/PreAggregator.ts`
- `packages/mosaic/core/src/preagg/sufficient-statistics.ts`
- `LICENSE`

All four are byte-identical to Pro's collected copies.
The Selection source distinguishes target exclusion from the active-client update-skip result.
The pre-aggregator distinguishes clearing local entries from dropping materialized tables.
The aggregate implementation recombines means with valid counts.
These facts support deferring an adapter until it earns its translation and lifecycle cost.

Codex also inspected the paper's model, compatibility conditions, evaluation setup, and limitations.
Section 5.1 restricts pre-aggregation to INTERSECT or LAST resolution and stable grouping domains.
Sections 4.2 and 5 describe pixel binning. Exact source membership still needs a separate proof.
Section 8 describes rebuilding materialized views for changed data.
These observations support the research's semantic-first recommendation.

Source: [Mosaic Selections v1](https://arxiv.org/html/2507.19690v1).

## Correction to the original report

The report's evaluation table says **M2 Pro**.
The paper's section 7 states **M1 Pro**, 16 GB RAM, in a 2021 16-inch MacBook Pro.
Use M1 Pro when describing the reported hardware.
The original report remains unchanged so its manifest hashes remain valid.
This correction does not change the architectural recommendation.

Some working notes predate Pro's final reconciliation.
For example, the selection-flow note initially did not establish undo support.
The final report found the demo history in exact-baseline supplements and corrected that limit.
Use the final report with this correction log, rather than treating each working note as the final conclusion.

## Fixture and reference checks

Codex independently recalculated A, B, C, W, their principal intersections, and selected amount contributors.
A and B intersect at `r02`, `r07`, `r10`, `r11`.
Valid amounts are 20 and 5: sum 25, mean 12.5.
This verifies research arithmetic, not the proposed implementation.
Raw scalar types must be reconciled with prepared data before application comparisons.

All MOS-001 through MOS-015 IDs are unique and have a review disposition.
All recommendation source IDs resolve in the fifty-entry source register.
The [proof plan](raw/research/mosaic-selections-proof-plan.md) has twelve semantic gates and five optional acceleration gates.
Every new product gate remains proposed and unrun.

## Repository checks

Dependencies were installed from the frozen lockfile with Node 24.21.0 and pnpm 11.9.0.
Installation warned that local CLI bins did not yet exist before the package build.
The lockfile and package manifests were not changed.

`pnpm check` passed: UI checks, builds, type checks, 1,656 library tests, 32 app tests, and 431 demo tests.
The library also reported 45 skipped tests. The demo build passed 73 content/example tests.
Existing chunk-size and jsdom Canvas warnings did not fail the command.
Document links, JSON, recommendation coverage, archive safety, and Git whitespace were checked separately.
No application implementation, browser proof, performance benchmark, or bug fix was run as part of this research.

The first sandboxed full check hit `listen EPERM` in existing local-server tests.
The command was restarted with local server access. See the final result in the run record.
Raw originals retain supplied whitespace; the authored-file whitespace check excludes `raw/` and passes.
