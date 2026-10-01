# Reference compositions and capability order

Research date: 2026-09-29. These five examples extend the existing email-strip and EV references.
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
- **Reuse:** Numeric scales, circles, data anchors, text, and the baseline inspector.
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
