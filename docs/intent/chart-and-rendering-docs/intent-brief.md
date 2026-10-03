---
title: "Chart and rendering documentation"
slug: "chart-and-rendering-docs"
phase: intent
status: current
last_updated: "2026-09-23"
---

# Chart and rendering documentation

## My read

Byron wants a separate documentation plan for every chart type and the overall rendering system. The docs should help an analyst choose and operate a view, and help a developer understand how the React workspace turns supplied rows into coordinated views. These are related but different questions. A chart page should explain a task and visible behavior first. A system page should explain shared data scope, filtering, settings, rendering, and saved state once.

The current repository has eleven registered types. They include plots, tables, a color legend, and an explanation panel. “Each chart type” should cover all eleven, while the navigation can distinguish analytical charts from supporting views. A reader should be able to choose a view, identify its required fields, try a real example, understand what selections do to other views, and learn its current limits. A developer should understand where the host supplies data, where the workspace owns state, and which parts render with SVG, Canvas, Three.js, or HTML.

This is a documentation initiative. It does not require changing chart behavior or completing the separate deterministic rendering work. Claims about that work must distinguish what runs today from what is planned.

## What matters most

- Give every registered type a findable page with one real example and exact interaction guidance.
- Explain shared filter and row-scope rules once, with links from chart pages.
- Keep the rendering guide faithful to current code and label future architecture as future work.
- Give developers an accurate path from package mount to a useful configured workspace.

## The experience

A visitor starts at a chart index organized by analytical task. They open a chart page, see a real result, learn suitable fields and key settings, then try the matching demo. When they encounter a shared concept such as peer filtering or saved settings, a link takes them to the system guide. The guide uses a small data-flow diagram and one worked example to connect rows, calculations, filters, chart data, drawing, and persistence.

## Boundaries

- Do not present source-only behavior as verified runtime behavior.
- Do not imply all chart types share one completed rendering planner or one drawing backend.
- Do not generate a large API reference from TypeScript types before the first chart pages prove the format.
- Keep the current feature inventory as a source, not the public navigation structure.

## What seems settled

- The docs cover each registered type and one shared rendering-system guide.
- The demo's examples and current implementation are the source for published behavior.

## Current reality

`registerAllCharts.ts` registers eleven types. `docs/application-feature-inventory.md` already records behavior and limits for each. The demo has reusable examples and a `?example=` path. The demo has no docs route today; `main.tsx` mounts `LandingPage` directly. The [traceability inventory](../../application-feature-inventory.md#traceability-and-reproducibility) records completed scatter and bar proofs. Other chart types remain future scope.

## Next step after confirmation

Publish one complete chart page and one shared rendering guide, check both against the running demo and code, then apply the page pattern to the remaining types.
