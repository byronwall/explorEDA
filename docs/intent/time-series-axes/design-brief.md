# Proposed scale groups for time series

Status: proposed. The focused-axis presentation needs a bounded usability proof.

## The decision

Support arbitrary scale assignment in observation lines. A series can join a named group or use **Own scale**.
Each group owns its domain, transform, label, and range limits. A group can have one or several series.

Show a shared axis for comparable series. For exactly two groups, permit paired axes when their labels fit.
For more groups, test one explicitly focused axis with a visible series list that identifies every group and range.
Hover may emphasize a line. It must not switch the displayed axis.

A focused axis could be mistaken for the ruler for all lines. Reject it if users cannot identify scale ownership.
The fallback is a simpler shared-scale view while testing shared-time lanes.
One lane per group can improve physical-value reading, but adds height, scroll, and export work.

## Compare the alternatives

The complete [scored comparison](raw/2026-10-18-pro/time-series-axes-research.md#52-compare-the-alternatives-fairly) contains ordinal judgments, not measurements.

| Approach                         | Main value                               | Main cost or failure                           | Decision                          |
| -------------------------------- | ---------------------------------------- | ---------------------------------------------- | --------------------------------- |
| One shared scale                 | Direct magnitude and outlier comparison  | Small variations can flatten                   | Keep as the starting point        |
| One independent scale per line   | Compare timing and small changes         | Screen height no longer means equal value      | Support through one-series groups |
| All axes visible around one plot | Every ruler remains visible              | Twenty rulers consume the plot                 | Reject as the default             |
| Named groups with focused axis   | Arbitrary groups with limited axis space | Users may misread the focused ruler            | Investigate before release        |
| Shared-time lanes                | Rulers stay beside their groups          | Height, scrolling, Notes, and export cost      | Conditional next step             |
| Normalized or indexed overlay    | Common relative comparison               | Changes quantity and needs a declared baseline | Defer                             |

## Provider lessons

These are documented capabilities. No vendor interface was operated or scored through live use.
Sources were checked on October 19, 2026. Detailed versions and limits remain in the [source ledger](raw/2026-10-18-pro/sources.md).

| Provider                                                                                                            | Useful pattern                                          | Adaptation for explorEDA                                                               |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [Seeq](https://support.seeq.com/latest/cloud/adjusting-signal-lanes-axes-formatting)                                | Lane assignment and shared-axis assignment are separate | Keep layout and scale membership separate; keep reset explicit                         |
| [AVEVA PI Vision](https://pisystem.feedback.aveva.com/ideas/PIVISION-I-17)                                          | Vendor confirms grouped scaling in PI Vision 2025       | Use named groups; do not confuse grouping with axis placement                          |
| [Aspen Process Explorer](https://esupport.aspentech.com/UniversityCourse?id=a3p0B0000004YoIQAU)                     | Time scopes, zoom, scaling, sampling, and tables        | Keep time scope and source values clear; exact grouping behavior remains unverified    |
| [Grafana](https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/time-series/) | Field overrides, multiple axes, and all-series values   | Adapt to the existing header readout; preserve selection semantics                     |
| [Highcharts Stock](https://www.highcharts.com/docs/stock/data-grouping)                                             | Navigation and data grouping                            | Default line grouping averages values; never use grouped geometry as original evidence |
| [Plotly](https://plotly.com/javascript/multiple-axes/)                                                              | Explicit series-to-axis references                      | Reuse the ownership idea; many axes still need a usable layout                         |
| [Apache ECharts](https://echarts.apache.org/handbook/en/concepts/axis/)                                             | Multiple axes and axis offsets                          | Coordinate primitives do not resolve source identity or keyboard behavior              |
| [uPlot](https://leeoniya.github.io/uPlot/docs/)                                                                     | Scale keys separate from optional axes                  | Use a small scale mapping; no renderer replacement follows                             |

## State and ownership

Keep the primary group in existing `yAxis` and `yAxisLabel` settings.
Store extra groups in proposed `yScales`, and assign each series through proposed `scaleId`.
Omitted `scaleId` means primary. Stable IDs survive label changes. Do not store a second primary definition.

Reuse `FieldSettings.unit` from `packages/explorEDA/src/lib/fieldSettings.ts` for field-series measurement metadata.
That owner exists in the full checkout; Pro left it as an inspection gate.
A group label does not convert units. Unknown units remain unknown. Long-form per-tag units need a separate bounded decision.

Resolve source domains before linked filters, hide/show, or time zoom. Deliberate local filters define chart source scope.
**Own scale** preserves manual limits and the transform. Automatic bounds can change with the new membership.
**Join group** adopts that group's bounds and transform. Reject known incompatible units unless values are explicitly converted.

Cursor, focus, and active Select/Zoom mode stay transient. Group assignment and committed ranges use the existing edit path.
Notes and guides retain a saved scale owner. Focus changes must not move a threshold or edit another group.
Images must identify all displayed independent scales, including ranges and omitted lane subsets.

## Mode boundaries and open choices

Observation lines use numeric fields as series. Calendar summaries use one aggregate metric and optional category split.
Calendar currently ignores observation `useRightAxis` assignments and styles. Its X domain currently follows live periods.
Its Y range may expand when filtering increases an average or signed sum. Preserve that valid exception.

Additional observation groups can remain dormant in Calendar. Primary `yAxis` and `yAxisLabel` remain shared across modes.
Calendar controls can change primary settings; do not promise separate restored primary configurations.

The old `useRightAxis` API policy remains open before implementation. Repository rules forbid adding compatibility by default.
Do not adopt Pro's optional restore normalization without evidence of a need and Byron's decision.
A breaking 0.x settings change is also a decision to make before edits.

The 280px plot-width threshold and proposed performance budgets are experiment candidates, not accepted product limits.
