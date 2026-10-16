# A source-rate spread, with the subtraction made explicit — design and analytical contract

**Question.** How large is the recorded bond-rate minus deposit-rate spread?

**Encoding.** A single path encodes bond rate minus deposit rate, with each supplied quarter marked.
**Ordering.** Calendar-quarter order.
**Baseline.** Zero means equal source rates.
**Scale.** Linear source fractions, not silently formatted as percentages or currency.

## Fixed-snapshot findings

The smallest recorded bond-minus-deposit spread was 0.0253 in source rate fractions. Eligible rows: 55; full expression, denominator, and contributing IDs are in the

The largest recorded spread was 0.1050 in source rate fractions. Eligible rows: 55; full expression, denominator, and contributing IDs are in the

## What this design gives up

The two source levels are removed by subtraction. The companion notebook retains them and explains the historical scope.

The displayed rates are historical source fractions, not current quoted products. A spread is not a total investment return, and the observations support no recommendation about present borrowing or investing.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Johansen and Juselius Danish data via statsmodels; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
