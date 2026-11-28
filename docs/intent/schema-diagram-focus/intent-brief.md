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

- One screen of readable content: labels read at normal zoom with no pan, and the whole structure stays in view (Byron's done bar).
- Two jobs first: how the sources relate, and what the dashboards cover. Where each source came from is the third. Editing the full model comes later.
- Unused tables collapse and expand on demand. Unused fields matter less.
- The Schema button opens the whole project. A per-analysis entry may open that analysis's own view.

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

- Usage is the main signal for emphasis.
- Coverage shows in the diagram first: each table marked with its readers, and one analysis's path lit up on choice. A sources × analyses grid is a second, smaller view.
- Byron assumed the CI relationships were modeled. Agents that build a workspace should declare them. The CI project came from an agent script (TASK-0091 `dashboard.py`) that wrote one source and one pass-through query per CSV and no relationships.
- Browsing rows of a table is the data explorer's job (W4), not this one.
- From Byron's W4 answers: he wants to see how sources relate, then build a dashboard on a slice. He also wants to see which sources the existing dashboards cover. Both are a separate action from the Data rail, and W4 leaves them to this initiative.

## Possibilities, not decisions

- Fold a pass-through query (one Read step) into its table instead of drawing its own card.
- Collapse unused fields, or whole unused tables, into a one-line summary.
- Order and group tables by the view that reads them.
- A "Used / All" toggle on the diagram.

## Current reality that matters

- Shipped in `exploreda@0.6.0` (PRs #695, #698, #699): hover a Data row for a card with every field's type, distinct count, and values, plus "Used by …". Click a Data row to open a full explorer. The rail entry that opens this diagram is now **Tables and links**, with the line "Relate N tables to chart their fields together". So the diagram no longer has to answer "what is in this table" or "who uses it" by itself.
- `sourceUsage` (#699) reads the diagram's lineage edges. A change that hides pass-through queries must keep those edges in the graph.
- Link proposals (`proposeLinks`) run only for database tables. The CSV-based CI project gets no suggestions, though Runs, Jobs, and Steps share `run_id` and `job_id`.
- The diagram opens focused on the current view's source, with its inspector over the cards.
- The project has grown: 15 tables, 146 fields, 15 one-step queries, 7 views. The views read 5 of the 15 tables.
- In the round 1 count, the five views read 16 of 139 fields, from 4 of 14 tables, through 4 of 14 queries.
- Byron says the CI dashboards are built on relationships, but the project declares none. Runs, Jobs, and Steps share `run_id` and `job_id` with no declared link, so the diagram cannot draw them.
- All 14 queries are one-step reads of one table. The project file writes them as `query @x { source x }`.
- The graph already has `usage`, `lineage`, and `calculation` edges, and `traceField` walks them. Used fields are known; nothing changes size or position from that.
- `compactViews` already folds non-current views to one row per chart. A matching fold for tables and queries does not exist.
- `layoutSchemaGraph` picks columns by depth and wraps to fit the drawer. With 14 pass-through queries, column 2 is 14 identical cards, and every table line routes through a shared bus to that column.

## What still needs your input

The first question round asks these. The questions are in `questions.md`.

## Next step after confirmation

Shape the selected approach, then plan a first slice on the CI project.
