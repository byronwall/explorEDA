---
title: "Database-backed analysis adapters"
slug: "database-adapters"
phase: intent
status: draft
last_updated: "2026-10-12"
---

# Database-backed analysis adapters

## My read

Analysts should explore real database data with the same responsive, trustworthy behavior they expect from data already loaded in the browser. A full client snapshot is useful when it fits the source and keeps filtering immediate. A smaller server result may be needed when a full snapshot is too large or too slow, but it must represent what the charts and inspection tools actually need. The current evidence does not set a row ceiling, latency promise, database choice, or query language.

The first useful step is a host-owned read of a registered source set into explorEDA’s existing `tables` input. That keeps current evaluation, chart filters, and record inspection in charge while a real database proves the boundary. PostgreSQL is the first driver candidate. A second driver should follow only if it tests whether a shared adapter boundary is useful. A complete snapshot may cost more transfer and browser memory than a narrow server query; measure that cost before choosing a broader query path.

The product is hosted as a dedicated application instance for each paying customer. Setup and routine operation should need little manual work. This defines the operating unit, but leaves the hosting platform, isolation details, budget, and customer database location open. This initiative supplies driver and connection constraints to the hosting work.

## What matters most

- Preserve correct field values, row identity, filter scope, inspection, and contributor meaning.
- Keep local filtering responsive when a complete snapshot fits.
- Make incomplete or unsupported results visible; never label partial data complete.
- Make per-customer setup and operation repeatable with low manual work.

## Boundaries

### Must be true

- Database access uses host-owned source definitions and permissions.
- A snapshot is complete, type-safe for its declared uses, and coherent across its sources, or it fails with a clear reason.
- Any later server query proves its own null, identity, join, aggregation, and coverage rules.
- Each substantial step leaves a useful, testable state.

### Must be avoided

- Do not claim SQL and JavaScript analysis parity from similar operation names.
- Do not silently lose precision, change field types, rebound selections, or publish a mixed snapshot.
- Do not introduce a universal SQL compiler, federation layer, or dual local/server fallback without a demonstrated need.

## What seems settled

PostgreSQL is the first driver proof. A second driver follows only when it can test a useful shared boundary. Keep local analysis in the first snapshot path. Require explicit evidence for type admission, null and identity behavior, joins, aggregation, completion, and cleanup.

## Current reality that matters

`ExplorEdaProject` accepts source row arrays through `tables` and evaluates queries locally, including source, lookup, expand, calculate, filter, and aggregate stages. The repository has no remote query execution prop. This is a useful first seam, not evidence that full snapshots meet a customer workload.

## Possibilities, not decisions

Binary transport, progressive row loading, SQL pushdown, SQLite or another second driver, DuckDB, and the hosting platform remain candidates. The notebook’s 10,000–100,000 rows describe an example workload, not a product limit.

## Next step after confirmation

Shape a bounded source-snapshot proof with PostgreSQL first. State the conditions that would justify a second driver and a narrower server query.
