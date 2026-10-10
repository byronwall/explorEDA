---
title: "One diagram of a project's tables, links, calculations, and views"
slug: "schema-diagram"
phase: intent
status: current
last_updated: "2026-10-10"
---

# One diagram of a project's tables, links, calculations, and views

## My read

An analyst with a multi-table project needs one place that shows everything the views stand on: every table and its fields, how the tables relate, which fields are calculated and from what, and which views use each field. Today those facts sit in separate places. The Schema panel lists tables and relationships as cards. The Query panel shows one view's steps. Calculations live inside query steps or inside each view's saved settings. No surface answers "what uses this field?"

The request is for a single diagram in the style of an ER diagram: tables as boxes with field lists, relationships as lines between the key fields, calculations visible as derived fields with their inputs, and views downstream of what they read. "Crisp 2D" sets the quality bar: a static, legible layout with straight reading order, not a force-directed hairball or a 3D scene.

"Universal" means it covers all the backing definitions in the project, not one query at a time. Downstream usage by view is the most valuable addition and the part that does not exist anywhere yet; the user marked it "ideally", so it is wanted but can follow the core diagram.

It is also an editor. Anything in the diagram that is editable elsewhere (relationships, query steps, field labels and types, calculations, keys) can be edited where it is drawn, so the diagram becomes the main place to shape the model, not only a map of it.

It covers single-table workspaces too. There it is simply one table showing its fields, and that view is the natural place to add a second data source and grow the workspace into a related-table project.

## What matters most

- One all-in-one surface for the whole project: tables, fields, relationships, query steps, calculations, and views.
- Field-level detail. Lines attach to fields, not just to tables.
- Lineage in both directions: where a calculated or view field comes from, and which views use a source field.
- A clean, stable 2D layout that reads the same way every time.
- It doubles as an editor: what is editable can be edited from the diagram.
- Visual quality first. explorEDA is a visual tool, so the diagram has to look and feel right early, not after the plumbing.

## The experience you appear to want

Open the diagram from the toolbar. It takes a very wide drawer, like the Rows viewer, with a strip of charts still visible. Tables sit on the left, each showing its fields with type and key marks; relationship lines join the matching fields and show cardinality. Queries and their calculated fields sit to the right of the tables they read. Views sit at the far right. Select a field and the diagram highlights its upstream sources and downstream uses, including the specific charts that read it, while dimming everything else. Select a relationship, field, or calculation and edit it in place; drag from one field to another to relate two tables. In a single-table workspace the diagram is one table, with an action to add another source beside it.

## Boundaries

### Must be true

- Opening it changes nothing; only an explicit edit does, and each edit is one undo step.
- Edits made here and in the existing panels are the same edits with the same rules.
- Every calculation shows the fields it depends on.
- Usage reflects real references in saved views: chart fields, filters, facets, Rows columns, aggregates, and view calculations.
- Works at the project sizes the demos ship (a handful of tables, dozens of fields) without manual arranging.

### Must be avoided

- A force-directed or physics layout that shifts between openings.
- A second, divergent editor with its own rules for relationships, calculations, or field settings.
- Modal editing that hides the diagram while an element is edited.
- Native `title` tooltips, or hiding field names behind hover.

## What seems settled

- It is a node + edge + field-list view, ER-diagram style.
- It shows tables, fields, relationships, and calculations.
- It covers multi-table projects and single-table workspaces. A single table renders as one table with its fields.
- It opens in a very wide drawer like the Rows viewer, not a side panel.
- It doubles as an editor for what is already editable, query steps included.
- Adding a data source from the diagram is the path from one table to a project.

## Possibilities, not decisions

- Columns ordered tables → queries → views.
- Drawing a line between fields to create a relationship.
- How the new source's file is picked; that belongs to the host.

## Current reality that matters

- `AnalysisProject` already holds sources, fields, entity keys, relationships with cardinality, queries with lookup, expand, calculate, filter, and aggregate steps, and parameters.
- Query output fields already carry an origin: a source field or a step.
- The library component receives one view at a time. The demo holds the full list of views as tabs, so usage across views needs the host to pass them.
- `incompatibleSettingsFields` already walks a view's saved settings for every field it references.
- No graph layout dependency exists in the package.
- The Rows drawer (`RowsPeek`) lives in `ExplorEda`, so a drawer built the same way serves both workspace kinds.
- Editing already exists in separate places: relationships in the Schema panel, calculations through the calculation editor, field labels and types in the field inspector, query steps in the Query panel.
- Hosts own source data. Nothing yet turns a single-table workspace into a project; the demo starts a new analysis for each import.

## Next step after confirmation

Shape the diagram so it looks right first, then make its elements editable with the existing editors, then add lineage and the add-source path.
