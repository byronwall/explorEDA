---
title: "Funnels, retention, and interval schedules — shape brief"
slug: "domain-analysis-views"
phase: shape
status: current
last_updated: "2026-10-13"
---

# Funnels, retention, and interval schedules — what we are adding

**Outcome:** Users answer funnel, cohort-retention, and schedule questions as linked views, with prepared tables they can inspect.

**Primary flow:** Load an event log or bookings table → add Funnel, Retention, or Timeline → pick fields → read and inspect the prepared table → click or brush to narrow the dashboard.

## Feature scope

```text
Domain views
├── PLANNED ADDITIONS
│   ├── Funnel chart (event log)
│   │   ├── Settings: entity field, event field, time field, ordered stages (2–8), optional window in days
│   │   ├── Horizontal stage bars: count, % of first stage, % of previous stage, drop-off between stages
│   │   ├── Trace: the stage table, and why an entity stopped (never did it, or did it out of order)
│   │   └── Click a stage → select every event of the entities who reached it
│   ├── Retention chart (same event log)
│   │   ├── Settings: entity, time, entry event (default: first event), period (day, week, month), periods shown, optional activity events
│   │   ├── Cohort × elapsed-period grid with % active and cohort size; shared heat scale
│   │   ├── Trace: cohort size, active count, and rate per cell
│   │   └── Click a cell → select every event of those entities
│   ├── Timeline chart (intervals)
│   │   ├── Settings: start, end, lane field, color field, label field, open end treated as "now" or the data's last time
│   │   ├── One lane per resource, one bar per row, date axis
│   │   ├── Brush a time window → keep rows whose interval overlaps it
│   │   └── Click a bar → select that row (standard chart behavior)
│   └── Demo data, docs, examples
│       ├── product-events.csv: ~1,500 users over 6 months, channel and plan, with out-of-order, repeated, and skipped stages planted
│       ├── room-bookings.csv: ~12 rooms over 4 weeks, overlaps, open-ended and cancelled bookings
│       └── /docs/funnel, /docs/retention, /docs/timeline, plus one demo example each
└── LATER POSSIBILITIES
    ├── Timeline concurrency strip and overlap highlighting
    ├── Funnel and retention breakdown by segment
    ├── Funnel and cohort as analysis-query steps
    └── Wide stage-date input and survival-style retention
```

## Behavior

| Situation                               | Expected result                                                                                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User did stage 3 before stage 2         | Counts at stage 2 only. Reaches stage 3 only with a stage 3 event after its first stage 2 event.                                                               |
| Window is 14 days                       | A stage counts only within 14 days of the entity's first stage 1 event.                                                                                        |
| User skipped week 2, returned in week 3 | Retained in week 3, not week 2.                                                                                                                                |
| Cohort's week 5 is still in the future  | The cell is blank, not 0%.                                                                                                                                     |
| Booking has no end                      | Drawn to the open-end limit and kept by any brush past its start.                                                                                              |
| Other dashboard filters active          | Funnel and retention count only the filtered events. The trace says whether a click's entity set came from all rows or filtered rows (the plan settles which). |

## Examples

Hand fixture (proposed, Milestone 1): four users, stages `view → signup → pay`.

```text
u1 view, signup, pay          → reaches 3
u2 view, pay, signup          → reaches 2 (pay was before signup)
u3 signup, view, signup, pay  → reaches 3 (stage 2 is the signup after view)
u4 view                       → reaches 1
Expected: 4 → 3 → 2
```

## Decisions and boundaries

**Appetite:** Three charts tonight, one stacked PR each. No new analysis-step kinds and no filter-model changes.

**Key decision:** Preparation lives in a pure `*Plan.ts` per chart, following the Sankey pattern, and is tested against hand fixtures before any rendering. Every selection is an ordinary filter, so chips, Clear filters, the Filters tab, and Dashboard text work unchanged. A funnel step is a value filter on the event field, which the funnel's filter function reads as "entities that reached this step" over all rows. A retention cell is a value filter listing its entities. A timeline window is two date-range filters that together mean overlap.

**Boundary:** Not a scheduling engine, not event ingestion, and no change to Composition span marks. Retention with partial periods leaves cells blank and never extrapolates them.

**First proof:** **Try:** `funnelPlan` against the hand fixture and the planted traps in `product-events.csv`. **Observe:** stage counts match hand-computed numbers. Clicking a stage narrows a DataTable to those users' events. **Decide:** if per-entity selection can't run inside `getFilterFunction` fast enough on ~30k events (target under 50 ms), switch the stored selection to a value filter on the entity field before building Retention.

See the [intent](intent-brief.md) and the [implementation plan](implementation-plan.md).
