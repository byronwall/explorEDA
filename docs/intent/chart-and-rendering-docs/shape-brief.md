---
title: "Chart and rendering documentation — shape brief"
slug: "chart-and-rendering-docs"
phase: shape
status: current
last_updated: "2026-09-23"
---

# Chart and rendering documentation — shape brief

## Recommendation

Use the existing demo app for a small docs section: an index, one page per registered type, and one rendering-system guide. Give each page a stable URL, a concise example, and a direct demo link. Reuse the current example fixtures and feature inventory. Start with scatter and bar because they expose two different rendering and filtering paths; publish a strong page template before filling the catalogue. The [comparison research](comparative-research.md) supports task-led examples and a separate shared-model guide. It does not call for a new documentation framework or an interactive settings playground.

## Problem and appetite

- **Problem:** Behavior is spread across a long internal inventory, README, source files, and demos.
- **Outcome:** Analysts can choose and use each view; developers can understand the current rendering and state path.
- **Appetite:** A small docs section in the existing Vite app, followed by eleven concise pages.
- **Not in this shape:** A generated API reference, new chart features, or a completed renderer architecture.

## Core shape

The index groups plots, tables, and supporting views. Each page follows one format: purpose → required fields and input rows → real example → what it computes → selection/filter behavior → key settings → limits → related system guidance. The rendering guide follows one worked case through host data, `DataLayerProvider`, effective/calculated fields, Crossfilter row scopes, registered chart definition, chart-specific computation, drawing, interaction, and saved settings. It names different backends where they actually occur.

## Current fit

- **Reuse:** Demo example routes, chart registry names, README integration facts, and `docs/application-feature-inventory.md`.
- **Add:** Docs routes, a compact index, chart pages, and one shared rendering guide.
- **Avoid:** Duplicating the full inventory in every page or exposing a future general planner as current behavior.

## How to make this go better

- **Prove two unlike charts first.** Scatter and bar will reveal whether one page format handles points, bins, and different filter gestures.
- **Use source and runtime together.** The inventory seeds text; the demo verifies labels, results, and screenshots.
- **Share one system explanation.** Link filter scopes, calculated fields, and saved state instead of repeating them eleven times.
- **Keep pages easy to revise.** Write hand-authored pages; add generation only if maintenance becomes measurable work.

## First proof

- **Question:** Can one chart page answer selection, row scope, and limits without source knowledge?
- **Proof:** Publish scatter and bar pages plus a draft rendering guide at local routes.
- **Observe:** A reader can follow links, run both examples, and match the explained filter effects.
- **Pass / fail:** No broken route, incorrect control label, or claim that confuses current code with planned traceability.
- **Deliberately excludes:** Full catalogue, property playground, and generated API reference.

## Rabbit holes and no-gos

- Do not force the chart registry to become a docs content schema.
- Do not claim one SVG renderer: scatter uses Canvas and SVG, 3D uses Three.js, and tables use HTML.
- Do not turn internal traceability plans into published user promises before implementation.

## Plan handoff

Build navigation and two unlike pages first. Add the rest in small groups, checking the real demo as each group lands.
