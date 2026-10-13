---
title: "Database-backed analysis adapters — shape brief"
slug: "database-adapters"
phase: shape
status: draft
last_updated: "2026-10-12"
---

# Database-backed analysis adapters — what we are adding

**Outcome:** Analysts can load registered database data into explorEDA and explore it with correct, responsive local behavior.

**Primary flow:** A customer’s host authenticates a read → loads one bounded, complete source snapshot → passes typed rows to `ExplorEdaProject.tables` → the existing evaluator and charts run locally.

## Feature scope

```text
Database-backed analysis
├── PLANNED ADDITIONS
│   ├── Host-owned source reader
│   │   ├── Reads only registered sources with restricted credentials
│   │   ├── Returns one complete, coherent snapshot or a typed failure
│   │   └── Enforces row, cell, byte, and time bounds before publication
│   ├── Declared source types and row identity
│   │   ├── Preserves supported values and rejects lossy conversions
│   │   └── Distinguishes stable keys from snapshot-only row identity
│   └── PostgreSQL proof
│       └── Keeps driver code and credentials on the host server
├── EVALUATE BEFORE COMMITTING
│   ├── A second driver, only if it tests a useful shared adapter boundary
│   └── One narrow SQL row or aggregate request, only after snapshot evidence
└── LATER POSSIBILITIES
    ├── Progressive or partial coverage with explicit consumer behavior
    ├── Cross-database federation and arbitrary server formulas
    └── DuckDB default, separate query service, or universal adapter platform
```

## Behavior

| Situation | Expected result |
| --- | --- |
| The reader obtains every approved row and field in one coherent read | Publish the snapshot with exact coverage and snapshot identity. |
| A source, field, type, limit, authorization, or read step is unsupported | Return a clear failure and publish no partial result as complete. |
| A stable key is missing | Use occurrence identity for this snapshot; refresh starts a new identity domain. |
| A planned server operation lacks proven semantics | Return `UNSUPPORTED`; do not silently use a partial server result with local evaluation. |

## Decisions and boundaries

**Appetite:** One host-owned reader path and one PostgreSQL proof. Keep current client evaluation and imported/demo data behavior. Do not create a package abstraction until a second real driver shows a stable shared boundary.

**Key decision:** Start with complete source snapshots because the current component already consumes source arrays and exposes evaluated stages and records. This preserves inspection and chart behavior while the data boundary is tested. A server row or aggregate path can reduce transfer, but needs separate proofs for coverage, filter context, identity, joins, and contributors.

**Boundary:** The browser sends registered source identifiers and bound values, never credentials, arbitrary hostnames, table names, or SQL. The host owns authentication, source registration, permissions, connection lifecycle, and per-customer settings. Preserve current local mode. Hosting platform choice stays with the hosting initiative.

**First proof:** **Try:** Load a small typed fixture through a deterministic fake and a disposable PostgreSQL instance; pass the complete rows through `tables`. **Observe:** Values and field types match, nulls stay distinct, stable and snapshot-only identity are labeled correctly, filters and inspection agree with the local fixture, all sources share one snapshot, limits reject before uncontrolled buffering, and query cleanup is observed. **Decide:** Continue only if parity and coverage hold and the workload meets an agreed response and memory budget. If full transfer fails, test one named projected-row or aggregate demand; if a shared abstraction has no demonstrated value, retain the fixed host reader.

**Open choices:** Which declared source types and precision ranges matter to the first supported customer data? What workload and response budget should the first integration satisfy?

See [intent brief](intent-brief.md) and [recommendation review](evidence/recommendation-review.md).
