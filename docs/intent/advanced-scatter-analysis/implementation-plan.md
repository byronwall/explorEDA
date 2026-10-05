# Advanced scatter analysis — implementation plan

## Plan at a glance

Deliver regression, summaries, and density improvements as native package work. Start with linear fits across groups and facets. This proves the main relationship-inspection workflow and the highest-risk population rule. Add polynomial and LOESS methods next. Then deliver paired summaries and density improvements. Retain separate evidence gates for other scientific overlays.

This update changes planning artifacts only. It does not implement regression or certify its performance.

## Implementation strategy

Compute fit results in pure planning beside `ScatterPlot/scatterPlan.ts`. Reuse native row IDs, prepared fields, chart settings, and facet membership. Prove the population after external filters but before own brushing. Own selection can update inspection without recomputing fit results.

Use one method and shared parameters per chart definition. Fit each color group within each facet; pooled fits use that facet’s eligible rows. Keep the pooled option off by default. Store options through existing saved settings; derive coefficients from current data.

Run `pnpm --filter exploreda build`, then `pnpm --filter demo dev --host 127.0.0.1 --port 5184`. Use seeded local fixtures and focused tests. The real native planner and renderer are necessary for linked-filter proof. No server or external provider is required. Run `pnpm check` and frozen preview checks before delivery. Add a minor changeset for new package features.

## Milestone 1: Native linear fits explain relationships

Add an optional linear fit, curve, equation, slope, offset, and R². Show group/facet results through compact inspection when labels would crowd the chart. Add the optional pooled fit, off by default. Include a warning icon for unavailable fits with hover and focus explanations.

Use a hand-sized two-group, two-facet fixture with known results. Verify own brushing preserves coefficients and external filtering recomputes them. Check empty groups, missing pairs, constant coordinates, settings restore, and native tracing. Disable regression to return to ordinary scatter.

### Desired end state

- Users can inspect objective relationship measures in a native chart.
- Group and facet results use the declared population.
- Saved controls restore without freezing stale coefficients.

## Milestone 2: Polynomial and LOESS fits use shared controls

Add polynomial degree and LOESS smoothing settings at the chart-definition level. Each facet and group uses those settings but computes separate results. Allow only one selected method. Keep equations and curves primary; expose detailed results through the fit inspector.

Use a bounded numerical spike to select estimators and define method-specific equations, fit quality, and unavailable conditions. Check primary method references and independent numerical fixtures before choosing a dependency. Do not invent a single slope or global polynomial equation for LOESS. If a dependency fails the evidence gate, retain the working linear slice while resolving the estimator.

Check known polynomial data, nonlinear data, repeated X values, insufficient points, and invalid settings. Confirm method switches and saved parameters apply to every facet. Measure 10,000 rows across ten groups. Record facet count and timings; compare against existing 200 ms filter and 50 ms hover targets. Do not claim a tested capacity until measured.

### Desired end state

- Linear, polynomial, and LOESS are available one at a time.
- Shared parameters produce separate group and facet results.
- Invalid fits explain their cause without silent fallback.

## Milestone 3: Summaries and density remain auditable

Add paired summaries using explicit populations. Compare hexagonal counts against the existing rectangular density planner. Integrate exact contributor tracing and paired marginals through existing chart controls. Keep settings and scope visible.

Verify covariance references, bin partitioning, count conservation, boundary points, resize, facets, nonlinear display, and settings restore. Preserve regression behavior when density or summaries are enabled. Measure the combined display at the working scale. Disable each display independently.

### Desired end state

- Regression, summaries, and density improvements are native package features.
- Counts and inspected contributors agree.
- Ordinary points remain usable during sequential delivery.

## Milestone 4: Scientific overlays retain distinct meanings

Use the lab to prove accepted ellipse, distance, and density model displays before native integration. Keep their analysis/reference populations explicit. The regression brush rule does not silently decide every other model’s population policy.

Verify independent ellipse and distance references, singular results, and transformed boundaries. Keep KDE sensitivity and mean-region coverage checks separate. Disable each accepted overlay independently.

### Desired end state

- Accepted overlays name their populations and assumptions.
- Inference modes remain distinct from descriptive fits.
- Existing interaction and inspection remain intact.

## Open decisions and spikes

The numerical spike must define polynomial/LOESS conventions and appropriate fit-quality displays. Detailed facet inspection is required; reusable calculated fields remain unconfirmed. The working scale is 10,000 rows across ten groups, with no specified facet count. Use representative facet fixtures and report the tested counts.

## Below the cut line

Defer uncertainty bands, reusable prediction/residual columns, robust regression, and a facet-local calculation framework. Keep Spearman, cohort comparison, and compatible-unit guides as later experiments. Scatter matrices, observation uncertainty, trajectories, million-point targets, and blank-page composition remain separate.
