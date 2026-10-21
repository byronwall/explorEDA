# R060 — Make chart summaries answer an analytical question

- ID: R060
- Category: Accessibility and interaction
- Priority: 38
- Kind: follow-up
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

explorEDA already labels chart regions and describes their fields through `getChartSummary`; SVG shells connect descriptions with `aria-describedby`. The existing `ChartDataPreview` supplies source rows or, for `aggregateId`, group values and source row counts, with an explicit first-hundred limit. Those mechanisms give nonvisual access, but a field list does not necessarily communicate the pattern a chart is intended to reveal. Research should determine whether a short, deterministic summary of scope and salient values improves analytical use, while preserving the full table and trace as the route to exact evidence.

Compare a conservative plan-derived summary with an author-written description that includes a separately maintained scope sentence. The deterministic version could report row count, measure definition, bounds, and explicitly selected groups, avoiding inferred trends or causal language. Author text can express purpose but can become stale after filtering. A third alternative is to extend the grouped preview to native chart-plan summaries, such as retention cells, beyond its existing shared-aggregate branch. W3C's complex-image guidance supplies the short-description and detailed-information distinction; it does not prescribe which explorEDA summary should be generated.

Begin with one bar, one scatterplot, and one retention view. Ask screen-reader users to identify the population, compare the relevant groups, locate one exact value, and notice when a filter changes the interpretation. Compare the current summary plus table with each candidate. Acceptance requires accurate task answers and no misleading claim after an empty selection or invalid measure. Reject generated narratives that require statistical inference outside the chart plan, or descriptions that become so verbose that navigating a dashboard is slower than opening the existing data view.

This extends shipped accessibility primitives and current-analysis-trust rather than promising universal chart accessibility from labels alone. Keeping summary generation beside chart plans could reuse semantic results without another computation layer; an authored description would add saved metadata and a freshness decision. Confidence is high in the need to test analytical comprehension, but actual assistive-technology behavior was not evaluated from the non-runnable packet. The investigation earns its place by testing a concrete task outcome and allowing the simplest acceptable result, including better table access with no new prose generator.

## References

- `packages/explorEDA/src/components/charts/chartAccessibility.ts` — `getChartSummary`, `getChartFields`. Current summaries identify chart types and fields.
- `packages/explorEDA/src/components/charts/BaseChart.tsx` — `BaseChart`, `aria-describedby`. SVG shells associate an accessible description.
- `packages/explorEDA/src/components/ChartDataPreview.tsx` — `ChartDataPreview`, `getAggregateResult`, `aggregateId`. Source-row and shared-aggregate group previews already exist, with a visible first-100 limit.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
- [W3C WAI Images Tutorial: Complex Images](https://www.w3.org/WAI/tutorials/images/complex/) — primary source accessed 2026-10-20; used only for the comparison described above.
