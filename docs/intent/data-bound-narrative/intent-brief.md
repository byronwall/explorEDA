---
title: "Keep explanations aligned with the selected data"
slug: "data-bound-narrative"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Keep explanations aligned with the selected data

## My read

Analysts may want a short explanation beside a chart that updates when its population or measure changes. Static Markdown already provides context. The future opportunity is a small data-bound statement such as a selected record count or an explicitly defined metric, with the same scope and formatting as the related views.

The durable outcome is accurate analytical context without manual edits after each filter. It does not require generated prose or an agent. A sentence should identify the population behind its value and avoid implying a conclusion the metric cannot support. Start with one transparent binding rather than a full report template language.

This remains a future seed. Its expansion trigger is a proposed decision rule, not a release commitment.

## What matters most

- Use the same metric and population as linked views.
- Preserve units and empty/unavailable results.
- Keep each binding inspectable.

## The intended experience

Add a short explanatory statement beside a chart. Bind one count or measure to the current population. Filter the workspace and compare the text with the card and source rows. Inspect the binding. Save and restore the view so the statement reevaluates against the current source.

## Boundaries

Do not insert arbitrary code, remote model calls, or hidden calculations into Markdown. Do not describe a descriptive metric as a causal conclusion. Keep empty values honest. Composed graphics, automatic reports, and in-app agents have separate initiatives and are not prerequisites.

## What seems settled

This is a later explanatory-content seed. Static Markdown is delivered. No narrative grammar or automatic interpretation behavior is selected by the comparison request.

## Current reality that matters

The registry includes Markdown and Metric Card. Shared reductions and formatting can support one bounded binding. The Pro gap register distinguishes static text from a live data-bound narrative and warns that every supporting view needs clear population meaning.

## Expansion trigger

Expand when a recurring analysis needs manual explanation updates after filtering, and one existing metric can supply the statement.

## Next step after confirmation

Bind a single selected count beside a matching card. Check filtering, zero rows, and restore against exact IDs. Decide whether explicit bindings solve the task before introducing templates or generated language.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
