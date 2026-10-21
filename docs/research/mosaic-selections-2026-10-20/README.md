# Mosaic Selections and explorEDA

The useful first step is a small selection contract over Crossfilter.
Keep the current React renderers. Defer Mosaic packages and a DuckDB interaction backend until measurements justify them.
This is a research proposal. No selection feature or application fix was implemented in this run.

Mosaic separates a selection's predicates, origin, and target resolution.
That model can help explorEDA keep charts, evidence rows, exports, and written findings consistent.
The source chart can retain its context distribution while the evidence table uses all active selections.
See the [paper, sections 4–6](https://arxiv.org/html/2507.19690v1).

## What is possible

| Option                                   | Benefit                                                   | Cost and decision                                             |
| ---------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| Document and repair current contracts    | Improve exact evidence without a new selection layer      | Lowest cost; retain as the fallback                           |
| Small internal contract over Crossfilter | Share exact meaning across charts, a table, and a finding | Investigate with a bounded proof                              |
| Mosaic Selection adapter                 | Reuse its clause ownership and reactive resolution        | Defer; durable state and row evaluation still need an adapter |
| Mosaic/DuckDB query backend              | Enable compatible aggregate-query acceleration            | Defer; requires query, data, identity, and lifecycle changes  |

Crossfilter already provides independent chart dimensions and source-chart exclusion.
The gain is clearer shared meaning across consumers, rather than source exclusion alone.
A field name cannot identify the selection's owner: two charts can select the same field independently.

Keep these meanings separate:

- Eligible population: workspace, chart-local, and facet restrictions.
- Interactive selection: a predicate owned by one chart or control.
- Context: the source distribution, possibly excluding its own selection.
- Exact evidence: records that satisfy the resolved predicates and declared population.
- Viewport and encoding domains: display choices that do not redefine committed membership.

The [Pro report](raw/research/mosaic-selections-report.md) maps the current flow and proposes truth tables and TypeScript shapes.
Those shapes are examples for review, not an approved public API.

## How it would help

One exact selection could drive a histogram, Scatter, an evidence table, and a selected-count finding.
A finding could show “4 selected records of 12 eligible” and inspect those same four records.
Its stored definition would contain the binding; its displayed count would be derived.
Current daily findings use a separate evaluator and do not already follow workspace selections.

The proposed proof uses a twelve-row fixture and two independent sources:

- Histogram A selects X in `[1,3)`.
- Scatter B selects a triangle with vertices `(0,0)`, `(3,0)`, and `(0,3)`.
- The histogram context has B's five records; Scatter context has A's seven records.
- Exact evidence contains `r02`, `r07`, `r10`, and `r11`.

The current precise-selection intent favors lasso. A rectangle cannot complete that proof.
The [proof plan](raw/research/mosaic-selections-proof-plan.md) specifies boundaries, expected IDs, scope, lifecycle, and acceptance gates.
Its fixture arithmetic is separate from application verification.

## What needs care

The code supports two immediate concerns that need runtime reproduction:

- Histogram and Scatter marginal bins use half-open internal partitions, but emit inclusive range filters.
- A hidden DataTable column can retain its local filter while its linked predicate ignores that field.

See [source checks](source-checks.md) for the exact paths and evidence limits.
No application fix was made. Do not treat these static findings as completed UI reproductions.

A selection extension must also preserve typed values, UTC boundaries, logical row keys, and save/restore meaning.
An empty result differs from a cleared selection. A missing field differs from a missing cell.
A new polygon or binding needs explicit validation and field-dependency handling.
Do not add version coexistence or a second state store without a concrete need.

A count's denominator must be named.
The proposed finding uses workspace-eligible rows; the current MetricCard baseline excludes workspace filters.
Those percentages can differ while their selected-count numerators agree.

Heatmap histories and fixed color ends are delivered at this baseline.
Its default automatic color domain still follows shown cells. Do not describe it as always fixed.
Scatter density already preserves source bins and exact contributors.

## Performance decision

The selection model can help before any acceleration is added.
Mosaic's optimizer needs structured queries, stable grouping, supported aggregates, and a query backend.
Metadata attached to a Crossfilter predicate does not provide that optimizer.

Pixel bins can preserve an aggregate over bins while changing source-row membership.
Keep exact predicates authoritative for table, export, trace, and findings.
The paper's pre-aggregation method also excludes top-level union resolution.
Source changes and calculated-field edits require fresh results and materialized state.
See [paper section 5.1](https://arxiv.org/html/2507.19690v1#S5.SS1).

Measure the actual bottleneck before choosing a backend.
Include setup, memory, source switches, exact evidence retrieval, and coherent multi-view display.
Paper query timings do not establish explorEDA interaction latency.
No new performance benchmark was run here.

## Proposed sequence

1. Reproduce the boundary and hidden-column concerns. Prove any correction with exact IDs.
2. Test the internal contract with the four consumers and an exact linear-axis lasso.
3. Prove save/restore, logical identity, undo, field edits, notebook scope, and explicit facet meaning.
4. Measure costs. Consider acceleration only if its benefit covers setup, memory, and maintenance.

Each future visible milestone includes a docs section, a reachable demo, and keyboard and three-width checks.
Implementation requires a separate request. The current research leaves product choices explicit.
All fifteen recommendations have a [review disposition](recommendation-review.md).

## Evidence and originals

- [Detailed Pro report](raw/research/mosaic-selections-report.md)
- [Fifteen recommendations](raw/research/mosaic-selections-recommendations.json)
- [Fifty source records](raw/research/mosaic-selections-sources.json)
- [Proof plan](raw/research/mosaic-selections-proof-plan.md)
- [Source material and research notes](raw/research/source-material/README.md)
- [Complete original research ZIP](raw/mosaic-selections-research.zip)
- [Standalone original source ZIP](raw/source-material.zip)
- [Collection manifest](raw/collection-manifest.json)
- [Codex source checks and corrections](source-checks.md)
- [Submitted prompt](prompt.md) and [run record](run-record.md)

The paper and benchmark originals have citation and access records where redistribution permission was not established.
The full paper is available at its [versioned source](https://arxiv.org/html/2507.19690v1).
The collected licensed Mosaic sources and supplied repository snapshot remain unchanged.
The raw report incorrectly names the benchmark CPU as M2 Pro. The paper specifies M1 Pro.
