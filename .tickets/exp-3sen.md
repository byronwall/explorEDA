---
id: exp-3sen
status: partially_implemented
deps: []
links: []
created: 2026-10-02T03:58:32Z
type: feature
priority: 1
assignee: Byron Wall
parent: exp-b6fo
tags: [runtime-config]
---
# Inspect every current chart and its referenced definitions

## Outcome
A package user sees every current chart's name, type, saved grid position, size, and readable settings. Selecting a chart shows its fields, grouping, colors, scales, filters, layout, and applicable chart-specific settings. Referenced calculations and named color scales expand to their current definitions. Missing references remain understandable. The screen reads the same state as charts and existing Chart details controls.

## Likely Steps
Add a package-level read-only chart spec screen using the current chart, layout, calculation, and color-scale state. Reuse labels and chart names where correct, while checking all supported chart types. Keep Chart details as the edit path.

## Ready Gate
Confirm the current settings shape for each chart type, the inspector entry, reference rules, and a runnable example with add/edit/move proof. Check package tests and browser at 1280, 783, and 390 pixels, including keyboard access.

## Proof and cut line
Add and edit a chart, move or resize it, then confirm inventory and details follow. Expand a referenced definition. Do not add spec editing, a second saved format, or change comparison.

## Provenance
Intent claims c1, feedback-4, feedback-7, final-inspection-1; selected shape in docs/intent/runtime-configuration-story/shape-brief.md; milestone M1 in docs/intent/runtime-configuration-story/implementation-plan.md. Repository baseline 22a9bd3694cf208c63911291a5926c3c5a367be0.

## Readiness and ownership
Base: `421abb6` on `codex/runtime-configuration`. No code changes yet. Owner: continuous writer for this scope. Existing package, demo, and example data are local; the ticket viewer is already running at `http://127.0.0.1:7412`. `tk view` could not bind because this sandbox blocks localhost socket creation; reuse the existing viewer.

Owned boundary: package chart inventory and read-only detail panel, current-state reference resolution, focused package proof, and package documentation only as needed. Runtime charts, `saveToStructure`, and chart editing stay authoritative.

## Decisions
- Must: read current chart settings and `layout`; display every supported chart type's meaningful settings without converting them to another stored format.
- Must: resolve explicit calculation and color-scale IDs, field-based color scales used by color legends, and aggregate IDs from current workspace state. Show a clear missing-reference state.
- Must: leave editing in Chart details. Preserve existing chart and layout updates.
- Prefer: add a compact inspector entry alongside existing workspace tools; keep the chart visible and use current drawer patterns.
- Exclude: spec editing, JSON dump as the inspector, saved snapshots, agents, and services.

## Acceptance
- Inventory shows each current chart once with current type, title/name, and saved x/y/w/h.
- Selecting a chart exposes fields, grouping, colors/scales, filters, layout, and chart-specific settings across the registry's chart types; references expose current definitions or an understandable missing state.
- A focused test proves live state and reference resolution, including missing references and explicit/implicit color-scale plus aggregate references.
- Code-ready proof records package tests/type checks. Browser proof remains open for chart add/edit and move/resize, keyboard use, and 1280/783/390 px widths.

## Provenance
Runtime configuration story, milestone 1: `docs/intent/runtime-configuration-story/implementation-plan.md`; outcome and cut line from this ticket's original scope.

## Notes

**2026-10-02T04:24:37Z**

## Execution checkpoint
Owner/session: Continuous writer for runtime configuration roots.
Base and checked state: `421abb6` on `codex/runtime-configuration`, plus the current shared working-tree diff.
Dirty paths and ownership: `.tickets/exp-3sen.md`, `.tickets/exp-rjh4.md`, `packages/explorEDA/README.md`, `packages/explorEDA/src/components/ExplorEda.tsx`, `packages/explorEDA/src/components/PlotManager.tsx`, `packages/explorEDA/src/components/WorkspaceSettingsDrawer.tsx`, `packages/explorEDA/src/components/ChartSpecPanel.tsx`, two focused tests, and one changeset. Writer owns these paths; no commit created.
Implemented but unverified: Read-only Chart spec workspace tab lists current charts and details. It reads provider state and updates with chart/layout edits. It shows base and chart-specific settings, active fields and filters, enabled facet fields, layout, calculation definitions with dependencies, explicit color scales, ColorLegend per-field scales, and grouped summaries. Missing fields, scales, and summaries have a visible unavailable state.
Decisions and source: Reuse `charts`, `saveToStructure`, calculations, color scales, and aggregates from `DataLayerProvider`. Leave edits in Chart details. Use the existing workspace settings drawer and start it wide for the long inventory/detail view.
Evidence: `pnpm --filter exploreda check-types` passed. `pnpm check:ui` passed. Focused ChartSpecPanel and ExplorEda tests passed (3 tests). Provider tests for edit-only notifications and restore behavior passed (2 selected tests). `git diff --check` passed.
| Criterion | Check | Result | Evidence |
|---|---|---|---|
| Current chart inventory, type, and saved position/size | focused component test plus code review | pass | chart/layout fixture updates appear in current inventory |
| Settings and referenced definitions, including absent refs | focused component test plus code review | pass | calculation, scale, missing field/scale/summary checks |
| Add/edit and move/resize proof through browser at 1280/783/390 | pending independent browser review | blocked | required proof remains open |
Next action: Root to review the diff and complete required browser proof before closing this root. Do not start dependent example journey until both root tickets are accepted.

**2026-10-02T04:28:48Z**

## Follow-up checkpoint
This checkpoint supersedes the earlier focused-test detail. Root review found missing branches, now fixed and covered.

Summary charts list source and calculated fields, matching their runtime profile list. Reference discovery includes enabled facet fields, chart-filter fields, and aggregate group/measure fields. Nested calculation dependencies expand to their raw expressions. ColorLegend scale resolution follows render behavior: explicit ID for a single field; first source-field scale per field for a multi-field legend. Duplicate source-field scales do not appear as used.

Additional proof: focused ChartSpecPanel tests now cover a valid aggregate with a calculated measure, nested calculation dependencies, facet and filter references, summary-table calculated fields, and multi-field scales with duplicate and unused source-field scales. Focused tests: 4 passed across ChartSpecPanel and ExplorEda; selected provider callback tests: 2 passed. Typecheck, check:ui, and diff check passed. Browser proof remains pending.

**2026-10-02T04:29:18Z**

## Current acceptance state
| Criterion | Check | Result | Evidence |
|---|---|---|---|
| Inventory shows current chart name/type and saved x/y/w/h | Component fixture and current-state update test | pass | Covers layout moves and selected chart inventory |
| Applicable settings and referenced definitions, including unavailable references | Component fixtures | pass | Covers nested calculations, facets, filters, summary fields, valid/missing aggregates, explicit and implicit scales |
| Browser add/edit/move/resize, keyboard, and 1280/783/390 widths | Independent browser pass in progress | blocked | Required visual proof not yet recorded |

Focused tests, package typecheck, UI convention check, provider callback tests, and `git diff --check` pass on the current shared worktree. Root owns final review and browser acceptance.
