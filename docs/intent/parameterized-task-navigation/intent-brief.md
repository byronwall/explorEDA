---
title: "Parameterized task navigation"
slug: "parameterized-task-navigation"
phase: intent
status: current
last_updated: "2026-10-04"
---

# Parameterized task navigation

## My read

Users may later open a detail analysis from a selected entity in an overview. A store selection could open a saved detail view with that store as its parameter. Users and developers should be able to create these views and connections.

This job was previously part of [Project and task views](../project-task-views/intent-brief.md). Byron's immediate goal is saved tabs containing chart definitions and filters over one source. Navigation is a separate follow-up and must not delay that first result.

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

After saved tabs are useful, review the September/store example. Choose destination filter behavior and tab reuse before shaping the connection interface. No shape or implementation plan is current for this follow-up.
