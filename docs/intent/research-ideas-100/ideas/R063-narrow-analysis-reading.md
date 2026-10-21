# R063 — Define useful analytical reading at narrow widths

- ID: R063
- Category: Accessibility and interaction
- Priority: 86
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

explorEDA explicitly supports a desktop workspace, yet it already provides a narrow reading arrangement. `ChartGridLayout` uses a view-only flow below its threshold, with one or two columns determined by `narrowColumnCount`; saved chart positions remain separate. Documentation `LiveExample` uses screenshots on narrow screens instead of pretending the full workspace fits. The research question is which analytical reading tasks should reliably survive these layouts. It should not silently convert an existing desktop boundary into a promise of complete phone editing.

Compare a focused reading contract for the current responsive grid with a dedicated linear summary of chart titles, scope, key values, and links to exact data. The grid preserves the visual relationships authors arranged, but rearrangement can separate a claim from its supporting view. A summary may be easier to scan while requiring a carefully bounded definition of which information is preserved. A third alternative is to keep screenshots for documentation and clearly direct interactive analysis to a larger viewport. Each is viable for a different task, so decide through use rather than screen-size ideology.

Use one six-chart order analysis and one notebook at 1280, 783, and 390 CSS pixels. Ask readers to identify the selected population, compare a category with its metric, find the source note, and reach a trace or table when that task is supported. Acceptance requires accurate answers without horizontal page overflow or saved-layout changes. Reject any expanded support claim if essential scope is clipped, adjacent charts imply a false relationship after reflow, or solving the issue requires a second full editing interface. Record unsupported tasks explicitly in the study.

This follows the existing UI defaults and the completed landing-docs-entry work, whose narrow examples already have a deliberate fallback. API cost is small for a reading contract and potentially large for a separate summary renderer; the experiment should make that tradeoff visible. Confidence is medium because source code demonstrates layout intent but cannot prove readable rendered content. The candidate earns its place through an honest boundary decision: improve a few valuable reading tasks, retain the desktop promise, and avoid accumulating accidental mobile behavior that is neither documented nor dependable.

## References

- `packages/explorEDA/src/components/ChartGridLayout.tsx` — `ChartGridLayout`, `isNarrow`. The grid derives a narrow visual flow from saved chart layouts.
- `packages/explorEDA/src/components/chartGridPlacement.ts` — `NARROW_GRID_WIDTH`, `narrowColumnCount`, `flowTwoColumns`. One- and two-column narrow placement rules are explicit.
- `apps/demo/src/docs/live/LiveExample.tsx` — `LiveExample`, `useWideViewport`. Documentation switches to screenshots at narrow widths.
- `docs/intent/landing-docs-entry/intent-brief.md` — related intent; status and overlap are discussed above.
