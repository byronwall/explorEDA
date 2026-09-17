# Data visualization example baseline

Review date: 2026-09-15. Viewport: 1280 × 720. Each first verdict came from the rendered page before label or interaction inspection.

## Line chart

**Verdict:** fail. The view shows three mathematical series, but it does not explain either axis or the dual-scale comparison.

**Blockers:**

- **Purpose:** The visible title is only “Line Chart.” The x-axis has ticks from 0 to 10,000 but no field name.
- **Meaning:** The red series uses an unlabeled right axis. Only a small arrow beside “Squared” hints at that assignment.
- **Truth:** “Natural Log” has 3,302 values in the adjacent summary, but the chart shows one continuous line without missing-value context.

**Section findings:**

- **Purpose and title — poor:** “Line Chart” does not state the subject, comparison, or reason for using two scales.
- **Hierarchy and layout — needs work:** The summary table and chart share emphasis, although the chart should lead the example.
- **Typography and spacing — good:** Text is readable, and the two cards fit without crowding at the tested viewport.
- **Marks and ink — needs work:** Thin lines and light grids are clean, but Natural Log is compressed near zero.
- **Axes, scales, ticks, and grids — poor:** Axis names are absent. The left and right domains differ by six orders of magnitude.
- **Labels and annotations — poor:** No axis titles, units, missing-value note, or direct endpoint labels are visible.
- **Color and legends — needs work:** Series colors are distinct, but the right-axis arrow is not a clear scale key.
- **Accessibility and viewport — needs work:** The region has a useful accessible description, but the chart has no visible or keyboard-verifiable value details.
- **Semantic correctness — poor:** The mixed scales support shape comparison poorly and hide the Natural Log magnitude.
- **Dashboard relationships — needs work:** The summary reveals counts and ranges, but it does not explain the chart’s scale choices.
- **Filters and interaction — needs work:** Pointer checks on two visible lines did not reveal a tooltip or other current-point detail.
- **Trends — poor:** The horizontal order is clear, but the x field, missing values, and comparable scale are not clear.

**Three priority fixes:**

1. Replace the generic title with a question and label ID, value units, and both y-axes.
2. Put the three series in aligned small multiples, or normalize them, instead of using an unexplained dual axis.
3. Show Natural Log gaps or state its valid-value count and missing-value treatment beside the chart.

**Secondary notes:** The summary table gives useful range context. The right-axis number formatting needs separators or compact notation.

## Categorical charts

**Verdict:** fail. Selection is clear and recoverable, but generic titles, clipped values, and changing facet scales block reliable comparison.

**Blockers:**

- **Purpose:** Both chart cards use the title “Row Chart:”. Neither title states the measure or question.
- **Truth:** The `false` facet row uses a 0–200 scale while the `true` row uses 0–400. The change is not announced.
- **Readability:** Several value labels at the right edge are visibly clipped, including labels in the Medium and Small facets.

**Section findings:**

- **Purpose and title — poor:** The pivot table names fields, but the two chart titles do not identify count, category, stock state, or size.
- **Hierarchy and layout — needs work:** The overview and table fit above the fold. The six-facet comparison requires substantial scrolling.
- **Typography and spacing — needs work:** Headers are readable, but table columns are tight and some rightmost values are clipped.
- **Marks and ink — good:** Sorted horizontal bars support close category comparisons with little decorative ink.
- **Axes, scales, ticks, and grids — poor:** The overview starts at zero, but the facet rows use different unannounced domains.
- **Labels and annotations — needs work:** Bar-end values help lookup, but the clipped digits and missing measure label reduce trust.
- **Color and legends — needs work:** Overview colors separate categories, but color adds little because the bars already have direct labels.
- **Accessibility and viewport — needs work:** The pivot table has strong names and filter buttons. Facet charts expose headers but not bar values semantically.
- **Semantic correctness — poor:** Automatic scale changes make bars across stock states look more comparable than their counts are.
- **Tables — needs work:** The pivot supports lookup and filtering, but the visible area cuts off the fifth rating column.
- **Dashboard relationships — needs work:** The views share fields, but the facet’s role and scale relationship are not stated.
- **Filters and interaction — good:** Clicking Electronics reduced the scope to 2,087 rows, added a visible filter chip, muted other bars, and reset cleanly.
- **Categorical comparisons — needs work:** Bars are sorted and start at zero, but cross-facet comparison fails because scales change by row.
- **Facets — poor:** Headers are clear, but repeated measures lack one shared domain and full value-label clearance.

**Three priority fixes:**

1. Give each chart a descriptive title and subtitle that name count, grouping fields, and scope.
2. Use one 0–450 scale across all six facets, or label each row as an independent scale.
3. Add right padding inside each facet and table overflow affordance so all values remain visible.

**Secondary notes:** The active-filter chip and “Clear all filters” control are the strongest interaction pattern in this review.

## Lorenz 3D

**Verdict:** fail. The explanatory note and synchronized rotation are strong, but the plots do not identify their axes or selection state.

**Blockers:**

- **Meaning:** None of the visible 2D or 3D axes name Time, X, Y, Z, or Run ID.
- **State:** A box-drag attempt on the 2D chart produced no filter, selection mark, count change, or recovery cue.

**Section findings:**

- **Purpose and title — good:** “Lorenz Attractor Demo” explains the subject, chart roles, faceting, color, and intended interactions.
- **Hierarchy and layout — needs work:** The note dominates the first viewport, while most 3D comparisons begin below the fold.
- **Typography and spacing — needs work:** Instructions are readable, but “All Runs together, use color” truncates in its narrow card.
- **Marks and ink — needs work:** Colored paths stand out on black, but the perspective grids compete with sparse marks.
- **Axes, scales, ticks, and grids — poor:** The 2D axes show numbers only. The 3D facets show no axis names or comparable tick context.
- **Labels and annotations — poor:** Run numbers are visible, but axis roles and the selected 2D range are not.
- **Color and legends — needs work:** Facet colors distinguish runs, but the combined chart has no visible key for Run ID.
- **Accessibility and viewport — needs work:** Chart regions have useful accessible summaries. Plot values and 3D manipulation lack keyboard-verifiable alternatives.
- **Semantic correctness — needs work:** The chart families fit the demonstration, but missing axis mappings weaken interpretation.
- **Dashboard relationships — needs work:** The note states coordination, but no persistent mark shows the shared filter or camera state.
- **Filters and interaction — needs work:** Dragging facet 1 rotated all five facets after about one second. The 2D box filter was not discoverable in testing.
- **Relationships — needs work:** The attractor shapes are visible, but unlabeled dimensions make the relationship abstract.
- **Facets — good:** Runs 1–5 use equal panel sizes, stable color, and synchronized camera movement.

**Three priority fixes:**

1. Add visible axis names to the 2D chart and a compact X/Y/Z orientation key to every 3D view.
2. Show a persistent 2D brush rectangle, selected-row count, and clear-selection control after a box drag.
3. Reduce the note height and widen the combined chart card so its full title and legend fit.

**Secondary notes:** Synchronized rotation worked and was the strongest advanced interaction. Full-page capture repeated clipped chart fragments, but viewport scrolling did not confirm that artifact.

## Cross-example synthesis

The smallest useful coverage change is to repair these saved examples instead of adding more examples.

- Add descriptive titles, axis names, and one-line semantic notes to all three examples.
- Make the categorical facets use one shared scale. This gives the suite one honest cross-facet comparison.
- Keep the categorical filter chip and Lorenz camera sync. Add visible state to the Lorenz brush and line-chart scale assignment.
- Replace the line chart’s dual axis with aligned small multiples. This adds clear multi-series and missing-value coverage without new data.

Together, these changes cover labeled trends, honest facets, visible filter state, coordinated 2D/3D views, tables, and missing values.
