---
title: "Rank a measure in horizontal bars — shape brief"
slug: "horizontal-metric-bars"
phase: shape
status: current
last_updated: "2026-10-10"
---

# Rank a measure in horizontal bars — what we are adding

**Outcome:** The row chart ranks categories by a named grouped summary. Its numbers match the vertical bar built from that summary, and its ranking holds still while you explore.

**Primary flow:** Row chart on Region → pick "Revenue by region" (or create Sum of Revenue) → read the ranking → brush elsewhere and watch values change in place → click or Alt-click a region.

## Feature scope

```text
Row chart
├── PLANNED ADDITIONS
│   ├── Measure
│   │   ├── Count rows (today's behavior, still the default)
│   │   ├── Any grouped summary on this field: count, sum, or average, with "once per" ID
│   │   └── Create Sum or Average of a field in place, saved as a named summary
│   ├── Held ranking
│   │   ├── Order by the measure across all rows, largest first
│   │   └── Filtered value over its unfiltered value: a faint bar for counts and sums, a tick for averages
│   ├── Top N
│   │   ├── Saved setting; unset keeps today's "as many as fit"
│   │   └── Once set, Other holds the same members at every size
│   ├── Other row
│   │   ├── Value pooled from its members' rows: sums add, averages re-average
│   │   └── Lists its actual members; clicking selects all of them
│   ├── Signed values: a zero line, with negative bars extending left
│   ├── Readout, trace, and filters
│   │   ├── Hover shows the summary name, value, and contributing rows
│   │   ├── Alt-click traces included and excluded contributors, as vertical bars do
│   │   └── Click filters the category field, unchanged
│   └── Dashboard text: `row Region aggregateId=… topN=…` writes and round-trips
└── LATER POSSIBILITIES
    ├── Composition-mode horizontal measure rows
    ├── "Show as rows" from a vertical grouped-summary bar
    └── Series or stacked rows, under the expansion trigger
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Another chart filters rows | Values update; order and Other membership do not. |
| Average, filtered value above unfiltered | The bar stays readable and the context is still visible. |
| Top N = 3 on six regions, average | Other shows one pooled average over its rows, not the mean of three averages. |
| Signed measure, such as Beijing's PM2.5 above the reference station | Stations below the reference extend left of zero and rank last; Other always sits at the bottom. |
| Value unavailable (conflicting IDs) | The row shows "Unavailable" with no bar, ranked below the valued rows and above Other. |
| Summary groups by a different field than the chart | Picking a summary sets the field. Mismatched text gets a warning, and the chart says why it is empty. |
| Existing saved row charts | Render exactly as before: counts, fit-to-height Other. |

## Examples

From the shop example, beside its existing vertical `hist Revenue aggregateId=revenue-by-region`:

```text
row Region @shop-region-rank aggregateId=revenue-by-region topN=5
+ title="Revenue by region" xAxisLabel="Revenue ($)"
```

The syntax follows the generic setting keys. A shorter `group=@…` alias is not settled.

## Decisions and boundaries

**Appetite:** One renderer extension plus its settings, text keys, and tests. No new chart type, no shared bar framework.

**Key decision:** The row chart reads the same grouped-summary result as vertical bars and pools Other with the same summarizer. Adding up or averaging the drawn bar values would let the two orientations drift. Count rows keep today's behavior: per-row counts, ordered across all rows, with Other sized to fit. Top N is the only new option for count rows, and it is off unless set.

**Boundary:** Vertical bars do not change. Sorting never filters. Existing row charts keep their count behavior and layout. Removing `aggregateId` returns a chart to counting.

**First proof:** **Try:** add the shop ranking above beside its vertical bar, then filter by Category. Add a Beijing ranking on `above-reference` (a signed average over 12 stations) with Top N = 5. **Observe:** values match each vertical bar and a hand total. Negative stations sit left of zero. Other's average equals the pooled average of its rows. Order and membership hold through filtering and a resize. Alt-click lists the right contributors. **Decide:** if the row chart can render everything from the existing summary result plus one pooling call, build the rest on it. If it needs a second aggregation path, stop and extract a shared ranking plan first.

See the [intent brief](intent-brief.md).
