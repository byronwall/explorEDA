# R052 — Find the smallest useful recovery from an empty selection

- ID: R052
- Category: Selection and analytical scope
- Priority: 50
- Kind: new-direction
- Status: researched
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

An empty chart may be the correct result of several individually reasonable filters. `ChartMessage` provides the shared no-matching-rows message, while `ActiveFilterStatus` already exposes individual removal and a global clear action. `CrossfilterWrapper.getFilteredRowIds` supplies the resulting membership. The research opportunity is narrower than adding an empty state: help an analyst discover which restriction to relax while preserving the rest of an investigation. A zero-result message alone does not establish whether the data lacks the combination, a local population excluded it, or a table search hid matching records.

Compare two recovery models. A leave-one-filter-out explanation could show how many rows would return if each existing restriction were removed, without applying the change. A chronological explanation could identify the latest action that made the relevant scope empty and offer its ordinary undo. The first is independent of history but may cost more evaluation; the second is cheaper and intuitive but can blame the final action when several restrictions are jointly responsible. Neither should silently clear filters or label an intentional empty result as an error.

Start with eight manually enumerated situations: conflicting categories, a narrow date interval, missing values, a Rows-only search, a chart-local restriction, and cases where removing any single filter still yields zero. Produce paper examples of both explanations and verify proposed recovery counts against source IDs. Acceptance requires one reversible, correctly scoped recovery in every simple case and an honest no-single-change answer for joint conflicts. Reject automatic suggestions if they cannot distinguish workspace emptiness from a table-only result, or if the analyst regularly prefers inspecting the existing filter chips.

Current-analysis-trust calls for checking empty results, but its proposed proof does not settle explanation or recovery design. Implementation should begin only after the study identifies recurring failures. Deriving optional counts on demand avoids permanent recomputation and leaves saved formats untouched; introducing an exhaustive Boolean conflict solver would exceed the appetite. Confidence is medium because the source exposes the necessary boundaries, while real recovery frequency and evaluation cost are unknown. A negative result remains useful: it can justify a clearer sentence and a documented recovery recipe instead of a new mechanism.

## References

- `packages/explorEDA/src/components/charts/ChartMessage.tsx` — `ChartMessage`, `NO_MATCHING_ROWS`. A shared empty-state message already exists.
- `packages/explorEDA/src/components/ActiveFilterStatus.tsx` — `ActiveFilterStatus`. Individual removal and clear-all controls already exist.
- `packages/explorEDA/src/hooks/CrossfilterWrapper.ts` — `getFilteredRowIds`, `getChartFilteredRowIds`. Global and chart-population membership are distinguishable.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.

## Design follow-up — November 1, 2026

Build [Recover rows](../../empty-selection-recovery/implementation-plan.md) with exact previews, named populations, and guarded Apply.
The [research summary](../../../research/empty-selection-design-2026-11-01/README.md) links all ten originals and local evidence.
DIRECTION and this Design supersede the old demand gates and keep-current rejection rule above.
Rank remains unchanged. No next topic is assigned.
