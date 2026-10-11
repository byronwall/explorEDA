---
title: "Composed analytical graphics"
slug: "composed-analytical-graphics"
phase: execution
status: current
last_updated: "2026-10-10"
---

# Composed analytical graphics

## My read

Composition mode produces polished analytical graphics for reports and presentations. Authors start from a blank page, define one chart unit, repeat it across subsets, and finish the graphic with text, guides, and annotations. The result stays traceable to its source rows and saves with the workspace.

This initiative now keeps only what is still unproved or undecided.

## What seems settled

The capability ladder has shipped. Paths, bands, paired summaries, normalized stacks, and compound frames all landed, along with tiles, weights, waffles, bars, spans, horizons, densities, and beeswarms. [Composition mode](../../composition-mode.md) documents the delivered behavior and the decisions to keep. Repeats share scales by default, overrides stay visual, and position and numeric domains read every row. Copy PNG passed its real-target check on 2026-10-10: Byron pasted `covid-compare` into Apple Notes and it matched the artboard, which accepts the first release.

## What remains

- **Some scales still move while filtering.** Position and numeric domains read every row, so layout holds. Strip color, size, and height scales, bar lengths, stack column heights, horizon bands, and density peaks read only the filtered rows, so the same value changes color or length when a filter changes. Byron decided on 2026-10-10 that scales and colors stay stable through filtering by default. Rescaling to the filtered rows is something the author opts into.
- **A few authoring gaps have been noticed but not requested.** Examples: hiding one repeat, overriding a repeat's label text, and placing point labels on a side read from a field. Each needs confirmation before it becomes scope.

## What matters most

- Keep the graphic useful after the authoring session: saved, inspectable, and copyable.
- Keep population, filter policy, and display window as separate, visible choices.
- Do not silently turn a shared value into a filter-independent value.
- Keep scales and colors stable through filtering unless the author opts into rescaling. Constant change is jarring.
- Add a capability only when a reference graphic needs a reusable operation.

## Boundaries

### Must be true

- Earlier compositions keep saving, resolving, and copying unchanged as options are added.
- Generated marks and aggregates keep their link to source records.
- PNG with Copy to clipboard stays the output.

### Must be avoided

- Requiring a finished preset as the starting point.
- Per-instance changes to data bindings, calculations, or scales; overrides stay visual.
- Recurring reports and replacement-data parameterization; a separate project owns them.

## Possibilities, not decisions

The 2026-10-10 research collection still holds unbuilt references. Examples include the yield-gap squares, the banana mixed-frame table, IPCC temperature bands, and the recycling waffle tiles. They are a test collection, not a commitment. Gradients along paths and areas (entries 22 and 23) are the only capability the collection names that is still absent.

The forecast fan uses illustrative intervals. The Bank of England workbook saved in [references](references/README.md) could replace them; that is a data step, not a new capability.

## Next step after confirmation

Build stable scales as the [implementation plan](implementation-plan.md) describes.
