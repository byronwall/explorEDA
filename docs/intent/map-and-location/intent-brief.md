---
title: Useful, configurable maps for location data
slug: map-and-location
phase: intent
status: current
last_updated: 2026-10-11
---

# Useful, configurable maps for location data

## My read

People should turn location data into useful dashboards without becoming GIS specialists. Point and region maps need clearer behavior, useful geography, and control over visible content. A world outline can explain a global pattern. A local service dashboard can need roads, street names, and neighborhood context.

The research supports improving the existing analytical maps, then testing optional street context. GeoJSON import already exists. The main task is to make importing, joining, configuring, and saving geography dependable. Leaflet remains a candidate. The desired outcome is useful local context; the renderer is still an open choice.

This brief incorporates the completed Pro research. Its recommendations remain proposals for Byron's review. The initiative is planned; implementation has not started.

## What matters most

- Make both map modes useful for comparisons, local sites, and custom territories.
- Give users control over data marks, reference boundaries, labels, and map context.
- Support custom GeoJSON and more ready-made geography with clear coverage and identifiers.
- Add street and place context where users need it.
- Preserve exact selections, source traces, and understandable values within a small maintenance budget.

## The experience or behavior you appear to want

A user starts with coordinates or region identifiers. They choose supplied geography or import their own boundaries. Before trusting the map, they can inspect excluded coordinates, unmatched keys, and grouped geometry. Labels can use readable names while joins use stable identifiers.

Users control analytical marks, reference boundaries, basemap context, and data labels separately. Street labels are a separate concern from record names. A small set of controls should cover common tasks. One nonselectable boundary overlay beneath points is a useful first proposal. Multiple analytical layers remain an option to assess when a dashboard needs them.

Changing context, visibility, or camera must preserve data meaning, selections, and source traces. Hidden selected records must remain discoverable. Changing the analytical mode or join can change the analysis and needs explicit behavior. Users must select, inspect, clear, and navigate with practical keyboard and touch controls.

Regional values must distinguish zero, no rows, invalid measures, and unmatched records. Averages use valid measure inputs. Color scales should stay stable through filters and facets. Prepared rates need clear units, periods, and denominators. The map must not invent normalization from polygon area.

## Custom and supplied geography

Keep the current Polygon and MultiPolygon FeatureCollection path as the first supported subset. Improve errors with useful feature and coordinate locations. Show import complexity and measure practical limits. Preserve original geometry when adapting it for display. Automatic repair, reprojection, and silent key conversion are outside the first slice.

Strengthen the existing join preview with mismatch samples, types, and duplicate-key details. Define what happens to reusable assets when assignment fails or a draft closes. An unused shared asset is not necessarily an error.

Start with one audited country pack, then add useful national or regional packs. This is a proposed sequence, not a permanent catalog limit. Compare existing World Atlas countries with a fresh Natural Earth source before choosing. Audit identifiers against real dashboard data. Retain source, version, geographic date, coverage, terms, and preparation details. Saved boundaries must not silently change with catalog updates.

## Detailed local context

Keep D3/SVG as the default while comparing Leaflet with raster tiles and MapLibre with vector styles. Use the same small dashboard tasks and local fixtures. Choose at most one additional engine if it preserves analytical behavior and earns its maintenance cost.

Raster street labels are part of the tile image. Vector label controls depend on the chosen style and data. The author should see only controls that work. The host supplies approved context presets and provider configuration. Provider rights, attribution, request behavior, and image export need separate checks.

Preserve saved geographic views without treating the existing zoom number as tile zoom. Keep credentials out of saved analyses. Confirm uploaded geometry and analytical rows stay local. Distinguish portable saved analysis from text DSL and image output. Detailed export remains unproven.

## Boundaries

Keep the existing React and TypeScript library, host contract, linked filters, facets, and shared geometry. Use small proofs before setting workload limits or adding rendering infrastructure.

Defer clustering, heatmaps, advanced classification, and offline street archives until a concrete task justifies them. Routing, geocoding infrastructure, spatial joins, geometry editing, arbitrary coordinate systems, and a full GIS workbench remain outside scope. This work authorizes research and a documentation PR, not implementation, deployment, or paid services.

## What seems settled

Both map modes, custom geography, supplied geography, and local context remain core goals. The research favors bounded controls and staged delivery. It does not select a renderer, provider, catalog membership, or final control layout.

The [research review](references/research-reconciliation.md) records all 20 recommendation dispositions and links the complete evidence. Source inspection found possible background-clear and draft-Escape faults. Browser reproduction remains pending. Five existing map tests passed locally; they do not establish the eight proposed proofs.

## Next step after confirmation

Review this intent and its proposed limits in the PR. After review, shape the smallest useful release and its proofs. Begin with analytical correctness and import behavior, then geography and content controls, then the street-context comparison. Accessibility applies throughout. The research proof plan supplies candidates; it is not an approved implementation plan.
