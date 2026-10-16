# Long strikes without crushing the short ones — design and analytical contract

**Question.** How far apart are the mean and median durations in this selected strike sample?

**Encoding.** Each strike is one swarmed dot on a logarithmic duration scale, separated by the declared production-context split.
**Ordering.** Context labels alphabetically; within-row vertical displacement has no data meaning.
**Baseline.** A log scale has no zero. Every supplied duration is positive and retained.
**Scale.** Shared log day scale, so equal horizontal distances represent ratios rather than day differences.

## Fixed-snapshot findings

The mean recorded duration was 42.66 days. Eligible rows: 62; full expression, denominator, and contributing IDs are in the

The median recorded duration was 27.00 days. Eligible rows: 62; full expression, denominator, and contributing IDs are in the

## What this design gives up

The spacing no longer communicates additive days. Group separation is descriptive, not an estimate of a production effect.

The sample contains selected manufacturing strikes, not all labor disputes. Durations describe completed recorded events and should not be interpreted as a forecast for a current dispute.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

BLS / Kennan strike-duration sample via statsmodels; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
