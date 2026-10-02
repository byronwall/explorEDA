---
id: exp-72ve
status: in_progress
deps: []
links: []
created: 2026-10-02T04:13:16Z
type: feature
priority: 2
assignee: Byron Wall
external-ref: chart-and-rendering-docs:M1
tags: [adoption-page, chart-docs]
---
# Provide the chart index and first guides for the landing learning path

## Outcome
Add a compact chart index, scatter and bar guides, and one current rendering guide in the existing demo. Each chart guide links to a current example through the existing `?example=` state.

## Readiness and verified boundary
- Accountable owner: Byron Wall. Current writer: guides_writer; root coordinates review and independent browser proof.
- Routes: `apps/demo/src/main.tsx` mounts `LandingPage` under `BrowserRouter`. `LandingPage` owns `?example=` and `?view=coverage`; there is no docs route yet. Add stable `?view=docs&topic=...` query states here.
- Examples: `scatter-trace` (`scatterTraceDashboard`) is the focused scatter case. `shop-operations` (`shopDashboard`) contains bar views. IDs and chart types are present in `apps/demo/src/demos/examples.ts` and `dashboardSettings.ts`.
- Package: the demo lazy-loads public `ExplorEda` from `exploreda` and imports its CSS in `main.tsx`. Do not add a standalone chart API or alter package behavior.
- Static host: Vite uses `base: "/"`; Pages uploads `apps/demo/dist`; README names `https://exploreda.dev`. The root host serves `/?view=docs&topic=...` and query refreshes without a pathname rewrite. `/explorEDA/` is not the configured base. Local built-preview refresh still needs browser proof. Production URLs cannot expose these routes until deployment, which this ticket excludes.
- Current trace claims: the feature inventory and runtime code support inspectable scatter and bar plans. Other chart types do not share this trace path. Keep the guide's worked trace limited to the supported paths and explain other renderers only where source confirms them.
- Decision: existing Vite/React app and query routing are the accepted small path; no docs framework choice, server, package rewrite, or new dependency is needed for this ticket.

## Scope
Create a short index; scatter and bar pages with purpose, fields, computation, row scope, selection, key settings, limits, one real image per chart guide, and direct matching-example links; and a rendering guide with a small data-flow diagram. Explain current behavior from source and demo. Preserve landing, examples, import, integration, restore, and Reset paths.

## Acceptance and proof
- Index, scatter, bar, and rendering guide open at stable query URLs and after refresh.
- Scatter opens `?example=scatter-trace`; bar opens `?example=shop-operations`.
- Each page uses semantic links/headings and remains usable at 1280, 783, and 390 px with pointer and keyboard navigation. Package support remains desktop at 1024 CSS px and wider.
- Runtime claims match the demo and relevant package code. The rendering guide names source rows, effective/calculated fields, shared filter scopes, chart computation, rendering, interactions, and host-owned saved settings. It does not claim all charts have tracing.
- One focused regression proof protects route/content boundaries. Run focused demo checks, `pnpm check:ui`, and `pnpm check` for this broad demo change.
- Browser proof is required before acceptance. Keep this ticket in progress until an independent browser pass supplies real chart captures and direct-refresh evidence on the local Vite preview. Production smoke is deferred because deployment is out of scope.

## Cut line
No remaining catalogue pages, landing-page bridge, API additions, package/chart behavior changes, generated reference, docs framework, deployment edit, push, or PR. `exp-4ak2` remains separate and must not start here.

## Checkpoint
Source implementation is complete; ticket remains in progress for independent guide-route proof and owner acceptance. Added query routes and content in `apps/demo`, with real 1280×720 JPEG captures from the existing scatter and order-book examples. Focused route and focus tests pass. `pnpm check` passed before the navigation repair; the repaired demo builds, `check:ui` passes, and both focused route tests pass.

The separate example walkthrough confirmed scatter drag filters Net sales $68–$104 and Contribution $22–$40 to 2/18 rows, then clear restores 18. The order-book delivery histogram drag filters Delivery Days 1.5–4.5 to 265/500; clear restores 500. These are observed example baselines, not guarantees. A single numeric bin click/Enter does not filter; the guide correctly describes dragging across bins.

The browser pass found that changing guide routes kept scroll position at 592 px and focus on BODY. A shared docs-route layout effect now resets scroll and focuses the new heading, including when docs first opens. The focused regression proof passes. Next: retest this repair, then finish direct refresh and layout proof at 1280, 783, and 390 px on the local Vite preview. Production smoke remains deferred; no deployment is authorized. Owner controls acceptance and closure.

## Provenance
Chart and rendering documentation: first proof and M1. Developer adoption page: M3 prerequisite. Baseline d720f1f6b99d0a54564da5486da94208a563c71e. Existing landing example and integration paths are delivered. Documentation routes are absent. This ticket supplies only the prerequisite slice, not the full documentation initiative.
