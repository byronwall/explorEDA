# R068 — Keep authored conclusions attached to their evidence scope

- ID: R068
- Category: Notebooks and narrative
- Priority: 84
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Updating a number does not guarantee that an authored conclusion still applies. Example views already contain analytical headlines, such as comparisons among penguin species, while notebooks render ordinary prose independently of chart filters. `DailyFinding` recomputes declared numeric statements, but a phrase about which group is largest or whether two groups are similar can depend on a broader population and an unstated comparison. The research opportunity is to distinguish a fixed observation about the source dataset from a claim intended to describe the current interactive scope, without automatically interpreting arbitrary prose.

Compare an author-selected scope label for a paragraph or headline with an explicit evidence link to a chart and saved selection. The label is cheap and can say that the statement describes the original dataset; the link lets a reader inspect the population behind it. A third alternative is a lightweight changed-context notice when the linked chart's relevant scope changes, leaving the prose untouched. Do not generate replacement conclusions or treat every filter as invalidating every sentence. The author must identify which analytical condition matters.

Use three short notebook passages: a fixed dataset description, a selected-cohort comparison, and a qualitative explanation independent of filtering. Ask readers to explore a filter that reverses the comparison and then explain which statements still apply. Acceptance requires correctly distinguishing the three cases and reaching the supporting records without an automatic rewrite. Reject a universal staleness warning if it fires on harmless styling edits or trains users to ignore it. Reject evidence links if they cannot communicate whether they restore a prior population or inspect the current one.

This extends data-bound-narrative while remaining distinct from R067's numeric substitution contract. It can be studied without implementing live bindings and should first reuse existing notes, traces, and authored examples. Saved evidence references would add maintenance cost, so a documentation convention may be the right outcome. Confidence is medium: the risk follows logically from interactive scope, but this review did not observe an actual misleading reader conclusion. The candidate earns its place because truthful narrative is central to notebooks and report graphics, and a small authoring rule may prevent a costly, speculative prose-invalidation system.

## References

- `apps/demo/src/demos/exampleViews.ts` — `penguinViews`, `view`. Saved example views include authored analytical headlines and notes.
- `packages/explorEDA/src/components/notebook/NotebookProse.tsx` — `NotebookProse`. Prose rendering is separate from chart selection.
- `apps/demo/src/daily/findings.ts` — `DailyFinding`, `evaluateFinding`. Typed findings handle numeric statements, providing a narrower existing precedent.
- `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx` — `ChartTracePanel`. Existing traces offer a route to supporting records.
- `docs/intent/data-bound-narrative/intent-brief.md` — related intent; status and overlap are discussed above.
- `docs/intent/notebook-analysis/intent-brief.md` — related intent; status and overlap are discussed above.
