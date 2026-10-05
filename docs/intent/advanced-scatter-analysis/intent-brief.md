# Advanced scatter analysis

## My read

Byron wants native scatter features that help scientists, engineers, and data scientists understand relationships. Required package additions include regression, paired summaries, hexagonal counts, marginals, and smoothed two-dimensional density. Density must include contour lines and filled regions. The main regression job is understanding relationships through objective measures, including slope, offset, and R². Each method must explain what it shows, which rows it uses, and when its result is unavailable.

The comparison must keep fields, source rows, and display domains aligned. The features must work with the existing chart’s linked filters and tracing. Users need to inspect both source observations and derived marks. A bin count must lead to its exact contributors. A distance must name the reference model. A selected population must remain distinct from dimmed context.

Regression is a required product capability. Support linear, n-order polynomial, and LOESS methods. Users choose one method at a time. Fit each color group separately within each facet. Offer an overall fit within the same facet, off by default. Share method parameters across every facet instance of the same chart definition. Separate definitions remain independent.

Draw the curve and prioritize its equation on the chart. Show slope, offset, and R² where meaningful for the method. Make detailed facet results available through compact inspection. Do not crowd the plot with every result. Reusable calculated fields remain an unconfirmed extension.



## What matters most

- Add smoothed 2D density contours and filled regions with bandwidth, level controls, and clear legends.
- Add hexagonal counts, paired summaries, and marginals. Keep further scientific overlays as separate proposals.
- Display linear, n-order, and LOESS regression with separate fits by color group and facet.
- Fit rows that pass other charts’ filters. Own brushing changes selection, not the regression.
- Keep analysis, reference, scoring, and display populations explicit.
- Prioritize curves and equations; make detailed results available without crowding facets.
- Explain assumptions, units, exclusions, and unavailable results without inventing certainty.
- Preserve linked filtering, source IDs, inspection, and existing scatter gestures.
- Measure useful behavior before changing the public settings model.

## The experience or behavior you appear to want

Choose fields, grouping, facets, and regression method. Read fitted curves and equations. Adjust density bandwidth and contour levels. Compare filled density regions with source points. Brush or enter bounds. Inspect a point, a bin, or a group/facet result through the chart’s trace controls. Change another chart’s filter and see the regression update. Save the analysis and restore its settings later.

## Boundaries

Use paired finite measurements and sample covariance with denominator `n−1`. Preserve all eligible rows for statistics. Label any rendering cap. Disable numeric methods on categorical axes. Show insufficient and singular cases explicitly.

A fitted Gaussian data ellipse and a finite-sample confidence region for the mean answer different questions. Prediction and tolerance regions are separate. Distance is a diagnostic, not an automatic error classification. Screen-space count intensity must state rows per square pixel. It must not claim probability mass or physical-unit density.

Do not create a general chart framework, GPU renderer, server, or composition editor. A fitted curve must name its group, facet, method, and fitting population. A drawn curve does not alone establish useful prediction. Use shared polynomial order and LOESS smoothing controls within each definition. For unavailable fits, show a warning icon with a reason on hover and accessible focus help. Do not silently switch methods. Do not promise one global equation for every method.

Scientific assumptions belong in method help. Development gaps belong in reports or tickets.

## What seems settled

Paired marginal histograms belong in the package. Principal covariance axes remain a separate proposal. Full-source domains support comparison. A nonlinear display must transform the sampled data-space boundary correctly. Regression, summaries, counts, marginals, and smoothed 2D density must reach the native package.

Use roughly 10,000 rows across ten groups as the working regression target. Facet count remains unspecified. The existing 200 ms filter and 50 ms hover targets remain experiment gates, not capacity promises. The 100,000-row case is a stress test. Measure the native features before claiming capacity.

## Possibilities, not decisions

Deliver the required features sequentially as package work. Linear regression is the recommended first slice because it directly serves relationship inspection. Contours and filled density regions are confirmed requirements, not optional promotion candidates. Data ellipses, Mahalanobis diagnostics, principal axes, and mean-region inference retain separate product decisions.

Further experiments include Spearman correlation with average ranks for ties; selected-versus-reference cohorts; compatible-unit identity and tolerance lines; optional regression residual displays and separate confidence/prediction bands; and robust covariance under contamination. Later possibilities include a scatter matrix, measurement uncertainty marks, and ordered trajectories. Each needs its own assumptions and proof fixture.

## Current reality that matters

This checkout already has rectangular density cells with exact source IDs and trace inspection, plus field-driven bubble sizes. Those features postdate the Pro review. Reuse them when assessing bins and overplotting. Composition authoring remains [a separate initiative](../composed-analytical-graphics/intent-brief.md).

## Next step after confirmation

The ten product answers are captured in the revised [shape](shape-brief.md) and [plan](implementation-plan.md). Start with a native linear fit that preserves its result during own brushing and recomputes after external filtering. Then add polynomial and LOESS fits, followed by summaries and density improvements. These documents define proposed package work; this branch does not implement it.
