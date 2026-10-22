# R053 — Select exact category combinations without cross-product surprises

- ID: R053
- Category: Selection and analytical scope
- Priority: 44
- Kind: follow-up
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Selecting North/Web and South/Retail should not accidentally include North/Retail. The baseline `Filter` union contains value, range, text, and date-range predicates, and `Heatmap` uses `toggleCellFilters` to update the chart's filters. The precise-composite-selection intent explicitly identifies arbitrary tuple unions as unresolved while preserving the accepted single-cell behavior. This investigation should therefore address a concrete joint-membership task, not claim that heatmap selection is missing. It should also keep numeric categories distinct from strings that happen to display the same label.

Compare a bounded tuple predicate that stores typed field-value pairs with a selected-source-ID set captured from the chosen cells. Tuples preserve an analytical condition when records change; IDs preserve the exact observed rows but may become meaningless after source replacement. Vega-Lite documents field projection for selection parameters, providing comparison vocabulary rather than a reason to adopt its runtime. A useful third control is to keep single-cell selection and use an explicitly prepared combined category when the occasional task does not justify another saved predicate.

Use a four-cell fixture with repeated records, null categories, and numeric/string lookalikes. Sketch selection, deselection, active-filter labels, and reopening the same settings after one new matching record is added. Acceptance requires exact union membership, no cross combinations, and an understandable rule for the new record under both candidate representations. Reject a generalized query language or opaque ID-only labels if they are necessary to make this small case work. Also reject the feature when one combined field gives the same answer with substantially less enduring complexity.

This is a precise follow-up to an existing intent, whose current next action prioritizes lasso before tuple unions; the ranking should preserve that context. The research can proceed independently as a paper contract, but implementation would touch validation, filter labels, chart definitions, and persistence. Confidence is high that the contract remains unresolved because the inspected union is field-based. Demand is less certain. The idea earns its place through a small, falsifiable semantic boundary, with explicit deferral if no representative analysis needs several separated combinations.

## References

- `packages/explorEDA/src/types/FilterTypes.ts` — `Filter`, `ValueFilter`. The current union uses field-level filter shapes.
- `packages/explorEDA/src/components/charts/Heatmap/Heatmap.tsx` — `Heatmap`, `toggleCellFilters`. Existing cell selection updates chart filters.
- `packages/explorEDA/src/components/ActiveFilterStatus.tsx` — `formatFilterLabel`. Any future joint predicate needs comprehensible active-state labels.
- `docs/intent/precise-composite-selection/intent-brief.md` — related intent; status and overlap are discussed above.
- [Vega-Lite: Selection Parameters](https://vega.github.io/vega-lite/docs/selection.html) — primary source accessed 2026-10-20; used only for the comparison described above.
