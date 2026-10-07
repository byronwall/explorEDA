---
title: "Select exact category pairs and facet-local regions"
slug: "precise-composite-selection"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Select exact category pairs and facet-local regions

## My read

Users should select exactly the combinations or facet observations they point to. A single heatmap cell works through two intersected field filters. Arbitrary selections such as North/Web plus South/Retail need a union of those exact pairs. Two independent category lists would include unwanted cross combinations.

The proposed outcome is exact composite membership with readable filter state. A related later choice is bounding a numeric scatter region to one facet. These mechanisms share a need to preserve joint identity. They must remain distinguishable from the current global-coordinate selection, which is an accepted behavior rather than a defect.

This is a near-term candidate because it extends an existing workflow. The suggested first proof is not an implementation plan.

## What matters most

- Select exact tuples without accidental cross combinations.
- Keep visual membership and inspected IDs identical.
- Preserve typed values and source-unit bounds.

## The intended experience

Select two separated cells in a four-cell matrix. Read the named pairs in active filter state. Inspect and export the resulting rows. Clear one pair and restore the workspace. Later, choose whether a scatter region applies across all facets or only the facet where it was drawn.

## Boundaries

Do not enable arbitrary multicell selection before the predicate can represent it. Avoid a full boolean query editor. Missing values and numeric/string lookalikes must preserve identity. Normal single-cell and global-coordinate selection stay valid. Exclusion is an extension, not an assumed behavior.

Byron explicitly values lasso selection. It needs exact point membership, including overlaps and boundary points. A lasso follows a polygon; two independent ranges cannot represent its boundary. Keep it distinct from the matrix’s first rectangular two-field brush. This answer does not prioritize tuple unions or facet-local selection.

Open-ended brush ranges remain a separate possibility. They need a saved meaning that survives newly loaded values. Do not infer that behavior from current range-input controls.

## What seems settled

The current filter union includes value, range, text, and date-range types. Joint selections need a bounded new contract; no general query language is selected.

## Current reality that matters

FilterTypes.ts defines field-level predicates. Heatmap and Sankey use intersected fields for one selected pair. BaseChart settings now support localFilters, but those restrictions do not supply arbitrary tuple unions or facet-bound XY membership.

## Expansion trigger

Expand when a real comparison requires separated cell pairs or selecting one facet without matching the same coordinates elsewhere.

## Next step after confirmation

Shape lasso selection against a small point fixture before choosing how it is saved. Compare exact polygon membership with linked rows and dimmed context. Keep the earlier tuple-union proof available for a task that needs it; it no longer defines the preferred first selection extension.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
