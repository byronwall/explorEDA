---
name: daily-viz
description: Add, extend, or review pieces in explorEDA's daily data viz collection (/daily): narrative notebooks, compositions, and dashboards over real datasets. Use when asked for a new daily viz, a deep-dive series, more breadth across industries or analyses, or coverage of an unused chart type or composition mark.
---

# Daily data viz

Read [docs/daily-viz.md](../../../docs/daily-viz.md) and follow its workflow in order. In short:

1. `pnpm daily coverage` to choose a gap. Breadth first: a new industry, kind of question, or unused chart word or mark. Depth comes as a series.
2. Reuse a demo dataset when one fits (`apps/demo/public/datasets/README.md`); otherwise prepare a small licensed CSV with a script.
3. `pnpm daily family <family> <csv>...` for a new family, then `pnpm daily new <kind> <family>/<slug> --title … --question … --industry … --analysis …`.
4. Write to the writing rules, declare findings in `catalog.json`, and copy each computed sentence into the prose.
5. `pnpm daily check`, then look at `/daily/<slug>` on `pnpm dev:agent` at 1280, 783, and 390 px.

When adding several pieces, run `pnpm daily coverage` again between them so the collection stays varied.
