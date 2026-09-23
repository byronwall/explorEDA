---
title: "Facet controls — implementation plan"
slug: "facet-controls"
phase: plan
status: current
last_updated: "2026-09-22"
---

# Facet controls — implementation plan

## Plan at a glance

Make two visible changes. First, make focus a compact action near the facet name and remove the shared-scales sentence. This proves the calmer chart header without changing chart state. Second, add a picker between Previous and Next that edits the existing visible-facet selection. Keep the picker reachable when a selection leaves only one page. Both steps leave a usable chart, and each can be reviewed on its own. Existing facet filters, scales, selections, and saved layouts remain the source of truth.

## Implementation strategy

- **First proof:** Focus one wrap facet and return using a small control, while the name still filters.
- **Primary seam:** `FacetContainer` owns focus and visibility updates; wrap and grid layouts render the controls.
- **Fast local loop:** Focused package test where a behavior can fail, `pnpm check:ui`, then browser checks at 1280, 783, and 390 pixels.
- **Local dependencies:** Existing demo data and chart state. No network or shared service.
- **Rollout and rollback:** These are local UI changes. Revert each pass without migrating settings or layout data.

## Milestone 1: Quiet focus and chart header

Replace the underlined Focus action in `FacetWrapLayout` with a compact expand-style control beside each name. Give the per-cell focus action in `FacetGridLayout` the same quiet treatment where its grid structure permits. Keep the facet name's filter action and focused view's return action. Remove the sentence in `FacetContainer` and return its space to the chart. Check the focused path and Alt-assisted trace action before and after the change.

### Desired end state

- Focus and return work by pointer and keyboard.
- Name clicks still filter, and chart behavior is unchanged.
- The technical sentence is absent; focus controls do not obscure headings or marks.

## Milestone 2: Choose visible facets beside paging

Add a small picker trigger between paging actions in both layouts. Build its options from the same facet IDs and display labels used by the chart. Write choices to `visibleFacetIds` through the current chart update path; do not copy the selection into local layout state. Keep the trigger available with one page or one chosen facet. Preserve paging and the existing settings picker. Check selection, Show all, changed page counts, and saved setting restore.

### Desired end state

- The current chart has a subtle visible-facet picker near paging.
- Choices update the chart and settings together, and the control remains reachable after selection.
- Previous and Next still work when several pages exist.

## Cross-cutting verification

Read `docs/ui-defaults.md` before editing. Use accessible names and no native `title`. Run `pnpm check:ui` and `pnpm check`. Verify wrap and grid charts with pointer and keyboard at 1280, 783, and 390 pixels. Include many facets, one visible facet, empty selection, and a long name. Preserve all unrelated checkout edits.

## Below the cut line

- Changing name-click filtering or making it focus.
- Facet-local selection, scale behavior, or a new saved-state shape.
- New layout or chart components beyond the controls needed here.

## Tickets

- [Compact facet focus and copy](../../../.tickets/exp-y529.md) — milestone 1.
- [Visible-facet picker](../../../.tickets/exp-51gm.md) — milestone 2.
