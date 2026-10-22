# R075 — Explain the analytical consequences of a large applied edit

- ID: R075
- Category: Inspection and provenance
- Priority: 98
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The demo already describes saved-state changes through `describeChanges`, including filters, chart settings, shared definitions, and view additions. The in-app-analysis-agent intent proposes direct application with ordinary Undo and explicitly defers a richer comparison surface; no integrated agent service was found in this packet. The research question is whether existing change descriptions are enough when one future agent response or large text edit alters several analytical choices at once. A useful explanation should help a person notice a changed population or metric, not merely count modified charts.

Compare the current history description with a concise post-application summary that prioritizes analytical consequences: changed measure, population, grouping, or source view. Another alternative highlights only the affected existing charts and lets their traces explain the result. A third is to keep history unchanged but improve the text of already recorded changes. Preserve the stated direct-apply experience and immediate Undo; this candidate does not add an approval step, selective replay, or a requirement to persist conversation history. It asks what information helps users evaluate a result after it is visible.

Use synthetic before-and-after settings over the same small order fixture. Include a harmless style edit, a sum-to-average change, a narrowed population, and a calculation replacement hidden among layout edits. Ask reviewers to identify the consequential changes and decide whether ordinary Undo is appropriate. Acceptance requires accurate identification without reading raw JSON and without overstating numeric effects that were not evaluated. Reject a new summary if the existing history already makes the differences obvious, or if it needs an independent semantic engine that can disagree with current chart plans.

This is a bounded follow-up to in-app-analysis-agent and current-analysis-trust, grounded in shipped history descriptions rather than assuming an agent exists. It can be researched before any model integration through ordinary saved settings. API and maintenance impact should be small if it reuses `HistoryChange` and current plan metadata; a durable operation log is unnecessary. Confidence is medium because large automated edits remain prospective, although large DSL edits offer an immediate analogue. The investigation earns its place by preserving the product's fast editing intent while testing whether users can recognize analytical changes that deserve closer inspection.

## References

- `apps/demo/src/savedViewsHistory.ts` — `describeChanges`, `HistoryChange`, `describeChartChanges`. Readable history already describes chart, filter, and shared-definition edits.
- `apps/demo/src/savedViewsHistory.test.ts` — `describeChanges`, `classifyChange`. Tests assert existing change classifications and descriptions.
- `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx` — `ChartTracePanel`. Current traces offer a route to inspect affected analytical results.
- `docs/intent/in-app-analysis-agent/intent-brief.md` — related intent; status and overlap are discussed above.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
