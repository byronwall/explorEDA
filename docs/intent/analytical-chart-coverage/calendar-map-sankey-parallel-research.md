# Calendar heatmap, maps, Sankey, and parallel coordinates

Status: recommendation for review, 2026-09-23. Byron now expects all four to matter soon. This changes their priority in the [chart additions research](chart-additions-research.md), but does not establish their order or the shape of the next datasets.

## What the current system gives us

The chart registry and saved `ChartSettings` union support separate panel types. Chart settings update live. The Crossfilter wrapper gives each chart one filter function and lets it render while its own filter is active. The existing filter union supports one-field values, numeric ranges, text predicates, and inclusive date ranges. It does not represent arbitrary pairs of categories, row-ID sets, or spatial polygons. Source rows have `__ID`; calculations and the newer scatter and bar work show how a visible mark can explain its inputs. This is enough to start each view with a narrow data contract. It is not a general spatial, graph, or multivariate query language.

The app already parses offset-free ISO timestamps as UTC, uses UTC date formatting, and has date-field conversion rules ([date parser](../../../packages/explorEDA/src/lib/dateTime.ts), [field settings](../../../packages/explorEDA/src/lib/fieldSettings.ts)). A calendar view should use that policy rather than silently adopting the browser's local zone. The current date filter treats its maximum as inclusive and expands a date-only maximum to the end of the UTC day ([filter code](../../../packages/explorEDA/src/hooks/applyFilter.ts)). A daily cell planner should still record exact half-open boundaries `[start, nextStart)` and verify that its source IDs agree with the linked filter at the boundary.

Across all four types, put the question-defining fields in **Data**, then only the controls needed for that view in **Display**, **Select**, and **Labels**. Keep live updates and Reset. Do not show the common Axes and Facets tabs when their controls do not apply. Save data values and field IDs, not pixel coordinates. Each planned mark should keep a stable identity, the population it depicts, its calculation or placement rule, and source IDs where that relationship is exact. Normal activation selects when a mark has a precise filter meaning. A separate Inspect action explains the mark. A guide, basemap shape, or graph-layout edge without source membership should not claim to filter records.

## 1. Calendar heatmap

**Question.** On which actual dates did activity rise, fall, or disappear? Byron's [date-filtering notes](../../transcripts/2026-06-29-date-filtering-patterns.txt) warn that selecting a visible date should mean that date instance, with its year and boundaries. They also note that a year-week grid is useful for overview but can make a particular day hard to find. Observable Plot documents a year facet with week-of-year columns and weekday rows; that is a drawing pattern, not a substitute for date and metric rules ([Plot cell](https://observablehq.com/plot/marks/cell)).

### Contrast

Scores run from 0 (the named outcome is absent) to 10 (the outcome is met). These are design judgments; no user dataset or browser test has settled them.

| Approach | Exact-day selection | Daily metric matches Line | Specific tradeoff |
| --- | ---: | ---: | --- |
| A. Month/year calendar widgets as filters | 8: dates are easy to pick, but the year overview is fragmented. | 4: each widget may calculate counts independently. | Good filter control, weak view of long patterns. |
| B. New calendar chart with its own day reducer | 9: each cell can own a UTC day. | 4: reducer and missing-day rules can diverge. | Quick renderer, weak metric agreement. |
| C. New calendar chart over the same daily result as Line | 9: cells use exact day intervals. | 9: count/sum/mean and exclusions are shared. | Requires one proven daily result first. |

**Choice:** C. Add a distinct `calendar-heatmap` type that consumes a daily result also used by calendar Line mode. A calendar layout is not a categorical heatmap with weekday and week-number strings: that would accidentally merge different years or dates. It is one cell per actual UTC day. The compact yearly grid gives overview; a visible date readout and a month/year jump make exact-day selection usable. A month grid could be a later display option using the same day result, not another metric engine.

### User settings and defaults

- **Data:** Date field; count as the initial metric; sum or mean and measure field when the user chooses them. Require a date or datetime effective type. Use the same numeric exclusion rules as the line rollup.
- **Period:** Visible year or bounded date span. A year selector and Previous/Next year are more useful than a manual 52-column scroll. Start on the latest year with valid dates, and show the span in the title. Do not use “current year” if the imported data is historical.
- **Calendar:** Week start (Sunday or Monday), weekday order, and UTC label. Choose a project default explicitly; a week may cross a year edge. Generate cells from actual dates, not `week number + weekday` alone. Keep year and day in the cell key.
- **Color:** Shared color scale over the visible comparison scope, a labeled legend, and optional value labels only when cells can fit them. Decide whether the scale stays fixed while stepping across years; default to the same domain across displayed years so color remains comparable. State the scope. Make zero, no rows, and rows with no valid measure distinct.
- **Facets:** A multi-year display is a layout of year panels, not the current generic row/column data facet. General faceting can follow only if the resulting cell count remains usable.

### Selection, trace, and edges

One cell selects `[UTC midnight, next UTC midnight)`. The first implementation can adapt that to the existing inclusive date-range filter and test the exact last millisecond. If this mapping fails for effective date values, add an exclusive-upper-bound date filter at the shared filter boundary rather than a calendar-only predicate. Single-day selection is enough initially; disjoint day sets require an explicit union model. Dragging a week or month range can follow after precise single-day behavior. Selection shows an active day chip, and clearing it restores the previous workspace population.

A cell trace names the raw date values, parsed UTC instants, day start and end, source row IDs, valid measure IDs, excluded measure IDs, reducer, value, color-domain inputs, final color, year/week/weekday position, and filtered/facet scope. A no-row day has no contributors; a zero-valued day can have contributors. An invalid date is omitted from the calendar and appears in an omitted-row count with a route to inspect it. Week 53, leap day, year boundaries, and an event at `23:59:59.999Z` are the smallest decisive fixture. D3's time intervals document day and week boundary operations and daylight-saving differences between local and UTC time ([D3 time](https://d3js.org/d3-time)).

**First proof:** Show two years of daily order counts, select one day at a year boundary, and compare its IDs with the data table and a daily Line point. The chart should remain usable at narrow width through a compact year view and keyboard day navigation, not tiny unlabeled hit targets.

## 2. Maps

**Question.** Where are records, and which named regions carry a measure? These are two data contracts. A point map uses latitude and longitude from each source row. A region map needs polygon geometry and a join from source rows to feature IDs. Drawing both on one projection does not make their selection or tracing rules interchangeable. GeoJSON specifies WGS 84 decimal-degree positions and longitude-before-latitude order; preserve that order at the import boundary ([RFC 7946](https://www.rfc-editor.org/info/rfc7946/)).

### Contrast

| Approach | Locate individual records | Explain region measure and join | Specific tradeoff |
| --- | ---: | ---: | --- |
| A. External tile map with automatic geocoding | 7: addresses may become points, but matching is opaque. | 3: region totals still need a join. | Adds a service and ambiguous locations before the data contract is known. |
| B. One generic map with points and polygons in a shared settings form | 8: points render. | 6: join rules can be exposed, but controls become crowded. | Covers both shapes while obscuring different inputs. |
| C. One Map type with explicit Point and Region modes | 9: lat/lon rows stay identifiable. | 9: region join and contributors have their own controls. | Needs a second proof for region mode. |

**Choice:** C. Register one `map` type with **Point** first and **Region** next. Use a projection library such as D3 Geo for fitting and path generation when implementation begins; its `fitExtent` API fits geometry to available space ([D3 projection](https://d3js.org/d3-geo/projection)). A small local outline can supply context for point maps, but its shapes are background, not analysis data. Keep external tiles, address geocoding, and automatic region-name guessing out of the first proof. This recommendation does not assume whether Byron's next datasets contain coordinates or region codes; that input determines which mode ships first.

### Point mode

**Data settings:** Latitude field and longitude field; optional color and size fields; fixed point size and opacity. Show coordinate order in labels and examples. Validate finite numeric conversion, latitude from -90 to 90, and longitude from -180 to 180. Do not silently swap fields if values appear reversed. Report rows with missing, invalid, or out-of-range coordinates. An optional point color should reuse the existing color-scale rules. A size field should state its area mapping and omitted-size count.

**Display settings:** Projection choice can start at one appropriate regional/world default plus **Fit data** and **Reset view**. Save the chosen projection and geographic view bounds or center/scale, not screen pixels. Resizing should refit without changing selected records. A simple local outline is enough for context. Point overlap can use opacity first; clustering or density changes mark membership and should be a later explicit mode.

**Action and trace:** Selecting one point can inspect a source row; linked selection requires a row-ID filter representation that the current filter union lacks. Therefore start with Inspect for a single point and a rectangular geographic bounds selection only when it can map to a precise lat/lon predicate. A normal map drag should pan, with a separate Select control to avoid ambiguous gestures. A point trace includes raw and effective coordinates, source ID, validity, projection name and parameters, projected position, color/size mapping, clipping, and why an offscreen point is absent. A basemap shape trace identifies the geometry source and projection but has no source-row IDs.

### Region mode

**Data settings:** Region-key field from imported rows, a GeoJSON FeatureCollection, feature-property join key, metric, and optional measure. Show a preview of key pairs before applying. Preserve typed keys or make any string conversion explicit. Report unmatched data keys, unmatched features, duplicate feature keys, and rows with missing region keys. A region with no matching rows differs from a region with zero metric and from a region with rows but no valid measure. Do not color all three the same.

**Display settings:** Projection, fit to geometry, sequential/diverging scale as metric requires, outline style, legend, and optional labels. Keep full geometry as a separate saved analysis asset or referenced local source with clear restore rules; do not hide a large GeoJSON blob inside every chart settings object. The current save format has no dedicated geometry asset model, so this is a real integration seam to prove. A region can have multiple polygon parts and cross the antimeridian; GeoJSON documents the latter explicitly ([RFC 7946](https://www.rfc-editor.org/info/rfc7946/)).

**Action and trace:** A selected feature filters the exact joined region key when that key is unique. Inspect shows the feature ID/property, join matches, source IDs, included/excluded metric rows, aggregate, fill domain, projected path, and geometry provenance. An unmatched feature offers geometry inspection but no false row selection. An unmatched source row remains visible in a warning/inspection list, even though it has no map mark. Multiple feature parts with one key act as one region. Selection of several regions can use one value filter on the region field; arbitrary spatial drawing needs a new predicate and can wait.

**First proofs:** Point mode: a few coordinates including invalid, overlapping, and near-antimeridian values; inspect each projected row and verify reset after resize. Region mode: one small GeoJSON with a matching region, unmatched source key, unmatched feature, duplicate key, zero, and invalid measure. Compare a selected region's records and metric with a pivot. No external map service is needed for either proof.

## 3. Sankey

**Question.** How do records move through an ordered set of states, and where do they branch? An ordinary imported table may have stage columns such as `received → reviewed → resolved`. A true edge list has separate source, target, and weight fields; its rows may describe transitions rather than whole entities. Those two shapes cannot promise the same path-level provenance. D3 Sankey lays out links in a directed acyclic network and supplies node and link positions; it does not define what the source rows mean ([d3-sankey](https://github.com/d3/d3-sankey/blob/master/README.md)).

### Contrast

| Approach | Follow one source row through stages | Explain a link's count | Specific tradeoff |
| --- | ---: | ---: | --- |
| A. Edge-list Sankey first | 3: an edge row does not identify a full journey. | 9: each edge has direct contributors. | Good for flow tables, weak path trace without entity/event IDs. |
| B. Ordered stage columns from the current table | 10: one row defines one complete path. | 9: adjacent stage-pair groups retain exact IDs. | Requires wide stage columns and a missing-stage policy. |
| C. Universal graph model for both inputs | 8: possible with entity joins. | 8: possible with lineage rules. | Too many ambiguous conversions before either input is proven. |

**Choice:** B for the first exploratory Sankey. This is an assumption about the first useful dataset, not a claim that edge lists are unimportant. Make the input mode visible. Add **Edge list** as a separate mode if Byron's real data consists of source/target rows. Do not infer whole journeys from edge rows without an entity ID and event order. A stage-column graph is acyclic by construction when node identity includes stage index, even if the same label appears in two stages. Do not use label alone as node ID.

### User settings and defaults

- **Data:** An ordered list of at least two categorical stage fields. Reorder by dragging or keyboard buttons, with a clear list of current stages. Count rows first. Later allow a nonnegative measure that has the same value for one entity at each stage; otherwise widths do not conserve and the chart must say so. Reject negative/nonfinite link widths rather than drawing them as positive flow.
- **Missing stage:** Default to omitting incomplete paths from the diagram with a visible count and Inspect route. Offer an explicit “Missing” state when missingness itself is the question. Skipping a middle stage would invent a direct transition, so never do that silently.
- **Display:** Stable stage order; node order initially based on value, with a user override only if automatic ordering hides an important path. Controls for node/flow color, label density, and minimum visible link width. A visual minimum must not change the metric shown in the tooltip. Limit high-cardinality stages with a visible warning before creating an Other node; an Other flow needs exact member categories and row IDs.
- **Scope:** Explain that link widths use the current workspace population. A chart's own selection should dim other flows while preserving enough context to clear it. The source row count, complete-path count, and per-stage totals must be visible. Sum of all links is not a count of distinct records because each complete row appears once per transition.

### Actions and trace

A node selects its specific stage field and typed category value. One link selects the intersection of its adjacent stage fields; this fits two current value filters for a single link. Selecting two nonadjacent links or several arbitrary node/link pairs requires tuple unions and is deferred. Use a separate Inspect control for node or link contributors. A link trace shows stage indexes and field names, typed source/target values, exact row IDs, included/excluded measure rows, metric, link width before and after layout, source/target node positions, and color rule. A node trace shows incoming and outgoing link IDs and row sets. A path trace, if offered, must follow the same source IDs across every stage; it cannot be inferred by concatenating large links that merely share a node. Layout movement or resize changes geometry, not node/link membership.

The layout library may compute a node width from link values, but the app must report its own metric and conservation checks. If incoming and outgoing totals differ because paths were dropped or weights changed, show the difference. Do not interpret layout-generated `node.value` as a business total without checking its rule. An edge-list version must define duplicate-edge aggregation, self-links, cycles, and whether one record can contribute to several edges. The standard d3-sankey input is acyclic; cyclical data needs an explicit decision or a different layout, not a silent attempt to force it through ([d3-sankey](https://github.com/d3/d3-sankey/blob/master/README.md)).

**First proof:** Three categorical stage fields on a small table with a branch, merge, repeated labels across stages, a missing middle value, and an active external filter. Compare each link's IDs to a direct table query; select one link and confirm linked views, Inspect, clear, and saved restoration. Use a bounded layout size and keyboard node/link list at narrow widths rather than requiring users to target hairline paths.

## 4. Parallel coordinates

**Question.** Which rows share a multivariate pattern, and what happens when I constrain several axes? Each source row becomes one polyline crossing ordered field axes. Vega's interactive example supports axis reordering and brushes; these interactions show the correct control model but do not supply explorEDA's filter and trace semantics ([Vega interactive parallel coordinates](https://vega.github.io/vega/examples/parallel-coordinates-interactive/)).

### Contrast

| Approach | Preserve row identity across axes | Multi-axis linked selection | Specific tradeoff |
| --- | ---: | ---: | --- |
| A. Normalize fields into one global numeric scale | 9: a row remains one line. | 7: brushes work, but raw bounds are harder to read. | Makes unlike units appear comparable. |
| B. Independent scale per field with one line per row | 10: each vertex retains row and field. | 9: each axis brush maps back to that field. | Axis labels and scale meaning need space. |
| C. Aggregate ribbons or density instead of rows | 3: individual paths disappear. | 5: brushing needs an approximate group-to-row rule. | Useful later for heavy overlap, not for first row trace. |

**Choice:** B. Add a `parallel-coordinates` type. Begin with three to six numeric fields, one independent scale per axis, one polyline per source row, and one numeric range brush per axis. This uses existing range predicates: AND across axes, with each brush saved in data units, not pixels. The existing scatter Canvas path and source-ID trace are more relevant than a new chart grammar. SVG axes and brush controls can sit above a Canvas line layer. Do not claim a Canvas renderer alone will be responsive; test filter-to-paint and axis drag on a named row count.

### User settings and defaults

- **Data:** Ordered axis fields. A searchable picker and move-left/right controls keep order visible; drag reordering is optional. Choose numeric fields by default. One optional color field reuses the shared color scale. Show how many rows lack at least one chosen value.
- **Axes:** Each axis has a field-aware label, scale and domain, inversion, and a Reset domain control. Reordering axes changes the display only. Inversion changes vertical mapping only. Neither may change active row selection. Locking a domain must state whether it clips lines or only changes the view. Do not silently treat normalized 0–1 positions as the original units.
- **Selection:** Drag a range on one axis, then another; their predicates intersect. Show each field's active bounds in the existing filter-status area and provide precise numeric inputs and clear buttons. A click on a line opens row Inspect at first; linked selection of a single row would need an explicit ID filter. Axis brushing is the primary linked-selection action.
- **Display:** Adjustable line opacity and stroke width, with selected rows emphasized. Keep the full population faintly visible when this chart's own brushes apply, following the current own-filter context rule. Cap the first proof to a manageable number of axes and lines, with a visible message when rendering uses a sample or requires narrowing. A sample must never silently determine the filter or trace IDs.

**Mixed axes:** Byron's [advanced-chart notes](../../transcripts/2026-08-04-advanced-chart-specs-and-transforms.txt) describe categorical band scales and stable jitter. Add categorical axes in a second slice: map category values to a band, with deterministic jitter derived from `source ID + field ID`, so rerendering, resizing, and filtering do not reshuffle lines. The jitter is presentation only; a category brush selects actual typed values. Missing numeric or categorical values need an explicit omit-or-gap setting. Default to omitting incomplete lines and report exact excluded IDs; drawing a gap can follow when the user needs partial records. A categorical axis with many values should be rejected or grouped only with a visible membership list.

### Trace and proof

A polyline trace names its source ID, each axis's raw/effective value, validity, field type, domain, inversion, normalized value, final position, color, and selected/dimmed state. An axis trace names its field, scope used to set its domain, ticks, active brush data bounds, and any rows omitted from that axis. A line segment trace identifies its two field endpoints, not a derived correlation. A brush trace shows the data-unit predicate, matching IDs, and whether the chart's own filter is excluded from its context. Changing axis order must not change source membership or the saved brush. Vega's example shows interactive brushing and reordering; D3 Brush documents the one-dimensional gesture and programmatic selection model ([Vega example](https://vega.github.io/vega/examples/parallel-coordinates-interactive/), [D3 brush](https://d3js.org/d3-brush)).

**First proof:** Four numeric fields and a fixed table with missing values, equal values, and one outlier. Brush two axes, reorder and invert axes, resize, restore a save, and confirm the same source IDs remain selected. Then test one categorical axis with stable jitter before calling mixed axes complete. Keyboard users need a row search/Inspect route and numeric bounds controls; they should not have to pick a thin polyline.

## Order, shared seams, and the missing dataset facts

These four should leave the old “defer until someday” list. They still should not be one implementation ticket. The lowest-dependency first proof is **Calendar heatmap** once daily rollup is defined. **Parallel coordinates** can be a separate row-level proof using current field and filter behavior. **Point Map** follows when a lat/lon dataset is at hand; Region Map needs a geometry asset and join proof. **Sankey** follows when an ordered stage table is available; an edge list changes the input model. This is an order based on known repository seams, not a claim about Byron's preferred charts.

Two dataset facts could reorder the work: whether the first map data has coordinates or region keys, and whether the first flow data has stage columns or edge rows. Decide those from real data before implementation. Calendar and parallel-coordinate research can proceed without them.

Do not introduce a universal mark schema, external tile service, geocoder, graph database, or generic multiselect query engine for these first proofs. Share the daily result across Line and Calendar; use the same metric reducer where Sankey widths or region fills need it; retain source IDs per mark. Each new renderer can be registered separately and removed without altering old saved charts. Check fixed-data semantics, keyboard paths, and 1280/783/390 px layouts before calling a slice complete.

## Evidence and limits

Repository anchors: [`ChartTypes.ts`](../../../packages/explorEDA/src/types/ChartTypes.ts), [`FilterTypes.ts`](../../../packages/explorEDA/src/types/FilterTypes.ts), [`CrossfilterWrapper.ts`](../../../packages/explorEDA/src/hooks/CrossfilterWrapper.ts), [`ChartSettingsContent.tsx`](../../../packages/explorEDA/src/components/ChartSettingsContent.tsx), [`dateTime.ts`](../../../packages/explorEDA/src/lib/dateTime.ts), [`applyFilter.ts`](../../../packages/explorEDA/src/hooks/applyFilter.ts), and the [scatter trace status](../deterministic-rendering-and-data-traceability/scatter-tracing-status.md). External references are primary format and library documentation. Their examples establish semantics and available layout operations, not performance or correctness inside explorEDA. I reviewed source and documentation. I did not test a live implementation of these four views.
