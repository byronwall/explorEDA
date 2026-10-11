---
title: Useful, configurable maps for location data
slug: map-and-location
phase: intent
status: draft
last_updated: 2026-10-11
---

# Useful, configurable maps for location data

## My read

People should turn location data into useful dashboards without first becoming GIS specialists. The point and region maps need clearer behavior, better defaults, and enough control to suit the question. A world outline can explain a global pattern. A local service dashboard can need roads, street names, and neighborhood context. Both are valid analytical views.

The goal is control over what the map renders. Users should choose suitable geography, data marks, labels, and context without losing linked selection or source records. They should have useful geography ready to select. They should also be able to bring their own boundaries when standard geography does not fit their work.

The current product already accepts polygon GeoJSON. This initiative should make that path useful and dependable, then identify what it still lacks. It should not restart a feature that already exists. Leaflet, or a similar library, is a proposed way to provide detailed maps. The durable requirement is recognizable local context. The rendering library and the choice between simple and detailed views remain open.

The immediate deliverable is a researched intent brief for review. A broad comparison should identify valuable capabilities, sensible limits, and small proofs. It must not turn a dashboard library into a full GIS product.

## What matters most

- Make both point and region maps useful for real dashboard questions.
- Give users clear control over the geography, marks, labels, and context they see.
- Improve the existing custom GeoJSON path and provide more ready-made geography.
- Support detailed context, including street names, where the task needs it.
- Keep the resulting product small enough for a personal developer to build and maintain.

## The experience or behavior you appear to want

A user starts with coordinates or region identifiers and chooses the geographic view that fits their data. They can use supplied geography or import their own boundaries. They can see whether the locations or joins are valid before trusting the map. They choose the visible data and context, then adjust the view without changing which records belong to the analysis.

For a regional comparison, a restrained boundary map may be enough. For local operations, the same workspace may need streets and place labels. The user should understand which content is analytical data and which content only provides context. Switching the presentation should preserve the meaning of values, selections, and source traces.

Useful examples include comparing values across countries, reviewing sites within a city, and joining records to custom service districts. These examples guide research. They do not require routing, boundary editing, or a universal layer editor.

## Boundaries

The product remains an embedded React and TypeScript analysis workspace. Maps must fit its existing chart settings, linked filters, facets, saved analyses, and source traces. Missing coordinates, unmatched keys, empty regions, invalid measures, and valid zero values must remain distinguishable.

Detailed context can require an external map provider. Research must separate the renderer from tiles, data, styles, credentials, attribution, and usage terms. A library choice alone cannot supply street data or permission to use it. The design should make external requests and their consequences understandable to the host application.

This work does not authorize feature implementation, deployment, paid services, or a full GIS workbench. Spatial databases, editing tools, routing, geocoding infrastructure, arbitrary coordinate systems, and advanced spatial analysis are outside the default scope. Research may recommend a narrow exception when it solves a common dashboard task with modest cost.

## What seems settled

Both current map modes belong in this initiative. Custom GeoJSON and supplied geography deserve direct attention. Detailed local context is a desired capability. The exact renderer, map catalog, layer model, and delivery order remain research questions.

Byron has authorized the Pro handoff and collection of its results. Completion of this planning task means Pro has finished, all artifacts are retained, findings are reconciled into this initiative, and a PR is ready. Implementation waits for review.

## Current reality that matters

There is one Map chart with Point and Region modes. Points use latitude and longitude, with optional color, size, and labels. Regions import Polygon or MultiPolygon FeatureCollections by file or pasted text. Records join by exact typed keys. Geometry is shared through saved assets.

The renderer uses D3 geographic projections and bundled World Atlas land. Equal Earth and equirectangular views have saved geographic centers and zoom. There is no tile renderer in the current package manifest. The existing tests cover several important selection, geometry, and restore cases. These are source findings, not a fresh browser acceptance result.

## Next step after confirmation

Run the authorized Pro research using the [handoff prompt](chatgpt-pro-map-research-prompt.md). Compare dashboard products, declarative chart tools, and map renderers. Reconcile each useful recommendation against current code. Record what to adopt, investigate, defer, or reject. Update this brief, retain the original evidence, and open a documentation PR for review.
