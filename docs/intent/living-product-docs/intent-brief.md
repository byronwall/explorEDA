---
title: "Living product documentation"
slug: "living-product-docs"
phase: intent
status: current
last_updated: "2026-10-10"
---

# Living product documentation

## My read

Byron wants documentation for the whole product, not a few chart guides: every chart type, every major flow, and every major place in the interface. The pages should mostly show the real thing. Where a reader can try a behavior with the actual components, the page should embed a working example instead of a picture. Screenshots are for the places where a live example can't show the point well.

The larger goal is trust. The docs must stay correct without someone remembering to update them. Examples should run from current code, images should regenerate, and reference details should come from the same source as the product. When the docs drift from the product, or something that should be documented isn't, the site build should fail. A missing or wrong page should be treated like a failing test, not a to-do.

This takes over from [chart and rendering documentation](../chart-and-rendering-docs/intent-brief.md). That initiative shipped scatter, bar, and rendering guides as hand-written TSX. Its October 10 revision adopted the [documentation-system research](../../research/documentation-system-recommendation.md): MDX inside the demo, with Starlight as the fallback. It still treats images as hand captures and generated reference as out of scope, and it covers only chart types. This request widens the scope and makes correctness something the build enforces.

## What matters most

- Cover all registered chart types, the major flows, and the major workspace surfaces.
- Prefer live examples built from real components; use screenshots only where live examples fall short.
- Keep every example, image, and reference detail derived from current code or regenerated from it.
- Make documentation errors and coverage gaps fail the main site build.

## The experience you appear to want

An analyst opens the docs and finds a page for the chart, flow, or surface they're working with. The page explains when to use it, then hands them a small working example to click, brush, filter, or edit. Some steps can't be shown well in one frame, such as a before-and-after flow or a narrow-screen layout. Those use a current screenshot taken from the real app. A developer finds the same honesty in the integration pages: the props, events, and saved state described are the ones the package exports today.

For Byron, adding a chart type, renaming a setting, or removing an example produces a clear build failure that names the missing or stale page. Fixing the docs becomes part of finishing the change.

## Boundaries

### Must be true

- Live examples use the real package code, not lookalike reimplementations.
- A docs or coverage error stops the Pages deployment.
- Every page's claims about behavior match what the current code does.
- Example and viewer URLs, saved sessions, and the landing page keep working. Old docs URLs (`?view=docs`) are a clean break with no redirect. Trying an example in the docs never changes a reader's saved analysis.

### Must be avoided

- Screenshots where a live example would work, and hand-captured images that can go stale.
- Hand-maintained lists that silently fall behind the code, such as chart types, settings, or example IDs.
- Docs content that states internal caveats, known bugs, or to-dos. Those belong in intent docs or issues.
- Changing chart behavior just to make it easier to document.

## What seems settled

- Scope: all chart types, major flows, and major UI and UX surfaces.
- Interactive first, screenshots second.
- Auto-updating content, and a build that fails on docs errors or gaps.
- Docs stay in the demo app and its single Pages deployment, authored as build-time MDX. Starlight is the fallback if specific triggers are hit. This comes from the research and the other initiative's revision.
- The deploy workflow moves to the pinned toolchain (Node 24, pnpm 11.9.0) before any docs build changes.
- Decided 2026-10-10: this initiative supersedes *Chart and rendering documentation*; docs may mount pieces smaller than a workspace through a docs-only kit that isn't published; Playwright runs in the Pages deploy job.

## Possibilities, not decisions

- Making each live example also a test, so the same script that powers a page proves its claims.
- Generating settings and Dashboard text key tables from chart definitions and `settingKeys.ts`.

## Current reality that matters

- `registerAllCharts.ts` registers 20 types. `demos/coverage.ts` lists 58 features, and every type appears in at least one example's usage map. It is the natural source of coverage targets and of example membership.
- `ChartDocs.tsx` holds about 940 lines of hand-written TSX for three topics at `?view=docs&topic=…`. `LandingPage` imports it eagerly.
- Examples have path URLs (`/examples/<id>`) served through a `404.html` fallback.
- An example's URL reopens the session the reader saved from that example. Edits there write to the same storage as their `/viewer` analysis, so embedding that route in docs would mix doc examples with the reader's own work.
- The landing page already mounts the public `ExplorEda` workspace directly, with a fixture and no persistence (`LiveOrderBook`). That is the proven pattern for live examples. The package has no supported single-chart embed, and the research advises against deep imports.
- `deploy.yml` builds and uploads `apps/demo/dist` on Node 20 and pnpm 8, and runs no tests.
- `AGENTS.md`'s "don't commit screenshots" rule covers PR evidence, not product images. Images generated in CI never need committing anyway.

## Next step after confirmation

Execute the [implementation plan](implementation-plan.md), starting with the deploy toolchain fix.
