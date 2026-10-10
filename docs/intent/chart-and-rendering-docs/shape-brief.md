---
title: "Chart and rendering documentation — shape brief"
slug: "chart-and-rendering-docs"
phase: shape
status: current
last_updated: "2026-10-10"
---

# Chart and rendering documentation — shape brief

## Recommendation

Keep the docs inside the existing demo app, but move page content from TSX to build-time MDX before writing seventeen more pages. Each page imports its figures, uses three small components (`Figure`, `FigurePair`, `LiveExample`), and is registered in one typed catalogue. `LiveExample` starts an on-demand iframe of the existing example route at desktop width; a full-example link is always present. Keep Astro/Starlight as the fallback, with specific triggers below.

This adopts the core of the [documentation-system research](../../research/documentation-system-recommendation.md). It changes one thing: the research assumed nothing was built. Three TSX pages already work, so the first proof is a port of those pages, judged against what shipped. The earlier [comparison research](comparative-research.md) still governs page content; it was never a tooling shortlist.

## Problem and appetite

- **Problem:** Three guides cost about 940 lines of TSX. At twenty registered types, every caption, screenshot, and paragraph edit stays code work.
- **Outcome:** Analysts can choose and use each view; developers can follow the current rendering and state path; Byron can add a page by writing prose and dropping in images.
- **Appetite:** One small MDX shell in the demo (the research estimates 12–20 hours including proof), then pages in groups.
- **Not in this shape:** A second docs app, generated API reference, search, new chart features, or a public chart component API.

## Core shape

- **Page format (unchanged):** purpose → required fields → real example → what it computes → selection and filter behavior → key settings → limits → links to the system guide.
- **Storage:** `apps/demo/src/docs/pages/<topic>.mdx`, figures in `apps/demo/src/docs/assets/` imported explicitly, so a missing image fails the build. A small capture manifest records commit, example, viewport, and date for each figure.
- **Catalogue:** one typed module lists topics, labels, groups, and registry types. Example membership comes from `coverage.ts`, which already maps every registered type to the examples that show it. A test fails when a registered type has no page.
- **Live examples:** an iframe of `/examples/<id>` that mounts only on request and only when its container is at least 1024 px wide. It unmounts on close, topic change, or shrink. The frame isolates library CSS and overlays and needs no new API.
- **Routing:** the root `BrowserRouter` stays the only router. Load the docs branch lazily (today `LandingPage` imports `ChartDocs` eagerly) so articles do not pull in the workspace bundle.

## Current fit

- **Reuse:** `ChartDocs.tsx` prose, layout, and focus handling; `public/docs/*.jpg`; example routes; `coverage.ts`; `ChartDocs.test.tsx` and `coverage.test.ts` patterns.
- **Add:** `@mdx-js/rollup` (ordered before the React plugin), the three components, the catalogue, and the capture manifest.
- **Collisions:** `AGENTS.md` says screenshots stay in `tmp/` and are never committed, yet curated docs images already are. `AGENTS.md` says tooltips open on hover and focus; `docs/ui-defaults.md` says hover only. New docs controls use visible labels, so neither blocks the proof.

## How to make this go better

- **Port, don't greenfield.** Converting the three shipped pages gives a direct before/after on line count and edit cost, and the existing tests and browser evidence become the regression bar.
- **Keep one router and one deployment.** The research's query-URL advice predates path routes; the demo now relies on a `404.html` fallback, so the docs URL form is a choice, not a constraint (see decisions).
- **Derive the catalogue from `coverage.ts`.** That avoids a third hand-kept list next to the registry and the example table, which already drifted once (`line-chart`, `tables`, `color-legend` never existed).
- **Fix the deploy toolchain first, separately.** `deploy.yml` uses Node 20 with pnpm 8 while the repo pins pnpm 11.9.0 and releases on Node 24. Adding a build plugin on top of a mismatched install muddies any failure.
- **Treat the iframe as a probe with a fallback.** If framing fails, try the existing direct `ExplorEda` mount pattern from `LiveOrderBook` once. Links remain either way, so embedding never blocks pages.

## Rabbit holes and no-gos

- Do not build search, image resizing, or a docs theme; those are the Starlight triggers.
- Do not support a `/explorEDA/` subpath base. The app already hard-codes root paths such as `/examples/<id>`, and the Vite base and README target the custom domain at `/`.
- Do not claim one renderer: scatter uses Canvas and SVG, 3D uses Three.js, tables use HTML.
- Do not describe retired traceability plans as shipped; re-verify the rendering guide against source, because the tracing-status document it cited has been retired.

## First proof

- **Question:** Does MDX make the existing three pages cheaper to edit without losing anything, and can a real workspace run inline?
- **Proof:** Port scatter, bar, and rendering to MDX with imported figures; add one `LiveExample` to the scatter page.
- **Observe:** Same URLs, content, and focus behavior; existing tests pass; a screenshot swap touches one file; a deleted image fails the build; the frame runs a real brush at 1280 px and stays unmounted at 783 and 390 px.
- **Pass / fail:** Fail and switch to Starlight if image authoring needs per-page glue, navigation or search needs grow a custom content framework, or the shell exceeds about 20 hours. Fail the embed approach (not the system) if neither the iframe nor a direct mount works.
- **Excludes:** New pages, search, and any chart change.

## Plan handoff

Fix the deploy toolchain, then port the three shipped guides to MDX with one live example. Fill the original eleven types next, then the newer nine, checking the running demo as each group lands.

## Decisions for Byron

1. **Docs URLs.** Keep `?view=docs&topic=scatter` (works today, no fallback page needed) or move to `/docs/scatter` to match `/examples/<id>` (cleaner, but direct loads are served by `404.html` with a 404 status). Either way, old links must keep working. I lean toward `/docs/<topic>` for consistency, decided before more pages are linked.
2. **Repository rules.** Approve a one-line `AGENTS.md` exception for curated images under the docs assets folder, and pick one tooltip rule.
