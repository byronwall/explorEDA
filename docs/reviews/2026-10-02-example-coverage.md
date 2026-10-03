# Example coverage review — 2026-10-02

**Verdict:** Pass with changes. The selected examples show the assigned features clearly after three copy, scale, and readability repairs.

**Blockers:** None in the reviewed assignments.

**Scope:** Rendered review of `shop-operations`, `nba-stats`, `categorical-charts`, `product-activity`, `shop-10000`, `calculated-orders`, and `lorenz-3d` at 1280 CSS pixels. I checked `shop-operations` again at 1024 CSS pixels. I also checked Lorenz, catalog empty search, and invalid calculation flows at 783 and 390 pixels. The product workspace support minimum remains 1024 CSS pixels; narrow checks record changed-flow behavior and page overflow only.

## Section findings

- **Purpose and title — good.** Each reviewed view identifies its subject. The Lorenz scatter title now fits as “Where does Z change over time?”.
- **Hierarchy and layout — good.** Order-book totals, chart groups, filters, and the table follow the question. The regional facets sit together beneath their shared title.
- **Typography and spacing — good.** Titles, units, legend keys, and axis labels remain legible at 1280 and 1024 pixels.
- **Marks and ink — good.** Rows compare counts, scatters show relationships, and the histogram shows delivery-day counts. Lorenz traces remain visible against the black 3D plot after its palette change.
- **Axes, scales, ticks, and grids — good.** Order-book revenue and margin axes name `symlog`. Product activity shows numeric day ticks from 0 to 90. The regional facets share the same 0–10,000 order and $0–25,000 revenue ticks.
- **Labels and annotations — good.** Question titles, units, filter values, sample scope, and the Lorenz 164-row count appear in the page.
- **Color and legends — good.** Category and position keys name groups. The Lorenz Run ID palette now uses Cool, whose lower values remain visible on black.
- **Accessibility and viewport — good in checked scope.** Browser accessibility names identify charts, axes, table columns, filters, and facet controls. The reviewed examples have no page-level horizontal overflow at 1280 or 1024 pixels. Lorenz, catalog empty search, and invalid calculation flows also retained viewport-width documents at 783 and 390 pixels. These narrow checks do not change the 1024-pixel workspace support minimum.
- **Semantic correctness — good.** The Lorenz filters select 164 of 1,000 rows. Removing the Time filter leaves the Z filter active and selects 489 rows. Numeric days are not reported as a date scale.
- **Tables — good.** NBA totals sort by PTS and use grouped values. The catalog's Sports query appears as a removable chip. The reviewed table checks did not cover virtual scrolling.
- **Dashboard relationships — good.** Clicking Web selects 167 of 500 order-book rows. Clicking Web again restores all 500. The active count and filter chip show the scope.
- **States — good.** An unmatched table query shows `0 rows` and “No rows match the current filters.” Clearing it restores rows. An invalid draft formula shows a parse error and disables Create. Discarding it preserves the saved calculations and rows.

## Reviewed assignments

All assignments below were visually checked on 2026-10-02. Each listed feature/example pair is marked `reviewed` in the manifest. Each evidence note links to this section. Other pairs remain `shown` or `not used`.

### shop-operations

Reviewed assignments: `chart:scatter`, `labels:meaningful-title`, `labels:axes`, `guides:ticks`, `scale:symlog`, `color:categorical`, `color:legend`, `interaction:cross-filter`, `layout:dashboard`, `accessibility:naming`, and `responsive:desktop-resize`.

The order-book screenshot shows the question title, Revenue ($) and Margin ($) axes marked symlog, category legend, and linked charts. Clicking Web changed the scope to 167/500; a second click restored 500/500. The page fit at 1280 and 1024 pixels. See [1280 px](../../tmp/shop-operations-1280.png) and [1024 px](../../tmp/shop-operations-1024.png).

### nba-stats

Reviewed assignments: `chart:summary`, `chart:pivot`, `chart:data-table`, `color:categorical`, `color:legend`, `table:sorting`, `table:formatting`, and `accessibility:naming`.

The summary names field counts and missing values. The position key matches the scatter. The pivot shows position medians. The player table sorts by PTS and groups large values. See the [overview](../../tmp/nba-stats-1280.png) and [table with pivot](../../tmp/nba-stats-table-1280.png).

### categorical-charts

Reviewed assignments: `scale:band`, `facet:grid`, `interaction:active-filter`, `table:filtering`, `state:empty`, and `accessibility:naming`.

Category labels occupy band positions. The material facets use stock rows and size columns. The Sports query is visible with a remove action. Searching `zz-no-matching-products` shows `0 rows` and “No rows match the current filters.” Clearing the query restores rows. See the [overview](../../tmp/categorical-charts-1280.png), [facets and filtered table](../../tmp/categorical-facets-1280.png), and [empty result](../../tmp/catalog-empty-state-1280.png).

### product-activity

Reviewed assignments: `chart:line` and `scale:linear`.

The line view names Day of study and uses numeric 0–90 ticks. This is a numeric axis, not a date scale. See [rendered example](../../tmp/product-activity-1280.png).

### shop-10000

Reviewed assignment: `facet:shared-scales`.

North and South show identical Order sequence ticks from 0 to 10,000 and Revenue ($) ticks from 0 to 25,000. The shared domains make the panels comparable. See [regional facets](../../tmp/shop-10000-facets-1280.png).

### calculated-orders

Reviewed assignment: `state:invalid`.

The unsaved formula `Unknown(` shows a parse error and disables Create. Discarding the draft leaves 14 calculations and 10,000 loaded rows. See [invalid formula feedback](../../tmp/calculated-orders-invalid-1280.png).

### lorenz-3d

Reviewed assignments: `chart:scatter`, `chart:3d-scatter`, `color:numerical`, `facet:wrap`, `interaction:brushing`, `interaction:cross-filter`, `interaction:saved-filter-state`, and `accessibility:naming`.

The saved Time 0.2–1 and Z 10–30 filters show 164/1,000 rows. The 2D brush and five 3D facets share the Run ID legend. The Cool palette makes Run 1 visible on black. The 3D title now fits at 390 pixels. The example header still shortens its long saved-example title at 390 pixels. See the [1280 px dashboard](../../tmp/lorenz-1280.png), [783 px check](../../tmp/lorenz-783.png), and [390 px check](../../tmp/lorenz-390.png).

## Coverage decisions

The manifest retains all 11 chart types. It adds `scale:symlog` as supported. True `scale:log` and date-based `scale:time` are marked not supported because the renderer has no log or time scale. Linear, band, and symmetric-log scales are supported. The old order-book label “Log scales” is now “Symmetric log scales”.

The empty and invalid states use existing examples and reversible draft states. The catalog guide directs people to search for an unmatched value and clear it. The calculation guide directs people to inspect an invalid formula, then close the draft without saving. The review did not add a sample or runtime behavior. At 783 and 390 pixels, both flows fit the viewport; the empty result clears back to 10,000 rows, and the invalid draft keeps Create disabled. See catalog empty results at [783 px](../../tmp/catalog-empty-783.png) and [390 px](../../tmp/catalog-empty-390.png), and invalid calculations at [783 px](../../tmp/calculated-orders-invalid-783.png) and [390 px](../../tmp/calculated-orders-invalid-390.png).

## Three priority fixes

1. **Make the Lorenz scope truthful and readable.** The note now says 164 of 1,000 rows. The 2D title is shorter, and the numerical palette changed from Viridis to Cool for the black 3D plot. The browser shows 164 rows; independent filtering confirms 164 for both saved filters and 489 with Z alone. Earlier reports of 159 rows and a clipped title describe the old state.
2. **Use exact scale names.** Order-book copy now says symmetric log. The matrix does not call numeric days a time scale. Log and date-based time scales are explicit unsupported states.
3. **Describe review state accurately.** The matrix explains that feature review summarizes reviewed example evidence. Each example check applies to one feature/example assignment.

**Secondary notes:** The regional order sequence is numeric and dense. It supports direct facet-domain comparison, not a date-trend claim. The existing guide steps show reversible empty and invalid states. No runtime feature or chart type was added.
