# Saved reference assets

Retrieved 2026-09-29. Keep these files with the initiative so later work does not depend on live source pages.
These are research references, not application assets. Retain author attribution when using them.
File sizes and SHA-256 hashes are recorded in [checksums.json](checksums.json).

## Images

| Composition | Local files | Source and status |
| --- | --- | --- |
| Email strips | [Image](email-strip.png) | [FlowingData source](https://flowingdata.com/wp-content/uploads/2026/02/epstein-email-network-750x805.png); original published preview |
| EV comparison | [Image](ev-price-range.png) | [FlowingData source](https://flowingdata.com/wp-content/uploads/2026/04/EV-range-price-750x623.png); original published preview |
| Driving | [Capture](driving-recreation.jpg), [SVG](driving-recreation.svg) | [UW recreation](https://idl.uw.edu/mosaic/examples/driving-shifts.html); rendered chart capture and DOM SVG, not original NYT artwork |
| Inflation fan | [Image](inflation-fan.jpg) | [Bank of England report](https://www.bankofengland.co.uk/monetary-policy-report/2025/february-2025), Chart 1.4; decoded original embedded JPEG |
| Time use | [Increasing activities](time-use-increased.png), [Decreasing activities](time-use-decreased.png), [Legend](time-use-legend.png) | [FlowingData article](https://flowingdata.com/2021/08/03/time-use-pandemic/); original published graphics |
| Causes | [Image](causes-of-death.png) | [FlowingData image](https://flowingdata.com/wp-content/uploads/2016/01/Cause-of-Death-by-Age.png); original published overview |
| State comparison | [Image](state-comparison.png) | [FlowingData capture](https://flowingdata.com/wp-content/uploads/2021/07/unvaccinated-750x558.png); captured Washington Post graphic |

Time-use image URLs use the prefix `https://flowingdata.com/wp-content/uploads/2021/08/`:
`duration-increased-activities-desktop-1.png`, `duration-decreased-activities-desktop-1.png`, and `legend-v2-desktop-mobile-1.png`.

## Data

| Composition | Saved dataset | Provenance and limits |
| --- | --- | --- |
| Email | [Correspondents](email-correspondents-reconstructed.tsv), [Months](email-months-reconstructed.tsv) | Copied from the old local reproduction. Values reconstructed from an image; not official email records |
| EV | [Models](ev-models-source-extract.tsv) | Copied from the old local reproduction. Its notes describe extraction from the NYT article's embedded data |
| Driving | [Parquet table](driving.parquet) | Downloaded from [UW Mosaic](https://idl.uw.edu/mosaic/data/driving.parquet); source table for the accessible recreation |
| Inflation fan | [Workbook](inflation-fan-data.xlsx) | Extracted unchanged as `Current fan chart data.xlsx` from the official February 2025 chart-data archive |
| Time use | Not downloaded | Article provides images and identifies survey inputs. No direct chart-data download was exposed in the inspected page |
| Causes | Not downloaded | Embedded chart names a public TSV. Its direct download returned HTTP 403; do not replace it with inferred counts |
| State comparison | Not downloaded | Reference image is saved. An exact chart-data table was not acquired during this research |

Bank archive: [February 2025 chart slides and data](https://www.bankofengland.co.uk/-/media/boe/files/monetary-policy-report/2025/february/mpr-february-2025-chart-slides-and-data.zip).
Only the current fan workbook is retained. The archive contains other unrelated report files.
The workbook is source material; its sheets have not yet been mapped into a composition fixture.

Causes data URL observed in the embedded chart's source:
[death-prop-2005-2014.tsv](https://flowingdata.com/projects/2015/cause-death/data/death-prop-2005-2014.tsv).
The filename suggests proportions. Verify columns before treating it as counts or claiming denominator traceability.

Old fixture directory: `/Users/byronwall/Projects/data-and-glyphs/app/src/lib/viz/compiler/gallery-specs/`.
Copied filenames: `flowingdata-epstein-correspondents-2026.tsv`, `flowingdata-epstein-email-months-2026.tsv`, and `flowingdata-ev-models-2026.tsv`.
Extraction notes remain in that project's `docs/flowingdata-ev-price-range-2026-work-summary.md`.

## Rules for future fixtures

Store downloaded data beside its image. Add its source URL, retrieval date, and any extraction steps here.
Distinguish source records, prepared summaries, image reconstructions, and illustrative fixtures.
Keep illustrative fixtures separate from source data. Do not fabricate source rows for a published summary.
Use controlled counts for the normalized-stack proof until actual counts with valid denominator inputs are available.
Use controlled raw durations for the quartile proof until survey weighting and source preparation are specified.
Inspect stored image resolution before using it for visual comparison; previews may be smaller than published originals.


## Additional Pro research

The [2026-10-10 source archive](../raw/2026-10-10-pro-graphics/README.md) preserves 23 additional graphics and the full Pro report.
Its original images and metadata remain separate from these earlier reference assets.
See the [reference study](../reference-study.md) for the current integration recommendation.
