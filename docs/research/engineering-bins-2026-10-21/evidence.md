# Independent evidence review

Reviewed 2026-10-21. Source baseline and refreshed origin/main remain 9b16d78e3ed0742ed4d5858c1939fec9e758b510.
All four substantive reports were read. No material gap requires a Pro follow-up.

## Source review

[Source receipts](source-checks.json) authenticate 30 baseline files, two historical files and 13 supplemental Git objects.
All 34 packet-entry receipts match the report. Local additions retain their uploaded hashes despite later queue formatting.
Historical links use their original pinned commits. Packet integrity alone does not establish product execution.

| Source                                      | Independent finding                                                                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| BarChart/bins.ts and barPlan.ts             | Global source values set bin geometry. Integer-only source uses half-step boundaries. Membership uses floor indexing and final-closed placement.    |
| BarChart.tsx and applyFilter.ts             | Clicks store the bin bounds. Brushes and later edge changes snap ranges. Shared numeric min/max comparisons include both endpoints.                 |
| BarTraceBody.tsx and barTrace.ts            | Trace membership comes from the planned mark. Compare it separately with globally linked rows.                                                      |
| useGetColumnData.tsx and useGetLiveData.tsx | Histogram all-values reads the whole column. Local/facet conditions narrow live counts. ECDF all-IDs honors local population.                       |
| CrossfilterWrapper.ts                       | Own chart groups omit their own dimension filter. Local selections disable that chart's linked predicate. Local populations are applied separately. |
| Ecdf/ecdfPlan.ts                            | Thresholds distinguish at-or-below and at-or-above. Range counts include both endpoints. Each curve uses its valid context count.                   |
| FiltersSettingsTab.tsx and ColumnFilter.tsx | An existing ECDF filter exposes numeric At least/At most inputs. Typed finite limits need browser and precision checks.                             |
| DataLayerProvider.tsx and dataLayerState.ts | Data replacement can reset settings or reapply supplied saved settings. Internal row IDs are reassigned by position. Compare stable source keys.    |

These are source findings. No new component/provider fixture or browser task ran.
Existing baseline tests passed 22 cases before submission; they do not cover the proposed complete endpoint journey.

## Independent arithmetic

[Twenty-two exact-rational anchors](arithmetic-checks.json) verify the report's main sets and counts.
Six bins yield 2,4,3,0,1,1. Inclusive specification membership is six of eleven eligible measurements.
The [2,4) bin has four contributors; inclusive [2,4] has six. Peer B gives two and three.
Three bins yield 6,3,2; inclusive [0,4] matches eight rows.
Replacing the extreme with 24 yields 6,3,1,0,0,1. Appending it yields 6,3,1,1,0,1.
Irregular edges yield 1,4,3,0,1, with density area 9/11 over all valid rows and one over in-domain rows.
Integer-only and former-terminal-selection probes also pass. Arithmetic is not product acceptance.
Pro reports 76 assertions and a JavaScript-number probe. Those exact checks were not independently rerun.

## Current primary references

Opened official pages on 2026-10-21. No external package was installed or executed.

| Reference                                                                                    | Checked claim and limit                                                                                                            |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [D3 bin](https://d3js.org/d3-array/bin)                                                      | Interiors exclude upper edges; the final bin includes its upper edge. Threshold arrays describe internal cuts, not complete edges. |
| [NumPy histogram](https://numpy.org/doc/stable/reference/generated/numpy.histogram.html)     | Complete edge arrays allow unequal widths. Interiors are half-open; the final bin is closed. Density normalizes area.              |
| [R hist](https://stat.ethz.ch/R-manual/R-patched/library/graphics/html/hist.html)            | Default intervals are right-closed. Fuzz affects nearby boundary counts. Unequal breaks default to density.                        |
| [Vega-Lite bins](https://vega.github.io/vega-lite/docs/bin.html)                             | Anchor aligns a boundary; step sets spacing. Steps lists allowed sizes. This page does not establish every endpoint case.          |
| [Observable Plot bins](https://observablehq.github.io/plot/transforms/bin)                   | Numeric intervals use consecutive multiples. Threshold arrays supply boundaries; filter:null retains empty bins.                   |
| [NIST tolerance intervals](https://www.itl.nist.gov/div898/handbook/prc/section2/prc263.htm) | Engineering limits are supplied acceptance limits. Statistical tolerance intervals have a distinct probability meaning.            |

Different conventions are valid comparisons. They establish neither demand nor one universal endpoint rule.
Remaining NIST control/capability comparisons stay attributed to Pro; they do not determine the retained-control decision.

## Collection limits

The published ZIP and manifest hashes match. CRC, safe flat paths, no symlinks, exact inventory and UTF-8 checks pass.
All four report sizes and hashes match the archive manifest. Original bytes remain unchanged.
The standalone decision button entered preview state; its 12-second download event timed out.
No independent standalone/archive companion equality is claimed. All required report contents came from the verified ZIP.
No Library upload or downloaded-code execution occurred.

## Product limits

No named analyst task, usability timing or verified runtime defect was supplied.
No new fixture, browser interaction, source refresh, export/history/reopen or performance proof ran.
Width/origin, explicit edges, a lesson and its runnable example remain proposed or deferred.
Keep local trust first. Any actual endpoint disagreement requires a separate repair decision.
