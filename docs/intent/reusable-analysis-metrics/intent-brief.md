---
title: "Reusable rates and richer grouped measures"
slug: "reusable-analysis-metrics"
phase: intent
status: current
last_updated: "2026-10-20"
---

# Reusable rates and richer grouped measures

## My read

Analysts may need the same meaningful measure in a card, bar, matrix, and trend. Basic count, sum, and average now share reduction semantics. Pivot supports richer reducers. A small reusable measure remains a possible response to an actual repeated question.

This is a future seed. A formatted row-level percentage does not define a grouped rate. For conversion, sum of conversions divided by sum of opportunities differs from an average of row percentages. The durable goal is consistent analytical meaning across consumers. It does not imply a universal expression language, semantic layer, or dependency graph for every chart.

The October 19 research keeps rates deferred. Numeric indicators can answer eligible subset proportions. Prepared results can answer some fixed-grain ratios. Neither establishes demand for a shared definition.

Byron has not used the tool enough to name a missing calculation. Keep demand unconfirmed. Do not build a larger measure system to resolve that uncertainty before the first-pass user workflows.

## What matters most

- Name grain, numerator, denominator, population, eligibility, identity, filters and units.
- Keep source members distinct from numeric contributors.
- Reuse a measure only where its meaning stays valid.

## The intended experience

Define one rate from source fields, read it in a card and grouped bar, and inspect contributing totals. Filter the same population and compare both outputs. Save the definition once. A later trend should compute the rate from each period’s source totals rather than average existing rates.

## Boundaries

Do not stack nonadditive averages or rates. Do not average grouped rates to get a pooled exposure rate. State common or separate contributor populations. Keep unknown outcomes distinct from measured zero. Define empty and zero-denominator outcomes. Reuse current scalar functions and reductions where appropriate; a row expression is not a grouped expression. Exported definitions should remain readable. Avoid broad grammar work before a two-consumer metric proves the need.

## What seems settled

This is a proposed extension of delivered grouped metrics. No additional reducer or rate syntax is approved by creating this intent brief.

A small card sparkline is another later consumer. It needs the same date buckets and measure definition as its matching trend. A prior-period arrow needs a named comparison period; presentation alone cannot supply that meaning.

## Current reality that matters

AggregateAggregation contains count, sum, and average. MetricCard uses that contract. Pivot has additional statistical reducers. Current calculations evaluate scalar fields. The Pro chart review explicitly calls out ratio meaning and shared metric definitions.

## Expansion trigger

For rates, expand only after the local trust proof and a named repeated two-consumer task fail suitable current controls and an acceptable upstream workflow. Require explicit population and identity policies. Prefer one requested metric to a general language. Pivot-only reducers remain a separate possible need.

## Next step after confirmation

Name the real decision and repeated need. Try numeric 0/1 indicators for equal-opportunity proportions, or prepared additive totals for exposure rates. Use unequal group sizes to compare meanings. Trace source members and both contributor sets. Stop if a simpler option is sufficient.

If explanatory work becomes useful, pair calculated-fields.mdx (In charts and tables), metric-card.mdx (How it reads), and bar.mdx (Selection and row scope/Series) with a verified runnable example. The existing flights carriers dashboard is a possible indicator comparator, after its data and grain are checked. A new science example remains conditional. No docs-site page or example is implemented by this intent update.

See the [reviewed research](../../research/grouped-rates-2026-10-19/README.md), [seven dispositions](../../research/grouped-rates-2026-10-19/decisions.md) and [proposed proof](../../research/grouped-rates-2026-10-19/originals/proof-plan.md).

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
