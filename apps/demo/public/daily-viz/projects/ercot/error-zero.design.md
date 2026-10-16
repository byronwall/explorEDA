# One zero line makes the forecast miss readable

**Question.** What does an hour-by-hour forecast miss look like when zero is the reference?

- **Encoding.** A chronological path encodes the signed MWh difference. A constant horizontal rule marks equality.
- **Ordering.** Ascending UTC timestamp; no smoothing.
- **Baseline.** Zero is actual equals forecast.
- **Scale.** Shared linear MWh scale includes zero. The x scale uses real timestamps.

## What this design gives up

The original served-demand and forecast levels disappear. The source notebook preserves both.

Actual is electricity served in each hour, not unconstrained demand. These observations alone cannot identify why consumption or supply changed. The UTC snapshot includes partial boundary dates.
