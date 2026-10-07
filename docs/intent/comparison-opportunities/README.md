# Comparison-led gaps and future seeds

Start with the [intent brief](intent-brief.md). These are proposed opportunities, not an approved build queue.
The lifecycle maps own status. This guide groups candidates by planning horizon.

## User-added projects

These outcomes come from Byron’s direct follow-up. Their implementation priority remains open.

| New intent | Intended outcome |
| --- | --- |
| [Durable editorial chart styling](../editorial-chart-styling/intent-brief.md) | Match a user’s theme or design system; retain larger titles, subtitles, and deliberate typography. |
| [Edit chart features in place](../in-place-chart-editing/intent-brief.md) | Edit visible text and axis limits near the result. Compare double-click, context-menu, and optional drag interactions. |
| [Scatter plot matrix](../scatter-plot-matrix/intent-brief.md) | A multivariate starting view with off-diagonal scatter, diagonal distributions, and linked brushing. |
| [Image export and possible document outputs](../analysis-export/intent-brief.md) | Export authored charts; evaluate slides and PDF reports separately. |

The editing initiative links to axis-domain controls for numerical meaning. Styling owns visual choices and subtitle presentation.

## Current product direction

End users drive the platform. Engineering and scientific experiment analysis is a central direction. Byron reports another worktree investigating datasets; dataset access is not a reason to block small local proofs here.

The first pass has four priorities. Their relative order is not selected:

- [Editorial styling](../editorial-chart-styling/intent-brief.md): make the live workspace editorial, with global theme links and findable overrides.
- [Editing in place](../in-place-chart-editing/intent-brief.md): direct text and axis edits, immediate updates, and existing undo.
- [Scatter matrix](../scatter-plot-matrix/intent-brief.md): a starting view for unfamiliar multivariate data, with two-field brushing and dimmed context.
- [Table usability](../table-content-fit/intent-brief.md): improve numerical inspection; content-aware fitting is one candidate, not the whole scope.

Time is important and belongs in a second pass across these workflows. Lasso and filters without charts also have direct interest.
Named comparisons have low current interest. Extra metrics, derived-output reuse, and filter-free templates remain unproven seeds.
Keep correctness and restore checks within the selected journeys instead of replacing the priorities with a separate broad verification project.

[Image export](../analysis-export/intent-brief.md) now has a dedicated scope. Slides and PDF reports remain possible extensions; no implementation order is implied.
The [annotated product feedback](resources/product-feedback-2026-10-06.md) records the decisions and uncertainty.

## Current gaps worth evaluating

| New intent | Expand when |
| --- | --- |
| [Agreement across charts, selections, and saved state](../current-analysis-trust/intent-brief.md) | Expand only when a fixture exposes disagreement, a restore changes the result, or a named workload misses an agreed response target. |
| [Rank a measure in horizontal bars](../horizontal-metric-bars/intent-brief.md) | Expand to series or horizontal stacks when the same ranking task requires comparing subgroup contributions. Do not add them solely for chart-menu symmetry. |
| [Targets, events, and supplied intervals](../reference-marks/intent-brief.md) | Expand after one fixed target is useful and restores correctly. Add supplied intervals only when a real dataset has lower/upper fields. |
| [Discover field relationships, then open scatter](../relationship-discovery/intent-brief.md) | Expand when repeated analyses involve choosing among many numeric pairs. Add rank correlation only when monotonic nonlinear relationships make Pearson misleading for the task. |
| [Set and reset chart domains without filtering rows](../axis-domain-controls/intent-brief.md) | Expand when an analysis repeatedly needs manual bounds, display-only zoom, or positive data spanning orders of magnitude. |
| [Select exact category pairs and facet-local regions](../precise-composite-selection/intent-brief.md) | Expand when a real comparison requires separated cell pairs or selecting one facet without matching the same coordinates elsewhere. |
| [Filter a workspace and control series deliberately](../filter-and-series-controls/intent-brief.md) | Expand when analysts repeatedly create disposable filter charts or cannot isolate overlapping series while keeping the same source population. |
| [Step through periods and inspect rolling measures](../calendar-period-analysis/intent-brief.md) | Expand when a real analysis repeatedly compares adjacent periods or needs smoothing while retaining exact source inspection. |
| [Fit columns to readable cell content](../table-content-fit/intent-brief.md) | Expand to wrapping or persistent record details when width fitting alone cannot support a concrete long-text task. Add rich cell types only with a real dataset. |

## Future seeds

| New intent | Expand when |
| --- | --- |
| [Named population baselines — low current interest](../population-baselines/intent-brief.md) | A concrete comparison task becomes important enough to justify the separate scope. |
| [Reusable rates and richer grouped measures](../reusable-analysis-metrics/intent-brief.md) | Expand when the same hand-computed rate or pivot-only reducer is repeatedly needed outside Pivot. Prefer one requested metric to a general language. |
| [Find missing values and missing observations](../missingness-and-expected-records/intent-brief.md) | Expand when field summaries hide a recurring pattern, or a real source includes a known expected sampling plan or key catalogue. |
| [Use one analytical result as another view’s input](../reusable-analysis-outputs/intent-brief.md) | Expand when the same exported result is repeatedly reused, or a second view needs an analytical output that cannot be expressed over the existing source. |
| [Complete saved analyses and optional templates](../saved-view-templates/intent-brief.md) | Expand when duplicated views repeatedly require clearing incidental selections, or the same arrangement must be reused against another compatible source. |
| [Show parts of a whole and cumulative contributions](../composition-and-contribution/intent-brief.md) | Expand donut only when a compact bounded composition is preferable to a bar. Expand waterfall when users need to explain an ordered net change. |
| [Explore nested categories and their totals](../hierarchy-analysis/intent-brief.md) | Expand when a dataset has several meaningful category levels and flat rankings make the parent-child relationship hard to inspect. |
| [Explore explicit links and edge-list flows](../network-and-edge-flow/intent-brief.md) | Expand when actual data arrives as edges, or a user needs neighbors and cycles that cannot be represented honestly as ordered stages. |
| [Funnels, retention, and interval schedules](../domain-analysis-views/intent-brief.md) | Expand one candidate when Byron has repeated funnel, cohort, or schedule questions that require manual preparation outside explorEDA. |
| [Scientific overlays and multivariate discovery](../scientific-multivariate-analysis/intent-brief.md) | Expand when a concrete measurement, diagnostic, or multivariate task cannot be answered with the current scatter tools. Require independent numerical references before implementation. |
| [Reproduce an analysis beyond the current renderer](../renderer-independent-replay/intent-brief.md) | Expand when an external export, independent verification process, or second renderer needs more than reopening the same React component. |
| [Keep explanations aligned with the selected data](../data-bound-narrative/intent-brief.md) | Expand when a recurring analysis needs manual explanation updates after filtering, and one existing metric can supply the statement. |

## Recommendations already delivered or owned

The [disposition ledger](resources/candidate-dispositions.json) covers all 21 numbered chart recommendations plus landing, documentation, and broader routing decisions.
Do not recreate Heatmap, Map, Calendar, Metric Card, Sankey, ECDF, grouped vertical bars, Other membership, bubble encoding, or density.
Advanced scatter and DSL recommendations are now implemented in source. Saved-view tabs, persistence, history, local restrictions, and date presets also exist.
Runtime agreement and gesture-level history behavior still need direct proof where the reports could not supply it.

The remaining complete chart catalogue stays with [chart documentation](../chart-and-rendering-docs/intent-brief.md).
Lookups stay with [multiple sources](../multi-source-analysis/intent-brief.md).
Task navigation, composition, and agents keep their current owners. Child briefs link those owners where useful.

## Research packet

[Resources](resources/README.md) includes unchanged Pro archives, extracted reports, ledgers, fixtures, source links, and browser limitations.
Every child keeps selected Pro records and current code references in its own `references/` folder.
The user-added projects instead retain the [direct request](resources/editorial-and-editing-request.md) and current source references.
The matrix folder also retains its [direct request](../scatter-plot-matrix/references/user-request.md).
The capture was reconciled against `a50df9985ed3ff54d0f6ca368c0b369829b8a927` on 2026-10-06. No fresh browser or runtime test is claimed.
