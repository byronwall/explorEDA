---
title: "Show parts of a whole and cumulative contributions — shape brief"
slug: "composition-and-contribution"
phase: shape
status: draft
last_updated: "2026-10-12"
---

# Waterfall and donut — what we are adding

**Outcome:** Users can explain how a total moved from one state to another, such as plan to actual, and read a small whole as shares. Every bar and slice traces back to its source rows.

**Primary flow:** Pick a measure and two states → pick a step field → read the start, the signed steps, any subtotals, and the end → click a step to filter the workspace to its rows.

## Feature scope

```text
Waterfall chart (new chart type)
├── PLANNED ADDITIONS
│   ├── Bridge mode (default)
│   │   ├── Measure: sum or count, per state
│   │   ├── State 1 and State 2: a measure plus optional row conditions
│   │   │   (the same value, range, text, and date filters charts already use)
│   │   ├── Step field: one bar per category, showing State 2 minus State 1
│   │   └── Parent field (optional): groups steps and adds a subtotal after each group
│   ├── Accumulate mode
│   │   ├── Signed measure, ordered step field, optional start value
│   │   └── Parent-field subtotals, the same as Bridge
│   ├── Bars: start, steps colored by direction, subtotals, end
│   │   (start, subtotal, and end bars share one neutral total color)
│   ├── Labels: each step's signed change; start, end, and subtotal values
│   └── Selection, cross-filtering, and trace, like other category charts
├── LATER, SAME SCOPE
│   └── Waterfall as a Composition mark that reuses the same calculation
│
Donut chart (new chart type, after the waterfall)
├── PLANNED ADDITIONS
│   ├── Category field plus a nonnegative measure (count or sum)
│   ├── Top N slices (default 6) and a selectable "Other"
│   ├── Center: the total and the measure's name
│   └── Selection, cross-filtering, and trace
└── LATER, SAME SCOPE
    └── Donut as a Composition mark

Docs and examples (ship with each chart, not after)
├── Docs page per chart type, with a live example and settings table
├── Demo examples
│   ├── Budget vs actual: Bridge with parent subtotals, linked to a line-item table
│   ├── Staged running total: Accumulate mode, such as a battery's charge through a day
│   └── Small composition: donut beside a percent bar
└── Composition mark sections in the Composition page, each with an example
```

## Behavior

| Situation | Expected result |
| --- | --- |
| A step category appears in only one state | The missing side counts as 0, and the step's trace says which state is missing. |
| Other charts filter the data | Both states and every share are computed over the filtered rows. |
| A state has no rows after filtering | The chart shows "State 2 has no rows under current filters" instead of drawing bars of zero. |
| The user chooses average as the measure | Not offered. Only sum and count add up. |
| The user clicks a step | Filters to that category's rows in both states. |
| The user clicks start or end | Applies that state's row conditions as the chart's filter. |
| The user clicks a subtotal | Filters to every category in that group. |
| Donut input has a negative value or sums to zero | The chart shows a message naming the problem instead of a ring. |

## Examples

The same bridge works for three data layouts. Labels are illustrative:

```text
Two columns:      State 1 = sum(plan)                        State 2 = sum(actual)
Scenario column:  State 1 = sum(amount) where scenario=Plan  State 2 = … where scenario=Actual
Period change:    State 1 = sum(sales) where year=2024       State 2 = … where year=2025
```

```text
Plan 1,000 │ Revenue +120 │ Grants −30 │ ▌Income 1,090 │ Salaries −80 │ Travel +15 │ ▌Costs … │ Actual 1,025
```

## Decisions and boundaries

**Appetite:** Two chart types and one shared bridge calculation. No new expression language, reducer, or metric definition.

**Key decision:** A state is a measure plus the filter list charts already use, so neither a new formula syntax nor work from Reusable Analysis Metrics is needed. Each state reuses the existing grouped sum and the rows it records for each value. The donut reuses the row chart's top-N and "Other" pooling. This keeps the waterfall's numbers identical to a direct grouped sum, and every step stays traceable.

**Done means documented:** A chart type or mark is done only when its docs page or section and its demo example ship in the same PR. The docs gate requires the page for chart types. Nothing enforces examples or Composition marks, so each milestone lists them explicitly.

**Boundary:** OR conditions across fields are out. If a state needs one, the user adds a calculated field first. Step order carries meaning: Bridge steps follow parent group, then the step field's category order. Accumulate follows its ordered field. Neither mode sorts by size. Deferred: user-placed subtotals, price/volume/mix breakdowns, and nested rings or sunbursts.

**First proof:**
- **Try:** Build the Bridge waterfall on a small budget vs actual fixture: about 8 line items in 2 parent groups, stored once as two columns and once as a scenario column.
- **Observe:**
  - Each step equals that line item's actual minus plan.
  - The end bar equals a direct `sum(actual)`.
  - Both layouts draw identical bars.
  - Clicking a step filters a neighboring table to that line item's rows.
- The fixture becomes the budget vs actual sample dataset that the demo example and docs page use.
- **Decide:** If all four hold, add Accumulate mode, then the donut. If real conditions can't be expressed with the existing filters, stop and decide between requiring a calculated field and waiting on Reusable Analysis Metrics.

**Open choices:** None blocking. My default: Bridge steps follow category order, with no option to sort by size. Change it if you want sort by size as a setting.

See the [intent brief](intent-brief.md).
