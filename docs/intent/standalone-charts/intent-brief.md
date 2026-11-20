---
title: "Standalone charts from data plus a config"
slug: "standalone-charts"
phase: plan
status: current
last_updated: "2026-11-19"
---

# Standalone charts from data plus a config

## My read

A colleague likes the explorEDA charts but does not want the workspace. They want to put single charts side by side in their own React app: give a chart rows and a config, and it draws. No grid, no toolbar, no Fields or Rows drawers, and no cross-chart filtering.

Today the only public way to show a chart is the whole `ExplorEda` workspace. The `exploreda/core` and `exploreda/charts/*` entries export chart definitions, but nothing public draws one. The docs site already draws one chart from data and settings through a private docs kit. That path becomes a public API.

## What matters most

- One import, one component: `<Chart data={rows} config={{ type: "bar", field: "Region" }} />`.
- A config names only what differs from the chart's defaults. Missing settings take the app's defaults.
- Every registered chart type renders this way.
- Each chart is independent. Hover readouts stay; click and brush selection are off.
- Settings can change at runtime, through the existing settings panel, when the host allows it.
- The chart's styles do not change the host's own buttons, text, or colors.

## Audience

React developers who want explorEDA charts as plain building blocks. The first user is one colleague; the npm package is the delivery path.

## Boundaries

- Do not change how the workspace behaves.
- Do not add linked filtering between standalone charts in this work.
- Do not rewrite charts or remove React from them. [Framework-neutral core](https://github.com/byronwall/explorEDA/pull/638) is separate work.

## What seems settled

Byron answered three rounds of questions on 2026-11-19.

- **Host:** React. A framework-free `render(el, …)` is not needed now.
- **Delivery:** a new `exploreda/chart` entry in the existing package.
- **Config:** a partial JSON object first. A Dashboard text line (`"bar Region"`) is wanted too, if it is close to free.
- **Interaction:** hover only. No selection state.
- **Charts:** all registered types, checked by a smoke render.
- **Chrome:** the plot only, plus a `title` the host can turn off.
- **Editing:** fully controlled. The host passes `config` and gets `onConfigChange`; nothing changes unless the host passes the new config back. Hosts can turn editing off.
- **Settings UI:** both a gear button that opens the settings popover, and a separate `<ChartSettings>` the host can place.
- **Field choices:** a `fields` prop limits the columns the settings panel offers; without it, every column in `data` is offered.
- **Size:** explicit `width` and `height` props win. Without them, the chart fills its parent.
- **CSS:** scoped. No global reset and no `:root` variables from the chart stylesheet.

## Related intent

[Headless chart rendering](../headless-chart-rendering/intent-brief.md) wants a chart image from data plus settings with no workspace. A standalone `<Chart>` is a likely first step for it, because it is the smallest host that draws one chart.

## Next step after confirmation

Build Milestone 1 of the [implementation plan](implementation-plan.md): a read-only `<Chart>` in `exploreda/chart`, with a smoke test over every registered chart type.
