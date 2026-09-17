# Data visualization example verification

Reviewed in the running app at a 1280 × 720 desktop viewport on 2026-09-15.
This was a clean-room visual pass. Source code and earlier reviews were not read.

## Line chart

1. **Verdict:** `fail`. The example explains the question and data scope, but the horizontal-axis title is visibly clipped.
2. **Blockers:** **Readability.** `ID (ordered row)` is cut off at the lower chart boundary, even after scrolling to the page bottom.
3. **Section findings:**
   - **Purpose and title — good:** “How does square-root growth slow as ID increases?” states the comparison.
   - **Hierarchy and layout — good:** The chart is primary. The summary table stays secondary.
   - **Typography and spacing — needs work:** The horizontal-axis title collides with the card edge.
   - **Marks, axes, and scales — needs work:** The curve and ticks are clear, but one essential axis title is incomplete.
   - **Labels and annotations — needs work:** The row scope is visible, but the clipped axis label weakens interpretation.
   - **Color and legends — good:** One muted line needs no legend.
   - **Accessibility and viewport — poor:** The accessible name exists, but the visible axis title fails at the supported viewport.
   - **Semantic correctness — good:** The increasing, slowing curve matches the stated square-root relationship.
   - **Filters and interaction — good:** The current `10000 of 10000` scope is visible.
4. **Three priority fixes:**
   1. Add enough bottom plot padding to show the full horizontal-axis title.
   2. Keep the title inside the chart card at 1280 × 720.
   3. Recheck the summary cells for visible full-value access when values use ellipsis.
5. **Secondary notes:** Strongest choice: the question title. Weakest choice: the clipped horizontal-axis title.

## Categorical charts

1. **Verdict:** `fail`. Purpose, filters, and recovery are clear, but essential chart text is clipped.
2. **Blockers:** **Readability.** The bar-chart measure label is cut off at the card boundary. The title also truncates to “Which product categories appear most oft…”.
3. **Section findings:**
   - **Purpose and title — needs work:** All three questions are useful, but one title is visibly truncated.
   - **Hierarchy and layout — good:** The pivot, ranking, and faceted comparison form a clear sequence.
   - **Typography and spacing — needs work:** The ranking card lacks room for its title and horizontal-axis label.
   - **Marks, axes, and scales — needs work:** Ranked bars and value labels are clear. The measure title is not fully visible.
   - **Labels and annotations — needs work:** Bar values are direct. The fifth pivot column requires horizontal access and is not initially visible.
   - **Color and legends — good:** Category colors are distinct, and bar values do not depend on color.
   - **Accessibility and viewport — poor:** The accessible names are complete, but the visible chart text is incomplete.
   - **Semantic correctness — good:** Rankings, pivot counts, and facets match their stated questions.
   - **Filters and interaction — good:** Selecting Electronics shows `2087 of 10000`, a filter chip, and a highlighted filter icon. `Clear all filters` restores the full scope.
4. **Three priority fixes:**
   1. Reserve bottom padding for the complete `Rows (count)` title.
   2. Give the ranking title enough width or wrap it to two lines.
   3. Make horizontal pivot overflow obvious before users reach hidden rating columns.
5. **Secondary notes:** Strongest choice: visible filter scope and clear recovery. Weakest choice: repeated text clipping in the ranking card.

## Lorenz 3D

1. **Verdict:** `fail`. The static note explains the coordinated views, but its saved-scope total contradicts the visible status.
2. **Blockers:** **Truth and state.** The note says `164 of 1,000`; the active status says `159 of 1000` for the same saved brush.
3. **Section findings:**
   - **Purpose and title — good:** The note explains divergence, the saved brush, axis colors, and synchronized rotation.
   - **Hierarchy and layout — good:** `Show Controls` keeps controls subordinate to the explanation and views.
   - **Typography and spacing — needs work:** Filter chips expose long floating-point values instead of readable bounds.
   - **Marks, axes, and scales — needs work:** The selected 3D traces are very small, and the 2D time label is clipped.
   - **Labels and annotations — poor:** The note's `164` total conflicts with the visible `159` total.
   - **Color and legends — good:** The note assigns red, green, and blue to X, Y, and Z.
   - **Accessibility and viewport — needs work:** View names are clear, but visible axis text and chip precision need repair.
   - **Semantic correctness — poor:** Two totals describe one saved scope. A reader cannot know which is correct.
   - **Filters and interaction — needs work:** Removing the Time chip also removed Z and returned all 1,000 rows. `Restore captured workspace` did not restore the saved brush.
4. **Three priority fixes:**
   1. Derive the note's saved-row total from the actual restored filter result.
   2. Format filter bounds as `Time 0.20–1.00` and `Z 10–30`.
   3. Make chip removal and workspace restore match their visible labels.
5. **Secondary notes:** Strongest choice: the concise reading guide. Weakest choice: the contradictory saved-state total.

## Tables

1. **Verdict:** `fail`. The search and page scope are visible, but the rightmost `In Stock` column is clipped from the table.
2. **Blockers:** **Readability.** The table description includes `In Stock`, but the visible table stops at `Shipping Weight` with no clear horizontal recovery.
3. **Section findings:**
   - **Purpose and title — good:** “Which product rows match ‘Sports’?” states the lookup task.
   - **Hierarchy and layout — good:** Search, export, rows, and pagination stay close to the data table.
   - **Typography and spacing — good:** Numeric columns align well, and rows remain compact.
   - **Marks and ink — good:** Restrained rules support scanning without heavy decoration.
   - **Labels and annotations — needs work:** `Sports`, `217 rows`, `10 rows`, and `Page 1 of 22` are visible. `In Stock` is not.
   - **Color and legends — not applicable:** The table does not use color as an encoding.
   - **Accessibility and viewport — poor:** The accessible description includes all six fields, but only five are visible.
   - **Semantic correctness — good:** The visible rows match Sports and show rating 5 values consistently.
   - **Filters and interaction — not verified:** The concurrent development reload broke the app before paging and search recovery could be tested.
4. **Three priority fixes:**
   1. Fit `In Stock` or show an obvious horizontal scrollbar within the table.
   2. Add a persistent visible label for the search field.
   3. Recheck paging and search clearing after the development build is stable.
5. **Secondary notes:** Strongest choice: explicit row and page scope. Weakest choice: the missing rightmost field.

## Review status

Examples with no critical-gate blocker: **none**.

Do not mark `line-chart`, `categorical-charts`, `lorenz-3d`, or `tables` as reviewed yet.

The coverage matrix was not reviewed. A concurrent redesign changed it during this pass and temporarily broke the running app.

## Interactions tested

- Scrolled the line chart to its page bottom to check axis-label recovery.
- Scrolled the categorical pivot while its headers remained visible.
- Applied the Electronics category filter and cleared all filters.
- Removed the Lorenz Time filter chip and tried `Restore captured workspace`.
- Confirmed visible search text, row count, page size, and page number on the table example.
- Table paging and search clearing were blocked by the concurrent development reload.
