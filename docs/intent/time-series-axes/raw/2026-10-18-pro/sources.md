# Sources and evidence limits

**Research access date: 2026-10-19 UTC.** This date applies to every public source below. The assignment date is 2026-10-18 in America/Indianapolis. Dates attached to individual sources are publication, release or version dates, not the date the research was performed.

This source ledger supports the research and proposed design for arbitrary per-series Y scales and time-series improvements in explorEDA. Recommendations and design scores are judgments for the stated tasks, not vendor benchmarks or measured product usability. Proposed changes remain unapproved.

## Evidence labels and research method

- **Verified source fact:** supported by the inspected selected-source packet and exact repository path/symbol.
- **Documented:** stated by the relevant vendor or open-source project in official documentation, release notes, source documentation or an identified product-admin response.
- **Observed:** requires directly operating a product with real input and recording the result. No live industrial system or provider demo was operated for this assignment; no such product-behavior claims are made.
- **Inference / proposal:** a design implication, comparative score, engineering estimate or recommended explorEDA behavior derived from the evidence. These are explicitly distinct from existing app behavior.

Public research used current official sources. Decisive documentation was opened directly; a second search route was used to check current sources and status where useful. Irrelevant search results were discarded. Reading vendor examples, manuals, screenshots or demo code does not establish interaction speed, keyboard access, touch quality or responsive usability.

## Repository access and packet integrity

| Audit item | Result |
| --- | --- |
| Repository identified by the supplied manifest | [byronwall/explorEDA](https://github.com/byronwall/explorEDA) |
| Selected baseline | `9b16d78e3ed0742ed4d5858c1939fec9e758b510` |
| Source route actually used | The attached `source-packet.txt` selected-source snapshot |
| Integrity checks | All **34 files** matched their manifest byte counts and SHA-256 hashes; **568,336 source bytes** in total |
| Review coverage | **31 files read in full**: 21 code/test files and 10 governance, documentation and package files; relevant sections inspected in 3 large demo catalogs |
| Independent GitHub baseline check | Opening the exact GitHub commit tree returned `DisabledError`; no independent Git-tree proof was obtained |
| Execution status | No runnable checkout, application tests, builds, live product demos or benchmarks were used |

The integrity checks establish that the inspected bytes match the supplied manifest. They do not independently authenticate the manifest's association with a Git object. Attribution to the exact baseline therefore relies on the user-provided packet. Repository paths cited throughout the deliverables refer to that packet, not to an independently inspected current default branch.

The packet contains the required core chart, axis, trace, settings, governance and documentation context for the bounded research/design assignment. Full implementation ownership outside this selected context must be verified by Codex before integration. Those follow-up gates should not be mistaken for missing core packet files or for completed runtime validation.

### Complete packet inventory

Every file below passed the byte-count and SHA-256 comparison. “Targeted” means relevant time-series, line, filter, annotation or demo wiring sections were inspected; the catalog was not read in full.

- `AGENTS.md` — **Full**; 4,033 bytes.
- `docs/agent-guide.md` — **Full**; 19,779 bytes.
- `docs/ui-defaults.md` — **Full**; 19,093 bytes.
- `CODING_STANDARDS.md` — **Full**; 2,213 bytes.
- `README.md` — **Full**; 10,263 bytes.
- `package.json` — **Full**; 1,258 bytes.
- `packages/explorEDA/package.json` — **Full**; 6,082 bytes.
- `packages/explorEDA/src/types/ChartTypes.ts` — **Full**; 7,239 bytes.
- `apps/demo/src/docs/pages/line.mdx` — **Full**; 2,652 bytes.
- `apps/demo/src/demos/examples.ts` — **Targeted**; 56,494 bytes.
- `apps/demo/src/demos/coverage.ts` — **Targeted**; 52,454 bytes.
- `apps/demo/src/demos/dashboardSettings.ts` — **Targeted**; 186,846 bytes.
- `docs/intent/progressive-built-in-charts/shape-brief.md` — **Full**; 5,245 bytes.
- `docs/intent/progressive-built-in-charts/implementation-plan.md` — **Full**; 12,910 bytes.
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx` — **Full**; 9,709 bytes.
- `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts` — **Full**; 15,867 bytes.
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx` — **Full**; 17,625 bytes.
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.test.tsx` — **Full**; 6,132 bytes.
- `packages/explorEDA/src/components/charts/LineChart/definition.ts` — **Full**; 3,679 bytes.
- `packages/explorEDA/src/components/charts/LineChart/LineChart.test.tsx` — **Full**; 4,233 bytes.
- `packages/explorEDA/src/components/charts/LineChart/timeSeriesTrace.ts` — **Full**; 1,490 bytes.
- `packages/explorEDA/src/components/charts/LineChart/LineSeriesSettings.tsx` — **Full**; 3,689 bytes.
- `packages/explorEDA/src/components/charts/LineChart/areaCharts.test.tsx` — **Full**; 5,947 bytes.
- `packages/explorEDA/src/components/charts/LineChart/LineChartSettingsPanel.tsx` — **Full**; 5,473 bytes.
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesTraceBody.tsx` — **Full**; 8,266 bytes.
- `packages/explorEDA/src/components/charts/LineChart/LineChart.tsx` — **Full**; 30,249 bytes.
- `packages/explorEDA/src/components/charts/Axis/axisPlan.ts` — **Full**; 16,789 bytes.
- `packages/explorEDA/src/components/charts/Axis/axisBounds.ts` — **Full**; 6,463 bytes.
- `packages/explorEDA/src/components/charts/Axis/numericScale.ts` — **Full**; 923 bytes.
- `packages/explorEDA/src/components/charts/Axis/AxisLayer.tsx` — **Full**; 10,241 bytes.
- `packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx` — **Full**; 16,253 bytes.
- `packages/explorEDA/src/lib/chartUtils.ts` — **Full**; 2,932 bytes.
- `packages/explorEDA/src/lib/dailyRollup.ts` — **Full**; 5,589 bytes.
- `packages/explorEDA/src/lib/valueParsing.ts` — **Full**; 10,226 bytes.

### Codex verification gates outside the selected packet

The following referenced dependencies and ownership paths were not included in the selected packet. Their behavior must be read and tested in the full repository before implementing the proposal:

- **Data population and settings ownership:** `packages/explorEDA/src/providers/DataLayerProvider`, `packages/explorEDA/src/components/charts/useGetLiveData`, `packages/explorEDA/src/components/charts/useGetColumnData`, `packages/explorEDA/src/hooks/applyFilter`, and `packages/explorEDA/src/components/charts/BaseChart`. Verify shared filters, local filters, facet populations, draft changes and provider writes.
- **Serialization, import and undo:** `packages/explorEDA/src/utils/saveDataUtils`, `packages/explorEDA/src/components/charts/InPlace/useChartEdit`, `packages/explorEDA/src/components/charts/InPlace/axisDrag`, `packages/explorEDA/src/components/charts/InPlace/AxisLimitFields`, and the actual storage/hydration owner. Verify saved-setting validation, import behavior, legacy meaning and one undo step per committed edit.
- **Annotations and trace:** `packages/explorEDA/src/lib/annotations/types`, `packages/explorEDA/src/components/charts/annotations/ChartAnnotations`, `packages/explorEDA/src/components/charts/trace/ChartTraceScope`, and `packages/explorEDA/src/components/charts/trace/traceTypes`. Verify scale ownership, original row IDs, interval contributors and annotation attachment semantics.
- **Formatting and analytical helpers:** `packages/explorEDA/src/lib/aggregates`, `packages/explorEDA/src/lib/fieldSettings`, `packages/explorEDA/src/lib/categories`, and `packages/explorEDA/src/components/charts/chartAccessibility`. Verify units/formatting, category identity, aggregate populations and semantic keyboard controls.
- **Export/render host:** locate the actual PNG/SVG/other export and embedding paths; their exact modules were not established in the packet. Verify that a saved or exported view communicates every independent scale without relying on a temporary hover state.

Paths without an extension above are import stems as referenced by the supplied source; their resolved filenames remain a local repository check. Existing test files were read as statements of intended coverage. No test is reported as passing unless Codex runs it later.

## Industrial systems

### IND-01 — Seeq: Adjusting Signal Lanes, Axes & Formatting

- **Source:** [Official knowledge base](https://support.seeq.com/latest/cloud/adjusting-signal-lanes-axes-formatting).
- **Version/date:** rolling `latest/cloud` documentation; no exact installed release or publication date established.
- **Supports:** separate lane and axis-group assignments; combining lanes while preserving bounds; sharing limits; separate lanes with automatic scales; left/right or hidden labels; fixed versus displayed-time autorange; sample markers, unit labels and cursors.
- **Limit:** feature documentation, not a usability test. It does not establish the proposed explorEDA focus-only axis. Its visible-time autorange should not be assumed to match explorEDA's filter-domain contract.

### IND-02 — Seeq: Adjusting Time Ranges

- **Source:** [Official knowledge base](https://support.seeq.com/latest/cloud/adjusting-time-ranges).
- **Version/date:** rolling `latest/cloud` documentation; exact release unspecified.
- **Supports:** distinct Display and Investigation ranges, direct start/end/duration entry, axis-region pan/zoom, duration-based paging and a contextual minimap.
- **Limit:** documented range navigation does not prove keyboard/touch quality. It is a reference for separating viewport scope from surrounding context, not evidence that a date gesture should mutate explorEDA row filters.

### IND-03 — Seeq: Signal Summarization

- **Source:** [Official knowledge base](https://support.seeq.com/latest/cloud/signal-summarization).
- **Version/date:** rolling `latest/cloud` documentation.
- **Supports:** retaining extrema when the display lacks pixels; Automatic and Fixed Average visual summarization; conditions using unsummarized signal values.
- **Limit:** a conceptual fidelity reference, not proof of explorEDA's reducer or source-trace implementation. No performance measurements were taken.

### IND-04 — Seeq: Displaying Signal or Capsule Properties and Statistics

- **Source:** [Official knowledge base](https://support.seeq.com/latest/cloud/displaying-signal-or-capsule-properties-and-statis).
- **Version/date:** rolling `latest/cloud` documentation.
- **Supports:** configurable per-item properties and statistics in the Details Pane, including lane and description; display-range statistics distinguished from capsule statistics.
- **Limit:** does not establish a preferred default density for explorEDA or the quality of a twenty-series layout.

### IND-05 — AVEVA: PI Vision Extensibility Guide

- **Source:** [Official AVEVA repository](https://github.com/AVEVA/AVEVA-Samples-PI-System/blob/main/docs/PI-Vision-Extensibility-Docs/PI%20Vision%20Extensibility%20Guide.md).
- **Version/date:** rolling repository `main`; no product-version pin established.
- **Supports:** `MultipleScales` selects independent per-trace scaling; recorded values and plot values are distinct; trend metadata includes scale bounds, steppedness and error/recorded markers.
- **Limit:** an extension contract does not prove the complete UI. Vendor-native code and bundled third-party libraries cannot be assumed reusable under a PI Vision license; no such reuse is proposed.

### IND-06 — AVEVA: PI Vision Basics v2024

- **Source:** [Official learning workbook, 88 pages](https://osicdn.blob.core.windows.net/learningcontent/Online%20Course%20Workbooks/PI%20Vision%20Basics%20v2024.pdf).
- **Version/date:** explicitly **2024**; official OSIsoft/AVEVA training-content CDN.
- **Supports:** trend/trace ranges, reset, markers, outside-plot labels, ad hoc workspace and distinct time scopes. A monitor-mode cursor appears across trends in the display; selecting an item highlights its trace.
- **Limit:** 2024 behavior cannot be assumed unchanged in all later versions. Relevant material appears in printed pages 35–41, 67 and 82–83; no training environment was operated.

### IND-07 — AVEVA: Trend: Scale grouping

- **Source:** [Official product-admin response](https://pisystem.feedback.aveva.com/ideas/PIVISION-I-17).
- **Version/date:** **2025-12-15** admin response, explicitly **PI Vision 2025**.
- **Supports:** vendor confirmation that grouped scaling was completed in PI Vision 2025.
- **Limit:** this is an identified vendor response, not an endorsement of surrounding user comments. The linked current user-guide text could not be extracted, so granular configuration semantics are bounded accordingly.

### IND-08 — AVEVA: Multiple y Axis

- **Source:** [Official product-admin response](https://pisystem.feedback.aveva.com/ideas/PIVISION-I-736).
- **Version/date:** **2025-12-15** admin response, explicitly **PI Vision 2025**.
- **Supports:** completion of the request through grouped scaling for same-unit or same-attribute traces; the vendor explicitly separates moving scales to the right side into another request.
- **Limit:** the status “Completed” is not proof of an arbitrary collection of left/right visible rulers. Multiple transformations, shared groups and axis placement must remain distinct concepts.

### IND-09 — AVEVA: Why we’re retiring AVEVA PI System’s PI ProcessBook

- **Source:** [Official retirement/transition announcement](https://www.aveva.com/en/perspectives/blog/why-we-are-retiring-aveva-pi-systems-pi-processbook/).
- **Version/date:** **2021-10-20**.
- **Supports:** ProcessBook retirement direction and transition to the browser-based PI Vision product.
- **Limit:** no exact support-end date was verified from this source. ProcessBook is legacy context, not a current new-platform recommendation; this does not identify the user's remembered plant tool.

### IND-10 — AspenTech MES122: Aspen Process Explorer: Using and Configuring

- **Source:** [Official course description and agenda](https://esupport.aspentech.com/UniversityCourse?id=a3p0B0000004YoIQAU).
- **Version/date:** current public course page; no versioned manual or publication date established.
- **Supports:** distinguishes Aspen Process Explorer, aspenONE Process Explorer, Aspen Process Data Add-in and IP.21 Process Browser. Lists timeline scopes, time shift, zoom, scooters, data tables, pen scaling/sampling and saved workspaces.
- **Limit:** a course agenda does not establish precise arbitrary-axis grouping, focus-axis behavior or scooter interaction semantics. These remain not verified, rather than absent.

### IND-11 — AspenTech MES1200: Calculations and Data Analysis for Engineers

- **Source:** [Official course description and agenda](https://esupport.aspentech.com/UniversityCourse?id=a3p0B0000004YmhQAE).
- **Version/date:** current public course page; exact product version unspecified.
- **Supports:** Aspen Process Data is an **Excel add-in** for accessing plant data; distinguishes that workflow from Process Explorer.
- **Limit:** does not prove a rename, identical capabilities across installations or the identity of the remembered Internet Explorer application.

### IND-12 — AspenTech: aspenONE Process Explorer data sheet AT-4592

- **Source:** [Official two-page data sheet](https://home.aspentech.com/-/media/aspentech/home/resources/data-sheet/pdf/fy25/q5/at-4592-update-branding-a1pe-data-sheet-v1.pdf).
- **Version/date:** copyright **2025**; no installed release specified.
- **Supports:** continuing A1PE name and web visualization/analysis role for historical time series and event/batch data; dashboards combining trends, tables and other elements.
- **Limit:** broad marketing material supports identity and scope, not granular axis checkmarks, accessibility claims or measured interaction quality.

### IND-13 — AspenTech: Manufacturing Execution Systems V15 Platform Specifications

- **Source:** [Official supported-platform matrix](https://www.aspentech.com/-/media/aspentech/home/platform-support/v15/v15messpecs.pdf).
- **Version/date:** **V15**; rolling vendor PDF, exact publication date unspecified.
- **Supports:** A1PE appears as aspenONE Process Explorer Client in the V15 supported-platform documentation.
- **Limit:** does not establish newest patch, UI details or performance. The report does not infer product retirement from older desktop material.

### IND-14 — Seeq: Interpolation

- **Source:** [Official knowledge base](https://support.seeq.com/latest/cloud/interpolation).
- **Version/date:** rolling `latest/cloud` documentation.
- **Supports:** Linear, Step, Pi Linear and Discrete semantics; maximum interpolation and invalid-value gaps; the risk of connecting aggregate interval values; difficulty targeting discrete samples with a cursor.
- **Limit:** these are analytical concepts to adapt locally. Historian-wide overrides and Pi Linear streaming behavior are not proposed for explorEDA.

## Grafana and visualization libraries

### P01 — Grafana: Time series visualization

- **Source:** [Official latest documentation](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/time-series/).
- **Version/date:** mutable `latest`; no deployed Grafana version verified.
- **Supports:** multiple Y axes through overrides, unit-based axis placement, tooltip focus, soft/hard ranges, null-connection thresholds and time navigation. The documented data format expects unique timestamps per series.
- **Limit:** configurable axes do not establish a usable twenty-axis layout, duplicate support or focus-only axis UX. Its dashboard time navigation is not equivalent to explorEDA linked row filtering.

### P02 — Highcharts: Axes

- **Source:** [Official chart-concepts guide](https://www.highcharts.com/docs/chart-concepts/axes).
- **Version/date:** mutable guide; no fixed API version.
- **Supports:** multiple axis entries, series ownership of axes, shared axes, opposite-side placement and tick-alignment tradeoffs.
- **Limit:** coordinate primitives do not provide the proposed complete scale-group interaction or source-row semantics. A renderer experiment would need a selected-version configuration.

### P03 — Highcharts Stock: Data grouping

- **Source:** [Official Stock guide](https://www.highcharts.com/docs/stock/data-grouping).
- **Version/date:** mutable guide.
- **Supports:** grouping enabled by default; line groups average values unless configured otherwise; visible-range versus `groupAll` distinctions.
- **Limit:** default financial summarization is not an extrema-preservation guarantee. Grouped points cannot be assumed to preserve explorEDA row identity or exact cursor values.

### P04 — Highcharts Stock: xAxis.ordinal

- **Source:** [Official API reference](https://api.highcharts.com/highstock/xAxis.ordinal).
- **Version/date:** page identifies **13.1.0**.
- **Supports:** default ordinal spacing suppresses physical gaps in time, with a documented boost exception; `ordinal: false` preserves elapsed-time spacing.
- **Limit:** process tags and missing calendar periods require explicit elapsed-time semantics. This page's version is older than the release inventory in P23.

### P05 — Highcharts Stock: Navigator

- **Source:** [Official Stock guide](https://www.highcharts.com/docs/stock/navigator).
- **Version/date:** mutable guide.
- **Supports:** a full-data overview controlling visible time through pan/zoom.
- **Limit:** the analytical value and space cost of an overview must be proven in explorEDA's target layouts. A navigator does not resolve selection-versus-filter semantics by itself.

### P06 — Highcharts: Accessibility module feature overview

- **Source:** [Official accessibility guide](https://www.highcharts.com/docs/accessibility/accessibility-module-feature-overview).
- **Version/date:** mutable guide.
- **Supports:** optional keyboard and screen-reader navigation, chart/axis descriptions and non-color distinctions such as markers/patterns.
- **Limit:** vendor capability documentation is not independent conformance testing and does not certify the proposed explorEDA workflow.

### P07 — Highcharts: Tooltip; Highcharts Stock: tooltip.shared

- **Sources:** [Tooltip guide](https://www.highcharts.com/docs/chart-concepts/tooltip) and [shared-tooltip API reference](https://api.highcharts.com/highstock/tooltip.shared).
- **Version/date:** mutable guide; shared API page identifies **13.1.0**.
- **Supports:** shared, split and fixed readout choices; Stock crosshairs. Shared tooltips refer to points with the same X value.
- **Limit:** same-X behavior does not define a complete irregular-series inspection policy. Precise sample time, duplicates, gaps and row IDs remain application responsibilities.

### P08 — Highcharts Stock: Compare

- **Source:** [Official Stock guide](https://www.highcharts.com/docs/stock/compare).
- **Version/date:** mutable guide.
- **Supports:** value/percentage change comparison based on a first visible or pre-range value.
- **Limit:** rebasing can change the visual interpretation when navigating time. Any explorEDA indexed mode needs an explicit stable baseline and original-value readout.

### P09 — Plotly.js: Multiple axes

- **Source:** [Official JavaScript examples](https://plotly.com/javascript/multiple-axes/).
- **Version/date:** mutable documentation including a **v4** tick-synchronization change; examples read, not executed.
- **Supports:** trace-to-axis references, shared groups and overlaid axes.
- **Limit:** tick synchronization is not equality of physical scales. Axis placement examples do not establish a responsive twenty-series experience or the proposed focused-axis UX.

### P10 — Plotly.js: Layout reference

- **Source:** [Official layout schema](https://plotly.com/javascript/reference/layout/).
- **Version/date:** mutable schema; no selected installed version.
- **Supports:** unified hover with at most one entry per trace near the closest coordinate; hover across stacked subplots sharing an axis; distinct zoom/pan/select/lasso modes, with select/lasso limitations for scatter markers/text.
- **Limit:** one hover entry cannot expose every duplicate source observation. Native drag modes do not replace explorEDA's filter and navigation decisions.

### P11 — Plotly.js: Scatter reference

- **Source:** [Official scatter schema](https://plotly.com/javascript/reference/scatter/).
- **Version/date:** mutable schema.
- **Supports:** array-based trace data and configurable `connectgaps`.
- **Limit:** null connection alone does not detect long elapsed gaps between irregular samples. No complete duplicate or provenance behavior is inferred.

### P12 — Plotly.js: Subplots

- **Source:** [Official JavaScript examples](https://plotly.com/javascript/subplots/).
- **Version/date:** mutable examples; read, not executed.
- **Supports:** subplot construction and shared axes.
- **Limit:** supports shared-time lane primitives, not a finished lane-management, keyboard or responsive design.

### P13 — Plotly.js: Range slider and selector

- **Source:** [Official JavaScript examples](https://plotly.com/javascript/range-slider/).
- **Version/date:** mutable examples; read, not executed.
- **Supports:** range sliders and selector controls.
- **Limit:** the effect on explorEDA state, linked filters and source domains would still require explicit integration policy and tests.

### P14 — Plotly.js: Releases

- **Source:** [Official project releases](https://github.com/plotly/plotly.js/releases).
- **Version/date:** latest listed release observed was **v4.1.2**, **2026-10-05**.
- **Supports:** current published version context.
- **Limit:** no version was installed or benchmarked. Mutable documentation and examples should be checked against a chosen release before a renderer experiment.

### P15 — Apache ECharts: Axis

- **Source:** [Official handbook](https://echarts.apache.org/handbook/en/concepts/axis/).
- **Version/date:** mutable handbook.
- **Supports:** multiple axes, offsets, series `yAxisIndex`, time-axis configuration, axis-triggered pointers and a dataZoom example.
- **Limit:** API primitives do not establish complete scale attribution, exact data trace, or twenty-axis usability. Dynamic option pages were not fully readable through the research route.

### P16 — Apache ECharts: ARIA

- **Source:** [Official accessibility handbook](https://echarts.apache.org/handbook/en/best-practices/aria/).
- **Version/date:** mutable handbook.
- **Supports:** optional descriptions and decals; guidance to curate long generated descriptions.
- **Limit:** this is not a complete keyboard-accessibility claim. The handbook mixes `aria.show` and `aria.enabled` terminology; production configuration must be verified against a selected-version API.

### P17 — Apache ECharts: Changelog

- **Source:** [Official changelog](https://echarts.apache.org/en/changelog.html).
- **Version/date:** first listed entry observed was **v6.1.0**, **2026-05-18**.
- **Supports:** release context, exclusion of nonpositive values on log axes and a tooltip formatter change distinguishing original data indices from dataZoom-filtered indices.
- **Limit:** release-note behavior was not tested locally. Log exclusions must not silently hide data, and provider indices must not replace source IDs.

### P19 — uPlot: Current documentation

- **Source:** [Official project documentation](https://leeoniya.github.io/uPlot/docs/).
- **Version/date:** current source-tree documentation; not pinned to the latest published release.
- **Supports:** scale keys independent of visible axes; shared/independent scale mappings; gap connection and multiple data modes.
- **Limit:** do not attribute every current or experimental API to release 1.6.32. Optional axes establish a primitive, not the proposed complete focus-only experience.

### P20 — uPlot: Data modes

- **Source:** [Official project documentation](https://leeoniya.github.io/uPlot/docs/data-modes.html).
- **Version/date:** current source-tree documentation; release mapping unverified.
- **Supports:** aligned mode with shared sorted/unique X; faceted mode with unrelated per-series X arrays; application-supplied hover lookup and differing Y-range scans in faceted mode.
- **Limit:** the blanket statement that uPlot only supports aligned data would be inaccurate for these docs. Faceted data support does not automatically solve duplicate inspection, hover or stable domains.

### P21 — uPlot: Project README and feature inventory

- **Source:** [Official repository](https://github.com/leeoniya/uPlot).
- **Version/date:** current repository default branch.
- **Supports:** project features including live legend values, cursor synchronization, multiple scales and closest-series focus.
- **Limit:** project benchmark claims are not explorEDA measurements. Closest-series emphasis is distinct from exposing only a selected scale's visible axis.

### P22 — uPlot: Releases

- **Source:** [Official project releases](https://github.com/leeoniya/uPlot/releases).
- **Version/date:** latest listed release observed was **1.6.32**; exact publication date not established in this research.
- **Supports:** published-release context.
- **Limit:** does not bind all current source-tree documentation to that release. A later prototype must pin and test one version.

### P23 — Highcharts: Release changelog

- **Source:** [Official changelog](https://changelog.highcharts.com/).
- **Version/date:** Stock **13.1.1**, **2026-09-20**, listed at access.
- **Supports:** latest release context observed during research.
- **Limit:** individual API pages exposed 13.0.1 or 13.1.0 metadata. General guide text and copied examples must not be assumed version-identical.

## Supplemental pinned documentation

These sources are useful background but are not decisive evidence for current release defaults. Their source-control revisions are fixed; their mapping to ECharts 6.1.0 was not verified.

### P18a — Apache ECharts: Pinned line-series documentation

- **Source:** [Official Apache snapshot at 96665171db7d6f45c101cd3ea27b8efa8fd83eb0](https://apache.googlesource.com/echarts-doc/%2B/96665171db7d6f45c101cd3ea27b8efa8fd83eb0/en/option/series/line.md).
- **Supports only within this snapshot:** configurable line sampling and smoothing choices.
- **Limit:** no unconditional extrema-preservation guarantee, current-default claim or benchmark should be inferred from a sampling option's name or its descriptive text.

### P18b — Apache ECharts: Pinned tooltip/axis-pointer documentation

- **Source:** [Official Apache snapshot at b3f88a6049c8206c87aa08c5bec7cfbb11b8fc94](https://apache.googlesource.com/echarts-website/%2B/b3f88a6049c8206c87aa08c5bec7cfbb11b8fc94/en/documents/option-parts/option.tooltip.json).
- **Supports only within this snapshot:** linked axis-pointer and draggable pointer-handle concepts.
- **Limit:** mapping to the current release is unverified; no claim of tested touch quality or a ready-made explorEDA interaction follows.

## Access limitations and excluded conclusions

- **AVEVA dynamic documentation:** current [PI Vision release notes](https://docs.aveva.com/bundle/pi-vision/page/1564792.html) and [trend configuration](https://docs.aveva.com/bundle/pi-vision/page/1009717.html) were located through official product responses, but the reader received a JavaScript shell. The 2025 grouping claim uses IND-07/IND-08; older detailed interactions are explicitly scoped to IND-06's 2024 workbook.
- **Aspen granular axes:** public naming and general trend functionality were established, but detailed current arbitrary-group, focus-axis and scooter semantics were not. The absence of verification is not evidence of feature absence.
- **Seeq version:** rolling `latest/cloud` pages expose alternative release branches. No claim is made that the word “latest” maps to a specific installed R65/R58 release.
- **Live evidence:** no vendor system or provider demo was operated with keyboard/pointer input; no live explorEDA UI, application tests, accessibility audits, screenshot comparisons or performance benchmarks were run from this packet.
- **Provider replacement and licensing:** the recommendation retains the existing React/TypeScript/D3 framework. No procurement or replacement decision is implied. A future library experiment must verify the selected version's license and embedding terms from current authoritative sources.
- **Product identity:** industrial patterns do not identify the user's remembered chemical-plant tool. “Its own scale/axis” remains an interpretation of the unfinished recollection.
- **Evidence excluded from decisive claims:** third-party manual mirrors, unverified community complaints, competitor comparisons, marketing performance percentages and unsupported library feature checkmarks.

Every proposed implementation, accessibility and performance claim remains subject to the acceptance and rejection gates in the design and implementation plan. Documentation establishes available concepts and stated behavior; the local Codex proof establishes whether the proposed explorEDA experience works.
