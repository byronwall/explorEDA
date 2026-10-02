---
title: "Chart and rendering documentation — implementation plan"
slug: "chart-and-rendering-docs"
phase: plan
status: current
last_updated: "2026-10-02"
---

# Chart and rendering documentation — implementation plan

## Plan at a glance

Start with two unlike chart pages and a small rendering guide. This tests the content structure against real behavior before writing eleven pages. Use the demo app and its existing query-based navigation. GitHub Pages serves a static Vite build. Confirm the current deployment base and direct refresh before selecting URLs. Preserve `?example=` for live examples. After scatter and bar work, add the other nine registered types in short groups. Finish by checking every statement that depends on current controls, filtering, and saved settings.

## Ticket handoff

[exp-72ve](../../../.tickets/exp-72ve.md) covers the existing first-proof milestone needed by the landing remainder. It stays open for later refinement. This pass does not fan out the full catalogue. Existing example candidates below are historical; confirm current IDs and chart modes before execution. Review any docs-system research available at that frontier.

## Implementation strategy

- **First proof:** From a chart index, open scatter and bar guides, then launch each matching live example.
- **Primary seam:** Docs content and navigation live in `apps/demo`; the library owns chart behavior and public types.
- **Fast local loop:** `pnpm --filter demo dev`; use existing demo fixtures and focused tests.
- **External dependency:** None for local docs. The static GitHub Pages deployment confirms deep links and asset paths after local proof.
- **Rollout and rollback:** Add `?view=docs&topic=...` (or a similarly small query route). Keep the current landing, example, and coverage routes. Removing docs routes leaves saved analyses untouched.

## Milestone 1: Two guides can be used from the live demo

- **Change — navigation:** Add a docs index and stable query routes in the existing demo. Link back to the landing page and specific `?example=` states. Use semantic links and headings.
- **Change — content:** Write scatter and bar pages with purpose, fields, computations, interactions, row scope, key settings, limits, one real image, and a matching demo action. Use the [feature inventory](../../application-feature-inventory.md) as a source, then verify live labels and effects.
- **Change — shared guide:** Publish a short current-state rendering guide. Trace one selected order example through host records, provider, derived fields, Crossfilter scopes, registry, chart calculation, rendering, and saved configuration. Add a small diagram. Describe scatter and bar planning as current; other chart planners remain future work.
- **Verify:** Follow both guides with pointer and keyboard. Check direct URL refresh at 1280, 783, and 390 px. Run focused tests and `pnpm check:ui`.

### Desired end state

- Two unlike chart types and the system guide are readable at stable URLs.
- A reader can reproduce the named interactions without interpreting source code.

## Milestone 2: The chart catalogue covers all registered types

Use these current examples as starting points. Confirm that each saved layout still contains the named view before publication.

| Page | Example candidate | Main point to explain |
| --- | --- | --- |
| `row` | `categorical-charts` | Category counts and selection |
| `bar` | `box-plot` or `shop-operations` | Histogram bins versus category bars |
| `scatter` | `scatter-trace` | Points, rectangular brush, and trace |
| `line` | `line-chart` | Ordered series and X range |
| `boxplot` | `box-plot` | Box, violin, and beeswarm modes |
| `3d-scatter` | `lorenz-3d` | Camera control and filter limits |
| `pivot` | `categorical-charts` | Grouped measures and cell contributors |
| `data-table` | `tables` | Records, local search, and shared filters |
| `summary` | `box-plot` | Field profiles and chart actions |
| `color-legend` | `color-legend` | Shared color meaning and selection |
| `markdown` | `shop-operations` | Saved explanatory content |

- **Change — chart pages:** Add `row`, `line`, `boxplot`, `3d-scatter`, `pivot`, `data-table`, `summary`, `color-legend`, and `markdown` pages. Group the index as plots, tables, and supporting views. Include box, violin, and beeswarm modes on the `boxplot` page; explain histogram and category modes on `bar`.
- **Change — example gaps:** If a type lacks a focused existing example, add only the smallest demo fixture or use a clear existing dashboard state. Do not change the chart to make documentation easy.
- **Verify:** Compare the index with `registerAllCharts.ts` and `ChartType`; check each guide's required fields, selection, limits, and link against the running demo. Add one small coverage check so a registered type cannot lack a page.

### Desired end state

- All eleven registered types have task-led pages and working example links.
- The public index distinguishes analytical charts from supporting views without hiding any type.

## Milestone 3: The integration and rendering story is complete

- **Change — system guide:** Explain source versus effective fields; full, peer-filtered, and globally filtered rows; chart-owned versus shared filters; facets; SVG/Canvas/Three.js/HTML boundaries; and host-owned persistence. Link the existing README for exact package API.
- **Landing bridge ownership:** [exp-4ak2](../../../.tickets/exp-4ak2.md) in the adoption initiative owns the landing links. Do not duplicate that work here.
- **Verify:** Read the guide against `DataLayerProvider`, chart registry, representative renderers, saved-state types, and the current traceability status. Build the demo, run `pnpm check`, and smoke-test the deployed static URL only after local checks pass.

### Desired end state

- A developer can connect the demo, chart pages, and current rendering model without mistaking plans for shipped behavior.

## Below the cut line

- A new docs framework, live property playground, generated settings tables, API extraction pipeline, screenshots for every setting, and chart behavior changes made only for docs.
