---
title: "Funnels, retention, and interval schedules"
slug: "domain-analysis-views"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Funnels, retention, and interval schedules

## My read

Certain questions require a domain model beyond generic chart fields. A funnel needs an ordered definition of stages and eligible entities. Retention needs cohorts, elapsed periods, and a denominator. A Gantt view needs start/end intervals and a meaning for overlap. This seed preserves those possibilities without treating three renderer names as one implementation commitment.

The shared intent is bringing a repeated domain task into the workspace when generic linked views are insufficient. Each candidate must start from its own source grain and independent expected results. A convincing picture with the wrong denominator or sequence would make the product less trustworthy.

This remains a future seed. Its expansion trigger is a proposed decision rule, not a release commitment.

## What matters most

- Define domain grain before choosing a renderer.
- Make stages, cohorts, or interval boundaries inspectable.
- Expand only the domain backed by an actual dataset.

## The intended experience

For a funnel, follow eligible entities through declared stages. For retention, select an entry cohort and inspect survival or return by elapsed period. For schedules, inspect an interval and its source record. In each case, use linked source inspection to explain the result rather than conceal domain preparation.

## Boundaries

Do not count unordered events as completed stages. Do not confuse calendar trends with retention. Do not assume interval endpoints are both inclusive. Avoid a generic domain-package framework, event ingestion service, or scheduling engine. Separate the three proofs and allow the other two to stay seeds.

## What seems settled

These are uncommitted conditional possibilities from the comparison review. Capturing them does not select a first domain, audience, or release appetite.

## Current reality that matters

Current calendar reductions summarize source events by UTC period. Sankey summarizes categorical paths. Neither establishes cohort-entry rules, funnel event ordering, or schedule-interval semantics. The registry has no dedicated funnel, retention, or Gantt view.

## Expansion trigger

Expand one candidate when Byron has repeated funnel, cohort, or schedule questions that require manual preparation outside explorEDA.

## Next step after confirmation

Choose one real domain and a hand-sized fixture. Write independent expected stage counts, cohort rates, or overlap results. Decide whether existing views with explicit preparation suffice before adding a dedicated chart.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
