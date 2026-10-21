---
title: "Funnels, retention, and interval schedules"
slug: "domain-analysis-views"
phase: plan
status: current
last_updated: "2026-10-21"
---

# Funnels, retention, and interval schedules

Funnel, Retention and Timeline are present in the current registry, docs and examples.
The original delivery plan below is historical. Do not rebuild these chart families.
This review does not retire the initiative or claim new browser acceptance.

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

Review the delivered views against the original [shape](shape-brief.md) and [plan](implementation-plan.md).
Keep local selection/export/undo/reopen trust first. Then run the bounded retention contract proof if selected.

## Retention observation review, 2026-10-21

The [research decision](../../research/retention-observation-2026-10-21/README.md) keeps the current snapshot contract.
The event maximum does not certify continuous collection. Unknown coverage cannot become proven inactivity.
Entry and activity use filtered event rows; chart-local all rows determine the shared horizon.
A peer activity-event filter can remove entry rows. The activity setting asks a different question.

Partial flags round through the latest event's UTC date. Daily cells never become partial under that rule.
The broad docs explanation needs a bounded contract check. No runtime defect was established.
All pools reached cohorts, including partial cells. Excluding them changes the contributing population.
Keep summary disclosure and denominator policy separate from observation metadata.

Defer a coverage endpoint until a named task supplies authoritative scope and interval facts.
One endpoint cannot represent interior gaps or unequal entity coverage.
Compare upstream preparation with the smallest relevant alternative; include contributor-inspection costs.
Do not add a coverage engine, fabricated zero events or survival model.

If explanation work earns a milestone, pair “Read the observation window” in retention.mdx with its runnable example.
Both remain proposed. No docs-site lesson or application behavior changed in this research review.
See [six dispositions](../../research/retention-observation-2026-10-21/decisions.md) and [proof plan](../../research/retention-observation-2026-10-21/originals/proof-plan.md).
