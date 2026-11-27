---
title: "Schema diagram that shows what the analyses use"
slug: "schema-diagram-focus"
phase: intent
status: draft
last_updated: "2026-11-27"
---

# Schema diagram that shows what the analyses use

## My read

On a real project, the Schema diagram stops being useful. Byron opened it on the CI-analysis project (14 tables, 139 fields, 0 relationships, 14 queries, 5 views) and called it "just a complete mess." He did not name a fix. His one lead was "some sort of emphasis on the data that's actually being used, maybe." He also said the opposite risk out loud: "at least it has all the data there, so we can go play with it."

So the goal is a diagram that answers "what does this project actually depend on, and how?" at a glance, and still lets him reach every table and field. The diagram already knows which fields each view reads. It does not use that knowledge to decide what is large, what is quiet, or where things sit.

## What matters most

- The data the analyses use stands out at first look.
- Unused data stays reachable. It is quiet, not gone.
- A project with no relationships and many one-step queries still reads cleanly.

## The experience you appear to want

Open the diagram. The few tables and fields that feed a chart are prominent, with short, clear paths to the views that read them. The rest of the project is visible as a calm, compact inventory. Select anything to see it in full or to trace it.

## Boundaries

### Must be true

- Every table and field stays reachable from the diagram.
- Lineage tracing, editing, and Add source keep working.
- The layout stays the same for the same project and drawer size.

### Must be avoided

- A wall of equal cards where 16 used fields hide among 139.
- Connector lines that run across the whole drawer to reach a column of nodes.
- Cards that say nothing new, such as a query whose only step is "Read Coverage".

## What seems settled

- Usage is the main signal for emphasis. It is Byron's only concrete lead.
- Browsing rows of a table is the data explorer's job (W4), not this one.
- From Byron's W4 answers: he wants to see how sources relate, then build a dashboard on a slice. He also wants to see which sources the existing dashboards cover. Both are a separate action from the Data rail, and W4 leaves them to this initiative.

## Possibilities, not decisions

- Fold a pass-through query (one Read step) into its table instead of drawing its own card.
- Collapse unused fields, or whole unused tables, into a one-line summary.
- Order and group tables by the view that reads them.
- A "Used / All" toggle on the diagram.

## Current reality that matters

- In the CI project, the five views read 16 of 139 fields, from 4 of 14 tables, through 4 of 14 queries. The other 10 tables have no reader.
- Byron says the CI dashboards are built on relationships, but the project declares none. Runs, Jobs, and Steps share `run_id` and `job_id` with no declared link, so the diagram cannot draw them.
- All 14 queries are one-step reads of one table. The project file writes them as `query @x { source x }`.
- The graph already has `usage`, `lineage`, and `calculation` edges, and `traceField` walks them. Used fields are known; nothing changes size or position from that.
- `compactViews` already folds non-current views to one row per chart. A matching fold for tables and queries does not exist.
- `layoutSchemaGraph` picks columns by depth and wraps to fit the drawer. With 14 pass-through queries, column 2 is 14 identical cards, and every table line routes through a shared bus to that column.

## What still needs your input

The first question round asks these. The questions are in `questions.md`.

## Next step after confirmation

Shape the selected approach, then plan a first slice on the CI project.
