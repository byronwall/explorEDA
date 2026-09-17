---
title: "Data visualization review and example coverage"
slug: "data-viz-review-and-example-coverage"
phase: intent
status: current
last_updated: "2026-09-15"
---

# Data visualization review and example coverage

## My read

explorEDA needs a reusable review skill that answers a simple question: is this a good chart or dashboard? The review must start with the static visual. A chart must explain itself before its interactive controls, filters, settings, and rich behavior get credit. The skill should use Byron's stated preferences, not a generic design-system audit. It should check purpose, title, hierarchy, spacing, typography, ink, color, axes, ticks, labels, tables, multi-chart relationships, and visible filter state. It should also detect when permanent controls overwhelm the information.

The second outcome is evidence that the repository can exercise what the skill reviews. Existing demos cover every registered chart type at least once, but that is nominal coverage. They do not yet form an intentional review set. Many titles are blank or generic. Axis labels are rare. Saved filters are empty. Feature combinations are incidental. The repository needs a compact feature matrix that distinguishes implementation support, example coverage, and reviewed quality. A small set of deliberate examples should close important gaps without creating the full Cartesian product of chart types and settings.

The immediate work is planning. The next implementation should first create and test the review skill against a few contrasting existing examples. It should then define the feature inventory and render the matrix. Only after that evidence exists should new examples be added.

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

- The feature matrix may render inside the demo application or from a documentation route.
- Review results may later be stored beside examples.
- Screenshot automation may later create a visual contact sheet.

## Current reality that matters

- The registry contains 11 chart types: row, bar, line, scatter, 3D scatter, box plot, pivot table, data table, summary table, markdown, and color legend.
- Existing demo configurations contain every type, but coverage is not declared or checked.
- Examples already exercise categorical and numerical color, wrap and grid facets, coordinated views, and tables.
- Most saved examples use empty filters. Most axis labels are blank. Titles are often blank or generic.
- The project uses pnpm, React, TypeScript, Vitest, and a Vite demo application.

## Next step after confirmation

Implement the skill and run it against three existing examples: one simple chart, one faceted view, and one coordinated dashboard. Use those reviews to refine the rubric before adding the feature matrix and new examples.
