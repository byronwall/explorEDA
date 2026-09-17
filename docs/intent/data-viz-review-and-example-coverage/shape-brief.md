---
title: "Data visualization review and example coverage — shape brief"
slug: "data-viz-review-and-example-coverage"
phase: shape
status: current
last_updated: "2026-09-15"
---

# Data visualization review and example coverage — shape brief

## Recommendation

Create one repository skill with a compact core rubric and short chart-family addenda. Pair it with one explicit example coverage manifest that feeds a rendered matrix and one completeness test. Do not create separate skills for charts, tables, and dashboards. Do not create an example for every combination. Use a basis set: each chart type appears at least once, each material feature appears in at least one intentional example, and risky interactions appear in a representative combination.

The rubric should use critical gates plus `good`, `needs work`, `poor`, or `not applicable` judgments. A single numeric score would imply precision that the review does not have. The review output should lead with the verdict and the three highest-value changes.

## Problem and appetite

- **Problem:** Current examples prove that components render, but they do not prove that the results are good charts or that the feature surface is intentionally covered.
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
- **Add:** `.agents/skills/data-viz-review/SKILL.md`, a small reference rubric only if the skill file becomes hard to scan, an example coverage manifest, a matrix view, and one completeness test.
- **Avoid or replace:** Do not infer coverage from source filenames or configuration text. Do not duplicate the chart registry in another handwritten list when the registry can provide it.

## How to make this go better

- **Prove the rubric before expanding examples.** Review three existing views first. Remove checks that do not change the verdict or repair list.
- **Separate support from demonstration.** A feature can exist in code while no example explains it well. The matrix must show both states.
- **Use a basis set, not a Cartesian product.** Cover each type and feature once, then add combinations only for known interaction risks such as facets with shared scales or filters across views.
- **Keep quality judgment human-readable.** The test should catch missing declarations. The skill should judge whether the visual is good.
- **Make every example intentional.** Give each example a clear title, question, and declared coverage purpose. Remove redundant examples when a stronger one covers the same ground.

## First proof

- **Question:** Does the proposed rubric produce useful and consistent feedback across simple, faceted, and coordinated views?
- **Proof:** Write the first skill and apply it to the line-chart, categorical-charts, and Lorenz examples.
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

Start with the skill and three review trials. Next, define the smallest feature vocabulary from current settings and components. Then add the manifest, completeness test, and rendered matrix. Add examples only for gaps that remain visible after the matrix exists.
