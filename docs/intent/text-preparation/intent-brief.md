---
title: Reusable text preparation
slug: text-preparation
phase: implementation-plan
status: planned
last_updated: "2026-10-31"
---

# Reusable text preparation

Analysts should clean imported codes, extract a component, and compose a label inside their analysis.
They should inspect exact records and reuse the saved result in charts, queries, and notebooks.
Source values and record identity stay intact.

Build a guide that emits ordinary formulas for the existing Calculator.
First ship trim, literal part extraction, literal replacement, and strict concatenation with the complete reuse workflow.
Then add explicit NFC and casing, followed by code-point length and slicing.

The [implementation plan](implementation-plan.md) names files, acceptance values, docs, and examples for each milestone.
The [research summary](../../research/text-preparation-design-2026-10-31/README.md) records the decision and limits.
All seven [original Pro results](assets/pro-results/text-preparation-design-2026-10-31/index.md) are preserved.

This is a build plan, not an implemented feature or permission to publish.
No outside demand gate applies. Regex, source-owned join keys, locale tailoring, and a second expression language remain outside this release.
