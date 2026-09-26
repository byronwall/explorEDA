---
id: exp-51gm
status: closed
deps: []
links: []
created: 2026-09-23T02:02:13Z
type: feature
priority: 2
assignee: Byron Wall
tags: [facets, ui]
---

# Pick visible facets from the paging row

## Outcome and Why

A user can choose which facets appear from a subtle picker between Previous and Next. They do not need to open chart settings. The picker remains available after the visible set shrinks to one page or one facet.

## Ready Gate

The existing visibility state, update path, layout paging, and local proof are known. No product decision, prerequisite, or external service blocks this ticket. Work in the current checkout and preserve existing edits.

## Owned Context and Scope

Own the paging-row controls in `packages/explorEDA/src/components/charts/FacetRelated/FacetWrapLayout.tsx` and `FacetGridLayout.tsx`, with the existing visibility update in `FacetContainer.tsx`. `FacetContainer` derives displayed facets from chart setting `visibleFacetIds`; `FacetSettingsTab.tsx` already edits that setting with `MultiSelect`. Each layout holds only its current page locally and uses `facetLayout.ts` to size pages. Current pagination shows Previous and Next only when more than one page exists. An empty selected set has a Show all facets action.

## Decisions and Discretion

Must: Put a small, accessible picker trigger between paging actions. Let users choose current visible facets and apply the choice through the existing chart update path. Keep chart and settings selection in sync, including after restore. Keep the trigger reachable with one page or one chosen facet. Retain Previous and Next when paging is needed. Keep the chart visible while choosing.

Executor may choose: The installed popover or select control, choice layout, and wording. Use the current facet IDs and display labels. A reversible UI choice can be adjusted after browser proof.

Do not: Add a second visibility store, alter filter clicks, change shared scales or selection scope, add a saved-state shape, or create a modal. Do not add native `title` tooltips.

## Behavior and Failure Proof

With more facets than fit on one page, open the middle control, choose a subset, and confirm the chart shows that set in chosen order. Open it again after the set fits one page. Show all facets, then use Previous and Next. Check the empty-set path and changed page counts. Reload or restore the chart and confirm chart and settings agree. A dismissed picker without a choice must leave the set unchanged.

## Acceptance Checklist

- **Invariant:** The picker edits `visibleFacetIds` and stays accessible after reducing the visible set.
- **Invariant:** Paging still reaches all currently visible facets; setting and chart agree after restore.
- **Fixture:** One focused check covers selection shrinking the page count and reopening the picker.
- **Observed baseline:** Verify wrap and grid at 1280, 783, and 390 pixels with pointer and keyboard input, including a long facet name.
- **Invariant:** Run `pnpm check:ui` and `pnpm check`.

## Cut Line and Provenance

Leave page-jump redesign, new visibility semantics, facet-local selection, and filter-click changes below the cut line. Source: Byron's 2026-09-22 request and screenshot; facet-controls claims `picker`, `behavior`, and `access`; selected shape; milestone M2. Repository baseline `593ca2e` with dirty facet files. If another worker edits either layout concurrently, coordinate that shared file before merging.
