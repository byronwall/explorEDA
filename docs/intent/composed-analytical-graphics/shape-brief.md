---
title: "Composed analytical graphics — shape brief"
slug: "composed-analytical-graphics"
phase: shape
status: current
last_updated: "2026-10-10"
---

# Composed analytical graphics — what remains

**Outcome:** A composition's colors and lengths mean the same thing before and after a filter, unless the author opts into rescaling.

**Primary flow:** Open a composition → filter → colors and lengths hold → optionally opt a scale into rescaling → inspect a mark.

## Feature scope

```text
Composition editor (delivered; see docs/composition-mode.md)
├── PLANNED ADDITIONS
│   └── Stable extents under filters (default)
│       ├── Strip color, size, and height scales read every row
│       ├── Bar lengths, stack heights, horizon bands, density peaks too
│       ├── Per-scale or per-mark opt-in to rescale to filtered rows
│       └── Trace and legend state which extent is used
├── EVALUATE BEFORE COMMITTING
│   ├── Hide one repeat; override one repeat's label text
│   ├── Point labels placed on a side read from a field
│   └── Bank of England percentiles in the forecast-fan example
└── LATER POSSIBILITIES
    ├── Gradients along paths and areas
    └── Further research references as authoring checks
```

## Behavior

| Situation                          | Expected result                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Filter any composition             | Colors, bar lengths, column heights, and peaks keep their scale; emptied bins draw blank or missing. |
| Author opts a scale into rescaling | That scale fits the filtered rows; its legend and trace say so.                                      |
| Open a saved composition           | It uses stable extents, including compositions saved before this change.                             |
| Inspect a colored or sized mark    | The trace states which extent set it.                                                                |

## Decisions and boundaries

**Appetite:** One change across the resolver's extent calculations. No new mark type.

**Key decision:** Stable is the default everywhere; rescaling is an opt-in beside each scale's or mark's existing shared or per-repeat choice. Existing saved compositions switch to stable too. Position and numeric domains already read every row.

**Pushback:** Stable extents do not freeze data. Stack shares, ranks, summaries, and calculations still recompute from the filtered rows; only the scale they draw on holds.

**Boundary:** Overrides stay visual. Recurring reports, a general compiler, forecast generation, and survey weighting stay outside.

**First proof:** **Try:** Filter `measles` to one decade and `population-pyramid` to one year.
**Observe:** Rates keep their colors and bars keep their length scale; an opted-in scale rescales and says so.
**Decide:** If both read correctly, extend to stacks, horizons, and densities; if the opt-in confuses, fix its wording first.
