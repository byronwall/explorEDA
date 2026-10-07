---
title: "Find missing values and missing observations"
slug: "missingness-and-expected-records"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Find missing values and missing observations

## My read

Analysts may need to see whether missing values cluster together, or discover records that should exist but do not. Current field profiles report missing counts. A missingness matrix could reveal combinations across fields and lead to the affected source records. Expected-record analysis is a later related task with a different denominator.

The durable outcome is understanding absent information before interpreting a chart. An empty category pair, a numeric zero, an invalid value, and a missing record are different conditions. A heatmap renderer alone cannot decide which observations should have existed. This seed preserves those distinctions and leaves the expected-set model open.

This remains a future seed. Its expansion trigger is a proposed decision rule, not a release commitment.

## What matters most

- Separate missing, invalid, zero, and absent records.
- Keep affected observations inspectable.
- Require an explicit expected set for missing-record claims.

## The intended experience

Choose a few fields and inspect their missingness patterns. Select a pattern and view the affected rows. If a later task supplies an expected key set or sampling schedule, compare that set with actual observations and inspect unmatched expectations separately from incomplete existing records.

## Boundaries

Do not infer expected observations from a blank matrix cell. Do not automatically classify missing values as errors. Keep matrix limits and field choice bounded. Reuse field profiles. A data-quality rules engine, ingestion service, and remote monitoring are outside the first diagnostic.

## What seems settled

This is an uncommitted diagnostic extension. Profiles and per-chart exclusions already exist; the proposed addition is joint-pattern exploration and, only when supplied, explicit expected-record reconciliation.

## Current reality that matters

fieldProfiles.ts supplies missing counts. Heatmap operates on categorical groups and metrics. The registry has no missingness diagnostic view. The October 5 Pro ledger distinguishes field missingness from absent expected observations.

## Expansion trigger

Expand when field summaries hide a recurring pattern, or a real source includes a known expected sampling plan or key catalogue.

## Next step after confirmation

Use a small fixture with missing X, missing Y, both missing, and valid zero. Show exact pattern counts and source IDs. Add one absent expected key only in a separate proof with an explicit expected set.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
