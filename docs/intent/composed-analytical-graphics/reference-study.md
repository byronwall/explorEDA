# Reference compositions and capability order

Initial research: 2026-09-29. Pro research imported: 2026-10-10.
The original five examples below extend the email-strip and EV references. The later collection adds 23 distinct examples.
The capability choices below are proposals based on the graphics, not new user requirements.

## Shared elements

These graphics combine familiar parts into one authored surface. Their value comes from data relationships and placement.

| Shared part | Product requirement |
| --- | --- |
| Title, subtitle, units, explanatory text | Separate text elements with deliberate placement and typography |
| Plot frames and scales | Named scale references; clear domains, ranges, and frame ownership |
| Data-bound geometry | One definition generates many marks or one path from several rows |
| Layers | Explicit drawing order for fills, lines, guides, and text |
| Derived values | Inspector shows input population, filters, and calculation |
| Annotations | Data, frame, or page anchors, with separate visual offsets |
| Repeated structure, where used | One template receives a subset; layout arranges instances |
| Coherent finishing | Save the composition and copy the same resolved graphic as PNG |

Repetition is not present in every source. A single frame must also work without a repeat rule.
Interactivity and source tracing are product additions; the references do not prove those authoring flows.

## 1. Driving Shifts Into Reverse — ordered paths

Hannah Fairfield's New York Times graphic connects annual observations of fuel cost and miles driven.
The path moves through two numeric dimensions. Year determines its order.
The accessible [University of Washington recreation](https://idl.uw.edu/mosaic/examples/driving-shifts.html) credits the original and includes its specification.
An [Observable recreation](https://observablehq.com/@observablehq/plot-connected-scatterplot) provides another inspectable version.

- **New capability:** A path consumes ordered rows, rather than generating one independent glyph per row.
- **Reuse:** Named-scale ownership, circle rendering, data anchors, text, and the baseline inspector.
- **Foundation still needed:** Bind both numeric coordinates for circles and paths in the same frame; strip circles cannot do this yet.
- **Proof composition:** Connect observations by year. Label selected years and add one movable callout.
- **Pass:** Reversing input row order preserves the year-ordered path. Trace reveals the path's rows and selected segment endpoints.
- **Data:** Use a small local year/miles/cost table. Preserve source attribution if using the recreation's data.

This adds a real relationship between records. Drawing another scatterplot would not prove it.

## 2. Bank of England inflation fan — interval bands

[February 2025 Monetary Policy Report, Chart 1.4](https://www.bankofengland.co.uk/monetary-policy-report/2025/february-2025)
combines a historical line, layered forecast bands, a target guide, and a projection region.

- **New capability:** Filled paths bind an ordered x field and lower/upper bounds. Several intervals share a frame.
- **Reuse:** Ordered paths, shared scales, layer order, guides, and anchored text.
- **Proof composition:** Draw three nested bands, a central line, and a marked historical/projection boundary.
- **Pass:** Bands keep their endpoints, layering, and clipping after resizing. Inspection identifies the bound fields and interval.
- **Data:** Use supplied illustrative interval values. The editor renders intervals; it does not calculate economic forecasts.

Unlike the previous example, this needs two boundaries per filled path and explicit fill ordering.

## 3. How We Spent Our Time in 2020 Versus 2019 — scoped distribution summaries

Nathan Yau's [FlowingData comparison](https://flowingdata.com/2021/08/03/time-use-pandemic/)
repeats activity plots in a grid. Each joins two interquartile ranges and marks their medians.
Color conveys the change in the median.

- **New capability:** Within each activity subset, calculate and pair two cohort summaries: quartiles, medians, and change.
- **Reuse:** Grid layout, circles, ordered bands, text, and color scales.
- **Proof composition:** Build one activity template, calculate summaries on the spot, then repeat it across activities.
- **Pass:** Filtering updates the summaries and color. Inspection explains both cohorts and the rows behind each summary.
- **Data:** Start with a controlled raw-duration fixture and unweighted quartiles. Do not claim survey-estimate parity.

The source uses activity-specific vertical domains. Our default remains common scales.
Allow an explicit template-level domain policy for this reproduction; it is not an instance visual override.
Zero prior medians produce an undefined percentage change, shown explicitly rather than mapped to a false color.

This extends calculation and binding, even though it reuses the previous example's filled geometry.

## 4. Causes of Death — normalized stacking

Nathan Yau's [FlowingData graphic](https://flowingdata.com/2016/01/05/causes-of-death/)
shows category shares across age as stacked areas, with labels inside the bands and population controls.

- **New capability:** Calculate a denominator and cumulative lower/upper bounds for each category at each age.
- **Reuse:** Interval geometry, population filters, scales, and data-bound text.
- **Proof composition:** Stack categories in an explicit order. Label selected bands and inspect one category at one age.
- **Pass:** Nonempty columns total 100%. Trace distinguishes the selected category's count from the denominator's contributors.
- **Data:** Use a controlled count table. Empty totals create gaps, not invented shares.

Keep category order stable. Population filters recompute the denominator.
Selecting or highlighting a category does not silently remove other categories from that denominator.
Any category-exclusion calculation must state its denominator policy.

This adds a transform involving neighboring series. Another independently drawn area would not prove it.

## 5. State rate comparisons with an overview inset — compound frames

Dan Keating and Leslie Shapiro's [Washington Post graphic](https://www.washingtonpost.com/health/interactive/2021/unvaccinated-case-rate-delta-surge/)
is documented in [FlowingData's review](https://flowingdata.com/2021/07/21/case-rates-adjusted-for-the-unvaccinated/).
The review identifies a difference region, national guide, historical comparison, and smaller full-history inset.
Its [captured graphic](https://flowingdata.com/wp-content/uploads/2021/07/unvaccinated-750x558.png) makes the placement clear.

- **New capability:** One unit contains a detail frame and overview frame with distinct domains, clipping, and parent-relative placement.
- **Reuse:** Lines, bands, scoped values, annotation anchors, and shared repeat rules.
- **Proof composition:** Create one compound unit, then repeat it for several illustrative regions.
- **Pass:** Both frames receive the correct region. The inset keeps full history while the main frame shows a recent window.
- **Data:** Use illustrative series and a separate national series. State the population and filter policy for each input.

A frame's display window must not become an implicit source filter for its sibling.
The national line can ignore a region selection while still following a date filter when explicitly configured.
Start with two sibling frames inside a unit. Arbitrary recursive repeats are unnecessary.

## Capability sequence

| Stage | Composition | Capability unlocked |
| --- | --- | --- |
| 0 | Existing email-strip reference | Blank authoring, primitives, repeats, scopes, anchors, visual overrides, save, trace, PNG |
| 1 | Driving | Ordered paths across records |
| 2 | Inflation fan | Lower/upper interval geometry and layered bands |
| 3 | Time use | Paired cohort calculations and derived visual bindings |
| 4 | Causes | Normalization, stacking, and denominator tracing |
| 5 | State comparison | Multiple coordinated frames within one repeated unit |

The existing EV comparison remains a small early layout regression check, not a sixth new reference.
Each stage must remain authorable through visible controls and preserve earlier compositions.
Detailed changes and completion gates are in [the implementation plan](implementation-plan.md).


## New Pro collection and integration recommendation

Read the [illustrated HTML report](raw/2026-10-10-pro-graphics/dataviz-composition-research/research-report.html) for every composition breakdown.
The [visual index](raw/2026-10-10-pro-graphics/dataviz-composition-research/visual-atlas.png) shows all 23 examples.
The [source archive](raw/2026-10-10-pro-graphics/README.md) includes the original prompt, complete response, reports, records, and images.

Pro reports 23 examples across all 12 requested families: three Today, seven Planned M2–M6, and thirteen New capability.
It reports twenty Available datasets and three Obtainable datasets. No example is labeled Synthetic.
These are source classifications. They are neither browser acceptance results nor proof that the underlying datasets are in the archive.

### Five proposed builds

| Pro example | Useful proof | Integration condition |
| --- | --- | --- |
| 01 — WSJ measles | Strip layout, missingness, shared color, fixed vaccine guide | Audit current palette and source-order limits first. |
| 03 — Yield Gap | Packed country cells, continent colors, crop sections | Record upstream joins, averages, bins, and cell packing; verify categorical color support. |
| 14 — Technology sparklines | Ordered paths, numeric extrema, row text | Extend M2; preserve observation-index x positions and shared y limits. |
| 05 — OBR fan charts | Supplied intervals, historical line, fiscal annotations | Extend M3; keep separate panel domains and March 2025 data. |
| 07 — Deaths and media coverage | Normalized columns with explainable denominators | Extend M5; preserve each selected-cause population and source correction. |

Keep the established milestone order. The five recommendations select useful examples; they do not approve new release scope.
Driving remains the first path proof. Time use remains the median/IQR proof.
The banana table, entry 04, is a strong compound-frame example after paths and strip behavior work.

### Gaps that matter now

Numeric circle positions appear in eight entries: 12, 14, 15, 16, 17, 18, 21, and 22.
This reinforces the numeric-point work already implied by Driving. Share coordinates with paths instead of adding chart-specific renderers.

Tile addresses appear in entries 13, 18, and 19. Dense automatic grids do not preserve geographical gaps or explicit addresses.
Keep that addition separate. Horizontal bar lengths (11), variable repeat height (20), path gradients (22), and area gradients (23) can wait.

The requested branch has narrower behavior than the prompt's “Today” model:

- Value colors use two endpoints with a nonnegative value mapping. Signed election shares and categorical continent colors need more work.
- Repeat order uses count or label. Source rank and explicit row/column addresses are absent.
- Shared value domains use filtered glyphs. Filtering can change colors even though position bins remain fixed.
- Missing numeric values produce no glyph. Exact neutral missing cells, multistop colors, and publication legends need separate checks.

Treat these as repository findings, not edits to the original report. Do not force numerical category codes through a continuous palette.
Source classifications remain unchanged in the archived JSON; the initiative map stores local reconciliation.

### Data details to preserve

Measles has 493 explicit null rates and one absent Alaska 2003 record. Its complete grid needs 4,335 cells.
Election stripe weights sum to 533 display slots, not the full 538 electoral votes. Color represents signed winner share, not vote margin.
The source covers eleven elections; the 2020 projection snapshot remains unverified.

The banana table uses rounded decade means, then averages those rounded means. Its sparkline domains are local.
Technology sparklines sort dates but space points by observation index. Their vertical limits are shared.
HBCU enrollment uses mean and sample SD across years; it does not prove M4 medians or quartiles.

The disaster tutorial changes a category name and interpolates across columns. Review that preparation before copying its scientific claims.
The IPCC files distinguish smoothed and annual values and encode missing values as `1e20`.
Density curves, rankings, packed cells, and fitted curves may be prepared upstream. Keep the preparation and original grain visible.

Three data gaps remain: the election projection (02), original population totals for capital-chart heights (20), and the occupation table (22).
Other Available entries can still use reconstruction data or later source vintages. Available does not mean exact publication parity.
Preserve every entry's source notes and reuse terms before including data or images in a public demo.

### Next integration step

Finish the remaining report/slide paste proof. Audit a small measles fixture, then continue numeric points and paths in M2.
Use local pinned fixtures for development. A prepared composition can protect regression behavior after blank authoring succeeds.
The complete entry-level crosswalk, source anchors, and checks remain in `initiative-map.json` and the raw archive.
