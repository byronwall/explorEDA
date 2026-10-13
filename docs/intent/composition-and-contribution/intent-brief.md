---
title: "Show parts of a whole and cumulative contributions"
slug: "composition-and-contribution"
phase: intent
status: current
last_updated: "2026-10-12"
---

# Show parts of a whole and cumulative contributions

## My read

End users need two familiar views that explorEDA lacks. A waterfall explains how a value moves from one state to another, such as plan to actual. A donut shows how a bounded, nonnegative whole splits into a few parts. Both are in scope. Each ships first as a standard chart type, with selection, filters, and trace. The same calculations then become marks in the Composition report-graphic builder.

The waterfall comes first. No existing chart answers "how did we get from A to B." Percent bars, stacks, and waffles already cover much of share-of-whole.

## What matters most

- Every bar and slice traces back to its source rows.
- Start, end, and subtotal bars mean exactly what their labels say.
- The input model is general. It must not assume one data layout.

## The intended experience

**Waterfall: Bridge mode (primary).** The user defines two states. Each state is a measure plus an optional row condition. The user also picks a step field to break the change down and an optional parent field for subtotals. The start bar is state 1's total, and the end bar is state 2's total. Each step is one category's change from state 1 to state 2. Each parent group ends in a subtotal bar. One model covers many layouts:

- Budget vs actual in two columns: `sum(plan)` to `sum(actual)`.
- Budget vs actual in a scenario column: `sum(amount) where scenario = Plan` to `… = Actual`.
- Period change: `where year = 2024` to `where year = 2025`.

**Waterfall: Accumulate mode.** The user picks a signed measure, an ordered step field, and an optional start value. This covers precomputed steps, running totals, and staged engineering budgets.

**Clicks.** Clicking a step selects that category's source rows in both states. Clicking start or end selects every state-1 or state-2 row.

**Donut.** The user picks a category field and a nonnegative measure, then reads the total and each share. The whole is the filtered rows, so shares always sum to 100% of what is showing. The top categories get their own slices (six by default). The rest fold into "Other," which selects its members.

The first proof is a budget vs actual bridge. Its end bar matches a direct `sum(actual)`, and every step equals that line item's actual minus plan.

## Boundaries

- Never treat an average as an additive whole.
- For negative or zero-sum input, the donut shows a clear message instead of drawing a ring.
- The step order in a waterfall carries meaning. Do not offer it as a sort convenience.
- A waterfall step always comes from the source data. The chart does not invent metrics.
- Keep the waterfall proof separate from the donut proof.

## What seems settled

- The waterfall leads. The donut follows. Composition marks come after both chart types.
- Bridge and Accumulate are the two waterfall input modes.
- Subtotals come from a parent field.
- The donut folds small categories into "Other" and refuses negative input.

## Below the cut line

- User-placed subtotals
- Price, volume, and mix decomposition
- Nested rings and sunbursts

## Current reality that matters

The chart registry has grouped, stacked, and percent bars, but no waterfall or donut. The Composition builder already has `stack` and `waffle` marks for report graphics. Shared aggregates provide count, sum, and average, along with per-row contributors. Existing filter definitions can express a state's row condition. Exact source selection and trace contracts already support category-based charts.

## Next step after confirmation

Shape the Bridge waterfall around the budget vs actual proof. Check that existing aggregates and filters can compute a state without new metric code. Then shape Accumulate and the donut as follow-on slices.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
