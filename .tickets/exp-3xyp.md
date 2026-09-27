---
id: exp-3xyp
status: open
deps: [exp-kcl7]
links: []
created: 2026-09-27T01:30:00Z
type: feature
priority: 4
assignee: Byron Wall
tags: [field-list, charts, drag]
---

# Put a field on a chart axis from the field list

## Outcome and Why

A user can swap a chart's axis field straight from the field list. First with a "Use on chart" menu, then by dragging a field onto an axis label. The chart keeps its type, layout, filters, and other fields.

## Ready Gate

The field list from exp-kcl7 exists. Byron marked drag as uncertain, so build and review the menu path first and treat drag as its own reviewable step.

## Owned Context and Scope

Own the row action, the drag source, and axis drop targets. Get each chart's axes from `getChartAxisFields` in `components/charts/chartAccessibility.ts`. Add a typed "set axis field" update for each chart type that has an x or y field. Use `lib/numeric.ts` to decide whether an axis accepts a field. Use `@dnd-kit`, which is already a dependency.

## Decisions and Discretion

Must: Offer "Use on chart" in the row actions, listing charts with an x or y axis and each axis as a choice. Make drop do exactly what the menu does. Show valid and invalid targets while dragging. Refuse an invalid field with a visible reason and change nothing.

Executor may choose: The drop highlight, menu grouping, and whether a drop on empty grid space creates a suitable chart through the existing empty-grid path.

Do not: Change a chart's type on drop, fill multi-field slots, target pivot, data table, facet, color, or 3D slots, or add a native `title` tooltip.

## Behavior and Failure Proof

Use the menu to replace a scatter chart's x field, then its y field. Drag a numeric field onto a bar chart axis. Drag a categorical field onto a numeric-only axis and confirm it is refused. Confirm filters and layout are unchanged after each swap. Repeat the menu path by keyboard.

## Acceptance Checklist

- **Invariant:** Every drag result has a keyboard menu equivalent.
- **Invariant:** A swap changes only the chosen axis field.
- **Observed baseline:** Check at 1280, 783, and 390 pixels. Touch uses the menu path.
- **Fixture:** Tests for each chart type's axis update and for refusal of an invalid field. Run `pnpm check:ui` and `pnpm check`. Add or update a `minor` changeset.

## Cut Line and Provenance

Leave multi-field drag and non-axis slots below this ticket's cut line. Source: field-list claim `drag`; milestone M3.
