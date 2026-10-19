# Evidence and validation

Research baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`. Checks performed on October 19, 2026.

## Original research and integrity

Pro completed after 51m 25s. The response contains all four substantive files, the manifest, and the archive.
No follow-up was required. All 15 recommendation IDs are unique and sequential.

Archive CRC, safe entry paths, absence of links, and all four manifest sizes and SHA-256 hashes passed.
All companions were extracted unchanged. Standalone equality and file hashes are in [collection-manifest.json](collection-manifest.json).
The initial download-event wait timed out; Chrome completed the archive download normally. No research was restarted.

All 34 packet files still match the local source by SHA-256. The baseline also matched public origin HEAD at submission.
Original reports stay unchanged under [raw/2026-10-18-pro](raw/2026-10-18-pro/).

## Independent code checks

These are static source observations, not executed product acceptance tests.

| Finding                                                                   | Local source checked                                                           | Disposition                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Separate observation and Calendar renderers                               | `LineChart/LineChart.tsx`, `definition.ts`, `TimeSeriesChart.tsx`              | Confirmed; keep mode-specific scope                               |
| Right scale ignores primary hard limits and true-log enablement           | `LineChart.tsx`: `leftYScale`, `rightYScale`; `Axis/numericScale.ts`           | Confirmed; do not copy that path for arbitrary groups             |
| Hover uses reduced geometry and exact-X matching                          | `LineChart.tsx`: `processedLiveSeriesData`, `hoverPoints`, pointer handler     | Confirmed; original lookup is a separate requirement              |
| Reducer can collapse large constant-X input to the first point            | `lib/chartUtils.ts`: `reduceDataPoints`                                        | Confirmed static branch; new fidelity proofs remain unrun         |
| Calendar X follows live start/end; Y unions current/full aggregate values | `LineChart/timeSeriesPlan.ts`: `planTimeSeries`                                | Confirmed; preserve filtered aggregate expansion                  |
| Field unit metadata already exists                                        | `lib/fieldSettings.ts`: `FieldSettings.unit` and format helpers                | Resolves Pro's omitted-owner question; reuse this field           |
| Source scope includes chart-local population                              | `components/charts/useGetLiveData.tsx`: `useGetAllIds`, `restrictToPopulation` | Confirmed; exact runtime filter interactions remain future proofs |
| Edit transaction already exists                                           | `InPlace/useChartEdit.ts`: `holdStateChanges`, apply/commit/cancel             | Confirmed; reuse it for committed group edits                     |
| Current saved-series validation requires the old boolean                  | `utils/saveDataUtils.ts`: `isSeriesSettings`                                   | Confirmed; choose API policy before replacing it                  |
| Notes use left/right identity                                             | `lib/annotations/types.ts`: `AnnotationYAxis`                                  | Confirmed; thread stable group ownership through existing Notes   |
| Actual image-export owner exists                                          | `charts/export/useChartImageExport.ts`, `exportChartPng.ts`                    | Located; no export parity proof has run                           |

Paths in the table are relative to `packages/explorEDA/src/` unless already prefixed.
Pro listed `useGetLiveData.ts` as a candidate; its actual filename is `useGetLiveData.tsx`.
Do not copy unresolved import stems as new file paths.

## Independent external checks

Primary pages were opened directly during integration. They support the following narrow claims:

- [Seeq](https://support.seeq.com/latest/cloud/adjusting-signal-lanes-axes-formatting): lane assignment and axis grouping are distinct; fixed bounds differ from current-time autorange.
- [AVEVA](https://pisystem.feedback.aveva.com/ideas/PIVISION-I-17): the dated vendor response confirms grouped scaling in PI Vision 2025.
- [AspenTech](https://esupport.aspentech.com/UniversityCourse?id=a3p0B0000004YoIQAU): the agenda names timeline, scaling, sampling, and table work. Precise group behavior remains unverified.
- [Grafana](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/time-series/): multiple axes use field overrides; the page expects unique timestamps within a series.
- [Highcharts](https://www.highcharts.com/docs/stock/data-grouping): line grouping uses average approximation by default.
- [Plotly](https://plotly.com/javascript/multiple-axes/): traces explicitly reference additional Y axes.
- [ECharts](https://echarts.apache.org/handbook/en/concepts/axis/): multiple Y axes and offsets are documented.
- [uPlot](https://leeoniya.github.io/uPlot/docs/): series reference scale keys; a visible axis is optional for that scale.

No provider UI was operated. No source proves the proposed focused-axis interaction is easy to use.
Release numbers in the original report remain Pro's source context; they are not selected or independently installed dependencies.

## Checks and limits

Independent small-fixture arithmetic confirms the 300 sum, 150 average, and 59.6 outlier difference.
No downloaded program was executed. Synthetic calculations do not prove renderer behavior.

Package installation used the frozen lockfile, Node 24.21.0, and pnpm 11.9.0.
`pnpm check` passed UI rules, all builds, 73 build-time docs tests, and library/app/demo typechecks.
The aggregate command exited nonzero during library tests: five files hit local socket `EPERM` or watcher `EMFILE`.
That run reported 1,619 passing library tests and 72 skipped tests.
A focused rerun of all five affected files with host access passed: 50 tests.
Separate demo tests passed: 431 tests. Separate app tests passed: 32 tests.
The original aggregate command is not reported as a clean pass.
No unrelated test or server code was changed.

Local Markdown links, balanced fences, JSON parsing, sequential recommendation IDs, and Git whitespace checks passed.
Logs remain under `tmp/time-series-research/`; they are not committed.
No application code changed. New UI, browser, assistive-technology, save/undo, export, and performance proofs remain unrun.
