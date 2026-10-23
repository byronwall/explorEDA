---
title: "Built-in chart extensions"
slug: "built-in-chart-extensions"
phase: intent
status: current
last_updated: "2026-10-23"
---

# Built-in chart extensions

## My read

Progressive built-in charts shipped four extensions (see the [feature inventory](../../application-feature-inventory.md#initiatives-retired-2026-10-23)): built-in counterparts for four composition examples, ordered Scatter connections, supplied Line intervals, and Heatmap long histories. The review of all 29 composition examples found more tasks that built-in charts could cover with a bounded setting or mode. This seed keeps the candidates that are still open, each with the proof that has to pass before it is built.

The direction hasn't changed. Composition is for designs whose complexity is essential, not for tasks that a missing setting forces into it.

## What matters most

| Candidate                            | Proof before building                                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Scale scopes and compact Line panels | Separate the scale policy from exact-observation sparklines. Prove 14 panels before 51.                  |
| Grouped raw-date Line                | Only where Calendar summaries or connected Scatter lose information a task needs.                        |
| Focused Line with peers              | Compare an existing split-Line overlay first. True peer identities and an explicit reference population. |
| Numeric grouped 100% area            | Per-position denominators and a missing-position rule; don't cast a number such as Age as a date.        |
| Cohort summaries                     | Compare a faceted Box plot first. Connected summaries need sample counts and undefined-change handling.  |
| Horizontal and mirrored series Bar   | Horizontal geometry ships alone. Mirroring keeps positive source measures.                               |
| Ridgelines                           | Density on a common grid, checked at 12 and 84 groups. Rotation alone isn't density.                     |
| Split histogram                      | Stands alone. Unit cells only when row-per-cell inspection adds value.                                   |
| Scatter swarm                        | Fixed numeric coordinates, consistent hit targets, and an honest result for crowded lanes.               |
| Mosaic Bar width                     | Compare count-plus-percent views first. Both denominators traced.                                        |

## Boundaries

- Reuse existing Notes, facets, color, and chart-local filters. No second labeling system and no one chart type per example.
- No general composition-backed engine, and no arbitrary charts inside table cells.
- Keep the composition examples. Built-in counterparts sit beside them.
- Each candidate ships with its docs section and a runnable example.

## What seems settled

Ranked Line (needs grouped raw-date Line and tie rules), Horizon (needs a demonstrated compact-display need), shared geographic tiles, exact stream baselines, bulk record labels, and internal Bar labels all wait for a named task.

## Next step after confirmation

Pick the candidate with a real task behind it and run its proof.
