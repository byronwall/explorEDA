# R085 — Image export fidelity under fonts and mixed rendering

- ID: R085
- Category: Import, export, and persistence
- Priority: 42
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A chart image is often the evidence someone shares outside explorEDA. The export implementation already waits for document fonts, embeds used font faces, captures canvas pixels, omits editor controls, and includes a warm-up draw for nested images. `embeddedFontFaces` also has explicit fallback and size-cap behavior. These details show substantial delivered work. The remaining concern is whether a host's fonts, mixed SVG/canvas layers, and rapidly changing filters produce a clearly defined captured state under ordinary timing variations.

Compare capturing immediately after the existing readiness checks with waiting for a small chart-owned settled signal. A third possibility is to keep capture unchanged but surface a specific font or external-content limitation before export. Avoid a global arbitrary delay that merely hides races. Define fidelity in terms of values, labels, mark membership, clipping, and readable typography; exact raster equality across browsers is a separate and often more expensive objective. Decide which failures should stop export and which can be disclosed as harmless substitutions.

The first proposed experiment uses a themed SVG chart, a canvas scatter matrix, and a map, each with one active filter. Delay a custom font, switch the filter immediately before capture, and exercise both the header and imperative API. Compare the PNG with a screenshot of the declared settled state and inspect the exported labels and row-dependent marks. Accept a change only when it removes a reproducible mismatch without excessive waiting. Reject broad capture infrastructure if the cases are resolved by a narrow readiness rule or documented font fallback.

This is a high-confidence robustness candidate because the code already exposes useful capture seams and the repository has an export-proof workflow. It does not assume that any current browser is broken, and no images were rendered in this source-only review. The related headless-rendering seed is about creating a rendering context; this candidate keeps that context live and tests its fidelity. Maintenance should stay bounded to a small representative matrix, making the research useful for a solo developer who needs trustworthy shared evidence.

## References

- `packages/explorEDA/src/components/charts/export/rasterizePanel.ts` — `rasterizePanel`, `registerCanvasReader`, `EXPORT_OMIT_SELECTOR`. Captures fonts, SVG/HTML, and canvas pixels while excluding editing controls.
- `packages/explorEDA/src/components/charts/export/embedFonts.ts` — `embeddedFontFaces`, `MAX_FONT_BYTES`. Embeds used font faces with caching and a size cap, falling back when retrieval fails.
- `packages/explorEDA/src/components/charts/export/exportChartPng.test.ts` — `exportWorkspaceChartPng`. Existing host export API test coverage.
- `docs/agent-guide.md` — `pnpm export-proof`. Documents an existing screen/export comparison workflow.
- `docs/intent/headless-chart-rendering/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
