---
title: "Data visualization review and example coverage — shape brief"
slug: "data-viz-review-and-example-coverage"
phase: shape
status: current
last_updated: "2026-10-01"
---

# Data visualization review and example coverage — shape brief

## Recommendation

Keep the existing repository skill, typed example coverage manifest, rendered matrix, and focused checks. These parts are implemented. Complete the work through declaration reconciliation and current visual reviews. Do not create separate skills for charts, tables, and dashboards. Do not create an example for every combination. Use a basis set: each chart type appears at least once, each material feature appears in at least one intentional example, and risky interactions appear in a representative combination.

The rubric should use critical gates plus `good`, `needs work`, `poor`, or `not applicable` judgments. A single numeric score would imply precision that the review does not have. The review output should lead with the verdict and the three highest-value changes.

## Problem and appetite

- **Problem:** Coverage declarations lag example repairs. Passing structural checks do not prove chart quality.
- **Outcome:** A repeatable review method and a visible, checked map from features to examples.
- **Appetite:** One small skill, one coverage source, one rendered matrix, one focused completeness check, and only the examples needed to close material gaps.
- **Not in this shape:** Computer-vision scoring, exhaustive pairwise generation, screenshot regression infrastructure, or a new documentation platform.

## Core shape

The review has four passes:

1. **Chart-first gate:** Can a person identify the subject, measure, comparison, and current scope without using controls?
2. **Visual and semantic review:** Check hierarchy, layout, typography, ink, encodings, axes, ticks, labels, color, legends, tables, and data honesty.
3. **System review:** For dashboards, check view relationships, shared conventions, active filters, state changes, and whether controls stay subordinate to the information.
4. **Verdict:** Name blockers, rate applicable sections, and give no more than three priority fixes before secondary notes.

The coverage manifest should use stable feature IDs. Each example declares the features it intentionally demonstrates. The rendered matrix uses rows for features and columns for examples or chart families. It shows three states: supported in code, intentionally shown, and reviewed. A test compares registered chart types and the required feature list against the manifest. It does not judge design quality.

## Current fit

- **Reuse:** `chartRegistry`, the saved demo configurations, the example selector, existing Vitest setup, and the transcript files under `docs/transcripts`.
- **Implemented:** `.agents/skills/data-viz-review/SKILL.md`, `apps/demo/src/demos/coverage.ts`, its checks, and `apps/demo/src/CoverageMatrix.tsx` with view tests. All 18 demo tests passed during the audit.
- **Remaining:** Current browser proof, accurate coverage declarations, actual gap repairs, and passing reviews with dates and short evidence notes.
- **Avoid or replace:** Do not infer coverage from source filenames or configuration text. Do not duplicate the chart registry in another handwritten list when the registry can provide it.

## How to make this go better

- **Use the proven rubric.** Three baseline reviews produced specific failures. Review current examples before expanding the catalog.
- **Separate support from demonstration.** A feature can exist in code while no example explains it well. The matrix must show both states.
- **Use a basis set, not a Cartesian product.** Cover each type and feature once, then add combinations only for known interaction risks such as facets with shared scales or filters across views.
- **Keep quality judgment human-readable.** The test should catch missing declarations. The skill should judge whether the visual is good.
- **Make every example intentional.** Give each example a clear title, question, and declared coverage purpose. Remove redundant examples when a stronger one covers the same ground.

## First proof

- **Question:** Does the proposed rubric produce useful and consistent feedback across simple, faceted, and coordinated views?
- **Delivered proof:** The skill and [baseline reviews](../../reviews/data-viz-example-baseline.md) cover the original line-chart, categorical-charts, and Lorenz examples. All failed with specific findings.
- **Current gap:** The later [verification](../../reviews/data-viz-example-verification.md) still found blockers and excluded the matrix. Subsequent repairs need current review. The old line-chart and tables IDs are absent; use current trend and table examples.
- **Observe:** The reviews should identify different issues, cite visible evidence, and produce actionable priorities without source-code inspection.
- **Pass / fail:** Pass if each review can state a chart-first verdict, section judgments, blockers, and three clear fixes. Fail if the rubric produces generic advice or rewards feature count.
- **Deliberately excludes:** New examples, automated screenshots, the rendered matrix, and any scoring service.

## Rabbit holes and no-gos

- Treating test coverage percentages as evidence of chart quality.
- Building an ontology for every possible visualization technique.
- Adding chart types only to make the matrix look complete.
- Requiring every example to demonstrate every setting.
- Storing free-form review prose as the matrix source of truth.
- Making controls permanently visible to prove that a feature exists.

## Serious alternative

A documentation-only checklist and Markdown matrix would be faster. It would also drift from the registry and examples. Use that only if the rendered matrix reveals no maintenance value after the first manifest is built.

## Plan handoff

Continue from the existing implementation. Reconcile the 38 feature rows and 10 example declarations against rendered behavior. Fourteen features lack declared usage; no assignment is reviewed. Verify the matrix in the browser. Repair only confirmed gaps, and record passing reviews. Distinguish symlog from true log scales, and numerical day plots from date scales. Narrow-width checks apply under current project rules; a separate mobile product expansion remains outside scope.
