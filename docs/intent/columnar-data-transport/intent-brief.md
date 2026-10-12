---
title: "Columnar data transport"
slug: "columnar-data-transport"
phase: shape
status: draft
last_updated: "2026-10-12"
---

# Columnar data transport

## My read

You want database-backed exploration to stay responsive while preserving the meaning of each record and view. A complete client snapshot is useful when its transfer and full resident cost fit. It is not required for every query or source. The first target is a bounded complete snapshot for representative work around 10,000–100,000 rows, with width and key size varied. This range guides the proof; it is not a hard product limit.

The transport choice is still open. Use a bounded complete source snapshot as the semantic baseline, then compare Arrow IPC with lossless, schema-described row JSON. Both candidates must use the same snapshot, HTTP compression, current row consumers, and completion rules. Count server encoding, decoder startup, row construction, provider setup, filtering, chart work, and memory during replacement. Adopt Arrow only if it preserves supported behavior and improves the complete path by a declared measure. Do not treat a smaller body as a user benefit by itself.

## What matters most

- Filtering and inspection must describe the same records and values as the source.
- Complete results and limited coverage must be distinguishable.
- The client must remain responsive within measured memory and copy budgets.
- Data, caches, and temporary results belong to one dedicated customer instance.

## The experience or behavior you appear to want

The user chooses a database-backed view and receives enough complete rows and fields to explore it accurately. Local filtering stays available where the snapshot contains the required population and fields. If the result is too large or unsupported, the system asks for a narrower complete projection, returns an exact aggregate with clear inspection limits, or reports the limit. It never presents silent truncation as complete data.

## Boundaries

### Must be true

- Results identify their source snapshot, row grain and key/order domain, schema, population scope, field and row coverage, counts, and successful completion.
- Unsupported or lossy value conversions fail with a clear capability result.
- The first application proof publishes one completed source snapshot into the existing row consumer boundary; any narrower projection states its complete row and field coverage.
- Encoding comparisons include the existing row-based provider, Crossfilter, chart, and trace costs.

### Must be avoided

- Joining fields by matching row counts alone.
- Calling a transport end-to-end zero-copy without a measured allocation ledger.
- Shipping both encodings as a runtime fallback or default dual-format system before the benchmark selects one.
- Sharing customer data or result caches across dedicated customer instances.

## What seems settled

- The binary candidate is Arrow IPC stream with no internal compression and negotiated HTTP gzip.
- Lossless row JSON is the simpler benchmark baseline.
- Parquet delivery, a custom codec, a resident column store, and a general progressive cache are outside the first proof.
- Snapshot identity, type exactness, coverage, and capacity are shared contracts with query, adapter, and hosting work.

## Next step after confirmation

Shape the bounded proof and its adoption gate. Keep platform selection and implementation sequencing with their owning work.
