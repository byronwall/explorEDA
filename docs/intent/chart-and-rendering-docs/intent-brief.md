---
title: "Chart and rendering documentation"
slug: "chart-and-rendering-docs"
phase: intent
status: current
last_updated: "2026-10-10"
---

# Chart and rendering documentation

## My read

Byron wants a documentation page for every chart type and one guide to the overall rendering system. The docs should help an analyst choose and operate a view, and help a developer understand how the React workspace turns supplied rows into coordinated views. A chart page explains a task and visible behavior first. The system guide explains shared data scope, filtering, settings, rendering, and saved state once.

The October research brief added how the docs should be built and read. Pages will carry many images. They should ideally embed the actual interactive React charts, not imitations. They must build as static files alongside the demo and deploy through the same GitHub Pages site. Byron maintains this alone, so the system should stay small: no server, CMS, versions, translations, or property playground.

“Each chart type” means every registered type. That was eleven when this started; the registry now holds twenty, including newer views such as map, heatmap, sankey, calendar, ECDF, and parallel coordinates. The navigation can still separate analytical charts from tables and supporting views.

## What matters most

- Every registered type has a findable page with real images, one real example, and exact interaction guidance.
- Shared filter and row-scope rules are explained once, with links from chart pages.
- The rendering guide is faithful to current code and labels future work as future work.
- Readers can try the real workspace from a page, inline where the screen is wide enough and by link everywhere.
- Adding a page or replacing a screenshot is routine prose work, not routing or component work.

## The experience

A visitor starts at a chart index organized by analytical task. They open a chart page, see captured results, learn suitable fields and key settings, then start the matching live example in place or open it full-screen. Prose and figures read well on a phone; the live workspace appears only at desktop width, because the workspace supports 1024 CSS pixels and up. When the visitor meets a shared concept such as peer filtering or saved settings, a link takes them to the system guide.

## Boundaries

- Do not present source-only behavior as verified runtime behavior.
- Do not imply all chart types share one rendering planner or one drawing backend.
- Do not invent a public standalone chart API to make embedding easier; examples mount the real workspace.
- Do not redesign charts for narrow screens or change chart behavior only for documentation.
- Static files are required. Pre-rendered per-article HTML and full-text search are not, for now.

## What seems settled

- The docs live with the demo and ship in its existing static deployment.
- The demo's examples and current implementation are the source for published behavior.
- Scatter, bar, and the rendering guide were the first proof, and they shipped on 2026-10-02.

## Current reality

`apps/demo/src/ChartDocs.tsx` serves an index, scatter and bar guides, and a rendering guide at `?view=docs&topic=…`. The pages are hand-written TSX (about 940 lines for three pages) with images in `apps/demo/public/docs/`. Since then, the demo moved examples to path URLs (`/examples/<id>`, `/viewer`) served through a `404.html` fallback, and `coverage.ts` now maps every registered type to the examples that show it. The [documentation-system research](../../research/documentation-system-recommendation.md) recommends build-time MDX in the existing app and on-demand iframe embeds. It inspected a commit from three hours before the first guides landed, so it treats as hypothetical what now exists.

## Next step after confirmation

Prove the authoring and embedding approach on the three pages that already exist, then fill the catalogue in groups.
