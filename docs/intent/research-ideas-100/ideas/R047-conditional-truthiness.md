# R047 — Make conditional truthiness predictable for mixed scalar values

- ID: R047
- Category: Calculations and expressions
- Priority: 40
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The text false and the boolean false are different scalar values. `parseBoolean` and explicit field conversion already recognize boolean text, while `Calculator` uses truthiness for conditions and short-circuits logical operators. Raw values stay unchanged until a conversion setting applies. This combination is internally understandable to a developer but may surprise an analyst writing a conditional rule over imported text. The investigation should establish a clear user contract without treating delivered lazy evaluation as missing.

Compare retaining current truthiness with stronger examples and explicit boolean preparation against diagnosing nonboolean conditions before Apply. A stricter condition rule is another possibility, but changing saved formula meaning requires much stronger evidence. Typed equality should remain a deliberate alternative for testing a particular label. Include zero, empty text, whitespace, null, and unavailable upstream results; a single broad true-or-false explanation may conceal distinct preparation decisions that users need to make.

The first experiment should write an expected truth table for raw and converted forms of true, false, zero, empty text, and missing values. Add a guarded division whose unused branch would fail. Ask reviewers to predict results under current help and under an explicit conversion explanation. Acceptance requires correct predictions, preserved typed equality, and confirmation that unused branches remain unevaluated. Reject a semantic change if clearer guidance and the existing conversion boundary resolve the misunderstanding without altering established formulas.

This robustness candidate belongs under current-analysis-trust and is independent of adding more expression functions. A diagnostic could reuse field types and preview errors; enforcing boolean-only conditions would have wider API and saved-formula consequences. The first research output should be a contract table and evidence of user confusion, not a language redesign. Confidence is high that the mixed-value boundary deserves examination, while actual misunderstanding remains a hypothesis. The benefit is making simple business rules dependable when source values have not yet been normalized.

## References

- Repository: `packages/explorEDA/src/lib/calculations/engine/Calculator.ts` — `Calculator`. Conditionals use truthiness and logical operators short-circuit.
- Repository: `packages/explorEDA/src/lib/valueParsing.ts` — `parseBoolean`. Boolean parsing accepts explicit true/false forms.
- Repository: `packages/explorEDA/src/lib/fieldSettings.ts` — `convertFieldValue`. Field overrides provide an explicit boolean conversion boundary.
- Repository: `packages/explorEDA/src/test/lib/calculations/engine/Calculator.test.ts` — `evaluates conditional rules, quoted values, missing values, and UTC dates consistently`. Existing tests cover conditional behavior and missing values.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
