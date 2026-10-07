---
title: "Compare a selection with a named baseline"
slug: "population-baselines"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Compare a selection with a named baseline

## My read

Analysts should compare the current selection with a reference population they can name and understand. A card already compares selected values with all loaded rows. An ECDF can show an overall curve. Neither establishes a saved comparison population that remains meaningful while the user explores.

The durable outcome is answering whether a selected group differs from a known reference. The first candidates are distributions and a metric card. Their denominators, units, and scales must agree. A baseline can mean all source rows, a saved predicate, or a captured set of observations. Those meanings must remain visible. The source material proposes these choices; it does not select snapshot semantics for Byron.

Byron has minimal current interest in named comparisons. Keep this as a low-priority seed, outside the first pass. The useful existing all-row comparison remains unchanged. Reduced priority does not cancel the initiative.

## What matters most

- Name both populations and show valid-value denominators.
- Use shared bins and comparable scales.
- Define what happens when the source changes.

## The intended experience

Choose a reference segment, give it a name, and explore another segment through linked filters. Read distributions and a small metric comparison. Inspect which source observations belong to each population. Restore the settings and confirm whether the baseline is reevaluated or retained according to its declared meaning.

## Boundaries

A dimmed context layer is not automatically a baseline. Do not store positional row IDs as durable membership across reordered imports. Count and within-group percentage answer different questions. Keep source versions, multi-source cohorts, and a general experiment platform outside the first comparison.

Later distribution controls can expose bin width or explicit boundaries, independent grouping and color, and direct value-range selection. These are separate refinements. They should reuse current histogram and distribution renderers after population comparison proves useful.

Those distribution refinements do not depend on implementing named baselines. Do not make useful engineering exploration wait for this lower-interest scope.

## What seems settled

Basic all-row comparison already exists. The proposed addition is explicit named reference scope. Source binding is a necessary choice before promising durable snapshots.

## Current reality that matters

MetricCard computes an all-source comparison. ECDF provides current threshold analysis and an overall curve. Saved settings have no named baseline collection. Chart-local filters are now available but do not create saved cohorts by themselves.

## Expansion trigger

Expand when a real analysis needs to retain a reference while changing filters, or compare the same segment across source revisions.

## Next step after confirmation

Wait for a concrete comparison task before shaping this work. If one appears, compare two small predicates on one fixed source. Check distribution denominators and source membership before choosing any snapshot behavior. No further baseline questions are needed for the current priorities.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
