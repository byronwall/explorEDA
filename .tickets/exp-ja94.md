---
id: exp-ja94
status: open
deps: [exp-kcl7]
links: []
created: 2026-09-27T01:30:00Z
type: feature
priority: 3
assignee: Byron Wall
tags: [field-list, fields, ui]
---

# Quick field inspection inside the field list

## Outcome and Why

A user can check a field without opening the full inspector. Expanding a row in the field list shows a small distribution for the filtered rows and the charts that use the field. From there the user can jump to one of those charts.

## Ready Gate

The field list from exp-kcl7 exists. The inspector's Values view (`FieldValues`, `lib/fieldDistribution.ts`) from PR 36 is merged.

## Owned Context and Scope

Own row expansion in the field list component. Reuse the distribution view from `FieldValues` at a compact size. Find chart usage with `getChartFields` in `components/charts/chartAccessibility.ts`.

## Decisions and Discretion

Must: Expand one row at a time. Compute the distribution only for the expanded row. List every chart that references the field. Hovering or focusing an entry highlights that chart. Selecting it scrolls the chart into view and focuses it.

Executor may choose: The distribution size, chart entry wording, and highlight style.

Do not: Fork the distribution math, edit field settings in the row, or add a native `title` tooltip.

## Behavior and Failure Proof

Expand a numeric, a categorical, and a date field. Apply a filter and confirm the distribution follows it. Select a "Used in" entry and confirm focus moves to that chart. Open the list on the widest demo dataset and confirm collapsed rows add no delay.

## Acceptance Checklist

- **Invariant:** Expanded counts match the inspector's Values view for the same field and scope.
- **Invariant:** Collapsed rows do no distribution work.
- **Observed baseline:** Check at 1280, 783, and 390 pixels with pointer and keyboard.
- **Fixture:** A test that "Used in" lists every chart that references the field. Run `pnpm check:ui` and `pnpm check`. Update the field list changeset if it is still unreleased; otherwise add a `minor` one.

## Cut Line and Provenance

Leave axis menus and drag below this ticket's cut line. Source: field-list claim `fast`; milestone M2.
