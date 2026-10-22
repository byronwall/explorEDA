# R065 — Link notebook charts only within an explicit analytical scope

- ID: R065
- Category: Notebooks and narrative
- Priority: 82
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Notebooks intentionally preserve chart-local selections. `ExplorEdaNotebook` passes `localSelections` to `DataLayerProvider`, and `CrossfilterWrapper` keeps chart dimensions from narrowing other charts under that mode while workspace filters still apply. The notebook-analysis intent lists opt-in shared selections as a later possibility. A recurring analytical narrative may nevertheless need two nearby graphics to describe the same chosen period or cohort. The research question is how to opt those views into a shared scope without making an earlier overview change unexpectedly when the reader explores a later detail.

Compare named selection groups attached to chosen charts with a simpler explicit control that copies a filter into another block. Named groups support repeated exploration but introduce membership and combination rules. Copying is easier to explain yet can leave two views out of sync after the next interaction. A third option is a notebook-level parameter used by only the relevant declarations. Vega-Lite's documented global, union, and intersection strategies are useful comparison vocabulary, but they do not settle the narrative boundaries or justify importing a general selection engine.

Use a four-output forecast notebook: an unchanged overview, two linked event-detail views, and an independent validation table. Prototype a shared date selection, clear it from either detail view, and change one view's local restriction. Acceptance requires both detail views to agree on exact row membership while the overview and validation table retain their declared scopes. Reject the design if users cannot identify the linked group before interacting, or if it requires a general Boolean selection editor. A copy-filter action should be rejected if participants repeatedly assume synchronization that it does not provide.

This is a precise follow-up to the notebook-analysis cut line, not a correction of its deliberately local behavior. It can be researched independently of new analytical methods and live prose. Saved syntax and host behavior would need one explicit contract, so the cheapest useful result may be documentation showing when a dashboard is the better format. Confidence is medium because the need must be established by a real notebook task. The candidate earns its place by testing narrative integrity and interaction boundaries before opting an entire document into linked filtering by default.

## References

- `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx` — `ExplorEdaNotebook`, `localSelections`. Notebooks explicitly enable chart-local selection behavior.
- `packages/explorEDA/src/hooks/CrossfilterWrapper.ts` — `localSelections`, `updateChartFilters`. Local selection mode bypasses chart-to-chart narrowing but retains workspace dimensions.
- `packages/explorEDA/src/components/LocalFilterStrip.tsx` — `LocalFilterStrip`. Existing local-population labels provide a vocabulary for visible scope.
- `docs/intent/notebook-analysis/intent-brief.md` — related intent; status and overlap are discussed above.
- [Vega-Lite: Selection Parameters](https://vega.github.io/vega-lite/docs/selection.html) — primary source accessed 2026-10-20; used only for the comparison described above.
