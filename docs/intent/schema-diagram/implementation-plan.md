---
title: "One diagram of a project's tables, links, calculations, and views — implementation plan"
slug: "schema-diagram"
phase: plan
status: current
last_updated: "2026-10-10"
---

# Schema diagram — implementation plan

## Plan at a glance

The diagram is both a viewer and an editor, and explorEDA is a visual tool, so the order puts what the analyst sees and touches first.

1. **Visual slice:** a polished drawing of tables, fields, and relationships in the wide drawer, for projects and single tables. It needs only what the project states directly, so all early effort goes into the visual language.
2. **Editor on that drawing:** selection, an inspector popover, and in-place edits to fields, keys, and relationships. The editor model is proven on simple data, through the existing write paths, before more columns arrive.
3. **Lineage drawn and editable:** query, calculation, and view columns, backed by the tested `buildSchemaGraph` model. Calculations become editable from their cards.
4. **Query steps edited in place:** add, edit, and remove steps, and start new queries, so the diagram is the all-in-one editor.
5. **Field focus:** lineage highlight and the uses list in the inspector.
6. **Every saved view:** the host's view list.
7. **Add source:** including single table to project.

Two rules hold throughout. First, editing reuses and never forks. Relationship logic moves out of `ProjectSchemaPanel`, and step building out of `QueryRelationshipBuilder`, into shared code. Calculations open the existing calculation editor, and field settings go through `updateFieldSettings`. Every edit reaches the host the way it does today, as one undo step. Second, lineage is where a diagram can lie, so the model is a pure, tested function, and unresolved references are drawn as stubs instead of guesses.

Each step leaves a working system. The toolbar entry gates the diagram, and `readOnly` hides every edit control. There is no external dependency. The fast loop is the demo dev server, which runs the library from source, plus Vitest on the pure layout, model, and editing functions.

## Implementation strategy

- **First proof:** the Schema drawer showing the shop project and a CSV import as table cards with relationship lines, reviewed in screenshots.
- **Primary seams:**
  - `SchemaGraph` is the plain data shape the renderer draws. It starts as tables and relationships and grows lineage, calculation, and usage edges.
  - `buildSchemaGraph(input)` lives in `packages/explorEDA/src/lib/schema/`. It takes a project with views, or one table's fields with its `SavedDataStructure`.
  - `ExplorEda` takes an optional `schema` prop: `{ graph, onProjectChange? }`. `ExplorEdaProject` passes both. Without it, `ExplorEda` builds the single-table graph, and its edits go to its own store.
  - Every edit routes through one of two existing paths. Project definitions (relationships, entity keys, source field names, query steps) go through `onProjectChange`. View settings (field labels and units, type overrides, workspace calculations) go through the data store, which reports `onStateChange`.
  - Optional `views` and `onAddSource`, for usage and new sources.
- **Fast local loop:** `pnpm --filter demo dev --port 5291 --strictPort` with the shop example and a CSV import, and `pnpm --filter exploreda exec vitest run src/lib/schema` for the layout, model, and editing functions.
- **Local dependencies:** `test/fixtures/shopProject.ts`; the demo's shop, World Bank, flights, Beijing, and earthquakes examples.
- **Provider/live confirmation:** none; no external service.
- **Rollout and rollback:** the toolbar entry gates the diagram, and `readOnly` hides edits. `schema.onProjectChange`, `views`, and `onAddSource` are optional, so each capability degrades cleanly when a host omits it.

## Milestone 1: A polished diagram of tables and relationships

This milestone settles the visual language while the data is trivial. Everything later is drawn in this style.

- **Change — Shared wide drawer**
  - Extract the shell of `RowsPeek` into a shared workspace drawer: fixed position, a chart strip on the left, Escape and outside-click close, and a header with the scope and a close button. `RowsPeek` moves onto it with no visible change.
  - `PlotManager` keeps Rows, the diagram, and side panels mutually exclusive.
  - Add a "Schema" toolbar button in `ExplorEda` with a tooltip, and "Open diagram" in the project Schema panel.
- **Change — Table cards and relationship lines**
  - `SchemaGraph` v1 holds tables (name, glyph, row count, fields with type, profile, and key) and relationships (field to field, cardinality). A single table becomes one card.
  - Draw an SVG card per table. Field rows use the `FieldMetadata` visual language, with a key mark and ƒ on workspace calculations. Use theme tokens throughout, and no `title` or SVG `<title>`.
  - Relationship lines attach at the exact field rows, show cardinality marks, and stay clear of cards. Pick the routing style in review.
  - Pan, zoom, and fit on open.
  - Give each card and field row a stable element ID now, so selection and editing in Milestone 2 have something to anchor to.
- **Change — Layout v1**
  - `layoutSchemaGraph` is a pure function that orders tables by relationship depth, with definition order as the tiebreak. Tests check that the same input gives the same output and that no cards overlap.
- **Change — Visual review loop**
  - Take Playwright screenshots of the shop, World Bank, and flights examples and a CSV import, at 1280, 783, and 390 px, in light and dark themes.
  - Run an `impeccable` critique pass and fix what it finds before moving on.

### Desired end state

- The Schema button opens a finished-looking diagram for the shop project and for a single CSV table.
- Lines land on the correct field rows, and no cards overlap on any demo project.
- Rows looks and behaves as before.
- A reviewed screenshot set at three widths and two themes, with critique fixes applied.

## Milestone 2: Select and edit fields, keys, and relationships in place

This proves the editor model on the simplest data: selection, an anchored inspector, edits through existing write paths, and undo.

- **Change — Selection and inspector**
  - One selected element at a time: a table, field, or relationship. Click, Enter, or arrow keys select; Escape or empty space clears.
  - A compact nonmodal popover anchored to the element shows its properties and edit controls. The diagram stays visible and interactive.
  - Mark inputs with `data-inplace-editor` so drawer close and pan gestures leave them alone.
- **Change — Shared relationship editing**
  - Move proposal, conflict checking, and `countMatches` out of `ProjectSchemaPanel` into `components/project/relationshipEditing.ts`. Both the Schema panel list and the diagram use it, and the existing `ProjectSchemaPanel` tests pass unchanged.
  - In the diagram, dragging from one field row to another proposes a relationship. A ghost line shows matched, unmatched, and ambiguous counts before confirming. The inspector also has "Relate to…" with a table and field picker, which is the keyboard and touch path.
  - A selected relationship can change cardinality or be removed. Removal names the queries that follow it, using the panel's existing `affected` logic, before it confirms.
- **Change — Field and table edits**
  - In a project, a table card's field name edits the project's `FieldDefinition.name`, and the entity key is chosen from the inspector. Both go through `onProjectChange`.
  - Label, unit, and type override go through `updateFieldSettings` and reuse the field inspector's controls. In a single table, the card offers only these.
- **Change — Undo and read-only**
  - Each confirmed edit is one host callback: one demo undo step. A text input commits on Enter or blur, so typing never records a step per keystroke.
  - `readOnly` keeps selection and hides edit controls.
  - Tests:
    - shared relationship logic as unit tests;
    - one confirmed edit gives one `onProjectChange`;
    - read-only renders no edit controls.

### Desired end state

- In the shop demo, dragging `Orders.customerId` onto `Customers.customerId` shows match counts and creates the relationship. The Schema panel list shows it at once.
- Field labels, units, types, and the entity key are editable from the diagram. Each edit is one undo step in the demo.
- Every drag action has a menu path that works at 390 px.
- Real mouse and keyboard checks pass at all three widths, with screenshots of the inspector.

## Milestone 3: Queries, calculations, and views drawn and editable

The drawing grows the columns that need real resolution, and calculations become editable where they are drawn.

- **Change — Extract view field usage**
  - Refactor the walk inside `incompatibleSettingsFields` into `settingsFieldUsage(settings)`. It returns each use with its place: chart ID and title, role, Rows column or filter, aggregate, or view calculation.
  - Its existing tests pass unchanged.
- **Change — Lineage model**
  - `buildSchemaGraph` adds query and view nodes, and four edge kinds:
    - lineage, from a source field or step to a query field;
    - calculation inputs, from `parseExpression(...).dependencies`;
    - aggregates;
    - usage.
  - Unresolved references become `missing` stubs. A parse failure gives an error mark.
  - Tests on the shop fixture: `customer.name` traces to `Customers.name`, an unread field has no usage edges, and a broken expression shows an error.
- **Change — Draw the new columns**
  - Query cards list steps and output fields with ƒ and Σ. View cards list used fields grouped by chart. Lineage and usage lines are lighter than relationship lines, and stubs use the warning style.
  - Repeat the screenshot review on World Bank and flights.
- **Change — Calculation editing**
  - A workspace calculation opens the existing calculation editor (`useCalculationEditor().open`). "Add calculation" on a table card or view card opens it empty.
  - Renaming or deleting a calculation names the views whose uses it breaks before it confirms.
- **Spike — Can empty-table evaluation give field lineage?**
  - Decision required: use `evaluateAnalysisQuery` on empty tables, or a static walk over steps.
  - Evidence to gather: run it on every demo analysis, including parameterized queries and aggregates. Compare its field list to a real evaluation.
  - Fallback: a static walk that mirrors the evaluator's field rules.

### Desired end state

- The shop diagram reads tables → queries → views, with every use resolved or shown as a stub.
- Workspace calculations are created and edited from the diagram, with validation and breakage warnings.
- Query cards show every step with its row counts; editing them comes next.
- Model tests pass, and `incompatibleSettingsFields` is unchanged.

## Milestone 4: Edit query steps in the diagram

The diagram becomes the all-in-one editor. The Query panel stays as the compact per-view companion, and both use the same step logic.

- **Change — Shared step editing**
  - Move step construction out of `QueryRelationshipBuilder` into `components/project/stepEditing.ts`: lookup, expand, and expand-then-summarize. Add pure builders for calculate and filter steps, and for removing a step.
  - Removal reports what depends on it: later steps that read its fields, and view uses from the lineage model. `QueryRelationshipBuilder` and its tests use the shared code unchanged.
- **Change — Step editing on query cards**
  - Selecting a step opens it in the inspector, where its settings are edited: relationship and direction, filter field, operator, and value or parameter, calculate label and expression, and aggregate group and measures.
  - "Add step" after any step offers the same four kinds. Following a relationship can also start from dragging a relationship line onto a query card, with a menu path for keyboard and touch.
  - Removing a step names the steps and views that depend on it before it confirms.
  - "New query" on a table card uses the existing `sourceView` and opens the new view through `onOpenView`. Parameters show on the query card and edit with the existing `QueryParameters` controls.
  - Every change applies through `replaceQuery` and `onProjectChange`, as one undo step.
- **Change — Checks**
  - Unit tests for each builder and for dependency reporting.
  - The browser flow covers the shop demo: add a lookup to Products on the items query, filter it, and summarize revenue. The Query panel shows the same steps.

### Desired end state

- Every step kind the Query panel offers can be added, edited, and removed from the diagram, plus filter and calculate steps.
- Removing a step warns about the exact steps and views it breaks.
- The Query panel and the diagram stay in sync, through one write path.

## Milestone 5: Field focus traces lineage both ways

- **Change — Focus model**
  - `traceField(graph, ref) → { upstream, downstream }` is a pure function, with tests through lookups and calculations.
- **Change — Focus in the selection**
  - Selecting a field also lights its lineage and dims the rest.
  - The inspector gains the uses list. A chart use jumps to that chart, and a view use opens the view through `onOpenView`.

### Desired end state

- Selecting `Customers.name` lights its lookup and every view use, and the inspector lists them.
- Unused fields say "Not used by any view".

## Milestone 6: Usage across every view in the host

- **Change — `views` prop**
  - Add optional `views?: AnalysisView[]` to `ExplorEdaProject`. Without it, the diagram shows only the current view and says so.
  - The demo's `SavedViewsWorkspace` passes its tabs, and breakage warnings from Milestones 2–4 now cover every tab.

### Desired end state

- A field used only by a second saved tab lists that tab, and removing its relationship warns about that tab.
- A host that omits `views` still gets a working diagram.

## Milestone 7: Add a source from the diagram

This step changes saved state the most, so it comes last behind an optional callback.

- **Change — Promotion helper**
  - Add `singleTableProject(fields, settings, name)` to `exploreda/analysis`. It returns `{ project, view }` with one source, one source query, and the current settings on the view.
  - Round-trip test: charts, filters, a calculation, field settings, and a Rows layout survive promotion unchanged.
- **Change — `onAddSource` in both components**
  - An Add source card sits beside the tables when the host provides the callback. The host picks a file and returns rows and a source definition, or cancels.
  - In a project, the library appends the source through `onProjectChange`. In a single table, the host receives the promoted `{ project, view }`.
  - The new table card is selected, with "Relate to…" ready.
- **Change — Demo wiring**
  - The rows workspace uses its CSV import for `onAddSource`. It opens a new project session that keeps the charts and reopens the diagram on the new table. The single-table session stays saved and restorable.
- **Spike — Do positional row keys survive promotion?**
  - Decision required: whether saved selections and `__ID` filters need translating through `encodeAnalysisRowKeys`.
  - Evidence to gather: promote a workspace with a selection and an `__ID` filter, then compare rows and selections before and after.
  - Fallback: drop row-key selections on promotion, and say so.
- **Change — Changeset and docs**
  - Add `pnpm changeset:add minor "..."`.
  - Update the package README's Related tables section and `docs/application-feature-inventory.md`.

### Desired end state

- A demo CSV workspace adds a second CSV from the diagram, relates it by dragging, and keeps its charts and layout.
- Hosts without `onAddSource` show no card.
- `pnpm check` passes once before the PR.

## Open decisions and spikes

The two spikes inside Milestones 3 and 7 are the only open items. Query step editing and the promotion session are settled.

## Below the cut line

- Diagram export as SVG or image.
- Search and filter within the diagram.
- A keyboard shortcut to open the diagram.
- Manual node positions saved with the project.
- A general graph layout library.
- Configuring charts from view cards.
- Row-level match diagnostics on existing edges, beyond the counts shown while proposing.
