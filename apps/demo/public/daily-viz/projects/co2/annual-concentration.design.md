# A historical CO2 rise, one available-week mean per year — design and analytical contract

**Question.** What does this historical weekly Mauna Loa snapshot show without filling gaps?

**Encoding.** A thin path and dots show the available-week annual means. Dots retain the annual sampling unit.
**Ordering.** Chronological years; no endpoint extension.
**Baseline.** The concentration axis is not forced to zero because position, not bar length, encodes value.
**Scale.** One linear concentration scale; partial endpoint years remain included and documented.

## Fixed-snapshot findings

The mean measured concentration in the 1960s was 320.22 ppmv. Eligible rows: 488; full expression, denominator, and contributing IDs are in the

The mean measured concentration in the 1990s was 360.38 ppmv. Eligible rows: 521; full expression, denominator, and contributing IDs are in the

## What this design gives up

Seasonality and week-level coverage disappear in the annual mean; they remain in the linked source material.

This is the historical flask-data revision distributed with statsmodels, not the latest NOAA series. Missing weeks stay null. Weekly observations at one station are not global spatial measurements.

## Interactions and tracing

In viewing mode, selecting a repeated unit is intended to filter that repeat across a workspace. Alt-click traces contributing marks. These behaviors come from the inspected baseline contract; this artifact has not been browser-tested. Static findings above describe the unfiltered snapshot.

## Credit

Keeling and Whorf / CDIAC; statsmodels historical snapshot; public domain.
Full provenance and transformations: [dataset record](../../datasets.json), [fields](fields.json).
