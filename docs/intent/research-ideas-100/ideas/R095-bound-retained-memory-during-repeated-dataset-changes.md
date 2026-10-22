# R095 — Bound retained memory during repeated dataset changes

- ID: R095
- Category: Measured performance
- Priority: 60
- Kind: robustness
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Long exploratory sessions may replace datasets, open large matrices, and export charts before returning to smaller work. The provider clears its column caches during restore, and the period cache already has a 100,000-entry bound. Other shared resources use different lifetimes: matrix drawing reuses a pixel buffer and scratch canvas, while image export caches font files and stylesheet text. These choices can be efficient. The research question is whether their combined high-water retention creates a practical capacity problem, not whether shared caches are inherently leaks.

Compare retaining reusable peak capacity with shrinking selected buffers after a large analysis closes. A third option is a modest size cap or eviction policy only for the resource that measurements implicate. Distinguish unreachable garbage awaiting collection from intentionally retained cache state and from an actual reference leak. Keep source rows, typed buffers, canvases, font data, and worker copies separate in the accounting. Avoid a global cache manager unless several independent lifetimes demonstrably need one; local ownership usually keeps maintenance simpler.

The first experiment repeatedly alternates a large dataset and matrix with a small workspace, varying fonts and exports in a second controlled sequence. Take browser allocation evidence after a consistent idle period and after unmount, then repeat enough cycles to distinguish a plateau from growth. Acceptance requires explainable bounded retention and a meaningful capacity benefit from any proposed reclamation policy. Reject redesign if the retained memory is bounded useful reuse, if observed growth is ordinary delayed collection, or if aggressive clearing merely recreates expensive allocations on every interaction.

This is a medium-confidence robustness candidate linked to columnar-data-transport's full resident-cost requirement and current-analysis-trust's dependable workflows. It proposes no new memory limit until representative sessions are measured. API changes should be unnecessary unless hosts need an explicit disposal hook, which itself needs evidence. No heap inspection was performed here. The investigation earns its place by testing a realistic long-session concern that a single load benchmark cannot answer, while preserving the performance benefits of caches that already behave appropriately.

## References

- `packages/explorEDA/src/providers/DataLayerProvider.tsx` — `restoreAnalysisFromStructure`, `columnCache`, `calcColumnCache`. Replaces row-related state and clears store column caches on restore.
- `packages/explorEDA/src/lib/dailyRollup.ts` — `PERIOD_CACHE_LIMIT`, `periodCache`, `cached`. Uses a bounded shared period cache that clears at its limit.
- `packages/explorEDA/src/components/charts/ScatterMatrix/matrixCanvas.ts` — `counts`, `scratch`, `drawMatrixPoints`. Reuses a module-level pixel buffer and scratch canvas across draws.
- `packages/explorEDA/src/components/charts/export/embedFonts.ts` — `fontFiles`, `sheetText`, `embeddedFontFaces`. Caches retrieved font and stylesheet results.
- `docs/intent/columnar-data-transport/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
