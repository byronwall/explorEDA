# Primary sources and evidence notes

**Research/access date: 2026-10-11.** The ledger contains 123 external primary-source records, plus the verified repository baseline and supplied intent. Access dates describe retrieval; source publication/update dates and boundary vintages are recorded separately. Undated pages remain undated.

Official documentation, standards, source repositories and dataset publishers establish only the claims stated below. API support does not establish a finished dashboard workflow. Product capabilities were not browser-tested. Dataset conversion, application execution, performance measurement and live-provider acceptance were not performed.

The capability matrix uses `documented`, `conditional`, `not-supported-documented`, and `unknown`. For unknown rows, source URLs identify the reviewed scope; they do not establish absence. The catalog distinguishes publisher archive sizes/resolution labels from unmeasured browser payload, memory and vertex costs. No current price, service entitlement or general legal conclusion is inferred.

Sources are annotated in original paraphrase. URLs point to the official source as retrieved; living pages can change after the access date. The pinned repository URLs and recorded input hashes establish the code baseline. Source IDs in the report, CSV files, recommendations and proof plan resolve to the headings below.

## Repository and supplied intent

### REPO-BASELINE

[explorEDA baseline commit](https://github.com/byronwall/explorEDA/commit/12bd64d359f03c54a50b1ff97f20f42284cf4dc6) — byronwall/explorEDA. **Accessed:** 2026-10-11. **Ref:** `12bd64d359f03c54a50b1ff97f20f42284cf4dc6`.

**Supports:** source-level implementation, dependencies, settings, imports, joins, metric states, selection/trace, shared geometry and persistence facts at the cited paths/symbols. All 39 tracked packet files matched exact-ref GitHub blobs; seven supplementary files were fetched and verified at that ref. The full file/symbol inventory is in [repository-review.md](repository-review.md); hashes and access results are in [verification.json](verification.json).

**Limit:** selected source, not a runnable checkout. Tests were inspected, not executed. Remote main was pinned to [`396fb9ed3e6ce920635e3487c663373db5df0d2a`](https://github.com/byronwall/explorEDA/commit/396fb9ed3e6ce920635e3487c663373db5df0d2a), five commits ahead; [the pinned comparison](https://github.com/byronwall/explorEDA/compare/12bd64d359f03c54a50b1ff97f20f42284cf4dc6...396fb9ed3e6ce920635e3487c663373db5df0d2a) changes four box-plot-related paths and no map implementation paths. No application or repository mutation was made.

### INTENT-001

**Supplied source:** `exploreda-map-source.zip`, especially `docs/intent/map-and-location/intent-brief.md`, `references/user-request.md`, `references/repository-baseline.md`, plus the attached `chatgpt-pro-map-research-prompt.md` and current user handoff. **Read:** 2026-10-11. **Planning-file date:** 2026-10-11.

**Supports:** ordinary dashboard jobs, point/region hardening, rendered-content control, custom/supplied geography, desired optional detailed local context and bounded maintenance. Leaflet and simple/detailed rendering are hypotheses. **Limit:** these five initiative files are packet-only planning material, not claimed as committed baseline source. Current instructions authorize research and artifacts, not implementation, repository writes or a PR. Proposed amendments remain unaccepted.

## Product capabilities

### PROD-TAB-01

[Create Geographic Layers for Maps](https://help.tableau.com/current/pro/desktop/en-us/maps_marks_layers.htm) — Tableau / Salesforce.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Independent mark layers; selectable versus reference content; visibility/order; custom-view persistence.

**Limits:** Hidden marks leave selections. Reviewed documentation, not a browser test; platform/version conditions remain relevant.

### PROD-TAB-02

[Customize How Your Map Looks](https://help.tableau.com/current/pro/desktop/en-us/maps_options.htm) — Tableau / Salesforce.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Map styles, background details, mark encodings, labels and tooltips.

**Limits:** Available background details depend on style and zoom; census overlays are US-specific.

### PROD-TAB-03

[Create Tableau Maps from Spatial Files](https://help.tableau.com/current/pro/desktop/en-us/maps_shapefiles.htm) — Tableau / Salesforce.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** GeoJSON and other spatial inputs; common-column joins; geometry converted to WGS84.

**Limits:** A connection cannot mix geometry types; web upload requires Creator privileges and supported single-file packaging.

### PROD-TAB-04

[Assign Geographic Roles](https://help.tableau.com/current/pro/desktop/en-us/maps_geographicroles.htm) — Tableau / Salesforce.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Geographic roles use built-in geographic recognition with role-specific coverage.

**Limits:** Country/city/postal/subdivision coverage is not uniform; this is not an unrestricted downloadable geography catalog.

### PROD-TAB-05

[Maps that Show Density or Trends](https://help.tableau.com/current/pro/desktop/en-us/maps_howto_heatmap.htm) — Tableau / Salesforce.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Density marks reveal concentrations of overlapping locations.

**Limits:** Density of geographic centroids is not necessarily density of original events; no comparative performance benchmark.

### PROD-TAB-06

[Accessibility Improvements Added by Release](https://help.tableau.com/current/tableau/en-us/accessibility_updates.htm) — Tableau / Salesforce.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Tableau Cloud 2024.3 adds keyboard navigation across marks, including grouped navigation for maps.

**Limits:** Release- and surface-specific evidence, not blanket compliance for all maps and platforms.

### PROD-TAB-07

[Filter Actions](https://help.tableau.com/current/pro/desktop/en-us/actions_filter.htm) — Tableau / Salesforce.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Dashboard actions configure source/target sheets, trigger and behavior when selection clears.

**Limits:** General worksheet action system combined with explicit selectable map-layer documentation; no runtime test.

### PROD-TAB-08

[Export Views from Tableau Desktop to Another Application](https://help.tableau.com/current/pro/desktop/en-us/save_export_image.htm) — Tableau / Salesforce.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Desktop image export offers bitmap and SVG formats; PowerPoint uses static PNG views.

**Limits:** Map-specific external-background fidelity/offline behavior not established; SVG may substitute fonts.

### PROD-AZ-01

[Get started with Azure Maps Power BI visual](https://learn.microsoft.com/en-us/azure/azure-maps/power-bi-visual-get-started) — Microsoft.

**Accessed:** 2026-10-11. **Published/updated:** updated 2025-10-21.

**Supports:** Map styles and view controls; 30,000 data-point cap; Power BI export and subscriptions unsupported.

**Limits:** Tenant, regional and embedding restrictions apply. Tile/geocoding requests are external; no rendering benchmark.

### PROD-AZ-02

[Layers in Azure Maps Power BI visual](https://learn.microsoft.com/en-us/azure/azure-maps/power-bi-visual-understanding-layers) — Microsoft.

**Accessed:** 2026-10-11. **Published/updated:** updated 2026-01-21.

**Supports:** Data and context layers; zoom-dependent visibility; constrained relative positions.

**Limits:** Some layer positions are fixed, so this is not arbitrary ordering.

### PROD-AZ-03

[Add a reference layer to Azure Maps Power BI visual](https://learn.microsoft.com/en-us/azure/azure-maps/power-bi-visual-add-reference-layer) — Microsoft.

**Accessed:** 2026-10-11. **Published/updated:** updated 2026-06-12.

**Supports:** File/URL geometry; data binding by common values; styling precedence; separate unmapped geometry controls.

**Limits:** Automatic property selection favors most matches; exact typed-key semantics unverified. Only first 30,000 features rendered.

### PROD-AZ-04

[Add a marker layer to Azure Maps Power BI visual](https://learn.microsoft.com/en-us/azure/azure-maps/power-bi-visual-add-marker-layer) — Microsoft.

**Accessed:** 2026-10-11. **Published/updated:** updated 2026-01-21.

**Supports:** Measure-sized circles/icons, category labels and marker styling.

**Limits:** Sizing options do not establish faithful aggregate/source-row semantics; negative magnitudes may be made positive.

### PROD-AZ-05

[Add a cluster bubble layer](https://learn.microsoft.com/en-us/azure/azure-maps/power-bi-visual-cluster-bubbles) — Microsoft.

**Accessed:** 2026-10-11. **Published/updated:** updated 2026-01-21.

**Supports:** Zoom-dependent point clustering with count labels and style controls.

**Limits:** Member identity and dashboard interaction at cluster boundaries were not tested.

### PROD-SH-01

[Create Shape Map visualizations in Power BI](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-shape-map) — Microsoft.

**Accessed:** 2026-10-11. **Published/updated:** updated 2026-06-29.

**Supports:** Built-in/custom shape maps; GeoJSON/TopoJSON by upload or URL; key preview; blank-area styling; conditional fills.

**Limits:** 1,500 data-point cap. Point overlays, street context, accessibility and map-specific export are not established here.

### PROD-LS-01

[Google Maps reference | Data Studio](https://docs.cloud.google.com/data-studio/google-maps-reference) — Google Cloud.

**Accessed:** 2026-10-11. **Published/updated:** updated 2026-10-07.

**Supports:** Six map presets; basemap detail controls; saved viewport; encodings; optional cross-filtering; BigQuery geometry.

**Limits:** Custom GEOGRAPHY needs BigQuery; blended/extracted sources cannot carry it. No direct GeoJSON upload verified.

### PROD-LS-02

[Download a Data Studio report as a PDF](https://docs.cloud.google.com/data-studio/download-a-report-as-pdf) — Google Cloud.

**Accessed:** 2026-10-11. **Published/updated:** updated 2026-10-09.

**Supports:** Report PDF snapshots with permissions and rendering limitations.

**Limits:** Map-specific fidelity untested; timeouts and protected BigQuery content can prevent complete rendering.

### PROD-LS-03

[Add a Google Maps API key](https://docs.cloud.google.com/data-studio/add-a-google-maps-api-key) — Google Cloud.

**Accessed:** 2026-10-11. **Published/updated:** updated 2026-10-09.

**Supports:** Embedded map use may need a billing key; PDF/email loads also enter usage accounting.

**Limits:** Provider pricing/quotas must be rechecked before shipping; a screenshot workflow need not be network-independent.

### PROD-MB-01

[Maps](https://www.metabase.com/docs/latest/questions/visualizations/map) — Metabase.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Pin/grid/region workflows, key matching, dashboard filters, point-mode limits, saved view.

**Limits:** Latest documentation showed v0.64. Tile pins lack tooltips; map types cannot combine. No runtime tests.

### PROD-MB-02

[Custom maps](https://www.metabase.com/docs/latest/configuring-metabase/custom-maps) — Metabase.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Instance-wide raster tile source; URL-loaded custom GeoJSON; separate key and display-name fields.

**Limits:** Direct region-file upload unavailable; under-5-MB polygons with geographic coordinates; exposed tile keys must be public.

### PROD-MB-03

[Exporting results](https://www.metabase.com/docs/latest/questions/exporting-results) — Metabase.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Question data/image exports and dashboard PDF screenshots.

**Limits:** Permissions apply; generic chart export documentation does not establish map/tile fidelity.

### PROD-SU-01

[Map Tiles](https://superset.apache.org/admin-docs/configuration/map-tiles/) — Apache Software Foundation / Superset.

**Accessed:** 2026-10-11. **Published/updated:** updated 2026-10-10.

**Supports:** Administrator-configured raster templates or Mapbox styles with CORS/CSP settings.

**Limits:** Documentation is Version Next. Examples are not provider permission or unlimited tile-service entitlement.

### PROD-SU-02

[Country Map Tools](https://superset.apache.org/admin-docs/configuration/country-map-tools/) — Apache Software Foundation / Superset.

**Accessed:** 2026-10-11. **Published/updated:** updated 2026-10-10.

**Supports:** Included country subdivision choropleths use ISO 3166-2; additional maps require source changes.

**Limits:** Version Next; dataset vintages/license provenance not fully specified on this page.

### PROD-SU-03

[Get the sub-layer charts declared by a deck.gl Multiple Layers chart](https://superset.apache.org/developer-docs/api/get-the-sub-layer-charts-declared-by-a-deck-gl-multiple-layers-chart/) — Apache Software Foundation / Superset.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Multiple-layer charts refer to saved child chart IDs and enforce child access permissions.

**Limits:** API documentation, not a verified end-user ordering/selection workflow; Version Next.

### PROD-SU-04

[Apache Superset 6.1.0 changelog](https://github.com/apache/superset/blob/master/CHANGELOG/6.1.0.md) — Apache Software Foundation / Superset.

**Accessed:** 2026-10-11. **Published/updated:** undated page; explicitly 6.1.0 release scope.

**Supports:** 6.1.0 entries record deck.gl GeoJSON icon/text and custom-tooltip changes.

**Limits:** Version-specific changelog; not a full control reference or proof every deployed version has these changes.

### PROD-SU-05

[Charts API](https://superset.apache.org/developer-docs/api/charts/) — Apache Software Foundation / Superset.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Chart save/configuration, YAML export and screenshot endpoints.

**Limits:** General chart API; map-specific export and remote-tile rendering remain unverified. Version Next.

### PROD-EC-01

[SVG Base Map](https://echarts.apache.org/handbook/en/how-to/component-types/geo/svg-base-map/) — Apache Software Foundation / ECharts.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Registered SVG/GeoJSON maps; geographic overlays; visual mapping; roaming; select/event controls.

**Limits:** SVG coordinates can be local rather than geographic. Specific map documentation is used instead of assuming all chart behavior transfers.

### PROD-EC-02

[Visual Mapping](https://echarts.apache.org/handbook/en/concepts/visual-map/) — Apache Software Foundation / ECharts.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Continuous/piecewise mapping, categories, thresholds and visual channels.

**Limits:** General component documentation; map application is independently established by SVG Base Map.

### PROD-EC-03

[ARIA](https://echarts.apache.org/handbook/en/best-practices/aria/) — Apache Software Foundation / ECharts.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Opt-in descriptions and decal patterns.

**Limits:** Does not prove keyboard access to individual geographic features or full accessibility conformance.

### PROD-EC-04

[Basic Scatter Chart](https://echarts.apache.org/handbook/en/how-to/chart-types/scatter/basic-scatter/) — Apache Software Foundation / ECharts.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Scatter can use geographic coordinates and fixed/data-driven symbol size.

**Limits:** Geographic applicability is explicit; no geographic large-data benchmark inferred.

### PROD-EC-05

[ECharts API reference](https://echarts.apache.org/en/api.html) — Apache Software Foundation / ECharts.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Reviewed scope URL for unresolved API export/state details.

**Limits:** Body required JavaScript; API behavior could not be verified from this retrieval. This source does not prove absence.

### PROD-PL-01

[Maps in JavaScript](https://plotly.com/javascript/maps/) — Plotly.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Separate outline and tiled map families and map trace types.

**Limits:** Map family index, not evidence for all capabilities of every trace.

### PROD-PL-02

[Tile Map Layers in JavaScript](https://plotly.com/javascript/tile-map-layers/) — Plotly.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Base style, data traces and reference layers; ordering controls; blank and remote styles.

**Limits:** Token-free style examples do not settle tile-provider terms; opaque upper layers can cover data.

### PROD-PL-03

[Scattermap traces in JavaScript](https://plotly.com/javascript/reference/scattermap/) — Plotly.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** MapLibre point/line/text encodings, trace visibility, clustering, tooltips and selection indices.

**Limits:** Array size/color support is restricted to circle symbols; stable IDs and external dashboard linking need host design.

### PROD-PL-04

[Choroplethmap traces in JavaScript](https://plotly.com/javascript/reference/choroplethmap/) — Plotly.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Polygon/MultiPolygon GeoJSON object or URL; locations matched through featureidkey.

**Limits:** Geometry only covers accepted feature types; typed/coercion and duplicate-key behavior unverified.

### PROD-PL-05

[Outline Map Locations in JavaScript](https://plotly.com/javascript/outline-map-locations/) — Plotly.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Built-in outline-map countries and US-state location modes.

**Limits:** Resolution affects availability of small territories and feature grouping; not a universal regional catalog.

### PROD-PL-06

[Map View in JavaScript](https://plotly.com/javascript/map-view/) — Plotly.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Map fitting and configurable view parameters.

**Limits:** Documented v4 behavior excludes choroplethmap automatic fitting; antimeridian cases can create broad extents.

### PROD-PL-07

[Static image export in JavaScript](https://plotly.com/javascript/static-image-export/) — Plotly.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Raster/SVG image exports and full-json figure export.

**Limits:** Generic examples do not establish remote map fidelity; documented WebGL raster warning lists other trace types, so map-specific SVG behavior remains unverified.

### PROD-PL-08

[Event handlers in JavaScript](https://plotly.com/javascript/plotlyjs-events/) — Plotly.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Map event data includes trace/point identity and coordinates; handlers can drive host behavior.

**Limits:** An event API is not a complete linked-dashboard selection contract.

### PROD-PL-09

[Layout.map in JavaScript](https://plotly.com/javascript/reference/layout/map/) — Plotly.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Map layer visibility and uirevision preservation of user-driven camera changes.

**Limits:** Persistence across updates differs from durable application save/reload; provider and asset availability remain external.

### PROD-VG-01

[Geoshape | Vega-Lite](https://vega.github.io/vega-lite/docs/geoshape.html) — Vega project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Projected GeoJSON marks with standard visual encodings.

**Limits:** Documentation/examples use the v6 schema; not a built-in geography catalog or import UI.

### PROD-VG-02

[U.S. map with airports | Vega-Lite](https://vega.github.io/vega-lite/examples/geo_layer.html) — Vega project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Shared projection combines an externally loaded boundary layer and airport points.

**Limits:** Specific example, not browser-tested acceptance or proof of tiled street basemaps.

### PROD-VG-03

[Faceted County-Level Species Habitat Maps | Vega-Lite](https://vega.github.io/vega-lite/examples/interactive_geo_facet_species.html) — Vega project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** County-ID lookup, explicitly parsed numeric keys, legends, facets and tooltips.

**Limits:** Despite the URL name, the inspected specification does not define a selection parameter.

### PROD-VG-04

[Mark | Vega-Lite](https://vega.github.io/vega-lite/docs/mark.html) — Vega project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Mark descriptions/ARIA and tooltip behavior apply to geoshape marks.

**Limits:** ARIA effects described for SVG output; this does not prove keyboard geographic selection.

### PROD-VG-05

[View API | Vega](https://vega.github.io/vega/docs/api/view/) — Vega project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Signal/event integration, state capture/restore and SVG/PNG snapshot APIs.

**Limits:** Host must retain specification/assets and define linking/state lifecycle; remote-resource export was not tested.

### PROD-VG-06

[Parameters | Vega-Lite](https://vega.github.io/vega-lite/docs/parameter.html) — Vega project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Generic point/interval selections and parameter-driven predicates.

**Limits:** Reviewed generic parameter guide does not alone verify a particular geographic selection workflow.

### PROD-VG-07

[Projection | Vega-Lite](https://vega.github.io/vega-lite/docs/projection.html) — Vega project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Projection configuration for geographic marks.

**Limits:** A projection specification does not itself provide a map navigation UI.

### PROD-VG-08

[Scale | Vega-Lite](https://vega.github.io/vega-lite/docs/scale.html) — Vega project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Quantile/quantize and explicit bins; size and color scale configuration.

**Limits:** Geoshape color and geographic point applicability relies on separately reviewed examples.

### PROD-OB-01

[Geo mark | Observable Plot](https://observablehq.github.io/plot/marks/geo) — Observable.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** GeoJSON marks; property-based encodings; quantitative radius; quantile choropleth/legend; tooltip placement.

**Limits:** Documentation version 0.6.17; caller supplies/prepares geometry and data. No upload/join application implied.

### PROD-OB-02

[Projections | Observable Plot](https://observablehq.github.io/plot/features/projections) — Observable.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** D3-based projections, domain fitting, clipping and geographic overlays.

**Limits:** Projection functionality is separate from interactive camera controls.

### PROD-OB-03

[Interactions | Observable Plot](https://observablehq.github.io/plot/features/interactions) — Observable.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Pointer/tips and external reactive integration.

**Limits:** At documented 0.6.17 scope, direct selection is under development and interactive pan/zoom is future work.

### PROD-OB-04

[Accessibility | Observable Plot](https://observablehq.github.io/plot/features/accessibility) — Observable.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** SVG/mark ARIA descriptions and hiding decorative marks.

**Limits:** Root labels/descriptions need authoring; this is not a full keyboard-selection guarantee.

### PROD-KP-01

[Types of layers | kepler.gl](https://docs.kepler.gl/docs/user-guides/c-types-of-layers) — kepler.gl project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Point, line/arc, polygon, heatmap, grid/hexagon and cluster map layers.

**Limits:** Arc rendering is not route computation; guide is undated and not a performance benchmark.

### PROD-KP-02

[Layer attributes | kepler.gl](https://docs.kepler.gl/docs/user-guides/d-layer-attributes) — kepler.gl project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Field-driven color/size, opacity, fill/stroke and discrete color scales.

**Limits:** Available controls depend on layer type.

### PROD-KP-03

[Map styles | kepler.gl](https://docs.kepler.gl/docs/user-guides/f-map-styles) — kepler.gl project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Basemap styles and controls for labels, roads, boundaries and other context.

**Limits:** Guide is Mapbox-centric; does not settle every current distribution/backend/provider entitlement.

### PROD-KP-04

[Interactions | kepler.gl](https://docs.kepler.gl/docs/user-guides/g-interactions) — kepler.gl project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Chosen tooltip fields, pinned detail and brush highlighting.

**Limits:** Brushing and tooltips are mutually exclusive here; highlighting is not automatically dashboard cross-filtering.

### PROD-KP-05

[Save and export | kepler.gl](https://docs.kepler.gl/docs/user-guides/k-save-and-export) — kepler.gl project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Viewport image with optional legend, filtered/full data, configuration plus data, and HTML export.

**Limits:** Exported HTML can depend on a token with expiry; client-side analytical data does not mean no remote basemap requests.

### PROD-KP-06

[Add data to the map | kepler.gl](https://docs.kepler.gl/docs/user-guides/b-kepler-gl-workflow/a-add-data-to-the-map) — kepler.gl project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Local/remote tabular and GeoJSON data; feature properties; sample data.

**Limits:** Old browser-size/projection statements are not adopted as universal limits; current map-settings guide also describes globe mode.

### PROD-KP-07

[Filters | kepler.gl](https://docs.kepler.gl/docs/user-guides/e-filters) — kepler.gl project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Filters attach to datasets and affect every associated layer.

**Limits:** External dashboard linked selections require integration beyond these application filters.

### PROD-KP-08

[Blend and rearrange layers | kepler.gl](https://docs.kepler.gl/docs/user-guides/b-kepler-gl-workflow/add-data-to-layers/d-blend-and-rearrange-layers) — kepler.gl project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Layer order and blending controls.

**Limits:** A richer layer designer is not evidence that explorEDA needs unrestricted blending.

### PROD-KP-09

[Map settings | kepler.gl](https://docs.kepler.gl/docs/user-guides/m-map-settings) — kepler.gl project.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation accessed 2026-10-11.

**Supports:** Pan/zoom, synchronized split views and legends for visible layers.

**Limits:** Globe support has layer limitations and conflicts with older input-guide wording; no projection universality assumed.

## Renderers, integration and providers

### REN-001

[Paths: geoPath and path.context](https://d3js.org/d3-geo/path) — D3 / Observable.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** geoPath emits SVG path strings by default or draws to a Canvas-compatible context.

**Limits:** No benchmark; canvas drawing alone supplies neither streets nor keyboard hit targets.

### REN-002

[Leaflet API reference](https://leafletjs.com/reference.html) — Leaflet.

**Accessed:** 2026-10-11. **Published/updated:** undated; retrieved page identifies 2.0.0-alpha.1.

**Supports:** TileLayer images, SVG/Canvas vector paths, EPSG:3857 default, GeoJSON coordinate conversion, layer events, crossOrigin and tile error handling are documented.

**Limits:** Unversioned reference currently describes alpha APIs; pin stable-version API behavior before implementation.

### REN-003

[Download Leaflet](https://leafletjs.com/download.html) — Leaflet.

**Accessed:** 2026-10-11. **Published/updated:** Leaflet 1.9.4 released 2023-05-18; alpha.1 released 2025-08-16.

**Supports:** Release table identifies 1.9.4 as stable and 2.0.0-alpha.1 as prerelease.

**Limits:** Page examples nevertheless reference alpha; release table and examples are inconsistent. Do not copy unpinned snippets.

### REN-004

[Leaflet overview](https://leafletjs.com/) — Leaflet.

**Accessed:** 2026-10-11. **Published/updated:** undated; release notice dated 2025-08-16.

**Supports:** Publisher lists tiled layers, GeoJSON, navigation controls and reports about 42 KB gzipped JavaScript plus CSS/images.

**Limits:** Publisher estimate is not measured incremental explorEDA bundle cost and may reflect an unspecified build.

### REN-005

[Leaflet repository and license](https://github.com/Leaflet/Leaflet) — Leaflet contributors.

**Accessed:** 2026-10-11. **Published/updated:** undated; main inspected.

**Supports:** Repository identifies BSD-2-Clause software license.

**Limits:** Software license does not grant access to map data or hosted tiles; a tagged license file could not be retrieved.

### REN-006

[React Leaflet introduction](https://react-leaflet.js.org/docs/start-introduction/) — Paul Le Cam / React Leaflet.

**Accessed:** 2026-10-11. **Published/updated:** undated; v5.x docs.

**Supports:** Leaflet owns layer DOM; props are immutable unless documented mutable; browser DOM dependence prevents server rendering.

**Limits:** Not an integration test; Activity/hidden chart lifecycle and React peer support require verification.

### REN-007

[Map creation and interactions](https://react-leaflet.js.org/docs/api-map/) — Paul Le Cam / React Leaflet.

**Accessed:** 2026-10-11. **Published/updated:** undated; v5.x docs.

**Supports:** MapContainer props other than children are immutable; useMap/useMapEvents provide instance and event access.

**Limits:** Changing React center/zoom props is not sufficient to update a mounted MapContainer.

### REN-008

[React Leaflet v5.0.0 release](https://github.com/PaulLeCam/react-leaflet/releases/tag/v5.0.0) — Paul Le Cam / React Leaflet.

**Accessed:** 2026-10-11. **Published/updated:** release page displays 14 Dec; year not exposed in retrieved text.

**Supports:** React v19 is required as a peer dependency.

**Limits:** explorEDA advertises React 18 or 19. Do not silently narrow the supported host range by choosing this wrapper.

### REN-009

[MapLibre GL JS introduction](https://maplibre.org/maplibre-gl-js/docs/) — MapLibre.

**Accessed:** 2026-10-11. **Published/updated:** undated; current documentation.

**Supports:** MapLibre GL JS is a TypeScript browser renderer using WebGL and a style document.

**Limits:** No measured performance or bundle size; styling requires compatible sources and resource URLs.

### REN-010

[MapOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/) — MapLibre.

**Accessed:** 2026-10-11. **Published/updated:** undated; current v6-era API.

**Supports:** Current options use WebGL2, longitude-first center, transformRequest, canvas context attributes, geographic camera and world-copy controls.

**Limits:** Version-specific APIs; preserveDrawingBuffer defaults false. Export reliability and blocked-GPU fallback untested.

### REN-011

[Layers](https://maplibre.org/maplibre-style-spec/layers/) — MapLibre Style Specification.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** Sources can be styled with fill, line, circle, symbol and raster layers, filters, paint properties and visibility.

**Limits:** Basemap label toggles require a known provider style/schema; generic label-name heuristics are unverified.

### REN-012

[Sources](https://maplibre.org/maplibre-style-spec/sources/) — MapLibre Style Specification.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** GeoJSON sources support explicit promoted feature IDs, clustering and generated IDs; styles reference sources separately.

**Limits:** Generated array-index IDs must not become analytical row identities; renderer clusters need explicit contributor semantics.

### REN-013

[Map: queryRenderedFeatures / querySourceFeatures](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/) — MapLibre.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** Rendered queries may contain duplicates from tiled geometry; GeoJSON is tiled internally; source queries cover loaded tiles.

**Limits:** Hit queries are not a complete row inventory and must not calculate dashboard denominators.

### REN-014

[Projection](https://maplibre.org/maplibre-style-spec/projection/) — MapLibre Style Specification.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** Mercator is the documented default; a globe/perspective-to-Mercator transition is illustrated.

**Limits:** No claim of parity with explorEDA Equal Earth/equirectangular views; exact supported projection set is version-specific.

### REN-015

[MapLibre GL JS LICENSE.txt](https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt) — MapLibre contributors.

**Accessed:** 2026-10-11. **Published/updated:** undated; main inspected, copyright 2023.

**Supports:** BSD-style redistribution terms cover MapLibre; bundled upstream notices are retained.

**Limits:** Does not license a basemap, style, font, imagery or tile service.

### REN-016

[MapLibre GL JS v6.13.0 release](https://github.com/maplibre/maplibre-gl-js/releases/tag/v6.13.0) — MapLibre contributors.

**Accessed:** 2026-10-11. **Published/updated:** 2026-10-06 (release view: 06 Oct 19:51).

**Supports:** Latest-release route resolved to v6.13.0 at access time; notes describe a stale-worker upgrade crash fix.

**Limits:** Version discovery only; no installed or benchmarked build. Date year inferred from latest release relative to access.

### REN-017

[react-map-gl introduction](https://visgl.github.io/react-map-gl/docs) — vis.gl / OpenJS Foundation.

**Accessed:** 2026-10-11. **Published/updated:** undated; v8 docs.

**Supports:** Supports MapLibre/Mapbox wrappers and fully controlled camera state.

**Limits:** Imperative native calls can diverge from React props; target-version integration untested.

### REN-018

[react-map-gl get started](https://visgl.github.io/react-map-gl/docs/get-started) — vis.gl / OpenJS Foundation.

**Accessed:** 2026-10-11. **Published/updated:** undated; v8 docs.

**Supports:** Documents MapLibre-specific imports, required stylesheet and explicit worker configuration for MapLibre v6 bundler applications.

**Limits:** Documentation states broad React compatibility; installed package peer ranges still need checking.

### REN-019

[Raster vs vector map tiles](https://docs.maptiler.com/guides/how-maps-work/raster-vector-tiles/) — MapTiler.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** Raster tiles are rendered images with fixed client-side styling; vector data supports runtime visual styling.

**Limits:** Publisher's generalized performance comparisons are not used as explorEDA benchmark evidence.

### REN-020

[How to use Leaflet](https://docs.maptiler.com/leaflet/examples/how-to-use-leaflet/) — MapTiler.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** Official raster Streets example uses Leaflet 1.9.4, 512px tiles, zoomOffset -1, attribution, CORS setting and a user key.

**Limits:** Technical example is not proof that any deployment, export or volume is permitted.

### REN-021

[API key](https://docs.maptiler.com/guides/credentials/api-key/) — MapTiler.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** Frontend keys should be restricted to allowed origins; staging and production keys separated; exposed keys can be misused.

**Limits:** No credentials accessed; origin restrictions mitigate misuse but do not make a browser token secret.

### REN-022

[MapTiler Cloud Terms and Conditions](https://www.maptiler.com/terms/cloud/) — MapTiler.

**Accessed:** 2026-10-11. **Published/updated:** undated; no effective/update date found.

**Supports:** Terms distinguish temporary single-user cache from export, bulk download and proxy use; special agreements may be required.

**Limits:** Review selected subscription and intended export with provider before use. No prices or legal eligibility conclusion.

### REN-023

[General Terms and Conditions](https://www.maptiler.com/terms/) — MapTiler.

**Accessed:** 2026-10-11. **Published/updated:** undated; no effective/update date found.

**Supports:** Special terms and specific agreements affect service use; renderer, content and service rights must be assessed separately.

**Limits:** No signed customer agreement inspected; web terms can change.

### REN-024

[Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) — OpenStreetMap Foundation Operations Working Group.

**Accessed:** 2026-10-11. **Published/updated:** undated; current policy retrieved.

**Supports:** Standard raster service requires visible attribution, proper request identification and caching; forbids bulk/offline download and supplies no SLA.

**Limits:** Applies to tile.openstreetmap.org, not all OSM-derived tile providers; policies may change.

### REN-025

[Vector Tile Usage Policy](https://operations.osmfoundation.org/policies/vector/) — OpenStreetMap Foundation Operations Working Group.

**Accessed:** 2026-10-11. **Published/updated:** undated; current policy retrieved.

**Supports:** OSMF vector service has separate attribution, caching, identification, bulk-download and version-transition rules.

**Limits:** Not a production availability commitment or entitlement to offline archives.

### REN-026

[Use cross-origin images in a canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/CORS_enabled_image) — MDN contributors / Mozilla.

**Accessed:** 2026-10-11. **Published/updated:** 2025-09-18.

**Supports:** Cross-origin images require appropriate CORS cooperation for readable canvas output; otherwise image export APIs raise SecurityError.

**Limits:** Technical browser constraint only; successful export does not establish map-content permission.

### REN-027

[Token management](https://docs.mapbox.com/accounts/guides/tokens/) — Mapbox.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** Public browser tokens are visible; restrict scopes and URLs; secret-scoped tokens must remain server-side.

**Limits:** No token accessed; documentation does not establish service compatibility or export entitlement.

### REN-028

[Attribution](https://docs.mapbox.com/help/dive-deeper/attribution/) — Mapbox.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** Mapbox data/design attribution includes logo/text; use with other map frameworks still needs required attribution.

**Limits:** Attribution guidance is not the full usage license; product terms need separate review.

### REN-029

[Product Terms portal and linked PDF](https://www.mapbox.com/legal/product-terms) — Mapbox.

**Accessed:** 2026-10-11. **Published/updated:** linked filename identifies July 21, 2026; PDF body inaccessible.

**Supports:** Portal identifies an official Product Terms PDF.

**Limits:** PDF could not be read. Current renderer/style/export permissions remain unverified; no Mapbox provider recommendation passes this gate.

### REN-030

[OpenLayers documentation](https://openlayers.org/doc/) — OpenLayers.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** Documentation identifies 2-Clause BSD software licensing and links official APIs/examples.

**Limits:** Broader capabilities do not by themselves make it a simpler explorEDA fit; no integration benchmark.

### REN-031

[Frequently Asked Questions](https://openlayers.org/doc/faq.html) — OpenLayers.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** Default view is Web Mercator; custom projections and explicit geographic-coordinate conversion are supported.

**Limits:** Projection interoperability is outside ordinary dashboard scope here.

### REN-032

[PMTiles Concepts](https://docs.protomaps.com/pmtiles/) — Protomaps.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** PMTiles is a read-only tile archive retrieved through HTTP Range requests from static storage.

**Limits:** Format is neither a basemap license nor a guarantee of offline portability; styles/fonts/CORS need separate handling.

### REN-033

[PMTiles for Leaflet](https://docs.protomaps.com/pmtiles/leaflet) — Protomaps.

**Accessed:** 2026-10-11. **Published/updated:** undated.

**Supports:** protomaps-leaflet vector rendering is in maintenance mode and the publisher recommends MapLibre for new interactive-vector work.

**Limits:** Raster PMTiles remains a separate integration possibility; no archive produced.

### REN-034

[d3-geo LICENSE](https://github.com/d3/d3-geo/blob/main/LICENSE) — D3 / Mike Bostock.

**Accessed:** 2026-10-11. **Published/updated:** undated; copyright 2010–2024.

**Supports:** Current software license permits reuse with retained notice and includes GeographicLib terms.

**Limits:** Data and styles are separate rights; exact installed-version license audit not performed.

## Geography publishers and geometry standards

### GEO-001

[RFC 7946 — The GeoJSON Format](https://www.rfc-editor.org/rfc/rfc7946) — IETF / RFC Editor.

**Accessed:** 2026-10-11. **Published/updated:** 2016-08.

**Supports:** WGS 84 longitude/latitude degrees; optional third ordinate; further ordinates discouraged. Polygon closure and exterior/interior ring semantics; counterclockwise exterior and clockwise holes; backward compatibility discourages winding-only rejection. Antimeridian cutting recommendation; null feature geometry and empty FeatureCollections are valid GeoJSON.

**Limits:** The standard defines interchange semantics, not explorEDA's supported subset or a topology-repair algorithm. Keep total derived summary compact.

### GEO-002

[d3-geo — spherical geometry and winding conventions](https://d3js.org/d3-geo) — D3 / Observable.

**Accessed:** 2026-10-11. **Published/updated:** Undated living documentation; accessed 2026-10-11.

**Supports:** D3 uses spherical GeoJSON and SVG/Canvas path generation. Exterior winding differs for polygons smaller versus larger than a hemisphere; holes use the opposite direction. D3 convention differs from RFC 7946; standard antimeridian cuts may require stitching.

**Limits:** Documentation does not prove the supplied explorEDA adapter handles all spherical cases.

### GEO-003

[World Atlas TopoJSON README](https://github.com/topojson/world-atlas) — topojson/world-atlas.

**Accessed:** 2026-10-11. **Published/updated:** Repository archived 2023-03-03; README redistributes Natural Earth 4.1.0.

**Supports:** Country and land TopoJSON available at 1:110 million, 1:50 million, and 1:10 million scales. Country README describes a string ISO 3166-1 numeric id and a name property; country geometry is quantized spherical coordinates. Repository displays ISC licence and archive status.

**Limits:** README is not a full identifier/coverage audit. Downloaded country-feature count and compressed/uncompressed payload bytes were not measured.

### GEO-004

[World Atlas prepublish build script](https://github.com/topojson/world-atlas/blob/master/prepublish) — topojson/world-atlas.

**Accessed:** 2026-10-11. **Published/updated:** Archived repository; script date not established.

**Supports:** Build script derives id from Natural Earth ISO_N3; handles -99 by preserving Norway as 578 and otherwise leaving id undefined. Build keeps only name in country properties, quantizes topology, stitches geometry, and merges land.

**Limits:** Source inspection of build recipe, not execution or an audit of each published dataset. Script download URLs are mutable.

### GEO-005

[Natural Earth Terms of Use](https://www.naturalearthdata.com/about/terms-of-use/) — Natural Earth.

**Accessed:** 2026-10-11. **Published/updated:** Undated living terms; accessed 2026-10-11.

**Supports:** Publisher puts website raster/vector map data in the public domain. Modification and redistribution are permitted; permission and author credit are not required by these terms.

**Limits:** Dataset provenance should still be retained as a product quality choice. Website terms do not imply every separately packaged software licence disappears.

### GEO-006

[Admin 0 — Countries, 1:110 million](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/) — Natural Earth.

**Accessed:** 2026-10-11. **Published/updated:** Download version 5.1.1 displayed; page originally posted 2009-09-21; effective boundary dates not unified.

**Supports:** Publisher displays version 5.1.1 and 210.08 KB country download. Default country boundaries depict de facto control. Countries, sovereign states, and map units differ; map units separate certain overseas regions.

**Limits:** Listed download size is source archive metadata, not converted GeoJSON size, vertex count, JavaScript heap or gzip bundle cost. Page headline is not used as an audited 110m feature count.

### GEO-007

[Admin 1 — States, Provinces, 1:10 million](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/) — Natural Earth.

**Accessed:** 2026-10-11. **Published/updated:** Download version 5.1.1 displayed; page effective update date unverified.

**Supports:** Publisher lists 14.22 MB source download and over 4,500 internal divisions. Page labels the theme beta, identifies omitted small countries/areas, and describes incomplete statistical codes and maintenance difficulty. Default de facto presentation and worldview-related attributes are documented.

**Limits:** These are publisher page claims; no complete pack audit or runtime measurement. Detailed coverage and identifiers require country-specific verification.

### GEO-008

[2025 Cartographic Boundary Files](https://www.census.gov/geographies/mapping-files/2025/geo/carto-boundary-file.html) — U.S. Census Bureau.

**Accessed:** 2026-10-11. **Published/updated:** 2025 vintage; page revised 2026-04-15.

**Supports:** States source shapefile downloads listed at 3.1 MB (1:500,000), 1.1 MB (1:5,000,000), under 1 MB (1:20,000,000). Counties source shapefile downloads listed at 11 MB, 2.8 MB, under 1 MB for those scales respectively. Files can be selected by geography; do not require downloading the all-geographies bundle.

**Limits:** Listed archive sizes only. Actual GeoJSON bytes, feature counts, rings, and vertices unmeasured. Selected cartographic archive schemas were not downloaded.

### GEO-009

[Cartographic Boundary File Description](https://www.census.gov/programs-surveys/geography/technical-documentation/naming-convention/cartographic-boundary-file.html) — U.S. Census Bureau.

**Accessed:** 2026-10-11. **Published/updated:** Living documentation; accessed 2026-10-11.

**Supports:** Cartographic files simplify MAF/TIGER geography for thematic maps. Small holes/discontiguous areas and offshore areas can be excluded; cross-year alignment is not guaranteed. Publisher advises against area/perimeter calculation, address geocoding, and precise geographic relationship determination.

**Limits:** Supports thematic display choice, not exact spatial calculations or service-area containment.

### GEO-010

[2025 TIGER/Line Shapefiles Technical Documentation](https://www2.census.gov/geo/pdfs/maps-data/data/tiger/tgrshp2025/TGRSHP2025_TechDoc.pdf) — U.S. Census Bureau.

**Accessed:** 2026-10-11. **Published/updated:** 2025; publisher directory file timestamp 2025-09-23.

**Supports:** U.S. government copyright exclusion and request to cite Census; boundaries are statistical representations and TIGER/Line trademark terms are separate. TIGER state fields STATEFP/GEOID are two-character strings; STUSPS is a two-character string; county GEOID is the five-character concatenation of STATEFP and COUNTYFP. TIGER source CRS is GCS NAD83; county reference date is January 1, 2025.

**Limits:** This is TIGER/Line documentation, not a direct inspection of the selected cartographic ZIP. Verify the final cartographic schema, CRS and vintage metadata before preprocessing. Source terms summarized rather than legal advice.

### GEO-011

[geoBoundaries API and archival access](https://www.geoboundaries.org/api.html) — geoBoundaries.

**Accessed:** 2026-10-11. **Published/updated:** Living documentation; accessed 2026-10-11.

**Supports:** gbOpen is presented as CC BY 4.0 compliant; gbHumanitarian and gbAuthoritative have different source/usage terms. Per-layer metadata includes source licence, source URL, represented year, update/build dates, boundaryID, unit and vertex summaries, and full/simplified download links. boundaryID changes with underlying metadata/geometry; API uptime is not guaranteed.

**Limits:** Website archive list is behind the source repository release list. Per-layer and version-specific terms still need inspection; API metadata is not a verified final feature-key crosswalk.

### GEO-012

[geoBoundaries Individual Country Files](https://www.geoboundaries.org/countryDownloads.html) — geoBoundaries.

**Accessed:** 2026-10-11. **Published/updated:** Undated living catalog.

**Supports:** Individual country products represent countries as they represent themselves and do not specially identify disputed areas. CC BY 4.0 and attribution are stated on this catalog.

**Limits:** Individual-country files can overlap; this is not a politically neutral universal partition or a promise of official national-government provenance.

### GEO-013

[geoBoundaries Comprehensive Global Administrative Zones](https://www.geoboundaries.org/globalDownloads.html) — geoBoundaries.

**Accessed:** 2026-10-11. **Published/updated:** Undated living catalog.

**Supports:** Global composites are simplified and replace disputed areas with polygons following U.S. Department of State definitions. Attribution is required.

**Limits:** Do not interchange composite and individual-country products without explaining worldview and simplification differences. No measured payload size.

### GEO-014

[geoBoundaries ALB ADM1 metadata response](https://www.geoboundaries.org/api/current/gbOpen/ALB/ADM1/) — geoBoundaries.

**Accessed:** 2026-10-11. **Published/updated:** Represented year 2021; source integration 2023-01-19; build 2023-12-12 in returned metadata.

**Supports:** Returned boundaryID ALB-ADM1-10019604 and pinned download commit 9469f09. Metadata reports 12 units, mean 114 vertices, minimum 47 and maximum 254. Source is recorded as geoBoundaries/Wikipedia and Public Domain, but licenceSource is only a generic commons.wikimedia.org/wiki/File URL.

**Limits:** Illustrative metadata audit only, not a recommended Albania pack. Source licence provenance is incomplete; geometry payload was not retrieved. Current endpoint can change.

### GEO-015

[2021 Census Boundary Files Reference Guide](https://www150.statcan.gc.ca/n1/pub/92-160-g/92-160-g2021002-eng.htm) — Statistics Canada.

**Accessed:** 2026-10-11. **Published/updated:** 2022-02-09; geographic reference date 2021-01-01.

**Supports:** Cartographic and digital files cover provinces/territories and census divisions among other levels; source data uses Lambert conformal conic / NAD83. Cartographic creation removes coastal waters; boundaries are not guaranteed consistent across census vintages. Guide provides geographic date, UID/DGUID relationships and positional-accuracy limitations.

**Limits:** No exact GeoJSON payload or vertex budget measured. This is a deliberately pinned 2021 candidate, not a claim that it is the latest possible Canadian boundary vintage.

### GEO-016

[2021 Record layout — Province and territory boundary files](https://www150.statcan.gc.ca/n1/pub/92-160-g/2021002/tbl/tbl_4.1-eng.htm) — Statistics Canada.

**Accessed:** 2026-10-11. **Published/updated:** 2022-02-09.

**Supports:** PRUID is character length 2; DGUID character length 21. English/French names and abbreviations are available.

**Limits:** Convert identifiers as strings; actual exported GeoJSON representation must be audited.

### GEO-017

[2021 Record layout — Census division boundary files](https://www150.statcan.gc.ca/n1/pub/92-160-g/2021002/tbl/tbl_4.2-eng.htm) — Statistics Canada.

**Accessed:** 2026-10-11. **Published/updated:** 2022-02-09.

**Supports:** CDUID is four-character province-plus-division code; DGUID is 21 characters; PRUID is two characters. CDNAME, CDTYPE and LANDAREA are documented.

**Limits:** Page title metadata incorrectly says Province and territory; table body says Census division. No runtime or final export inspection.

### GEO-018

[Statistics Canada Open Licence](https://www.statcan.gc.ca/en/terms-conditions/open-licence) — Statistics Canada.

**Accessed:** 2026-10-11. **Published/updated:** 2025-07-10.

**Supports:** Permits worldwide royalty-free reproduction, redistribution, sale and value-added products subject to terms. Requires source acknowledgement; distinguishes reproduced information from adapted value-added products. Requires accurate reproduction/no source misrepresentation/no implied endorsement; terms in force at access govern use.

**Limits:** Preserve exact publisher notice in a future pack. This review did not distribute Canadian boundary data.

### GEO-019

[Local Authority Districts (May 2025) Boundaries UK BGC (V2)](https://www.data.gov.uk/dataset/bde3b6d9-23a7-4bf6-bb55-df7b439b713a/local-authority-districts-may-2025-boundaries-uk-bgc-v2) — Office for National Statistics, via data.gov.uk.

**Accessed:** 2026-10-11. **Published/updated:** Updated 2025-09-01; geography as at 2025-05.

**Supports:** Candidate LAD boundaries are generalized at 20 metres and clipped to mean high water coastline. GeoJSON, shapefile and other export links and publisher service are listed. Dataset includes ONS and Ordnance Survey intellectual property.

**Limits:** Catalog licence field says 'Not set'; publisher boundary policy supplies general terms separately. Exact pack notices and exported payload size require verification.

### GEO-020

[ONS LAD May 2025 UK BGC V2 feature-layer schema](https://services1.arcgis.com/ESMARspQHYMw9BZ9/ArcGIS/rest/services/LAD_MAY_2025_UK_BGC_V2/FeatureServer/0) — Office for National Statistics ArcGIS service.

**Accessed:** 2026-10-11. **Published/updated:** Layer last edit shown 2025-08-28; data last edit 2025-07-31.

**Supports:** LAD25CD is a nine-character string; LAD25NM and LAD25NMW provide names. Service source spatial reference is EPSG:27700; GeoJSON query format is available.

**Limits:** Raw service coordinates are not suitable for direct RFC 7946 import. No whole-layer export or CRS conversion was tested; FID is system-maintained and unsuitable as stable analytical key.

### GEO-021

[Licences — geography products](https://www.ons.gov.uk/methodology/geography/licences/) — Office for National Statistics.

**Accessed:** 2026-10-11. **Published/updated:** Undated living terms; accessed 2026-10-11.

**Supports:** Digital boundaries/reference maps are supplied under the Open Government Licence. ONS attribution and OS Crown copyright/database-right statements are required. Terms distinguish product categories and third-party rights.

**Limits:** Specific LAD metadata notice should be checked before distribution; do not apply postcode-specific restrictions to boundaries without evidence.

### GEO-022

[Digital boundaries](https://www.ons.gov.uk/methodology/geography/geographicalproducts/digitalboundaries) — Office for National Statistics.

**Accessed:** 2026-10-11. **Published/updated:** Living product documentation; accessed 2026-10-11.

**Supports:** BGC means 20-metre generalization and coastal clipping; BUC means 500-metre generalization. Full resolution/clipped and full extent options have distinct meanings. Boundary products use OGL and ONS/OS notices.

**Limits:** Generalization distance is not guaranteed spatial accuracy and differs from Natural Earth/Census map-scale notation.

### GEO-023

[Creative Commons Attribution 4.0 International deed](https://creativecommons.org/licenses/by/4.0/) — Creative Commons.

**Accessed:** 2026-10-11. **Published/updated:** Version 4.0; page access 2026-10-11.

**Supports:** Commercial sharing and adaptation are allowed subject to attribution, licence link and indication of changes. No implied endorsement or additional restrictions; deed points to full legal code.

**Limits:** The deed is a summary; original per-dataset source terms can differ. Do not label all geoBoundaries collections uniformly without metadata.

### GEO-024

[geoBoundaries source repository README](https://github.com/wmgeolab/geoBoundaries) — William & Mary geoLab / geoBoundaries community.

**Accessed:** 2026-10-11. **Published/updated:** Living repository; release table includes 6.0.0 dated 2023-09-14.

**Supports:** Project distinguishes high precision/simplified single-country files and global composites. Repository identifies code/QA repos and versioned releases; source metadata and full/simplified files are available. Top-level licence description includes CC BY 4.0 / ODbL, reinforcing need for layer-specific review.

**Limits:** Top-level breadth statements are not a guarantee that one file joins every national statistical table. Selected full geometry was not retrieved.

## Accessibility and cartographic interpretation

### ROOT-001

[Understanding SC 2.5.7: Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) — W3C Web Accessibility Initiative.

**Accessed:** 2026-10-11. **Published/updated:** Undated living Understanding document; no publication date established here.

**Supports:** Dragging functionality needs an alternative single-pointer operation; keyboard support alone does not satisfy this particular criterion. The examples include map pan controls.

**Limits:** Informative criterion guidance, not an explorEDA audit or conformance certification.

### ROOT-002

[Understanding SC 1.4.1: Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) — W3C Web Accessibility Initiative.

**Accessed:** 2026-10-11. **Published/updated:** Undated living Understanding document; no publication date established here.

**Supports:** Color must not be the sole visual means of conveying information or distinguishing a visual element.

**Limits:** Supports proposed textual/pattern distinctions; no map color palette or contrast result was tested.

### ROOT-003

[Understanding SC 2.1.1: Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) — W3C Web Accessibility Initiative.

**Accessed:** 2026-10-11. **Published/updated:** Undated living Understanding document; no publication date established here.

**Supports:** Functionality should be operable through a keyboard interface subject to the criterion's defined exceptions.

**Limits:** A generic renderer's keyboard options do not prove complete analytical-map task accessibility.

### ROOT-004

[Normalize your data for choropleth maps](https://www.esri.com/arcgis-blog/products/arcgis-online/mapping/normalization-for-choropleth-maps) — Esri ArcGIS Blog / Heather Smith.

**Accessed:** 2026-10-11. **Published/updated:** 2025-02-11.

**Supports:** Explains why normalizing mapped quantities can improve comparisons between unequal geographic units and how the choice of denominator affects interpretation.

**Limits:** Cartographic guidance supports a contextual recommendation, not a universal prohibition on workload totals or a requirement for automatic rates.

### ROOT-005

[Create Maps that Show Quantitative Values in Tableau](https://help.tableau.com/current/pro/desktop/en-us/maps_howto_choropleth.htm) — Tableau / Salesforce.

**Accessed:** 2026-10-11. **Published/updated:** Undated current product documentation.

**Supports:** Documents quantitative filled maps and choosing measures suited to regional comparison.

**Limits:** Does not validate explorEDA's input data, denominator or current regional implementation.
