---
title: "Discover field relationships, then open scatter"
slug: "relationship-discovery"
phase: intent
status: current
last_updated: "2026-10-19"
---

# Discover field relationships, then open scatter

## My read

Users should find useful field pairs before opening detailed analysis. The delivered mixed-type matrix already combines points, correlations, distributions, boxes, tiles and shares. The remaining question is whether current controls and instruction serve a real task. No new matrix is selected.

The desired experience connects field-level discovery to row-level exploration. Method, population and valid-pair count must stay clear. A pair-opening action remains conditional on repeated detail-setup problems. It must preserve the intended population and existing selection/trace gestures.

This is a near-term candidate because it extends an existing workflow. The suggested first proof is not an implementation plan.

## What matters most

- Show method, population, and valid-pair count.
- Treat constant or insufficient pairs as unavailable.
- Open the existing scatter workflow directly.

## The intended experience

Choose a small set of numeric fields. Scan relationships, inspect one coefficient and its exclusions, then open the corresponding scatter. Use its existing regression, density, summaries, and linked filters to investigate the observations. Return to the matrix without losing the field set.

## Boundaries

Use paired finite values and an explicit missing-value rule. Correlation is not causation or a forecast. Pearson is the reuse-first candidate; rank methods are later choices. Bound field count. Keep this coefficient workflow separate from a statistical notebook.

The [scatter matrix](../../application-feature-inventory.md#scatter-matrix) shipped on 2026-10-09. It shows observations, diagonal distributions, and optional Pearson correlation cells for two to ten fields.

## What seems settled

The matrix is delivered. The durable goal is easier pair discovery. Current controls are the first comparator. Paired-statistic code does not define all matrix population behavior.

## Current reality that matters

pairedSummary.ts already computes Pearson correlation for grouped finite pairs and unavailable constant cases. The `scatter-matrix` view can show Pearson r and its row count in one triangle, per color group too, so part of pair discovery exists. It is not a coefficient-only matrix: a correlation cell cannot open a scatter for its pair, and the view is bounded at ten fields. Scatter regression and surfaces are live source implementations, unlike the older Pro snapshot.

## Expansion trigger

Expand when repeated analyses involve choosing among many numeric pairs. Add rank correlation only when monotonic nonlinear relationships make Pearson misleading for the task.

## Next step after confirmation

After the existing local trust journey, observe one named relationship task with current matrix controls and a short lesson. Check shape, group differences and pair populations. Configure the detailed Scatter manually. Investigate a pair-opening action only if repeated setup causes problems. If current controls suffice, stop UI expansion.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.

## Research decision: 2026-10-19

The [relationship review](../../research/relationship-discovery-2026-10-19/README.md) keeps the delivered mixed-type matrix. It already supports numeric/date, mixed and categorical cells, group correlations, and traces. Current triangle/diagonal settings also support a coefficient-focused configuration.

A short teaching example remains a proposed proof, not approved application work. If selected, ship it with the scatter-matrix docs and a Scatter continuation. A synthetic example proves meaning, not demand.

Preserve ordinary selection-clearing and Alt/keyboard tracing. Matrix correlation needs three pairs; Scatter summaries allow two nonconstant pairs. Their exclusion counts also have different meanings. Resolve intended populations before promising a handoff. Keep source population, other filters, own selection and viewport bounds distinct.

Defer a separate coefficient view, bounded ranking and Spearman until an observed task requires them. Reject a universal mixed-type score. The [seven dispositions](../../research/relationship-discovery-2026-10-19/decisions.md) and [original proof plan](../../research/relationship-discovery-2026-10-19/originals/proof-plan.md) retain alternatives and stop gates. No author, browser or handoff proof ran.
