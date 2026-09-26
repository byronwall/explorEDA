---
id: exp-o1pe
status: closed
deps: []
links: []
created: 2026-09-26T02:40:00Z
type: bug
priority: 2
assignee: Byron Wall
tags: [charts, legend, ui]
---

# Row chart legend overlaps the chart title at medium widths

## Outcome and Why

A row chart's color legend never covers the chart title. The overlap is visible in the "Orders by category" chart of the order book. That dashboard now runs live on the landing page, so it is the first chart many visitors see.

## Owned Context and Scope

Open `?example=shop-operations`. At a 1280 px viewport, the "Orders by category" legend (Home, Outdoors, Kitchen, Electronics) wraps over the title. Inside the landing page's live frame, the title truncates to "Orders by cate…" and the legend covers it. Start with the legend layout in `packages/explorEDA/src/components/charts/RowChart/` and the shared legend component.

## Acceptance Checklist

- The title and legend do not overlap at 1280 px or 783 px, or in the landing page frame.
- A long legend wraps below the title and does not cover it.
- Run `pnpm check:ui` and `pnpm check`.

## Cut Line and Provenance

Seen while building the landing page for PR #27. It is a package bug, not a landing page bug.

## Resolution

Row charts no longer show a color legend, because each bar is already labeled with its category (PR #27, per Byron on 2026-09-26). Other chart types keep their legends.
