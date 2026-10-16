# Annual sunspot activity has different distributions across eras — design and analytical contract

**Question.** What range of annual activity is visible in this historical sunspot-number revision?

**Encoding.** One native kernel-density trace summarizes annual sunspot numbers in each broad historical span.
**Ordering.** Half-century labels in ascending order; the final span is incomplete.
**Baseline.** The horizontal scale includes zero; ridge height is a shared density peak, not an observation count.
**Scale.** A shared activity domain allows horizontal comparison. Density peaks may rescale with active filters in this baseline.

## Fixed-snapshot findings

The largest supplied annual sunspot number is 190.2. Eligible rows: 309; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-sunspots-activity-ridges.json).

The median supplied annual sunspot number is 40.0. Eligible rows: 309; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-sunspots-activity-ridges.json).

## What this design gives up

Smoothing hides individual years and depends on bandwidth. Unequal era counts remain in the source notebook.

The historical series is preserved as supplied and is not the current revised international sunspot-number series. Annual averages obscure monthly peaks; this is not a forecast of the next cycle.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

NOAA historical sunspot series via statsmodels; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/sunspots.json).
