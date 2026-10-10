---
title: "Composed analytical graphics — shape brief"
slug: "composed-analytical-graphics"
phase: shape
status: current
last_updated: "2026-10-10"
---

# Composed analytical graphics — what we are adding

**Outcome:** Authors finish one polished, traceable graphic for a report or presentation.

**Primary flow:** Start blank → define a unit → repeat it → refine it → inspect, save, and copy PNG.

## Feature scope

```text
Composition editor
├── EXISTING FIRST SLICE
│   ├── Fixed artboard; title, subtitle, notes, guides, and annotations
│   ├── Rectangle or circle strips in date or category bins
│   ├── Repeated rows, columns, or grids with shared or local domains
│   ├── Scoped calculations; template edits and saved visual overrides
│   └── Edit/view modes, source tracing, save/restore, and PNG copying
├── PLANNED ADDITIONS
│   ├── Ordered paths in numeric frames
│   │   └── Points and paths use the same coordinates and data anchors
│   ├── Supplied lower/upper bands with explicit gaps and layer order
│   ├── Paired cohort medians and quartiles with inspectable populations
│   ├── Normalized stacks with stable category order and denominators
│   └── Two coordinated frames within one repeated unit
├── EVALUATE BEFORE COMMITTING
│   ├── Fixed comparison domains, source order, palettes, and missing cells
│   ├── Repeats positioned by explicit row and column fields
│   └── Horizontal bars, variable repeat height, and path/area gradients
└── LATER POSSIBILITIES
    └── Further output formats and automatic label placement
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Edit a template | Every repeat changes; saved visual exceptions remain attached to subset identities. |
| Move a group | Its text, frames, guides, and annotations move together. |
| Change data or filters | Data anchors follow their marks; frame and page anchors keep their declared scope. |
| Inspect a calculation | Show its population, filter policy, inputs, and formula. |
| Compare repeated panels | Use common scales by default; show and save any local-domain choice. |
| Highlight a stacked category | Preserve its denominator unless the author explicitly changes the population. |
| Restore or copy output | Preserve placements, scope, and overrides; omit editing controls from PNG. |

## Examples

The email-style graphic remains the first authoring proof. Use about 10,000 rows, 10–15 units, and 1,000–2,000 glyphs.
These are representative sizes, not capacity limits or latency targets.

The new measles reference tests a strip's missing cells, shared colors, ordering, and fixed vaccination guide.
A small local fixture can expose those issues before a full 51-row reconstruction.
Pro's “Today” label is a hypothesis from the prompt, not a passed editor test.

Driving remains the next geometry proof. Add numeric point placement with the ordered path because both share one frame.
The technology sparkline table adds a useful follow-up check: observation order differs from calendar alignment.
The banana table needs separate annual and decade frames; the technology table does not.

## Decisions and boundaries

**Appetite:** Finish the first usable authoring flow, then extend it one capability at a time.
The 23 new references are a test collection, not a commitment to build 23 graphics.

**Key decision:** Reuse the current composition definition, resolver, inspector, save path, and PNG action.
Keep data preparation outside the renderer when a prepared table proves the required geometry.
Record packing, estimation, ranking, and weighting explicitly. Prepared data does not prove native calculation support.

The composition remains the source of truth for visual definitions and overrides.
Population, filter policy, and frame display window remain separate choices.
Start with visual instance overrides; do not add per-instance calculation or binding changes.

**Boundary:** Keep exact publication replicas, a general compiler, recursive layout, forecast generation, and survey weighting outside this work.
Recurring reports remain a separate initiative. Each new element or calculation can be omitted to retain the previous working composition.

**First proof:** **Try:** Finish the blank email-style composition, including one override, a scoped guide, and three annotation anchor types.
**Observe:** Save/reload, inspect the correct records, and paste its copied PNG into a real report or slide.
Also check one comparison or grid arrangement. Earlier code and clipboard readback evidence exist; real-target paste remains unproved.
**Decide:** Advance when the saved composition, inspection, and pasted output agree. Repair only observed failures before widening geometry.

**Next proof:** Audit a small measles fixture. Preserve zero, explicit null, and absent observations as different input states.
Record any palette or ordering limitation. Then build Driving from blank with shared numeric points and paths.

**Open choice:** Should shared value domains remain fixed under filters by default? Common scales across repeats are already agreed.
The current implementation rescales values from filtered glyphs; research does not settle the desired filter behavior.

Follow the [intent brief](intent-brief.md) and [implementation plan](implementation-plan.md).
See the [reference study](reference-study.md) for the new collection's limits.
