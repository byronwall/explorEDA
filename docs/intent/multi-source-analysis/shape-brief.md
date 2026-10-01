---
title: "Multiple sources and lookups — shape brief"
slug: "multi-source-analysis"
phase: shape
status: provisional
last_updated: "2026-09-29"
---

# Multiple sources and lookups — shape brief

## Recommendation

Propose one base source per task view, enriched through explicit lookups. Keep orders, customers, and products distinct in the project definition. Resolve lookup fields before giving a single working dataset to the existing chart engine.

This is the smallest proposed shape that proves the selected lookup workflow. Separate views can choose different base sources. Charts with different populations in the same dashboard and automatic cross-source filtering remain below the first cut. The current single-source projects proceed independently.

## Problem and appetite

- **Problem:** One supplied row array cannot describe related tables or the origin of lookup-derived fields.
- **Outcome:** Users combine source attributes while retaining clear row populations and trustworthy counts.
- **Appetite:** One orders-based view enriched from customer and product tables.
- **Boundary:** General joins, remote query execution, and mixed-population dashboards are deferred.

## Core shape

A project registers source tables with clear identities and field definitions. A view chooses a base source. Its lookup definitions identify a matching key, target source, and output fields. A deterministic preparation step produces the working rows and keeps field-origin information available for inspection.

The proposed first lookup preserves one row per base record. A unique match supplies the requested values. No match supplies missing values and a visible unmatched count. Repeated target keys report ambiguity rather than silently multiplying base rows. These are recommended first-proof rules, not accepted permanent join semantics.

The prepared dataset enters the current analysis provider. Existing chart filters and calculations use its resulting fields. Field origin remains available so users can distinguish an order field from a looked-up customer field. Changing a lookup or source causes a clear result refresh without resetting unrelated view choices.

The host retains source references and lookup definitions. The package uses a single authoritative result for charts, field profiles, row inspection, and settings validation. The precise host/package preparation boundary remains provisional.

## Current fit

Reuse the one-dataset renderer, field profiles, calculation engine, saved view settings, and filter controls. Extend project definitions with source identity and lookup declarations. Avoid having individual charts copy and flatten source tables independently.

Lookup provenance is new metadata. Existing source-row tracing should identify the base row and relevant matched row when lookup values contribute to a chart. The first proof does not require replacing the rendering or trace engine.

## How to make this go better

- **Preserve base row counts.** Prove lookup enrichment before supporting operations that expand populations.
- **Use asymmetric local tables.** Include customers without orders, missing customers, and duplicate keys to reveal population mistakes.
- **Retain field origin.** Names alone cannot distinguish fields from different sources.
- **Prepare rows once per view.** All charts and field summaries should see the same lookup result.
- **Keep source loading separate.** Local tables can prove lookup behavior before choosing remote providers.

## First proof

- **Question:** Can lookups enrich an orders analysis without corrupting counts, sums, or field meaning?
- **Proof:** A small deterministic orders/customer/product example with matched, missing, and ambiguous keys.
- **Observe:** Source row counts differ. Orders retain their count. Lookup fields appear in chart choices and filters. Ambiguity is visible. Field inspection identifies origin.
- **Decision rule:** Keep the shape if the result preserves intended order totals and lookup values can be traced to their sources.

## Rabbit holes and no-gos

Do not build a general relational query engine before lookup semantics are proven. Do not invent automatic relationship filtering. Do not silently choose one of several matching records. Do not make this work a prerequisite for current single-source views or agents.

## What still needs a later decision

Should one dashboard contain different base populations? Should filters propagate across source relationships? Those decisions can expand the scope when this initiative is taken up.

## Plan handoff

Intent and shape only. Review the base-source and lookup behavior before implementation planning. The current three initiatives remain single-source.

## Most likely bad outcome

Lookups appear to work, but repeated matches distort totals or charts disagree about which source records they represent.
