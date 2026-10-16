---
title: "Progressive built-in charts — shape brief"
slug: "progressive-built-in-charts"
phase: shape
status: proposed
last_updated: "2026-10-12"
---

# Progressive built-in charts — proposed scope

**Outcome:** Users can build advanced, coherent charts without learning composition.

**Primary flow:** Add a familiar chart → choose fields → enable a named operation → reveal its relevant controls.

## Feature scope

```text
Progressive chart controls
├── FIRST PROPOSED ADDITIONS
│   ├── Teach four existing analytical routes
│   │   ├── Income/life: Scatter with log axis, bubbles, color, and keyed Notes
│   │   ├── Media/deaths and Du Bois: 100% series Bar with source sums
│   │   └── Unemployment: monthly summed stacked-area Line
│   ├── Scatter: Connect observations, off by default
│   │   ├── Explicit order, straight connections, and source point/segment access
│   │   └── Then grouped paths, slope labels, and two-role Paired dots
│   ├── Line: complete the existing Notes → Interval operation
│   │   └── Include bounds in domains; preserve gaps and source evidence
│   └── Heatmap: complete long histories
│       ├── Independent row/column limits and order; date bins
│       └── Explicit aggregate color bounds using existing color controls
├── EVALUATE AS FOLLOWING SLICES
│   ├── Line: exact grouped observations, compact facets, and explicit scale scope
│   ├── Line: peer context and numeric 100% areas
│   ├── Bar: horizontal, mirrored, and Mosaic modes
│   ├── Box Plot: cohort summaries and a shared-density Ridgeline mode
│   ├── Scatter: categorical Swarm placement
│   └── Supplied-lane intervals with a saved open-end reference
└── KEEP BEHIND A SEPARATE PROOF
    ├── Unit cells, dynamic ranks, Horizon, and geographic tile layouts
    ├── Bulk labels, exact stream baselines, and segment-label polish
    └── Ordinary-chart image output with all intended context and facets
```

The [complete example review](example-review.md) covers all 29 designs. Four already have built-in analytical routes.
Fourteen need bounded extensions. Seven share five specialist mode or family contracts.
Three retain a conditional composition role, and one clearly needs its complete composed arrangement.

“Bounded” does not mean a trivial toggle. Connections need source identity and interaction work.
Exact sparklines need grouped date observations. A rotated violin cannot supply comparable density heights.

## Behavior

| Situation | Expected result |
| --- | --- |
| An advanced operation is off | The ordinary chart remains simple. |
| The user enables an operation | Show only its fields, limits, and meaningful choices. |
| A filter changes a comparison | Keep source rows, denominator, reference population, and scale policy explicit. |
| Data is absent, invalid, or zero | Preserve those distinct states. Do not invent a point or interval. |
| The user edits view limits | Clip the view without changing linked filters. |
| A mark is selected or traced | Pointer and keyboard reach the same original evidence. |

Place controls in the existing Data, Facets, Axes, Labels, Notes, and Filters tabs.
Use local foldouts for advanced details. Do not add a universal Advanced tab or another annotation system.
Save edits through the existing settings objects and one-edit undo path.

## Decisions and boundaries

**Appetite:** Prove existing alternatives, then deliver bounded changes to Scatter, Line intervals, and Heatmap.
Later capabilities need separate proof before implementation. This review supplies no time budget or permission to implement.

**Key decision:** Extend the chart that owns the analytical operation. Share small calculation helpers where their source contracts match.
A universal composition wrapper would retain the advanced editing burden and introduce broad interaction work.

**Composition boundary:** Keep `covid-compare` for independent windows and benchmark populations within each state panel.
Keep geographic layouts in `covid-tiles` and `elections`, and the aligned mixed graphic in `banana-yields`.
Their simpler analytical routes should still be available through ordinary charts.

**Output boundary:** Analytical parity does not establish an identical report image. Preserve all originals and the current composition PNG route.
Remove no example in this initiative's first scope. New controls remain optional; ordinary defaults remain available.

**First proof:** Check whether four current public chart routes preserve the important comparisons.
**Try:** Author the four existing counterparts through public controls and save them.
**Observe:** Compare values, selected rows, denominator traces, keyed labels, and saved/text restoration.
**Decide:** Promote a counterpart only when these checks pass. Reopen its verdict if an essential comparison is lost.
Then prove one driving trajectory ordered by Year, including a reversal along the Miles axis.

See the [intent](intent-brief.md), [plan](implementation-plan.md), and [recommendation decisions](recommendation-decisions.md).
