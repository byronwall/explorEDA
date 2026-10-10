---
title: "Composed analytical graphics — implementation plan"
slug: "composed-analytical-graphics"
phase: plan
status: draft
last_updated: "2026-10-08"
---

# Composed analytical graphics — implementation plan

## Plan at a glance

Build the email-style authoring flow first. It proves a usable editor, including saved edits and PNG clipboard output.
Then add five capabilities through the [reference compositions](reference-study.md), in dependency order.
Each example must add a reusable operation, not a hard-coded chart type.

The sequence is ordered paths, interval bands, paired distribution summaries, normalized stacks, then compound frames.
Geometry arrives before the calculations that consume it. Compound frames arrive after scope and anchor behavior work.
The first release can stop after the email proof and a small comparison/grid check.
Later milestones extend that working editor without requiring the whole ladder to ship together.

Research does not establish exact source-data reproduction as a requirement.
Use small local fixtures with known values. Label illustrative data and document its source.
Author each proof from blank. A completed fixture definition can support regression checks but cannot replace that authoring proof.

## Implementation strategy

### Repository fit

Snapshot: detached HEAD `6762dfd1ea96d45d80ec86feb130a23fe92c4fdf`, inspected 2026-09-29.
This plan changes no application code.

| Existing seam | Planned use |
| --- | --- |
| `src/charts/registry.ts`, `src/types/ChartTypes.ts` | Register one composition type and its settings |
| `src/components/charts/ChartRenderer.tsx` | Render the composition through the existing chart dispatch |
| `src/components/ChartGridLayout.tsx` | Host the complete composition; do not make each element a dashboard tile |
| `src/providers/DataLayerProvider.tsx`, `src/lib/aggregates.ts` | Reuse data, filtering, and contributor metadata where their contracts fit |
| `src/components/charts/FacetRelated/facetLayout.ts` | Reuse repeat placement calculations |
| `src/components/charts/ScatterPlot/scatterPlan.ts` | Follow the existing pure planning pattern |
| `src/components/charts/trace/ChartTraceScope.tsx`, `traceTypes.ts`, `ChartTracePanel.tsx` | Add composition inspection to the current tracing surface |
| `src/utils/saveDataUtils.ts`, `src/types/SavedDataStructure.ts` | Carry definitions through save, validation, and restore |

Paths above are relative to `packages/explorEDA/`.
Current grouped aggregates support count, sum, and average. Quartiles and stacking require new calculation behavior.
Clipboard saving currently writes JSON text. PNG output needs a separate image action.

### Small model and render path

Keep React and TypeScript. Start with one serializable composition definition and a pure resolver that produces SVG elements.
Store elements, frames, named scales, data bindings, calculations, repeat rules, and visual overrides.
Use direct typed properties, not a general graph language or a new compiler.
Extend the definition only when the next reference requires it.

Proposed ownership: scale definitions declare domains; frames supply pixel ranges and clipping.
Marks reference a frame and its named scales. Shared domains map into each repeated frame.
Confirm these controls in the first blank-page proof before expanding geometry.

Keep instance identities tied to subset keys. Visual overrides reference those keys and element IDs.
Population, filter policy, and frame display window are separate inputs.
Retain contributor references through calculations and geometry; do not recover data relationships from pixels.

Use existing `d3-scale` and `d3-array`. Use `d3-shape` for paths and areas.
It is already installed as a development dependency; verify bundling and declare it correctly if runtime imports require it.
Its native [area](https://d3js.org/d3-shape/area) and [stack](https://d3js.org/d3-shape/stack) operations cover the later geometry.
No additional chart engine is needed.

### Local loop and platform proof

Run `pnpm --filter demo dev -- --host 127.0.0.1` for authoring proofs.
Run focused tests with `pnpm --filter exploreda test <test-file>` after nontrivial resolver or calculation changes.
Run `pnpm check` after each broad milestone. It includes the required UI check.
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

Build the smallest complete editor before adding path geometry.

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

### Status: vertical slice built (2026-10-08)

A stack of five PRs builds Milestone 1 as a vertical slice in `packages/explorEDA/src/components/charts/Composition/`.
The demo's **Compose a report graphic** example (`?example=message-log`) opens a blank composition beside linked views of a synthetic 10,376-row message log.

| PR | Adds |
| --- | --- |
| 1 | The `composition` chart type, artboard, text elements, edit and view modes, layer list, drag and arrow-key placement |
| 2 | Chart units: a frame of rect or circle marks, named position and value scales (shared by default, per unit optional), and a repeat rule as rows, columns, or a grid |
| 3 | Calculations with separate population (each repeat or whole graphic) and filter policy (follow or ignore); repeat label values, `{Name}` text tokens, guide rules, and annotations anchored to the page, a frame, or a data glyph |
| 4 | Repeat overrides keyed by subset value (nudge, accent, opacity, bold label) with reset; view-mode click to select a repeat across the workspace; Alt-click and Alt-Enter tracing with source rows |
| 5 | Copy PNG to the clipboard at twice the artboard size, drawn from the viewed artboard without editing overlays |

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

Open questions for the next round:

- Value domains are computed from the glyphs that pass the filters, so colors rescale while filtering. Position domains stay fixed. Decide whether value domains should also stay fixed by default.
- Overrides cover placement and look. Hiding a repeat, or overriding its label text, would be the next requests to confirm.
- Guides take one value from a fixed entry or a calculation. Bands between two values, and guides on value scales, are not built.
- The example graphic is authored by hand in the demo. A saved reference composition could become a regression fixture once the model settles.

## Milestone 2: Connect observations in an explicit order

Create the Driving composition with a path, points, selected-year labels, and a data-bound callout.

- Add series and order bindings to the path element. Use year order, not x-coordinate order.
- Define missing-value breaks and a stable tie policy for equal order values.
- Inspect path contributors and segment endpoints using retained row references.
- Reuse current scale and annotation controls; add only the path-specific fields.

One resolver test uses shuffled input, a reversal in x, and a missing coordinate.
The rendered path must preserve the declared sequence and break at the missing value.

### Desired end state

The author builds the connected scatterplot from blank and can inspect its ordering.
Callouts track their selected records after a scale change.
Earlier rectangle/circle compositions still save and copy correctly. Remove the new path option to roll back this stage.

## Milestone 3: Layer interval bands around a line

Create the inflation-fan structure from supplied interval data.

- Add ordered area geometry with x, lower, upper, and optional series bindings.
- Expose fill, opacity, layer order, and frame clipping through existing element controls.
- Reuse a rectangle for the projection region and an annotation line for the target.
- Keep interval data separate from any statistical model that produced it.

One fixture checks nested bounds, missing-value gaps, and clipping at the projection boundary.
Trace shows the interval's supplied fields, not an invented forecast calculation.

### Desired end state

The author layers three bands and a line in one frame and copies a matching PNG.
Resizing keeps bounds and annotations aligned.
Existing line compositions still work. Remove the area option to bypass this addition.

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

### Desired end state

The author creates one activity unit and repeats it as a grid.
Filters update medians, bands, color, and trace populations together.
The chosen domain policy is visible and saved. Existing supplied-band compositions need no quartile calculation.
Bypass the new summaries to return to the supplied-data path.

## Milestone 5: Stack category shares with explainable denominators

Create the Causes composition using category counts by age.

- Add a normalization/stack calculation that outputs cumulative lower and upper bounds.
- Make category order explicit and stable. Feed its output into the existing area geometry.
- Retain numerator, denominator, and contributing-category references in trace details.
- Anchor text to selected age/category values with a visual offset for finishing.
- Separate population filtering from category highlighting. Declare any changed denominator explicitly.

One calculation fixture checks 100% totals, stable order, a population filter, and a zero-total gap.
For example, counts 2 and 3 must produce shares 40% and 60% with total 5 visible in inspection.

### Desired end state

The author builds a stacked composition and can explain a selected share from its original counts.
Changing the population updates all bands consistently. Highlighting one category preserves the denominator.
Earlier independently supplied bands remain valid. Disable the stack calculation to bypass this addition.

## Milestone 6: Combine detail and overview frames in one unit

Create a state-style comparison with an inset, then repeat that unit for several illustrative regions.

- Allow two sibling frames inside a template. Each declares its scale references, range, clip, and display window.
- Anchor the inset to the parent group with a visual offset.
- Bind both frames to the same region subset, while allowing a separate composition-wide baseline input.
- Reuse lines and bands for the comparison. Reuse data anchors for endpoint labels and historical guides.
- Show frame, subset, domain, and calculation scope in inspection.

One integration fixture checks distinct time windows, a region filter, a date filter, and group movement.
The recent-window frame must not truncate the overview's input. Region selection must not silently alter the national population.

### Desired end state

The author edits one compound template and repeats it without copying frame definitions manually.
Detail, inset, guides, and captions move together. Output preserves their distinct scales and clipping.
Single-frame templates still work. Remove the inset frame to reduce this composition to the previous capability set.

## Cross-cutting verification

At each milestone, prove blank authoring, save/reload, source inspection, and matching PNG output for the new reference.
Check the changed flow at wide, intermediate, and narrow browser widths.
Keep the artboard's chosen output size distinct from the editor's viewport size.
Do not add automatic label placement or virtualization unless an observed failure requires it.

Keep tests focused on ordering, bounds, calculations, identity, and scope errors.
Reuse earlier fixtures when a changed resolver path affects them; avoid testing unchanged controls repeatedly.
Each library feature PR needs a user-facing minor changeset. These research documents do not need one.

## Below the cut line

- A general visualization compiler, arbitrary expressions, recursive repeats, or a layout solver.
- Exact publication replicas or fetching live reference datasets during authoring tests.
- Statistical forecast generation or a survey-weighting engine.
- Automatic annotation collision resolution before a concrete layout failure.
- SVG, PDF, editable PPTX export, recurring reports, and replacement-data parameterization.

The six milestones describe the capability order. They are not a requirement to build all capabilities in one release.
