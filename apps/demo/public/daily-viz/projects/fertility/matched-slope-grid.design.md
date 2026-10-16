# Two fertility endpoints, the same country cohort — design and analytical contract

**Question.** What changed between 1960 and 2011 for the same selected country cohort?

**Encoding.** A small paired slope chart for each country preserves its two endpoint observations.
**Ordering.** Country labels alphabetically; 1960 precedes 2011 on every panel.
**Baseline.** Shared zero on the fertility-rate scale; no country-specific rescaling.
**Scale.** Common linear births-per-woman and endpoint-year scales.

## Fixed-snapshot findings

The mean matched-country change was -2.965 births per woman. Eligible rows: 12; full expression, denominator, and contributing IDs are in the

The largest decline in the selected cohort was -4.911 births per woman. Eligible rows: 12; full expression, denominator, and contributing IDs are in the

## What this design gives up

The connecting segment is an endpoint comparison, not interpolation of the intervening annual path.

The endpoint year is 2011 because the supplied 2012–2013 columns are empty. Endpoint differences hide intervening reversals. Countries have equal weight and no claim is made about the world population.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

World Bank, UN and national statistical sources; historical snapshot; CC BY 4.0.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
