---
title: "Discover field relationships, then open scatter"
slug: "relationship-discovery"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Discover field relationships, then open scatter

## My read

Users should find useful relationships among several numeric fields before choosing a scatter pair. Existing scatter analysis is now deep: regression, paired summaries, marginals, bins, and contours are present. The remaining gap is discovering which pair to inspect. A bounded correlation matrix is a possible entry point, not a reason to reimplement those scatter features.

The desired experience connects field-level discovery to row-level exploration. A relationship cell should name its method, population, and valid-pair count. Activating it opens a scatter configured for those fields. It should not invent a record filter, because a correlation coefficient describes a pair of fields rather than one natural subset of observations.

This is a near-term candidate because it extends an existing workflow. The suggested first proof is not an implementation plan.

## What matters most

- Show method, population, and valid-pair count.
- Treat constant or insufficient pairs as unavailable.
- Open the existing scatter workflow directly.

## The intended experience

Choose a small set of numeric fields. Scan relationships, inspect one coefficient and its exclusions, then open the corresponding scatter. Use its existing regression, density, summaries, and linked filters to investigate the observations. Return to the matrix without losing the field set.

## Boundaries

Use paired finite values and an explicit missing-value rule. Correlation is not causation or a forecast. Pearson is the reuse-first candidate; rank methods are later choices. Bound field count. Keep this coefficient workflow separate from a statistical notebook.

The [scatter plot matrix](../scatter-plot-matrix/intent-brief.md) is now a separate explicit request. It shows observations and diagonal distributions. It does not depend on completing correlation discovery first.

## What seems settled

A matrix is a proposed mechanism. The durable goal is easier pair discovery. Current paired-statistic code can inform the numerical convention without defining all matrix population behavior.

## Current reality that matters

pairedSummary.ts already computes Pearson correlation for grouped finite pairs and unavailable constant cases. The registry has no relationship-matrix view. Scatter regression and surfaces are live source implementations, unlike the older Pro snapshot.

## Expansion trigger

Expand when repeated analyses involve choosing among many numeric pairs. Add rank correlation only when monotonic nonlinear relationships make Pearson misleading for the task.

## Next step after confirmation

Use three fields with one exact relationship and one constant field. Show coefficients and pair counts, then open the correct scatter. Decide whether the small matrix reduces field-selection effort before adding methods.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
