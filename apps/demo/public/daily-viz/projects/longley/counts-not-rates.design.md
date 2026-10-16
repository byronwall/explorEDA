# Separate historical counts instead of inventing a rate — design and analytical contract

**Question.** What do the raw historical count series show without inventing a labor-force denominator?

**Encoding.** Two independently labeled historical count paths keep distinct populations separate.
**Ordering.** Calendar years in both panels.
**Baseline.** Both value scales include zero; these are counts, not a computed labor-force share.
**Scale.** Shared time domain with separate count domains, explicitly not a stacked total or dual-axis overlay.

## Fixed-snapshot findings

The smallest recorded unemployment count was 1,870 source count units. Eligible rows: 16; full expression, denominator, and contributing IDs are in the

The largest recorded unemployment count was 4,806 source count units. Eligible rows: 16; full expression, denominator, and contributing IDs are in the

## What this design gives up

Comparing panel heights without reading the scales is invalid. No denominator for an official unemployment rate is supplied.

The selected columns do not provide a verified labor-force denominator for constructing a standard unemployment rate. Population is not a substitute. These source counts belong to an old benchmark vintage.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Longley historical employment benchmark via statsmodels; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
