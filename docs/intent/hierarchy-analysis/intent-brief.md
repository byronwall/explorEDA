---
title: "Explore nested categories and their totals"
slug: "hierarchy-analysis"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Explore nested categories and their totals

## My read

Analysts may need to understand how a total divides through several category levels. A treemap, sunburst, or hierarchy table could support that task, but the shape is secondary. The important work is defining parent-child membership, consistent totals, drill paths, and a way back to the current context.

This is a future seed with no selected renderer. Current faceting repeats views by fields, while Sankey represents ordered categorical stages. Neither automatically provides hierarchy semantics. A flat table with nested category columns may be enough for a first proof. The desired capability should remain proportionate to the supplied data.

This remains a future seed. Its expansion trigger is a proposed decision rule, not a release commitment.

## What matters most

- Explain hierarchy construction and totals.
- Keep drill context and source membership visible.
- Distinguish missing levels from real named nodes.

## The intended experience

Choose category levels, inspect the top-level total, drill into a branch, and return through a visible path. Select a node and inspect the source records counted within it. Compare child totals with the parent under the same metric. Preserve the drill position only when it remains valid after filtering.

## Boundaries

Do not infer arbitrary parent relations from equal labels. Define whether a repeated label at different paths is a different node. Do not sum averages. Avoid graph editing, automatic taxonomy discovery, and large hierarchy layout work before one drill task proves useful.

## What seems settled

Treemap and sunburst are examples rather than requirements. The Pro review conditions them on a real hierarchy need. No existing chart initiative is reopened by capturing this possibility.

## Current reality that matters

The registry has no hierarchy view. Pivot accepts multiple row fields; facets support one- or two-field repetition. Those are reusable entry points for a small hierarchy proof, not evidence of complete hierarchy totals and navigation.

## Expansion trigger

Expand when a dataset has several meaningful category levels and flat rankings make the parent-child relationship hard to inspect.

## Next step after confirmation

Use two category levels and a hand-checkable sum. Show a simple hierarchy table with drill and source inspection. Decide whether spatial area encoding adds value before choosing treemap or sunburst.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
