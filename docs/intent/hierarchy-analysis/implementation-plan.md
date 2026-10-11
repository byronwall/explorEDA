---
title: "Explore nested categories and their totals — implementation plan"
slug: "hierarchy-analysis"
phase: plan
status: draft
last_updated: "2026-10-10"
---

# Explore nested categories and their totals — implementation plan

## Plan at a glance

Ship one **Hierarchy** chart type: a treemap, then zoom, then readability at three levels, then icicle and sunburst. Each milestone is one PR that leaves a usable chart.

The order follows risk. The first risk is wrong numbers: merged repeated labels, sums that don't match the source, a selection that grabs the wrong rows. So Milestone 1 builds a pure hierarchy builder with tests and draws only a two-level treemap over it. Zoom comes next because it is part of the first wave and because it changes the clutter problem: a three-level view that is crowded at the root may read well one level down. Milestone 2 adds it with the focus stored as a value path. Milestone 3 then handles small categories and decides the three-level default with zoom available. Layouts come after both, and each is mostly geometry over the same plan. Sunburst comes last because rectangular views are preferred, and it is the first thing to cut.

The chart copies Sankey wherever Sankey already answers a question: ordered category fields, count or sum, missing values, a cap with an Other node, value filters, and highlighting the chart's own selection instead of removing rows. That keeps the two category-path charts consistent and avoids new filter machinery.

## Implementation strategy

- **First proof:** A two-level treemap of shop orders (Region → Category, sum of Revenue). Its shares match a pivot of the same fields, and clicking North › Home filters a rows table to exactly those orders.
- **Primary seam:** `hierarchyPlan.ts` turns rows, settings, the focus, and the selection into path nodes with value, share of parent, share of whole, members, and contributors. Each layout turns those nodes into rectangles or arcs. Renderers never compute totals.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/components/charts/Hierarchy`, then the demo at `pnpm --filter demo dev --port 5291 --strictPort`.
- **Local dependencies:** Demo datasets only: `shop-10000.csv` (Region → Category → Product) and `categorical_medium.csv` (Category → Subcategory).
- **Layout math:** Squarified treemap and partition layouts are hand-written in `treemapLayout.ts` (about 60 lines each) instead of adding `d3-hierarchy` to the published package.
- **Rollout and rollback:** A new chart type only. No existing chart or saved layout changes, and removing the registration removes the feature.

## Milestone 1: A two-level treemap with trustworthy totals

This proves the numbers and the selection before any visual polish. It deliberately leaves out Other, three-level labeling, tracing, and other layouts.

- **Change — Hierarchy builder (`components/charts/Hierarchy/hierarchyPlan.ts`)**
  - Build nodes keyed by the full path with `categoryKey`, so "Lamp" under Home and under Office stays separate. Size by count or by a sum of nonnegative values. Report negative and missing measures as exclusions with counts, as Sankey does.
  - Each node carries value, share of parent, share of whole, row count, `members`, contributors, and `selectedValue`.
  - Tests: repeated labels; hand-checked sums on a small fixture; every parent equals the sum of its children; shares on shop data match an aggregate of the same rows; excluded measures are counted.
- **Change — Chart type and settings**
  - Proposed settings: `HierarchySettings { type: "hierarchy"; levels: string[]; aggregation: "count" | "sum"; measureField?; missingLevels: "omit" | "show"; maxChildren; arrangement: "treemap"; focus?: datum[] }`. `focus` is reserved now and used in Milestone 2. `layout` is already the grid-placement key, so the layout choice is named `arrangement`.
  - Register it everywhere Sankey is registered:
    - `types/ChartTypes.ts` union
    - `registerAllCharts.ts`
    - `saveDataUtils.ts` validation (a bad shape rejects the whole save)
    - `lib/dsl/settingKeys.ts`
    - `chartAccessibility.ts`
    - `AddChartDialog.tsx` group ("Compare categories")
    - `useCreateCharts.ts` defaults: up to two low-cardinality categories
    - `emptyPlotClick.ts` label selector
  - The settings panel follows `SankeySettingsPanel`: Levels (1–3), Size, Measure, and Missing values.
- **Change — Treemap renderer**
  - Squarified nested rectangles. Parents get a header strip with the label, and children are colored by their top-level branch.
  - Labels show name and value, plus share when they fit.
  - A hover/focus readout shows path, value, % of parent, and % of whole. The root total sits in the status line.
  - Clicking a node sets value filters for each level on its path. Shift-click toggles a sibling under the same parent and refuses a different parent with a short note. Clicking empty space clears. Selected branches stay full color, and the rest dims.
- **Change — Demo example and changeset**
  - Add a shop-orders Hierarchy example to `examples.ts` and `coverage.ts`. Run the coverage and dashboard-text round-trip tests.
  - `pnpm changeset:add minor "Add a Hierarchy chart that shows nested category totals as a treemap."`

### Desired end state

- A user adds a Hierarchy chart, picks Region → Category and sum of Revenue, and reads sizes and shares.
- Clicking North › Home filters every other chart to exactly those orders. The selection survives save, restore, and dashboard text.
- Builder tests pass. In the browser, one branch's share matches a pivot of the same fields at wide, intermediate, and narrow widths.

## Milestone 2: Zoom into a branch and step back with breadcrumbs

This makes zoom deterministic before small-category handling, so Milestone 3 judges readability with zoom available.

- **Change — Focus in the model**
  - `focus?: datum[]` holds the values along `levels`, in order; empty or absent is the whole. Values are stored raw, like `ValueFilter.values`, so 1 and "1" stay distinct and a blank is `null`.
  - `hierarchyPlan.ts` resolves the focus level by level with `categoryKey`, against raw values before Other grouping. It returns the root node, the resolved depth, and any unresolved tail.
  - Shares come back against parent, focus root, and the whole.
  - Tests: resolution by type; a filter that empties the focused branch falls back to the deepest ancestor with rows and keeps the stored focus; a value folded into Other still resolves; a leaf or Other cannot become the focus.
- **Change — Settings integrity**
  - Validate `focus` in `saveDataUtils.ts` (an array of datum, no longer than `levels.length - 1`). Add `focus` to `settingKeys.ts` and check the dashboard-text round trip.
  - When the levels settings change, keep only the focus prefix whose levels are unchanged. This happens in the settings panel's change handler, so stored state never points at a renamed level.
- **Change — Gestures and breadcrumbs**
  - Double-click a parent to zoom, using `event.detail === 2` like `useTitleEditing`. The first click's selection is rolled back inside one held edit (`useChartEdit` / `holdStateChanges`), so a zoom is one undo step and leaves the filters alone.
  - Shift+Enter zooms the keyboard-focused node. Enter, Space, and Alt-Enter keep their current meanings.
  - A breadcrumb row above the plot (All › North › Home) has one button per step. An unresolved tail shows as a muted "no rows" crumb. Each crumb gets an accessible name, and the zoom gesture gets a tooltip on the chart.
  - Zoom does not change filters, and selection keeps working inside the zoomed view.

### Desired end state

- Zooming into North and reloading the page shows the same view. Undo steps back out of the zoom in one step.
- A filter elsewhere that empties North shows the whole with a "North · no rows" crumb, and clearing that filter returns to North.
- Model tests cover every focus rule. In the browser, breadcrumbs work at wide, intermediate, and narrow widths.

## Milestone 3: Three levels and many small categories stay readable

This turns a correct chart into a readable one at the stated scale: 2–3 levels with 2–8 categories each.

- **Change — Small categories**
  - `maxChildren` (default 8) folds the rest of a parent's children into "Other". Its members are an exact value list under that parent, so selecting it is exact.
  - Nodes below a minimum pixel area are drawn unlabeled but stay hoverable. Nodes below a smaller threshold are not drawn, and the status line counts them.
  - Missing levels show as `(missing)` when `missingLevels: "show"`.
- **Change — Color and tracing**
  - Color modes: by top-level branch (default, using the workspace color scale for that field when one exists), by level, or one color. Deeper levels are lighter tints of their branch.
  - Alt-click tracing gets a `hierarchy-node` trace in `trace/traceTypes.ts` and `ChartTracePanel.tsx`, modeled on `sankeyTrace.ts`.
- **Spike — Three-level treemap labels**
  - Decision required: with zoom available, does a three-level treemap stay readable at the root at the default card size, or should three levels default to icicle?
  - Evidence to gather: screenshots of shop data (Region → Category → Product) and `categorical_medium.csv` at three widths.
  - Fallback: cap labels at two levels inside the treemap and leave the third level to the readout.

### Desired end state

- Three-level shop data is readable, with Other nodes and unlabeled small marks behaving as described in the shape brief.
- Alt-click on any node lists exactly its rows.
- The default arrangement for three levels is decided and recorded in the map.

## Milestone 4: Icicle layout and switching

- **Change — Icicle arrangement**
  - A partition layout with stacked bands by level, root on the left and leaves on the right. Orientation is fixed at first.
  - It reuses the same plan, readout, selection, zoom, breadcrumbs, color, and trace. A zoomed icicle starts at the focus node.
- **Change — Arrangement control**
  - A segmented control in the settings and the chart header switches between Treemap and Icicle. Each option gets a tooltip.
  - Switching keeps levels, size, color, focus, and filters. Add an `arrangement` key to dashboard text.

### Desired end state

- One chart switches between treemap and icicle with no setup lost, including through undo and saved views.

## Milestone 5: Sunburst (cuttable)

- **Change — Sunburst arrangement**
  - A partition layout in polar coordinates with the whole in the center. Labels go only on arcs wide enough, oriented along the radius.
  - Selection, zoom, readout, color, and trace come from the plan.

### Desired end state

- Sunburst is available as a third arrangement. If labels or selection feel worse than icicle on real data, stop here and record the cut.

## Open decisions and spikes

- **Three-level default arrangement** (Milestone 3 spike): resolved. Treemap stays the default; at narrow widths leaves go unlabeled but zoom labels every box.

## Below the cut line

- Circle packing and other radial layouts beyond sunburst
- Animated zoom transitions
- Zoom that also filters other charts
- Mekko for exactly two levels
- Selecting across different parents (waits on [precise composite selection](../precise-composite-selection/intent-brief.md))
- Parent-ID hierarchies, deeper trees, and Pivot Table subtotals or collapse
- Named Treemap, Sunburst, or Icicle entries in the Add Chart menu
