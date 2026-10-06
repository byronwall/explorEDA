# Coverage matrix reconciliation

Reviewed against `362db58` on 2026-10-05. The runtime manifest is unchanged.
All 52 row comments are accepted with the scope limits below.
All 19 examples retain their recorded assignments. No new assignment is marked reviewed.

## Count and meaning

The actual TypeScript declarations match Pro's transcription: 52 rows, 19 examples, and 182 assignments.
There are 51 supported rows, 30 rows with a historical reviewed assignment, and 37 reviewed assignments across seven examples.
Twenty-two rows meet the current Needs attention rule. Zero explicit gap strings does not mean zero transcript gaps.
These are catalogue counts, not product completion percentages.

The [manifest snapshot](manifest-snapshot.json) includes original labels, descriptions, review dates, report paths, and per-assignment evidence.
Pro shortened some labels and omitted evidence text in its export. Its export is useful audit data, not a replacement manifest.
Keep the existing registry/example checks. A blank matrix cell means no declared usage, not absent product support.
The current feature-level review rule is deliberate: any reviewed assignment qualifies the row.
It needs careful interpretation, not an automatic rewrite of historical states.

## Recommended matrix changes

1. Link the stored review report, date, and evidence text from the detail view.
2. Distinguish supported slices from broad labels. Prioritize restore, contributor identity, and filter population outcomes.
3. Keep historical review and tested revision separate. Add a revision and retained artifact to the next proof record.
4. Split preset saved-filter loading from edited-state restore. Split map and stack modes when their proof contracts differ.
5. Keep unsupported log distinct from symlog. Keep UTC summary time support distinct from all date axes.

Do not add all 25 proposed dimensions as required runtime rows at once.
Start with outcomes exercised by the next proof batch. Plans and parked goals belong in a linked gap report.
The coverage matrix is development-only. Review it through a development server, not the production build.

## Every current feature row

The following comments retain Pro's claim boundaries. Acceptance here means acceptance of the audit comment, not a browser pass.

| Feature ID | Declared support / reviewed examples | Accepted boundary and next proof |
| --- | --- | --- |
| chart:map | supported / 0 | Point and region modes are delivered; split their different coordinate, join, omission, and geometry-restore contracts in the matrix. |
| chart:metric-card | supported / 0 | A filtered versus all-source metric is useful growth; it is not a frozen comparison cohort. Check count versus eligible numeric contributors. |
| chart:row | supported / 0 | Ranked counts now include searchable Other members. A generic row-chart row does not prove exact member identity after resize or restore. |
| chart:bar | supported / 0 | Histogram, counts, grouped measures and multiple series modes coexist. Separate bin-boundary, selection, and denominator proof. |
| chart:scatter | supported / 2 | An older scatter example is reviewed, but that cannot certify newly added bubble, density, or mark-trace behavior. |
| chart:3d-scatter | supported / 1 | Historical Lorenz checks support receiving linked filters and visible color. They do not prove point picking or a full accessible selection path. |
| chart:pivot | supported / 1 | Position summaries are historically reviewed; arbitrary aggregate error handling, contributor inspection and output reuse need separate rows. |
| chart:data-table | supported / 1 | Listing records is reviewed. New header distributions, dragging, context menus, calculated cells and export roundtrips deserve independent proof. |
| chart:summary | supported / 1 | Historical field counts are credited; inference corrections, blank/nonfinite policies and filtered distributions require explicit scenarios. |
| chart:markdown | supported / 0 | Static rich explanation is shown. It is not data-bound narrative or the newly planned compact authoring DSL. |
| chart:boxplot | supported / 0 | Box, violin, observations and beeswarm are materially different modes; contributor, density and geometry claims should not hide behind one cell. |
| chart:color-legend | supported / 0 | A dedicated legend view is distinct from automatic chart legends. Continuous-range interaction is not established by displaying a palette. |
| chart:line | supported / 1 | The reviewed numeric-day line is not proof of new UTC rollups, long-format category series, area bands or missing-period policy. |
| chart:sankey | supported / 0 | Ordered-stage flows are delivered; an edge-list network is not. Check adjacent-stage pairs, stage identity, weight exclusions and Other nodes. |
| chart:parallel-coordinates | supported / 0 | This closes the earlier parallel-coordinate example gap. Reorder, inversion, brush intersection and complete-row exclusions need browser proof. |
| chart:calendar | supported / 0 | UTC day/month presentation is delivered. This does not close relative periods, quarter controls or period stepping in generic field filters. |
| chart:heatmap | supported / 0 | Two-category aggregates are delivered. Correlation and missingness semantics are not supplied merely by a grid of colored cells. |
| chart:ecdf | supported / 0 | Distribution thresholds add analytical depth. Check ties, denominator eligibility, both directions and grouped versus overall curves. |
| mode:scatter-density | supported / 0 | Rectangular count bins are delivered. They are not hexagonal bins or two-dimensional KDE contours; those are newly planned scatter scope. |
| mode:bubble-scatter | supported / 0 | Numeric size uses an area contract. Check zero, negative/invalid values, full-source stability and source-row selection under overlap. |
| mode:area | supported / 0 | A combined row hides two geometries. Check missing periods and cumulative bounds; stack averages must remain disallowed. |
| mode:stacked-bars | supported / 0 | A combined row hides absolute and normalized denominators. Show zero/no rows/no valid measurements separately. |
| mode:grouped-bars | supported / 0 | An exact category-series pair is supported. Arbitrary unions of pairs cannot be represented by independent field value sets. |
| mode:calendar-series | supported / 0 | Day/week/month grouping, week start, category series and source IDs are a genuine partial closure of line and date intent. |
| labels:meaningful-title | supported / 1 | Historical examples have useful questions. No guarantee that every newly created chart or changed metric retains a truthful title. |
| labels:axes | supported / 1 | Historical units and names are credited. Add generated-versus-overridden labels and derived units to acceptance criteria. |
| guides:ticks | supported / 1 | Reviewed at selected widths; test long labels, date boundaries and facet crowding rather than treating one readable axis as universal. |
| guides:grids | supported / 0 | Shown in scatter-trace but not reviewed. Test whether guides aid comparison without covering points or conflicting with facet scale policy. |
| scale:linear | supported / 1 | Numeric-day historical proof is appropriately narrow. Include constant, empty and all-invalid domains in a separate robustness dimension. |
| scale:log | not-supported / 0 | Correctly not supported. Symlog is not log. Zero explicit gap strings is not evidence that this unsupported capability is complete. |
| scale:time | supported / 0 | New supported contract is specifically UTC Line Chart calendar summaries, not universal time axes across all chart modes. |
| scale:band | supported / 1 | Historical categorical positions are credited. Typed equal-looking values, ordering and omitted categories still need targeted checks. |
| scale:symlog | supported / 1 | Correctly separated from log. Preserve that distinction in chart copy, exported settings and axis inspection. |
| color:categorical | supported / 2 | Shared categorical colors have historical proof. Add typed keys, missing groups, source-field binding and rename consistency. |
| color:numerical | supported / 1 | Historical Lorenz visibility is evidence for that palette and background, not for all domains or accessible continuous legends. |
| color:legend | supported / 2 | Historical categories are named. The description every non-obvious encoding is broader than the finite set of reviewed examples. |
| facet:wrap | supported / 1 | Historical Lorenz layout is credited. Add ordered visibility, paging, focus and keyboard header actions; do not require all 18 types to facet. |
| facet:grid | supported / 1 | Historical material-by-size layout is credited. Add empty cells, typed tuples, field changes and interaction scope. |
| facet:shared-scales | supported / 1 | One matching-tick comparison does not establish all field/type/scale combinations. Include position, color and size contracts. |
| interaction:brushing | supported / 1 | A historical range brush is checked. New density, parallel, time and stacked modes need their own filter-semantic checks. |
| interaction:cross-filter | supported / 2 | Web 167/500 and Lorenz historical counts are valuable oracles. Waived new cross-view comparisons remain unverified. |
| interaction:active-filter | supported / 1 | Owner navigation and highlighting are now active source behavior; the old reviewed Sports chip alone does not prove the new focus path. |
| interaction:saved-filter-state | supported / 1 | The declared intent is opening a preset example. Rename or split it so it cannot be mistaken for edited-state export and restore. |
| table:sorting | supported / 1 | Clear sort now exists in the context menu. Header clicks still toggle asc/desc; record outcome support separately from a preferred three-state gesture. |
| table:filtering | supported / 1 | Text search and a reversible empty result have historical proof. Add typed cell filters and local Rows versus chart-owned scopes. |
| table:virtualization | supported / 0 | Explicitly not covered by the October 2 table review. A shown 10,000-row example is not scroll, memory or screen-reader proof. |
| table:formatting | supported / 1 | Historical grouped PTS values are narrower than the broad label. Add precision, currency, count units, aliases and exact-bound disclosure. |
| layout:dashboard | supported / 1 | Readability is historically checked; duplicate filter ownership, resize persistence and focused-view restoration are separate outcomes. |
| state:empty | supported / 1 | One unmatched search is reviewed. Add empty chart inputs, zero-valued groups, invalid measures, absent dates and unmatched map regions. |
| state:invalid | supported / 1 | Invalid formula syntax is reviewed. It does not prove transactional rejection of malformed full-analysis imports or every new chart setting. |
| accessibility:naming | supported / 4 | Keep the narrow label. Useful names do not establish keyboard equivalence, screen-reader semantics or accessible Canvas/WebGL marks. |
| responsive:desktop-resize | supported / 1 | Historical 1280/1024 checks support selected layouts. Narrow checks do not change the declared 1024 CSS-pixel workspace minimum. |

## Every example

Historical review applies only to the declared feature/example pairs.

| Example | Declared / reviewed pairs | Review decision |
| --- | --- | --- |
| distribution-discovery | 6 / 0 | Use for histogram/box exclusions and exact Other members. No fresh mark or trace proof exists. |
| region-map | 5 / 0 | Use for typed joins, unmatched rows, numeric exclusions, and geometry restore. Geometry joins do not close DATA-05. |
| point-map | 5 / 0 | Use for coordinate omissions, bubble area, row selection, and view restore. Pan differs from analytical filtering. |
| scatter-density | 6 / 0 | Use for exact bin keys and stable edges under filters. Rectangular counts do not close planned hexagons or KDE. |
| bubble-scatter | 6 / 0 | Use for area, zero/invalid size, overlap, and exact source selection. An older scatter review does not cover size. |
| area-charts | 8 / 0 | Use for missing periods, cumulative bands, and stack measure restrictions. Numeric-day line proof does not transfer. |
| stacked-bars | 6 / 0 | Use for count versus numeric contributors, nonnegative shares, and zero denominators. Keep absolute and percentage contracts distinct. |
| grouped-bars | 6 / 0 | Use for one exact category-series pair. Independent field lists cannot represent arbitrary unions of pairs. |
| calendar-series | 8 / 0 | Use for UTC day/week/month boundaries and series identity. Relative windows remain FILT-11. |
| shop-operations | 18 / 11 | Retain the 11 October 2 checks. Newly shown Sankey, Heatmap, and Card assignments are not covered by that review. |
| palmer-penguins | 10 / 0 | Useful mixed-field and missing-value input for parallel-coordinate exclusions. No reviewed assignment is recorded. |
| nba-stats | 14 / 8 | Retain eight checked assignments. Virtual scrolling and edited-state restore are not covered. |
| categorical-charts | 14 / 6 | Retain six checked assignments. Sports search and empty results do not prove every typed filter or owner navigation. |
| box-plot | 8 / 0 | Use for observed whiskers, density inputs, beeswarm geometry, and contributors. No reviewed assignment is recorded. |
| product-activity | 13 / 2 | Retain numeric line and linear scale checks. ECDF, ties, and grouped denominators need separate proof. |
| scatter-trace | 10 / 0 | Use for selected row identity, trace access, and scope. A shown trace example is not a reviewed trace contract. |
| calculated-orders | 9 / 1 | Retain only the invalid-draft check. Valid dependent edits, shared consumers, CSV, and restore remain separate proofs. |
| shop-10000 | 16 / 1 | Retain the shared facet-scale check. Dataset size does not prove latency, memory, or virtualization. |
| lorenz-3d | 14 / 8 | Retain eight historical checks and 164/489 data oracles. Preset filters do not prove edited restore or 3D picking. |

## Every proposed outcome dimension

Pro's proposed dimensions are accepted as candidate audit questions. The table assigns a review disposition to each one.
No new feature, ticket, or required matrix row is approved by this list.

| Proposed ID | Gaps | Disposition |
| --- | --- | --- |
| outcome:field-inspection | DATA-02 DATA-03 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Partial / growing. |
| outcome:column-operations | TABLE-01 TABLE-02 TABLE-03 | Use in the first bounded proof batch. Implemented slice / unverified here. |
| outcome:filter-population | FILT-01 FILT-02 | Use in the first bounded proof batch. Partial / growing. |
| outcome:filter-owner-navigation | FILT-03 | Use in the first bounded proof batch. Implemented slice / unverified here. |
| outcome:reset-all | FILT-04 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Implemented slice / unverified here. |
| outcome:exact-range | FILT-06 FILT-07 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Partial. |
| outcome:typed-other-members | FILT-08 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Implemented slice / unverified here. |
| outcome:calculation-authoring | CALC-01 CALC-02 CALC-03 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Implemented slice / historical proof. |
| outcome:calculation-dependent-edit | CALC-05 CALC-06 | Use in the first bounded proof batch. Implemented slice / needs current integration proof. |
| outcome:aggregate-contributors | TRACE-01 CALC-08 | Use in the first bounded proof batch. Partial / growing. |
| outcome:property-provenance | TRACE-03 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Partial / growing. |
| outcome:intermediate-reuse | DATA-08 TRACE-02 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Partial. |
| outcome:settings-roundtrip | DASH-03 DASH-04 | Use in the first bounded proof batch. Implemented slice / fresh proof missing. |
| outcome:full-analysis-roundtrip | DASH-03 DASH-04 | Use in the first bounded proof batch. Implemented slice / fresh proof missing. |
| outcome:invalid-restore-atomicity | DASH-04 CALC-02 | Use in the first bounded proof batch. Implemented slice / needs proof. |
| outcome:durable-named-analysis | DASH-02 DASH-05 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Not established in current host. |
| outcome:filter-free-template | DASH-06 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Not established. |
| outcome:stable-source-identity | DATA-04 TRACE-05 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Not established. |
| outcome:calendar-relative-period | FILT-11 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Not established beyond fixed rollups. |
| outcome:rich-cell-reading | TABLE-06 TABLE-07 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Not established in scalar model. |
| outcome:keyboard-workflow | UX-03 | Use in the first bounded proof batch. Partial / unverified. |
| outcome:screen-reader-workflow | UX-03 | Use when Byron selects the related workflow. Preserve the partial or missing boundary. Unverified. |
| outcome:measured-performance | PERF-01 PERF-05 | Measure before changing architecture. Unverified. |
| planned:advanced-scatter | CALC-09 CHART-02 | Keep planned-only; use its existing initiative. Planned only. |
| planned:compact-authoring | TRACE-04 TRACE-06 | Keep planned-only; use its existing initiative. Planned only. |

## Review limits

The [original matrix report](original/reports/03-coverage-matrix-review.md) remains available in full.
The [October 2 reports](../2026-10-02-example-coverage.md) remain historical evidence.
This review made no fresh browser check. No broad accessibility or performance pass is inferred from labels or row counts.
The 35 browser scenarios remain proposals; missing-feature scenarios must report absence rather than fail an existing contract.
