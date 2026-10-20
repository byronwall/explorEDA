# Independent evidence review

Reviewed 2026-10-20. Baseline and refreshed origin/main are 9b16d78e3ed0742ed4d5858c1939fec9e758b510. Product source matches that revision. The research branch adds documentation only.

## Repository checks

| Claim                                        | Direct evidence and limit                                                                                                                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Row formulas are row-scoped                  | packages/explorEDA/src/lib/calculations/functions/registry.ts declares within-row sum/avg/count. Calculator.ts evaluates row variables, guards zero division and rejects nonfinite results. This does not compose dataset totals.                                               |
| Grouped totals preserve contributors         | packages/explorEDA/src/lib/aggregates.ts: summarizeGroup records included/excluded source members. poolAggregateRows rebuilds source inputs and reduces again. It reevaluates IDs; it does not average grouped averages.                                                        |
| Identity conflicts are explicit              | summarizeGroup compares each entity's measure with Object.is. Missing IDs are excluded. Conflicts make the result unavailable. No rate-pair policy follows from this one-field contract.                                                                                        |
| Cards have a different reuse boundary        | MetricCard/definition.ts has count/sum/average, measure and entity fields. metricCardPlan.ts reduces supplied IDs and computes same-reducer baseline share/delta. It has no aggregateId or dual-total ratio definition.                                                         |
| Bar normalization has a category denominator | BarChart/seriesBarPlan.ts computes category series totals and blocks stacked averages or negative percent inputs. It does not infer a scientific exposure denominator.                                                                                                          |
| Global fallback needs qualification          | DataLayerProvider.tsx getAggregateResult defaults to global filtered IDs only when sourceIds is absent. BarChart.tsx supplies liveIds explicitly and supplies chart population IDs for its domain. Pro lacked this caller; its caution is not a demonstrated Bar filter defect. |
| Card baseline retains local restrictions     | MetricCard.tsx uses crossfilter.getChartFilteredRowIds(settings) for live IDs and useGetAllIds(settings) for baseline. useGetLiveData.tsx and chartPopulation.ts retain localFilters in all IDs. Runtime equivalence across consumers remains untested.                         |
| Numeric indicators need explicit types       | valueParsing.ts excludes booleans, blanks and nonfinite values from numeric measurements. Numeric strings can parse; the synthetic typed-number policy is stricter and task-specific. Raw identity equality can still distinguish number/text inputs.                           |
| Richer Pivot reducers do not compose metrics | PivotTable/definition.ts and utils/calculations.ts reduce one field per value setting. Composition/calculations.ts has a separate population/filter contract.                                                                                                                   |
| Flights are a comparator, not rate demand    | Existing carriers.eda has count/median/mean and a source table. No requested reusable rate appears. Pro did not inspect CSVs. Local data were not used to validate its airline narrative or invented threshold.                                                                 |

All 35 tracked packet entries authenticate against baseline Git objects. Pro's 38 receipts match the local source manifest. The three additions are the prompt, queue and identified historical summary. Post-upload formatting of the local queue does not change the uploaded receipt. See [collection.json](collection.json).

## Current primary sources

These pages were opened independently on 2026-10-20. Their narrow claims support alternatives, not product demand.

- [JMP Summary tables](https://www.jmp.com/support/help/en/19.2/jmp/create-a-summary-table-2.shtml): Group, Weight and Freq roles; default link from summary rows to source rows.
- [JMP summary statistics](https://www.jmp.com/support/help/en/19.2/jmp/explanation-of-summary-statistics.shtml): N counts nonmissing values; Mean and Sum Wgt distinguish weighting and contributors.
- [DAX CALCULATE](https://learn.microsoft.com/en-us/dax/calculate-function-dax): Remarks and channel-share example explicitly change denominator filter context.
- [DAX DIVIDE](https://learn.microsoft.com/en-us/dax/divide-function-dax): zero division returns blank by default or a constant alternate result. This does not choose explorEDA's domain policy.
- [DuckDB aggregate functions](https://duckdb.org/docs/current/sql/functions/aggregates): FILTER, null handling, empty aggregates and weighted_avg show an upstream preparation pattern. No DuckDB engine ran locally.

## Executed evidence versus proposed proof

Archive safety/integrity and source authentication are collection checks. Twelve Fraction arithmetic anchors are independent local checks in [fixture-audit.json](fixture-audit.json). Existing reducer/card/bar tests are baseline checks. Pro's 47 arithmetic/SQLite assertions are reported research evidence, not local application tests.

No new user task, formula-entry proof, chart flow, export/history/restore journey or performance trial ran. Do not promote the synthetic task or proposed docs/example into an implemented feature. No material follow-up is needed to preserve this bounded result.

## Delivery and approval

Pro reports an automatic-review rejection when trying to save outputs to ChatGPT Library. The stated reason concerned untrusted upload destinations and source-derived content. Local collection did not require that upload. The ZIP downloaded successfully; no rejected Library upload was retried or bypassed. A standalone Download file action opened the raw report instead of saving a file. All requested report bodies and manifest were preserved from the authenticated archive.

Byron renewed explicit download pre-approval in this chat. Both schedules now carry it, including task-related archives, reports, manifests and companion files. They instruct future runs to show that authorization to review and collect without routine confirmation. Tool-enforced boundaries still apply.
