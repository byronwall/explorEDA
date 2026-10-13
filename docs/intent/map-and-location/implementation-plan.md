---
title: Useful, configurable maps for location data — implementation plan
slug: map-and-location
phase: plan
status: draft
last_updated: 2026-10-11
---

# Useful, configurable maps — implementation plan

## Plan at a glance

Fix the two suspected selection faults first, because every later milestone builds on map selection. Then prove the riskiest idea, the handoff from the D3 world view to a MapLibre street view, before investing in boundaries and controls. If the handoff fails, only the street releases change. Boundaries, level inference, Locate region, and content controls stay valid with the D3 renderer alone.

Each milestone is one stacked PR that leaves the maps working. The two external pieces each get one seam. MapLibre enters through a host-registered engine: hosts pass the `maplibre-gl` module they installed, so `exploreda` never imports it and bundlers never fail on a missing optional peer. OpenFreeMap enters through a style URL that a host can replace or turn off. Boundaries enter through one registry that serves built-in sets and host-registered packs the same way.

Material pushback: Locate region should be an ordinary calculation function, not a new background job system. With a Flatbush bounds index, a point-in-polygon test touches a handful of candidate polygons. A synchronous pass over 50k rows may be fast enough on the main thread. Measure before adding a worker.

## Implementation strategy

- **First proof:** In milestone 2, the earthquakes demo zooms from the D3 world map into a MapLibre street view with filters and selection intact.
- **Primary seams:** `MapEngine` (host-registered MapLibre module plus style URL), `BoundaryRegistry` (built-in and host packs, lazy loaders), and the existing calculation function registry.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/components/charts/Map` for planners, camera mapping, inference, and lookup; `pnpm dev:agent` for the demo.
- **Local dependencies:** jsdom tests never load MapLibre; they test pure camera, cluster-ID, and fallback logic. Browser checks use the demo with the real `maplibre-gl` installed as a demo dependency.
- **Provider confirmation:** the demo uses the live OpenFreeMap style. Playwright route blocking simulates tile and style failure.
- **Rollout and rollback:** without a registered engine, maps behave as today. Removing the registration or the style URL turns street views off without breaking saved charts.

### Material dependency proof strategy

```text
pure camera and ID mapping (vitest)
    → demo with maplibre-gl and OpenFreeMap in Chromium (pnpm shot, Playwright)
    → blocked-request fallback in Playwright
    → hosts opt in; outline map stays the default
```

No contract suite: OpenFreeMap and MapLibre are proven together in the browser, and the outline fallback carries the risk.

## Milestone 1: Map selection behaves like other charts

The suspected faults are cheap to confirm and they affect every later proof. This milestone adds no new features.

- **Change — failing tests first** in `pointMap.test.tsx` and `regionMap.test.tsx`
  - Draft preview with the same chart ID: Escape must not call `updateChart`.
  - Plain click on empty map space through `MapChart` clears only this map's filters; Alt-click and a pan do not.
- **Change — fixes** in `PointMap.tsx` (guard Escape the way `RegionMap.tsx:170` does) and an empty-space click handler shared by both modes.
- **Change — distinct region states** in `regionMapPlan.ts` and `RegionMap.tsx`
  - Zero, no rows, no valid measure, and unmatched get distinct fills, legend entries, and trace text.
  - Planner test with the research fixture (`10, -6, 0, "6", "bad", "", null, false` → count 8, valid 4, sum 10, average 2.5).

### Desired end state

- Both suspected faults are reproduced, then fixed, by tests.
- Region states read differently without relying on color alone.
- Screenshots at three widths; patch changeset.

## Milestone 2: Street view hands off from the world map (proof)

This milestone proves the shape's riskiest decision on the demo. It ships behind host registration, so no user sees it unless a host opts in.

- **Change — `MapEngine` seam**
  - Add an `ExplorEda` prop or `registerMapEngine(maplibregl)` call, and declare `maplibre-gl` an optional peer dependency.
  - Add `streetStyle` configuration that defaults to OpenFreeMap Positron, plus a dark style that follows the workspace theme.
- **Change — handoff** in `MapChart.tsx`
  - Add pure functions that map the D3 view (`MapView` center and zoom over a fitted Equal Earth world) to MapLibre center and zoom, then back. Unit-test the round trips.
  - Pick a threshold by extent: wide views stay D3; past the threshold, a lazily created MapLibre map draws the basemap with the analytical points as a GeoJSON source keyed by row ID.
  - Selection and Alt-click read row IDs from feature properties, never MapLibre feature IDs. Save the view as a tagged camera so old saves still mean the same thing.
- **Spike — keyboard path over the MapLibre view**
  - Decision required: keep the existing roving focus list over logical points, drawn as an SVG overlay, or a list-based alternative.
  - Evidence: Arrow, Enter, Escape, and Alt-Enter work against the earthquakes data on the street view.
  - Fallback: the street view is pan-only, and keyboard users work on the world view.

### Desired end state

- Earthquakes demo: world → street zoom keeps place, filters, and exact selected row IDs; Escape and empty-space click still work.
- Blocking OpenFreeMap requests shows the outline map with a notice.
- Measured bundle cost of the lazy chunk; decision recorded: handoff, or MapLibre at every extent.
- Minor changeset (opt-in street view for hosts that register MapLibre).

## Milestone 3: Boundary import explains itself

- **Change — validation messages** in `geometryAssets.ts`: report the feature index, ring, and coordinate; show feature and vertex counts in `RegionMapSettings`.
- **Change — no half-added imports:** assign before inserting, or roll back the insert when assignment throws. Imported assets stay in the shared library when a draft closes.
- **Change — join preview:** show typed mismatch samples, duplicate keys, and unmatched row and region counts.

### Desired end state

- Tests with the malformed fixtures from the research (open rings, null geometry, Point, nonfinite).
- A throwing settings callback leaves the asset list unchanged.
- Patch changeset.

## Milestone 4: Countries and US boundaries just work

- **Change — `BoundaryRegistry`**
  - Built-in sets: world-atlas `countries-110m`, us-atlas `states-10m` and `counties-10m` (us-atlas is a new dependency), each a lazy dynamic import.
  - Add a generated ISO bridge (numeric, alpha-3, alpha-2, name) so data with alpha-3 codes joins.
  - Hosts add packs with `registerBoundaryPack({ id, version, levels, load })`.
- **Change — saved reference:** region maps store `{ boundaryId, version }` instead of copying geometry. If a host lacks the pack, the map still draws and names the missing pack. Extend `validateSavedData`.
- **Change — World Bank demo** becomes a country choropleth; the earthquakes demo stays points.

### Desired end state

- Choropleths of countries, US states, and US counties need no import.
- Install growth measured (about 2 MB unpacked for us-atlas); the chunks load only on use.
- DSL keys and setting descriptions for the docs gate; minor changeset.

## Milestone 5: The map picks the level, and points can find their region

- **Change — `inferMapLevel`**, a pure function over field profiles: ISO codes → countries; state names, USPS codes, or 2-digit FIPS → US states; 5-digit FIPS → counties; coordinate extent → points with the matching reference boundaries. The user can override it in settings.
- **Change — Locate region calculation:** add `region(lat, lng, "country" | "us-state" | "us-county")` to the calculation function registry. It uses a Flatbush index per boundary set and is cached per session by boundary set and coordinate. It recomputes once the lazy boundaries load.
  - Points outside every polygon return empty and are counted as unlocated.
- **Change — zoom detail:** zooming into one country switches regions to the finer level when a matching column exists.
- **Spike — Locate region cost**
  - Decision required: main thread or worker.
  - Evidence: 50k earthquake rows against counties, measured in the demo.
  - Fallback: if it takes more than about 200 ms, run the calculation through the existing analysis worker.

### Desired end state

- New region maps open on the right level for the demos with no settings changes.
- A calculation shows quake counts per US state from coordinates alone.
- Minor changeset.

## Milestone 6: Choose what the map shows

- **Change — content popover** following `docs/ui-defaults.md`: data marks (show, opacity), data labels (field and on/off), reference boundaries beneath points (any registered set or asset; nonselectable; off by default), and basemap (outline, streets when an engine is registered, or none). Each control gets a tooltip.
- **Change — filters stay visible** in the header when marks are hidden.

### Desired end state

- Service-district demo: district outlines appear beneath sites, and record labels are distinct from region labels.
- Changing content never changes filters or joins (tests).
- Minor changeset.

## Milestone 7: Crowded points and street export

- **Change — clustering:** use MapLibre GeoJSON clustering on the street view and a d3 quadtree grouping on the world view, so behavior matches across both. Clicking a cluster selects its leaf row IDs.
- **Change — PNG export:** capture the MapLibre canvas under the SVG artboard (`compositionOutput.ts`) with OpenFreeMap, OpenMapTiles, and OpenStreetMap credits. If capture fails, export the outline with a label.

### Desired end state

- 50k earthquakes pan smoothly as clusters, and a cluster click selects the exact rows.
- The exported PNG shows streets, marks, legend, and credits at 1× and 2×.
- Minor changeset.

## Cross-cutting verification

Every milestone ends with screenshots from `pnpm shot` at 1280, 783, and 390 px, plus keyboard selection, inspection, and clearing on the changed map. Run `pnpm check:ui` and the docs gate whenever settings change.

## Open decisions and spikes

1. Keyboard path on the street view (milestone 2), with a pan-only fallback.
2. Locate region on the main thread or in a worker (milestone 5), decided by a 200 ms threshold.

## Below the cut line

- Writing Locate region results back to a store of record
- Boundary packs beyond the defaults (built only when a dashboard needs one), and counties outside the US
- Heatmaps, classed scales, several analytical layers, offline streets
- Tiles we host, address geocoding, routing, geometry repair
