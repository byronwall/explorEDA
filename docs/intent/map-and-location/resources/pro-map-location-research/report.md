# Useful maps for explorEDA

Research date: **2026-10-11**. **GO for research handoff; implementation and renderer acceptance remain pending.** This report answers the five requested questions using the supplied intent, verified source and official documentation. All new product behavior below is a proposal. The complete comparison, catalog, decisions, source audit and proofs accompany this report.

## Executive recommendation

1. **Harden the analytical maps already present.** Preserve exact source selection, typed region joins, shared assets, trace, stable scales and distinct metric states. Improve import diagnostics and close interaction gaps before adding another rendering engine. This is the highest-confidence work because it strengthens existing dashboard jobs. See **MAP-001–004, MAP-008 and MAP-012** in [recommendations.json](recommendations.json).
2. **Expose a small set of content controls and one audited country pack.** Separate analytical marks, reference boundaries, basemap context and labels. Keep point and region analytical modes. Permit one reference-boundary overlay for points after a small proof; defer a general layer composer. Select one versioned country asset after a key and provenance audit, then add regional packs only for demonstrated demand. See **MAP-005–007**.
3. **Retain D3/SVG as the default and compare two candidates for one optional street renderer.** Test Leaflet with raster presets against MapLibre with a curated vector style. Select on local-map legibility, required label control, analytical fidelity and total maintenance cost. Neither is selected by this research. Provider permissions, accessibility, portable state and export are gates, not follow-on polish. See **MAP-009–011, MAP-014**.

This sequence can deliver useful improvements even if external context fails its proof. The durable requirement is recognizable local context where needed; “simple versus detailed,” Leaflet and a particular catalog remain implementation hypotheses from the initial intent.

## Evidence and access

The attached manifest identifies repository [byronwall/explorEDA](https://github.com/byronwall/explorEDA), baseline [`12bd64d359f03c54a50b1ff97f20f42284cf4dc6`](https://github.com/byronwall/explorEDA/commit/12bd64d359f03c54a50b1ff97f20f42284cf4dc6) and local planning branch `codex/map-location-intent`. All **44 declared packet files plus the manifest** were present. All **39 tracked source files** matched GitHub blob hashes at the exact baseline; five new initiative files were reviewed as packet-only planning material. Seven supplementary files were retrieved at that same ref.

Remote `main` was pinned to [`396fb9ed3e6ce920635e3487c663373db5df0d2a`](https://github.com/byronwall/explorEDA/commit/396fb9ed3e6ce920635e3487c663373db5df0d2a), five commits ahead. The pinned comparison changes four box-plot-related paths and no map implementation paths. No matching remote planning branch was returned. The assessment remains a **selected-source review with exact-ref remote verification**, not a runnable checkout or browser acceptance result. [repository-review.md](repository-review.md) and [verification.json](verification.json) record the evidence and limitations.

Current source facts are labelled or linked to immutable repository paths and symbols. External capability claims use IDs in [sources.md](sources.md). An unknown in the matrix means the reviewed evidence did not establish support; it does not mean absence. Product documentation, API availability and actual explorEDA behavior are different evidence levels.

## 1. What should an ordinary dashboard user be able to do?

### Jobs and the initial product

| User job | Concrete dashboard | Recommended first behavior | What stays below the cut line |
| --- | --- | --- | --- |
| Compare worldwide regions | A single-year country indicator with a bar chart and table | Choose a country pack and explicit code field; reconcile coverage; color a suitable metric; select a region's source rows | Automatic country-name geocoding, silently filling missing countries, global administrative hierarchy |
| Understand local sites | Service sites within a city, sized by requests and colored by status | Exact coordinate marks, readable names on focus/inspection, optional approved street context, saved local view | Routing, travel-time areas, address search infrastructure |
| Analyze custom territories | Service districts with a mainland and island under one key | Import polygon geometry, inspect typed joins, aggregate once per logical district, trace contributors | Boundary drawing, automatic dissolve/repair, spatial containment joins |
| See geographic distribution | Recorded earthquakes linked to depth and magnitude charts | Point styling, coordinate exclusions, stable scales and explicit overlap | Inferring risk or exposure from event count alone |
| Resolve dense locations | Many records at the same site | Accessible exact-row access; measure overlap and rendering costs | Default clustering, jittered coordinates or an unexplained heat surface |
| Filter a dashboard geographically | Select a site or territory to update adjacent charts | Preserve chart-owned filters, facet scope, trace targets and exact contributors | Renderer hit counts used as analytical counts |

**Current source:** these jobs have useful starting points. `pointMapDashboard`, `regionMapDashboard`, `serviceDistricts`, the earthquake DSL and the World Bank analysis demonstrate points, linked charts and synthetic districts. World Bank capital coordinates locate capital points; they are not country coverage. Its country codes include alpha-3-like strings, so a country choropleth is a new, audited join proposal. [dashboardSettings.ts](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/apps/demo/src/demos/dashboardSettings.ts), [regionMapGeometry.ts](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/apps/demo/src/demos/regionMapGeometry.ts), [earthquakes.ts](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/apps/demo/src/demos/analyses/earthquakes.ts), [worldbank.ts](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/apps/demo/src/demos/analyses/worldbank.ts).

### What the broad sweep contributes

The [capability matrix](capability-matrix.csv) covers **10 families / 11 entries × 18 dimensions = 198 rows**. It includes map types, layers, reference boundaries, context, labels, legends, classification, point sizing, density, custom geometry, joins, supplied geography, tooltips, linked interaction, navigation, accessibility, persistence and export. A BI authoring control and a chart-library API have different integration costs; feature totals are not a ranking.

| Comparator | Useful pattern and its limit | Primary evidence |
| --- | --- | --- |
| Tableau | Independent layer visibility, order and selectability. Hidden marks leave selections, so explorEDA must define its own visibility invariant. | PROD-TAB-01, 07 |
| Power BI Azure Maps | Rich context and data-bound reference geometry. Its current support table excludes Power BI export/subscriptions; reference binding chooses a property by match count. | PROD-AZ-01, 03 |
| Power BI Shape map | Custom-region reporting without street-map dependence. Current documentation supports GeoJSON **and** TopoJSON, upload or URL, with key inspection. | PROD-SH-01 |
| Looker Studio / Data Studio | Explicit map presets and background detail. Current Google documentation redirects to Data Studio; deployment and map loads have their own constraints. | PROD-LS-01–03 |
| Apache Superset | Host map configuration, subdivision assets and saved chart layers. Fine-grained controls remain partly unknown in the reviewed Next documentation. | PROD-SU-01–05 |
| Metabase | A narrow pin/grid/region model and separate region key/display name. URL-based custom regions and tooltip loss in tiled pins show the cost of simplifying delivery. | PROD-MB-01, 02 |
| Apache ECharts | Geographic chart marks, visual mapping and ARIA primitives. Host filtering, state and map-specific export require separate evidence. | PROD-EC-01–05 |
| Plotly.js | Outline and tile maps, events, clustering and camera retention in one chart API. These do not automatically supply explorEDA's contributor semantics. | PROD-PL-01–09 |
| Vega / Vega-Lite | Declarative shapes, lookups, facets and host signal/view-state APIs. Loading an example boundary file does not establish a managed catalog. | PROD-VG-01–08 |
| Observable Plot | Compact geographic rendering and accessibility attributes. The reviewed guide leaves direct selection under development and pan/zoom as future work. | PROD-OB-01–04 |
| kepler.gl | Density, layered exploration and explicit data/configuration export. Its breadth is a useful scope boundary for a small embedded dashboard library. | PROD-KP-01–09 |

The transferable themes are clear control, inspectable joins and honest interaction/export contracts. None requires copying a GIS workbench. Detailed version restrictions, unknowns, dates and exact official URLs are retained row by row in the CSV and source ledger.

## 2. How should users control what renders?

### A bounded model

**Current source:** one `MapSettings` model selects Point or Region, and `MapChart` renders one analytical family. Point labels currently supply identity in accessible names/readouts/trace; they are not persistent SVG text. Region labels render the join key at a centroid. [definition.ts: MapSettings](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/definition.ts), [MapChart.tsx: MapChart](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/MapChart.tsx), [PointMap.tsx: PointMap][point-component], [RegionMap.tsx: RegionMap][region-component].

**Proposal, MAP-005:** use a few named content groups, not arbitrary layers. The simpler “Outline / Streets” switch alone cannot express whether boundaries or data labels should appear; an unrestricted composer adds ordering, joins and selection rules for every layer. This middle scope supports the stated jobs at moderate settings and test cost.

| Content | Controls and defaults | Interaction and scope |
| --- | --- | --- |
| Analytical marks | Point or Region; existing color/size/opacity; visible by default | Exactly one analytical family initially. A visibility control, if included, preserves filters and exposes a “selected data hidden” state. |
| Reference boundaries | None or one shared geometry asset; restrained outline, optional subtle fill | Initially useful under point sites. Nonselectable context, no second metric or spatial join. |
| Basemap context | None, Land, or host-approved Streets preset | Land default for worldwide/regional comparisons. Street context opt-in for local work. |
| Data labels | Point names on hover/focus/readout; optional selected labels only after proof. Region labels off by default; independent display property | Join key remains exact. Do not add a label collision engine before the selected-label job warrants it. |
| Street/place labels | Curated labelled/quiet preset for raster; limited symbol controls for a supported vector style | These are provider context, distinct from data labels. Do not display a switch that cannot affect baked raster text. |

Use a fixed drawing order: context, reference boundaries, analytical marks, selection/focus emphasis, data labels. Keep provider attribution visible. Show the encoding, domain and units in the legend/readout, distinguish empty and invalid styles, and keep unmatched-row counts in the coverage readout. A thematic region fill over streets requires a legibility proof because opacity changes perceived color. Arbitrary reordering, multiple independent analytical datasets and blended density layers remain deferred. Existing seams are `MapSettings`, `MapSettingsPanel`, `RegionMapSettings`, `PointMap` and `RegionMap`; the proof should add only settings that these jobs actually use. [PROD-TAB-01, PROD-PL-02, REN-011, REN-019](sources.md)

### Invariants and gestures

Presentation changes must preserve the selected source IDs, typed region keys, aggregation inputs/denominators, color domain, unmatched reasons and trace identity. Hidden/offscreen marks remain discoverable through a readout or source list. **Changing analytical mode, geometry or join key is different:** current settings handlers deliberately clear certain filters/view/color settings. Preserve or explicitly redesign that workflow; do not promise that every setting change is presentation-only. [MapSettingsPanel.tsx: mode handler](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/MapSettingsPanel.tsx), [RegionMapSettings.tsx: importGeometry and asset/key handlers][region-settings].

Keep click for exact selection, Alt-click/Alt-Enter for trace, and drag for navigation. Plain empty space should clear only the map's own selection; dragging, cancelled pointers and context controls must not clear it. Current map components lack a plain background clear handler, and PointMap's Escape handler bypasses the draft callback guard used by RegionMap. These are source-level findings; reproduce them inside the actual panel before claiming a browser regression. The existing point preview test uses a different chart ID and does not press Escape. **MAP-002 / P01** targets those narrow gaps. [PointMap.tsx][point-component], [RegionMap.tsx][region-component], [pointMap.test.tsx](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/pointMap.test.tsx).

Retain keyboard mark navigation and visible focus. Add a usable row/region action list for dense or canvas-rendered maps and single-pointer alternatives to dragging, such as pan controls. Keyboard support alone is insufficient for the W3C dragging criterion. Touch must allow page use, selection and navigation without hover or accidental filter changes. Compact viewing should work; full phone authoring is not implied by the desktop authoring contract. [ROOT-001–003](sources.md); [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/ui-defaults.md), `PointMap`, `RegionMap`, `MapToolbar`.

On resize, preserve geographic center/extent as feasible instead of fitting filtered data. Facets should share analytical scales and a documented view policy; avoid independent auto-fit that makes comparisons misleading. Test one and four map panels before enabling multiple WebGL contexts or repeated tile loads. **MAP-011–012 / P05, P08** cover those costs.

## 3. What custom and supplied geography is enough?

### Improve the importer already present

**Current source:** `isRegionGeometry` accepts a nonempty FeatureCollection containing Polygon/MultiPolygon features, finite coordinates within longitude/latitude bounds and closed rings. File/paste import, shared assets and a join preview already exist. The validator returns a boolean and does not establish topology, declared CRS correctness or a safe workload budget. Null geometry, mixed geometry, bare Features and TopoJSON are outside this current import contract. [geometryAssets.ts: RegionGeometry, isRegionGeometry][geometry-assets]; [RegionMapSettings.tsx: importGeometry, join preview][region-settings].

**Proposal, MAP-003:** preserve that useful subset and report precise failure locations: feature, polygon, ring and position. Separate malformed JSON, unsupported type, missing geometry, open/degenerate ring and coordinate problems. Show bounds, feature/vertex counts and property bytes before acceptance. Establish file/feature/vertex budgets by measurement; a file's byte count alone misses expensive geometry and large properties. Commit geometry and settings coherently; the existing state-hold seam may batch host notifications, but does not itself make insertion/assignment atomic. Define whether an abandoned draft retains a deliberately reusable asset before recommending deletion.

Current import inserts the shared asset before calling the settings callback. A synchronous callback failure can leave that insertion behind; ordinary shared-asset reuse is intentional, so an unreferenced asset is not automatically corruption. This is a narrowly scoped atomicity/lifecycle proof, not a reason to add a transaction framework. [RegionMapSettings.tsx: importGeometry][region-settings]; [DataLayerProvider.tsx: addGeometryAsset, holdStateChanges, saveToStructure][provider].

RFC 7946 uses WGS 84 longitude then latitude; valid standard GeoJSON can include null geometry even though this product subset rejects it. Make unsupported cases explicit rather than silently dropping them. Warn on conflicting CRS metadata and ambiguous bounds; never silently swap axes. Catalog reprojection should happen during pack preparation. Preserve original geometry and recorded transforms. [GEO-001](sources.md)

The existing `regionGeometry` makes a derived copy and adjusts winding for D3. That is valuable, but it does not prove hole containment, self-intersections, polar caps or larger-than-hemisphere polygons. Test both projections with holes, multipolygons, cut/uncut antimeridian rings and reversed winding. Validation and renderer adaptation are separate from geometry repair. Automatic repair, arbitrary CRS support and a format-conversion workbench stay outside the initial scope. [regionGeometry.ts: orient, regionGeometry, fitRegionGeometry](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/regionGeometry.ts); [GEO-001, GEO-002](sources.md).

### Joins that can be trusted

**Keep the existing typed contract.** Numeric `1`, string `"1"` and string `"01"` must not silently become equal. Multiple features under the same typed key intentionally form one region, so a mainland and island must not multiply contributors or sums. Extend the all-source join preview with useful mismatched samples, missing-key counts, type distributions and grouped-feature detail. A filtered summary, if added, must be separately labelled. No automatic best-match property, guessed country name or implicit spatial join. **MAP-004 / P03.** [regionMapPlan.ts: regionKey, featureValue, planRegionMap, regionFilters][region-plan]; [RegionMapSettings.tsx: join preview][region-settings].

### One starter pack, with an update owner

The [geography catalog](geography-catalog.csv) evaluates ten candidates, not ten promised releases. **MAP-006** proposes selecting one country pack. World Atlas is the cheapest proof because dependencies already exist; the current context loads its land outline, not a country catalog. Its archived distribution derives from Natural Earth 4.1.0, uses numeric-string IDs and has missing-code exceptions in its build. A fresh Natural Earth Admin 0 110m source currently displays version 5.1.1. Prefer a reproducible fresh pack if its identifier audit and maintenance cost are acceptable; its complete current schema and aliases remain unverified. [mapGeometry.ts: worldLand, mapPaths][map-geometry]; [GEO-003–006](sources.md).

| Candidate group | Recommended place |
| --- | --- |
| One World Atlas or fresh Natural Earth country asset | Compare in the first pack proof; release one version with audited keys and explicit exceptions |
| Census 2025 states/counties | Optional U.S. demand; preserve string GEOIDs and verify selected cartographic-file schema |
| Statistics Canada 2021 provinces/divisions | Optional, deliberately pinned national source; preserve UIDs and convert the published CRS offline |
| ONS May 2025 local authority districts | Optional national source; use LAD25CD, verify notices and fixed WGS 84 export |
| Natural Earth global Admin 1 | Defer: publisher qualifies codes, coverage and maintenance |
| geoBoundaries gbOpen per-country ADM1 | Fallback after provenance/key/licence review; not automatically a national-government authority |

Natural Earth uses a stated territorial representation; statistical units and political boundaries need not coincide. Record whether a pack contains countries, sovereign units or map units. Permit host-supplied replacements without a worldview editor. Do not use simplified display polygons as area denominators or proof of exact containment. Preserve geographic reference date separately from release and preparation dates. Source download sizes in the catalog are not measured browser payload or memory costs. [GEO-005–024](sources.md)

**MAP-007:** reuse `GeometryAsset` and save geometry once per analysis. Add only useful optional provenance: publisher, source/terms links, required notice, version/reference date, key namespaces, preparation steps and content hash. Use an immutable pack version; never silently update saved boundaries. A small opt-in bundle gives offline availability but adds bytes; lazy host-origin assets avoid upfront downloads but need loading/failure states. Prefer lazy acquisition followed by the existing saved-asset behavior, with host-supplied geometry retained as an equal route. Compare compressed payloads before choosing bundling. `geometryAssets` is excluded from dashboard DSL text and must still be supplied by the host; saved analysis portability and text-DSL portability are distinct. [GeometryAsset][geometry-assets], [SavedDataStructure.ts](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/types/SavedDataStructure.ts), [DataLayerProvider.tsx: saveToStructure, restoreFromStructure][provider], [settingKeys.ts: DASHBOARD_COVERAGE.geometryAssets](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/dsl/settingKeys.ts).

## 4. What renderer and basemap arrangement fits?

### Compare mechanisms against the local dashboard job

| Option | Useful capability | Added cost and decision |
| --- | --- | --- |
| Existing D3/SVG | Current projections, local geometry, DOM marks and established analytical plans | Keep default. Density and ordinary image export remain unmeasured/unverified. |
| Leaflet + raster context | Mature tile/pan primitives with SVG/Canvas overlays; suitable for a few fixed street presets | New CSS/lifecycle/camera integration. Baked street labels need a different tileset to change. Prefer if presets fully solve the job. |
| MapLibre + vector context | Curated road/place label layers and styled vector/raster sources | WebGL2, workers, styles, fonts/sprites, picking and accessible alternatives. Prefer only if needed control or measured workload repays that cost. |
| D3 + Canvas | A smaller density experiment using the existing geographic path machinery | Does not supply streets; picking and accessible actions must be rebuilt. Measure first. |
| OpenLayers | Broader format/projection capability | Credible if a concrete projection/format need emerges; current scope does not justify its broader surface. |
| PMTiles / self-hosted tiles | Packaged tile delivery under host control | A delivery mechanism, not an analytical renderer, dataset licence or automatic offline world map. Defer. |

Primary evidence: [REN-001–018, REN-030–034](sources.md). Leaflet's publisher reports a small core download, but no comparable integrated bundle was built here. Do not compare that marketing number with an invented MapLibre total. Measure incremental JS, CSS, workers, styles, glyphs, sprites, initial tiles, heap and repeated-panel cost under the same workload.

Version choice needs explicit attention. Leaflet's download page lists stable 1.9.4, while its unversioned API reference currently identifies a 2.0 alpha. React Leaflet v5 requires React 19; explorEDA's peer contract includes React 18 and 19. A narrow direct integration or a vetted compatible wrapper is an option; a framework upgrade is not a research requirement. MapLibre's current documentation and wrapper setup introduce GPU/worker requirements that must be checked on supported hosts. [packages/explorEDA/package.json](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/package.json); [REN-002, 003, 006–010, 017, 018](sources.md).

**MAP-009:** build only a disposable, common-fixture comparison before choosing at most one optional context engine. Existing point/region plans mix semantic preparation with projection-dependent work. Extract the smallest shared analytical computation needed by that proof. Preserve exact source/region identities outside renderer state; MapLibre queries can return tiled duplicates or fragments and must never determine aggregate counts. Do not introduce a universal scene protocol, plugin platform or two permanent alternative street stacks. [pointMapPlan.ts: planPointMap, mapPointFilters][point-plan]; [regionMapPlan.ts: planRegionMap, regionFilters][region-plan]; [REN-012, 013](sources.md).

**MAP-011:** current `MapView.zoom` multiplies a fitted world scale; tile zoom follows a different convention. Never copy the number directly. Preserve the existing saved view format. If detailed context is accepted, use a separately tagged camera, translating geographic center/extent on first transition and then restoring each saved view. Start without rotation/pitch. Handle antimeridian wrapping and polar coordinates explicitly; an analytically valid point outside a street projection is context-unavailable, not invalid source data. Commit one host history entry per completed gesture. [definition.ts: MapView](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/definition.ts), [mapProjection][map-geometry], [DataLayerProvider.tsx: updateChart, onStateChange][provider]; [REN-002, 010, 014, 020](sources.md).

### Renderer capability is separate from provider capability

Raster tiles arrive as styled images; independent label toggles require separate imagery or overlays supplied under a suitable contract. Vector styles expose layer properties, but the chosen provider's schema determines which roads, places and languages can actually be controlled. A generic “labels off” promise is therefore unjustified. [REN-011, REN-019, REN-020](sources.md)

**MAP-010:** the host configures permitted providers, endpoint/style preset, resource origins, attribution, restricted public browser token and export capability. The dashboard author chooses among approved context presets; the viewer can toggle context or navigate as allowed. Keep secrets out of chart/analysis serialization. Avoid arbitrary end-user service URLs and provider account setup inside the chart.

| Arrangement reviewed on 2026-10-11 | What the evidence establishes | Remaining decision |
| --- | --- | --- |
| OSM Foundation raster service | Attribution, request identification/referer, caching and usage restrictions; no SLA and no bulk/offline download entitlement | It is not an automatic production default for a free renderer. Host must choose a suitable service. |
| OSM Foundation vector service | Separate policy from raster service | Evaluate the actual endpoint and usage; do not transfer one policy to another. |
| MapTiler | Raster/vector offerings and origin-restricted browser keys; cloud terms govern use | Verify the intended plan, permitted export/cache/proxy behavior and notices. No price or entitlement conclusion here. |
| Mapbox | Token restrictions and attribution documentation inspected | Product-terms PDF body was not retrievable. Any claim that a specific use is permitted is stopped pending readable applicable terms. |
| Host-owned/licensed local tiles | Can avoid a runtime third-party tile dependency | Host still owns rights, updates, hosting and cache/size tradeoffs. |

Sources: [REN-021–029, REN-032](sources.md). Software licences and data/service terms are separate. No service was purchased, configured or live-tested.

**Privacy inference:** viewport tile requests reveal an approximate area being viewed to request recipients; vector styles can involve several origins. The proposed overlay path keeps rows and custom geometry local, but network inspection must prove what actually leaves the browser. A proxy changes operational and contractual responsibilities and is not an automatic answer. On tile/style/key/network/GPU failure, keep analysis state and source access usable, expose unavailable context, and offer an explicit outline view. Never show a misleading successful-looking blank map.

### Export is an independent gate

Distinguish saved analysis, text DSL and image output. Existing saved analyses include shared geometry, but ordinary map image export was not established from the selected sources. **MAP-014 / P07** must inspect the owning export path in a runnable checkout and test SVG/local output before tile capture. For detailed images, verify resource completion, CORS, fonts, canvas/WebGL capture, scale, legend, selection and attribution, plus provider permission. A technically capturable image is not evidence of permission. If detailed export cannot pass, offer a clearly labelled local-outline export only after that route passes; never silently omit streets or attribution. [saveDataUtils.ts: validateSavedData][save-utils], [DataLayerProvider.tsx: saveAnalysisToStructure][provider]; [REN-010, 022, 026, 028, 029](sources.md).

## 5. What should hardening prove before expansion?

### Preserve what the analytical plans already get right

`planPointMap` keeps source IDs, reports coordinate/size exclusions, scales point area against a full-source maximum and retains a visible zero-size symbol. `planRegionMap` groups typed keys, records exact contributors, distinguishes empty/invalid/value states and uses stable full-source color bounds. `summarizeGroup` averages valid numeric inputs; its denominator need not equal joined row count. These are inspected implementations, not fresh test passes. **MAP-001, MAP-008 / P03** protect them. [pointMapPlan.ts][point-plan], [regionMapPlan.ts][region-plan], [aggregates.ts: aggregateValues, summarizeGroup](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/aggregates.ts), [RegionTraceBody.tsx](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/RegionTraceBody.tsx).

A useful falsifiable example is four joined rows with measures `10`, `20`, `"bad"`, and `null`: average **15**, valid-input denominator **2**, joined-row count **4**. A region with a valid aggregate of zero, a region with no in-scope rows, an all-invalid region and an unmatched row need different explanations. Current trace already exposes valid inputs; hardening should keep that distinction visible in readouts as well. Avoid a new metric platform.

Choropleths often compare rates or normalized values more fairly than raw totals because geographic units differ in population and size. Totals remain useful for workload allocation when labelled as totals. Use an appropriate prepared measure, unit, population and period; never divide by projected polygon area or silently average rates. A ratio of sums and an unweighted mean of row rates answer different questions. For the country example, require a consistent year/cohort and audited key coverage. [ROOT-004, ROOT-005](sources.md)

Keep continuous, stable scales first. Signed quantities need a meaningful zero reference; filters and facets should not quietly rescale colors. Fixed manual breaks or domains can be a later, narrow addition with legend and trace provenance. Quantiles, Jenks, statistical smoothing, confidence surfaces and automatic rate inference remain deferred. Missingness and coverage are sufficient initial uncertainty cues; the map should not manufacture precision. Existing seams are `planRegionMap`, `RegionTraceBody`, shared color scales and `MapSettings`. **MAP-016.**

### Small proofs with explicit failure rules

[proof-plan.md](proof-plan.md) supplies executable expectations, fixtures and decisions for **P01–P08**. Start with baseline safety, import and analytical truth; then catalog/state; only then renderer/provider and broader acceptance. Accessibility informs every stage and receives an integrated final gate.

For performance, propose a named midrange four-core, integrated-GPU machine with at least 8 GB RAM, a pinned browser, an 800×500 chart and one/four panels. Measure 1k/10k/50k points with overlap and polygon workloads with recorded feature, vertex and property counts. Candidate interaction targets at a declared workload are hypotheses, not product limits or measured results. Include main-thread parsing, geometry planning, selection/filter latency, pan frames, memory, network and save serialization. **MAP-013 / P06.**

Clustering and bins may later explain density, but every aggregate needs an explicit rule and exact contributor access. Coincident-point selection deserves a smaller proof before aggregation; use a deterministic source list or hit chooser, not coordinate jitter. A Canvas/GPU renderer does not itself solve overlap or keyboard access. **MAP-015.**

Use locally owned deterministic raster/vector fixtures first. A real-provider check is still required for street/place legibility, attribution, token restrictions, request destinations, availability and permitted export. If either candidate changes analytical results, loses trace/accessibility or cannot meet the supported host contract, stop that candidate. If neither passes at acceptable cost, ship D3 hardening and the bounded catalog and defer street context.

## Delivery phases and open decisions

| Phase | Proposed scope | Exit rule |
| --- | --- | --- |
| 0. Protect current maps | Interaction/draft fixes, diagnostics, join/metric proofs, accessible navigation | P01–P03 pass in a runnable checkout; no analytical regression |
| 1. Improve ordinary authoring | Bounded content controls, independent display names, one country pack, provenance/save behavior | P04–P05 and relevant P08 checks pass; no silent key conversions |
| 2. Evaluate local context | Common-fixture Leaflet/raster and MapLibre/vector experiments | P06–P08 pass; choose at most one optional renderer and an approved provider arrangement |
| Later, only on demand | One regional pack, explicit dense aggregates, fixed classification, owned offline tiles | A concrete dashboard job and measured benefit exceed ongoing cost |

Material choices remain: whether labelled/quiet raster presets satisfy local users; whether independent vector labels justify MapLibre; which country source/keys and territorial representation pass audit; who maintains packs and approves provider terms; draft-import asset retention; empirical workload limits; and detailed-image export feasibility. Each has a smallest proof in the companion plan. Research approval does not decide these product questions.

Defer geocoding, routing, spatial joins, geometry editing/repair, spatial databases, arbitrary projections, terrain/3D and network flows. Their value can be real in logistics or spatial analysis, but the supplied jobs can begin with coordinates, typed keys and prepared geometry. Existing adjacent intents do not authorize a renderer-neutral platform or a GIS layer model. [composed analytical graphics](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/intent/composed-analytical-graphics/intent-brief.md), [renderer-independent replay](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/intent/renderer-independent-replay/intent-brief.md), [network and edge flow](https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/intent/network-and-edge-flow/intent-brief.md).

[point-component]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/PointMap.tsx
[region-component]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/RegionMap.tsx
[point-plan]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/pointMapPlan.ts
[region-plan]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/regionMapPlan.ts
[map-geometry]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/mapGeometry.ts
[region-settings]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/RegionMapSettings.tsx
[geometry-assets]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/geometryAssets.ts
[provider]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/providers/DataLayerProvider.tsx
[save-utils]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/utils/saveDataUtils.ts
