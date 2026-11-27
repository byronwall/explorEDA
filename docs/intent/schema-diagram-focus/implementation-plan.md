---
title: "Schema diagram that shows what the analyses use — implementation plan"
slug: "schema-diagram-focus"
phase: plan
status: draft
last_updated: "2026-11-27"
---

# Schema diagram — implementation plan

## Plan at a glance

Byron's done bar is "one screen of readable content." That bar decides everything else, so the first milestone proves it on the CI project before any coverage work. M1 condenses the drawn graph and changes the fit to 100%. M2 adds coverage inside the diagram. M3 adds the coverage grid and the rail entry. M4 updates the docs and retires the plan.

All work is local and in one package. There is no external dependency. The fast loop is Vitest on the pure graph functions plus `scripts/app-shot.mjs` on the CI project folder. Each milestone ships as a PR that leaves the diagram working. To roll back, revert one layer; the project text and stored data do not change.

The pushback: condensing must stay a drawing step, as `compactViews` is now, applied after `projectSchemaGraph`. Then `sourceUsage`, tracing, and editing keep reading the full graph, and no second copy of "what is used" exists.

## Implementation strategy

- **First proof:** CI project at 1,512 and 1,280 px: all used content at scale 1, no horizontal overflow.
- **Primary seam:** one new function in `lib/schema/schemaCompact.ts`, `condenseProject(graph, { expanded })`. It returns the drawn graph and a `used` set. `SchemaDiagram` calls it where it now calls `compactViews`.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/lib/schema src/components/schema`
- **Browser proof:** `EXPLOREDA_FOLDER=~/Projects/planning/tasks/TASK-0091/explorEDA pnpm --filter app dev`, then `node scripts/app-shot.mjs "<link>" --name schema --wait '.eda-schema-world'` after opening Tables and links. Use a copy of the folder if a step could write to it.
- **Rollout and rollback:** no flag. Each layer reverts on its own.

## Milestone 1: One readable screen on the CI project

- **Change — `condenseProject` in `lib/schema/schemaCompact.ts`**
  - Drop a query node whose only step is `source` and that has no calculations, along with its lineage edges. Put its glyph on the table node.
  - Compute `used`: the table field rows that any `usage` or `calculation` path reaches from a view. Reuse `traceField`'s walk; do not copy it.
  - Tables with no used field become `collapsed` nodes, unless they are in `expanded`. When the graph has no views, collapse nothing.
  - Mark used rows (`row.used = true`).
  - Fold every view, the current one included, through `compactViews`.
  - Tests: CI-shaped fixture (pass-through queries, 2 used tables, 3 unused); a query with a lookup keeps its card; no views collapses nothing.
- **Change — layout in `lib/schema/schemaLayout.ts`**
  - Collapsed tables form one list node ("Not used by any analysis") with one-line rows, placed last.
  - Choose a column count that fits the viewport width at scale 1; overflow goes down. Remove the aspect-ratio search, which chases the viewport's shape at the cost of scale.
- **Change — `SchemaDiagram.tsx` and `.eda-schema-world` CSS**
  - Fit at scale 1 (lower only when the content is narrower than the drawer, never below 1 for the first view). Scroll vertically.
  - Open on the whole project. `focusNodeId` scrolls to and outlines the card but does not open the inspector.
  - Click a row in the unused list to add it to `expanded`. Click its header to remove it.
  - Used rows get a mark. Unused rows in used tables stay plain.
- **Verify:** Vitest for the condense function and the layout. app-shot at 1,512, 1,280, and 783 px. An `--eval` that checks `scrollWidth <= clientWidth` on the viewport and a transform scale of 1.

### Desired end state

- The CI project reads at 100% with no horizontal pan.
- Existing schema tests pass. Tracing and editing work on the drawn cards.

## Milestone 2: Light up an analysis

- **Change — reader counts:** each used table header shows "2 analyses", with the names in a tooltip. The names come from the view nodes that `used` paths reach.
- **Change — light-up state in `SchemaDiagram`:** `lit: viewId | undefined`. Click a view card's header to set it. A header list of analyses does the same. Lit tables, rows, and lines draw normally; the rest dims. A field selection replaces the light-up, and Escape clears it.
- **Change — public handle:** the `ExplorEdaProject` handle's `openSchema` takes `{ sourceId?, viewId? }` in place of today's `sourceId` string. Add a changeset (minor).
- **Verify:** component test for light-up and dim. Screenshot with "Where CI time went" lit.

### Desired end state

- Choosing an analysis shows exactly the tables and fields it reads.

## Milestone 3: Coverage grid and rail entry

- **Change — Coverage tab in the drawer header:** a sources × analyses grid built from `sourceUsage`. Unused sources sort last. Clicking a dot or a column header switches back to the diagram with that analysis lit.
- **Change — `apps/app/src/ProjectRail.tsx`:** a schema icon on each analysis and notebook row, shown on hover and focus, calls `openSchema({ viewId })`. It must not shift the row (W1's rule).
- **Verify:** screenshot of the grid at 1,280 and 390 px. Rail row hover with no layout shift, measured as in #695.

### Desired end state

- Coverage reads at a glance, and every analysis opens its own lit view.

## Milestone 4: Docs and retirement

- Update the README's [schema diagram](../../../packages/explorEDA/README.md#the-schema-diagram) section, the Schema diagram line in `apps/demo/src/docs/pages/workspace.mdx`, and the feature inventory.
- Retire this folder per the skill's lifecycle rules.

## Open decisions and spikes

- **Spike in M1 — does 100% fit at 1,280 px?** Evidence: the M1 screenshot. Fallback: a smaller column gap when lines run between adjacent columns only, and the unused list as a strip under the columns.

## Retire this initiative

- Durable docs: `packages/explorEDA/README.md`, `apps/demo/src/docs/pages/workspace.mdx`, `docs/application-feature-inventory.md`.
- Remove this planning folder and add the closure record to `docs/initiative-history.json`.
