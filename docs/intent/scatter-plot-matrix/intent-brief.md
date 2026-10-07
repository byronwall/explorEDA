---
title: "Scatter plot matrix with diagonal distributions"
slug: "scatter-plot-matrix"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Scatter plot matrix with diagonal distributions

## My read

Users should examine relationships among several fields in one scatter plot matrix. Scatter plots occupy the cells off the diagonal. Each diagonal cell shows a distribution of its field. This layout is explicitly requested. The particular distribution display remains open.

The outcome is seeing pairwise patterns and individual field shapes together. A user can notice an unusual distribution, compare it with related scatter plots, and inspect an interesting pair. The matrix should make field identity clear without repeating the full chrome of an independent chart in every cell.

This is a first-pass priority and a “start here” view for unfamiliar multivariate data. The main job is making sense of measurements whose relationships are not known beforehand. Scientific and engineering experiments are important examples, even when suitable real datasets are not yet available.

The same ordered field set would define rows and columns. A column supplies the horizontal field, and a row supplies the vertical field. Each field should use a consistent display domain wherever it appears. These are proposed conventions for a readable matrix, not a selected implementation model.

This is a separate initiative from correlation discovery. A correlation matrix summarizes pairs with coefficients. The requested matrix shows the observations themselves. Neither workflow must be completed before the other. The matrix can reuse current scatter and distribution behavior without carrying every advanced scatter option into every small cell.

## What matters most

- Show scatter plots off the diagonal and distributions on the diagonal.
- Keep the field order, cell identity, and axis meaning clear.
- Use comparable domains for repeated appearances of the same field.
- Preserve source observation identity and explain omitted values.
- Keep a bounded matrix readable and responsive.

## The intended experience

A user chooses a small set of numeric fields and sees the matrix. They scan distributions along the diagonal and relationships elsewhere. They can inspect observations through the existing trace behavior. Opening an interesting pair in a larger scatter view is a possible next step.

Brushing one scatter cell sets bounds on its two fields and updates linked selection. The preferred experience retains context and dims observations outside the selected subset in other cells. Interpret “unrelated cells” as nonmatching observations provisionally; verify that interpretation with a visual proof. Multiple simultaneous brushes remain a later scope choice.

## Boundaries

Start the proof with a few numeric fields. A mixed categorical matrix is a separate extension. Avoid creating many independent workspace cards merely to simulate one matrix.

Recommend using every valid pair in each scatter cell and every valid value in its diagonal distribution. A missing speed should not hide a valid pressure-versus-temperature observation. Show usable counts so differences are understandable. This is an agent recommendation; the user requested clarification and has not selected the missing-value rule.

Use roughly 10,000–100,000 rows as the working target, not a capacity promise. Field count and acceptable latency remain unspecified. Measure increasing field counts and complete linked interactions. A Canvas renderer alone does not establish matrix performance.

Do not enable regression, contours, marginals, and every fit label in every cell by default. Preserve readable data and source inspection first. The matrix’s own selection must not silently alter domains or make its distribution denominator unclear.

## What seems settled

The matrix is now an explicit user goal, rather than a possibility inside the scientific seed. Both diagonal and off-diagonal cells belong to its scope. A histogram, density curve, or ECDF could provide the diagonal distribution. No one option is required yet.

## Possibilities, not decisions

A histogram is a simple first diagonal candidate. Field reordering, shared group colors, and a larger pair view could support exploration. Lasso selection is also desired, but it need not delay the rectangular-brush proof. Rendering both off-diagonal triangles follows the requested matrix layout. A reduced triangle is only a later display option.

## Current reality that matters

The package already has scatter planners, exact source IDs, linked filters, histogram behavior, and ECDF. Scatter marginals also compute distributions, but they use plotted pairs. That population rule cannot automatically define a diagonal cell covering one field.

Ordinary scatter points already render on Canvas. Axes, brushing, guides, bubbles, and density surfaces use SVG paths. The matrix can reuse useful parts, but its combined workload remains unmeasured.

Facets repeat one configured view by group values. They do not establish a field-by-field scatter matrix. The registry has no dedicated matrix view.

## Next step after confirmation

Shape a three-field matrix with nine cells and diagonal histograms. Prove two-field brushing and dimmed context using a small fixture with missing values and a known relationship. Then measure 10,000 and 100,000 rows at named field counts. Check diagonal counts and repeated-field domains before expanding layers or simultaneous brushes.

See the [reference packet](references/README.md) and [collection guide](../comparison-opportunities/README.md).
