---
title: "Scientific overlays and multivariate discovery"
slug: "scientific-multivariate-analysis"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Scientific overlays and multivariate discovery

## My read

Scientific users may need more than a fitted scatter curve. Candidate tasks include comparing compatible measurements, inspecting covariance structure, locating unusual observations, or seeing several field pairs together. The current scatter implementation already provides linear, polynomial, and LOESS fits, paired summaries, marginals, hex bins, and smoothed contours.

This seed captures only later extensions. Possible mechanisms include covariance ellipses, model-relative distances, supplied uncertainty marks, residual views, rank correlations, and ordered trajectories. They answer different questions. No single ellipse or distance display should imply that every inferential question has been solved.

The [scatter plot matrix](../scatter-plot-matrix/intent-brief.md) now has its own explicit intent, with off-diagonal scatter plots and diagonal distributions.

This remains a future seed. Its expansion trigger is a proposed decision rule, not a release commitment.

## What matters most

- Name method, population, units, and assumptions.
- Keep descriptive structure distinct from inferential uncertainty.
- Reuse existing scatter and contributor inspection.

## The intended experience

Choose one scientific question, select a reference model or supplied bounds, and inspect the result alongside original observations. A trajectory needs an explicit ordering field. Each added display should retain current linked selection and clear unavailable results. Pairwise matrix exploration belongs to the separate matrix initiative.

## Boundaries

A Gaussian data ellipse is not a confidence region for a mean. A distance is not an automatic error label. Confidence, prediction, and tolerance intervals are separate. Avoid robust-method catalogues and a statistical notebook before one method proves useful. Do not reclassify delivered fits and contours as missing.

## What seems settled

The advanced-scatter initiative owns its accepted scope and unresolved scientific choices. This new seed records comparison-led extensions and routes expansion back to that owner when scope overlaps.

## Current reality that matters

Native scatter files implement regression, fit planning, paired covariance, marginal histograms, hexagonal counts, and density contours. The existing advanced-scatter plan keeps additional scientific methods below its cut line.

## Expansion trigger

Expand when a concrete measurement, diagnostic, or multivariate task cannot be answered with the current scatter tools. Require independent numerical references before implementation.

## Next step after confirmation

Select one method and a deterministic fixture where it changes the interpretation. Compare with an independent numerical result, inspect exclusions, and verify own-versus-peer filtering. Decide its statistical meaning before adding a display.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
