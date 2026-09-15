---
title: "Interactive EDA workspace"
slug: "interactive-eda-workspace"
phase: intent
status: current
last_updated: "2026-09-14"
---

# Interactive EDA workspace

## My read

explorEDA should become a fast workspace for understanding unfamiliar tabular data. It should detect fields, types, nulls, ranges, categories, and distributions. It should then offer useful tables and charts with few choices.

Exploration should form one connected loop. A user inspects rows, adjusts a chart, selects data, and sees every related view update. The interface must explain active data and keep comparison scales stable. Saved workspaces preserve layout, filters, formats, and calculations.

The transcripts connect data preparation, tables, filtering, charts, dashboard layout, and traceability. The end state is a coherent analysis environment, not separate chart components.

The primary product is Byron's analysis application. The React package remains its full workspace engine. Other developers can mount one component without rebuilding its controls.

The application drives priorities. Package reuse guides boundaries, not a second roadmap. Breaking public API changes are acceptable.

## What matters most

- Build the best analysis application for Byron's daily use.
- Keep the complete analysis workspace easy to embed through one public React component.
- Improve one-source exploration before adding multiple sources and joins.

## Work packages

| Work package | Desired outcome | Current repository state |
| --- | --- | --- |
| Data intake and field understanding | Load arbitrary tables and explain fields, types, nulls, ranges, categories, and limits. | Partial. The demo loads one CSV or JSON file. Summary logic profiles one table. |
| Interactive data table | Make rows readable and controllable through columns, formats, sorting, filtering, sizing, detail, and export. | Partial. Basic columns, paging, text filters, sorting, resizing, search, and export exist. |
| Filtering and selection | Keep chart brushing, table filters, and top-level filters coherent and visible across the workspace. | Strong base. Shared filtering exists, but filter scope and active-state explanation remain thin. |
| Chart creation and defaults | Create a useful chart with minimal input, then support direct overrides. | Partial. A registry, defaults, settings panels, and several chart types exist. Field-led recommendations remain limited. |
| Dashboard views and persistence | Arrange related views, separate persistent data filters from temporary brushing, and restore named views. | Partial. The grid and saved structure exist. Named views, tabs, URL state, and filter separation do not. |
| Faceting and comparison | Produce readable small multiples with deliberate shared scales, legends, headers, and interactions. | Partial. Grid and wrap faceting with shared axes exist. Comparative behavior needs a focused quality pass. |
| Visualization specification | Represent sources, transforms, groups, repeats, scales, layers, and glyphs as one inspectable pipeline. | Early base. Per-chart settings and a registry exist. There is no composable pipeline model. |
| Traceability and provenance | Let users move from a rendered mark to contributing rows and intermediate calculations. | Mostly missing. Internal row identifiers exist, but no user-facing lineage flow exists. |

## Product and package split

The React package owns field summaries, charts, tables, calculations, filters, layout controls, and workspace state. Its main entry point works without internal imports.

The primary application consumes that entry point. It owns file selection, routes, examples, persistence, accounts, and other product shell concerns.

Package extraction is not separate work. Reusable analysis features stay in the package. Product-specific storage, navigation, and source acquisition stay in the application.

## The experience you appear to want

The user opens one dataset and receives a field summary plus starter views. They move between summaries, rows, and charts without rebuilding context. Filters update related views and show the remaining row count.

Chart creation starts from a field or question, not an empty form. Defaults use the data type and available space. Users can later change grouping, scales, color, facets, calculations, or layout.

## Boundaries

### Must be true

- Common exploration actions require few clicks and give immediate visual feedback.
- Filters have clear scope, visible state, and a reliable reset path.
- Charts keep transformations separate from drawing when that separation improves reuse or traceability.
- Saved state reproduces the analysis without storing the raw source rows inside every view.
- The table and charts use one shared understanding of fields, types, filters, and active rows.
- The primary application uses the same public package boundary that another consumer would use.

### Must be avoided

- Do not force advanced controls onto small or known-schema tables that need only good defaults.
- Do not hide important data transformations inside chart rendering code.
- Do not build every advanced chart before the common grouping and positioning model is clear.
- Do not make live server data a requirement for the first useful desktop workflow.
- Do not add compatibility layers for old package shapes while the API is still changing.
- Do not split application and package behavior into duplicate implementations.

## What seems settled

- Desktop is the current supported workspace. Mobile support is not part of this initiative.
- Byron's application is the primary consumer and decides near-term priorities.
- The React package remains publicly consumable as a complete analysis workspace.
- Breaking API changes are acceptable. Backward compatibility is not required.
- The first release can assume one data source.
- Direct manipulation matters. Brushing, header controls, and nearby settings should drive exploration.
- Stable shared scales are the normal default for comparison views.
- Arbitrary uploaded data needs field discovery and type-aware controls.
- Traceability from visible output to source data is a durable end-state goal.
- Simple cases should remain simple. Rich controls appear only when the data or task needs them.

## Possibilities, not decisions

- A general declarative grammar could replace each chart's independent settings structure.
- Agents could create dashboards through a thin deterministic specification.
- Multiple source tables could later support joins, lookups, and server-side materialization.
- Rich table cells could expand into cards, relationship previews, images, or small charts.

## Current reality that matters

The repository already has a public React package and a demo that imports its public entry point. The package accepts rows and optional saved state. It has shared filtering, calculations, a resizable grid, faceting, and eleven view types.

The public entry point is too narrow for a polished host integration. Consumers cannot receive normal state changes or configure the complete workspace through the main component.

The data table documentation overstates the implementation. The current code does not provide grouping, row selection, virtual scrolling, column reordering, rich cells, or type-aware filters. This gap makes the table package a useful early proof target.

Older notes also name multiple sources and joins. The current API has no multi-table model, and this work is deferred.

## Next step after confirmation

Shape field understanding and the interactive data table together. Keep their state and UI inside the package. Use the application to prove the public consumer flow with one data source.
