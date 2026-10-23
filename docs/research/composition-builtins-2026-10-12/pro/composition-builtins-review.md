# Composition examples and progressive built-in charts

Research review of **byronwall/explorEDA**, packet baseline **`269485c6c94b411e27f440ea495ef225110c9a84`**. Review date: **2026-10-12**. Prepared for Codex to reconcile through Software Design Sleuth.

## Recommendation

**Make common analytical operations available through the existing charts first. Preserve composition for deliberate combinations of frames, populations, and spatial arrangements.** Start with built-in counterparts for capabilities that already work, then prove ordered Scatter connections, repair Line's existing supplied intervals, and extend Heatmap's categorical/date sequences. Follow those with explicit facet scales, compact panels, numeric normalized areas, and horizontal/mirrored series bars. Introduce specialist display modes only where their calculation and interaction contracts are sufficiently distinct.

This review distinguishes three decisions that should never be conflated:

- **What users can analyze today:** a conventional built-in may already preserve the measurements, comparisons, filters, and contributing records.
- **What useful display behavior deserves an extension:** ordering a path, pairing endpoints, avoiding overlapping points, or reading a supplied interval is an ordinary operation even when its implementation needs real planner and trace work.
- **What earns composition:** independently scoped frames, insets, geographic tile placement, or a mixed table of several live graphics may make a composed report the appropriate authored deliverable. Its value as a teaching example does not make its workflow mandatory for ordinary analysis.

No repository file was created or modified. No feature, issue, commit, push, branch, or PR was created. The only outputs are research artifacts; all code-shaped examples below are proposals or descriptions of existing settings, not implementation.

## Access, method, and confidence

**GO: the attached selected source packet provides the inventory, all 29 complete dashboard definitions, their prepared datasets, relevant built-in implementations/settings/planners/renderers, and material shared source.** Connected GitHub and the live site were not used. Findings use the packet's declared baseline; no later repository revision is mixed into the verdicts.

The supplied `source-manifest.json` lists 626 files. Every listed byte count and SHA-256 was checked successfully: **623 baseline files and three local additions**. The additions are `docs/intent/progressive-built-in-charts/intent-brief.md`, `docs/research/composition-builtins-2026-10-12/inventory.json`, and that directory's `docs/research/composition-builtins-2026-10-12/prompt.md`. These are review context, not evidence that a feature shipped. The separately attached `prompt(4).md` is the controlling deliverable contract. The source packet is not an installable checkout and excludes dependencies and build output.

Definitions, implementation paths, settings reachability, resolver behavior, traces, and test assertions were read. CSV checks inspected the included snapshots. An independent inventory check used Node's built-in TypeScript stripping to evaluate the local dashboard constants in an isolated context, then reconciled their exports with the example registry and coverage. **This was an inventory check, not an execution of the application or its tests.** Tests cited in this report were read, not run.

Evidence labels throughout:

- **Observed:** directly present in the baseline source or included CSV; test assertions count as observed test intent, not passing test results.
- **Inference:** a conclusion from those implementations, particularly where browser interaction or pixel output has not been observed.
- **Proposal:** a recommended API, UI, behavior change, catalogue action, or future proof.

Confidence describes the source comparison. High confidence does not claim browser, performance, keyboard, or export acceptance. Source citations are repository-relative paths plus symbols and/or baseline line ranges. The full access ledger, hashes, inventory reconciliation, executed checks, and unrun checks are in `sources.json`.

“Distribution” in this report refers to the existing Box Plot/Violin capability, registered as **Box Plot** with `type: "boxplot"`; it is not a claim that the current Add Chart menu has a separate Distribution entry. A proposed family or mode name remains a product decision. Short chart-relative citations in the detailed reviews refer to `packages/explorEDA/src/components/charts/`; the companion verdict JSON gives complete paths for each example.

### Inventory reconciliation

The supplied inventory, 29 evaluated composition dashboards, `examples.ts`, `apps/demo/src/demos/exampleIndex.ts`, and `apps/demo/src/demos/coverage.ts` agree. Each dashboard contains one composition and additional linked built-in views. All 29 are unlisted in the main catalogue and enter the report-graphics group through `isComposition`; their dedicated example routes remain registered. This differs from saying they are inaccessible or absent. `apps/demo/src/demos/exampleIndex.ts:isComposition,compositionExamples` and `apps/demo/src/demos/examples.ts:708–1069` establish the grouping.

- `apps/demo/src/docs/live/examples.ts:311–318` defines **`composition` as a focused `message-log` alias**, retaining `messages-composition`. It is not design number 30.
- None of the 29 registry records adds extra `views`. The additional saved tabs in `apps/demo/src/demos/exampleViews.ts` are shop, penguin, and calendar dashboards; its newspaper-styled “Field report” uses ordinary charts. The analysis and related-table definitions scanned contain no additional delivered composition.
- Raw research references are separate. The composed-graphics intent still calls banana and yield-gap unbuilt, while `bananaYieldsDashboard` and `yieldGapDashboard` exist at the baseline. The inventory correctly includes both. Those stale claims do not justify adding unbuilt references to the required count.

### How to interpret categories

The primary category judges the smallest sensible product route to the useful behavior. `required_today`, `should_remain_required`, and `teaching_value` answer separate questions. They use **yes / no / conditional**, each with a reason. A small extension may be optional for the broader analysis but necessary for a collision-free or explicitly paired display; its `required_today` answer can therefore be conditional.

**Analytical parity** requires the important comparison and its correct input population, source rows, denominator, and selection semantics. It does not require identical typography. **Presentation parity** includes the exact single graphic, label layout, framing, and output. A dashboard counterpart is not automatically a replacement for the composition's report image. Current ordinary-chart image export is an explicit separate gap; “already-built-in” never means “identical Copy PNG output.”

| Category | Examples | Meaning |
|---|---:|---|
| `already-built-in` | 4 | Current public controls preserve the analytical task; authored output may differ. |
| `small-extension` | 14 | Bounded additions to an existing chart; often medium implementation effort. |
| `new-built-in-family` | 7 | Distinct reusable numerical/display contract; share modes where possible and defer weak cases. |
| `composition-justified` | 1 | Essential independent populations and frames warrant composition. |
| `mixed` | 3 | Ordinary analysis should be built in; this arrangement still merits composition. |

Only **covid-compare** receives an unqualified **yes** for composition remaining required. **covid-tiles, elections and banana-yields** retain a conditional composition role for their authored spatial or mixed-content arrangements. The seven specialist examples share five prospective mode/family contracts; unit counts, ranked Line and horizon are deliberately gated or deferred. A new-family category is not an instruction to build another top-level menu entry.

Separate workflow judgments: `required_today` = {'yes': 14, 'conditional': 11, 'no': 4}; `should_remain_required` = {'no': 25, 'conditional': 3, 'yes': 1}; `teaching_value` = {'yes': 25, 'conditional': 4}. Conditional means the detailed example's stated display/task requirement matters; it is not a hidden yes.

## Complete verdict table

| Example | Primary category | Concise verdict |
|---|---|---|
| `message-log` | `small-extension` | Make a full monthly history matrix an advanced Heatmap configuration; repetition and ordinary callouts should not require composition. |
| `driving-shifts` | `small-extension` | Add ordered connections to Scatter so annual trajectories can turn back along either numeric axis without composition. |
| `tech-sparklines` | `small-extension` | Extend source-aware grouped Line with compact facets, bounded summary labels and extrema/end markers; this is medium work, not a rich-table family. |
| `forecast-fan` | `small-extension` | Harden the already delivered raw-Line Notes Interval feature instead of inventing a new fan-chart grammar. |
| `time-use` | `small-extension` | Extend Box Plot with a cohort-summary display and explicit change semantics; no bespoke composition is needed for twelve distribution comparisons. |
| `media-deaths` | `already-built-in` | Use the current Bar chart at 100% with Source groups, Cause series and sum(Count); composition is optional authored presentation. |
| `measles` | `small-extension` | Make the dense state-by-year rate matrix an advanced Heatmap; correct the absence fixture before treating the example as evidence of missing-row behavior. |
| `causes-by-age` | `small-extension` | Extend Line with grouped numeric-X summaries and a 100% area display; this is a real aggregation and trace addition, not a calendar setting. |
| `consumer-confidence` | `small-extension` | Add a focused-series facet option on Line with explicit peer population and common scale plans. |
| `pew-meaning` | `small-extension` | Add a bounded Paired dots mode to Scatter using the shared grouped-connection work; a separate chart family is unnecessary. |
| `income-life` | `already-built-in` | Use current Scatter log axes, size/color fields and twelve keyed Notes callouts; bulk labels are optional convenience. |
| `covid-tiles` | `mixed` | Build ordinary state-history comparison through Line facets; keep the authored geographic tile arrangement in composition until a small layout proof earns a shared helper. |
| `covid-compare` | `composition-justified` | Keep composition for repeated state-versus-national comparisons with a recent-window main frame and a differently scaled full-history inset. |
| `elections` | `mixed` | Expose the ordinary state-by-election matrix through Heatmap with an explicit centered capped scale; retain the geographic strip arrangement as composition. |
| `lincoln-ridgeline` | `new-built-in-family` | Add a named Ridgeline display to the current Box Plot/Violin capability; the common-grid probability-density height is new numerical and drawing behavior, not a rotated violin. |
| `climate-ridgeline` | `new-built-in-family` | Share the Ridgeline display with Lincoln, then prove dense ordering and ordinary group-anchored notes; 84 repeats do not require a general artboard. |
| `banana-yields` | `mixed` | Use linked Pivot, Heatmap and Line for ordinary yields analysis; keep the aligned mixed-content article in composition rather than build a universal rich table. |
| `yield-gap` | `new-built-in-family` | A unit-count display is coherent but deferred pending proof that exact per-cell tracing adds value beyond a color-split histogram. |
| `middle-class-jobs` | `small-extension` | Use grouped ordered Scatter connections with numeric colors and Group facets; keep supplied group labels separate from recalculated filtered summaries. |
| `du-bois-income` | `already-built-in` | Current 100% Bar, grouped by Class, summed by Share, and split by Category, covers the analytical task; historical texture does not justify requiring composition. |
| `tax-slope` | `small-extension` | Provide a Slope comparison preset over grouped connections, with both-end labels and original Country/Year trace identity. |
| `titanic-waffle` | `new-built-in-family` | Count and 100% Bar already cover survival analysis; a reusable Unit counts mode is justified only by the one-passenger-per-cell presentation and exact cell trace. |
| `unemployment-stream` | `already-built-in` | Use current monthly stacked-area Line for the analytical comparison; retain wiggle as a deferred specialist presentation option. |
| `population-pyramid` | `small-extension` | Extend series Bar with horizontal geometry, a constrained mirror-one-series option, stable age order, and symmetric shared numeric limits. |
| `gdp-bump` | `new-built-in-family` | Treat dynamic ranking as a separately costed ranked-Line mode with competitor scope and tie policy, not a small style setting. |
| `scotus-timeline` | `new-built-in-family` | A narrow interval-lane family should expose Start, End and Lane with exact record trace; correct the current open-end-to-domain-edge claim separately. |
| `stocks-horizon` | `new-built-in-family` | Defer a specialist Horizon mode until a simpler relative-series Line proves insufficient and baseline/band semantics are explicit. |
| `co2-swarm` | `small-extension` | Use the existing categorical Scatter for the analysis and keyed notes; add bounded Swarm placement after numeric projection and bubble sizing. |
| `titanic-mosaic` | `small-extension` | Add a named Mosaic width mode to 100% series Bar, with variable category geometry and both conditional and marginal denominators. |

## Detailed reviews

### message-log

**Verdict — small-extension.** A monthly Heatmap should be the primary authoring route. The useful task is to compare correspondence timing and volume across all 12 people and 72 months, with the original messages available for linked selection and trace. Composition remains a useful advanced teaching example; it should not remain necessary for this analysis.

**Observed.** The complete `messageDashboard` uses a monthly position scale, logarithmic count color, repeat counts beside names, count-based row order and an Avery Lin maximum callout. Its companions are a monthly aggregate Line, Direction and Correspondent row charts, and a Words histogram. The supplied CSV contains 10,376 messages from January 2019 through December 2024. There are no additional saved tabs for this ID. [`apps/demo/src/demos/dashboardSettings.ts`, `messageDashboard`, 1675–1859; `apps/demo/public/datasets/message-log.csv`, complete source profile; `apps/demo/src/demos/exampleViews.ts`, 1–162.]

Heatmap already has source-preserving count/sum/average cells, separate invalid/empty states, cell and axis filters, keyboard navigation and Alt-trace. Its public maximum is one value from 2 to 60 applied to **both** axes. Its order toggle likewise applies count or label order to both. Date bins are absent. Calendar is a daily grid for one selected year, not 12 repeated monthly histories. These are actual settings/planner/renderer constraints, rather than inferences from chart names. [`packages/explorEDA/src/components/charts/Heatmap/HeatmapSettingsPanel.tsx`, 109–158; `packages/explorEDA/src/components/charts/Heatmap/heatmapPlan.ts`, `rankCategories` and `planHeatmap`, 111–193 and 270–308; `packages/explorEDA/src/components/charts/Heatmap/Heatmap.tsx`, 307–364; `packages/explorEDA/src/components/charts/Calendar/calendarPlan.ts`, 117–202.]

**Inferred.** A prepared month field alone still leaves 12 months unreachable at the public 60-column maximum. Paged/faceted calendar Line views can answer related questions, but their default panel domains and presentation do not provide this aligned complete matrix. Shared composition positions use all source rows, yet its shared strip color maximum uses live glyphs; stable colors under filtering are not already guaranteed by the composition. [`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`, 554–565 and 684–742.]

**Proposed — REC-04/REC-05.** Add Heatmap → Date column → Month bins, independent axis order/limits, optional count labels, and explicit heat-domain/transform choices. Preserve original source IDs and select a Correspondent plus an actual Date interval. Reuse existing Notes only after supplying a Heatmap annotation frame. Do not invent another note system. **Try → Observe → Decide:** display all 12×72 bins, activate one month by keyboard, trace its exact messages, then filter Direction and restore. Accept only if bins/order remain stable and the chosen color-domain policy is truthful. Exact typography and authored export remain separate presentation questions.

### driving-shifts

**Verdict — small-extension.** The essential task is to follow the annual trajectory through two changing quantities, including reversals in miles driven. A conventional scatter preserves the coordinate comparisons but loses time order; a Line chart sorted by miles changes the trajectory. Composition is required for the complete task at this baseline, but should not remain the entry point. Move the primary lesson to an advanced Scatter counterpart after **REC-02**; retain the composition as an optional lesson in authored callouts and independent ordering.

**Observed.** `drivingDashboard` uses numeric Miles/Gas scales, a path ordered by Year, every-fourth-year point labels, a full-population average-Miles guide, and two keyed-year callouts. Its companion `driving-scatter` has no connection, and its Year histogram supplies linked filtering (`apps/demo/src/demos/dashboardSettings.ts:1866–2053`). The 55-row CSV is deliberately out of chronological order. `pathNodes` preserves ordered source IDs and splits at invalid coordinates/order values; `orderedRows` uses the specified order independently of x (`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:3301–3387`; `packages/explorEDA/src/components/charts/Composition/ordering.ts:28–60`). By contrast, `ObservationLineChart` sorts numeric x and discards IDs while reducing points (`packages/explorEDA/src/components/charts/LineChart/LineChart.tsx:190–233`). Existing Scatter already supplies coordinate scales, color, annotations, exclusions and exact source-point traces. Its ordinary non-bubble point click and keyboard behavior are narrower than the bubble behavior: `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx:482–500,536–566,645–657` gates these on `plan.size`.

**Proposal and smallest complete change.** Add an initially collapsed **Connect observations** section to Scatter Points: order field, optional group field, straight connections, line treatment and optional ordered labels. A pure preparation step should retain all ordered row IDs, split runs at invalid rows and distinguish missing input from a row removed by filters. Extend `ScatterSnapshot` to fetch order/group columns; add paths and their source membership to `planScatter`; draw them behind points in `ScatterSvg` with matching trace targets. Generalize the existing point keyboard/selection gate for connected mode, retaining brush and empty-plot behavior. Reuse Notes for the average reference and 1980/2008 callouts. Sampled labels are an ergonomic addition, not a new notes system. This is a medium bounded extension with real preparation and interaction work, not an order dropdown alone.

**Parity and proof.** No aggregation denominator changes: each visible year is the original row, while the average guide must continue reading all 55 rows. Straight connected Scatter preserves the analytical task; composition retains exact artboard typography/export placement. **Try:** shuffle rows, make 1980 Gas null, select a late-year range and clip Miles. **Observe:** the path still turns backward after its peak, breaks at the invalid row, traces skipped IDs, and the view limit changes no filter. **Decide:** reject the implementation if a path is x-sorted, a missing year is silently connected through, or tracing cannot recover the original rows.

### tech-sparklines

**Verdict — small-extension, with medium cumulative work.** Use source-aware grouped Line plus a compact facet mode, bounded summary labels and selected extrema/endpoints. This example does not justify a rich-table family. It requires more than shortening the existing facet height.

**Observed.** Despite its “table” title and helper comment, `sparklinesDashboard` actually repeats a **three-column grid**. Date is shared; Open has a per-company scale. Min/max points carry values, the latest point is marked, and an unfiltered first-to-last percentage-change calculation labels/orders companies. The source note says every fifth trading day plus first/last observations. [`apps/demo/src/demos/dashboardSettings.ts`, `sparklinesDashboard`, 2060–2241; `apps/demo/src/demos/examples.ts`, 731–743.]

The five fields are Symbol, Company, Date, Observation and Open. All 9,030 Company×Date pairs are unique, so **daily averaging would preserve values**. However, every company's range spans 3,904–4,743 calendar days, over the existing 2,000-period guard; average mode also leaves sampled-day gaps. Weekly summaries are the strongest smaller alternative: they create 9,029 groups, with only Tesla's final week combining two rows, 117.5 and 120.39, into 118.945. They move X to week starts. Monthly summaries collapse the data into 2,152 groups, 2,151 containing multiple observations. These are source-only CSV checks, not executed product tests. [`apps/demo/public/datasets/big-tech-prices.csv`, complete profile; `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts`, 136–220.]

Raw Line sorts numeric wide-series observations but does not offer a long-form grouping/date contract or source-point activation. Public facets have wrap/grid sizing and pagination, with manually reorderable visible chips. DataTable contains scalar record cells, SummaryTable profiles fields, and Pivot groups scalar aggregates; none supplies the claimed per-company chart-cell primitive. [`packages/explorEDA/src/components/charts/LineChart/LineChart.tsx`, `ObservationLineChart`, 190–233 and 751–783; `packages/explorEDA/src/components/charts/FacetRelated/facetLayout.ts`, 5–88; `packages/explorEDA/src/components/charts/DataTable/DataTableBody.tsx`, 1–137; `packages/explorEDA/src/components/charts/SummaryTable/SummaryTable.tsx`, 1–148.]

**Proposed — REC-07/REC-06.** Start with the weekly calendar counterpart to expose the useful existing behavior. For exact retained observations, add grouped raw Line with dates, original IDs before decimation, explicit gaps and order, then compact Company facets. Add first/last change, min/max/latest selectors and an explicit distinction between source-scoped ordering/summaries and filtered values. A zero first value produces unavailable percentage change. **Try → Observe → Decide:** restore all 14 companies, compare the Tesla endpoint against 120.39, and trace min/max/latest source IDs before and after filtering. Accept the compact mode only if keyboard inspection, shared time and per-panel value scales remain understandable. Keep composition as an advanced scope/scale lesson; exact fixed-layout export is not part of analytical parity.

### forecast-fan

**Verdict — small-extension.** Four supplied uncertainty intervals around a central series are an ordinary advanced Line capability. The baseline already exposes **Notes → Interval** for raw Line charts; recommending an entirely new band grammar would duplicate delivered functionality. Harden that capability under **REC-03** and add a built-in counterpart. Keep the composition as an advanced layering example.

**Observed.** `fanDashboard` repeats two measures, each with four `fanBand` pairs, an independent y scale, a central path, projection shading and a GDP-specific 2% guide (`apps/demo/src/demos/dashboardSettings.ts:2243–2442`). The 104-row CSV has 52 rows per measure; the standalone `fan-central` raw Line does not split the two measures, so it is a supporting view, not a complete counterpart. Raw Line's public Notes context enables intervals (`packages/explorEDA/src/lib/annotations/context.ts:46–56`), the button advertises supplied forecast bounds (`packages/explorEDA/src/components/settings/annotations/AnnotationsSettingsTab.tsx:235–242`), and `IntervalFields` edits lower/upper fields and meaning (`packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx:605–642`). `projectAnnotations` drops unreadable bound rows then sorts the surviving points; `Intervals` draws one polygon, fixed opacity and endpoint text with pointer events disabled (`packages/explorEDA/src/lib/annotations/resolve.ts:466–490`; `packages/explorEDA/src/components/charts/annotations/AnnotationLayer.tsx:143–185`). Raw Line's domain sees only its selected measure columns and is shared across facets (`packages/explorEDA/src/components/charts/LineChart/LineChart.tsx:116–128,330–373`). Composition bands instead include all supplied bounds in the y-domain and preserve separate runs and skipped row IDs (`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:566–583,3565–3625`).

**Proposal.** Keep the existing saved interval type. Add source IDs, ordered runs and omission/reversed-bound metadata to interval preparation; let enabled intervals participate in automatic y bounds; render and trace each valid run. Reuse Notes' reference lines/bands for the projection and 2% guide. An advanced Line **Supplied intervals** shortcut can edit these same Notes objects. Independent facet value domains are a shared settings concern, not a new fan family; the smaller first slice can show two separate charts with explicit documented bounds. Interval styles/legend wording are presentation polish after trace and domain correctness.

**Parity and proof.** The data supplies percentiles; no forecast model or inferred confidence interval should be introduced. Each of the four lower/upper pairs remains traceable to the same quarter row. A current hand-configured Line with four Notes intervals approximates the graphic but lacks band-level provenance and correct interior-missing segmentation, so full parity is incomplete. **Try:** use both measures, add a null interior upper bound, a reversed pair and an extreme P90, then filter history/projection. **Observe:** gaps stay gaps, every range identifies its row/fields, the domain contains the extreme, and a view limit clips without removing rows. **Decide:** reject if missing bounds are bridged or if the band can only be explained by opening a generic row table. Exact composition export remains a separate fidelity question.

### time-use

**Verdict — small-extension.** Cohort quartiles and median change belong in progressively advanced distribution settings. The strongest existing alternative is Box Plot grouped by Year and faceted by Activity. It already answers the basic distribution comparison, but the compact connected quartile summary and explicit relative-change encoding need bounded additions under **REC-10**, plus the common facet scale/scope work.

**Observed.** `timeUseDashboard` contains twelve activity panels, each summarizing Minutes by Year, with a joined interquartile band, median points, diverging change color and a live diary-entry count (`apps/demo/src/demos/dashboardSettings.ts:2450–2624`). Its companion box plot pools activities until filtered; it is not the full faceted comparison. The CSV contains 5,742 activity entries from 400 respondents in each of 2019/2020. Respondents who skipped an activity have no entry. These are separate yearly cohorts, not paired people. `summarizeGroups` excludes invalid measures from unweighted quantiles while retaining all group row IDs. `changeOf` computes `(last median − first median) / first median`, returning undefined for a zero prior median; both summary domains and color extent follow live summaries (`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:530–551,604–662,1907–2063`). Box Plot exposes numeric field, Group by, sort and Box/Violin/Observations controls, computes the same interpolated quartiles, and traces valid/invalid inputs (`packages/explorEDA/src/components/charts/BoxPlot/BoxPlotSettingsPanel.tsx:19–129`; `packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts:19–53`; `packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx:318–410`). Its numeric domain currently uses all raw source values, even inside facets (`packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx:84–138`).

**Proposal.** Add a named **Cohort summary** display within Box Plot, initially limited to an explicitly ordered comparison of two cohorts. Reuse its contributor preparation and quartiles, drawing optional quartile band/median connectors and an explicit **Change: difference / percent** readout with neutral undefined state. Expose independent/shared value scales only when faceted. Preserve the sample definition: present valid activity entries, never 400 fabricated activity rows or imputed zeros. The relative-change trace must include both cohort row sets, valid n values and the earlier median denominator. Facet/mark selection should identify the actual Activity/Year scope, rather than silently selecting every year's rows across activities.

**Parity and proof.** Existing boxes deliver substantial analytical coverage; connected medians and percent change are the remaining useful behavior, not a demand for composition. The exact side legend and artboard are optional. **Try:** remove one long 2020 entry, make a prior median zero, omit an entire activity/cohort and include an invalid Minutes value. **Observe:** quartiles match original valid rows; absent activities remain absent; undefined percent change is neutral; tracing distinguishes entry count from valid-measure n. **Decide:** reject if respondents with no entry enter the denominator or if unrelated facet rows become selected. Keep the composition for teaching, while moving the primary workflow after this extension.

### media-deaths

**Verdict — already-built-in for the analytical task.** Add the current 100% Bar counterpart immediately: category Source, split Cause, aggregate **sum Count**, display 100%. Composition is optional authored presentation, not a required normalization workflow.

**Observed.** `mediaDeathsDashboard` stacks the 15 causes within four source columns, normalizes each column and offsets/emphasizes Deaths. Its note says the article totals cover those listed causes, not every article published. The supplied 60 records total 2,308,565 for Deaths, 19,407 for Fox News, 15,421 for The New York Times and 11,812 for The Washington Post. Those totals have different units: death counts and article counts. They are not parts of one combined denominator. [`apps/demo/src/demos/dashboardSettings.ts`, `mediaDeathsDashboard`, 2632–2768; `apps/demo/public/datasets/media-deaths.csv`, 1–61, totals checked without running the app.]

The public Bar panel already exposes grouped/stacked/100% layouts, a split field and aggregate creation. Four categories and 15 series fit its 30-category/20-series guard. `planSeriesBars` divides each Cause numerator by the current total for its Source. Its trace contains numerator contributors and denominator parts; actual renderer keyboard activation supports selection and Alt-Enter tracing. The source tests check a 10/40 share, changed denominators after filters and exact source IDs. Those tests were read, not run. [`packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx`, 36–153; `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts`, 77–183 and 217–287; `packages/explorEDA/src/components/charts/BarChart/SeriesBarChart.tsx`, 256–351; `packages/explorEDA/src/components/charts/BarChart/stackedBars.test.tsx`, 1–216.]

**Inferred.** This is the strongest built-in alternative because it keeps the original Count rows and computes percentages interactively. Preparing a new percentage-only table would weaken the result by discarding numerator and denominator provenance. Filtering out a Cause should legitimately recompute the denominator over the remaining causes, and the displayed note/readout should make that scope clear. The current Bar series order comes from source discovery; the composition orders causes by total. That difference is not a missing analytical family.

**Proposed — optional REC-23.** A fit-aware segment-label setting and stable declared series order would improve ordinary Bar presentation. They are not dependencies for the verdict. Start with label/readout/legend defaults and retain a short note describing the 15-cause population. **Try → Observe → Decide:** reproduce all four totals, select one cause segment, Alt-trace its Count row and all 15 denominator rows, then apply a Cause filter and restore it. If those numbers and row sets hold, move the primary teaching path to Bar. Keep the composition only for deliberate column separation, direct labels and article design. Exact typography and composition export are separate from this demonstrated analytical route.

### measles

**Verdict — small-extension.** The 51-state by 85-year history is an advanced Heatmap, not a reason to require manual composition. Independent limits/order and explicit heat scales are real gaps. The delivered missing-data claim also needs correction before it is used as acceptance evidence.

**Observed.** `measlesDashboard` averages Rate by state-year, uses the supplied Order field for rows, places a 1963 guide and applies an 11-color ramp with unevenly positioned stops. It colors an existing invalid-rate cell gray and advertises Alaska 2003 as a no-record blank. The CSV instead contains all 4,335 state-year pairs: 51×85, including 494 blank Rate values. Alaska 2003 is an explicit row with blank Rate and `Status=absent`. The chart references Rate, Year, Label and Order, not Status. [`apps/demo/src/demos/dashboardSettings.ts`, `measlesDashboard`, 2775–2954; `apps/demo/public/datasets/measles.csv`, complete profile and line 77.]

The strip resolver skips a bucket with no rows but emits a missing glyph for a present bucket without a numeric measure. `useCompositionData` supplies source/live IDs without a Status transformation. Thus the apparent Alaska behavior is an **inference from the selected loading/rendering path**, not a rendered-product observation: it should be gray like an invalid rate, contrary to the note. The synthetic `packages/explorEDA/src/components/charts/Composition/measles.test.ts` fixture does test a genuinely absent row, but does not load this CSV. [`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`, 684–742; `packages/explorEDA/src/components/charts/Composition/useCompositionData.ts`, 1–22; `packages/explorEDA/src/components/charts/Composition/measles.test.ts`, 1–167.]

Heatmap already differentiates measured zero, invalid cells with contributor rows, and absent cells without rows; invalid cells can be selected/traced, while absent cells cannot select invented rows. Public `maxCategories` stops at 60 for both axes, leaving 25 years out even when all states fit. Its shared order toggle cannot combine prepared geographic rank with chronological columns. It also uses live cell values for heat extent and lacks an actual Notes frame. [`packages/explorEDA/src/components/charts/Heatmap/HeatmapSettingsPanel.tsx`, 109–158; `packages/explorEDA/src/components/charts/Heatmap/heatmapPlan.ts`, 111–193 and 246–308; `packages/explorEDA/src/components/charts/Heatmap/Heatmap.tsx`, 133–140 and 307–364.]

**Proposed — REC-04/REC-05/REC-01.** Add independent axes, supplied-rank row order and full coverage at the intended density; add fixed/full-source heat domains and optional monotonic stops. Integrate the existing Notes guide, not another annotations editor. Correct the source absence example or explicitly document a Status-aware preparation step. Also correct the “Average rate by year” companion: it is raw Year/Rate Line with no mean transform (`apps/demo/src/demos/dashboardSettings.ts`, 2942–2952; `packages/explorEDA/src/components/charts/LineChart/LineChart.tsx`, 190–233). **Try → Observe → Decide:** inspect all 85 years, a true absent pair, a null-rate pair and a zero pair, then filter/restore without color-domain drift. Accept only if all three states and source sets remain distinct. Keep composition as an advanced color/guide lesson; export parity remains separate.

### causes-by-age

**Verdict — small-extension, with an explicit aggregation and trace slice.** Add numeric grouped summaries and a 100% area display to Line. Treating Age as a date or calling this “one setting” would hide the actual preparation work.

**Observed.** `causesByAgeDashboard` contains 909 records: nine causes at every integer age from 0 through 100. It sums Count per Cause/Age, normalizes each age stack, places labels in sufficiently thick regions and draws an age-65 guide. The dashboard labels the data synthetic. A top-level total Count calculation is context, not the denominator for every slice; each age has its own all-cause total. [`apps/demo/src/demos/dashboardSettings.ts`, `causesByAgeDashboard`, 2961–3093; `apps/demo/public/datasets/causes-by-age.csv`, complete profile; `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`, `stackColumns`/`stackAreaNodes`, 2978–3007 and 3047–3190.]

Raw Line has numeric axes, wide-series paths and Notes. Its calendar mode supplies aggregation, split fields and area/stacked-area display, but those controls are tied to actual date periods. Stacked calendar averages/negative values are rejected. Its area trace understands the band contributors and preceding bands that establish the baseline. Percent Bar already has useful normalization/denominator logic, but 101 age categories exceed its 30-category guard. A small selected-age percent Bar is the strongest current cross-section alternative; it does not preserve the continuous change in shares across age. [`packages/explorEDA/src/components/charts/LineChart/definition.ts`, 1–140; `packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx`, 43–162 and 221–258; `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts`, 193–243 and 283–327; `packages/explorEDA/src/components/charts/LineChart/areaCharts.test.tsx`, 1–194; `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts`, 217–287.]

**Inferred.** A bounded extension can share aggregate calculations and area geometry while retaining a numeric-X contract. It still needs new grouping, denominator provenance and selection targets. Missingness cannot be copied from an optimistic test comment: the composition groups only observed X values, and its test expects points at `[0,2,3]`; an absent age does not automatically introduce a gap. [`packages/explorEDA/src/components/charts/Composition/stackedAreas.test.ts`, 1–163.]

**Proposed — REC-09.** In Line, choose numeric summary, X=Age, split=Cause, sum=Count, display=100% area. Preserve source IDs for each numerator and every denominator member; keep full-source series order/colors and explicit shared numeric bounds. Define observed-X versus declared-step gap semantics, all-invalid input and zero-total behavior. Reuse Notes for age 65. **Try → Observe → Decide:** compare one age's nine source counts and normalized total, remove a cause through a linked filter, inspect the new denominator, then test an absent age and a null Count. Reject the slice if it invents zeros or traces only the painted band while concealing its denominator. Add a built-in counterpart first; authored labels and standalone export remain separate polish/contracts.

### consumer-confidence

**Verdict — small-extension.** A focus-series option for ordinary Line facets should make this comparison reachable. Current Calendar Line with monthly average Index split by Country is a useful smaller alternative, but the complete focus comparison keeps every peer visible in each panel on common coordinates. **REC-08** should add that bounded mode after explicit facet scale/population handling; composition need not remain required for the reusable pattern.

**Observed.** `consumerConfidenceDashboard` draws all nine Country paths in every repeat using `population: "composition"`, accenting that repeat's country and muting peers; it marks each series' latest observation and prints the focused country's latest value (`apps/demo/src/demos/dashboardSettings.ts:3100–3288`). The CSV has 467 distinct Country/Month pairs across 52 months. The one absent pair is China in October 2022, so its latest value must remain September. The companion `confidence-line` averages countries together because it has no split field. Public Calendar Line supports split-field aggregation and gap/zero rules (`packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx:147–277`), and every shown point retains contributor IDs (`packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts:180–269`). Ordinary facets restrict both all/live IDs before preparation (`packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx:68–116`); they do not carry the peer population. The calendar x-domain also uses live dates, and value domains use facet-scoped all IDs (`packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts:136–157,314–384`). Composition `pathNodes` sorts/group paths and draws focused series last (`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:3282–3425`).

**Proposal.** Offer **Show other series as context** only when the facet and split field can identify a focus series. Prepare the common reference series once from the allowed chart population, then give each panel a focus key and a shared scale plan. External filters should narrow reference rows consistently; an own focus selection should not accidentally discard peers. Muted marks must trace their true Country/Month contributors. Do not label every peer with the panel's facet filter: the current `timePointFilters` adds facet constraints, which would misidentify or empty a peer selection. First ship explicit focus points/series selection and full peer traces, then latest-point/label polish. Existing Notes supplies the 100 reference line.

**Parity and proof.** Monthly average is exact for this snapshot because each country-month has one row; changing to counts or pooled country means is not equivalent. The first proof should compare a plain nine-series overlay to focused facets before paying for repeated rendering. **Try:** focus China, select October 2022, filter another country, and trace a muted peer. **Observe:** China is absent in October rather than fabricated, its latest label names September, peers retain correct identities, and shared axes remain fixed. **Decide:** reject the focused-facet proposal if the simpler overlay is adequate in use, or if peer selection cannot preserve original source scope. Exact authored page/export styling remains separate.

### pew-meaning

**Verdict — small-extension.** A named Paired dots mode on Scatter is the smallest complete route. This revision follows the actual categorical-axis implementation, which makes a separate dumbbell family unnecessary. It depends on shared ordered/grouped connection work plus explicit pair semantics.

**Observed.** The source contains seven Topic pairs and just 14 imported percentages. The composition uses Share on one numeric axis, colors the two Party points and joins them. A supplied Order ranks topics; a last-minus-first calculation ordered by Party prints a signed “+R” or “+D” difference. Spirituality is 8 for Democrats and 22 for Republicans, hence +14 percentage points toward Republicans. The packet contains no respondent-level data or respondent denominators, so tracing can identify only those imported aggregate rows. [`apps/demo/src/demos/dashboardSettings.ts`, `pewMeaningDashboard`, 3295–3447; `apps/demo/public/datasets/pew-meaning.csv`, 1–15.]

Scatter already renders numeric Share against categorical Topic bands, with labels, all-source scale domains, typed brushes, point source IDs and categorical colors. However, categorical order is alphabetical and jitter is unconditional; neither has a public override here. Normal point keyboard/click activation is still gated on a size plan, despite the renderer having reusable source-point selection handlers. Those are substantive interaction gaps for an accessible paired-dot mode. [`packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts`, 105–214; `packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts`, 22–103; `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx`, 40–225; `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx`, 482–500, 536–566 and 637–657; `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.test.ts`, 79–151.]

**Inferred.** Grouped Bar is a valid way to see both shares but loses the compact pair/gap emphasis. Scatter plus a shared connector supplies a smaller complete path than a new family. Named party roles must determine the sign: relying on alphabetical ordering is fragile. The composition's `difference` calculation also returns zero if only one valid endpoint remains after filtering, because first and last become the same row. That should not become the built-in policy. [`packages/explorEDA/src/components/charts/Composition/calculations.ts`, `evaluateCalc`/`orderedEnds`, 105–133 and 171–198.]

**Proposed — REC-02, paired-dots stage.** Choose Scatter → Paired dots; set category Topic, value Share and the actual source roles `Dem/Lean Dem` then `Rep/Lean Rep`. Disable jitter, use supplied Order, add value/difference labels, and distinguish endpoint selection from whole-pair selection/trace. Require one valid value per role or an explicitly chosen aggregate. **Try → Observe → Decide:** obtain +14 R, reverse the named roles, remove one party and introduce a duplicate role. Accept only if sign reverses, the lone point remains with unavailable difference, duplicates are explained, and keyboard/Alt-trace reaches exact source rows. Keep the tinted difference column as optional authored presentation rather than a prerequisite; separate export parity is not claimed.

### income-life

**Verdict — already-built-in.** The analytical task is already reachable with Scatter's public fields, true log x-axis, bubble sizing, categorical color and keyed record callouts. No new chart type or logarithmic scale work is warranted. Move the primary lesson to a configured built-in Scatter; retain the authored composition only as an optional labels/artboard example. **REC-22** is a convenience proposal, not a prerequisite.

**Observed.** `incomeLifeDashboard` maps GDP per capita to log x, life expectancy to y, population to circle size, region to color, and labels twelve named countries (`apps/demo/src/demos/dashboardSettings.ts:3454–3600`). The dataset has 197 country rows. Scatter exposes X, Y, Color Field, Size by and Largest radius through `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx:97–179`; `packages/explorEDA/src/components/settings/AxisSettingsTab.tsx:63–108` exposes true Log. The actual scatter axis uses logarithmic padding and a positive-only domain, excluding nonpositive values rather than switching to symlog (`packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts:56–103,141–181`). `planScatter` bases size on full-source maximum and keeps source IDs; `planScatterPoints` gives area proportional to a nonnegative size (`packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts:323–350`; `packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts:52–99`). Bubble point clicks and keyboard navigation select exact source rows and trace size calculations (`packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx:277–289`; `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx:498–566`; `packages/explorEDA/src/components/charts/ScatterPlot/bubbles.test.tsx:109–192`, inspected but unrun).

**Smallest current author flow.** Add Scatter; choose GDP per capita, Life expectancy, Region and Population; set X Scale to Log; add twelve **Notes → Callout → Record** annotations keyed by Country. The public record UI supports a key field/value and the actual Scatter annotation frame projects that row (`packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx:277–299`; `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx:112–145,474`; `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx:731`). Country is unique in this snapshot, so no raw JSON or manual mark construction is needed. The existing categorical color scale/legend and title/source-note controls complete useful context.

**Parity and caveats.** Country labels can be individually placed; a bulk **Label selected/listed records** control would reduce repetitive authoring. There is no aggregation denominator: population sizing uses the largest source population. The baseline composition treats tiny/invalid sizes differently from built-in bubbles and pins nonpositive log x to the low edge (`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:3645–3657`; `packages/explorEDA/src/components/charts/Composition/scatter.test.ts:114–164`); those are not improvements to copy into the built-in contract. The snapshot's valid positive encodings support analytical parity, while exact label offsets, source-note wrapping and composition export are not pixel-equivalent.

**Proof.** Configure through public settings, place a China callout, filter Region, select/trace a bubble and restore the saved dashboard. Reject the counterpart if bubble area or scale changes after filtering, country identity becomes ambiguous, or the callout jumps to another row. Product/browser proof remains proposed; source review establishes current reachability.

### covid-tiles

**Verdict — mixed.** Ordinary state-history comparison belongs in Line facets; the authored geographic tile arrangement can remain composition. Defer a reusable tile layout until the Line and election-strip examples jointly prove a modest contract.

**Observed.** `covidTilesDashboard` has 51 repeated paths placed by the source Tile addresses, including geographic holes, one shared Date domain and one shared rate domain. It marks the latest point but labels each state with **Peak**, a max calculation that follows live rows. The helper comment says latest label; the actual settings and subtitle describe the worst week. The supplied dataset has 8,109 rows and 160 distinct weekly dates. [`apps/demo/src/demos/dashboardSettings.ts`, `covidTilesDashboard`, 3607–3765; `apps/demo/public/datasets/covid-tiles.csv`, complete profile.]

Current weekly calendar Line with State facets is a strong built-in alternative because each retained state/date row is already a weekly rate. Its public wrap/grid facets can be reordered or focused, but regular layouts page and enforce ordinary panel sizes; they do not map a Tile field. Calendar Line additionally narrows all-source IDs to each facet, and derives its X periods from live rows. Thus the default result is not evidence of a stable shared global timeline/value scale. [`packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx`, 68–97; `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts`, 136–174 and 314–386; `packages/explorEDA/src/components/charts/FacetRelated/facetLayout.ts`, 5–88.]

The composition's tile parser uses the first readable nonnegative integer row/column address and appends unaddressed groups below the grid. Its tests cover locations, holes and fallback; they do not settle duplicate address collisions. A proper public layout needs an explicit ambiguity policy, focus order, readability and export behavior. [`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`, `tileAddresses`, 1503–1544; `packages/explorEDA/src/components/charts/Composition/tiles.test.ts`, 1–142.]

**Proposed — REC-06/REC-19/REC-01.** First deliver compact Line facets with explicit shared domains, source-point trace and peak/latest summaries. Keep geographic placement as an advanced composition lesson. Do not call an equal-weight average of state rates the national rate: the companion “National average by week” simply averages available rows, with no supplied population weights or national series (`apps/demo/src/demos/dashboardSettings.ts`, 3746–3763). Qualify its title/context.

**Try → Observe → Decide:** compare a regular facet counterpart with the tile composition for peak timing and linked state selection. Advance a tile helper only after 51 panels, invalid/duplicate addresses, holes, resizing and keyboard traversal remain comprehensible for both this chart and elections. Otherwise retain composition. The matrix of trajectories is an analytical core; approximate geographic adjacency is an additional comparison. Paged ordinary facets do not match that authored treatment or its single-graphic output, and composition export fidelity is separately assessed.

### covid-compare

**Verdict — composition-justified.** This combines distinct populations and distinct windows inside every repeated panel. Keep it as a primary advanced composition example, while considering a simpler benchmark/focus Line as a useful independent improvement.

**Observed.** `covidCompareDashboard` repeats six states, skips “United States” as a panel, and retains Code=US as a composition-population path in every state panel. The main frame begins July 4, 2022, while a separately positioned inset shows the entire history. Main and inset value scales are distinct, and the latest state rate is labeled. The nationwide rows are not deleted merely because the repeat skips a national panel. [`apps/demo/src/demos/dashboardSettings.ts`, `covidCompareDashboard`, 3773–3994; `packages/explorEDA/src/components/charts/Composition/insets.test.ts`, 1–221.]

The relevant resolver behavior is substantive: local window limits alter frame domains and the drawn rows; the inset has its own frame; path population can be the whole composition rather than the repeat. Nevertheless, “composition population” still means **live** composition rows. It does not guarantee an always-unfiltered benchmark. An external filter that excludes national rows can remove the national context unless a separate policy is deliberately introduced. [`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`, 617–665, 1037–1063 and `pathNodes` 3301–3426.]

Ordinary Line facets receive per-state IDs, which excludes the national rows from that panel. Existing Line has neither an independent inset frame nor per-frame contextual populations. Two linked recent/full-history views or a single seven-series chart are the strongest smaller alternatives, and can answer many of the same numerical questions. They lose the repeated simultaneous comparisons of state versus nation **and** recent magnitude versus full historical magnitude. That is an analytical arrangement difference, not typography. [`packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx`, 68–97; `definition.ts`, 1–140; `packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx`, 370–438.]

**Proposed — REC-08/REC-25/REC-01.** Retain composition; defer a general inset wrapper. First try explicit focus/benchmark Line populations without nested frames. Preserve benchmark selection/trace separately from each state, and disclose whether reference rows follow dashboard filters. Correct another observed mismatch: the companion is titled “Average of the six states by week”, but it averages a seven-State source including United States; no exclusion is configured (`apps/demo/src/demos/dashboardSettings.ts`, 3975–3994; `apps/demo/public/datasets/covid-compare.csv`, complete profile).

**Try → Observe → Decide:** compare the simpler focused Line plus full-history companion with the six inset panels on recent divergence and historical peak magnitude. If users still need both frames at once within each state, that is evidence to keep the composition, not to create a universal frame editor. Existing dashboard rendering does not establish matching standalone export; that separate output contract must remain explicit.

### elections

**Verdict — mixed.** The state-by-election values should be ordinary Heatmap data. A fixed centered scale is a reusable extension; the explicit geographic strip layout remains a sensible composition lesson.

**Observed.** `electionsDashboard` places 51 state strips at Tile addresses. Each strip shows 11 election years, average Margin, and a signed red/blue square-root magnitude scale capped at 40 points. The actual repeat order is label, despite a helper comment describing latest-margin ordering. The CSV already contains the signed Margin field alongside rounded party shares: 561 complete State×Year pairs. [`apps/demo/src/demos/dashboardSettings.ts`, `electionsDashboard`, 4001–4124; `apps/demo/public/datasets/elections.csv`, complete profile.]

A public Heatmap with rows=State/Code, columns=Year, average Margin and `maxCategories=60` can show all 51×11 cells. It retains exact contributor rows and supports cell/axis selection, keyboard navigation and Alt-trace. Unlike measles and message-log, its dimensions fit the existing cap. Its heat helper automatically chooses a divergent scale only when the current values straddle zero, with no explicit center, square-root transform or fixed ±40 domain. Filtering may therefore change the interpretation of color. The composition's explicit 40-point cap is stronger here. [`packages/explorEDA/src/components/charts/Heatmap/HeatmapSettingsPanel.tsx`, 109–158; `packages/explorEDA/src/components/charts/Heatmap/Heatmap.tsx`, 307–364; `packages/explorEDA/src/components/charts/heatScale.ts`, 1–68; `packages/explorEDA/src/components/charts/Composition/elections.test.ts`, 1–245.]

**Inferred.** The main numerical analysis needs a small explicit scale extension, not a new election chart family. Spatial scanning is an additional useful capability. Generic facets cannot be called an implementation of tile strips: Heatmap passes facet-limited live IDs but global all-source IDs to its planner, so each nominal state facet would still have all matrix category positions. A shared tile helper needs deliberately scoped per-panel positions and a separately shared color domain, in addition to the absent public Heatmap Facets tab. [`packages/explorEDA/src/components/charts/Heatmap/Heatmap.tsx`, 80–107; `packages/explorEDA/src/components/ChartSettingsContent.tsx`, 68–95.]

**Proposed — REC-05/REC-19/REC-01.** Offer explicit centered/capped heat color in Advanced, preserving the supplied Margin and exact row provenance. Do not recompute margins from rounded shares or normalize selected states as parts of one total. Keep tile placement deferred pending a two-example proof with Covid. **Try → Observe → Decide:** filter to positive margins, negative margins and a single state while keeping the same value the same color; test values beyond ±40 and restore. Accept the Heatmap counterpart if sign, cap and row sets stay truthful. Keep composition for the geographic single graphic; exact placement and standalone export are not claimed by analytical matrix parity.

### lincoln-ridgeline

**Verdict — new-built-in-family, exposed as a Ridgeline display within Distribution.** Comparing monthly distributions should not require an artboard. The existing Box/Violin chart covers location, spread, outliers, and a density shape; it does not implement the comparable density heights shown here. Composition is conditionally required today for that particular comparison, not for ordinary monthly distribution analysis. Keep the example as advanced teaching and add a built-in counterpart.

**Observed.** `lincolnRidgelineDashboard` defines twelve monthly repeats, orders them by maximum `Month number` over unfiltered rows, overlaps 96-pixel frames with a −54 gap, and draws Gaussian density marks with a 3.4 °F bandwidth, shared height, and an x-dependent temperature gradient. Its companion is already a Box Plot of `Mean temperature` by `Month`, plus a histogram; the helper sets Box rather than Violin. The CSV contains 366 daily rows. [`apps/demo/src/demos/dashboardSettings.ts:4131–4285`, helpers `box` at 86–122; `apps/demo/public/datasets/lincoln-weather.csv`]

**Observed comparison.** Box Plot's public Display control selects Box or Violin; Observations adds the first 300 valid source rows per group. The rendered observations use source-ID jitter, not the unused `calculateBeeSwarmPositions` helper. `calculateKernelDensity` samples each group's own min/max and divides every group's density by that group's maximum, while `resolveUnit` computes common-grid densities and selects a shared maximum across repeats. Rotating the existing violin would therefore erase the tight-versus-wide peak comparison. The built-in does keep its numeric domain and group order stable under linked filters, and traces valid and excluded inputs. [`packages/explorEDA/src/components/charts/BoxPlot/BoxPlotSettingsPanel.tsx:100–167`; `packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts:111–142`; `packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx:210–309,318–409,583–620`; `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:619–683,1264–1287,2719–2795`, all beneath `packages/explorEDA/src/components/charts/`]

**Proposed — REC-12.** Add one named density display, reusing Distribution's field/group selection and trace, with a pure common-grid KDE helper that returns unnormalized probability density, valid IDs, exclusions, and the bandwidth in field units. Add horizontal value-axis projection, stable order by a supplied field, overlap, common/per-group height, and optional x-value shading. The existing bandwidth input advertises 0.1–1; replace that assumption with a validated positive field-unit input that supports both 3.4 and 0.05. This is moderate renderer/numerical work, not one setting. Default heights should use a stable population reference with growth when necessary; composition's current peak recomputes from live rows. Do not copy that rescaling silently.

**Proof and boundary.** Try two equal-size groups with narrow and broad distributions, then the twelve months. Observe identical sample coordinates, the narrower group's larger common-scale peak, correct January–December ordering, and exact contributor traces after filtering. Reject a violin-only rotation if peaks become equal. Reuse common persistence/axis/annotation gates; exact page typography, gradient placement, and fixed-artboard PNG remain separate presentation work. Existing `packages/explorEDA/src/components/charts/Composition/ridgeline.test.ts` documents these distinctions but was read, not run.

### climate-ridgeline

**Verdict — new-built-in-family, sharing REC-12 with Lincoln.** A dense ordered series of yearly distributions is a reusable density display. Eighty-four repeats and three ordinary callouts do not by themselves justify requiring composition. The current built-ins do not preserve this many separate density shapes on common probability-density units. Composition is required today for that complete comparison; it should cease to be required if the bounded Ridgeline mode proves useful.

**Observed.** `climateRidgelineDashboard` uses `Difference`, a fixed −1.4 to 1.3 x extent, a diverging blue/white/red value scale, bandwidth 0.05, common density height, and ascending `Year` repeats. Each 64-pixel frame advances only eight pixels because its gap is −56. Only every fifth year is named; the 1998, 2016, and 2023 annotations attach to specific repeat frames. The included file contains 30,660 daily rows and 84 years. The example explicitly calls them illustrative synthetic values; this review makes no claim about observed climate measurements. Companion Scatter and Histogram charts are different analytical views, not delivery of the ridge behavior. [`apps/demo/src/demos/dashboardSettings.ts:5063–5258`; `apps/demo/src/demos/examples.ts:910–922`; `apps/demo/public/datasets/daily-global-temperature.csv`]

**Observed comparison.** Box/Violin can retain separate groups and source contributors, but a box suppresses density shape and the violin normalizes every peak independently. ECDF computes exact within-group cumulative shares and traces both the exact-value rows and threshold numerator. Its planner, however, takes ten largest live groups and merges the remainder into Other; it cannot silently stand in for 84 identifiable annual curves. An ECDF addresses a useful different question—how much lies beyond a threshold—not the same compact trend in density; it also lacks a current public Facets tab (`packages/explorEDA/src/components/ChartSettingsContent.tsx:68–95`). [`packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts:111–142`; `packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts:94,129–193,321–327,389–421`; `packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.test.ts:47–117,149–159`]

**Proposed — REC-12.** Build the same common-grid density contract as Lincoln, then add an every-nth-label control that hides labels only, never groups. Preserve all year identities, the diverging center at zero, valid-row denominators, and a stable numeric extent. Row spacing/overlap belongs under density layout, not ordinary facets; no generic nested-repeat framework is necessary. The three callouts should use the existing ordinary annotation system with renderer-supplied category/density subjects. Current Box Plot supplies only a scale frame, so those anchors require a concrete projection callback; merely enabling Notes cannot reproduce them. [`packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx:513–535`; `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:668–683,1264–1287,2719–2795`]

**Proof and boundary.** First prove twelve rows, then all 84 at the intended saved chart size. Observe that filtering changes each year's density but preserves group locations, bandwidth semantics, x colors, and the population-referenced height policy. Verify the three notes follow their named groups and missing groups do not become fabricated densities. Reject the mode if readable 84-row output requires free-form element placement. Keep this composition as the dense-case teaching reference; move routine annual distribution work to the new mode. Exact report export remains a separate parity requirement.

### banana-yields

**Verdict — mixed.** A linked Pivot, Heatmap and Line is the strongest smaller analytical route. Keep the aligned mixed-content article in composition rather than introducing a general table of arbitrary charts.

**Observed.** `bananaYieldsDashboard` places a per-country yearly trend inset beside a calculated average column and six labeled decade-color cells. The trend Y scale is per-country; decade color is shared; rows order by overall average. The note says decade figures come from the named source, annual trajectories are illustrative values matched to those figures, and the 2010s end in 2018. The CSV has 814 physical rows: 806 valid country-years plus eight explicit blank Year/Yield placeholders for unavailable decades. The catalog's 806 count is a valid-year count, not the physical row count. [`apps/demo/src/demos/dashboardSettings.ts`, `bananaYieldsDashboard`, 4464–4652; `apps/demo/public/datasets/banana-yields.csv`, complete profile.]

Current Pivot can group Country×Decade, average Yield, show totals and shade cells. Its total is recomputed over covered source values, not by averaging displayed decade means. That matters: a complete earlier decade contributes ten annual values, while 2010–2018 contributes nine. The contributor dialog lists source IDs, grouping keys, original input and exclusions. Header clicks filter; cell clicks inspect. Heatmap offers direct cell selection/trace for the same 15×6 means. Numeric Year/Yield Line supplies trends and facets, but raw path points lack equivalent source activation. [`packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts`, 95–112, 205–279 and 371–426; `packages/explorEDA/src/components/charts/PivotTable/PivotTable.tsx`, 181–294, 340–405 and 602–724; `packages/explorEDA/src/components/charts/Heatmap/heatmapPlan.ts`, 270–308; `packages/explorEDA/src/components/charts/LineChart/LineChart.tsx`, 190–233 and 751–783.]

**Inferred.** Separate linked views preserve the values and drill-down, but not every simultaneous cross-country/decade comparison or the single-row alignment. Their trace targets also differ: one decade cell, an overall valid-year mean and one illustrative year are different populations. A universal table would need nested renderers, scale policies, focus/selection dispatch, source trace and export rules. DataTable's scalar cells and field-profile SummaryTable are not hidden versions of that feature. Tech-sparklines, actually a grid, supplies no second rich-table requirement.

**Proposed — REC-05/REC-06/REC-20/REC-01.** Add the linked counterpart now; prioritize source-aware Line, explicit heat domains and modest summary/order support. Keep the rich-table proposal deferred. Preserve the illustrative-series note in both dashboard and output. **Try → Observe → Decide:** compare an ordinary Pivot mean to a decade cell and overall total, inspect an NA placeholder, and select Country/Decade to reveal the corresponding Line observations. Accept analytical coverage only with exact included/excluded row sets and correct valid-year weighting. If readers still require simultaneous aligned sparklines after that trial, retain composition or consider a narrowly specified later mode. Do not label separate views or their output as the same authored graphic.

### yield-gap

**Verdict — new-built-in-family as a Unit counts display, conditional on proving value beyond a stacked histogram.** This is not a generic histogram with a square bar style. Its useful special capability is that each square traces one country/crop source row. Composition is conditionally required today for that record-level unit display; aggregate distribution and regional-mix analysis has smaller current alternatives. A future bounded unit-count mode should make manual marks unnecessary.

**Observed.** `yieldGapDashboard` draws `waffle` marks, one row per cell, split by `Continent` and repeated by `Crop`. A numeric x scale fixes 0–13; `resolveUnit` rounds values to whole-number bins, retains the complete sequence of bins, and calls `waffleNodes` inside each bin with three columns. The cells use exact `rowIds` when `each:1`; ordinary click selects the crop repeat, while Alt-click traces a cell. The prepared file has 197 synthetic crop-country rows—100 Wheat and 97 Maize (corn)—and every supplied gap is already an integer. The companion continent Row chart and global Histogram do not show their joint distribution. [`apps/demo/src/demos/dashboardSettings.ts:4659–4787`; `apps/demo/public/datasets/yield-gap.csv`; `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:430–449,1155–1197,2324–2418`; `packages/explorEDA/src/components/charts/Composition/waffle.test.ts:145–219`]

**Observed comparison.** The numeric histogram already produces whole-number-centered bins when the entire field is integral. Bar's `seriesField` path switches to `SeriesBarChart`, whose count/sum aggregation groups exact category values rather than running `numericBins`. On this already integral fixture, a stacked categorical count by Gap split by Continent is a useful counterpart, but it is not a general color-split histogram: absent bins can disappear, and live categories define the visible bands. Scatter with categorical Crop, numeric Gap, and Continent colors offers individual source points, but uses jitter and overlapping circles. [`packages/explorEDA/src/components/charts/BarChart/bins.ts:1–38`; `packages/explorEDA/src/components/charts/BarChart/BarChart.tsx:98–103`; `packages/explorEDA/src/components/charts/BarChart/SeriesBarChart.tsx:58–93`; `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts:77–91,205–225`; `packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts:105–164,193–214`]

**Proposed — REC-13.** First add color-split numeric bins that retain numeric intervals, empty positions, per-bin/category numerators, and exact contributing IDs. A later Unit counts display may tile those IDs with stable category colors, fixed bin geometry, common cell area, and a pixel budget. Share its count-to-cell helper with Titanic waffle; do not compile Bar into composition. Keep the initial contract `one row = one cell`; rounded multi-row cells and 100-cell normalization are separate semantics and should remain deferred until needed.

**Proof and boundary.** Compare built-in stacked bins with unit cells on the 197 rows, including an empty interior bin and a filter that removes one crop. Observe retained 0–13 positions, correct regional bin counts, and one unique source row per cell. Test one Alt-Enter cell trace and the existing crop/group selection semantics without pretending that current composition selects an individual country. If direct cell traces add little beyond the histogram's source list, defer the unit renderer and teach the simpler histogram. Keep the composition as an advanced comparison during that decision.

### middle-class-jobs

**Verdict — small-extension.** These are repeated two-period connected observations with a numeric color encoding. They should become an advanced Scatter workflow, using **REC-02** for grouped connections and the existing manual facet order. Automatic order from a field and supplied summary labels can follow separately. The ten-panel arrangement and ordinary callouts do not independently justify requiring composition.

**Observed.** `middleClassJobsDashboard` uses numeric Year/Jobs-per-1000 axes, 67 Occupation paths within ten Group panels, a fixed 0–85 y range, endpoint points, and color from Women minus men. Panel order and signed label are supplied `Group order`/`Group change` fields, reduced by max with filters ignored (`apps/demo/src/demos/dashboardSettings.ts:4795–5062`). Five ordinary callouts attach to frame locations. All 134 rows form two observations per occupation; the numeric gender difference is constant across each occupation's two rows. `pathNodes` colors an entire path from its first ordered row, while `pointNodes` colors individual rows (`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:3318–3360,3638–3729`). Thus a future path implementation must state what happens when a coloring field varies along a series. Existing Scatter has the numeric axes, value color mapping, facets, point traces and annotations; it lacks grouped connections. Raw Line instead expects one series per measure column, sorts by x and has no original row ID in reduced points (`packages/explorEDA/src/components/charts/LineChart/LineChart.tsx:190–233`), so merely adding `colorField` would not complete the chart.

**Proposal.** In Scatter Points, enable **Connect observations**, choose Year order and Occupation group, retain numeric Color Field, then facet by Group. Reuse fixed axis limits and the current Facets chips to order the ten groups (`packages/explorEDA/src/components/settings/FacetSettingsTab.tsx:200–231`). Public ColorScaleControl already offers diverging palettes, Start/Midpoint/End and Balance sides (`packages/explorEDA/src/components/colorScales/ColorScaleEditor.tsx:309–425,463–489`), so no new numeric ramp is needed. A later automatic order from Group order and supplied Group change label would reduce authoring; the first counterpart can put the supplied group figures in an ordinary note. Keep them distinguishable from a newly computed sum of surviving occupation changes: the source deliberately ignores filters for them. No free-scale facet work or separate Slope engine is prerequisite for this grouped-connection proof.

**Parity and proof.** The source is approximate illustrative data, so claims concern the provided values rather than external employment estimates. Jobs-per-1000 and gender difference are supplied measures, not new percentages to normalize. The strongest alternative is grouped Scatter connections plus ordinary Notes, which preserves the comparison with less work than a new chart family. Existing separate scatter points would lose the occupation pairing, while pivoting to 67 independent measure columns complicates traceability and colors.

**Try:** connect the 134 rows, select one Group, hide one occupation and trace both its path and endpoint. **Observe:** no path joins two occupations; numeric colors remain stable; point and path row memberships agree; the fixed range clips without filtering; Group change still clearly refers to the supplied unfiltered figure. **Decide:** reject if the implementation silently recalculates the group label from filtered lines or assigns path color from arbitrary file order. Keep composition as an advanced teaching variant after the built-in counterpart exists.

**Dependency clarification.** REC-07 is an optional raw-Line alternative. The selected route is REC-02 with existing numerical color controls, fixed axes and manual facet order; automated facet statistics are optional REC-06 convenience.

### du-bois-income

**Verdict — already-built-in for the analytical task.** Move primary teaching to an existing 100% Bar grouped by Class, summed by Share, and split by Category. Keep the historical composition as optional advanced teaching. The hand texture, paper color, typography, and connector styling do not establish a need for composition in ordinary income/expenditure comparison.

**Observed.** `duBoisIncomeDashboard` orders income classes by maximum `Order`, displays maximum `Average income` beside each class, and draws horizontal normalized `stack` marks with first-seen category order, percentage labels, and connectors joining cumulative category boundaries between adjacent classes. The source CSV contains 33 class-share records across seven classes, not 150 individual-family records; every class's shares sum to 100. The two highest classes lack Rent rows. Companion Row charts count share records by Category and Class, which is useful for selecting those values but not a replacement calculation for family expenditure. [`apps/demo/src/demos/dashboardSettings.ts:4287–4456`; helpers `row` at 26–46; `apps/demo/public/datasets/du-bois-income.csv`]

**Observed comparison.** `BarChartSettingsPanel` publicly offers a grouped Sum with measure Share, a Category split, and 100% display. `SeriesBarChart` preserves source series order; `planSeriesBars` computes category totals, segment numerator/denominator/share, and contributing `AggregateResultRow` objects. Its `SeriesBarChart` renderer supports pointer and keyboard selection of class/category intersections and Alt-Enter trace with denominator records. `packages/explorEDA/src/components/charts/BarChart/stackedBars.test.tsx` explicitly exercises a 10/40 share, invalid source input, and denominator recomputation after an external filter. Existing current settings therefore preserve the numbers, linked comparisons, and source provenance without composition. [`packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx:34–98,126–146,209–278`; `packages/explorEDA/src/components/charts/BarChart/SeriesBarChart.tsx:58–93,270–349`; `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts:115–139,230–286`; `packages/explorEDA/src/components/charts/BarChart/stackedBars.test.tsx:181–215`]

**Proposed — optional REC-11.** Add horizontal orientation, compact segment value/share labels, and an optional adjacent-category boundary connector to the existing series-bar planner/renderer. Reuse the prepared category/series totals; this changes geometry and presentation rather than aggregation. Source-order already matches this fixture, so do not make an invented custom sort requirement a blocker. Average income can remain in a linked table or an optional category-side value display; it must not be multiplied by the number of share records. Mirror support is a separate dependent capability needed for the pyramid, not for this example.

**Proof and boundary.** Build the seven-class counterpart entirely through current settings and compare every share against the CSV, including absent Rent cells. Select Food and observe denominator recomputation in both views; verify the trace refers to class-share source rows. Then try horizontal labels/connectors and keep them only if they improve comparison. Exact historical page recreation and its fixed-artboard output can continue to use composition voluntarily. The absence of a paper texture or exact lettering is not a failure of analytical parity.

### tax-slope

**Verdict — small-extension.** Two readings per country, connected and labeled at both ends, should be a named **Slope comparison** preset within an existing connected-observation workflow. **REC-02** covers grouped connections and endpoint labels. The source has no essential free arrangement beyond that contract, so composition should not remain mandatory.

**Observed.** `taxSlopeDashboard` plots Year and Tax revenue for 34 countries, groups paths by Country, colors them by supplied Direction, labels both ends with country/value and asks for endpoint-only x ticks (`apps/demo/src/demos/dashboardSettings.ts:5262–5409`). The CSV has 68 rows. Its supplied Change field differs from subtraction of the rounded endpoint values for six countries; preserve it as supplied rather than implying newly computed changes are identical. `pathNodes` chooses the first valid ordered row's color, and `endLabelNodes` dodges each side's labels while retaining vertical order (`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:3348–3418,3437–3474`). Tests describe these behaviors in `packages/explorEDA/src/components/charts/Composition/slope.test.ts:106–182`. Raw Line offers numeric x and multiple measure columns, not row-grouped country series; the calendar workaround is not complete, because its planner rejects more than 30 live series (`packages/explorEDA/src/components/charts/LineChart/definition.ts:44–58`; `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts:169–174`).

**Proposal.** Add Scatter **Connect observations**, group Country, order Year, straight lines, and **Labels → Both ends → Name and value**. The preset can hide intermediate x ticks and use stable source color categories, leaving common axes and Notes intact. Endpoint labels need measured margins, collision handling and trace/keyboard association to the path; copying text nodes without hit/trace semantics is incomplete. Avoid a general label-placement engine. Reuse a small tested vertical dodge helper and expose no arbitrary typography matrix until needed.

**Parity and proof.** Exact analytical parity retains both original endpoint rows and the supplied Direction/Change columns. Ordinary color Scatter preserves only the two clouds until connections exist. Calendar conversion, wide pivots, or dozens of manual annotations are weaker alternatives: they introduce a series cap, data restructuring or substantial repetitive authoring without preserving the complete simple flow. Endpoint name/value labels are useful in the single graphic; the large side margins and title placement remain optional authored presentation. A missing endpoint must produce a clearly incomplete country rather than a connection to a different country's row.

**Try:** draw all 34 countries, create identical endpoint values for two countries, remove one reading and filter Direction. **Observe:** endpoint labels remain associated with the correct source rows, ties do not swap identities, incomplete countries are traceable, and line/point colors follow the same supplied field. **Decide:** reject if a 30-series workaround is imposed, if labels are clipped at the smallest supported panel, or if changing palette/filter changes country pairing. Keep the current composition as an advanced label-layout lesson; move its primary teaching route after the preset passes proof.

**Dependency clarification.** REC-07 is an optional raw-Line alternative, not a prerequisite of the selected REC-02 Scatter slope route.

### titanic-waffle

**Verdict — new-built-in-family only for the Unit counts presentation; composition is not necessary for survival/count analysis.** A categorical stacked count Bar plus a 100% counterpart already compares class size, fate counts, and conditional survival, with exact source lists. The coherent unmet capability is one identifiable passenger cell, reusable with yield-gap. Keep this example as an advanced reference and add a built-in unit counterpart only after the smaller bar alternative is compared.

**Observed.** `titanicWaffleDashboard` repeats three class frames, uses twenty cells per row, and fills from the bottom with Fate in label order. `each:1` and `normalize:false` make every supplied passenger one cell. `waffleNodes` derives square size from frame width and maps each cell to its exact one-element `rowIds`; it reflows live cells under filters. The CSV contains 1,309 passenger records, distributed 323/277/709 across first/second/third class, with survived counts 200/119/181. These are packet arithmetic checks, not independently reverified historical claims. Companion sex, age-group, and age views filter the live passenger population. [`apps/demo/src/demos/dashboardSettings.ts:5411–5520`; `apps/demo/public/datasets/titanic.csv`; `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:2324–2418`; `packages/explorEDA/src/components/charts/Composition/waffle.test.ts:76–138`]

**Observed comparison.** Current Bar exposes Class as category, Fate as split, count operation, and Stacked or 100% display. Category/series filters, trace contributors, normalized denominators, and keyboard interactions already exist. A whole-class or fate aggregate trace lists the real passengers. That is analytical parity for counts and survival, although it changes the one-person-per-visible-cell reading. The current composition's normal click selects a repeated Class, not the cell's passenger. Do not justify a new selection model by mistakenly claiming the example already provides it. [`packages/explorEDA/src/components/charts/BarChart/definition.ts:10–20,47–65`; `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts:115–139,230–286`; `packages/explorEDA/src/components/charts/BarChart/SeriesBarChart.tsx:270–349`; `packages/explorEDA/src/components/charts/Composition/waffle.test.ts:95–105`]

**Proposed — REC-13, deferred until proof.** Add a named unit-count display that consumes actual source IDs and permits Category and Split by controls, common cell size, columns per class, and a bounded layout. Reuse the category/series data and denominator contract while introducing a separate cell plan and hit/keyboard traversal. Normal selection should preserve a clear declared category/series behavior; Alt-Enter reaches the exact passenger. Do not silently switch to sampling, multi-person cells, or rounded percentages when the chart becomes small.

**Proof and boundary.** At one row per cell, sum the visible cells to the filtered row count and assert each ID appears exactly once; verify the six Class×Fate totals, one passenger trace, stable colors, save/restore, and no filter created by changing cell layout. Compare against the much simpler stacked count and percent pair before approving renderer work. Keep normalized 100-cell rounding and arbitrary pictograms outside the first contract. Export of the authored artboard is distinct from dashboard parity and requires the report's common output gate.

### unemployment-stream

**Verdict — already-built-in for the analytical task.** Current Calendar Line's **Stacked area**, monthly **Sum**, split by Industry, preserves every industry's magnitude, changes over time and the total. The wandering baseline is a distinctive presentation choice, not an additional numerical comparison. Add that built-in counterpart now and retain the composition as a useful stream-baseline lesson. **REC-21** records a deferred exact-stream option rather than making it a prerequisite.

**Observed.** `unemploymentStreamDashboard` stacks Unemployed (thousands) by Industry at each Month, orders categories by total, and requests `baseline: "wiggle"` with smooth curves (`apps/demo/src/demos/dashboardSettings.ts:5522–5667`). The CSV is a complete grid: 1,708 rows, fourteen industries, 122 months, one row per Industry/Month, and no blank amount. Monthly sum therefore reproduces every supplied plotted value without inventing a different denominator. Public Line settings expose calendar interval, sum measure, split and stacked-area display, with missing-period rules (`packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx:97–278`). `planTimeSeries` retains contributor rows, forms exact lower/upper stack bounds and rejects signed or averaged stacks; missing invalid totals break complete stacks (`packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts:180–308`). `TimeSeriesChart` gives point-level keyboard selection/trace and `timeAreaAt` resolves a band hit to the defining period (`packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx:280–408`; `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts:464–479`).

**Smaller alternative and limits.** Configure Date=Month, interval=Month, measure=Unemployed (thousands), aggregation=Sum, split=Industry, display=Stacked area. Do not use Unemployment rate as an additive measure. The zero baseline preserves band thickness and makes total height explicit. Default series order and straight edges differ from the composition; the source's whole-industry band trace differs from the built-in's finer period/series trace, which can inspect the other series establishing its baseline (`packages/explorEDA/src/components/charts/LineChart/areaCharts.test.tsx:161–193`). There is no repeat field on the composition, so plain glyph clicking does not supply an essential industry selection that the counterpart would lose. Exact page/export styling is not claimed.

**Deferred proposal.** If actual use establishes demand for a stream display, add a baseline mode and stable stack order to the existing area planner. The numerical helper `streamOffsets` is reusable, but smooth-path drawing must agree with hit testing and trace bounds; adding a dropdown alone would be false parity (`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:3010–3190`). Its maintenance cost includes baseline sensitivity when filters change the series population and intervals disappear.

**Proof.** First compare all 14×122 built-in period values and summed totals to source rows, then select an Industry/Month, inspect baseline contributors, and remove a month through an external filter. Reject analytical parity if a sum combines rates, a missing value becomes fabricated zero, or traces lose original rows. Implementing wiggle should proceed only if users need the compact stream treatment beyond these already available comparisons.

### population-pyramid

**Verdict — small-extension of categorical series bars.** Mirrored bars are a bounded geometry mode over existing grouped sums, not a new grammar. Composition is conditionally required today for the two mirrored profiles; grouped bars already expose the underlying values. Ordinary age/sex comparisons should become available through progressive Bar settings.

**Observed.** The `pyramidUnit` helper creates two independent frames locally windowed to Year 1900 and 2000. Each repeats Age group in descending numeric `Age` order, sums `People`, mirrors Male leftward, and explicitly fixes the length maximum at 12 million. `barValues` negates only the plotted mirrored aggregate, while `barNodes` retains exact row IDs and the mirror metadata; unsigned tick labels convey population magnitudes. The included 570 rows are preaggregated census-year×age×sex buckets. Default companion `row()` charts count those bucket records even where their titles say People; an analytical counterpart must explicitly sum People. [`apps/demo/src/demos/dashboardSettings.ts:5669–5822`, `row` helper 26–46; `apps/demo/public/datasets/us-population.csv`; `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:2440–2553`; `packages/explorEDA/src/components/charts/Composition/pyramid.test.ts:83–153`]

**Observed comparison.** Bar already supports Sum grouped by Age group with a Sex split, signed grouped/stacked geometry, exact aggregate contributors, and two-sided bounds on its numeric axis. Its series renderer is vertical, with a uniform category band and no mirror-by-series contract. Row has horizontal sums, but its planner ranks by all-row total and collapses excess categories into Other; it has no series split. Neither can be treated as a ready pyramid by changing a title. Two current grouped-sum charts using Filters → Chart rows for local Year scopes are a useful numerical counterpart. `packages/explorEDA/src/components/settings/FiltersSettingsTab.tsx:201–258` exposes these controls, and `useGetAllIds` restricts each chart's reference population without filtering other charts (`packages/explorEDA/src/components/charts/useGetLiveData.tsx:60–79`). [`packages/explorEDA/src/components/charts/BarChart/definition.ts:10–20`; `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts:125–216,230–319`; `packages/explorEDA/src/components/charts/RowChart/RowChartSettingsPanel.tsx:125–217`; `packages/explorEDA/src/components/charts/RowChart/rowChartPlan.ts:35–46,75–117`]

**Proposed — REC-11.** Add horizontal series geometry first, then a Mirror one series mode available for two nonnegative count/sum series. Keep source People positive; represent direction in the plan, so trace, labels, and the aggregate denominator remain truthful. Add stable category ordering by Age (or an explicit order), with descending direction, and symmetric shared limits. Update axis capability detection/editing and pointer hit projection along with rectangle coordinates. Use two local Year-scoped views or facets only if their domains remain shared and all age groups retain their slots; do not turn a display comparison into two conflicting global filters.

**Proof and boundary.** Try the 1900/2000 pair, confirm every side equals the corresponding source sum, both axes use ±12 million, age order stays still under a Sex filter, and source trace identifies age+sex+year rows while the chart-local Year limit stays local. Add a missing sex-age bucket and distinguish its absence from zero People. Reject any implementation that requires negating the persisted source field, loses facet scope in selection, or pools older ages into Other. Keep the composition to teach independent windows and shared scales; make the mirrored chart a normal advanced Bar mode.

### gdp-bump

**Verdict — new-built-in-family, preferably a named ranked Line mode.** Ranking a changing eligible population at every x requires a derived transformation and explicit comparison scope. It is reusable enough that authors should eventually reach it without manual marks, but it is not a small styling setting. Keep the composition as an advanced example while **REC-17** is deferred behind source-preserving grouped observations.

**Observed.** `gdpBumpDashboard` computes descending rank from GDP (current US$) at each numeric Year, groups Country paths, colors by Region and prints latest rank at the end (`apps/demo/src/demos/dashboardSettings.ts:5824–5957`). It explicitly says ranks are among the economies shown and filters re-rank them. The 740 source rows cover seventeen countries and forty-four years, with unique Country/Year pairs; the inventory's title should not be read as rank among all world economies. `rankRows` groups rows by readable x, ranks finite y, assigns sequential ranks and breaks ties by input row order (`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:2916–2944`). `resolveUnit` computes these ranks from live rows, supplies a reversed rank axis and uses rank coordinates in paths/labels (`508–527,625–630,2888–2907`). Existing Line has no rank transform or reversed-rank axis mode. Static prepared ranks would stop responding correctly to eligible-country filters.

**Proposal.** Add a **Rank** display mode after grouped observations retain source identity: x, series identity, ranking measure, ascending/descending order, explicit **Rank among filtered rows / all source rows**, and a declared tie policy. Scope changes must read as semantic settings. Keep region colors fixed under filtering. At each x, retain the competitor row IDs, raw measures, inclusion/exclusion reasons and the selected country's resulting rank. Points should select source rows or series according to a clear control; rank is a result, not a filter on raw GDP. End labels and smoothing can reuse observation rendering. A mode inside Line avoids a new top-level chart tile while acknowledging a distinct analytical contract.

**Parity and proof.** A table sorted by GDP answers one-year rank; a static rank column plus Line answers only a fixed population. Neither preserves the example's dynamic trajectories after filtering. The strongest smaller proof is a straight ranked line using supplied distinct country/year rows, with no arbitrary rank grammar, smoothing or top-k suppression. Never silently change sequential ranks to dense/competition ranks while describing exact baseline parity.

**Try:** filter out the largest economy, add a tied GDP reading, duplicate a Country/Year, and null one GDP. **Observe:** rank policy, competitor set and omitted rows are inspectable; the tie rule is deterministic and labels show rank rather than GDP. **Decide:** reject or defer the mode if duplicates lack a defined aggregation/validation rule or the trace cannot explain why a country moved. Custom presentation alone does not earn permanent composition, but this transformation warrants a separately costed mode.

### scotus-timeline

**Verdict — new-built-in-family with a narrow interval-lane contract.** Showing each record from a start to an end within a supplied lane is coherent and reusable. Existing duration summaries lose succession, vacancies, and simultaneous occupancy; ordinary Line or Scatter settings do not supply record intervals. Composition is required today, but should not remain the mandatory workflow for this bounded timeline.

**Observed.** `scotusTimelineDashboard` binds Start/End, repeats Seat name ordered by maximum Seat, colors by Party, and labels Surname when the span is wide enough. `resolveUnit` expands the x domain from both endpoint fields. `spanNodes` emits one clipped rectangle per valid-start row, retains its sole source ID, and treats a missing End as an open span to the current frame's right edge. It does not consult the clock. Both the maximum raw Start and End in the snapshot are 2022-06-30; nine End cells are blank. With this example's `nice:false` and no fixed maximum, the open endpoint therefore follows the source-domain edge, not the title's claimed “today.” This is a baseline semantic defect to correct, not a promised live-date capability. [`apps/demo/src/demos/dashboardSettings.ts:5959–6092`; `apps/demo/public/datasets/scotus.csv`; `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:574–578,619–665,3482–3562`; `packages/explorEDA/src/components/charts/Composition/spans.test.ts:103–157`]

**Inference.** Bar/Row sums or histograms of Years served answer duration and party totals but discard who occupied a lane when. Encoding duplicate start/end records for a Line chart introduces a new preparation and identity contract, and still has to define open ends and lane placement; it is not normal settings parity. A manual annotation for every justice is precisely the advanced authoring burden the built-in should remove. The existing companion views should remain supporting filters, not be presented as equivalent timelines.

**Proposed — REC-14, with REC-01 semantic correction.** Build a small Interval display/family with Start, End, Lane, optional label/color fields, stable supplied lane ordering, and an explicit open-end reference. Default to a saved as-of date or require a chosen endpoint when open records exist; a future true-current-date option would be separately named and intentionally time-dependent. Preserve original blank End and report open status in trace. Validation must separate missing starts, invalid date text, reversed endpoints, and overlapping records. The first contract uses supplied lanes; dependency scheduling, automatic Gantt packing, multiple resource assignment, and project-management interactions are out of scope.

**Proof and boundary.** Try a tiny fixture with a gap, a closed span, an open span, and an invalid start; observe correct endpoint provenance and no invented departure. On the 121 terms, trace one justice, filter party, and preserve the full date domain and lane positions. Reload the saved as-of endpoint and confirm identical output. Reject a proposed “bar tweak” if it requires hand-authored starts, duplicate endpoint rows, or loses record identity. Keep composition as optional span teaching until the family exists; correct “today” copy even if the family is deferred.

### stocks-horizon

**Verdict — new-built-in-family, deferred.** Folded positive/negative bands are a specialist display with distinct baseline and scale semantics. A reusable named Horizon mode could remove manual composition eventually, but ordinary Line first needs a clear relative-series workflow. Retain this advanced example while **REC-18** tests demand and semantics; do not present it as a quick area setting.

**Observed.** `stocksHorizonDashboard` repeats five Company rows, computes Price relative to the first ordered Month, mirrors losses upward, folds into three bands, and gives each company its own magnitude domain (`apps/demo/src/demos/dashboardSettings.ts:6094–6196`). Its note correctly says Google starts in August 2004 and that band's percent size differs between stocks. The 560-row CSV contains four January-2000 starts and Google's August-2004 start, all ending March 2010 with positive prices. `horizonValues` selects the first valid **live** row as baseline, so date filtering rebases the series; mean/peak also follow live rows. When the baseline is zero, `relative: true` falls back to an absolute difference, which should not become a percentage claim (`packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:2583–2623`). `horizonNodes` folds each sign into clipped area bands and puts whole-series row IDs/skipped IDs on each band (`2633–2690`). Existing Calendar Line has area/stacked-area, but no baseline-relative transformation, mirrored negative bands or reconstruction metadata.

**Proposal and boundary.** First offer a conventional indexed/percent-change Line against a clearly chosen baseline, preserving raw prices and the baseline row in trace. This supports growth comparisons without folding. Only if density in a constrained height is a real need should a Horizon display add band count, positive/negative colors, shared/per-series magnitude and a visible band-value key. The same original row must map through baseline difference and fold slice in trace, including all hidden lower bands. Shared magnitudes should be the default for cross-stock amplitude comparison; independent magnitudes are valid only when clearly labeled as shape comparison. A zero/invalid baseline should yield an explained undefined percentage, not an unannounced unit change.

**Parity and proof.** A fixed prepared growth column plus Line is a useful simpler view, but it is not equivalent to the composition's live rebasing or tiny repeated rows. Conversely, the source's per-row colors cannot be compared as equal percentage gains. Exact folded presentation therefore remains unavailable in current built-ins; its reusable specialization, rather than arbitrary arrangement, motivates a future mode.

**Try:** compare Apple/IBM, include Google, filter the date range and test a zero baseline. **Observe:** each row states its baseline date/value and band interval; raw and reconstructed growth agree; row sets remain exact; undefined percentage is explicit. **Decide:** reject a Horizon mode unless these semantics and keyboard trace access survive, and defer it if an ordinary relative Line at readable height serves the task. Correct the catalogue's unconditional 'since 2000' wording when moving or duplicating the lesson.

### co2-swarm

**Verdict — small-extension of existing categorical Scatter.** The actual renderer already supports categorical bands, deterministic jitter, independent bubble size and color, log numeric axes, exact source selection, and keyed record callouts. A new chart family would duplicate substantial existing capability. Composition is conditional today: unnecessary for the regional bubble analysis, still needed for its particular collision-packed layout.

**Observed.** `co2SwarmDashboard` draws one point per economy along log CO2 per person, repeats Region, sizes by Population with a 2.5-pixel minimum radius, colors by Income group, and names eight selected economies. The pure `swarmOffsets` helper works in screen coordinates with variable radii; it clamps offsets at the lane limit and can still overlap when crowded. The CSV has 203 rows, including two CO2 values equal to zero. Composition's `numericPixel` pins those values to the log floor. That makes the floor look like a valid emissions value; it is not a semantic contract a built-in should copy. [`apps/demo/src/demos/dashboardSettings.ts:6198–6334`; `apps/demo/public/datasets/co2-per-capita.csv`; `packages/explorEDA/src/components/charts/Composition/swarm.ts:1–38`; `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:3202–3215,3629–3657,3770–3793`]

**Observed comparison.** Set Scatter X=CO2 per person, Y=Region, Size by=Population, Color=Income group, and log X. `scatterAxisKind` selects categorical bands and `scatterPosition` places source-ID jitter inside them; fields do not need conversion into numeric region codes. Bubble points preserve source IDs and choose radius from the all-row maximum. Current log behavior excludes nonpositive coordinates with explicit traceable reasons. The eight named countries can already use keyed record notes: `ScatterPlot` passes actual plotted positions and ordinary annotation resolution supports records on a band axis. A batch label-field control is convenience, not a prerequisite for these notes. [`packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts:105–181,193–214`; `packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts:52–99`; `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx:112–137`; `packages/explorEDA/src/lib/annotations/resolve.ts:516–544`; `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.test.ts:79–151,261–285`]

**Proposed — REC-15.** Add Points → Placement: Jitter/Swarm only when one axis is categorical and the other numeric. Call a small shared collision helper after numeric projection and bubble sizing, preserve the numeric coordinate exactly, and feed displaced positions to draw, hit testing, source trace, and record notes. Resolve packing from a stable population by default so linked filters do not unnecessarily move remaining points. Expose an explicit crowded-layout outcome; do not promise zero overlap where the helper clamps. Keep the current log omission and explain the two excluded zero rows; linear X remains available to show them.

**Proof and boundary.** Compare jitter and swarm with the same positive rows, radii, colors, and eight notes. Verify no numeric-coordinate displacement, stable identities on filtering, and correct click/Alt-Enter behavior using the existing bubble keyboard path. Check zero rows are counted as unplottable, not moved to a positive value. Minimum-visible radius would need an explicit legend/trace exception to strict area proportionality, so it can remain outside the first cut. Retain the composition as collision-layout teaching while moving the main analytical path to Scatter.

### titanic-mosaic

**Verdict — small-extension of 100% series Bar through a named Mosaic width mode.** The additional operation is bounded: allocate category width by its contribution to the current total, then reuse its existing conditional-share segments. This requires a different categorical geometry plan and denominator trace, but not an arbitrary weighted-repeat system. Composition is conditional today for the single area-encoded graphic; count and 100% built-in views already provide the underlying figures.

**Observed.** `titanicMosaicDashboard` repeats Class as columns and assigns `weightCalcId` to a repeat count with `filters:"follow"`. Its vertical stack counts Fate and normalizes within each class. `resolveUnit` scales each frame width by its nonnegative weight divided by the sum of weights, preserving the overall frame extent; column widths deliberately change under filters. `stackNodes` retains each segment's exact IDs and class denominator. The displayed graphic adds six-pixel gaps and two-pixel segment insets, so strict rectangle-area proportionality is a pre-gap/pre-inset data-layout property rather than a claim about every painted pixel. [`apps/demo/src/demos/dashboardSettings.ts:6336–6448`; `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:769–819,2162–2240`; `packages/explorEDA/src/components/charts/Composition/weights.test.ts:81–119`]

**Observed comparison.** Existing percent Bar already computes each Class×Fate count, share, cumulative bounds, and contributor list. Its category x geometry is an equal-width `scaleBand`, and its source/keyboard selections operate on class and fate together. A class count chart alongside a percent chart gives class size and survival rate, but asks the reader to combine views to recover the single mosaic's marginal-width × conditional-height meaning. There is no need to reimplement aggregation or to duplicate the normalized stack renderer's data contract. [`packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts:115–139,205–216,230–319`; `packages/explorEDA/src/components/charts/BarChart/SeriesBarChart.tsx:270–349`; `packages/explorEDA/src/components/charts/BarChart/stackedBars.test.tsx:81–153,181–215`]

**Proposed — REC-16.** Add Display=100%, Width=Share of total, available initially for nonnegative counts or sums only. Compute category totals and the grand total from the same live/facet population; plan variable-width rectangles and explicit category tick centers rather than pretending a uniform band scale supports varying widths. Extend the trace to show both denominators: segment/class and class/grand total. Preserve category order and color while explicitly allowing encoded widths to reweight under an external filter. A zero-total category has no area, and an all-empty population has no invented shares. Keep this mode scoped to one categorical split, not nested mosaics.

**Proof and boundary.** Start with classes of 1/2/3 records and assert width shares 1/6, 2/6, 3/6; within each class assert conditional fate shares, and with zero decorative gaps assert each cell area equals its joint count share. Then use the 1,309-row Titanic file and filter sex; both trace denominators must reconcile to the remaining passenger population. Reject an implementation that uses all-row widths with live heights while claiming live-person area, changes filters when width mode changes, or drops keyboard source access. Keep this composition to teach weighted repeats; add the named Bar mode as the normal author path.


## Shared requirements that determine whether a counterpart is complete

The following are observed source constraints and proposed acceptance requirements. They apply to each recommendation that adds behavior; they are not a proposal for a new framework.

### Data, filters, and trace membership

**Observed:** ordinary charts and composition share the data provider and crossfilter infrastructure. The `packages/explorEDA/src/components/charts/useGetLiveData.tsx` module supplies `useGetLiveIds` and `useGetAllIds` for the live and all-rows populations, with the latter already restricted by the chart's `localFilters`; `restrictToPopulation` applies that local scope. Composition receives those populations through `useCompositionData`. Consequently, a chart-local population restriction, a linked selection, a facet's display visibility, and an axis window are four distinct operations. An implementation that substitutes one for another changes the answer. (`packages/explorEDA/src/components/charts/useGetLiveData.tsx:43–79`; `packages/explorEDA/src/lib/chartPopulation.ts:19–41`; `packages/explorEDA/src/hooks/CrossfilterWrapper.ts:156–204`; `packages/explorEDA/src/components/charts/Composition/useCompositionData.ts:11–21`.)

**Proposal:** derive each numerical mark from named source rows, retain excluded rows with reasons, and retain the population used for any denominator, comparison, baseline, or reference. A percentage cell needs both its numerator contributors and denominator contributors. A connected segment needs its endpoint IDs and any omitted intermediate observations. A KDE curve needs the density's input IDs and bandwidth; a horizon layer needs baseline, transformation, band thresholds, and original observations. Derived display coordinates are not source-row identifiers. No new transformation should make an intermediate aggregate row the only inspectable evidence.

Composition is not already an ideal interaction implementation. `CompositionChart.viewClick` toggles the repeat field, or clears its filters when there is no repeat field. Alt-click and the trace resolver expose richer mark evidence; Alt-Enter chooses an available selected/repeat target. `compositionTrace` supports source IDs for glyphs, paths, bands and repeats, but its top-level keyboard targets are repeats, guides and annotations. Thus a waffle glyph can retain an exact passenger trace without plain click selecting that passenger. Built-in proposals should deliberately specify their own consistent point/cell/segment selection and keyboard behavior instead of claiming complete interaction equivalence from visible marks alone. (`packages/explorEDA/src/components/charts/Composition/CompositionChart.tsx:285–299,340–361`; `packages/explorEDA/src/components/charts/Composition/compositionTrace.ts:172–182,213–264,282–317,348–377`, under `packages/explorEDA/src/components/charts/Composition/`.)

### Scales, colors, missing data, and facets

**Observed:** stable populations exist, but stability is not uniform. Scatter's axes and the existing Box domains use all eligible rows. Raw Line and calendar Line take different routes: raw facets share a source domain, while calendar facets scope their source before planning and its calendar range derives from live rows. Heatmap's color extent uses displayed live values. Composition's shared strip ramp and shared density peak can also recompute from live rows; “shared” does not mean “unchanged by filters.” (`packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts:105–181`; `packages/explorEDA/src/components/charts/LineChart/LineChart.tsx:116–128,330–373`; `packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx:68–97`; `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts:136–157,366–368`; `packages/explorEDA/src/components/charts/Heatmap/heatmapPlan.ts:240–254,350–354`; `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:554–742`, under the charts directory.)

**Proposal:** expose a comprehensible domain policy where an example needs it: shared versus per-panel position scales, and source-population or explicit fixed numeric color bounds. Live rescaling can remain an explicitly selected analytical operation with clear labeling. Keep existing stable categorical color mappings. A hidden facet must not delete data, alter a denominator, or renumber other panels. An axis limit clips a view and reports hidden observations; it must not quietly become a linked or local filter.

Preserve the distinction between an absent combination, a present row with a null measure, a valid zero, an excluded invalid value, and a value outside the current view. Heatmap already distinguishes absent cells from missing values. Line interval repair must break at invalid bounds rather than connecting the remaining valid rows. Paired dots must not report zero difference when one party is absent. A logarithmic axis must explain excluded nonpositive values rather than put them at a plausible positive coordinate. These are correctness requirements, including where the composition reference behaves less carefully.

**Observed facet boundary:** `BaseFacetSettings.visibleFacetIds` already saves the selected order, and the public Facets panel lets users hide and reorder values. `FacetContainer` groups from the stable all-rows population and filters a clicked facet value. The layout helper supports paged wrap/grid panels with minimum dimensions, not geographic coordinates, arbitrary insets, or table cells. Heatmap has a facet-related renderer parameter, but the settings shell does not expose normal Heatmap Facets, Axes, or Notes tabs; its current per-facet live population also leaves the full matrix domain in the planner. Type inheritance alone is insufficient evidence for an available feature. (`packages/explorEDA/src/types/ChartTypes.ts:18–38`; `packages/explorEDA/src/components/settings/FacetSettingsTab.tsx:104–113,200–231`; `packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx:59–148`; `packages/explorEDA/src/components/charts/FacetRelated/facetLayout.ts:14–18,61–69`; `packages/explorEDA/src/components/ChartSettingsContent.tsx:68–95`; `packages/explorEDA/src/components/charts/Heatmap/Heatmap.tsx:80–107`, all under `packages/explorEDA/src/`.)

### Notes and labels

**Observed:** there is one delivered ordinary-chart Notes system with record callouts, references, bands, intervals, regions, and record sets. Record anchors use a field/key identity, not an unstable current row index. The public callout editor offers key field/value controls. Categorical Scatter records can project through the existing plotted-point lookup; the coordinate-callout restriction does not prohibit record callouts. Income-life's twelve country labels and CO2's eight selected labels therefore do not need another annotation architecture. (`packages/explorEDA/src/lib/annotations/types.ts:17–42,185–220`; `packages/explorEDA/src/lib/annotations/resolve.ts:139–157,494–544`; `packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx:113–176,277–299`; `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx:112–137,474`, under `packages/explorEDA/src/`.)

Capabilities remain renderer-specific. The public Notes gate includes Scatter, raw/calendar Line, Bar, Row and Box, but their contexts offer different subjects; density Scatter is excluded. Calendar Line does not expose raw observation intervals. Existing interval polygons lack exact per-run/source interaction. Box's annotation frame does not yet expose category or observation subjects. Heatmap and proposed interval/timeline displays need explicit projection integration before promising the same Notes features. Reuse the existing annotation types, validators, editor and trace route only where those subjects have a meaningful implementation. (`packages/explorEDA/src/lib/annotations/context.ts:38–79`; `packages/explorEDA/src/lib/annotations/types.ts:204–220`; `packages/explorEDA/src/lib/annotations/resolve.ts:466–490`; `packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx:518–522`.)

Endpoint labels and repeated metric labels are different from authored callouts. Add a small selector for first/last/both ends or chosen field only when required by a mode. Reuse the pure ordering and label-dodge helpers if useful; keep overflow honest through truncation disclosure, focus/trace access or spacing, not hidden dropped identities. No cosmetic label improvement is by itself a reason to create a new chart family.

### Save, Dashboard text, validation, and one-edit undo

**Observed:** settings already serialize through the current chart objects. `saveToStructure` stores charts and stable categorical color mappings. Dashboard text has a typed `CHART_SETTING_KEYS` coverage map and generic nested paths; the compiler validates chart definitions and the full saved structure. There is no need for a second format or a migration merely because an optional mode is added. However, adding a field only to a TypeScript interface does not complete persistence: its validator, defaulting, text coverage, and public settings reachability must agree. (`packages/explorEDA/src/providers/DataLayerProvider.tsx:117–134,1246–1278`; `packages/explorEDA/src/lib/dsl/settingKeys.ts:12–40,67–127,245–303,437–463,633–648`; `packages/explorEDA/src/lib/dsl/paths.ts:1–23,122`; `packages/explorEDA/src/lib/dsl/compile.ts:1868–1878,1886–1950,2177–2188`; `packages/explorEDA/src/utils/saveDataUtils.ts:isFacet,isChart,validateSavedData`, under `packages/explorEDA/src/`.)

**Proposal:** for every new setting, update its existing chart settings type, defaults/definition, settings panel, planner snapshot, renderer, chart accessibility summary, trace registration, save validator and Dashboard text coverage. New nested settings use the generic text path machinery; add special parser syntax only if an observed usability need warrants it. Extend the current axis capability map when orientation or eligible scales change. A horizontal or mirrored Bar must not keep vertical-only shortcuts, hidden-value notices, or axis labels. (`packages/explorEDA/src/types/ChartTypes.ts:43–85,140–208`; `packages/explorEDA/src/components/charts/Axis/axisBounds.ts:144–196`; `packages/explorEDA/src/components/charts/chartAccessibility.ts:132–233`.)

Live changes must continue through `updateChart`. A settings edit holds notifications, applies live updates, then releases one committed change; cancel restores the captured chart before release. This source seam supports the host's ordinary undo contract. The selected packet does not include the demo's complete saved-view history implementation, so actual undo/redo behavior is a future end-to-end proof, not a test result from this review. (`packages/explorEDA/src/components/ChartSettingsContent.tsx:43–63,98–132`; `packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts:12–61`; `packages/explorEDA/src/providers/DataLayerProvider.tsx:629–638,997–1020,1589–1602`.)

### Dashboard rendering and report output are separate acceptance gates

**Observed:** composition has a concrete artboard output path and a public Copy PNG action. It clones the drawn SVG, removes editor overlays, restores the declared width/height/viewBox, waits for fonts, and renders a PNG at a default 2× scale. Clipboard copy depends on the relevant browser APIs. The supplied output test asserts markup/overlay behavior; this review did not run it or observe a browser copy. The ordinary-chart source search found no parallel PNG path in this snapshot, consistent with the reference-marks plan's explicitly unfinished ordinary export work. (`packages/explorEDA/src/components/charts/Composition/CompositionInspector.tsx:230–256`; `packages/explorEDA/src/components/charts/Composition/compositionOutput.ts:16–87`; `packages/explorEDA/src/components/charts/Composition/compositionOutput.test.tsx:5–31`; `docs/intent/reference-marks/implementation-plan.md:124–137`.)

**Proposal:** a built-in counterpart can become the primary analytical tutorial once its data and interactions work. Keep the composed report route until the intended output has a real export solution. An ordinary-chart export proof must include title, subtitle, notes, legend, all intended facets, clipping, font readiness, scale interpretation and the selected output dimensions. A screenshot of the dashboard viewport or one facet page is not evidence of a complete report image. This review does not promise SVG, PDF or PowerPoint export; those formats are outside the observed baseline contract.

## Grouped change proposals

### Priority and sequencing

The first funded scope should stay small: **REC-01** proves existing counterparts; **REC-02** adds straight ordered Scatter connections; **REC-03** repairs supplied intervals; **REC-04/REC-05** make full Heatmap histories usable with the existing numerical color controls. These are separate proofs, not a single framework project. The first connection slice serves driving; grouped/slope/pair behavior follows after that slice succeeds.

Next choose the highest-value local follow-up: facet scale/density controls, source-aware grouped Line where current calendar limits change the result, numeric normalized area, cohort summaries, horizontal/mirrored Bar, Scatter collision placement or Mosaic widths. Do not require all of them before shipping any one useful improvement. Forecast can use two locally scoped ordinary charts while a single-chart free-y facet control is proved. Jobs already has the needed colors, fixed bounds and manual facet ordering.

Ridgelines and supplied-lane intervals merit separate mode/family proofs. Unit cells require evidence that individually visible records improve the task beyond aggregate source lists; their split-bin stage can be useful without a new cell renderer. Rank, horizon, geographic tile facets and a rich chart table stay outside the initial scope. **REC-24** is a separately scoped report-output gate. **REC-25/REC-26** record rejected architecture and authoring directions explicitly.

| Recommendation | Stage | Focus |
|---|---|---|
| REC-01 | First proofs | Teach existing built-in counterparts first and correct misleading example claims |
| REC-02 | First proofs | Ordered Scatter connections, followed by bounded slope and paired-dot modes |
| REC-03 | First proofs | Repair and surface existing supplied Line intervals |
| REC-04 | First proofs | Heatmap histories with independent axes and date bins |
| REC-05 | First proofs | Connect heat values to the existing numerical color controls |
| REC-06 | Bounded follow-up | Explicit facet scales and compact Line panels with bounded summaries |
| REC-07 | Bounded follow-up | Source-preserving grouped raw Line observations and explicit date/order support |
| REC-08 | Bounded follow-up | Focused Line facets with explicit peer context |
| REC-09 | Bounded follow-up | Line numeric grouped summaries and normalized area |
| REC-10 | Bounded follow-up | Cohort-summary display in Box Plot |
| REC-11 | Bounded follow-up | Horizontal categorical series bars, followed by constrained mirroring |
| REC-12 | Separate/optional proof | Ridgeline display within Box Plot/Violin |
| REC-13 | Deferred or gated | Split numerical histograms first; defer a shared Unit counts renderer until source-cell value is proved |
| REC-14 | Separate/optional proof | Supplied-lane interval display with explicit open-end reference |
| REC-15 | Bounded follow-up | Categorical Scatter placement: Jitter or Swarm |
| REC-16 | Bounded follow-up | Named Mosaic width mode for 100% series Bar |
| REC-17 | Deferred or gated | Ranked Line mode with explicit competitor population |
| REC-18 | Deferred or gated | Relative-series Line first; specialist Horizon mode only after demand |
| REC-19 | Deferred or gated | A shared tile-address facet layout |
| REC-20 | Deferred or gated | General tables with arbitrary embedded charts |
| REC-21 | Deferred or gated | Use stacked area now; defer exact stream baseline option |
| REC-22 | Separate/optional proof | Bulk record labels as an optional shortcut to existing Notes |
| REC-23 | Separate/optional proof | Fit-aware labels and explicit order for series Bar |
| REC-24 | Separate/optional proof | Treat ordinary-chart report export as a separate adoption gate |
| REC-25 | Rejected | Reject a universal composition-backed built-in engine |
| REC-26 | Rejected | Reject redundant annotation systems and one chart type per example |

### REC-01 — Teach existing built-in counterparts first and correct misleading example claims

**Proposal status:** recommended-first. **Examples:** message-log, tech-sparklines, media-deaths, measles, income-life, covid-tiles, covid-compare, elections, banana-yields, du-bois-income, unemployment-stream, population-pyramid, scotus-timeline, stocks-horizon, co2-swarm.

Add public-settings counterparts for income-life (Scatter with true log, size/color and keyed Notes), media-deaths (percent Bar with Sum Count), du-bois-income (percent Bar with Sum Share), and unemployment-stream (monthly Sum stacked-area Line). Move their ordinary analytical lesson to those views. Preserve all composition originals. Reconcile the concrete baseline caption, missingness and population mistakes recorded in the example verdicts before presenting them as target behavior.

**Benefit and cost:** Four complete analytical routes require no new chart engine. Accurate examples stop ordinary log, bubble, percent-stack and stacked-area tasks from being taught as composition requirements. small for counterpart/caption work; behavioral proof still required. Reuses current public settings, existing prepared data and the current registry. Data-semantic corrections need targeted arithmetic review, not cosmetic editing alone. Maintenance: Keep the authored and built-in lessons explicit about differences, source grain, filters and output; avoid promising that the two layouts are pixel-equivalent.

**Specific seams:**

- `apps/demo/src/demos/dashboardSettings.ts` — the 29 exported composition dashboards and ordinary chart helpers: Propose counterparts using current settings and correct the specific companion populations, aggregations, captions or missingness fixtures; preserve original examples for review.
- `apps/demo/src/demos/examples.ts` — examples composition records: Explain which tutorial is primary and which is advanced; do not describe delivered mark behavior using stale comments.
- `apps/demo/src/demos/exampleIndex.ts` — isComposition; compositionExamples: Keep advanced report-graphics discoverability while surfacing built-in counterparts through the ordinary chart teaching path.
- `apps/demo/src/demos/coverage.ts` — exampleCoverage: Record actually delivered counterpart features only after the public authoring proof passes.
- `apps/demo/src/docs/live/examples.ts` — composition alias: Preserve the message-log alias identity and label any counterpart distinctly; it is not a thirtieth baseline design.
- `apps/demo/src/demos/dashboardSettings.ts` — sparklinesDashboard, measlesDashboard, covidTilesDashboard, covidCompareDashboard, electionsDashboard, bananaYieldsDashboard (2060–2241;2775–2954;3607–4124;4464–4652): Reconcile actual grid versus table wording, absent/null semantics, annual-average/raw-Line mismatch, peak/latest label wording, equal-state versus national-average wording, seven-row versus six-state companion averaging and actual tile ordering.
- `apps/demo/src/demos/examples.ts` — assigned registry entries (731–743;791–815;862–897;925–934): Describe delivered behavior rather than helper comments; disclose banana physical rows versus valid country-years and move lessons when counterparts exist.
- `apps/demo/public/datasets/measles.csv` — Alaska 2003 and state-year matrix (complete file;77): Clarify whether Status=absent is a preparation marker or remove the physical placeholder for a true-absence fixture. Do not turn a missing value into a zero or pretend a present row is no record.
- `apps/demo/public/datasets/banana-yields.csv` — valid-year and NA-placeholder records (complete file): Explain 806 valid country-years plus eight explicit blank Year/Yield placeholders; retain the note that yearly trends are illustrative and 2010s has nine years.
- `packages/explorEDA/src/components/charts/Composition/measles.test.ts` — measles tests (1–167): Current synthetic absence fixture does not establish actual CSV loading behavior; a meaningful preparation/fixture check should compare the exact dashboard/source case.
- `apps/demo/src/demos/dashboardSettings.ts` — scotusTimelineDashboard (5959–6092): Replace today language with an explicit as-of/source-domain statement or save an intentional as-of endpoint; do not imply a clock.
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — spanNodes (3482–3562): If behavior is changed, record open status and chosen endpoint provenance separately from the source blank End.
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — numericPixel (3202–3215); pointNodes: Do not clamp zero/negative log values to positive coordinates; skip/report invalid log coordinates with source exclusion metadata.
- `packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts` — numeric log bounds and scatterPosition (166–181;193–214): Use current built-in positive-log policy as the consistency reference.
- `apps/demo/src/demos/dashboardSettings.ts` — co2SwarmDashboard (6198–6334): Explain the two excluded zero rows or choose linear X if showing them is essential.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** Research only: no catalogue or source changes were made.; Existing ordinary alternatives for CO2, Titanic counts and banana linked views can be taught as partial/current routes while their display-specific verdicts remain explicit.

**Dependencies and related slices:** Generic CSV loader confirmation for the measles Status inference; Inventory reconciliation already confirms all assigned dashboards and no extra saved tabs; Built-in counterparts can be separate proposed additions without deleting original composition examples; Apply the declared source-exclusion and separate output policies; no feature family is necessary merely to correct claims.

**Strongest alternatives:** Proposal: Require composition because the current gallery uses it Decision: Rejected; source implementation and the analytical task determine the verdict.; Proposal: Delete all apparently redundant compositions immediately Decision: Rejected; keeping an advanced lesson is separate from requiring its workflow, and this research does not authorize deletion.; Proposal: Build image export before demonstrating any counterpart Decision: Rejected as a global prerequisite; retain the composition output route and evaluate rendering/output separately.; Option: Treat helper comments/registry descriptions as authoritative Decision: Rejected: executed definition structure and source values disagree in specific cases.; Option: Silently rewrite data to make the screenshot match Decision: Rejected: changes source semantics and may discard source provenance.; Proposal: Preserve exact positive-floor positions of zero CO2 rows Decision: Rejected: numerical correctness outranks matching misleading baseline geometry.; Proposal: Assume blank End means the machine current date Decision: Rejected: actual span resolver has no clock and uses its scale domain edge.; Proposal: Choose linear X for CO2 Decision: Acceptable smaller alternative if retaining zeros visibly is essential; changes scale interpretation transparently.

**Try → Observe → Decide:** **Try:** Author the four counterparts through current public controls, then select/trace representative marks and denominator rows, save/reload and round-trip Dashboard text in a runnable checkout. **Observe:** Income-life's 197 country rows and chosen keyed callouts retain identity; media uses each source's listed-cause Count total; Du Bois uses the 33 class-share records; monthly unemployment sums match its complete 14 by 122 grid. Record output differences separately. **Decide:** Move the primary analytical route only if no important comparison or contributor evidence is lost. Reopen the specific verdict if the public controls fail; do not infer a need for a new general framework.

**Dependent or corrective slice — Make catalog descriptions and data-scope examples accurate (recommended):** Have Codex reconcile source-verified catalog and companion-chart mismatches while adding built-in counterparts. This review proposes corrections; no source changes were made. Preserve originals under the user-specified raw research path.

Cost: Relative effort: small for wording; bounded data-fixture correction needs a deliberate semantic decision Reasons: Most corrections concern clear definition/data mismatches.; Measles absence requires confirmation of the generic load path or an explicit preparation rule, not a cosmetic rewrite alone. Maintenance: Low: keep a few behavior/data contract checks at the actual example boundary, not snapshots of JSON structure.

Try: Evaluate the complete saved settings and profile the attached CSVs; read every caption against actual aggregation/group/filter settings. For measles, use one absent row, one invalid value and one true zero at the real load boundary. Observe: Catalog/companion descriptions match actual populations, row counts and aggregation; no unprovided respondent/national/annual-observation claims are introduced. Decide: Accept only source-backed wording or a documented explicit preparation rule. Preserve unresolved load semantics as an open question, rather than declare a rendered behavior from source inference.

**Dependent or corrective slice — Correct open-end and log-zero claims without preserving misleading baseline geometry (proposed-correctness):** Reconcile SCOTUS title/open-end explanation with the actual saved source-domain edge, and correct CO2 composition log handling so zero is not displayed at a positive floor. These are baseline semantic defects discovered during research, separate from parity features.

Cost: Relative effort: Small for title/explanation; small-to-medium if adding Composition exclusion tracing requires a cross-cutting policy. Do not invent a general live-clock feature to fix copy. Maintenance: Endpoint provenance and log eligibility should remain consistent in data trace and export; live-date behavior is a separate opt-in feature.

Try: Inspect a span with blank End and the two zero-CO2 rows using fixed source data. Observe: Trace and visible copy name the real endpoint reference; a log point never reports zero at a positive coordinate; exclusions or linear scale make the policy explicit. Decide: Treat either silent positive-floor clamping or an unbacked today claim as a failed correctness proof, regardless of pixel resemblance.

**Uncertainty:** Source reachability was reviewed, but the public flows and image export were not run in a browser.; Catalogue changes and corrected example definitions are proposals for Codex's separate review.; Dataset preparation scripts and the complete original data pipeline are not all present in the selected packet. Actual source review is complete for the material chart comparisons; preparation reconstruction remains limited.; A complete composition-wide exclusion policy may exceed this targeted copy fix; root should price it separately.; No new historical or emissions facts are inferred from the prepared files.

### REC-02 — Ordered Scatter connections, followed by bounded slope and paired-dot modes

**Proposal status:** proposed. **Examples:** driving-shifts, pew-meaning, middle-class-jobs, tax-slope.

Add an advanced Connect observations control to Scatter Points: optional group identity, independent order field and straight path. Preserve original IDs and ordered skipped rows; add modest series endpoints/sampled record labels and source/keyboard targets. First use driving; then Country/Occupation slope presets. Avoid forcing wide pivots or a new top-level slope chart. After the straight ordered path proof, add named two-role Paired dots using categorical bands, no jitter, explicit endpoint roles, missing/duplicate rules and an oriented difference. Existing numerical color controls and manual facet ordering remain available.

**Benefit and cost:** One bounded path contract closes the core driving, tax and occupation-pair gaps; a later paired-dots preset can reuse it after disabling categorical jitter and defining pair signs. medium; later presets medium incremental. New column snapshot, ordered run preparation, SVG path/label drawing, grouping/color rules and activation/tracing; not only a new setting. Maintenance: Keep point/path coordinate and filtering policy aligned; hit targets must not obstruct brushes/Notes; label density/margins need bounded behavior.

**Specific seams:**

- `packages/explorEDA/src/components/charts/ScatterPlot/definition.ts`, `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx`: packages/explorEDA/src/components/charts/ScatterPlot/definition.ts:ScatterPlotSettings; packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx:Points controls
- `packages/explorEDA/src/components/charts/ScatterPlot/useScatterData.ts`: packages/explorEDA/src/components/charts/ScatterPlot/useScatterData.ts:fetch group/order columns into ScatterSnapshot
- `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts`, `packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts`: packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts:planScatter/ScatterSnapshot/ScatterPlan; packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts:sourceIds
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx`, `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx`: packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx:paths below points, 482-500/536-566/645-657 activation gates; packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx:selectPoint and trace source
- `packages/explorEDA/src/components/charts/ScatterPlot/scatterTrace.ts`: packages/explorEDA/src/components/charts/ScatterPlot/scatterTrace.ts:connection source IDs, skipped rows and ordered endpoints
- `packages/explorEDA/src/components/charts/Composition/ordering.ts`, `packages/explorEDA/src/components/charts/Composition/labelDodge.ts`: Reuse/extract modest ordering and vertical-label-dodge helpers from packages/explorEDA/src/components/charts/Composition/ordering.ts and packages/explorEDA/src/components/charts/Composition/labelDodge.ts, not whole scene resolution
- `packages/explorEDA/src/components/charts/ScatterPlot/definition.ts` — ScatterPlotSettings (25–52): Add a narrow pairing/display contract with group field, role field and two role values; no new chart registration needed.
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx` — ScatterPlotSettingsPanel (40–225): Show category/value/role inputs and named orientation only when Paired dots is chosen; retain simple points by default.
- `packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts` — categories; scatterPosition (123–164;193–214): Permit the supplied category order and a no-jitter option for this mode. Existing alphabetical bands and stable domains are reusable.
- `packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts` — planScatterPoints (22–103): Retain original source IDs, values/colors and filter states for endpoints; group existing points into a pair without replacing them with synthetic records.
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx` — ScatterSvg (482–500;536–566;637–657): Remove the size-only restriction for paired-point activation; add focus/hit behavior for connectors/differences, preserving empty click clear and Alt trace.
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx` — source point callbacks (383–398;447–466): Use existing updateChart and point callbacks; add a distinct pair selection target and trace population containing both endpoint rows.
- `packages/explorEDA/src/components/charts/Composition/calculations.ts` — evaluateCalc; orderedEnds (105–133;171–198): Use as contrast: generic last-minus-first yields zero for singleton data. Paired mode must require both named roles before reporting a difference.
- `packages/explorEDA/src/utils/saveDataUtils.ts` — isChart (635–719): Validate only the new chart options and nested enum/numeric settings at the existing reader; do not invent a migration or parallel version.
- `packages/explorEDA/src/lib/dsl/settingKeys.ts` — CHART_SETTING_KEYS (415–486): Add any actual new chart setting keys to the public Dashboard text whitelist; inherited fields alone do not expose behavior.
- `packages/explorEDA/src/lib/dsl/compile.ts` — chart setting path validation (1882–1950): Honor the existing allowed-path validation for newly exposed settings.
- `packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts` — useChartEdit (12–61): Apply through the current live edit/hold flow so each completed gesture has ordinary undo semantics.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** Points display only initially; no density/regression interaction framework.; Straight segments first; arbitrary smoothing and interpolated hit tracing are later.; No arbitrary scene/unit grammar, inset layout or synthetic series transformations.

**Dependencies and related slices:** Existing chart persistence/DSL/undo contracts; Existing manual facet order and fixed domains suffice for middle-class-jobs; automatic field order and supplied statistic labels are optional later conveniences, not connection prerequisites; Category no-jitter/pair role work for pew-meaning; The paired-dots stage depends on the earlier ordered/grouped-connections stage within this recommendation; Existing categorical color mapping and source-point trace

**Strongest alternatives:** Strongest smaller alternative: add a source-preserving orderField to raw Line. It draws trajectories but currently lacks mark identity/point traces and uses x-sorted reduced points, so total change is not clearly smaller.; Existing Scatter+Year Line avoids new code but loses the integrated temporal trajectory; not complete driving parity.; For tax/middle-class use grouped raw Line once REC-07 exists; prefer one shared preparation helper over separate incompatible series logic.; Option: Existing Scatter with Share/Topic/Party Decision: Closest actual baseline; it plots useful endpoints but forced jitter/order and absent connectors/differences leave gaps.; Option: Grouped Bar Decision: Valid numerical alternative, but not the explicit pair/gap comparison requested by the delivered design.; Option: A separate dumbbell chart family Decision: Rejected at this baseline: categorical Scatter and shared connections already supply most geometry/source behavior.

**Try → Observe → Decide:** **Try:** Use shuffled driving rows with null Gas, then all 34 tax pairs and 67 occupation pairs. Exercise pointer/keyboard point and path activation, external filters, fixed axis clipping and save/text roundtrip. **Observe:** Chronological reversals survive; gaps and original IDs are traceable; groups never cross-connect; source colors remain stable; labels identify endpoints; brush/empty click/undo semantics remain ordinary. **Decide:** Reject the slice if correct path traces require reducing rows to anonymous coordinates, if missing observations are silently bridged, or if tax must use a 30-series calendar workaround.

**Dependent or corrective slice — Paired dots as a bounded Scatter mode (recommended):** Build a named two-role paired comparison on existing Scatter categorical bands and source points. Use the shared grouped connection helper, disable categorical jitter for pairs, allow a supplied category rank, and show an oriented difference/readout. Explicitly name the two endpoint roles. Keep arbitrary many-role statistical comparison outside the initial mode.

Cost: Relative effort: medium incremental after the earlier ordered/grouped-connections stage Reasons: Axes, numeric positions, colors and source points already exist.; No-jitter/category order and pair labels are bounded renderer/settings work.; Role orientation, duplicate/incomplete pairs and point/pair selection are real new semantics. Maintenance: Low-to-medium for exactly two roles with explicit duplicate handling; rises sharply if extended to arbitrary comparison transformations.

Try: Use spirituality 8/22, reverse the named roles, filter out one party and add a duplicate Topic×Party source row. Activate endpoint and connector by keyboard and Alt-trace. Observe: +14 then -14 in percentage points; a valid lone endpoint with unavailable difference; an explained duplicate requiring aggregation/repair; endpoint trace has one imported percentage row and pair trace exactly both roles. Decide: Accept only if source-role semantics remain explicit after filters/restoration and selection never invents respondent-level denominators. If the mode grows beyond two roles, stop and reassess instead of adding a grammar.

**Uncertainty:** Define connection selection: path selects actual group rows, points select one original row; no selection on derived coordinates.; Color varying within a path needs one declared rule; first ordered source value is enough for these constant-within-series snapshots.; The source contains aggregate percentages only. A survey respondent denominator cannot be reconstructed. Exact decorative Diff column can remain composition without undermining a clear signed built-in readout/output.

### REC-03 — Repair and surface existing supplied Line intervals

**Proposal status:** proposed. **Examples:** forecast-fan.

Promote existing Notes Interval for Line with interval-aware automatic domains, segmented valid runs, original source-row metadata and trace access. Keep lowerField/upperField/meaning saved objects and the existing Notes system. Add nested fan polish only after semantic parity.

**Benefit and cost:** Closes a real source/domain gap in an already public built-in function and makes supplied uncertainty discoverable without duplicate APIs. medium bounded repair. Existing UI/type/drawing reduce cost, but metadata, gaps, domain participation and interval-specific trace are new work. Maintenance: Keep intervals aligned with line x ordering, right-axis choice, null rules and Notes persistence. Multiple interval labels/styles should avoid overlap.

**Specific seams:**

- `packages/explorEDA/src/lib/annotations/types.ts`, `packages/explorEDA/src/lib/annotations/resolve.ts`: packages/explorEDA/src/lib/annotations/types.ts:IntervalAnnotation and packages/explorEDA/src/lib/annotations/resolve.ts:IntervalPoint/project interval (466-490)
- `packages/explorEDA/src/lib/annotations/context.ts`: packages/explorEDA/src/lib/annotations/context.ts:raw Line intervals capability; existing calendar capability remains explicit
- `packages/explorEDA/src/components/settings/annotations/AnnotationsSettingsTab.tsx`, `packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx`: packages/explorEDA/src/components/settings/annotations/AnnotationsSettingsTab.tsx:235-242; packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx:IntervalFields
- `packages/explorEDA/src/components/charts/annotations/AnnotationLayer.tsx`: packages/explorEDA/src/components/charts/annotations/AnnotationLayer.tsx:Intervals 143-185
- `packages/explorEDA/src/components/charts/LineChart/LineChart.tsx`: packages/explorEDA/src/components/charts/LineChart/LineChart.tsx:yValuesByAxis/annotationFrame (116-128,375-410)
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`: packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:bandNodes 3565-3625 and bounds participation 566-583 as reference logic only

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** Supplied numeric bounds only; no forecast model or inferred statistical interval.; A limited nested-band style and meaning labels; no separate Notes system.

**Dependencies and related slices:** Shared facet scale proposal for the exact two independent panels; Existing annotation validation and generic persistence; no per-chart serializer

**Strongest alternatives:** Current raw Line with four Notes intervals and manual y limits is the strongest immediate partial counterpart.; Two separate charts with local ranges defer independent facet scales without sacrificing values.; Rejected: new Fan chart family or arbitrary layer/mark grammar for supplied bound columns.

**Try → Observe → Decide:** **Try:** Use the full fan, inject interior null/reversed bounds and a new extreme P90, then filter Kind and edit local ranges. **Observe:** Each bound pair forms only valid contiguous runs; y autoscale includes bounds; trace names original row, lower/upper fields, reverse/invalid reasons; limits only clip. **Decide:** Reject if missing bounds bridge, source IDs disappear, an interval's confidence meaning is inferred, or a generic row list is offered as band-specific evidence.

**Uncertainty:** A calendar-aggregated interval cannot average supplied percentile columns by default; keep raw observation interval scope until a separate aggregation rule is justified.; Which shared trace entry point best hosts interval metadata is for integration to reconcile.

### REC-04 — Heatmap histories with independent axes and date bins

**Proposal status:** recommended. **Examples:** message-log, measles, elections, banana-yields.

Extend Heatmap directly: independent row and column limits/order, date-column month/week/day/year bins when a date field is chosen, an optional supplied row-order field, and a compact full-coverage matrix. Add bounded row totals only after the core axes work. Connect existing Notes to real Heatmap column/cell coordinates when needed; do not create a second annotations editor.

**Benefit and cost:** Completes the broadest ordinary matrix gap: 12×72 message histories and 51×85 rates, while improving prepared order and summaries for existing small matrices. medium. Date grouping and interval filtering are new preparation/interaction work. Independent limits/order need readable density and focus behavior. Notes requires actual renderer integration, not type-only exposure. Maintenance: Low-to-medium if kept within Heatmap and existing aggregate/Notes helpers; avoid a generic repeated-strip engine.

**Specific seams:**

- `packages/explorEDA/src/components/charts/Heatmap/definition.ts` — HeatmapSettings (10–20): Replace the single behavioral limit/order restriction with modest optional per-axis settings while retaining simple defaults; add date-bin settings and supplied-rank order without requiring raw JSON.
- `packages/explorEDA/src/components/charts/Heatmap/HeatmapSettingsPanel.tsx` — HeatmapSettingsPanel (109–158): Offer column interval only for dates; group row/column order and visible-category limits under relevant advanced controls. Explain coverage and density rather than silently dropping a history.
- `packages/explorEDA/src/components/charts/Heatmap/heatmapPlan.ts` — rankCategories; planHeatmap (111–193;270–308;339–354): Separate row/column domain planning, retain all-source stable categories, and aggregate original source IDs by date bin plus row key. A bin is a date interval; do not filter by a formatted month label.
- `packages/explorEDA/src/components/charts/Heatmap/Heatmap.tsx` — Heatmap; keyboard/trace flow (80–140;307–364): Render full histories or an explicit local viewport, preserve roving cell focus and invalid/empty behavior, and add a real annotation frame before exposing Notes.
- `packages/explorEDA/src/components/charts/Heatmap/heatmapTrace.ts` — heatmapTraceTargets; resolveHeatmapTrace (1–56): Report original contributor IDs and included/invalid counts; retain date-bin bounds and declared view limits in trace.
- `packages/explorEDA/src/components/ChartSettingsContent.tsx` — ChartSettingsContent (68–95): Do not assume inherited Axes/Facets are public. Expose only the supported Heatmap controls, and Notes only when chartDrawsAnnotations/renderer can supply a real frame.
- `packages/explorEDA/src/lib/annotations/context.ts` — annotation context (1–80): Extend the existing Notes eligibility/context with real band/bin/guide coordinates; retain current callout semantics.
- `packages/explorEDA/src/utils/saveDataUtils.ts` — isChart (635–719): Validate only the new chart options and nested enum/numeric settings at the existing reader; do not invent a migration or parallel version.
- `packages/explorEDA/src/lib/dsl/settingKeys.ts` — CHART_SETTING_KEYS (415–486): Add any actual new chart setting keys to the public Dashboard text whitelist; inherited fields alone do not expose behavior.
- `packages/explorEDA/src/lib/dsl/compile.ts` — chart setting path validation (1882–1950): Honor the existing allowed-path validation for newly exposed settings.
- `packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts` — useChartEdit (12–61): Apply through the current live edit/hold flow so each completed gesture has ordinary undo semantics.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Author flow:** Add Heatmap → choose row field and column field → choose metric. If the column is a date, choose Month. Advanced reveals independent order and coverage, supplied row rank, then value-domain options. Notes appears only once renderer support is real.

**Dependencies and related slices:** REC-05 for explicit aggregated heat color domains/transforms; Source-aware annotation frame work only for optional callouts/guides; Existing persistence/DSL/edit invariants

**Strongest alternatives:** Option: Prepare a month/year field and use the current Heatmap Decision: Useful first step, but does not remove the public 60-column limit or independent-order gap.; Option: Calendar or faceted calendar Line Decision: Existing daily/year view or larger repeated paths answer related questions but not the aligned full monthly/year matrix.; Option: Compile built-ins into composition strips Decision: Rejected: the matrix needs bounded grouping/limits, not the composition grammar and its population/frame machinery.

**Try → Observe → Decide:** **Try:** Use the full 10,376-message CSV for 12×72 and the full measles CSV for 51×85; select a month/state-year by pointer and keyboard, inspect sources, change a linked filter, restore and round-trip saved/DSL state. **Observe:** All required columns remain reachable without data filtering; date selection corresponds to exact original rows; measured zero, invalid measure and no row stay distinct; source order and focus remain stable. **Decide:** Accept the first slice only if both histories remain complete and source-row selection is exact. If the larger matrix is unreadable, add a local viewport with honest coverage, not a hidden top-K cutoff. Optional guides/totals must not block useful independent-axis delivery.

**Uncertainty:** No browser or product tests were run. The optimal matrix density/viewport needs a real rendering proof. Measles absent-status fixture must be reconciled separately.

### REC-05 — Connect heat values to the existing numerical color controls

**Proposal status:** recommended. **Examples:** message-log, measles, elections, banana-yields.

Make Heatmap aggregated values use an explicit value-scale contract, reusing the existing NumericalColorScale editor/math. Add a clearly labeled domain source: shown cells, all-source aggregate cells or explicit fixed bounds. Support the existing centered/symmetric bounds and sqrt/log transforms in Heatmap. Preserve missing-state styling independently of the numeric ramp. Optional uneven custom stops for measles/banana can be a later narrowly justified polish slice.

**Benefit and cost:** Stops retained values from changing color meaning under filters when users request a stable scale; makes log message counts and centered ±40 election margins reachable without composition. small-to-medium for Heatmap integration; medium if all-source aggregation domains and optional custom stops ship together. Most numeric color math and UI already exist. Aggregate-value domains differ from source-field extents and require new explicit population handling. Legend, trace, missing styles and cell text contrast must agree with the chosen ramp. Maintenance: Keep color math shared with existing numerical scales. Aggregate-domain computation remains chart-specific and bounded.

**Specific seams:**

- `packages/explorEDA/src/components/charts/Heatmap/heatmapPlan.ts` — planHeatmap (240–254;270–308;339–354): Currently planHeatScale receives live summaries only. Build the chosen aggregate-domain population separately from displayed values; source-domain means/counts must use the same grouping, not raw measure extents.
- `packages/explorEDA/src/components/charts/heatScale.ts` — planHeatScale; heatFill; describeHeatPosition (1–68): Keep simple theme-aware automatic defaults; add a path to the existing numerical geometry/color logic for explicit settings and truthful legend/trace descriptions.
- `packages/explorEDA/src/types/ColorScaleTypes.ts` — NumericalColorScale (11–28): Existing min/max/midpoint, linear/sqrt/log, palette/reverse/steps are already suitable. Avoid duplicating a numeric color type.
- `packages/explorEDA/src/lib/colorScaleMath.ts` — numericalGeometry; makeNumericalColor (40–140): Reuse existing clamp, midpoint, signed sqrt and zero-aware sym-log behavior; do not propose a new global numerical color engine.
- `packages/explorEDA/src/components/colorScales/ColorScaleEditor.tsx` — NumericalScaleEditor (309–535): Reuse Start/Midpoint/End, Balance sides and Spacing. Its Fit to data currently reads sourceField raw values, so add a bounded way to supply aggregate-cell values for heat counts/means rather than mislabel that extent.
- `packages/explorEDA/src/components/charts/Calendar/calendarPlan.ts` — planCalendar (198–202;304–307): Only opt Calendar into the same contract when an explicit calendar scope is selected; current scale uses live values in one current year.
- `packages/explorEDA/src/components/charts/PivotTable/PivotTable.tsx` — cell shading (340–405): Optional later reuse for shaded Pivot values; maintain total-cell behavior and contributor inspection.
- `packages/explorEDA/src/utils/saveDataUtils.ts` — isChart (635–719): Validate only the new chart options and nested enum/numeric settings at the existing reader; do not invent a migration or parallel version.
- `packages/explorEDA/src/lib/dsl/settingKeys.ts` — CHART_SETTING_KEYS (415–486): Add any actual new chart setting keys to the public Dashboard text whitelist; inherited fields alone do not expose behavior.
- `packages/explorEDA/src/lib/dsl/compile.ts` — chart setting path validation (1882–1950): Honor the existing allowed-path validation for newly exposed settings.
- `packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts` — useChartEdit (12–61): Apply through the current live edit/hold flow so each completed gesture has ordinary undo semantics.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Author flow:** Heatmap metric remains simple. Advanced Value color opens existing numerical range/palette controls, identifies the aggregate and scope, and explains whether filters affect the range. A fixed midpoint/cap is a color mapping, not a data filter.

**Dependencies and related slices:** REC-04 for long date-bin matrices, not for the 51×11 election counterpart; Existing color-scale persistence and edit transaction behavior

**Strongest alternatives:** Option: Keep automatic live-domain theme colors Decision: Keep as a simple default, but it cannot support fixed political sign/cap meaning under all filters.; Option: Add an entirely new generic color engine Decision: Rejected: existing editor/math already supports bounds, midpoint, transforms and palettes.; Option: Expose raw global source-field color scale without aggregate awareness Decision: Rejected: message counts have no source Count field and a mean/sum cell extent is not the raw measure extent.; Option: Exact arbitrary multistop palette editor first Decision: Defer: first prove explicit domains and existing transforms; arbitrary uneven stops are presentation-specific.

**Try → Observe → Decide:** **Try:** Render elections with symmetric -40/0/40 bounds and message counts with a declared zero-aware logarithmic range; filter to one sign or one correspondent and restore. Also inspect a measured zero, invalid cell and absent cell. **Observe:** An unchanged numeric value maps to the same color; out-of-range values clamp visibly with truthful trace/range context; missing states remain distinguishable; all-source aggregate domains use bins/cells, not raw field values. **Decide:** Accept only if legend, cell readout, color and trace agree before/after filters and saved/DSL restoration. Reject any reuse that fits count colors to raw data rows or silently switches sign semantics.

**Uncertainty:** Exact arbitrary placed stops are not necessary to prove analytical parity. Source-aware versus fixed color range defaults need user-facing wording and contrast proof in both themes.

### REC-06 — Explicit facet scales and compact Line panels with bounded summaries

**Proposal status:** recommended. **Examples:** tech-sparklines, forecast-fan, time-use, consumer-confidence, covid-tiles, banana-yields, middle-class-jobs.

Add a named compact display to Line facets, with shared X and explicit shared/per-facet Y scope, first/last percentage change or average/max summaries, optional summary-based ordering, and min/max/latest source-point markers. Keep the initial contract to one numerical measure over ordered observations in each group. Do not widen it into arbitrary table cells. Separate the shared/per-panel scale policy from the compact-Line profile: forecast can use independent y domains, time-use can use a declared per-activity summary domain, and focus views can share source domains. Existing visibleFacetIds already provides manual order/hide. Automatic supplied-field order and statistic labels are conveniences for jobs; no new diverging color engine or free-scale setting is required for its selected Scatter route.

**Benefit and cost:** Makes ranked sparkline comparisons and quick extrema/endpoints approachable from Line; adds useful progress for repeated Covid and banana trends without requiring their exact authored tile/table layouts. medium after REC-07; medium-to-large cumulative. Grouped source-preserving Line is a separate dependency. Compact layout needs focus/trace/readout behavior, not only small fonts. Summary scope/order and selected-point tie rules are new semantics. Maintenance: Moderate if limited to a Line measure over ordered rows. Arbitrary labels, mixed cells and per-mark populations are outside the contract.

**Specific seams:**

- `packages/explorEDA/src/components/charts/LineChart/definition.ts` — LineChartSettings (1–140): Add bounded compact/summary/selected-point options after the grouped observation contract, not a generic mark list.
- `packages/explorEDA/src/components/charts/LineChart/LineChartSettingsPanel.tsx` — LineChartSettingsPanel (1–178): Reveal compact summary/marker controls only for the relevant Line mode; use normal field selection and live editing.
- `packages/explorEDA/src/components/charts/LineChart/LineChart.tsx` — ObservationLineChart (190–233;375–410;751–783): Depends on original source IDs retained before reduction. Select extrema/endpoints from original ordered rows; draw/probe reduced paths without falsifying source selections.
- `packages/explorEDA/src/components/settings/FacetSettingsTab.tsx` — FacetSettingsTab (1–240): Extend existing wrap/grid/manual-order flow with a named compact preset and source-scoped summary ordering. Keep visible-facet selection distinct from data filters.
- `packages/explorEDA/src/components/charts/FacetRelated/facetLayout.ts` — planFacetWrapLayout; planFacetGridLayout (5–88): Use a scoped compact layout rather than reducing minimums for every chart. Provide focusable panel/detail access before attempting 51 panels.
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx` — TimeSeriesChart (68–97): Current calendar allIds are facet-scoped; shared full-source axis policy needs explicit data supplied by the parent.
- `packages/explorEDA/src/components/charts/Composition/calculations.ts` — evaluateCalc; orderedEnds (85–198): Reference only the bounded numeric first/last/change algorithm and valid-order policy. Share a small helper if useful, not the composition calculation grammar.
- `packages/explorEDA/src/utils/saveDataUtils.ts` — isChart (635–719): Validate only the new chart options and nested enum/numeric settings at the existing reader; do not invent a migration or parallel version.
- `packages/explorEDA/src/lib/dsl/settingKeys.ts` — CHART_SETTING_KEYS (415–486): Add any actual new chart setting keys to the public Dashboard text whitelist; inherited fields alone do not expose behavior.
- `packages/explorEDA/src/lib/dsl/compile.ts` — chart setting path validation (1882–1950): Honor the existing allowed-path validation for newly exposed settings.
- `packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts` — useChartEdit (12–61): Apply through the current live edit/hold flow so each completed gesture has ordinary undo semantics.
- `packages/explorEDA/src/types/ChartTypes.ts` — BaseFacetSettings; AxisSettings: Add optional, explicitly named shared/per-panel axis domain policy only where rendered; preserve existing visibleFacetIds order and axis limits.
- `packages/explorEDA/src/components/settings/FacetSettingsTab.tsx` — FacetSettingsTab; visibleFacetIds controls: Keep current manual hide/order. Reveal proposed scale/density/statistic controls only for supported charts and data modes.
- `packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx` — FacetContainer: Keep stable group identity and distinguish chart population, per-panel live rows and common reference-scale rows.
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx` — TimeSeriesChart facet planning: Allow an explicit common scale plan where needed without accidentally filtering peers or changing period contributor populations.
- `packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx` — group/facet domain preparation: Consume the declared scale policy in the cohort-summary slice, while preserving existing all-source domain behavior by default.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Author flow:** Add Line and select X/value/group. Choose Facets, then Compact. Only then show Summary, order-by-summary, extrema/latest markers and per-panel value range. State whether displayed summary follows filters; source-scope order remains stable.

**Cut lines:** The scale-policy slice can be proved on current chart modes independently of raw-date Line; compact exact-observation sparklines depend on REC-07. Tile addresses are REC-19 and remain deferred.

**Dependencies and related slices:** REC-07 source-aware grouped raw Line for exact original Date observations and source activation; Existing calendar Line can support an earlier approximate/period-summary counterpart; REC-19 tile arrangement remains separately deferred

**Strongest alternatives:** Option: Weekly calendar Line with ordinary Company facets Decision: Strong first counterpart: actual tech source has one double-source week only. It still changes the final Tesla value and lacks compact summaries/extrema.; Option: Use manually reordered facet chips first Decision: Useful intermediate behavior. Automated source-stat ordering can follow after compact panels work.; Option: General rich table with sparkline cells Decision: Rejected for this slice: actual tech dashboard is a three-column grid, and banana alone does not justify a universal table grammar.

**Try → Observe → Decide:** **Try:** Use the exact 9,030-row tech CSV. Show all 14 companies; inspect each first/last/extremum from original rows; verify Tesla final Open=120.39 rather than weekly mean=118.945. Filter a company/date interval, restore and round-trip edits. Independently compare a two-measure forecast, two activities with different spreads, and shared-scale peer facets before the compact layout slice. **Observe:** Correct source IDs, zero-baseline unavailable change, deterministic ties, stable source-based ordering, explicit live-versus-source summary behavior and usable keyboard/Alt-trace in small panels. Each chart declares shared versus per-panel axes; hiding panels does not filter or rescale other panels unintentionally; existing manual order remains sufficient for jobs. **Decide:** Ship the 14-company slice only if observations and summary scopes remain honest. Expand to 51 compact Covid panels only after readability/focus succeeds. Reject arbitrary mixed chart cells as scope expansion.

**Uncertainty:** Actual compact panel sizes and endpoint-label overlap need rendered proof. REC-06 is not a guarantee of the exact banana table or Covid geographic arrangement.

### REC-07 — Source-preserving grouped raw Line observations and explicit date/order support

**Proposal status:** proposed-foundation. **Examples:** tech-sparklines, consumer-confidence, covid-tiles, banana-yields, gdp-bump, stocks-horizon.

Extend Raw observations with long-form value+group and numeric/date x preparation, retaining source IDs and omission runs before reduction. Keep the existing wide-series path. Add honest series/end-point traces and common compact facet summaries only as separately staged controls.

**Benefit and cost:** Provides an honest data model for long-form trajectories, companion sparklines, and later rank/indexed modes without requiring source pivots or manual marks. medium to large. New preparation and original-row trace path; raw/date semantics, grouping, decimation/source membership, and facet scale policy must be explicit. Maintenance: Two public Line data modes must preserve existing behavior. Prefer narrow shared numerical preparation over converting the whole renderer to composition.

**Specific seams:**

- `packages/explorEDA/src/components/charts/LineChart/definition.ts`: packages/explorEDA/src/components/charts/LineChart/definition.ts:LineChartSettings, SeriesSettings
- `packages/explorEDA/src/components/charts/LineChart/LineChartSettingsPanel.tsx`, `packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx`: packages/explorEDA/src/components/charts/LineChart/LineChartSettingsPanel.tsx:ObservationLineSettingsPanel; packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx:LineDataMode
- `packages/explorEDA/src/components/charts/LineChart/LineChart.tsx`: packages/explorEDA/src/components/charts/LineChart/LineChart.tsx:190-233 ordered/reduced data, 330-425 domains and paths, 712-784 brush/noninteractive marks
- `packages/explorEDA/src/components/charts/LineChart/timeSeriesTrace.ts`, `packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx`: packages/explorEDA/src/components/charts/LineChart/timeSeriesTrace.ts and packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx:source target/keyboard conventions to reuse deliberately
- `packages/explorEDA/src/components/charts/useGetColumnData.tsx`, `packages/explorEDA/src/components/charts/useGetLiveData.tsx`: packages/explorEDA/src/components/charts/useGetColumnData.tsx and packages/explorEDA/src/components/charts/useGetLiveData.tsx:source/facet population helpers

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** No ranking, normalization, horizon folding or general transforms in first slice.; No generic built-in-to-composition compiler or new serializer framework.; Grouped raw Line is an optional alternative for tax/jobs, not a prerequisite of the chosen connected Scatter route. Calendar Line is already numerically suitable for the unique country-month confidence data.

**Dependencies and related slices:** Common source/filtered/facet scale-scope contract; Existing persistence and undo conventions

**Strongest alternatives:** Strongest smaller first slice is REC-02 in Scatter for numeric connected observations; raw Line grouping is not prerequisite for driving or tax if that path suffices.; Calendar summaries already cover consumer-confidence because its unique country-month rows need no extra raw-date logic; do not delay that case on an unnecessary rewrite.; Wide source pivot can draw many series but weakens row/group trace mapping and cannot become the default ordinary workflow.

**Try → Observe → Decide:** **Try:** Prepare long-form dates with repeated groups, duplicate x, null values and one filtered series; compare source IDs before/after rendering and decimation. **Observe:** Series contain only intended original rows; raw date values use timestamps without summary bins; date gaps/duplicates have a declared rule; mark trace IDs remain recoverable. **Decide:** Reject a broad rewrite if a modest Scatter or Calendar mode meets the target examples; reject grouping if users must pivot data or loses source lineage.

**Uncertainty:** The source-aware Line and compact-facet bundles are reconciled as REC-07 and REC-06; the remaining product choice is how much compact-summary behavior the first slice needs.; Do not assume custom facet scales are currently consistent: raw Line shares full source, Calendar scopes per facet.

### REC-08 — Focused Line facets with explicit peer context

**Proposal status:** proposed-after-smaller-proof. **Examples:** consumer-confidence, covid-compare.

Add Show other series as context for Line facets: one allowed chart population supplies reference paths/common scales, each panel highlights its focus key, and peer marks retain their own source identity. Start on existing Calendar monthly line for this unique country-month dataset; optional raw Line reuse later. A bounded benchmark/focus variant could also reduce part of covid-compare's task. Independently scaled recent/full-history insets remain composition; this recommendation does not provide them.

**Benefit and cost:** Enables focus-versus-peer comparisons without manual repeated full-population marks, while teaching the difference between focus and filtering. medium to large. No new aggregate is needed for this input, but reference/focus populations and selection semantics need explicit planner boundaries and shared scales. Maintenance: Prevent facet identity from being attached to peer points, cache common reference paths where possible, and keep scales stable across external filters.

**Specific seams:**

- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx`, `packages/explorEDA/src/components/settings/FacetSettingsTab.tsx`: packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx:split controls; shared packages/explorEDA/src/components/settings/FacetSettingsTab.tsx
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx`: packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx:68-116 facet data scope, source setup188-205 and rendering416-432
- `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts`: packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts:timePointFilters71-99, dates136-157, all-value recursion314-327
- `packages/explorEDA/src/components/charts/LineChart/timeSeriesTrace.ts`: packages/explorEDA/src/components/charts/LineChart/timeSeriesTrace.ts:targets/findRow
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`: packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:pathNodes3314-3425 and pointNodes3673-3692 as behavior reference

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** Same dataset and same series/facet identity only initially.; No arbitrary benchmark population, inset or tile layout; those can still justify composition.

**Dependencies and related slices:** Shared source/facet domains and clear local limit/filter separation; REC-07 optional for unaggregated date variants, not prerequisite for current unique monthly input

**Strongest alternatives:** Strongest smaller proof: current Calendar Line, monthly Average Index, split Country in one chart, plus linked rows and a 100 reference.; Standard facets alone lose peers; extra separate charts can carry explicit common limits but still lack compact focus presentation.; Rejected: arbitrary reference-dataset bindings or layered composition wrapper before this one repeat/split-field relationship is proven.

**Try → Observe → Decide:** **Try:** Use all9 countries then China focus, absent October China, country/date filters and a muted-peer trace/activation. **Observe:** Same coordinate scales across panels, September latest for China, peer traces carry true country/month rows, no intersection with the wrong focused facet. **Decide:** Reject or defer if a single split-Line overlay answers the task adequately; reject implementation if background clicks silently select an empty or wrong row set.

**Uncertainty:** External-filter versus fixed-source peer policy must be visible; source composition currently follows composition live rows.; Clarify whether context paths should be directly selectable or only traceable in first slice; either must avoid lying about scope.

### REC-09 — Line numeric grouped summaries and normalized area

**Proposal status:** recommended. **Examples:** causes-by-age.

Extend Line summary preparation to numeric X, with one numeric measure, optional group field and explicit aggregation. Add 100% area on nonnegative sum/count groups with a separate denominator for every X position. Reuse existing aggregate/area helpers and ordinary Notes; do not encode numeric ages as dates or introduce a cause-specific family.

**Benefit and cost:** Completes a common numeric-X composition task within the existing Line family; creates reusable grouped numeric summaries while retaining exact source provenance. medium; cumulative medium-to-large with shared Line preparation. Long-form grouping and numeric-X missingness need a new preparation mode. Normalization/stack baselines require per-X denominator trace and meaningful hit targets. Display is shared with existing area, but data and interaction semantics are not merely styling. Maintenance: Moderate if limited to sum/count over one numeric X field; avoid arbitrary coordinate stacking and multi-measure grammars.

**Specific seams:**

- `packages/explorEDA/src/components/charts/LineChart/definition.ts` — LineChartSettings (1–140): Separate a numeric grouped-summary mode from raw observations and calendar periods, and add a named normalized-area display only where meaningful.
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx` — TimeSeriesSettingsPanel (43–162;221–258): Use the existing mode/measure/split organization, but supply numeric-X-specific missing/step wording rather than reusing date periods incorrectly.
- `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts` — planTimeSeries (193–243;283–327;409–416): Factor only needed grouped summaries and area geometry; retain source IDs, numerator/denominator populations and per-X stack validity.
- `packages/explorEDA/src/components/charts/LineChart/LineChart.tsx` — ObservationLineChart and annotation frame (190–233;375–410): Supply numeric summary points and intervals to actual rendering and the existing Notes context; preserve local bounds versus dashboard filtering.
- `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts` — percent stacks and trace (115–183;273–287): Reuse normalization concepts and denominator contribution semantics; do not reuse the 30-category display guard as an area rule.
- `packages/explorEDA/src/components/charts/LineChart/areaCharts.test.tsx` — area behavior tests (1–194): Extend a small meaningful behavior fixture for numeric X, shares, missing/invalid inputs and exact selection/denominator trace.
- `packages/explorEDA/src/utils/saveDataUtils.ts` — isChart (635–719): Validate only the new chart options and nested enum/numeric settings at the existing reader; do not invent a migration or parallel version.
- `packages/explorEDA/src/lib/dsl/settingKeys.ts` — CHART_SETTING_KEYS (415–486): Add any actual new chart setting keys to the public Dashboard text whitelist; inherited fields alone do not expose behavior.
- `packages/explorEDA/src/lib/dsl/compile.ts` — chart setting path validation (1882–1950): Honor the existing allowed-path validation for newly exposed settings.
- `packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts` — useChartEdit (12–61): Apply through the current live edit/hold flow so each completed gesture has ordinary undo semantics.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Author flow:** Line → Summary by numeric X → choose X, value, split and sum/count → display 100% area. Only then show denominator readout, missing-X policy and stack order; Notes supplies the numeric reference guide.

**Dependencies and related slices:** REC-07 source-aware Line preparation/point interaction where reusable; Existing per-group aggregate and percent-stack contributor helpers

**Strongest alternatives:** Option: Percent Bar for a small selection of ages Decision: Useful intermediate cross-section, but its 30-category limit and categorical bars do not complete all 101 ages.; Option: Wide pivot then raw Line Decision: Does not provide normalized area or denominator/source trace and may discard original rows.; Option: Calendar summaries using Age as dates Decision: Rejected: wrong X semantics.; Option: A new Age/Cause chart type Decision: Rejected: the structure is a general numeric grouped area, not domain-specific.

**Try → Observe → Decide:** **Try:** Use 101×9 age/cause data, compare one age with its raw nine counts, filter one cause, inspect the changed denominator, then add one true absent age, an invalid Count and a zero-total age to a tiny acceptance fixture. **Observe:** Each age sums to 100% only when its denominator is positive; missing/invalid/zero are explicit; every selected band identifies numerator and denominator rows; Notes and local numeric limits work without applying hidden filters. **Decide:** Accept if the displayed shares and source populations are exact under filtering/restoration. Reject the mode if it invents zero-filled numeric ages without a declared step policy or conceals denominator changes.

**Uncertainty:** The existing composition does not insert gaps for entirely absent numeric X positions. Product policy must specify observed-X or explicit-step semantics rather than infer them from comments in packages/explorEDA/src/components/charts/Composition/stackedAreas.test.ts.

### REC-10 — Cohort-summary display in Box Plot

**Proposal status:** proposed. **Examples:** time-use.

Add a named Cohort summary display that reuses Box quartiles and contributor groups, connects two explicitly ordered cohort medians/quartiles, and offers difference/percent change with denominator/source trace. Expose independent/shared scale only when faceted.

**Benefit and cost:** Brings an ordinary cohort distribution comparison into the existing distribution family, preserving the simple Box/Violin starting point. medium. Existing quartile/contributor code is reusable; new connected summary drawing and two-population change calculation/selection are real additions. Maintenance: Invalid inputs, zero baseline, missing cohort, filtered sample sizes and facet scopes must remain explicit; independent scales require labels.

**Specific seams:**

- `packages/explorEDA/src/components/charts/BoxPlot/definition.ts`, `packages/explorEDA/src/components/charts/BoxPlot/BoxPlotSettingsPanel.tsx`: packages/explorEDA/src/components/charts/BoxPlot/definition.ts:BoxPlotSettings; packages/explorEDA/src/components/charts/BoxPlot/BoxPlotSettingsPanel.tsx:Display/Group by
- `packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts`: packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts:calculateBoxPlotStats/getQuartile
- `packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx`: packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx:groupStats 201-208, yDomain 123-138, traceGroups/source 318-410 and handleBoxClick423-436
- `packages/explorEDA/src/components/charts/BoxPlot/DistributionTraceBody.tsx`: packages/explorEDA/src/components/charts/BoxPlot/DistributionTraceBody.tsx:cohort/denominator trace presentation
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`: packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:changeOf530-551/summarizeGroups1907-1942 reference behavior

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** Two cohorts and unweighted quartiles first.; No bootstrap, survey weighting, or arbitrary multi-stage statistical grammar.

**Dependencies and related slices:** Shared facet scales and correct per-panel selection constraints; Existing distribution trace and persistence paths

**Strongest alternatives:** Strongest smaller option: current Box Minutes grouped Year, faceted Activity; delivers core distributions immediately.; Median-change table alongside boxes may avoid a connected-band mode if compactness is not needed; table must carry both valid sample sizes and earlier median.; Rejected: new universal paired-statistics framework or weighted survey machinery for this unweighted synthetic diary.

**Try → Observe → Decide:** **Try:** Filter Age/Weekday; remove a long 2020 activity entry; make a prior median zero; add invalid Minutes and absent Activity/Year. **Observe:** Quantiles match valid original entries, n excludes invalid measures but trace retains them, zero relative change denominator gives undefined/neutral, nonparticipants never become zeros. **Decide:** Reject if all 400 respondents are used as each activity's denominator or selection unexpectedly includes unrelated activities.

**Uncertainty:** Decide whether live quartile domains match source presentation or stable all-source quartile domains are a safer default.; Call it cohort summary; the source is not a matched-person panel.

### REC-11 — Horizontal categorical series bars, followed by constrained mirroring

**Proposal status:** proposed. **Examples:** du-bois-income, population-pyramid.

Add horizontal series geometry to existing Bar, then a dependent Mirror one series mode for two nonnegative count/sum series. Keep signed direction in the prepared plan, source measures positive, stable category ordering by an explicit field, and symmetric numeric limits. Optional share/value labels and adjacent-class boundary connectors are a later presentation cut.

**Benefit and cost:** Provides ordinary population pyramids and improves long-category stacks. Du Bois already has analytical parity, so its styling must not expand the first cut. Small-to-medium: horizontal geometry is bounded but touches axes, hit projection, trace, category ordering and save validation; mirror and scoped shared bounds are explicit dependent work.. Small-to-medium: horizontal geometry is bounded but touches axes, hit projection, trace, category ordering and save validation; mirror and scoped shared bounds are explicit dependent work. Maintenance: Two orientations and signed direction must remain consistent across facets, missing series, annotations and keyboard navigation. Reject arbitrary series-to-side layouts.

**Specific seams:**

- `packages/explorEDA/src/components/charts/BarChart/definition.ts` — BarChartSettings; barChartDefinition: Add orientation and gated mirror/category-order-by settings with validation/defaults.
- `packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx` — series split/layout and aggregate controls (34–146;209–278): Common orientation control; reveal mirror only for two valid nonnegative series; keep ordering and labels grouped under advanced display.
- `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts` — planSeriesBars; local totals/parts (115–124), segments (125–139) and BarMark bounds (299–319): Swap numeric/category projections, keep exact rows and signed/unsigned semantics separate, supply stable bands/order and shared limits.
- `packages/explorEDA/src/components/charts/BarChart/SeriesBarChart.tsx` — prepare summaries; mark interaction (58–113;270–349): Use projected rectangles for hit/keyboard/trace; include local year or facet scope in source intersections; preserve existing localFilters without promoting their Year scope to a global linked filter.
- `packages/explorEDA/src/components/charts/BarChart/barTrace.ts` — bar mark trace (1–68): Report original sum, mirror direction, contributors, and scope without treating a negative coordinate as negative people.
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — barValues; barNodes; stackConnectors (2276–2316;2440–2553): Reference semantics only; reuse a small directional helper if helpful, not Composition renderer or saved JSON.
- `packages/explorEDA/src/components/charts/Axis/axisBounds.ts` — numericAxes; logAxes: Honor the rotated numeric axis and symmetric bounds through public controls.
- `packages/explorEDA/src/lib/annotations/context.ts` — annotationContext bar branch (67–72): Rotate the valueAxis context for horizontal Bar so ordinary reference controls bind to the real numeric axis; preserve the current limit on series-specific category notes unless a real subject projection is added.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Dependencies and related slices:** Existing series Bar contract; common settings/text/save/undo gates; explicit local-view or facet scoping for the two years.

**Strongest alternatives:** Proposal: Use two current grouped Sum bars Decision: Strongest smaller alternative; preserves all numbers/source rows today, but changes the profile comparison.; Proposal: Pre-negate Male People values Decision: Rejected as the normal author flow: source magnitude and downstream summaries should remain truthful.; Proposal: Promote Row into a universal series chart Decision: Rejected for this bundle: Row lacks series, ranks by magnitude and groups Other; Bar already has the needed aggregate/interaction contract.; Proposal: Texture and custom historical lettering Decision: Deferred to composition; these do not close an analytical gap.

**Try → Observe → Decide:** **Try:** First horizontal Du Bois Sum(Share)/Class/Category using current data; then 1900/2000 pyramids on Age group, Sex and Sum(People), fixed 12 million magnitude, plus a missing sex-age bucket. **Observe:** Every segment and side matches source sums; order and slots remain stable under filtering; mirror never mutates source People; source trace identifies age+sex+year while the local Year scope remains local; keyboard/Alt-Enter reaches the same rows; a reload/text round trip preserves mode and scopes. **Decide:** Ship horizontal bars independently. Approve mirroring only if shared scoped profile geometry works without source negation or global-filter conflicts; reject if it loses exact scope or creates Other.

**Uncertainty:** Reuse the existing Filters → Chart rows flow; coordinate mirror-source traces and axis bounds without changing local-filter semantics.; Connectors and per-category income labels are optional, not part of the first mirror contract.

### REC-12 — Ridgeline display within Box Plot/Violin

**Proposal status:** proposed-family-mode. **Examples:** lincoln-ridgeline, climate-ridgeline.

Extend the current Box Plot/Violin capability with a named Ridgeline display. Prepare Gaussian KDE on a shared numeric grid with field-unit bandwidth and raw probability density; draw overlapping horizontal rows with common/per-group height, stable group order, label cadence and optional x-value shading. Supply ordinary annotation subject projections for named groups.

**Benefit and cost:** One coherent display covers the twelve-month and 84-year density questions without manual repeat frames. It makes numerical bandwidth and density normalization explicit. Medium: shared-grid numerical preparation, a new projection and filled-density renderer, group-order/layout, annotation projection and numerical-axis capability are necessary.. Medium: shared-grid numerical preparation, a new projection and filled-density renderer, group-order/layout, annotation projection and numerical-axis capability are necessary. Maintenance: Bandwidth units, log transforms, group exclusions, stable reference peaks and dense output remain a permanent contract. Keep normalized Violin behavior intact and avoid arbitrary nested repeats.

**Specific seams:**

- `packages/explorEDA/src/components/charts/BoxPlot/definition.ts` — BoxPlotSettings; boxPlotDefinition: Add a display enum or cohesive density-mode settings; do not require a new Add chart entry merely because this is new renderer behavior.
- `packages/explorEDA/src/components/charts/BoxPlot/BoxPlotSettingsPanel.tsx` — Display and bandwidth (100–167): Keep existing Box/Violin default; reveal Bandwidth in field units, order, density height, row overlap, shading and label cadence only for density modes.
- `packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts` — calculateKernelDensity (111–142): Introduce a pure common-grid density helper returning raw density, valid/excluded IDs, bandwidth and reference peak. Do not silently change existing independently normalized Violin semantics.
- `packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx` — domain/group planning, KDE, source trace, AnnotationLayer (123–309;318–409;513–535): Add horizontal ridge plan/render and group subjects, preserving group selection and exact contributors; make stable versus live reference height explicit.
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — densityCurve; densityNodes (2719–2795): Extract/reuse mathematical helper if justified; keep built-in layout, selection and saved state independent of the composition compiler.
- `packages/explorEDA/src/lib/annotations/resolve.ts` — category subject branch (507–514): Use existing Notes mechanism with renderer-provided named-group anchors; do not duplicate annotation storage/UI.
- `packages/explorEDA/src/lib/annotations/context.ts` — annotationContext boxplot branch (75–76): Expose the actual group field of the new density mode and rotated value axis to the editor; current Box has no categoryField/records capability.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Dependencies and related slices:** Common chart settings/text/save/undo gates; numerical-axis orientation capabilities; ordinary annotation subject support.

**Strongest alternatives:** Proposal: Rotate the current Violin Decision: Rejected as analytical equivalence because every existing KDE peak is normalized to one on a per-group grid.; Proposal: Use Box plus Histogram Decision: Strongest smaller alternative for monthly summaries; already present and useful, but does not preserve common density heights.; Proposal: Use ECDF for all years in one frame Decision: Different threshold task and current ten-largest-plus-Other grouping loses the 84-year identity comparison.; Proposal: A separate registered chart type per ridgeline example Decision: Rejected: both share a named density mode; an Add chart entry is not required.

**Try → Observe → Decide:** **Try:** Two equal-count groups with narrow and broad distributions, then Lincoln at bandwidth 3.4 and all 84 synthetic years at bandwidth 0.05 with a missing group. **Observe:** Shared sample coordinates and probability-density units preserve different peak heights; January–December/ascending-year order stays stable; exact valid/excluded contributors and bandwidth appear in trace; notes follow named years; dense saved-size output stays readable. **Decide:** Reject a rotation-only approach if peaks become equal. Ship the twelve-group display before the dense case; reject overlap controls that require free-form per-group placement or silently merge years.

**Uncertainty:** Whether a population-referenced peak with growth is the most legible stable filter policy needs direct proof.; No dense saved-size rendering or performance measurement ran.

### REC-13 — Split numerical histograms first; defer a shared Unit counts renderer until source-cell value is proved

**Proposal status:** partially-proposed-partially-deferred. **Examples:** yield-gap, titanic-waffle.

First compose existing numeric-bin preparation with a category split and exact per-bin/category sources. Separately evaluate a named Unit counts display with one row per cell, reused for category grids and numeric-bin grids. The cell renderer is explicitly deferred until direct cell trace improves the task over current aggregate source lists.

**Benefit and cost:** The split histogram addresses an ordinary EDA need without requiring cell work. A later shared one-row display would cover both records-per-bin and category-unit examples. Split bins: small-to-medium preparation and plan integration. Unit renderer: medium family work for cell layout, source mapping, hit areas and keyboard navigation; not a bar cosmetic.. Split bins: small-to-medium preparation and plan integration. Unit renderer: medium family work for cell layout, source mapping, hit areas and keyboard navigation; not a bar cosmetic. Maintenance: Must preserve numerical-bin boundaries, absent versus zero bins, stable colors and exact source counts. Unit mode adds a cell budget and accessibility burden; no sampling or rounding can be hidden.

**Specific seams:**

- `packages/explorEDA/src/components/charts/BarChart/definition.ts` — BarChartSettings: Represent numeric-bin split semantics separately from exact categorical series; add a unit display only after its proof gate.
- `packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx` — series split and display controls: Use familiar field and Split by controls; make numerical bins explicit; reveal one-row cells/columns only for the accepted unit mode.
- `packages/explorEDA/src/components/charts/BarChart/BarChart.tsx` — series renderer dispatch (98–103): Do not bypass numeric bins merely because seriesField is set; route prepared bins+series explicitly.
- `packages/explorEDA/src/components/charts/BarChart/bins.ts` — numericBins (1–38): Retain numerical intervals, whole-number-centered bins and empty positions with stable extents.
- `packages/explorEDA/src/components/charts/BarChart/SeriesBarChart.tsx` — aggregate preparation (58–113): Summarize sources by bin and series, carry exact input IDs and exclusions, preserve local/facet scope.
- `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts` — category summarization, share/source contract (77–139;230–286): Reuse aggregate stack/trace semantics, but a cell layout requires a separate plan with one source ID per cell and bounded geometry.
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — waffleNodes (2324–2418): Reference exact one-row cell behavior and extract only a small count-to-cell helper if useful; normalized rounding is a separate transform.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Dependencies and related slices:** Split numeric-bin contract before numeric-bin cell grids; common source-trace and keyboard gates; REC-13 unit branch is contingent on its independent usability proof.

**Strongest alternatives:** Proposal: Current stacked categorical Bar for integral Yield gap Decision: Strongest immediate smaller alternative on this fixture; categories may collapse and are not general numeric intervals.; Proposal: Current stacked Count plus 100% Bar for Titanic Decision: Preferred primary analytical flow now; exact passenger source lists already exist.; Proposal: Treat ordinary composition click as per-passenger selection Decision: Rejected as a false premise: normal click selects repeat; Alt-click accesses exact cell trace.; Proposal: Normalized 100-cell waffles, multi-row cells, pictograms, arbitrary bin packers Decision: Deferred; each changes count, rounding or layout semantics and is not necessary to prove one-row cells.

**Try → Observe → Decide:** **Try:** Show the 197-row Yield gap fixture as split bins and cells, including an empty interior bin; show the 1,309-row Titanic fixture as Count/100% and one-row cells. **Observe:** Bins keep fixed numeric positions; segment totals and exclusions reconcile; each visible cell has one unique source ID and cell totals equal the live row count; one Alt-Enter trace reveals the expected row; cell layout edits create no data filters. **Decide:** Ship split bins independently. Approve cell rendering only if exact per-cell inspection improves the actual workflow enough to justify new interaction and layout maintenance; otherwise retain composition as advanced unit teaching.

**Uncertainty:** Per-cell benefit is deliberately unresolved, not inferred from visual novelty.; The prepared Yield gap file is synthetic and integral; general bin semantics require a non-integral proof fixture.

### REC-14 — Supplied-lane interval display with explicit open-end reference

**Proposal status:** proposed-family-mode. **Examples:** scotus-timeline.

Provide Start, End, Lane, optional color/label fields and stable lane order. Plan one exact-source interval per valid-start row, with explicit missing/reversed endpoint handling, clipping and saved as-of semantics. Treat supplied-lane overlaps as a declared case; do not grow into project scheduling.

**Benefit and cost:** Intervals answer occupancy, succession and gaps that duration summaries lose. The contract is reusable without arbitrary composition authoring. Medium-to-large relative to a setting: new preparation, interval plan, renderer, source/keyboard interactions and settings/registration/capability work. A single example does not automatically win priority over broader Bar or Scatter work.. Medium-to-large relative to a setting: new preparation, interval plan, renderer, source/keyboard interactions and settings/registration/capability work. A single example does not automatically win priority over broader Bar or Scatter work. Maintenance: Dates, open ends, overlap, clipping, zero-length spans and stable lanes form a lasting semantic contract; stay with supplied lanes and exact record identity.

**Specific seams:**

- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — domainFor and spanNodes (574–578;619–665;3482–3562): Reference endpoint, exact-row and clipping behavior; avoid inheriting implicit domain-edge-as-today semantics.
- `packages/explorEDA/src/components/charts/Composition/compositionTypes.ts` — SpanMark (357–378): Reference existing mark semantics, but create an ordinary chart settings contract instead of a raw mark editor.
- `packages/explorEDA/src/types/ChartTypes.ts` — ChartSettings union: Add a settings variant only if implementation chooses an actual registered family rather than a named mode.
- `packages/explorEDA/src/charts/registry.ts` — chart registration: Register the interval settings/planner/renderer if it is a separate entry; no forced new entry per example.
- `packages/explorEDA/src/charts/registerAllCharts.ts` — built-in registrations: Wire an actual new family once if chosen.
- `packages/explorEDA/src/components/charts/Interval/definition.ts` — proposed IntervalSettings/definition **(proposed new file)**: Explicit fields and endpoint policy, field validation, defaults and capabilities.
- `packages/explorEDA/src/components/charts/Interval/intervalPlan.ts` — proposed planIntervals **(proposed new file)**: Prepare exact endpoints and source identity; compute stable lane/date geometry and source exclusion reasons.
- `packages/explorEDA/src/components/charts/Interval/IntervalChart.tsx` — proposed renderer **(proposed new file)**: Draw clipped spans and fitted labels with record selection, keyboard and trace access through the prepared plan.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Dependencies and related slices:** REC-01 endpoint-label correctness clarification; shared chart registration/validation/text/save/axis/annotations/undo infrastructure.

**Strongest alternatives:** Proposal: Duration Histogram or Row sums Decision: Useful companion, rejected as parity because it drops interval placement and gaps.; Proposal: Line after duplicating start/end rows Decision: Rejected as a small setting: introduces preparation and identity/open-end contracts while still needing lane behavior.; Proposal: Annotations for every interval Decision: Rejected as ordinary author flow; manually recreates marks and source attachment.; Proposal: Gantt dependencies, automatic packing, resource scheduling Decision: Deferred; no evidence in this example warrants those contracts.

**Try → Observe → Decide:** **Try:** A four-record fixture with a gap, closed span, open span and invalid start, then the 121 source terms and a fixed saved as-of date. **Observe:** Endpoint provenance and open status remain truthful; filtering party preserves lane positions and date domain; one justice record is selected/traced from its interval; reload produces the same as-of output. **Decide:** Approve only the supplied-lane family. Reject implementations that fabricate end dates in source, need hand-authored endpoint rows, or claim clock behavior from a data-domain edge.

**Uncertainty:** Whether a separate Add chart entry is warranted or the mode belongs under a future temporal family remains a product naming decision.; The first contract should define but not automatically pack overlapping supplied-lane records.

### REC-15 — Categorical Scatter placement: Jitter or Swarm

**Proposal status:** proposed. **Examples:** co2-swarm.

Expose Swarm only for a numeric × categorical points/bubbles view. Run a pure variable-radius collision helper after numeric projection and sizing, displacing only the categorical coordinate. Use one resulting point plan for drawing, hit testing, source trace and keyed record notes; declare stable population packing and crowding behavior.

**Benefit and cost:** Completes the authored CO2 layout by extending an already capable categorical bubble chart. It avoids a duplicate distribution or swarm family. Small-to-medium: layout helper plus point-plan integration is bounded, but variable radii, stable filtering, facets and all interaction/note anchors must agree.. Small-to-medium: layout helper plus point-plan integration is bounded, but variable radii, stable filtering, facets and all interaction/note anchors must agree. Maintenance: Crowding and stable population packing need clear semantics. A minimum visible radius or automatic label collision system is a separate optional feature.

**Specific seams:**

- `packages/explorEDA/src/components/charts/ScatterPlot/definition.ts` — ScatterPlotSettings: Add categorical point-placement setting and validate relevance to the selected display/axis kinds.
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx` — point/bubble field and display controls (1–205): Reveal Jitter/Swarm only when one axis is categorical and point mode is active; use existing size/color and Notes controls.
- `packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts` — scatterAxisKind; scatterPosition (105–181;193–214): Keep existing category domain, numeric projection and nonpositive log exclusion; isolate categorical displacement.
- `packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts` — point preparation (52–99): Apply collision layout after real bubble radii, preserve source IDs and exact numeric coordinate; retain rejected log rows as exclusions.
- `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts` — planScatter (280+); point plans: Prepare stable population placement, deterministic ties and crowded status consistently with active facets.
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx` — annotationFrame plotted callback (112–137): Use displaced plan positions so existing keyed record notes remain attached.
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx` — bubble keyboard/trace path (480–583): Hit and keyboard interactions consume the same displaced point plan; no new glyph-selection model is necessary.
- `packages/explorEDA/src/components/charts/Composition/swarm.ts` — swarmOffsets (1–38): Extract/share a small collision helper after adding explicit crowding outcomes; current clamp can still overlap.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Dependencies and related slices:** Existing categorical scatter point plan; REC-01 log-zero correction; common validator/text/save/undo gates.

**Strongest alternatives:** Proposal: Use existing categorical Scatter with deterministic jitter and keyed notes Decision: Strongest smaller alternative and recommended primary analytical teaching now.; Proposal: New Swarm chart family Decision: Rejected: actual Scatter already has category bands, log axes, size/color fields, source selection and record notes.; Proposal: Duplicate Notes system or require labelField for eight country names Decision: Rejected: current keyed record callouts work through plotted positions on category axes.; Proposal: Guarantee no overlap by clamping offsets Decision: Rejected as false; the existing helper explicitly permits overlap at crowded limits.

**Try → Observe → Decide:** **Try:** Jitter versus Swarm on the 201 positive CO2 rows with the same radii, colors and eight keyed notes; include an overfull narrow lane and a linked filter. **Observe:** Numeric coordinates and source IDs remain unchanged; note/hit/keyboard positions match drawn centers; stable packing prevents needless motion under filtering; crowded lanes report their limit; the two zero rows remain explicit log exclusions. **Decide:** Ship if it is a local placement option over the existing plan. Reject any implementation that shifts numeric values, silently claims zero overlap, or pins zeros to a positive coordinate.

**Uncertainty:** All-row stable packing versus live reflow should be tested and named; neither should be accidental.; No pixel-space browser rendering or performance measurement ran.

### REC-16 — Named Mosaic width mode for 100% series Bar

**Proposal status:** proposed. **Examples:** titanic-mosaic.

Add Width=Share of total to 100% series Bar for one split and nonnegative count/sum. Reuse segment/class shares, compute class/grand-total marginal widths from the same live/facet population, and supply variable category bounds and tick centers. Trace both denominators with exact source rows.

**Benefit and cost:** Adds a single coherent joint-area comparison using established Bar aggregation, filtering and source trace; can remain an advanced width mode rather than a new chart entry. Small-to-medium bounded extension: variable categorical geometry, axis ticks, marginal denominator trace and interaction bounds are real work, but no new aggregation family or selection model is needed.. Small-to-medium bounded extension: variable categorical geometry, axis ticks, marginal denominator trace and interaction bounds are real work, but no new aggregation family or selection model is needed. Maintenance: Both denominators must use the same population under filters/facets. Category ordering and colors stay stable while encoded widths intentionally change. Decorative gaps require honest area claims.

**Specific seams:**

- `packages/explorEDA/src/components/charts/BarChart/definition.ts` — BarChartSettings: Add a gated width mode for percent layouts; reject negative totals and unsupported aggregate/layout combinations.
- `packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx` — series display controls (34–124): Show Width only for eligible 100% series; use a named Mosaic choice/explanation without opening repeat editors.
- `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts` — category totals, scaleBand, mark bounds (115–139;205–216;299–359): Reuse normalized data, replace uniform band geometry with explicit variable bounds/tick centers and declared zero/empty behavior.
- `packages/explorEDA/src/components/charts/BarChart/SeriesBarChart.tsx` — prepared populations and mark interaction (58–113;270–349): Widths and heights use the same live/facet population; hit/keyboard selection uses new bounds without changing category/series scope.
- `packages/explorEDA/src/components/charts/BarChart/barPlan.ts` — BarMark and stack/source metadata (1–164): Carry marginal total/share and grand-total contributors alongside the existing conditional stack denominator.
- `packages/explorEDA/src/components/charts/BarChart/barTrace.ts` — bar trace source extraction (1–68): Expose segment/class and class/grand-total math plus exact source rows; prevent accidental mixed populations.
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — weighted frames and normalized stacks (769–819;2162–2240): Reference semantics only; no need to adopt arbitrary weighted-repeat layout.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Dependencies and related slices:** Existing percent-series data/trace contract; common validator/text/save/undo and axis/annotation capability gates.

**Strongest alternatives:** Proposal: Current count Bar plus 100% Bar Decision: Strongest smaller alternative; fully preserves underlying figures and source lists, but asks readers to combine marginal and conditional views.; Proposal: Generic weighted facets/repeat engine for all built-ins Decision: Rejected for this need: one variable-width percent-bar mode is sufficient.; Proposal: Nested mosaics and negative values Decision: Deferred; not needed by this example and substantially expands the semantic contract.

**Try → Observe → Decide:** **Try:** Three classes with 1/2/3 records, with mixed Fate and one zero-total category; then Titanic and a Sex filter. **Observe:** Widths are 1/6, 2/6, 3/6; within-class heights equal conditional shares; with zero gaps/insets, cell area equals joint-count share; both trace denominators reconcile after filtering; mode changes create no data selection. **Decide:** Accept as a bounded Bar mode if the single graphic improves the task over paired count/percent views. Reject all-row widths combined with live heights while claiming live-person area, or any loss of keyboard/source access.

**Uncertainty:** Visual comparison should decide whether single-graphic benefit warrants nonuniform category-axis maintenance.; Choose explicit gap/inset semantics; exact painted area should only be asserted for zero decorative gaps.

### REC-17 — Ranked Line mode with explicit competitor population

**Proposal status:** deferred-new-mode. **Examples:** gdp-bump.

Introduce a named Rank mode inside the Line family after source-preserving grouped observations. Declare x/series/value, direction, rank population, tie policy and duplicate series/x behavior; retain competitor rows and raw values for every derived rank.

**Benefit and cost:** Makes dynamic relative position accessible as a reusable analytical chart while keeping scope and ranking honest. large relative to small settings. New derived values, eligible-row policy, tie semantics, duplicate key contract and competitor traces; rendering alone is not sufficient. Maintenance: Changing filters can change both ranks and number of competitors; color identity and result traces must remain stable and explicit.

**Specific seams:**

- `packages/explorEDA/src/components/charts/LineChart/definition.ts`, `packages/explorEDA/src/components/charts/LineChart/LineChartSettingsPanel.tsx`: packages/explorEDA/src/components/charts/LineChart/definition.ts and packages/explorEDA/src/components/charts/LineChart/LineChartSettingsPanel.tsx:new ranked display settings
- : Grouped observation planner from REC-07:rank stage before scale/layout
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`: packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:rankRows2916-2944 and live rank preparation508-527 as reusable numerical reference
- : Line renderer/trace source:end labels, inverted rank scale, competitor source row inspection
- : Shared persistence/DSL validators must validate the coherent mode, not arbitrary transform JSON

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** Rank mode rather than a separate mandatory top-level chart.; No universal window-function/transform framework; distinct source x values and one series/x row first.

**Dependencies and related slices:** REC-07 grouped observation source identity; Endpoint labels/shared scales from a modest connection/Line helper

**Strongest alternatives:** Strongest smaller proof: straight grouped ranked line, fixed eligible set with explicit policy, no smooth edges or top-k suppression.; Static rank column plus Line works only for fixed precomputed ranks; it does not match re-ranking after country filters.; A year-filtered sorted table is useful interim behavior but loses multi-year trajectories.

**Try → Observe → Decide:** **Try:** Filter top economy, add ties, one null GDP and duplicate country/year; inspect why one country changed rank. **Observe:** Trace shows own raw row, eligible competitors, tie policy and excluded rows; rank axis/labels show ranks while raw GDP remains accessible. **Decide:** Defer until duplicates/ties and competitor trace are specified; reject silent input-order or aggregation behavior presented as a universal rank.

**Uncertainty:** Baseline ranks are sequential with input-order ties; a better tie policy changes exact parity and needs a conscious product decision.

### REC-18 — Relative-series Line first; specialist Horizon mode only after demand

**Proposal status:** deferred-new-mode. **Examples:** stocks-horizon.

First make baseline-relative Line values explicit and traceable. Add Horizon as a specialist named display only if users need the small row height: folded positive/negative bands, band count and value key, shared/per-series magnitude and exact reconstruction to raw/baseline rows.

**Benefit and cost:** Supports ordinary growth comparisons before paying for a specialist compression technique; makes compact visual bands interpretable. large for complete Horizon; medium independent relative-Line stage. Baseline population, transformed values, sign folding, dynamic band scales and reconstruction/keyboard trace are separate numerical and interaction work. Maintenance: Nulls/zero baseline, delayed starts, filters, independent scales and band semantics cannot be left implicit.

**Specific seams:**

- `packages/explorEDA/src/components/charts/LineChart/definition.ts`, `packages/explorEDA/src/components/charts/LineChart/LineChartSettingsPanel.tsx`: packages/explorEDA/src/components/charts/LineChart/definition.ts; packages/explorEDA/src/components/charts/LineChart/LineChartSettingsPanel.tsx:baseline and later display contract
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`: packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:horizonValues2583-2623/horizonNodes2633-2690 as numerical/layout reference
- `packages/explorEDA/src/components/charts/LineChart/relativeSeriesPlan.ts` — proposed baseline-relative preparation helper **(proposed new file)**: New helper after grouped source-aware observations: select a declared baseline population and key, preserve raw and baseline row IDs, and distinguish zero or missing baselines. File name is a proposal, not an existing implementation.
- `packages/explorEDA/src/components/charts/LineChart/horizonPlan.ts` — proposed horizon band preparation helper **(proposed new file)**: Deferred numerical/display stage: fold signed relative values into explicit bands, retain reconstruction thresholds and source identities, and share scale scope deliberately.
- `packages/explorEDA/src/components/charts/LineChart/LineChart.tsx` — ObservationLineChart: Consume the accepted relative/source plan, then a separately proved horizon display; draw and hit-test from the same values and source memberships.
- `packages/explorEDA/src/components/charts/LineChart/timeSeriesTrace.ts` — existing calendar trace conventions: Use as a source-target and contributor-readout precedent; create a raw/relative trace route through the shared registry rather than claiming this calendar resolver already handles folded observations.
- `packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx` — chart trace registration scope: Register explicit relative-point/band targets that disclose original value, baseline record, transformed value and reconstruction; preserve keyboard access.
- `apps/demo/src/demos/dashboardSettings.ts` — stocksHorizonDashboard: Correct fixed January-2000 wording when the chosen baseline differs; distinguish delayed series starts and the saved baseline policy.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** No forecast/performance claims about stock data.; No universal small-multiple chart family solely for folding; retain explicit specialist contract.

**Dependencies and related slices:** REC-07 source-preserving groups and dates; Explicit baseline-relative stage; Shared facet scale/caption conventions

**Strongest alternatives:** Strongest smaller alternative: ordinary percent-change/indexed Line at readable height with explicit baseline and raw-price trace.; Fixed prepared growth column is acceptable only when baseline is intentionally fixed; not equivalent to source's first-live-row rebasing.; Keep existing composition as specialist example if usage does not justify a mode.

**Try → Observe → Decide:** **Try:** Compare Apple/IBM/Google, change date filters, test missing and zero initial price, switch shared/independent magnitude. **Observe:** Baseline date/value and band interval are visible; reconstructed growth equals original price transformation; zero relative baseline is undefined, not unit-changing fallback. **Decide:** Reject Horizon as ordinary control if a user cannot determine what one color band means or if baseline rows cannot be traced; defer if a normal relative Line suffices.

**Uncertainty:** Source composition uses first live baseline, independent live peak, and absolute-difference fallback at zero. These are observed semantics to reconsider, not assumptions to copy.

### REC-19 — A shared tile-address facet layout

**Proposal status:** deferred. **Examples:** covid-tiles, elections.

Consider only a bounded tile-address layout that maps existing facet groups to nonnegative integer row/column addresses. It must preserve holes and validate collisions/missing addresses. It is not free-positioned frames. Keep the current geographic examples in composition until both Line paths and one-row Heatmap strips work with the same modest helper.

**Benefit and cost:** Would reduce manual authoring for two geographic small-multiple examples if it can remain a simple layout helper. medium-to-large cumulative. Shared population/domain contracts differ between Line and Heatmap. 51 small panels require a coherent focus, trace, density and output story. Input address collisions, missing values and resize behavior are user-visible semantics. Maintenance: Potentially moderate; reject any scope that expands into arbitrary composition frames/populations.

**Specific seams:**

- `packages/explorEDA/src/types/ChartTypes.ts` — FacetSettings (33–56): A new tile arrangement/address field would be a new facet contract; current types only wrap/grid.
- `packages/explorEDA/src/components/settings/FacetSettingsTab.tsx` — FacetSettingsTab (1–240): If proved, expose address field and a map preview/diagnostic, not raw coordinates or mark construction.
- `packages/explorEDA/src/components/charts/FacetRelated/facetLayout.ts` — facet layouts (5–94): Implement persistent holes, deterministic focus order, bounds and readable resize behavior separately from data filtering.
- `packages/explorEDA/src/components/charts/Heatmap/Heatmap.tsx` — Heatmap (80–107): Current facetIds only limit live values while category domains remain global; a one-row election strip needs explicit per-panel position domains and separately shared color scale.
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — tileAddresses (1503–1544): Existing helper is evidence, not a turnkey UI: first address wins, missing groups append, and duplicate-address collisions need a policy.
- `packages/explorEDA/src/components/ChartSettingsContent.tsx` — ChartSettingsContent (68–95): Heatmap has no public Facets tab; cannot call renderer-level props a shipped public feature.
- `packages/explorEDA/src/utils/saveDataUtils.ts` — isChart (635–719): Validate only the new chart options and nested enum/numeric settings at the existing reader; do not invent a migration or parallel version.
- `packages/explorEDA/src/lib/dsl/settingKeys.ts` — CHART_SETTING_KEYS (415–486): Add any actual new chart setting keys to the public Dashboard text whitelist; inherited fields alone do not expose behavior.
- `packages/explorEDA/src/lib/dsl/compile.ts` — chart setting path validation (1882–1950): Honor the existing allowed-path validation for newly exposed settings.
- `packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts` — useChartEdit (12–61): Apply through the current live edit/hold flow so each completed gesture has ordinary undo semantics.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Dependencies and related slices:** REC-06 compact Line focus/readability; REC-05 explicit shared value-color domains; Deliberate Heatmap per-panel position-domain handling and public facet support

**Strongest alternatives:** Option: Regular compact Line facets and a regular Heatmap matrix Decision: Recommended core path first; loses spatial adjacency but preserves ordinary histories/values.; Option: Keep authored tile composition Decision: Recommended now: both examples remain good advanced layout lessons.; Option: Add unrestricted per-facet x/y/width/height Decision: Rejected: that is a composition frame editor under another name.

**Try → Observe → Decide:** **Try:** Prototype exactly covid-tiles and elections with one address helper; include duplicate/invalid/missing addresses, geographic holes, filter/restore, narrow resize and keyboard traversal. **Observe:** All 51 groups are accounted for, collisions explained, geographic positions stable, correct panel/local versus global domains, exact trace and truthful single-graphic output. **Decide:** Advance only if the same small helper works for both. If either requires nested frames, per-mark populations or renderer-specific layout branches, keep composition and stop the helper.

**Uncertainty:** No runtime or layout proof was run. These two examples justify investigating a helper, not presuming it is a small extension ready to implement.

### REC-20 — General tables with arbitrary embedded charts

**Proposal status:** rejected for this review scope; narrow future need deferred. **Examples:** tech-sparklines, banana-yields.

Reject a universal rich-table grammar as the response to banana-yields. First create an ordinary linked Pivot/Heatmap/Line counterpart. If simultaneous aligned trend cells remain essential after that trial, consider one separately specified sparkline column mode rather than arbitrary chart cells.

**Benefit and cost:** Protects a small project from a new table grammar when linked existing views already answer the numerical questions. Retains a clear composition boundary for mixed-content single-row graphics. large if generalized. Nested chart planners, scale scopes, table sizing/virtualization, row order, keyboard dispatch, selection/trace ownership and exports all become part of a new contract. Only banana requires this aligned mixed-content layout; delivered tech is a grid, not a table. Maintenance: High for arbitrary cells; any future proposal should start with one fixed temporal measure per row group.

**Specific seams:**

- `packages/explorEDA/src/components/charts/DataTable/definition.ts` — DataTableSettings (1–82): Current columns identify scalar fields/width; adding arbitrary chart descriptors would create a new rendering/interaction model.
- `packages/explorEDA/src/components/charts/DataTable/DataTableBody.tsx` — DataTableBody (1–137): Virtualized record rows render scalar/null cells, not grouped miniature charts.
- `packages/explorEDA/src/components/charts/SummaryTable/SummaryTable.tsx` — SummaryTable (1–148): Profiles fields rather than groups; do not reinterpret its spark distributions as per-country temporal cells.
- `packages/explorEDA/src/components/charts/PivotTable/definition.ts` — PivotTableSettings (1–124): Current grouped aggregates, totals and shading provide much of banana analysis without nested charts.
- `packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts` — calculatePivotData; contributor construction (205–279;371–426): Preserve distinct decade-cell and overall valid-year mean contributor populations; row ordering by a statistic could be a separate bounded addition if proved.
- `packages/explorEDA/src/components/charts/PivotTable/PivotTable.tsx` — PivotTable inspection (602–724): Actual cell inspection includes IDs/raw values and invalid exclusions; preserve rather than replace this provenance.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Dependencies and related slices:** Try the linked counterpart first; REC-07/REC-06 for better source-aware Line and compact summaries; REC-05 for explicit aggregate heat colors

**Strongest alternatives:** Option: Pivot average Yield by Country/Decade, totals/shading, plus linked Heatmap and Line Decision: Recommended now. State that separate views do not reproduce all single-graphic alignment.; Option: One bounded sparkline column after a proof Decision: Deferred, only if the linked alternative leaves an essential comparison unresolved.; Option: Keep banana composition Decision: Recommended for the authored three-part row and source/illustrative-series context.

**Try → Observe → Decide:** **Try:** Use linked Pivot/Heatmap/Line on all 814 banana rows, inspect a missing-decade placeholder and compare a decade mean to the overall valid-year mean. Ask whether aligned trends change a specific analytical conclusion. **Observe:** Correct weighting and source row sets; clear distinction between actual decade inputs and illustrative annual trajectories; concrete evidence of any remaining alignment requirement. **Decide:** Reject the universal table. Reopen only a narrow sparkline column if the linked trial demonstrably prevents an essential comparison, with an explicit selection/trace/export contract.

**Uncertainty:** Need for exact alignment is a product question. The source proves the current table limitation but does not prove enough reuse for a generic family.

### REC-21 — Use stacked area now; defer exact stream baseline option

**Proposal status:** deferred-extension. **Examples:** unemployment-stream.

Publish a current Calendar monthly summed stacked-area counterpart first. Only after observing an unmet compact-stream need, add stable order plus zero/center/wiggle baseline and smooth drawing with matching hit/trace math to the existing area planner.

**Benefit and cost:** Avoids blocking already-supported magnitude comparisons on a low-priority presentation extension. zero feature work for counterpart; medium for exact stream mode. Current complete monthly grid fits existing aggregation exactly. Exact wiggle requires offsets/order and smooth-path hit testing, not merely a display select. Maintenance: Offsets depend on whole stack and filter population; user must not mistake vertical baseline displacement for actual value.

**Specific seams:**

- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx`: packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx:stacked display/advanced order/baseline controls
- `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts`: packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts:282-308 stack bounds, 396-416 path generation, timeAreaAt464-479
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx`: packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx:filled paths and point/area inspection
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesTraceBody.tsx`: packages/explorEDA/src/components/charts/LineChart/TimeSeriesTraceBody.tsx:offset plus lower series provenance
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts`: packages/explorEDA/src/components/charts/Composition/resolveUnit.ts:streamOffsets3015-3044 as narrow reusable helper

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** No percent normalization or arbitrary x aggregation folded into this option; repeated-view review handles numeric/percent area separately.

**Dependencies and related slices:** None for current built-in counterpart; Shared stable series-order helper if exact stream mode proceeds; Only the unemployment stacked-area counterpart proof from REC-01 gates consideration of the later wiggle mode; unrelated catalogue corrections are not prerequisites.

**Strongest alternatives:** Recommended smaller alternative: zero-baseline stacked area with exact period/series traces.; Composition remains suitable to teach smooth/wiggle layout.; Rejected: independent new Stream chart type or implementing exact appearance before validating utility.

**Try → Observe → Decide:** **Try:** Compare all 14×122 period values/totals and selected source rows using current stacked area; only then compare wiggle usefulness. **Observe:** Amount is summed, rates are not; invalid/absent states and baseline contributors remain traceable; exact stream offset does not alter per-series amounts. **Decide:** Stop after counterpart if it serves the task. Reject smooth stream mode if area hit testing chooses a different band than the painted path.

**Uncertainty:** Explicit total-based stack order and smooth edge labels affect presentation, not the verified current analytical parity.

### REC-22 — Bulk record labels as an optional shortcut to existing Notes

**Proposal status:** optional-discoverability. **Examples:** income-life, driving-shifts, co2-swarm.

If repeated callout authoring is burdensome, add a bounded Label selected/listed records shortcut that creates/edits stable-key Notes callouts or a minimal data label setting. Keep twelve manual Country callouts a valid current route; do not block the built-in counterpart.

**Benefit and cost:** Reduces repetitive label work without duplicating Notes, inferring a new chart type or claiming current absence of labels. small for generating bounded existing callouts; medium if new dynamic label rules. Existing annotation type, projection, persistence and individual position controls already work. Dynamic sampling/collision behavior is separate. Maintenance: Stable record keys must survive row replacement; large label lists need a clear cap/overflow indication and keyboard trace association.

**Specific seams:**

- `packages/explorEDA/src/components/settings/annotations/AnnotationsSettingsTab.tsx`: packages/explorEDA/src/components/settings/annotations/AnnotationsSettingsTab.tsx:existing add/create callout flow
- `packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx`: packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx:record key field/value277-299
- `packages/explorEDA/src/lib/annotations/types.ts`: packages/explorEDA/src/lib/annotations/types.ts:RecordAttachment and validate/resolve stable-key behavior
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx`: packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx:annotationFrame112-145; AnnotationLayer labels

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** Selected/listed stable records only initially; no arbitrary text transforms, label solver or general annotation replacement.

**Dependencies and related slices:** Existing Notes and generic persistence; REC-02 only for sampled ordered labels

**Strongest alternatives:** Recommended immediate route: twelve keyed Notes callouts, no feature work.; If broad dynamic point labels are needed by REC-02, integrate there instead of inventing a second parallel label system.

**Try → Observe → Decide:** **Try:** Create the twelve income labels using public Notes, then compare author effort with a bulk shortcut; reorder rows and filter Region. **Observe:** Labels stay attached to Country keys and filtered/missing keys report correct status. **Decide:** Do not build a separate label model unless the shortcut saves meaningful authoring effort; reject any implementation that persists ephemeral source indices.

**Uncertainty:** Bulk callout creation may be enough; layout automation is not necessary to establish current income-life parity.

### REC-23 — Fit-aware labels and explicit order for series Bar

**Proposal status:** optional. **Examples:** media-deaths, du-bois-income.

Optionally add internal series/value/share labels when segments have space and a stable declared series order. Preserve the existing percent Bar analytical path; this is presentation/readability polish, not a prerequisite to replace media-deaths as a required composition workflow.

**Benefit and cost:** Improves labeled percent-stack output while preserving current public behavior and the four-source comparison. small-to-medium. Labels require fit/collision/contrast checks; percentages and source populations already exist. Declared order must remain stable as categories are filtered. Maintenance: Low if confined to segment text and a source category sequence.

**Specific seams:**

- `packages/explorEDA/src/components/charts/BarChart/definition.ts` — BarChartSettings (10–20): Add only bounded label/order preferences if user-facing proof requires them.
- `packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx` — BarChartSettingsPanel (59–153): Reveal segment labels under stacked/100% display; keep group, measure and split defaults simple.
- `packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts` — planSeriesBars (77–183;273–287): Plan labels from exact segment measures/shares; preserve current denominator/source trace and validate series order against source categories.
- `packages/explorEDA/src/components/charts/BarChart/SeriesBarChart.tsx` — SeriesBarChart (256–351): Render labels only where they fit, keeping rectangles as the same selection/keyboard/trace targets and maintaining readable contrast.
- `packages/explorEDA/src/utils/saveDataUtils.ts` — isChart (635–719): Validate only the new chart options and nested enum/numeric settings at the existing reader; do not invent a migration or parallel version.
- `packages/explorEDA/src/lib/dsl/settingKeys.ts` — CHART_SETTING_KEYS (415–486): Add any actual new chart setting keys to the public Dashboard text whitelist; inherited fields alone do not expose behavior.
- `packages/explorEDA/src/lib/dsl/compile.ts` — chart setting path validation (1882–1950): Honor the existing allowed-path validation for newly exposed settings.
- `packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts` — useChartEdit (12–61): Apply through the current live edit/hold flow so each completed gesture has ordinary undo semantics.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Dependencies and related slices:** No dependency for media-deaths analytical parity; Existing percent Bar and contributor trace

**Strongest alternatives:** Option: Current legend and hover/focus readout Decision: Already sufficient for the analytical verdict and should be the first counterpart.; Option: Separate authored composition Decision: Keep for the exact offset Deaths column/article label placement.

**Try → Observe → Decide:** **Try:** Show all 15 causes in four source columns at ordinary dashboard widths, activate a thin segment and inspect the same numerator/denominator before and after enabling labels. **Observe:** No hidden segment, overlap or changed source target; labels agree with current counts/shares and suppressed labels remain available via accessible readout. **Decide:** Ship only if clearer than the current legend/readout. If 15 labels cannot remain readable, keep the built-in analytical route and composition for exact editorial labeling.

**Uncertainty:** Actual text fit needs a rendered proof; no baseline deficiency in percent normalization is claimed.

### REC-24 — Treat ordinary-chart report export as a separate adoption gate

**Proposal status:** recommended-scoped-proof. **Examples:** message-log, driving-shifts, tech-sparklines, forecast-fan, time-use, media-deaths, measles, causes-by-age, consumer-confidence, pew-meaning, income-life, covid-tiles, covid-compare, elections, lincoln-ridgeline, climate-ridgeline, banana-yields, yield-gap, middle-class-jobs, du-bois-income, tax-slope, titanic-waffle, unemployment-stream, population-pyramid, gdp-bump, scotus-timeline, stocks-horizon, co2-swarm, titanic-mosaic.

Define a small ordinary-chart image-output contract and prove it on one accepted counterpart before claiming replacement of a composition report image. Reuse the useful font-ready rasterization and overlay-exclusion approach where compatible, but account for ordinary titles, notes, legends and facet pages explicitly. Retain composition's current Copy PNG path until the intended report output is preserved.

**Benefit and cost:** Prevents analytical counterparts from silently losing the source graphic's practical output context. Keeps the initial capability roadmap separate from a broader export project. medium for one clearly scoped SVG-backed chart; potentially large for all chart/facet/HTML layouts. Titles, notes, legends, clipping, dimensions, fonts and multi-page facet behavior live outside a simple plot clone. Browser clipboard/rasterization must be observed. Maintenance: Output must stay aligned with visible marks, saved scale policies, labels and selected populations. Keep supported export scope explicit.

**Specific seams:**

- `packages/explorEDA/src/components/charts/Composition/compositionOutput.ts` — artboardMarkup; artboardPng; copyArtboardPng: Use as evidence of the existing output contract and a possible small rasterization helper source; do not assume ordinary DOM/layout is an artboard.
- `packages/explorEDA/src/components/charts/Composition/compositionOutput.test.tsx` — markup export assertions: Keep existing overlay/dimension proof and add a real browser output acceptance case only for the chosen ordinary output scope.
- `packages/explorEDA/src/components/charts/BaseChart.tsx` — BaseChart: Identify the drawn plot/axes/annotation surface as one input, not the whole report; ordinary surrounding labels and all requested facet pages must be included by an explicit output adapter.
- `packages/explorEDA/src/components/charts/FacetRelated/facetLayout.ts` — grid/wrap paging: Decide and disclose current page versus all panels for export; do not accidentally rasterize only the viewport.
- `docs/intent/reference-marks/implementation-plan.md` — M5 partial acceptance: Reconcile the existing documented ordinary-export gap after a concrete output proof succeeds.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** Not a prerequisite for moving an already-built-in analytical tutorial.; Not permission to weaken source notes, denominator context or authored output silently.

**Dependencies and related slices:** At least one analytically accepted counterpart; explicit exported content and dimensions

**Strongest alternatives:** Proposal: Capture a dashboard viewport screenshot Decision: Useful for review, but insufficient evidence of a complete standalone report image.; Proposal: Promise generic SVG/PDF/PPTX output with every built-in change Decision: Rejected for this review; the baseline demonstrates a specific PNG path and does not establish those formats.; Proposal: Keep composition for authored output while improving ordinary analytical views Decision: Recommended smaller interim route.

**Try → Observe → Decide:** **Try:** Render and copy one counterpart containing a title, subtitle, note, keyed callout, legend, clipped view and multiple intended facets at a saved size in a supported browser. **Observe:** The resulting PNG contains all intended context and panels, correct fonts/clipping/scale meanings, no editing overlays and the declared dimensions. Confirm the clipboard operation itself, not merely an SVG string. **Decide:** Claim output parity only for the scope that passes. If ordinary chrome or full facets cannot be included predictably, retain composition's report path and record the limitation.

**Uncertainty:** No PNG or clipboard operation ran in this source review.; The exact ordinary output adapter and supported scope should be selected by a first implementation proof; no new file or API is asserted to exist.

### REC-25 — Reject a universal composition-backed built-in engine

**Proposal status:** rejected. **Examples:** message-log, driving-shifts, forecast-fan, time-use, measles, consumer-confidence, pew-meaning, covid-compare, lincoln-ridgeline, climate-ridgeline, banana-yields.

Do not compile every built-in to composition or wrap arbitrary composition definitions behind ordinary chart controls. Reuse only small numerical/layout helpers with explicit source-row outputs, and retain composition as the advanced route for genuinely independent frames and arrangements.

**Benefit and cost:** Direct extensions fit the personal React/TypeScript project and preserve existing chart contracts. The inventory does not require a broad engine migration. large and crosscutting for the rejected approach. It would reconcile different population, mark selection, source trace, axis, annotation, editing and serialization semantics across all built-ins. Maintenance: A hidden second editing model would increase debugging and saved-state obligations while obscuring the simple chart UI.

**Specific seams:**

- `packages/explorEDA/src/charts/registry.ts` — chartRegistry: Keep direct chart definitions and their own settings/filter contracts; no registry-wide conversion layer is recommended.
- `packages/explorEDA/src/components/charts/Composition/resolveComposition.ts` — resolveComposition: Retain as the composition scene resolver rather than making every ordinary chart depend on authored scene state.
- `packages/explorEDA/src/components/charts/Composition/CompositionChart.tsx` — viewClick; commit: Recognize different repeat-selection and editing contracts; a wrapper would have to resolve them, not merely render the same SVG.
- `packages/explorEDA/src/components/charts/Composition/ordering.ts` — orderedRows: Candidate for narrow pure reuse where independently ordered source rows are needed.
- `packages/explorEDA/src/components/charts/Composition/labelDodge.ts` — label layout helper: Candidate for narrow pure reuse with declared overflow behavior, not a new grammar.
- `packages/explorEDA/src/components/charts/LineChart/definition.ts` — LineChartSettings (1–140): Current Line has no independent inset/benchmark population contract; do not smuggle one through generic unknown settings.
- `packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx` — TimeSeriesChart (68–97): State facets restrict the data population, so national context needs explicit scoped preparation before any inset idea.
- `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — numeric frame domains; drawFrame; pathNodes (617–665;1037–1063;3301–3426): The delivered design uses independent windows, scale scopes and repeat/composition populations. These are substantive composition semantics.
- `packages/explorEDA/src/components/charts/Composition/insets.test.ts` — inset tests (1–221): Source tests cover different windows and skipped benchmark repeats; they do not prove all dashboard filters preserve the benchmark.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** No migrations, parallel settings versions, universal grammar or compatibility framework proposed.

**Dependencies and related slices:** Trajectory focus/context Line proposal; Explicit benchmark filter-follow/ignore policy before nesting anything

**Strongest alternatives:** Proposal: Targeted settings and coherent named modes Decision: Recommended.; Proposal: Pure helpers for ordered runs, density, collision, cell packing or label placement Decision: Recommended when multiple actual callers share the same numerical/provenance contract.; Proposal: A clearly labeled advanced composition template Decision: Appropriate for covid-compare or mixed authored report arrangements; it does not become an ordinary built-in by hiding the editor.; Option: Focus/benchmark Line without an inset Decision: Recommended smaller addition via the trajectory review; explicit foreground/reference population is valuable independently.; Option: Two linked recent/full-history Line views Decision: Try first, while acknowledging the lost simultaneous in-panel comparisons.; Option: Expose composition JSON beneath a preset Decision: Rejected as a normal authoring route: it preserves the advanced burden under a different name.

**Try → Observe → Decide:** **Try:** Before reopening the rejected approach, compare a narrow helper or direct extension with a composition wrapper on driving and a percent Bar, including public authoring, exact source selection, Notes, filters, save/text and cancel/undo. **Observe:** Measure which route actually reduces total logic without another settings representation, different selection behavior or loss of trace provenance. **Decide:** Reconsider only if the wrapper demonstrably satisfies those contracts with less ongoing complexity. This review's source evidence favors direct extensions; no such prototype was run.

**Dependent or corrective slice — General inset or composition-backed chart wrapper (deferred for insets; rejected as a general wrapper):** Keep covid-compare in composition. Improve a bounded focus/benchmark Line first; do not create a wrapper exposing arbitrary composition frames/populations as advanced built-in settings. Separate recent and full-history linked Lines are the smaller alternative to test.

Cost: Relative effort: large for a general wrapper; medium for a separately bounded benchmark Line Reasons: Each inset needs independent source population, scales, clipping, focus/trace and output coordinates.; One nested-frame example is insufficient evidence for a universal built-in wrapper. Maintenance: High if it duplicates the composition grammar; composition already owns these semantics.

Try: Compare a bounded focus/benchmark Line plus a full-history companion with the six inset panels for recent divergence and historical magnitude tasks. Test a filter excluding the US row population. Observe: Whether separate views preserve the task; whether context follows filters as declared; exact state/nation trace populations and honest local date limits. Decide: Keep composition if two windows within every state remain essential. Only consider a fixed inset preset if a repeated demand survives the smaller test; do not implement a generic frame wrapper.

**Uncertainty:** A narrowly shared helper could still reduce duplication; rejecting the universal layer does not reject shared mathematics.; The current composition benchmark reads live rows, not an always-unfiltered population. A future persistent benchmark policy would be a product change.

### REC-26 — Reject redundant annotation systems and one chart type per example

**Proposal status:** rejected. **Examples:** driving-shifts, forecast-fan, pew-meaning, income-life, lincoln-ridgeline, climate-ridgeline, middle-class-jobs, tax-slope, population-pyramid, co2-swarm, titanic-mosaic.

Do not introduce a second notes/bands system, require raw composition JSON for ordinary operations, or register a new top-level chart for every example. Reuse actual Notes capabilities and choose an existing chart mode whenever its numerical and interaction contract remains clear.

**Benefit and cost:** Keeps the initial chart menu and editor comprehensible, uses delivered features accurately and prevents parallel persistence/trace systems. unnecessary medium-to-large duplication for the rejected approaches. Additional annotations or per-example chart families repeat settings, validation, tracing and save/text integration that already exist. Maintenance: Duplicated behavior would drift; raw JSON authoring would transfer implementation complexity to ordinary users.

**Specific seams:**

- `packages/explorEDA/src/lib/annotations/types.ts` — ChartAnnotation; chartDrawsAnnotations: Extend the existing collection/projection contract only where a new renderer has meaningful annotation subjects.
- `packages/explorEDA/src/components/settings/annotations/AnnotationsSettingsTab.tsx` — AnnotationsSettingsTab: Reuse public record callout and supplied interval authoring; improve discoverability rather than duplicate controls.
- `packages/explorEDA/src/lib/annotations/resolve.ts` — projectAnnotations: Repair interval runs and provenance in the existing path instead of adding a competing band resolver.
- `packages/explorEDA/src/components/ChartSettingsContent.tsx` — contextual tabs: Keep ordinary operations in typed contextual settings, with progressively revealed relevant options.
- `packages/explorEDA/src/charts/registerAllCharts.ts` — registerAllCharts: New registration requires a coherent family whose contract cannot sensibly fit an existing entry; JSON size and visual labels are not sufficient reasons.

Each implemented slice also uses the shared validation, Dashboard text, persistence, axis/accessibility and edit contracts above.

**Cut lines:** Seven examples in the new-built-in-family category share five specialist mode/family contracts; the category is not a recommendation for seven menu entries.

**Strongest alternatives:** Proposal: Existing keyed Notes for selected country records Decision: Available today and preferred for income-life and CO2 labels.; Proposal: A bounded Paired dots, Mirror, Mosaic or Ridgeline display in the relevant family Decision: Preferred when the proposed behavior is justified and its source proof passes.; Proposal: A narrow interval-lane family with explicit start/end semantics Decision: Reasonable specialist family because current point, duration and line views lose occupancy intervals.

**Try → Observe → Decide:** **Try:** Demonstrate the existing keyed callout and interval editor, then sketch the smallest contextual mode controls needed for one paired or mirrored example. **Observe:** Users can author the ordinary task without free-form code or manual marks; every added control corresponds to a real missing behavior rather than an already-delivered field. **Decide:** Add a separate family or representation only if the current model cannot preserve the essential semantics cleanly. Do not duplicate Notes merely because an old intent brief describes it as absent.

**Uncertainty:** Final mode names are a product decision for Codex's review; no new syntax is implemented here.


The recommendation JSON is the authoritative structured list. It includes affected examples, direct code seams, relative effort and maintenance reasons, alternatives, dependencies, uncertainty, and a falsifiable Try → Observe → Decide proof. Each proposed behavior also inherits the concrete save/text/validation/filter/trace requirements above. Relative effort describes source scope, not elapsed-time estimates.

## Progressive settings proposal

### A concrete authoring path

1. **Add a familiar chart.** Keep the initial Scatter, Line, Bar, Heatmap and Distribution flows small: choose the necessary fields, then display the ordinary default. Do not expose order, baseline, collision, normalization and layout controls simultaneously. Existing size, color, logarithmic axes, percent series, Notes and facet ordering should become easier to find through examples and accurate help before new controls are introduced.
2. **Choose a meaningful operation in Data.** A user who wants a trajectory chooses “Connect observations” in Scatter, then sees Order by and optional Group by. A user who wants a population comparison chooses “Mirrored bars” in Bar. A user who wants distributions chooses “Ridgeline” within Distribution. A named mode supplies coherent defaults and constraints; it need not become a new item in the Add Chart menu.
3. **Reveal only relevant advanced controls.** Open a local foldout for missing-row treatment, label sampling, collision bounds, relative baseline, or density bandwidth only after that behavior is enabled. Default straight paths remain understandable. A pair-specific mode asks for the two endpoint values and difference direction. It must not require users to construct joins or arbitrary marks.
4. **Use the existing tabs for their established jobs.** Axes handles eligible scales and view limits; Facets keeps its existing grouping and manual order controls, with proposed panel density and shared/per-panel scale controls; Labels keeps titles and gains bounded endpoint/statistic labels where useful; Notes handles keyed callouts, guides and supplied intervals; Filters distinguishes local scope from linked selection. Spacing remains spacing. These are contextual additions to `ChartSettingsContent`, whose actual tabs are Data/Compose, Fit when relevant, Facets, Axes, Filters, Labels, Notes and Spacing. A universal new Advanced tab is unnecessary. (`packages/explorEDA/src/components/ChartSettingsContent.tsx:68–95`; `packages/explorEDA/src/components/settings/FacetSettingsTab.tsx`, under `packages/explorEDA/src/`.)
5. **Explain a concrete boundary to composition.** When a request needs a separately scoped benchmark, independently zoomed inset, geography-preserving panel coordinates or a mixed chart table, say which invariant the built-in preserves and which requested feature exceeds it. Offer the useful built-in plus an advanced composition example. Do not force raw composition JSON, free-form code, manual glyph construction, or a lossy automatic conversion as the ordinary next step.

For example, the driving flow can be **Add Scatter → Miles / Gas → Connect observations → Order by Year → Labels every fourth year → Notes**. The fan flow can be **Add Line → numeric period / central measure → Facet by measure → per-panel y scale → Notes → Interval → lower / upper / meaning**, repeated for supplied bands. That second flow must remain pending until the interval domain/run/trace deficiencies are repaired; showing an existing button is not proof of a complete forecast display.

The following illustrates **proposed setting shapes only**; these are not current accepted API or Dashboard text syntax:

```ts
// Proposal: a bounded addition to Scatter's existing settings.
connections: {
  enabled: true,
  orderField: "Year",
  groupField: "Country", // omit for one trajectory
  interpolation: "linear",
  missing: "break"
}

// Proposal: Heatmap retains its ordinary field/measure selection.
columns: { kind: "date", interval: "month", order: "ascending" },
categoryLimits: { rows: 100, columns: 120 },
valueDomain: { population: "all" }
```

Codex should settle names at the existing type/validator seams; the recommendation concerns behavior, not a new schema. A first Scatter proof needs only straight connections ordered by one field. Pair modes, smoothing, rank calculations, collision placement and all-series reference contexts should not be prerequisites for shipping that first useful step.

### Placement and interaction details

- **Scatter:** place connections and observation layout alongside point settings. Pair endpoints, jitter off, category order and both-end labels appear only for paired dots. Swarm exposes a meaningful overlap/overflow policy and keeps numeric x positions true; it cannot solve crowding by changing measured values.
- **Line:** preserve the visible distinction between raw observations and calendar aggregation. Long-form grouping and series identity belong with data preparation. Normalization belongs with stacking and its denominator explanation. Supplied bounds stay in Notes. Source-aware endpoint/statistic labels can support compact panels without a table framework.
- **Bar:** keep existing grouped/stacked/percent controls. Reveal horizontal orientation where supported, mirror one of two explicitly selected series only in the constrained mirror mode, and offer variable-width mosaic only for nonnegative categorical totals. Explain the denominator in the chart and trace.
- **Heatmap:** row/column sequence controls sit next to their fields. Date binning appears only for a date dimension. Independent row/column caps show truncation rather than silently omit values. Numeric ramp controls include their transform and fixed/source bounds, while missing versus absent cells remain distinguishable.
- **Distribution and specialist modes:** keep the ordinary Box/Violin entry; Ridgeline activates common-grid density and a field-unit bandwidth. A unit-count display must explain what one glyph counts. Timeline and rank modes disclose their interval-end and tie rules. Horizon remains deferred until its baseline meaning is correct.

Use the existing compact form conventions and shared controls: semantic labels, roughly 100-pixel label columns, 32-pixel main controls and 28-pixel compact controls where the current UI specifies them. Use the shared tooltip primitive rather than native `title` attributes, and retain accessible descriptions and keyboard access. `AGENTS.md` and `docs/ui-defaults.md` differ on when a tooltip should open on focus; the actual primitive is not included in this packet, so this review does not certify its trigger behavior. Resolve that narrow convention during integration rather than inventing a new tooltip system. Ordinary settings remain live, resettable, saveable and undoable. (`AGENTS.md`; `docs/ui-defaults.md`; `packages/explorEDA/src/components/ChartSettingsContent.tsx:28–63,98–132`; `packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts`.)

### Architecture alternatives and the strongest smaller option

| Approach | Appropriate use | Decision and boundary |
|---|---|---|
| Targeted settings | Ordered connections, interval repair, date sequences, orientation, compact facets | Preferred when the chart's population, geometry and selection contract remain recognizable. Each still needs planner and interaction work. |
| Named mode or preset | Paired dots, mirrored bars, variable-width mosaic, ridgeline, unit count, ranks | Preferred when a few coordinated settings or a distinct numerical display should be learnable as one operation. A preset configures an ordinary chart; it does not conceal an artboard. |
| New registered family | A coherent interval/timeline model, or a specialist mode whose settings/selection cannot be represented clearly in an existing entry | Conditional. Require a second useful case or a convincing independent task and an explicit trace/selection contract. Seven examples classified as new-family do not mean seven new top-level menu entries. |
| Wrapper around composition | An exact authored report template with independent frames | Keep only as an explicitly advanced composition/template route. Reject it as the ordinary built-in implementation: it inherits artboard selection, persistence and layout semantics while disguising the real editing model. |
| Existing linked views | Current Scatter, percent Bar, stacked-area Line; Pivot + Heatmap + Line for banana | The strongest smaller alternative and the first proof. Preserve essential comparisons and contributor evidence; disclose when the user loses one aligned graphic or report export. |

Reuse small, pure helpers for ordering, KDE, cell packing, collision placement and label avoidance after tests establish their inputs and output provenance. Do not compile all built-ins into composition, introduce a universal chart grammar, maintain a second settings version, migrate stored dashboards for optional fields, or create one chart type per example. Those alternatives impose broad interaction and maintenance work without evidence that this inventory requires it.

## Catalogue and teaching decisions

The per-example `catalog_action` fields are proposals, not deletion instructions. All 29 source examples should remain preserved for Codex's review. Make current built-in counterparts the primary learning path for income-life, media-deaths, Du Bois and unemployment. Add counterparts for each accepted extension or specialist mode only after its analytical proof passes. Retain advanced composition examples where they demonstrate actual independent frames, report output, tile placement, mixed cells, or reusable composition operations.

Avoid teaching incidental baseline errors as intentional design. In particular: the measles companion named “Average rate by year” uses raw Year/Rate observations; the COVID comparison's “six states” companion currently includes the US record in its average; population companion row charts count prepared rows despite “People” wording; and the horizon's first-live-record baseline can invalidate a fixed January 2000 caption. The measles CSV's `Status=absent` row also contains a row with a blank rate; the strip mark does not consume that status, so the distinction between a real absent combination and a present missing measure must be proved at the loader/renderer boundary. These are source findings, not browser-observed screenshots. Their exact evidence and corrective catalogue proposals appear in the detailed reviews.

The composition gallery can stay useful without being the gateway for ordinary chart work. Link “Build this with charts” from eligible examples, show the meaningful capability difference, and retain “Explore the composition” for authored layouts. Retire or de-emphasize only a redundant teaching route after a counterpart exists; no recommendation here authorizes removing its source or data.

## Proof sequence: Try → Observe → Decide

These are **proposed future proofs**, not work executed in this research packet. Keep the first sequence small; expand only to resolve a failed invariant or the next accepted capability.

### Step 0 — demonstrate the existing alternative

**Try:** create income-life with public Scatter settings (income x on true log, life expectancy y, population size, region color, keyed country Notes), and media-deaths with sum-of-Count percent series Bar. Separately demonstrate unemployment as monthly sum stacked area and Du Bois as sum-of-Share percent bars. Save, reload and export/import Dashboard text in a runnable checkout.

**Observe:** the same source observations, category shares and denominator contributors remain inspectable. Filtering changes the intended live population without renaming fields or losing keys. Confirm callouts point to the named records and that zero/nonpositive values are explained by the actual scale. Record exact-artboard and PNG gaps separately.

**Decide:** move the primary analytical tutorials only if those public controls suffice. If a material comparison or source trace is missing, reopen that specific verdict; do not fund a new general framework to fix a catalogue problem.

### Step 1 — the first new capability: ordered Scatter connections

**Try:** add only straight, source-aware, explicitly ordered connections and consistent point/segment trace access. Use the 55-row driving dataset, shuffled input, an invalid intermediate coordinate, linked year filtering and an x view limit. Preserve the unconnected Scatter default.

**Observe:** the plotted path follows Year, including movement backward along x; invalid input breaks runs; filters have a declared effect on continuity; view clipping does not mutate filters; segment and endpoint traces recover exact rows; pointer and keyboard reach the same evidence. Commit and cancel a settings edit, then check one undo/redo and save/Dashboard text round trips.

**Decide:** accept the slice only if that behavior is correct without changing unrelated chart contracts. Reject an x-sorted Line substitution or IDs reconstructed from pixel positions. Once accepted, add grouped connections and both-end labels for tax/jobs, then prove Pew's explicit pairing, absent endpoint and difference direction. Jobs can use the current diverging numerical color editor, fixed axis bounds and manually ordered facet chips; its new path needs a declared color rule, while field-driven facet ordering and supplied summary labels are optional conveniences.

### Step 2 — repair an existing capability before expanding it

**Try:** use forecast-fan's supplied lower/upper fields in ordinary Line Notes. Include an outlying bound, a null interval row, a reversed pair, duplicate order values and the two differently scaled measures.

**Observe:** valid bounds influence the intended domain; missing intervals create separate runs; reversed/invalid inputs have visible, traceable treatment; no band is mistaken for a fitted confidence interval; each bound and central observation remains tied to its source row. Shared versus per-panel y scale is explicit.

**Decide:** accept a repaired interval path and a counterpart only after these checks. If the existing Notes representation cannot express runs and provenance cleanly, extend that representation directly; do not start an unrelated bands engine.

### Step 3 — complete dense Heatmap sequences

**Try:** render all 72 message months and 85 measles years with stable ordered rows/columns. Include a genuinely absent combination, a present null, a zero and a filtered extreme. Test date bins independently of labels and retain exact cell contributors.

**Observe:** no hidden 60-category truncation; missing and absent remain different; color scale meaning stays declared under filtering; the vaccine guide projects to the correct year boundary if supported; keyboard navigation and readable value access survive density. A compact layout can scroll or page honestly instead of shrinking unreadably.

**Decide:** accept the sequence/cap/order slice before optional transformed ramps or annotation projection. If a full 51 × 85 matrix cannot stay usable, retain an honest panel/window interaction and the composition report; do not claim pixel parity from a partial viewport.

### Step 4 — bounded expansion and specialist cut lines

Proceed with compact facets/shared scales and the narrowly dependent Line, Bar and Scatter modes. Use one fixture that combines source identity, a missing value, a filter and a meaningful derived denominator, plus one public authoring/save flow for each new interaction contract. For ridgelines, distinguish common-density peaks from per-group normalization; for unit counts, account for every row exactly once; for mirror/mosaic, verify positive source values and both denominators; for timeline, verify open-end scope without consulting today's clock; for rank, verify ties and a filtered cohort without silently changing the ranking basis.

Defer horizon folding until a non-folded relative-change Line has an explicit stable baseline and missing-baseline behavior. Defer geographic tile facets until compact ordinary facets succeed and the layout is reusable across Line and Heatmap with correct per-panel domains. Defer a rich chart table until Pivot + Heatmap + Line is proven insufficient for the actual banana task. Streamgraph wiggle/smoothing remains optional presentation work after the current stacked-area alternative is verified. Each deferred recommendation includes a condition that would reopen it.

### Integration commands and status

In an actual checkout with dependencies, Codex can use the prompt's targeted commands: demo coverage and Dashboard text tests, affected Composition tests, `pnpm --filter exploreda check-types`, `pnpm --filter demo docs:check`, and `pnpm check:ui`. A browser proof is required for pointer/keyboard parity, live edit/undo, visual scale/label behavior and Copy PNG. No installation, dev server or product test command was run here. Running the entire test suite or creating tests that merely restate setting shapes is not proposed; add the few behavioral proofs needed for each accepted slice.

## Executed research checks, limits, and handoff

**Executed:** packet extraction; exact 626-file manifest/hash/size verification; registry, dashboard, coverage, alias and additional-tab reconciliation; implementation/settings/planner/renderer/trace/save/text/test-source inspection; prepared CSV profiling and targeted numerical checks; and deliverable validation recorded in `sources.json` and `manifest.json`. The isolated dashboard-constant evaluation is explicitly an inventory check. Test files were read for intended behavior only.

**Not executed:** dependency installation, application rendering, live-site verification, product unit/integration/type/docs/UI tests, runtime linked-filter or undo checks, performance benchmarks, clipboard/export acceptance, or original external dataset preparation. The packet excludes dependencies/build output and does not include the complete demo history implementation or dataset preparation pipeline. Those limitations affect runtime and provenance acceptance; none prevents the source-based comparison because every required design and material chart implementation is present.

**No material access blocker remains for this research review.** Uncertainties are recorded per example and recommendation. Codex should preserve these originals under the location specified in the attached prompt, reconcile them through Software Design Sleuth, and integrate separately. No repository file, issue, branch, commit, push or PR was created or modified by this review.
