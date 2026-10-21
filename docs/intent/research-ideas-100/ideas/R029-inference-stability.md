# R029 — Make type inference changes understandable across datasets

- ID: R029
- Category: Types, quantities, and dates
- Priority: 26
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A field that looks numeric in one file can become categorical when a later file contains a label or an identifier with leading zeros. `detectColumnType` intentionally evaluates every nonmissing value, while `isExactNumberText` already protects leading-zero strings and unsafe integer text. Declared types and user overrides also exist. The unresolved problem is predictability: can an analyst understand which value changed the inference, then preserve an appropriate interpretation without corrupting identifiers?

Compare retaining deterministic all-values inference with a small explanation listing counterexamples against attaching a confidence summary that describes how many values support each candidate type. A third alternative is asking the user to pin the current interpretation before replacement data arrives. Confidence must never authorize silent coercion. Numeric-looking keys should remain categories when that is their meaning, and an all-missing field must distinguish an inferred fallback from a declared schema decision.

The first experiment should use four successive versions of one fixture: ordinary numeric values, a leading-zero key, one late text value, and an entirely missing column with a declared type. Record both inferred and pinned behavior, then ask a reviewer to explain each change from the available information. Accept an approach when the responsible values are discoverable and raw identifier digits remain intact. Reject a confidence scoring system if existing overrides plus a few counterexamples solve the same task more simply.

This robustness question supports current-analysis-trust and preserves already shipped exact-number protections. A source-side explanation may require no saved-state change; pinning would reuse field settings but must state its effect on future conversion failures. Avoid a second inference engine or hidden sampling threshold. Confidence in the opportunity is high because the relevant decisions are explicit in source, while the frequency of confusing replacements is unmeasured. The research should establish whether better explanation is enough before proposing different inference rules.

## References

- Repository: `packages/explorEDA/src/lib/valueParsing.ts` — `isExactNumberText`, `isNumericValue`. Automatic numeric recognition already protects leading zeros and unsafe integer text.
- Repository: `packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts` — `detectColumnType`. Inference requires all nonmissing values to satisfy a type.
- Repository: `packages/explorEDA/src/lib/declaredFieldTypes.ts` — `declaredDataTypes`. Declared source types already override inference.
- Repository: `packages/explorEDA/src/lib/analysis/sources.ts` — `sourceFromRows`. Source creation inspects every row and preserves known declared types.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
