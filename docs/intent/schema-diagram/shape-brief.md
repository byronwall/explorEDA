---
title: "One diagram of a project's tables, links, calculations, and views — shape brief"
slug: "schema-diagram"
phase: shape
status: current
last_updated: "2026-10-10"
---

# Schema diagram — what we are adding

**Outcome:** An analyst sees and edits a workspace's whole model on one 2D diagram: tables, fields, relationships, query steps, calculations, and views. It is the all-in-one place for the model. They can trace any field to its sources and uses, and add a data source from the same place.

**Primary flow:** Toolbar "Schema" → a very wide drawer opens → select a table, field, line, or calculation → its lineage lights up and a compact editor opens beside it → edit, and the diagram updates in place.

## Feature scope

```text
Schema diagram (viewer and editor, both workspace kinds)
├── PLANNED ADDITIONS
│   ├── Surface: very wide drawer, built like the Rows drawer
│   │   └── Toolbar entry in every workspace; "Open diagram" in the project Schema panel
│   ├── Drawing
│   │   ├── Table cards: name, glyph, row count, typed fields, key mark
│   │   ├── Relationship lines: field-to-field, cardinality at each end
│   │   ├── Query cards: each step as a row with row counts; ƒ and Σ fields; input lines
│   │   │   └── Lookup and expand steps draw a line to the relationship they follow
│   │   ├── View cards: used fields grouped by chart; view calculations
│   │   ├── Single table: one card with its fields and calculated fields
│   │   └── Flows left to right, top to bottom, shaped to fill the viewport; pan, zoom, fit
│   ├── Selection: one element at a time
│   │   ├── Lineage upstream and downstream lit, the rest dimmed
│   │   └── Inspector popover: properties, uses list, edit controls
│   ├── Editing in place (same rules as the existing editors)
│   │   ├── Field: label, unit, type override
│   │   ├── Table: entity key
│   │   ├── Relationship: drag field to field to propose, with match counts; cardinality; remove
│   │   ├── Calculation: open the calculation editor; add one from a table or view card
│   │   ├── Query: add, edit, or remove steps (follow relationship, calculate, filter, summarize)
│   │   │   └── New query from a table card; parameters shown on the query card
│   │   └── View: open it; a chart use jumps to that chart
│   └── Add source: card beside the tables; the host picks the file
│       ├── Single table: becomes a project; charts and layout kept
│       └── Project: new table appears, ready to relate
├── EVALUATE BEFORE COMMITTING
│   └── Ordering tables by relationship depth vs. definition order
└── LATER POSSIBILITIES
    └── Export the diagram as SVG
```

## Behavior

| Situation                                                                   | Expected result                                                    |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Opening the diagram                                                         | Nothing changes; only an explicit edit does                        |
| Any edit                                                                    | One undo step; the diagram and panels update together              |
| Edit that breaks a view (removed relationship or step, renamed calculation) | The inspector names the affected steps and views before confirming |
| Read-only workspace                                                         | Same drawing and selection; edit controls hidden                   |
| Drag onto a field of the same table                                         | No proposal; the target says why                                   |
| Narrow width or touch                                                       | Every drag action also has a menu path in the inspector            |
| Field not used by any view                                                  | Muted mark; the inspector says "Not used by any view"              |
| Calculation that fails to parse                                             | Error mark; inputs unknown, not guessed                            |
| Lookup field such as `customer.name`                                        | Traced through the lookup to `Customers.name`                      |
| Host does not handle adding sources                                         | No Add source card                                                 |

## Decisions and boundaries

**Appetite:** A large feature: the diagram, an editor layer covering relationships, fields, calculations, and query steps, lineage, and one table-to-project promotion path. The Schema and Query panels stay as compact companions. No new runtime dependency.

**Key decision:** Visuals lead, editing follows straight after. The first slice is a polished drawing of tables and relationships. Selection and in-place editing come next, on that simple data, so the editor model is proven before lineage adds columns.

Editing reuses, never forks. Relationship proposal and match counts move out of `ProjectSchemaPanel`, and step building moves out of `QueryRelationshipBuilder`, into shared logic used by the panels and the diagram. Calculations open the existing calculation editor. Field settings use the field inspector's controls through `updateFieldSettings`. Every edit goes through the existing write paths (`onProjectChange` and the data store), so undo and host callbacks behave as they do today.

`buildSchemaGraph` stays a pure, tested model. The layout is hand-rolled rather than ELK or dagre: it reads left to right and top to bottom, and picks the arrangement that shows the whole diagram largest in the current viewport, wrapping a tall layer into more columns rather than leaving the screen empty. Editors open in compact nonmodal popovers anchored to the selected element, so the diagram stays visible.

**Boundary:** Source rows stay host-owned. Promotion keeps the saved charts and starts a new project session, leaving the single-table one restorable. Charts are not configured from the diagram; a chart use jumps to the chart. Removing the toolbar entry disables the diagram. `readOnly` hides every edit control, and omitting the host callback hides Add source.

**First proof:** **Try:** open the Schema drawer on the shop demo and a CSV import, and draw table cards with typed field rows and relationship lines, in light and dark themes. **Observe:** screenshots at 1280, 783, and 390 px. Do cards read at a glance, do lines land on the right rows, and does it feel like explorEDA? **Decide:** if yes, add selection and editing on this drawing next. If not, iterate on the visual language first, and try ordering heuristics before any layout library.

See the [intent brief](intent-brief.md) and [implementation plan](implementation-plan.md).
