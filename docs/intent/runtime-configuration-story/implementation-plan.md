---
title: "Runtime configuration story — implementation plan"
slug: "runtime-configuration-story"
phase: plan
status: current
last_updated: "2026-10-01"
---

# Runtime configuration story — implementation plan

## Plan at a glance

Keep the existing developer landing page and live examples. They already invite exploration, support chart creation and editing, and provide Reset. Chart details already shows a chart beside its editor and data. This plan adds the missing read-only account of the whole analysis. Start with a package inspector that reads current chart and layout state. Show every chart and its settings in readable sections, then let readers expand referenced calculations and color scales. This is the first useful proof: add or edit a chart and see the same change in the inspector without opening JSON.

In parallel, give embedding hosts a focused way to read the current saved settings at startup and after edits. The existing `onStateChange` callback emits meaningful edits but not initial state. Preserve that callback behavior. Finally, connect the existing example's add/edit path to the inspector and integration explanation. Review the full journey at three widths. Each milestone leaves the current workspace usable. No service, migration, or external provider is needed.

## Implementation strategy

- **First proof:** Add a chart, change a setting and layout, then inspect every chart's current position, size, and readable settings.
- **Primary seam:** Read the current `DataLayerProvider` state and its saved settings. Do not create another chart-spec store or saved format.
- **Fast local loop:** Run focused package or demo tests and `pnpm --filter demo dev` with bundled example data. Run `pnpm check:ui` and `pnpm check` before completion.
- **Local dependencies:** The existing chart store, saved settings, demo examples, and browser. No network or shared service is required after dependencies are installed.
- **Rollout and rollback:** Add inspector and host access without replacing normal chart controls. Remove either addition without changing saved analyses.

## Milestone 1: Inspect the current chart configuration

Add a readable chart spec screen in the package. List all charts with their name, type, saved grid position, and size. Selecting one shows its current fields, grouping, colors, scales, filters, layout, and applicable chart-specific settings. Resolve referenced calculation expressions and named color scales from the same workspace state. An absent reference must remain understandable. Use the existing chart title and field-label helpers where they fit, but check each supported chart type for settings they omit. Keep this an inspection view; the shipped Chart details editor remains the edit path.

Check the screen with a prepared example, a newly added chart, an edit, a move or resize, and a referenced calculation or color scale. Verify keyboard navigation and readable content at 1280, 783, and 390 pixels. Use a focused test for state updates and reference resolution.

### Desired end state

- Every current chart appears once with its current saved position, size, and readable settings.
- Selection exposes chart-specific details and expands definitions used by that chart.
- A chart change updates the inspector without a second source of definitions.

## Milestone 2: Read current settings from an embedding host

Expose a focused public read of the same `SavedDataStructure` used for restore and edits. It must work after the initial workspace is ready and after chart edits. Keep `onStateChange` as an edit notification; it does not currently emit an initial snapshot. Reuse `saveToStructure` so the host sees charts, layout, calculations, color scales, and other saved settings in one shape. Document the read boundary and its timing for a host that starts without `savedData`. A focused package test compares the initial read and a later read with the rendered workspace state.

### Desired end state

- A host reads current settings when the workspace opens and after edits.
- Both reads use the public saved-settings shape and reflect the same charts as the inspector.
- Existing restore and edit notifications still work.

## Milestone 3: Review the developer example journey

Connect the shipped landing action and example workspace to the new inspector. The user can open an example, add a chart, edit it with Chart details, inspect the resulting specification, and reach the integration explanation. Keep the current Reset route for example edits. Adjust landing or demo copy only where the working journey needs a clearer link or accurate explanation. Check that a fresh example visit shows its prepared state. Use the demo's existing tests where a journey regression needs protection, then review pointer and keyboard flow at 1280, 783, and 390 pixels.

### Desired end state

- A developer can complete add, edit, inspect, and integration steps without reading JSON.
- Reset returns the example to its prepared state after edits.
- The page describes only working capabilities and keeps the example as its primary action.

## Cross-cutting verification

Read `docs/ui-defaults.md` before UI work. Give unclear controls real tooltips and accessible names. Avoid native `title` tooltips. Run `pnpm check:ui` and `pnpm check`. Add one `minor` changeset when package behavior changes in a PR. Confirm the inspector and host read report the same current chart definitions, including a moved or resized chart. Use local example data; no provider or deployed proof is needed.

## Below the cut line

- Editing from the chart spec screen.
- A settings change-comparison screen or snapshot history UI.
- An agent service, agent task view, project navigation, multiple data sources, or lookups.
- New persistence policy for personal data and saved analyses.

## Tickets

- [Runtime configuration story](../../../.tickets/exp-b6fo.md) — completion epic.
- [Inspect every current chart and its referenced definitions](../../../.tickets/exp-3sen.md) — milestone 1 and first visual proof.
- [Let hosts read initial and edited workspace settings](../../../.tickets/exp-rjh4.md) — milestone 2; independent first frontier root.
- [Demonstrate add, edit, inspect, and integrate on the example](../../../.tickets/exp-7ci4.md) — milestone 3, after milestones 1 and 2.
