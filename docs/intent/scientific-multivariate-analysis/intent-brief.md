---
title: "Scientific overlays and multivariate discovery"
slug: "scientific-multivariate-analysis"
phase: intent
status: current
last_updated: "2026-10-20"
---

# Scientific overlays and multivariate discovery

## My read

Scientific users may need more than a fitted scatter curve. Candidate tasks include comparing compatible measurements, inspecting covariance structure, locating unusual observations, or seeing several field pairs together. The current scatter implementation already provides linear, polynomial, and LOESS fits, paired summaries, marginals, hex bins, and smoothed contours.

This seed captures only later extensions. Possible mechanisms include covariance ellipses, model-relative distances, supplied uncertainty marks, residual views, rank correlations, and ordered trajectories. They answer different questions. No single ellipse or distance display should imply that every inferential question has been solved.

The [scatter matrix](../../application-feature-inventory.md#scatter-matrix) shipped on 2026-10-09, with off-diagonal scatter plots and diagonal distributions.

This remains a future seed. Its expansion trigger is a proposed decision rule, not a release commitment.

## What matters most

- Name method, population, units, and assumptions.
- Keep descriptive structure distinct from inferential uncertainty.
- Reuse existing scatter and contributor inspection.

## The intended experience

Choose one scientific question, select a reference model or supplied bounds, and inspect the result alongside original observations. A trajectory needs an explicit ordering field. Each added display should retain current linked selection and clear unavailable results. Pairwise matrix exploration is the delivered scatter matrix.

## Boundaries

A Gaussian data ellipse is not a confidence region for a mean. A distance is not an automatic error label. Confidence, prediction, and tolerance intervals are separate. Avoid robust-method catalogues and a statistical notebook before one method proves useful. Do not reclassify delivered fits and contours as missing.

## What seems settled

Advanced scatter analysis retired on 2026-10-09 with fits, summaries, marginals, hexagons, and density delivered. This seed now owns its open overlay milestone: ellipses and distance displays, proved against independent numerical fixtures, with explicit analysis and reference populations. The regression rule that a chart's own brush does not refit it does not decide those populations. See that initiative's [last plan](https://github.com/byronwall/explorEDA/blob/91b627d7307a4a14c7f123a713ce5f45662a3d22/docs/intent/advanced-scatter-analysis/implementation-plan.md#milestone-4-scientific-overlays-retain-distinct-meanings).

## Current reality that matters

Native scatter files implement regression, fit planning, paired covariance, marginal histograms, hexagonal counts, and density contours. No native ellipse, distance or uncertainty overlay is established here. Existing scientific notebooks already display prepared residuals and observed bounds.

## Quantity meaning after existing formatting

[The October 27 Design](../../research/quantity-calculations-2026-10-27/README.md) proposes checked scalar formulas, explicit conversions, temperature roles, and durable declarations. Its [implementation plan](../quantity-calculations/implementation-plan.md) includes docs and examples in every milestone. This supersedes earlier quantity adoption gates under current research direction: Byron is the demand. No feature code or shipping approval follows from this plan.

Preserve original fields when deriving a quantity. Name its reference, row meaning and missing-value rule. A temperature difference needs a different conversion from a reading. A concentration residual keeps its scale but changes its reference. An annual total divided by a declared duration gives an interval mean. These distinctions do not approve automatic inference or propagation.

The [October 20 study](../../research/quantity-semantics-2026-10-20/README.md) remains historical evidence about labels, source preservation, and interpretation. Its lesson-first comparator is not a prerequisite for the new Design. No runnable quantity example or application acceptance proof is complete.

The new plan keeps author meaning distinct from units and defines source/result ownership. Population and weighting remain explicit analytical choices. Existing overlay work stays separate.

## Expansion trigger

Expand when a concrete measurement, diagnostic, or multivariate task cannot be answered with the current scatter tools. Require independent numerical references before implementation.

## Next step after confirmation

Select one method and a deterministic fixture where it changes the interpretation. Compare with an independent numerical result, inspect exclusions, and verify own-versus-peer filtering. Decide its statistical meaning before adding a display.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.

## R001 numerical evidence, October 22, 2026

[Regression research](../../research/regression-conditioning-2026-10-22/summary.md) separates prediction accuracy from equation representation.
Three local probes reproduce linear evaluation/metric disagreement and a valid polynomial with an unreliable expanded equation.
Retain standardized polynomial QR. Propose centered linear evaluation with matching residual measures, then a stable trace equation.
Preserve units, origin, scale, coefficient order, and sufficient precision. Do not reject a valid curve for a representation failure.
No application repair, precision control, or new solver is approved here.
A visible milestone must include `/docs/scatter` and a focused runnable unit/offset example.
Full browser, copy/export, refit/restore, and continuous-interval proof remain unrun.
See the [local dispositions](../../research/regression-conditioning-2026-10-22/decisions.md) for the retained gates.
