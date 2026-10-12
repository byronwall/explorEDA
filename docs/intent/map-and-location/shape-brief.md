---
title: Useful, configurable maps for location data — shape brief
slug: map-and-location
phase: shape
status: draft
last_updated: 2026-10-11
---

# Useful, configurable maps — what we are adding

**Outcome:** Location data becomes a useful map with almost no setup. The map picks the right geography, boundaries are already there, and streets appear when the view is local.

**Primary flow:** Add a map → explorEDA infers points or regions and the level → zoom from world to street → select, filter, export, and save.

## Feature scope

```text
Maps for location data
├── PLANNED ADDITIONS
│   ├── Trustworthy selection and values
│   │   ├── Empty-space click clears only this map; draft Escape never changes the saved chart
│   │   └── Zero, no rows, no valid measure, and unmatched stay distinct in fill, legend, and trace
│   ├── Boundaries that are already there
│   │   ├── Countries, states/provinces worldwide, US counties
│   │   ├── Loaded per level and country when needed; prefetched as soon as data suggests them
│   │   ├── Level inferred from data (codes, names, coordinate extent), with override
│   │   └── Import keeps working: located errors, size shown, nothing half-added
│   ├── Locate region (stored calculation)
│   │   └── Adds country, state, and US county columns from latitude/longitude; reusable in any chart
│   ├── One map from world to street
│   │   ├── World extents: equal-area outline map, as today
│   │   ├── Regional and local extents: street basemap, no key, light and dark
│   │   ├── Region level gets finer on zoom when a matching column exists
│   │   └── Crowded points group into counted clusters that split on zoom
│   ├── Content controls (one compact popover)
│   │   └── Data marks, data labels, reference boundaries beneath points, basemap style or off
│   └── PNG export including streets and the required credits
└── LATER POSSIBILITIES
    ├── County-level boundaries outside the US
    ├── Heatmaps, classed scales, several analytical layers
    └── Offline street maps
```

## Behavior

| Situation                                            | Expected result                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Coordinates span several countries                   | Points on the world map; a country region option is offered when region columns exist.      |
| Data has US state codes only                         | US states region map, without asking.                                                       |
| Zoom past the world extent                           | The map switches to the street basemap at the same place. Filters and selection carry over. |
| Click a cluster                                      | Its records are selected. Alt-click traces them.                                            |
| Street tiles fail or the service is gone             | Data draws on the outline map with a short notice. Selection and keyboard still work.       |
| Host sets its own tile provider or turns streets off | That choice wins for every map.                                                             |
| Shared analysis reopened by another viewer           | Same place and zoom, restored from saved settings; no URL view parameters.                  |
| Locate region on 50k rows                            | Runs in the background with progress; results are stored, not recomputed on each render.    |

## Decisions and boundaries

**Appetite:** Three releases, each shippable: (1) trustworthy selection, values, and import; (2) supplied boundaries, level inference, Locate region, and content controls; (3) street basemap, clustering, and export.

**Key decision:** Use MapLibre GL for street views, not Leaflet. The free no-key service that fits your answers, OpenFreeMap, serves vector tiles built for MapLibre. Leaflet would need a plugin that wraps MapLibre anyway, or a raster provider whose policy limits heavy use. MapLibre also supplies clustering and image export. It is framework-agnostic, so React 18 support is unaffected. If Leaflet comes back, use its core directly; React 19 is needed only for React Leaflet.

**Key decision:** Keep the current D3 map for world extents and hand off to MapLibre when zoomed in. This keeps honest world areas and today's accessible SVG interaction where comparisons happen. Selections stay keyed by source row ID across both, never by renderer feature IDs.

**Key decision:** Deliver boundaries in a companion package of prepared files, per level and per country. `exploreda` depends on it, so hosts get it automatically. Bundlers serve the files from the host's own origin, and a host may point to a CDN instead. Saved analyses reference supplied boundaries by package version and content hash, avoiding copies of large geometry in browser storage. Imported boundaries are still copied, as today.

**Boundary:** OpenFreeMap carries no service guarantee and may stop without notice, so the outline fallback must always work, and hosts can switch providers. No address geocoding, routing, general spatial joins beyond Locate region, geometry repair, or tiles we host.

**First proof:** **Try:** On the earthquakes demo, mount MapLibre with an OpenFreeMap style beneath the existing chart frame. Hand off from the D3 world view at a zoom threshold, cluster the points, and export a PNG. **Observe:** whether the handoff keeps place, filters, and selection; whether cluster clicks select exact row IDs; whether keyboard selection still works; whether the PNG includes tiles and credits; how much bundle size MapLibre adds when loaded lazily. **Decide:** If the handoff is smooth and the IDs are exact, build release 3 this way. If the handoff is jarring, use MapLibre at every extent and drop equal-area world views.

**Open choices:**

1. Should Locate region store its result columns in the saved data, or store the calculation and recompute it on load with a cache?
2. Should the boundary package be a required dependency (zero setup) or optional (smaller installs, but countries are missing until installed)?

See the [intent brief](intent-brief.md) and the [research reconciliation](references/research-reconciliation.md).
