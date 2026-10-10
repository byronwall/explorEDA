---
title: "Filter a workspace and control series deliberately"
slug: "filter-and-series-controls"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Filter a workspace and control series deliberately

## My read

Users should choose a segment without creating a chart merely to host the filter. They should also hide or isolate a time-series line without silently excluding its source records. These are distinct operations that the interface must make easy to understand.

Many parts already exist. Field-aware manual controls now edit chart-owned filters, chart-local restrictions have visible labels, and the standalone categorical legend filters records. The remaining comparison opportunity is an explicit workspace filter entry and persistent inline series visibility controls. Keep the field controls and scope rules reusable. Do not describe the whole filtering interface as missing.

Byron explicitly values filters without a chart. Prioritize that part of this scope when shaping end-user exploration. Inline legend hide/isolate remains a separate proposal; it does not inherit the same priority from this answer.

## What matters most

- Offer a direct workspace-level segment control.
- Separate local search, chart-local restriction, and linked filtering.
- Make inline hide/isolate visible and keyboard operable.

## The intended experience

Choose a category or date in a compact workspace control and see every linked view update. Find and clear its owner from active filter state. On a line view, hide or isolate a series and verify that source row counts remain unchanged. Apply a record filter only through an explicitly named filtering action.

## Boundaries

Use the existing typed predicates and field metadata. Do not create a second filter engine or independent filter islands. Promotion from Rows search to the workspace is optional and must be explicit. Hiding a series must not change a stacked denominator without a declared rule.

Continuous legend brushing and linked hover emphasis remain later possibilities. A visible color ramp does not establish either contract. Prove numerical membership and keyboard access before presenting a ramp as an interactive filter.

## What seems settled

Chart-owned manual filters and localFilters are delivered. Inline series emphasis exists in the raw line legend; persistent hide/isolate and a compact top-level filter route remain proposed. Dashboard text has only chart-local `where.` filters. A workspace filter added here should also get a dashboard text form; the retired config-authoring initiative left that open.

## Current reality that matters

FiltersSettingsTab uses field-aware controls. LocalFilterStrip names chart-only restrictions. Raw LineChart legend spans handle pointer emphasis. TimeSeriesChart shows static legend labels. The standalone legend already performs categorical record filtering.

## Expansion trigger

Expand when analysts repeatedly create disposable filter charts or cannot isolate overlapping series while keeping the same source population.

## Next step after confirmation

Reuse one category control as a workspace filter. Verify linked IDs and owner clearing. Separately hide one line with keyboard input and confirm row IDs stay unchanged. Decide whether both operations are clear before adding promotion.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
