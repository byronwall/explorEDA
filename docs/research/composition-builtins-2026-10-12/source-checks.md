# Evidence and verification

## Scope and collection

Pro reviewed the selected packet at `269485c6c94b411e27f440ea495ef225110c9a84`.
Its complete report, 29 verdicts, 26 recommendations, source ledger, manifest, and ZIP are preserved under [raw research](pro/).
The [collection manifest](pro/collection.json) records retrieval, sizes, hashes, checks, and download limits.

The archive has exactly five root files, no unsafe paths or links, and passes integrity checks.
Every JSON parses. All manifest sizes and available hashes match.
The separate Markdown download is byte-identical to its ZIP member.
Independent JSON downloads were blocked by Chrome at the raw-file destination; their original ZIP members were collected and verified.
No file is missing from the delivered bundle.

All 29 verdict IDs exactly match the local inventory, with no duplicates. All 26 recommendation references resolve.
Codex re-evaluated every dashboard export to check marks, repeats, scale scopes, and companion charts.
All **623 baseline files** in the packet still match the current checkout by SHA-256.
The packet's three local additions are research context; they are not shipped-feature evidence.

## Independent source checks

These are code and data observations. They do not certify the proposed authoring flows or new visual behavior.

| Claim                                              | Evidence checked                                                                                                                                                                                                                                                                                      | Result                                                                                                                             |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Current percent Bar covers media and Du Bois       | [Bar controls](../../../packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx), [series plan](../../../packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts), both CSVs                                                                                           | Sum/100% is public; numerator, denominator, and source parts are retained. Counts fit existing limits.                             |
| Income/life needs no new log or Notes system       | [Scatter axes](../../../packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts), [point plan](../../../packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts), [record editor](../../../packages/explorEDA/src/components/settings/annotations/AnnotationFields.tsx) | True positive-only log axes, population-area bubbles, and stable-key callouts exist.                                               |
| Unemployment can use current stacked area          | [Calendar settings](../../../packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx), [time plan](../../../packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts), CSV                                                                                         | 1,708 unique rows form 14 industries × 122 months. Monthly Sum preserves each amount.                                              |
| Driving needs an independent order field           | [Raw Line](../../../packages/explorEDA/src/components/charts/LineChart/LineChart.tsx), driving definition                                                                                                                                                                                             | Raw Line sorts numeric X and reduces points to coordinates. Driving orders by Year.                                                |
| General point interaction needs work               | [ScatterSvg](../../../packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx)                                                                                                                                                                                                            | Ordinary point keyboard activation is gated on the size plan. New connections must address this explicitly.                        |
| Existing intervals are incomplete                  | [Interval resolver](../../../packages/explorEDA/src/lib/annotations/resolve.ts)                                                                                                                                                                                                                       | Invalid rows are skipped; points retain projected bounds without source IDs or separate runs.                                      |
| Heatmap limits and color policy are real gaps      | [Controls](../../../packages/explorEDA/src/components/charts/Heatmap/HeatmapSettingsPanel.tsx), [planner](../../../packages/explorEDA/src/components/charts/Heatmap/heatmapPlan.ts), [heat scale](../../../packages/explorEDA/src/components/charts/heatScale.ts)                                     | One public maximum of 60 serves both axes. The ramp uses shown values and an automatic sign test.                                  |
| Numerical color controls can be reused             | [Color mathematics](../../../packages/explorEDA/src/lib/colorScaleMath.ts)                                                                                                                                                                                                                            | Bounds, midpoint, square root, and zero-aware log mathematics already exist. Aggregate domains still need chart-specific work.     |
| Current facets cannot automatically retain peers   | [Calendar renderer](../../../packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx), time plan                                                                                                                                                                                       | Both source and live IDs are restricted per facet. Calendar X range comes from live dates.                                         |
| Exact sparklines exceed ordinary calendar limits   | Time plan and `big-tech-prices.csv`                                                                                                                                                                                                                                                                   | Calendar has 2,000-period and 30-series guards. Exact observation mode remains a separate preparation contract.                    |
| Ridgelines need more than rotation                 | [Box calculations](../../../packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts)                                                                                                                                                                                                  | Each KDE uses its own min/max grid and divides by its own peak. Common probability-density heights are absent.                     |
| Measles “absent” is a present row                  | [CSV parser](../../../apps/demo/src/csvParser.ts), [example loader](../../../apps/demo/src/LandingPage.tsx), measles CSV                                                                                                                                                                              | All 4,335 state/year pairs exist. Alaska 2003 has blank Rate and Status=absent. The generic loader has no Status-specific removal. |
| Zero CO2 should not be plotted at a positive floor | Scatter axes; [composition projection](../../../packages/explorEDA/src/components/charts/Composition/resolveUnit.ts); CO2 CSV                                                                                                                                                                         | Naoero and Tuvalu have zero. Scatter excludes them on log X; composition pins values below the domain to its low edge.             |
| SCOTUS open ends are not the clock                 | Composition `spanNodes`; `scotus.csv`                                                                                                                                                                                                                                                                 | Nine blank End values reach the frame edge. The latest source endpoint is 2022-06-30.                                              |
| Horizon baseline can change after filtering        | Composition `horizonValues`                                                                                                                                                                                                                                                                           | The first valid live row supplies the baseline. A zero baseline falls back to absolute difference.                                 |
| COVID companion includes seven groups              | [Dashboard definitions](../../../apps/demo/src/demos/dashboardSettings.ts), `covid-compare.csv`                                                                                                                                                                                                       | The “six states” average has no national-row exclusion. The input contains six states plus United States.                          |

## Arithmetic checks

Media Count totals are 2,308,565 deaths, 19,407 Fox articles, 15,421 New York Times articles, and 11,812 Washington Post articles.
These are separate denominators, not one shared population.
All seven Du Bois classes total 100 across 33 supplied share records.
Titanic has 323/277/709 passengers by class, with 200/119/181 survivors.
These checks used the included CSVs; they do not validate historical source preparation.

The actual yield-gap field is **Yield gap**. Integrated guidance corrects the raw report's shortened **Gap** recipe.
The shared heat-scale file is `components/charts/heatScale.ts`, outside the Heatmap directory.
The generic measles loader check strengthens Pro's qualified inference; rendering that case remains unverified here.

## Executed checks

- Installed the frozen pnpm lockfile with Node 24.21.0 and pnpm 11.9.0. No dependency or lockfile change.
- `pnpm check` passed: UI checks, all builds, library/demo types, 1,206 library tests, and 187 demo tests.
- The demo build also ran 64 content/example tests successfully.
- Archive/hash/JSON checks, inventory equality, dashboard export inspection, and baseline file comparison passed.
- Sleuth validation, local document links, review coverage, and Git whitespace checks are recorded in the run record.

The build reported existing chunk-size warnings. Installation reported the local DSL bin missing before its package build; the build passed.
No tests were added for these documentation-only changes.

## Limits

No proposed counterpart was authored in the browser during this integration. Visual, pointer/keyboard, edit/undo, and PNG proofs remain planned.
Passing existing tests does not prove a new mode, a changed data population, or full presentation parity.
The original dataset preparation pipelines and external historical claims were not audited.
No new external factual assertion determines this shape; recommendations rest on the supplied code and data.

Pro's raw source review and Codex's artifact checks, code checks, and executed tests remain distinct evidence layers.
No material gap requires a follow-up. Open implementation choices have bounded proofs and simpler alternatives in the plan.
