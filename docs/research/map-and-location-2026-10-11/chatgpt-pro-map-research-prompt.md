# Research useful map and location capabilities for explorEDA

https://github.com/byronwall/explorEDA

## Mission and decision

Research which map and location capabilities explorEDA should offer for useful dashboards, with clear user control and modest maintenance cost. Produce a broad, evidence-backed comparison, then recommend a bounded product direction. Do not implement it.

The source baseline is commit `12bd64d359f03c54a50b1ff97f20f42284cf4dc6`. The local planning branch is `codex/map-location-intent`. New planning files may exist only in the attached packet when you begin. The packet contains the initial intent and selected source files from that exact commit. Use the attached intent as the current user direction. Report any difference between the inspected remote ref and this baseline.

Act as a candid expert in dashboard visualization, cartography, map interaction, and small React libraries. Challenge attractive complexity. Compare Leaflet with credible alternatives. Do not assume the user's library suggestion is already selected.

## Access preflight and fallback

GO for repository-grounded findings only after verifying the exact repository and ref, or the attached source packet and its manifest. Read the initial intent and the map implementation before describing current gaps. State which access path worked.

The connected GitHub app is read-only. No repository mutation is requested. You may create downloadable research artifacts in your own working environment. Do not commit, push, open a PR, create issues, or modify application files.

If remote access fails but the attached packet is readable, use it and label the review as a selected-source review. Name missing files and limit claims accordingly. If both are unavailable, mark the repository assessment NO-GO. Continue external research if possible, but do not call the whole task complete or invent repository facts. Supply the complete report inline if file creation fails. State exactly which files were not created.

Stop a particular recommendation if its evidence cannot establish a material claim. Mark it uncertain and name the smallest proof. Do not stop the whole research run to ask reversible preference questions. Use explicit assumptions and compare alternatives. Stop before any new service purchase, credential access, account creation, or agreement.

## Durable intent

Users should make useful dashboards from location-bearing data without becoming GIS specialists. Both point and region maps need clearer behavior, hardening, and more control over rendered content. Improve custom GeoJSON support and supply more useful geography. Some local maps need streets and place labels; a plain world outline is insufficient. A simple-versus-detailed view is a hypothesis. Leaflet is a hypothesis. The product must remain far smaller than a full GIS offering.

Current work ends with researched intent and review. No feature implementation is authorized. Distinguish direct intent from your proposals. Preserve existing exact selection, linked filtering, source trace, metric states, and save/restore behavior.

## Verified baseline and reading route

At minimum, inspect these actual files:

1. `AGENTS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`, `README.md`, `package.json`, `packages/explorEDA/package.json`.
2. `docs/intent/map-and-location/intent-brief.md`, `references/user-request.md`, and `references/repository-baseline.md` within that initiative.
3. `packages/explorEDA/src/components/charts/Map/definition.ts`, `MapChart.tsx`, `MapSettingsPanel.tsx`, `RegionMapSettings.tsx`, `MapToolbar.tsx`.
4. The same Map folder: `pointMapPlan.ts`, `regionMapPlan.ts`, `mapGeometry.ts`, `regionGeometry.ts`, `PointMap.tsx`, `RegionMap.tsx`, `useMapData.ts`, `useMapPan.ts`, `mapTrace.ts`, `regionTrace.ts`, `MapTraceBody.tsx`, `RegionTraceBody.tsx`.
5. `packages/explorEDA/src/lib/geometryAssets.ts`, `src/types/SavedDataStructure.ts`, `src/types/ChartTypes.ts`, `src/utils/saveDataUtils.ts`, `src/providers/DataLayerProvider.tsx`, and `src/lib/dsl/settingKeys.ts`, all under the package.
6. `packages/explorEDA/src/components/charts/Map/pointMap.test.tsx` and `regionMap.test.tsx`; `apps/demo/src/demos/dashboardSettings.ts`, `regionMapGeometry.ts`, `analyses/earthquakes.ts`, `analyses/worldbank.ts`; `apps/demo/src/docs/pages/map.mdx`.
7. Adjacent scope: `docs/intent/composed-analytical-graphics/intent-brief.md`, `docs/intent/renderer-independent-replay/intent-brief.md`, and `docs/intent/network-and-edge-flow/intent-brief.md`.

The current product has one Map chart with point and region modes. It already imports polygon GeoJSON by file or pasted text. It stores shared geometry assets, joins exact typed keys, and supports count/sum/average. Points support latitude/longitude, size, color, labels, and source-row selection. D3 Geo renders Equal Earth and equirectangular views over bundled World Atlas land. Geographic center and zoom persist. The current package manifest has no tile renderer. Verify these facts rather than copying them blindly.

The project uses React and TypeScript. Use pnpm for any checks. Relevant commands are:

```sh
pnpm --filter exploreda exec vitest run src/components/charts/Map/pointMap.test.tsx src/components/charts/Map/regionMap.test.tsx
pnpm --filter exploreda check-types
pnpm --filter demo dev
pnpm check:ui
pnpm check
```

These commands are evidence options, not claims that they ran. A selected source packet may not support execution. Do not install a new framework or modify tests to make them pass.

## Priority questions

### 1. What should an ordinary dashboard user be able to do?

Start with useful jobs: geographic distribution, local site context, regional comparison, custom territories, dense point patterns, and location-linked filtering. Build a broad feature inventory, then separate an initial product from later opportunities and GIS scope to avoid.

Survey at least eight relevant offerings if primary evidence permits. Cover several BI/dashboard products, declarative or charting tools, and map-focused visualization tools. Candidates include Tableau, Power BI, Looker Studio, Apache Superset, Metabase, Apache ECharts, Plotly, Vega/Vega-Lite, Observable Plot, and kepler.gl. These are research candidates, not claims about current capabilities. Use official documentation and dated primary evidence. Explain why each comparator matters; do not rank products only by feature count.

Compare map types, mark/layer control, basemaps, labels, legends, color classification, point sizing, dense points, geometry upload, geographic joins, built-in regions, tooltips, linked interaction, accessibility, persistence, and export. Treat unknown support as unknown. Give concrete dashboard examples, including a worldwide comparison, a city site map, and custom service districts.

### 2. How should users control what renders?

Distinguish analytical marks, reference boundaries, basemap content, and labels. Recommend understandable settings and useful defaults. Evaluate a few explicit modes against a general layer model. Consider points over regions, visibility, ordering, opacity, labeling, and whether each deserves first-release scope. Address pan/zoom versus selection, empty-space clearing, keyboard use, touch, chart resizing, facets, and linked filters. Explain what stays invariant when the presentation changes.

### 3. What custom and supplied geography is enough?

Assess the existing GeoJSON import path. Cover accepted geometry types, WGS 84 coordinate order, invalid geometry diagnostics, holes, multipolygons, antimeridian cases, null geometry, file size and feature/vertex budgets, join previews, unmatched rows, typed identifiers, duplicate keys, saved assets, reuse, and provenance. Distinguish validation from geometry repair. Consider source licensing and update responsibility.

Recommend a small starter geography catalog with actual sources and identifiers. Evaluate countries and useful subnational boundaries; do not assume all global administrative levels are cheap to maintain. Compare bundled, lazily loaded, and host-supplied assets. Consider territorial disputes, boundary vintages, simplification, and offline use proportionately. No country choice or global coverage promise is predetermined.

### 4. What renderer and basemap arrangement best fits this product?

Compare the existing D3/SVG path, Leaflet, MapLibre GL JS, and any materially stronger simple option. Explain whether dual rendering is worth its cost. Separate renderer capability from basemap data/provider capability. Raster streets may include baked labels that cannot be toggled independently; vector style control has different costs. Verify those details from primary sources.

Cover bundle/loading cost, React integration, coordinate/projection differences, geographic view persistence, tiled zoom conventions, hit testing, filtering, trace targets, export, attribution, provider credentials, request privacy, offline behavior, and failed tile requests. Do not equate a free renderer with free production tiles. Inspect official provider terms/policies without inventing legal conclusions or prices. State dates and uncertainties. Recommend who configures the provider: host, end user, or both.

### 5. What should hardening prove before expansion?

Identify the most likely correctness and usability failures. Preserve no-data versus zero, invalid measures, denominators, stable color scales, exact contributors, and unmatched records. Assess choropleth normalization, rates, classification, and uncertainty without adding statistical scope by default.

Define small falsifiable proofs for import, joins, dense points, external context, saved view, export, and accessibility. Use deterministic local fixtures first. Name where a real provider check is needed. Performance limits must be proposed measurements with a workload and device assumption, not unsupported universal thresholds. Include failure fixtures and a clear fallback for a failed renderer experiment.

## Evidence and scope rules

- Cite exact repository paths and symbols for every current-state or change recommendation. If evidence is external only, say so.
- Separate observed facts, inferences, and proposals. No implied live browser test or executed benchmark.
- Prefer official product docs, library docs, source repositories, standards, and dataset publishers. Record source URLs, access date, and supported claims.
- Link each recommended addition to a real user job and an existing repository seam. State benefit, maintenance cost, rejected simpler option, confidence, and acceptance proof.
- Research broadly, then converge. The user does not want a full GIS suite, a spatial server, an arbitrary plugin platform, or speculative compatibility layers.
- Do not silently convert geocoding, routing, geometry editing, 3D terrain, spatial joins, or spatial databases into requirements. Assess their value, then place them below the cut line unless a narrow case earns inclusion.
- Keep the initial intent authoritative. Research may challenge mechanisms but cannot manufacture user approval.
- Use compact prose. Put large comparison tables, source detail, and catalogs in companion files.

## Deliverable contract

Create a downloadable ZIP named `exploreda-map-location-research.zip`, with these complete files at its root:

1. `README.md`: manifest, access/ref status, reading order, research date, limitations, and files/checks inspected.
2. `report.md`: standalone research report with executive recommendation, user jobs, product comparison, render controls, GeoJSON and catalog direction, renderer/provider tradeoffs, hardening, phased recommendations, rejected options, and open decisions.
3. `capability-matrix.csv`: product, capability, support status, conditions, official source URL, date, and relevance to explorEDA. Quote CSV fields correctly.
4. `geography-catalog.csv`: candidate geography, publisher, URL, license/source terms, identifiers, vintage, size/resolution evidence, loading strategy, and recommendation. Mark unverified fields explicitly.
5. `recommendations.json`: stable recommendation IDs, disposition (keep/fix/explore/defer/avoid), user job, repository anchors, primary sources, confidence, proof, and dependencies.
6. `intent-amendments.md`: proposed edits to the initial intent, clearly separating durable intent, derived requirements, implementation hypotheses, and deferred scope. Keep this under 1,000 words.
7. `proof-plan.md`: the smallest useful proof sequence, decision rules, local fixtures, needed provider checks, failure cases, and fallback.
8. `sources.md`: annotated primary sources with access dates and the claims they support.

Also expose direct download links for each file if possible. Include any extra artifacts in the ZIP manifest. Avoid binary documents that merely duplicate Markdown. Do not substitute a ZIP containing only a summary for the requested files.

The intended repository archive destination is `docs/intent/map-and-location/resources/pro-map-location-research/`. Codex will download and incorporate your output there. You are not asked to write into GitHub.

## Completion gates

GO requires an evidence-backed answer to all five priority questions, a broad primary-source comparison, a bounded recommendation, explicit uncertainty, and complete deliverables. Reject a report that treats existing GeoJSON support as absent, assumes Leaflet supplies street data, ignores provider obligations, or loses selection and trace meaning.

If a required gate fails, state NO-GO or PARTIAL, identify the evidence gap, and provide the work completed. Do not invent observations to pass the gate. The final response should state access/ref, the three strongest recommendations, material unresolved choices, checks actually run, and links to the ZIP and every artifact. Finish only when the files are ready or the full inline fallback is complete.
