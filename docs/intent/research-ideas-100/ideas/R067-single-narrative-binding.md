# R067 — Bind one narrative value to an existing analytical result

- ID: R067
- Category: Notebooks and narrative
- Priority: 54
- Kind: follow-up
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A sentence saying that a selection contains a particular number of orders becomes wrong if the selection changes and the number is typed manually. Static Markdown is delivered through `MarkdownSettings.content` and `NotebookProse`. The demo also has a more specific precedent: `DailyFinding` and `evaluateFinding` compute published finding values from local data. Neither observation should be mistaken for a general workspace binding feature. The research task is to make one ordinary narrative value use the same metric, formatting, and population as an existing chart result.

Compare an explicit reference to a named metric card or analytical result with a small typed binding declaration that defines a count or measure directly. Referencing a result minimizes duplicate definitions but creates a dependency on its continued existence. A separate declaration survives chart removal but can drift from a visually similar card unless both use the same reduction. A third alternative is to keep the number in a metric card and leave prose qualitative. The data-bound-narrative intent prefers a transparent first binding; preserve that appetite rather than invent a template language.

Start with a sentence containing one selected row count beside the matching card. In a paper contract or later isolated spike, test filtering, no rows, invalid measures, renamed fields, and removal of the referenced card. Acceptance requires identical values and formatting, an inspectable scope, and an honest unavailable state instead of stale prose. Reject the syntax if it permits hidden calculations or arbitrary code, or if authors cannot distinguish an all-source value from a selected-population value. Prefer the existing card when it communicates the result just as clearly.

This is a precise follow-up to data-bound-narrative and a later notebook-analysis possibility, while recognizing that daily findings already solve a narrower publication problem. API impact depends on the chosen binding identity; the study must account for deletion and reference errors before saving new metadata. Confidence is high in the concrete stale-number problem and medium in the need for inline text. The investigation earns its place by testing one reusable semantic contract with existing reduction plans, without depending on a language model, a remote service, or a new calculation runtime.

## References

- `packages/explorEDA/src/components/charts/Markdown/definition.ts` — `MarkdownSettings`, `markdownDefinition`. Workspace Markdown currently stores authored content.
- `packages/explorEDA/src/components/notebook/NotebookProse.tsx` — `NotebookProse`. Notebook prose is rendered from Markdown text.
- `packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts` — `planMetricCard`, `MetricCardPlan`. Card plans retain metric, scope, value, and unavailable state.
- `apps/demo/src/daily/findings.ts` — `DailyFinding`, `evaluateFinding`. Daily publications already compute a bounded class of finding values.
- `docs/intent/data-bound-narrative/intent-brief.md` — related intent; status and overlap are discussed above.
- `docs/intent/notebook-analysis/intent-brief.md` — related intent; status and overlap are discussed above.
