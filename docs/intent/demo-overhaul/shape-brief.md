---
title: "Demo overhaul — complete analysis examples"
slug: "demo-overhaul"
phase: shape
status: current
last_updated: "2026-10-06"
---

# Demo overhaul — complete analysis examples

**Outcome:** Analysts see completed work that demonstrates explorEDA's power and makes them want to explore their own CSV files.

**Primary flow:** Find a capability or topic → open a complete analysis → inspect and change its results → import personal data.

## Feature scope

```text
Curated analysis catalogue
├── PLANNED ADDITIONS
│   ├── Capability discovery alongside topic names
│   │   ├── Feature choices narrow the same catalogue; no duplicate entries
│   │   └── Entries show analytical questions and their exposed capabilities
│   ├── Four complete analyses, with focused tabs available in any order
│   │   ├── Flights: delay transitions, paired delays, weather, dates, fleet mix
│   │   ├── Beijing: coverage, seasons, joint density, ozone fits, pollutant profiles
│   │   ├── World Bank: income/longevity, matched endpoints, paths, maps, access gains
│   │   └── Earthquakes: geography, dates, magnitude/depth, distributions, metadata
│   ├── Finished, editable views
│   │   ├── Strong opening result; concise findings computed from real data
│   │   ├── Main chart with useful linked comparisons and source evidence
│   │   ├── Prepared source tables and relationships available for inspection
│   │   └── Visible filters and accessible route to importing personal data
│   └── Retained Wine, combined Shop, and Lorenz analyses
│       └── Preserve valuable capabilities while reducing repeated entries
└── LATER POSSIBILITIES
    └── Rich report capture and sharing, only when a separate need warrants them
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Open an example | A complete result appears immediately; no setup lesson or required action. |
| Choose a tab | Open that prepared analysis state. Keep each tab's filters distinct and retain edits on return. |
| Filter a chart | Linked results in that view update. Saved findings remain identified with their original state. |
| Inspect an added field | The landed multi-table feature shows its source and matching evidence. |
| Import personal data | Start its workspace using current import behavior. Do not copy incompatible example charts or claims. |

## Catalogue proposal

Propose **seven public entries**, down from 22. All four new families are included. Each entry must earn its place through distinctive analytical value. Keep dataset subjects and capability labels together.

| Action | Current example IDs | Proposed destination or reason |
| --- | --- | --- |
| Keep | `wine-chemistry` | Preserve the strong scatter work and refine it as a complete Wine analysis. |
| Keep | `lorenz-3d` | A distinct completed simulation analysis preserves meaningful 3D coverage. |
| Combine | `shop-operations`, `calendar-series`, `grouped-bars`, `area-charts`, `stacked-bars`, `calculated-orders`, `shop-10000`, `categorical-charts` | One Shop analysis: overview, sales mix, calendar, and contribution/delivery. Curate charts instead of copying every layout. |
| Remove public entries | `scatter-regression`, `palmer-penguins`, `nba-stats` | Grouped fits, parallel coordinates, summaries, pivots, and sorting move into retained/new analyses. |
| Remove public entries | `scatter-density`, `scatter-surfaces`, `box-plot`, `distribution-discovery` | Density and distributions move into Wine, Flights, Beijing, and Earthquakes. |
| Remove public entries | `region-map`, `point-map`, `bubble-scatter`, `product-activity`, `scatter-trace` | Maps, bubbles, time patterns, and tracing move into complete analyses. |

Delivered as proposed. Removed entries leave the catalogue but still open from their URLs, so old links and saved layouts keep working; `listed` in `examples.ts` reverts any of them. The small `multi-source-shop` example is also unlisted, since the four new analyses show related tables at full scale. Test fixtures and data assets are unchanged.

## Decisions and boundaries

**Appetite:** All four new families, Wine, one consolidated Shop example, and Lorenz. Curate the twenty research designs into useful tabs. Avoid one chart-heavy page containing the entire portfolio.

**Key decision:** Use focused tabs with a completed analysis as the opening view. Each tab has an outcome name and enough context to stand alone. This shows finished work while keeping analytical depth available. A report page would emphasize reading; a single dense dashboard would crowd the results. A stepper conflicts with the requested experience.

Reuse the compact workspace, saved tabs, notes, inspection controls, and import path. Keep the existing visual system. Replace instruction banners with short result context. The proposed Wine/Shop/Lorenz choices require browser review before removal decisions become final.

**Dependency:** Assume multi-table support is landed before work starts. Use its real local tables and relationship contract. If that assumption fails, record the blocker rather than implementing a second enrichment path. Separate data retrieval and auditing from the runtime: normal demo loads use frozen local data.

**Boundary:** Findings need evidence from the finished extract. Static numbers must identify the saved state they describe. Avoid a new report engine or sharing system. Catalogue changes can be reverted through configuration until replacements pass review.

**First proof:** One complete Flights analysis with prepared multi-table relationships and focused tabs.

**Try:** Open its strongest result, move to another tab, filter a group, inspect a lookup, and reach the personal-data import.

**Observe:** The views feel complete without instructions. Results and source records agree. Feature discovery reaches the relevant tab. The import is reachable without returning through a lesson.

**Decide:** Keep this presentation if an analyst can identify a useful capability and test it without coaching. Otherwise revise the opening view, tab grouping, or discovery labels before copying the pattern. Prepare and verify all four families before declaring the overhaul complete.

See the [intent brief](intent-brief.md) and the [implementation plan](implementation-plan.md).
