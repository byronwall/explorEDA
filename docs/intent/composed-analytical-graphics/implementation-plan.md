---
title: "Composed analytical graphics — implementation plan"
slug: "composed-analytical-graphics"
phase: plan
status: current
last_updated: "2026-10-10"
---

# Composed analytical graphics — implementation plan

## Plan at a glance

The original six milestones have shipped through PR #258. [Composition mode](../../composition-mode.md) records what they built. The paste proof passed on 2026-10-10, so one piece of work remains: keep scales and colors stable through filtering by default, with rescaling as an author opt-in (Byron's decision, 2026-10-10).

## Implementation strategy

Snapshot: `main` at `5cf144d`, inspected 2026-10-10. Paths are relative to `packages/explorEDA/src/components/charts/Composition/`.

- `compositionOutput.ts` resolves the viewed SVG, waits for fonts, rasterizes at twice the artboard size, and writes an image blob. The Clipboard API needs a secure context and a user gesture.
- `resolveUnit.ts` sizes five extents from `liveIds`: strip value maxima (`sharedMax`), bar length axes (`barAxes`), stack column totals (`maxTotals`), horizon peaks (`horizonMax`), and density peaks (`densityMax`). Position and numeric domains and point sizes already use `allIds`.
- The local loop is `pnpm --filter demo dev --port 5291 --strictPort`, focused tests with `pnpm --filter exploreda exec vitest run <file>`, and `pnpm --filter exploreda check-types`. Run `pnpm check` once before each PR.

## Milestone 1: Paste a copied composition into a real report

**Completed 2026-10-10.** Byron copied PNG from `?example=covid-compare` and pasted it into Apple Notes. Text, insets, clipping, and colors matched the artboard with no editing overlays. No fix was needed.

### Desired end state

The first release is accepted. A slide-app paste was not separately checked; repeat it only if a slide target reports a problem.

## Milestone 2: Keep scales stable through filtering

Compute every extent above from all rows in the population by default. Keep drawing marks from the filtered rows.

- Strip value scales: held maxima from `allIds` with the same aggregation as the drawn glyphs, shared or per repeat.
- Bars, stacks, horizons, and densities: the same change to their length, height, and peak extents.
- Add an opt-in to rescale to the filtered rows, on the value scale and on the marks that own their extent. Show it beside the existing shared/per-repeat choice in the inspector, with a tooltip.
- Traces state the extent used. Legends keep keying the drawn values; label an opted-in ramp as fitted to the filters.
- Saved compositions without the new field get stable extents. Examples change only in how they filter, not in how they first render.

Resolver tests filter `measles` to one decade and `population-pyramid` to one year: colors and lengths hold; an opted-in scale rescales; definitions round-trip. Recheck `media-deaths`, `stocks-horizon`, and `lincoln-ridgeline` under a filter.

### Desired end state

Filtering any composition example leaves colors and lengths on the same scale, and the trace says which extent set a mark. Removing the opt-in field and reading `allIds` everywhere is the whole change; reverting it restores today's behavior.

## Candidates to confirm

Each needs Byron's go-ahead before it becomes a milestone:

- Hide one repeat, or override one repeat's label text, as visual overrides.
- Place point labels on a side read from a field (the Driving year labels).
- Replace the forecast fan's illustrative intervals with the saved Bank of England workbook. The OBR workbook was never retrieved.
- Build an unbuilt research reference as an authoring check. The banana table (entry 04) would test insets with per-repeat path domains.

## Below the cut line

- Gradients along paths and areas (research entries 22 and 23) until a selected reference needs them.
- Weighted summaries and a survey-weighting engine.
- Automatic annotation collision resolution beyond the existing path-end label dodge.
- A general visualization compiler, arbitrary expressions, recursive repeats, or a layout solver.
- SVG, PDF, editable PPTX, recurring reports, and replacement-data parameterization.
- Exact publication replicas or fetching live reference data during tests.
