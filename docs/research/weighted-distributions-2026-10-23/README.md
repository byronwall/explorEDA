# Build weighted ECDFs with source evidence

Build a native weighted ECDF, then configurable percentiles, then weighted boxes.
The [implementation plan](../../intent/weighted-distributions/implementation-plan.md) names files, exact fixtures, docs, examples, and acceptance checks.
This is a Methods proposal. No weighted chart behavior ships in this PR.

Topic score: **19/20** — capability 5, Pro advantage 5, buildable result 5, momentum 4.
[Selection and run record](run.md). [Pro conversation](https://chatgpt.com/c/6adb07af-a2d0-83e9-82d2-1c0cd65863bc).
Pro completed after 27m09s. Both downloaded reports were read. No follow-up was needed.
Original downloads remain under ignored tmp/.

## Method and findings

Use normalized nonnegative weights for lower and inclusive upper shares.
Inverse quantiles choose the first positive-support value that reaches the requested cumulative mass.
Exact boundaries choose the lower value. Both tails include tied mass.
Weighted quantile x values stay fixed when direction changes.

This is NumPy's weighted `inverted_cdf` family and R's type 1 convention.
Keep current unweighted box interpolation. For x=[0,10], w=[1,3], Q25 is 0; existing interpolation gives 2.5.
Replicated type 7 gives 7.5. One method cannot promise scale invariance and every interpolation equivalence.
[NumPy quantile](https://numpy.org/doc/stable/reference/generated/numpy.quantile.html),
[R quantile types](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/quantile.html).

Weight is not source-row count. In the exact fixture, [2,4] selects seven records but has four positive contributors.
Their mass is 6/24. An independent peer changes the denominator to 7 without changing those selected records.
Zero and invalid weights remain accessible. All-zero curves have no normalized distribution.
Independent local fraction calculations confirm these memberships, totals, tails, and listed quantiles.

## Local review and dispositions

| ID    | Local disposition | Reason                                                                                                     |
| ----- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| WD-01 | Build             | Add an optional ECDF weight field and unit; defer Pro's interpretation selector.                           |
| WD-02 | Build             | Name inverse-ECDF quantiles and preserve current unweighted interpolation.                                 |
| WD-03 | Build, narrowed   | Scale and compensate sums; mark scaled-underflow results unavailable instead of adding approximate curves. |
| WD-04 | Build             | Show numerator, denominator, zero, excluded, and linked-selected records separately.                       |
| WD-05 | Build             | Rank by mass and pool original records for Other and overall.                                              |
| WD-06 | Build             | Correct fixed Q50/Q90 in M1; add configurable levels in M2.                                                |
| WD-07 | Build later       | Add weighted boxes in M3 with inverse quartiles and observed whiskers.                                     |
| WD-08 | Build, corrected  | Guard calculated reference lines; current bands and regions have fixed numeric bounds.                     |
| WD-09 | Build when needed | Share the local distribution helper when boxes become its second consumer.                                 |
| WD-10 | Explore           | Weighted histogram mass/share/density needs a separate capability design.                                  |
| WD-11 | Explore           | Prepared tables and explicit frequency/type-7 quantiles serve different tradeoffs.                         |
| WD-12 | Defer             | General weighted annotations, violins, and dispersion need distinct method contracts.                      |
| WD-13 | Defer             | Survey inference requires design information beyond a weight column.                                       |
| WD-14 | Avoid             | Row expansion, signed cancellation, probability inversion, and hidden filters change the stated measure.   |
| WD-15 | Avoid             | No universal reducer framework or all-chart weighting sweep.                                               |

## Source checks and limits

Current origin/main remains `6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e` at review.
`Ecdf/ecdfPlan.ts` confirms count denominators, inclusive tails, tied IDs, and ten groups plus Other.
`EcdfChart.tsx` supplies no weight metadata to annotations. Its context does not advertise record callouts.
`BoxPlot/boxPlotCalculations.ts` confirms interpolation at (n−1)p.
`valueParsing.ts` provides the eligibility rules; `aggregates.ts` has count, sum, average, min, and max.
`useGetLiveData.tsx` applies facet IDs and a local population for all-source IDs.
`saveDataUtils.ts` validates ECDF settings; `dsl/settingKeys.ts` lists their exhaustive keys.
`annotations/types.ts` and `resolve.ts` narrow the proposed guard to calculated reference lines.
Use these existing seams. Store-backed weighted acceptance, traces, restore, and browser tests remain future implementation work.

Primary method checks used NumPy, R, and [statsmodels' alternative boundary rule](https://www.statsmodels.org/stable/generated/statsmodels.stats.weightstats.DescrStatsW.quantile.html).
Statsmodels averages adjacent support values at exact boundaries; it is not the oracle for the chosen inverse convention.
The full Pro report also compares Hmisc, Julia StatsBase, and survey quantile rules; those secondary comparisons do not decide M1.

No product decision blocks M1. Weight labels do not establish survey validity or turn total weight into sample size.
Numerical limits must be visible. Compensation cannot recover information lost during parsing or scaling.
Local review chooses one unavailable state for scaled underflow. A later implementation may justify a richer approximate mode separately.
