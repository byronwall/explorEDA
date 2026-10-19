---
title: "Server-side queries for data too big to snapshot"
slug: "database-query-contract"
phase: intent
status: stale
last_updated: "2026-10-12"
---

# Server-side queries for data too big to snapshot

> **Reframed 2026-10-13.** Complete snapshots, connections, and drivers moved to [Database sources](../database-adapters/intent-brief.md). This initiative now covers only server-side queries for sources too big to snapshot, and comes later. The text below predates the reframe and will be rewritten when this work starts.

## My read

Analysts should explore data from real databases with the responsive linked views they have today. Each paying customer has a dedicated application instance. That instance owns the source registry and resolves which database sources the user may read. The client should keep a complete snapshot of authorized source tables when their size and fields make that practical. A full snapshot is a preference, not a rule for every source. The 10,000 to 100,000 row range is a working example; row width and device capacity remain to be measured.

The central user task is to select a segment, compare linked charts, inspect matching records and analysis stages, and clear the selection. These actions must preserve row meaning, filter scope, and honest counts. The first integration should return complete authorized source snapshots into `ExplorEdaProject.tables`, then let the existing evaluator build stages and contributors locally. If data is partial or unavailable, the product must show that state and request more data before claiming an exhaustive result.

## What matters most

- Keep linked filtering responsive when the required data is complete in the client.
- Preserve exact row membership, field meaning, and source identity across views.
- Measure a named workload before choosing a more complex read strategy.

## The experience or behavior you appear to want

Open a database-backed analysis, view linked charts and records, select a category or brush a plot, then clear the selection. The charts and record list describe the same population. When the needed projection is cached completely, selection and clearing do not wait for another database read. When required fields or rows are missing, keep the previous result tied to its actual scope while new data loads.

## Boundaries

### Must be true

- The authored analysis keeps its row meaning. View demands and temporary filters do not rewrite it.
- Customer and source identity come from the authenticated server-side instance configuration, not a browser-supplied customer selector.
- A result states which rows, fields, source snapshot, and filter scope it covers.
- Unsupported or incomplete reads cannot become exact empty results.
- The library stays in React and TypeScript. Database credentials stay on the server.

### Must be avoided

- Silent truncation, missing fields treated as null, mixed snapshots, unstable page identity, or incomplete data labeled complete.
- A general query optimizer, arbitrary SQL interface, or progressive region cache before a named workload needs it.

## What seems settled

The durable goal is correct, responsive exploration of real database data. The complete snapshot remains desirable when feasible. Query construction, transport encoding, and database adapters are separate concerns that need a shared result identity and coverage contract.

## Possibilities, not decisions

Server aggregates, field expansion, compressed column transport, and snapshot reuse are candidates. Notebook sketches and the 10,000–100,000 row range are examples, not measured limits. The fourth hosting track evaluates one dedicated instance per paying customer; this track does not choose tenancy or hosting.

## Current reality that matters

The current `ExplorEdaProject` already accepts source tables and runs the existing evaluator locally or in its optional worker. It exposes evaluated stages and contributors to inspection. Crossfilter gives each chart an owner scope, and missing fields can currently resolve to all-undefined columns. A complete source loader reuses these seams; an output-only projection would require proof that it includes dependencies for every admitted operation and inspection path.

## Next step after confirmation

This intent and initial shaping work is authorized and complete. The proposed next product proof, after implementation is authorized, uses a host-owned source reader that resolves one customer's registered sources and returns complete immutable source arrays to the existing tables input. A deterministic fake tests the evaluator and linked views. Consider source-column projections only when their dependency closure preserves every admitted analysis and inspection behavior.

## Preparation research follow-up

The 2026-10-18 [preparation research](../../research/data-preparation-boundary-2026-10-16/README.md) found no workload evidence for server execution. The proposed boundary keeps complete source snapshots and local queries. Reconsider execution placement only after a named workload misses its agreed target.

## Freshness boundary follow-up

The 2026-10-19 [freshness review](../../research/source-freshness-2026-10-18/README.md) found a possible cross-source mismatch without a capacity problem. Keep consistency work separate from execution placement and transport. First test the existing SQL source boundary. No server-query platform or shared-refresh implementation is activated.
