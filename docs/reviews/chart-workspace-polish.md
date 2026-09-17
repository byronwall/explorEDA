# Chart workspace polish

This report covers the current implementation. Earlier review reports capture the baseline.

## Changes

- Added seven-view dashboards for product activity, penguins, and shop operations.
- Kept chart panels, axes, and the filter strip stable during filtering.
- Repaired brush creation, movement, edge resizing, clearing, and clipping.
- Kept chart identity and layout when settings change or views switch.
- Replaced table pages with fixed-height virtual rows and a sticky header.
- Made Rows a single viewport view. Its local controls persist across tab changes.
- Moved table filters into popovers and added live column resizing.
- Reduced header, legend, toolbar, and tooltip size.
- Moved table tools into headers. Search opens without adding a row.
- Limited chart actions to header hover or keyboard focus.
- Used one quiet style for workspace buttons.
- Matched pivot and summary tables to the compact data table style.
- Removed chart-area outlines and instruction footers.
- Added explicit selection bounds, scale controls, and labeled series settings.

## Checks

The package has 150 passing tests. The demo has 10 passing tests.
Both TypeScript checks and production builds pass.

Browser checks covered desktop widths of 885, 892, and 1280 pixels, plus 390-pixel mobile layouts.
Categorical filters, line and histogram brushes, and scatter selection updated linked views.
Brush movement, resizing, individual removal, and global clearing worked.
All seven chart boxes stayed identical across repeated Charts–Rows–Charts cycles.
Virtual scrolling reached the final record. Search and sort worked.
Column filtering did not change header height.
Right-axis ticks appeared after applying the series settings.
Lorenz rotation and the Color Legend example also passed the interaction review.

The first Rows view now measures the completed tab layout. At a 786-pixel viewport,
it starts at y=150 and ends at y=772, without a window resize.
A 90-pixel column drag changed its visible width from 110 to 200 pixels during the drag.
The width remained 200 pixels after release.

The design scan reported one warning for the existing circular loading spinner.
That border is intentional. The scan found no other flagged patterns.

## Evidence

- Desktop dashboard: `/tmp/exploreda-final-dashboard.png`
- Continuous rows: `/tmp/exploreda-final-rows.png`
- Small, neutral tooltip: `/tmp/exploreda-final-tooltip.png`
- Scrollable mobile settings: `/tmp/exploreda-settings-scroll.png`

The Rows tab applies search and column filters to its own view.
Dashboard table column filters remain linked to charts.

The final penguin check reached record 344 with only 26 rows mounted.
Column resizing preserved the scroll offset at 9774.5 pixels.
Each of the three boxes showed exactly one tooltip at its center.
The title box stayed identical before and during hover.
The last fresh browser pass reported no page errors.

The final header check found no toolbar row inside dashboard tables.
The column header starts directly at the table content boundary.
Chart actions stayed hidden during plot hover and appeared during header hover.
Searching for Release returned 30 rows. The Rows view filled the viewport on its first opening.
NBA team filtering changed the count from 735 to 22 without changing the pivot panel box.

- Compact Rows view: `/tmp/exploreda-compact-rows.png`
- Compact pivot and summary tables: `/tmp/exploreda-pivot-polish.png`

The independent browser pass confirmed stable panel boxes after two complete tab cycles.
NBA filters selected DAL, added OKC, cleared, and selected MIL with the keyboard.
The counts were 22, 44, 735, and 21. Mobile had no document overflow.

Three reported verification failures were resolved through direct checks.
Chart controls had zero ancestor opacity; their individual button opacity caused a false report.
All three actual box centers showed one tooltip each. The earlier coordinate missed Gentoo by two pixels.
CSV export emitted a download event and contained one header plus 30 matching Baseline records.

Escape now closes table search without collapsing an expanded panel.
A second Escape restores the panel. A regression test and browser check both passed.

- Table without a separate tool row: `/tmp/exploreda-compact-table.png`
- Verified box tooltip: `/tmp/exploreda-box-tooltip-verified.png`

Pivot tables now distinguish grouping fields through their structure.
Row headers use a subtle tinted band and a divider before aggregate values.
Column groups use the same band. Aggregate headers retain a plain background.
The change preserves all row and column dimensions. Both builds pass.

Browser verification confirmed the pivot band and stable geometry at 885×786.
DAL filtering changed 735 rows to 22; clearing restored 735.
The wider Color Legend pivot kept both grouping columns readable during horizontal scrolling.
Evidence: `/tmp/exploreda-pivot-structure.png`.

## Compact legends

Categorical legends use small swatches, plain labels, and row counts.
Clicking a category toggles its linked filter. Selected categories have a quiet border;
other categories dim. Count widths remain fixed during filtering.
Numerical legends use a thin ramp with separate, spaced labels.
The NBA legend is 88 pixels high, reduced from 188. Its data table fills the space below it.

Counts exposed a shared stale row-ID cache. The live-data hooks now subscribe to each updated snapshot.
A regression test covers filtering and clearing. This also repairs updates in line and pivot charts.
DAL changes legend counts to PG 3, PF 6, C 4, SG 6, and SF 3. Adding PG gives three selected rows.
Clearing restores all 735 records and the original category counts.
Both builds, both type checks, 150 package tests, and 10 demo tests pass.

Evidence: `/tmp/exploreda-legend-compact.png`.

The independent browser pass verified multiple category selections and keyboard activation.
PG plus C selected 265 records. Clearing restored 735. Team and position filters worked together.
Numeric legend labels remained readable during filtering.
At 390 pixels wide, all five NBA categories fit without horizontal scrolling or page overflow.
The product dashboard's Baseline filter changed both line series; clearing restored their exact paths.
The line panel retained the same dimensions throughout.

Mobile evidence: `/tmp/exploreda-legend-mobile-final.png`.

## Summary table controls

Missing-value warnings now sit beside field names. Distinct counts share one right edge.
The empty action column is removed. Chart controls overlay the row's right edge on hover or focus.
Browser checks confirmed unchanged cell dimensions and successful chart creation on desktop and touch.
Warning tooltips work with hover and keyboard focus. Package build and type checks pass.

Evidence: `/tmp/exploreda-summary-desktop-rest.png` and `/tmp/exploreda-summary-desktop-hover.png`.

## Axis hover readouts

Line and scatter charts replace tooltip cards with a point marker and faint guides to the axes.
Small colored values sit over the axis ticks, within the existing margins.
Multi-series lines select the nearest series at the nearest observation, including right-axis series.
Readouts clear outside the plot, on Escape, and during brushing. Missing observations produce no readout.
Point tooltips are also removed when line markers are enabled.

All 151 package tests pass. The new regression covers series selection, right-axis values,
missing observations, Escape, and suppression during dragging. Package build and type checks pass.

Browser checks confirmed nearest-series selection and scatter readouts without tooltip cards.
The final drag check verified that pointer-down clears the readout before the brush handles the event.
Line brushing changed 90 rows to 32; clearing restored 90 without moving the panel.
At 390 pixels wide, both charts kept their readouts inside the axes with no page overflow.
Both builds pass. Evidence: `/tmp/exploreda-line-readout-desktop.png`,
`/tmp/exploreda-line-readout-mobile.png`, and `/tmp/exploreda-scatter-readout-mobile.png`.
