---
title: "Developer adoption page — shape brief"
slug: "developer-adoption-page"
phase: shape
status: current
last_updated: "2026-09-21"
---

# Developer adoption page — shape brief

## Recommendation

Reshape the existing landing view, not the product architecture. Lead with a precise statement that this is an interactive analysis workspace and an embeddable React package. Place one guided example ahead of import and restore. Follow it with a real integration example and a short explanation of what the host supplies and saves. Keep the existing tools accessible as secondary paths. This preserves Byron's application while making the package boundary legible.

## Problem and appetite

- **Problem:** A first-time developer sees file operations before a product explanation or proof.
- **Outcome:** They can understand, try, and assess the React integration within a short visit.
- **Appetite:** Small page and content changes first; no new chart or documentation system.
- **Not in this shape:** New framework adapters, claims of scale, or a full marketing redesign.

## Core shape

The page reads: product identity → featured example with one action → complete integration route → why the workspace saves application work → additional examples and file tools. The example runs through the existing `?example=` route. The package remains the source of workspace behavior; the demo owns routing, file import, and explanatory content. The host owns durable storage. The saved configuration is a restore input, not a controlled-state loop.

## Current fit

- **Reuse:** `LandingPage`, `ExampleSelector`, existing order examples, README integration guidance, and the public package entry.
- **Add:** Focused copy, one guided action, and a linked full example with its actual saved settings.
- **Avoid or replace:** The current import-first hierarchy and the coverage page as the main learning route.

## How to make this go better

- **Test the gesture first.** Verify the selected example exposes the named channel control, linked effect, record inspection, and reset.
- **Show the complete boundary.** Keep the mount snippet short, but link its actual data and saved configuration.
- **Separate audiences without a new app.** Keep “Try your data” nearby for analysts; explain React integration for developers.
- **State limits plainly.** Use only current package and runtime facts. Measure before adding performance language.

## First proof

- **Question:** Does the first visit make the product and one linked interaction clear?
- **Proof:** Reorder the existing landing page and feature one current example.
- **Observe:** At wide, intermediate, and narrow widths, a new visitor can open it, select, see linked records, reset, and reach the integration source.
- **Pass / fail:** Each action works without instructions that contradict the UI. If not, repair the example path before adding more copy.
- **Deliberately excludes:** Inline mini-demo, new charts, and a new documentation site.

## Rabbit holes and no-gos

- Do not promise a configured dashboard from a bare `<ExplorEda data={orders} />` call.
- Do not turn source-level findings into runtime, performance, or privacy claims.
- Do not treat Pro's developer-adoption framing as a decision to demote Byron's analysis app.

## Plan handoff

Build the featured path first. Add the integration explanation only after its sample runs against the current public API.
