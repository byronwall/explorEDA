# R036 — Test whether lightweight unit semantics prevent bad calculations

- ID: R036
- Category: Types, quantities, and dates
- Priority: 91
- Kind: new-direction
- Status: planned for review
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A plotted value labeled meters can still have been added to a value measured in seconds. `FieldSettings.unit` already supplies useful labels, and the calculator handles scalar arithmetic, but the calculation contract does not carry dimensional meaning. That is an observed boundary, not necessarily a deficiency for an exploratory tool. The scientific and reusable-metric intents both emphasize meaningful units. Research should ask whether a lightweight check would prevent an actual analytical mistake before proposing a general quantity system.

Compare retaining descriptive units with better formula examples against explicit conversion functions and a small compatibility check for addition, subtraction, multiplication, and division. A third option is recording a unit only on the output and asking the author to verify it. Separate physical conversions from currency conversion, which needs a rate and reference date. Temperature offsets also challenge a simple multiply-by-factor model. These examples should define the cut line rather than justify a comprehensive catalogue.

The first experiment should use distance divided by elapsed time, incompatible addition, a Celsius-to-Fahrenheit conversion, and two differently denominated currencies. Ask authors to produce the intended results using each approach and explain the units of intermediate values. Accept the smallest design that prevents a demonstrated mistake while preserving valid formulas and readable traces. Reject dimensional inference if common cases demand a broad ontology, create false warnings, or make correction harder than an explicit preparation formula.

This is a new direction informed by existing intent, not a missing shipped feature or a request for framework migration. A metadata-only proof is cheap; propagating dimensions through expressions would affect saved definitions, formatter expectations, and the public calculation API. Keep adoption conditional on a real scientific task. Confidence is medium because the scalar boundary is clear but the value of enforcement is unknown. The investigation earns its place by separating useful measurement semantics from attractive but costly generality.

## October 27 Design decision

The [new Design review](../../../research/quantity-calculations-2026-10-27/README.md) proposes explicit Quantity mode over the scalar AST. Its [implementation plan](../../quantity-calculations/implementation-plan.md) covers linear conversions, temperature roles and reducers, project/folder owners, and notebook/export persistence. Each milestone includes docs and a runnable example.

This supersedes the historical demand gates in the brief above. Byron is the demand under current research direction. No outside author trial or failed lesson is required. The earlier October 20 adoption survey remains historical evidence. No feature code changed; Build dispositions mean a plan for review.

## Source references

- Repository: `packages/explorEDA/src/lib/fieldSettings.ts` — `FieldSettings`, `getFieldLabel`, `formatFieldValue`. Units currently participate in labels and formatting.
- Repository: `packages/explorEDA/src/lib/calculations/types.ts` — `CalculationValue`. Calculation values are scalar rather than quantity objects.
- Repository: `packages/explorEDA/src/lib/calculations/engine/Calculator.ts` — `Calculator`. Arithmetic evaluates numeric inputs without field-unit metadata.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Related intent: `docs/intent/reusable-analysis-metrics/intent-brief.md`.
