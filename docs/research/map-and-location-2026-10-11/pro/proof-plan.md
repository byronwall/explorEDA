# Map and location proof plan

**Status: proposed; every gate below is NOT RUN.** Research date: 2026-10-11. Source baseline: `12bd64d359f03c54a50b1ff97f20f42284cf4dc6`. Source inspection identified risks; it did not reproduce browser failures, establish performance, or approve a provider. No application code, account, credentials, or service purchase is part of this research handoff.

This plan tests useful dashboard work: select exact records, compare honest regional summaries, supply a boundary file, reuse known geography, control visible content, and optionally locate sites against streets. Source IDs resolve in the companion source ledger. Repository links below pin the reviewed revision; proposed behavior is explicitly identified.

## Sequence and common evidence

Run the smallest correctness gates first. P01–P03 can proceed independently of a renderer decision. P04 applies only to the proposed country pack. P05 protects the host contract. P06 starts with tiny local fixtures; expensive workloads follow successful correctness checks. P07 proves local export independently; its provider-dependent portion follows a viable local renderer and an authorized provider arrangement. Start P08 against the baseline alongside P01 and repeat it for any candidate; its position is an identifier, not permission to postpone accessibility.

For each gate, record fixture hashes, revision, package/browser versions, exact expected and actual row IDs, failure evidence, and a pass/fail/blocked decision. Browser observations, automated assertions, publisher statements, and proposed criteria remain separate. Preserve a deterministic source-row order and fixed random seed. Use an isolated future checkout/harness; retain fixtures and results even if a renderer experiment is discarded.

## P01 — Baseline safety and exact interactions

**Job:** trust that a map selection changes only the intended records. **Anchors:** [PointMap] (`PointMap`), [RegionMap] (`RegionMap`), [pointMapPlan] (`mapPointFilters`), [regionMapPlan] (`regionFilters`), [useMapPan], [ChartTypes] (`BaseChartProps.onSettingsChange`), [DataLayerProvider] (`updateChart`), and [UI defaults].

Start with 20 owned synthetic point rows, including two identical coordinate pairs with different source IDs, valid `[0,0]`, invalid coordinates, a dateline pair, and asymmetric longitude/latitude. Add four logical regions, one hole, and duplicate-key mainland/island features. Record source IDs, contributors, selected IDs, labels, and trace targets before any new rendering work.

Exercise click, additive selection, Alt-click/Alt-Enter inspection, Enter/Space, Escape, the explicit clear control, filters from another chart, and a real pointer drag. Camera movement and fit/reset must not change selected source IDs. A reference outline or street label must not become a dashboard selection. Overlapping marks must retain separate inspectable records.

Two priority fixtures address direct source risks:

- With own-map and other-chart filters active, plain-click empty ocean/space through the mounted chart wrapper. Only the map's filters should clear. Alt-click and a pan exceeding the current four-pixel drag threshold must not clear. Neither map component supplies the documented plain empty-space clear action; reviewed ordinary wrappers do not explicitly supply it. A real pointer test resolves ancestor/hit-target uncertainty.
- Mount a saved point map and a draft preview with the **same chart ID**, a nonempty saved filter, and `onSettingsChange`. Focus a mark and press Escape. Saved settings, workspace selected IDs, and other charts must remain unchanged. Current PointMap source predicts a saved-chart mutation because Escape calls `updateChart` directly; RegionMap guards preview writes. The existing different-ID draft fixture does not prove this case. Separately inspect actual preview callers before describing a reproduced product regression.

**Pass:** exact identity and interaction assertions hold, including nested-editor Escape precedence and read-only previews. **Stop:** fix any confirmed baseline correctness issue before comparing drawing engines; a faster renderer cannot compensate for changed row meaning.

## P02 — Geometry validation, import atomicity, and draft lifecycle

**Job:** import a boundary confidently and understand rejection. **Anchors:** [geometryAssets] (`isRegionGeometry`, `GeometryAsset`), [RegionMapSettings] (`importGeometry`), [regionGeometry] (`regionGeometry`, `fitRegionGeometry`), [DataLayerProvider] (`addGeometryAsset`, `saveToStructure`), [saveDataUtils] (`validateSavedData`). Standards: GEO-001, GEO-002.

Use small owned file and pasted-JSON fixtures: valid Polygon/MultiPolygon; hole; disjoint islands; cut antimeridian geometry; reversed winding; asymmetric coordinates; null feature properties; permitted string/numeric feature IDs; malformed JSON; empty collection; null geometry; Point/GeometryCollection; open/short rings; nonfinite programmatic coordinates; out-of-range positions; legacy `crs`; projected-looking coordinates; repeated vertices; self-intersections; three- and four-dimensional positions. Include polar/greater-than-hemisphere examples as explicit ambiguity probes, not promised support.

Assert the **current supported subset**, then test proposed diagnostics separately. The validator already rejects many malformed structures before insertion. It does not establish topology correctness or perform reprojection. RFC 7946 longitude/latitude, ring, and antimeridian rules and D3's opposite exterior winding require a rendering adapter; winding conversion must leave canonical saved geometry unchanged. Check holes, multipart bounds, and hit targets visually as well as structurally. Never label a rewound self-intersection “repaired.” Proposed diagnostics should identify a feature/ring/coordinate path and explain any rejected CRS/dimensionality policy without silently transforming data.

Import transaction fixtures are distinct:

1. Invalid input leaves assets and chart settings unchanged.
2. Valid input followed by a throwing settings callback exposes partial insertion: the current source adds the shared asset before assigning chart settings. Define one understandable result—atomic assignment, or a clearly successful reusable import with failed assignment—and prove it.
3. Import through staged settings, then cancel/reset/close. Decide whether the asset is intentionally retained in the reusable library or remains staged until acceptance. Verify picker, serialized analysis, references, and existing consumers consistently follow that decision. Automatic deletion of every unused asset is not justified by current reuse semantics.
4. Import twice; make duplicate retention visible. Resolve a delayed file read after closure or another settings change; stale settings must not overwrite current work. These are proposed failure/race fixtures, not observed runtime failures.

**Pass:** bounded, intelligible acceptance; no silent corruption, false success, or dangling reference. Benchmark bytes/vertices later in P06 before proposing application budgets. No arbitrary universal file-size limit or in-browser GIS repair pipeline is required.

## P03 — Exact joins and metric truth

**Job:** know what a shaded region means and why records did not join. **Anchors:** [regionMapPlan] (`planRegionMap`, `regionFilters`), [RegionMapSettings] (join preview), [RegionTraceBody], [aggregates] (`summarizeGroup`, `aggregateValues`), [valueParsing] (`numericExclusionReason`, `parseNumber`), [pointMapPlan]. The aggregate/parsing files were inspected as supplemental exact-baseline source.

Create feature keys and row keys containing numeric `1`, string `"1"`, `"01"`, `"001"`, boolean `true`, empty string, whitespace, null, and missing values. Verify exact typed joins, explicit `@id` versus property selection, preview samples with types, unmatched rows/regions, and duplicate-key groups. Duplicate geometry components share one logical regional aggregate; they must not multiply source-row contributions. Any proposed trim, case change, alias, or padding is an explicit previewed transformation, never an invisible join heuristic.

Use one joined region with measures `10, -6, 0, "6", "bad", "", null, false`. At the current default row-level summary, expected count is **8**, valid numeric inputs are **4**, sum is **10**, and average is **2.5**. Numeric-string measures are accepted independently of typed join-key equality. Average uses the valid-input denominator, not all joined rows. Add a valid-zero-only region, an invalid-measure-only region, a region with no rows, unmatched rows, and a nonfinite-result probe. Keep their labels, fills, legend entries, traces, and contributor/exclusion counts distinct.

Apply linked filters and facets, then inspect exact contributor IDs and bounds. Preserve the current stable source-derived scale across filtering; pan/clipping is not a data filter. Test signed and nonnegative domains, missing point size/color, invalid coordinates, overlapping IDs, and empty scope. A normalized-rate example must carry its denominator and unit; do not infer population from polygon area or average displayed rates as a combined rate. If a ratio is prepared upstream, document its eligible denominator and zero/missing-denominator result. This is arithmetic/product reasoning, not a proposal for new statistics machinery.

**Pass:** planner, marks, legend, and trace report the same truth. **Stop:** resolve silent coercion, doubled contributors, zero/empty/invalid conflation, or changed filter meaning before catalog/renderer claims.

## P04 — Country catalog, provenance, and offline save

**Job:** make a useful regional map without finding a boundary file. **Anchors:** [geometryAssets] (`GeometryAsset`), [mapGeometry] (`worldLand`), [RegionMapSettings], [SavedDataStructure], [saveDataUtils], [DataLayerProvider] (`saveToStructure`), [World Bank demo]. Sources: GEO-003–GEO-010, GEO-015–GEO-024.

Audit **one proposed country pack** before adding optional subnational packs. Current `world-atlas/land-110m.json` is context, not an existing country catalog. Compare the pinned World Atlas country artifact with a documented Natural Earth alternative: identifiers, named exceptions, excluded tiny geographies, territorial/map-unit conventions, disputes, geometry scale, and actual archive/runtime bytes. World Atlas documents Natural Earth 4.1.0 and an archived repository; the currently documented Natural Earth 110m country download is 5.1.1. Do not call either a legal-border authority or equate their vintages. [GEO-003–GEO-006]

Verify an explicit code bridge for the World Bank demo's alpha-3 strings; numeric country IDs alone do not establish it. Audit missing/sentinel identifiers and Norway's documented build exception. Preserve leading zeros as strings. Names are display labels; a reviewed alias table may support joining, with provenance and unmatched preview. Show source/version, boundary convention, identifiers, licence/source terms, transformation recipe, and update owner. Existing asset metadata is limited; a structured manifest is proposed.

Round-trip the actual selected geometry and manifest once in the analysis, referenced by multiple charts. Disable network and reopen; prove local analytical geometry, values, references, and attribution/provenance remain usable. A saved asset must not silently change when a live catalog updates. Verify legacy assets without new metadata still load. Measure initial bundle, lazy activation, and serialized size separately.

Only after country-pack success and a real demand signal, audit one optional national pack using the same checklist—for example Census states/counties, Statistics Canada provinces/divisions, or ONS local authorities. These are choices, not a US mandate. Preserve source string codes and exact vintage. Projected national-source conversion belongs in a reproducible preparation step outside the bounded importer. geoBoundaries is a research aggregation with per-boundary provenance, not universal national authority; incomplete source/licence metadata blocks that candidate. Do not promise ongoing global administrative maintenance. [GEO-008–GEO-024]

## P05 — Content controls, geographic view, save, and host behavior

**Job:** simplify a comparison or add context without changing its meaning. **Anchors:** [MapSettingsPanel], [definition] (`MapSettings`, `MapView`), [mapGeometry] (`mapProjection`, `fitMapCoordinates`), [MapToolbar], [useMapPan], [DataLayerProvider] (`holdStateChanges`, `onStateChange`), [agent guide], [saveDataUtils]. Sources: REN-002, REN-007, REN-010–REN-012, REN-019–REN-020.

Prove a small proposed control set: analytical marks/regions, reference boundaries, context preset, and supported label/opacity controls. Hide/show must not remove source rows or alter joins. Distinguish analytic labels from reference/place labels. Raster labels are baked pixels: offer an actual quiet/no-label preset when available, or disclose the unsupported control. Test reference ordering and hit exclusion. Avoid a generic layer editor.

Test legacy saved Equal Earth/equirectangular views first. Their zoom multiplies a fitted world projection; tile zoom is a different quantity. A proposed detailed camera needs a tagged representation and validation. First transitions use documented geographic center/extent; repeated transitions restore the appropriate stored view. Probe dateline, high latitude, `[0,0]`, two chart sizes, and constrained projections. State clipping/coverage limits without reclassifying valid analytical coordinates. Today's point/region analytical-mode switch clears several fields; do not accidentally copy that behavior into a context-only switch.

Record `onStateChange` in a controlled host that echoes saved data. One continuous pan/slider edit should produce one completed history step; Escape cancels as the existing editing contract requires. Test undo/redo, reset, read-only history preview, mount/unmount, hidden panels, container resize, and four facets. Filters must not automatically refit. Check style replacement restores analytical layers/selection, and teardown releases listeners, workers, and render resources. Avoid storing provider secrets or duplicating shared geometry in each chart. Assert deterministic save/restore rather than assuming an unchanged-looking screen proves host stability.

**Pass:** the same logical analysis survives controls, navigation, history, and restoration. An unavailable provider ID has an intelligible local fallback. **Stop:** camera/save migrations or event churn that corrupt history block optional context.

## P06 — Fair renderer proof and measured density

**Job:** choose the smallest maintained rendering approach that meets demonstrated dashboard work. **Anchors:** [MapChart], [PointMap], [RegionMap], both planners, [mapGeometry], and [package manifest]. Sources: REN-001–REN-020, REN-030–REN-033.

Compare existing D3/SVG, Leaflet raster context, and MapLibre vector context in disposable experiments with the same logical fixtures, chart bounds, visible extent, analytical styling, and interaction tasks. Serve deterministic **owned local raster and vector fixtures** showing the same roads/labels before touching a provider. Report projection differences. Neither planner is already renderer-neutral: keep analytical identity/aggregation authoritative and change only the necessary drawing/event boundary. Do not introduce a production plugin framework to run this comparison.

First run P01/P03 on 20 points and four logical regions. Restrict picking to analytical layers and deduplicate split/tiled hit results by explicit logical ID. Renderer-generated IDs or positions in hit/feature arrays must not replace explorEDA source-row IDs. Verify longitude/latitude conversion at the Leaflet boundary. Pin candidate/wrapper versions, preserve advertised React 18 and 19 compatibility, and verify CSS, worker/version pairing, WebGL capability, lifecycle, and resize. A wrapper's initialization semantics are not saved-view synchronization. [REN-006–REN-018]

**Proposed benchmark assumptions, not measurements:** name the reference host `MAP-REF-01`; before accepting results, record its actual manufacturer/model, four-core CPU, integrated GPU, at least 8 GB RAM, OS, browser/version, power mode, and display scaling. Use a representative midrange machine, not an unidentified developer workstation. Measure one and four simultaneous **800 × 500** charts. Point fixtures: **1k, 10k, 50k**, with **10% coordinate overlap**. Polygon fixtures: **100 / 1,000** polygons with **20k / 200k total vertices**; add **1 million vertices** as an adversarial workload. Record distributions and source bytes, not counts alone.

Run 1k correctness, then 10k. Escalate to 50k/adversarial/four-chart measurements only when earlier checks pass or when needed to identify a concrete failure boundary. Measure cold/warm first usable draw, p95 selection feedback, linked-filter settling, pan frame-time distribution, memory/GPU/resource cleanup, and incremental shipped JS/CSS/worker/style/glyph/sprite/tile bytes, raw and compressed. Separate initial application loading from optional context activation. No package-size leaderboard substitutes for the host build.

At **10k points in one chart only**, provisional targets are selection feedback within **100 ms**, filtering settled within **500 ms**, and sustained pan around **30 fps** with jank reported. These are revisable empirical acceptance criteria, not current results, universal limits, or promises for four charts/polygons/mobile. Retain measurements that miss them. Revisit targets using the named device and actual user task.

**Decision:** if fixed raster presets satisfy local navigation and both candidates preserve the contract, prefer the demonstrated smaller maintenance burden. Choose MapLibre only when useful vector controls or a demonstrated workload advantage justify its measured cost. If neither passes, keep hardened D3 and postpone streets. Consider D3 Canvas only for a demonstrated density bottleneck, with fresh picking/accessibility proofs. Defer OpenLayers/PMTiles unless an approved need earns their additional responsibilities.

## P07 — Actual provider, privacy, failures, attribution, and export

**Job:** obtain street context reliably and understand what can be shared. **Anchors:** [MapChart], [definition], [saveDataUtils], [DataLayerProvider]; the provider/export boundary is a proposed addition. Sources: REN-010–REN-012, REN-019–REN-029, REN-032.

Before provider-dependent capture, inspect the owning export path in a complete checkout and prove local SVG/geometry output, including legend and selection state. That local export portion can proceed without a provider arrangement.

First inject local fixture failures: missing raster/vector tile, glyph/sprite/style error, CORS denial, timeout, offline, stale worker, and denied WebGL. Then check the shortlisted **actual provider** with a host-authorized arrangement and appropriately restricted public configuration. No purchases, new accounts, credential access, or agreements are authorized here. If no arrangement exists, mark this gate blocked and retain the functioning local proof; that does not establish production readiness.

Record the exact service/style/plan and current terms. Test modest representative requests and permitted failure simulation for 401/403/429/5xx/partial tiles. Do not run bulk pan benchmarks against OSMF. Check request origins, payload categories, referrer behavior, attribution, and token scope without publishing credentials. Tiles can disclose viewport area; verify that analytical rows, uploaded GeoJSON, join keys, and measures are not transmitted. Browser tokens are visible; build-time substitution does not hide a secret. Styles can introduce additional glyph/sprite origins. No unreviewed proxy workaround. [REN-021–REN-029]

Pass only if unavailable context is clearly identified while analytical interaction remains usable, attribution is legible at narrow widths, and save/restore contains safe provider/style references. Provider policy, privacy inference, and measured network observations need distinct evidence.

Export has **two independent gates**. Technical: capture complete 1×/2× output with marks, fonts, legends, provenance and required attribution; exercise resource-loading races, CORS-denied raster, WebGL capture/context options, and failed tiles. Blank tiles or silently missing layers fail. Permission: establish rights for the exact provider/style/data/fonts/output and intended redistribution; ordinary display/cache permission does not prove export or offline-archive permission. Record unresolved current terms as blocked, including unread product terms. Successful pixel capture is not permission. [REN-010, REN-022–REN-029]

If either gate fails, offer an explicitly labelled local-outline export preserving analytical values, selection meaning and legend, if that export is supported; otherwise disclose detailed export unavailability. Do not silently substitute a different image or scrape an offline archive.

## P08 — Accessibility, touch, and practical legibility

**Job:** inspect/select records and navigate without relying on hover, color, or dragging. **Anchors:** [PointMap], [RegionMap], [MapToolbar], [MapSettingsPanel], [UI defaults]. Sources: ROOT-001–ROOT-003; these explain criteria and do not certify the product.

Run manual keyboard and screen-reader tasks against baseline and candidate: enter the map, move between logical records/regions, hear label/value/state/selection, inspect contributors, select, clear, pan/zoom/fit, close nested editors, and recover focus after filtering/remount. Record actual browser/OS/screen-reader versions; use a desktop screen reader and a touch/screen-reader combination relevant to the host. Automated checks supplement these observations. Roving SVG focus must remain usable; Canvas/WebGL needs a synchronized accessible row/region interaction route, not thousands of hidden tab stops or camera keys alone.

Provide and test a **single-pointer alternative to dragging**. Existing numeric geographic controls might satisfy the task if practical with taps; directional pan controls are another bounded proposal. Keyboard support alone does not establish the non-drag pointer alternative. Test touch drag-versus-select, pointer cancellation, zoom controls, overlap inspection, scroll containment, and usable targets. [ROOT-001, ROOT-003]

At 1280, 783, and 390 pixel host widths, check focus visibility, control/attribution overlap, light/dark contrast, text legibility, and explicit zero/no-rows/no-valid-measure states beyond color. [ROOT-002; UI defaults] With the same owned local sites and districts, perform two tasks: locate a named site relative to a road, and compare district values. Record whether quiet raster presets suffice or independent labels improve completion. Do not infer that every additional layer helps.

**Pass:** equivalent analytical operations and understandable state across supported inputs; document remaining limitations. **Stop:** a renderer that loses accessible inspection/selection cannot ship merely because panning works.

## Future command and completion record

The attached prompt names these commands **exactly**. None was run for this research. In a complete, authorized future checkout, use them only for the relevant implementation/acceptance gate; source inspection is not a substitute for their results.

```sh
pnpm --filter exploreda exec vitest run src/components/charts/Map/pointMap.test.tsx src/components/charts/Map/regionMap.test.tsx
pnpm --filter exploreda check-types
pnpm --filter demo dev
pnpm check:ui
pnpm check
```

Record command revision, environment, exit/result, and meaningful browser evidence. Existing tests do not cover all proposed fixtures. Do not install an unrelated framework or weaken checks to manufacture a pass. Finish with the selected bounded route, unresolved gates, measured limits, ownership, and fallback; retain only justified production complexity.

[PointMap]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/PointMap.tsx
[RegionMap]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/RegionMap.tsx
[pointMapPlan]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/pointMapPlan.ts
[regionMapPlan]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/regionMapPlan.ts
[useMapPan]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/useMapPan.ts
[ChartTypes]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/types/ChartTypes.ts
[DataLayerProvider]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/providers/DataLayerProvider.tsx
[UI defaults]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/ui-defaults.md
[geometryAssets]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/geometryAssets.ts
[RegionMapSettings]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/RegionMapSettings.tsx
[regionGeometry]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/regionGeometry.ts
[saveDataUtils]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/utils/saveDataUtils.ts
[RegionTraceBody]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/RegionTraceBody.tsx
[aggregates]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/aggregates.ts
[valueParsing]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/lib/valueParsing.ts
[mapGeometry]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/mapGeometry.ts
[SavedDataStructure]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/types/SavedDataStructure.ts
[World Bank demo]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/apps/demo/src/demos/analyses/worldbank.ts
[MapSettingsPanel]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/MapSettingsPanel.tsx
[definition]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/definition.ts
[MapToolbar]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/MapToolbar.tsx
[agent guide]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/docs/agent-guide.md
[MapChart]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/src/components/charts/Map/MapChart.tsx
[package manifest]: https://github.com/byronwall/explorEDA/blob/12bd64d359f03c54a50b1ff97f20f42284cf4dc6/packages/explorEDA/package.json
