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

Maps should feel close to magic. The map picks a sensible level from the data, boundaries are already there, and streets appear without setup. Nobody should see a blank map until someone contacts support. GeoJSON import already exists; the work is making geography dependable and mostly automatic.

This brief incorporates the Pro research and Byron's answers to ten product questions on October 11, 2026. The initiative is planned; implementation has not started.

## What matters most

- Make both map modes useful for comparisons, local sites, and custom territories.
- Give users control over data marks, reference boundaries, labels, and map context.
- Support custom GeoJSON and more ready-made geography with clear coverage and identifiers.
- Add street and place context that works out of the box, for both city-level site finding and regional orientation.
- Preserve exact selections, source traces, and understandable values within a small maintenance budget.

## The experience or behavior you appear to want

A user starts with coordinates or region identifiers. The map infers the useful level: worldwide coordinates show countries, a single country shows its states, and zooming in shows finer detail. The user can override the level or import their own boundaries. Before trusting the map, they can inspect excluded coordinates, unmatched keys, and grouped geometry. Labels can use readable names while joins use stable identifiers.

Users control analytical marks, reference boundaries, basemap context, and data labels separately. Street labels are a separate concern from record names. A small set of controls should cover common tasks. One nonselectable boundary overlay beneath points is a useful first proposal. Multiple analytical layers remain an option to assess when a dashboard needs them.

Changing context, visibility, or camera must preserve data meaning, selections, and source traces. Hidden selected records must remain discoverable. Changing the analytical mode or join can change the analysis and needs explicit behavior. Users must select, inspect, clear, and navigate with practical keyboard and touch controls.

Coordinates can gain region columns through a stored calculation that finds the country, state, or US county containing each point. It is derived, not live, because it can be expensive.

When a point map has more records than draw well (roughly a couple of thousand), nearby points group into counted clusters that split as the user zooms. Clicking a cluster selects its records.

Regional values must distinguish zero, no rows, invalid measures, and unmatched records. Averages use valid measure inputs. Color scales should stay stable through filters and facets. Prepared rates need clear units, periods, and denominators. The map must not invent normalization from polygon area.

## Custom and supplied geography

Keep the current Polygon and MultiPolygon FeatureCollection path as the first supported subset. Improve errors with useful feature and coordinate locations. Show import complexity and measure practical limits. Preserve original geometry when adapting it for display. Automatic repair, reprojection, and silent key conversion are outside the first slice.

Strengthen the existing join preview with mismatch samples, types, and duplicate-key details. Define what happens to reusable assets when assignment fails or a draft closes. An unused shared asset is not necessarily an error.

Ship world countries, states or provinces worldwide, and US counties. Users should not fetch or download boundaries by hand. Boundaries arrive with the library or a build step and load when the data needs them. Byron accepts maintaining or linking boundary files. Audit identifiers against real dashboard data. Retain source, version, geographic date, coverage, terms, and preparation details. Saved boundaries must not silently change with catalog updates.

## Detailed local context

Street maps work with no key and no setup, through a free public tile service. Neither Byron nor host applications should maintain tiles. A host can substitute its own provider. Supporting React 18 must not block the right street engine; moving to React 19 is acceptable if needed.

The projection follows the extent. World-scale views keep an equal-area projection; regional and local views use the web-map projection with streets. Provider rights, attribution, and request behavior need checks.

PNG export must include streets. A saved view restores for another viewer once analyses save to the coming server; no URL view parameters. Offline street maps are not required. Do not treat the existing zoom number as tile zoom. Keep analytical rows and uploaded geometry local.

## Boundaries

Keep the existing React and TypeScript library, host contract, linked filters, facets, and shared geometry. Use small proofs before setting workload limits or adding rendering infrastructure.

Defer heatmaps, advanced classification, and offline street archives. Routing, address geocoding, general spatial joins beyond point-to-region lookup, geometry editing, arbitrary coordinate systems, and a full GIS workbench remain outside scope. This work authorizes research and a documentation PR, not implementation, deployment, or paid services.

## What seems settled

Both map modes, custom geography, supplied geography, and street context remain core goals. Byron chose a free no-key street default, automatic projection by extent, clustering on zoom, PNG export with streets, and a stored point-to-region calculation. The research favors bounded controls and staged delivery.

The [research review](references/research-reconciliation.md) records all 20 recommendation dispositions and links the complete evidence. Source inspection found possible background-clear and draft-Escape faults. Browser reproduction remains pending. Five existing map tests passed locally; they do not establish the eight proposed proofs.

## Next step after confirmation

The [shape brief](shape-brief.md) proposes three releases and a first proof. After review, write the implementation plan.
