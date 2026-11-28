---
title: "Schema diagram that shows what the analyses use — implementation plan"
slug: "schema-diagram-focus"
phase: plan
status: draft
last_updated: "2026-11-27"
---

# Schema diagram — implementation plan

## Plan at a glance

Byron's done bar is "one screen of readable content," and lines must never cross a card. M1 proves the first on the CI project: condensed graph, 100% fit. M2 swaps the router for Draftably's, which routed the mockup with no card crossings. M3 lights up an analysis and adds the rail entry. M4 adds the layers (relationships overlay, unused list) and the Coverage popover. M5 updates the docs and retires the plan.

M2 depends on [byronwall/draftably#715](https://github.com/byronwall/draftably/issues/715) (row ports and strict mode in `route()`), unless Byron chooses to copy the engine. M3 doesn't depend on M2, so it can go first if #715 is not ready. The fast loop is Vitest on the pure graph functions plus `scripts/app-shot.mjs` on the CI project folder. Each milestone ships as a PR that leaves the diagram working. To roll back, revert one layer; the project text and stored data do not change.

The pushback: condensing must stay a drawing step, as `compactViews` is now, applied after `projectSchemaGraph`. Then `sourceUsage`, tracing, and editing keep reading the full graph, and no second copy of "what is used" exists.

## Implementation strategy

- **First proof:** CI project at 1,512 and 1,280 px: all used content at scale 1, no horizontal overflow.
- **Primary seam:** one new function in `lib/schema/schemaCompact.ts`, `condenseProject(graph, { expanded })`. It returns the drawn graph and a `used` set. `SchemaDiagram` calls it where it now calls `compactViews`.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/lib/schema src/components/schema`
- **Browser proof:** `EXPLOREDA_FOLDER=~/Projects/planning/tasks/TASK-0091/explorEDA pnpm --filter app dev`, then `node scripts/app-shot.mjs "<link>" --name schema --wait '.eda-schema-world'` after opening Tables and links. Use a copy of the folder if a step could write to it.
- **Rollout and rollback:** no flag. Each layer reverts on its own.
- **No-crossing check:** a test that routes every demo project's drawn graph and the CI-shaped fixture, then fails on any segment inside a card. The mockup's check (`routedEdges` in `tmp/mockups/schema/mock.js`) is the model.

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

## Milestone 2: Lines that never cross a card

- **Change — router seam in `lib/schema/schemaLayout.ts`:** replace `routeSchemaEdge` with one call per drawing. It takes the card boxes and each edge's row ends (header or row offset), and returns the paths. Its body calls Draftably `route()` with `sourceAt`/`targetAt` and strict mode.
- **Change — layout gaps:** keep column and card gaps at least twice the router's standoff, so there is always a lane.
- **Change — blocked lines:** draw nothing for a blocked line, and mark the two card headers (a small "line not shown" marker with a tooltip).
- **Change — dependency:** add `@draftably/runtime` (browser subpath from #715), or copy the engine if Byron picks that. Check the bundle size in `pnpm check`.
- **Verify:** the no-crossing test across all demo projects and the CI fixture; screenshots; route time logged for the largest demo project.

### Desired end state

- No line crosses a card in any demo project, and the same input always draws the same lines.

## Milestone 3: Light up an analysis

- **Change — reader counts:** each used table header shows "2 analyses", with the names in a tooltip. The names come from the view nodes that `used` paths reach.
- **Change — light-up state in `SchemaDiagram`:** `lit: viewId | undefined`. Click a view card's header to set it. A header list of analyses does the same. Lit tables, rows, and lines draw normally; the rest dims. A field selection replaces the light-up, and Escape clears it.
- **Change — public handle:** the `ExplorEdaProject` handle's `openSchema` takes `{ sourceId?, viewId? }` in place of today's `sourceId` string. Add a changeset (minor).
- **Verify:** component test for light-up and dim. Screenshot with "Where CI time went" lit.

### Desired end state

- Choosing an analysis shows exactly the tables and fields it reads.

- **Change — `apps/app/src/ProjectRail.tsx`:** a schema icon on each analysis and notebook row, shown on hover and focus, calls `openSchema({ viewId })`. It must not shift the row (W1's rule).
- **Verify (rail):** rail row hover with no layout shift, measured as in #695.

## Milestone 4: Layers and the Coverage popover

- **Change — Layers menu in the drawer header:** checkboxes for Lines to analyses, Relationships, and Unused tables. Remember the choice per viewer, like the drawer width.
- **Change — Relationships layer:** draw declared relationships solid and `proposeLinks` suggestions dashed, with Accept all. Unused tables that a link touches leave the unused list and show as compact cards (key and linked fields) in a band below the columns.
- **Change — Coverage popover:** a sources × analyses grid from `sourceUsage`, unused sources last. Clicking an analysis column lights it.
- **Verify:** screenshots with each layer on and off at 1,512 and 783 px; the no-crossing test with Relationships on.
- **Overlap:** the "Relationships for file-based projects" session changes `proposeLinks` (`lib/project/linkProposals.ts`). This milestone only reads its output; land it after that work, or rebase onto it.

### Desired end state

- Relationships and coverage are one click away and stay out of the way by default.

## Milestone 5: Docs and retirement

- Update the README's [schema diagram](../../../packages/explorEDA/README.md#the-schema-diagram) section, the Schema diagram line in `apps/demo/src/docs/pages/workspace.mdx`, and the feature inventory.
- Retire this folder per the skill's lifecycle rules.

## Open decisions and spikes

- **Spike in M1 — does 100% fit at 1,280 px?** Evidence: the M1 screenshot. Fallback: a smaller column gap when lines run between adjacent columns only, and the unused list as a strip under the columns.
- **Decision before M2 — how to take the router.** Depend on `@draftably/runtime` after #715 ships (one source of truth, an FSL-licensed dependency in an MIT package), or copy the routing engine (about 4,100 lines, no wait). Fallback: copy now, then switch to the package when #715 ships.

## Retire this initiative

- Durable docs: `packages/explorEDA/README.md`, `apps/demo/src/docs/pages/workspace.mdx`, `docs/application-feature-inventory.md`.
- Remove this planning folder and add the closure record to `docs/initiative-history.json`.
