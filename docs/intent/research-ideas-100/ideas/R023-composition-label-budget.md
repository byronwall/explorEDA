# R023 — A bounded policy when composition end labels cannot fit

- ID: R023
- Category: Composed graphics
- Priority: 96
- Kind: simplification
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A repeated graphic can have several path endpoints at nearly the same value, leaving too little room for all their names. Composition already has a lightweight `dodgePositions` helper that preserves order and adjusts labels within bounds when possible. Its test explicitly accepts overflow when a run cannot fit. The question is what an author should do at that limit, not whether collision handling is absent. A simple, honest boundary may be more valuable than increasingly elaborate automatic placement.

Compare retaining visible overflow with an author-prioritized subset of labels and with a suggestion to enlarge the frame or reduce repetition density. Automatic font shrinking is another alternative but should have a readable minimum and must not become the default escape hatch. Keep the decision local to path-end labels; the composition plan explicitly excludes a general annotation layout solver. Any selected-label policy needs a way to discover the remaining series and should avoid silently hiding the label that carries the author’s conclusion.

The first experiment would use several equally valued endpoints, long series names, and two artboard sizes. Ask readers to match names to lines, then ask authors to resolve the crowding with each bounded option. Acceptance requires fewer identity mistakes, a predictable author action, and no loss of source inspection. Reject the idea if it grows into a global layout system, hides required labels without notice, or only replaces overlap with unreadably small text. Include export at the fixed artboard size because editor zoom does not create more output space.

The likely cost is a small authoring affordance or clearer guidance, with limited settings impact if a retained-label list proves necessary. Automatic prioritization would require more policy and maintenance than the evidence currently supports. This is a simplification follow-up to the composed-graphics plan’s existing limit on collision work. Confidence is medium: the failure condition is explicit in code, but its frequency and importance in real report graphics are unmeasured. A legitimate result is to retain the current algorithm and document the minimal manual remedy.

## References

- Repository: `packages/explorEDA/src/components/charts/Composition/labelDodge.ts` — `dodgePositions`. The helper maintains order and overflows the high bound when the run cannot fit.
- Repository: `packages/explorEDA/src/components/charts/Composition/labelDodge.test.ts` — `starts at the top and overflows the bottom when the stack cannot fit`. Overflow is intentional tested behavior.
- Repository: `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — `pathNodes`. Path-end labels use the existing dodge routine.
- Related intent: `docs/intent/composed-analytical-graphics/intent-brief.md`.
- Related intent: `docs/intent/composed-analytical-graphics/implementation-plan.md`.
