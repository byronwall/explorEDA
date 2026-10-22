# R035 — Define rolling results from exact contributors

- ID: R035
- Category: Types, quantities, and dates
- Priority: 43
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A moving average can look reasonable while assigning the wrong weight to periods with different observation counts. The repository already computes UTC period buckets with contributors and shared count, sum, and average reductions. `poolAggregateRows` demonstrates why combining underlying rows differs from averaging group results. The calendar-period intent identifies rolling measures as a future candidate. The valuable research is choosing their mathematical population and missing-period policy before adding a smoothing control.

Compare a rolling mean over pooled raw observations with an equal-weight mean over period summaries; both can be legitimate when named precisely. Separately compare trailing calendar-duration windows with a fixed number of existing buckets. Observable Plot documents window anchors and strict handling of incomplete or missing windows, providing useful decision dimensions rather than a ready-made explorEDA contract. A missing period, a period with zero observations, and an observed zero measure must remain distinguishable.

The first experiment should use three unequal-sized periods, a deliberately absent period, and a partially observed edge. Hand-calculate pooled sums and denominators alongside equal-weight period means, then list every contributor in each window. Accept a definition when values, membership, and missing-window behavior are independently explainable and a reviewer can predict the next output. Reject a proposed implementation if the curve looks plausible but cannot account for the weighted difference, or if it silently turns an absent period into zero.

This is a focused follow-up to calendar-period-analysis and the still-unprioritized reusable-output seed. A narrow derived table may be easier to maintain than a general expression language; a chart-local proof is also viable if its semantics stay inspectable. Public API cost depends on whether windows become reusable source steps. Confidence is medium until a real repeated smoothing task establishes demand. The investigation is distinct from stepping a visible date range: it defines the value calculated inside each window and protects analytical interpretation.

## References

- Repository: `packages/explorEDA/src/lib/dailyRollup.ts` — `rollupByPeriod`, `TimeBucket`. Current period summaries retain contributors and boundaries.
- Repository: `packages/explorEDA/src/lib/aggregates.ts` — `summarizeGroup`, `poolAggregateRows`. Shared reducers already preserve contributor eligibility and re-pool rows.
- Repository: `packages/explorEDA/src/lib/calculations/functions/registry.ts` — `calculationFunctions`. Ordinary scalar functions evaluate values within one row.
- Related intent: `docs/intent/calendar-period-analysis/intent-brief.md`.
- Related intent: `docs/intent/reusable-analysis-outputs/intent-brief.md`.
- External comparison: https://observablehq.com/plot/transforms/window (accessed 2026-10-20).
