# Two warm-water windows on one unshifted clock — design and analytical contract

**Question.** How do the supplied 1982–1983 and 1997–1998 windows differ after seasonal centering?

**Encoding.** Two colored paths retain the monthly anomalies in the predeclared two-year windows.
**Ordering.** Each path runs from January of its first year; peaks are not shifted into alignment.
**Baseline.** Zero is the selected calendar-month climatology.
**Scale.** Shared linear Celsius anomaly scale and identical 1–24 month index.

## Fixed-snapshot findings

The largest monthly anomaly in the 1982–1983 window was 4.35 °C. Eligible rows: 24; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-elnino-aligned-windows.json).

The largest monthly anomaly in the 1997–1998 window was 4.07 °C. Eligible rows: 24; full expression, denominator, and contributing IDs are in the [evidence](../../evidence/findings/cp-elnino-aligned-windows.json).

## What this design gives up

A two-window comparison cannot establish the distribution of all events or a causal explanation.

The two windows are illustrative, predeclared spans, not an automated event sample. Alignment begins in January of each first year and does not align peaks or event onset. No causal attribution follows.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

NOAA CPC, ERSST v3b Niño 1+2; historical snapshot; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](../../evidence/fields/elnino.json).
