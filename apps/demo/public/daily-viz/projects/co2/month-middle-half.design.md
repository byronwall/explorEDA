# The middle half of centered CO2 weeks, month by month — design and analytical contract

**Question.** Which calendar months sit above or below their own year’s measured-week mean?

**Encoding.** Native unweighted quartiles form a band and medians are connected across ordered months.
**Ordering.** Padded month labels preserve January-to-December order.
**Baseline.** Zero is each underlying year’s measured-week mean, not a universal absolute concentration.
**Scale.** Shared linear residual scale; the summary is recomputed from eligible live rows.

## Fixed-snapshot findings

The mean centered value for May weeks was 2.76 ppmv. Eligible rows: 187; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-co2-month-middle-half.json).

The mean centered value for September weeks was -2.77 ppmv. Eligible rows: 184; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-co2-month-middle-half.json).

## What this design gives up

This representation hides the absolute concentration trend and each individual week. Means quoted in the companion are distinct from the drawn medians.

Centering by an available-week annual mean does not remove every within-year trend. Incomplete years and uneven missingness can shift the reference. Residuals are not a fitted seasonal model.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Keeling and Whorf / CDIAC; statsmodels historical snapshot; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/co2.json).
