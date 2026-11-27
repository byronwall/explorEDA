---
title: "Explore a data source: implementation plan"
slug: "data-source-explorer"
phase: plan
status: draft
last_updated: "2026-11-27"
---

# Plan: explore a data source

## Plan at a glance

1. **M1, click to explore.** This is the main value and reuses the most. It proves the shared engine, the filter, and Save in one slice.
2. **M2, hover card.** This adds a profile outside a workspace, which has a cost question. A spike measures it first.
3. **M3, "used by".** This waits for W5's usage data and stays small.

Start after W1's PR #695 merges, because it moves the rail into `ProjectRail.tsx`, `RailParts.tsx`, and a source hover. Building beside it would cause forced rebases.

## Implementation strategy

- **Seam:** the explorer is an `AnalysisView` held in `ProjectWorkspace` state: the source's query, a Summary chart, and a table of every field. It is never written until Save. Save uses the existing `openView` in `projectActions.ts`.
- **Package change:** `ExplorEdaProject` gets a docked Fields layout. The same `FieldList`, filters (`useFieldFilter`, which writes to the Summary chart), and row table render side by side instead of floating. This is a public prop, so it needs a `minor` changeset.
- **Local loop:** `EXPLOREDA_FOLDER=<copy of the TASK-0091 project> pnpm --filter app dev`. Capture with `node scripts/app-shot.mjs`. Do not use Byron's live folder.
- **Before you write core logic,** run the Codex hazards step from the global rules. The filter state and the saved view must agree.

## Milestones

### M1: click a source to explore it

- Data rows (in #695's `RailParts.tsx`) become buttons. A selected source replaces the analysis in the main pane.
- `ExplorEdaProject`: add a docked Fields layout with the summary on the left and rows on the right. Add a header slot for the app's filter chip and actions.
- App: build the unsaved view (Summary chart plus a table of all fields). Add Save as analysis through `openView`, and Show in schema through `schemaFocus`. Hide Save for read-only viewers. A database source that has not been read shows a Read action.
- Tests: an app test that a source click shows its fields and rows and Save writes an analysis with the filter. A package test that the docked list filters the table.
- Docs and example: an "Explore a data source" section in `apps/demo/src/docs/pages/project-folders.mdx`, run on an example project folder.
- **Done when:** on the CI copy, Runs shows 13 fields and 9,091 rows, `failure` narrows to 847, and the saved `.eda` reopens the same. Screenshots at 1280, 783, and 390 px.

### M2: field summary on hover

- Spike first: time a full profile of Steps (21,813 rows) and Recent (5,550 rows) outside a workspace. **Decision rule:** if a profile takes under about 150 ms, compute it on hover and cache it per source and read. If not, compute it after load in idle time, or in the analysis worker.
- A read-only `SourceSummary` built from `FieldListRow` and the shared profiles, inside a 460×440 popover. Merge it with #695's database source hover: one card, with connection and read time in its header.
- Keyboard: focus on a row opens the card. Escape closes it.
- **Done when:** pointing at each of the 15 CI sources shows its card without a visible wait, and the card matches the explorer's unfiltered summary for every field.

### M3: which analyses use a source

- Read the usage edges from `packages/explorEDA/src/lib/schema/schemaGraph.ts` (W5 owns them). Show "Used by ci-trend.eda, …" in the card footer and the explorer header.
- **Done when:** the list matches what the Schema diagram shows for every CI source.

## Below the cut line

- Cross-table drill (`run_id` → jobs → steps), and the relationship and coverage views (W5).
- Suggested charts (mockup B), a compact card (C), and a column tree in the rail (D).
- Saved per-source explorer files. Row search and sort from the summary.

## Open decisions

- When you leave the explorer with a filter applied, it discards the filter without a prompt. This is the default; correct it if you want a prompt.
