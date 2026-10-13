---
title: "Render charts to images without a live client"
slug: "headless-chart-rendering"
phase: intent
status: current
last_updated: "2026-10-11"
---

# Render charts to images without a live client

## My read

explorEDA should eventually be able to produce a chart image from saved state alone. That means a dataset plus chart settings, with no browser tab that has loaded the workspace, initialized stores, and mounted the chart. This came up while shaping [chart image export](../analysis-export/intent-brief.md). "Convert the whole report to PPTX" is out of scope there, but the capability underneath it matters: render any chart to PNG from state.

This is a seed, not a commitment. It captures the need so the export work does not quietly close it off.

## What matters most

- A chart image from data plus settings, with no mounted workspace.
- The output looks like the live chart for the same state, including theme and styling.
- It can run where no user is present, such as a script, a server, CI, or a batch job.

## What it would unlock

- Deck, report, or "export everything" generation built on single-chart renders.
- Exporting a chart that is not on screen through the public API.
- Visual regression tests and docs screenshots without driving the full app.
- Thumbnails for saved analyses.

## Boundaries

- Do not tackle this in the first chart-export release. That release captures live, mounted charts only.
- Do not require a universal scene graph or a chart rewrite to start. Prove it on one family first.
- Visual parity with the live chart is the goal. Where the two diverge, the live chart is the reference.

## What seems settled

The need is real and wanted, but it is not scheduled. Chart image export ships first with live capture only. Its `exportChartPng` API requires a mounted chart, and this seed is what would lift that restriction.

## Related intent

[Renderer-independent replay](../renderer-independent-replay/intent-brief.md) covers semantic reproduction: values, sources, and contributors without the workspace. This seed is about pixels. A headless renderer could build on replay's evaluated result, or it could drive the existing React charts in a headless browser. Picking between those is the first real question.

## Possibilities, not decisions

- Run the existing chart components in a headless browser (for example Playwright) against a minimal host page.
- Render offscreen in the same app: mount a chart off screen at a requested size and theme, capture it, then unmount.
- Add a renderer-neutral drawing path for a few families.

## Next step after confirmation

Leave this as a seed until a concrete task needs it. Likely triggers are a deck or report export, an API caller exporting off-screen charts, or a test or docs pipeline. At that point, run one family through one candidate route and compare its output with the live capture.
