---
title: "Keep explanations aligned with the selected data"
slug: "data-bound-narrative"
phase: plan
status: current
last_updated: "2026-10-22"
---

# Keep explanations aligned with the selected data

## My read

Analysts may want a short explanation beside a chart that updates when its population or measure changes. Static Markdown already provides context. The future opportunity is a small data-bound statement such as a selected record count or an explicitly defined metric, with the same scope and formatting as the related views.

The durable outcome is accurate analytical context without manual edits after each filter. It does not require generated prose or an agent. A sentence should identify the population behind its value and avoid implying a conclusion the metric cannot support. Start with one transparent binding rather than a full report template language.

The [live-finding plan](implementation-plan.md) now defines a staged feature. Implementation remains a separate request.

## What matters most

- Use the same metric and population as linked views.
- Preserve units and empty/unavailable results.
- Keep each binding inspectable.

## The intended experience

Add a short explanatory statement beside a chart. Bind one count or measure to the current population. Filter the workspace and compare the text with the card and source rows. Inspect the binding. Save and restore the view so the statement reevaluates against the current source.

## Boundaries

Do not insert arbitrary code, remote model calls, or hidden calculations into Markdown. Do not describe a descriptive metric as a causal conclusion. Keep empty values honest. Composed graphics, automatic reports, and in-app agents have separate initiatives and are not prerequisites.

## What seems settled

Static Markdown is delivered. The reviewed plan proposes named findings, local chart bindings, and reference-only prose tokens. It preserves current notebook selection defaults.

## Current reality that matters

The registry includes Markdown and Metric Card. Shared reductions and formatting can support one bounded binding. The Pro gap register distinguishes static text from a live data-bound narrative and warns that every supporting view needs clear population meaning.

## Planning direction

[Pro research direction](../../research/DIRECTION.md) replaces the earlier demand gate. Byron is the demand. Start with live values and exact current evidence; prototype saved evidence separately.

## First implementation step

Follow M1 in the [implementation plan](implementation-plan.md). Resolve a named chart’s local selection, then derive a count and average with exact contributor records.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.

## Mosaic research follow-up

The [Mosaic study](../../research/mosaic-selections-2026-10-20/README.md) gives this seed a bounded proof.
Bind one selected-row count to the same exact population as an evidence table.
Name the eligible denominator and provide the existing inspection route.
Keep authored daily findings separate; their current condition evaluator does not follow workspace selection.
The [live-findings design](../../research/live-findings-2026-10-22/README.md) extends this study with authoring and persistence decisions. The implementation plan now sets the sequence.
