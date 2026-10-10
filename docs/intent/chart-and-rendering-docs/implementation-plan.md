---
title: "Chart and rendering documentation — implementation plan"
slug: "chart-and-rendering-docs"
phase: plan
status: current
last_updated: "2026-10-10"
---

# Chart and rendering documentation — implementation plan

## Plan at a glance

M1 shipped three TSX pages. Before writing seventeen more, fix the deploy toolchain, then port those three pages to build-time MDX and add one live embed. That port is the proof. It can reject MDX in favor of Starlight while only three pages exist. Then fill the catalogue in two groups and finish the system guide. Each step leaves the demo, examples, and published guides working.

## Implementation strategy

- **Seam:** Docs content, catalogue, and embeds live in `apps/demo/src/docs/`. The library owns chart behavior and public types; docs never import package internals.
- **Live examples:** `LiveExample` frames `/examples/<id>` on request. The child document follows the existing `main.tsx` → `LandingPage` → lazy `ExplorEda` path. Fallback: the direct mount used by `landing/LiveOrderBook.tsx`.
- **Source of truth:** `registerAllCharts.ts` for which types exist; `demos/coverage.ts` for which examples show each type; current source and the running demo for behavior.
- **Fast local loop:** `pnpm --filter demo dev`; `pnpm --filter demo build && pnpm --filter demo preview` for refresh and asset checks; `pnpm --filter demo test`; `pnpm check:ui`.
- **External dependency:** GitHub Pages only. Confirm deep links and assets on the deployed site after local proof.
- **Rollback:** Each milestone is revertible on its own. Removing the MDX plugin restores `ChartDocs.tsx` from history; example routes are never touched.

## Milestone 1: Scatter, bar, and rendering guides — accepted 2026-10-02

Shipped as `apps/demo/src/ChartDocs.tsx` at `?view=docs&topic=scatter|bar|rendering`, with images in `apps/demo/public/docs/` and accepted browser evidence (exp-72ve). The landing bridge shipped in exp-4ak2.

### Desired end state

- Two unlike chart guides and the system guide are readable at stable URLs and match runtime behavior.

## Milestone 2: Deploys build with the pinned toolchain

- **Change:** In `.github/workflows/deploy.yml`, use Node 24 and pnpm 11.9.0 (read from `packageManager`) with a current setup action, and install with `--frozen-lockfile`. Nothing else in CI.
- **Verify:** Run the same install and build locally on Node 24; after merge, the Pages run succeeds and `/`, `/examples/scatter-trace`, and `?view=docs&topic=bar` load on the live domain.

### Desired end state

- The deployed site is built by the same toolchain developers use, so later build-plugin failures are attributable.

## Milestone 3: The existing guides run on MDX, with one live example

- **Change — build:** Add `@mdx-js/rollup` before `@vitejs/plugin-react` in `apps/demo/vite.config.ts` and include `.mdx` in the React plugin. Add `remark-gfm` or `rehype-slug` only if a page needs them.
- **Change — content:** Move the three pages to `src/docs/pages/*.mdx`. Move their images to `src/docs/assets/` as imports, with a capture manifest. Keep the index, focus handling, and URLs from `ChartDocs.tsx`; render the docs branch lazily from `LandingPage`.
- **Change — components:** `Figure` (figure, alt, caption, intrinsic size, responsive), `FigurePair` (stacks when narrow), and `LiveExample` (Start, Reset, Close, Skip, full-example link; mounts only at a container width of 1024 px or more).
- **Change — catalogue:** One typed catalogue of topics. A test checks that each topic's example IDs exist and, through `coverage.ts`, show the topic's chart type.
- **Change — rendering guide:** Re-verify claims against current scatter and bar source. The scatter tracing-status document it cited has been retired.
- **Verify:**
  - `ChartDocs.test.tsx` and `LandingPage.test.tsx` pass, extended for width gating, reset, close, and load failure.
  - Deleting an imported image fails the build. Swapping a screenshot changes one file.
  - In a real browser on `vite preview`: direct load and refresh each topic and a heading fragment; Back and Forward; an unknown topic shows a link back.
  - At 1280 px, start the scatter example, draw and clear a brush, and match the linked row count to the fixture. Tab into and out of the frame; Escape closes nested dialogs.
  - At 783 and 390 px, no frame mounts and pages have no horizontal overflow.
  - Compare total page source lines with the TSX version.
- **Decision rule:** Proceed when all checks pass. Switch to Starlight if images need per-page glue, navigation needs a custom content framework, or the shell passes about 20 hours. If only the embed fails, try the direct mount once; if that fails too, ship links and record the gap.

### Desired end state

- The three published guides read the same at the same URLs, and adding a page is an MDX file, images, and a catalogue entry.
- One real workspace runs inside a guide at desktop width.

## Milestone 4: The original catalogue is complete

- **Change:** Add `row`, `line`, `boxplot`, `3d-scatter`, `pivot`, `data-table`, `summary`, `color-legend`, and `markdown` pages. Choose each example from `coverage.ts` rather than the old table. Cover box, violin, and beeswarm on `boxplot` and histogram versus category bars on `bar`. The 3D page gets a WebGL and no-WebGL check.
- **Change — example gaps:** If no example shows a type in focus (likely `color-legend`), add the smallest saved view to an existing example. Do not change charts for the docs.
- **Verify:** Catalogue test passes; each page's fields, selection, limits, and live example checked against the running demo.

### Desired end state

- The eleven original types have pages; the index separates plots, tables, and supporting views.

## Milestone 5: Newer types are documented

- **Change:** Add `map`, `metric-card`, `sankey`, `parallel-coordinates`, `scatter-matrix`, `calendar`, `heatmap`, `ecdf`, and `composition` in the same format.
- **Verify:** A test fails if any type in `registerAllCharts.ts` lacks a page.

### Desired end state

- Every registered type has a page, and a newly registered type cannot ship without one.

## Milestone 6: The integration and rendering story is complete

- **Change:** Explain source versus effective fields; full, peer-filtered, and globally filtered rows; chart-owned versus shared filters; facets; SVG, Canvas, Three.js, and HTML boundaries; and host-owned persistence. Link the package README for the exact API.
- **Verify:** Read against `DataLayerProvider`, the registry, representative renderers, and saved-state types. Run `pnpm check`; smoke-test the deployed URLs after local checks.

### Desired end state

- A developer can connect the demo, chart pages, and rendering model without mistaking plans for shipped behavior.

## Below the cut line

- Astro/Starlight, unless M3 trips a trigger. Full-text search, pre-rendered article HTML, and responsive image generation are the triggers to revisit it.
- `/explorEDA/` subpath support and a base-aware path helper; the app already assumes root paths.
- Property playground, generated settings tables, API extraction, screenshots for every setting, chart changes made only for docs, Mermaid or diagram tooling.

## Open decisions

1. **Docs URL form** — keep `?view=docs&topic=` or move to `/docs/<topic>`; decide before M3 ships. Either way, keep the old URLs working.
2. **Repository rules** — an `AGENTS.md` exception for curated docs images, and one tooltip rule shared by `AGENTS.md` and `docs/ui-defaults.md`.
