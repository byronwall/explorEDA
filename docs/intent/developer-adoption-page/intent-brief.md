---
title: "Developer adoption page"
slug: "developer-adoption-page"
phase: intent
status: current
last_updated: "2026-09-21"
---

# Developer adoption page

## My read

The public entry page should help a developer understand what explorEDA is, see it work, and judge whether to embed it. The current page first asks for a file or saved analysis. That serves a returning analyst, but it gives a new developer no quick reason to evaluate the package. A Pro review recommends leading with the React workspace, a guided example, and a small integration path. These are useful hypotheses, not direct product decisions from Byron.

The broader project intent gives this page an important tension. Byron builds the analysis application primarily for his own use. The React package is a complete workspace that other developers can mount. The page can explain that integration honestly without making external adoption the only product goal. Its first screen should identify both the usable demo and the reusable React boundary. It should let an interested visitor make one selection, see linked consequences, inspect records, and then find the code that produces that experience.

The near-term outcome is not a marketing site or a new chart. It is a clear route from claim to working example to reproducible integration. This is a separate purpose from expanding chart coverage.

## What matters most

- State the product category and React scope in plain language.
- Show a real interaction before asking visitors to supply data.
- Show the actual host boundary and the configuration needed for the demonstrated result.
- Keep import and restore available for people who need them.

## The experience or behavior you appear to want

A visitor lands on a concise explanation, opens one featured order example, makes a guided selection, and sees linked views and source records change. They can reset the view, inspect the full example code and configuration, or import their own data. A developer can identify the package's data input, restore input, state callback, React peer scope, and limitations without reading maintenance coverage first.

## Boundaries

### Must be true

- The demonstration instruction must match a tested gesture in the live workspace.
- A short mount snippet must not claim to reproduce a configured dashboard.
- The page must distinguish demo file import from data supplied by a host application.
- Compatibility, scale, privacy, and stability claims must have direct evidence.

### Must be avoided

- Do not obscure the analysis app to make the package look like a headless engine.
- Do not replace the current entry flow with a separate documentation platform.
- Do not turn implementation coverage or an unmeasured benchmark into a trust badge.

## What seems settled

- The public package is a React workspace; its host supplies records and can retain settings.
- The existing examples are enough for the first presentation proof.
- Import and saved-analysis restore remain useful, but they need not lead the first-time path.

## Possibilities, not decisions

- The proposed hero copy and featured order example are starting points to test.
- A compact integration-facts block may answer evaluator questions. It is not a commitment to a broad compatibility policy.

## Current reality that matters

`apps/demo/src/LandingPage.tsx` puts import and saved JSON before `ExampleSelector`. The public README documents `ExplorEda`, CSS, `data`, `savedData`, and `onStateChange`. The demo already loads examples through a URL parameter. The linked ZIP adds proposed hero copy and a minimal component example. Pro did not complete a browser test, and the ZIP's snippet is not a tested dashboard reproduction.

## Next step after confirmation

Prove the new reading order and one working interaction in the current demo. Then add the exact integration example and facts that the code supports.
