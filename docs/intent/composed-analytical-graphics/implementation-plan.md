---
title: "Composed analytical graphics — implementation plan"
slug: "composed-analytical-graphics"
phase: plan
status: current
last_updated: "2026-10-10"
---

# Composed analytical graphics — implementation plan

## Plan at a glance

The first editor slice exists. Finish its remaining report/slide paste proof before declaring Milestone 1 complete.
Then add five capabilities through the [reference compositions](reference-study.md), in dependency order.
Each example must add a reusable operation, not a hard-coded chart type.

The sequence is ordered paths, interval bands, paired distribution summaries, normalized stacks, then compound frames.
Geometry arrives before the calculations that consume it. Compound frames arrive after scope and anchor behavior work.
The first release can stop after the email proof and a small comparison/grid check.
Later milestones extend that working editor without requiring the whole ladder to ship together.

Research does not establish exact source-data reproduction as a requirement.
Use small local fixtures with known values. Label illustrative data and document its source.
Author each proof from blank. A completed fixture definition can support regression checks but cannot replace that authoring proof.

### Handoff for Claude

This update preserves Pro's full response, prompt, reports, records, and images in the [raw source folder](raw/2026-10-10-pro-graphics/README.md).
No application code changed. The source report's capability tiers describe the prompt model, not verified support in this branch.

1. Close the remaining Milestone 1 output proof. Keep its implemented editor.
2. Audit a small measles strip before a full reference build. Compare zeros, nulls, absent cells, order, and fixed guide placement.
3. Continue M2 with shared numeric coordinates for both points and ordered paths.
4. Use the technology sparkline table as a second M2 proof, then OBR bands in M3 and media/death denominators in M5.
5. Keep the banana table as an M6 proof. Tile addresses and remaining geometry gaps stay below the cut line.

Pro's five suggested builds are measles, Yield Gap, technology sparklines, OBR fans, and media/death shares.
They are candidate examples, not a replacement milestone order. Preserve the existing time-use proof for M4.
Yield Gap needs explicit upstream cell packing; check categorical colors before treating it as supported.

## Implementation strategy

### Repository fit

Snapshot: `claude/composed-chart-audit-62bcc8` at `29b402349f7ee1214cb5f71dc17bc8c5cac84458`, inspected 2026-10-10.
The composition editor and direct editor entry are present. PR #215 is already in this branch history.
The original milestone sequence remains; the continuation uses the existing implementation below.

| Existing seam                                                                             | Planned use                                                               |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `src/charts/registry.ts`, `src/types/ChartTypes.ts`                                       | Register one composition type and its settings                            |
| `src/components/charts/ChartRenderer.tsx`                                                 | Render the composition through the existing chart dispatch                |
| `src/components/ChartGridLayout.tsx`                                                      | Host the complete composition; do not make each element a dashboard tile  |
| `src/providers/DataLayerProvider.tsx`, `src/lib/aggregates.ts`                            | Reuse data, filtering, and contributor metadata where their contracts fit |
| `src/components/charts/FacetRelated/facetLayout.ts`                                       | Reuse repeat placement calculations                                       |
| `src/components/charts/ScatterPlot/scatterPlan.ts`                                        | Follow the existing pure planning pattern                                 |
| `src/components/charts/trace/ChartTraceScope.tsx`, `traceTypes.ts`, `ChartTracePanel.tsx` | Add composition inspection to the current tracing surface                 |
| `src/utils/saveDataUtils.ts`, `src/types/SavedDataStructure.ts`                           | Carry definitions through save, validation, and restore                   |

Paths above are relative to `packages/explorEDA/`. Those integration points already host the first slice.
Continue in `src/components/charts/Composition/`:

- `compositionTypes.ts` and `validateComposition.ts`: serializable definitions and their validation.
- `resolveUnit.ts` and `resolveComposition.ts`: strip aggregation, placement, guides, annotations, and scene nodes.
- `UnitInspector.tsx`, `ScaleInspector.tsx`, and `AnnotationInspector.tsx`: visible authoring controls.
- `compositionTrace.ts` and `CompositionTraceBody.tsx`: retained contributors and inspection.
- `compositionOutput.ts`: existing PNG copy action; reuse it for new scene geometry.

Mark aggregation supports count, sum, and average. Label/guide calculations also support min and max.
Quartiles and stacking still need new calculations. Numeric x/y binding is absent from strip marks.
Named value scales currently have two color endpoints and a nonnegative value-to-maximum mapping.
Repeat order is count or label; explicit source rank and tile addresses are absent.
These limits affect Pro's “Today” classifications. Keep source classifications unchanged in raw files and record local findings separately.

### Small model and render path

Keep React and TypeScript. Extend the existing serializable composition definition and pure SVG scene resolver.
Store elements, frames, named scales, data bindings, calculations, repeat rules, and visual overrides.
Use direct typed properties, not a general graph language or a new compiler.
Extend the definition only when the next reference requires it.

Current scales declare domain policy, and each unit frame supplies pixel ranges.
Extend that ownership to named numeric x/y scales and path clipping. Points and paths must use the same coordinate mapping.
Keep shared versus local domains explicit; settle filter-driven domain changes before claiming archival scale fidelity.

Keep instance identities tied to subset keys. Visual overrides reference those keys and element IDs.
Population, filter policy, and frame display window are separate inputs.
Retain contributor references through calculations and geometry; do not recover data relationships from pixels.

Use existing `d3-scale` and `d3-array`. Use `d3-shape` for paths and areas.
It is already installed as a development dependency; verify bundling and declare it correctly if runtime imports require it.
Its native [area](https://d3js.org/d3-shape/area) and [stack](https://d3js.org/d3-shape/stack) operations cover the later geometry.
No additional chart engine is needed.

### Local loop and platform proof

Run `pnpm --filter demo dev --port 5291 --strictPort` for authoring proofs using the library source.
Run focused tests with `pnpm --filter exploreda exec vitest run <test-file>` after resolver or calculation changes.
Run `pnpm --filter exploreda check-types` while working and `pnpm check` once before each PR.
Confirm the local demo and fixture before browser checks. No browser acceptance test ran during this document import.
Read `docs/ui-defaults.md` before implementing controls. Use existing tooltips and accessible names.

PNG clipboard is the only material external platform boundary in the initial flow.
Resolve one SVG for viewing and output. Wait for fonts, rasterize at the chosen pixel size, then write an image blob.
The [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write) requires a secure context and can reject writes.
Keep the user gesture and visible failure handling in the copy action.

Prove PNG generation locally before testing the real clipboard in the supported browser.
Paste into a report or slide and compare text, dimensions, colors, and clipping.
A mock write only proves error handling. It cannot prove paste compatibility.
On failure, preserve edits and allow retry. Do not add alternate export formats to solve this proof.

## Milestone 1: Finish a repeated email-style graphic from blank

Retain the implemented editor. Close its remaining acceptance proof before adding path geometry.
The list below records the agreed first-slice behavior; it is not a request to rebuild existing components.

- Add blank composition creation, text, frames, scales, rectangles, circles, and annotation lines.
- Add an inspector for bindings and ad hoc count/sum/average calculations.
- Support subset and composition populations, plus active-filter and ignore-filter policies.
- Add row, column, and grid repeat placement. Let the author move groups and nudge individual instances.
- Keep template edits distinct from visual instance overrides. Provide reset-to-template for an override.
- Add data, frame, and page anchors, with independent offsets.
- Add editing/viewing modes and a visible, keyboard-accessible inspection action.
- Save, validate, restore, and copy the resolved graphic as PNG.

Use about 10,000 raw rows, 10–15 units, and 1,000–2,000 glyphs for the representative proof.
The old email reconstruction supplies visual guidance only. Its inferred values are not verified email records.

Protect save/restore and override identity with one focused scenario: filter, reorder, save, reload, then inspect the same subset.
Check moving-point, frame, and page anchors in a small fixture.
Use the existing EV reference for a small comparison/grid authoring check.

### Desired end state

The author creates the graphic through visible controls, reloads it, inspects a monthly mark, and pastes its PNG.
Common scales and a filter-independent guide remain clear. Saved nudges follow their subsets after reordering.
Record redraw and selection timing at representative size; no latency target has been agreed.
This is the first release boundary. Reverting this slice removes only the new composition entry and its files.

### Status: code built; output acceptance remains open (updated 2026-10-10)

A stack of five PRs builds Milestone 1 as a vertical slice in `packages/explorEDA/src/components/charts/Composition/`.
The demo's **Compose a report graphic** example (`?example=message-log`) opens a blank composition beside linked views of a synthetic 10,376-row message log.

| PR  | Adds                                                                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The `composition` chart type, artboard, text elements, edit and view modes, layer list, drag and arrow-key placement                                                                                                              |
| 2   | Chart units: a frame of rect or circle marks, named position and value scales (shared by default, per unit optional), and a repeat rule as rows, columns, or a grid                                                               |
| 3   | Calculations with separate population (each repeat or whole graphic) and filter policy (follow or ignore); repeat label values, `{Name}` text tokens, guide rules, and annotations anchored to the page, a frame, or a data glyph |
| 4   | Repeat overrides keyed by subset value (nudge, accent, opacity, bold label) with reset; view-mode click to select a repeat across the workspace; Alt-click and Alt-Enter tracing with source rows                                 |
| 5   | Copy PNG to the clipboard at twice the artboard size, drawn from the viewed artboard without editing overlays                                                                                                                     |

How the slice answers the plan's open choices:

- **Frames and scales.** Scales are named composition-level objects that hold domain policy. A chart unit's frame supplies the pixel range. Marks reference one position scale and one value scale.
- **Editing and viewing.** The chart's details view is the editor: the artboard on the left and the inspector on the right. Opening the inspector starts edit mode; the grid tile shows the view.
  A blank composition shows an **Open editor** button, and a new composition opens in the editor. The settings popover's **Full editor** button moves there too.
- **Template and instance.** Clicking a selected unit's repeat selects that repeat. The inspector then shows an override panel above the template and states which one an edit changes.
- **Data scope.** Repeats and position domains come from every row in the population, so filtering keeps the layout and empties marks instead of removing repeats.

Measured on 2026-10-08 (Apple silicon, Chromium headless, production package build):

- Resolving the email graphic from 10,376 rows takes about 7 ms for 536 monthly glyphs and 8 ms for 2,136 weekly glyphs.
- A template edit takes about 170 ms from input to the second animation frame. The resolver is a small part of that; the rest is the workspace update path that every chart setting edit takes.
  Since 2026-10-10, a text, style, or composition edit no longer redraws the other charts, because the workspace keeps their live rows. In a development build of the message-log example, adding an element went from about 165 ms to about 70 ms of main-thread work.
- Copy PNG writes a 1920 × 1200 image that reads back from the Chromium clipboard. Pasting into a report or slide has not been checked by hand yet.

#### Measles audit: built (updated 2026-10-10)

The measles strip (research entry 01) ships as `?example=measles`, prepared by `apps/data-samples/prepare/measles.ts` from the publisher's JSON and state order: the complete 51 × 85 grid with 3,841 rates, 493 explicit nulls, and the one absent Alaska 2003 cell, each named in a `Status` column.
Two additions closed the audit's gaps. Value scales take more than two colors, each placed at a stop along the ramp, so the publisher's eleven-stop ramp maps exactly; a two-color ramp keeps its visibility floor.
Strip marks take a missing color: a bin whose rows have no value draws a neutral cell, while a bin with no rows stays blank, so "not reported" and "no record" read differently and the missing cell's trace says so.
The publisher's row order comes through the repeat's value order on a prepared rank column. The 1963 guide is a fixed constant and holds under filtering. No rate is replaced with zero.

Research adds one small follow-up audit. Use a local measles fixture containing zero, null, and an absent state/year cell.
The published source has 4,334 records, including 493 null rates; a complete 51 × 85 grid has 4,335 cells.
Keep the absent Alaska 2003 record distinct in preparation. Do not replace missing rates with zero.
Current numeric aggregation omits all-null cells; it does not render a dedicated missing-value mark.
Decide whether a documented approximation is sufficient before adding exact multistop palettes or publisher row order.

Open questions for the next round:

- Value domains are computed from the glyphs that pass the filters, so colors rescale while filtering. Position domains stay fixed. Decide whether value domains should also stay fixed by default.
- Overrides cover placement and look. Hiding a repeat, or overriding its label text, would be the next requests to confirm.
- Guides take one value from a fixed entry or a calculation. Bands between two values, and guides on value scales, are not built.
- The example graphic is authored by hand in the demo. A saved reference composition could become a regression fixture once the model settles.

## Milestone 2: Connect observations in an explicit order

Create the Driving composition with a path, points, selected-year labels, and a data-bound callout.

- Add numeric x/y fields and named domains shared by point marks and paths in one frame.
- Add series and order bindings to the path element. Use year order, not x-coordinate order.
- Define missing-value breaks and a stable tie policy for equal order values.
- Inspect path contributors and segment endpoints using retained row references.
- Reuse current scale and annotation controls; add only the path-specific fields.

One resolver test uses shuffled input, a reversal in x, and a missing coordinate.
The rendered path must preserve the declared sequence and break at the missing value.
Check that a circle and path vertex for the same record occupy the same position after a domain change.

Then try research entry 14: fourteen company sparklines with extrema and endpoint markers.
Its source sorts by date, then spaces observations by index within each company. It does not align every row by calendar date.
Keep one shared opening-price y domain and source percentage-change order. A text rail plus one frame is sufficient.
Treat richer row labels and ordering as explicit follow-up work if the current controls cannot express them.

### Desired end state

The author builds the connected scatterplot from blank and can inspect its ordering.
Callouts track their selected records after a scale change.
Earlier rectangle/circle compositions still save and copy correctly. Remove the new path option to roll back this stage.

### Status: Driving built (updated 2026-10-10)

The Driving example ships as `?example=driving-shifts`, prepared by `apps/data-samples/prepare/driving.ts` from vega-datasets with the rows shuffled on purpose.
Marks are now a union: strips keep their position and value scales; point and path marks bind two numeric scales, one for x and one for y, so a point and its path vertex share one mapping.
Numeric scales hold the domain policy (shared or per unit), a zero baseline, tidy ends, and optional fixed limits; fixed limits clip marks to the frame through a scene clip box.
A path orders a repeat's rows by one field, ties by row order, and breaks at a missing order or coordinate. Its trace lists the order, runs, skipped rows, and endpoints.
Annotations gained an `at` pick that follows the glyph whose label matches a typed value, such as a year, and guides place at a numeric x.
Blank authoring was checked in the browser: X–Y unit, title, and a 2008 callout from the Add chart dialog.

Not built yet: label placement from a side field, path curves, and horizontal guides on y.

The technology sparkline table (research entry 14) ships as `?example=tech-sparklines`, prepared by `apps/data-samples/prepare/big-tech.ts`.
It added three reusable operations: repeats ordered by a per-repeat calculation (low or high first, reading every row so filters do not reorder), `first`, `last`, and `change` calculations ordered by a field, and point marks that show only the first, last, lowest, or highest row.
Observation index spaces each company's points with a per-unit x domain; the y domain is shared from zero, as the source's `same_limit` default. Prices are split-adjusted in the source.
Annotations now fill `{Calculation}` tokens as page text does.

The consumer confidence grid (research entry 12) ships as `?example=consumer-confidence` from `apps/data-samples/prepare/consumer-confidence.ts`.
Path and point marks split by a series field, draw from the repeat's rows or the whole graphic, and take a focus: the repeat's own series or a listed set in color, the rest muted beneath.
Numeric scales accept date fields, read as timestamps, with ticks labeled as years, months, or days by the span.

The Pew dumbbell (research entry 15) ships as `?example=pew-meaning` from `apps/data-samples/pew_meaning.ts`.
Point and path marks can leave the y scale off to form a dot row on the frame's middle line; a text order field, such as a party, ranks by its labels.
Point marks color by a category field through a palette, a legend element lists a mark's categories with their colors, and calculations gain a signed difference from first to last.

The income and life expectancy scatter (after research entry 21 and Gapminder) ships as `?example=income-life`, joined from the World Bank tables by `apps/data-samples/prepare/gapminder.ts`.
Numeric scales take log spacing with decade ticks, point marks size by a field and label only listed values, and legends wrap long rows.

The Covid tile map (research entry 18) ships as `?example=covid-tiles` from `apps/data-samples/prepare/covid-tiles.ts`, weekly from The New York Times' rolling averages.
Repeats can be arranged as tiles: a prepared field names each repeat's cell as row,column, and repeats without a cell queue below the grid, so the tile-address gap the research named is closed.

## Milestone 3: Layer interval bands around a line

Create the inflation-fan structure from supplied interval data.

- Add ordered area geometry with x, lower, upper, and optional series bindings.
- Expose fill, opacity, layer order, and frame clipping through existing element controls.
- Reuse a rectangle for the projection region and an annotation line for the target.
- Keep interval data separate from any statistical model that produced it.

One fixture checks nested bounds, missing-value gaps, and clipping at the projection boundary.
Trace shows the interval's supplied fields, not an invented forecast calculation.

Research entry 05 provides a second proof with two OBR panels, both measured as percent of GDP.
Retain nine percentile columns, null historical bounds, and the March 2025 vintage. Check p50 against the central forecast.
Use separate vertical domains and shared time. Two ordinary units suffice; do not require compound frames for this example.

### Desired end state

The author layers three bands and a line in one frame and copies a matching PNG.
Resizing keeps bounds and annotations aligned.
Existing line compositions still work. Remove the area option to bypass this addition.

### Status: built with illustrative intervals (updated 2026-10-10)

The forecast fan ships as `?example=forecast-fan` from `apps/data-samples/inflation_fan.ts`: two measures repeated as columns, four nested bands from supplied percentile columns, a central path, a shaded projection period, and a horizontal 2% guide.
Band marks bind x, y, an order field, and lower and upper fields; a missing bound breaks the band, crossed bounds are swapped, and fixed limits clip through the frame's clip box.
A numeric scale now spans every field drawn on it, so a band's widest interval sets the frame even when the scale's own field is the central path.
Guides gained a direction (vertical at x, or horizontal at a numeric y) and a shade on either side.
The trace of a band lists its bound fields, order, runs, skipped rows, and end values.

The OBR March 2025 workbook (research entry 05) was not retrieved: the download URL returns an HTML page, and no spreadsheet reader is available in this environment. Its two-panel structure is what the example reproduces; swapping in the published percentiles is a data step, not a new capability.

## Milestone 4: Repeat paired distribution summaries in a grid

Create the time-use comparison using raw illustrative durations.

- Add cohort grouping and quartile/median summaries using installed `d3-array` operations.
- Pair the two cohort results by activity and bind them to the existing band and circle elements.
- Add a derived median-change value and bind it to one shared color scale and legend.
- Show summary populations and formulas in the inspector.
- Keep common domains as default. Add an explicit per-subset domain policy for source-like local scales.

Do not change the workspace's general aggregate model unless a shared calculation contract actually fits.
Keep a composition-local summary operation when that produces the smaller clear change.
If reproducing survey estimates later, accept correctly prepared weighted summaries or add weighting in the data project.

One calculation fixture checks known quartiles, pairing, filtering, and a zero prior median.
Show a missing cohort as missing rather than pairing unrelated records.
The new collection supplies no direct median/IQR benchmark. Entry 16 uses means and sample standard deviations of annual totals.
Do not substitute those values for quartiles or describe them as confidence intervals. Keep the existing time-use proof.

### Desired end state

The author creates one activity unit and repeats it as a grid.
Filters update medians, bands, color, and trace populations together.
The chosen domain policy is visible and saved. Existing supplied-band compositions need no quartile calculation.
Bypass the new summaries to return to the supplied-data path.

### Status: built with an illustrative diary (updated 2026-10-10)

The time-use grid ships as `?example=time-use` from `apps/data-samples/time_use.ts`: twelve activities repeated as a grid, each summarizing the 2019 and 2020 cohorts on the spot.
A summary mark groups a repeat's live rows by a cohort field, takes unweighted quartiles of a measure with `d3-array`, draws the quartiles as a band joined across the groups, marks the medians, and joins them.
Each repeat's change in median from its first group to its last colors its markers through a value scale; value scales gained a middle color that makes them diverge around zero.
A zero or missing prior median leaves the change undefined and the marker neutral, as the plan required.
A numeric scale bound to a summary spans the quartiles drawn, per repeat or shared, so the explicit per-subset domain policy is the scale's existing domain choice.
Trace on a median lists the quartiles, count, group, and the change that set the color. Filters recompute all of it.

Not built: weighted summaries and a drawn legend for the diverging color; the subtitle states the meaning.

## Milestone 5: Stack category shares with explainable denominators

Create the Causes composition using category counts by age.

- Add a normalization/stack calculation that outputs cumulative lower and upper bounds.
- Make category order explicit and stable. Feed its output into the existing area geometry.
- Retain numerator, denominator, and contributing-category references in trace details.
- Anchor text to selected age/category values with a visual offset for finishing.
- Separate population filtering from category highlighting. Declare any changed denominator explicitly.

One calculation fixture checks 100% totals, stable order, a population filter, and a zero-total gap.
For example, counts 2 and 3 must produce shares 40% and 60% with total 5 visible in inspection.

Research entry 07 supplies four normalized columns for deaths and three media outlets.
Each denominator covers the selected causes in that source. Deaths are not all deaths; media values count cause mentions.
Preserve the documented accident/overdose correction and use multiple mentions as specified by the source method.
Prove a stacked rectangle output as well as area geometry before claiming this new example is supported.

### Desired end state

The author builds a stacked composition and can explain a selected share from its original counts.
Changing the population updates all bands consistently. Highlighting one category preserves the denominator.
Earlier independently supplied bands remain valid. Disable the stack calculation to bypass this addition.

### Status: columns built with the published counts (updated 2026-10-10)

The deaths-and-media graphic (research entry 07) ships as `?example=media-deaths`, prepared by `apps/data-samples/prepare/media-deaths.ts` from Our World in Data's analysis package (CC BY).
A stack mark counts or sums a repeat's rows per category and stacks them as shares of the repeat's total, from the bottom.
Category order and color come from totals over every row, so they match across columns and never move while filtering; the denominator comes from the live rows, so filtering the population recomputes shares, while selecting a repeat only fades.
Columns fill the frame at 100% or scale by total against the largest repeat, and segments with room carry their category and share.
The trace of a segment states the numerator, the denominator, every contributing category with its count, and the cumulative bounds. The prepared table keeps the package's overdose correction and multiple-mention definition, and the note states what each denominator covers.

The area geometry followed as `?example=causes-by-age` from `apps/data-samples/causes_by_age.ts`: a stack mark bound to a numeric x scale groups rows by their x value, stacks categories at each x, and draws each category as one area, labeled where it is thickest.
The y axis reads as shares or totals, an x with no rows breaks the areas, and the trace of an area gives the category's share range, numerator, denominator, and largest share. Column and area layouts share one calculation and one category order.

## Milestone 6: Combine detail and overview frames in one unit

Create a state-style comparison with an inset, then repeat that unit for several illustrative regions.

- Allow two sibling frames inside a template. Each declares its scale references, range, clip, and display window.
- Anchor the inset to the parent group with a visual offset.
- Bind both frames to the same region subset, while allowing a separate composition-wide baseline input.
- Reuse lines and bands for the comparison. Reuse data anchors for endpoint labels and historical guides.
- Show frame, subset, domain, and calculation scope in inspection.

One integration fixture checks distinct time windows, a region filter, a date filter, and group movement.
The recent-window frame must not truncate the overview's input. Region selection must not silently alter the national population.

Research entry 04 adds a mixed-frame proof: one annual sparkline and one decade strip inside each country row.
Its annual paths use local domains. Each decade column has its own color domain across the selected countries.
The displayed average is the mean of rounded decade means, not the mean of all annual observations.
Keep ranking and rounding in the prepared table first; do not silently replace the source calculation.

### Desired end state

The author edits one compound template and repeats it without copying frame definitions manually.
Detail, inset, guides, and captions move together. Output preserves their distinct scales and clipping.
Single-frame templates still work. Remove the inset frame to reduce this composition to the previous capability set.

### Status: built with The New York Times' Covid series (updated 2026-10-10)

The state comparison ships as `?example=covid-compare` from `apps/data-samples/prepare/covid-compare.ts`: six state panels, each with a recent-window main frame and a full-history inset.
A unit holds inset frames placed from its main frame's corner, each with its own display window; the main frame can take a window too. A window leaves rows out of the marks drawn in that frame and spans the window on its field, but it is not a filter: calculations, labels, and sibling frames still see every row.
Point, path, and band marks name the frame they draw in. A windowed frame clips. The national series sits in the data as a comparison: a repeat rule can leave listed values out, and a mark drawn from the whole graphic with a listed focus shows only that series.
Group movement, region and date filters, and inset placement were checked in the browser; the inset keeps the full history while the main frame shows the recent window, and selecting a state never alters the national population.

## Cross-cutting verification

At each milestone, prove blank authoring, save/reload, source inspection, and matching PNG output for the new reference.
Check the changed flow at wide, intermediate, and narrow browser widths.
Keep the artboard's chosen output size distinct from the editor's viewport size.
Do not add automatic label placement or virtualization unless an observed failure requires it.

Keep tests focused on ordering, bounds, calculations, identity, and scope errors.
Reuse earlier fixtures when a changed resolver path affects them; avoid testing unchanged controls repeatedly.
Each library feature PR needs a user-facing minor changeset. These research documents do not need one.

## Below the cut line

- Tile-addressed repeats, horizontal bar lengths, variable repeat heights, and path/area gradients until a selected proof needs them.
- A general visualization compiler, arbitrary expressions, recursive repeats, or a layout solver.
- Exact publication replicas or fetching live reference datasets during authoring tests.
- Statistical forecast generation or a survey-weighting engine.
- Automatic annotation collision resolution before a concrete layout failure.
- SVG, PDF, editable PPTX export, recurring reports, and replacement-data parameterization.

The six milestones describe the capability order. They are not a requirement to build all capabilities in one release.
Do not promote the Pro report's “Available” data status into a claim that dataset bytes are stored locally.
The delivered archive contains images, reports, source URLs, and verification notes, but no underlying dataset files.
Retrieve and pin only the data needed for the selected proof. Keep source terms and preparation notes with it.
