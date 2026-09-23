---
title: "Analytical chart coverage — implementation plan"
slug: "analytical-chart-coverage"
phase: plan
status: current
last_updated: "2026-09-21"
---

# Analytical chart coverage — implementation plan

## Plan at a glance

The first milestone repairs a common journey in the current bar rather than adding a renderer. It validates the grouped summary, selection, and contributor inspection on one order dataset. The ZIP adds a short second step: expose hidden distribution modes and make Other categories inspectable without unstable selection. A small metric card then consumes the same scoped result. The first new family is a categorical heatmap with one exact-cell selection; tuple multiselect waits for a distinct filter design. Calendar-aware lines remain separate because time bucketing and series partitioning need their own proof. Each step leaves a useful workspace.

## Implementation strategy

- **First proof:** Revenue by region → select region → linked views update → inspect contributing orders.
- **Primary seam:** Existing `AggregateResult` rows and source IDs feed rendering; chart filters remain the selection authority.
- **Fast local loop:** Focused `pnpm --filter exploreda test`, `pnpm --filter demo dev` with fixed orders, then `pnpm check` after broad changes.
- **Local dependencies:** Existing rows and saved example settings. No external provider or service is required.
- **Live confirmation:** Browser checks at wide, intermediate, and narrow widths after local tests; a named workload for interaction timing only if a performance claim is needed.
- **Rollout and rollback:** Keep current chart IDs and saved layouts. A new card or heatmap stays optional; removing it does not change old views.

## Milestone 1: A grouped measure selects and explains its records

- **Change — `BarChart`:** Give an aggregate mark a linked value-selection action. Keep contributor inspection as an adjacent, keyboard-accessible action.
- **Change — grouped result:** Use `calculateGroupedAggregate` and its contributor IDs. State the current population and numeric exclusions. Do not add another metric reducer.
- **Verify:** One fixture checks the metric, included and excluded IDs, and the selected category. In the browser, confirm linked views and records change, then reset. Compare the same value with pivot or export.

### Desired end state

- The most ordinary measure-by-category question has no action dead end.
- Selection and inspection remain distinct and agree with source rows.

## Milestone 2: Existing views have no discovery dead ends

- **Change — creation presets:** Offer Histogram for numeric fields and expose Box, Violin, and observation-overlay choices in a Distribution family. Reuse the current renderers and saved type IDs.
- **Change — `RowChart` Other:** Show its exact member categories and let users inspect or select them. Save the chosen categories, not the height-dependent Other label.
- **Verify:** A new user can find these modes by name. Resize the row chart after a category selection and confirm the filter still refers to the same categories.

### Desired end state

- Existing analytical modes are visible without duplicating implementations.
- High-cardinality categories remain inspectable and selections survive resize.

## Milestone 3: A selected measure is legible at a glance

- **Change — metric card:** Add one count/sum/mean card using the existing aggregation rules and field formatting. Label its metric and active population; link to contributors.
- **Verify:** Brush or select elsewhere and compare the card with the grouped result and source records. Restore its saved settings.

### Desired end state

- A selection gives immediate measure feedback without a decorative gauge.
- The card shares metric meaning with the bar.

## Milestone 4: A two-category question has a visual answer

- **Change — categorical heatmap:** Use two category fields, one metric, a legend, explicit empty/zero/invalid states, and one-cell selection plus source inspection. Bound high cardinality with a stated limit.
- **Change — exact pair:** Represent a single selected pair without broadening it to unrelated combinations. Defer arbitrary multi-cell unions until tuple-aware filter semantics are designed.
- **Verify:** On a fixed matrix, compare cell values and selected source IDs with the pivot and records. Test keyboard access and restore at three widths.

### Desired end state

- A user can spot and inspect one unusual pair without manually rebuilding filters.
- Existing views still load without the new type.

## Open decisions and spikes

- **Next family after the first proof:** Compare real order-data tasks needing a heatmap versus calendar time series. If time dominates, swap milestone 3 for one day/week/month rollup with an explicit zone and week boundary.

## Below the cut line

- Grouped, stacked, and 100% bars; tuple multiselect; correlation and cohort matrices; selected-baseline comparison and undo.
- Bubble, density, ECDF, reference layers, maps, domain charts, and more 3D variants. Revisit by observed questions, not gallery count.
