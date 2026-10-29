# Distribution-distance Methods decision

Build **Compare two groups inside ECDF**. Choose two typed values of one grouping field. Ship largest cumulative-share gap first, Wasserstein distance second, and signed 10th/50th/90th percentile differences third. Each milestone includes traces, saved state, docs, an example, and image export.

- [Implementation plan](../../intent/distribution-comparison/implementation-plan.md)
- [Pro conversation](https://chatgpt.com/c/6ae1520d-9128-83ea-b4cc-da84bde1a972), completed in 22m57s; no follow-up used.
- Topic score: 17/20, with Capability 4, Pro advantage 5, Buildable 4, Momentum 4. [Candidate record](run.md).

The three readings answer different questions. The largest share gap locates a threshold contrast. Wasserstein measures separation in field units. Signed percentiles explain direction and crossing. A=`[0,3]` and B=`[1,2]` have equal means, but D=1/2, W1=1, and differences `[1,1,-1]`.

## Local review and corrections

Checked main `6796a753` after collecting both complete Markdown reports on October 29. Originals remain ignored under tmp. This summary and plan are locally authored integration, not copies of Pro's reports.

- `useGetLiveData.tsx`, `CrossfilterWrapper.ts`, `ecdfPlan.ts`, and `EcdfChart.tsx` confirm own-filter exclusion, private populations, capped ordinary groups, inclusive directions, and range-only commits. Explicit empty facets still need a narrow comparison-path rule.
- `categories.ts` confirms typed identities. Its faster current implementation preserves the packet's key encodings. Decode special numeric category strings deliberately when validating a roundtrip; do not confuse them with string categories.
- `saveDataUtils.ts`, DSL `paths.ts`, `schema.ts`, `normalize.ts`, and notebook `writeBack.ts` confirm the integration points. The new settings are proposals. Quoted JSON-text group keys fit the scalar codec. Notebook alias rewriting needs a literal-setting exemption.
- `GroupedAggregateInspector.tsx` contains the paged `AggregateContributorTable`. It displays source IDs and inputs; it has no bulk Rows handoff. The plan requires these existing record tables and adds no invented exchange API.
- `chartImage.ts` and `rasterizePanel.ts` capture the full chart panel with computed styles. They hide `data-export="omit"` and overlays. A persistent summary can use HTML within the captured panel; it must avoid omitted ancestors. Actual feature image proof remains implementation work.
- `initializeData` assigns positional IDs. `carryRowSelections` remaps saved row filters under specific content checks; it does not make transient comparison results durable. Recompute results and close stale traces.
- Current main added ECDF annotation frames since the packet. Pair rendering must preserve that integration. The plan does not replace annotation scope with a new source model.

Spot-checks confirm the [Wasserstein CDF integral and equal default mass](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.wasserstein_distance.html), [R type-1 inverse empirical CDF](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/quantile.html), and [D3's different R-7 convention](https://d3js.org/d3-array/summarize#quantile). The exact arithmetic design is a reviewed proposal, not a claim about those libraries' range guarantees.

## Recommendation dispositions

Build means included in the plan, not approved to ship.

| ID   | Disposition | Local decision                                                                                |
| ---- | ----------- | --------------------------------------------------------------------------------------------- |
| DD01 | Build       | Extend ECDF; keep its existing scope and trace workflow.                                      |
| DD02 | Build       | Save explicit typed A/B keys with shared denominators.                                        |
| DD03 | Build       | Use exact count products for maximum gaps and ties.                                           |
| DD04 | Build       | Add original-unit W1 and an interval explanation in M2.                                       |
| DD05 | Build       | Add fixed inverse-ECDF percentile differences in M3.                                          |
| DD06 | Build       | Keep exact arithmetic local; measure before adding scheduling.                                |
| DD07 | Build       | Show separate count, denominator, tie, and exclusion tables.                                  |
| DD08 | Build       | Recompute current-source membership and invalidate traces.                                    |
| DD09 | Build       | Ship state, notebook, docs, and examples in each milestone.                                   |
| DD10 | Avoid       | Do not infer significance from exploratory row distributions.                                 |
| DD11 | Avoid       | Generated Other and Overall do not define the chosen pair.                                    |
| DD12 | Avoid       | Default SD/range/IQR normalization obscures units and can fail.                               |
| DD13 | Defer       | Weights and multivariate/scan/alert workflows need separate contracts.                        |
| DD14 | Explore     | An explicit positive domain tolerance could provide useful context later.                     |
| DD15 | Defer       | Complements, containing wholes, frozen cohorts, and cross-source pairs need more scope rules. |
| DD16 | Explore     | A full difference curve may explain changes beyond three percentiles.                         |
| DD17 | Defer       | Focused ECDF modules need no general statistics/result engine.                                |
| DD18 | Build       | Input parity, all three widths, and resting image export belong to the feature.               |

## Evidence and remaining work

Local standalone exact-rational checks cover the plan's numerical vectors, swaps, replication, endpoint direction, and binary64 extremes. Existing-behavior tests and doc checks are recorded in [run.md](run.md). These do not prove the proposed feature.

Implementation must measure exact-arithmetic latency, verify prepared CSV types, and prove the new save/notebook/input/export flows. No open product decision prevents M1. Weights research is separate and is not a shipped dependency. DIRECTION governs future topic choice; this run assigns no next topic.
