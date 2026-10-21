# R061 — Preserve meaning when color is unavailable or ambiguous

- ID: R061
- Category: Accessibility and interaction
- Priority: 31
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The baseline already uses more than color in several important places. `RegionMap` draws different patterns for empty and invalid regions, while `Heatmap` uses hatching, outlines, and pressed-state semantics. `assignCategoryColors` stabilizes category assignments and defines overflow behavior. The unresolved question is whether those good local choices add up to a readable analysis when colors are difficult to distinguish, forced colors alter the page, or a screenshot is viewed without reliable color. This calls for a targeted semantic audit, not a request to add an accessibility palette that already has analogues.

Compare a small shared rule for selection, missingness, and invalidity cues with renderer-specific adjustments only where a task fails. A common rule could standardize outline, pattern, and text meaning, but indiscriminate patterns may overwhelm dense charts. Another alternative is to prioritize direct labels and the existing trace or table route over additional marks. W3C's use-of-color guidance supports providing a visible alternative when color conveys information; it does not establish that a specific explorEDA chart fails, nor does it imply every series needs a new shape.

The first experiment should choose a heatmap, region map, scatterplot, and stacked bar with six categories, one empty group, and one invalid measure. Ask users to distinguish selection from omission and compare a named category under normal color, grayscale, and a forced-colors environment. Acceptance requires the same categorical and state answers without relying on a remembered palette, while the normal view remains legible. Reject a global cue system if local labels solve the failures more clearly, or if added outlines and patterns obscure small marks and introduce new ambiguities.

This is a robustness follow-up to current-analysis-trust using shipped semantic treatments as evidence. It should initially produce annotated findings and a minimal rule set, not rewrite themes or allocate a symbol vocabulary across every chart. API cost can remain negligible if the outcome is styling and description changes; saved categorical shapes would be a separate decision. Confidence is high that the task matters, but the prevalence of specific failures is unknown. A bounded study is worthwhile because it can preserve successful local patterns while preventing superficially consistent colors from hiding important distinctions.

## References

- `packages/explorEDA/src/components/charts/Map/RegionMap.tsx` — `RegionMap`, `patternUnits`. Empty and invalid regions have distinct patterns.
- `packages/explorEDA/src/components/charts/Heatmap/Heatmap.tsx` — `Heatmap`, `strokeDasharray`, `aria-pressed`. Heatmap already uses non-color state cues.
- `packages/explorEDA/src/lib/colorScaleMath.ts` — `assignCategoryColors`, `CategoryAssignment`. Palette assignment and overflow rules are explicit.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
- [W3C WAI: Understanding SC 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) — primary source accessed 2026-10-20; used only for the comparison described above.
