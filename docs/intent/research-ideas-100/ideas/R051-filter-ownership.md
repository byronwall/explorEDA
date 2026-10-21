# R051 — Make filter ownership and self-exclusion understandable

- ID: R051
- Category: Selection and analytical scope
- Priority: 5
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

An analyst can correctly select a category yet misread why the originating chart still displays its alternatives. The baseline deliberately gives each chart a Crossfilter dimension whose group excludes its own filter. `CrossfilterWrapper.getAllData` also restricts each chart to its local population. `ActiveFilterStatus` distinguishes workspace filters, chart filters, table searches, and Rows filters; `LocalFilterStrip` names local restrictions. These are delivered capabilities. The unresolved question is whether people can predict their combined meaning without learning the implementation, especially when a headline card and its neighboring distribution show different counts.

Investigate which compact explanation makes those populations predictable. One alternative adds a contextual scope sentence to the existing chart trace, identifying the chart's local population, filters from other views, and its own selected subset. Another keeps the interface unchanged and improves the existing status tooltip and focused teaching example. A third possibility is a temporary comparison of visible context and selected rows. Compare explanations before changing filtering semantics: suppressing contextual alternatives would solve a different problem and could make exploration harder.

The first experiment is a moderated task with a twelve-row order fixture, two category charts, a metric card, a local chart restriction, and a Rows search. Ask participants to predict membership before selecting, then explain three apparently different totals using the current interface and each explanation variant. Acceptance requires correct source IDs and scope predictions in at least four of five tasks, with no additional persistent controls. Reject the added explanation if readers already succeed with the existing chips, or if its terminology creates more confusion than the worked example removes.

This is a bounded follow-up to current-analysis-trust, whose open proof concerns agreement across linked views. It does not propose replacing Crossfilter or broadening the saved filter union. A documentation-only result has negligible API cost; a trace sentence should derive from existing settings and avoid a second population evaluator. Confidence in the opportunity is high because multiple scopes are explicit in source, but the frequency of misunderstanding is unmeasured. That gap earns a small comprehension study before either adding interface weight or declaring the current model deficient.

## References

- `packages/explorEDA/src/hooks/CrossfilterWrapper.ts` — `CrossfilterWrapper`, `getAllData`. Own-dimension grouping and chart populations are explicit.
- `packages/explorEDA/src/components/ActiveFilterStatus.tsx` — `ActiveFilterStatus`, `formatFilterLabel`. Workspace, chart, search, and Rows scope labels already exist.
- `packages/explorEDA/src/components/LocalFilterStrip.tsx` — `LocalFilterStrip`. Local restrictions are already named beside a chart.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
