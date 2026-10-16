# A temperature range is not a confidence interval — design and analytical contract

**Question.** Do years with high means also have unusually wide within-year temperature ranges?

**Encoding.** A supplied min–max band surrounds an annual mean path. The band uses measured monthly extremes.
**Ordering.** Calendar-year order, with no smooth curves or forecast extension.
**Baseline.** No artificial zero baseline for a position-encoded Celsius series.
**Scale.** One shared linear temperature scale spans the mean and both supplied bounds.

## Fixed-snapshot findings

The average within-year observed monthly range was 5.86 °C. Eligible rows: 61; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-elnino-observed-range.json).

The largest within-year observed monthly range was 7.93 °C. Eligible rows: 61; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-elnino-observed-range.json).

## What this design gives up

The month that produced an extreme is lost. The band is not sampling uncertainty, a prediction interval, or a native forecast.

The lower and upper bounds are observed monthly minima and maxima, not confidence intervals. Annual summaries give months equal weight and erase timing within the year.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

NOAA CPC, ERSST v3b Niño 1+2; historical snapshot; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/elnino.json).
