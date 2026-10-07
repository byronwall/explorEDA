---
title: "Reusable rates and richer grouped measures"
slug: "reusable-analysis-metrics"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Reusable rates and richer grouped measures

## My read

Analysts may need the same meaningful measure in a card, bar, matrix, and trend. Basic count, sum, and average now share reduction semantics. Pivot supports richer reducers. The next opportunity is a small reusable measure definition for distinct counts, medians, or ratios that answer an actual repeated question.

This is a future seed. A formatted row-level percentage does not define a grouped rate. For conversion, sum of conversions divided by sum of opportunities differs from an average of row percentages. The durable goal is consistent analytical meaning across consumers. It does not imply a universal expression language, semantic layer, or dependency graph for every chart.

This remains a future seed. Its expansion trigger is a proposed decision rule, not a release commitment.

Byron has not used the tool enough to name a missing calculation. Keep demand unconfirmed. Do not build a larger measure system to resolve that uncertainty before the first-pass user workflows.

## What matters most

- Name numerator, denominator, population, and units.
- Keep source members distinct from numeric contributors.
- Reuse a measure only where its meaning stays valid.

## The intended experience

Define one rate from source fields, read it in a card and grouped bar, and inspect contributing totals. Filter the same population and compare both outputs. Save the definition once. A later trend should compute the rate from each period’s source totals rather than average existing rates.

## Boundaries

Do not stack nonadditive averages or rates. Define empty and zero-denominator outcomes. Reuse current scalar functions and reductions where appropriate; a row expression is not a grouped expression. Exported definitions should remain readable. Avoid broad grammar work before a two-consumer metric proves the need.

## What seems settled

This is a proposed extension of delivered grouped metrics. No additional reducer or rate syntax is approved by creating this intent brief.

A small card sparkline is another later consumer. It needs the same date buckets and measure definition as its matching trend. A prior-period arrow needs a named comparison period; presentation alone cannot supply that meaning.

## Current reality that matters

AggregateAggregation contains count, sum, and average. MetricCard uses that contract. Pivot has additional statistical reducers. Current calculations evaluate scalar fields. The Pro chart review explicitly calls out ratio meaning and shared metric definitions.

## Expansion trigger

Expand when the same hand-computed rate or pivot-only reducer is repeatedly needed outside Pivot. Prefer one requested metric to a general language.

## Next step after confirmation

Use unequal group sizes where average-of-rates differs from ratio-of-totals. Show the requested result in two current views and trace numerator and denominator. Decide the smallest reusable definition from that proof.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
