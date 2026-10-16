# GDP growth folded around zero, not the GDP level — design and analytical contract

**Question.** What changes when a historical GDP level becomes an annualized quarter-to-quarter growth rate?

**Encoding.** A native horizon mark folds positive and negative annualized quarterly growth into compact bands.
**Ordering.** Quarter order, with the initial unavailable change left null.
**Baseline.** Zero means no quarterly GDP change; the horizon is not rebased to its first observation.
**Scale.** Shared growth magnitude; three bands are a display choice, not economic categories.

## Fixed-snapshot findings

The smallest derived annualized quarterly GDP growth rate was -7.95%. Eligible rows: 202; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-macro-growth-horizon.json).

The largest derived annualized quarterly GDP growth rate was 16.69%. Eligible rows: 202; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-macro-growth-horizon.json).

## What this design gives up

Folding reduces direct vertical reading and can obscure the size of extremes. The original growth line is the necessary companion.

This is an old source vintage, not current revised GDP. Annualizing a quarterly change is a mathematical convention, not the year-on-year rate. The first supplied quarter has no preceding observation in this file.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

U.S. macroeconomic sources via statsmodels; historical vintage; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/macro.json).
