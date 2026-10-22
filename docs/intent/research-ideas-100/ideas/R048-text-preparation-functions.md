# R048 — Choose the smallest useful text-preparation function set

- ID: R048
- Category: Calculations and expressions
- Priority: 77
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

An analyst may need to trim a code, extract a prefix, or produce a consistent label before grouping. The active calculation registry already supports row-wise arithmetic and date functions, and the separate `region` registration demonstrates a focused domain extension. Formula parsing and function validation also exist. The inspected registry does not provide a general text-cleaning family. The opportunity is to identify a small recurring preparation need, not to replace a programming language inside the workspace.

Compare a few deterministic built-ins with keeping these transformations upstream and providing clear recipes. A mapping table may be better than a function for aliases with business meaning. Candidate operations should have explicit behavior for null, numbers, whitespace, and Unicode text; they should never silently stringify every value just to make a formula succeed. Begin with trim, a bounded substring or prefix extraction, and explicit replacement only if each is supported by a real task. Regular expressions deserve a separate appetite decision.

The first experiment should take three tiny preparation tasks: trimming a code, extracting a stable prefix, and mapping a documented label. Have reviewers solve them with the proposed small function set and with upstream preparation, then inspect results through the existing calculation preview. Acceptance requires recurring time savings, predictable missing/type behavior, and a formula whose intermediate values remain explainable. Reject additions that merely shorten a rare task or immediately demand a broad regex, locale, or scripting surface to be useful.

This new direction is adjacent to the reusable-output seed, which still requires an actual downstream-analysis task. The existing registry could keep implementation and help synchronized, but every function adds validation, examples, and future semantic maintenance. No arbitrary user code or dependency system is needed for the proof. Confidence is medium because the extension point is clear and the task plausible, while frequency is unknown. A disciplined result may recommend two functions, a preparation recipe, or no change at all.

## References

- Repository: `packages/explorEDA/src/lib/calculations/functions/registry.ts` — `calculationFunctions`, `getFunction`. The core registry owns callable function contracts and argument counts.
- Repository: `packages/explorEDA/src/lib/boundaries/regionFunction.ts` — `calculationFunctions.region`. A focused domain function is registered separately.
- Repository: `packages/explorEDA/src/lib/calculations/parser/semantics.ts` — `parseExpression`. Formula parsing already recognizes function calls.
- Repository: `packages/explorEDA/src/lib/calculations/engine/Calculator.ts` — `validateExpression`. Functions are validated through the known registry.
- Related intent: `docs/intent/reusable-analysis-outputs/intent-brief.md`.
