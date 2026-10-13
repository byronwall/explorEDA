---
title: "Columnar data transport — shape brief"
slug: "columnar-data-transport"
phase: shape
status: draft
last_updated: "2026-10-12"
---

# Columnar data transport — what we are adding

**Outcome:** Database-backed views can use a bounded, complete result while preserving current row behavior and exact filtering.

**Primary flow:** Request one bounded complete source snapshot → validate identity, types, coverage, and completion → materialize rows → publish once → filter and inspect locally.

## Feature scope

```text
Bounded snapshot transport
└── PLANNED ADDITIONS
    ├── Complete source snapshot baseline
    │   ├── Keep current local evaluation, filtering, charts and inspection
    │   └── Allow a narrower projection only with complete declared row/field coverage
    ├── Complete result contract
    │   ├── Source snapshot, row grain, typed keys and order
    │   ├── Population scope, field/row coverage and exactness
    │   └── Schema, count meaning, completion and cancellation state
    ├── One selected response encoding
    │   ├── Compare Arrow IPC stream with lossless row JSON
    │   └── Apply the same HTTP compression and current row consumers
    ├── Atomic browser handoff
    │   ├── Decode and validate before provider publication
    │   └── Keep existing row-based filtering, charts and inspection
    └── Capacity and customer boundary
        ├── Count decoded, retained and peak client data, including copies
        └── Keep snapshots, caches and temporary data inside one customer instance
```

## Behavior

| Situation | Expected result |
| --- | --- |
| A bounded response matches its declared source, schema, row domain and expected counts | Publish it once as complete after successful end validation. |
| A batch is missing, duplicated, stale, reordered, truncated, or from a changed snapshot | Keep the prior coherent view and reject the incoming result. |
| The result omits rows or fields needed by a local filter or trace | Do not claim full local coverage; request a complete required projection or report the capability limit. |
| The source value cannot be represented by current consumers without loss | Return an explicit unsupported result before applying it. |
| The result exceeds a measured transfer or resident budget | Prefer a narrower complete projection or exact aggregate with truthful trace support; never silently return the first rows. |

## Decisions and boundaries

**Appetite:** One bounded complete-source proof at the current row boundary, with 10k and 100k fixtures. A narrower complete projection can be compared as an explicit variant. These row counts are starting fixtures, not a ceiling.

**Key decision:** Compare Arrow IPC against lossless row JSON under equal source, HTTP gzip, schema, commit timing, and row consumers. Benchmark both; then choose one production encoding. This tests whether column transport improves the whole view instead of only its wire size.

**Boundary:** First prove a complete source snapshot or complete projection. Do not build a general cache, streaming query engine, second runtime format, Parquet range reader, custom codec, or new resident column store. All memory budgets are provisional until the target browser, schema widths, keys, and provider costs are measured. Each paying customer owns its data and cache.

**First proof:** **Try:** Establish a complete 10k and 100k source snapshot through the existing project/evaluator path. Compare row JSON and Arrow at the current row boundary with the same real keys, field settings, charts, filters, and replacement lifecycle. **Observe:** Exact value and scope parity; request-to-filter-ready p95; first exact filter; encoded and decoded bytes; server CPU; decoder and row-bridge cost; retained and peak attributable memory with unique allocations and old/new overlap. **Decide:** Arrow is eligible only after correctness and capacity pass, plus either ≥20% and ≥100 ms p95 improvement or ≥25% lower peak attributable client data with ≤5% latency regression. Apply small-output and interaction guards. Otherwise choose the simpler format that passes, or stop transport work if current consumers dominate both.

**Cross-track contract:** Query work owns demand and population meaning. Adapter work owns source consistency, physical types, and fetch/cancel behavior. Hosting owns platform limits and automated lifecycle. All three must preserve authoritative snapshot identity, row grain/key/order, schema, scope, coverage, count meaning, completion, and instance ownership. See [intent](intent-brief.md) and [recommendation review](evidence/recommendation-review.md).
