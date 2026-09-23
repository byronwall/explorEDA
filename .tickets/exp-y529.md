---
id: exp-y529
status: open
deps: []
links: []
created: 2026-09-23T02:02:13Z
type: feature
priority: 1
assignee: Byron Wall
tags: [facets, ui]
---

# Use compact facet focus controls and remove technical copy

## Outcome and Why

A faceted chart keeps the facet name and data prominent. The bold underlined Focus text becomes a compact expand-style action beside each wrap facet name. The technical sentence about shared full-data scales and cross-facet selections disappears. The grid layout retains a compact per-cell focus action suited to its row and column headings.

## Ready Gate

The behavior, current focus path, and local proof are known. No product decision, dependency, or external resource blocks this ticket. Work in the current checkout and preserve existing edits in the facet files.

## Owned Context and Scope

Own the focus presentation in `packages/explorEDA/src/components/charts/FacetRelated/FacetWrapLayout.tsx` and `FacetGridLayout.tsx`, plus the explanatory line in `FacetContainer.tsx`. `FacetContainer` holds `focusedFacetId`, renders the focused chart, and supplies the focus callback. Wrap cards have a facet-name button that filters and a separate Focus button. Grid cells have a separate Focus button, but no cell-local name. The current focused view has a Back to all facets action. Scatter charts also use Alt-assisted facet trace.

## Decisions and Discretion

Must: Put a small focus or expand control beside each wrap facet name. Keep grid-cell focus available with a quiet control that does not cover the chart. Keep facet-name click filtering and the focused view's return action. Remove the full-data-scales sentence and return its space to the chart. Give icon controls accessible action names and visible keyboard focus.

Executor may choose: The exact installed icon, control styling, and grid-cell placement.

Do not: Make name click focus, change filter or selection scope, change scales, add saved state, or add a native `title` tooltip.

## Behavior and Failure Proof

In a chart with several facets, click a name and confirm it still filters. Use the adjacent control to focus one facet, then return. Repeat with keyboard input. Check a grid cell and the existing Alt-assisted trace path. Confirm the removed sentence does not appear and no control covers a long name or chart marks.

## Acceptance Checklist

- **Invariant:** Focus and return work without changing facet-name filtering, shared scales, or cross-facet selection behavior.
- **Invariant:** The technical sentence is absent, and focus actions have accessible names.
- **Observed baseline:** Inspect wrap and grid at 1280, 783, and 390 pixels with pointer and keyboard input.
- **Fixture:** Keep one focused interaction check only if it catches a focus or filter regression. Run `pnpm check:ui` and `pnpm check`.

## Cut Line and Provenance

Leave the paging picker, new filter behavior, local selections, and layout redesign below this ticket's cut line. Source: Byron's 2026-09-22 request and screenshot; facet-controls claims `focus`, `filter`, `copy`, and `behavior`; selected shape; milestone M1. Repository baseline `593ca2e` with dirty facet files. If another worker edits either layout concurrently, coordinate that shared file before merging.
