---
title: "Funnels, retention, and interval schedules"
slug: "domain-analysis-views"
phase: plan
status: current
last_updated: "2026-10-13"
---

# Funnels, retention, and interval schedules

## My read

Some everyday questions need a domain rule that generic chart fields can't express. A funnel needs ordered stages and a rule for when an entity counts as reaching one. Retention needs entry cohorts, elapsed periods, and a denominator. A schedule needs start and end intervals that can be explored in time. Byron wants all three in explorEDA as linked views. The work starts tonight.

Correct preparation comes first. Each view computes its domain table (stage counts, a cohort grid, or interval lanes) with rules that can be tested and inspected, and only then draws it. A convincing picture with the wrong denominator or stage order would make the product less trustworthy. Funnel and timeline still need their own rendering. Retention needs its own view because its preparation lives in the chart.

No real dataset is driving this. Each view gets a representative synthetic demo dataset and a small hand-checked fixture.

## What matters most

- Counts are right by rule: ordered stages, cohort denominators, and interval overlap all match results that were worked out by hand.
- The prepared table is visible. The trace shows the stage, cohort, or interval rows behind every mark.
- Each view links like any other chart: a selection narrows the rest of the dashboard.

## The intended experience

A user loads an event log with an entity, an event name, and a timestamp. In **Funnel**, they list stages in order and optionally set a conversion window. They see how many entities reached each stage and what share carried on from the stage before. Clicking a stage narrows the other views to every event of the entities who reached it. In **Retention**, they group entities by their entry week and see the share active in each elapsed week. Clicking a cell selects those entities' events. With a bookings table, the **Timeline** shows one lane per resource and one bar per booking. Brushing a time window narrows the other views to bookings that overlap it.

## Boundaries

### Must be true

- A stage counts only when it happens after the previous stage was reached. The first occurrence wins.
- Retained in period N means any qualifying event in elapsed period N. The cohort size is the denominator.
- A brush keeps bookings that overlap the window, including open-ended ones.
- Every new view has a docs page and a demo example in the same milestone.

### Must be avoided

- Counting unordered or repeated events as completed stages.
- Treating calendar trends as retention.
- A generic domain-package framework, new analysis-step kinds, event ingestion, or a scheduling engine.

## What seems settled

- Input is a long event log, not one date column per stage. Funnel and Retention share one synthetic product event log. The timeline uses a synthetic resource-bookings set.
- Preparation is pure, tested library code owned by each chart and shown in its trace.
- Order: Funnel, then Retention, then Timeline, as one stacked PR each.
- Composition's span mark already draws static timelines. The gap is interactive, linked exploration.

## Current reality that matters

- The Sankey chart already follows the plan, trace, and settings layout these views need.
- `BaseChart` already has a horizontal brush.
- Each chart's filter function receives column getters, so a selection can be computed per entity.
- Synthetic generators live in `apps/data-samples/`.

## Next step after confirmation

Build Milestone 1. See the [shape](shape-brief.md) and the [implementation plan](implementation-plan.md).
