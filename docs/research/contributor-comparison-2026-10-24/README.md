# Compare values: build a direct record comparison

Build a temporary comparison from two traces. Pin one metric or bar, inspect another, then compare Shared, Left only, and Right only records.
Show In scope separately from Used in calculation. Preserve each captured value, definition, filter context, and exclusion evidence.

The [implementation plan](../../intent/contributor-comparison/implementation-plan.md) has three shippable milestones:

1. Native row-grain card/bar comparison, complete record access, frozen lifetime, docs, and an example.
2. Entity overlap with separate representatives and witnesses.
3. Explicit part/denominator evidence for supported series and facet cases.

Topic score: **19/20**. Byron is the demand. Earlier R051 study gates do not apply under [DIRECTION.md](../DIRECTION.md).
The [run record](run.md) records the candidates, submission, collection, checks, and PR.
[Pro conversation and complete reports](https://chatgpt.com/c/6adc0748-e1e0-83ea-8ef3-a8fe2b64340c).

## Findings and local review

Current source confirms that contributor arrays contain excluded inputs and repeated entity witnesses.
`traceRowIds` maps all ledger inputs for supported aggregates; it is not a numeric-inclusion contract.
MetricCard reads global membership plus local restrictions. SingleBarChart passes peer/local IDs explicitly to its native aggregate.
Preserve those different scopes. Do not reconstruct evidence through ChartDataPreview's live query.

Two fixture sums can both equal 30 with disjoint included sets.
One sum and average can use the same three rows yet return 40 and `40/3`.
Record overlap explains membership; it does not establish a causal explanation or numeric decomposition.

Frozen evidence stays within one prepared-data generation. Filters/settings can change with a visible context indication.
Data, preparation, calculation, relation, or source-chart identity changes invalidate the relevant pair.
The calculation generation must advance at the first observable cache update, before the later nonce update.

Local review makes three adjustments to Pro's implementation details:

- Use `compare-values.e2e.ts` with an explicit Playwright project. The proposed `.spec.ts` would not run under this config.
- Make extraction of the preview table optional. The feature needs explicit captured rows, not a required shared-table refactor.
- Measure large captures before adding progress/yielding machinery. Complete membership and bounded rendering remain required.

All source claims were checked at refreshed main `95832bd4`.
The scratch fixture ran the existing reducers and metric planner for memberships, values, entities, conflicts, empty state, and revisions.
Existing baseline checks passed 25 tests; docs passed 73 tests with existing React act warnings.
The collection docs rerun passed 72 tests and hit one search timeout. That file passed six tests on retry.
No all-green combined collection rerun is claimed. [Planning PR #519](https://github.com/byronwall/explorEDA/pull/519) is open.
No new comparison runtime, mounted flow, browser acceptance, or performance result is claimed.
Original reports and ZIP remain under ignored tmp, outside this PR.

## Recommendation dispositions

Build means include in a plan; it does not approve shipping.

| Pro ID | Local disposition | Decision                                                                                                 |
| ------ | ----------------- | -------------------------------------------------------------------------------------------------------- |
| D01    | Build             | Pin an exact trace, then explicitly compare another.                                                     |
| D02    | Build             | One temporary mode in the trace popover.                                                                 |
| D03    | Build             | Explicit replacement, retained dismissal, resume, and clear.                                             |
| D04    | Build             | Native row-grain card/bar scope and included bases first.                                                |
| D05    | Build             | Recorded reasons and observed differences; no inferred causal story.                                     |
| D06    | Build             | Frozen captures, prepared-data generation, and synchronous stale-action checks.                          |
| D07    | Build             | Lazy producer adapters and two-slot React state; keep registries local.                                  |
| D08    | Build / Explore   | Exact partitions and paged/searchable evidence. Measure blocking before adding asynchronous preparation. |
| D09    | Build             | Exact same-result query navigation with complete mapping checks.                                         |
| D10    | Build, M2         | Typed entity overlap with all witnesses; preserve conflict rules.                                        |
| D11    | Build, M3         | Explicit part, denominator, and baseline evidence from real producers.                                   |
| D12    | Explore           | Additional launcher after the trace path works.                                                          |
| D13    | Defer             | Broader adapters, full Rows mode, and chart shortcuts.                                                   |
| D14    | Defer             | Live/durable pairs, export/history, cross-refresh identity, deleted-source retention, and swap.          |
| D15    | Avoid             | Armed capture, general multiselect, permanent sidebar, and mark Inspect buttons.                         |
| D16    | Avoid             | Second engine, scope normalization, or reducer repair to force agreement.                                |
| D17    | Avoid             | Demand/study gates or an audit instead of feature design.                                                |

## Primary sources and open choices

[Tableau Explain Data](https://help.tableau.com/current/pro/desktop/en-us/explain_data_basics.htm) cannot compare multiple selected marks directly.
[Power BI drillthrough](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-drillthrough) preserves a selected detail context.
[Mosaic selection](https://idl.uw.edu/mosaic/api/core/selection.html) resolves predicates per client and can omit a client's own clauses.
These spot-checked sources support exact-target inspection and explicit scope; the proposed UI is our design inference.

Later implementation can choose whether a launcher improves discovery and which additional adapter follows M3.
Neither choice blocks M1. Stable comparison across refresh needs a separate identity contract.
