---
title: "Use one analytical result as another view’s input"
slug: "reusable-analysis-outputs"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Use one analytical result as another view’s input

## My read

Analysts may want to inspect a grouped, pivoted, modeled, or density result and then use it in another view. Existing traces reveal many intermediate values and contributors. Inspection does not yet make every result a named downstream table. The outcome is reuse for one concrete analytical task.

Start from a result the user currently exports and imports again. Keep its row grain, source membership, parameters, and filter scope clear. A grouped row can represent many source records; a model sample is not a source observation. The proposed capability should expose that difference while avoiding a second general analytics engine.

This remains a future seed. Its expansion trigger is a proposed decision rule, not a release commitment.

Byron has not identified a task for this capability and asked what it changes. Keep it unprioritized. An example is turning many experiment measurements into one mean per experiment, then plotting those means. The downstream chart analyzes experiments rather than raw measurements. That distinction explains the scope; it does not establish demand.

## What matters most

- Name result grain and contributor meaning.
- Make refresh and filtering rules explicit.
- Reuse one result without duplicating its computation contract.

## The intended experience

Inspect a grouped output, choose it as the input of another view, and read its fields and row meaning. Change an upstream filter and observe the declared refresh behavior. Trace a derived row back to its inputs. Keep original observations reachable when the downstream view selects groups.

## Boundaries

Do not treat generated curve points as independent measurements. Avoid a universal graph editor or automatic caching platform. Stable source identity is needed before durable bookmarks or cross-reload result references. Multi-source lookups and graphics composition already have separate initiatives.

## What seems settled

This is a future reuse seed. The Pro traceability prototype is reference material, not adopted package code. A narrow named result can test the need before any broader architecture.

## Current reality that matters

Saved settings include named aggregates used by bars. Trace planners retain contributors. Scalar calculation inspection exists. Generic pivot/model/density outputs are not part of a source catalogue. The current provider still starts from one row array.

## Expansion trigger

Expand when the same exported result is repeatedly reused, or a second view needs an analytical output that cannot be expressed over the existing source.

## Next step after confirmation

Wait for an actual downstream-analysis task. If one appears, expose one grouped result as a small inspectable table and feed one current view from it. Check row meaning, contributors, and filter refresh before choosing a more general pipeline.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
