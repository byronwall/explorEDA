# R081 — Headless chart images through a minimal existing renderer

- ID: R081
- Category: Import, export, and persistence
- Priority: 88
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A report generator or documentation job may need a chart image when no user has opened the workspace. Live PNG export already exists: `ExplorEdaHandle` delegates to `exportWorkspaceChartPng`, which requires a rendered panel. The headless-chart-rendering intent deliberately preserves the unattended case as a seed. The research question is therefore how to supply the missing execution context for the existing renderer, not whether explorEDA needs its first image export or an entirely new chart grammar.

Compare a tiny headless browser page that mounts the existing React chart with a renderer-neutral path based on one current planner. An offscreen component mounted temporarily by a live host is a useful third option for a narrower need. Vega's documented client/server image methods provide comparison evidence that output contracts can be explicit; they do not demonstrate compatibility with explorEDA's DOM capture. Keep semantic replay separate from pixel reproduction, and preserve the current theme, font, annotation, and data-scope behavior in the comparison.

Use one scatter with a calculated field and one grouped bar with filtered contributors. Supply fixed rows, saved settings, dimensions, theme, and local fonts to each candidate, then compare with ordinary mounted exports. Record setup time, peak memory, image differences, and agreement on labels and populations. Accept the browser-host route if it satisfies a real unattended caller with a small wrapper and repeatable output. Reject or defer it if no concrete caller exists, if startup dominates the useful job, or if parity requires restructuring most chart components.

This is a medium-confidence follow-up because the export seam is clear but deployment constraints and actual demand remain unmeasured. A minimal browser host adds operational weight; a second renderer adds long-term parity work. The first study should estimate both explicitly and can conclude that mounted export remains sufficient. No public API expansion is assumed. It earns a place as an ambitious but bounded investigation that could support report images, thumbnails, and visual fixtures without committing a solo maintainer to a universal scene graph.

## References

- `packages/explorEDA/src/components/ExplorEda.tsx` — `ExplorEdaHandle`, `exportChartPng`. The public imperative API exports a mounted chart.
- `packages/explorEDA/src/components/charts/export/exportChartPng.ts` — `exportWorkspaceChartPng`. Rejects when the requested chart is not rendered.
- `packages/explorEDA/src/components/charts/export/rasterizePanel.ts` — `rasterizePanel`. Captures the existing DOM/SVG/canvas presentation.
- `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts` — `planScatter`, `ScatterPlan`. An existing planner offers a narrower possible alternative to full component mounting.
- `docs/intent/headless-chart-rendering/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/renderer-independent-replay/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- [Vega View API](https://vega.github.io/vega/docs/api/view/) — primary comparison/technical source, accessed 2026-10-20.
