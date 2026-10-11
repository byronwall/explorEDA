---
id: page-composition-repeat-labels-show-inconsistent-decimals
label: Composition repeat labels show inconsistent decimals
type: page
status: planned
metadata:
  purpose: "Small, self-contained task: one calculation shows one precision across all repeats (New York · 5 beside California · 7.1)."
images:
  - id: 00844309-d012-4ad8-bf4d-87b5853fd90c
    src: /api/projects/untitled-project/images/page-composition-repeat-labels-show-inconsistent-decimals/00844309-d012-4ad8-bf4d-87b5853fd90c.png
    filename: 00844309-d012-4ad8-bf4d-87b5853fd90c.png
    originalName: covid-compare-labels.png
    mimeType: image/png
    size: 269621
    createdAt: 2026-10-10T22:36:34.142Z
---
Repeated labels in a composition show different numbers of decimals. On `?example=covid-compare`, five panel labels read one decimal ("California · 7.1", "Texas · 6.1"), but New York reads "New York · 5" because its value is 5.0. Values that are meant to be compared should line up in precision, so the odd one out reads like a different kind of number.

## Cause

`formatCalcValue` in `packages/explorEDA/src/components/charts/Composition/calculations.ts` formats with `maximumFractionDigits: 1` and no minimum, so a whole number drops its ".0". The same formatter fills repeat label values (`unit.label.valueCalcId`, in `resolveUnit.ts` around line 818), `{Name}` text tokens, annotation tokens, and guide labels. `signedFormat` has the same gap.

## Behavior

- One calculation's values share one precision across all of its repeats: if any repeat needs a decimal, every repeat shows it (5.0 beside 7.1).
- Pick the precision per calculation from the values it produces in the graphic, or let the author set decimals on the calculation. Do not pad counts that are always whole.
- Percent, signed, and date kinds keep their current formats, with the same consistency rule for percent and signed.
- Filtering must not flip the precision back and forth; read the precision from every row, as repeat order does, so labels stay stable.

## Done when

- A resolver test covers a per-repeat calculation whose values include a whole number and a fraction, and checks that both show one decimal.
- `covid-compare` reads "New York · 5.0" beside the other states.
- Browser check of `covid-compare` and one count-based example (such as `message-log` after authoring, or `measles`) to confirm whole counts stay whole.
- Changeset: `patch`, "Composition labels show the same number of decimals across repeats."

