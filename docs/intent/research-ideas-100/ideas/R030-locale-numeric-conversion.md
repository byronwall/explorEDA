# R030 — Evaluate explicit locale-aware numeric preparation

- ID: R030
- Category: Types, quantities, and dates
- Priority: 72
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Files prepared in different locales can contain decimal commas, grouped thousands, narrow spaces, or accounting parentheses. The current `parseNumber` and `isExactNumberText` deliberately avoid treating grouping characters and units as ordinary numbers. That restraint protects labels and identifiers. Field settings already provide explicit date presets, null tokens, and conversion previews, which suggests a bounded place to investigate numeric preparation without making automatic inference increasingly permissive.

Compare a small set of explicit numeric input presets with documenting a preprocessing step outside explorEDA. A preset would declare decimal and grouping characters and possibly an accounting sign convention; upstream preparation would keep the runtime grammar unchanged. Treat percent text as a separate decision because interpreting 12% as 0.12 changes scale, not presentation alone. Values such as 1,234 must remain ambiguous until the user supplies a convention, and mixed conventions should produce visible failures.

The first experiment should assemble a short table containing decimal commas, grouped decimals, ordinary spaces, nonbreaking spaces, parentheses, percent text, and identifiers. Write expected conversions for each chosen preset and compare them with an upstream-normalized table. Acceptance requires deterministic values, unchanged raw inputs, and a preview that separates invalid entries from configured null tokens. Reject automatic locale detection immediately if it silently changes ambiguous values. Reject broader preset support if the grammar needed for the actual dataset becomes difficult to explain.

This is a new preparation direction adjacent to current-analysis-trust, not a request to replace the parser or add internationalization across the entire application. The main cost would be one saved field setting, validation, and a narrowly documented conversion contract. Maintenance should remain proportional to supported conventions rather than every locale. Confidence is medium because the code boundary is suitable but demand is not demonstrated by the attached source packet. The investigation earns its place by testing whether common imported values can become usable without weakening identifier safety.

## References

- Repository: `packages/explorEDA/src/lib/valueParsing.ts` — `parseNumber`, `isExactNumberText`. The central numeric reader accepts a deliberately limited grammar.
- Repository: `packages/explorEDA/src/lib/fieldSettings.ts` — `FieldSettings`, `convertFieldValue`, `buildConversionPreview`. Existing settings and previews provide an explicit conversion boundary.
- Repository: `packages/explorEDA/src/lib/fieldSettings.test.ts` — `converts valid numbers, null tokens, and failed values`. Conversion accounting already has focused tests.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
