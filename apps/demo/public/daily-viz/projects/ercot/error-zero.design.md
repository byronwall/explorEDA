# One zero line makes the forecast miss readable — design and analytical contract

**Question.** How does subtracting the forecast change the reading of the supplied ERCOT hours?

**Encoding.** A chronological path encodes the signed MWh difference. A constant horizontal rule marks equality.
**Ordering.** Ascending supplied UTC timestamp; no smoothing.
**Baseline.** Zero is actual equals forecast.
**Scale.** Shared linear MWh scale includes zero. The x scale uses real timestamps.

## Fixed-snapshot findings

The mean signed error was -1,242.9 MWh per supplied hour. Eligible rows: 1,417; full expression, denominator, and contributing IDs are in the

The mean absolute error was 2,591.7 MWh per supplied hour. Eligible rows: 1,417; full expression, denominator, and contributing IDs are in the

## What this design gives up

The original served-demand and forecast levels disappear. The source notebook preserves both.

Actual is electricity served in each supplied hour, not unconstrained demand. These observations alone cannot identify why consumption or supply changed. The UTC snapshot includes partial boundary dates.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

EIA / ERCOT; authorized repository snapshot; U.S. public-domain data.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
