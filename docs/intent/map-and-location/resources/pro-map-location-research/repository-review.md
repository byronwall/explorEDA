# Repository review: map and location

**Research date:** 2026-10-11. **Status:** source audit and research companion; no application implementation. This document is an additional artifact in the research collection.

The verified baseline already supports point maps, polygon region maps, file and pasted GeoJSON, exact typed joins, shared saved geometry, linked selection, and source tracing. The research should improve those capabilities and establish a bounded route to optional street context. It should not propose rebuilding the existing importer or treat a new renderer as an analytical model.

## 1. Repository, baseline, and access

| Item | Verified record |
| --- | --- |
| Repository | [byronwall/explorEDA](https://github.com/byronwall/explorEDA) |
| Selected baseline | [`12bd64d359f03c54a50b1ff97f20f42284cf4dc6`](https://github.com/byronwall/explorEDA/commit/12bd64d359f03c54a50b1ff97f20f42284cf4dc6), “Merge pull request #296 from byronwall/codex/chart-annotation-research” |
| Packet declaration | `SOURCE-MANIFEST.json`, dated 2026-10-11, identifies the exact baseline and planning branch `codex/map-location-intent`. It explicitly describes a selected source packet, not a runnable checkout. |
| Packet integrity | All 44 declared entries are present. The 45th file is the manifest itself. ZIP CRC validation found no bad entry, and extracted bytes match the archive. The manifest does not supply original file hashes; local SHA-256 hashes were computed during verification. |
| Attachment SHA-256 | `cc0adaad275efdc1fbbee09a9ace56ebd5bd1261cbc1c0a4472db0802e906b09` for `exploreda-map-source.zip`. |
| Exact source verification | All 39 baseline-tracked packet files match the GitHub blob SHA at the selected commit. The five map-initiative planning files are packet-only; they are not represented as files present at that commit. |
| Supplemental access | Seven additional files were fetched at the same baseline to resolve parsing, saved types, and chart-wrapper questions. All seven local Git blob hashes match their remote baseline blobs. Their inventory appears below. |
| Remote main at access | [`396fb9ed3e6ce920635e3487c663373db5df0d2a`](https://github.com/byronwall/explorEDA/commit/396fb9ed3e6ce920635e3487c663373db5df0d2a), five commits ahead of the baseline, none behind. |
| Baseline-to-main comparison | The [pinned comparison](https://github.com/byronwall/explorEDA/compare/12bd64d359f03c54a50b1ff97f20f42284cf4dc6...396fb9ed3e6ce920635e3487c663373db5df0d2a) reports four changed paths: a BoxPlot changeset, demo setting descriptions, `BoxPlot.tsx`, and `BoxPlotAxis.test.tsx`. It reports no change to the reviewed map files. This does not substitute main for the selected baseline. |
| Planning-branch access | The remote branch search returned no matching branch. Its name is confirmed by the supplied planning packet, not by a successful remote branch resolution. |

The access records are research evidence, not runtime validation. No repository file was changed, no branch or PR was created, and no dependencies, map services, or credentials were added. The source packet was preserved. All code links in this audit resolve to the immutable selected baseline.

### Evidence language

- **Source fact** means a behavior or structure is present in the inspected code or explicitly stated in the supplied repository documentation. A test assertion is evidence of intended coverage, not a fresh passing result.
- **Inference** means the code supports a likely consequence, with the conditions and remaining uncertainty stated.
- **Proposal** means a later implementation or acceptance proof; it is not existing functionality or a commitment to ship.

## 2. Current chart, content, and camera model

**Source fact — one chart, two analytical modes.** `MapSettings` defines `type: "map"` with `mode: "point" | "region"`; `MapChart` selects `PointMap` or `RegionMap` directly. There is no separate street-map chart type in this source. `validateSettings` requires coordinate fields for point mode, or an asset/key/row-field configuration and a valid aggregation configuration for region mode. See [`definition.ts`][P30] (`MapSettings`, `validateSettings`) and [`MapChart.tsx`][P23] (`MapChart`).

**Source fact — point control exists, but its scope matters.** `MapSettingsPanel` offers latitude, longitude, label, color, size, radius, opacity, projection, geographic center, and zoom. `PointMap` uses the selected label in the point readout, accessibility text, and trace; it does not render persistent point-name text beside every circle. A future point-label visibility or collision policy would therefore be new work. See [`MapSettingsPanel.tsx`][P24] (`MapSettingsPanel`), [`PointMap.tsx`][P29] (`PointMap`), and [`MapTraceBody.tsx`][P36] (`MapTraceBody`).

**Source fact — existing context is a bundled outline.** `worldLand` converts `world-atlas/land-110m.json` with `topojson-client`; `mapPaths` produces land, graticule, and sphere paths. `mapProjection` selects Equal Earth or equirectangular, fits the world into the chart extent, and applies the stored view. These are rendered through SVG by the map components. The land outline is not a selectable country-boundary catalog. The inspected package declares `d3-geo ^3.1.1`, `topojson-client ^3.1.0`, and `world-atlas ^2.0.2`, and declares neither Leaflet nor MapLibre. See [`mapGeometry.ts`][P34] (`worldLand`, `mapPaths`, `mapProjection`), [`PointMap.tsx`][P29], [`RegionMap.tsx`][P21], and the package [`dependencies`][P06].

**Source fact — camera state is geographic, with application-specific zoom.** `MapView.center` is longitude first in geographic degrees; zoom is relative to the fitted world view. `fitMapCoordinates` accounts for the smallest longitude span across the date line. The save validator permits center longitude within ±180, latitude within ±90, and zoom from 1 to 64. This is not already a Leaflet or MapLibre camera contract. See [`definition.ts`][P30] (`MapView`), [`mapGeometry.ts`][P34] (`WORLD_VIEW`, `fitMapCoordinates`), and [`saveDataUtils.ts`][P10] (map branch of chart validation).

**Source fact — camera edits and analytical mode changes differ.** `PointMap.saveView`, region view controls, and `useMapPan` update the view without explicitly clearing the map's filters. `MapToolbar` fits the available source-coordinate extent and resets to the world view; point interaction tests assert selection survives these changes. In contrast, `MapSettingsPanel` deliberately clears filters, view, color field, and color-scale ID when changing point ↔ region mode. Geometry selection/import also clears the previous key, view, and filters. A proposed simple ↔ detailed presentation switch must be defined independently of that existing analytical-mode reset. See [`PointMap.tsx`][P29] (`saveView`), [`RegionMap.tsx`][P21], [`useMapPan.ts`][P32] (`useMapPan`), [`MapToolbar.tsx`][P35], [`MapSettingsPanel.tsx`][P24] (mode `onChange`), and [`RegionMapSettings.tsx`][P28].

**Current-source gap.** The inspected settings and renderers do not offer an independent set of analytical marks, land, graticule, street labels, place labels, and provider-style visibility controls. There is no tile-provider setting, style source, token configuration, street request, or tile-failure state in the selected map path. A compact content model is a proposal grounded in these concrete controls, not evidence that an unrestricted layer editor is necessary. See `MapSettings`, `MapSettingsPanel`, `mapPaths`, `PointMap`, and `RegionMap` in the cited files above.

## 3. Data meaning, selection, and trace seams

| Current-source fact | Symbol-level evidence and implication |
| --- | --- |
| A map snapshot carries separate all-source, chart, filtered, and facet row IDs, selected columns, and a color scale. | [`useMapData.ts`][P26] (`useMapData`) assembles `MapSnapshot`; [`pointMapPlan.ts`][P37] defines it. Preserve these population distinctions when adding content or an adapter. A visible viewport is not a replacement for the analytical population. |
| Coordinate measurements use the common finite-number parser. Numeric strings can be accepted; booleans, blanks, nonnumeric strings, and nonfinite numbers are not valid measurements. Geographic bounds are checked separately. | [`pointMapPlan.ts`][P37] (`coordinateReason`, `planPointMap`) and supplemental [`valueParsing.ts`][S02] (`parseNumber`, `finiteNumber`). Do not substitute permissive JavaScript coercion or silently swap coordinate columns. |
| Point marks retain exact source IDs; overlapping coordinates do not collapse distinct records. Area scaling, a valid zero size, excluded coordinates, and points outside the view have separate handling. | [`pointMapPlan.ts`][P37] (`planPointMap`, `mapPointFilters`) and [`PointMap.tsx`][P29] (`select`, trace resolution, point rendering). `mapPointFilters` operates on source-row identity, not a rendered label. |
| Region joins keep types distinct. A numeric `1`, string `"1"`, and string `"01"` are different keys; finite numbers, strings, and booleans can be joinable. | [`regionMapPlan.ts`][P39] (`regionKey`, `featureValue`, `planRegionMap`) and supplemental [`categories.ts`][S03] (`categoryKey`). Code or name normalization must be explicit upstream work if introduced. |
| Features with the same typed key form one analytical region. Multiple polygon fragments do not imply multiple copies of a source contributor. | [`regionMapPlan.ts`][P39] (`planRegionMap`) groups features before summarizing joined rows. [`RegionMapSettings.tsx`][P28] labels duplicate-key groups in the preview. Preserve intentional mainland/island or multipart territory grouping. |
| Region aggregation supports count, sum, and average, with contributor and exclusion information. Valid zero, no rows in scope, and invalid measure are rendered separately. | [`regionMapPlan.ts`][P39] (`planRegionMap`, aggregation/summarization logic), supplemental [`aggregates.ts`][S01] (`aggregateValues`, `summarizeGroup`, `numericInputs`), and [`RegionMap.tsx`][P21] (region fill states and legend). A renderer must not turn zero into a missing-data color. |
| Selection and inspection are distinct. Marks handle click and keyboard actions; Alt actions inspect source meaning. Region selection uses `regionFilters`, and empty regions inspect rather than creating a misleading selection. | [`PointMap.tsx`][P29] (`select`, circle events), [`RegionMap.tsx`][P21] (`select`, path events), [`regionMapPlan.ts`][P39] (`regionFilters`). A new map library's hit result must resolve back to these source identities. |
| Trace registration is already connected to the current chart and plan revision. Point traces resolve records and exclusions; region traces resolve joins, grouped regions, and contributing rows. | [`PointMap.tsx`][P29] and [`RegionMap.tsx`][P21] (trace-source registration, `resolve`, `findRow`, `targets`), [`mapTrace.ts`][P38], [`regionTrace.ts`][P25], [`MapTraceBody.tsx`][P36], and [`RegionTraceBody.tsx`][P27]. [`useMapData.ts`][P26] (`traceField`) exposes raw/prepared field information and calculation dependencies. |

**Architecture inference.** The planners provide useful reusable analytical seams, but they are not already a general renderer-neutral scene model. The point plan carries projected `x`/`y` and a D3 projection; region planning produces SVG paths and centroids. A second renderer may justify separating the small portion that owns validated coordinates, typed joins, aggregate states, and contributor IDs from screen geometry. The replay intent expressly warns against using an alternative renderer as a reason for a universal scene schema. See [`pointMapPlan.ts`][P37] (`MapPoint`, `planPointMap`), [`regionMapPlan.ts`][P39] (`planRegionMap`), and the replay brief's “Boundaries” below.

## 4. Existing GeoJSON and saved-asset behavior

**Source fact — import already exists.** `RegionMapSettings.importGeometry` handles file text and pasted JSON, parses it, validates it, creates a UUID asset, adds that asset to the shared collection, and selects it. The same panel chooses an existing asset, a source field, `@id` or a property key, count/sum/average, outline width, and optional region labels. Its join preview is explicitly over all source rows and reports unmatched source rows, unmatched regions, duplicate-key groups, and a small typed-key sample. It should be hardened and clarified, not replaced with a proposal to add GeoJSON from scratch. See [`RegionMapSettings.tsx`][P28] (`importGeometry`, join-preview construction).

**Source fact — accepted geometry is a bounded subset.** `isRegionGeometry` accepts a nonempty FeatureCollection of Polygon/MultiPolygon features with supported coordinate arrays, finite longitude/latitude in range, and closed rings. `isGeometryAsset` validates the shared wrapper. It does not establish complete topology validity or impose a file/feature/vertex budget. There is no inspection of self-intersection, hole containment, overlap between separate polygons, or a legacy CRS declaration in this validator. Valid general GeoJSON can therefore still be unsupported by this product. See [`geometryAssets.ts`][P07] (`GeometryAsset`, `isRegionGeometry`, `isGeometryAsset`).

**Source fact — renderer adaptation is separate from stored input.** `regionGeometry` derives geometry with D3-oriented polygon exteriors and holes, using longitude unwrapping for orientation near the date line; `fitRegionGeometry` computes a view from bounds. That is a renderer adaptation, not a general topology repair implementation. Comprehensive pole-enclosing and larger-than-hemisphere correctness has not been established by this review. See [`regionGeometry.ts`][P33] (`orient`, `regionGeometry`, `fitRegionGeometry`).

**Source fact — geometry is shared and serializable.** `GeometryAsset` currently carries `id`, `name`, `source`, and geometry. `DataLayerProvider.addGeometryAsset` validates an asset and replaces one with the same ID. Imports generate fresh IDs; content-based deduplication is not demonstrated. `saveToStructure` includes the entire asset collection, and restoration reads it back. `SavedDataStructure.geometryAssets` is optional for compatibility; map settings refer to `geometryAssetId`. See [`geometryAssets.ts`][P07], [`DataLayerProvider.tsx`][P11] (`addGeometryAsset`, `saveToStructure`, restoration/initialization), and [`SavedDataStructure.ts`][P08].

**Source fact — saved settings already validate map shape and references.** The map branch in `saveDataUtils` checks mode, appropriate region fields/aggregation settings, projection, radius, opacity, and geographic view limits. `validateSavedData` validates geometry assets, rejects duplicate asset IDs, and requires a nonempty region-map asset reference to resolve. Valid unused assets are allowed. `SavedAnalysisStructure` separately records rows plus settings in the `exploreda-analysis` format. These structures do not define a tile service, provider credential, or catalog provenance contract. See [`saveDataUtils.ts`][P10] (chart validation, `validateSavedData`) and [`SavedDataStructure.ts`][P08] (`SavedDataStructure`, `SavedAnalysisStructure`).

**Proposal — extend metadata only when a concrete pack needs it.** Publisher, licence/attribution, source version, geographic reference date, key namespace, preparation steps, and a content hash have no structured fields in the present `GeometryAsset`. A small compatible provenance extension is a candidate; a remote catalog service and a new general asset database are not prerequisites. Keep a supplied geography pack on the same shared-asset save path. The synthetic `serviceDistricts` fixture demonstrates custom territory grouping, while `worldLand` supplies background land; neither proves an authoritative country catalog. See [`geometryAssets.ts`][P07] (`GeometryAsset`), [`regionMapGeometry.ts`][P14] (`serviceDistricts`), and [`mapGeometry.ts`][P34] (`worldLand`).

### DSL and package boundaries

`settingKeys.ts` explicitly enumerates map DSL keys, including mode, coordinate fields, region binding, aggregation, point controls, projection, view, and shared chart settings. `SavedChartSettings` includes ordinary `ChartSettings` through its type union, with a separate serialization adaptation for the 3D chart. Adding a map setting requires reconciliation across `MapSettings`, defaults/validation, the settings UI, the map DSL key list, and saved-data validation; the inspected files alone do not prove an end-to-end DSL import/export round trip for a new field. See [`settingKeys.ts`][P12] (map key list), [`definition.ts`][P30], [`saveDataUtils.ts`][P10], and supplemental [`SavedDataTypes.ts`][S05] (`SavedChartSettings`).

`DASHBOARD_COVERAGE.geometryAssets` in [`settingKeys.ts`][P12] explicitly excludes asset bodies from dashboard DSL text; the host supplies them to compilation. A saved analysis includes shared geometry through `saveToStructure` / `saveAnalysisToStructure`, while text DSL alone is not a complete geometry archive. See [`DataLayerProvider.tsx`][P11] and [`SavedDataStructure.ts`][P08].

The package exposes `./core` and `./charts/*` entry points and supports React 18 or 19 as peers. These are concrete integration constraints for an optional renderer. They are not bundle-size or tree-shaking measurements. The package scripts include a lean-bundle verifier, but it was not run in this research. See package [`exports`, `peerDependencies`, and `scripts`][P06].

## 5. Focused source risks and smallest proofs

These findings are independent of the eventual renderer choice. They do not claim reproduced browser failures.

### 5.1 Plain empty-space clearing: component omission confirmed

**Source fact.** `docs/ui-defaults.md` requires a plain click in empty plot space to clear that chart's filters, while drag/brush and Alt-click must not clear. `PointMap` has SVG pointer-pan and Escape handlers but no background `onClick`. `RegionMap` responds to a background click only for Alt inspection of joins. Both maps handle mark clicks themselves. See [`ui-defaults.md`][P05] (empty plot interaction rule), [`PointMap.tsx`][P29] (`PointMap` SVG events), and [`RegionMap.tsx`][P21] (`RegionMap` SVG events).

**Bounded inference.** The reviewed direct wrappers do not explicitly supply the missing empty-space action: `MapChart` chooses the map component; `ChartRenderer` instantiates the registered component; `PlotChartPanel` supplies a clear-filter button and C shortcut. `BaseChart` has an `onClearPlot` mechanism, but the maps do not mount that component. However, `PlotChartPanel` spreads imported axis-interaction handlers, and `FacetContainer` internals were not part of this review. Do not claim that no possible ancestor can ever clear filters. See [`MapChart.tsx`][P23], supplemental [`ChartRenderer.tsx`][S07], [`PlotChartPanel.tsx`][S06], and [`BaseChart.tsx`][S04] (`BaseChart`, `onClearPlot`).

**Proposed proof.** Mount the real ordinary chart panel with an active map filter and another active chart filter. Perform pointer-down/up/click on empty map background. Only the map's filter should clear. Repeat with Alt-click and a pan beyond the movement threshold; neither should clear. Confirm the faceted path separately. A small real-browser check is needed to settle hit targeting and ancestor handlers.

### 5.2 Same-ID point preview Escape: inconsistent guard confirmed

**Source fact.** `BaseChartProps.onSettingsChange` documents draft previews that edit settings without changing a saved chart. `PointMap` uses that callback for camera changes and routes normal preview selection to inspection, but its SVG Escape handler unconditionally calls the live `updateChart(settings.id, { filters: [] })`. `RegionMap` guards the same action with `!onSettingsChange`. `useMapData` does not isolate the live action, and provider `updateChart` updates an existing saved chart with a matching ID. See [`ChartTypes.ts`][P09] (`BaseChartProps`), [`PointMap.tsx`][P29] (Escape handler, `saveView`, `select`), [`RegionMap.tsx`][P21] (Escape handler), [`useMapData.ts`][P26], and [`DataLayerProvider.tsx`][P11] (`updateChart`).

**Conditional inference.** A point preview sharing the saved chart's ID can clear the saved filter if Escape reaches this handler. Actual product preview reachability and interception by surrounding UI have not been established. The existing `DraftMap` test uses `id: "preview"` against saved chart `"map"`, and does not send Escape; it cannot prove same-ID Escape safety. See [`pointMap.test.tsx`][P22] (`DraftMap`, preview test).

**Proposed proof.** Give a saved point chart a nonempty filter, mount a same-ID preview with `onSettingsChange`, focus a point, and press Escape. Saved settings and selected source IDs must remain unchanged. Run the equivalent region preview as a control, then inspect the real preview caller before labeling this a reproduced product regression.

### 5.3 GeoJSON insertion and settings assignment: two-step mutation confirmed

**Source fact.** Parsing and geometry validation precede all import mutation. On valid input, `importGeometry` calls `addAsset(asset)` before `onSettingsChange`. If that callback throws synchronously, the catch displays an error without rolling back the inserted shared asset. A staged settings callback also receives an asset already inserted into live shared state. `saveToStructure` saves the full asset collection. See [`RegionMapSettings.tsx`][P28] (`importGeometry`), [`DataLayerProvider.tsx`][P11] (`addGeometryAsset`, `saveToStructure`), and [`saveDataUtils.ts`][P10] (`validateSavedData`).

**Design uncertainty.** Reusable assets can legitimately outlive a chart; unused assets are not automatically corruption. Normal settings apply live with an edit-session reset under the UI defaults. Define the intended failure, reset, and draft-retention behavior before prescribing automatic deletion. The region test loads an asset directly through its fixture button, not through the file/paste settings importer. See [`ui-defaults.md`][P05], [`RegionMapSettings.tsx`][P28] (reuse help text), and [`regionMap.test.tsx`][P31] (`Workspace`).

**Proposed proof.** Cover invalid JSON/rings with no state change; valid input plus a throwing settings callback; valid import followed by draft abandonment/reset; and the same geometry imported twice. Decide expected asset retention for each. A delayed `file.text()` completion after editor/settings change is an additional race fixture, not a demonstrated failure.

## 6. Tests inspected, not executed

The selected files contain **three point-map tests and two region-map tests**. They were read as source. The packet is not a runnable checkout; no test, type-check, build, UI acceptance command, or bundle benchmark was executed during this research.

| Source test | Assertions inspected and practical limit |
| --- | --- |
| [`pointMap.test.tsx`][P22] — `keeps coordinate validity, area scaling, antimeridian fitting, and facet membership exact` | Exercises invalid/missing/out-of-range coordinates, sizing including zero, fit near the date line, and facet/source membership. It is not exhaustive geographic or large-data validation. |
| Same file — `selects exact overlapping rows, traces exclusions, and keeps selection through view changes and save` | Exercises distinct overlapping source rows, selection/keyboard and Alt trace, exclusions, fit/reset selection retention, and saved-settings checks. It does not prove plain empty-space clearing in the full panel. |
| Same file — `edits a map preview without changing saved charts or filtering workspace rows` | Exercises preview zoom/reset and inspection with a distinct preview ID. No Escape assertion and no same-ID saved chart are present. |
| [`regionMap.test.tsx`][P31] — `joins typed keys once, preserves metric states and holes, and fits date-line polygons` | Exercises numeric/string key distinctions, grouped feature keys, hole and MultiPolygon fixtures, aggregate states, and date-line fitting. It does not establish a complete topology validator or pole/hemisphere behavior. |
| Same file — `selects exact joined rows, traces unmatched inputs, and restores shared geometry` | Exercises exact joined membership, trace, unmatched input, empty regions, and saving/restoring shared geometry. Asset loading in the fixture bypasses the settings importer. |

The packet's `references/repository-baseline.md` lists the future commands for targeted map tests, type checking, the demo, and broader repository checks. Those commands are available handoff guidance, not completed gates. Browser accessibility, pointer behavior, facets, provider failure, export, and performance need their respective proposed proofs before implementation acceptance.

## 7. Adjacent intent constraints

| Inspected intent or contract | Constraint carried into this research |
| --- | --- |
| Packet-only map intent, “What matters most” and “Boundaries” | Improve useful dashboard maps, control rendered content, harden existing GeoJSON, supply useful geography, and allow detailed local context. Remain feasible for a personal developer. No implementation, paid service, deployment, routing, arbitrary CRS, spatial database, or full GIS is authorized. The later explicit user instruction also rules out repository changes in this handoff. |
| [`composed-analytical-graphics/intent-brief.md`][P18], “What matters most” and “Boundaries” | Keep population, filter policy, and display window distinct; preserve source-record links and saved output; hold scales/colors stable through filtering unless the author opts into rescaling. The brief records a composition PNG acceptance result. That result does not establish map or tile export behavior. |
| [`renderer-independent-replay/intent-brief.md`][P19], “Boundaries” and “Expansion trigger” | Separate semantic agreement from matching pixels. Do not equate positional row IDs with durable cross-reload source identity. Avoid a universal scene schema, compiler platform, or chart rewrite. Extract only the small contract justified by an actual alternative-renderer or export proof. |
| [`network-and-edge-flow/intent-brief.md`][P20], “Boundaries” and “Expansion trigger” | Explicit edge identity and contributor meaning precede graph geometry. This is a separate future input-contract seed; it does not authorize geographic routes, inferred trajectories, or flow conservation for arbitrary links in map scope. |
| [`docs/ui-defaults.md`][P05] and [`docs/agent-guide.md`][P04] | Respect established settings, selection, inspection, accessibility, and proof conventions. A research recommendation must reconcile a desired interaction with the actual current component rather than treat documentation as observed runtime behavior. |

## 8. Review limits

This audit covers the complete selected packet and seven justified supplemental files, not every import transitively reachable from the application. It does not establish a clean runnable build, current production deployment behavior, full ancestor event handling, or end-to-end DSL/host callbacks. The five authored planning documents are intent evidence; the tracked code is baseline implementation evidence.

No live third-party tiles were requested by the application, no renderer integration was built, and no export path was exercised. SVG output in a component does not prove that a map containing remote raster tiles or WebGL content will copy, export, or retain attribution correctly. No compressed bundle, geometry payload, heap, render-time, or request-volume measurements were made. Dependency ranges identify the declared baseline, not a newly resolved installed version.

The source supports improving an existing dashboard-map system. The separate research report weighs product and provider evidence; this audit supplies the concrete preservation requirements, extension seams, and falsifiable risks against which those recommendations should be judged.

## 9. Complete reviewed-file inventory

All paths below are relative to the repository or selected packet root. `P01`–`P44` retain the packet manifest order, even where grouped for readability. The five packet-only files have no fabricated GitHub baseline links. `SOURCE-MANIFEST.json` is packet metadata in addition to these 44 declared entries.

### Repository instructions and packages — 6 files

| Ref | Reviewed path | Review purpose |
| --- | --- | --- |
| P01 | [AGENTS.md][P01] | Repository working instructions. |
| P02 | [README.md][P02] | Product/package entry points and existing capability description. |
| P03 | [package.json][P03] | Workspace scripts and package coordination. |
| P04 | [docs/agent-guide.md][P04] | Agent workflow and repository proof expectations. |
| P05 | [docs/ui-defaults.md][P05] | UI defaults, selection/inspection, settings, and empty-plot contract. |
| P06 | [packages/explorEDA/package.json][P06] | Declared renderer/data dependencies, React peers, exports, and package checks. |

### Map components, plans, traces, and tests — 19 files

| Ref | Reviewed path | Review purpose |
| --- | --- | --- |
| P30 | [packages/explorEDA/src/components/charts/Map/definition.ts][P30] | MapSettings, MapView, defaults, configuration validation, and filter definition. |
| P23 | [packages/explorEDA/src/components/charts/Map/MapChart.tsx][P23] | Point/region component dispatch. |
| P24 | [packages/explorEDA/src/components/charts/Map/MapSettingsPanel.tsx][P24] | Map field/style/view controls and analytical-mode reset behavior. |
| P28 | [packages/explorEDA/src/components/charts/Map/RegionMapSettings.tsx][P28] | Existing file/paste importer, shared picker, typed join preview, and region controls. |
| P29 | [packages/explorEDA/src/components/charts/Map/PointMap.tsx][P29] | Point SVG renderer, exact-row interaction, camera, and trace registration. |
| P21 | [packages/explorEDA/src/components/charts/Map/RegionMap.tsx][P21] | Region SVG renderer, interaction, state legend, and trace registration. |
| P35 | [packages/explorEDA/src/components/charts/Map/MapToolbar.tsx][P35] | Point map zoom/fit/reset, omitted/offscreen inspection, and size legend. |
| P37 | [packages/explorEDA/src/components/charts/Map/pointMapPlan.ts][P37] | Point eligibility, projection, sizing, snapshot types, and exact-ID selection filters. |
| P39 | [packages/explorEDA/src/components/charts/Map/regionMapPlan.ts][P39] | Typed joins, grouped features, region metrics, contributors, and selection filters. |
| P34 | [packages/explorEDA/src/components/charts/Map/mapGeometry.ts][P34] | Bundled land, graticule, projections, and point-coordinate fit. |
| P33 | [packages/explorEDA/src/components/charts/Map/regionGeometry.ts][P33] | Derived D3 region geometry, winding adaptation, and fit. |
| P26 | [packages/explorEDA/src/components/charts/Map/useMapData.ts][P26] | MapSnapshot construction, live actions, and trace-field provenance. |
| P32 | [packages/explorEDA/src/components/charts/Map/useMapPan.ts][P32] | Region pointer-pan thresholds, click suppression, and camera persistence. |
| P38 | [packages/explorEDA/src/components/charts/Map/mapTrace.ts][P38] | Point/background trace types/helpers. |
| P25 | [packages/explorEDA/src/components/charts/Map/regionTrace.ts][P25] | Region trace types/helpers. |
| P36 | [packages/explorEDA/src/components/charts/Map/MapTraceBody.tsx][P36] | Point/source-field and exclusion trace presentation. |
| P27 | [packages/explorEDA/src/components/charts/Map/RegionTraceBody.tsx][P27] | Region join/contributor trace presentation. |
| P22 | [packages/explorEDA/src/components/charts/Map/pointMap.test.tsx][P22] | Three point-map source tests, inspected and not run. |
| P31 | [packages/explorEDA/src/components/charts/Map/regionMap.test.tsx][P31] | Two region-map source tests, inspected and not run. |

### Shared data, types, persistence, and DSL — 6 files

| Ref | Reviewed path | Review purpose |
| --- | --- | --- |
| P07 | [packages/explorEDA/src/lib/geometryAssets.ts][P07] | GeometryAsset and the supported geometry/asset validators. |
| P08 | [packages/explorEDA/src/types/SavedDataStructure.ts][P08] | Saved workspace and analysis structures, including shared geometry. |
| P09 | [packages/explorEDA/src/types/ChartTypes.ts][P09] | Chart settings/types and draft-preview callback contract. |
| P10 | [packages/explorEDA/src/utils/saveDataUtils.ts][P10] | Saved chart, asset, reference, and analysis validation/serialization. |
| P11 | [packages/explorEDA/src/providers/DataLayerProvider.tsx][P11] | Live row/filter state, chart actions, geometry insertion, and save/restore. |
| P12 | [packages/explorEDA/src/lib/dsl/settingKeys.ts][P12] | Explicit accepted map DSL setting keys. |

### Demo and product documentation — 5 files

| Ref | Reviewed path | Review purpose |
| --- | --- | --- |
| P13 | [apps/demo/src/demos/dashboardSettings.ts][P13] | Dashboard map examples and settings. |
| P14 | [apps/demo/src/demos/regionMapGeometry.ts][P14] | Synthetic serviceDistricts GeoJSON, including grouped feature keys. |
| P15 | [apps/demo/src/demos/analyses/earthquakes.ts][P15] | Worldwide point-map analytical example. |
| P16 | [apps/demo/src/demos/analyses/worldbank.ts][P16] | Country-comparison data settings and source field/code expectations. |
| P17 | [apps/demo/src/docs/pages/map.mdx][P17] | Published map instructions and product claims to reconcile with source. |

### Adjacent tracked intent — 3 files

| Ref | Reviewed path | Review purpose |
| --- | --- | --- |
| P18 | [docs/intent/composed-analytical-graphics/intent-brief.md][P18] | Composition, stable domains, source trace, and export boundaries. |
| P19 | [docs/intent/renderer-independent-replay/intent-brief.md][P19] | Semantic replay limits and renderer-neutral architecture restraint. |
| P20 | [docs/intent/network-and-edge-flow/intent-brief.md][P20] | Separate future edge-input contract and scope limits. |

### Packet-only map initiative — 5 files

| Ref | Reviewed path | Review purpose |
| --- | --- | --- |
| P40 | `docs/intent/map-and-location/initiative-map.json` | Packet-only initiative metadata. |
| P41 | `docs/intent/map-and-location/chatgpt-pro-map-research-prompt.md` | Packet-only detailed research scope and deliverable gates. |
| P42 | `docs/intent/map-and-location/intent-brief.md` | Packet-only original map/location intent; authoritative research brief. |
| P43 | `docs/intent/map-and-location/references/user-request.md` | Packet-only original user-request evidence. |
| P44 | `docs/intent/map-and-location/references/repository-baseline.md` | Packet-only baseline review and suggested future verification commands. |

### Supplemental remote baseline source — 7 files

These files were outside the attachment manifest and were retrieved only to resolve concrete source questions at the same immutable baseline. They are additional read-only evidence, not application changes.

| Ref | Reviewed path | Reason for supplemental read |
| --- | --- | --- |
| S01 | [packages/explorEDA/src/lib/aggregates.ts][S01] | Shared numeric exclusion and aggregate-display helpers. |
| S02 | [packages/explorEDA/src/lib/valueParsing.ts][S02] | Exact numeric parsing and finite/missing semantics. |
| S03 | [packages/explorEDA/src/lib/categories.ts][S03] | Type-preserving category keys and labels. |
| S04 | [packages/explorEDA/src/components/charts/BaseChart.tsx][S04] | Existing plot-clear shell, and whether maps mount it. |
| S05 | [packages/explorEDA/src/types/SavedDataTypes.ts][S05] | SavedChartSettings and serialization boundary. |
| S06 | [packages/explorEDA/src/components/PlotChartPanel.tsx][S06] | Ordinary panel, clear control/shortcut, facets, and inherited-handler limits. |
| S07 | [packages/explorEDA/src/components/charts/ChartRenderer.tsx][S07] | Direct registry renderer dispatch and absence of an explicit clear wrapper. |

### Immutable code references

[P01]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/AGENTS.md
[P02]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/README.md
[P03]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/package.json
[P04]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/agent-guide.md
[P05]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/ui-defaults.md
[P06]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/package.json
[P07]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/geometryAssets.ts
[P08]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/types/SavedDataStructure.ts
[P09]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/types/ChartTypes.ts
[P10]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/utils/saveDataUtils.ts
[P11]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/providers/DataLayerProvider.tsx
[P12]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/dsl/settingKeys.ts
[P13]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/apps/demo/src/demos/dashboardSettings.ts
[P14]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/apps/demo/src/demos/regionMapGeometry.ts
[P15]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/apps/demo/src/demos/analyses/earthquakes.ts
[P16]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/apps/demo/src/demos/analyses/worldbank.ts
[P17]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/apps/demo/src/docs/pages/map.mdx
[P18]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/intent/composed-analytical-graphics/intent-brief.md
[P19]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/intent/renderer-independent-replay/intent-brief.md
[P20]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/intent/network-and-edge-flow/intent-brief.md
[P21]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/RegionMap.tsx
[P22]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/pointMap.test.tsx
[P23]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/MapChart.tsx
[P24]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/MapSettingsPanel.tsx
[P25]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/regionTrace.ts
[P26]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/useMapData.ts
[P27]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/RegionTraceBody.tsx
[P28]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/RegionMapSettings.tsx
[P29]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/PointMap.tsx
[P30]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/definition.ts
[P31]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/regionMap.test.tsx
[P32]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/useMapPan.ts
[P33]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/regionGeometry.ts
[P34]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/mapGeometry.ts
[P35]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/MapToolbar.tsx
[P36]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/MapTraceBody.tsx
[P37]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/pointMapPlan.ts
[P38]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/mapTrace.ts
[P39]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/regionMapPlan.ts
[S01]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/aggregates.ts
[S02]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/valueParsing.ts
[S03]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/categories.ts
[S04]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/BaseChart.tsx
[S05]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/types/SavedDataTypes.ts
[S06]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/PlotChartPanel.tsx
[S07]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/ChartRenderer.tsx
