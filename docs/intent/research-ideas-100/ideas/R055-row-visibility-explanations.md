# R055 — Explain why a source row has no visible mark

- ID: R055
- Category: Inspection and provenance
- Priority: 22
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The trace panel already offers a source-row finder, and `ChartTraceScope.findRow` can ask a facet source to reveal a hidden row. When no source can locate it, `ChartTracePanel` currently combines two possibilities in one message: no drawn object uses the row, or the row does not exist. Meanwhile scatter traces already distinguish excluded rows and record conversion details. The opportunity is a clearer route from a known record to its absence from a particular graphic, without assuming that an absent mark represents lost data.

Compare a structured visibility explanation assembled from existing chart plans with a simpler sequence of links to the relevant filter, field, and axis inspectors. The structured option could distinguish nonexistent ID, filtered population, invalid coordinates, clipped position, and offscreen facet. The linked explanation keeps fewer new concepts but asks users to follow several surfaces. Both alternatives should preserve the current trace revision rule: changed data closes stale traces. Do not broaden the row finder into a global lineage engine or automatically clear restrictions to make a record appear.

Begin with one scatter chart and one faceted bar chart over ten named records. Construct one case for each absence reason and ask whether the current plan exposes enough information to explain it without rerunning preparation independently. Acceptance means every explanation identifies the correct reason and offers a reversible route to inspect the record, while keeping filters and axis limits unchanged until the analyst acts. Reject a universal explanation layer if it must duplicate every chart's preparation logic; retain a chart-specific explanation or improve the existing message instead.

This is a robustness extension of current-analysis-trust rather than a request to add tracing, which is extensively implemented. `ChartTraceScope` tests already exercise revision invalidation and hidden-facet lookup, providing a concrete boundary for later verification. API impact can remain internal if explanation reasons are derived from trace sources; saved settings need not change. Confidence is high in the ambiguity visible in source, but no runtime failure has been established. The research earns its place because a short, accurate absence explanation can prevent an analyst from misdiagnosing filtering, clipping, or invalid inputs as missing source records.

## References

- `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx` — `ChartTracePanel`. The finder currently uses a combined no-object-or-no-row message.
- `packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx` — `findVisibleRow`, `findRow`. Visible lookup and pending facet lookup are already implemented.
- `packages/explorEDA/src/components/charts/ScatterPlot/scatterTrace.ts` — `ScatterTrace`, `resolveScatterTrace`. Scatter traces contain exclusion reasons and preparation details.
- `packages/explorEDA/src/components/charts/trace/ChartTraceScope.test.tsx` — `lets a facet source open a hidden row after the charts miss it`. A test covers delegation to hidden-facet lookup.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
