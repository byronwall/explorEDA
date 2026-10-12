---
title: "Responsive database-backed exploration — shape brief"
slug: "database-query-contract"
phase: shape
status: current
last_updated: "2026-10-12"
---

# Responsive database-backed exploration — what we are adding

**Outcome:** Analysts can explore database-backed data with linked views that preserve exact row meaning and scope.

**Primary flow:** Open an analysis → load authorized source tables → select or brush data → compare charts and records → clear the selection without changing the authored analysis.

## Feature scope

```text
Database-backed source snapshots
├── PLANNED ADDITIONS
│   ├── Host-owned read boundary for registered database sources
│   │   ├── Resolve customer and source identity from authenticated instance state
│   │   └── Return complete authorized source arrays to ExplorEdaProject.tables
│   ├── Existing local analysis and linked filtering
│   │   ├── Preserve query steps, stages, source references, and contributors
│   │   └── Keep selected, chart-context, workspace, local, and facet scopes distinct
│   └── Honest snapshot admission
│       ├── Name source, schema, snapshot, and complete table coverage
│       └── Reject incomplete or stale reads before replacing current tables
├── EVALUATE BEFORE COMMITTING
│   └── Source-column projection only when dependencies cover every admitted operation and inspection path
└── LATER POSSIBILITIES
    ├── Server aggregates or pages after a named workload shows a need
    └── General cache-region optimizer and progressive partial-row cache
```

## Behavior

| Situation | Expected result |
| --- | --- |
| A registered source snapshot is complete | Pass the authorized source arrays to the existing evaluator and workspace. |
| A read is pending or fails | Keep the prior snapshot paired with its scope, or show loading/error. Never report an unproved zero. |
| A late, partial, or mismatched reply arrives | Reject it. It cannot replace current tables or certify completeness. |
| A field projection is proposed | Admit it only when it includes all dependencies for each enabled operation and inspection path. |

## Decisions and boundaries

**Appetite:** One visible linked-view task and a small, explicit read contract.

**Key decision:** Start with complete authorized source-table snapshots in the existing `ExplorEdaProject.tables` path. The evaluator already builds analysis stages and contributors from those tables. Output-only or source-column projections remain candidates; admit them only after dependency closure covers every enabled operation and inspection path.

**Boundary:** The server derives customer instance and source ownership from authenticated instance configuration. The browser cannot choose a customer or registered source by supplying an identity selector. Scope query and snapshot identities to that server-owned instance and its source registry. Keep aggregates, pages, and projection conditional on proof. No arbitrary SQL or universal query translation.

**First proof:** **Try:** Have a deterministic fake return one bounded, complete source snapshot through the existing tables input. Run the current evaluator and a bar, scatter, Rows, stage, and trace flow; then inject delay, reply reordering, failure, missing source rows, and changed schema. **Observe:** Compare stage rows, contributor/source keys, selected/context/Rows membership, counts, and snapshot admission with a hand-audited oracle. **Decide:** Keep this boundary if complete source data preserves those outputs and every incomplete, stale, or mismatched reply is rejected. If a named workload exceeds agreed budgets, test a dependency-closed projection as a separate candidate.

**Open choices:** Which device and row-width workload sets the first latency and memory budgets? Can the first source provide immutable/versioned data, or only one consistent read batch?

See the [intent brief](intent-brief.md) and [recommendation review](evidence/recommendation-review.md).
