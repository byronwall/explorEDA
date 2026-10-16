# The pace of fertility change is not uniform across decades — design and analytical contract

**Question.** Which complete decades contain the fastest average declines among the selected countries?

**Encoding.** Color encodes the first-to-last annualized change for each country-decade.
**Ordering.** Country labels alphabetically; decade categories chronologically.
**Baseline.** Zero is no first-to-last change. Each decade difference divides by nine elapsed years.
**Scale.** Shared signed linear ramp; live strip scales may rescale under active filters.

## Fixed-snapshot findings

The selected-country mean pace in the 1960s was -0.050 births per woman per elapsed year. Eligible rows: 12; full expression, denominator, and contributing IDs are in the

The corresponding pace in the 2000s was -0.022 births per woman per elapsed year. Eligible rows: 12; full expression, denominator, and contributing IDs are in the

## What this design gives up

Within-decade reversals and endpoint levels are lost. Color is less precise than position for comparing close values.

A decade’s first and last observations are nine elapsed years apart, not ten. The annualized difference is linear, not a compound growth rate. The incomplete 2010s are deliberately excluded.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

World Bank, UN and national statistical sources; historical snapshot; CC BY 4.0.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
