---
title: "Parameterized task navigation"
slug: "parameterized-task-navigation"
phase: intent
status: current
last_updated: "2026-10-20"
---

# Parameterized task navigation

## My read

Users may later open a detail analysis from a selected entity in an overview. A store selection could open a saved detail view with that store as its parameter. Users and developers should be able to create these views and connections.

This job was previously part of [Project and task views](https://github.com/byronwall/explorEDA/blob/91b627d7307a4a14c7f123a713ce5f45662a3d22/docs/intent/project-task-views/intent-brief.md). The first goal was saved tabs containing chart definitions and filters over one source. The demo now has these tabs. Navigation remains a separate follow-up.

## What matters most

- Open detail with a visible entity or parameter context.
- Preserve the overview so users can return to their investigation.
- Let users and developers define connections.
- Explain which conditions apply in the destination.

## The intended experience

A user filters an overview to September and selects a store. They open a saved detail view for that store. The view shows the store context and its active filters. Returning to the overview preserves its work.

Whether September carries into detail remains undecided. Inheriting it answers questions about the selected period. Using destination filters supports a reusable investigation with its own population. Asking each time gives control but adds a step. These are tradeoffs to review when navigation becomes the priority.

Reusing one detail tab or keeping several instances is also unresolved. Earlier feedback accepted either and preferred easy duplication. Existing saved tabs should remain usable without configuring any connection.

## Boundaries

Use one source initially. Multiple sources and lookups belong to their own initiative. Side-by-side comparison is deferred. This follow-up owns parameter rules, connection authoring, destination reuse, and filter inheritance. It does not own tab persistence or history.

## What seems settled

Overview-to-detail remains desired later. The store example is illustrative. No inheritance policy follows from the example. Users and developers both need a route to create connections.

## Next step after confirmation

Run the existing local trust proof first. Then observe one named repeated task after a short explanation of current controls. Keep navigation deferred if that route is acceptable.

Choose destination population, range meaning, instance reuse and retained-state behavior before a feature proposal. No shape or implementation plan is current.

## Research review: 2026-10-20

[Reviewed research](../../research/task-navigation-2026-10-20/README.md) keeps the feature deferred. Current code has typed query inputs, saved bindings, duplication, query copies and source/stage opening. These are separate jobs. An entity detail recomputes its population; it does not necessarily contain the clicked mark's exact contributors.

A conditional proof can compare destination-owned filters with explicit mapped context. Preserve intentional local restrictions. Keep implicit inheritance outside that first proof. This does not select Byron's population policy.

New tabs share query definitions and some settings. Return by tab differs from Undo. Preserve existing history ownership and committed analysis state. Invalid input drafts have no current remount guarantee.

Investigate one host-authored binding only when a repeated task rejects current controls. A workspace connection editor needs separate authoring evidence. Later user/developer authoring intent remains intact.

Any future visible milestone must include its explanation and example. Pro proposes task-navigation.mdx sections for population and return, plus a taskNavigation.ts demo. These files remain proposed. See the [proof plan](https://chatgpt.com/c/6ad70eaa-e010-83e9-bfbb-400c0766d937) and [six dispositions](../../research/task-navigation-2026-10-20/decisions.md).
