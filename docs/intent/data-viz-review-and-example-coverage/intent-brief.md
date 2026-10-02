---
title: "Data visualization review and example coverage"
slug: "data-viz-review-and-example-coverage"
phase: intent
status: current
last_updated: "2026-10-01"
---

# Data visualization review and example coverage

## My read

explorEDA needs a reusable review skill that answers a simple question: is this a good chart or dashboard? The review must start with the static visual. A chart must explain itself before its interactive controls, filters, settings, and rich behavior get credit. The skill should use Byron's stated preferences, not a generic design-system audit. It should check purpose, title, hierarchy, spacing, typography, ink, color, axes, ticks, labels, tables, multi-chart relationships, and visible filter state. It should also detect when permanent controls overwhelm the information.

The second outcome is evidence that the repository can exercise what the skill reviews. The skill, typed coverage manifest, tests, and rendered matrix now exist. Current examples have clearer titles, axis labels, and stated purposes. The manifest still understates that work. It records 38 features across 10 examples, with 24 feature rows shown and none marked reviewed.

The initiative remains active. The next work is to reconcile declarations against rendered examples, close confirmed gaps, and record passing reviews. Baseline trials proved that the skill produces useful findings. They did not establish that the example set passes review.

## What matters most

- Judge the chart before its interactivity.
- Make reviews consistent, specific, and tied to visible evidence.
- Cover every chart type and material feature with intentional examples.
- Keep the rubric and coverage model small enough to maintain.
- Turn gaps into a clear example backlog, not vague design feedback.

## The experience or behavior you appear to want

An agent receives a chart, dashboard, screenshot, or running page. It applies one stable rubric, names the strongest and weakest parts, identifies any critical failure, and gives a short prioritized repair list. For a dashboard, it reviews each view and then the system: relationships, shared scales, color consistency, filters, state, and interaction clarity.

A maintainer can then open a feature matrix and see which chart types and capabilities have an intentional example, which examples were reviewed, and where coverage is missing. Each example should have a reason to exist and should expose a specific review surface.

## Boundaries

### Must be true

- The skill lives in this repository and cites the local transcript set as its design basis.
- The rubric supports charts, tables, faceted views, and multi-chart dashboards.
- A review separates visual quality, semantic correctness, and interaction quality.
- Coverage includes chart types and cross-cutting features such as labels, scales, color, facets, filters, tables, and responsive layout.
- The matrix can distinguish “implemented,” “shown,” and “reviewed.”

### Must be avoided

- Do not award a good score because a chart has many controls.
- Do not require one example for every possible feature combination.
- Do not turn source-code coverage into a proxy for visual feature coverage.
- Do not hide missing labels or unclear state behind tooltips or interaction.
- Do not build an automated visual-quality scorer in the first version.

## What seems settled

- The first artifact is a reusable data visualization review skill.
- The rubric should be cursory enough for routine use but broad enough to catch major failures.
- The next artifact is a feature matrix and a deliberate example set.
- The matrix itself can become a useful rendered reference or article.

## Possibilities, not decisions

- The existing demo matrix may later become a published reference.
- Review history may later expand beyond a date and short evidence note.
- Screenshot automation may later create a visual contact sheet.

## Current reality that matters

- The registry contains 11 chart types, all represented in the manifest and declared examples.
- The demo contains 10 examples. The former line-chart and tables example IDs are absent.
- The matrix separates implementation status, declared usage, and reviewed usage. No usage assignment is reviewed yet.
- Fourteen feature rows have no declared example. Fifteen gap notes remain; several lag current configurations.
- Titles, axis labels, saved Lorenz filters, symlog settings, and shared-scale examples already exist.
- Baseline and follow-up reports document failures. Later polish reports document repairs, but do not complete this initiative's review coverage.
- The project uses pnpm, React, TypeScript, Vitest, and Vite. All 18 demo tests passed during this audit.

## Next step after confirmation

No further confirmation is needed for the next implementation step. Reconcile the manifest against current rendered examples. Then close confirmed gaps and record passing reviews. Verify the matrix at wide, intermediate, and narrow widths.
