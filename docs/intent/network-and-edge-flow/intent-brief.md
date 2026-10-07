---
title: "Explore explicit links and edge-list flows"
slug: "network-and-edge-flow"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Explore explicit links and edge-list flows

## My read

Some datasets describe links between entities rather than one ordered categorical path per source row. Analysts may need an edge-list Sankey or a small network view to inspect those relationships. The current Sankey is already delivered; the seed is a different input meaning and, if useful, a different interaction model.

The durable goal is following real links back to their source records. Nodes, edges, weights, duplicate links, and direction need clear identities. A graph layout is not the main capability. Keep path-based flow and explicit-edge flow distinguishable so users know which records and totals a selection represents.

This remains a future seed. Its expansion trigger is a proposed decision rule, not a release commitment.

## What matters most

- Define node, edge, direction, and weight identity.
- Inspect original edge records and omissions.
- Explain conservation only where the input supports it.

## The intended experience

Supply a small table of source node, destination node, and optional weight. Inspect a link, select its original records, and compare node totals with incoming and outgoing edges. For a network, navigate one entity’s neighbors and retain context. Keep current stage-based Sankey as a valid separate workflow.

## Boundaries

Do not infer event sequences from unordered edges. Cycles and repeated edges need an explicit rule. Do not promise flow conservation for arbitrary networks. Keep graph editing, live topology services, force-layout tuning platforms, and graph databases outside the first proof.

## What seems settled

This is a future input-contract seed. Reimplementing the current Sankey or parallel coordinates is outside scope. A network view is conditional on a demonstrated linked-entity task.

## Current reality that matters

Sankey uses two to six ordered categorical stages per row and count or nonnegative sum. Its nodes and links trace contributors. The current registry has no general network view or separate edge-list flow mode.

## Expansion trigger

Expand when actual data arrives as edges, or a user needs neighbors and cycles that cannot be represented honestly as ordered stages.

## Next step after confirmation

Use six explicit edges, including a duplicate and a cycle. Show identity and contributors in a table before choosing geometry. Decide whether adapting Sankey is sufficient or a network interaction is necessary.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
