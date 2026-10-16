# A common starting index is an analytical choice — design and analytical contract

**Question.** How similar are employment, population, and nominal output after rebasing their starting values?

**Encoding.** Three colored paths compare proportional movement after each series is rebased to its first value.
**Ordering.** Chronological source years, without smoothing.
**Baseline.** The reference 100 is imposed by rebasing; it is not an independently observed economic equality.
**Scale.** One shared linear index scale for all three series.

## Fixed-snapshot findings

Employment and nominal GNP in levels had correlation 0.984. Eligible rows: 16; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-longley-three-indices.json).

Their valid annual changes had correlation 0.892. Eligible rows: 15; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-longley-three-indices.json).

## What this design gives up

Original counts and nominal-output units are erased. Nominal GNP growth still includes price-level change.

This is a small historical regression benchmark, not a current labor-market dataset. GNP is nominal and source units are retained. Similar trends do not establish a stable causal employment model.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Longley historical employment benchmark via statsmodels; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/longley.json).
