# Composition mode

Reviewed against `5cf144d` on 2026-10-10. This guide describes the delivered `composition` view, its model, and its limits.
Open work is tracked in the [Composed analytical graphics](intent/composed-analytical-graphics/intent-brief.md) initiative.

## What it is for

A composition is one polished, traceable graphic for a report or slide. The author starts from a blank artboard and assembles it from primitives. There is no finished chart type to pick.
The author defines one chart unit and a rule that repeats it across subsets of the rows. They do not place thousands of marks by hand.
The graphic stays live: filters update it, marks trace to their source rows, and the definition saves with the workspace.

Recurring reports and replacement-data parameterization are not part of composition mode.

## Model

The definition is plain data in [`compositionTypes.ts`](../packages/explorEDA/src/components/charts/Composition/compositionTypes.ts). One pure resolver turns it into an SVG scene for both viewing and output.

| Part         | What it holds                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artboard     | Fixed pixel size and paper color. The output size is independent of the editor's viewport.                                                                                |
| Elements     | Text (title, subtitle, note), chart units, guides, annotations, and legends, each placed on the artboard.                                                                 |
| Named scales | Position (date or category bins), value (color, size, or height), and numeric (x/y) scales. Each scale owns its domain policy; the unit's frame supplies the pixel range. |
| Calculations | Named values for labels, `{Name}` text tokens, guides, repeat order, and repeat size.                                                                                     |
| Overrides    | Visual exceptions for one repeat, keyed by its subset value.                                                                                                              |

### Chart units and repeats

A unit is a frame plus its marks. Its repeat rule splits rows by a field and draws the unit once per value as rows, columns, a grid, or tiles.

- **Order:** most rows, label, or a per-repeat calculation, ascending or descending. Order reads every row, so filtering never reorders repeats.
- **Tiles:** a prepared field gives each repeat's cell as `row,column`. Repeats without a cell queue below the grid.
- **Weights:** a per-repeat calculation sizes row heights or column widths in proportion to its value while the unit keeps its total extent.
- **Skip and limit:** listed values can be left out, for example a national series drawn as a comparison instead of a repeat.
- **Insets:** a unit can hold smaller frames placed from its main frame's corner. Marks name the frame they draw in.
- **Display windows:** a frame can show only rows between two bounds on a field. A window is not a filter: calculations, labels, and sibling frames still see every row.

### Marks

Mark types declare their capabilities through `isXyMark` and `markHasCategories`. `describeMark` in `markSummary.ts` writes each mark's one-line summary in the inspector and the right-click menu.

| Mark      | Draws                                                                                                                                                                                                                           | Reference example                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `strip`   | One rectangle or circle per date or category bin, encoded by color, size, or height. Bins with no values draw a missing color; bins with no rows stay blank. Diverging value scales read signed values.                         | `measles`, `elections`                                           |
| `point`   | Circles on two numeric scales, sized by a field, colored by a category, ranked, or limited to first, last, lowest, or highest. A point without a y scale sits on a dot row; a spread pushes crowded points apart as a beeswarm. | `driving-shifts`, `pew-meaning`, `income-life`, `co2-swarm`      |
| `path`    | Rows joined in a declared order field, not x order. Ties keep row order and a missing value breaks the path. Paths split by series, take a focus, label their ends, and can draw smooth curves or ranks.                        | `driving-shifts`, `consumer-confidence`, `tax-slope`, `gdp-bump` |
| `band`    | Filled area between supplied lower and upper fields, ordered and broken at missing bounds.                                                                                                                                      | `forecast-fan`                                                   |
| `summary` | Unweighted quartiles and medians per cohort inside a repeat: the middle half as a band, the medians as dots joined by a line. Each part can be turned off, and the median change can color the dots and line.                   | `time-use`                                                       |
| `density` | A Gaussian kernel estimate on a grid shared across repeats, scaled to a shared or per-repeat peak.                                                                                                                              | `lincoln-ridgeline`                                              |
| `stack`   | Category shares or totals per repeat as columns, or as areas across a numeric x, on a zero, centered, or wiggling baseline.                                                                                                     | `media-deaths`, `causes-by-age`, `unemployment-stream`           |
| `waffle`  | One cell per row or per several rows, or a hundred cells of shares, grouped by category.                                                                                                                                        | `titanic-waffle`                                                 |
| `bar`     | Horizontal lengths per repeat or category on one shared length axis, with one category mirrored leftward.                                                                                                                       | `population-pyramid`                                             |
| `span`    | One bar per row from a start field to an end field on a date scale, with open ends and inside labels.                                                                                                                           | `scotus-timeline`                                                |
| `horizon` | A measure from a baseline cut into stacked bands, with drops mirrored in a second color.                                                                                                                                        | `stocks-horizon`                                                 |

Numeric scales accept dates, log spacing, a zero baseline, tidy ends, fixed limits that clip to the frame, and tick labels at steps, at the ends, or not at all. A unit can title its numeric axes: the x title sits under the tick labels and the y title turns beside them. A numeric scale spans every field drawn on it, so a band's widest interval sets the frame.

Every example opens in the demo at `?example=<id>`. `message-log` draws one strip of monthly squares per correspondent from a 10,376-row message log. `covid-compare` exercises insets and display windows; `covid-tiles` exercises tile addresses; `titanic-mosaic` exercises weighted repeats.

### Calculations and scope

A calculation's **population** (each repeat or the whole graphic) and its **filter policy** (follow or ignore the active filters) are separate choices. A value shared across panels does not automatically ignore filters.
Aggregations are count, sum, average, min, max, first, last, change (a share of the first value), and difference (last minus first). The ordered aggregations read an order field.

Guides draw a vertical rule at an x value or a horizontal rule at a numeric y value, from a constant or a calculation, and can shade one side. A horizontal rule sits at its value on each repeat's own y scale, and a guide can be limited to listed repeats. Rules draw over a paper-colored casing so they stay legible over dense marks. A guide from a constant holds under filtering.

### Annotations and legends

Annotations attach to the page, to a point in one repeat's frame, or to a data glyph chosen by max, min, first, last, or a typed value. A data anchor follows its glyph when data or filters move it. For frame and data anchors, the element's x and y are an offset from the anchor, so a nudge keeps the attachment.
Legends list a mark's categories with their colors, or key a value scale's ramp with the drawn extent; a ramp with placed stops draws one swatch per color band, labeled where each starts. A key legend lists chosen marks instead: each entry draws the mark's glyph, such as a band's fill as it reads over the bands under it, a muted series, a summary's quartile band or median, or a strip's missing cell, beside a label.

The workspace **Colors** panel lists each composition's value ramps and category palettes under **In compositions**. A change there writes back into the composition; a category palette shorter than its categories is spelled out so one category changes alone.

### Overrides

An override changes one repeat's look: a nudge, an accent color, an opacity, or a bold label. It is keyed by the subset value, so it stays with its repeat through reordering and filtering. Data bindings, calculations, and scales always come from the template. Reset returns a repeat to its template.

## Editing and viewing

The chart's details view is the editor: the artboard on the left and the inspector on the right. A blank composition shows **Open editor**. A new composition opens in the editor.

- In editing, a click selects an element or a repeat. Selecting a repeat of the selected unit shows its override panel above the template, labeled with which one an edit changes.
- In viewing, a click on a repeat selects it across the workspace. Alt-click or Alt-Enter on a mark opens its trace.
- Right-click any drawn object, or press Shift+F10, for what it is made of: the mark, each scale, the unit and repeat, a trace, the workspace filter for that repeat, and removal while editing. See the [agent guide](agent-guide.md#editing-a-composition-quickly).
- Elements move by drag or arrow keys. Groups move together with their text, frames, guides, and annotations.

## Tracing

Every mark keeps references to its contributing rows; nothing is recovered from pixels. Traces state the population, filter policy, and inputs:

- a strip bin lists its rows and says whether it is missing or empty;
- a path or band lists its order, runs, skipped rows, and endpoints;
- a summary lists quartiles, count, cohort, and the change that set its color;
- a stack segment states its numerator, denominator, every contributing category, and its cumulative bounds.

## Data behavior

- Repeats and position and numeric domains read every row in the population, so filtering keeps the layout and empties marks instead of removing repeats.
- Strip color, size, and height scales, bar lengths, stack column heights, horizon bands, and density peaks currently fit the filtered rows, so they rescale while filtering. The agreed direction is stable scales by default with rescaling as an opt-in; the initiative tracks that change.
- Stack category order and color come from totals over every row, so they match across repeats and never move. Stack denominators come from the live rows: filtering the population recomputes shares, while selecting a repeat only fades the rest.
- Rank and summary marks recompute from the live rows.
- Packing, joins, rankings, rounding, and source corrections stay in prepared tables under `apps/data-samples/prepare/`. Prepared data does not prove native calculation support.

## Output

**Copy PNG** writes the viewed artboard at twice its size, without editing overlays, through the Clipboard API. It needs a secure context and reports a rejected write. A 1920 × 1200 image reads back from the Chromium clipboard. On 2026-10-10, the `covid-compare` PNG pasted from Chrome into Apple Notes matched the artboard: text, insets, clipping, and colors intact, with no editing overlays. PNG is the only export; SVG, PDF, and editable PPTX are out of scope.

## Performance

Measured on 2026-10-08 with a production build in headless Chromium on Apple silicon:

- Resolving the email graphic from 10,376 rows takes about 7 ms for 536 monthly glyphs and 8 ms for 2,136 weekly glyphs.
- A composition edit no longer redraws the other charts; adding an element costs about 70 ms of main-thread work in a development build. See [Performance checks](performance-checks.md).

No latency target has been agreed.

## Decisions to keep

- Extend the typed definition only when a reference graphic needs a reusable operation. Do not add a general compiler, expression language, recursive repeats, or a layout solver.
- Each new mark or option must leave earlier compositions saving, resolving, and copying unchanged.
- Repeated charts share scales by default; per-repeat domains are an explicit scale choice.
- Scales and colors stay stable through filtering by default. Rescaling to the filtered rows is an author opt-in. Data such as shares, ranks, and summaries still recompute.
- Repeated units do not sit in decorative cards. Text, marks, and guides form the hierarchy.
- Keep supplied intervals separate from any model that produced them. Composition draws supplied bands; it does not forecast.
- Summaries are unweighted. Survey estimates need correctly prepared weighted inputs.

## Code map

Paths are relative to `packages/explorEDA/src/components/charts/Composition/`.

- `compositionTypes.ts`, `validateComposition.ts`: the serializable definition and its validation.
- `resolveComposition.ts`, `resolveUnit.ts`, `calculations.ts`, `ordering.ts`, `labelDodge.ts`, `swarm.ts`: the pure scene resolver.
- `CompositionInspector.tsx`, `UnitInspector.tsx`, `ScaleInspector.tsx`, `AnnotationInspector.tsx`: the editor.
- `compositionTrace.ts`, `CompositionTraceBody.tsx`: contributors and trace views.
- `CompositionQuickMenu.tsx`, `quickActions.ts`, `markSummary.ts`: the right-click menu and mark summaries.
- `compositionOutput.ts`: PNG copy.

Each reference example has a focused resolver test beside these files, such as `measles.test.ts` or `insets.test.ts`. Research images and saved source data remain in the initiative's `raw/` and `references/` folders.
