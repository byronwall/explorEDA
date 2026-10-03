# Drawer, details, and placement verification

- Date: 2026-10-02
- Checked revision: `c0dd3ad` plus the completed coverage change on `codex/example-coverage-tickets`
- Browser: Chrome, frozen preview at `http://127.0.0.1:5190`, tab `2010992359`
- Viewports: 1280×783, 783×783, and 390×783

| Criterion | Result | Visible evidence |
|---|---|---|
| Calculations in narrow and wide settings | Pass | In the 14-calculation example, the narrow 440px panel stacks labels and wraps formula text. The wide panel shows the table. Neither view has horizontal overflow at 1280×783. The table wraps in the viewport sheet at 783×783. Rows stack and remain readable at 390×783. |
| Escape from delete confirmation and details | Pass | Opened details for “Orders by category” and its delete confirmation. Escape dismissed the confirmation. An immediate second Escape closed details. The chart remained. Enter reopened details, showing focus returned to its trigger. |
| Fields and Rows/settings ownership | Pass | Opened Fields, then Calculations. Closing settings restored Fields. Opened Rows while Fields was open. Rows covered the field list; closing Rows restored Fields. |
| Many categories and all-null Details; fixture Rows | Pass | Imported the 40-row fixture through the visible full-analysis JSON input. Details showed 21 category labels plus “Other categories” for the 40 unique values. Details for `missing` showed “(missing): 40 rows”. Both states were readable at all three widths. Rows showed 40 records with null cells. Screenshots: [many categories](../../tmp/drawer-many-categories-details-1280.png), [all null](../../tmp/drawer-all-null-details-1280.png). |
| Empty Rows result and recovery | Pass | Searching `zz-no-match` showed “No rows match the current filters”. The visible clear control restored the 40 rows. This worked at all three widths. Screenshots: [1280](../../tmp/drawer-empty-rows-1280.png), [783](../../tmp/drawer-empty-rows-783.png), [390](../../tmp/drawer-empty-rows-390.png). |
| Empty Details result and recovery | Pass | Imported the exported 40-row analysis with incompatible filters on separate charts. A third, unfiltered `Rows by missing` chart showed `(missing): 0 rows` while the workspace showed 0 of 40 rows. Closing Details and clearing all filters restored 40 of 40 rows; Details then showed `(missing): 40 rows`. This worked at 1280×783, 783×783, and 390×783. Screenshots: [empty Details at 1280](../../tmp/drawer-empty-details-1280.png), [783](../../tmp/drawer-empty-details-783.png), [390](../../tmp/drawer-empty-details-390.png), [recovered at 1280](../../tmp/drawer-empty-details-recovered-1280.png), [783](../../tmp/drawer-empty-details-recovered-783.png), [390](../../tmp/drawer-empty-details-recovered-390.png). Fixture: [saved analysis JSON](../../tmp/drawer-proof-empty-details-analysis.json). |
| Placement preview, cancel, accept, and saved layout reload | Pass | At column 1, row 1, preview said “4 charts move down”. Back then Cancel closed without adding a chart. A second preview was accepted: `Distribution of Units` took x0/y0/w6/h4; `Revenue & margin per order` moved from y0 to y4. After browser reload, visible JSON reopen and export retained both positions. Screenshots: [placement preview](../../tmp/drawer-placement-preview.png), [restored layout](../../tmp/drawer-restored-layout.png). |

## Empty Details scenario

I exported the 40-row fixture through Workspace actions. I added a category filter for `Group 01` to `Rows by category`, a value filter for `2` to `Distribution of value`, and kept `Rows by missing` unfiltered. I reopened the edited analysis through the visible full-analysis JSON input. The workspace showed both filter chips and 0 of 40 rows. Details for `Rows by missing` showed `(missing): 0 rows` at 1280×783, 783×783, and 390×783.

I closed Details and clicked `Clear all filters`. The workspace returned to 40 of 40 rows. Reopening Details showed `(missing): 40 rows` at all three widths. This verifies the empty-state rendering and recovery from saved filters. It does not show that chart clicks can create this incompatible selection.

The earlier interactive attempt remains a separate observation: after filtering `Group 01`, I added a categorical value chart. Its enabled `2: 0 records` button did not change the active filter or the 1-of-40 row count. The saved-analysis fixture was needed to create the incompatible filters for this rendering check.

## Environment note

The first fixture attempt used the mutable server at port 5188. Shared source watchers caused Vite page reloads during that run, so its state results were unreliable. The frozen preview at port 5190 loaded the corrected fixture and retained the imported rows and charts. The earlier reset was environment interference, not a reproduced product failure.
