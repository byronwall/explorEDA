# Advanced scatter analysis — shape

## Recommendation

Deliver native regression, summaries, and density improvements in sequential slices. Start with linear regression and visible equations. Add polynomial and LOESS methods next. Use the lab for evidence, rather than as the final product boundary.

## Problem and appetite

Users want objective measures of relationships, including slope, offset, and R². They need curves and equations across color groups and facets. The scope is package delivery; no calendar budget was supplied. Use roughly 10,000 rows across ten groups as the working target.

## Core shape

Choose one method per chart definition. Share its polynomial degree or LOESS smoothing settings across its facet instances. Fit each color group within its facet. Offer an additional pooled fit in that facet, off by default.

Fit paired finite values after other charts’ filters. Ignore this chart’s own brush when fitting. The brush still selects observations and affects linked charts. “Fixed reference” means stable during own brushing, not frozen against external filtering or data edits.

Draw the curve and equation. Show linear slope, offset, and R² directly when space permits. Use a compact, nonmodal fit inspector for group/facet equations and detailed results. Keep group and facet labels visible. Avoid forcing a linear slope or equation onto methods where that representation is unsuitable.

Unavailable fits show a warning icon with the cause on hover and keyboard focus. Do not substitute a different method silently. Save method, parameters, and pooled-fit choice through native settings. Recompute results from current data.

## Current fit

Reuse `ScatterSnapshot`, `useScatterData.ts`, `scatterPlan.ts`, and native tracing. Verify that the fit population excludes own selection while respecting external filters. Do not substitute globally filtered IDs without this proof. Reuse current rectangular density cells before adding hexagonal counts.

Keep model results local to the chart plan. The workspace’s `SavedCalculation` stores expressions and result-column names. Do not expand it into facet-local reusable calculations merely to inspect fit details.

## How to make this go better

- **Prove filter behavior first.** Correct curves on the wrong rows would defeat the primary goal.
- **Start with linear fits.** They prove the requested slope, offset, equation, and R² workflow.
- **Share controls, separate results.** Facets use one definition’s parameters but compute their own fits.
- **Keep details compact.** Test ten group results before adding more labels to the plot.
- **Validate methods independently.** Use known numerical fixtures before choosing an estimator dependency.
- **Measure the requested scale.** Own brushing should not repeat fitting work; external filtering should.

## First proof

Show linear fits for two groups in two native facets. Inspect each equation, slope, offset, and R². Brush one facet: coefficients must stay unchanged. Filter from another chart: eligible rows and coefficients must change as expected.

Proceed if the numerical fixture agrees, scope behavior holds, and users can find each fit’s results without hiding the chart. Resolve population preparation or inspection design before adding more methods.

## Rabbit holes and no-gos

Avoid a generic layer registry, silent method fallback, global parameter coupling, or a new calculation framework. Uncertainty bands, reusable prediction columns, and residual displays need separate scope decisions. Preserve existing ellipse and density evidence gates.

## Serious alternative

Implement all regression methods in the lab first. This simplifies numerical comparison but delays the native filter proof. Prefer the native linear slice, with lab fixtures supporting independent checks.

## Plan handoff

The plan delivers linear regression, additional methods, summaries/density, and accepted scientific overlays. Each slice leaves ordinary scatter usable and can be disabled through chart settings.
