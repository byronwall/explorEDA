---
title: Useful, configurable maps for location data — shape brief
slug: map-and-location
phase: shape
status: draft
last_updated: 2026-10-11
---

# Useful, configurable maps — what we are adding

**Outcome:** People can trust what a map selects and shades, use world countries or their own boundaries without preparing files, choose what the map shows, and add street context when a local dashboard needs it.

**Primary flow:** Pick coordinates or a region field → choose countries or import boundaries → check the join → choose what shows → select, filter, and save.

## Feature scope

```text
Maps for location data
├── PLANNED ADDITIONS
│   ├── Trustworthy selection (point and region)
│   │   ├── Plain click on empty map space clears only this map's filters
│   │   ├── Escape in a draft preview never changes the saved chart
│   │   └── Overlapping points stay separately inspectable
│   ├── Honest region values
│   │   ├── Zero, no rows, no valid measure, and unmatched look different in fill, legend, and trace
│   │   └── Join preview: typed mismatch samples, duplicate keys, unmatched rows and regions
│   ├── Boundary import (existing Polygon/MultiPolygon subset)
│   │   ├── Errors name the feature, ring, and coordinate
│   │   ├── Feature and vertex counts shown before use
│   │   └── A failed assignment leaves nothing half-added
│   ├── World countries, ready to use
│   │   ├── One audited country set, beside imported boundaries in the same picker
│   │   ├── Joins on ISO alpha-3 or numeric code; country names for display only
│   │   └── Source, version, and terms visible; a saved copy never changes on catalog update
│   └── Content controls (one compact popover)
│       ├── Data marks: show, opacity, data labels from a field
│       ├── Reference boundaries beneath points: any shared asset, nonselectable, off by default
│       └── Background: land, graticule, none, or a street preset when the host supplies one
├── EVALUATE BEFORE COMMITTING
│   └── Street context background
│       ├── A: raster tiles drawn beneath the existing SVG in Web Mercator
│       ├── B: Leaflet raster with the analytical SVG as an overlay
│       └── C: MapLibre vector, only if independent street-label control proves necessary
└── LATER POSSIBILITIES
    ├── More national or regional packs, chosen from real dashboards
    ├── Clusters, heatmaps, classed scales
    └── Several analytical layers; detailed-map image export
```

## Behavior

| Situation                                          | Expected result                                                                                |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Click empty map space                              | This map's filters clear. Alt-click, a pan, and other charts' filters are unaffected.          |
| Hide data marks while records are selected         | The filter stays and stays visible in the chart header.                                        |
| Change background, reference boundaries, or labels | Filters, joins, and saved view meaning do not change.                                          |
| Change mode or join field                          | The map's filters clear, as today, and the panel says so.                                      |
| Street tiles fail or no preset exists              | Data draws on the plain background with a short notice; selection and keyboard use still work. |
| Saved analysis with countries opened offline       | The saved geometry copy renders; nothing is fetched.                                           |
| Invalid boundary file                              | Nothing is added; the first problems are listed with locations.                                |

## Examples

The World Bank demo currently colors points by region because no country boundaries ship. With the country set it becomes a choropleth (illustrative DSL; syntax unsettled):

```text
chart map @wb-map mode=region geometry=countries featureKey=iso_a3 regionField=country.code aggregation=sum measureField=without_power
```

The service-district demo gains a street background under the same districts and sites, with district outlines as a reference layer beneath points.

## Decisions and boundaries

**Appetite:** Three releases, each shippable alone: (1) selection, values, and import; (2) countries and content controls; (3) street context. No new runtime dependency before release 3, and at most one in it.

**Key decision:** Harden the existing D3/SVG maps first, then add streets. Street context carries every external risk — provider terms, attribution, camera meaning, export rights, and React 18 support — and the first two releases do not need it.

**Key decision:** Add candidate A, which the research did not consider. Drawing raster tiles beneath the current SVG keeps one selection, keyboard, trace, and facet model and adds a tiny dependency. React Leaflet v5 requires React 19, so B would use Leaflet directly. Choose B or C only if A fails the same tasks.

**Boundary:** No geocoding, routing, spatial joins, geometry repair or reprojection, offline street archives, or general layer editor. The library ships no default tile provider; hosts opt in with a preset and attribution. Removing the preset turns street context off without breaking saved charts.

**First proof:** **Try:** On the service-district demo, draw owned local tile fixtures beneath the existing SVG with a Web Mercator projection at 1280, 783, and 390 px and in four facets. **Observe:** points align with streets from city to street zoom; pan and zoom feel acceptable; click, Escape, Alt-click, keyboard, and save/restore behave as before; added bundle size. **Decide:** If alignment holds and pan is acceptable, A becomes the street path and B and C drop out. If not, run the same fixtures through Leaflet before considering MapLibre.

**Open choices:**

1. Should imported boundaries stay in the shared library when a draft closes unsaved? I recommend keeping them; the library already allows unused assets.
2. Should the demo show live OpenStreetMap tiles under light interactive use, or only local fixtures until a provider is chosen?

See the [intent brief](intent-brief.md) and the [research reconciliation](references/research-reconciliation.md).
