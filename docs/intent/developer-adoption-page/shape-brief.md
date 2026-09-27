---
title: "Developer adoption page — shape brief"
slug: "developer-adoption-page"
phase: shape
status: current
last_updated: "2026-09-23"
---

# Developer adoption page — shape brief

## Recommendation

Rebuild the existing landing view around one real analytical question and its linked result. Lead with a precise statement that this is an interactive analysis workspace and an embeddable React package. Put a real preview and a launch action before import and restore. Follow with a reproducible integration route, a compact chart preview, and the existing file tools. Use the [comparison research](comparative-research.md) for presentation patterns, without copying competitors' claims or building a separate landing renderer.

## Problem and appetite

- **Problem:** A first-time developer sees file operations before a product explanation or proof.
- **Outcome:** They can understand, try, and assess the React integration within a short visit.
- **Appetite:** One focused page rebuild using current examples and components.
- **Not in this shape:** New charts, framework adapters, performance claims, or a separate marketing application.

## Core shape

The page reads: product identity → visual proof and one guided action → two routes (“Explore your data” and “Embed in React”) → chart breadth and docs → file tools. The example runs through the existing `?example=` route. Use an actual workspace capture or a live existing example as the preview. The package remains the source of workspace behavior; the demo owns routing and explanation. The host owns durable storage.

## Current fit

- **Reuse:** `LandingPage`, `ExampleSelector`, existing order examples, README integration guidance, and the public package entry.
- **Add:** A deliberate hero composition, a real preview, one guided action, a short chart path, and a linked full example with its actual saved settings.
- **Avoid or replace:** The current import-first hierarchy and the coverage page as the main learning route.

## How to make this go better

- **Test the gesture first.** Verify the selected example exposes the named channel control, linked effect, record inspection, and reset.
- **Show the complete boundary.** Keep the mount snippet short, but link its actual data and saved configuration.
- **Separate audiences without a new app.** Keep “Try your data” nearby for analysts; explain React integration for developers.
- **State limits plainly.** Use only current package and runtime facts. Measure before adding performance language.
- **Design from actual output.** Capture the existing workspace at three widths before choosing crop, type size, and section layout.

## First proof

- **Question:** Does the first visit make the product and one linked interaction clear?
- **Proof:** Prototype the first screen with one real example preview and a direct launch action.
- **Observe:** At wide, intermediate, and narrow widths, a new visitor can open it, select, see linked records, reset, and reach the integration source.
- **Pass / fail:** Each action works without instructions that contradict the UI. If not, repair the example path before adding more copy.
- **Deliberately excludes:** A second chart renderer, new charts, and the docs build.

## Rabbit holes and no-gos

- Do not promise a configured dashboard from a bare `<ExplorEda data={orders} />` call.
- Do not turn source-level findings into runtime, performance, or privacy claims.
- Do not treat Pro's developer-adoption framing as a decision to demote Byron's analysis app.
- Do not use static chart decoration as proof of linked filtering. Show the result in the real workspace.

## Plan handoff

Build the featured path first. Add the integration explanation only after its sample runs against the current public API.
