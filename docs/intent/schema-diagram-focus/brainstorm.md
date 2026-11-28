---
title: "Schema diagram that shows what the analyses use — contrasting approaches"
slug: "schema-diagram-focus"
phase: brainstorm
status: draft
last_updated: "2026-11-27"
---

# Schema diagram — contrasting approaches

Every option keeps all data reachable, keeps tracing and editing, and uses the usage edges the diagram already computes. They differ in what the diagram is about.

## Option 1 — Usage-weighted layout

**Core move:** Keep the table → query → view columns. Sort and size by use: used tables go first and stay full; unused fields inside a used table fold to "+ 9 more fields"; unused tables shrink to a one-line header in a quiet "Not used" group. Pass-through queries merge into their table.

- **Makes easier:** Smallest change to the current model. On the CI project the first screen drops from 33 cards to about 4 full tables, 5 views and a short list.
- **Main catch:** It is still a schema diagram. The lines still cross columns, and a project where every table is used looks much as it does now.
- **Best fit:** When the diagram's job stays "show the model", with less noise.

## Option 2 — Lineage from the views back

**Core move:** Start at the views. Each view is a lane on the right; its used fields trace back left through query steps to the source table. Only fields on a path draw. Tables with no reader sit in a separate inventory strip below or in a side list.

- **Makes easier:** Answers "where does this chart's number come from?" directly. Lines are short and stay within a lane.
- **Main catch:** A big change in what the diagram is. Editing fields and relationships of unused tables moves to the inventory. Shared tables (Comparison feeds two views) need a rule.
- **Best fit:** When the main use is to understand and check analyses, not to model data.

## Option 3 — Two modes: Used and All

**Core move:** Add a toggle. **Used** (the default when any view exists) shows only the tables, fields, and queries on a view's path, laid out compactly. **All** is today's diagram, with pass-through queries merged and quieter styling.

- **Makes easier:** Clean first look, and the full model is one click away. Each mode can use a simpler layout rule.
- **Main catch:** Two layouts to keep correct. Users can miss that data is hidden.
- **Best fit:** When both jobs matter about equally and a clear switch is acceptable.

## Strongest contrasts

- Option 1 changes emphasis in one picture; Option 3 splits into two pictures; Option 2 changes the picture's subject.
- Option 2 makes views the anchor; Options 1 and 3 keep tables as the anchor.
- Option 1 is the least work; Option 2 is the most.

## My current lean

Option 1 with the pass-through merge, plus a "Not used" group that can expand. It fixes the screenshot without a new mode, and its parts (merge, fold, sort) are each small and separate. If Byron's main use of the diagram is to check where a chart's numbers come from, Option 2 is the better target.
